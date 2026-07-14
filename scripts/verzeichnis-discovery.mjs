/**
 * AD-01, Produkt-Discovery: Welche Software rankt in Deutschland fuer eine Collection?
 *
 * Quelle ist ausschliesslich die DataForSEO SERP-API, eine lizenzierte, von uns
 * bezahlte Quelle. Wir crawlen NICHT bei OMR oder Capterra: deren Datenbanken
 * sind nach § 87b UrhG geschuetzt, und eine schlechtere Kopie von Capterra
 * haette ohnehin keinen Grund zu ranken.
 *
 * Wir lesen aus dem SERP nur, WELCHE Anbieter fuer das Keyword sichtbar sind.
 * Die Fakten holen wir danach von der Herstellerseite selbst (Primaerquelle).
 *
 * Verzeichnisse und Vergleichsportale werden herausgefiltert: die sind
 * Wettbewerber, keine Produkte.
 *
 * Aufruf:
 *   node --env-file=.env.local scripts/verzeichnis-discovery.mjs campingplatz-software
 *   node --env-file=.env.local scripts/verzeichnis-discovery.mjs campingplatz-software --apply
 */
import { createClient } from "@supabase/supabase-js";
import { createDecipheriv } from "node:crypto";
import Anthropic from "@anthropic-ai/sdk";

const SLUG = process.argv.find((a) => !a.startsWith("--") && !a.includes("/") && !a.includes("node"));
const APPLY = process.argv.includes("--apply");

if (!SLUG) {
  console.error("Aufruf: node scripts/verzeichnis-discovery.mjs <collection-slug> [--apply]");
  process.exit(1);
}

const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});
const ki = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

/* ------------------- Zugangsdaten (verschluesselt at rest) ---------------- */

function entschluessele({ ciphertext, iv, tag }) {
  const key = Buffer.from(process.env.INTEGRATION_ENC_KEY, "base64");
  const d = createDecipheriv("aes-256-gcm", key, Buffer.from(iv, "base64"));
  d.setAuthTag(Buffer.from(tag, "base64"));
  return JSON.parse(d.update(ciphertext, "base64", "utf8") + d.final("utf8"));
}

const { data: integration } = await db
  .from("integration")
  .select("id, provider")
  .eq("provider", "dataforseo")
  .limit(1)
  .maybeSingle();
if (!integration) {
  console.error("Keine DataForSEO-Integration hinterlegt. Erst unter Einstellungen > Integrationen verbinden.");
  process.exit(1);
}
const { data: secret } = await db
  .from("integration_secret")
  .select("ciphertext, iv, tag")
  .eq("integration_id", integration.id)
  .single();
const cred = entschluessele(secret);
const auth = Buffer.from(`${cred.login}:${cred.passwort}`).toString("base64");

/* ----------------------------- Filterlisten ------------------------------- */

/** Verzeichnisse, Vergleichsportale, Presse. Das sind keine Produkte. */
const KEIN_PRODUKT = [
  "capterra", "omr.com", "getapp", "softwareadvice", "g2.com", "trustradius", "sourceforge",
  "trustpilot", "chip.de", "computerbild", "heise", "t3n", "gruenderszene", "wikipedia",
  "youtube", "facebook", "linkedin", "instagram", "reddit", "gutefrage", "amazon",
  "softguide", "trusted.de", "toolfolio", "provenexpert", "netzsieger", "testberichte",
  "erp-vergleich", "software-vergleich", "it-matchmaker", "wlw.de", "gelbeseiten",
  "camping.info", "adac", "pincamp", "google", "apple", "microsoft.com/de-de/store",
];

const domain = (url) => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
};
const istProdukt = (url) => {
  const d = domain(url);
  return d && !KEIN_PRODUKT.some((k) => d.includes(k));
};

/** Anbietername aus Titel und Domain raten. Wird spaeter redaktionell korrigiert. */
function nameAus(titel, url) {
  const d = domain(url);
  const kern = d.split(".")[0];
  // Der Titel steht meist als "Marke: Behauptung" oder "Behauptung | Marke".
  const teile = titel.split(/[|–—:·-]/).map((t) => t.trim()).filter(Boolean);
  const treffer = teile.find((t) => t.toLowerCase().replace(/\s/g, "").includes(kern.slice(0, 6)));
  const roh = treffer ?? kern;
  return roh.length > 40 ? kern : roh;
}

/* ------------------------------ SERP holen -------------------------------- */

// Deutschland, Oesterreich, Schweiz. Der DACH-Markt ist nicht identisch.
const LOCATIONS = [
  { code: 2276, land: "DE" },
  { code: 2040, land: "AT" },
  { code: 2756, land: "CH" },
];

async function serp(keyword, location) {
  const res = await fetch("https://api.dataforseo.com/v3/serp/google/organic/live/advanced", {
    method: "POST",
    headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/json" },
    body: JSON.stringify([
      {
        keyword,
        language_code: "de",
        location_code: location,
        device: "desktop",
        depth: 100, // statt 20: die Longtail-Anbieter stehen selten auf Seite 1
      },
    ]),
  });
  if (!res.ok) throw new Error(`DataForSEO: Status ${res.status}`);
  const json = await res.json();
  const items = json.tasks?.[0]?.result?.[0]?.items ?? [];

  const raus = [];
  for (const i of items) {
    // Organische Treffer.
    if (i.type === "organic" && i.url) {
      raus.push({ url: i.url, titel: i.title ?? "", pos: i.rank_absolute, quelle: "organisch" });
    }
    // BEZAHLTE ANZEIGEN. Wer fuer dieses Keyword Geld ausgibt, verkauft mit sehr
    // hoher Wahrscheinlichkeit genau dieses Produkt. Das staerkste Signal ueberhaupt,
    // und ich hatte es im ersten Wurf schlicht weggeworfen.
    if (i.type === "paid" && i.url) {
      raus.push({ url: i.url, titel: i.title ?? "", pos: i.rank_absolute, quelle: "anzeige" });
    }
    // Verwandte Suchanfragen liefern zwar keine Anbieter, aber die Sprache des Marktes.
  }
  return raus;
}

/* -------------------------------- Ablauf ---------------------------------- */

const { data: collection } = await db
  .from("dir_collection")
  .select("id, name, slug")
  .eq("slug", SLUG)
  .maybeSingle();
if (!collection) {
  console.error(`Collection "${SLUG}" nicht gefunden.`);
  process.exit(1);
}

/**
 * Ein Keyword sieht nur einen Ausschnitt des Marktes. Wer "Campingplatz Software"
 * sucht, findet andere Anbieter als wer "Campingplatz Buchungssystem" sucht.
 * Deshalb mehrere Formulierungen, plus die Kaufabsicht-Varianten.
 */
const SYNONYME = {
  "campingplatz-software": [
    "Campingplatz Verwaltungssoftware",
    "Campingplatz Buchungssystem",
    "Reservierungssystem Campingplatz",
    "Stellplatzverwaltung Software",
    "PMS Campingplatz",
  ],
};

const keywords = [
  collection.name,
  `beste ${collection.name}`,
  `${collection.name} Vergleich`,
  `${collection.name} Anbieter`,
  `${collection.name} Test`,
  ...(SYNONYME[collection.slug] ?? []),
];

console.log(`Collection: ${collection.name}`);
console.log(`Keywords:   ${keywords.join(" | ")}\n`);

const kandidaten = new Map(); // domain -> { name, url, titel, beschreibung, treffer, bestePos }

let anzeigen = 0;
for (const kw of keywords) {
  for (const loc of LOCATIONS) {
    process.stdout.write(`  ${loc.land}  "${kw}" ... `);
    try {
      const treffer = await serp(kw, loc.code);
      const echte = treffer.filter((t) => istProdukt(t.url));
      anzeigen += echte.filter((t) => t.quelle === "anzeige").length;
      console.log(`${treffer.length} Treffer, ${echte.length} Anbieterseiten`);
      for (const t of echte) {
        const d = domain(t.url);
        const vorhanden = kandidaten.get(d);
        if (vorhanden) {
          vorhanden.treffer += 1;
          vorhanden.bestePos = Math.min(vorhanden.bestePos, t.pos);
          if (t.quelle === "anzeige") vorhanden.wirbt = true;
        } else {
          kandidaten.set(d, {
            domain: d,
            name: nameAus(t.titel, t.url),
            url: `https://${d}`,
            titel: t.titel,
            treffer: 1,
            bestePos: t.pos,
            wirbt: t.quelle === "anzeige",
          });
        }
      }
    } catch (e) {
      console.log(`FEHLER: ${e.message}`);
    }
  }
}
console.log(`\n  davon aus bezahlten Anzeigen: ${anzeigen}`);

// Sortierung: wer fuer mehrere Keywords rankt, ist relevanter. Danach die Position.
const liste = [...kandidaten.values()].sort((a, b) => b.treffer - a.treffer || a.bestePos - b.bestePos);

console.log(`\n${liste.length} Kandidaten:\n`);
console.log("  TREFFER  POS  ANZEIGE  DOMAIN");
console.log("  " + "-".repeat(70));
for (const k of liste) {
  console.log(
    `  ${String(k.treffer).padStart(4)}    ${String(k.bestePos).padStart(3)}     ${k.wirbt ? "ja " : "   "}    ${k.domain}`,
  );
}

/* ------------- Primaerquelle: die Herstellerseite selbst pruefen ---------- */

/**
 * Die rohe SERP taugt NICHT als Produktliste. Fuer "Campingplatz Software" ranken
 * auch Wohnmobil-Vermieter, Foren, Blogs und Campingplaetze selbst. Deshalb holen
 * wir die Startseite jedes Kandidaten und lassen pruefen, ob es sich ueberhaupt um
 * Software dieser Kategorie handelt. Die Fakten kommen aus SEINER Seite, nicht aus
 * einem fremden Verzeichnis.
 */
async function holeSeite(url) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 12000);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      redirect: "follow",
      headers: { "User-Agent": "ToolfolioBot/1.0 (+https://toolfolio.de)" },
    });
    if (!res.ok) return null;
    const html = await res.text();
    // Nur Text, kein Markup. Reicht fuer die Einordnung.
    return html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 4000);
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}

const SCHEMA = `Gib NUR ein JSON-Objekt zurueck, ohne Codefence:
{
  "ist_produkt": true oder false,
  "begruendung": "ein kurzer Satz, warum",
  "name": "korrekter Produktname, wie der Anbieter ihn schreibt",
  "anbieter": "Firma dahinter, falls erkennbar, sonst null",
  "kurzbeschreibung": "ein bis zwei Saetze, IN EIGENEN WORTEN, was das Tool macht",
  "features": ["bis zu 6 Funktionen, kurz"],
  "einsatzgebiet": "die Kategorie, ein Wort oder kurze Phrase",
  "preis_hinweis": "Preisangabe NUR wenn sie auf der Seite steht, sonst null"
}`;

async function pruefeKandidat(k, kategorie) {
  const text = await holeSeite(k.url);
  if (!text || text.length < 200) return { ist_produkt: false, begruendung: "Seite nicht erreichbar oder leer" };

  const antwort = await ki.messages.create({
    model: "claude-opus-4-8",
    max_tokens: 1200,
    messages: [
      {
        role: "user",
        content: `Du prüfst, ob eine Website ein Software-Produkt der Kategorie "${kategorie}" anbietet.

Ein Produkt ist es NUR, wenn die Seite eine Software verkauft oder vermietet, die Betriebe
dieser Kategorie einsetzen. KEIN Produkt sind: Vergleichsportale, Verzeichnisse, Blogs,
Foren, Presseartikel, Vermieter, Dienstleister ohne eigene Software, und Betriebe, die die
Software nur NUTZEN (also ein Campingplatz selbst, wenn die Kategorie Campingplatz-Software ist).

Ebenfalls KEIN Produkt: Software, die laut der eigenen Seite eingestellt wird oder wurde.
Setz ist_produkt dann auf false und schreib den Grund dazu.

Schreib die Beschreibung IN EIGENEN WORTEN. Übernimm keine Werbetexte wörtlich.
Erfinde nichts: was nicht auf der Seite steht, bleibt null.

SPRACHE, das ist wichtig: Deutsch, Du-Form, ECHTE UMLAUTE (ä ö ü ß), niemals ae/oe/ue/ss.
Also "für" statt "fuer", "Lösung" statt "Loesung", "Gäste" statt "Gaeste". Keine Gedankenstriche.

DOMAIN: ${k.domain}
SERP-TITEL: ${k.titel}
SEITENTEXT (Auszug):
${text}

${SCHEMA}`,
      },
    ],
  });

  const roh = antwort.content.find((b) => b.type === "text")?.text ?? "";
  let o;
  try {
    o = JSON.parse(roh.replace(/^```(?:json)?\s*|\s*```$/g, "").trim());
  } catch {
    return { ist_produkt: false, begruendung: "Antwort nicht lesbar" };
  }
  // ASCII-Umlaute sind ein Fehler, kein Schoenheitsproblem: der Text geht spaeter live.
  const ascii = /\b(fuer|ueber|koennen|muessen|loesung|gaeste|plaetze|ablaeufe|aehnlich|taeglich|buendelt|hoefe|maessig)\w*/i;
  if (o.ist_produkt && ascii.test(o.kurzbeschreibung ?? "")) {
    return { ...o, ist_produkt: false, begruendung: "Beschreibung enthält ASCII-Umlaute, verworfen" };
  }
  return o;
}

console.log("\nPruefe jeden Kandidaten gegen seine eigene Website ...\n");

const produkte = [];
const verworfen = [];

for (const k of liste) {
  process.stdout.write(`  ${k.domain.padEnd(34)} `);
  const p = await pruefeKandidat(k, collection.name);
  if (p.ist_produkt) {
    produkte.push({ ...k, ...p });
    console.log(`JA   ${p.name}`);
  } else {
    verworfen.push({ ...k, grund: p.begruendung });
    console.log(`nein (${p.begruendung})`);
  }
}

console.log(`\n${produkte.length} echte Produkte, ${verworfen.length} verworfen.\n`);
for (const p of produkte) {
  console.log(`  ${p.name}`);
  console.log(`    ${p.kurzbeschreibung}`);
  console.log(`    ${p.preis_hinweis ? "Preis laut Anbieter: " + p.preis_hinweis : "kein Preis auf der Seite"}`);
  console.log();
}

if (!APPLY) {
  console.log("Trockenlauf. Mit --apply werden die Produkte angelegt und der Collection zugeordnet.");
  process.exit(0);
}

/* --------------------- Als Produkt-Entwuerfe anlegen ---------------------- */

const slugify = (s) =>
  s.toLowerCase()
    .replaceAll("ä", "ae").replaceAll("ö", "oe").replaceAll("ü", "ue").replaceAll("ß", "ss")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const FARBEN = ["#6C5CE7", "#FF7A66", "#12B76A", "#F5A623", "#3B82F6", "#0FB5BA", "#E84393", "#0F4C81"];

let neu = 0;
for (const [i, p] of produkte.entries()) {
  const { data: produkt, error } = await db
    .from("dir_produkt")
    .upsert(
      {
        name: p.name,
        slug: slugify(p.name),
        anbieter: p.anbieter ?? null,
        website_url: p.url,
        farbe: FARBEN[i % FARBEN.length],
        kurzbeschreibung: p.kurzbeschreibung,
        features: p.features ?? [],
        einsatzgebiet: p.einsatzgebiet ?? collection.name,
        preis_hinweis: p.preis_hinweis ?? null,
        preis_quelle_url: p.preis_hinweis ? p.url : null,
        preis_stand: p.preis_hinweis ? new Date().toISOString().slice(0, 10) : null,
        // ki_ungeprueft: von der KI aus der Herstellerseite geschrieben, noch nicht gelesen.
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
  neu += 1;
}

console.log(`${neu} Produkte angelegt und der Collection zugeordnet, Status ki_ungeprueft.`);
console.log("Sie sind oeffentlich unsichtbar, bis sie redaktionell geprueft und veroeffentlicht werden.");
