/**
 * AD-01, Schritt 3: Validierung der Discovery-Ergebnisse.
 *
 * Die Discovery findet, WAS im Markt sichtbar ist. Sie liefert aber Artefakte:
 *   - Namen, die keine Marken sind ("Software für Campingplätze", "Apple Mac
 *     Campingplatz Management Software"). Die hat die KI aus Seitentiteln gezogen.
 *   - Dubletten unter verschiedenen Namen ("EASYCAMP" und "AGILA EASYCAMP").
 *   - Weiterleitungen, tote Produkte, Wiederverkaeufer.
 *
 * Dieser Lauf prueft jeden Kandidaten ZWEIMAL und mit unterschiedlichem Blick:
 *
 *   Pass A (je Produkt, einzeln): Ist das ueberhaupt ein Produktname, oder ist es
 *   eine Beschreibung, eine Ueberschrift, ein Kategoriebegriff? Wie heisst das Ding
 *   wirklich? Der Blick geht auf die Website.
 *
 *   Pass B (die ganze Liste auf einmal): Welche Eintraege sind dasselbe Produkt?
 *   Das kann man nur sehen, wenn man alle nebeneinander legt, nicht einzeln.
 *
 * Ergebnis ist eine Entscheidungstabelle, keine stille Loeschung. Was verworfen
 * wird, steht mit Grund da.
 *
 * Aufruf:
 *   node --env-file=.env.local scripts/verzeichnis-validieren.mjs campingplatz-software
 *   node --env-file=.env.local scripts/verzeichnis-validieren.mjs campingplatz-software --apply
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";

const SLUG = process.argv[2];
const APPLY = process.argv.includes("--apply");
if (!SLUG || SLUG.startsWith("--")) {
  console.error("Aufruf: node scripts/verzeichnis-validieren.mjs <collection-slug> [--apply]");
  process.exit(1);
}

const CACHE = `.verzeichnis-cache/${SLUG}.json`;
const kandidaten = JSON.parse(readFileSync(CACHE, "utf8"));

const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});
const ki = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const { data: collection } = await db.from("dir_collection").select("id, name").eq("slug", SLUG).maybeSingle();
if (!collection) {
  console.error(`Collection "${SLUG}" nicht gefunden.`);
  process.exit(1);
}

/* ---------------------------- Seite nachladen ---------------------------- */

async function holeSeite(url) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 12000);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      redirect: "follow",
      headers: { "User-Agent": "ToolfolioBot/1.0 (+https://toolfolio.de)" },
    });
    if (!res.ok) return { text: null, endUrl: url };
    const html = await res.text();
    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 3500);
    // Weiterleitungen verraten Wiederverkaeufer und umbenannte Produkte.
    return { text, endUrl: res.url };
  } catch {
    return { text: null, endUrl: url };
  } finally {
    clearTimeout(t);
  }
}

/* ------------------------ Pass A: Ist das ein Produkt? -------------------- */

async function passA(k) {
  const { text, endUrl } = await holeSeite(k.url);
  if (!text || text.length < 200) {
    return { urteil: "verwerfen", grund: "Seite nicht erreichbar", name: k.name };
  }

  const weitergeleitet = new URL(endUrl).hostname.replace(/^www\./, "") !== k.domain;

  const antwort = await ki.messages.create({
    model: "claude-opus-4-8",
    max_tokens: 900,
    messages: [
      {
        role: "user",
        content: `Du validierst einen Eintrag für ein Software-Verzeichnis. Kategorie: "${collection.name}".

Der Eintrag stammt aus einer automatischen Suche und kann ein ARTEFAKT sein. Typische Artefakte:
- Der "Name" ist gar kein Produktname, sondern eine Überschrift, ein Satzfragment oder ein
  Kategoriebegriff ("Software für Campingplätze", "Die beste Lösung für Ihren Platz").
- Die Seite ist ein Wiederverkäufer, Partner oder eine Agentur, die fremde Software vertreibt.
- Das Produkt existiert nicht mehr oder die Seite ist geparkt.
- Es ist eine reine Landingpage ohne echtes Produkt dahinter.

Prüf beides: Gibt es hier wirklich ein eigenständiges Software-Produkt, und wie heißt es
wirklich, so wie der Hersteller selbst es schreibt?

DOMAIN: ${k.domain}
${weitergeleitet ? `ACHTUNG, leitet weiter auf: ${endUrl}` : ""}
NAME AUS DER SUCHE: ${k.name}
SEITENTEXT:
${text}

Antworte NUR mit JSON, ohne Codefence:
{
  "urteil": "behalten" | "umbenennen" | "verwerfen",
  "name": "der korrekte Produktname, wie der Hersteller ihn schreibt",
  "hersteller": "Firma dahinter, sonst null",
  "grund": "ein kurzer Satz, warum",
  "eigenstaendig": true wenn eigenes Produkt, false wenn Wiederverkäufer oder Partnerseite
}

Deutsch, echte Umlaute (ä ö ü ß), keine Gedankenstriche.`,
      },
    ],
  });

  const roh = antwort.content.find((b) => b.type === "text")?.text ?? "";
  try {
    return JSON.parse(roh.replace(/^```(?:json)?\s*|\s*```$/g, "").trim());
  } catch {
    return { urteil: "verwerfen", grund: "Antwort nicht lesbar", name: k.name };
  }
}

console.log(`Collection: ${collection.name}`);
console.log(`Kandidaten aus der Discovery: ${kandidaten.length}\n`);
const CACHE_A = CACHE.replace(".json", "-passA.json");
let nachA = [];
if (existsSync(CACHE_A)) {
  nachA = JSON.parse(readFileSync(CACHE_A, "utf8"));
  console.log(`PASS A: uebersprungen, Ergebnis liegt im Cache (${nachA.length} Produkte).\n`);
} else {
  console.log("PASS A: Ist das ein echtes Produkt, und wie heisst es wirklich?\n");
  for (const [i, k] of kandidaten.entries()) {
  process.stdout.write(`  [${String(i + 1).padStart(2)}/${kandidaten.length}] ${k.domain.padEnd(30)} `);
  const a = await passA(k);
  if (a.urteil === "verwerfen" || a.eigenstaendig === false) {
    console.log(`VERWORFEN  ${a.grund}`);
    continue;
  }
  const umbenannt = a.name !== k.name;
  console.log(umbenannt ? `umbenannt  ${k.name}  ->  ${a.name}` : `ok         ${a.name}`);
  nachA.push({ ...k, name: a.name, hersteller: a.hersteller ?? null, alterName: umbenannt ? k.name : null });
  }
  writeFileSync(CACHE_A, JSON.stringify(nachA, null, 1));
  console.log(`\nNach Pass A: ${nachA.length} von ${kandidaten.length}\n`);
}

/* -------------------- Pass B: Dubletten in der Gesamtliste ---------------- */

console.log("PASS B: Welche Eintraege sind dasselbe Produkt?\n");

const liste = nachA.map((p, i) => `${i}: ${p.name} (${p.domain}) ${p.hersteller ? "von " + p.hersteller : ""}`).join("\n");

const antwortB = await ki.messages.create({
  model: "claude-opus-4-8",
  max_tokens: 2000,
  messages: [
    {
      role: "user",
      content: `Hier ist eine Liste von Software-Produkten der Kategorie "${collection.name}".
Manche Einträge sind DASSELBE Produkt unter verschiedenen Namen oder Domains
(zum Beispiel Produktname allein und Produktname mit Herstellerpräfix, oder
eine Länder-Domain desselben Produkts).

Finde die Gruppen, die zusammengehören. Nur zusammenführen, wenn du sicher bist,
dass es wirklich dasselbe Produkt ist. Im Zweifel getrennt lassen.

${liste}

Antworte NUR mit JSON, ohne Codefence:
{
  "gruppen": [
    { "behalten": 3, "zusammenfuehren": [7, 12], "name": "der beste Name für diese Gruppe", "grund": "..." }
  ]
}
Die Zahlen sind die Indizes aus der Liste. Nur Gruppen mit mindestens zwei Einträgen aufführen.

Deutsch, echte Umlaute, keine Gedankenstriche.`,
    },
  ],
});

const rohB = antwortB.content.find((b) => b.type === "text")?.text ?? "";
let gruppen = [];
try {
  gruppen = JSON.parse(rohB.replace(/^```(?:json)?\s*|\s*```$/g, "").trim()).gruppen ?? [];
} catch {
  console.log("  Dubletten-Antwort nicht lesbar, ueberspringe.");
}

/**
 * Entfernt wird ueber den INDEX, nicht ueber die Domain. Haben der behaltene und der
 * zusammengefuehrte Eintrag dieselbe Domain (kommt vor, wenn ein Produkt zweimal
 * gefunden wurde), wuerde ein Domain-Filter BEIDE loeschen. Genau das ist passiert.
 */
const entferntIdx = new Set();
for (const g of gruppen) {
  const haupt = nachA[g.behalten];
  const wegIdx = (g.zusammenfuehren ?? []).filter((i) => Number.isInteger(i) && i !== g.behalten && nachA[i]);
  if (!haupt || wegIdx.length === 0) continue;
  console.log(`  ${g.name}`);
  console.log(`    behalten:         ${haupt.name} (${haupt.domain})`);
  for (const i of wegIdx) {
    console.log(`    zusammengefuehrt: ${nachA[i].name} (${nachA[i].domain})`);
    entferntIdx.add(i);
  }
  console.log(`    ${g.grund}`);
  haupt.name = g.name || haupt.name;
}

const final = nachA.filter((_, i) => !entferntIdx.has(i));

console.log(`\n${"=".repeat(72)}`);
console.log(`Discovery:     ${kandidaten.length}`);
console.log(`nach Pass A:   ${nachA.length}   (${kandidaten.length - nachA.length} Artefakte verworfen)`);
console.log(`nach Pass B:   ${final.length}   (${entferntIdx.size} Dubletten zusammengefuehrt)`);
console.log(`${"=".repeat(72)}\n`);
for (const p of final) console.log(`  ${p.name.padEnd(32)} ${p.domain}`);

writeFileSync(CACHE.replace(".json", "-validiert.json"), JSON.stringify(final, null, 1));
console.log(`\n-> ${CACHE.replace(".json", "-validiert.json")}`);

if (!APPLY) {
  console.log("\nTrockenlauf. Mit --apply werden die validierten Produkte angelegt.");
  process.exit(0);
}

/* ---------------------------- Schreiben ----------------------------------- */

const slugify = (s) =>
  s.toLowerCase()
    .replaceAll("ä", "ae").replaceAll("ö", "oe").replaceAll("ü", "ue").replaceAll("ß", "ss")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const FARBEN = ["#6C5CE7", "#FF7A66", "#12B76A", "#F5A623", "#3B82F6", "#0FB5BA", "#E84393", "#0F4C81"];

let n = 0;
for (const [i, p] of final.entries()) {
  const { data: produkt, error } = await db
    .from("dir_produkt")
    .upsert(
      {
        name: p.name,
        slug: slugify(p.name),
        anbieter: p.hersteller,
        website_url: p.url,
        farbe: FARBEN[i % FARBEN.length],
        kurzbeschreibung: p.kurzbeschreibung,
        preis_hinweis: p.preis_hinweis,
        preis_quelle_url: p.preis_hinweis ? p.url : null,
        preis_stand: p.preis_hinweis ? new Date().toISOString().slice(0, 10) : null,
        einsatzgebiet: collection.name,
        status: "ki_ungeprueft",
      },
      { onConflict: "slug" },
    )
    .select("id")
    .single();
  if (error) {
    console.log(`  ${p.name}: ${error.message}`);
    continue;
  }
  await db.from("dir_collection_produkt").upsert(
    { collection_id: collection.id, produkt_id: produkt.id, zone: "organisch", position: i },
    { onConflict: "collection_id,produkt_id" },
  );
  n += 1;
}
console.log(`\n${n} validierte Produkte angelegt, Status ki_ungeprueft.`);
