"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export type ForgotState = { sent?: boolean; email?: string; error?: string };

const schema = z.object({ email: z.string().email() });

export async function requestReset(
  _prev: ForgotState,
  formData: FormData,
): Promise<ForgotState> {
  const parsed = schema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { error: "Bitte gib eine gültige E-Mail-Adresse ein." };
  }

  const supabase = await createClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${siteUrl}/auth/callback?redirect=/passwort-neu`,
  });

  // Immer neutral bestaetigen, unabhaengig davon, ob ein Konto existiert.
  return { sent: true, email: parsed.data.email };
}
