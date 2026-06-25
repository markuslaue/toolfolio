"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import {
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  ShieldCheck,
  ArrowLeft,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import {
  login,
  verifyTwoFactor,
  signInWithGoogle,
  type LoginState,
} from "@/app/(auth)/login/actions";

const initial: LoginState = {};

export function LoginForm({ redirectTo }: { redirectTo?: string }) {
  const [state, formAction, pending] = useActionState(login, initial);
  const [mfaState, mfaAction, mfaPending] = useActionState(
    verifyTwoFactor,
    initial,
  );
  const [showPw, setShowPw] = useState(false);

  // Zweiter Schritt: Zwei-Faktor (Backend setzt state.twoFactor)
  if (state.twoFactor) {
    return (
      <div className="rounded-3xl border bg-card p-7 shadow-soft sm:p-8">
        <Link
          href="/login"
          className="mb-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" /> Zurück
        </Link>
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-content-center rounded-xl bg-primary/10 text-primary">
            <ShieldCheck className="size-5" />
          </span>
          <div>
            <h1 className="font-display text-2xl font-semibold">
              Bestätigung in zwei Schritten
            </h1>
            <p className="text-sm text-muted-foreground">
              Gib den Code aus deiner Authenticator-App ein.
            </p>
          </div>
        </div>

        <form action={mfaAction} className="mt-6 space-y-4">
          <div>
            <Label htmlFor="code">Sechsstelliger Code</Label>
            <Input
              id="code"
              name="code"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="123 456"
              className="mt-1.5 h-12 text-center font-display text-lg tracking-[0.4em]"
              maxLength={7}
              required
            />
          </div>
          {mfaState.error && <ErrorBanner text={mfaState.error} />}
          <Button
            type="submit"
            disabled={mfaPending}
            className="h-12 w-full rounded-xl text-base"
          >
            {mfaPending && <Loader2 className="size-4 animate-spin" />}
            Bestätigen
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border bg-card p-7 shadow-soft sm:p-8">
      <h1 className="font-display text-3xl font-semibold tracking-tight">
        Willkommen zurück
      </h1>
      <p className="mt-1.5 text-sm text-muted-foreground">
        Melde dich mit deinem Toolfolio-Konto an.
      </p>

      {/* SSO (nur Google im MVP) */}
      <form action={signInWithGoogle} className="mt-6">
        <button
          type="submit"
          className="flex h-11 w-full items-center justify-center gap-3 rounded-xl border border-border bg-card text-sm font-medium transition-colors hover:bg-muted/60"
        >
          <GoogleIcon />
          Mit Google anmelden
        </button>
      </form>

      <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        oder mit E-Mail
        <span className="h-px flex-1 bg-border" />
      </div>

      <form action={formAction} className="space-y-4">
        <input type="hidden" name="redirect" value={redirectTo ?? ""} />
        <div>
          <Label htmlFor="email">E-Mail</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="du@agentur.de"
            required
            className="mt-1.5 h-11 rounded-xl"
          />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="pw">Passwort</Label>
            <Link
              href="/passwort-vergessen"
              className="text-xs text-primary hover:underline"
            >
              Passwort vergessen?
            </Link>
          </div>
          <div className="relative mt-1.5">
            <Input
              id="pw"
              name="password"
              type={showPw ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Dein Passwort"
              required
              className="h-11 rounded-xl pr-11"
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              aria-label={showPw ? "Passwort verbergen" : "Passwort anzeigen"}
              className="absolute right-2 top-1/2 grid size-8 -translate-y-1/2 place-content-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>

        <label className="flex w-fit cursor-pointer items-center gap-2 text-sm">
          <Checkbox name="remember" defaultChecked />
          Angemeldet bleiben
        </label>

        {state.error && <ErrorBanner text={state.error} />}

        <Button
          type="submit"
          disabled={pending}
          className="h-12 w-full rounded-xl text-base"
        >
          {pending && <Loader2 className="size-4 animate-spin" />}
          Anmelden
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Noch kein Konto?{" "}
        <Link
          href="/registrieren"
          className="font-medium text-primary hover:underline"
        >
          Jetzt registrieren
        </Link>
      </p>

      <p className="mt-4 text-center text-[11px] leading-relaxed text-muted-foreground">
        Mit der Anmeldung akzeptierst du unsere{" "}
        <Link href="/agb" className="underline hover:text-foreground">
          AGB
        </Link>{" "}
        und nimmst unsere{" "}
        <Link href="/datenschutz" className="underline hover:text-foreground">
          Datenschutzerklärung
        </Link>{" "}
        zur Kenntnis.
      </p>
    </div>
  );
}

function ErrorBanner({ text }: { text: string }) {
  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/8 px-3 py-2.5 text-sm text-destructive",
      )}
    >
      <AlertCircle className="mt-0.5 size-4 shrink-0" />
      <span>{text}</span>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" className="size-5" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.5-5.9 7.7-11.3 7.7-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 5.1 29.3 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21c0-1.2-.1-2.4-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C34 5.1 29.3 3 24 3 16.3 3 9.7 7.6 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 45c5.2 0 9.9-2 13.4-5.2l-6.2-5c-2 1.4-4.5 2.3-7.2 2.3-5.4 0-9.7-3.2-11.3-7.7l-6.5 5C9.5 40.4 16.2 45 24 45z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.2 5.5l6.2 5c-.4.4 6.7-4.9 6.7-14.5 0-1.2-.1-2.4-.4-3.5z"
      />
    </svg>
  );
}
