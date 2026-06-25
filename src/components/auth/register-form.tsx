"use client";

import { useActionState, useMemo, useState } from "react";
import Link from "next/link";
import {
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  Check,
  Gift,
  CreditCard,
  Clock,
  MailCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { signInWithGoogle } from "@/app/(auth)/login/actions";
import { register, type RegisterState } from "@/app/(auth)/registrieren/actions";
import { scorePassword, STRENGTH } from "@/lib/password-strength";

const initial: RegisterState = {};

export function RegisterForm({ redirectTo }: { redirectTo?: string }) {
  const [state, formAction, pending] = useActionState(register, initial);
  const [pw, setPw] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [accept, setAccept] = useState(false);

  const score = useMemo(() => scorePassword(pw), [pw]);

  // Erfolg: Bitte E-Mail bestaetigen
  if (state.pending) {
    return (
      <div className="rounded-3xl border bg-card p-7 text-center shadow-soft sm:p-8">
        <span className="mx-auto grid size-12 place-content-center rounded-2xl bg-success/10 text-success">
          <MailCheck className="size-6" />
        </span>
        <h1 className="mt-4 font-display text-2xl font-semibold">
          Fast geschafft
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Wir haben dir einen Bestätigungslink an{" "}
          <span className="font-medium text-foreground">{state.email}</span>{" "}
          geschickt. Bestätige deine E-Mail, dann geht es in dein Konto.
        </p>
        <p className="mt-3 text-xs text-muted-foreground">
          Nichts erhalten? Schau auch im Spam-Ordner.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-block text-sm font-medium text-primary hover:underline"
        >
          Zur Anmeldung
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border bg-card p-7 shadow-soft sm:p-8">
      <h1 className="font-display text-3xl font-semibold tracking-tight">
        Kostenlos starten
      </h1>
      <p className="mt-1.5 text-sm text-muted-foreground">
        Lege dein Toolfolio-Konto in unter einer Minute an.
      </p>

      {/* Trial-Hinweis */}
      <div className="mt-5 rounded-2xl border border-primary/20 bg-primary/8 p-4">
        <div className="flex items-start gap-3">
          <span className="grid size-9 shrink-0 place-content-center rounded-xl bg-primary/15 text-primary">
            <Gift className="size-4" />
          </span>
          <div className="text-sm">
            <div className="font-semibold text-foreground">
              14 Tage voller Agentur-Zugang
            </div>
            <p className="mt-0.5 text-muted-foreground">
              Danach wählst du deinen Plan oder bleibst auf Free.
            </p>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <CreditCard className="size-3" /> Keine Kreditkarte
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock className="size-3" /> Jederzeit kündbar
              </span>
              <span className="inline-flex items-center gap-1">
                <Check className="size-3" /> Alle Funktionen
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SSO (nur Google im MVP) */}
      <form action={signInWithGoogle} className="mt-6">
        <input type="hidden" name="redirect" value={redirectTo ?? ""} />
        <button
          type="submit"
          className="flex h-11 w-full items-center justify-center gap-3 rounded-xl border border-border bg-card text-sm font-medium transition-colors hover:bg-muted/60"
        >
          <GoogleIcon />
          Mit Google registrieren
        </button>
      </form>

      <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        oder mit E-Mail
        <span className="h-px flex-1 bg-border" />
      </div>

      <form action={formAction} className="space-y-4">
        <input type="hidden" name="redirect" value={redirectTo ?? ""} />
        {/* Einwilligung deterministisch aus dem Checkbox-Status uebertragen. */}
        <input type="hidden" name="consent" value={accept ? "on" : ""} />
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            autoComplete="name"
            placeholder="z. B. Mira Hoffmann"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1.5 h-11 rounded-xl"
          />
        </div>

        <div>
          <Label htmlFor="email">Geschäftliche E-Mail</Label>
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

        <div>
          <Label htmlFor="pw">Passwort</Label>
          <div className="relative mt-1.5">
            <Input
              id="pw"
              name="password"
              type={showPw ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Mindestens 8 Zeichen"
              required
              minLength={8}
              value={pw}
              onChange={(e) => setPw(e.target.value)}
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

          {/* Staerkeanzeige */}
          <div className="mt-2 flex items-center gap-2">
            <div className="flex flex-1 gap-1">
              {[0, 1, 2, 3].map((i) => (
                <span
                  key={i}
                  className={cn(
                    "h-1.5 flex-1 rounded-full transition-colors",
                    pw.length === 0
                      ? "bg-muted"
                      : i < score
                        ? STRENGTH[score].color
                        : "bg-muted",
                  )}
                />
              ))}
            </div>
            <span
              className={cn(
                "min-w-16 text-right text-xs",
                pw.length === 0 ? "text-muted-foreground" : STRENGTH[score].text,
              )}
            >
              {pw.length === 0 ? "Passwort" : STRENGTH[score].label}
            </span>
          </div>
          <p className="mt-1.5 text-[11px] text-muted-foreground">
            Tipp: mindestens 8 Zeichen, Gross- und Kleinschreibung, Zahl oder
            Sonderzeichen.
          </p>
        </div>

        <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-border/60 bg-muted/30 p-3 text-sm">
          <Checkbox
            checked={accept}
            onCheckedChange={(v) => setAccept(v === true)}
            className="mt-0.5"
          />
          <span className="text-foreground/90">
            Ich stimme den{" "}
            <Link href="/agb" className="text-primary underline hover:no-underline">
              AGB
            </Link>{" "}
            und der{" "}
            <Link
              href="/datenschutz"
              className="text-primary underline hover:no-underline"
            >
              Datenschutzerklärung
            </Link>{" "}
            zu.
          </span>
        </label>

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
          Konto erstellen
        </Button>

        <p className="text-center text-[11px] text-muted-foreground">
          Mit dem Klick auf &quot;Konto erstellen&quot; startest du deinen
          14-tägigen Trial. Keine Kreditkarte nötig.
        </p>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Schon ein Konto?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Anmelden
        </Link>
      </p>
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
