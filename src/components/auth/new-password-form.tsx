"use client";

import { useActionState, useMemo, useState } from "react";
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { scorePassword, STRENGTH } from "@/lib/password-strength";
import { setNewPassword, type NewPwState } from "@/app/(auth)/passwort-neu/actions";

const initial: NewPwState = {};

export function NewPasswordForm() {
  const [state, formAction, pending] = useActionState(setNewPassword, initial);
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [show, setShow] = useState(false);
  const score = useMemo(() => scorePassword(pw), [pw]);
  const mismatch = pw2.length > 0 && pw !== pw2;

  return (
    <div className="rounded-3xl border bg-card p-7 shadow-soft sm:p-8">
      <h1 className="font-display text-2xl font-semibold tracking-tight">
        Neues Passwort festlegen
      </h1>
      <p className="mt-1.5 text-sm text-muted-foreground">
        Wähle ein sicheres Passwort für dein Toolfolio-Konto.
      </p>

      <form action={formAction} className="mt-6 space-y-4">
        <div>
          <Label htmlFor="pw">Neues Passwort</Label>
          <div className="relative mt-1.5">
            <Input
              id="pw"
              name="password"
              type={show ? "text" : "password"}
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
              onClick={() => setShow((v) => !v)}
              aria-label={show ? "Passwort verbergen" : "Passwort anzeigen"}
              className="absolute right-2 top-1/2 grid size-8 -translate-y-1/2 place-content-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
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
        </div>

        <div>
          <Label htmlFor="pw2">Passwort wiederholen</Label>
          <Input
            id="pw2"
            name="password2"
            type={show ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Gleiches Passwort erneut eingeben"
            required
            value={pw2}
            onChange={(e) => setPw2(e.target.value)}
            className={cn(
              "mt-1.5 h-11 rounded-xl",
              mismatch && "border-destructive",
            )}
          />
          {mismatch && (
            <p className="mt-1.5 text-xs text-destructive">
              Die Passwörter stimmen nicht überein.
            </p>
          )}
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
          disabled={pending || mismatch}
          className="h-12 w-full rounded-xl text-base"
        >
          {pending && <Loader2 className="size-4 animate-spin" />}
          Passwort speichern
        </Button>
      </form>
    </div>
  );
}
