"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type DatenResult = { ok?: boolean; error?: string };

/** Alle eigenen Daten als JSON exportieren (DSGVO-Auskunft/Portabilitaet). */
export async function exportData(): Promise<{ json?: string; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Bitte melde dich erneut an." };

  // DSGVO-Auskunft betrifft ausschliesslich das EIGENE Konto (user.id),
  // nicht ein per Mitgliedschaft aktiv geschaltetes fremdes Konto.
  const [profil, unternehmen, abos, kunden, kanaele, quittungen, log] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    supabase.from("unternehmen").select("*").eq("user_id", user.id).maybeSingle(),
    supabase.from("abos").select("*").eq("user_id", user.id),
    supabase.from("kunden").select("*").eq("user_id", user.id),
    supabase.from("zahlungskanaele").select("*").eq("user_id", user.id),
    supabase.from("frist_quittungen").select("*").eq("user_id", user.id),
    supabase.from("notification_log").select("*").eq("user_id", user.id),
  ]);

  const dump = {
    exportiert_am: new Date().toISOString(),
    konto: { id: user.id, email: user.email },
    profil: profil.data ?? null,
    unternehmen: unternehmen.data ?? null,
    abos: abos.data ?? [],
    kunden: kunden.data ?? [],
    zahlungskanaele: kanaele.data ?? [],
    frist_quittungen: quittungen.data ?? [],
    benachrichtigungen: log.data ?? [],
  };
  return { json: JSON.stringify(dump, null, 2) };
}

/** Konto und alle zugehoerigen Daten endgueltig loeschen. */
export async function deleteAccount(): Promise<DatenResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Bitte melde dich erneut an." };

  // Auth-Nutzer loeschen -> alle Tabellen mit FK on delete cascade folgen.
  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) return { error: "Löschen hat nicht geklappt. Bitte kontaktiere uns." };

  await supabase.auth.signOut();
  return { ok: true };
}
