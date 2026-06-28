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

export type PlanId = "free" | "pro" | "agentur" | "unternehmen";
export type Abrechnung = "monat" | "jahr";

/** Zweistufiger Preis (monatlich / pro Monat bei jaehrlicher Zahlung). */
export interface PreisPaar {
  monat: number;
  jahr: number; // pro Monat bei jaehrlicher Zahlung
}

export interface Plan {
  id: PlanId;
  name: string;
  zielgruppe: string;
  /** Basispreis der Stufe (monatlich / jaehrlich-pro-Monat). */
  basis: PreisPaar;
  /** Im Basispreis enthaltene Nutzer (Seats). */
  inklNutzer: number;
  /** Im Basispreis enthaltene Tools. null = unbegrenzt. */
  inklTools: number | null;
  /** Aufpreis je zusaetzlichem Nutzer ueber dem Inklusiv-Kontingent. */
  proNutzer: PreisPaar;
  /** Blockgroesse fuer Tool-Aufpreise (z. B. je 25 Tools). 0 = kein Tool-Aufpreis. */
  toolBlock: number;
  /** Aufpreis je angefangenem zusaetzlichem Tool-Block. */
  proToolBlock: PreisPaar;
  /** Ob die Stufe per Slider (Nutzer/Tools) konfigurierbar und ueber Stripe-Menge abrechenbar ist. */
  konfigurierbar: boolean;
}

/**
 * EINZIGE Quelle der Wahrheit fuer die Tarife. Marketing-Pricing (M-02, Slider),
 * Plan & Abrechnung (B-29) und das Stripe-Setup-Skript leiten hieraus ab.
 *
 * Modell (Pricing v2): Basispreis je Stufe + Aufpreis pro zusaetzlichem Nutzer
 * + Aufpreis je zusaetzlichem Tool-Block. Zwei Slider (Nutzer, Tools) waehlen die
 * guenstigste passende Stufe; oberhalb Agentur greift "Unternehmen".
 *
 * ACHTUNG: Die tatsaechlich abgerechneten Betraege liegen als Stripe-Price-Objekte
 * vor (Env STRIPE_PRICE_*: je Stufe ein Basis-, ein Pro-Nutzer- und ein
 * Pro-Tool-Block-Preis, jeweils Monat/Jahr). Nach JEDER Preisaenderung
 * `scripts/stripe-setup.mjs` neu laufen lassen (siehe Skript-Kopf).
 */
export const PLANS: Record<PlanId, Plan> = {
  free: {
    id: "free", name: "Free", zielgruppe: "Solo und Einsteiger",
    basis: { monat: 0, jahr: 0 },
    inklNutzer: 1, inklTools: FREE_ABO_LIMIT,
    proNutzer: { monat: 0, jahr: 0 }, toolBlock: 0, proToolBlock: { monat: 0, jahr: 0 },
    konfigurierbar: false,
  },
  pro: {
    id: "pro", name: "Pro", zielgruppe: "Solopreneure und Freelancer",
    basis: { monat: 14, jahr: 11 },
    inklNutzer: 1, inklTools: 50,
    proNutzer: { monat: 9, jahr: 7 }, toolBlock: 25, proToolBlock: { monat: 4, jahr: 3 },
    konfigurierbar: true,
  },
  agentur: {
    id: "agentur", name: "Agentur", zielgruppe: "Agenturen und Teams",
    basis: { monat: 69, jahr: 55 },
    inklNutzer: 5, inklTools: 200,
    proNutzer: { monat: 12, jahr: 10 }, toolBlock: 50, proToolBlock: { monat: 6, jahr: 5 },
    konfigurierbar: true,
  },
  unternehmen: {
    id: "unternehmen", name: "Unternehmen", zielgruppe: "Grosse Teams und Konzerne",
    basis: { monat: 199, jahr: 159 },
    inklNutzer: 25, inklTools: null, // unbegrenzte Tools
    proNutzer: { monat: 9, jahr: 7 }, toolBlock: 0, proToolBlock: { monat: 0, jahr: 0 },
    konfigurierbar: true,
  },
};

/** Reihenfolge fuer die Anzeige. */
export const PLAN_ORDER: PlanId[] = ["free", "pro", "agentur", "unternehmen"];

function paar(p: PreisPaar, cadence: Abrechnung): number {
  return cadence === "jahr" ? p.jahr : p.monat;
}

/** Basis-Monatsbetrag einer Stufe (ohne Slider-Aufpreise). */
export function planMonatsbetrag(plan: PlanId, cadence: Abrechnung): number {
  return paar(PLANS[plan].basis, cadence);
}

/** Zusaetzliche Tool-Bloecke fuer eine gegebene Tool-Zahl. */
export function extraToolBloecke(plan: PlanId, tools: number): number {
  const p = PLANS[plan];
  if (p.inklTools === null || p.toolBlock <= 0) return 0;
  return Math.max(0, Math.ceil((tools - p.inklTools) / p.toolBlock));
}

/** Zusaetzliche Nutzer (Seats) ueber dem Inklusiv-Kontingent. */
export function extraNutzer(plan: PlanId, nutzer: number): number {
  return Math.max(0, nutzer - PLANS[plan].inklNutzer);
}

/**
 * Konfigurierter Monatsbetrag einer Stufe fuer (Nutzer, Tools).
 * = Basis + extraNutzer * proNutzer + extraBloecke * proToolBlock.
 */
export function planPreisProMonat(plan: PlanId, cadence: Abrechnung, nutzer: number, tools: number): number {
  const p = PLANS[plan];
  const basis = paar(p.basis, cadence);
  if (basis === 0 && !p.konfigurierbar) return 0; // Free
  const seats = extraNutzer(plan, nutzer) * paar(p.proNutzer, cadence);
  const bloecke = extraToolBloecke(plan, tools) * paar(p.proToolBlock, cadence);
  return Math.round((basis + seats + bloecke) * 100) / 100;
}

/** Gesamtbetrag pro Jahr bei jaehrlicher Zahlung (mit Slider-Werten). */
export function planJahresbetrag(plan: PlanId, nutzer: number, tools: number): number {
  return Math.round(planPreisProMonat(plan, "jahr", nutzer, tools) * 12 * 100) / 100;
}

/**
 * Empfohlene Stufe fuer (Nutzer, Tools): die guenstigste bezahlte Stufe, deren
 * Inklusiv-Kontingente die Slider-Werte ohne Aufpreis decken; deckt keine ab,
 * faellt die Empfehlung auf "unternehmen".
 */
export function empfohleneStufe(nutzer: number, tools: number): PlanId {
  for (const id of ["pro", "agentur", "unternehmen"] as PlanId[]) {
    const p = PLANS[id];
    const toolsOk = p.inklTools === null || tools <= p.inklTools;
    if (nutzer <= p.inklNutzer && toolsOk) return id;
  }
  return "unternehmen";
}

/** Betrag im deutschen Format, z. B. 1.249,00 EUR */
export function formatEur(value: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}
