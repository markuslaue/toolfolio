import { useMemo, useState, useEffect, useRef } from "react";
import {
  ArrowRight,
  ArrowLeft,
  Check,
  CheckCircle2,
  Compass,
  Info,
  Mail,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";

// ─── Konfigurations-Typen (kategorieuebergreifend) ────────────────────────────

export type FinderQuestion = {
  id: string;
  label: string;
  helper?: string;
  type: "single" | "multi" | "boolean";
  options?: { value: string; label: string; tags: string[] }[];
};

export type CollectionFinderConfig = {
  categorySlug: string;
  introHeadline: string;
  introSub: string;
  ctaLabel: string;
  categoryQuestions: FinderQuestion[];
  products: { id: string; name: string; vendor: string; initials: string; color: string; tags: string[]; detailHref: string }[];
  sponsoredProductId?: string;
  sponsoredReason?: string;
};


// ─── Konfiguration Campingplatz-Software ──────────────────────────────────────

export const campingplatzFinderConfig: CollectionFinderConfig = {
  categorySlug: "campingplatz-software",
  introHeadline: "Finde in 6 Fragen die passende Campingplatz-Software",
  introSub:
    "Kostenlos, unverbindlich und in unter zwei Minuten. Wir stellen dir echte Fragen zur Software, keine Werbung.",
  ctaLabel: "In 6 Fragen zur passenden Campingplatz-Software",
  categoryQuestions: [
    {
      id: "groesse",
      label: "Wie viele Stellplätze und Einheiten verwaltest du?",
      helper: "Hilft uns, klein geeignete von grossen Systemen zu trennen.",
      type: "single",
      options: [
        { value: "<25", label: "Bis 25 Einheiten", tags: ["klein_geeignet"] },
        { value: "25-75", label: "25 bis 75 Einheiten", tags: ["klein_geeignet"] },
        { value: "75-200", label: "75 bis 200 Einheiten", tags: ["gross_geeignet"] },
        { value: ">200", label: "Mehr als 200 Einheiten", tags: ["gross_geeignet"] },
      ],
    },
    {
      id: "betrieb",
      label: "Saison oder ganzjährig?",
      type: "single",
      options: [
        { value: "saison", label: "Saisonbetrieb", tags: [] },
        { value: "ganzjahr", label: "Ganzjährig geöffnet", tags: ["ganzjahr"] },
        { value: "beides", label: "Beides gemischt", tags: ["ganzjahr"] },
      ],
    },
    {
      id: "dauercamper",
      label: "Wie wichtig sind Dauercamper mit Jahrespacht und Stromabrechnung nach Zählerstand?",
      type: "single",
      options: [
        { value: "nein", label: "Nicht relevant", tags: [] },
        { value: "nice", label: "Nice to have", tags: ["dauercamper_stark"] },
        { value: "muss", label: "Muss-Kriterium", tags: ["dauercamper_stark", "dauercamper_stark"] },
      ],
    },
    {
      id: "buchung",
      label: "Brauchst du Online-Buchung mit Echtzeit-Verfügbarkeit?",
      type: "single",
      options: [
        { value: "muss", label: "Ja, ist Pflicht", tags: ["online_buchung", "online_buchung"] },
        { value: "spaeter", label: "Später, aber vorgesehen", tags: ["online_buchung"] },
        { value: "nein", label: "Nein, brauche ich nicht", tags: [] },
      ],
    },
    {
      id: "kasse",
      label: "In welchem Land betreibst du, und brauchst du integrierte Kasse plus elektronische Gästemeldung und Kurtaxe?",
      helper: "Mehrfachauswahl möglich. Kasse plus Meldeschein triggert DACH-Compliance.",
      type: "multi",
      options: [
        { value: "de", label: "Deutschland", tags: ["kasse_dach"] },
        { value: "at", label: "Österreich", tags: ["kasse_dach"] },
        { value: "ch", label: "Schweiz", tags: [] },
        { value: "pflicht", label: "Kasse und Meldeschein sind Pflicht für mich", tags: ["kasse_dach", "kasse_dach"] },
      ],
    },
    {
      id: "channel",
      label: "Verkaufst du über Buchungsportale und brauchst synchrone Verfügbarkeiten?",
      type: "single",
      options: [
        { value: "ja", label: "Ja, Channel Manager ist wichtig", tags: ["channel_stark", "channel_stark"] },
        { value: "nein", label: "Nein, nur Direktbuchungen", tags: [] },
        { value: "unsicher", label: "Bin mir unsicher", tags: ["channel_stark"] },
      ],
    },
  ],
  products: [
    {
      id: "eviivo-suite",
      name: "eviivo Suite",
      vendor: "eviivo",
      initials: "EV",
      color: "#0F766E",
      tags: ["channel_stark", "online_buchung", "kasse_dach", "gross_geeignet"],
      detailHref: "#ranking",
    },
    {
      id: "resavio",
      name: "RESAVIO",
      vendor: "RESAVIO",
      initials: "RE",
      color: "#1D4ED8",
      tags: ["channel_stark", "online_buchung", "gross_geeignet"],
      detailHref: "#ranking",
    },
    {
      id: "easycamp",
      name: "EASYCAMP",
      vendor: "agila.group",
      initials: "EA",
      color: "#9333EA",
      tags: ["dauercamper_stark", "kasse_dach", "modular"],
      detailHref: "#ranking",
    },
    {
      id: "c1-manager",
      name: "c1:Manager",
      vendor: "jawigo",
      initials: "C1",
      color: "#DB2777",
      tags: ["dauercamper_stark", "online_buchung", "modular"],
      detailHref: "#ranking",
    },
    {
      id: "compusoft",
      name: "CompuSoft",
      vendor: "CompuSoft",
      initials: "CO",
      color: "#EA580C",
      tags: ["online_buchung", "channel_stark", "dynamische_preise"],
      detailHref: "#ranking",
    },
    {
      id: "mycampsoft",
      name: "MyCampSoft",
      vendor: "guweb.software",
      initials: "MY",
      color: "#0369A1",
      tags: ["online_buchung", "klein_geeignet"],
      detailHref: "#ranking",
    },
    {
      id: "camping-care",
      name: "Camping.care",
      vendor: "Camping.care",
      initials: "CA",
      color: "#059669",
      tags: ["online_buchung", "channel_stark", "klein_geeignet"],
      detailHref: "#ranking",
    },
    {
      id: "campsite-os",
      name: "Campsite OS",
      vendor: "Campsite OS",
      initials: "CS",
      color: "#334155",
      tags: ["kasse_dach", "iot", "channel_stark"],
      detailHref: "#ranking",
    },
  ],
  sponsoredProductId: "eviivo-suite",
  sponsoredReason:
    "eviivo hat für diese Kategorie den Premium-Platz gebucht und wird deshalb hier als Anzeige angezeigt.",
};


// ─── Scoring (regelbasiert, gemockt) ──────────────────────────────────────────

type Answers = Record<string, string | string[] | undefined>;

function collectTags(config: CollectionFinderConfig, answers: Answers): string[] {
  const tags: string[] = [];
  for (const q of config.categoryQuestions) {
    const v = answers[q.id];
    if (!q.options || v === undefined) continue;
    const values = Array.isArray(v) ? v : [v];
    for (const val of values) {
      const opt = q.options.find((o) => o.value === val);
      if (opt) tags.push(...opt.tags);
    }
  }
  return tags;
}

function reasonFor(product: { tags: string[] }, tags: string[]): string {
  const hits = new Set(tags.filter((t) => product.tags.includes(t)));
  const map: Record<string, string> = {
    dauercamper_stark: "starkes Dauercamper-Modul",
    channel_stark: "solider Channel Manager für Portale",
    kasse_dach: "DACH-Kasse und Meldewesen abgedeckt",
    online_buchung: "Online-Buchung mit Echtzeit-Verfügbarkeit",
    klein_geeignet: "gut für kleine Plätze bis 25 Einheiten",
    gross_geeignet: "skaliert auch bei über 200 Einheiten",
    ganzjahr: "für Ganzjahresbetrieb ausgelegt",
    iot: "IoT-Anbindung für Schranke und Stromzähler",
    dynamische_preise: "dynamische Preisgestaltung",
    modular: "modular anpassbar an deinen Betrieb",
  };
  const parts = Array.from(hits).map((t) => map[t]).filter(Boolean);
  if (parts.length === 0) return "Solide Grundausstattung passend zu deinen Antworten.";
  if (parts.length === 1) return `Passt, weil ${parts[0]}.`;
  const first = parts.slice(0, 2);
  return `Passt, weil ${first.join(" und ")}.`;
}

function scoreProducts(config: CollectionFinderConfig, answers: Answers) {
  const tags = collectTags(config, answers);
  const organicPool = config.products.filter((p) => p.id !== config.sponsoredProductId);
  const scored = organicPool.map((p, idx) => {
    const score = tags.reduce((acc, t) => acc + (p.tags.includes(t) ? 1 : 0), 0);
    return { product: p, score, organicIdx: idx, reason: reasonFor(p, tags) };
  });
  scored.sort((a, b) => (b.score - a.score) || (a.organicIdx - b.organicIdx));
  const top = scored.filter((s) => s.score > 0).slice(0, 3);
  if (top.length < 2) {
    return scored.slice(0, 2);
  }
  return top;
}

function getSponsored(config: CollectionFinderConfig, answers: Answers) {
  if (!config.sponsoredProductId) return null;
  const product = config.products.find((p) => p.id === config.sponsoredProductId);
  if (!product) return null;
  const tags = collectTags(config, answers);
  return { product, reason: reasonFor(product, tags) };
}


// ─── UI-Komponenten ───────────────────────────────────────────────────────────

const ACCENT_GREEN = "#12B76A";
const PRIMARY_VIOLET = "#6C5CE7";

export function FinderTeaser({
  config,
  onStart,
}: {
  config: CollectionFinderConfig;
  onStart: () => void;
}) {
  return (
    <div className="rounded-3xl border border-border bg-card shadow-lift p-6 sm:p-8 relative overflow-hidden">
      <div
        aria-hidden
        className="absolute -top-24 -right-24 size-64 rounded-full opacity-60"
        style={{ background: `radial-gradient(circle, ${PRIMARY_VIOLET}22, transparent 70%)` }}
      />
      <div className="relative flex flex-col lg:flex-row lg:items-center gap-6 justify-between">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/60 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-foreground/60">
            <Compass className="size-3.5" style={{ color: PRIMARY_VIOLET }} />
            Software-Finder
          </div>
          <h2 className="mt-3 font-display text-2xl sm:text-3xl font-semibold tracking-tight">
            {config.introHeadline}
          </h2>
          <p className="mt-3 text-foreground/70 leading-relaxed">
            Kostenlos, unverbindlich und in unter zwei Minuten. Wir stellen dir echte Fragen zur Software,
            filtern aus 8 Tools die passenden heraus und begründen jede Empfehlung.
          </p>
        </div>
        <button
          type="button"
          onClick={onStart}
          className="inline-flex shrink-0 items-center gap-2 rounded-2xl px-5 py-3.5 text-sm font-semibold text-white shadow-lift transition hover:opacity-90"
          style={{ background: PRIMARY_VIOLET }}
        >
          <Sparkles className="size-4" />
          {config.ctaLabel}
        </button>
      </div>
    </div>
  );
}

export function CollectionFinder({
  config,
  autoStart = false,
  onExit,
}: {
  config: CollectionFinderConfig;
  autoStart?: boolean;
  onExit?: () => void;
}) {
  const [started, setStarted] = useState(autoStart);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [qualify, setQualify] = useState<{ rolle?: string; horizont?: string; situation?: string; budget?: string }>({});
  const [contact, setContact] = useState({ vorname: "", nachname: "", email: "" });
  const [consentA, setConsentA] = useState(false);
  const [consentB, setConsentB] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const wizardRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (autoStart) setStarted(true);
  }, [autoStart]);

  useEffect(() => {
    if (started && wizardRef.current) {
      wizardRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [started]);

  const totalCategorySteps = config.categoryQuestions.length;
  // Steps: 0..N-1 Kategoriefragen, N Qualifizierung, N+1 Ergebnis, N+2 Kontakt, N+3 Bestätigung
  const stepQualify = totalCategorySteps;
  const stepResult = totalCategorySteps + 1;
  const stepContact = totalCategorySteps + 2;
  const stepDone = totalCategorySteps + 3;
  const totalSteps = stepDone + 1;

  const progress = Math.min(100, Math.round(((step + 1) / (stepDone + 1)) * 100));

  const results = useMemo(() => scoreProducts(config, answers), [config, answers]);

  const canAdvanceCategory = (q: FinderQuestion) => {
    const v = answers[q.id];
    if (q.type === "multi") return Array.isArray(v) && v.length > 0;
    return typeof v === "string" && v.length > 0;
  };

  function setAnswer(qid: string, value: string, multi = false) {
    setAnswers((prev) => {
      if (!multi) return { ...prev, [qid]: value };
      const cur = (prev[qid] as string[]) ?? [];
      const next = cur.includes(value) ? cur.filter((x) => x !== value) : [...cur, value];
      return { ...prev, [qid]: next };
    });
  }

  function reset() {
    setStep(0);
    setAnswers({});
    setQualify({});
    setContact({ betrieb: "", ansprechpartner: "", email: "", telefon: "" });
    setConsentA(false);
    setConsentB(false);
    setSubmitted(false);
    setStarted(false);
    onExit?.();
  }

  if (!started) {
    return <FinderTeaser config={config} onStart={() => setStarted(true)} />;
  }

  return (
    <div
      ref={wizardRef}
      className="rounded-3xl border border-border bg-card shadow-lift overflow-hidden"
    >
      {/* Kopfleiste */}
      <div className="flex items-center justify-between gap-3 px-5 sm:px-7 py-4 border-b border-border">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-foreground/60">
          <Compass className="size-3.5" style={{ color: PRIMARY_VIOLET }} />
          Software-Finder
          <span className="text-foreground/40 normal-case tracking-normal font-normal">
            · Schritt {Math.min(step + 1, totalSteps)} von {totalSteps}
          </span>
        </div>
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-foreground/50 hover:text-foreground hover:bg-foreground/[0.05]"
          aria-label="Finder schliessen"
        >
          <X className="size-3.5" /> Schliessen
        </button>
      </div>

      {/* Fortschritt */}
      <div className="h-1.5 w-full bg-foreground/[0.06]">
        <div
          className="h-full transition-all duration-500"
          style={{ width: `${progress}%`, background: ACCENT_GREEN }}
        />
      </div>

      <div className="p-6 sm:p-8 lg:p-10">
        {/* Kategoriefragen */}
        {step < totalCategorySteps && (
          <QuestionStep
            question={config.categoryQuestions[step]}
            value={answers[config.categoryQuestions[step].id]}
            onChange={(val, multi) => setAnswer(config.categoryQuestions[step].id, val, multi)}
            microcopy={`Diese Angaben nutzen wir, um dir aus ${config.products.length} Tools die passenden herauszufiltern.`}
          />
        )}

        {/* Qualifizierung */}
        {step === stepQualify && (
          <QualifyStep qualify={qualify} setQualify={setQualify} />
        )}

        {/* Ergebnis */}
        {step === stepResult && (
          <ResultStep results={results} onGoContact={() => setStep(stepContact)} />
        )}

        {/* Kontakt */}
        {step === stepContact && !submitted && (
          <ContactStep
            contact={contact}
            setContact={setContact}
            consentA={consentA}
            setConsentA={setConsentA}
            consentB={consentB}
            setConsentB={setConsentB}
            onSubmit={() => {
              setSubmitted(true);
              setStep(stepDone);
            }}
          />
        )}

        {/* Bestätigung */}
        {step === stepDone && submitted && <DoneStep email={contact.email} onReset={reset} />}

        {/* Navigation */}
        {step !== stepDone && (
          <div className="mt-8 flex items-center justify-between gap-3 border-t border-border pt-5">
            <button
              type="button"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold text-foreground/70 hover:text-foreground disabled:opacity-30"
            >
              <ArrowLeft className="size-4" /> Zurück
            </button>

            {step < totalCategorySteps && (
              <button
                type="button"
                onClick={() => setStep((s) => s + 1)}
                disabled={!canAdvanceCategory(config.categoryQuestions[step])}
                className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-soft transition disabled:cursor-not-allowed disabled:opacity-40"
                style={{ background: PRIMARY_VIOLET }}
              >
                Weiter <ArrowRight className="size-4" />
              </button>
            )}
            {step === stepQualify && (
              <button
                type="button"
                onClick={() => setStep(stepResult)}
                className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-soft"
                style={{ background: PRIMARY_VIOLET }}
              >
                Treffer ansehen <ArrowRight className="size-4" />
              </button>
            )}
            {step === stepResult && (
              <button
                type="button"
                onClick={() => setStep(stepContact)}
                className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-soft"
                style={{ background: PRIMARY_VIOLET }}
              >
                Kostenlos Angebote anfordern <ArrowRight className="size-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Teilschritte ─────────────────────────────────────────────────────────────

function QuestionStep({
  question,
  value,
  onChange,
  microcopy,
}: {
  question: FinderQuestion;
  value: string | string[] | undefined;
  onChange: (val: string, multi: boolean) => void;
  microcopy: string;
}) {
  const multi = question.type === "multi";
  const selected = (v: string) => (multi ? (value as string[] | undefined)?.includes(v) : value === v);

  return (
    <div>
      <div className="text-[11px] font-semibold uppercase tracking-widest text-foreground/50">{microcopy}</div>
      <h3 className="mt-2 font-display text-xl sm:text-2xl font-semibold tracking-tight text-balance">
        {question.label}
      </h3>
      {question.helper && (
        <p className="mt-2 text-sm text-foreground/60">{question.helper}</p>
      )}

      <div className={`mt-6 grid gap-3 ${multi ? "sm:grid-cols-2" : "sm:grid-cols-2"}`}>
        {question.options?.map((opt) => {
          const isSel = selected(opt.value);
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value, multi)}
              className={`group relative flex items-center gap-3 rounded-2xl border p-4 text-left transition ${
                isSel
                  ? "border-transparent shadow-lift"
                  : "border-border bg-background/50 hover:bg-background hover:border-foreground/20"
              }`}
              style={isSel ? { background: `${PRIMARY_VIOLET}12`, borderColor: PRIMARY_VIOLET } : undefined}
            >
              <span
                className={`grid size-6 place-items-center rounded-md border shrink-0 transition ${
                  isSel ? "border-transparent text-white" : "border-border bg-background text-transparent"
                }`}
                style={isSel ? { background: PRIMARY_VIOLET } : undefined}
                aria-hidden
              >
                <Check className="size-3.5" />
              </span>
              <span className="text-[15px] font-medium text-foreground">{opt.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function QualifyStep({
  qualify,
  setQualify,
}: {
  qualify: { rolle?: string; horizont?: string; situation?: string; budget?: string };
  setQualify: React.Dispatch<React.SetStateAction<{ rolle?: string; horizont?: string; situation?: string; budget?: string }>>;
}) {
  const groups: { id: keyof typeof qualify; label: string; optional?: boolean; opts: string[] }[] = [
    { id: "rolle", label: "Deine Rolle", opts: ["Inhaber oder Geschäftsführung", "Betriebsleitung", "Rezeption", "IT oder Verwaltung"] },
    { id: "horizont", label: "Zeithorizont", opts: ["So bald wie möglich", "In 1 bis 3 Monaten", "Später", "Ich schaue mich nur um"] },
    { id: "situation", label: "Aktuelle Situation", opts: ["Excel oder Papier", "Software, die ich ersetzen will", "Noch gar nichts"] },
    { id: "budget", label: "Budget pro Monat", optional: true, opts: ["Unter 100 €", "100 bis 300 €", "300 bis 800 €", "Über 800 €"] },
  ];
  return (
    <div>
      <div className="text-[11px] font-semibold uppercase tracking-widest text-foreground/50">
        Fast geschafft. Diese Angaben helfen uns, die Empfehlung zu schärfen.
      </div>
      <h3 className="mt-2 font-display text-xl sm:text-2xl font-semibold tracking-tight">
        Kurz zu deinem Betrieb
      </h3>

      <div className="mt-6 space-y-6">
        {groups.map((g) => (
          <div key={g.id}>
            <div className="flex items-center gap-2">
              <div className="text-sm font-semibold text-foreground">{g.label}</div>
              {g.optional && (
                <span className="rounded-md bg-foreground/[0.05] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-foreground/50">
                  Optional
                </span>
              )}
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {g.opts.map((opt) => {
                const isSel = qualify[g.id] === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setQualify((prev) => ({ ...prev, [g.id]: prev[g.id] === opt ? undefined : opt }))}
                    className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
                      isSel
                        ? "border-transparent text-white shadow-soft"
                        : "border-border bg-background/60 text-foreground/75 hover:text-foreground hover:border-foreground/25"
                    }`}
                    style={isSel ? { background: PRIMARY_VIOLET } : undefined}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ResultStep({
  results,
  onGoContact,
}: {
  results: { product: CollectionFinderConfig["products"][number]; score: number; reason: string }[];
  onGoContact: () => void;
}) {
  return (
    <div>
      <div className="text-[11px] font-semibold uppercase tracking-widest text-foreground/50">
        Deine Auswahl · sortiert nach Passung zu deinen Antworten
      </div>
      <h3 className="mt-2 font-display text-2xl sm:text-3xl font-semibold tracking-tight">
        Deine passenden Treffer
      </h3>

      <div className="mt-6 space-y-3">
        {results.map(({ product, reason }) => (
          <article
            key={product.id}
            className="flex flex-col sm:flex-row sm:items-center gap-4 rounded-2xl border border-border bg-background/60 p-4 sm:p-5"
          >
            <span
              className="grid size-14 place-items-center rounded-2xl font-display text-lg font-bold text-white shrink-0"
              style={{ background: product.color }}
              aria-hidden
            >
              {product.initials}
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-semibold uppercase tracking-widest text-foreground/50">
                {product.vendor}
              </div>
              <div className="font-display text-lg font-semibold">{product.name}</div>
              <div
                className="mt-1.5 inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-semibold"
                style={{ background: `${ACCENT_GREEN}14`, color: "#047857" }}
              >
                <CheckCircle2 className="size-3.5" /> {reason}
              </div>
            </div>
            <div className="flex sm:flex-col gap-2 sm:items-end shrink-0">
              <a
                href={product.detailHref}
                className="inline-flex items-center gap-1 rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground hover:bg-foreground/[0.04]"
              >
                Details ansehen <ArrowRight className="size-3.5" />
              </a>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-5 flex items-start gap-2 rounded-2xl border border-dashed border-border bg-background/40 p-4 text-sm text-foreground/70">
        <ShieldCheck className="size-4 mt-0.5 shrink-0" style={{ color: ACCENT_GREEN }} />
        <div>
          Diese Auswahl richtet sich nach deinen Antworten, nicht nach bezahlter Platzierung. Nur die separat
          gekennzeichnete Premium-Zone (Zone 00, Anzeige) ist käuflich.
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-foreground/60">
          Willst du dir Angebote von diesen Anbietern zusenden lassen?
        </div>
        <button
          type="button"
          onClick={onGoContact}
          className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-soft"
          style={{ background: PRIMARY_VIOLET }}
        >
          Kostenlos Angebote anfordern <ArrowRight className="size-4" />
        </button>
      </div>
    </div>
  );
}

function ContactStep({
  contact,
  setContact,
  consentA,
  setConsentA,
  consentB,
  setConsentB,
  onSubmit,
}: {
  contact: { betrieb: string; ansprechpartner: string; email: string; telefon: string };
  setContact: React.Dispatch<React.SetStateAction<{ betrieb: string; ansprechpartner: string; email: string; telefon: string }>>;
  consentA: boolean;
  setConsentA: (v: boolean) => void;
  consentB: boolean;
  setConsentB: (v: boolean) => void;
  onSubmit: () => void;
}) {
  const canSubmit = contact.email.trim().length > 3 && contact.email.includes("@") && consentA;
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (canSubmit) onSubmit();
      }}
    >
      <div className="text-[11px] font-semibold uppercase tracking-widest text-foreground/50">
        Letzter Schritt · Angebote anfordern
      </div>
      <h3 className="mt-2 font-display text-xl sm:text-2xl font-semibold tracking-tight">
        Wohin dürfen wir dir die Angebote schicken?
      </h3>

      <div className="mt-6 grid sm:grid-cols-2 gap-4">
        <Field label="Name des Campingplatzes oder Betriebs" value={contact.betrieb} onChange={(v) => setContact((p) => ({ ...p, betrieb: v }))} placeholder="Camping Beispiel GmbH" />
        <Field label="Ansprechpartner" value={contact.ansprechpartner} onChange={(v) => setContact((p) => ({ ...p, ansprechpartner: v }))} placeholder="Vor- und Nachname" />
        <Field label="E-Mail" required type="email" value={contact.email} onChange={(v) => setContact((p) => ({ ...p, email: v }))} placeholder="name@betrieb.de" />
        <Field label="Telefon (optional)" value={contact.telefon} onChange={(v) => setContact((p) => ({ ...p, telefon: v }))} placeholder="+49 …" />
      </div>

      <div className="mt-6 space-y-3">
        <ConsentBox
          checked={consentA}
          onChange={setConsentA}
          required
          label="Ja, schickt mir passende Angebote und Produktvorstellungen zu Campingplatz-Software. Ich kann dem jederzeit widersprechen."
        />
        <ConsentBox
          checked={consentB}
          onChange={setConsentB}
          label="Benachrichtigt mich, wenn neue oder bessere Campingplatz-Software dazukommt. (Launch-Service, jederzeit abbestellbar)"
        />
      </div>

      <div className="mt-4 flex items-start gap-2 text-xs text-foreground/60">
        <Info className="size-3.5 mt-0.5 shrink-0" />
        <div>
          Wir bestätigen deine Anmeldung per E-Mail (Double-Opt-in). Deine Daten gehen nicht ungefragt an Anbieter,
          die Ansprache läuft über Toolfolio.
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          type="submit"
          disabled={!canSubmit}
          className="inline-flex items-center gap-1.5 rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-lift disabled:cursor-not-allowed disabled:opacity-40"
          style={{ background: PRIMARY_VIOLET }}
        >
          <Mail className="size-4" /> Anfrage absenden
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <div className="text-xs font-semibold text-foreground/70">
        {label} {required && <span style={{ color: PRIMARY_VIOLET }}>*</span>}
      </div>
      <input
        type={type}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1.5 w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-[color:var(--success)]/40"
      />
    </label>
  );
}

function ConsentBox({
  checked,
  onChange,
  label,
  required,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  required?: boolean;
}) {
  return (
    <label className="flex items-start gap-3 rounded-2xl border border-border bg-background/50 p-3.5 cursor-pointer hover:bg-background transition">
      <span
        className={`grid size-5 place-items-center rounded-md border shrink-0 mt-0.5 ${
          checked ? "border-transparent text-white" : "border-border bg-background text-transparent"
        }`}
        style={checked ? { background: PRIMARY_VIOLET } : undefined}
        aria-hidden
      >
        <Check className="size-3.5" />
      </span>
      <input
        type="checkbox"
        className="sr-only"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        required={required}
      />
      <span className="text-sm text-foreground/80 leading-relaxed">
        {label} {required && <span style={{ color: PRIMARY_VIOLET }}>*</span>}
      </span>
    </label>
  );
}

function DoneStep({ email, onReset }: { email: string; onReset: () => void }) {
  return (
    <div className="text-center py-6">
      <div
        className="mx-auto grid size-14 place-items-center rounded-2xl"
        style={{ background: `${ACCENT_GREEN}18`, color: "#047857" }}
      >
        <CheckCircle2 className="size-7" />
      </div>
      <h3 className="mt-4 font-display text-2xl font-semibold tracking-tight">Fast geschafft</h3>
      <p className="mt-2 text-foreground/70 max-w-md mx-auto">
        Bitte bestätige die E-Mail, die wir dir gerade an{" "}
        <span className="font-semibold text-foreground">{email || "deine Adresse"}</span> geschickt haben.
        Danach leiten wir deine Anfrage an die passenden Anbieter weiter.
      </p>
      <button
        type="button"
        onClick={onReset}
        className="mt-6 inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-4 py-2 text-sm font-semibold hover:bg-foreground/[0.04]"
      >
        Finder schliessen
      </button>
    </div>
  );
}
