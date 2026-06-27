import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { BudgetClient } from "@/components/app/budget-client";
import { createClient } from "@/lib/supabase/server";
import { getActiveAccount } from "@/lib/active-account";
import { berechneBudget } from "@/lib/budget";
import { berechneVorschlaege } from "@/lib/sparvorschlaege";
import type { Abo } from "@/lib/abos";
import type { AiSpendRow } from "@/lib/ai-credits";

export const metadata: Metadata = { title: "Budget & Forecast" };

export default async function Page() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const account = await getActiveAccount(supabase, user.id);

  const [{ data: abos }, { data: spend }, { data: profil }, { data: sparStatus }] = await Promise.all([
    supabase.from("abos").select("*").eq("user_id", account),
    supabase.from("ai_spend").select("service_id, jahr, monat, betrag").eq("user_id", account),
    supabase.from("profiles").select("budget_jahr").eq("id", user.id).maybeSingle(),
    supabase.from("sparvorschlag_status").select("vorschlag_key").eq("user_id", user.id),
  ]);

  const aboList = (abos as Abo[]) ?? [];
  const { monate, kategorienFix, forecastJahr } = berechneBudget(aboList, (spend as AiSpendRow[]) ?? []);

  const erledigt = new Set(((sparStatus as { vorschlag_key: string }[]) ?? []).map((r) => r.vorschlag_key));
  const ersparnisOffen = berechneVorschlaege(aboList)
    .filter((v) => !erledigt.has(v.key))
    .reduce((s, v) => s + v.ersparnisJahr, 0);

  return (
    <BudgetClient
      monate={monate}
      kategorienFix={kategorienFix}
      forecastJahr={forecastJahr}
      budgetJahr={profil?.budget_jahr ?? null}
      ersparnisOffen={Math.round(ersparnisOffen * 100) / 100}
    />
  );
}
