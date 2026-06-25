"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export type VerifyState = {
  error?: string;
  sent?: boolean;
  email?: string;
  changed?: boolean;
};

function siteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

/** Bestaetigungsmail erneut senden (eingeloggt: Session-E-Mail, sonst die angegebene). */
export async function resendVerification(
  _prev: VerifyState,
  formData: FormData,
): Promise<VerifyState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const provided = (formData.get("email") as string) || "";
  const target = user?.email ?? provided;
  if (!target || !z.string().email().safeParse(target).success) {
    return { error: "Bitte gib eine gültige E-Mail-Adresse ein." };
  }

  await supabase.auth.resend({
    type: "signup",
    email: target,
    options: { emailRedirectTo: `${siteUrl()}/auth/callback?redirect=/verifizieren` },
  });
  return { sent: true, email: target };
}

/** Falsche Adresse korrigieren (nur eingeloggt, unbestaetigt). */
export async function changeEmail(
  _prev: VerifyState,
  formData: FormData,
): Promise<VerifyState> {
  const parsed = z.string().email().safeParse(formData.get("email"));
  if (!parsed.success) {
    return { error: "Bitte gib eine gültige E-Mail-Adresse ein." };
  }
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser(
    { email: parsed.data },
    { emailRedirectTo: `${siteUrl()}/auth/callback?redirect=/verifizieren` },
  );
  if (error) {
    return { error: "Das hat nicht geklappt. Bitte versuche es erneut." };
  }
  return { sent: true, email: parsed.data, changed: true };
}
