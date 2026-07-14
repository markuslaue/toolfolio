import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { OnboardingWizard } from "@/components/app/onboarding-wizard";
import { createClient } from "@/lib/supabase/server";
import { getActiveAccount } from "@/lib/active-account";

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

  const account = await getActiveAccount(supabase, user.id);

  // Der Import-Schritt braucht die bestehenden Kanaele (zum Zuordnen) und die schon
  // erfassten Tools (um Dubletten zu erkennen). Beim allerersten Onboarding sind
  // beide leer, aber der Import legt sonst spaeter alles doppelt an.
  const [{ data: kanaele }, { data: abos }] = await Promise.all([
    supabase.from("zahlungskanaele").select("bezeichnung").eq("user_id", account).eq("aktiv", true),
    supabase.from("abos").select("tool").eq("user_id", account),
  ]);

  return (
    <OnboardingWizard
      vorname={profile?.first_name ?? undefined}
      kanalOptionen={(kanaele ?? []).map((k) => k.bezeichnung as string)}
      existingTools={(abos ?? []).map((a) => a.tool as string)}
    />
  );
}
