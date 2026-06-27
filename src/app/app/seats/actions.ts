"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getActiveAccount } from "@/lib/active-account";

export type SeatResult = { ok?: boolean; error?: string };

/** Gebuchte Lizenzen/Plaetze eines Abos setzen (null = unbekannt). */
export async function setLizenzen(aboId: string, lizenzen: number | null): Promise<SeatResult> {
  if (lizenzen !== null && (Number.isNaN(lizenzen) || lizenzen < 0 || lizenzen > 100000)) return { error: "Ungültige Anzahl." };
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const account = user ? await getActiveAccount(supabase, user.id) : null;
  if (!user || !account) return { error: "Bitte melde dich erneut an." };
  const { error } = await supabase.from("abos").update({ lizenzen }).eq("id", aboId).eq("user_id", account);
  if (error) return { error: "Lizenzen konnten nicht gespeichert werden." };
  revalidatePath("/app/seats");
  return { ok: true };
}
