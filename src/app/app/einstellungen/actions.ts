"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ProfileState = { ok?: boolean; error?: string };
export type PersonalState = {
  ok?: boolean;
  emailSent?: boolean;
  email?: string;
  error?: string;
};

function siteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

/**
 * Persoenliche Daten speichern: Vor-/Nachname direkt; bei geaenderter
 * Konto-E-Mail zusaetzlich Bestaetigungslink an die neue Adresse.
 */
export async function savePersonalData(
  _prev: PersonalState,
  formData: FormData,
): Promise<PersonalState> {
  const parsed = z
    .object({
      first_name: z.string().trim().min(1, "Bitte gib deinen Vornamen ein."),
      last_name: z.string().trim().optional(),
      email: z.string().email("Bitte gib eine gültige E-Mail-Adresse ein."),
    })
    .safeParse({
      first_name: formData.get("first_name"),
      last_name: formData.get("last_name"),
      email: formData.get("email"),
    });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Bitte prüfe deine Eingabe." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Bitte melde dich erneut an." };

  const { error } = await supabase
    .from("profiles")
    .update({
      first_name: parsed.data.first_name,
      last_name: parsed.data.last_name || null,
    })
    .eq("id", user.id);
  if (error) {
    return { error: "Speichern hat nicht geklappt. Bitte versuche es erneut." };
  }

  // E-Mail geaendert? -> Bestaetigungslink an die neue Adresse.
  let emailSent = false;
  if (parsed.data.email.toLowerCase() !== (user.email ?? "").toLowerCase()) {
    const { error: mailError } = await supabase.auth.updateUser(
      { email: parsed.data.email },
      { emailRedirectTo: `${siteUrl()}/auth/callback?redirect=/app/einstellungen` },
    );
    if (mailError) {
      return { error: "Name gespeichert, aber der E-Mail-Wechsel hat nicht geklappt." };
    }
    emailSent = true;
  }

  revalidatePath("/app/einstellungen");
  return { ok: true, emailSent, email: parsed.data.email };
}

/** Sprache, Zeitzone, Theme, Format und Waehrung speichern. */
export async function savePreferences(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const parsed = z
    .object({
      locale: z.enum(["de", "en"]),
      timezone: z.string().min(1),
      theme: z.enum(["hell", "dunkel", "system"]),
      number_format: z.enum(["de", "int"]),
      currency: z.enum(["EUR", "USD", "CHF", "GBP"]),
    })
    .safeParse({
      locale: formData.get("locale"),
      timezone: formData.get("timezone"),
      theme: formData.get("theme"),
      number_format: formData.get("number_format"),
      currency: formData.get("currency"),
    });
  if (!parsed.success) {
    return { error: "Bitte prüfe deine Auswahl." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Bitte melde dich erneut an." };

  const { error } = await supabase
    .from("profiles")
    .update(parsed.data)
    .eq("id", user.id);

  if (error) return { error: "Speichern hat nicht geklappt. Bitte versuche es erneut." };
  revalidatePath("/app/einstellungen");
  return { ok: true };
}

/** Von diesem Geraet abmelden und zum Login. */
export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
