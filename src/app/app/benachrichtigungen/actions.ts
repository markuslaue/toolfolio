"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { BenachrStatus } from "@/lib/benachrichtigungen";

export type BenachrResult = { ok?: boolean; error?: string };

async function userClient() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

/** Eine Benachrichtigung als gelesen/erledigt/ignoriert markieren. */
export async function setBenachrichtigung(key: string, status: BenachrStatus): Promise<BenachrResult> {
  if (!["gelesen", "erledigt", "ignoriert"].includes(status)) return { error: "Ungültiger Status." };
  const { supabase, user } = await userClient();
  if (!user) return { error: "Bitte melde dich erneut an." };
  const { error } = await supabase
    .from("benachrichtigung_status")
    .upsert({ user_id: user.id, key, status, updated_at: new Date().toISOString() }, { onConflict: "user_id,key" });
  if (error) return { error: "Konnte nicht gespeichert werden." };
  revalidatePath("/app/benachrichtigungen");
  return { ok: true };
}

/** Mehrere Benachrichtigungen auf einmal als gelesen markieren. */
export async function markAlleGelesen(keys: string[]): Promise<BenachrResult> {
  const { supabase, user } = await userClient();
  if (!user) return { error: "Bitte melde dich erneut an." };
  if (keys.length === 0) return { ok: true };
  const rows = keys.map((key) => ({ user_id: user.id, key, status: "gelesen" as const, updated_at: new Date().toISOString() }));
  const { error } = await supabase.from("benachrichtigung_status").upsert(rows, { onConflict: "user_id,key" });
  if (error) return { error: "Konnte nicht gespeichert werden." };
  revalidatePath("/app/benachrichtigungen");
  return { ok: true };
}

/** Status zuruecksetzen (Undo). */
export async function resetBenachrichtigung(key: string): Promise<BenachrResult> {
  const { supabase, user } = await userClient();
  if (!user) return { error: "Bitte melde dich erneut an." };
  const { error } = await supabase.from("benachrichtigung_status").delete().eq("user_id", user.id).eq("key", key);
  if (error) return { error: "Konnte nicht zurückgesetzt werden." };
  revalidatePath("/app/benachrichtigungen");
  return { ok: true };
}
