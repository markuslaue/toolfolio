import "server-only";
import { cookies } from "next/headers";
import type { createClient } from "@/lib/supabase/server";

const COOKIE = "tf_account";

type SC = Awaited<ReturnType<typeof createClient>>;

export type KontoOption = { id: string; label: string; eigenes: boolean; rolle: "owner" | "admin" | "member" };

/**
 * Das aktive Konto (= Mandanten-/Owner-ID), in dem der Nutzer gerade arbeitet.
 * Default: eigenes Konto. Per Cookie umschaltbar auf Konten, in denen man Mitglied ist.
 * Validiert serverseitig die Zugehoerigkeit (kein Verlass auf das Cookie allein).
 */
export async function getActiveAccount(supabase: SC, userId: string): Promise<string> {
  const store = await cookies();
  const wanted = store.get(COOKIE)?.value;
  if (!wanted || wanted === userId) return userId;
  const { data } = await supabase
    .from("team_members")
    .select("account_owner")
    .eq("account_owner", wanted)
    .eq("member", userId)
    .maybeSingle();
  return data ? wanted : userId;
}

/** Liste der Konten, in denen der Nutzer arbeiten kann: eigenes + Mitgliedschaften. */
export async function listAccounts(supabase: SC, userId: string): Promise<KontoOption[]> {
  const out: KontoOption[] = [{ id: userId, label: "Mein Konto", eigenes: true, rolle: "owner" }];
  const { data: mitglied } = await supabase
    .from("team_members")
    .select("account_owner, role")
    .eq("member", userId);
  const ownerIds = (mitglied ?? []).map((m) => m.account_owner as string);
  if (ownerIds.length === 0) return out;

  // Namen der Konten (Firmenname, falls vorhanden; has_account_access erlaubt den Lesezugriff).
  const { data: firmen } = await supabase.from("unternehmen").select("user_id, name").in("user_id", ownerIds);
  const nameByOwner = new Map((firmen ?? []).map((f) => [f.user_id as string, (f.name as string | null) ?? null]));
  for (const m of mitglied ?? []) {
    const oid = m.account_owner as string;
    out.push({ id: oid, label: nameByOwner.get(oid) || "Geteiltes Konto", eigenes: false, rolle: (m.role as "admin" | "member") ?? "member" });
  }
  return out;
}
