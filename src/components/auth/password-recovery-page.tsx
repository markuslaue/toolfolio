import { useMemo, useState, useEffect } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Eye, EyeOff, Loader2, AlertCircle, ArrowLeft, MailCheck, CheckCircle2, KeyRound, TimerReset,
} from "lucide-react";
import { toast } from "sonner";

import { AuthShell } from "./auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type Mode = "request" | "sent" | "reset" | "success" | "expired";

const MODES: { id: Mode; label: string }[] = [
  { id: "request", label: "Anfordern" },
  { id: "sent", label: "Bestätigung" },
  { id: "reset", label: "Neues Passwort" },
  { id: "success", label: "Erfolg" },
  { id: "expired", label: "Link abgelaufen" },
];

function scorePassword(pw: string) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (pw.length >= 12) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return Math.min(s, 4);
}
const STRENGTH = [
  { label: "Zu schwach", color: "bg-destructive", text: "text-destructive" },
  { label: "Schwach", color: "bg-destructive", text: "text-destructive" },
  { label: "Mittel", color: "bg-warning", text: "text-warning" },
  { label: "Stark", color: "bg-success", text: "text-success" },
  { label: "Sehr stark", color: "bg-success", text: "text-success" },
];

export function PasswordRecoveryPage() {
  const [mode, setMode] = useState<Mode>("request");

  return (
    <AuthShell>
      {mode === "request" && <RequestCard onSent={() => setMode("sent")} />}
      {mode === "sent" && <SentCard />}
      {mode === "reset" && <ResetCard onSuccess={() => setMode("success")} />}
      {mode === "success" && <SuccessCard />}
      {mode === "expired" && <ExpiredCard onRetry={() => setMode("request")} />}

      {/* Demo-Umschalter */}
      <div className="mt-4 rounded-2xl border border-dashed border-border bg-card/60 p-3">
        <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Demo-Zustände</div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {MODES.map((m) => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={cn(
                "rounded-lg px-2.5 py-1 text-xs transition-colors",
                mode === m.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/70",
              )}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>
    </AuthShell>
  );
}

/* ---------- Zustand 1: anfordern ---------- */
function RequestCard({ onSent }: { onSent: () => void }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return setErr("Bitte gib eine gültige E-Mail-Adresse ein.");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    onSent();
  }

  return (
    <Card>
      <BackLink />
      <h1 className="font-display text-3xl font-semibold tracking-tight">Passwort vergessen?</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">
        Gib deine E-Mail ein, wir senden dir einen Link zum Zurücksetzen.
      </p>

      <form onSubmit={submit} className="mt-6 space-y-4">
        <div>
          <Label htmlFor="email">E-Mail</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="du@agentur.de"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1.5 h-11 rounded-xl"
          />
        </div>

        {err && <ErrorBanner text={err} />}

        <Button type="submit" disabled={loading} className="h-12 w-full rounded-xl text-base">
          {loading && <Loader2 className="size-4 animate-spin" />}
          Link senden
        </Button>
      </form>
    </Card>
  );
}

/* ---------- Zustand 2: neutrale Bestätigung ---------- */
function SentCard() {
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  function resend() {
    if (cooldown > 0) return;
    toast.success("Link erneut gesendet (sofern ein Konto existiert).");
    setCooldown(30);
  }

  return (
    <Card>
      <BackLink />
      <div className="flex items-start gap-3">
        <span className="grid size-11 shrink-0 place-content-center rounded-2xl bg-success/15 text-success">
          <MailCheck className="size-5" />
        </span>
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">E-Mail unterwegs</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Falls ein Konto mit dieser E-Mail existiert, haben wir dir einen Link zum Zurücksetzen
            geschickt. Schau bitte auch im Spam-Ordner nach.
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-2.5">
        <Button
          onClick={resend}
          disabled={cooldown > 0}
          variant="outline"
          className="h-11 w-full rounded-xl"
        >
          <TimerReset className="size-4" />
          {cooldown > 0 ? `Erneut senden in ${cooldown}s` : "Link erneut senden"}
        </Button>
        <Button asChild className="h-11 w-full rounded-xl">
          <Link to="/auth/login">Zurück zur Anmeldung</Link>
        </Button>
      </div>
    </Card>
  );
}

/* ---------- Zustand 3: neues Passwort ---------- */
function ResetCard({ onSuccess }: { onSuccess: () => void }) {
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const score = useMemo(() => scorePassword(pw), [pw]);
  const match = pw.length > 0 && pw === pw2;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (score < 2) return setErr("Dein Passwort ist zu schwach. Mindestens 8 Zeichen mit Buchstaben und Zahlen.");
    if (!match) return setErr("Die beiden Passwörter stimmen nicht überein.");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    onSuccess();
  }

  return (
    <Card>
      <div className="flex items-start gap-3">
        <span className="grid size-11 shrink-0 place-content-center rounded-2xl bg-primary/15 text-primary">
          <KeyRound className="size-5" />
        </span>
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">Neues Passwort festlegen</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Wähle ein starkes Passwort, das du noch nicht für andere Dienste nutzt.
          </p>
        </div>
      </div>

      <form onSubmit={submit} className="mt-6 space-y-4">
        <div>
          <Label htmlFor="pw">Neues Passwort</Label>
          <div className="relative mt-1.5">
            <Input
              id="pw"
              type={show ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Mindestens 8 Zeichen"
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
                    pw.length === 0 ? "bg-muted" : i < score ? STRENGTH[score].color : "bg-muted",
                  )}
                />
              ))}
            </div>
            <span className={cn("min-w-16 text-right text-xs", pw.length === 0 ? "text-muted-foreground" : STRENGTH[score].text)}>
              {pw.length === 0 ? "Passwort" : STRENGTH[score].label}
            </span>
          </div>
        </div>

        <div>
          <Label htmlFor="pw2">Passwort wiederholen</Label>
          <Input
            id="pw2"
            type={show ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Gleiches Passwort erneut eingeben"
            value={pw2}
            onChange={(e) => setPw2(e.target.value)}
            className={cn(
              "mt-1.5 h-11 rounded-xl",
              pw2.length > 0 && !match && "border-destructive/60 focus-visible:ring-destructive",
            )}
          />
          {pw2.length > 0 && (
            <p className={cn("mt-1.5 inline-flex items-center gap-1.5 text-xs", match ? "text-success" : "text-destructive")}>
              {match ? <CheckCircle2 className="size-3.5" /> : <AlertCircle className="size-3.5" />}
              {match ? "Passwörter stimmen überein" : "Passwörter stimmen nicht überein"}
            </p>
          )}
        </div>

        {err && <ErrorBanner text={err} />}

        <Button type="submit" disabled={loading} className="h-12 w-full rounded-xl text-base">
          {loading && <Loader2 className="size-4 animate-spin" />}
          Passwort speichern
        </Button>
      </form>
    </Card>
  );
}

/* ---------- Zustand 4: Erfolg ---------- */
function SuccessCard() {
  const navigate = useNavigate();
  return (
    <Card>
      <div className="text-center">
        <span className="mx-auto grid size-14 place-content-center rounded-2xl bg-success/15 text-success">
          <CheckCircle2 className="size-7" />
        </span>
        <h1 className="mt-4 font-display text-2xl font-semibold tracking-tight">
          Dein Passwort wurde geändert
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Du kannst dich jetzt mit deinem neuen Passwort anmelden.
        </p>
        <Button
          onClick={() => navigate({ to: "/auth/login" })}
          className="mt-6 h-11 w-full rounded-xl"
        >
          Zur Anmeldung
        </Button>
      </div>
    </Card>
  );
}

/* ---------- Zustand 5: abgelaufener Link ---------- */
function ExpiredCard({ onRetry }: { onRetry: () => void }) {
  return (
    <Card>
      <div className="text-center">
        <span className="mx-auto grid size-14 place-content-center rounded-2xl bg-warning/15 text-warning">
          <TimerReset className="size-7" />
        </span>
        <h1 className="mt-4 font-display text-2xl font-semibold tracking-tight">
          Link abgelaufen oder ungültig
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Dieser Reset-Link ist nicht mehr gültig. Fordere bitte einen neuen Link an.
        </p>
        <div className="mt-6 space-y-2">
          <Button onClick={onRetry} className="h-11 w-full rounded-xl">
            Neuen Link anfordern
          </Button>
          <Button asChild variant="outline" className="h-11 w-full rounded-xl">
            <Link to="/auth/login">Zurück zur Anmeldung</Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}

/* ---------- Bausteine ---------- */
function Card({ children }: { children: React.ReactNode }) {
  return <div className="rounded-3xl border bg-card p-7 shadow-soft sm:p-8">{children}</div>;
}

function BackLink() {
  return (
    <Link
      to="/auth/login"
      className="mb-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
    >
      <ArrowLeft className="size-3.5" /> Zurück zur Anmeldung
    </Link>
  );
}

function ErrorBanner({ text }: { text: string }) {
  return (
    <div
      role="alert"
      className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/8 px-3 py-2.5 text-sm text-destructive"
    >
      <AlertCircle className="mt-0.5 size-4 shrink-0" />
      <span>{text}</span>
    </div>
  );
}
