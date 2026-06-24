import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import {
  Mail,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Send,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

import { AuthShell } from "./auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type Mode = "pending" | "success" | "expired" | "already-verified";

const MODES: { id: Mode; label: string }[] = [
  { id: "pending", label: "Ausstehend" },
  { id: "success", label: "Erfolgreich" },
  { id: "expired", label: "Abgelaufen" },
  { id: "already-verified", label: "Bereits bestätigt" },
];

export function EmailVerifyPage() {
  const [mode, setMode] = useState<Mode>("pending");
  const [email, setEmail] = useState("du@agentur.de");

  return (
    <AuthShell>
      {mode === "pending" && (
        <PendingCard
          email={email}
          onEmailChange={setEmail}
          onVerified={() => setMode("success")}
        />
      )}
      {mode === "success" && <SuccessCard />}
      {mode === "expired" && (
        <ExpiredCard
          email={email}
          onEmailChange={setEmail}
          onRetry={() => setMode("pending")}
        />
      )}
      {mode === "already-verified" && <AlreadyVerifiedCard />}

      {/* Demo-Umschalter */}
      <div className="mt-4 rounded-2xl border border-dashed border-border bg-card/60 p-3">
        <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
          Demo-Zustände
        </div>
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

/* ---------- Zustand 1: Bestätigung ausstehend ---------- */
function PendingCard({
  email,
  onEmailChange,
  onVerified,
}: {
  email: string;
  onEmailChange: (v: string) => void;
  onVerified: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [editing, setEditing] = useState(false);
  const [newEmail, setNewEmail] = useState(email);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  async function resend() {
    if (cooldown > 0 || loading) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    setLoading(false);
    setCooldown(45);
    toast.success("Bestätigungslink erneut gesendet.");
  }

  async function saveEmail(e: React.FormEvent) {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      toast.error("Bitte gib eine gültige E-Mail-Adresse ein.");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    setLoading(false);
    onEmailChange(newEmail);
    setEditing(false);
    toast.success("E-Mail-Adresse aktualisiert. Link wird an die neue Adresse gesendet.");
  }

  return (
    <Card>
      <div className="text-center">
        <span className="mx-auto grid size-14 place-content-center rounded-2xl bg-primary/15 text-primary">
          <Mail className="size-7" />
        </span>
        <h1 className="mt-4 font-display text-2xl font-semibold tracking-tight">
          Bestätige deine E-Mail
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Wir haben einen Bestätigungslink an{" "}
          <span className="font-medium text-foreground">{email}</span> geschickt.
          Bitte klicke auf den Link in der E-Mail, um dein Konto freizuschalten.
        </p>
      </div>

      <div className="mt-6 rounded-xl border border-border/60 bg-muted/40 p-3 text-xs text-muted-foreground">
        <div className="flex items-start gap-2">
          <Sparkles className="mt-0.5 size-3.5 shrink-0 text-primary" />
          <span>
            Dein Zugang bleibt bis zur Bestätigung eingeschränkt. Erst danach kannst du
            den Onboarding-Wizard starten und alle Funktionen nutzen.
          </span>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        <Button
          onClick={resend}
          disabled={loading || cooldown > 0}
          variant="outline"
          className="h-11 w-full rounded-xl"
        >
          {loading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
          {cooldown > 0 ? `Erneut senden in ${cooldown}s` : "E-Mail erneut senden"}
        </Button>

        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="block w-full text-center text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
          >
            Falsche Adresse? E-Mail ändern
          </button>
        ) : (
          <form onSubmit={saveEmail} className="space-y-2">
            <div>
              <Label htmlFor="email" className="text-xs">
                Neue E-Mail-Adresse
              </Label>
              <Input
                id="email"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="mt-1 h-10 rounded-xl"
                placeholder="du@agentur.de"
              />
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setEditing(false);
                  setNewEmail(email);
                }}
                className="h-9 flex-1 rounded-lg text-xs"
              >
                Abbrechen
              </Button>
              <Button
                type="submit"
                disabled={loading}
                size="sm"
                className="h-9 flex-1 rounded-lg text-xs"
              >
                {loading && <Loader2 className="size-3.5 animate-spin" />}
                Speichern
              </Button>
            </div>
          </form>
        )}
      </div>

      {/* Demo: Verifizieren simulieren */}
      <button
        onClick={onVerified}
        className="mt-4 block w-full text-center text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
      >
        Demo: Link geklickt
      </button>
    </Card>
  );
}

/* ---------- Zustand 2: Erfolgreich verifiziert ---------- */
function SuccessCard() {
  return (
    <Card>
      <div className="text-center">
        <span className="mx-auto grid size-14 place-content-center rounded-2xl bg-success/15 text-success">
          <CheckCircle2 className="size-7" />
        </span>
        <h1 className="mt-4 font-display text-2xl font-semibold tracking-tight">
          E-Mail bestätigt
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Dein Konto ist startklar. Du kannst jetzt loslegen und Toolfolio einrichten.
        </p>
        <Button asChild className="mt-6 h-12 w-full rounded-xl text-base">
          <Link to="/onboarding">Weiter</Link>
        </Button>
        <Link
          to="/dashboard"
          className="mt-3 block text-center text-xs text-muted-foreground hover:text-foreground"
        >
          Zum Dashboard überspringen
        </Link>
      </div>
    </Card>
  );
}

/* ---------- Zustand 3: Link abgelaufen oder ungültig ---------- */
function ExpiredCard({
  email,
  onEmailChange,
  onRetry,
}: {
  email: string;
  onEmailChange: (v: string) => void;
  onRetry: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [newEmail, setNewEmail] = useState(email);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      toast.error("Bitte gib eine gültige E-Mail-Adresse ein.");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    setLoading(false);
    onEmailChange(newEmail);
    toast.success("Neuer Bestätigungslink gesendet.");
    onRetry();
  }

  return (
    <Card>
      <div className="text-center">
        <span className="mx-auto grid size-14 place-content-center rounded-2xl bg-warning/15 text-warning">
          <AlertTriangle className="size-7" />
        </span>
        <h1 className="mt-4 font-display text-2xl font-semibold tracking-tight">
          Link abgelaufen
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Dieser Bestätigungslink ist nicht mehr gültig. Fordere einfach einen neuen Link an.
        </p>
      </div>

      <form onSubmit={submit} className="mt-6 space-y-4">
        <div>
          <Label htmlFor="expired-email">E-Mail-Adresse</Label>
          <Input
            id="expired-email"
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            className="mt-1.5 h-11 rounded-xl"
            placeholder="du@agentur.de"
          />
        </div>
        <Button type="submit" disabled={loading} className="h-12 w-full rounded-xl text-base">
          {loading && <Loader2 className="size-4 animate-spin" />}
          Neuen Bestätigungslink anfordern
        </Button>
      </form>
    </Card>
  );
}

/* ---------- Zustand 4: Bereits bestätigt ---------- */
function AlreadyVerifiedCard() {
  return (
    <Card>
      <div className="text-center">
        <span className="mx-auto grid size-14 place-content-center rounded-2xl bg-success/15 text-success">
          <CheckCircle2 className="size-7" />
        </span>
        <h1 className="mt-4 font-display text-2xl font-semibold tracking-tight">
          Diese E-Mail ist bereits bestätigt
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Du kannst dich jetzt direkt anmelden oder zu deinem Dashboard wechseln.
        </p>
        <div className="mt-6 space-y-2.5">
          <Button asChild className="h-11 w-full rounded-xl">
            <Link to="/auth/login">Zur Anmeldung</Link>
          </Button>
          <Button asChild variant="outline" className="h-11 w-full rounded-xl">
            <Link to="/dashboard">Zum Dashboard</Link>
          </Button>
        </div>
        <Link
          to="/"
          className="mt-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" /> Zurück zur Startseite
        </Link>
      </div>
    </Card>
  );
}

/* ---------- Bausteine ---------- */
function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border bg-card p-7 shadow-soft sm:p-8">
      {children}
    </div>
  );
}
