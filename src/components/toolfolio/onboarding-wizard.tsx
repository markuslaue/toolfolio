import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Landmark,
  Wallet,
  Coins,
  ShieldCheck,
  MoreHorizontal,
  Plus,
  X,
  Upload,
  Mail,
  ListPlus,
  Sparkles,
  Copy,
  PartyPopper,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fmtEUR } from "@/lib/toolfolio-data";
import { cn } from "@/lib/utils";
import { aiProviders, capabilityBadge, type AiProvider } from "@/lib/ai-providers";
import { ConnectAiServiceModal, type ConnectionResult } from "./connect-ai-service-modal";

type Profil = "Agentur" | "Freelancer" | "Solopreneur" | "Unternehmen";
type ToolMenge = "unter 10" | "10 bis 30" | "30 bis 60" | "mehr als 60";
type Kanal = "Firmenkreditkarte" | "SEPA-Lastschrift" | "PayPal" | "Stripe-Guthaben" | "Paysafe" | "Anderes";
type Erfassung = "import" | "inbox" | "manuell";

interface KarteRef {
  id: string;
  marke: "Visa" | "Mastercard" | "Amex";
  last4: string;
}

interface ErkanntesAbo {
  id: string;
  tool: string;
  initial: string;
  farbe: string;
  buchungstext: string;
  betrag: number;
  intervall: "monatlich" | "jährlich";
  kategorie: string;
  katFarbe: string;
  kanal: string;
  ignorieren: boolean;
}

const erkannteAbosMock: ErkanntesAbo[] = [
  { id: "1", tool: "Notion", initial: "N", farbe: "#0F1419", buchungstext: "DD STRIPE *NOTION", betrag: 96, intervall: "monatlich", kategorie: "Produktivität", katFarbe: "var(--color-cat-prod)", kanal: "Visa •••• 4821", ignorieren: false },
  { id: "2", tool: "Slack", initial: "S", farbe: "#611f69", buchungstext: "SLACK TECHNOLOGIES", betrag: 78.5, intervall: "monatlich", kategorie: "Kommunikation", katFarbe: "var(--color-cat-comm)", kanal: "Mastercard •••• 7093", ignorieren: false },
  { id: "3", tool: "Figma", initial: "F", farbe: "#a259ff", buchungstext: "FIGMA *MONTHLY", betrag: 45, intervall: "monatlich", kategorie: "Design", katFarbe: "var(--color-cat-design)", kanal: "Visa •••• 4821", ignorieren: false },
  { id: "4", tool: "Adobe Creative Cloud", initial: "A", farbe: "#d83b01", buchungstext: "ADOBE *CREATIVECLD", betrag: 59.99, intervall: "monatlich", kategorie: "Design", katFarbe: "var(--color-cat-design)", kanal: "SEPA-Lastschrift", ignorieren: false },
  { id: "5", tool: "Ahrefs", initial: "A", farbe: "#0e7ec6", buchungstext: "AHREFS PTE LTD", betrag: 199, intervall: "monatlich", kategorie: "SEO", katFarbe: "var(--color-cat-seo)", kanal: "Visa •••• 4821", ignorieren: false },
  { id: "6", tool: "Lovable", initial: "L", farbe: "#3A57E8", buchungstext: "LOVABLE.DEV", betrag: 89, intervall: "monatlich", kategorie: "Entwicklung", katFarbe: "var(--color-cat-dev)", kanal: "Mastercard •••• 7093", ignorieren: false },
  { id: "7", tool: "Anthropic API", initial: "C", farbe: "#cc785c", buchungstext: "STRIPE ANTHROPIC", betrag: 312.4, intervall: "monatlich", kategorie: "KI / API", katFarbe: "var(--color-cat-ai)", kanal: "Mastercard •••• 7093", ignorieren: false },
  { id: "8", tool: "OpenAI", initial: "O", farbe: "#10a37f", buchungstext: "OPENAI *APIUSAGE", betrag: 184.2, intervall: "monatlich", kategorie: "KI / API", katFarbe: "var(--color-cat-ai)", kanal: "Visa •••• 4821", ignorieren: false },
  { id: "9", tool: "Shopify", initial: "S", farbe: "#95bf47", buchungstext: "SHOPIFY* 12345", betrag: 105, intervall: "monatlich", kategorie: "eCommerce", katFarbe: "var(--color-cat-ecom)", kanal: "SEPA-Lastschrift", ignorieren: false },
  { id: "10", tool: "Make", initial: "M", farbe: "#6d00cc", buchungstext: "PAYPAL *MAKE.COM", betrag: 29, intervall: "monatlich", kategorie: "Produktivität", katFarbe: "var(--color-cat-prod)", kanal: "PayPal", ignorieren: false },
  { id: "11", tool: "ElevenLabs", initial: "E", farbe: "#0F1419", buchungstext: "ELEVEN LABS INC", betrag: 22, intervall: "monatlich", kategorie: "KI / API", katFarbe: "var(--color-cat-ai)", kanal: "Mastercard •••• 7093", ignorieren: false },
  { id: "12", tool: "Loom", initial: "L", farbe: "#625df5", buchungstext: "PAYPAL *LOOM", betrag: 15, intervall: "monatlich", kategorie: "Kommunikation", katFarbe: "var(--color-cat-comm)", kanal: "PayPal", ignorieren: false },
  { id: "13", tool: "Google Workspace", initial: "G", farbe: "#4285f4", buchungstext: "GOOGLE *GSUITE", betrag: 138, intervall: "monatlich", kategorie: "Produktivität", katFarbe: "var(--color-cat-prod)", kanal: "SEPA-Lastschrift", ignorieren: false },
  { id: "14", tool: "Vercel", initial: "V", farbe: "#0F1419", buchungstext: "VERCEL INC", betrag: 68, intervall: "monatlich", kategorie: "Entwicklung", katFarbe: "var(--color-cat-dev)", kanal: "Visa •••• 4821", ignorieren: false },
];

const kategorieOptionen = [
  { name: "Design", farbe: "var(--color-cat-design)" },
  { name: "SEO", farbe: "var(--color-cat-seo)" },
  { name: "Kommunikation", farbe: "var(--color-cat-comm)" },
  { name: "KI / API", farbe: "var(--color-cat-ai)" },
  { name: "Entwicklung", farbe: "var(--color-cat-dev)" },
  { name: "Produktivität", farbe: "var(--color-cat-prod)" },
  { name: "eCommerce", farbe: "var(--color-cat-ecom)" },
];

const kanalIcons: Record<Kanal, typeof CreditCard> = {
  Firmenkreditkarte: CreditCard,
  "SEPA-Lastschrift": Landmark,
  PayPal: Wallet,
  "Stripe-Guthaben": Coins,
  Paysafe: ShieldCheck,
  Anderes: MoreHorizontal,
};

const kanalListe: Kanal[] = [
  "Firmenkreditkarte",
  "SEPA-Lastschrift",
  "PayPal",
  "Stripe-Guthaben",
  "Paysafe",
  "Anderes",
];

export function OnboardingWizard() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  // Schritt 1
  const [profil, setProfil] = useState<Profil | null>(null);
  const [toolMenge, setToolMenge] = useState<ToolMenge | null>(null);

  // Schritt 2
  const [kanaele, setKanaele] = useState<Kanal[]>([]);
  const [karten, setKarten] = useState<KarteRef[]>([
    { id: "k1", marke: "Visa", last4: "4821" },
  ]);

  // Schritt 3
  const [erfassung, setErfassung] = useState<Erfassung | null>(null);
  const [importSubStep, setImportSubStep] = useState<"choose" | "uploading" | "done" | "inbox">("choose");
  const [foundCount, setFoundCount] = useState(0);

  // Schritt 4
  const [abos, setAbos] = useState<ErkanntesAbo[]>(erkannteAbosMock);

  // Schritt 5 (Kunden)
  const [kunden, setKunden] = useState<string[]>(["Nordwerk", "Kessler", "Solea"]);
  const [kundeInput, setKundeInput] = useState("");

  // Schritt AI (verbundene Provider)
  const [aiVerbunden, setAiVerbunden] = useState<Record<string, boolean>>({});

  const zeigtKunden = profil === "Agentur" || profil === "Unternehmen";
  const stepLabels = [
    "Profil",
    "Zahlung",
    "Bestand",
    "Prüfen",
    "AI-Services",
    ...(zeigtKunden ? ["Kunden"] : []),
    "Fertig",
  ];
  const totalSteps = stepLabels.length;
  // internal step indices: 1 Profil, 2 Zahlung, 3 Bestand, 4 Prüfen, 5 AI, 6 Kunden (opt), 7 Fertig
  const visibleStep = useMemo(() => {
    if (!zeigtKunden && step >= 6) return step - 1;
    return step;
  }, [step, zeigtKunden]);

  const next = () => {
    if (step === 5 && !zeigtKunden) setStep(7);
    else setStep((s) => Math.min(7, s + 1));
  };
  const back = () => {
    if (step === 7 && !zeigtKunden) setStep(5);
    else setStep((s) => Math.max(1, s - 1));
  };

  const handleSkipAll = () => navigate({ to: "/" });

  return (
    <div className="min-h-dvh bg-background text-foreground">
      {/* Header */}
      <header className="flex items-center justify-between px-6 md:px-10 py-6">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-primary text-primary-foreground grid place-items-center font-display font-bold">
            T
          </div>
          <span className="font-display text-xl font-semibold">Toolfolio</span>
        </div>
        <button
          onClick={handleSkipAll}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Später erledigen
        </button>
      </header>

      {/* Stepper */}
      <div className="px-4 md:px-10 pt-2 pb-6">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between gap-2">
            {stepLabels.map((label, i) => {
              const idx = i + 1;
              const done = idx < visibleStep;
              const active = idx === visibleStep;
              return (
                <div key={label} className="flex items-center gap-2 flex-1 min-w-0">
                  <div
                    className={cn(
                      "h-8 w-8 shrink-0 rounded-full grid place-items-center text-xs font-semibold transition-colors",
                      done && "bg-success text-success-foreground",
                      active && "bg-primary text-primary-foreground ring-4 ring-accent",
                      !done && !active && "bg-secondary text-muted-foreground",
                    )}
                  >
                    {done ? <Check className="h-4 w-4" /> : idx}
                  </div>
                  <span
                    className={cn(
                      "hidden md:inline text-sm truncate",
                      active ? "text-foreground font-medium" : "text-muted-foreground",
                    )}
                  >
                    {label}
                  </span>
                  {i < stepLabels.length - 1 && (
                    <div className="flex-1 h-px bg-border mx-1" />
                  )}
                </div>
              );
            })}
          </div>
          <p className="text-center text-xs text-muted-foreground mt-3">
            Schritt {visibleStep} von {totalSteps}
          </p>
        </div>
      </div>

      {/* Content */}
      <main className="px-4 md:px-6 pb-16">
        <div key={step} className="max-w-3xl mx-auto animate-draw">
          <div className="rounded-3xl bg-card shadow-soft p-6 md:p-10">
            {step === 1 && (
              <Schritt1
                profil={profil}
                setProfil={setProfil}
                toolMenge={toolMenge}
                setToolMenge={setToolMenge}
              />
            )}
            {step === 2 && (
              <Schritt2
                kanaele={kanaele}
                setKanaele={setKanaele}
                karten={karten}
                setKarten={setKarten}
              />
            )}
            {step === 3 && (
              <Schritt3
                erfassung={erfassung}
                setErfassung={setErfassung}
                subStep={importSubStep}
                setSubStep={setImportSubStep}
                foundCount={foundCount}
                setFoundCount={setFoundCount}
                onImportDone={() => {
                  setImportSubStep("choose");
                  setStep(4);
                }}
                onInboxDone={() => {
                  setImportSubStep("choose");
                  next();
                }}
              />
            )}
            {step === 4 && (
              <Schritt4
                abos={abos}
                setAbos={setAbos}
                kanaeleVerfuegbar={[
                  ...karten.map((k) => `${k.marke} •••• ${k.last4}`),
                  ...kanaele.filter((k) => k !== "Firmenkreditkarte"),
                ]}
              />
            )}
            {step === 5 && (
              <SchrittAi
                verbunden={aiVerbunden}
                onConnected={(id) => setAiVerbunden((v) => ({ ...v, [id]: true }))}
              />
            )}
            {step === 6 && zeigtKunden && (
              <Schritt5
                kunden={kunden}
                setKunden={setKunden}
                kundeInput={kundeInput}
                setKundeInput={setKundeInput}
              />
            )}
            {step === 7 && <Schritt6 abos={abos} onDone={() => navigate({ to: "/" })} />}
          </div>

          {/* Footer Nav */}
          {step !== 7 && (
            <div className="flex items-center justify-between mt-6">
              <Button
                variant="ghost"
                onClick={back}
                disabled={step === 1}
                className="rounded-full"
              >
                <ChevronLeft className="h-4 w-4" /> Zurück
              </Button>
              <div className="flex items-center gap-2">
                {(step === 3 || step === 5 || step === 6) && (
                  <button
                    onClick={() => {
                      if (step === 3) setStep(5);
                      else if (step === 5) setStep(zeigtKunden ? 6 : 7);
                      else setStep(7);
                    }}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3"
                  >
                    {step === 5 ? "Spaeter in den Integrationen erledigen" : "Überspringen, mache ich später"}
                  </button>
                )}
                <Button
                  onClick={next}
                  disabled={
                    (step === 1 && (!profil || !toolMenge)) ||
                    (step === 2 && kanaele.length === 0) ||
                    (step === 3 && erfassung === null)
                  }
                  className="rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-6 font-semibold"
                >
                  {step === 1 ? "Los geht's" : step === 4 ? "Bestätigen und weiter" : "Weiter"}
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

/* ---------- Schritt 1 ---------- */
function Schritt1({
  profil,
  setProfil,
  toolMenge,
  setToolMenge,
}: {
  profil: Profil | null;
  setProfil: (p: Profil) => void;
  toolMenge: ToolMenge | null;
  setToolMenge: (t: ToolMenge) => void;
}) {
  const profile: Profil[] = ["Agentur", "Freelancer", "Solopreneur", "Unternehmen"];
  const mengen: ToolMenge[] = ["unter 10", "10 bis 30", "30 bis 60", "mehr als 60"];

  return (
    <div className="space-y-8">
      <div className="text-center space-y-3">
        <h1 className="font-display text-3xl md:text-4xl font-bold leading-tight">
          Willkommen bei Toolfolio.
          <br />
          Lass uns deinen Tool-Stack in den Griff bekommen.
        </h1>
        <p className="text-muted-foreground text-base md:text-lg">
          Das dauert keine drei Minuten.
        </p>
      </div>

      <div>
        <p className="font-display text-lg font-semibold mb-3">Was beschreibt dich am besten?</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {profile.map((p) => (
            <Tile key={p} active={profil === p} onClick={() => setProfil(p)}>
              {p}
            </Tile>
          ))}
        </div>
      </div>

      <div>
        <p className="font-display text-lg font-semibold mb-3">Wie viele Tools nutzt du ungefähr?</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {mengen.map((m) => (
            <Tile key={m} active={toolMenge === m} onClick={() => setToolMenge(m)}>
              {m}
            </Tile>
          ))}
        </div>
      </div>
    </div>
  );
}

function Tile({
  active,
  onClick,
  children,
  icon,
}: {
  active?: boolean;
  onClick: () => void;
  children: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative rounded-2xl px-4 py-4 text-left transition-all card-lift",
        "bg-card border-2",
        active
          ? "border-primary bg-accent/50"
          : "border-border hover:border-primary/40",
      )}
    >
      <div className="flex items-center gap-3">
        {icon && <span className="text-primary">{icon}</span>}
        <span className="font-medium">{children}</span>
      </div>
      {active && (
        <span className="absolute top-2 right-2 h-6 w-6 rounded-full bg-primary text-primary-foreground grid place-items-center">
          <Check className="h-3.5 w-3.5" />
        </span>
      )}
    </button>
  );
}

/* ---------- Schritt 2 ---------- */
function Schritt2({
  kanaele,
  setKanaele,
  karten,
  setKarten,
}: {
  kanaele: Kanal[];
  setKanaele: (k: Kanal[]) => void;
  karten: KarteRef[];
  setKarten: (k: KarteRef[]) => void;
}) {
  const toggle = (k: Kanal) => {
    if (kanaele.includes(k)) setKanaele(kanaele.filter((x) => x !== k));
    else setKanaele([...kanaele, k]);
  };

  const [neueMarke, setNeueMarke] = useState<"Visa" | "Mastercard" | "Amex">("Visa");
  const [neueLast4, setNeueLast4] = useState("");

  const karteHinzu = () => {
    if (neueLast4.length === 4) {
      setKarten([...karten, { id: crypto.randomUUID(), marke: neueMarke, last4: neueLast4 }]);
      setNeueLast4("");
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="font-display text-2xl md:text-3xl font-bold">Worüber zahlst du deine Tools?</h2>
        <p className="text-muted-foreground">
          Wenn wir alle Kanäle kennen, übersehen wir später nichts. Software wird oft über mehrere Wege abgebucht.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {kanalListe.map((k) => {
          const Icon = kanalIcons[k];
          return (
            <Tile key={k} active={kanaele.includes(k)} onClick={() => toggle(k)} icon={<Icon className="h-5 w-5" />}>
              {k}
            </Tile>
          );
        })}
      </div>

      {kanaele.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {kanaele.map((k) => (
            <span
              key={k}
              className="inline-flex items-center gap-1.5 rounded-full bg-accent text-accent-foreground px-3 py-1 text-sm font-medium"
            >
              {k}
              <button onClick={() => toggle(k)} className="hover:opacity-70">
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}
        </div>
      )}

      {kanaele.includes("Firmenkreditkarte") && (
        <div className="rounded-2xl bg-secondary/60 p-5 space-y-4 animate-draw">
          <div className="flex items-start gap-2">
            <ShieldCheck className="h-5 w-5 text-success mt-0.5 shrink-0" />
            <p className="text-sm text-muted-foreground">
              Wir speichern keine vollständigen Kartennummern und keine Logins. Nur eine Bezeichnung, damit du den Überblick behältst.
            </p>
          </div>

          <div className="space-y-2">
            {karten.map((k) => (
              <div key={k.id} className="flex items-center justify-between rounded-xl bg-card px-4 py-3 shadow-soft">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-primary" />
                  <span className="font-medium tabular">
                    {k.marke} •••• {k.last4}
                  </span>
                </div>
                <button
                  onClick={() => setKarten(karten.filter((x) => x.id !== k.id))}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex flex-col md:flex-row gap-2">
            <select
              value={neueMarke}
              onChange={(e) => setNeueMarke(e.target.value as "Visa" | "Mastercard" | "Amex")}
              className="h-11 rounded-xl border border-input bg-card px-3 text-sm font-medium"
            >
              <option>Visa</option>
              <option>Mastercard</option>
              <option>Amex</option>
            </select>
            <Input
              value={neueLast4}
              onChange={(e) => setNeueLast4(e.target.value.replace(/\D/g, "").slice(0, 4))}
              placeholder="Letzte 4 Ziffern"
              className="h-11 rounded-xl tabular"
              maxLength={4}
            />
            <Button
              onClick={karteHinzu}
              disabled={neueLast4.length !== 4}
              variant="outline"
              className="h-11 rounded-xl border-primary text-primary hover:bg-accent"
            >
              <Plus className="h-4 w-4" /> Karte hinzufügen
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Schritt 3 ---------- */
function Schritt3({
  erfassung,
  setErfassung,
  subStep,
  setSubStep,
  foundCount,
  setFoundCount,
  onImportDone,
  onInboxDone,
}: {
  erfassung: Erfassung | null;
  setErfassung: (e: Erfassung) => void;
  subStep: "choose" | "uploading" | "done" | "inbox";
  setSubStep: (s: "choose" | "uploading" | "done" | "inbox") => void;
  foundCount: number;
  setFoundCount: (n: number) => void;
  onImportDone: () => void;
  onInboxDone: () => void;
}) {
  // Upload animation
  const rafRef = useRef<number | null>(null);
  useEffect(() => {
    if (subStep !== "uploading") return;
    const start = performance.now();
    const dur = 2600;
    const target = 14;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 2);
      setFoundCount(Math.floor(target * eased));
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
      else {
        setFoundCount(target);
        setTimeout(onImportDone, 600);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [subStep]);

  if (subStep === "uploading") {
    return (
      <div className="py-12 text-center space-y-6">
        <div className="inline-flex h-16 w-16 rounded-2xl bg-accent items-center justify-center">
          <Sparkles className="h-8 w-8 text-primary animate-pulse" />
        </div>
        <div className="space-y-2">
          <p className="text-muted-foreground">Wir durchsuchen deine Buchungen ...</p>
          <p className="font-display text-6xl font-bold tabular">
            {foundCount}
          </p>
          <p className="text-muted-foreground">Abos gefunden</p>
        </div>
        <div className="h-2 max-w-sm mx-auto rounded-full bg-secondary overflow-hidden">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${(foundCount / 14) * 100}%` }}
          />
        </div>
      </div>
    );
  }

  if (subStep === "inbox") {
    const adresse = "belege-x7f3@inbox.toolfolio.de";
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="font-display text-2xl md:text-3xl font-bold">Dein Beleg-Postfach ist bereit.</h2>
          <p className="text-muted-foreground">
            Wir empfangen ab sofort Rechnungen an diese Adresse und halten alles automatisch aktuell.
          </p>
        </div>
        <div className="rounded-2xl bg-accent/50 p-5 flex flex-col md:flex-row items-stretch md:items-center gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Mail className="h-5 w-5 text-primary shrink-0" />
            <span className="font-mono text-base md:text-lg truncate tabular">{adresse}</span>
          </div>
          <Button
            variant="outline"
            className="rounded-xl border-primary text-primary hover:bg-accent"
            onClick={() => navigator.clipboard?.writeText(adresse)}
          >
            <Copy className="h-4 w-4" /> Kopieren
          </Button>
        </div>
        <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
          <li>Hinterlege die Adresse als Rechnungsempfänger bei deinen Tool-Anbietern.</li>
          <li>Oder richte eine Weiterleitung aus deinem Posteingang ein.</li>
          <li>Lehn dich zurück, wir sortieren die eingehenden Rechnungen.</li>
        </ol>
        <div className="flex justify-end">
          <Button onClick={onInboxDone} className="rounded-2xl h-11 px-6 font-semibold">
            Erledigt, weiter <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  const optionen: Array<{
    id: Erfassung;
    titel: string;
    text: string;
    icon: typeof Upload;
    empfohlen?: boolean;
  }> = [
    {
      id: "import",
      titel: "Kontoauszug importieren",
      text: "Lade deine letzten 12 Monate als CSV oder CAMT hoch, wir erkennen die wiederkehrenden Buchungen.",
      icon: Upload,
      empfohlen: true,
    },
    {
      id: "inbox",
      titel: "Beleg-Postfach verbinden",
      text: "Bekomme eine eigene Toolfolio-Adresse, an die Rechnungen gehen. Wir halten dann alles automatisch aktuell.",
      icon: Mail,
    },
    {
      id: "manuell",
      titel: "Manuell hinzufügen",
      text: "Such deine Tools aus dem Verzeichnis und füge sie schnell hinzu.",
      icon: ListPlus,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="font-display text-2xl md:text-3xl font-bold">Wie finden wir deine bestehenden Abos?</h2>
        <p className="text-muted-foreground">Wähle den Weg, der dir am leichtesten fällt. Du kannst die anderen jederzeit ergänzen.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {optionen.map((o) => {
          const Icon = o.icon;
          const active = erfassung === o.id;
          return (
            <button
              key={o.id}
              onClick={() => setErfassung(o.id)}
              className={cn(
                "relative text-left rounded-2xl p-5 bg-card border-2 card-lift transition-all",
                active ? "border-primary bg-accent/40" : "border-border hover:border-primary/40",
              )}
            >
              {o.empfohlen && (
                <span className="absolute -top-2.5 left-4 inline-flex items-center gap-1 rounded-full bg-coral text-coral-foreground px-2.5 py-0.5 text-xs font-semibold">
                  <Sparkles className="h-3 w-3" /> findet auch Vergessenes
                </span>
              )}
              <div className="h-11 w-11 rounded-xl bg-accent grid place-items-center text-primary mb-3">
                <Icon className="h-5 w-5" />
              </div>
              <p className="font-display text-lg font-semibold mb-1">{o.titel}</p>
              <p className="text-sm text-muted-foreground leading-snug">{o.text}</p>
            </button>
          );
        })}
      </div>

      {erfassung === "import" && (
        <div
          className="rounded-2xl border-2 border-dashed border-primary/60 bg-accent/30 p-8 text-center animate-draw cursor-pointer hover:bg-accent/50 transition-colors"
          onClick={() => setSubStep("uploading")}
        >
          <Upload className="h-8 w-8 text-primary mx-auto mb-3" />
          <p className="font-medium">Datei hierher ziehen oder auswählen</p>
          <p className="text-sm text-muted-foreground mt-1">Akzeptiert CSV und CAMT (XML)</p>
          <Button className="mt-4 rounded-2xl">Datei auswählen</Button>
        </div>
      )}
      {erfassung === "inbox" && (
        <div className="flex justify-end">
          <Button onClick={() => setSubStep("inbox")} className="rounded-2xl h-11 px-6 font-semibold">
            Postfach erzeugen <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
      {erfassung === "manuell" && (
        <div className="rounded-2xl bg-secondary/60 p-5 text-sm text-muted-foreground">
          Im nächsten Schritt zeigen wir dir eine Auswahl gängiger Tools, die du als Startbestand übernehmen kannst.
        </div>
      )}
    </div>
  );
}

/* ---------- Schritt 4 ---------- */
function Schritt4({
  abos,
  setAbos,
  kanaeleVerfuegbar,
}: {
  abos: ErkanntesAbo[];
  setAbos: (a: ErkanntesAbo[]) => void;
  kanaeleVerfuegbar: string[];
}) {
  const aktive = abos.filter((a) => !a.ignorieren);
  const summe = aktive.reduce(
    (acc, a) => acc + (a.intervall === "jährlich" ? a.betrag / 12 : a.betrag),
    0,
  );

  const update = (id: string, patch: Partial<ErkanntesAbo>) => {
    setAbos(abos.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  };

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <h2 className="font-display text-2xl md:text-3xl font-bold">Das haben wir gefunden. Stimmt das?</h2>
        <p className="text-muted-foreground">Kurz prüfen, korrigieren, fertig. Den Rest erledigst du später jederzeit.</p>
      </div>

      <div className="rounded-2xl bg-gradient-to-br from-accent/60 to-secondary/40 p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <div>
          <p className="text-sm text-muted-foreground">Erfolgs-Bilanz</p>
          <p className="font-display text-xl md:text-2xl font-bold">
            <span className="tabular">{aktive.length}</span> Abos erkannt
          </p>
        </div>
        <div className="md:text-right">
          <p className="text-sm text-muted-foreground">zusammen pro Monat</p>
          <p className="font-display text-2xl md:text-3xl font-bold tabular">{fmtEUR(summe)}</p>
        </div>
      </div>

      <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1 -mr-1">
        {abos.map((a) => (
          <div
            key={a.id}
            className={cn(
              "rounded-2xl bg-card shadow-soft p-4 flex flex-col md:flex-row md:items-center gap-3 transition-opacity",
              a.ignorieren && "opacity-50",
            )}
          >
            <div className="flex items-center gap-3 min-w-0 md:w-56">
              <div
                className="h-10 w-10 rounded-xl grid place-items-center text-white font-display font-bold shrink-0"
                style={{ backgroundColor: a.farbe }}
              >
                {a.initial}
              </div>
              <div className="min-w-0">
                <p className="font-semibold truncate">{a.tool}</p>
                <p className="text-xs text-muted-foreground truncate">{a.buchungstext}</p>
              </div>
            </div>

            <div className="md:w-32">
              <p className="font-display text-base font-semibold tabular">{fmtEUR(a.betrag)}</p>
              <p className="text-xs text-muted-foreground">{a.intervall}</p>
            </div>

            <div className="flex-1 min-w-0">
              <select
                value={a.kategorie}
                onChange={(e) => {
                  const opt = kategorieOptionen.find((k) => k.name === e.target.value);
                  if (opt) update(a.id, { kategorie: opt.name, katFarbe: opt.farbe });
                }}
                className="rounded-full text-xs font-semibold px-3 py-1 border-0 cursor-pointer"
                style={{
                  backgroundColor: `color-mix(in oklab, ${a.katFarbe} 15%, transparent)`,
                  color: a.katFarbe,
                }}
              >
                {kategorieOptionen.map((k) => (
                  <option key={k.name} value={k.name}>{k.name}</option>
                ))}
              </select>
            </div>

            <select
              value={a.kanal}
              onChange={(e) => update(a.id, { kanal: e.target.value })}
              className="h-9 rounded-xl border border-input bg-card px-3 text-sm md:w-48"
            >
              {[a.kanal, ...kanaeleVerfuegbar.filter((k) => k !== a.kanal)].map((k) => (
                <option key={k}>{k}</option>
              ))}
            </select>

            <button
              onClick={() => update(a.id, { ignorieren: !a.ignorieren })}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors shrink-0",
                a.ignorieren
                  ? "bg-secondary text-muted-foreground"
                  : "bg-success/15 text-success",
              )}
            >
              {a.ignorieren ? "Ignoriert" : "Ist ein Abo"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Schritt 5 ---------- */
function Schritt5({
  kunden,
  setKunden,
  kundeInput,
  setKundeInput,
}: {
  kunden: string[];
  setKunden: (k: string[]) => void;
  kundeInput: string;
  setKundeInput: (s: string) => void;
}) {
  const add = () => {
    const v = kundeInput.trim();
    if (v && !kunden.includes(v)) setKunden([...kunden, v]);
    setKundeInput("");
  };
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="font-display text-2xl md:text-3xl font-bold">Für welche Kunden arbeitest du?</h2>
        <p className="text-muted-foreground">
          Wenn wir deine Kunden kennen, können wir Toolkosten zuordnen und du hast eine saubere Grundlage zum Weiterverrechnen.
        </p>
      </div>

      <div className="flex gap-2">
        <Input
          value={kundeInput}
          onChange={(e) => setKundeInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder="Kundenname eingeben und Enter drücken"
          className="h-11 rounded-xl"
        />
        <Button onClick={add} className="rounded-2xl h-11 px-5">
          <Plus className="h-4 w-4" /> Hinzufügen
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 min-h-12">
        {kunden.map((k) => (
          <span
            key={k}
            className="inline-flex items-center gap-2 rounded-full bg-accent text-accent-foreground px-4 py-2 text-sm font-semibold"
          >
            {k}
            <button
              onClick={() => setKunden(kunden.filter((x) => x !== k))}
              className="hover:opacity-70"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </span>
        ))}
        {kunden.length === 0 && (
          <p className="text-sm text-muted-foreground">Noch keine Kunden hinzugefügt.</p>
        )}
      </div>

      <p className="text-sm text-muted-foreground">
        Du kannst Abos später bequem im Dashboard einzelnen Kunden zuordnen.
      </p>
    </div>
  );
}

/* ---------- Schritt 6 ---------- */
function Schritt6({ abos, onDone }: { abos: ErkanntesAbo[]; onDone: () => void }) {
  const aktive = abos.filter((a) => !a.ignorieren);
  const monatlich = aktive.reduce(
    (acc, a) => acc + (a.intervall === "jährlich" ? a.betrag / 12 : a.betrag),
    0,
  );

  const confetti = useMemo(
    () =>
      Array.from({ length: 36 }).map((_, i) => ({
        id: i,
        tx: (Math.random() - 0.5) * 600,
        ty: -Math.random() * 320 - 80,
        color: ["#6C5CE7", "#FF7A66", "#12B76A", "#F5A623", "#3B82F6"][i % 5],
        delay: Math.random() * 200,
      })),
    [],
  );

  return (
    <div className="relative text-center py-6 space-y-8">
      {/* Confetti */}
      <div className="pointer-events-none absolute inset-x-0 top-10 flex justify-center">
        {confetti.map((c) => (
          <span
            key={c.id}
            className="absolute h-2 w-2 rounded-sm"
            style={{
              backgroundColor: c.color,
              animation: `confetti-pop 1.2s cubic-bezier(.2,.7,.2,1) ${c.delay}ms forwards`,
              ["--tx" as string]: `${c.tx}px`,
              ["--ty" as string]: `${c.ty}px`,
            }}
          />
        ))}
      </div>

      <div className="space-y-3 relative">
        <div className="inline-flex h-16 w-16 rounded-2xl bg-success/15 items-center justify-center mx-auto">
          <PartyPopper className="h-8 w-8 text-success" />
        </div>
        <h2 className="font-display text-3xl md:text-4xl font-bold">Geschafft. Dein Tool-Stack ist drin.</h2>
        <p className="text-muted-foreground">Wir haben schon ein paar Spar-Chancen für dich gefunden. Schau sie dir an.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <Bilanz wert={`${aktive.length}`} label="Abos erfasst" />
        <Bilanz wert={fmtEUR(monatlich)} label="Kosten pro Monat" />
        <Bilanz wert={`${fmtEUR(1284)}`} label="Sparpotenzial pro Jahr" highlight />
      </div>

      <Button
        onClick={onDone}
        className="rounded-2xl h-12 px-8 font-semibold text-base bg-primary text-primary-foreground hover:bg-primary/90"
      >
        Zum Dashboard <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

function Bilanz({ wert, label, highlight }: { wert: string; label: string; highlight?: boolean }) {
  return (
    <div className="rounded-2xl bg-card shadow-soft p-6">
      <p
        className={cn(
          "font-display text-3xl md:text-4xl font-bold tabular",
          highlight && "text-success",
        )}
      >
        {wert}
      </p>
      <p className="text-sm text-muted-foreground mt-1">{label}</p>
    </div>
  );
}
