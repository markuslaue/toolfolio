/**
 * Geschaeftskonstanten und Typen rund um Abos (B-05).
 * Kategorien sind eine feste Taxonomie; Farben gespiegelt aus dem Design.
 */

export const KATEGORIEN = [
  "Design",
  "SEO",
  "Kommunikation",
  "KI / API",
  "Entwicklung",
  "Produktivität",
  "eCommerce",
] as const;
export type Kategorie = (typeof KATEGORIEN)[number];

export const KATEGORIE_FARBEN: Record<string, string> = {
  Design: "#E84393",
  SEO: "#12B76A",
  "KI / API": "#6C5CE7",
  Kommunikation: "#3B82F6",
  Entwicklung: "#0FB5BA",
  Produktivität: "#F5A623",
  eCommerce: "#FB923C",
};

export const INTERVALLE = ["monatlich", "quartalsweise", "jaehrlich"] as const;
export type Intervall = (typeof INTERVALLE)[number];

export const INTERVALL_LABEL: Record<Intervall, string> = {
  monatlich: "monatlich",
  quartalsweise: "quartalsweise",
  jaehrlich: "jährlich",
};

export const STATUS_OPTIONEN = [
  "aktiv",
  "Trial",
  "pausiert",
  "gekuendigt",
  "archiviert",
] as const;
export type AboStatus = (typeof STATUS_OPTIONEN)[number];

export const STATUS_LABEL: Record<AboStatus, string> = {
  aktiv: "aktiv",
  Trial: "Trial",
  pausiert: "pausiert",
  gekuendigt: "gekündigt",
  archiviert: "archiviert",
};

export const STATUS_FARBEN: Record<AboStatus, { bg: string; dot: string; text: string }> = {
  aktiv: { bg: "#E7F8EF", dot: "#12B76A", text: "#0B6B40" },
  Trial: { bg: "#FEF3DA", dot: "#F5A623", text: "#8A5A0B" },
  pausiert: { bg: "#F0EEF6", dot: "#6B6779", text: "#3D3A4D" },
  gekuendigt: { bg: "#FCE7E3", dot: "#F0533D", text: "#8E2A1B" },
  archiviert: { bg: "#ECE6DA", dot: "#6B6779", text: "#3D3A4D" },
};

export const FRIST_EINHEITEN = ["Tage", "Wochen", "Monate"] as const;
export type FristEinheit = (typeof FRIST_EINHEITEN)[number];

export const WAEHRUNGEN = ["EUR", "USD"] as const;
export type Waehrung = (typeof WAEHRUNGEN)[number];

/** Eine Abo-Zeile, wie sie aus der DB kommt. */
export interface Abo {
  id: string;
  tool: string;
  anbieter: string | null;
  initial: string | null;
  farbe: string | null;
  kategorie: string;
  mit_verzeichnis: boolean;
  kosten: number;
  waehrung: Waehrung;
  intervall: Intervall;
  naechste_abbuchung: string | null;
  zahlungskanal: string | null;
  kunde: string | null;
  status: AboStatus;
  tags: string[];
  weiterverrechnen: boolean;
  aufschlag_prozent: number | null;
  abo_seit: string | null;
  auto_verlaengerung: boolean;
  frist_wert: number | null;
  frist_einheit: FristEinheit | null;
  letzter_kuendigungstermin: string | null;
  erinnerung: boolean;
  trial_endet: string | null;
  notizen: string | null;
  konto_email: string | null;
  login_verweis: string | null;
}

/** Kosten auf einen Monat normalisiert (fuer Summen/Vergleiche). */
export function monatlich(kosten: number, intervall: Intervall): number {
  if (intervall === "monatlich") return kosten;
  if (intervall === "jaehrlich") return kosten / 12;
  return kosten / 3; // quartalsweise
}

/** Initiale aus einem Toolnamen ableiten. */
export function toolInitial(tool: string): string {
  return (tool.trim()[0] ?? "?").toUpperCase();
}
