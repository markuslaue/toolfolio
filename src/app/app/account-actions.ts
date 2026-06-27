"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/** Aktives Konto wechseln (nur auf Konten mit Zugehoerigkeit). Setzt ein Cookie. */
export async function switchAccount(accountId: string): Promise<{ ok?: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Bitte melde dich erneut an." };

  const store = await cookies();
  if (accountId === user.id) {
    store.set("tf_account", "", { path: "/", maxAge: 0 });
    revalidatePath("/app", "layout");
    return { ok: true };
  }
  // Zugehoerigkeit pruefen
  const { data } = await supabase.from("team_members").select("account_owner").eq("account_owner", accountId).eq("member", user.id).maybeSingle();
  if (!data) return { error: "Kein Zugriff auf dieses Konto." };
  store.set("tf_account", accountId, { path: "/", httpOnly: true, sameSite: "lax", maxAge: 60 * 60 * 24 * 365 });
  revalidatePath("/app", "layout");
  return { ok: true };
}
