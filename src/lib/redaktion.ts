import "server-only";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Wache fuer das Verzeichnis-CMS.
 *
 * Jede Seite und jede Aktion im CMS arbeitet mit der Service-Role, weil sie
 * Entwuerfe lesen und Status setzen muss. Die Rollenpruefung liegt deshalb
 * IMMER davor und wird serverseitig gemacht, nie im UI.
 *
 * Wer kein Redaktionskonto ist, sieht eine 404. Nicht "kein Zugriff": die
 * Existenz des CMS geht ihn nichts an.
 */
export async function redaktionOderRaus(weiter?: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(weiter ? `/login?next=${encodeURIComponent(weiter)}` : "/login");

  const { data: profil } = await supabase.from("profiles").select("is_staff").eq("id", user.id).maybeSingle();
  if (!profil?.is_staff) notFound();

  return { user, admin: createAdminClient() };
}

/** Dieselbe Pruefung fuer Server-Actions. Wirft, statt umzuleiten. */
export async function redaktionOderFehler(): Promise<{ ok: true; admin: ReturnType<typeof createAdminClient> } | { ok: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Bitte melde dich erneut an." };

  const { data: profil } = await supabase.from("profiles").select("is_staff").eq("id", user.id).maybeSingle();
  if (!profil?.is_staff) return { ok: false, error: "Dafür brauchst du ein Redaktionskonto." };

  return { ok: true, admin: createAdminClient() };
}

export { PRODUKT_STATUS, PRODUKT_STATUS_LABEL, PRODUKT_STATUS_STIL, type ProduktStatus } from "@/lib/redaktion-status";
