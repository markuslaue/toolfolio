"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, AlertCircle, MailCheck, ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requestReset, type ForgotState } from "@/app/(auth)/passwort-vergessen/actions";

const initial: ForgotState = {};

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(requestReset, initial);
  const [email, setEmail] = useState("");
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  if (state.sent) {
    return (
      <div className="rounded-3xl border bg-card p-7 text-center shadow-soft sm:p-8">
        <span className="mx-auto grid size-12 place-content-center rounded-2xl bg-primary/10 text-primary">
          <MailCheck className="size-6" />
        </span>
        <h1 className="mt-4 font-display text-2xl font-semibold tracking-tight">
          E-Mail unterwegs
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Falls ein Konto mit dieser E-Mail existiert, haben wir dir einen Link
          zum Zurücksetzen geschickt. Schau auch im Spam-Ordner.
        </p>
        <form
          action={formAction}
          onSubmit={() => setCooldown(30)}
          className="mt-6"
        >
          <input type="hidden" name="email" value={state.email ?? ""} />
          <Button
            type="submit"
            variant="outline"
            disabled={pending || cooldown > 0}
            className="h-11 w-full rounded-xl"
          >
            {pending && <Loader2 className="size-4 animate-spin" />}
            {cooldown > 0 ? `Erneut senden in ${cooldown}s` : "Erneut senden"}
          </Button>
        </form>
        <Link
          href="/login"
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
        >
          <ArrowLeft className="size-3.5" /> Zurück zur Anmeldung
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border bg-card p-7 shadow-soft sm:p-8">
      <h1 className="font-display text-3xl font-semibold tracking-tight">
        Passwort vergessen?
      </h1>
      <p className="mt-1.5 text-sm text-muted-foreground">
        Gib deine E-Mail ein, wir senden dir einen Link zum Zurücksetzen.
      </p>

      <form
        action={formAction}
        onSubmit={() => setCooldown(30)}
        className="mt-6 space-y-4"
      >
        <div>
          <Label htmlFor="email">E-Mail</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="du@agentur.de"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1.5 h-11 rounded-xl"
          />
        </div>

        {state.error && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/8 px-3 py-2.5 text-sm text-destructive"
          >
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <span>{state.error}</span>
          </div>
        )}

        <Button
          type="submit"
          disabled={pending}
          className="h-12 w-full rounded-xl text-base"
        >
          {pending && <Loader2 className="size-4 animate-spin" />}
          Link senden
        </Button>
      </form>

      <Link
        href="/login"
        className="mt-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" /> Zurück zur Anmeldung
      </Link>
    </div>
  );
}
