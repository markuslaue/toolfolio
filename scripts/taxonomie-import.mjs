/**
 * AD-02: Taxonomie-Import.
 *
 * Liest docs/verzeichnis/software-kategorien.csv und legt an:
 *   - 25 Cluster (aus cluster_vorschlag)
 *   - alle Software-Collections als Status "entwurf"
 *
 * Idempotent: Upsert per Slug, ein zweiter Lauf erzeugt keine Dubletten.
 *
 * Bewusst NICHT importiert:
 *   - typ = dienstleister (Agenturen, Beratungen, Steuerberater sind keine Software mit Abo)
 *   - die Spalte `quelle` (omr/capterra/beide). Import-Artefakt, bleibt im Repo.
 *     Sie darf nie in einer API-Antwort, einem JSON-LD oder einer Sitemap landen.
 *
 * Nichts wird veroeffentlicht. Der Roll-out passiert spaeter Cluster fuer Cluster.
 *
 * Aufruf:  node --env-file=.env.local scripts/taxonomie-import.mjs [--apply]
 * Ohne --apply laeuft nur die Vorschau (Trockenlauf).
 */
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const APPLY = process.argv.includes("--apply");
const CSV = "docs/verzeichnis/software-kategorien.csv";

// Farben je Cluster, damit das Verzeichnis nicht komplett grau ist.
const FARBEN = [
  "#6C5CE7", "#FF7A66", "#12B76A", "#F5A623", "#3B82F6", "#0FB5BA", "#E84393",
  "#0F4C81", "#D97757", "#8B5CF6", "#059669", "#DC2626", "#0891B2", "#CA8A04",
];

function ladeCsv(pfad) {
  // Die Datei hat CRLF-Zeilenenden. Ohne das \r zu entfernen, traegt das letzte
  // Feld jeder Zeile ein unsichtbares Wagenruecklaufzeichen und der Slug ist kaputt.
  const [kopf, ...zeilen] = readFileSync(pfad, "utf8").replace(/\r/g, "").trim().split("\n");
  const felder = kopf.split(";");
  return zeilen.map((z) => Object.fromEntries(z.split(";").map((w, i) => [felder[i], w])));
}

const alle = ladeCsv(CSV);
const software = alle.filter((r) => r.typ === "software");
const raus = alle.filter((r) => r.typ !== "software");

// Cluster in stabiler Reihenfolge (Branchen zuerst waere willkuerlich, also alphabetisch).
const clusterNamen = [...new Set(software.map((r) => r.cluster_vorschlag).filter(Boolean))].sort();

function slugify(s) {
  return s
    .toLowerCase()
    .replaceAll("ä", "ae").replaceAll("ö", "oe").replaceAll("ü", "ue").replaceAll("ß", "ss")
    .replace(/&/g, "und")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/* --- Vorschau, immer --- */
console.log(`CSV:                 ${alle.length} Zeilen`);
console.log(`Software:            ${software.length}`);
console.log(`Nicht importiert:    ${raus.length} (Dienstleister)`);
console.log(`Cluster:             ${clusterNamen.length}`);

const finalSlugs = software.map((r) => r.slug_final);
const dubletten = finalSlugs.filter((s, i) => finalSlugs.indexOf(s) !== i);
if (dubletten.length > 0) {
  console.error(`\nABBRUCH: ${dubletten.length} Slug-Kollisionen:`, [...new Set(dubletten)]);
  process.exit(1);
}
console.log(`Slug-Kollisionen:    0`);

console.log("\nCluster und Collections:");
for (const name of clusterNamen) {
  const n = software.filter((r) => r.cluster_vorschlag === name).length;
  console.log(`  ${name.padEnd(36)} ${String(n).padStart(4)}`);
}

if (!APPLY) {
  console.log("\nTrockenlauf. Mit --apply wird geschrieben.");
  process.exit(0);
}

/* --- Schreiben --- */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("ABBRUCH: NEXT_PUBLIC_SUPABASE_URL oder SUPABASE_SERVICE_ROLE_KEY fehlt.");
  process.exit(1);
}
const db = createClient(url, key, { auth: { persistSession: false } });

console.log("\nSchreibe Cluster ...");
const clusterRows = clusterNamen.map((name, i) => ({
  name,
  slug: slugify(name),
  farbe: FARBEN[i % FARBEN.length],
  status: "entwurf",
  position: i,
}));

const { data: cluster, error: cErr } = await db
  .from("dir_cluster")
  .upsert(clusterRows, { onConflict: "slug" })
  .select("id, slug, name");
if (cErr) {
  console.error("Cluster fehlgeschlagen:", cErr.message);
  process.exit(1);
}
const clusterIdByName = new Map(cluster.map((c) => [c.name, c.id]));
console.log(`  ${cluster.length} Cluster angelegt oder aktualisiert.`);

console.log("Schreibe Collections ...");
const collRows = software.map((r, i) => ({
  cluster_id: clusterIdByName.get(r.cluster_vorschlag),
  name: r.rubrik_final,
  slug: r.slug_final,
  h1: r.rubrik_final,
  prio: Number(r.prio),
  fokus_keyword: r.rubrik_final,
  status: "entwurf",
  position: i,
}));

// In Haeppchen, sonst laeuft die Anfrage in ein Limit.
let geschrieben = 0;
for (let i = 0; i < collRows.length; i += 200) {
  const teil = collRows.slice(i, i + 200);
  const { error } = await db.from("dir_collection").upsert(teil, { onConflict: "slug" });
  if (error) {
    console.error(`Collections ${i}-${i + teil.length} fehlgeschlagen:`, error.message);
    process.exit(1);
  }
  geschrieben += teil.length;
  process.stdout.write(`\r  ${geschrieben}/${collRows.length}`);
}

console.log(`\n\nFertig. ${cluster.length} Cluster, ${geschrieben} Collections, alle als Entwurf.`);
console.log("Oeffentlich sichtbar wird nichts, bis ein Cluster bewusst veroeffentlicht wird.");
