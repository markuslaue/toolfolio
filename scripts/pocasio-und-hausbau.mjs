/**
 * Zwei Auftraege von Markus:
 *   1. POCASIO als PREMIUM-ANZEIGE bei Bauplanungssoftware, oberste Anzeigenposition.
 *   2. Neue Kategorie "Hausbau Software".
 *
 * Zur Anzeige: Sie kommt in die Zone 'gesponsert'. Das heisst konkret und unverhandelbar:
 * sie steht OBEN, sie ist als Anzeige GEKENNZEICHNET, und sie taucht in der organischen
 * Rangliste NICHT auf. Sie bekommt keinen Rang, sie erscheint nicht im ItemList-Markup,
 * und sie kann das Ergebnis des Finders nicht beeinflussen. Bezahlte Sichtbarkeit ist
 * kein erreichter Platz. Genau das ist die Goldene Regel, und sie gilt auch fuer den
 * ersten zahlenden Kunden. Besonders fuer den.
 */

import { createClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";
import { readFileSync } from "node:fs";

for (const z of readFileSync(".env.local", "utf8").split("\n")) {
  const m = z.match(/^([A-Z_]+)=(.*)$/);
  if (m) process.env[m[1]] ??= m[2].replace(/^["']|["']$/g, "");
}

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const ki = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

/** ASCII-Umlaute, die ein Modell wirklich schreibt. Keine Zeichenfolgen-Suche: "Dauercamper" ist korrekt. */
const SUENDER = /\b(fuer|ueber\w*|buendel\w*|koenn\w*|muess\w*|moegl\w*|groess\w*|loesung\w*|waehl\w*|aender\w*|zurueck\w*|natuerlich|haeuf\w*|taegl\w*|jaehrl\w*|erklaer\w*|zusaetzl\w*|unterstuetz\w*|pruef\w*|maengel\w*|raeum\w*|foerder\w*|bautraeger|gebaeude\w*|dateigroesse|einschraenk\w*|uebersicht\w*|tatsaechl\w*|beruecksicht\w*)\b/gi;

async function holeSeite(url) {
  try {
    const r = await fetch(url, { headers: { "User-Agent": "ToolfolioBot/1.0 (+https://toolfolio.de)" }, redirect: "follow" });
    if (!r.ok) return null;
    const h = await r.text();
    return h
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 4000);
  } catch {
    return null;
  }
}

/* ------------------------------------------------- 1) POCASIO als Anzeige */

console.log("1) POCASIO auslesen ...");

const urls = ["https://new.pocasio.com/", "https://new.pocasio.com/preise", "https://new.pocasio.com/funktionen"];
const seiten = [];
for (const u of urls) {
  const t = await holeSeite(u);
  if (t && t.length > 300) seiten.push({ u, t });
}
if (!seiten.length) {
  console.error("Keine Seite erreichbar. Abbruch.");
  process.exit(1);
}
console.log(`   ${seiten.length} Seiten gelesen.`);

const PROMPT = `Erstelle das Datenblatt für die Software auf diesen Seiten. Kategorie: Bauplanungssoftware.

SPRACHE, und das ist die Regel, an der ich dich messe:
ECHTE UMLAUTE. Schreib "für", nicht "fuer". "Übersicht", nicht "Uebersicht". "Mängel", nicht
"Maengel". "bündelt", nicht "buendelt". "Bauträger", nicht "Bautraeger". "Förderungen", nicht
"Foerderungen". "Gebäude", nicht "Gebaeude". "Einschränkung", nicht "Einschraenkung".
Deutsch, Du-Form. Keine Gedankenstriche. Keine Werbesprache, keine Superlative.

ERFINDE NICHTS. Was nicht auf den Seiten steht, bleibt null oder eine leere Liste.
contra: nur belegbare Einschränkungen (Limits, fehlende Funktionen, Zusatzkosten).
Findest du nichts Belegbares, gib eine leere Liste zurück. Eine erfundene Schwäche ist
genauso eine Lüge wie eine erfundene Stärke.
Nutzerzahlen des Anbieters ("über 6.500 Nutzer") NICHT übernehmen: das ist eine
Werbeaussage, die wir nicht prüfen können.
PREIS nur, wenn er wörtlich dasteht, mit der URL der Seite, auf der er steht.

${seiten.map((s) => `--- ${s.u}\n${s.t}`).join("\n\n")}

Antworte NUR mit JSON:
{"name":"...","anbieter":"... oder null","kurzbeschreibung":"1 bis 2 Sätze","langbeschreibung":"3 bis 5 Sätze","features":["bis 10"],"plattformen":["..."],"einsatzgebiet":"...","pro":["bis 5"],"contra":["nur belegbare"],"preis_hinweis":"... oder null","preis_quelle_url":"... oder null"}`;

let d = null;
for (let versuch = 1; versuch <= 3; versuch++) {
  const a = await ki.messages.create({ model: "claude-opus-4-8", max_tokens: 2500, messages: [{ role: "user", content: PROMPT }] });
  const roh = a.content[0].text;
  const kandidat = JSON.parse(roh.slice(roh.indexOf("{"), roh.lastIndexOf("}") + 1));

  const alles = JSON.stringify(kandidat);
  const treffer = alles.match(SUENDER) ?? [];
  if (treffer.length === 0) {
    d = kandidat;
    break;
  }
  console.log(`   Versuch ${versuch}: ASCII-Umlaute gefunden (${[...new Set(treffer)].slice(0, 5).join(", ")}), neuer Versuch.`);
}
if (!d) {
  console.error("Das Modell schreibt hartnäckig ASCII-Umlaute. Nichts geschrieben.");
  process.exit(1);
}

console.log(`   ${d.name}: ${d.features.length} Funktionen, ${d.pro.length} Stärken, ${d.contra.length} Einschränkungen`);
console.log(`   Preis: ${d.preis_hinweis ?? "keiner"}`);

const { data: coll } = await sb.from("dir_collection").select("id, name").eq("slug", "bauplanungssoftware").single();

const { data: produkt, error: pErr } = await sb
  .from("dir_produkt")
  .upsert(
    {
      name: d.name,
      slug: "pocasio",
      anbieter: d.anbieter,
      website_url: "https://new.pocasio.com/",
      farbe: "#2563EB",
      kurzbeschreibung: d.kurzbeschreibung,
      langbeschreibung: d.langbeschreibung,
      features: d.features ?? [],
      plattformen: d.plattformen ?? [],
      einsatzgebiet: d.einsatzgebiet,
      pro: d.pro ?? [],
      contra: d.contra ?? [],
      preis_hinweis: d.preis_hinweis,
      preis_quelle_url: d.preis_quelle_url,
      preis_stand: d.preis_hinweis ? new Date().toISOString().slice(0, 10) : null,
      // Als zahlende Anzeige ist es redaktionell bewusst aufgenommen, nicht KI-geraten.
      status: "veroeffentlicht",
    },
    { onConflict: "slug" },
  )
  .select("id")
  .single();
if (pErr) {
  console.error("Produkt fehlgeschlagen:", pErr.message);
  process.exit(1);
}

await sb.from("dir_collection_produkt").upsert(
  {
    collection_id: coll.id,
    produkt_id: produkt.id,
    zone: "gesponsert",
    position: 0, // oberste Anzeigenposition
  },
  { onConflict: "collection_id,produkt_id" },
);

console.log(`   POCASIO ist Anzeige Nr. 1 bei ${coll.name}.`);

/* --------------------------------------------- 2) Kategorie Hausbau Software */

console.log("\n2) Kategorie 'Hausbau Software' anlegen ...");

// Denselben Cluster wie Bauplanungssoftware: Bau & Handwerk.
const { data: alteColl } = await sb
  .from("dir_collection")
  .select("cluster_id, kategorie_id")
  .eq("slug", "bauplanungssoftware")
  .single();

const { data: neu, error: cErr } = await sb
  .from("dir_collection")
  .upsert(
    {
      cluster_id: alteColl.cluster_id,
      kategorie_id: alteColl.kategorie_id,
      name: "Hausbau Software",
      slug: "hausbau-software",
      h1: "Hausbau Software im Vergleich",
      fokus_keyword: "Hausbau Software",
      prio: 2,
      status: "entwurf", // Erst der Lauf, dann die Redaktion, dann live.
    },
    { onConflict: "slug" },
  )
  .select("id, name, slug")
  .single();
if (cErr) {
  console.error("Kategorie fehlgeschlagen:", cErr.message);
  process.exit(1);
}

console.log(`   Angelegt: ${neu.name} (/${neu.slug}), Status: Entwurf.`);
console.log(`\nFertig.`);
console.log(`  Anzeige prüfen:  /admin/verzeichnis/collection/bauplanungssoftware`);
console.log(`  Neue Kategorie:  /admin/verzeichnis/collection/hausbau-software`);
console.log(`  Dort den Lauf starten, dann hat sie Anbieter, Text und Bild.`);
