"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { stripe, PRICE_IDS, type BezahlPlan, type Intervall } from "@/lib/stripe";

type Result = { url?: string; error?: string };

function siteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

/** Stripe-Customer fuer den Nutzer holen oder anlegen (ID am Profil ablegen). */
async function ensureCustomer(userId: string, email: string | undefined, vorhandene: string | null): Promise<string> {
  if (vorhandene) return vorhandene;
  const customer = await stripe.customers.create({
    email,
    metadata: { user_id: userId },
  });
  const admin = createAdminClient();
  await admin.from("profiles").update({ stripe_customer_id: customer.id }).eq("id", userId);
  return customer.id;
}

/** Checkout-Session fuer den gewaehlten Plan starten. */
export async function createCheckout(plan: BezahlPlan, intervall: Intervall): Promise<Result> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Bitte melde dich erneut an." };

  const price = PRICE_IDS[plan]?.[intervall];
  if (!price) return { error: "Dieser Plan ist gerade nicht buchbar." };

  const { data: profil } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .maybeSingle();

  const customer = await ensureCustomer(user.id, user.email, profil?.stripe_customer_id ?? null);

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer,
    line_items: [{ price, quantity: 1 }],
    client_reference_id: user.id,
    subscription_data: { metadata: { user_id: user.id } },
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

  const session = await stripe.billingPortal.sessions.create({
    customer: profil.stripe_customer_id,
    return_url: `${siteUrl()}/app/einstellungen/plan`,
  });
  return { url: session.url };
}
