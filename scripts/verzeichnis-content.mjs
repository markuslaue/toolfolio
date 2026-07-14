/**
 * AD-01: SEO-Content fuer Verzeichnis-Collections erzeugen.
 *
 * Erzeugt je Collection ein Content-Piece (>= 1000 Woerter) plus Meta-Title und
 * Meta-Description, jeweils mit dem Fokus-Keyword. Der Text steht auf der Seite
 * UNTER den Produkten und macht die URL fuer das Keyword relevant.
 *
 * Der Text wird als `ki_ungeprueft` gespeichert. Ein Datenbank-Trigger verhindert,
 * dass eine Collection mit ungepruefte KI-Text veroeffentlicht wird. Erst lesen,
 * dann freigeben.
 *
 * Aufruf:
 *   node --env-file=.env.local scripts/verzeichnis-content.mjs "Gastro, Hotel & Freizeit"
 *   node --env-file=.env.local scripts/verzeichnis-content.mjs "Gastro, Hotel & Freizeit" --apply
 *   node --env-file=.env.local scripts/verzeichnis-content.mjs "..." --apply --nur 3   (erst mal drei)
 */
import { createClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";

const MODELL = "claude-opus-4-8";
const args = process.argv.slice(2);
const CLUSTER = args.find((a) => !a.startsWith("--"));
const APPLY = args.includes("--apply");
const NUR = args.includes("--nur") ? Number(args[args.indexOf("--nur") + 1]) : Infinity;

if (!CLUSTER) {
  console.error('Aufruf: node scripts/verzeichnis-content.mjs "<Cluster-Name>" [--apply] [--nur N]');
  process.exit(1);
}

const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});
const ki = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

/* ----------------------------- Der Prompt -------------------------------- */

const REGELN = `
SPRACHE UND TON
- Deutsch, konsequente Du-Form ("du", "dein", "dich"), niemals "Sie".
- Echte Umlaute: ä ö ü ß. Niemals ae/oe/ue/ss.
- KEINE Gedankenstriche (kein "-" als Satzzeichen, kein Halbgeviertstrich, kein Geviertstrich).
  Stattdessen Komma, Doppelpunkt oder Klammern.
- Betraege im Format 1.249,00 Euro.
- Kein Marketing-Geschwafel, keine Floskeln wie "in der heutigen schnelllebigen Zeit".
  Schreib wie ein Fachredakteur, der die Branche kennt und Klartext redet.

PERSPEKTIVE: DU SCHREIBST ALS FACHAUTOR
- Der Text erscheint unter dem Namen von Markus Laue, Gruender von Toolfolio (Software-
  Kostenmanagement fuer Agenturen und Freelancer, OMMM GmbH Leipzig).
- Schreib aus der Haltung von jemandem, der diese Software-Kategorien beruflich beurteilt:
  Er sieht taeglich, was Betriebe wirklich zahlen, wo sie Geld verbrennen und welche
  Versprechen der Anbieter im Alltag nicht halten.
- Das heisst konkret: klare Einschaetzungen statt Aufzaehlungen. Sag, worauf es ANKOMMT und
  was Marketing-Geraeusch ist. Nenn die Fehler, die in der Praxis wirklich passieren.
- Keine falsche Bescheidenheit ("es kommt darauf an"), aber auch keine Behauptungen ohne
  Grundlage. Wo etwas vom Betrieb abhaengt, sag WOVON genau.

FAKTENGRENZE (das ist die wichtigste Regel)
- Nenne KEINE konkreten Produkte, Anbieter, Marken oder Firmennamen.
- Nenne KEINE konkreten Preise einzelner Produkte.
- Behaupte KEINE Marktanteile, Testsieger, Studien oder Zahlen, die du nicht sicher weisst.
- Erlaubt und erwuenscht sind: Funktionsbeschreibungen, Auswahlkriterien, typische
  Preismodelle (pro Nutzer, pro Zimmer, pro Transaktion), Fallstricke, rechtliche
  Anforderungen in Deutschland/Oesterreich/Schweiz, Integrationsfragen, Migrationsthemen.
- Wenn du etwas nicht sicher weisst, schreib es nicht. Lieber kuerzer und richtig.
- Die konkreten Produkte stehen bereits OBERHALB dieses Textes auf der Seite. Du darfst
  auf sie verweisen ("die Tools oben in der Liste"), aber sie nicht benennen.

SEO
- Das Fokus-Keyword steht im Meta-Title, in der Meta-Description, in der ersten H2 und
  mehrfach natuerlich im Fliesstext. Kein Keyword-Stuffing.
- Meta-Title: maximal 60 Zeichen, Keyword vorne.
- Meta-Description: 140 bis 155 Zeichen, Keyword enthalten, mit konkretem Nutzenversprechen.
- Mindestens 1000 Woerter im Fliesstext.
- Struktur ueber H2 und H3. Fuenf bis acht H2-Abschnitte, darunter passende H3.
- JEDE H2 traegt ein kurzes Label in eckigen Klammern VOR dem Titel, das den Abschnitt
  einordnet. Format exakt so: "## [Label] Titel des Abschnitts"
  Beispiele fuer Labels: [Grundverstaendnis], [Funktionen], [Entscheidungshilfe],
  [Preismodelle], [Aus der Praxis], [Compliance], [Vorgehen].
  Das Label ist ein bis zwei Woerter, deutsch, mit echten Umlauten. H3 tragen KEIN Label.
- Keine Einleitung, die nur ankuendigt, was gleich kommt. Direkt inhaltlich einsteigen.

FORMAT
Gib NUR ein JSON-Objekt zurueck, ohne Markdown-Codefence, mit genau diesen Feldern:
{
  "meta_title": "...",
  "meta_description": "...",
  "intro": "Zwei bis drei Saetze, stehen OBEN ueber den Produkten. Kein H2.",
  "experten_zitat": "...",
  "content_md": "Das grosse Content-Piece in Markdown, beginnend mit '## ...'"
}

ZUM FELD experten_zitat
- Drei bis fuenf Saetze, ICH-Form, so wie Markus Laue es selbst sagen wuerde.
- Es erscheint als Kasten mitten im Text: "Das sagt unser Experte zu <Kategorie>",
  mit seinem Foto und seinem Namen darunter.
- Es soll die EINE Sache sagen, die man in dieser Kategorie am haeufigsten falsch macht,
  und was er stattdessen empfiehlt. Konkret, mit Kante, keine Binsenweisheit.
- Es darf sich auf Toolfolios Blickwinkel stuetzen (er sieht echte Abrechnungsdaten),
  aber KEINE konkreten Zahlen erfinden.
- Auch hier: keine Produktnamen, keine Anbieter, keine Preise einzelner Tools.
`.trim();

function prompt(name, cluster) {
  return `Du schreibst das SEO-Content-Piece fuer eine Kategorie-Seite im Software-Verzeichnis von Toolfolio.

Toolfolio ist ein Software-Kostenmanagement-Anbieter aus Leipzig. Das Verzeichnis hilft
Agenturen, Freelancern und Solopreneuren in DACH, die richtige Software zu finden und zu
sehen, was sie wirklich kostet.

KATEGORIE (= Fokus-Keyword): ${name}
CLUSTER: ${cluster}

Die Seite listet oben konkrete Software-Produkte dieser Kategorie. Dein Text steht darunter
und beantwortet alles, was jemand wissen muss, der "${name}" googelt: was diese Software
leistet, welche Funktionen wirklich zaehlen, worauf man bei der Auswahl achtet, welche
Preismodelle ueblich sind, welche Fehler man vermeidet, was in Deutschland, Oesterreich und
der Schweiz besonders ist.

${REGELN}`;
}

/* ------------------------------ Erzeugung -------------------------------- */

function woerter(md) {
  return md.replace(/[#*_`>|-]/g, " ").split(/\s+/).filter(Boolean).length;
}

/** Pruefungen, die der Text bestehen MUSS. Sonst wird er nicht gespeichert. */
function pruefe(o, name) {
  const f = [];
  if (!o.meta_title || o.meta_title.length > 65) f.push(`Meta-Title fehlt oder ist zu lang (${o.meta_title?.length})`);
  if (!o.meta_description || o.meta_description.length < 120 || o.meta_description.length > 165)
    f.push(`Meta-Description ${o.meta_description?.length} Zeichen (Soll: 140 bis 155)`);
  const w = woerter(o.content_md ?? "");
  if (w < 950) f.push(`nur ${w} Woerter (Soll: mindestens 1000)`);
  const z = o.experten_zitat ?? "";
  if (z.split(/\s+/).filter(Boolean).length < 30) f.push("Experten-Zitat fehlt oder ist zu kurz");
  if (/[–—]/.test(z) || /\s-\s/.test(z)) f.push("Experten-Zitat enthaelt Gedankenstriche");
  if (/\bSie\b/.test(z)) f.push("Experten-Zitat siezt");
  // Gedankenstriche in jeder Form
  if (/[–—]/.test(o.content_md) || /\s-\s/.test(o.content_md)) f.push("enthaelt Gedankenstriche");
  // ASCII-Umlaute im deutschen Text
  const ascii = o.content_md.match(/\b(fuer|ueber|koennen|muessen|waehrend|zusaetzlich|naechste|groesse|loesung|oesterreich|maessig)\b/gi);
  if (ascii) f.push(`ASCII-Umlaute: ${[...new Set(ascii)].join(", ")}`);
  const sie = o.content_md.match(/[^.!?]*\bSie\b[^.!?]*/g);
  if (sie) f.push(`siezt: "${sie[0].trim().slice(0, 70)}..."`);
  if (!o.content_md?.startsWith("##")) f.push("beginnt nicht mit einer H2");
  return f;
}

const { data: cluster } = await db.from("dir_cluster").select("id, name").eq("name", CLUSTER).maybeSingle();
if (!cluster) {
  console.error(`Cluster "${CLUSTER}" nicht gefunden.`);
  process.exit(1);
}

const { data: collections } = await db
  .from("dir_collection")
  .select("id, name, slug, content_status")
  .eq("cluster_id", cluster.id)
  .order("prio")
  .order("name");

const offen = collections.filter((c) => c.content_status === "fehlt").slice(0, NUR);
console.log(`Cluster: ${cluster.name}`);
console.log(`Collections: ${collections.length}, davon ohne Content: ${collections.filter((c) => c.content_status === "fehlt").length}`);
console.log(`Wird erzeugt: ${offen.length}${APPLY ? "" : "  (Trockenlauf, nichts wird gespeichert)"}\n`);

let ok = 0;
let fehlgeschlagen = 0;

for (const [i, c] of offen.entries()) {
  process.stdout.write(`[${i + 1}/${offen.length}] ${c.name} ... `);
  try {
    const antwort = await ki.messages.create({
      model: MODELL,
      max_tokens: 8000,
      messages: [{ role: "user", content: prompt(c.name, cluster.name) }],
    });
    const roh = antwort.content.find((b) => b.type === "text")?.text ?? "";
    const json = roh.replace(/^```(?:json)?\s*|\s*```$/g, "").trim();
    const o = JSON.parse(json);

    const maengel = pruefe(o, c.name);
    if (maengel.length > 0) {
      console.log(`ABGELEHNT: ${maengel.join("; ")}`);
      fehlgeschlagen++;
      continue;
    }

    const w = woerter(o.content_md);
    if (APPLY) {
      const { error } = await db
        .from("dir_collection")
        .update({
          meta_title: o.meta_title,
          meta_description: o.meta_description,
          intro_md: o.intro,
          content_md: o.content_md,
          experten_zitat: o.experten_zitat,
          autor_slug: "markus-laue",
          content_status: "ki_ungeprueft",
          content_woerter: w,
          content_erzeugt_am: new Date().toISOString(),
        })
        .eq("id", c.id);
      if (error) throw error;
    }
    console.log(`${w} Woerter, Title ${o.meta_title.length}, Desc ${o.meta_description.length}`);
    ok++;
  } catch (e) {
    console.log(`FEHLER: ${e.message}`);
    fehlgeschlagen++;
  }
}

console.log(`\nFertig. ${ok} erzeugt, ${fehlgeschlagen} fehlgeschlagen.`);
if (APPLY && ok > 0) {
  console.log("Status: ki_ungeprueft. Ein Trigger verhindert das Veroeffentlichen, bis ein Mensch freigibt.");
}
