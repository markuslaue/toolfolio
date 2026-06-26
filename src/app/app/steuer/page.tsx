import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SteuerClient, type AboPosten, type AiPosten } from "@/components/app/steuer-client";
import { createClient } from "@/lib/supabase/server";
import { monatlich, type Abo } from "@/lib/abos";
import type { AiService, AiSpendRow } from "@/lib/ai-credits";

export const metadata: Metadata = { title: "Steuer-Export" };

export default async function Page() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: abos }, { data: services }, { data: spend }] = await Promise.all([
    supabase.from("abos").select("*").eq("user_id", user.id),
    supabase.from("ai_services").select("id, name, farbe, budget_monat").eq("user_id", user.id),
    supabase.from("ai_spend").select("service_id, jahr, monat, betrag").eq("user_id", user.id),
  ]);

  const aboPosten: AboPosten[] = ((abos as Abo[]) ?? [])
    .filter((a) => a.status === "aktiv" || a.status === "Trial")
    .map((a) => ({
      id: a.id,
      tool: a.tool,
      anbieter: a.anbieter ?? a.tool,
      kategorie: a.kategorie,
      kanal: a.zahlungskanal ?? "",
      kunde: a.kunde ?? null,
      betragMonat: Math.round(monatlich(a.kosten, a.intervall) * 100) / 100,
    }));

  const serviceName = new Map(((services as AiService[]) ?? []).map((s) => [s.id, s.name]));
  const aiPosten: AiPosten[] = ((spend as AiSpendRow[]) ?? []).map((r, i) => ({
    id: `ai-${i}`,
    tool: serviceName.get(r.service_id) ?? "KI-Dienst",
    kategorie: "AI",
    jahr: r.jahr,
    monat: r.monat,
    betrag: Number(r.betrag),
  }));

  return <SteuerClient aboPosten={aboPosten} aiPosten={aiPosten} jahr={new Date().getFullYear()} />;
}
