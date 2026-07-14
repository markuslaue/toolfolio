/**
 * AD-04: Den Piloten einer Collection fertigstellen.
 *
 * Erzeugt in EINEM Lauf und aus EINER Quelle:
 *   1. den ausgebauten SEO-Guide (tiefer als der bisherige Text)
 *   2. die sichtbare FAQ (die zugleich das FAQPage-Markup speist)
 *   3. die Matching-Tags je Produkt, aus den ECHTEN Produktdaten
 *
 * Was dieses Skript NICHT tut, und das ist Absicht:
 *   - Es erfindet keine Produkteigenschaft. Ein Tag wird nur vergeben, wenn die
 *     Beschreibung des Produkts es hergibt. Ist nichts belegt, gibt es kein Tag,
 *     und der Finder sagt dem Nutzer spaeter ehrlich "nicht belegt". Ein geratenes
 *     Tag waere schlimmer als eine Luecke: es wuerde eine Empfehlung begruenden.
 *   - Es veroeffentlicht nichts. Der Text bleibt `ki_ungeprueft`, und die Datenbank
 *     laesst eine Veroeffentlichung in diesem Zustand gar nicht zu (Trigger
 *     dir_content_gate). Freigeben ist Menschenarbeit.
 *
 * Aufruf:  node scripts/verzeichnis-pilot.mjs campingplatz-software
 */

import { createClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";
import { readFileSync } from "node:fs";

for (const zeile of readFileSync(".env.local", "utf8").split("\n")) {
  const m = zeile.match(/^([A-Z_]+)=(.*)$/);
  if (m) process.env[m[1]] ??= m[2].replace(/^["']|["']$/g, "");
}

const MODELL = "claude-opus-4-8";
const slug = process.argv[2];
if (!slug) {
  console.error("Aufruf: node scripts/verzeichnis-pilot.mjs <collection-slug>");
  process.exit(1);
}

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const claude = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

/* ---------------------------------------------------------------- Sprachregeln */

const SPRACHE = `
SPRACHE UND TON, ohne Ausnahme:
- Deutsch, Du-Form.
- ECHTE UMLAUTE: ä ö ü ß. Niemals ae, oe, ue, ss. Also "für", nicht "fuer". "Gäste", nicht "Gaeste".
- KEINE Gedankenstriche. Kein Halbgeviertstrich, kein Geviertstrich, kein " - " als Satzzeichen.
  Nutze stattdessen Komma, Doppelpunkt oder Klammern.
- Kein Marketinggeschwätz, keine Superlative, keine Ausrufezeichen.
- Beträge im Format 1.249,00 EUR.
`;

const FAKTENGRENZE = `
FAKTENGRENZE, das ist die wichtigste Regel:
- Erfinde NICHTS. Keine Studien, keine Statistiken, keine Prozentzahlen, keine Marktzahlen,
  keine Nutzerzahlen, keine Preise, die du nicht belegen kannst.
- Nenne im Guide KEINE konkreten Produktnamen und keine Anbieter. Der Guide erklärt die
  Kategorie, er bewertet keine Tools. Die Tools stehen darüber auf der Seite.
- Wo du etwas nicht weißt, schreib, worauf man achten muss, statt eine Zahl zu erfinden.
- Rechtliches (Kassenpflicht, Meldeschein, Kurtaxe) nur so konkret, wie es wirklich stimmt,
  und immer mit dem Hinweis, dass es je nach Land und Gemeinde abweicht.
`;

/* ------------------------------------------------------------ Der Fragensatz */

/**
 * Der Fragensatz fuer Campingplatz-Software.
 *
 * Er steht HIER im Klartext und nicht in einem KI-Prompt, weil er eine fachliche
 * Entscheidung ist und keine Textaufgabe. Die Fragen sind die, die ein Betreiber
 * sich beim Wechsel wirklich stellt, und jede Antwort hat Tags, die spaeter ein
 * Tool aussuchen. Wer die Fragen aendert, muss die Tags mitaendern, sonst matcht
 * der Finder ins Leere.
 */
const FINDER_CAMPINGPLATZ = {
  status: "live",
  introHeadline: "Finde in 6 Fragen die passende Campingplatz-Software",
  ctaLabel: "In 6 Fragen zur passenden Campingplatz-Software",
  categoryQuestions: [
    {
      id: "stellplaetze",
      label: "Wie viele Stellplätze und Unterkünfte verwaltest du?",
      warum: "Die Größe entscheidet, ob ein System dich trägt oder ob du für Komplexität zahlst, die du nie brauchst.",
      type: "single",
      options: [
        { value: "bis_50", label: "Bis 50", tags: ["klein"] },
        { value: "50_200", label: "50 bis 200", tags: ["mittel"] },
        { value: "200_500", label: "200 bis 500", tags: ["mittel", "gross"] },
        { value: "ueber_500", label: "Mehr als 500", tags: ["gross"] },
      ],
    },
    {
      id: "betrieb",
      label: "Saisonbetrieb oder ganzjährig?",
      warum: "Bei Saisonbetrieb zahlst du im Winter für ein System, das stillsteht. Manche Anbieter rechnen das ab, andere nicht.",
      type: "single",
      options: [
        { value: "saison", label: "Nur in der Saison", tags: ["saison"] },
        { value: "ganzjahr", label: "Das ganze Jahr", tags: ["ganzjahr"] },
      ],
    },
    {
      id: "dauercamper",
      label: "Hast du Dauercamper?",
      warum: "Dauercamper sind eine völlig andere Logik als Kurzbucher: Jahrespacht, Stromabrechnung nach Zähler, Nebenkosten. Viele Systeme können das nicht.",
      type: "single",
      ausschluss: true,
      options: [
        { value: "ja", label: "Ja, und sie sind wichtig für mich", tags: ["dauercamper"], hinweis: "Tools ohne Dauercamper-Verwaltung zeigen wir dir dann nicht." },
        { value: "nein", label: "Nein, nur Kurzbucher und Saisongäste", tags: [] },
      ],
    },
    {
      id: "onlinebuchung",
      label: "Sollen Gäste direkt online buchen können?",
      warum: "Ein reines Anfrageformular ist keine Online-Buchung. Der Unterschied ist deine Telefonzeit am Empfang.",
      type: "single",
      options: [
        { value: "ja_echtzeit", label: "Ja, mit Verfügbarkeit in Echtzeit", tags: ["online_buchung"] },
        { value: "anfrage", label: "Ein Anfrageformular reicht mir", tags: [] },
        { value: "nein", label: "Nein, Buchung läuft bei mir anders", tags: [] },
      ],
    },
    {
      id: "kasse",
      label: "In welchem Land betreibst du den Platz?",
      warum: "Kassenpflicht, Meldeschein und Kurtaxe sind je Land verschieden geregelt. Eine Software, die das nicht sauber abbildet, wird im Betrieb zum Problem.",
      type: "single",
      options: [
        { value: "de", label: "Deutschland", tags: ["kasse", "meldeschein"] },
        { value: "at", label: "Österreich", tags: ["kasse", "meldeschein"] },
        { value: "ch", label: "Schweiz", tags: ["meldeschein"] },
      ],
    },
    {
      id: "channel",
      label: "Verkaufst du über Buchungsportale?",
      warum: "Ohne synchronisierte Verfügbarkeiten kassierst du Doppelbuchungen. Ein Channel Manager ist dann kein Extra, sondern Pflicht.",
      type: "single",
      ausschluss: true,
      options: [
        { value: "ja", label: "Ja, über Portale wie Booking oder Camping-Portale", tags: ["channel_manager"], hinweis: "Tools ohne Channel-Anbindung zeigen wir dir dann nicht." },
        { value: "nein", label: "Nein, ich verkaufe nur direkt", tags: [] },
      ],
    },
  ],
};

/** Das Tag-Vokabular. Die KI darf NUR diese Tags vergeben, nichts erfinden. */
const TAGS = [
  "klein", "mittel", "gross",
  "saison", "ganzjahr",
  "dauercamper",
  "online_buchung",
  "kasse", "meldeschein",
  "channel_manager",
];

/* ----------------------------------------------------------------- Prüfungen */

/**
 * ASCII-Umlaute finden, OHNE echte deutsche Woerter zu treffen.
 *
 * Die naive Suche nach der Zeichenfolge "ue" ist falsch: sie steckt voellig legitim in
 * DaUErcamper, StEUErberater, nEUE, tEUEr, FEUEr. Genauso "ae" in Israel und "oe" in Poesie.
 *
 * Deshalb wird nicht nach Zeichenfolgen gesucht, sondern nach dem, was wirklich
 * passiert, wenn ein Modell in ASCII abrutscht: es schreibt eine Handvoll immer
 * gleicher Woerter falsch. Die stehen hier.
 */
const ASCII_SUENDER = new RegExp(
  "\\b(" +
    [
      "fuer", "ueber", "koenn\\w*", "muess\\w*", "moecht\\w*", "moeglich\\w*", "groess\\w*",
      "gaest\\w*", "loesung\\w*", "waehl\\w*", "aender\\w*", "hoeh\\w*", "spaet\\w*",
      // Achtung: "monatlich" hat KEINEN Umlaut. Wer es hier einträgt, verbietet
      // ein korrektes deutsches Wort. Nur Wörter aufnehmen, die wirklich einen haben.
      "zurueck\\w*", "natuerlich", "haeuf\\w*", "taegl\\w*", "jaehrl\\w*",
      "ueblich\\w*", "erklaer\\w*", "waehrend", "gemaess", "regelmaessig\\w*", "grundsaetzl\\w*",
      "zusaetzl\\w*", "tatsaechl\\w*", "naechst\\w*", "praez\\w*", "beruecksicht\\w*",
      "unterstuetz\\w*", "pruef\\w*", "schliess\\w*", "verhaeltnis\\w*", "qualitaet",
      "kapazitaet", "funktionalitaet", "aehnlich\\w*", "ausschliessl\\w*", "massgebl\\w*",
    ].join("|") +
    ")\\b",
  "gi",
);

function pruefeText(t, was) {
  const f = [];
  if (/[–—]/.test(t) || /\s-\s/.test(t)) f.push(`${was}: enthält Gedankenstriche`);
  const suender = t.match(ASCII_SUENDER) ?? [];
  if (suender.length > 0) {
    f.push(`${was}: ASCII-Umlaute statt echter (${[...new Set(suender)].slice(0, 5).join(", ")})`);
  }
  /* Sie-Form.
     ACHTUNG, die naive Suche nach "Sie" ist falsch: am SATZANFANG ist "Sie" fast immer
     das Pronomen fuer ein feminines Substantiv ("Die Software ... Sie sollte die Kurtaxe
     abbilden"). Ein echter Verstoss ist ein grossgeschriebenes "Sie" MITTEN im Satz,
     oder die formalen Possessive "Ihnen" und "Ihre". */
  const treffer = [];
  for (const satz of t.split(/(?<=[.!?:])\s+|\n+/)) {
    const mitte = satz.slice(1).match(/[^.!?]{0,45}\bSie\b[^.!?]{0,45}/);
    if (mitte) treffer.push(mitte[0].trim());
  }
  const formal = t.match(/[^.!?]{0,45}\b(Ihnen|Ihre[nmrs]?)\b[^.!?]{0,45}/);
  if (formal) treffer.push(formal[0].trim());
  if (treffer.length > 0) f.push(`${was}: Sie-Form statt Du-Form ("...${treffer[0]}...")`);
  return f;
}

/* --------------------------------------------------------------------- Lauf */

const { data: collection } = await sb
  .from("dir_collection")
  .select("id, name, slug, fokus_keyword, content_md")
  .eq("slug", slug)
  .single();
if (!collection) {
  console.error(`Collection ${slug} nicht gefunden.`);
  process.exit(1);
}

const { data: zuordnungen } = await sb
  .from("dir_collection_produkt")
  .select("produkt_id, dir_produkt(id, name, kurzbeschreibung, langbeschreibung, features, preis_hinweis)")
  .eq("collection_id", collection.id);

// Nur Produkte mit belegten Eigenschaften. Wer keine Features hat, ueber den wissen
// wir nichts, und dann duerfen wir ihn auch nicht taggen.
const produkte = (zuordnungen ?? [])
  .map((z) => z.dir_produkt)
  .filter((p) => p && (p.features?.length > 0 || p.langbeschreibung));

console.log(`Collection: ${collection.name}`);
console.log(`Produkte mit belegten Daten: ${produkte.length} von ${zuordnungen.length}\n`);

/* -------------------------------------------------------------- 1) Tagging */

console.log("1) Tags vergeben ...");

const tagPrompt = `Du ordnest Campingplatz-Software Eigenschaften zu, damit ein Auswahl-Assistent sie filtern kann.

Für jedes Produkt bekommst du seine Beschreibung und seine Funktionen, so wie sie auf der Herstellerseite stehen.

Erlaubte Tags, NUR diese, keine anderen:
- klein, mittel, gross: für welche Platzgröße das Produkt gemacht ist
- saison, ganzjahr: ob es Saisonbetrieb bzw. Ganzjahresbetrieb ausdrücklich unterstützt
- dauercamper: Dauercamper-Verwaltung, Jahrespacht, Stromabrechnung nach Zähler
- online_buchung: echte Online-Buchung mit Verfügbarkeit in Echtzeit (ein reines Anfrageformular zählt NICHT)
- kasse: Kassenfunktion oder Kassensystem
- meldeschein: elektronischer Meldeschein, Gästemeldung oder Kurtaxe
- channel_manager: Anbindung an Buchungsportale, Channel Manager, OTA

DIE ENTSCHEIDENDE REGEL: Vergib ein Tag NUR, wenn die Beschreibung es wirklich hergibt.
Rate nicht. Schließe nicht. "Buchungssystem" bedeutet NICHT automatisch online_buchung.
"Verwaltung" bedeutet NICHT automatisch kasse. Wenn nichts dasteht, gibt es kein Tag.
Ein geratenes Tag wäre schlimmer als eine Lücke, weil damit später eine Empfehlung
begründet wird, die auf nichts beruht.

Bei klein/mittel/gross: Nur taggen, wenn eine Größenangabe wirklich dasteht. Steht nichts,
vergib alle drei nicht. Rate keine Zielgruppe aus dem Tonfall.

Produkte:
${produkte.map((p) => `
--- ${p.name} (id: ${p.id})
Kurz: ${p.kurzbeschreibung ?? "keine"}
Lang: ${(p.langbeschreibung ?? "keine").slice(0, 700)}
Funktionen: ${(p.features ?? []).join(" | ") || "keine angegeben"}
Preis: ${p.preis_hinweis ?? "keine Angabe"}
`).join("")}

Antworte NUR mit JSON:
{"produkte":[{"id":"<uuid>","name":"<name>","tags":["..."],"begruendung":"<ein Satz, warum genau diese Tags, mit Bezug auf die Beschreibung>"}]}`;

const tagAntwort = await claude.messages.create({
  model: MODELL,
  max_tokens: 4000,
  messages: [{ role: "user", content: tagPrompt }],
});
const tagJson = JSON.parse(tagAntwort.content[0].text.match(/\{[\s\S]*\}/)[0]);

for (const p of tagJson.produkte) {
  const erlaubt = (p.tags ?? []).filter((t) => TAGS.includes(t));
  const verworfen = (p.tags ?? []).filter((t) => !TAGS.includes(t));
  if (verworfen.length) console.log(`   ! ${p.name}: unbekannte Tags verworfen: ${verworfen.join(", ")}`);
  await sb
    .from("dir_collection_produkt")
    .update({ tags: erlaubt })
    .eq("collection_id", collection.id)
    .eq("produkt_id", p.id);
  console.log(`   ${p.name}: ${erlaubt.join(", ") || "(keine belegt)"}`);
}

/* ----------------------------------------------------- 2) Content und FAQ */

console.log("\n2) Guide ausbauen und FAQ schreiben ...");

const contentPrompt = `Du schreibst den Ratgeber-Teil einer Vergleichsseite für ${collection.name} auf Toolfolio.

DEINE ROLLE: Du schreibst als Markus Laue, Gründer von Toolfolio und Geschäftsführer der
OMMM GmbH in Leipzig. Du berätst Agenturen und Betriebe seit Jahren bei Softwarekosten und
Toolauswahl. Du schreibst wie jemand, der die Fehler kennt, weil er sie gesehen hat. Nicht
wie eine Redaktion, die ein Thema recherchiert hat.

${SPRACHE}
${FAKTENGRENZE}

DER TEXT steht UNTER den Produkten. Wer hier ankommt, hat die Tools schon gesehen und will
verstehen, wonach er eigentlich entscheidet.

STRUKTUR, genau diese sieben Abschnitte, jeder als H2 im Format "## [Kurzes Label] Überschrift":

## [Grundverständnis] Was eine ${collection.name} wirklich leistet
## [Feature-Deep-Dive] Diese Funktionen zählen im Alltag
## [Entscheidungshilfe] Worauf du bei der Auswahl achten solltest
## [Total Cost of Ownership] Übliche Preismodelle bei ${collection.name}
## [Aus der Praxis] Fehler, die in der Praxis wirklich passieren
## [Compliance] Rechtliche Anforderungen in DACH
## [Playbook] So gehst du die Auswahl konkret an

UMFANG: mindestens 1800 Wörter, eher 2200. Jeder Abschnitt braucht echte Substanz, mehrere
Absätze, konkrete Beispiele aus dem Betrieb. Keine Füllwörter, keine Wiederholungen, keine
Sätze, die nur die Überschrift umformulieren. Nutze H3 (###) innerhalb der Abschnitte, wo es
die Struktur wirklich trägt.

Schreib konkret. Nicht "achte auf gute Usability", sondern "lass die Software in der Demo von
der Person bedienen, die später damit arbeitet, nicht vom Chef".

AUSSERDEM:

experten_zitat: Ein Absatz in Ich-Form, der den häufigsten Fehler benennt, den du siehst.
Konkret, aus der Erfahrung, kein Allgemeinplatz. 3 bis 5 Sätze.

faq: 6 bis 8 Fragen, die Betreiber wirklich stellen. Die Fragen so formuliert, wie jemand sie
tippt. Die Antworten je 2 bis 4 Sätze, konkret und ehrlich, auch wenn die ehrliche Antwort
"kommt darauf an, und zwar auf Folgendes" lautet. Diese FAQ wird als FAQPage ausgezeichnet,
also muss jede Antwort für sich allein stehen und stimmen.

meta_title: maximal 60 Zeichen, das Keyword "${collection.fokus_keyword ?? collection.name}" vorne.
meta_description: 140 bis 160 Zeichen, ein Nutzenversprechen, kein Geschwätz.

Antworte NUR mit JSON:
{"content_md":"...","experten_zitat":"...","meta_title":"...","meta_description":"...","faq":[{"frage":"...","antwort":"..."}]}`;

const contentAntwort = await claude.messages.create({
  model: MODELL,
  max_tokens: 16000,
  messages: [{ role: "user", content: contentPrompt }],
});
const roh = contentAntwort.content[0].text;
const inhalt = JSON.parse(roh.slice(roh.indexOf("{"), roh.lastIndexOf("}") + 1));

/* --------------------------------------------------------------- 3) Prüfen */

const fehler = [];
const woerter = inhalt.content_md.split(/\s+/).filter(Boolean).length;

if (woerter < 1700) fehler.push(`Guide zu kurz: ${woerter} Wörter (mindestens 1700)`);
if (!inhalt.content_md.trimStart().startsWith("##")) fehler.push("Guide beginnt nicht mit einer H2");
if (inhalt.meta_title.length > 65) fehler.push(`meta_title zu lang: ${inhalt.meta_title.length}`);
if (inhalt.meta_description.length < 120 || inhalt.meta_description.length > 165)
  fehler.push(`meta_description ${inhalt.meta_description.length} Zeichen (soll 120 bis 165)`);
if (!Array.isArray(inhalt.faq) || inhalt.faq.length < 6) fehler.push("weniger als 6 FAQ-Einträge");

fehler.push(...pruefeText(inhalt.content_md, "Guide"));
fehler.push(...pruefeText(inhalt.experten_zitat, "Experten-Zitat"));
for (const f of inhalt.faq ?? []) {
  fehler.push(...pruefeText(f.frage, `FAQ-Frage "${f.frage.slice(0, 30)}"`));
  fehler.push(...pruefeText(f.antwort, `FAQ-Antwort zu "${f.frage.slice(0, 30)}"`));
}

if (fehler.length > 0) {
  console.error("\nABBRUCH. Der Text erfüllt die Regeln nicht:");
  for (const f of fehler) console.error("  -", f);
  console.error("\nNichts geschrieben. Lauf erneut.");
  process.exit(1);
}

/* -------------------------------------------------------------- 4) Schreiben */

await sb
  .from("dir_collection")
  .update({
    content_md: inhalt.content_md,
    content_status: "ki_ungeprueft", // Freigeben ist Menschenarbeit.
    content_woerter: woerter,
    content_erzeugt_am: new Date().toISOString(),
    experten_zitat: inhalt.experten_zitat,
    autor_slug: "markus-laue",
    meta_title: inhalt.meta_title,
    meta_description: inhalt.meta_description,
    faq: inhalt.faq,
    finder_config: FINDER_CAMPINGPLATZ,
    finder_status: "live",
    aktualisiert_am: new Date().toISOString(),
  })
  .eq("id", collection.id);

console.log(`\nFertig.`);
console.log(`  Guide: ${woerter} Wörter`);
console.log(`  FAQ: ${inhalt.faq.length} Fragen`);
console.log(`  Meta-Title: ${inhalt.meta_title} (${inhalt.meta_title.length})`);
console.log(`  Finder: live, ${FINDER_CAMPINGPLATZ.categoryQuestions.length} Fachfragen`);
console.log(`\n  Status bleibt "ki_ungeprueft". Die Seite geht NICHT live, bis ein Mensch sie freigibt.`);
console.log(`  Vorschau: /verzeichnis/vorschau/${slug}`);
