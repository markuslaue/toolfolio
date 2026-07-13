"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getActiveAccount } from "@/lib/active-account";

export type BudgetResult = { ok?: boolean; error?: string };

async function uc() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const account = user ? await getActiveAccount(supabase, user.id) : null;
  return { supabase, user, account };
}

/**
 * Jahresbudget speichern (null = kein Budget).
 *
 * Das Budget gehoert dem KONTO, nicht der einzelnen Person: sonst haette jedes
 * Teammitglied ein eigenes, unsichtbares Budget, und die Freigaben (die das
 * Kontobudget lesen) wuerden gegen einen anderen Wert pruefen.
 */
export async function saveBudget(budgetJahr: number | null): Promise<BudgetResult> {
  if (budgetJahr !== null && (Number.isNaN(budgetJahr) || budgetJahr < 0)) return { error: "Ungültiger Betrag." };
  const { supabase, user, account } = await uc();
  if (!user || !account) return { error: "Bitte melde dich erneut an." };

  const { error } = await supabase.from("profiles").update({ budget_jahr: budgetJahr }).eq("id", account);
  if (error) return { error: "Du darfst das Budget dieses Kontos nicht ändern." };

  revalidatePath("/app/budget");
  revalidatePath("/app/freigaben");
  return { ok: true };
}

/** Budget einer einzelnen Kategorie setzen (0 oder leer entfernt es wieder). */
export async function saveKategorieBudget(kategorie: string, betragJahr: number | null): Promise<BudgetResult> {
  const name = kategorie.trim();
  if (!name) return { error: "Unbekannte Kategorie." };
  if (betragJahr !== null && (Number.isNaN(betragJahr) || betragJahr < 0)) return { error: "Ungültiger Betrag." };

  const { supabase, user, account } = await uc();
  if (!user || !account) return { error: "Bitte melde dich erneut an." };

  if (betragJahr === null || betragJahr === 0) {
    const { error } = await supabase
      .from("kategorie_budget")
      .delete()
      .eq("user_id", account)
      .eq("kategorie", name);
    if (error) return { error: "Das Kategorie-Budget konnte nicht entfernt werden." };
  } else {
    const { error } = await supabase.from("kategorie_budget").upsert(
      { user_id: account, kategorie: name, betrag_jahr: betragJahr, updated_at: new Date().toISOString() },
      { onConflict: "user_id,kategorie" },
    );
    if (error) return { error: "Das Kategorie-Budget konnte nicht gespeichert werden." };
  }

  revalidatePath("/app/budget");
  return { ok: true };
}
