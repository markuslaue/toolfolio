"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getActiveAccount } from "@/lib/active-account";

export type BerichtResult = { ok?: boolean; error?: string };

const schema = z.object({
  typ: z.enum(["weiterverrechnung", "ausgaben", "verteilung", "datev"]),
  titel: z.string().trim().min(1).max(200),
  kunde: z.string().trim().max(200).nullable(),
  zeitraum: z.string().trim().min(1).max(120),
  betrag: z.number().finite().nullable(),
});

/** Einen erzeugten Bericht im Verlauf ablegen. */
export async function speichereBericht(eingabe: unknown): Promise<BerichtResult> {
  const parsed = schema.safeParse(eingabe);
  if (!parsed.success) return { error: "Der Bericht konnte nicht gespeichert werden." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Bitte melde dich erneut an." };
  const account = await getActiveAccount(supabase, user.id);

  const { error } = await supabase.from("bericht_verlauf").insert({
    user_id: account,
    erstellt_von: user.id,
    ...parsed.data,
  });
  // has_admin_access greift serverseitig: Mitglieder mit Leserecht bekommen hier ein Nein.
  if (error) return { error: "Du darfst in diesem Konto keine Berichte speichern." };

  revalidatePath("/app/berichte");
  return { ok: true };
}

/** Einen Eintrag aus dem Verlauf entfernen. */
export async function loescheBericht(id: string): Promise<BerichtResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Bitte melde dich erneut an." };
  const account = await getActiveAccount(supabase, user.id);

  const { error } = await supabase.from("bericht_verlauf").delete().eq("id", id).eq("user_id", account);
  if (error) return { error: "Der Eintrag konnte nicht entfernt werden." };

  revalidatePath("/app/berichte");
  return { ok: true };
}
