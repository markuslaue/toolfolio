"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { Mail, AlertTriangle, Loader2, AlertCircle, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  resendVerification,
  changeEmail,
  type VerifyState,
} from "@/app/(auth)/verifizieren/actions";

const initial: VerifyState = {};

export function VerifyEmailPanel({
  mode,
  email,
}: {
  mode: "pending" | "expired";
  email?: string;
}) {
  const [resendState, resendAction, resending] = useActionState(
    resendVerification,
    initial,
  );
  const [changeState, changeAction, changing] = useActionState(
    changeEmail,
    initial,
  );
  const [cooldown, setCooldown] = useState(0);
  const [showChange, setShowChange] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const sentNote = resendState.sent || changeState.sent;
  const err = resendState.error || changeState.error;

  return (
    <div className="rounded-3xl border bg-card p-7 text-center shadow-soft sm:p-8">
      <span
        className={
          mode === "expired"
            ? "mx-auto grid size-12 place-content-center rounded-2xl bg-warning/10 text-warning"
            : "mx-auto grid size-12 place-content-center rounded-2xl bg-primary/10 text-primary"
        }
      >
        {mode === "expired" ? (
          <AlertTriangle className="size-6" />
        ) : (
          <Mail className="size-6" />
        )}
      </span>

      <h1 className="mt-4 font-display text-2xl font-semibold tracking-tight">
        {mode === "expired" ? "Link abgelaufen" : "Bestätige deine E-Mail"}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {mode === "expired"
          ? "Der Bestätigungslink ist nicht mehr gültig. Wir senden dir einen neuen."
          : "Bitte klicke auf den Link in der E-Mail, um dein Konto freizuschalten."}
        {mode === "pending" && email ? (
          <>
            {" "}
            Gesendet an{" "}
            <span className="font-medium text-foreground">{email}</span>.
          </>
        ) : null}
      </p>

      {sentNote && (
        <div className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-success/30 bg-success/10 px-3 py-2.5 text-sm text-success">
          <Check className="size-4 shrink-0" />
          <span>
            {changeState.changed
              ? "Adresse aktualisiert, Link an die neue Adresse gesendet."
              : "Bestätigungslink erneut gesendet."}
          </span>
        </div>
      )}
      {err && (
        <div
          role="alert"
          className="mt-4 flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/8 px-3 py-2.5 text-left text-sm text-destructive"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{err}</span>
        </div>
      )}

      {/* Resend */}
      <form
        action={resendAction}
        onSubmit={() => setCooldown(30)}
        className="mt-6 space-y-3 text-left"
      >
        {mode === "expired" && (
          <div>
            <Label htmlFor="email">E-Mail-Adresse</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              placeholder="du@agentur.de"
              className="mt-1.5 h-11 rounded-xl"
            />
          </div>
        )}
        <Button
          type="submit"
          disabled={resending || cooldown > 0}
          className="h-11 w-full rounded-xl"
        >
          {resending && <Loader2 className="size-4 animate-spin" />}
          {cooldown > 0
            ? `Erneut senden in ${cooldown}s`
            : mode === "expired"
              ? "Neuen Link senden"
              : "E-Mail erneut senden"}
        </Button>
      </form>

      {/* E-Mail aendern (nur ausstehend) */}
      {mode === "pending" && (
        <div className="mt-3">
          {!showChange ? (
            <button
              type="button"
              onClick={() => setShowChange(true)}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Falsche Adresse? E-Mail ändern
            </button>
          ) : (
            <form action={changeAction} className="space-y-2 text-left">
              <Label htmlFor="new-email">Neue E-Mail-Adresse</Label>
              <Input
                id="new-email"
                name="email"
                type="email"
                required
                placeholder="neu@agentur.de"
                className="h-11 rounded-xl"
              />
              <Button
                type="submit"
                variant="outline"
                disabled={changing}
                className="h-11 w-full rounded-xl"
              >
                {changing && <Loader2 className="size-4 animate-spin" />}
                Adresse ändern und Link senden
              </Button>
            </form>
          )}
        </div>
      )}

      <Link
        href="/login"
        className="mt-6 inline-block text-sm text-muted-foreground hover:text-foreground"
      >
        Zur Anmeldung
      </Link>
    </div>
  );
}
