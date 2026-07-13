"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe, PRICE_IDS, SEAT_PRICE_IDS, TOOLBLOCK_PRICE_IDS, type BezahlPlan, type Intervall } from "@/lib/stripe";
import { extraNutzer, extraToolBloecke, PLANS } from "@/lib/constants";

type Result = { url?: string; error?: string };

type LineItem = { price: string; quantity: number };

function siteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

/** Stripe-Customer fuer den Nutzer holen oder anlegen (ID am Profil ablegen). */
async function ensureCustomer(userId: string, email: string | undefined, vorhandene: string | null): Promise<string> {
  if (vorhandene) return vorhandene;
  const customer = await getStripe().customers.create({
    email,
    metadata: { user_id: userId },
  });
  const admin = createAdminClient();
  await admin.from("profiles").update({ stripe_customer_id: customer.id }).eq("id", userId);
  return customer.id;
}

/**
 * Checkout-Session fuer den gewaehlten Plan starten, mit mengenbasierter
 * Abrechnung: Basis + zusaetzliche Nutzer (Seats) + zusaetzliche Tool-Bloecke.
 */
export async function createCheckout(
  plan: BezahlPlan,
  intervall: Intervall,
  nutzer = PLANS[plan].inklNutzer,
  tools = PLANS[plan].inklTools ?? 0,
): Promise<Result> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Bitte melde dich erneut an." };

  // Eingaben robust begrenzen (UI sendet Slider-Werte, hier serverseitig absichern).
  const nutzerN = Math.max(1, Math.min(1000, Math.round(Number(nutzer) || PLANS[plan].inklNutzer)));
  const toolsN = Math.max(0, Math.min(10000, Math.round(Number(tools) || 0)));

  const basis = PRICE_IDS[plan]?.[intervall];
  if (!basis) return { error: "Dieser Plan ist gerade nicht buchbar." };

  const items: LineItem[] = [{ price: basis, quantity: 1 }];

  // Zusaetzliche Nutzer ueber dem Inklusiv-Kontingent.
  const seats = extraNutzer(plan, nutzerN);
  const seatPrice = SEAT_PRICE_IDS[plan]?.[intervall];
  if (seats > 0 && seatPrice) items.push({ price: seatPrice, quantity: seats });

  // Zusaetzliche Tool-Bloecke ueber dem Inklusiv-Kontingent.
  const bloecke = extraToolBloecke(plan, toolsN);
  const toolPrice = TOOLBLOCK_PRICE_IDS[plan]?.[intervall];
  if (bloecke > 0 && toolPrice) items.push({ price: toolPrice, quantity: bloecke });

  const { data: profil } = await supabase
    .from("profiles")
    .select("stripe_customer_id, is_staff")
    .eq("id", user.id)
    .maybeSingle();

  // Inhaber-/Superadmin-Konten sind dauerhaft kostenlos und haben bewusst KEINE
  // Zahlungsanbindung. Serverseitig hart abweisen, nicht nur im UI ausblenden.
  if (profil?.is_staff) {
    return { error: "Superadmin-Konten haben bereits vollen Zugriff und benötigen keinen Plan." };
  }

  const customer = await ensureCustomer(user.id, user.email, profil?.stripe_customer_id ?? null);

  const session = await getStripe().checkout.sessions.create({
    mode: "subscription",
    customer,
    line_items: items,
    client_reference_id: user.id,
    subscription_data: { metadata: { user_id: user.id, plan, nutzer: String(nutzerN), tools: String(toolsN) } },
    allow_promotion_codes: true,
    billing_address_collection: "required",
    automatic_tax: { enabled: true },
    customer_update: { address: "auto" },
    success_url: `${siteUrl()}/app/einstellungen/plan?status=erfolg`,
    cancel_url: `${siteUrl()}/app/einstellungen/plan?status=abbruch`,
  });

  if (!session.url) return { error: "Checkout konnte nicht gestartet werden." };
  return { url: session.url };
}

/** Stripe-Kundenportal oeffnen (Plan wechseln, kuendigen, Rechnungen). */
export async function openPortal(): Promise<Result> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Bitte melde dich erneut an." };

  const { data: profil } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .maybeSingle();

  if (!profil?.stripe_customer_id) return { error: "Noch kein Abo vorhanden." };

  const session = await getStripe().billingPortal.sessions.create({
    customer: profil.stripe_customer_id,
    return_url: `${siteUrl()}/app/einstellungen/plan`,
  });
  return { url: session.url };
}
