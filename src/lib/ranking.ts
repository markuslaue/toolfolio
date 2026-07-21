import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { entschluessele } from "@/lib/crypto";

/**
 * AD-15: Unsere Google-Position fuer ein Keyword holen, ueber DataForSEO.
 *
 * Nutzt dieselben Zugangsdaten wie die Anbietersuche (integration_secret, verschluesselt,
 * ohne Lese-Policy). Die Zugangsdaten verlassen diese Funktion nicht.
 *
 * Kostet pro Aufruf Geld (ein SERP-Abruf je Land), deshalb wird das NUR auf Anfrage
 * ausgeloest, nicht automatisch. Siehe Migration 20260721100000.
 */

const LAENDER = [
  { code: 2276, land: "DE" as const },
  { code: 2040, land: "AT" as const },
  { code: 2756, land: "CH" as const },
];

const UNSERE_DOMAIN = "toolfolio.de";

function domainVon(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

type Treffer = { land: string; position: number | null; topDomains: string[]; trefferGesamt: number };

async function frageEinLand(auth: string, keyword: string, code: number, land: string): Promise<Treffer> {
  const res = await fetch("https://api.dataforseo.com/v3/serp/google/organic/live/advanced", {
    method: "POST",
    headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/json" },
    body: JSON.stringify([{ keyword, language_code: "de", location_code: code, device: "desktop", depth: 100 }]),
  });
  if (!res.ok) throw new Error(`DataForSEO antwortet mit ${res.status}`);

  const json = (await res.json()) as {
    tasks?: { result?: { items?: { type?: string; url?: string; domain?: string; rank_absolute?: number }[] }[] }[];
  };
  const items = (json.tasks?.[0]?.result?.[0]?.items ?? []).filter((i) => i.type === "organic" && i.url);

  let position: number | null = null;
  const topDomains: string[] = [];
  for (const i of items) {
    const d = i.domain ?? domainVon(i.url!);
    if (topDomains.length < 5) topDomains.push(d);
    if (position === null && d.includes(UNSERE_DOMAIN)) {
      position = i.rank_absolute ?? null;
    }
  }
  return { land, position, topDomains, trefferGesamt: items.length };
}

/**
 * Ranking fuer eine Collection holen und speichern. Gibt zurueck, was gefunden wurde.
 *
 * Als Keyword wird das Fokus-Keyword genommen, ersatzweise der Name. Ohne beides gibt
 * es nichts zu fragen.
 */
export async function holeRanking(collectionId: string): Promise<{ keyword: string; treffer: Treffer[] }> {
  const admin = createAdminClient();

  const { data: coll } = await admin
    .from("dir_collection")
    .select("id, name, fokus_keyword")
    .eq("id", collectionId)
    .maybeSingle();
  if (!coll) throw new Error("Kategorie nicht gefunden.");
  const keyword = ((coll.fokus_keyword as string) || (coll.name as string) || "").trim();
  if (!keyword) throw new Error("Diese Kategorie hat kein Keyword.");

  const { data: integration } = await admin
    .from("integration")
    .select("id")
    .eq("provider", "dataforseo")
    .limit(1)
    .maybeSingle();
  if (!integration) throw new Error("Keine DataForSEO-Integration hinterlegt.");

  const { data: secret } = await admin
    .from("integration_secret")
    .select("ciphertext, iv, tag")
    .eq("integration_id", integration.id)
    .maybeSingle();
  if (!secret) throw new Error("DataForSEO-Zugangsdaten fehlen.");

  const cred = JSON.parse(entschluessele(secret)) as { login: string; passwort: string };
  const auth = Buffer.from(`${cred.login}:${cred.passwort}`).toString("base64");

  const treffer: Treffer[] = [];
  for (const l of LAENDER) {
    // Ein Fehler in einem Land soll die anderen nicht mitreissen.
    try {
      treffer.push(await frageEinLand(auth, keyword, l.code, l.land));
    } catch {
      treffer.push({ land: l.land, position: null, topDomains: [], trefferGesamt: 0 });
    }
  }

  // Speichern, ein Eintrag je Land. Der neueste gewinnt ueber erhoben_am.
  const jetzt = new Date().toISOString();
  await admin.from("dir_ranking").insert(
    treffer.map((t) => ({
      collection_id: collectionId,
      keyword,
      land: t.land,
      position: t.position,
      top_domains: t.topDomains,
      treffer_gesamt: t.trefferGesamt,
      erhoben_am: jetzt,
    })),
  );

  return { keyword, treffer };
}

export type RankingStand = {
  keyword: string;
  land: string;
  position: number | null;
  topDomains: string[];
  erhobenAm: string;
};

/** Der jeweils NEUESTE Ranking-Stand je Land fuer eine Collection. */
export async function letztesRanking(collectionId: string): Promise<RankingStand[]> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("dir_ranking")
    .select("keyword, land, position, top_domains, erhoben_am")
    .eq("collection_id", collectionId)
    .order("erhoben_am", { ascending: false })
    .limit(30);

  const gesehen = new Set<string>();
  const stand: RankingStand[] = [];
  for (const r of data ?? []) {
    if (gesehen.has(r.land as string)) continue;
    gesehen.add(r.land as string);
    stand.push({
      keyword: r.keyword as string,
      land: r.land as string,
      position: r.position as number | null,
      topDomains: (r.top_domains as string[]) ?? [],
      erhobenAm: r.erhoben_am as string,
    });
  }
  return stand.sort((a, b) => a.land.localeCompare(b.land));
}
