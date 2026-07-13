import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PlanClient, type Billing } from "@/components/app/plan-client";
import { createClient } from "@/lib/supabase/server";
import type { PlanId } from "@/lib/constants";

export const metadata: Metadata = { title: "Plan & Abrechnung" };

export default async function Page({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data } = await supabase
    .from("profiles")
    .select("plan, subscription_status, plan_intervall, current_period_end, cancel_at_period_end, stripe_customer_id, is_staff")
    .eq("id", user.id)
    .maybeSingle();

  const billing: Billing = {
    plan: (data?.plan as PlanId) ?? "free",
    subscription_status: data?.subscription_status ?? null,
    plan_intervall: (data?.plan_intervall as "month" | "year" | null) ?? null,
    current_period_end: data?.current_period_end ?? null,
    cancel_at_period_end: data?.cancel_at_period_end ?? false,
    hat_kunde: Boolean(data?.stripe_customer_id),
    // Inhaber-/Superadmin-Konto: voller Umfang, dauerhaft kostenlos, keine Abrechnung.
    superadmin: Boolean(data?.is_staff),
  };

  return <PlanClient billing={billing} status={status} />;
}
