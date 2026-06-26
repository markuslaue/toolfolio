import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe, planVonPrice } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

/** Subscription-Zustand auf das Profil schreiben (nur Referenzen). */
async function applySubscription(sub: Stripe.Subscription) {
  const admin = createAdminClient();
  const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;

  // Nutzer per Metadaten, sonst per Customer-ID finden.
  let userId = sub.metadata?.user_id as string | undefined;
  if (!userId) {
    const { data } = await admin.from("profiles").select("id").eq("stripe_customer_id", customerId).maybeSingle();
    userId = data?.id;
  }
  if (!userId) return;

  const priceId = sub.items.data[0]?.price?.id;
  const map = planVonPrice(priceId);
  const aktiv = sub.status === "active" || sub.status === "trialing" || sub.status === "past_due";

  const periodEnd = sub.items.data[0]?.current_period_end ?? null;

  await admin
    .from("profiles")
    .update({
      plan: aktiv && map ? map.plan : "free",
      plan_intervall: aktiv && map ? map.intervall : null,
      stripe_customer_id: customerId,
      stripe_subscription_id: sub.id,
      subscription_status: sub.status,
      current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
      cancel_at_period_end: sub.cancel_at_period_end ?? false,
    })
    .eq("id", userId);
}

async function clearSubscription(sub: Stripe.Subscription) {
  const admin = createAdminClient();
  const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
  await admin
    .from("profiles")
    .update({
      plan: "free",
      plan_intervall: null,
      subscription_status: "canceled",
      cancel_at_period_end: false,
    })
    .eq("stripe_customer_id", customerId);
}

export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const sig = req.headers.get("stripe-signature");
  if (!secret || !sig) return NextResponse.json({ error: "nicht konfiguriert" }, { status: 400 });

  const body = await req.text();
  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, sig, secret);
  } catch {
    return NextResponse.json({ error: "Signatur ungueltig" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.subscription) {
          const sub = await getStripe().subscriptions.retrieve(session.subscription as string);
          if (session.metadata?.user_id && !sub.metadata?.user_id) {
            sub.metadata = { ...sub.metadata, user_id: session.metadata.user_id };
          }
          await applySubscription(sub);
        }
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
        await applySubscription(event.data.object as Stripe.Subscription);
        break;
      case "customer.subscription.deleted":
        await clearSubscription(event.data.object as Stripe.Subscription);
        break;
    }
  } catch (e) {
    console.error("Stripe-Webhook-Fehler:", e);
    return NextResponse.json({ error: "Verarbeitung fehlgeschlagen" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
