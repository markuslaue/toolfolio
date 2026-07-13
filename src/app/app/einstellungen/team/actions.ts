"use server";

import { randomBytes } from "node:crypto";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email";
import { teamEinladung } from "@/lib/email-templates";
import { hatMindestens, type PlanId } from "@/lib/constants";

export type TeamState = { ok?: boolean; error?: string; info?: string };

function siteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

async function currentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

/** Mitglied per E-Mail einladen (nur Owner/Admin des eigenen Kontos). */
export async function inviteMember(_prev: TeamState, formData: FormData): Promise<TeamState> {
  const parsed = z
    .object({
      email: z.string().trim().toLowerCase().email("Bitte gib eine gültige E-Mail-Adresse ein."),
      role: z.enum(["admin", "member"]),
    })
    .safeParse({ email: formData.get("email"), role: formData.get("role") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Bitte prüfe deine Eingabe." };

  const { supabase, user } = await currentUser();
  if (!user) return { error: "Bitte melde dich erneut an." };
  if (parsed.data.email === user.email?.toLowerCase()) return { error: "Du kannst dich nicht selbst einladen." };

  // Plan-Gating: Team-Einladungen sind im Agentur-Plan enthalten.
  // Inhaber-/Superadmin-Konten (is_staff) umgehen jedes Plan-Gate.
  const { data: planRow } = await supabase.from("profiles").select("plan, is_staff").eq("id", user.id).maybeSingle();
  if (!hatMindestens((planRow?.plan as PlanId) ?? "free", Boolean(planRow?.is_staff), "agentur"))
    return { error: "Team-Einladungen sind im Agentur-Plan enthalten. Wechsle unter Plan & Abrechnung." };

  const token = randomBytes(24).toString("hex");
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  // Upsert: erneute Einladung an dieselbe Adresse erneuert Token/Rolle/Frist.
  const { error } = await supabase
    .from("team_invites")
    .upsert(
      { account_owner: user.id, email: parsed.data.email, role: parsed.data.role, token, expires_at: expires, accepted_at: null },
      { onConflict: "account_owner,email" },
    );
  if (error) return { error: "Einladung konnte nicht gespeichert werden." };

  const { data: profil } = await supabase.from("profiles").select("first_name, last_name").eq("id", user.id).maybeSingle();
  const einladerName = [profil?.first_name, profil?.last_name].filter(Boolean).join(" ") || user.email || "Ein Toolfolio-Nutzer";
  const { subject, html } = teamEinladung(einladerName, parsed.data.role, `${siteUrl()}/einladung/${token}`);
  try {
    await sendEmail({ to: parsed.data.email, subject, html });
  } catch {
    return { error: "Einladung gespeichert, aber die E-Mail konnte nicht versendet werden." };
  }

  revalidatePath("/app/einstellungen/team");
  return { ok: true, info: `Einladung an ${parsed.data.email} versendet.` };
}

/** Rolle eines Mitglieds aendern. */
export async function changeRole(memberRowId: string, role: "admin" | "member"): Promise<TeamState> {
  if (!["admin", "member"].includes(role)) return { error: "Ungültige Rolle." };
  const { supabase, user } = await currentUser();
  if (!user) return { error: "Bitte melde dich erneut an." };
  const { error } = await supabase.from("team_members").update({ role }).eq("id", memberRowId).eq("account_owner", user.id);
  if (error) return { error: "Rolle konnte nicht geändert werden." };
  revalidatePath("/app/einstellungen/team");
  return { ok: true };
}

/** Mitglied aus dem Konto entfernen. */
export async function removeMember(memberRowId: string): Promise<TeamState> {
  const { supabase, user } = await currentUser();
  if (!user) return { error: "Bitte melde dich erneut an." };
  const { error } = await supabase.from("team_members").delete().eq("id", memberRowId).eq("account_owner", user.id);
  if (error) return { error: "Mitglied konnte nicht entfernt werden." };
  revalidatePath("/app/einstellungen/team");
  return { ok: true };
}

/** Offene Einladung zurueckziehen. */
export async function revokeInvite(inviteId: string): Promise<TeamState> {
  const { supabase, user } = await currentUser();
  if (!user) return { error: "Bitte melde dich erneut an." };
  const { error } = await supabase.from("team_invites").delete().eq("id", inviteId).eq("account_owner", user.id);
  if (error) return { error: "Einladung konnte nicht zurückgezogen werden." };
  revalidatePath("/app/einstellungen/team");
  return { ok: true };
}

/**
 * Einladung annehmen: validiert Token serverseitig (Admin-Client, da der Eingeladene
 * die Einladung selbst nicht lesen darf), prueft E-Mail-Gleichheit und Frist,
 * legt die Mitgliedschaft an. Gibt eine Statusmeldung zurueck.
 */
export async function acceptInvite(token: string): Promise<{ ok?: boolean; error?: string }> {
  const { user } = await currentUser();
  if (!user) return { error: "Bitte melde dich an, um die Einladung anzunehmen." };

  const admin = createAdminClient();
  const { data: invite } = await admin.from("team_invites").select("*").eq("token", token).maybeSingle();
  if (!invite) return { error: "Diese Einladung ist ungültig." };
  if (invite.accepted_at) return { error: "Diese Einladung wurde bereits angenommen." };
  if (new Date(invite.expires_at).getTime() < Date.now()) return { error: "Diese Einladung ist abgelaufen." };
  if (invite.email.toLowerCase() !== (user.email ?? "").toLowerCase())
    return { error: "Diese Einladung gehört zu einer anderen E-Mail-Adresse." };
  if (invite.account_owner === user.id) return { error: "Das ist dein eigenes Konto." };

  const { data: profil } = await admin.from("profiles").select("first_name, last_name").eq("id", user.id).maybeSingle();
  const name = [profil?.first_name, profil?.last_name].filter(Boolean).join(" ") || null;

  const { error: insErr } = await admin.from("team_members").upsert(
    {
      account_owner: invite.account_owner,
      member: user.id,
      role: invite.role,
      member_email: user.email,
      member_name: name,
    },
    { onConflict: "account_owner,member" },
  );
  if (insErr) return { error: "Beitritt fehlgeschlagen. Bitte versuche es erneut." };

  await admin.from("team_invites").update({ accepted_at: new Date().toISOString() }).eq("id", invite.id);
  return { ok: true };
}
