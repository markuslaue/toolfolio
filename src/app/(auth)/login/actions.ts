"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { safeRedirect } from "@/lib/safe-redirect";

export type LoginState = {
  error?: string;
  /** true, wenn das Konto Zwei-Faktor aktiv hat und ein zweiter Schritt noetig ist. */
  twoFactor?: boolean;
};

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  redirect: z.string().optional(),
});

export async function login(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    redirect: formData.get("redirect") ?? undefined,
  });
  if (!parsed.success) {
    return {
      error: "Bitte gib eine gültige E-Mail-Adresse und dein Passwort ein.",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });
  if (error) {
    // Unbestaetigte E-Mail: konkreter Hinweis (laut Spec, S-04 ergaenzt Resend).
    if (
      error.code === "email_not_confirmed" ||
      /not confirmed/i.test(error.message)
    ) {
      return {
        error:
          "Bitte bestätige zuerst deine E-Mail-Adresse über den Link, den wir dir geschickt haben.",
      };
    }
    // Sonst neutrale Meldung, keine Konto-Enumeration.
    return {
      error: "E-Mail oder Passwort stimmen nicht. Bitte versuche es erneut.",
    };
  }

  // Zwei-Faktor: nur verlangen, wenn das Konto einen verifizierten Faktor hat.
  const { data: aal } =
    await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (aal?.nextLevel === "aal2" && aal.nextLevel !== aal.currentLevel) {
    return { twoFactor: true };
  }

  redirect(safeRedirect(parsed.data.redirect, "/app"));
}

const mfaSchema = z.object({
  code: z.string().transform((s) => s.replace(/\s/g, "")),
  redirect: z.string().optional(),
});

export async function verifyTwoFactor(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const parsed = mfaSchema.safeParse({
    code: formData.get("code"),
    redirect: formData.get("redirect") ?? undefined,
  });
  if (!parsed.success || parsed.data.code.length !== 6) {
    return {
      twoFactor: true,
      error: "Bitte gib den sechsstelligen Code aus deiner App ein.",
    };
  }

  const supabase = await createClient();
  const { data: factors } = await supabase.auth.mfa.listFactors();
  const totp = factors?.totp?.[0];
  if (!totp) {
    return { twoFactor: true, error: "Kein Zwei-Faktor-Verfahren gefunden." };
  }
  const { data: challenge, error: chErr } = await supabase.auth.mfa.challenge({
    factorId: totp.id,
  });
  if (chErr || !challenge) {
    return {
      twoFactor: true,
      error: "Die Bestätigung ist fehlgeschlagen. Bitte versuche es erneut.",
    };
  }
  const { error: vErr } = await supabase.auth.mfa.verify({
    factorId: totp.id,
    challengeId: challenge.id,
    code: parsed.data.code,
  });
  if (vErr) {
    return {
      twoFactor: true,
      error: "Der Code ist nicht korrekt. Bitte versuche es erneut.",
    };
  }

  redirect(safeRedirect(parsed.data.redirect, "/app"));
}

export async function signInWithGoogle(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const target = safeRedirect(
    (formData.get("redirect") as string) || undefined,
    "/app",
  );
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${siteUrl}/auth/callback?redirect=${encodeURIComponent(target)}`,
    },
  });

  // Google ist evtl. noch nicht im Supabase-Dashboard aktiviert.
  if (error || !data?.url) {
    redirect("/login?error=google");
  }
  redirect(data.url);
}
