/**
 * Zentrale Geschaeftskonstanten.
 * ACHTUNG: Preise und Grenzwerte sind PLATZHALTER-HYPOTHESEN und muessen vor
 * Livegang validiert werden. Hier an einer Stelle aendern (Pricing M-02,
 * Plan & Abrechnung B-29 und Self-Listing greifen darauf zu).
 */

export const TRIAL_DAYS = 14; // Voller Agentur-Zugang, ohne Kreditkarte, kein Auto-Wechsel
export const YEARLY_DISCOUNT = 0.2; // ca. 20 Prozent, nur fuers Anzeige-Badge; echte Jahrespreise stehen explizit in PLANS
export const FREE_ABO_LIMIT = 15; // Free: bis 15 Abos, Benchmark nur als Teaser
export const INDIE_LISTING_FEE_EUR = 49; // einmalig, verifizierter Badge

export type PlanId = "free" | "pro" | "agentur";
export type Abrechnung = "monat" | "jahr";

export interface Plan {
  id: PlanId;
  name: string;
  /** Monatspreis in Euro bei monatlicher Zahlung. */
  monthlyEur: number;
  /** Preis pro Monat bei jaehrlicher Zahlung (0 = Free). Bewusst explizit (runde Endpreise), nicht monthlyEur * 0,8. */
  yearlyMonthlyEur: number;
  /** Inkludierte Nutzer, als Anzeige-Label. */
  nutzer: string;
  zielgruppe: string;
}

/**
 * EINZIGE Quelle der Wahrheit fuer die Tarifpreise. Marketing-Pricing (M-02),
 * Plan & Abrechnung (B-29, Anzeige) und das Stripe-Setup-Skript leiten hieraus ab.
 * ACHTUNG: Die tatsaechlich abgerechneten Betraege liegen als Stripe-Price-Objekte
 * vor (Env STRIPE_PRICE_*). Nach JEDER Preisaenderung `scripts/stripe-setup.mjs`
 * neu laufen lassen, damit Stripe die neuen Betraege bekommt (siehe Skript-Kopf).
 */
export const PLANS: Record<PlanId, Plan> = {
  free: { id: "free", name: "Free", monthlyEur: 0, yearlyMonthlyEur: 0, nutzer: "1", zielgruppe: "Solo und Einsteiger" },
  pro: { id: "pro", name: "Pro", monthlyEur: 14, yearlyMonthlyEur: 11, nutzer: "1", zielgruppe: "Solopreneure und Freelancer" },
  agentur: { id: "agentur", name: "Agentur", monthlyEur: 69, yearlyMonthlyEur: 55, nutzer: "Mehrere", zielgruppe: "Agenturen und Teams" },
};

/** Monatsbetrag je Tarif und Abrechnungszyklus (jaehrlich = guenstigerer Monatswert). */
export function planMonatsbetrag(plan: PlanId, cadence: Abrechnung): number {
  return cadence === "jahr" ? PLANS[plan].yearlyMonthlyEur : PLANS[plan].monthlyEur;
}

/** Gesamtbetrag pro Jahr bei jaehrlicher Zahlung. */
export function planJahresbetrag(plan: PlanId): number {
  return Math.round(PLANS[plan].yearlyMonthlyEur * 12 * 100) / 100;
}

/** Betrag im deutschen Format, z. B. 1.249,00 EUR */
export function formatEur(value: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}
