import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = { title: "Anmelden" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const { redirect } = await searchParams;
  // Open-Redirect-Schutz: nur interne, relative Pfade zulassen.
  const safe =
    redirect && redirect.startsWith("/") && !redirect.startsWith("//")
      ? redirect
      : undefined;

  return <LoginForm redirectTo={safe} />;
}
