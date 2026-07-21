import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * AD-15: Auswertung von Klicks und Suchdaten, an EINER Stelle.
 *
 * Uebersicht und Detailseiten sollen dieselben Zahlen zeigen. Laege die Rechnung an
 * zwei Stellen, wuerden sie irgendwann auseinanderdriften, und dann glaubt niemand
 * mehr einer von beiden.
 *
 * Die Aggregation passiert bewusst in JavaScript und nicht in der Datenbank: die
 * beteiligten Tabellen (Klicks, Suchdaten) wachsen mit dem tatsaechlichen Traffic,
 * nicht mit der Zahl der Anbieter. Sie bleiben lange klein genug, um sie im Speicher
 * zu verrechnen. Die grossen Tabellen (Collections, Produkte) werden dagegen nie
 * komplett geladen, sondern nur gesucht.
 */

export type Zeitraum = { tage: number; seit: string; seitDatum: string };

export function zeitraum(tage: number): Zeitraum {
  const seit = new Date(Date.now() - tage * 86_400_000).toISOString();
  return { tage, seit, seitDatum: seit.slice(0, 10) };
}

export type KlickWert = { klicks: number; affiliate: number; gesponsert: number };

/** Ausgehende Klicks je Produkt im Zeitraum. */
export async function klicksJeProdukt(z: Zeitraum): Promise<Map<string, KlickWert>> {
  const admin = createAdminClient();
  const map = new Map<string, KlickWert>();
  const { data } = await admin
    .from("dir_klick")
    .select("produkt_id, ist_affiliate, zone")
    .gte("erstellt_am", z.seit)
    .limit(200000);
  for (const k of data ?? []) {
    const id = k.produkt_id as string;
    const w = map.get(id) ?? { klicks: 0, affiliate: 0, gesponsert: 0 };
    w.klicks++;
    if (k.ist_affiliate) w.affiliate++;
    if (k.zone === "gesponsert") w.gesponsert++;
    map.set(id, w);
  }
  return map;
}

/** Ausgehende Klicks je Collection im Zeitraum (von welcher Seite aus geklickt wurde). */
export async function klicksJeCollection(z: Zeitraum): Promise<Map<string, number>> {
  const admin = createAdminClient();
  const map = new Map<string, number>();
  const { data } = await admin
    .from("dir_klick")
    .select("collection_id")
    .not("collection_id", "is", null)
    .gte("erstellt_am", z.seit)
    .limit(200000);
  for (const k of data ?? []) {
    const id = k.collection_id as string;
    map.set(id, (map.get(id) ?? 0) + 1);
  }
  return map;
}

export type GscWert = {
  impressionen: number;
  klicks: number;
  /** Gewichteter Positionsschnitt: ein Tag mit 1000 Impressionen zaehlt mehr als einer mit zwei. */
  position: number | null;
  anfragen: number;
};

/** Search-Console-Zahlen je Collection im Zeitraum. */
export async function gscJeCollection(z: Zeitraum): Promise<Map<string, GscWert>> {
  const admin = createAdminClient();
  const roh = new Map<string, { impr: number; klicks: number; posSumme: number; anfragen: Set<string> }>();
  const { data } = await admin
    .from("dir_suchdaten")
    .select("collection_id, suchanfrage, impressionen, klicks, position")
    .not("collection_id", "is", null)
    .gte("datum", z.seitDatum)
    .limit(200000);
  for (const s of data ?? []) {
    const id = s.collection_id as string;
    const r = roh.get(id) ?? { impr: 0, klicks: 0, posSumme: 0, anfragen: new Set<string>() };
    r.impr += s.impressionen as number;
    r.klicks += s.klicks as number;
    r.posSumme += (s.position as number ?? 0) * (s.impressionen as number);
    r.anfragen.add(s.suchanfrage as string);
    roh.set(id, r);
  }
  const map = new Map<string, GscWert>();
  for (const [id, r] of roh) {
    map.set(id, {
      impressionen: r.impr,
      klicks: r.klicks,
      position: r.impr > 0 ? Math.round((r.posSumme / r.impr) * 10) / 10 : null,
      anfragen: r.anfragen.size,
    });
  }
  return map;
}

export type SuchAnfrage = { anfrage: string; impressionen: number; klicks: number; position: number | null };

/** Die Suchanfragen EINER Collection, fuer die Detailseite. */
export async function anfragenJeCollection(collectionId: string, z: Zeitraum): Promise<SuchAnfrage[]> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("dir_suchdaten")
    .select("suchanfrage, impressionen, klicks, position")
    .eq("collection_id", collectionId)
    .gte("datum", z.seitDatum)
    .limit(50000);

  const map = new Map<string, { impr: number; klicks: number; posSumme: number }>();
  for (const s of data ?? []) {
    const a = map.get(s.suchanfrage as string) ?? { impr: 0, klicks: 0, posSumme: 0 };
    a.impr += s.impressionen as number;
    a.klicks += s.klicks as number;
    a.posSumme += (s.position as number ?? 0) * (s.impressionen as number);
    map.set(s.suchanfrage as string, a);
  }
  return [...map.entries()]
    .map(([anfrage, a]) => ({
      anfrage,
      impressionen: a.impr,
      klicks: a.klicks,
      position: a.impr > 0 ? Math.round((a.posSumme / a.impr) * 10) / 10 : null,
    }))
    .sort((x, y) => y.impressionen - x.impressionen);
}
