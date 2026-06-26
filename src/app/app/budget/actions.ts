"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type BudgetResult = { ok?: boolean; error?: string };

/** Jahresbudget am Profil speichern (null = kein Budget). */
export async function saveBudget(budgetJahr: number | null): Promise<BudgetResult> {
  if (budgetJahr !== null && (Number.isNaN(budgetJahr) || budgetJahr < 0)) return { error: "Ungültiger Betrag." };
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Bitte melde dich erneut an." };
  const { error } = await supabase.from("profiles").update({ budget_jahr: budgetJahr }).eq("id", user.id);
  if (error) return { error: "Budget konnte nicht gespeichert werden." };
  revalidatePath("/app/budget");
  return { ok: true };
}
