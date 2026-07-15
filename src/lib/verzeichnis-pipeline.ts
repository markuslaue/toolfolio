import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { createAdminClient } from "@/lib/supabase/admin";
import { entschluessele } from "@/lib/crypto";
import { erzeugeHero } from "@/lib/hero-bild";

/**
 * AD-06: Eine Kategorie komplett loslegen, aus dem Backend.
 *
 * Drei Phasen, in dieser Reihenfolge, und die Reihenfolge ist nicht beliebig:
 *
 *   1. DISCOVERY   Wer bietet in dieser Kategorie ueberhaupt Software an? Erst SERP
 *                  (DE, AT, CH, organisch UND Anzeigen), dann die Herstellerseite
 *                  jedes Kandidaten laden und pruefen lassen. Die Fakten kommen aus
 *                  der PRIMAERQUELLE, nicht aus einem fremden Verzeichnis.
 *   2. CONTENT     Guide, FAQ, Experten-Zitat, Meta. Er braucht die Produkte nicht,
 *                  laeuft aber danach, damit die Anzahl im Text stimmen kann.
 *   3. BILD        Der Hero.
 *
 * ALLES BLEIBT UNGEPRUEFT. Produkte landen auf 'ki_ungeprueft', der Text ebenso, und
 * ein Trigger in der Datenbank verhindert das Veroeffentlichen, solange ein Mensch
 * nicht gelesen hat. Dieser Knopf erspart Arbeit, er ersetzt keine Redaktion.
 */

const MODELL = "claude-opus-4-8";

/* Laender des DACH-Marktes. Er ist nicht ein Markt, er sind drei. */
const LOCATIONS = [
  { code: 2276, land: "DE" },
  { code: 2040, land: "AT" },
  { code: 2756, land: "CH" },
];

/** Wer nur fuer EINE von 18 Abfragen rankt, ist fast nie ein Anbieter der Kategorie. */
const MIN_TREFFER = 2;

/** Domains, die nie ein Produkt sind: Portale, Foren, Presse, soziale Netze. */
const KEIN_PRODUKT = [
  "wikipedia.", "youtube.", "facebook.", "instagram.", "linkedin.", "xing.",
  "amazon.", "ebay.", "google.", "reddit.", "quora.", "pinterest.",
  "capterra.", "getapp.", "softwareadvice.", "trustradius.", "g2.com",
  "omr.com", "trustpilot.", "chip.de", "computerbild.", "heise.de",
  "gelbeseiten.", "dasoertliche.", "wlw.de", "11880.", "yelp.",
];

type Art = "info" | "ok" | "warnung" | "fehler";
type Zeile = { zeit: string; art: Art; text: string };

/**
 * Protokoll UND Fortschritt.
 *
 * Zwei verschiedene Dinge, bewusst getrennt gefuehrt:
 *   protokoll   waechst nur, sagt WAS passiert ist. Zum Nachlesen und Beurteilen.
 *   fortschritt wird ueberschrieben, sagt WIE WEIT wir sind. Zum Zuschauen.
 *
 * Wer 161 Domains pruefen laesst, will nicht Protokollzeilen zaehlen, sondern
 * "47 von 161" lesen.
 */
export type Phase = "suchen" | "pruefen" | "text" | "bild" | "anbieterdaten";

class Protokoll {
  private zeilen: Zeile[] = [];
  constructor(
    private readonly laufId: string,
    private readonly admin: ReturnType<typeof createAdminClient>,
  ) {}

  async schreib(art: Art, text: string, phase?: string) {
    this.zeilen.push({ zeit: new Date().toISOString(), art, text });
    await this.admin
      .from("dir_lauf")
      .update({
        protokoll: this.zeilen,
        zuletzt_aktiv: new Date().toISOString(), // Herzschlag
        ...(phase ? { phase } : {}),
      })
      .eq("id", this.laufId);
  }

  /** Nur der Fortschritt, ohne Protokollzeile. Darf oft aufgerufen werden. */
  async fortschritt(phase: Phase, label: string, aktuell?: number, gesamt?: number) {
    await this.admin
      .from("dir_lauf")
      .update({
        fortschritt: { phase, label, aktuell: aktuell ?? null, gesamt: gesamt ?? null },
        zuletzt_aktiv: new Date().toISOString(), // Herzschlag
      })
      .eq("id", this.laufId);
  }
}

/* --------------------------------------------------------------- Hilfsmittel */

function domainVon(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function istMoeglichesProdukt(url: string): boolean {
  const d = domainVon(url);
  if (!d) return false;
  return !KEIN_PRODUKT.some((k) => d.includes(k));
}

function nameAus(titel: string, url: string): string {
  const roh = (titel.split(/[|\-–—:·]/)[0] ?? "").trim();
  const kern = domainVon(url).split(".")[0];
  return roh.length > 2 && roh.length <= 40 ? roh : kern;
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replaceAll("ä", "ae").replaceAll("ö", "oe").replaceAll("ü", "ue").replaceAll("ß", "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Startseite laden, Text extrahieren. Nur Text, kein Markup. */
async function holeSeite(url: string): Promise<string | null> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 12_000);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      redirect: "follow",
      headers: { "User-Agent": "ToolfolioBot/1.0 (+https://toolfolio.de)" },
    });
    if (!res.ok) return null;
    const html = await res.text();
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

/* ------------------------------------------------------------------ Der Lauf */

export type LaufOptionen = {
  discovery: boolean;
  content: boolean;
  bild: boolean;
};

/**
 * Vorflug-Kontrolle.
 *
 * SIE IST NICHT OPTIONAL, und sie steht hier, weil das Fehlen genau einmal richtig
 * weh getan hat: ohne ANTHROPIC_API_KEY lief eine Discovery komplett durch, verbrauchte
 * DataForSEO-Guthaben fuer 18 SERP-Abfragen, lud hunderte Herstellerseiten und
 * scheiterte dann bei JEDER einzelnen an derselben Meldung. Das Protokoll war voll,
 * das Ergebnis leer, und das Geld weg.
 *
 * Ein Lauf, der ohne seine Werkzeuge startet, ist kein Lauf, sondern eine teure Art,
 * nichts zu tun. Er bricht jetzt in der ersten Sekunde ab und sagt, was fehlt.
 */
function fehlendeSchluessel(opt: LaufOptionen): string[] {
  const fehlt: string[] = [];
  if ((opt.discovery || opt.content) && !process.env.ANTHROPIC_API_KEY) {
    fehlt.push("ANTHROPIC_API_KEY (für die Prüfung der Anbieter und den Text)");
  }
  if (opt.bild && !process.env.OPENAI_API_KEY && !process.env.OPEN_AI_API_KEY) {
    fehlt.push("OPENAI_API_KEY (für das Hintergrundbild)");
  }
  return fehlt;
}

export async function fuehreLaufAus(laufId: string, collectionId: string, opt: LaufOptionen): Promise<void> {
  const admin = createAdminClient();
  const log = new Protokoll(laufId, admin);

  const ergebnis: Record<string, unknown> = {};

  try {
    const fehlt = fehlendeSchluessel(opt);
    if (fehlt.length > 0) {
      await log.schreib(
        "fehler",
        `In der Server-Umgebung fehlen Zugangsdaten: ${fehlt.join(", ")}. Der Lauf startet gar nicht erst, statt Guthaben zu verbrennen.`,
      );
      throw new Error(`Fehlende Zugangsdaten: ${fehlt.join(", ")}`);
    }

    const { data: coll } = await admin
      .from("dir_collection")
      .select("id, name, slug, fokus_keyword, dir_cluster(name)")
      .eq("id", collectionId)
      .maybeSingle();
    if (!coll) throw new Error("Kategorie nicht gefunden.");

    const clusterName = (coll.dir_cluster as unknown as { name: string } | null)?.name ?? "Software";
    await log.schreib("info", `Kategorie: ${coll.name} (Cluster: ${clusterName})`, "Start");

    /* ------------------------------------------------------ 1) Discovery */
    if (opt.discovery) {
      await log.schreib("info", "Phase 1: Anbieter suchen", "Discovery");
      const gefunden = await discovery(admin, log, coll.id as string, coll.name as string);
      ergebnis.discovery = gefunden;
    } else {
      await log.schreib("info", "Discovery übersprungen.");
    }

    /* -------------------------------------------------------- 2) Content */
    if (opt.content) {
      await log.schreib("info", "Phase 2: Text, FAQ und Meta schreiben", "Content");
      const c = await content(admin, log, coll.id as string, coll.name as string, (coll.fokus_keyword as string) ?? null);
      ergebnis.content = c;
    } else {
      await log.schreib("info", "Content übersprungen.");
    }

    /* ----------------------------------------------------------- 3) Bild */
    if (opt.bild) {
      await log.schreib("info", "Phase 3: Hintergrundbild erzeugen", "Bild");
      await log.fortschritt("bild", "Hintergrundbild erzeugen");
      const res = await erzeugeHero(coll.id as string, coll.slug as string, coll.name as string, clusterName);
      if (res.ok) {
        await log.schreib("ok", "Bild erzeugt und gespeichert.");
        ergebnis.bild = true;
      } else {
        await log.schreib("warnung", `Bild fehlgeschlagen: ${res.fehler}`);
        ergebnis.bild = false;
      }
    } else {
      await log.schreib("info", "Bild übersprungen.");
    }

    await log.schreib("ok", "Lauf abgeschlossen. Nichts davon ist veröffentlicht: erst prüfen, dann freigeben.", "Fertig");
    await admin
      .from("dir_lauf")
      .update({ status: "fertig", beendet_am: new Date().toISOString(), ergebnis })
      .eq("id", laufId);
  } catch (e) {
    const text = e instanceof Error ? e.message : "Unbekannter Fehler.";
    await log.schreib("fehler", `Abbruch: ${text}`);
    await admin
      .from("dir_lauf")
      .update({ status: "fehler", beendet_am: new Date().toISOString(), ergebnis })
      .eq("id", laufId);
  }
}

/* ------------------------------------------------------------- 1) Discovery */

async function discovery(
  admin: ReturnType<typeof createAdminClient>,
  log: Protokoll,
  collectionId: string,
  kategorie: string,
) {
  /* Die DataForSEO-Zugangsdaten liegen verschluesselt in integration_secret, einer
     Tabelle OHNE Lese-Policy. Nur die Service-Role kommt heran, und sie verlassen
     diese Funktion nicht. */
  const { data: integration } = await admin
    .from("integration")
    .select("id")
    .eq("provider", "dataforseo")
    .limit(1)
    .maybeSingle();
  if (!integration) throw new Error("Keine DataForSEO-Integration hinterlegt. Ohne sie können wir nicht suchen.");

  const { data: secret } = await admin
    .from("integration_secret")
    .select("ciphertext, iv, tag")
    .eq("integration_id", integration.id)
    .maybeSingle();
  if (!secret) throw new Error("DataForSEO-Zugangsdaten fehlen.");

  const cred = JSON.parse(entschluessele(secret)) as { login: string; passwort: string };
  const auth = Buffer.from(`${cred.login}:${cred.passwort}`).toString("base64");

  /* Ein Keyword sieht nur einen Ausschnitt des Marktes. Wer "X Software" sucht,
     findet andere Anbieter als wer "X Buchungssystem" sucht. */
  const keywords = [
    kategorie,
    `beste ${kategorie}`,
    `${kategorie} Vergleich`,
    `${kategorie} Anbieter`,
    `${kategorie} Test`,
    `${kategorie} Preise`,
  ];
  const abfragenGesamt = keywords.length * LOCATIONS.length;
  await log.schreib("info", `${keywords.length} Suchbegriffe × ${LOCATIONS.length} Länder = ${abfragenGesamt} Abfragen`);
  await log.fortschritt("suchen", "Suchergebnisse in DE, AT und CH abfragen", 0, abfragenGesamt);

  type Kandidat = {
    domain: string;
    name: string;
    url: string;
    titel: string;
    abfragen: Set<string>;
    bestePos: number;
    wirbt: boolean;
  };
  const kandidaten = new Map<string, Kandidat>();
  let anzeigen = 0;
  let abfragenFertig = 0;

  for (const kw of keywords) {
    for (const loc of LOCATIONS) {
      try {
        const res = await fetch("https://api.dataforseo.com/v3/serp/google/organic/live/advanced", {
          method: "POST",
          headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/json" },
          body: JSON.stringify([
            { keyword: kw, language_code: "de", location_code: loc.code, device: "desktop", depth: 100 },
          ]),
        });
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const json = (await res.json()) as {
          tasks?: { result?: { items?: { type?: string; url?: string; title?: string; rank_absolute?: number }[] }[] }[];
        };
        const items = json.tasks?.[0]?.result?.[0]?.items ?? [];

        let neu = 0;
        for (const i of items) {
          // Organische Treffer UND bezahlte Anzeigen. Wer fuer dieses Keyword Geld
          // ausgibt, verkauft mit hoher Wahrscheinlichkeit genau dieses Produkt.
          // Das ist das staerkste Signal ueberhaupt.
          if ((i.type !== "organic" && i.type !== "paid") || !i.url) continue;
          if (!istMoeglichesProdukt(i.url)) continue;

          const d = domainVon(i.url);
          const abfrage = `${kw}|${loc.land}`;
          const wirbt = i.type === "paid";
          if (wirbt) anzeigen++;

          const vorhanden = kandidaten.get(d);
          if (vorhanden) {
            vorhanden.abfragen.add(abfrage);
            vorhanden.bestePos = Math.min(vorhanden.bestePos, i.rank_absolute ?? 999);
            if (wirbt) vorhanden.wirbt = true;
          } else {
            kandidaten.set(d, {
              domain: d,
              name: nameAus(i.title ?? "", i.url),
              url: `https://${d}`,
              titel: i.title ?? "",
              abfragen: new Set([abfrage]),
              bestePos: i.rank_absolute ?? 999,
              wirbt,
            });
            neu++;
          }
        }
        await log.schreib("info", `${loc.land} "${kw}": ${neu} neue Domains`);
      } catch (e) {
        await log.schreib("warnung", `${loc.land} "${kw}" fehlgeschlagen: ${e instanceof Error ? e.message : "?"}`);
      }
      abfragenFertig++;
      await log.fortschritt(
        "suchen",
        `Suchergebnisse abfragen (${kandidaten.size} Domains gefunden)`,
        abfragenFertig,
        abfragenGesamt,
      );
    }
  }

  const alle = [...kandidaten.values()].sort(
    (a, b) => b.abfragen.size - a.abfragen.size || a.bestePos - b.bestePos,
  );
  await log.schreib("info", `${alle.length} Domains insgesamt, davon ${anzeigen} mit bezahlter Anzeige.`);

  /* Vorfilter. Er spart hunderte Seitenabrufe und KI-Aufrufe. Was er wegwirft, wird
     GEZAEHLT und ausgewiesen: man muss sehen koennen, was man nicht sieht. */
  const liste = alle.filter((k) => k.wirbt || k.abfragen.size >= MIN_TREFFER);
  await log.schreib(
    "info",
    `Vorfilter (mindestens ${MIN_TREFFER} Abfragen oder eine Anzeige): ${liste.length} bleiben, ${alle.length - liste.length} verworfen.`,
  );

  /* Jetzt die PRIMAERQUELLE: die Herstellerseite selbst. Die rohe SERP taugt nicht als
     Produktliste, dort ranken auch Foren, Blogs und die Betriebe selbst. */
  const ki = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  let angelegt = 0;
  let verworfen = 0;
  let geprueft = 0;

  await log.fortschritt("pruefen", `${liste.length} Herstellerseiten einzeln besuchen und auswerten`, 0, liste.length);

  for (const k of liste) {
    geprueft++;
    await log.fortschritt(
      "pruefen",
      `${k.domain} wird gelesen (${angelegt} Produkte bisher)`,
      geprueft,
      liste.length,
    );
    const text = await holeSeite(k.url);
    if (!text || text.length < 200) {
      await log.schreib("warnung", `${k.domain}: Seite nicht erreichbar, verworfen.`);
      verworfen++;
      continue;
    }

    try {
      const antwort = await ki.messages.create({
        model: MODELL,
        max_tokens: 1200,
        messages: [
          {
            role: "user",
            content: `Du prüfst, ob eine Website ein Software-Produkt der Kategorie "${kategorie}" anbietet.

Ein Produkt ist es NUR, wenn die Seite eine Software verkauft oder vermietet, die Betriebe
dieser Kategorie einsetzen. KEIN Produkt sind: Vergleichsportale, Verzeichnisse, Blogs,
Foren, Presseartikel, Dienstleister ohne eigene Software, und Betriebe, die die Software
nur NUTZEN statt sie anzubieten.

Ebenfalls KEIN Produkt: Software, die laut der eigenen Seite eingestellt wird oder wurde.

Schreib die Beschreibung IN EIGENEN WORTEN. Übernimm keine Werbetexte wörtlich.
Erfinde nichts: was nicht auf der Seite steht, bleibt null.

SPRACHE: Deutsch, Du-Form, ECHTE UMLAUTE (ä ö ü ß), niemals ae/oe/ue/ss.
Keine Gedankenstriche.

DOMAIN: ${k.domain}
TITEL: ${k.titel}
SEITENTEXT:
${text}

Gib NUR ein JSON-Objekt zurück, ohne Codefence:
{"ist_produkt": true/false, "begruendung": "kurz", "name": "...", "anbieter": "... oder null",
 "kurzbeschreibung": "1 bis 2 Sätze", "features": ["bis zu 6"], "einsatzgebiet": "...",
 "preis_hinweis": "nur wenn auf der Seite, sonst null"}`,
          },
        ],
      });

      const roh = antwort.content[0].type === "text" ? antwort.content[0].text : "";
      const p = JSON.parse(roh.slice(roh.indexOf("{"), roh.lastIndexOf("}") + 1));

      if (!p.ist_produkt) {
        await log.schreib("info", `${k.domain}: kein Produkt (${p.begruendung}), verworfen.`);
        verworfen++;
        continue;
      }

      const slug = slugify(p.name || k.name);
      const { data: vorhanden } = await admin
        .from("dir_produkt")
        .select("id")
        .eq("slug", slug)
        .maybeSingle();

      let produktId = vorhanden?.id as string | undefined;
      if (!produktId) {
        const { data: neu, error } = await admin
          .from("dir_produkt")
          .insert({
            name: p.name,
            slug,
            anbieter: p.anbieter ?? null,
            website_url: k.url,
            kurzbeschreibung: p.kurzbeschreibung ?? null,
            features: p.features ?? [],
            einsatzgebiet: p.einsatzgebiet ?? null,
            preis_hinweis: p.preis_hinweis ?? null,
            // UNGEPRUEFT. Ein Mensch entscheidet, was ins Verzeichnis kommt.
            status: "ki_ungeprueft",
          })
          .select("id")
          .single();
        if (error || !neu) {
          await log.schreib("warnung", `${p.name}: konnte nicht angelegt werden.`);
          continue;
        }
        produktId = neu.id as string;
      }

      await admin
        .from("dir_collection_produkt")
        .upsert(
          { collection_id: collectionId, produkt_id: produktId, zone: "organisch", position: 0 },
          { onConflict: "collection_id,produkt_id" },
        );

      angelegt++;
      await log.schreib("ok", `${p.name} (${k.domain})${k.wirbt ? " · schaltet Anzeigen" : ""}`);
    } catch (e) {
      const text = e instanceof Error ? e.message : "?";

      /* Ein Authentifizierungs- oder Kontingentfehler ist KEIN Problem dieses einen
         Kandidaten, sondern des ganzen Laufs. Er wiederholt sich zwangslaeufig bei
         jedem weiteren. Weiterzumachen hiesse, hundertmal denselben Fehler ins
         Protokoll zu schreiben und dabei hundert Websites umsonst zu laden. */
      if (/authentication|api key|unauthorized|401|invalid_api_key|credit balance|rate.?limit/i.test(text)) {
        await log.schreib("fehler", `Abbruch bei ${k.domain}: ${text}`);
        throw new Error(`Die KI-Prüfung ist nicht verfügbar: ${text}`);
      }

      await log.schreib("warnung", `${k.domain}: Prüfung fehlgeschlagen (${text})`);
      verworfen++;
    }
  }

  await log.schreib("ok", `Discovery fertig: ${angelegt} Produkte zugeordnet, ${verworfen} verworfen.`);
  return { domains: alle.length, geprueft: liste.length, angelegt, verworfen, anzeigen };
}

/* --------------------------------------------------------------- 2) Content */

/** ASCII-Umlaute finden, ohne echte deutsche Woerter zu treffen (Dauercamper, Steuerberater). */
const ASCII_SUENDER = new RegExp(
  "\\b(" +
    ["fuer", "ueber", "koenn\\w*", "muess\\w*", "moecht\\w*", "moeglich\\w*", "groess\\w*",
     "gaest\\w*", "loesung\\w*", "waehl\\w*", "aender\\w*", "hoeh\\w*", "spaet\\w*",
     "zurueck\\w*", "natuerlich", "haeuf\\w*", "taegl\\w*", "jaehrl\\w*", "ueblich\\w*",
     "erklaer\\w*", "waehrend", "gemaess", "regelmaessig\\w*", "zusaetzl\\w*",
     "tatsaechl\\w*", "naechst\\w*", "unterstuetz\\w*", "pruef\\w*", "qualitaet"].join("|") +
    ")\\b",
  "gi",
);

async function content(
  admin: ReturnType<typeof createAdminClient>,
  log: Protokoll,
  collectionId: string,
  name: string,
  fokus: string | null,
) {
  await log.fortschritt("text", "Guide, FAQ, Experten-Zitat und Meta schreiben");
  const ki = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const antwort = await ki.messages.create({
    model: MODELL,
    max_tokens: 16000,
    messages: [
      {
        role: "user",
        content: `Du schreibst den Ratgeber-Teil einer Vergleichsseite für ${name} auf Toolfolio.

DEINE ROLLE: Du schreibst als Markus Laue, Gründer von Toolfolio und Geschäftsführer der
OMMM GmbH in Leipzig. Du berätst Betriebe seit Jahren bei Softwarekosten und Toolauswahl.
Du schreibst wie jemand, der die Fehler kennt, weil er sie gesehen hat.

SPRACHE, ohne Ausnahme:
- Deutsch, Du-Form.
- ECHTE UMLAUTE: ä ö ü ß. Niemals ae, oe, ue, ss.
- KEINE Gedankenstriche. Stattdessen Komma, Doppelpunkt oder Klammern.
- Kein Marketinggeschwätz, keine Superlative, keine Ausrufezeichen.

FAKTENGRENZE, die wichtigste Regel:
- Erfinde NICHTS. Keine Studien, keine Statistiken, keine Prozentzahlen, keine Preise.
- Nenne KEINE konkreten Produktnamen und keine Anbieter. Der Guide erklärt die Kategorie,
  er bewertet keine Tools. Die Tools stehen darüber auf der Seite.
- Wo du etwas nicht weißt, schreib, worauf man achten muss, statt eine Zahl zu erfinden.

STRUKTUR, genau diese sieben Abschnitte, jeder als H2 im Format "## [Label] Überschrift":

## [Grundverständnis] Was eine ${name} wirklich leistet
## [Feature-Deep-Dive] Diese Funktionen zählen im Alltag
## [Entscheidungshilfe] Worauf du bei der Auswahl achten solltest
## [Total Cost of Ownership] Übliche Preismodelle bei ${name}
## [Aus der Praxis] Fehler, die in der Praxis wirklich passieren
## [Compliance] Rechtliche Anforderungen in DACH
## [Playbook] So gehst du die Auswahl konkret an

UMFANG: mindestens 1800 Wörter. Echte Substanz je Abschnitt, konkrete Beispiele aus dem
Betrieb. Nutze H3 (###), wo es die Struktur trägt. Schreib konkret: nicht "achte auf gute
Usability", sondern "lass die Software in der Demo von der Person bedienen, die später
damit arbeitet, nicht vom Chef".

AUSSERDEM:
experten_zitat: Ein Absatz in Ich-Form über den häufigsten Fehler, den du siehst. 3 bis 5 Sätze.
faq: 6 bis 8 Fragen, wie jemand sie wirklich tippt, Antworten je 2 bis 4 Sätze. Jede Antwort
     muss für sich allein stehen und stimmen: sie wird als FAQPage ausgezeichnet.
meta_title: maximal 60 Zeichen, Keyword "${fokus ?? name}" vorne.
meta_description: 140 bis 160 Zeichen.

Antworte NUR mit JSON:
{"content_md":"...","experten_zitat":"...","meta_title":"...","meta_description":"...","faq":[{"frage":"...","antwort":"..."}]}`,
      },
    ],
  });

  const roh = antwort.content[0].type === "text" ? antwort.content[0].text : "";
  const inhalt = JSON.parse(roh.slice(roh.indexOf("{"), roh.lastIndexOf("}") + 1));

  const woerter = String(inhalt.content_md).split(/\s+/).filter(Boolean).length;

  /* Harte Pruefung. Ein Text, der die Regeln bricht, wird NICHT geschrieben.
     Lieber ein leerer Platz als ein Text mit "fuer" statt "für" auf einer Seite,
     die von Sorgfalt lebt. */
  const fehler: string[] = [];
  if (woerter < 1500) fehler.push(`nur ${woerter} Wörter (mindestens 1500)`);
  if (!String(inhalt.content_md).trimStart().startsWith("##")) fehler.push("beginnt nicht mit einer H2");
  if (!Array.isArray(inhalt.faq) || inhalt.faq.length < 5) fehler.push("weniger als 5 FAQ-Einträge");

  const alles = [inhalt.content_md, inhalt.experten_zitat, ...(inhalt.faq ?? []).flatMap((f: { frage: string; antwort: string }) => [f.frage, f.antwort])].join("\n");
  const suender = alles.match(ASCII_SUENDER) ?? [];
  if (suender.length) fehler.push(`ASCII-Umlaute: ${[...new Set(suender)].slice(0, 4).join(", ")}`);
  if (/[–—]/.test(alles)) fehler.push("enthält Gedankenstriche");

  if (fehler.length) {
    await log.schreib("fehler", `Text verworfen: ${fehler.join(" · ")}`);
    throw new Error(`Der erzeugte Text erfüllt die Regeln nicht: ${fehler.join(", ")}`);
  }

  await admin
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
      aktualisiert_am: new Date().toISOString(),
    })
    .eq("id", collectionId);

  await log.schreib("ok", `Text geschrieben: ${woerter} Wörter, ${inhalt.faq.length} FAQ-Fragen.`);
  await log.schreib("info", `Meta-Title: ${inhalt.meta_title} (${String(inhalt.meta_title).length} Zeichen)`);

  return { woerter, faq: inhalt.faq.length };
}

/* ----------------------------------------------------- 4) Anbieterdaten */

/**
 * Tiefendaten je Anbieter.
 *
 * Die Discovery liefert nur einen Steckbrief: Name, ein paar Saetze, ein paar Features,
 * alles von der Startseite. Fuer eine Detailseite reicht das nicht. Also holen wir
 * gezielt die Seiten, auf denen wirklich etwas steht: Funktionen, Preise, Ueber uns.
 *
 * DER PREIS IST DER HEIKLE TEIL. Er wird NUR uebernommen, wenn er woertlich auf einer
 * Seite steht, und er bekommt STAND und QUELL-URL mit. Ohne die beiden ist eine
 * Preisangabe wertlos: niemand kann sie pruefen, und in sechs Monaten stimmt sie nicht
 * mehr. Ein Preis ohne Quelle waere genau die Scheingenauigkeit, die wir dem Rest der
 * Branche vorwerfen.
 */
const UNTERSEITEN = ["", "/preise", "/pricing", "/preis", "/funktionen", "/features", "/produkt", "/product"];

/* Partnerprogramm-Seiten. Ein Affiliate-Programm liegt fast nie auf der Startseite,
   sondern hier. Wir laden sie GETRENNT und mit Vorrang, damit die Erkennung nicht am
   Seiten-Limit (vier Seiten) scheitert. */
const PARTNER_SEITEN = ["/partner", "/partnerprogramm", "/affiliate", "/affiliates", "/partnerprogram", "/referral"];

export async function anreichereProdukte(
  laufId: string,
  collectionId: string,
  nurIds: string[] | null,
): Promise<void> {
  const admin = createAdminClient();
  const log = new Protokoll(laufId, admin);

  try {
    // Auch hier: erst pruefen, dann dutzende Websites crawlen. Siehe fehlendeSchluessel().
    if (!process.env.ANTHROPIC_API_KEY) {
      await log.schreib("fehler", "In der Server-Umgebung fehlt ANTHROPIC_API_KEY. Ohne ihn können wir die Anbieterseiten nicht auswerten.");
      throw new Error("Fehlender ANTHROPIC_API_KEY");
    }

    const { data: coll } = await admin
      .from("dir_collection")
      .select("name")
      .eq("id", collectionId)
      .maybeSingle();
    const kategorie = (coll?.name as string) ?? "Software";

    let q = admin
      .from("dir_collection_produkt")
      .select("produkt_id, dir_produkt(id, name, website_url, langbeschreibung)")
      .eq("collection_id", collectionId);
    if (nurIds?.length) q = q.in("produkt_id", nurIds);

    const { data: zuordnungen } = await q;
    const produkte = (zuordnungen ?? [])
      .map((z) => z.dir_produkt as unknown as { id: string; name: string; website_url: string | null; langbeschreibung: string | null })
      .filter((p) => p && p.website_url);

    await log.schreib("info", `Phase: Anbieterdaten für ${produkte.length} Produkte`, "Anbieterdaten");
    await log.fortschritt("anbieterdaten", `${produkte.length} Anbieter: Preis- und Funktionsseiten lesen`, 0, produkte.length);

    const ki = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    let fertig = 0;
    let leer = 0;

    let n = 0;
    for (const p of produkte) {
      n++;
      await log.fortschritt("anbieterdaten", `${p.name}: Unterseiten lesen`, n, produkte.length);
      /* Mehrere Unterseiten laden, nicht nur die Startseite. Preise stehen fast nie
         auf der Startseite, und Funktionslisten auch nicht. Was 404 gibt, faellt weg. */
      const basis = p.website_url!.replace(/\/$/, "");
      const seiten: { url: string; text: string }[] = [];
      for (const pfad of UNTERSEITEN) {
        const text = await holeSeite(`${basis}${pfad}`);
        if (text && text.length > 300) seiten.push({ url: `${basis}${pfad}`, text });
        if (seiten.length >= 4) break; // Vier reichen. Mehr kostet nur Zeit und Tokens.
      }

      /* Partnerprogramm: eine der Partner-Seiten laden. Die erste, die existiert, reicht:
         wenn es ein Programm gibt, steht es dort. Findet keine, bleibt es "unbekannt",
         NICHT "nein": ein 404 auf /affiliate beweist nicht, dass es kein Programm gibt,
         es kann anders heissen. Wir behaupten nur, was wir wissen. */
      let partnerSeite: { url: string; text: string } | null = null;
      for (const pfad of PARTNER_SEITEN) {
        const text = await holeSeite(`${basis}${pfad}`);
        if (text && text.length > 300) {
          partnerSeite = { url: `${basis}${pfad}`, text };
          break;
        }
      }

      if (seiten.length === 0) {
        await log.schreib("warnung", `${p.name}: keine Seite erreichbar.`);
        leer++;
        continue;
      }

      try {
        const antwort = await ki.messages.create({
          model: MODELL,
          max_tokens: 2500,
          messages: [
            {
              role: "user",
              content: `Du erstellst das Datenblatt für "${p.name}", eine Software der Kategorie "${kategorie}".

Du bekommst mehrere Seiten der Herstellerwebsite. Alles, was du schreibst, muss dort stehen.

SPRACHE: Deutsch, Du-Form, ECHTE UMLAUTE (ä ö ü ß), niemals ae/oe/ue/ss.
Keine Gedankenstriche. Keine Werbesprache, kein Superlativ.

DIE HARTEN REGELN:
- Erfinde NICHTS. Was nicht dasteht, bleibt null oder eine leere Liste.
- "contra" sind KEINE erfundenen Schwächen. Nimm nur, was aus den Seiten wirklich
  hervorgeht: fehlende Funktionen, Einschränkungen, Zusatzkosten, Modulzwang,
  fehlende Angaben. Findest du nichts Belegbares, gib eine leere Liste zurück.
  Eine erfundene Schwäche ist genauso eine Lüge wie eine erfundene Stärke.
- PREIS: nur wenn eine konkrete Angabe auf einer Seite steht. Dann gib die URL dieser
  Seite als preis_quelle_url an. Steht nur "auf Anfrage", schreib genau das und lass
  die Quelle null.

PARTNERPROGRAMM: ${
        partnerSeite
          ? `Diese Seite wurde gefunden (${partnerSeite.url}):\n${partnerSeite.text.slice(0, 2000)}`
          : "Keine Partner- oder Affiliate-Seite gefunden. Setz partnerprogramm auf 'unbekannt', NICHT auf 'nein': ein fehlender Fund beweist nicht, dass es kein Programm gibt."
      }

SEITEN:
${seiten.map((s) => `--- ${s.url}\n${s.text.slice(0, 3000)}`).join("\n\n")}

Gib NUR ein JSON-Objekt zurück, ohne Codefence:
{
  "langbeschreibung": "3 bis 5 Sätze, was die Software macht und für wen",
  "features": ["bis zu 10 Funktionen, kurz"],
  "plattformen": ["z. B. Cloud, Web, iOS, Android, Windows"],
  "einsatzgebiet": "kurze Phrase",
  "pro": ["bis zu 5 belegbare Stärken"],
  "contra": ["nur belegbare Einschränkungen, sonst leer"],
  "preis_hinweis": "wörtliche Preisangabe oder 'Auf Anfrage' oder null",
  "preis_quelle_url": "URL der Seite mit dem Preis, sonst null",
  "partnerprogramm": "ja nur wenn die Partner-Seite ein echtes Partner- oder Affiliate-Programm beschreibt, sonst unbekannt",
  "partnerprogramm_url": "die URL der Partner-Seite, wenn partnerprogramm ja ist, sonst null"
}`,
            },
          ],
        });

        const roh = antwort.content[0].type === "text" ? antwort.content[0].text : "";
        const d = JSON.parse(roh.slice(roh.indexOf("{"), roh.lastIndexOf("}") + 1));

        await admin
          .from("dir_produkt")
          .update({
            langbeschreibung: d.langbeschreibung ?? null,
            features: d.features ?? [],
            plattformen: d.plattformen ?? [],
            einsatzgebiet: d.einsatzgebiet ?? null,
            pro: d.pro ?? [],
            contra: d.contra ?? [],
            preis_hinweis: d.preis_hinweis ?? null,
            preis_quelle_url: d.preis_quelle_url ?? null,
            // Der Stand gehoert zwingend dazu: ein Preis ohne Datum ist in sechs
            // Monaten eine Falschaussage, und niemand merkt es.
            preis_stand: d.preis_hinweis ? new Date().toISOString().slice(0, 10) : null,
            /* Partnerprogramm NUR auf 'ja' setzen, wenn die KI eins belegt hat. Ein
               bestehendes 'ja' aus einem frueheren Lauf ueberschreiben wir nicht mit
               'unbekannt', sonst wuerde ein erneuter Lauf ohne Partner-Seite den Befund
               loeschen. Wir setzen nur, was wir POSITIV wissen. */
            ...(d.partnerprogramm === "ja"
              ? { partnerprogramm: "ja", partnerprogramm_url: d.partnerprogramm_url ?? partnerSeite?.url ?? null }
              : {}),
          })
          .eq("id", p.id);

        fertig++;
        const preis = d.preis_quelle_url ? "Preis mit Quelle" : d.preis_hinweis ? "Preis ohne Quelle" : "kein Preis";
        const partner = d.partnerprogramm === "ja" ? ", Partnerprogramm gefunden" : "";
        await log.schreib(
          "ok",
          `${p.name}: ${seiten.length} Seiten gelesen, ${(d.features ?? []).length} Funktionen, ${(d.contra ?? []).length} Einschränkungen, ${preis}${partner}.`,
        );
      } catch (e) {
        await log.schreib("warnung", `${p.name}: ${e instanceof Error ? e.message : "Auswertung fehlgeschlagen"}`);
        leer++;
      }
    }

    await log.schreib("ok", `Anbieterdaten fertig: ${fertig} angereichert, ${leer} ohne Ergebnis.`, "Fertig");
    await admin
      .from("dir_lauf")
      .update({ status: "fertig", beendet_am: new Date().toISOString(), ergebnis: { fertig, leer } })
      .eq("id", laufId);
  } catch (e) {
    await log.schreib("fehler", `Abbruch: ${e instanceof Error ? e.message : "Unbekannter Fehler"}`);
    await admin
      .from("dir_lauf")
      .update({ status: "fehler", beendet_am: new Date().toISOString() })
      .eq("id", laufId);
  }
}

/* ------------------------------------------------- 5) Lead-Formular erzeugen */

/**
 * AD-07: Den kategoriespezifischen Fragensatz erzeugen.
 *
 * DER AUFBAU EINES FORMULARS, und der ist ueberall gleich:
 *   1. FACHFRAGEN     kategoriespezifisch. Sie entscheiden, welche Tools passen.
 *   2. QUALIFIZIERUNG generisch (Groesse, Zeitrahmen, Bestand). Steckt in BASIS_FRAGEN.
 *   3. EMPFEHLUNG     begruendet, aus dem Tag-Matching.
 *   4. KONTAKT        Name, Firma, E-Mail, plus die zwei getrennten Einwilligungen.
 *
 * Erzeugt wird hier NUR Teil 1. Der Rest ist fuer alle Kategorien identisch und
 * gehoert nicht in einen KI-Prompt: Wer den Kontaktteil pro Kategorie neu erfinden
 * laesst, bekommt 1300 verschiedene Datenschutzhinweise, und einer davon ist falsch.
 *
 * JEDE FRAGE BEKOMMT EIN "warum". Nicht als Deko: Markus soll im Backend sehen, WAS
 * abgefragt wird und WOZU, bevor er ein Formular freigibt, das Leads an zahlende
 * Kunden verteilt. Ein Feld, dessen Zweck niemand erklaeren kann, gehoert geloescht.
 */
export async function erzeugeFinder(
  laufId: string,
  collectionId: string,
  /** Aenderungswunsch der Redaktion. Fliesst woertlich in den Prompt. */
  wunsch?: string | null,
): Promise<void> {
  const admin = createAdminClient();
  const log = new Protokoll(laufId, admin);

  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      await log.schreib("fehler", "In der Server-Umgebung fehlt ANTHROPIC_API_KEY.");
      throw new Error("Fehlender ANTHROPIC_API_KEY");
    }

    const { data: coll } = await admin
      .from("dir_collection")
      .select("id, name, slug, finder_config")
      .eq("id", collectionId)
      .maybeSingle();
    if (!coll) throw new Error("Kategorie nicht gefunden.");

    /* Der VORHERIGE Entwurf. Er kommt in den Prompt, wenn ein Aenderungswunsch da ist:
       "mach es anders" ohne zu sagen, was vorher war, fuehrt dazu, dass das Modell bei
       jedem Lauf bei null anfaengt und die guten Fragen mitverwirft. */
    const vorher = (coll.finder_config as { categoryQuestions?: unknown[] } | null)?.categoryQuestions ?? null;

    await log.schreib("info", `Lead-Formular für ${coll.name}`, "Lead-Formular");
    if (wunsch) await log.schreib("info", `Änderungswunsch: ${wunsch}`);
    await log.fortschritt("text", "Fragensatz entwerfen");

    /* Die Produkte sind die Grundlage. Ein Fragensatz, der nach Dingen fragt, die KEIN
       Tool der Kategorie kann, unterscheidet nichts und aergert nur. Deshalb bekommt das
       Modell die echten Produkte samt Funktionen zu sehen. */
    const { data: zuordnungen } = await admin
      .from("dir_collection_produkt")
      .select("produkt_id, dir_produkt(id, name, kurzbeschreibung, features, langbeschreibung)")
      .eq("collection_id", collectionId);

    const produkte = (zuordnungen ?? [])
      .map((z) => z.dir_produkt as unknown as { id: string; name: string; kurzbeschreibung: string | null; features: string[]; langbeschreibung: string | null })
      .filter((p) => p && (p.features?.length > 0 || p.langbeschreibung));

    if (produkte.length < 2) {
      throw new Error(
        "Zu wenige Produkte mit belegten Daten. Ein Fragensatz braucht Tools, die sich wirklich unterscheiden. Lass erst die Anbieterdaten holen.",
      );
    }
    await log.schreib("info", `${produkte.length} Produkte mit belegten Daten als Grundlage.`);

    const ki = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const antwort = await ki.messages.create({
      model: MODELL,
      max_tokens: 6000,
      messages: [
        {
          role: "user",
          content: `Du entwirfst den Fragensatz eines Auswahl-Assistenten für die Kategorie "${coll.name}".

Ein Betrieb beantwortet 4 bis 6 Fachfragen und bekommt danach 2 bis 3 passende Tools
empfohlen, mit Begründung. Deine Fragen entscheiden also, welches Tool empfohlen wird.

DIE ECHTEN TOOLS DIESER KATEGORIE, mit dem, was sie laut Herstellerseite können:
${produkte.map((p) => `
--- ${p.name}
${p.kurzbeschreibung ?? ""}
Funktionen: ${(p.features ?? []).join(" | ") || "keine angegeben"}`).join("")}

DIE REGELN, in dieser Reihenfolge wichtig:

1. FRAG NUR NACH DINGEN, DIE UNTERSCHEIDEN. Eine Frage, die alle Tools gleich
   beantworten, unterscheidet nichts und ärgert nur. Schau in die Funktionslisten:
   Wo unterscheiden sich die Tools wirklich? Genau da liegen die Fragen.

2. FRAG AUS SICHT DES BETRIEBS, nicht aus Sicht der Software. Nicht "Brauchst du eine
   REST-API?", sondern "Sollen deine Rechnungen automatisch in der Buchhaltung landen?".
   Der Nutzer kennt sein Problem, nicht unsere Feature-Namen.

3. JEDE FRAGE BRAUCHT EIN "warum": ein Satz, warum diese Frage im Alltag den
   Unterschied macht. Er wird dem Nutzer angezeigt. Wenn du das "warum" nicht
   schreiben kannst, ist die Frage überflüssig.

4. AUSSCHLUSSKRITERIEN sparsam: höchstens zwei Fragen dürfen "ausschluss": true haben.
   Das sind Fragen, bei denen ein Tool, das es nicht kann, gar nicht erst gezeigt wird.
   Nur wo das wirklich ein K.-o. ist (fehlende Pflichtfunktion, falsches Land).

5. TAGS: Jede Antwortoption bekommt Tags. Ein Tag ist eine Fähigkeit, die ein Tool hat
   oder nicht hat. Nutze kurze, technische Kleinschreibung mit Unterstrich
   (z. B. "datev_export", "online_buchung", "mehrmandanten"). Antworten, die keine
   Anforderung stellen ("Nein, brauche ich nicht"), bekommen eine LEERE Tag-Liste.

6. KEINE Kontaktfragen (Name, E-Mail, Firma, Telefon), KEINE Fragen nach Budget,
   Firmengröße oder Zeitrahmen. Die kommen aus dem festen Teil des Formulars und
   würden hier doppelt stehen.

SPRACHE: Deutsch, Du-Form, ECHTE UMLAUTE (ä ö ü ß), niemals ae/oe/ue/ss.
Keine Gedankenstriche.
${
  vorher && wunsch
    ? `
DAS IST EINE ÜBERARBEITUNG. Der bisherige Fragensatz lautete:
${JSON.stringify(vorher, null, 1)}

DIE REDAKTION WÜNSCHT AUSDRÜCKLICH:
"${wunsch}"

Setz diesen Wunsch um. Alles, was er NICHT betrifft, behältst du bei: Wirf keine gute
Frage weg, nur weil du neu ansetzt. Der Wunsch der Redaktion sticht jede andere Regel
hier, ausser der Faktengrenze und der Sprache.`
    : wunsch
      ? `
DIE REDAKTION WÜNSCHT AUSDRÜCKLICH: "${wunsch}"
Setz diesen Wunsch um. Er sticht jede andere Regel hier, ausser der Faktengrenze und
der Sprache.`
      : ""
}

Antworte NUR mit JSON:
{
  "introHeadline": "Finde in N Fragen die passende ${coll.name}",
  "ctaLabel": "kurzer Knopftext, max 55 Zeichen",
  "categoryQuestions": [
    {
      "id": "kurzer_schluessel",
      "label": "Die Frage, wie ein Mensch sie stellt",
      "warum": "Ein Satz: warum das im Alltag den Unterschied macht",
      "type": "single",
      "ausschluss": false,
      "options": [
        { "value": "kurz", "label": "Die Antwort", "tags": ["tag_eins"], "hinweis": "optionaler Zusatz, oder weglassen" }
      ]
    }
  ],
  "begruendung": "3 bis 5 Sätze an die Redaktion: warum genau diese Fragen, und was sie über die Tools unterscheiden."
}`,
        },
      ],
    });

    const roh = antwort.content[0].type === "text" ? antwort.content[0].text : "";
    const entwurf = JSON.parse(roh.slice(roh.indexOf("{"), roh.lastIndexOf("}") + 1));

    /* Harte Pruefung. Ein Formular, das Leads an zahlende Kunden verteilt, darf nicht
       aus einer Modell-Laune entstehen. */
    const fragen = entwurf.categoryQuestions ?? [];
    const fehler: string[] = [];
    if (fragen.length < 3 || fragen.length > 7) fehler.push(`${fragen.length} Fragen (erlaubt: 3 bis 7)`);
    if (fragen.some((f: { warum?: string }) => !f.warum || f.warum.length < 20)) fehler.push("eine Frage hat keine Begründung");
    if (fragen.some((f: { options?: unknown[] }) => (f.options?.length ?? 0) < 2)) fehler.push("eine Frage hat weniger als zwei Antworten");
    const ausschluesse = fragen.filter((f: { ausschluss?: boolean }) => f.ausschluss).length;
    if (ausschluesse > 2) fehler.push(`${ausschluesse} Ausschlusskriterien (erlaubt: höchstens 2)`);

    const alles = JSON.stringify(entwurf);
    const suender = alles.match(ASCII_SUENDER) ?? [];
    if (suender.length) fehler.push(`ASCII-Umlaute: ${[...new Set(suender)].slice(0, 4).join(", ")}`);
    if (/[–—]/.test(alles)) fehler.push("enthält Gedankenstriche");

    if (fehler.length) {
      await log.schreib("fehler", `Entwurf verworfen: ${fehler.join(" · ")}`);
      throw new Error(`Der Entwurf erfüllt die Regeln nicht: ${fehler.join(", ")}`);
    }

    /* Jetzt die Tools taggen, mit GENAU dem Vokabular, das die Fragen erzeugt haben.
       Andersherum (erst taggen, dann fragen) haette der Fragensatz Tags erfunden, die
       kein Tool hat, und der Finder wuerde ins Leere greifen. */
    await log.fortschritt("text", "Tools gegen den neuen Fragensatz taggen", 0, produkte.length);

    const vokabular = [
      ...new Set(
        fragen.flatMap((f: { options?: { tags?: string[] }[] }) => (f.options ?? []).flatMap((o) => o.tags ?? [])),
      ),
    ];
    await log.schreib("info", `Tag-Vokabular aus dem Fragensatz: ${vokabular.join(", ")}`);

    /* IN STAPELN, nicht auf einmal.
       HIER LAG DER FEHLER: 49 Produkte mit je einer Begruendung passen nicht in eine
       Antwort. Sie lief ins Token-Limit und brach mitten im JSON ab, der Lauf starb,
       nachdem er die eigentliche Arbeit schon getan hatte. Aussen sah es aus, als sei
       gar nichts passiert.

       Zwei Konsequenzen: Stapel von 10, und die Begruendung fliegt raus. Sie wurde
       nirgends angezeigt und hat die Antwort mehr als verdoppelt. Was nicht gebraucht
       wird, wird nicht erzeugt. */
    const STAPEL = 10;
    const alleTags: { id: string; name: string; tags: string[] }[] = [];

    for (let i = 0; i < produkte.length; i += STAPEL) {
      const teil = produkte.slice(i, i + STAPEL);
      await log.fortschritt(
        "text",
        `Fähigkeiten zuordnen (Produkt ${i + 1} bis ${Math.min(i + STAPEL, produkte.length)})`,
        i,
        produkte.length,
      );

      const tagAntwort = await ki.messages.create({
        model: MODELL,
        max_tokens: 3000,
        messages: [
          {
            role: "user",
            content: `Ordne jedem Produkt die Fähigkeiten zu, die es laut seiner Beschreibung wirklich hat.

ERLAUBTE TAGS, ausschliesslich diese:
${vokabular.map((t) => `- ${t}`).join("\n")}

DIE ENTSCHEIDENDE REGEL: Vergib ein Tag NUR, wenn die Beschreibung es hergibt. Rate nicht,
schliesse nicht. Steht nichts da, gibt es kein Tag. Ein geratenes Tag ist schlimmer als
eine Lücke, weil damit später eine Empfehlung begründet wird, die auf nichts beruht.

PRODUKTE:
${teil.map((p) => `
--- ${p.name} (id: ${p.id})
${p.kurzbeschreibung ?? ""}
${(p.langbeschreibung ?? "").slice(0, 400)}
Funktionen: ${(p.features ?? []).join(" | ") || "keine angegeben"}`).join("")}

Antworte NUR mit JSON, ohne Codefence, ohne Begründungen:
{"produkte":[{"id":"<uuid>","tags":["..."]}]}`,
          },
        ],
      });

      const tagRoh = tagAntwort.content[0].type === "text" ? tagAntwort.content[0].text : "";
      let teilJson: { produkte?: { id: string; tags?: string[] }[] };
      try {
        teilJson = JSON.parse(tagRoh.slice(tagRoh.indexOf("{"), tagRoh.lastIndexOf("}") + 1));
      } catch {
        /* Ein kaputter Stapel darf nicht den ganzen Lauf toeten. Die anderen 40 Produkte
           sind ja in Ordnung. Wir sagen, welcher Stapel fehlt, statt alles wegzuwerfen. */
        await log.schreib(
          "warnung",
          `Stapel ${i + 1} bis ${Math.min(i + STAPEL, produkte.length)}: Antwort unlesbar, übersprungen.`,
        );
        continue;
      }

      for (const p of teilJson.produkte ?? []) {
        const name = teil.find((x) => x.id === p.id)?.name ?? "?";
        alleTags.push({ id: p.id, name, tags: (p.tags ?? []).filter((t: string) => vokabular.includes(t)) });
      }
    }

    if (alleTags.length === 0) {
      throw new Error("Kein einziges Produkt konnte eingeordnet werden. Ohne Fähigkeiten kann der Finder nichts empfehlen.");
    }

    let n = 0;
    for (const p of alleTags) {
      await admin
        .from("dir_collection_produkt")
        .update({ tags: p.tags })
        .eq("collection_id", collectionId)
        .eq("produkt_id", p.id);
      n++;
      await log.fortschritt("text", `${p.name}`, n, alleTags.length);
      await log.schreib("ok", `${p.name}: ${p.tags.join(", ") || "(keine Fähigkeit belegt)"}`);
    }

    const tagJson = { produkte: alleTags };

    /* Kriterien, die KEIN Tool erfuellt, sind eine Luecke in unseren Daten, kein
       Kriterium. Wir sagen es der Redaktion, statt sie es spaeter im Finder merken
       zu lassen. */
    const belegt = new Set<string>(tagJson.produkte.flatMap((p) => p.tags));
    const tot = (vokabular as string[]).filter((t) => !belegt.has(t));
    if (tot.length) {
      await log.schreib(
        "warnung",
        `Diese Kriterien erfüllt kein einziges Tool: ${tot.join(", ")}. Der Finder wird sie dem Nutzer als "dazu wissen wir nichts" zeigen, statt alle Tools dafür abzuwerten.`,
      );
    }

    await admin
      .from("dir_collection")
      .update({
        finder_config: {
          status: "in_review",
          introHeadline: entwurf.introHeadline,
          ctaLabel: entwurf.ctaLabel,
          categoryQuestions: fragen,
          begruendung: entwurf.begruendung,
        },
        // IN PRUEFUNG, nicht live. Ein Formular, das Leads an zahlende Kunden verteilt,
        // geht nicht ohne menschliche Freigabe online.
        finder_status: "in_review",
        finder_erzeugt_am: new Date().toISOString(),
      })
      .eq("id", collectionId);

    await log.schreib(
      "ok",
      `Fertig: ${fragen.length} Fragen, ${ausschluesse} Ausschlusskriterien. Status: in Prüfung. Lies die Begründungen und gib frei.`,
      "Fertig",
    );
    await admin
      .from("dir_lauf")
      .update({
        status: "fertig",
        beendet_am: new Date().toISOString(),
        ergebnis: { fragen: fragen.length, tags: vokabular.length, tote_kriterien: tot },
      })
      .eq("id", laufId);
  } catch (e) {
    await log.schreib("fehler", `Abbruch: ${e instanceof Error ? e.message : "Unbekannter Fehler"}`);
    await admin
      .from("dir_lauf")
      .update({ status: "fehler", beendet_am: new Date().toISOString() })
      .eq("id", laufId);
  }
}
