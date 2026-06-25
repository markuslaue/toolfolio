import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { VerifyEmailPanel } from "@/components/auth/verify-email";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "E-Mail bestätigen" };

export default async function VerifyPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Bereits bestaetigt -> Erfolg
  if (user?.email_confirmed_at) {
    return (
      <div className="rounded-3xl border bg-card p-7 text-center shadow-soft sm:p-8">
        <span className="mx-auto grid size-12 place-content-center rounded-2xl bg-success/10 text-success">
          <CheckCircle2 className="size-6" />
        </span>
        <h1 className="mt-4 font-display text-2xl font-semibold tracking-tight">
          E-Mail bestätigt
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Dein Konto ist startklar. Es kann losgehen.
        </p>
        <Link
          href="/app"
          className="mt-6 inline-block rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          Weiter
        </Link>
      </div>
    );
  }

  // Eingeloggt, aber noch nicht bestaetigt -> ausstehend
  if (user) {
    return <VerifyEmailPanel mode="pending" email={user.email ?? undefined} />;
  }

  // Keine Session (Link abgelaufen/ungueltig oder Direktaufruf) -> neuen Link anfordern
  return <VerifyEmailPanel mode="expired" />;
}
