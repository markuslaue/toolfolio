/** B-08: Kunden (Agentur-Layer). */

export const KUNDE_STATUS = ["aktiv", "inaktiv", "archiviert"] as const;
export type KundeStatus = (typeof KUNDE_STATUS)[number];

export const KUNDE_STATUS_LABEL: Record<KundeStatus, string> = {
  aktiv: "Aktiv",
  inaktiv: "Inaktiv",
  archiviert: "Archiviert",
};

export const KUNDE_FARBEN = [
  "#6C5CE7",
  "#12B76A",
  "#FF7A66",
  "#F5A623",
  "#3A57E8",
  "#0EA371",
  "#cc785c",
  "#0e7ec6",
];

export interface Kunde {
  id: string;
  name: string;
  ansprechpartner: string | null;
  email: string | null;
  farbe: string;
  status: KundeStatus;
  weiterverrechnet: boolean;
  aufschlag_prozent: number | null;
  notizen: string | null;
}

/** Kunde mit aus den Abos abgeleiteten Kennzahlen. */
export interface KundeMitStats extends Kunde {
  tools: number;
  kostenMonat: number;
}

export function kundeInitial(name: string): string {
  const teile = name.trim().split(/\s+/).filter(Boolean);
  const buchstaben = teile.length >= 2 ? teile[0][0] + teile[1][0] : (name.trim()[0] ?? "?");
  return buchstaben.toUpperCase();
}
