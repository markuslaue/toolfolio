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
      .update({ protokoll: this.zeilen, ...(phase ? { phase } : {}) })
      .eq("id", this.laufId);
  }

  /** Nur der Fortschritt, ohne Protokollzeile. Darf oft aufgerufen werden. */
  async fortschritt(phase: Phase, label: string, aktuell?: number, gesamt?: number) {
    await this.admin
      .from("dir_lauf")
      .update({ fortschritt: { phase, label, aktuell: aktuell ?? null, gesamt: gesamt ?? null } })
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
      const seiten: { url: string; text: string }[] = [];
      for (const pfad of UNTERSEITEN) {
        const url = `${p.website_url!.replace(/\/$/, "")}${pfad}`;
        const text = await holeSeite(url);
        if (text && text.length > 300) seiten.push({ url, text });
        if (seiten.length >= 4) break; // Vier reichen. Mehr kostet nur Zeit und Tokens.
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
  "preis_quelle_url": "URL der Seite mit dem Preis, sonst null"
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
          })
          .eq("id", p.id);

        fertig++;
        const preis = d.preis_quelle_url ? "Preis mit Quelle" : d.preis_hinweis ? "Preis ohne Quelle" : "kein Preis";
        await log.schreib(
          "ok",
          `${p.name}: ${seiten.length} Seiten gelesen, ${(d.features ?? []).length} Funktionen, ${(d.contra ?? []).length} Einschränkungen, ${preis}.`,
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
