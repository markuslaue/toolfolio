"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { safeRedirect } from "@/lib/safe-redirect";

export type RegisterState = {
  error?: string;
  /** true nach erfolgreicher Registrierung: "Bitte E-Mail bestaetigen". */
  pending?: boolean;
  email?: string;
};

const schema = z.object({
  name: z.string().trim().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  consent: z.string().optional(), // "on", wenn die Checkbox angehakt ist
  redirect: z.string().optional(),
});

export async function register(
  _prev: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const parsed = schema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    consent: formData.get("consent") ?? undefined,
    redirect: formData.get("redirect") ?? undefined,
  });
  if (!parsed.success) {
    return {
      error:
        "Bitte fülle Name, eine gültige geschäftliche E-Mail und ein Passwort mit mindestens 8 Zeichen aus.",
    };
  }
  if (!parsed.data.consent) {
    return { error: "Bitte stimme den AGB und der Datenschutzerklärung zu." };
  }

  const [first, ...rest] = parsed.data.name.trim().split(/\s+/);
  const target = safeRedirect(parsed.data.redirect, "/app");
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      // Name + Einwilligung als Metadaten -> Trigger handle_new_user fuellt profiles.
      data: {
        first_name: first,
        last_name: rest.join(" ") || null,
        consent: "true",
      },
      emailRedirectTo: `${siteUrl}/auth/callback?redirect=${encodeURIComponent(target)}`,
    },
  });

  if (error) {
    if (/weak|password|at least|mindestens/i.test(error.message)) {
      return {
        error:
          "Dein Passwort ist zu schwach. Nutze mindestens 8 Zeichen mit Buchstaben und Zahlen.",
      };
    }
    return {
      error: "Die Registrierung hat nicht geklappt. Bitte versuche es erneut.",
    };
  }

  // E-Mail-Bestaetigung ist aktiv -> Pending-Zustand. Auch bei bereits
  // existierender E-Mail dieselbe Meldung (Anti-Enumeration).
  return { pending: true, email: parsed.data.email };
}
