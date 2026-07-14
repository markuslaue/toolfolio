import "server-only";
import type { ProviderId, Verbrauch } from "@/lib/integrationen";

/**
 * B-24, serverseitig: Verbrauch beim Anbieter abfragen. NUR lesende Endpunkte.
 * Zugangsdaten kommen entschluesselt herein und verlassen diese Datei nicht.
 */

type Credential = Record<string, string>;

/**
 * DataForSEO: GET /v3/appendix/user_data (Basic Auth).
 * money.total   = insgesamt eingezahlt
 * money.balance = Restguthaben
 * -> verbraucht (kumuliert) = total - balance
 */
async function dataforseo(cred: Credential): Promise<Verbrauch> {
  const login = cred.login ?? "";
  const passwort = cred.passwort ?? "";
  const auth = Buffer.from(`${login}:${passwort}`).toString("base64");

  const res = await fetch("https://api.dataforseo.com/v3/appendix/user_data", {
    method: "GET",
    headers: { Authorization: `Basic ${auth}` },
    cache: "no-store",
  });
  if (res.status === 401) throw new Error("Zugangsdaten wurden von DataForSEO abgelehnt.");
  if (!res.ok) throw new Error(`DataForSEO antwortete mit Status ${res.status}.`);

  const json = (await res.json()) as {
    tasks?: { result?: { money?: { total?: number; balance?: number } }[] }[];
  };
  const money = json.tasks?.[0]?.result?.[0]?.money;
  if (!money || typeof money.balance !== "number") {
    throw new Error("Antwort von DataForSEO konnte nicht gelesen werden.");
  }
  const total = typeof money.total === "number" ? money.total : null;
  const balance = money.balance;
  return {
    guthaben: Math.round(balance * 100) / 100,
    kumuliertAusgegeben: total !== null ? Math.round((total - balance) * 100) / 100 : null,
  };
}

/* --------------------------------------------------------------------------
 * KI-Anbieter (B-34)
 *
 * Beide liefern DATIERTE Tageswerte. Daraus bauen wir exakte Monatssummen, statt
 * einen Zuwachs in den laufenden Monat zu buchen. Wir holen die letzten 12 Monate,
 * also genau das Fenster, das der Tracker anzeigt.
 *
 * Beide brauchen einen ADMIN-Key, keinen normalen API-Key. Der Admin-Key kann keine
 * Modelle aufrufen, also entsteht durch die Hinterlegung kein Verbrauch und kein
 * Missbrauchsrisiko in Richtung Kosten. Wir nutzen ausschliesslich lesende Endpunkte.
 * ------------------------------------------------------------------------ */

/** Beginn des Monats vor 11 Monaten, also der Anfang des 12-Monats-Fensters. */
function fensterStart(): Date {
  const jetzt = new Date();
  return new Date(Date.UTC(jetzt.getUTCFullYear(), jetzt.getUTCMonth() - 11, 1, 0, 0, 0));
}

/** Tageswerte zu Monatssummen verdichten. */
function zuMonaten(tage: { datum: Date; betrag: number }[]): { jahr: number; monat: number; betrag: number }[] {
  const eimer = new Map<string, { jahr: number; monat: number; betrag: number }>();
  for (const t of tage) {
    const jahr = t.datum.getUTCFullYear();
    const monat = t.datum.getUTCMonth() + 1;
    const key = `${jahr}-${monat}`;
    const vorhanden = eimer.get(key);
    if (vorhanden) vorhanden.betrag += t.betrag;
    else eimer.set(key, { jahr, monat, betrag: t.betrag });
  }
  return [...eimer.values()].map((m) => ({ ...m, betrag: Math.round(m.betrag * 100) / 100 }));
}

/**
 * OpenAI: GET /v1/organization/costs (Admin-Key, Bearer).
 * Liefert Tages-Buckets mit results[].amount.value in USD.
 * Seitenweise ueber `page` / `next_page`.
 */
async function openai(cred: Credential): Promise<Verbrauch> {
  const key = cred.admin_key ?? "";
  const start = Math.floor(fensterStart().getTime() / 1000);

  const tage: { datum: Date; betrag: number }[] = [];
  let page: string | null = null;
  // Harte Schranke: 12 Monate sind hoechstens ~366 Tage, also 3 Seiten a 180.
  // Die Schleife darf unter keinen Umstaenden endlos laufen.
  for (let i = 0; i < 5; i++) {
    const url = new URL("https://api.openai.com/v1/organization/costs");
    url.searchParams.set("start_time", String(start));
    url.searchParams.set("limit", "180");
    if (page) url.searchParams.set("page", page);

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${key}` },
      cache: "no-store",
    });
    if (res.status === 401) throw new Error("OpenAI hat den Key abgelehnt. Ist es ein Admin-Key (sk-admin-...)?");
    if (res.status === 403)
      throw new Error("Der Key darf die Kosten nicht lesen. Bitte einen Admin-Key mit der Berechtigung api.usage.read verwenden.");
    if (!res.ok) throw new Error(`OpenAI antwortete mit Status ${res.status}.`);

    const json = (await res.json()) as {
      data?: { start_time?: number; results?: { amount?: { value?: number } }[] }[];
      has_more?: boolean;
      next_page?: string | null;
    };

    for (const bucket of json.data ?? []) {
      if (typeof bucket.start_time !== "number") continue;
      const summe = (bucket.results ?? []).reduce((s, r) => s + (r.amount?.value ?? 0), 0);
      if (summe > 0) tage.push({ datum: new Date(bucket.start_time * 1000), betrag: summe });
    }

    if (!json.has_more || !json.next_page) break;
    page = json.next_page;
  }

  const monate = zuMonaten(tage);
  return {
    guthaben: null, // OpenAI rechnet nachtraeglich ab, es gibt kein Restguthaben.
    kumuliertAusgegeben: null,
    monate,
  };
}

/**
 * Anthropic: GET /v1/organization/cost_report (Admin-Key, x-api-key).
 * Liefert Tagesfenster mit results[].amount als String in USD.
 */
async function anthropic(cred: Credential): Promise<Verbrauch> {
  const key = cred.admin_key ?? "";
  const start = fensterStart().toISOString();

  const tage: { datum: Date; betrag: number }[] = [];
  let page: string | null = null;
  for (let i = 0; i < 6; i++) {
    const url = new URL("https://api.anthropic.com/v1/organization/cost_report");
    url.searchParams.set("starting_at", start);
    url.searchParams.set("limit", "31");
    if (page) url.searchParams.set("page", page);

    const res = await fetch(url, {
      headers: { "x-api-key": key, "anthropic-version": "2023-06-01" },
      cache: "no-store",
    });
    if (res.status === 401)
      throw new Error("Anthropic hat den Key abgelehnt. Ist es ein Admin-Key (sk-ant-admin...)?");
    if (res.status === 403)
      throw new Error("Der Key darf den Kostenbericht nicht lesen. Bitte einen Admin-Key verwenden.");
    if (!res.ok) throw new Error(`Anthropic antwortete mit Status ${res.status}.`);

    const json = (await res.json()) as {
      data?: { starting_at?: string; results?: { amount?: string | number }[] }[];
      has_more?: boolean;
      next_page?: string | null;
    };

    for (const fenster of json.data ?? []) {
      if (!fenster.starting_at) continue;
      const summe = (fenster.results ?? []).reduce((s, r) => s + Number(r.amount ?? 0), 0);
      if (summe > 0) tage.push({ datum: new Date(fenster.starting_at), betrag: summe });
    }

    if (!json.has_more || !json.next_page) break;
    page = json.next_page;
  }

  const monate = zuMonaten(tage);
  return {
    guthaben: null, // Auch Anthropic rechnet nachtraeglich ab.
    kumuliertAusgegeben: null,
    monate,
  };
}

export async function holeVerbrauch(providerId: ProviderId, cred: Credential): Promise<Verbrauch> {
  switch (providerId) {
    case "dataforseo":
      return dataforseo(cred);
    case "openai":
      return openai(cred);
    case "anthropic":
      return anthropic(cred);
    default:
      throw new Error("Unbekannter Anbieter.");
  }
}
