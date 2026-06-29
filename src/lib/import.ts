/** B-06: Kontoauszug-Import. Echtes CSV-Parsing + Erkennung wiederkehrender Abos. */

import { KATEGORIE_FARBEN, type Intervall } from "@/lib/abos";

export type Konfidenz = "hoch" | "mittel" | "dublette";

/** Eine einzelne Original-Buchung aus dem Import (volle Referenz). */
export interface Referenz {
  datum: string; // YYYY-MM-DD
  betrag: number; // negativ = Belastung
  text: string; // vollstaendiger Verwendungszweck / Beleg
}

export interface Treffer {
  id: string;
  tool: string;
  initial: string;
  farbe: string;
  buchungstext: string;
  betrag: number;
  intervall: Intervall;
  letzteAbbuchung: string; // YYYY-MM-DD
  naechsteAbbuchung: string; // YYYY-MM-DD
  kategorie: string;
  konfidenz: Konfidenz;
  anzahl: number;
  /** Wahrscheinlich noch aktiv (zuletzt im erwarteten Rhythmus abgebucht). */
  aktiv: boolean;
  /** Optionaler Analyse-Hinweis (z. B. "vermutlich beendet", "unregelmaessig"). */
  hinweis?: string;
  /** Alle zugrunde liegenden Buchungen mit vollem Original-Text (Belegnummern etc.). */
  referenzen: Referenz[];
}

export type Buchung = { datum: string; text: string; betrag: number };

/* ---------------- Merchant-Woerterbuch ---------------- */

type Eintrag = { muster: string[]; tool: string; kategorie: string };

const MERCHANTS: Eintrag[] = [
  { muster: ["NOTION"], tool: "Notion", kategorie: "Produktivität" },
  { muster: ["AHREFS"], tool: "Ahrefs", kategorie: "SEO" },
  { muster: ["ADOBE"], tool: "Adobe Creative Cloud", kategorie: "Design" },
  { muster: ["FIGMA"], tool: "Figma", kategorie: "Design" },
  { muster: ["CANVA"], tool: "Canva", kategorie: "Design" },
  { muster: ["LOVABLE"], tool: "Lovable", kategorie: "Entwicklung" },
  { muster: ["ANTHROPIC", "CLAUDE"], tool: "Anthropic API", kategorie: "KI / API" },
  { muster: ["OPENAI", "CHATGPT"], tool: "OpenAI", kategorie: "KI / API" },
  { muster: ["ELEVENLABS"], tool: "ElevenLabs", kategorie: "KI / API" },
  { muster: ["PERPLEXITY"], tool: "Perplexity", kategorie: "KI / API" },
  { muster: ["MIDJOURNEY"], tool: "Midjourney", kategorie: "KI / API" },
  { muster: ["GSUITE", "GOOGLE WORKSPACE", "GOOGLE*GSUITE"], tool: "Google Workspace", kategorie: "Kommunikation" },
  { muster: ["SLACK"], tool: "Slack", kategorie: "Kommunikation" },
  { muster: ["ZOOM"], tool: "Zoom", kategorie: "Kommunikation" },
  { muster: ["LOOM"], tool: "Loom", kategorie: "Kommunikation" },
  { muster: ["MAILCHIMP"], tool: "Mailchimp", kategorie: "Kommunikation" },
  { muster: ["LINEAR"], tool: "Linear", kategorie: "Entwicklung" },
  { muster: ["VERCEL"], tool: "Vercel", kategorie: "Entwicklung" },
  { muster: ["GITHUB"], tool: "GitHub", kategorie: "Entwicklung" },
  { muster: ["AWS", "AMZN AWS"], tool: "AWS", kategorie: "Entwicklung" },
  { muster: ["CLOUDFLARE"], tool: "Cloudflare", kategorie: "Entwicklung" },
  { muster: ["SENTRY"], tool: "Sentry", kategorie: "Entwicklung" },
  { muster: ["CALENDLY"], tool: "Calendly", kategorie: "Produktivität" },
  { muster: ["TYPEFORM"], tool: "Typeform", kategorie: "Produktivität" },
  { muster: ["ZAPIER"], tool: "Zapier", kategorie: "Produktivität" },
  { muster: ["MAKE.COM", "MAKE "], tool: "Make", kategorie: "Produktivität" },
  { muster: ["1PASSWORD"], tool: "1Password", kategorie: "Produktivität" },
  { muster: ["HUBSPOT"], tool: "HubSpot", kategorie: "Kommunikation" },
  { muster: ["WEBFLOW"], tool: "Webflow", kategorie: "Design" },
  { muster: ["FRAMER"], tool: "Framer", kategorie: "Design" },
  { muster: ["SHOPIFY"], tool: "Shopify", kategorie: "eCommerce" },
];

/* ---------------- CSV parsen ---------------- */

function trennzeichen(zeile: string): string {
  const kandidaten = [";", "\t", ","];
  let best = ";";
  let max = -1;
  for (const c of kandidaten) {
    const n = zeile.split(c).length;
    if (n > max) {
      max = n;
      best = c;
    }
  }
  return best;
}

function splitCsvZeile(zeile: string, sep: string): string[] {
  const out: string[] = [];
  let cur = "";
  let quoted = false;
  for (let i = 0; i < zeile.length; i++) {
    const ch = zeile[i];
    if (ch === '"') {
      if (quoted && zeile[i + 1] === '"') {
        cur += '"';
        i++;
      } else quoted = !quoted;
    } else if (ch === sep && !quoted) {
      out.push(cur);
      cur = "";
    } else cur += ch;
  }
  out.push(cur);
  return out.map((s) => s.trim());
}

function parseBetrag(roh: string): number {
  let s = roh.replace(/[^\d,.\-]/g, "").trim();
  if (!s) return NaN;
  // Deutsches Format: Komma = Dezimal, Punkt = Tausender.
  if (s.includes(",")) s = s.replace(/\./g, "").replace(",", ".");
  return Number(s);
}

function parseDatum(roh: string): string | null {
  const s = roh.trim();
  let m = s.match(/(\d{1,2})[.\/-](\d{1,2})[.\/-](\d{2,4})/);
  if (m) {
    const [, d, mo, yRaw] = m;
    const y = yRaw.length === 2 ? "20" + yRaw : yRaw;
    return `${y}-${mo.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  m = s.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (m) return `${m[1]}-${m[2]}-${m[3]}`;
  return null;
}

const SPALTEN = {
  datum: ["buchungstag", "buchungsdatum", "datum", "valuta", "wertstellung", "date", "booking date"],
  // Name des Beguenstigten/Auftraggebers ZUERST (das ist der eigentliche Anbieter).
  name: ["beguenstigter", "begünstigter", "beguenstigter/zahlungspflichtiger", "empfaenger", "empfänger", "auftraggeber", "zahlungsempfaenger", "zahlungspflichtiger", "zahlungsbeteiligter", "name"],
  // Verwendungszweck/Beschreibung (oft nur Beleg-/Referenznummern).
  zweck: ["verwendungszweck", "buchungstext", "beschreibung", "description", "umsatztext", "vwz", "payee"],
  betrag: ["betrag", "umsatz", "amount", "soll", "value"],
};

function findeSpalte(header: string[], kandidaten: string[]): number {
  const norm = header.map((h) => h.toLowerCase());
  for (const k of kandidaten) {
    const idx = norm.findIndex((h) => h.includes(k));
    if (idx >= 0) return idx;
  }
  return -1;
}

/** ALLE Spalten, deren Header zu einem Kandidaten passt (in Header-Reihenfolge). */
function findeSpalten(header: string[], kandidaten: string[]): number[] {
  const norm = header.map((h) => h.toLowerCase());
  const out: number[] = [];
  for (let i = 0; i < norm.length; i++) {
    if (kandidaten.some((k) => norm[i].includes(k))) out.push(i);
  }
  return out;
}

export function parseCsv(text: string): Buchung[] {
  const zeilen = text.split(/\r?\n/).filter((z) => z.trim().length > 0);
  if (zeilen.length < 2) return [];
  const sep = trennzeichen(zeilen[0]);
  const header = splitCsvZeile(zeilen[0], sep);
  const iDatum = findeSpalte(header, SPALTEN.datum);
  const iBetrag = findeSpalte(header, SPALTEN.betrag);
  // Beguenstigten-Spalten zuerst, dann Verwendungszweck: so geht der Anbietername
  // (z. B. "IHK ...") nicht verloren, auch wenn der Zweck nur eine Beleg-Nr. enthaelt.
  // Eigene Konto-/Bank-Spalten ausschliessen (das ist nicht der Anbieter).
  const eigeneSpalte = (h: string) => /konto|iban|bic|\bbank|waehrung|währung|currency/i.test(h);
  const nameCols = findeSpalten(header, SPALTEN.name).filter((c) => !eigeneSpalte(header[c]));
  const zweckCols = findeSpalten(header, SPALTEN.zweck).filter((c) => !nameCols.includes(c));
  const textCols = [...nameCols, ...zweckCols];
  if (textCols.length === 0 || iBetrag < 0) return [];
  const maxCol = Math.max(iBetrag, ...textCols);

  const out: Buchung[] = [];
  for (let r = 1; r < zeilen.length; r++) {
    const f = splitCsvZeile(zeilen[r], sep);
    if (f.length <= maxCol) continue;
    const betrag = parseBetrag(f[iBetrag]);
    if (!isFinite(betrag)) continue;
    const datum = iDatum >= 0 ? parseDatum(f[iDatum]) : null;
    // Alle Textspalten zusammenfuehren (dedupliziert), Name vorn.
    const teile: string[] = [];
    for (const c of textCols) {
      const v = (f[c] ?? "").trim();
      if (v && !teile.includes(v)) teile.push(v);
    }
    out.push({ datum: datum ?? "", text: teile.join(" "), betrag });
  }
  return out;
}

/* ---------------- CAMT.053 (ISO 20022 XML) ---------------- */

/** Tag-Inhalt aus einem XML-Block holen, Namespace-Praefix (z. B. ns:) ignorierend. */
function xmlTag(block: string, tag: string): string | null {
  const m = block.match(new RegExp(`<(?:\\w+:)?${tag}[^>]*>([\\s\\S]*?)</(?:\\w+:)?${tag}>`, "i"));
  return m ? m[1] : null;
}

/** Alle Vorkommen eines Tags als Array. */
function xmlTagAll(block: string, tag: string): string[] {
  const re = new RegExp(`<(?:\\w+:)?${tag}[^>]*>([\\s\\S]*?)</(?:\\w+:)?${tag}>`, "gi");
  const out: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(block)) !== null) out.push(m[1]);
  return out;
}

function entschaerfeXml(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Parst einen CAMT.053-Auszug (camt.053, Bank-to-Customer Statement).
 * Liest die einzelnen Buchungen (<Ntry>): Betrag, Soll/Haben, Buchungsdatum und
 * den beschreibenden Text (Verwendungszweck, Beguenstigter/Auftraggeber).
 */
export function parseCamt053(text: string): Buchung[] {
  const out: Buchung[] = [];
  for (const entry of xmlTagAll(text, "Ntry")) {
    const amtRaw = xmlTag(entry, "Amt");
    if (!amtRaw) continue;
    const betragAbs = Number(amtRaw.replace(/[^\d.]/g, ""));
    if (!isFinite(betragAbs)) continue;
    const ind = (xmlTag(entry, "CdtDbtInd") ?? "").toUpperCase();
    const betrag = ind.startsWith("DB") ? -betragAbs : betragAbs;

    // Buchungsdatum bevorzugt aus <BookgDt>, sonst <ValDt>.
    const datumBlock = xmlTag(entry, "BookgDt") ?? xmlTag(entry, "ValDt") ?? "";
    const datumM = datumBlock.match(/\d{4}-\d{2}-\d{2}/);
    const datum = datumM ? datumM[0] : "";

    // Beschreibung: Verwendungszweck (Ustrd) + Namen (Nm) + Zusatzinfo (AddtlNtryInf).
    const teile = [
      ...xmlTagAll(entry, "Ustrd"),
      ...xmlTagAll(entry, "Nm"),
      xmlTag(entry, "AddtlNtryInf") ?? "",
    ]
      .map(entschaerfeXml)
      .filter(Boolean);
    const gesehen = new Set<string>();
    const textZeile = teile.filter((t) => (gesehen.has(t) ? false : gesehen.add(t))).join(" ");

    out.push({ datum, text: textZeile, betrag });
  }
  return out;
}

/* ---------------- MT940 (SWIFT) ---------------- */

/**
 * Parst einen MT940-Auszug (SWIFT-Format vieler deutscher Banken).
 * Wertet die :61:-Umsatzzeilen (Datum, Soll/Haben, Betrag) und die folgenden
 * :86:-Mehrzweckzeilen (Verwendungszweck) aus.
 */
export function parseMt940(text: string): Buchung[] {
  const out: Buchung[] = [];
  // In Felder zerlegen: jedes Feld beginnt am Zeilenanfang mit :NN: bzw. :NNx:.
  const roh = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const zeilen = roh.split("\n");

  let aktuell: Buchung | null = null;
  let imVerwendungszweck = false;

  const flush = () => {
    if (aktuell) out.push(aktuell);
    aktuell = null;
    imVerwendungszweck = false;
  };

  for (const zeile of zeilen) {
    const feld = zeile.match(/^:(\d{2}[A-Z]?):(.*)$/);
    if (feld) {
      const tag = feld[1];
      const rest = feld[2];
      if (tag === "61") {
        flush();
        // :61: Valuta(JJMMTT) [Buchung(MMTT)] Soll/Haben(C/D/RC/RD) [Funds] Betrag(mit Komma) ...
        const m = rest.match(/^(\d{6})(\d{4})?(RC|RD|C|D)([A-Z])?([\d,]+)/);
        if (m) {
          const [, valuta, , mark, , betragRoh] = m;
          const jahr = "20" + valuta.slice(0, 2);
          const datum = `${jahr}-${valuta.slice(2, 4)}-${valuta.slice(4, 6)}`;
          const betragAbs = Number(betragRoh.replace(",", "."));
          const soll = mark === "D" || mark === "RD";
          if (isFinite(betragAbs)) {
            aktuell = { datum, text: "", betrag: soll ? -betragAbs : betragAbs };
          }
        }
      } else if (tag.startsWith("86")) {
        // Verwendungszweck: ?NN-Subfeldmarker durch Leerzeichen ersetzen.
        if (aktuell) {
          aktuell.text = (aktuell.text + " " + rest.replace(/\?\d{2}/g, " ")).replace(/\s+/g, " ").trim();
          imVerwendungszweck = true;
        }
      } else {
        imVerwendungszweck = false;
      }
    } else if (imVerwendungszweck && aktuell) {
      // Fortsetzungszeile des :86:-Felds.
      aktuell.text = (aktuell.text + " " + zeile.replace(/\?\d{2}/g, " ")).replace(/\s+/g, " ").trim();
    }
  }
  flush();
  return out;
}

/* ---------------- Format-Dispatcher ---------------- */

export type AuszugFormat = "csv" | "camt" | "mt940";

/**
 * Erkennt das Auszugsformat anhand Dateiname und Inhalt und parst entsprechend.
 * Unterstuetzt CSV, CAMT.053 (XML) und MT940 (SWIFT).
 */
export function parseKontoauszug(dateiname: string, text: string): { buchungen: Buchung[]; format: AuszugFormat } {
  const name = dateiname.toLowerCase();
  const probe = text.slice(0, 4000);
  const istCamt = name.endsWith(".xml") || /camt\.05/i.test(probe) || /<(?:\w+:)?Document/i.test(probe) || /<(?:\w+:)?Ntry>/i.test(probe);
  const istMt940 = name.endsWith(".sta") || name.endsWith(".940") || name.endsWith(".mt940") || /^\s*:\d{2}[A-Z]?:/m.test(probe);

  if (istCamt) return { buchungen: parseCamt053(text), format: "camt" };
  if (istMt940) return { buchungen: parseMt940(text), format: "mt940" };
  return { buchungen: parseCsv(text), format: "csv" };
}

/* ---------------- Erkennung ---------------- */

function erkenneMerchant(text: string): Eintrag | null {
  const t = text.toUpperCase();
  for (const e of MERCHANTS) {
    if (e.muster.some((m) => t.includes(m))) return e;
  }
  return null;
}

// Rausch-Tokens aus Bankbuchungen (Referenzen, Belege, Buchungsarten, Rechtsformen, Stopwoerter).
const NAME_RAUSCHEN =
  /\b(BELEG-?NR|BELEGNR|BELEG|END-?TO-?END-?REF|ENDTOEND|MANDATSREF|MANDATSREFERENZ|MANDAT|GLAEUBIGER-?ID|GLAEUBIGERID|CRED|EREF|KREF|MREF|SVWZ|ABWA|ABWE|REFERENZ|REF|RECHNUNGSNR|RECHNUNG|KUNDENNR|VERTRAGSNR|SEPA|LASTSCHRIFT|FOLGELASTSCHRIFT|BASISLASTSCHRIFT|DAUERAUFTRAG|UEBERWEISUNG|GUTSCHRIFT|KARTENZAHLUNG|POS|INC|LLC|LTD|GMBH|UG|MBH|AG|KG|OHG|PBC|SL|SA|BV|CORP|SUBSCRIPTION|MONATLICH|JAEHRLICH|BILLING|PAYMENT|ZU|UND|DER|DIE|DAS|DEN|VOM|VON|FUER|AM|IM)\b/g;

function saubererName(text: string): string {
  let t = " " + text.toUpperCase() + " ";
  // IBAN und BIC entfernen (vor der Ziffern-Bereinigung).
  t = t.replace(/\b[A-Z]{2}\d{2}[A-Z0-9]{8,30}\b/g, " "); // IBAN
  t = t.replace(/\b[A-Z]{6}[A-Z0-9]{2,5}\b/g, " "); // BIC
  // Zahlungsdienstleister-Praefixe inkl. nachfolgendem Stern-Token.
  t = t.replace(/\b(PAYPAL|STRIPE|PADDLE|FASTSPRING|SQ|FS)\s*\*?\s*/g, " ");
  // Referenz-/Beleg-Schluesselwoerter samt direkt folgendem Wert (Nummer/Code).
  t = t.replace(/\b(BELEG-?NR|END-?TO-?END-?REF|ENDTOEND|MANDATSREF|GLAEUBIGER-?ID|EREF|KREF|MREF|SVWZ|REFERENZ|REF|RECHNUNGSNR|KUNDENNR|VERTRAGSNR)\b[.:#]?\s*\S*/g, " ");
  // Restliche Sonderzeichen und Ziffern zu Leerzeichen.
  t = t.replace(/[^A-ZÀ-Ü ]/g, " ");
  // Verbleibende Rausch-/Stopwoerter entfernen.
  t = t.replace(NAME_RAUSCHEN, " ").replace(/\s+/g, " ").trim();

  const teile = t.split(" ").filter((w) => w.length >= 2).slice(0, 3);
  if (teile.length === 0) return "Unbekannt";
  // Title-Case, bekannte Kuerzel (IHK, SaaS-Akronyme) gross lassen.
  return teile
    .map((w) => (w.length <= 4 && !/[AEIOUÄÖÜ]/.test(w.slice(1)) ? w : w.charAt(0) + w.slice(1).toLowerCase()))
    .join(" ");
}

function naechstesDatum(iso: string, intervall: Intervall): string {
  const d = iso ? new Date(iso) : new Date();
  const heute = new Date();
  // So lange addieren, bis das Datum in der Zukunft liegt.
  const add = (x: Date) => {
    if (intervall === "monatlich") x.setMonth(x.getMonth() + 1);
    else if (intervall === "quartalsweise") x.setMonth(x.getMonth() + 3);
    else x.setFullYear(x.getFullYear() + 1);
  };
  let guard = 0;
  while (d <= heute && guard < 60) {
    add(d);
    guard++;
  }
  return d.toISOString().slice(0, 10);
}

function medianGapTage(daten: string[]): number | null {
  const ts = daten.filter(Boolean).map((d) => new Date(d).getTime()).sort((a, b) => a - b);
  if (ts.length < 2) return null;
  const gaps: number[] = [];
  for (let i = 1; i < ts.length; i++) gaps.push((ts[i] - ts[i - 1]) / 86_400_000);
  gaps.sort((a, b) => a - b);
  return gaps[Math.floor(gaps.length / 2)];
}

function intervallAus(gap: number | null): Intervall {
  if (gap == null) return "monatlich";
  if (gap >= 250) return "jaehrlich";
  if (gap >= 75) return "quartalsweise";
  return "monatlich";
}

/* ---------------- Klassifikation: ist das ueberhaupt Software? ---------------- */

// Klare NICHT-Software (Miete, Gehalt, Steuern, Versicherung, Einzelhandel, Tanken,
// Reise, Bargeld, Bank, Energie/Telco, Spenden ...). Substrings, GROSS verglichen.
const KEIN_TOOL: string[] = [
  // Wohnen / Miete
  "MIETE", "KALTMIETE", "WARMMIETE", "NEBENKOSTEN", "HAUSGELD", "VERMIETER", "HAUSVERWALTUNG",
  // Personal / Gehalt
  "GEHALT", "LOHN", "ENTGELTABRECHNUNG", "SALARY", "SOZIALVERSICHERUNG", "LOHNSTEUER", "SOZIALKASSE",
  // Steuer / Amt
  "FINANZAMT", "STEUER", "UMSATZSTEUER", "GEWERBESTEUER", "EINKOMMENSTEUER", "BUNDESKASSE", "STADTKASSE", "KFZ-STEUER", "ZOLL",
  // Versicherung / Kranken / Rente
  "VERSICHERUNG", "ALLIANZ", "AXA ", "HUK", "ERGO ", "GENERALI", "DEVK", "KRANKENKASSE", "TECHNIKER KRANK", "BARMER", "AOK", " DAK", "RENTENVERS", "BERUFSGENOSSEN",
  // Einzelhandel / Lebensmittel / Drogerie / Baumarkt
  "REWE", "EDEKA", "ALDI", "LIDL", "KAUFLAND", "PENNY", "NETTO MARKEN", "DM-DROGERIE", "DM FIL", "ROSSMANN", "IKEA", "MEDIA MARKT", "SATURN", "OBI ", "BAUHAUS", "HORNBACH", "LEKKERLAND",
  // Gastro / Reise / Tanken / Mobilitaet
  "RESTAURANT", "MCDONALD", "BURGER KING", "STARBUCKS", "BAECKEREI", "BACKEREI", "ARAL", "SHELL", "ESSO", "TOTAL TANK", "TANKSTELLE", "DEUTSCHE BAHN", "DB VERTRIEB", "FLIXBUS", "HOTEL", "LUFTHANSA", "PARKHAUS", "PARKEN",
  // Bank / Bargeld / Gebuehren / Kredit
  "BARGELD", "GELDAUTOMAT", "AUSZAHLUNG", "BARAUSZAHLUNG", "KONTOFUEHRUNG", "KONTOGEBUEHR", "ENTGELTABSCHLUSS", "DARLEHEN", "KREDITRATE", "TILGUNG", "ZINSABSCHLUSS",
  // Energie / Telco / Rundfunk (eher kein SaaS)
  "STADTWERKE", "STROM", "GASAG", "E.ON", "ENBW", "VATTENFALL", "RUNDFUNK", "RUNDFUNKBEITRAG", "GEZ",
  // Spenden / Beitraege / Kammern
  "SPENDE", "MITGLIEDSBEITRAG", "GEWERKSCHAFT", "IHK ", "HANDELSKAMMER", "HANDWERKSKAMMER", "KAMMERBEITRAG", "KIRCHENSTEUER",
];

// SaaS-/Tool-Signale im Buchungstext.
const SAAS_KEYWORD: string[] = [
  "SUBSCRIPTION", "ABONNEMENT", "ABO ", "MONTHLY", "YEARLY", "ANNUAL", "SAAS", "CLOUD", "SOFTWARE",
  "LICENSE", "LICENCE", "LIZENZ", "WORKSPACE", "SEAT", "HOSTING", "DOMAIN", "SERVER", "API ", "APP STORE",
];

// Bekannte Zahlungsdienstleister, ueber die SaaS oft abgerechnet wird.
const PROCESSOR: string[] = [
  "PAYPAL", "STRIPE", "PADDLE", "FASTSPRING", "FS *", "CHARGEBEE", "LEMONSQUEEZY", "LEMON SQUEEZY",
  "GUMROAD", "RECURLY", "BRAINTREE", "2CHECKOUT", "DIGITAL RIVER", "APPLE.COM/BILL", "ITUNES.COM/BILL",
  "GOOGLE *", "GOOGLE PAYMENT", "MICROSOFT*", "MSFT", "SQ *",
];

// Domain-Endungen deuten auf Online-/SaaS-Anbieter hin.
const DOMAIN_RE = /\.(COM|IO|APP|AI|CO|NET|DEV|CLOUD|ORG|XYZ|TOOLS|ME|CC)\b/;

type ToolKlasse = "tool" | "unklar" | "kein_tool";

/**
 * Entscheidet, ob eine (gruppierte) Buchung ueberhaupt Software/SaaS ist.
 * Ziel: Praezision. Einmalige Buchungen ohne jedes SaaS-Signal und klar
 * artfremde Posten (Miete, Gehalt, Steuern, Einkauf ...) werden aussortiert.
 */
function klassifiziereTool(text: string, anzahl: number, betrag: number): ToolKlasse {
  const t = text.toUpperCase();
  if (KEIN_TOOL.some((k) => t.includes(k))) return "kein_tool";

  const proc = PROCESSOR.some((p) => t.includes(p));
  const key = SAAS_KEYWORD.some((k) => t.includes(k));
  const domain = DOMAIN_RE.test(t);
  const recurring = anzahl >= 2;
  const signale = (proc ? 1 : 0) + (key ? 1 : 0) + (domain ? 1 : 0);

  // Grosse Einzelbetraege ohne SaaS-Signal: eher Rechnung/Miete/Gehalt.
  if (betrag >= 1000 && signale === 0) return "kein_tool";

  // Klares Tool: SaaS-Signal kombiniert mit Wiederholung oder mehreren Signalen.
  if (signale > 0 && (recurring || signale >= 2)) return "tool";
  // Wiederkehrend, aber nur schwaches Signal: zur Pruefung anzeigen.
  if (recurring) return "unklar";
  // Einmalig mit SaaS-Wort/Domain: zur Pruefung anzeigen.
  if (key || domain) return "unklar";
  // Einmalig, kein Signal: kein Tool.
  return "kein_tool";
}

function vorMonatenText(tage: number): string {
  if (tage >= 330) {
    const jahre = Math.max(1, Math.round(tage / 365));
    return jahre === 1 ? "vor über einem Jahr" : `vor über ${jahre} Jahren`;
  }
  if (tage >= 50) return `vor ${Math.round(tage / 30)} Monaten`;
  if (tage >= 14) return `vor ${Math.round(tage / 7)} Wochen`;
  return tage <= 1 ? "vor Kurzem" : `vor ${tage} Tagen`;
}

/**
 * Rhythmus-Analyse einer Buchungsgruppe: ist sie noch aktiv (zuletzt im
 * erwarteten Abstand abgebucht) und sind die Abstaende regelmaessig?
 * Eine Abbuchung, die z. B. 2025 lief und seit Monaten nicht mehr kam, gilt
 * als beendet, nicht als laufendes Monatsabo.
 */
function analysiereRhythmus(daten: string[], intervall: Intervall): { aktiv: boolean; regelmaessig: boolean; letzteVorTagen: number } {
  const ts = daten.map((d) => new Date(d).getTime()).filter((t) => isFinite(t)).sort((a, b) => a - b);
  const jetzt = Date.now();
  const letzteTs = ts.length ? ts[ts.length - 1] : jetzt;
  const letzteVorTagen = Math.max(0, Math.round((jetzt - letzteTs) / 86_400_000));

  const gaps: number[] = [];
  for (let i = 1; i < ts.length; i++) gaps.push((ts[i] - ts[i - 1]) / 86_400_000);
  const mean = gaps.length ? gaps.reduce((a, b) => a + b, 0) / gaps.length : 0;
  const cv = mean > 0 ? Math.sqrt(gaps.reduce((s, x) => s + (x - mean) ** 2, 0) / gaps.length) / mean : 0;
  const regelmaessig = gaps.length === 0 || cv <= 0.5;

  // Erwarteter Abstand je Intervall plus Toleranz: laeuft die naechste Abbuchung
  // deutlich ueber der Faelligkeit aus, gilt das Abo als beendet.
  const erwartet = intervall === "jaehrlich" ? 365 : intervall === "quartalsweise" ? 92 : 31;
  const toleranz = Math.max(75, Math.round(erwartet * 1.6));
  const aktiv = letzteVorTagen <= toleranz;
  return { aktiv, regelmaessig, letzteVorTagen };
}

/**
 * Erkennt aus den Buchungen wiederkehrende Software-Abos. Beruecksichtigt nur
 * Belastungen (negative Betraege) und filtert Nicht-Software algorithmisch heraus
 * (Negativ-Liste + SaaS-Signale). existingTools = vorhandene Abo-Namen (Dubletten).
 */
export function erkenneAbos(buchungen: Buchung[], existingTools: string[]): Treffer[] {
  const belastungen = buchungen.filter((b) => b.betrag < 0);
  const vorhanden = new Set(existingTools.map((t) => t.toLowerCase()));

  // Gruppieren nach erkanntem Tool bzw. saeuberlichem Namen.
  const gruppen = new Map<string, { merchant: Eintrag | null; name: string; rows: Buchung[]; raw: string }>();
  for (const b of belastungen) {
    const merchant = erkenneMerchant(b.text);
    const name = merchant?.tool ?? saubererName(b.text);
    const key = name.toLowerCase();
    if (!gruppen.has(key)) gruppen.set(key, { merchant, name, rows: [], raw: b.text });
    gruppen.get(key)!.rows.push(b);
  }

  const treffer: Treffer[] = [];
  let n = 0;
  for (const [, g] of gruppen) {
    const betraege = g.rows.map((r) => Math.abs(r.betrag)).sort((a, b) => a - b);
    const betrag = Math.round(betraege[Math.floor(betraege.length / 2)] * 100) / 100;
    const maxBetrag = betraege[betraege.length - 1] ?? betrag;
    const daten = g.rows.map((r) => r.datum).filter(Boolean).sort();
    const letzte = daten[daten.length - 1] ?? new Date().toISOString().slice(0, 10);
    const intervall = intervallAus(medianGapTage(daten));
    const kategorie = g.merchant?.kategorie ?? "Produktivität";
    const anzahl = g.rows.length;

    const dublette = vorhanden.has(g.name.toLowerCase());
    // Klassifikation: bekannter Anbieter gilt sofort als Tool, sonst algorithmisch.
    const volltext = g.rows.map((r) => r.text).join(" ");
    const klasse: ToolKlasse = g.merchant ? "tool" : klassifiziereTool(volltext, anzahl, maxBetrag);

    // Klar artfremde Posten (Miete, Gehalt, Einkauf ...) gar nicht vorschlagen,
    // ausser es ist bereits ein erfasstes Tool (Dublette).
    if (!dublette && klasse === "kein_tool") continue;

    // Rhythmus: noch aktiv? Abstaende regelmaessig?
    const { aktiv, regelmaessig, letzteVorTagen } = analysiereRhythmus(daten, intervall);

    let konfidenz: Konfidenz;
    if (dublette) konfidenz = "dublette";
    // Hohe Konfidenz nur, wenn es ein Tool ist UND noch laeuft UND regelmaessig
    // mehrfach abgebucht wurde. Sonst zur Pruefung (mittel).
    else if (klasse === "tool" && aktiv && regelmaessig && anzahl >= 2) konfidenz = "hoch";
    else konfidenz = "mittel";

    let hinweis: string | undefined;
    if (!aktiv) hinweis = `Letzte Abbuchung ${vorMonatenText(letzteVorTagen)}, vermutlich beendet`;
    else if (anzahl === 1) hinweis = "Bisher nur einmal abgebucht, Intervall noch unsicher";
    else if (!regelmaessig) hinweis = "Unregelmäßige Abstände, Intervall bitte prüfen";

    const referenzen: Referenz[] = g.rows
      .map((r) => ({ datum: r.datum, betrag: r.betrag, text: r.text.trim() }))
      .sort((a, b) => (a.datum < b.datum ? 1 : a.datum > b.datum ? -1 : 0));

    treffer.push({
      id: `tr-${n++}`,
      tool: g.name,
      initial: (g.name.trim()[0] ?? "?").toUpperCase(),
      farbe: KATEGORIE_FARBEN[kategorie] ?? "#6C5CE7",
      buchungstext: g.raw,
      betrag,
      intervall,
      letzteAbbuchung: letzte,
      naechsteAbbuchung: naechstesDatum(letzte, intervall),
      kategorie,
      konfidenz,
      anzahl,
      aktiv,
      hinweis,
      referenzen,
    });
  }

  // Sortierung: hoch zuerst, dann mittel, dann Dubletten; innerhalb nach Betrag.
  const rang: Record<Konfidenz, number> = { hoch: 0, mittel: 1, dublette: 2 };
  return treffer.sort((a, b) => rang[a.konfidenz] - rang[b.konfidenz] || b.betrag - a.betrag);
}
