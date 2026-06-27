"use server";

import { randomUUID } from "node:crypto";
import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getActiveAccount } from "@/lib/active-account";

/** Storage-Pfad aus einer oeffentlichen avatars-URL ziehen (oder null). */
function currentAvatarPath(uid: string, url: string | null): string | null {
  if (!url) return null;
  const m = url.split("?")[0].match(/\/avatars\/(.+)$/);
  const path = m?.[1];
  return path && path.startsWith(`${uid}/`) ? path : null;
}

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

const AVATAR_MAX = 2 * 1024 * 1024; // 2 MB
const AVATAR_MIME = ["image/png", "image/jpeg", "image/webp", "image/gif"];

/** Profilbild in den oeffentlichen avatars-Bucket laden und am Profil verlinken. */
export async function uploadAvatar(formData: FormData): Promise<{ ok?: boolean; error?: string; url?: string }> {
  const datei = formData.get("avatar");
  if (!(datei instanceof File) || datei.size === 0) return { error: "Bitte wähle ein Bild aus." };
  if (datei.size > AVATAR_MAX) return { error: "Das Bild ist zu groß (max. 2 MB)." };
  if (!AVATAR_MIME.includes(datei.type)) return { error: "Nur PNG, JPG, WebP oder GIF." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Bitte melde dich erneut an." };

  const ext = datei.type === "image/png" ? "png" : datei.type === "image/webp" ? "webp" : datei.type === "image/gif" ? "gif" : "jpg";
  // Eindeutiger Dateiname pro Upload (Pfad-Praefix = user_id fuer die RLS).
  // So kein Konflikt und kein Loeschen noetig (Upsert/Delete scheitern im
  // public-Bucket an der RLS). Alte Datei aufraeumen ist best effort.
  const altPath = currentAvatarPath(user.id, (await supabase.from("profiles").select("avatar_url").eq("id", user.id).maybeSingle()).data?.avatar_url ?? null);
  const path = `${user.id}/${randomUUID()}.${ext}`;
  const { error: upErr } = await supabase.storage.from("avatars").upload(path, datei, { contentType: datei.type, upsert: false });
  if (upErr) return { error: "Das Bild konnte nicht hochgeladen werden." };
  if (altPath) await supabase.storage.from("avatars").remove([altPath]); // best effort

  const { data: pub } = supabase.storage.from("avatars").getPublicUrl(path);
  const url = `${pub.publicUrl}?v=${Date.now()}`; // Cache-Busting nach Neu-Upload
  const { error } = await supabase.from("profiles").update({ avatar_url: url }).eq("id", user.id);
  if (error) return { error: "Bild gespeichert, aber das Profil konnte nicht aktualisiert werden." };
  revalidatePath("/app/einstellungen");
  return { ok: true, url };
}

/** Profilbild entfernen. */
export async function removeAvatar(): Promise<{ ok?: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Bitte melde dich erneut an." };
  const { data: prof } = await supabase.from("profiles").select("avatar_url").eq("id", user.id).maybeSingle();
  const path = currentAvatarPath(user.id, prof?.avatar_url ?? null);
  if (path) await supabase.storage.from("avatars").remove([path]); // best effort
  const { error } = await supabase.from("profiles").update({ avatar_url: null }).eq("id", user.id);
  if (error) return { error: "Konnte nicht entfernt werden." };
  revalidatePath("/app/einstellungen");
  return { ok: true };
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

const leerNull = (v: unknown) => (typeof v === "string" && v.trim() === "" ? null : v);

/** Unternehmensdaten speichern (Upsert je Nutzer). */
export async function saveUnternehmen(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const parsed = z
    .object({
      name: z.preprocess(leerNull, z.string().trim().nullable().optional()),
      strasse: z.preprocess(leerNull, z.string().trim().nullable().optional()),
      plz: z.preprocess(leerNull, z.string().trim().nullable().optional()),
      ort: z.preprocess(leerNull, z.string().trim().nullable().optional()),
      land: z.string().trim().min(1).default("Deutschland"),
      ust_id: z.preprocess(leerNull, z.string().trim().nullable().optional()),
      steuernummer: z.preprocess(leerNull, z.string().trim().nullable().optional()),
    })
    .safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Bitte prüfe deine Eingaben." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const account = user ? await getActiveAccount(supabase, user.id) : null;
  if (!user || !account) return { error: "Bitte melde dich erneut an." };

  const { error } = await supabase
    .from("unternehmen")
    .upsert({ ...parsed.data, user_id: account }, { onConflict: "user_id" });
  if (error) return { error: "Speichern hat nicht geklappt. Bitte versuche es erneut." };
  revalidatePath("/app/einstellungen/unternehmen");
  return { ok: true };
}

/** Benachrichtigungs-Einstellungen speichern. */
export async function saveBenachrichtigungen(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const parsed = z
    .object({
      benachrichtigung_frist: z.boolean(),
      benachrichtigung_trial: z.boolean(),
      benachrichtigung_produkt: z.boolean(),
      benachrichtigung_report: z.boolean(),
      benachrichtigung_vorlauf: z.number().int().min(1).max(60),
    })
    .safeParse({
      benachrichtigung_frist: formData.get("frist") === "true",
      benachrichtigung_trial: formData.get("trial") === "true",
      benachrichtigung_produkt: formData.get("produkt") === "true",
      benachrichtigung_report: formData.get("report") === "true",
      benachrichtigung_vorlauf: Number(formData.get("vorlauf") ?? 14),
    });
  if (!parsed.success) return { error: "Bitte prüfe deine Auswahl." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Bitte melde dich erneut an." };

  const { error } = await supabase.from("profiles").update(parsed.data).eq("id", user.id);
  if (error) return { error: "Speichern hat nicht geklappt. Bitte versuche es erneut." };
  revalidatePath("/app/einstellungen/benachrichtigungen");
  return { ok: true };
}

/** Von diesem Geraet abmelden und zum Login. */
export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
