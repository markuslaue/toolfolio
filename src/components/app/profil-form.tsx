"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import {
  Camera,
  Info,
  KeyRound,
  ShieldCheck,
  LogOut,
  Laptop,
  Sun,
  Moon,
  Monitor,
  Globe,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import {
  savePersonalData,
  savePreferences,
  signOutAction,
  uploadAvatar,
  removeAvatar,
  type PersonalState,
  type ProfileState,
} from "@/app/app/einstellungen/actions";

type Initial = {
  firstName: string;
  lastName: string;
  email: string;
  rolle: string;
  locale: string;
  timezone: string;
  theme: string;
  numberFormat: string;
  currency: string;
  avatarUrl: string | null;
};

function Card({
  titel,
  beschreibung,
  children,
  footer,
}: {
  titel: string;
  beschreibung?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-[20px] border bg-card shadow-soft">
      <header className="border-b border-border/60 px-6 pb-4 pt-6">
        <h2 className="font-display text-lg font-semibold">{titel}</h2>
        {beschreibung && (
          <p className="mt-1 text-sm text-muted-foreground">{beschreibung}</p>
        )}
      </header>
      <div className="space-y-5 p-6">{children}</div>
      {footer && (
        <div className="flex items-center justify-end gap-2 border-t border-border/60 bg-muted/30 px-6 py-4">
          {footer}
        </div>
      )}
    </section>
  );
}

export function ProfilForm({
  initial,
  twoFactorActive,
}: {
  initial: Initial;
  twoFactorActive: boolean;
}) {
  // Persoenliche Daten (controlled, damit Initialen live mitlaufen)
  const [vorname, setVorname] = useState(initial.firstName);
  const [nachname, setNachname] = useState(initial.lastName);
  const [email, setEmail] = useState(initial.email);

  // Avatar
  const [avatar, setAvatar] = useState(initial.avatarUrl);
  const [avatarBusy, startAvatar] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);
  function onPickAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    const fd = new FormData();
    fd.set("avatar", f);
    startAvatar(async () => {
      const r = await uploadAvatar(fd);
      if (r.error) toast.error(r.error);
      else { setAvatar(r.url ?? null); toast.success("Profilbild aktualisiert"); }
    });
  }
  function onRemoveAvatar() {
    startAvatar(async () => {
      const r = await removeAvatar();
      if (r.error) toast.error(r.error);
      else { setAvatar(null); toast.success("Profilbild entfernt"); }
    });
  }

  const [personalState, personalAction, personalPending] = useActionState(
    savePersonalData,
    {} as PersonalState,
  );
  const [prefsState, prefsAction, prefsPending] = useActionState(
    savePreferences,
    {} as ProfileState,
  );

  useEffect(() => {
    if (personalState.ok) {
      toast.success("Gespeichert", {
        description: personalState.emailSent
          ? `Bestätigungslink an ${personalState.email} gesendet.`
          : "Persönliche Daten aktualisiert.",
      });
    } else if (personalState.error) {
      toast.error(personalState.error);
    }
  }, [personalState]);

  useEffect(() => {
    if (prefsState.ok) toast.success("Gespeichert", { description: "Darstellung aktualisiert." });
    else if (prefsState.error) toast.error(prefsState.error);
  }, [prefsState]);

  const initialen =
    `${vorname[0] ?? ""}${nachname[0] ?? ""}`.toUpperCase() || "?";

  // Praeferenzen (controlled + hidden inputs fuers Formular)
  const [locale, setLocale] = useState(initial.locale);
  const [timezone, setTimezone] = useState(initial.timezone);
  const [theme, setTheme] = useState(initial.theme);
  const [numberFormat, setNumberFormat] = useState(initial.numberFormat);
  const [currency, setCurrency] = useState(initial.currency);

  return (
    <div className="space-y-6">
      {/* Persoenliche Daten */}
      <form action={personalAction}>
        <Card
          titel="Persönliche Daten"
          beschreibung="So wirst du in Toolfolio angezeigt."
          footer={
            <Button type="submit" disabled={personalPending}>
              {personalPending && <Loader2 className="size-4 animate-spin" />}
              Speichern
            </Button>
          }
        >
          <div className="flex items-center gap-5">
            <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="hidden" onChange={onPickAvatar} />
            <div className="relative">
              {avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatar} alt="Profilbild" className="size-20 rounded-full object-cover" />
              ) : (
                <div className="grid size-20 place-items-center rounded-full bg-primary/15 font-display text-2xl font-semibold text-primary">
                  {initialen}
                </div>
              )}
              <button
                type="button"
                disabled={avatarBusy}
                onClick={() => fileRef.current?.click()}
                className="absolute -bottom-1 -right-1 grid size-8 place-items-center rounded-full border border-border bg-card text-muted-foreground shadow-soft hover:text-foreground"
                aria-label="Bild ändern"
              >
                {avatarBusy ? <Loader2 className="size-4 animate-spin" /> : <Camera className="size-4" />}
              </button>
            </div>
            <div>
              <div className="font-medium">
                {vorname} {nachname}
              </div>
              <div className="text-sm text-muted-foreground">{initial.rolle}</div>
              <div className="mt-1 flex items-center gap-3">
                <button type="button" disabled={avatarBusy} onClick={() => fileRef.current?.click()} className="text-xs font-medium text-primary hover:underline">
                  Bild ändern
                </button>
                {avatar && (
                  <button type="button" disabled={avatarBusy} onClick={onRemoveAvatar} className="text-xs font-medium text-muted-foreground hover:text-destructive">
                    Entfernen
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="first_name">Vorname</Label>
              <Input
                id="first_name"
                name="first_name"
                value={vorname}
                onChange={(e) => setVorname(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="last_name">Nachname</Label>
              <Input
                id="last_name"
                name="last_name"
                value={nachname}
                onChange={(e) => setNachname(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">Konto-E-Mail</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
              <Info className="mt-0.5 size-3.5 shrink-0" />
              Eine Änderung erfordert eine Bestätigung per Link an die neue Adresse.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label>Rolle</Label>
            <div className="flex h-9 items-center rounded-md border border-input bg-muted/40 px-3 text-sm text-muted-foreground">
              {initial.rolle}
            </div>
          </div>
        </Card>
      </form>

      {/* Sicherheit */}
      <SicherheitCard twoFactorActive={twoFactorActive} email={email} />

      {/* Sprache & Darstellung */}
      <form action={prefsAction}>
        <Card
          titel="Sprache & Darstellung"
          beschreibung="So sieht Toolfolio für dich aus."
          footer={
            <Button type="submit" disabled={prefsPending}>
              {prefsPending && <Loader2 className="size-4 animate-spin" />}
              Speichern
            </Button>
          }
        >
          <input type="hidden" name="locale" value={locale} />
          <input type="hidden" name="timezone" value={timezone} />
          <input type="hidden" name="theme" value={theme} />
          <input type="hidden" name="number_format" value={numberFormat} />
          <input type="hidden" name="currency" value={currency} />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Sprache</Label>
              <Select value={locale} onValueChange={setLocale}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="de">Deutsch</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Zeitzone</Label>
              <Select value={timezone} onValueChange={setTimezone}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Europe/Berlin">Europe/Berlin</SelectItem>
                  <SelectItem value="Europe/Vienna">Europe/Vienna</SelectItem>
                  <SelectItem value="Europe/Zurich">Europe/Zurich</SelectItem>
                  <SelectItem value="UTC">UTC</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Darstellung</Label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "hell", label: "Hell", icon: Sun },
                { id: "dunkel", label: "Dunkel", icon: Moon },
                { id: "system", label: "System", icon: Monitor },
              ].map((opt) => {
                const aktiv = theme === opt.id;
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setTheme(opt.id)}
                    className={cn(
                      "flex flex-col items-center gap-1.5 rounded-xl border px-3 py-3 text-sm font-medium transition-colors",
                      aktiv
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border bg-card text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <Icon className="size-4" />
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Zahlen- und Datumsformat</Label>
              <Select value={numberFormat} onValueChange={setNumberFormat}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="de">Deutsch (1.249,00 EUR, 14.08.2026)</SelectItem>
                  <SelectItem value="int">International (1,249.00 EUR, 2026-08-14)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Standardwährung</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EUR">Euro (EUR)</SelectItem>
                  <SelectItem value="USD">US-Dollar (USD)</SelectItem>
                  <SelectItem value="CHF">Schweizer Franken (CHF)</SelectItem>
                  <SelectItem value="GBP">Britisches Pfund (GBP)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-start gap-2 text-xs text-muted-foreground">
            <Globe className="mt-0.5 size-3.5 shrink-0" />
            Diese Einstellungen wirken sich auf alle Ansichten in deinem Konto aus.
          </div>
        </Card>
      </form>
    </div>
  );
}

/** Sicherheits-Karte: Passwort, 2FA (echtes TOTP), aktuelle Sitzung. */
function SicherheitCard({
  twoFactorActive,
  email,
}: {
  twoFactorActive: boolean;
  email: string;
}) {
  const [pwOpen, setPwOpen] = useState(false);
  const [pwBusy, setPwBusy] = useState(false);
  const [twoFA, setTwoFA] = useState(twoFactorActive);

  // 2FA-Setup
  const [setupOpen, setSetupOpen] = useState(false);
  const [qr, setQr] = useState<string | null>(null);
  const [secret, setSecret] = useState<string>("");
  const [factorId, setFactorId] = useState<string>("");
  const [code, setCode] = useState("");
  const [mfaBusy, setMfaBusy] = useState(false);

  async function changePassword(formData: FormData) {
    const current = String(formData.get("current") ?? "");
    const next = String(formData.get("next") ?? "");
    const repeat = String(formData.get("repeat") ?? "");
    if (next.length < 8) {
      toast.error("Das neue Passwort braucht mindestens 8 Zeichen.");
      return;
    }
    if (next !== repeat) {
      toast.error("Die beiden Passwörter stimmen nicht überein.");
      return;
    }
    setPwBusy(true);
    const sb = createClient();
    // Aktuelles Passwort verifizieren (Re-Auth), dann neu setzen.
    const { error: signInError } = await sb.auth.signInWithPassword({
      email,
      password: current,
    });
    if (signInError) {
      setPwBusy(false);
      toast.error("Das aktuelle Passwort ist nicht korrekt.");
      return;
    }
    const { error } = await sb.auth.updateUser({ password: next });
    setPwBusy(false);
    if (error) {
      toast.error("Das hat nicht geklappt. Bitte versuche es erneut.");
      return;
    }
    setPwOpen(false);
    toast.success("Passwort geaendert");
  }

  async function startEnroll() {
    setMfaBusy(true);
    const sb = createClient();
    const { data, error } = await sb.auth.mfa.enroll({ factorType: "totp" });
    setMfaBusy(false);
    if (error || !data) {
      setTwoFA(false);
      toast.error("Zwei-Faktor konnte nicht gestartet werden.");
      return;
    }
    setFactorId(data.id);
    setQr(data.totp.qr_code);
    setSecret(data.totp.secret);
    setSetupOpen(true);
  }

  async function confirmEnroll() {
    setMfaBusy(true);
    const sb = createClient();
    const { data: challenge, error: chErr } = await sb.auth.mfa.challenge({
      factorId,
    });
    if (chErr || !challenge) {
      setMfaBusy(false);
      toast.error("Bitte versuche es erneut.");
      return;
    }
    const { error } = await sb.auth.mfa.verify({
      factorId,
      challengeId: challenge.id,
      code: code.replace(/\s/g, ""),
    });
    setMfaBusy(false);
    if (error) {
      toast.error("Der Code stimmt nicht. Bitte prüfe ihn.");
      return;
    }
    setSetupOpen(false);
    setCode("");
    setTwoFA(true);
    toast.success("Zwei-Faktor aktiviert");
  }

  async function cancelEnroll() {
    if (factorId) {
      const sb = createClient();
      await sb.auth.mfa.unenroll({ factorId });
    }
    setSetupOpen(false);
    setCode("");
    setTwoFA(false);
  }

  async function disable2FA() {
    setMfaBusy(true);
    const sb = createClient();
    const { data } = await sb.auth.mfa.listFactors();
    const verified = (data?.totp ?? []).filter((f) => f.status === "verified");
    for (const f of verified) {
      await sb.auth.mfa.unenroll({ factorId: f.id });
    }
    setMfaBusy(false);
    setTwoFA(false);
    toast.success("Zwei-Faktor deaktiviert");
  }

  return (
    <Card titel="Sicherheit" beschreibung="Schütze dein Konto.">
      {/* Passwort */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary">
            <KeyRound className="size-4" />
          </div>
          <div>
            <div className="text-sm font-medium">Passwort</div>
            <div className="text-xs text-muted-foreground">
              Wähle ein sicheres Passwort für dein Konto.
            </div>
          </div>
        </div>
        <Button variant="outline" onClick={() => setPwOpen(true)}>
          Passwort ändern
        </Button>
      </div>

      {/* 2FA */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-5">
        <div className="flex items-start gap-3">
          <div className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary">
            <ShieldCheck className="size-4" />
          </div>
          <div>
            <div className="text-sm font-medium">Zwei-Faktor-Authentifizierung</div>
            <div className="max-w-md text-xs text-muted-foreground">
              Zusätzlicher Code per App beim Login. Empfohlen für Inhaber-Konten.
            </div>
          </div>
        </div>
        <Switch
          checked={twoFA}
          disabled={mfaBusy}
          onCheckedChange={(v) => {
            setTwoFA(v);
            if (v) startEnroll();
            else disable2FA();
          }}
        />
      </div>

      {/* Aktuelle Sitzung */}
      <div className="border-t border-border/60 pt-5">
        <div className="mb-3 text-sm font-medium">Aktive Sitzung</div>
        <div className="flex items-center justify-between rounded-xl border border-border/60 bg-background/60 px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid size-9 place-items-center rounded-lg bg-muted text-muted-foreground">
              <Laptop className="size-4" />
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-medium">
                Dieses Gerät
                <span className="ml-2 inline-flex items-center rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-semibold text-success">
                  Aktiv jetzt
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                Aktuelle Anmeldung in diesem Browser
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end border-t border-border/60 pt-5">
        <form action={signOutAction}>
          <Button
            type="submit"
            variant="outline"
            className="gap-2 text-destructive hover:text-destructive"
          >
            <LogOut className="size-4" /> Von diesem Gerät abmelden
          </Button>
        </form>
      </div>

      {/* Passwort-Dialog */}
      <Dialog open={pwOpen} onOpenChange={setPwOpen}>
        <DialogContent>
          <form action={changePassword}>
            <DialogHeader>
              <DialogTitle>Passwort ändern</DialogTitle>
              <DialogDescription>
                Wähle ein neues, sicheres Passwort. Mindestens 8 Zeichen.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <div className="space-y-1.5">
                <Label htmlFor="pw-alt">Aktuelles Passwort</Label>
                <Input id="pw-alt" name="current" type="password" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pw-neu">Neues Passwort</Label>
                <Input id="pw-neu" name="next" type="password" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pw-wdh">Neues Passwort wiederholen</Label>
                <Input id="pw-wdh" name="repeat" type="password" required />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setPwOpen(false)}>
                Abbrechen
              </Button>
              <Button type="submit" disabled={pwBusy}>
                {pwBusy && <Loader2 className="size-4 animate-spin" />}
                Passwort speichern
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 2FA-Setup-Dialog */}
      <Dialog
        open={setupOpen}
        onOpenChange={(o) => {
          if (!o) cancelEnroll();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Zwei-Faktor einrichten</DialogTitle>
            <DialogDescription>
              Scanne den QR-Code mit deiner Authenticator-App und gib den
              6-stelligen Code ein.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-2">
            {qr ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={qr}
                alt="QR-Code für die Authenticator-App"
                className="size-44 rounded-xl border border-border bg-white p-2"
              />
            ) : (
              <div className="grid size-44 place-items-center rounded-xl border border-dashed text-xs text-muted-foreground">
                <Loader2 className="size-5 animate-spin" />
              </div>
            )}
            {secret && (
              <p className="text-center text-xs text-muted-foreground">
                Oder manuell eingeben:{" "}
                <span className="select-all font-mono text-foreground">{secret}</span>
              </p>
            )}
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              inputMode="numeric"
              placeholder="123 456"
              className="max-w-[180px] text-center tracking-widest"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={cancelEnroll} disabled={mfaBusy}>
              Abbrechen
            </Button>
            <Button onClick={confirmEnroll} disabled={mfaBusy || code.length < 6}>
              {mfaBusy && <Loader2 className="size-4 animate-spin" />}
              Aktivieren
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
