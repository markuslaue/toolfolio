import type { Abo, Kategorie, Zahlungskanal, Kunde, Interval, Status } from "./toolfolio-data";
import { abos as baseAbos } from "./toolfolio-data";

export type Hinweis = "frist" | "spike" | "sparvorschlag" | "preiserhoehung" | "zombie";
export type ErweiterterStatus = Status | "gekündigt" | "archiviert";

export interface AboListItem extends Omit<Abo, "status"> {
  status: ErweiterterStatus;
  hinweise: Hinweis[];
  waehrung?: "USD";
}

const extra: AboListItem[] = [
  { id: "20", tool: "Sentry", initial: "S", farbe: "#362D59", kategorie: "Entwicklung", kosten: 26, intervall: "monatlich", naechsteAbbuchung: "2026-07-12", zahlungskanal: "Visa •••• 4821", kunde: "Intern / nicht zugeordnet", status: "aktiv", hinweise: [] },
  { id: "21", tool: "Cloudflare", initial: "C", farbe: "#F38020", kategorie: "Entwicklung", kosten: 20, intervall: "monatlich", naechsteAbbuchung: "2026-07-06", zahlungskanal: "Mastercard •••• 7093", kunde: "Kunde ZAQQ", status: "aktiv", hinweise: [] },
  { id: "22", tool: "Calendly", initial: "C", farbe: "#006BFF", kategorie: "Produktivität", kosten: 16, intervall: "monatlich", naechsteAbbuchung: "2026-07-18", zahlungskanal: "PayPal", kunde: "Intern / nicht zugeordnet", status: "aktiv", hinweise: ["zombie"] },
  { id: "23", tool: "Typeform", initial: "T", farbe: "#262627", kategorie: "Produktivität", kosten: 35, intervall: "monatlich", naechsteAbbuchung: "2026-07-22", zahlungskanal: "Visa •••• 4821", kunde: "Kunde Vitalplant", status: "aktiv", hinweise: [] },
  { id: "24", tool: "Zapier", initial: "Z", farbe: "#FF4F00", kategorie: "Produktivität", kosten: 49, intervall: "monatlich", naechsteAbbuchung: "2026-07-19", zahlungskanal: "Mastercard •••• 7093", kunde: "Intern / nicht zugeordnet", status: "aktiv", hinweise: ["sparvorschlag"] },
  { id: "25", tool: "HubSpot", initial: "H", farbe: "#FF7A59", kategorie: "Kommunikation", kosten: 450, intervall: "monatlich", naechsteAbbuchung: "2026-07-20", zahlungskanal: "SEPA-Lastschrift", kunde: "Kunde FULEX", status: "aktiv", hinweise: ["preiserhoehung"] },
  { id: "26", tool: "Mailchimp", initial: "M", farbe: "#FFE01B", kategorie: "Kommunikation", kosten: 69, intervall: "monatlich", naechsteAbbuchung: "2026-07-24", zahlungskanal: "PayPal", kunde: "Kunde Vitalplant", status: "Trial", hinweise: ["frist"] },
  { id: "27", tool: "Hotjar", initial: "H", farbe: "#FD3A5C", kategorie: "SEO", kosten: 39, intervall: "monatlich", naechsteAbbuchung: "2026-07-28", zahlungskanal: "Visa •••• 4821", kunde: "Kunde FULEX", status: "aktiv", hinweise: [] },
  { id: "28", tool: "1Password", initial: "1", farbe: "#0572EC", kategorie: "Produktivität", kosten: 95.88, intervall: "jährlich", naechsteAbbuchung: "2027-02-14", zahlungskanal: "Mastercard •••• 7093", kunde: "Intern / nicht zugeordnet", status: "aktiv", hinweise: [] },
  { id: "29", tool: "Webflow", initial: "W", farbe: "#146EF5", kategorie: "Design", kosten: 23, intervall: "monatlich", naechsteAbbuchung: "2026-07-16", zahlungskanal: "Visa •••• 4821", kunde: "Kunde ZAQQ", status: "gekündigt", hinweise: [] },
  { id: "30", tool: "Miro", initial: "M", farbe: "#FFD02F", kategorie: "Design", kosten: 12, intervall: "monatlich", naechsteAbbuchung: "2026-07-09", zahlungskanal: "PayPal", kunde: "Intern / nicht zugeordnet", status: "archiviert", hinweise: [] },
  { id: "31", tool: "Perplexity API", initial: "P", farbe: "#1FB8CD", kategorie: "KI / API", kosten: 58, intervall: "monatlich", naechsteAbbuchung: "2026-07-02", zahlungskanal: "Mastercard •••• 7093", kunde: "Kunde Vitalplant", status: "aktiv", hinweise: ["spike"], waehrung: "USD" },
];

// Add hinweise to base abos
const enriched: AboListItem[] = baseAbos.map((a): AboListItem => {
  const h: Hinweis[] = [];
  if (a.tool === "Ahrefs") h.push("frist");
  if (a.tool === "Framer") h.push("frist");
  if (a.tool === "Notion") h.push("preiserhoehung");
  if (a.tool === "Loom") h.push("zombie");
  if (a.tool === "Anthropic API") h.push("spike");
  if (a.tool === "Figma") h.push("sparvorschlag");
  if (a.tool === "Linear") h.push("sparvorschlag");
  return { ...a, hinweise: h, waehrung: a.tool === "Adobe Creative Cloud" ? "USD" : undefined };
});

export const alleAbos: AboListItem[] = [...enriched, ...extra];

export const kategorien: Kategorie[] = ["Design", "SEO", "Kommunikation", "KI / API", "Entwicklung", "Produktivität", "eCommerce"];
export const kunden: Kunde[] = ["Kunde Vitalplant", "Kunde FULEX", "Kunde ZAQQ", "Intern / nicht zugeordnet"];
export const kanaele: Zahlungskanal[] = ["Visa •••• 4821", "Mastercard •••• 7093", "SEPA-Lastschrift", "PayPal", "Stripe-Guthaben"];
export const intervalle: Interval[] = ["monatlich", "quartalsweise", "jährlich"];
export const statusOptionen: ErweiterterStatus[] = ["aktiv", "Trial", "pausiert", "gekündigt", "archiviert"];

export const kategorieFarben: Record<Kategorie, string> = {
  "Design": "#E84393",
  "SEO": "#12B76A",
  "KI / API": "#6C5CE7",
  "Kommunikation": "#3B82F6",
  "Entwicklung": "#0FB5BA",
  "Produktivität": "#F5A623",
  "eCommerce": "#FB923C",
};

export const statusFarben: Record<ErweiterterStatus, { bg: string; dot: string; text: string }> = {
  "aktiv": { bg: "#E7F8EF", dot: "#12B76A", text: "#0B6B40" },
  "Trial": { bg: "#FEF3DA", dot: "#F5A623", text: "#8A5A0B" },
  "pausiert": { bg: "#F0EEF6", dot: "#6B6779", text: "#3D3A4D" },
  "gekündigt": { bg: "#FCE7E3", dot: "#F0533D", text: "#8E2A1B" },
  "archiviert": { bg: "#ECE6DA", dot: "#6B6779", text: "#3D3A4D" },
};

// Monatlich normalisierte Kosten
export function monatlich(a: AboListItem): number {
  if (a.intervall === "monatlich") return a.kosten;
  if (a.intervall === "jährlich") return a.kosten / 12;
  return a.kosten / 3;
}
