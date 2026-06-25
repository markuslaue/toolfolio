import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";
import { safeRedirect } from "@/lib/safe-redirect";

export const metadata: Metadata = { title: "Anmelden" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const { redirect } = await searchParams;
  // Nur interne Pfade zulassen; leerer Fallback, damit das Formular bei
  // fehlendem Ziel selbst auf /app leitet.
  const target = redirect ? safeRedirect(redirect, "") : "";

  return <LoginForm redirectTo={target || undefined} />;
}
