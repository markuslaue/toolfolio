import "server-only";
import Stripe from "stripe";
import type { PlanId } from "@/lib/constants";

/** Serverseitiger Stripe-Client. Secret nie an den Client geben. */
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "");

export type Intervall = "month" | "year";
export type BezahlPlan = Exclude<PlanId, "free">; // pro | agentur

/** Price-IDs aus der Env (vom Setup-Skript befuellt). */
export const PRICE_IDS: Record<BezahlPlan, Record<Intervall, string | undefined>> = {
  pro: {
    month: process.env.STRIPE_PRICE_PRO_MONTH,
    year: process.env.STRIPE_PRICE_PRO_YEAR,
  },
  agentur: {
    month: process.env.STRIPE_PRICE_AGENTUR_MONTH,
    year: process.env.STRIPE_PRICE_AGENTUR_YEAR,
  },
};

/** Umkehrung: aus einer Price-ID Plan und Intervall ableiten (fuer den Webhook). */
export function planVonPrice(priceId: string | null | undefined): { plan: BezahlPlan; intervall: Intervall } | null {
  if (!priceId) return null;
  for (const plan of ["pro", "agentur"] as BezahlPlan[]) {
    for (const intervall of ["month", "year"] as Intervall[]) {
      if (PRICE_IDS[plan][intervall] === priceId) return { plan, intervall };
    }
  }
  return null;
}
