import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { NewPasswordForm } from "@/components/auth/new-password-form";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Neues Passwort" };

export default async function NewPasswordPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Ohne (Recovery-)Session ist der Link abgelaufen oder ungueltig.
  if (!user) {
    return (
      <div className="rounded-3xl border bg-card p-7 text-center shadow-soft sm:p-8">
        <span className="mx-auto grid size-12 place-content-center rounded-2xl bg-warning/10 text-warning">
          <AlertTriangle className="size-6" />
        </span>
        <h1 className="mt-4 font-display text-2xl font-semibold tracking-tight">
          Link abgelaufen oder ungültig
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Der Link zum Zurücksetzen ist nicht mehr gültig. Fordere einfach einen
          neuen an.
        </p>
        <Link
          href="/passwort-vergessen"
          className="mt-6 inline-block rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          Neuen Link anfordern
        </Link>
      </div>
    );
  }

  return <NewPasswordForm />;
}
