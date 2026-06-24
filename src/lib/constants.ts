/**
 * Zentrale Geschaeftskonstanten.
 * ACHTUNG: Preise und Grenzwerte sind PLATZHALTER-HYPOTHESEN und muessen vor
 * Livegang validiert werden. Hier an einer Stelle aendern (Pricing M-02,
 * Plan & Abrechnung B-29 und Self-Listing greifen darauf zu).
 */

export const TRIAL_DAYS = 14; // Voller Agentur-Zugang, ohne Kreditkarte, kein Auto-Wechsel
export const YEARLY_DISCOUNT = 0.2; // ca. 20 Prozent Jahresrabatt
export const FREE_ABO_LIMIT = 15; // Free: bis 15 Abos, Benchmark nur als Teaser
export const INDIE_LISTING_FEE_EUR = 49; // einmalig, verifizierter Badge

export type PlanId = "free" | "pro" | "agentur";

export interface Plan {
  id: PlanId;
  name: string;
  /** Monatspreis in Euro (Platzhalter). null = individuell/kostenlos. */
  monthlyEur: number;
  zielgruppe: string;
}

export const PLANS: Record<PlanId, Plan> = {
  free: { id: "free", name: "Free", monthlyEur: 0, zielgruppe: "Solo und Einsteiger" },
  pro: { id: "pro", name: "Pro", monthlyEur: 14, zielgruppe: "Solopreneure und Freelancer" },
  agentur: { id: "agentur", name: "Agentur", monthlyEur: 79, zielgruppe: "Agenturen" },
};

/** Betrag im deutschen Format, z. B. 1.249,00 EUR */
export function formatEur(value: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}
