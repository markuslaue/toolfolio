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

export async function holeVerbrauch(providerId: ProviderId, cred: Credential): Promise<Verbrauch> {
  switch (providerId) {
    case "dataforseo":
      return dataforseo(cred);
    default:
      throw new Error("Unbekannter Anbieter.");
  }
}
