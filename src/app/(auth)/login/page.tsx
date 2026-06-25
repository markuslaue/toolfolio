import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { safeRedirect } from "@/lib/safe-redirect";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Anmelden" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const { redirect: redirectParam } = await searchParams;
  // Nur interne Pfade zulassen; leerer Fallback, damit das Formular bei
  // fehlendem Ziel selbst auf /app leitet.
  const target = redirectParam ? safeRedirect(redirectParam, "") : "";

  // Bereits angemeldet? Dann direkt weiter (kein erneutes Login-Formular).
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    redirect(target || "/app");
  }

  return <LoginForm redirectTo={target || undefined} />;
}
