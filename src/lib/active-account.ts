import "server-only";
import { cookies } from "next/headers";
import type { createClient } from "@/lib/supabase/server";

const COOKIE = "tf_account";

type SC = Awaited<ReturnType<typeof createClient>>;

export type KontoOption = { id: string; label: string; eigenes: boolean; rolle: "owner" | "admin" | "member" };

/**
 * Manche Nutzer sollen KEIN eigenes Mandanten-Konto haben, sondern
 * ausschliesslich in einem geteilten Konto arbeiten (`profiles.eigenes_konto = false`).
 * Technisch ist die user_id zwar immer auch eine Mandanten-ID, dieses Konto wird
 * dann aber weder angeboten noch als Heimat verwendet.
 */
async function ohneEigenesKonto(supabase: SC, userId: string): Promise<boolean> {
  const { data } = await supabase.from("profiles").select("eigenes_konto").eq("id", userId).maybeSingle();
  return data?.eigenes_konto === false;
}

/** Mitgliedschaften des Nutzers (Konten, in denen er arbeiten darf). */
async function mitgliedschaften(supabase: SC, userId: string): Promise<{ account_owner: string; role: string }[]> {
  const { data } = await supabase.from("team_members").select("account_owner, role").eq("member", userId);
  return (data ?? []) as { account_owner: string; role: string }[];
}

/**
 * Heimatkonto: normalerweise das eigene. Hat der Nutzer bewusst kein eigenes
 * Konto, ist es das erste geteilte Konto. Fallback bleibt immer das eigene,
 * damit niemand ohne Konto dasteht (z. B. wenn die Mitgliedschaft entzogen wird).
 */
async function heimatKonto(supabase: SC, userId: string): Promise<string> {
  if (!(await ohneEigenesKonto(supabase, userId))) return userId;
  const m = await mitgliedschaften(supabase, userId);
  return m[0]?.account_owner ?? userId;
}

/**
 * Das aktive Konto (= Mandanten-/Owner-ID), in dem der Nutzer gerade arbeitet.
 * Per Cookie umschaltbar; die Zugehoerigkeit wird immer serverseitig geprueft
 * (kein Verlass auf das Cookie allein).
 */
export async function getActiveAccount(supabase: SC, userId: string): Promise<string> {
  const store = await cookies();
  const wanted = store.get(COOKIE)?.value;

  // Kein Cookie oder explizit das eigene Konto -> Heimatkonto bestimmen.
  if (!wanted || wanted === userId) return heimatKonto(supabase, userId);

  const { data } = await supabase
    .from("team_members")
    .select("account_owner")
    .eq("account_owner", wanted)
    .eq("member", userId)
    .maybeSingle();
  return data ? wanted : await heimatKonto(supabase, userId);
}

/**
 * Konten, in denen der Nutzer arbeiten kann. Das eigene Konto entfaellt, wenn
 * `eigenes_konto = false` gesetzt ist UND mindestens eine Mitgliedschaft besteht.
 * Bleibt dann nur ein Konto uebrig, blendet der Header den Umschalter aus.
 */
export async function listAccounts(supabase: SC, userId: string): Promise<KontoOption[]> {
  const mitglied = await mitgliedschaften(supabase, userId);
  const kaputt = mitglied.length === 0; // ohne Mitgliedschaft immer das eigene anbieten
  const eigenesAusblenden = !kaputt && (await ohneEigenesKonto(supabase, userId));

  const out: KontoOption[] = eigenesAusblenden
    ? []
    : [{ id: userId, label: "Mein Konto", eigenes: true, rolle: "owner" }];

  const ownerIds = mitglied.map((m) => m.account_owner);
  if (ownerIds.length === 0) return out;

  // Namen der Konten (Firmenname, falls vorhanden; has_account_access erlaubt den Lesezugriff).
  const { data: firmen } = await supabase.from("unternehmen").select("user_id, name").in("user_id", ownerIds);
  const nameByOwner = new Map((firmen ?? []).map((f) => [f.user_id as string, (f.name as string | null) ?? null]));
  for (const m of mitglied) {
    out.push({
      id: m.account_owner,
      label: nameByOwner.get(m.account_owner) || "Gemeinsames Konto",
      eigenes: false,
      rolle: (m.role as "admin" | "member") ?? "member",
    });
  }
  return out;
}
