import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AiCreditsClient } from "@/components/app/ai-credits-client";
import { createClient } from "@/lib/supabase/server";
import { berechneAiCredits, type AiService, type AiSpendRow } from "@/lib/ai-credits";

export const metadata: Metadata = { title: "AI-Credits" };

export default async function Page() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: services }, { data: spend }] = await Promise.all([
    supabase.from("ai_services").select("id, name, farbe, budget_monat").eq("user_id", user.id).order("created_at"),
    supabase.from("ai_spend").select("service_id, jahr, monat, betrag").eq("user_id", user.id),
  ]);

  const heute = new Date();
  const { daten, gesamtMonat, gesamtVormonat } = berechneAiCredits(
    (services as AiService[]) ?? [],
    (spend as AiSpendRow[]) ?? [],
    heute,
  );

  return (
    <AiCreditsClient
      daten={daten}
      gesamtMonat={gesamtMonat}
      gesamtVormonat={gesamtVormonat}
      jahr={heute.getFullYear()}
      monat={heute.getMonth() + 1}
    />
  );
}
