import "server-only";
import Stripe from "stripe";
import type { PlanId } from "@/lib/constants";

/**
 * Serverseitiger Stripe-Client, lazy. NICHT auf Modulebene konstruieren:
 * zur Build-Zeit fehlt das Secret (env_file gilt nur zur Laufzeit) und der
 * Konstruktor wuerfe sonst beim Sammeln der Seitendaten. Secret nie an den Client geben.
 */
let _stripe: Stripe | null = null;
export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY ist nicht gesetzt.");
    _stripe = new Stripe(key);
  }
  return _stripe;
}

export type Intervall = "month" | "year";
export type BezahlPlan = Exclude<PlanId, "free">; // pro | agentur | unternehmen

export const BEZAHL_PLAENE: BezahlPlan[] = ["pro", "agentur", "unternehmen"];

/** Basis-Price-IDs aus der Env (vom Setup-Skript befuellt). */
export const PRICE_IDS: Record<BezahlPlan, Record<Intervall, string | undefined>> = {
  pro: {
    month: process.env.STRIPE_PRICE_PRO_MONTH,
    year: process.env.STRIPE_PRICE_PRO_YEAR,
  },
  agentur: {
    month: process.env.STRIPE_PRICE_AGENTUR_MONTH,
    year: process.env.STRIPE_PRICE_AGENTUR_YEAR,
  },
  unternehmen: {
    month: process.env.STRIPE_PRICE_UNTERNEHMEN_MONTH,
    year: process.env.STRIPE_PRICE_UNTERNEHMEN_YEAR,
  },
};

/** Pro-Nutzer-Price-IDs (Menge = zusaetzliche Seats ueber dem Inklusiv-Kontingent). */
export const SEAT_PRICE_IDS: Record<BezahlPlan, Record<Intervall, string | undefined>> = {
  pro: { month: process.env.STRIPE_PRICE_PRO_SEAT_MONTH, year: process.env.STRIPE_PRICE_PRO_SEAT_YEAR },
  agentur: { month: process.env.STRIPE_PRICE_AGENTUR_SEAT_MONTH, year: process.env.STRIPE_PRICE_AGENTUR_SEAT_YEAR },
  unternehmen: { month: process.env.STRIPE_PRICE_UNTERNEHMEN_SEAT_MONTH, year: process.env.STRIPE_PRICE_UNTERNEHMEN_SEAT_YEAR },
};

/** Pro-Tool-Block-Price-IDs (Menge = zusaetzliche Bloecke ueber dem Inklusiv-Kontingent). */
export const TOOLBLOCK_PRICE_IDS: Record<BezahlPlan, Record<Intervall, string | undefined>> = {
  pro: { month: process.env.STRIPE_PRICE_PRO_TOOLBLOCK_MONTH, year: process.env.STRIPE_PRICE_PRO_TOOLBLOCK_YEAR },
  agentur: { month: process.env.STRIPE_PRICE_AGENTUR_TOOLBLOCK_MONTH, year: process.env.STRIPE_PRICE_AGENTUR_TOOLBLOCK_YEAR },
  unternehmen: { month: undefined, year: undefined }, // Unternehmen: Tools unbegrenzt, kein Tool-Block
};

/** Umkehrung: aus einer Basis-Price-ID Plan und Intervall ableiten (fuer den Webhook). */
export function planVonPrice(priceId: string | null | undefined): { plan: BezahlPlan; intervall: Intervall } | null {
  if (!priceId) return null;
  for (const plan of BEZAHL_PLAENE) {
    for (const intervall of ["month", "year"] as Intervall[]) {
      if (PRICE_IDS[plan][intervall] === priceId) return { plan, intervall };
    }
  }
  return null;
}
