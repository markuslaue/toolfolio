"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  Check, ChevronLeft, ChevronRight, CreditCard, Landmark, Wallet, Coins, ShieldCheck,
  MoreHorizontal, Plus, X, Upload, Mail, ListPlus, Sparkles, PartyPopper, Trash2, Loader2,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { formatEur as euro } from "@/lib/constants";
import { KUNDE_FARBEN } from "@/lib/kunden";
import type { KanalTyp } from "@/lib/zahlungskanaele";
import { PROVIDERS, CAPABILITY_LABEL, CAPABILITY_STIL } from "@/lib/integrationen";
import { createKanal } from "@/app/app/zahlungskanaele/actions";
import { createKunde } from "@/app/app/kunden/actions";
import { finishOnboarding, onboardingBilanz, type Bilanz } from "@/app/app/onboarding/actions";
import { ImportFlow } from "@/components/app/import-flow";

type Profil = "solo" | "freelancer" | "agentur" | "unternehmen";
type ToolMenge = "unter_10" | "10_bis_30" | "30_bis_60" | "ueber_60";
type Erfassung = "import" | "inbox" | "manuell";

const PROFILE: { id: Profil; label: string }[] = [
  { id: "agentur", label: "Agentur" },
  { id: "freelancer", label: "Freelancer" },
  { id: "solo", label: "Solopreneur" },
  { id: "unternehmen", label: "Unternehmen" },
];

const MENGEN: { id: ToolMenge; label: string }[] = [
  { id: "unter_10", label: "unter 10" },
  { id: "10_bis_30", label: "10 bis 30" },
  { id: "30_bis_60", label: "30 bis 60" },
  { id: "ueber_60", label: "mehr als 60" },
];

/* Die Kanaele der Vorlage, abgebildet auf die Typen, die unsere Datenbank kennt. */
const KANAELE: { label: string; typ: KanalTyp; icon: typeof CreditCard }[] = [
  { label: "Firmenkreditkarte", typ: "kreditkarte", icon: CreditCard },
  { label: "SEPA-Lastschrift", typ: "sepa", icon: Landmark },
  { label: "PayPal", typ: "paypal", icon: Wallet },
  { label: "Stripe-Guthaben", typ: "stripe", icon: Coins },
  { label: "Paysafe", typ: "paysafe", icon: ShieldCheck },
  { label: "Anderes", typ: "anderes", icon: MoreHorizontal },
];

type Karte = { id: string; marke: "Visa" | "Mastercard" | "Amex"; last4: string };

export function OnboardingWizard({
  vorname,
  kanalOptionen,
  existingTools,
}: {
  vorname?: string;
  kanalOptionen: string[];
  existingTools: string[];
}) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [busy, startT] = useTransition();

  const [profil, setProfil] = useState<Profil | null>(null);
  const [toolMenge, setToolMenge] = useState<ToolMenge | null>(null);

  const [kanaele, setKanaele] = useState<string[]>([]);
  const [karten, setKarten] = useState<Karte[]>([]);
  const [gespeicherteKanaele, setGespeicherteKanaele] = useState<string[]>([]);

  const [erfassung, setErfassung] = useState<Erfassung | null>(null);
  const [importiert, setImportiert] = useState<number | null>(null);

  const [kunden, setKunden] = useState<string[]>([]);
  const [kundeInput, setKundeInput] = useState("");

  const zeigtKunden = profil === "agentur" || profil === "unternehmen";
  const zeigtPruefen = erfassung === "import";

  /* Interne Schritte: 1 Profil, 2 Zahlung, 3 Bestand, 4 Pruefen, 5 AI, 6 Kunden, 7 Fertig.
     Nicht jeder Schritt kommt vor: "Pruefen" nur beim Import, "Kunden" nur bei Agentur
     und Unternehmen. Die Anzeige zeigt deshalb nur den Weg, den DIESER Nutzer geht,
     statt ihm Schritte vorzugaukeln, die er nie sieht. */
  const labels = useMemo(
    () => [
      "Profil",
      "Zahlung",
      "Bestand",
      ...(zeigtPruefen ? ["Prüfen"] : []),
      "AI-Services",
      ...(zeigtKunden ? ["Kunden"] : []),
      "Fertig",
    ],
    [zeigtPruefen, zeigtKunden],
  );

  const sichtbarerSchritt = useMemo(() => {
    const echt: number[] = [1, 2, 3, ...(zeigtPruefen ? [4] : []), 5, ...(zeigtKunden ? [6] : []), 7];
    const i = echt.indexOf(step);
    return i === -1 ? 1 : i + 1;
  }, [step, zeigtPruefen, zeigtKunden]);

  const weiter = () => {
    if (step === 3) setStep(zeigtPruefen ? 4 : 5);
    else if (step === 4) setStep(5);
    else if (step === 5) setStep(zeigtKunden ? 6 : 7);
    else setStep((s) => Math.min(7, s + 1));
  };
  const zurueck = () => {
    if (step === 7) setStep(zeigtKunden ? 6 : 5);
    else if (step === 5) setStep(zeigtPruefen ? 4 : 3);
    else setStep((s) => Math.max(1, s - 1));
  };

  function beenden(ziel = "/app") {
    startT(async () => {
      await finishOnboarding({ segment: profil, tool_menge: toolMenge });
      router.push(ziel);
      router.refresh();
    });
  }

  const kanalToggle = (label: string) =>
    setKanaele((k) => (k.includes(label) ? k.filter((x) => x !== label) : [...k, label]));

  /** Die gewaehlten Kanaele wirklich anlegen, bevor es weitergeht. */
  function kanaeleSpeichernUndWeiter() {
    startT(async () => {
      for (const label of kanaele) {
        if (gespeicherteKanaele.includes(label)) continue;
        const def = KANAELE.find((k) => k.label === label);
        if (!def) continue;
        // Die Kreditkarte wird ueber die Kartenliste angelegt, nicht als leerer Kanal.
        if (label === "Firmenkreditkarte") continue;
        const res = await createKanal({ typ: def.typ, bezeichnung: label, last4: "", iban_last4: "", aktiv: true });
        if (res.error) {
          toast.error(res.error);
          return;
        }
        setGespeicherteKanaele((g) => [...g, label]);
      }
      weiter();
    });
  }

  function karteHinzu(marke: Karte["marke"], last4: string) {
    startT(async () => {
      const bez = `${marke} •••• ${last4}`;
      const res = await createKanal({ typ: "kreditkarte", bezeichnung: bez, last4, iban_last4: "", aktiv: true });
      if (res.error) {
        toast.error(res.error);
        return;
      }
      setKarten((k) => [...k, { id: bez, marke, last4 }]);
      toast.success("Karte hinterlegt");
    });
  }

  function kundeHinzu() {
    const name = kundeInput.trim();
    if (!name || kunden.includes(name)) return;
    startT(async () => {
      const res = await createKunde({ name, farbe: KUNDE_FARBEN[kunden.length % KUNDE_FARBEN.length] });
      if (res.error) {
        toast.error(res.error);
        return;
      }
      setKunden((k) => [...k, name]);
      setKundeInput("");
    });
  }

  const weiterGesperrt =
    (step === 1 && (!profil || !toolMenge)) ||
    (step === 2 && kanaele.length === 0) ||
    (step === 3 && erfassung === null);

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="flex items-center justify-between px-6 py-6 md:px-10">
        <div className="flex items-center gap-2">
          <div className="grid size-9 place-items-center rounded-xl bg-primary font-display font-bold text-primary-foreground">T</div>
          <span className="font-display text-xl font-semibold">Toolfolio</span>
        </div>
        <button onClick={() => beenden()} disabled={busy} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
          Später erledigen
        </button>
      </header>

      <div className="px-4 pb-6 pt-2 md:px-10">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-center justify-between gap-2">
            {labels.map((label, i) => {
              const idx = i + 1;
              const fertig = idx < sichtbarerSchritt;
              const aktiv = idx === sichtbarerSchritt;
              return (
                <div key={label} className="flex min-w-0 flex-1 items-center gap-2">
                  <div
                    className={cn(
                      "grid size-8 shrink-0 place-items-center rounded-full text-xs font-semibold transition-colors",
                      fertig && "bg-success text-success-foreground",
                      aktiv && "bg-primary text-primary-foreground ring-4 ring-accent",
                      !fertig && !aktiv && "bg-secondary text-muted-foreground",
                    )}
                  >
                    {fertig ? <Check className="size-4" /> : idx}
                  </div>
                  <span className={cn("hidden truncate text-sm md:inline", aktiv ? "font-medium text-foreground" : "text-muted-foreground")}>
                    {label}
                  </span>
                  {i < labels.length - 1 && <div className="mx-1 h-px flex-1 bg-border" />}
                </div>
              );
            })}
          </div>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Schritt {sichtbarerSchritt} von {labels.length}
          </p>
        </div>
      </div>

      <main className="px-4 pb-16 md:px-6">
        <div key={step} className="mx-auto max-w-3xl">
          <div className="rounded-3xl bg-card p-6 shadow-soft md:p-10">
            {step === 1 && (
              <Schritt1 vorname={vorname} profil={profil} setProfil={setProfil} menge={toolMenge} setMenge={setToolMenge} />
            )}
            {step === 2 && (
              <Schritt2
                gewaehlt={kanaele}
                toggle={kanalToggle}
                karten={karten}
                onKarte={karteHinzu}
                onKarteWeg={(id) => setKarten((k) => k.filter((x) => x.id !== id))}
                busy={busy}
              />
            )}
            {step === 3 && <Schritt3 erfassung={erfassung} setErfassung={setErfassung} />}
            {step === 4 && (
              <div className="space-y-5">
                <div className="space-y-2">
                  <h2 className="font-display text-2xl font-bold md:text-3xl">Das haben wir gefunden. Stimmt das?</h2>
                  <p className="text-muted-foreground">
                    Kurz prüfen, korrigieren, fertig. Den Rest erledigst du später jederzeit.
                  </p>
                </div>
                <ImportFlow
                  kanalOptionen={[...kanalOptionen, ...karten.map((k) => `${k.marke} •••• ${k.last4}`)]}
                  existingTools={existingTools}
                  onFertig={(n) => {
                    setImportiert(n);
                    setStep(5);
                  }}
                />
              </div>
            )}
            {step === 5 && <SchrittAi />}
            {step === 6 && zeigtKunden && (
              <Schritt6
                kunden={kunden}
                setKunden={setKunden}
                input={kundeInput}
                setInput={setKundeInput}
                onAdd={kundeHinzu}
                busy={busy}
              />
            )}
            {step === 7 && <SchrittFertig importiert={importiert} onDone={() => beenden()} busy={busy} />}
          </div>

          {step !== 7 && step !== 4 && (
            <div className="mt-6 flex items-center justify-between">
              <Button variant="ghost" onClick={zurueck} disabled={step === 1 || busy} className="rounded-full">
                <ChevronLeft className="size-4" /> Zurück
              </Button>
              <div className="flex items-center gap-2">
                {(step === 3 || step === 5 || step === 6) && (
                  <button
                    onClick={() => {
                      if (step === 3) setStep(5);
                      else if (step === 5) setStep(zeigtKunden ? 6 : 7);
                      else setStep(7);
                    }}
                    disabled={busy}
                    className="px-3 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {step === 5 ? "Später in den Integrationen erledigen" : "Überspringen, mache ich später"}
                  </button>
                )}
                <Button
                  onClick={step === 2 ? kanaeleSpeichernUndWeiter : weiter}
                  disabled={weiterGesperrt || busy}
                  className="h-11 rounded-2xl px-6 font-semibold"
                >
                  {busy && <Loader2 className="size-4 animate-spin" />}
                  {step === 1 ? "Los geht's" : "Weiter"}
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

/* ------------------------------------------------------------------- Kachel */

function Tile({
  active, onClick, children, icon, disabled,
}: {
  active?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "relative rounded-2xl border-2 bg-card px-4 py-4 text-left transition-all",
        disabled && "cursor-not-allowed opacity-60",
        !disabled && (active ? "border-primary bg-accent/50" : "border-border hover:border-primary/40"),
      )}
    >
      <div className="flex items-center gap-3">
        {icon && <span className="text-primary">{icon}</span>}
        <span className="font-medium">{children}</span>
      </div>
      {active && (
        <span className="absolute right-2 top-2 grid size-6 place-items-center rounded-full bg-primary text-primary-foreground">
          <Check className="size-3.5" />
        </span>
      )}
    </button>
  );
}

/* ----------------------------------------------------------------- Schritt 1 */

function Schritt1({
  vorname, profil, setProfil, menge, setMenge,
}: {
  vorname?: string;
  profil: Profil | null;
  setProfil: (p: Profil) => void;
  menge: ToolMenge | null;
  setMenge: (m: ToolMenge) => void;
}) {
  return (
    <div className="space-y-8">
      <div className="space-y-3 text-center">
        <h1 className="font-display text-3xl font-bold leading-tight md:text-4xl">
          Willkommen bei Toolfolio{vorname ? `, ${vorname}` : ""}.
          <br />
          Lass uns deinen Tool-Stack in den Griff bekommen.
        </h1>
        <p className="text-base text-muted-foreground md:text-lg">Das dauert keine drei Minuten.</p>
      </div>

      <div>
        <p className="mb-3 font-display text-lg font-semibold">Was beschreibt dich am besten?</p>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {PROFILE.map((p) => (
            <Tile key={p.id} active={profil === p.id} onClick={() => setProfil(p.id)}>
              {p.label}
            </Tile>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-3 font-display text-lg font-semibold">Wie viele Tools nutzt du ungefähr?</p>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {MENGEN.map((m) => (
            <Tile key={m.id} active={menge === m.id} onClick={() => setMenge(m.id)}>
              {m.label}
            </Tile>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------- Schritt 2 */

function Schritt2({
  gewaehlt, toggle, karten, onKarte, onKarteWeg, busy,
}: {
  gewaehlt: string[];
  toggle: (label: string) => void;
  karten: Karte[];
  onKarte: (marke: Karte["marke"], last4: string) => void;
  onKarteWeg: (id: string) => void;
  busy: boolean;
}) {
  const [marke, setMarke] = useState<Karte["marke"]>("Visa");
  const [last4, setLast4] = useState("");

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="font-display text-2xl font-bold md:text-3xl">Worüber zahlst du deine Tools?</h2>
        <p className="text-muted-foreground">
          Wenn wir alle Kanäle kennen, übersehen wir später nichts. Software wird oft über mehrere Wege abgebucht.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {KANAELE.map((k) => (
          <Tile key={k.label} active={gewaehlt.includes(k.label)} onClick={() => toggle(k.label)} icon={<k.icon className="size-5" />}>
            {k.label}
          </Tile>
        ))}
      </div>

      {gewaehlt.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {gewaehlt.map((k) => (
            <span key={k} className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-sm font-medium text-accent-foreground">
              {k}
              <button onClick={() => toggle(k)} className="hover:opacity-70">
                <X className="size-3.5" />
              </button>
            </span>
          ))}
        </div>
      )}

      {gewaehlt.includes("Firmenkreditkarte") && (
        <div className="space-y-4 rounded-2xl bg-secondary/60 p-5">
          <div className="flex items-start gap-2">
            <ShieldCheck className="mt-0.5 size-5 shrink-0 text-success" />
            <p className="text-sm text-muted-foreground">
              Wir speichern keine vollständigen Kartennummern, keine Prüfziffern und keine Logins. Nur die letzten vier
              Ziffern, damit du deine Karten auseinanderhalten kannst.
            </p>
          </div>

          {karten.length > 0 && (
            <div className="space-y-2">
              {karten.map((k) => (
                <div key={k.id} className="flex items-center justify-between rounded-xl bg-card px-4 py-3 shadow-soft">
                  <div className="flex items-center gap-3">
                    <CreditCard className="size-5 text-primary" />
                    <span className="font-medium tabular-nums">
                      {k.marke} •••• {k.last4}
                    </span>
                  </div>
                  <button onClick={() => onKarteWeg(k.id)} className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-col gap-2 md:flex-row">
            <select
              value={marke}
              onChange={(e) => setMarke(e.target.value as Karte["marke"])}
              className="h-11 rounded-xl border border-input bg-card px-3 text-sm font-medium"
            >
              <option>Visa</option>
              <option>Mastercard</option>
              <option>Amex</option>
            </select>
            <Input
              value={last4}
              onChange={(e) => setLast4(e.target.value.replace(/\D/g, "").slice(0, 4))}
              placeholder="Letzte 4 Ziffern"
              className="h-11 rounded-xl tabular-nums"
              maxLength={4}
            />
            <Button
              onClick={() => {
                onKarte(marke, last4);
                setLast4("");
              }}
              disabled={last4.length !== 4 || busy}
              variant="outline"
              className="h-11 rounded-xl border-primary text-primary hover:bg-accent"
            >
              <Plus className="size-4" /> Karte hinzufügen
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ----------------------------------------------------------------- Schritt 3 */

function Schritt3({
  erfassung, setErfassung,
}: {
  erfassung: Erfassung | null;
  setErfassung: (e: Erfassung) => void;
}) {
  const optionen: {
    id: Erfassung;
    titel: string;
    text: string;
    icon: typeof Upload;
    empfohlen?: boolean;
    bald?: boolean;
  }[] = [
    {
      id: "import",
      titel: "Kontoauszug importieren",
      text: "Lade deine letzten zwölf Monate als CSV, CAMT oder MT940 hoch, wir erkennen die wiederkehrenden Buchungen.",
      icon: Upload,
      empfohlen: true,
    },
    {
      id: "inbox",
      titel: "Beleg-Postfach verbinden",
      text: "Eine eigene Toolfolio-Adresse, an die Rechnungen gehen. Daran bauen wir gerade, es ist noch nicht verfügbar.",
      icon: Mail,
      bald: true,
    },
    {
      id: "manuell",
      titel: "Manuell hinzufügen",
      text: "Du legst deine Tools später einzeln im Tracker an. Dauert länger, findet aber nichts Vergessenes.",
      icon: ListPlus,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="font-display text-2xl font-bold md:text-3xl">Wie finden wir deine bestehenden Abos?</h2>
        <p className="text-muted-foreground">
          Wähle den Weg, der dir am leichtesten fällt. Du kannst die anderen jederzeit ergänzen.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {optionen.map((o) => {
          const aktiv = erfassung === o.id;
          return (
            <button
              key={o.id}
              onClick={() => !o.bald && setErfassung(o.id)}
              disabled={o.bald}
              className={cn(
                "relative rounded-2xl border-2 bg-card p-5 text-left transition-all",
                o.bald && "cursor-not-allowed opacity-60",
                !o.bald && (aktiv ? "border-primary bg-accent/40" : "border-border hover:border-primary/40"),
              )}
            >
              {o.empfohlen && (
                <span className="absolute -top-2.5 left-4 inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-0.5 text-xs font-semibold text-primary-foreground">
                  <Sparkles className="size-3" /> findet auch Vergessenes
                </span>
              )}
              {o.bald && (
                <span className="absolute -top-2.5 left-4 inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
                  <Clock className="size-3" /> in Vorbereitung
                </span>
              )}
              <div className="mb-3 grid size-11 place-items-center rounded-xl bg-accent text-primary">
                <o.icon className="size-5" />
              </div>
              <p className="mb-1 font-display text-lg font-semibold">{o.titel}</p>
              <p className="text-sm leading-snug text-muted-foreground">{o.text}</p>
            </button>
          );
        })}
      </div>

      {erfassung === "manuell" && (
        <div className="rounded-2xl bg-secondary/60 p-5 text-sm text-muted-foreground">
          Alles klar. Du legst deine Abos später im Tracker an, unter &bdquo;Abos&ldquo; und dann &bdquo;Abo
          anlegen&ldquo;. Den Kontoauszug-Import kannst du jederzeit nachholen.
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------- Schritt AI */

/**
 * AI-Services.
 *
 * EHRLICHKEIT: Die Vorlage zeigt hier fuenf KI-Anbieter (OpenAI, Anthropic, Gemini,
 * Perplexity, xAI) mit funktionierenden Verbinden-Knoepfen. Anschliessbar ist bei uns
 * bisher nur, was in PROVIDERS steht. Fuer den Rest waere ein Knopf, der nichts tut,
 * eine Luege. Deshalb steht dort, was stimmt: in Vorbereitung.
 * Der Live-Anschluss der KI-Anbieter ist als B-34 im Plan.
 */
const GEPLANT = [
  { name: "OpenAI", farbe: "#10a37f", initial: "O" },
  { name: "Anthropic (Claude)", farbe: "#cc785c", initial: "C" },
  { name: "Google Gemini", farbe: "#4285f4", initial: "G" },
  { name: "Perplexity", farbe: "#20808d", initial: "P" },
];

function SchrittAi() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="font-display text-2xl font-bold md:text-3xl">AI-Services verbinden (optional)</h2>
        <p className="text-muted-foreground">
          Wenn du KI-Tools nutzt, kannst du den Verbrauch live anbinden, statt ihn aus Rechnungen zu schätzen. Du kannst
          das überspringen und jederzeit in den Integrationen nachholen.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {PROVIDERS.map((p) => (
          <Link
            key={p.id}
            href="/app/einstellungen/integrationen"
            className="flex items-start gap-3 rounded-2xl border-2 border-border bg-card p-4 text-left transition-all hover:border-primary/40"
          >
            <div
              className="grid size-11 shrink-0 place-items-center rounded-xl font-display font-bold text-white"
              style={{ background: p.farbe }}
            >
              {p.name[0]}
            </div>
            <div className="min-w-0 flex-1">
              <span className="font-semibold">{p.name}</span>
              <span className={cn("mt-1 block w-fit rounded-full px-2 py-0.5 text-[10px] font-semibold", CAPABILITY_STIL[p.capability])}>
                {CAPABILITY_LABEL[p.capability]}
              </span>
              <p className="mt-2 text-xs text-muted-foreground">In den Integrationen verbinden.</p>
            </div>
          </Link>
        ))}

        {GEPLANT.map((p) => (
          <div
            key={p.name}
            className="flex cursor-not-allowed items-start gap-3 rounded-2xl border-2 border-border bg-card p-4 opacity-60"
          >
            <div
              className="grid size-11 shrink-0 place-items-center rounded-xl font-display font-bold text-white"
              style={{ background: p.farbe }}
            >
              {p.initial}
            </div>
            <div className="min-w-0 flex-1">
              <span className="font-semibold">{p.name}</span>
              <span className="mt-1 flex w-fit items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                <Clock className="size-2.5" /> in Vorbereitung
              </span>
              <p className="mt-2 text-xs text-muted-foreground">
                Bis dahin erfassen wir den Verbrauch aus deinen Rechnungen.
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------- Schritt 6 */

function Schritt6({
  kunden, setKunden, input, setInput, onAdd, busy,
}: {
  kunden: string[];
  setKunden: (k: string[]) => void;
  input: string;
  setInput: (s: string) => void;
  onAdd: () => void;
  busy: boolean;
}) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="font-display text-2xl font-bold md:text-3xl">Für welche Kunden arbeitest du?</h2>
        <p className="text-muted-foreground">
          Wenn wir deine Kunden kennen, können wir Toolkosten zuordnen und du hast eine saubere Grundlage zum
          Weiterverrechnen.
        </p>
      </div>

      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onAdd();
            }
          }}
          placeholder="Kundenname eingeben und Enter drücken"
          className="h-11 rounded-xl"
        />
        <Button onClick={onAdd} disabled={busy || !input.trim()} className="h-11 rounded-2xl px-5">
          {busy ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />} Hinzufügen
        </Button>
      </div>

      <div className="flex min-h-12 flex-wrap gap-2">
        {kunden.map((k) => (
          <span key={k} className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground">
            {k}
            <button onClick={() => setKunden(kunden.filter((x) => x !== k))} className="hover:opacity-70">
              <X className="size-3.5" />
            </button>
          </span>
        ))}
        {kunden.length === 0 && <p className="text-sm text-muted-foreground">Noch keine Kunden hinzugefügt.</p>}
      </div>

      <p className="text-sm text-muted-foreground">Du kannst Abos später jederzeit einzelnen Kunden zuordnen.</p>
    </div>
  );
}

/* ------------------------------------------------------------ Schritt Fertig */

function SchrittFertig({
  importiert, onDone, busy,
}: {
  importiert: number | null;
  onDone: () => void;
  busy: boolean;
}) {
  const [bilanz, setBilanz] = useState<Bilanz | null>(null);

  useEffect(() => {
    onboardingBilanz().then(setBilanz);
  }, []);

  /* Konfetti DETERMINISTISCH. Math.random() im Render ist in React 19 ein Fehler:
     Server und Client wuerfeln verschieden und die Hydration bricht. */
  const konfetti = useMemo(
    () =>
      Array.from({ length: 36 }, (_, i) => {
        const winkel = (i / 36) * Math.PI * 2;
        return {
          id: i,
          tx: Math.sin(winkel) * 280,
          ty: -Math.abs(Math.cos(winkel)) * 260 - 80,
          color: ["#6C5CE7", "#FF7A66", "#12B76A", "#F5A623", "#3B82F6"][i % 5],
          delay: (i % 9) * 22,
        };
      }),
    [],
  );

  const leer = bilanz !== null && bilanz.abos === 0;

  return (
    <div className="relative space-y-8 py-6 text-center">
      <div className="pointer-events-none absolute inset-x-0 top-10 flex justify-center">
        {konfetti.map((c) => (
          <span
            key={c.id}
            className="absolute size-2 rounded-sm"
            style={{
              backgroundColor: c.color,
              animation: `confetti-pop 1.2s cubic-bezier(.2,.7,.2,1) ${c.delay}ms forwards`,
              ["--tx" as string]: `${c.tx}px`,
              ["--ty" as string]: `${c.ty}px`,
            }}
          />
        ))}
      </div>

      <div className="relative space-y-3">
        <div className="mx-auto inline-flex size-16 items-center justify-center rounded-2xl bg-success/15">
          <PartyPopper className="size-8 text-success" />
        </div>
        <h2 className="font-display text-3xl font-bold md:text-4xl">
          {leer ? "Startklar." : "Geschafft. Dein Tool-Stack ist drin."}
        </h2>
        <p className="text-muted-foreground">
          {leer
            ? "Dein Konto steht. Sobald du deine ersten Abos anlegst, zeigen wir dir hier Kosten und Sparchancen."
            : importiert
              ? `Wir haben ${importiert} ${importiert === 1 ? "Abo" : "Abos"} aus deinem Kontoauszug übernommen.`
              : "Auf dem Dashboard laufen Kosten, Fristen und Sparpotenzial zusammen."}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 pt-2 md:grid-cols-3">
        <BilanzKarte wert={bilanz ? String(bilanz.abos) : "…"} label="Abos erfasst" />
        <BilanzKarte wert={bilanz ? euro(bilanz.monatlich) : "…"} label="Kosten pro Monat" />
        <BilanzKarte
          wert={bilanz ? (bilanz.sparpotenzial != null ? euro(bilanz.sparpotenzial) : "noch offen") : "…"}
          label={bilanz?.sparpotenzial != null ? "Sparpotenzial pro Jahr (geschätzt)" : "Sparpotenzial pro Jahr"}
          highlight={bilanz?.sparpotenzial != null}
          klein={bilanz?.sparpotenzial == null}
        />
      </div>

      {bilanz?.sparpotenzial == null && !leer && (
        <p className="text-xs text-muted-foreground">
          Für eine Sparanalyse brauchen wir noch etwas mehr von deinem Bestand. Wir sagen dir Bescheid, sobald sich
          etwas findet, statt jetzt eine Zahl zu erfinden.
        </p>
      )}

      <Button onClick={onDone} disabled={busy} className="h-12 rounded-2xl px-8 text-base font-semibold">
        {busy && <Loader2 className="size-4 animate-spin" />} Zum Dashboard <ChevronRight className="size-4" />
      </Button>
    </div>
  );
}

function BilanzKarte({
  wert, label, highlight, klein,
}: {
  wert: string;
  label: string;
  highlight?: boolean;
  klein?: boolean;
}) {
  return (
    <div className="rounded-2xl bg-card p-6 shadow-soft">
      <p
        className={cn(
          "font-display font-bold tabular-nums",
          klein ? "text-xl text-muted-foreground" : "text-3xl md:text-4xl",
          highlight && "text-success",
        )}
      >
        {wert}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
