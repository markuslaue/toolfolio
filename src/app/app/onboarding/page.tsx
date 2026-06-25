import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { OnboardingWizard } from "@/components/app/onboarding-wizard";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Einrichten" };

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, onboarded_at")
    .eq("id", user.id)
    .single();

  // Schon abgeschlossen -> kein erneutes Onboarding.
  if (profile?.onboarded_at) redirect("/app");

  return <OnboardingWizard vorname={profile?.first_name ?? undefined} />;
}
