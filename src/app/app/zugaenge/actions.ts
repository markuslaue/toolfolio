"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getActiveAccount } from "@/lib/active-account";

export type ZugangResult = { ok?: boolean; error?: string; id?: string };

async function uc() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const account = user ? await getActiveAccount(supabase, user.id) : null;
  return { supabase, user, account };
}

/** Person anlegen. */
export async function addPerson(_prev: ZugangResult, formData: FormData): Promise<ZugangResult> {
  const parsed = z
    .object({
      name: z.string().trim().min(1, "Bitte gib einen Namen ein.").max(80),
      rolle: z.string().trim().max(60).optional(),
      email: z.string().trim().toLowerCase().email().optional().or(z.literal("")),
    })
    .safeParse({ name: formData.get("name"), rolle: formData.get("rolle") ?? "", email: formData.get("email") ?? "" });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Bitte prüfe deine Eingabe." };
  const { supabase, user, account } = await uc();
  if (!user || !account) return { error: "Bitte melde dich erneut an." };
  const { data, error } = await supabase
    .from("personen")
    .insert({ user_id: account, name: parsed.data.name, rolle: parsed.data.rolle || null, email: parsed.data.email || null })
    .select("id")
    .single();
  if (error) return { error: "Person konnte nicht angelegt werden." };
  revalidatePath("/app/zugaenge");
  return { ok: true, id: data.id };
}

export async function removePerson(id: string): Promise<ZugangResult> {
  const { supabase, user, account } = await uc();
  if (!user || !account) return { error: "Bitte melde dich erneut an." };
  const { error } = await supabase.from("personen").delete().eq("id", id).eq("user_id", account);
  if (error) return { error: "Person konnte nicht entfernt werden." };
  revalidatePath("/app/zugaenge");
  return { ok: true };
}

export async function setPersonStatus(id: string, status: "aktiv" | "scheidet_aus" | "ausgeschieden", austritt?: string | null): Promise<ZugangResult> {
  if (!["aktiv", "scheidet_aus", "ausgeschieden"].includes(status)) return { error: "Ungültiger Status." };
  const { supabase, user, account } = await uc();
  if (!user || !account) return { error: "Bitte melde dich erneut an." };
  const { error } = await supabase.from("personen").update({ status, austritt: austritt ?? null }).eq("id", id).eq("user_id", account);
  if (error) return { error: "Status konnte nicht geändert werden." };
  revalidatePath("/app/zugaenge");
  return { ok: true };
}

/** Tool einer Person zuordnen (mit optionalem Platz-Kosten-Wert). */
export async function assignTool(personId: string, aboId: string, platzKosten: number | null): Promise<ZugangResult> {
  const { supabase, user, account } = await uc();
  if (!user || !account) return { error: "Bitte melde dich erneut an." };
  const { error } = await supabase
    .from("tool_zugang")
    .upsert({ user_id: account, person_id: personId, abo_id: aboId, platz_kosten: platzKosten }, { onConflict: "person_id,abo_id" });
  if (error) return { error: "Zugang konnte nicht gespeichert werden." };
  revalidatePath("/app/zugaenge");
  return { ok: true };
}

export async function unassignTool(zugangId: string): Promise<ZugangResult> {
  const { supabase, user, account } = await uc();
  if (!user || !account) return { error: "Bitte melde dich erneut an." };
  const { error } = await supabase.from("tool_zugang").delete().eq("id", zugangId).eq("user_id", account);
  if (error) return { error: "Zugang konnte nicht entfernt werden." };
  revalidatePath("/app/zugaenge");
  return { ok: true };
}

/** Verantwortliche Person (Owner) fuer ein Tool setzen (oder loesen). */
export async function setOwner(aboId: string, zugangId: string | null): Promise<ZugangResult> {
  const { supabase, user, account } = await uc();
  if (!user || !account) return { error: "Bitte melde dich erneut an." };
  // Erst alle Owner-Flags des Tools loesen, dann ggf. eines setzen.
  await supabase.from("tool_zugang").update({ ist_owner: false }).eq("user_id", account).eq("abo_id", aboId);
  if (zugangId) {
    const { error } = await supabase.from("tool_zugang").update({ ist_owner: true }).eq("id", zugangId).eq("user_id", account);
    if (error) return { error: "Owner konnte nicht gesetzt werden." };
  }
  revalidatePath("/app/zugaenge");
  return { ok: true };
}
