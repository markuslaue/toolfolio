export type Interval = "monatlich" | "jährlich" | "quartalsweise";
export type Status = "aktiv" | "Trial" | "pausiert";
export type Kategorie =
  | "Design"
  | "SEO"
  | "Kommunikation"
  | "KI / API"
  | "Entwicklung"
  | "Produktivität"
  | "eCommerce";

export type Zahlungskanal =
  | "Visa •••• 4821"
  | "Mastercard •••• 7093"
  | "SEPA-Lastschrift"
  | "PayPal"
  | "Stripe-Guthaben";

export type Kunde =
  | "Kunde Nordwerk"
  | "Kunde Holzbau Kessler"
  | "Kunde Solea"
  | "Intern / nicht zugeordnet";

export interface Abo {
  id: string;
  tool: string;
  initial: string;
  farbe: string;
  kategorie: Kategorie;
  kosten: number; // pro Intervall in EUR
  intervall: Interval;
  naechsteAbbuchung: string; // YYYY-MM-DD
  zahlungskanal: Zahlungskanal;
  kunde: Kunde;
  status: Status;
}

export const fmtEUR = (n: number) =>
  new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(n);

export const fmtDate = (iso: string) =>
  new Intl.DateTimeFormat("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" }).format(
    new Date(iso),
  );

export const abos: Abo[] = [
  { id: "1", tool: "Notion", initial: "N", farbe: "#0F1419", kategorie: "Produktivität", kosten: 96, intervall: "monatlich", naechsteAbbuchung: "2026-07-04", zahlungskanal: "Visa •••• 4821", kunde: "Intern / nicht zugeordnet", status: "aktiv" },
  { id: "2", tool: "Slack", initial: "S", farbe: "#611f69", kategorie: "Kommunikation", kosten: 78.5, intervall: "monatlich", naechsteAbbuchung: "2026-07-02", zahlungskanal: "Mastercard •••• 7093", kunde: "Intern / nicht zugeordnet", status: "aktiv" },
  { id: "3", tool: "Figma", initial: "F", farbe: "#a259ff", kategorie: "Design", kosten: 45, intervall: "monatlich", naechsteAbbuchung: "2026-07-08", zahlungskanal: "Visa •••• 4821", kunde: "Kunde Nordwerk", status: "aktiv" },
  { id: "4", tool: "Adobe Creative Cloud", initial: "A", farbe: "#d83b01", kategorie: "Design", kosten: 719.88, intervall: "jährlich", naechsteAbbuchung: "2026-11-12", zahlungskanal: "SEPA-Lastschrift", kunde: "Intern / nicht zugeordnet", status: "aktiv" },
  { id: "5", tool: "Ahrefs", initial: "A", farbe: "#0e7ec6", kategorie: "SEO", kosten: 199, intervall: "monatlich", naechsteAbbuchung: "2026-08-14", zahlungskanal: "Visa •••• 4821", kunde: "Kunde Holzbau Kessler", status: "aktiv" },
  { id: "6", tool: "Screaming Frog", initial: "S", farbe: "#0EA371", kategorie: "SEO", kosten: 239, intervall: "jährlich", naechsteAbbuchung: "2026-09-01", zahlungskanal: "PayPal", kunde: "Kunde Holzbau Kessler", status: "aktiv" },
  { id: "7", tool: "Lovable", initial: "L", farbe: "#3A57E8", kategorie: "Entwicklung", kosten: 89, intervall: "monatlich", naechsteAbbuchung: "2026-06-30", zahlungskanal: "Mastercard •••• 7093", kunde: "Intern / nicht zugeordnet", status: "aktiv" },
  { id: "8", tool: "Anthropic API", initial: "C", farbe: "#cc785c", kategorie: "KI / API", kosten: 312.4, intervall: "monatlich", naechsteAbbuchung: "2026-07-01", zahlungskanal: "Mastercard •••• 7093", kunde: "Kunde Solea", status: "aktiv" },
  { id: "9", tool: "OpenAI", initial: "O", farbe: "#10a37f", kategorie: "KI / API", kosten: 184.2, intervall: "monatlich", naechsteAbbuchung: "2026-07-01", zahlungskanal: "Visa •••• 4821", kunde: "Kunde Nordwerk", status: "aktiv" },
  { id: "10", tool: "Shopify", initial: "S", farbe: "#95bf47", kategorie: "eCommerce", kosten: 105, intervall: "monatlich", naechsteAbbuchung: "2026-07-10", zahlungskanal: "SEPA-Lastschrift", kunde: "Kunde Solea", status: "aktiv" },
  { id: "11", tool: "Make", initial: "M", farbe: "#6d00cc", kategorie: "Produktivität", kosten: 29, intervall: "monatlich", naechsteAbbuchung: "2026-07-05", zahlungskanal: "PayPal", kunde: "Intern / nicht zugeordnet", status: "aktiv" },
  { id: "12", tool: "ElevenLabs", initial: "E", farbe: "#0F1419", kategorie: "KI / API", kosten: 22, intervall: "monatlich", naechsteAbbuchung: "2026-07-03", zahlungskanal: "Mastercard •••• 7093", kunde: "Kunde Nordwerk", status: "aktiv" },
  { id: "13", tool: "Framer", initial: "F", farbe: "#0099ff", kategorie: "Design", kosten: 29, intervall: "monatlich", naechsteAbbuchung: "2026-06-25", zahlungskanal: "Visa •••• 4821", kunde: "Intern / nicht zugeordnet", status: "Trial" },
  { id: "14", tool: "Loom", initial: "L", farbe: "#625df5", kategorie: "Kommunikation", kosten: 15, intervall: "monatlich", naechsteAbbuchung: "2026-07-07", zahlungskanal: "PayPal", kunde: "Intern / nicht zugeordnet", status: "aktiv" },
  { id: "15", tool: "Google Workspace", initial: "G", farbe: "#4285f4", kategorie: "Produktivität", kosten: 138, intervall: "monatlich", naechsteAbbuchung: "2026-07-15", zahlungskanal: "SEPA-Lastschrift", kunde: "Intern / nicht zugeordnet", status: "aktiv" },
  { id: "16", tool: "Linear", initial: "L", farbe: "#5e6ad2", kategorie: "Entwicklung", kosten: 56, intervall: "monatlich", naechsteAbbuchung: "2026-07-09", zahlungskanal: "Mastercard •••• 7093", kunde: "Intern / nicht zugeordnet", status: "aktiv" },
  { id: "17", tool: "Vercel", initial: "V", farbe: "#0F1419", kategorie: "Entwicklung", kosten: 68, intervall: "monatlich", naechsteAbbuchung: "2026-07-11", zahlungskanal: "Visa •••• 4821", kunde: "Kunde Solea", status: "aktiv" },
  { id: "18", tool: "Canva Teams", initial: "C", farbe: "#00c4cc", kategorie: "Design", kosten: 109, intervall: "jährlich", naechsteAbbuchung: "2026-12-02", zahlungskanal: "PayPal", kunde: "Intern / nicht zugeordnet", status: "pausiert" },
];

// Aktions-Center
export interface Aktion {
  id: string;
  typ: "frist" | "trial" | "preis" | "zombie" | "spike";
  titel: string;
  beschreibung: string;
  button: string;
}

export const aktionen: Aktion[] = [
  { id: "a1", typ: "frist", titel: "Kündigungsfrist läuft ab", beschreibung: "Ahrefs kündbar bis 14.08., sonst Verlängerung um 12 Monate.", button: "Frist ansehen" },
  { id: "a2", typ: "trial", titel: "Trial kippt bald", beschreibung: "Framer-Test endet in 3 Tagen und wird kostenpflichtig (29,00 € / Monat).", button: "Entscheiden" },
  { id: "a3", typ: "preis", titel: "Preiserhöhung erkannt", beschreibung: "Notion hat den Preis um 18 % erhöht.", button: "Vergleichen" },
  { id: "a4", typ: "zombie", titel: "Zombie-Abo", beschreibung: "Loom läuft seit 5 Monaten ohne Nutzung.", button: "Prüfen" },
  { id: "a5", typ: "spike", titel: "AI-Spend-Spike", beschreibung: "Dein Anthropic-API-Spend ist diesen Monat 3,1x so hoch wie im Schnitt.", button: "Verlauf ansehen" },
];

// 12 Monate Kostenverlauf
export const verlauf12M = [
  { monat: "Jul", gesamt: 1980, fix: 1820, variabel: 160 },
  { monat: "Aug", gesamt: 2030, fix: 1840, variabel: 190 },
  { monat: "Sep", gesamt: 2110, fix: 1880, variabel: 230 },
  { monat: "Okt", gesamt: 2080, fix: 1880, variabel: 200 },
  { monat: "Nov", gesamt: 2240, fix: 1920, variabel: 320 },
  { monat: "Dez", gesamt: 2190, fix: 1920, variabel: 270 },
  { monat: "Jan", gesamt: 2320, fix: 1960, variabel: 360 },
  { monat: "Feb", gesamt: 2280, fix: 1960, variabel: 320 },
  { monat: "Mär", gesamt: 2410, fix: 2010, variabel: 400 },
  { monat: "Apr", gesamt: 2380, fix: 2010, variabel: 370 },
  { monat: "Mai", gesamt: 2540, fix: 2040, variabel: 500 },
  { monat: "Jun", gesamt: 2480, fix: 2040, variabel: 440 },
];

export const kostenNachKunde = [
  { name: "Kunde Nordwerk", wert: 458, farbe: "var(--color-primary)" },
  { name: "Kunde Holzbau Kessler", wert: 419, farbe: "var(--color-success)" },
  { name: "Kunde Solea", wert: 590, farbe: "var(--color-warning)" },
  { name: "Intern / nicht zugeordnet", wert: 1013, farbe: "var(--color-muted-foreground)" },
];

export const kostenNachKanal = [
  { name: "Visa •••• 4821", wert: 884, farbe: "var(--color-primary)" },
  { name: "Mastercard •••• 7093", wert: 562, farbe: "#7a5af8" },
  { name: "SEPA-Lastschrift", wert: 303, farbe: "var(--color-success)" },
  { name: "PayPal", wert: 53, farbe: "var(--color-warning)" },
  { name: "Stripe-Guthaben", wert: 24, farbe: "var(--color-muted-foreground)" },
];

export interface AiCredit {
  tool: string;
  verbrauch: number;
  trend: number[];
  hinweis?: string;
  hinweisTyp?: "warn" | "info" | "danger";
  autoRecharge?: boolean;
}

export const aiCredits: AiCredit[] = [
  { tool: "Anthropic API", verbrauch: 312.4, trend: [80, 95, 110, 90, 140, 220, 312], hinweis: "Spike erkannt", hinweisTyp: "danger", autoRecharge: true },
  { tool: "OpenAI", verbrauch: 184.2, trend: [120, 130, 145, 150, 170, 175, 184], autoRecharge: true },
  { tool: "Lovable Credits", verbrauch: 89, trend: [60, 70, 75, 80, 82, 88, 89] },
  { tool: "ElevenLabs", verbrauch: 22, trend: [18, 19, 20, 21, 22, 22, 22], hinweis: "12,00 € Guthaben verfallen ungenutzt", hinweisTyp: "warn" },
  { tool: "Replicate", verbrauch: 46.8, trend: [30, 32, 36, 40, 42, 44, 46], autoRecharge: false },
];

export const anstehendeAbbuchungen = [
  { datum: "2026-06-25", tool: "Framer", betrag: 29, kanal: "Visa •••• 4821" },
  { datum: "2026-06-30", tool: "Lovable", betrag: 89, kanal: "Mastercard •••• 7093" },
  { datum: "2026-07-01", tool: "Anthropic API", betrag: 312.4, kanal: "Mastercard •••• 7093" },
  { datum: "2026-07-01", tool: "OpenAI", betrag: 184.2, kanal: "Visa •••• 4821" },
  { datum: "2026-07-02", tool: "Slack", betrag: 78.5, kanal: "Mastercard •••• 7093" },
  { datum: "2026-07-03", tool: "ElevenLabs", betrag: 22, kanal: "Mastercard •••• 7093" },
  { datum: "2026-07-04", tool: "Notion", betrag: 96, kanal: "Visa •••• 4821" },
  { datum: "2026-07-05", tool: "Make", betrag: 29, kanal: "PayPal" },
  { datum: "2026-07-07", tool: "Loom", betrag: 15, kanal: "PayPal" },
  { datum: "2026-07-08", tool: "Figma", betrag: 45, kanal: "Visa •••• 4821" },
];

export const sparvorschlaege = [
  { id: "s1", titel: "Figma jährlich statt monatlich", text: "Stelle Figma von monatlich auf jährlich um und spare 144,00 € pro Jahr.", button: "Umstellen" },
  { id: "s2", titel: "Über Marktpreis", text: "Du zahlst 49,00 € für Linear. Vergleichbare Agenturen zahlen im Median 39,00 €.", button: "Tarife vergleichen" },
  { id: "s3", titel: "Redundante Tools", text: "Notion und Coda decken sich. Eines könntest du einsparen.", button: "Redundanz prüfen" },
];

// KPI Werte (abgeleitet aus Mock)
export const kpis = {
  monatlich: 2480,
  jaehrlich: 29760,
  vormonatProzent: 4.2,
  aktiveAbos: 17,
  trials: 3,
  pausiert: 2,
  sparpotenzialJahr: 1284,
  vorschlaege: 7,
};
