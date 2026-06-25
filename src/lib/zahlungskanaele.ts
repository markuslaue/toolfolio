/** B-07: Zahlungskanaele. Nur Referenzen, niemals vollstaendige Nummern/IBAN. */

export const KANAL_TYPEN = [
  "kreditkarte",
  "sepa",
  "paypal",
  "stripe",
  "paysafe",
  "anderes",
] as const;
export type KanalTyp = (typeof KANAL_TYPEN)[number];

export const KANAL_TYP_LABEL: Record<KanalTyp, string> = {
  kreditkarte: "Kreditkarte",
  sepa: "SEPA-Lastschrift",
  paypal: "PayPal",
  stripe: "Stripe-Guthaben",
  paysafe: "Paysafe",
  anderes: "Anderes",
};

export interface Zahlungskanal {
  id: string;
  typ: KanalTyp;
  bezeichnung: string;
  anbieter: string | null;
  last4: string | null;
  iban_last4: string | null;
  ablauf_monat: number | null;
  ablauf_jahr: number | null;
  inhaber: string | null;
  aktiv: boolean;
}

export type KanalStatus = "aktiv" | "laeuft-ab" | "abgelaufen" | "inaktiv";

/** Anzeigename wie im Tracker, z. B. "Visa •••• 4821". */
export function kanalLabel(k: Zahlungskanal): string {
  if (k.typ === "kreditkarte" && k.last4) {
    return `${k.anbieter ?? "Karte"} •••• ${k.last4}`;
  }
  if (k.typ === "sepa" && k.iban_last4) return `SEPA •••• ${k.iban_last4}`;
  return k.bezeichnung;
}

/** Status aus Ablauf ableiten (nur Kreditkarte hat Ablauf). */
export function kanalStatus(k: Zahlungskanal): KanalStatus {
  if (!k.aktiv) return "inaktiv";
  if (k.typ === "kreditkarte" && k.ablauf_monat && k.ablauf_jahr) {
    const heute = new Date();
    // Letzter gueltiger Tag = Ende des Ablaufmonats.
    const ablauf = new Date(k.ablauf_jahr, k.ablauf_monat, 0);
    const inZweiMonaten = new Date(heute.getFullYear(), heute.getMonth() + 2, heute.getDate());
    if (ablauf < heute) return "abgelaufen";
    if (ablauf <= inZweiMonaten) return "laeuft-ab";
  }
  return "aktiv";
}

export const KANAL_STATUS_LABEL: Record<KanalStatus, string> = {
  aktiv: "Aktiv",
  "laeuft-ab": "Läuft bald ab",
  abgelaufen: "Abgelaufen",
  inaktiv: "Inaktiv",
};
