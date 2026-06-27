"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getActiveAccount } from "@/lib/active-account";

export type AiResult = { ok?: boolean; error?: string; id?: string };

async function userClient() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const account = user ? await getActiveAccount(supabase, user.id) : null;
  return { supabase, user, account };
}

const FARBEN = ["#6C5CE7", "#D97757", "#10A37F", "#FF7A66", "#1F1D2B", "#0099ff", "#12B76A"];

/** Neuen AI-Dienst anlegen. */
export async function createService(_prev: AiResult, formData: FormData): Promise<AiResult> {
  const parsed = z
    .object({
      name: z.string().trim().min(1, "Bitte gib einen Namen ein.").max(60),
      farbe: z.string().optional(),
      budget: z.string().optional(),
    })
    .safeParse({ name: formData.get("name"), farbe: formData.get("farbe"), budget: formData.get("budget") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Bitte prüfe deine Eingabe." };

  const { supabase, user, account } = await userClient();
  if (!user || !account) return { error: "Bitte melde dich erneut an." };

  const budget = parsed.data.budget ? Number(parsed.data.budget.replace(",", ".")) : null;
  const farbe = parsed.data.farbe && /^#[0-9a-fA-F]{6}$/.test(parsed.data.farbe) ? parsed.data.farbe : FARBEN[Math.abs(hash(parsed.data.name)) % FARBEN.length];

  const { data, error } = await supabase
    .from("ai_services")
    .insert({ user_id: account, name: parsed.data.name, farbe, budget_monat: budget && budget >= 0 ? budget : null })
    .select("id")
    .single();
  if (error) return { error: "Dienst konnte nicht angelegt werden." };
  revalidatePath("/app/ai-credits");
  return { ok: true, id: data.id };
}

/** Budget eines Dienstes setzen/entfernen. */
export async function setBudget(serviceId: string, budget: number | null): Promise<AiResult> {
  const { supabase, user, account } = await userClient();
  if (!user || !account) return { error: "Bitte melde dich erneut an." };
  const wert = budget !== null && budget >= 0 ? budget : null;
  const { error } = await supabase.from("ai_services").update({ budget_monat: wert }).eq("id", serviceId).eq("user_id", account);
  if (error) return { error: "Budget konnte nicht gespeichert werden." };
  revalidatePath("/app/ai-credits");
  return { ok: true };
}

/** Dienst loeschen (inkl. Verbrauchswerte via FK-Cascade). */
export async function deleteService(serviceId: string): Promise<AiResult> {
  const { supabase, user, account } = await userClient();
  if (!user || !account) return { error: "Bitte melde dich erneut an." };
  const { error } = await supabase.from("ai_services").delete().eq("id", serviceId).eq("user_id", account);
  if (error) return { error: "Dienst konnte nicht gelöscht werden." };
  revalidatePath("/app/ai-credits");
  return { ok: true };
}

/** Monatswert erfassen oder aktualisieren. */
export async function upsertSpend(serviceId: string, jahr: number, monat: number, betrag: number): Promise<AiResult> {
  if (monat < 1 || monat > 12 || jahr < 2000 || jahr > 2100 || betrag < 0) return { error: "Ungültige Werte." };
  const { supabase, user, account } = await userClient();
  if (!user || !account) return { error: "Bitte melde dich erneut an." };
  const { error } = await supabase
    .from("ai_spend")
    .upsert({ user_id: account, service_id: serviceId, jahr, monat, betrag }, { onConflict: "service_id,jahr,monat" });
  if (error) return { error: "Wert konnte nicht gespeichert werden." };
  revalidatePath("/app/ai-credits");
  return { ok: true };
}

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i);
  return h;
}
