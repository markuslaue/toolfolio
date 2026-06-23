import { useState } from "react";
import {
  ArrowRight,
  Check,
  Minus,
  ChevronDown,
  Sparkles,
  Users,
  Wallet,
  ShieldCheck,
  Building2,
  UserCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Nav, Footer, Reveal, fmtEUR } from "@/components/marketing/marketing-home";

/**
 * Platzhalter — Preise & Limits zentral hier anpassen.
 * Werte sind Hypothesen zum Validieren, keine echten Endpreise.
 */
const PLAEN = {
  jahresRabattProzent: 20, // Platzhalter
  free: {
    monat: 0,
    jahrProMonat: 0,
    aboLimit: 15,
    nutzer: 1,
  },
  pro: {
    monat: 14, // Platzhalter, anpassen
    jahrProMonat: 11, // Platzhalter, anpassen (≈ -20 %)
    nutzer: 1,
  },
  agentur: {
    monat: 69, // Platzhalter, anpassen
    jahrProMonat: 55, // Platzhalter, anpassen (≈ -20 %)
    nutzer: "Mehrere",
  },
} as const;

type Cadence = "monat" | "jahr";

function PriceBlock({
  betrag,
  cadence,
  hinweis,
}: {
  betrag: number;
  cadence: Cadence;
  hinweis?: string;
}) {
  if (betrag === 0) {
    return (
      <div className="flex items-baseline gap-2">
        <span className="font-display text-5xl font-semibold tabular">0 €</span>
        <span className="text-sm text-muted-foreground">für immer</span>
      </div>
    );
  }
  return (
    <div>
      <div className="flex items-baseline gap-2">
        <span className="font-display text-5xl font-semibold tabular">
          {fmtEUR(betrag).replace(/\s?€/, " €")}
        </span>
        <span className="text-sm text-muted-foreground">/ Monat</span>
      </div>
      <div className="mt-1 text-xs text-muted-foreground">
        {cadence === "jahr"
          ? "jährlich abgerechnet"
          : "monatlich abgerechnet"}
        {hinweis ? ` · ${hinweis}` : ""}
      </div>
    </div>
  );
}

function PlanCards({ cadence }: { cadence: Cadence }) {
  const proPreis = cadence === "jahr" ? PLAEN.pro.jahrProMonat : PLAEN.pro.monat;
  const agPreis = cadence === "jahr" ? PLAEN.agentur.jahrProMonat : PLAEN.agentur.monat;

  const plans = [
    {
      name: "Free",
      zielgruppe: "Für Solo und Einsteiger",
      betrag: 0,
      hinweis: undefined,
      featured: false,
      icon: UserCheck,
      features: [
        `Bis ${PLAEN.free.aboLimit} Abos im Tracker`,
        "Übersichts-Dashboard",
        "Kontoauszug-Import",
        "Manuelles Anlegen",
        "Fristen-Wächter (Basis)",
        "Benchmark als Teaser",
        "1 Nutzer",
      ],
      cta: "Kostenlos starten",
      ctaHref: "/onboarding",
      ctaVariant: "ghost" as const,
    },
    {
      name: "Pro",
      zielgruppe: "Für Solopreneure und Freelancer",
      betrag: proPreis,
      hinweis: undefined,
      featured: true,
      icon: Sparkles,
      features: [
        "Unbegrenzte Abos",
        "Beleg-Postfach & alle Erfassungswege",
        "AI-Credit-Tracker",
        "Voller Benchmark",
        "Sparvorschläge und Deals",
        "Rechnungs- und Vertragsarchiv",
        "Steuer-Export",
        "1 Nutzer",
      ],
      cta: "Pro starten",
      ctaHref: "/onboarding",
      ctaVariant: "primary" as const,
    },
    {
      name: "Agentur",
      zielgruppe: "Für Agenturen und Teams",
      betrag: agPreis,
      hinweis: undefined,
      featured: false,
      icon: Building2,
      features: [
        "Alles aus Pro",
        "Kosten pro Kunde",
        "Weiterverrechnungs-Reports",
        "Team & Rollen",
        "Seats-Verwaltung",
        "Freigabe-Workflow",
        "Mehrere Nutzer",
      ],
      cta: "Agentur starten",
      ctaHref: "/onboarding",
      ctaVariant: "outline" as const,
    },
  ];

  return (
    <div className="grid md:grid-cols-3 gap-5 items-stretch">
      {plans.map((p, i) => (
        <Reveal key={p.name} delay={i * 80}>
          <div
            className={cn(
              "relative h-full rounded-3xl border p-7 flex flex-col card-lift",
              p.featured
                ? "border-primary bg-card shadow-lift ring-1 ring-primary/30 md:-translate-y-2"
                : "border-border bg-card",
            )}
          >
            {p.featured && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 shadow-soft">
                Beliebt
              </div>
            )}
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                <p.icon className="size-5" />
              </span>
              <div>
                <div className="font-display text-xl font-semibold">{p.name}</div>
                <div className="text-xs text-muted-foreground">{p.zielgruppe}</div>
              </div>
            </div>

            <div className="mt-6">
              <PriceBlock betrag={p.betrag} cadence={cadence} hinweis={p.hinweis} />
            </div>

            <ul className="mt-6 space-y-2.5 text-sm">
              {p.features.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <Check className="mt-0.5 size-4 text-success shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <a
              href={p.ctaHref}
              className={cn(
                "mt-7 inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition-all",
                p.ctaVariant === "primary" &&
                  "bg-primary text-primary-foreground hover:bg-primary/90 shadow-soft hover:shadow-lift",
                p.ctaVariant === "outline" &&
                  "border border-border bg-card hover:bg-accent",
                p.ctaVariant === "ghost" &&
                  "bg-secondary text-foreground hover:bg-secondary/70",
              )}
            >
              {p.cta} <ArrowRight className="size-4" />
            </a>
          </div>
        </Reveal>
      ))}
    </div>
  );
}

function BillingToggle({
  value,
  onChange,
}: {
  value: Cadence;
  onChange: (v: Cadence) => void;
}) {
  return (
    <div className="inline-flex items-center gap-3">
      <div className="relative inline-flex rounded-full border border-border bg-card p-1 shadow-soft">
        {(["monat", "jahr"] as const).map((c) => (
          <button
            key={c}
            onClick={() => onChange(c)}
            className={cn(
              "relative z-10 rounded-full px-5 py-2 text-sm font-semibold transition-colors",
              value === c ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {c === "monat" ? "Monatlich" : "Jährlich"}
            {value === c && (
              <span className="absolute inset-0 -z-10 rounded-full bg-primary transition-all" />
            )}
          </button>
        ))}
      </div>
      <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-3 py-1 text-xs font-semibold text-success">
        <Sparkles className="size-3" /> Spare {PLAEN.jahresRabattProzent} % im Jahr
      </span>
    </div>
  );
}

function Hero({
  cadence,
  setCadence,
}: {
  cadence: Cadence;
  setCadence: (c: Cadence) => void;
}) {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-32 -left-20 size-[480px] rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute top-40 -right-20 size-[420px] rounded-full bg-coral/15 blur-3xl" />
      </div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-14 sm:pt-20 pb-10 text-center">
        <Reveal>
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground">
            <span className="size-1.5 rounded-full bg-coral" />
            Preise
          </div>
          <h1 className="mt-5 font-display text-4xl sm:text-5xl lg:text-6xl font-semibold leading-[1.05] tracking-tight">
            Zahl weniger,{" "}
            <span className="text-primary">als du sparst.</span>
          </h1>
          <p className="mt-5 text-lg text-muted-foreground max-w-2xl mx-auto">
            Schon der Free-Tarif bringt dir den Überblick. Die bezahlten Pläne sparen aktiv
            Geld, indem sie Fristen wahren, Redundanzen aufdecken und Alternativen vorschlagen.
          </p>
          <div className="mt-8 flex justify-center">
            <BillingToggle value={cadence} onChange={setCadence} />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function TrialNote() {
  return (
    <section className="pt-2 pb-10">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <Reveal>
          <div className="rounded-2xl border border-success/30 bg-success/5 p-5 text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-success/15 px-3 py-1 text-xs font-semibold text-success">
              <Sparkles className="size-3" /> 14 Tage kostenlos testen
            </div>
            <p className="mt-3 text-sm sm:text-base text-foreground">
              Jeder startet mit 14 Tagen vollem Agentur-Zugang. Danach wählst du deinen
              Plan oder bleibst kostenlos. Keine Kreditkarte nötig.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

type Cell = boolean | string;

const VERGLEICH: { gruppe: string; zeilen: { label: string; werte: [Cell, Cell, Cell] }[] }[] = [
  {
    gruppe: "Erfassung",
    zeilen: [
      { label: "Abo-Limit", werte: [`bis ${PLAEN.free.aboLimit}`, "unbegrenzt", "unbegrenzt"] },
      { label: "Manuelles Anlegen", werte: [true, true, true] },
      { label: "Kontoauszug-Import", werte: [true, true, true] },
      { label: "Beleg-Postfach", werte: [false, true, true] },
      { label: "Mailbox- und Workspace-Discovery", werte: [false, true, true] },
    ],
  },
  {
    gruppe: "Überblick & Wächter",
    zeilen: [
      { label: "Dashboard und Übersicht", werte: [true, true, true] },
      { label: "Fristen-Wächter", werte: ["Basis", "Voll", "Voll"] },
      { label: "Budget & Forecast", werte: [false, true, true] },
      { label: "Benachrichtigungen", werte: ["Basis", "Voll", "Voll"] },
    ],
  },
  {
    gruppe: "Intelligenz",
    zeilen: [
      { label: "Benchmark", werte: ["Teaser", "Voll", "Voll"] },
      { label: "Sparvorschläge", werte: [false, true, true] },
      { label: "Deals und Gutscheine", werte: [false, true, true] },
      { label: "AI-Credit-Tracker", werte: [false, true, true] },
    ],
  },
  {
    gruppe: "Dokumente & Steuer",
    zeilen: [
      { label: "Rechnungsarchiv", werte: [false, true, true] },
      { label: "Vertragsarchiv", werte: [false, true, true] },
      { label: "Steuer-Export (DATEV/CSV)", werte: [false, true, true] },
    ],
  },
  {
    gruppe: "Agentur",
    zeilen: [
      { label: "Kosten pro Kunde", werte: [false, false, true] },
      { label: "Weiterverrechnungs-Reports", werte: [false, false, true] },
      { label: "Team & Rollen", werte: [false, false, true] },
      { label: "Seats-Verwaltung", werte: [false, false, true] },
      { label: "Freigabe-Workflow", werte: [false, false, true] },
      { label: "Mehrere Gesellschaften", werte: [false, false, true] },
    ],
  },
  {
    gruppe: "Nutzer",
    zeilen: [
      {
        label: "Inklusive Nutzer",
        werte: [`${PLAEN.free.nutzer}`, `${PLAEN.pro.nutzer}`, String(PLAEN.agentur.nutzer)],
      },
    ],
  },
];

function CellRender({ value }: { value: Cell }) {
  if (value === true) return <Check className="mx-auto size-4 text-success" />;
  if (value === false) return <Minus className="mx-auto size-4 text-muted-foreground/50" />;
  return <span className="text-sm font-medium tabular">{value}</span>;
}

function Vergleich() {
  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <div className="max-w-2xl">
            <div className="text-xs font-semibold uppercase tracking-widest text-primary">
              Funktions-Vergleich
            </div>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl font-semibold tracking-tight">
              Alles auf einen Blick.
            </h2>
            <p className="mt-3 text-muted-foreground">
              Der Agentur-Layer (Kosten pro Kunde, Weiterverrechnung, Team, Seats, Freigaben)
              ist die klare Schwelle zwischen Pro und Agentur.
            </p>
          </div>
        </Reveal>

        <Reveal>
          <div className="mt-10 rounded-3xl border border-border bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead className="sticky top-0 z-10 bg-secondary/80 backdrop-blur">
                  <tr>
                    <th className="text-left font-semibold px-5 py-4">Funktion</th>
                    {(["Free", "Pro", "Agentur"] as const).map((n, i) => (
                      <th
                        key={n}
                        className={cn(
                          "px-5 py-4 text-center font-semibold",
                          i === 1 && "text-primary",
                        )}
                      >
                        {n}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {VERGLEICH.map((grp) => (
                    <>
                      <tr key={grp.gruppe} className="bg-secondary/40">
                        <td
                          colSpan={4}
                          className="px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                        >
                          {grp.gruppe}
                        </td>
                      </tr>
                      {grp.zeilen.map((z) => (
                        <tr key={z.label} className="border-t border-border/60">
                          <td className="px-5 py-3 text-foreground/90">{z.label}</td>
                          {z.werte.map((v, i) => (
                            <td
                              key={i}
                              className={cn(
                                "px-5 py-3 text-center",
                                i === 1 && "bg-primary/5",
                              )}
                            >
                              <CellRender value={v} />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Trust() {
  const items = [
    { icon: Wallet, text: "Jederzeit kündbar" },
    { icon: UserCheck, text: "Keine Kreditkarte für Free" },
    { icon: ShieldCheck, text: "Keine Passwörter oder Kartennummern gespeichert" },
    { icon: Users, text: "DSGVO-konform, Hosting in der EU" },
  ];
  return (
    <section className="py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="rounded-3xl border border-border bg-card p-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {items.map((it) => (
            <div key={it.text} className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-success/15 text-success">
                <it.icon className="size-5" />
              </span>
              <span className="text-sm font-medium">{it.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const FAQS = [
  {
    q: "Ist Free wirklich dauerhaft kostenlos?",
    a: `Ja. Free bleibt für immer 0 €, mit bis zu ${PLAEN.free.aboLimit} Abos und den wichtigsten Funktionen zum Überblick. Keine versteckten Kosten.`,
  },
  {
    q: "Was passiert nach dem 14-Tage-Test?",
    a: "Nach 14 Tagen wählst du Pro oder Agentur. Wenn du nichts auswählst, läuft dein Konto automatisch im Free-Plan weiter. Wir buchen niemals ohne deine Zustimmung ab.",
  },
  {
    q: "Kann ich jederzeit wechseln oder kündigen?",
    a: "Ja. Upgrade, Downgrade und Kündigung sind jederzeit zum Ende des laufenden Abrechnungszeitraums möglich, direkt in deinen Einstellungen.",
  },
  {
    q: "Wie funktioniert der Benchmark und sind meine Daten sicher?",
    a: "Benchmarks basieren auf anonymisierten Aggregat-Daten aus dem Toolfolio-Netzwerk. Niemand sieht deine Beträge einzeln. Du kannst die Teilnahme jederzeit deaktivieren.",
  },
  {
    q: "Was unterscheidet Pro von Agentur?",
    a: "Pro ist der volle Tracker für eine Person. Agentur ergänzt alles, was du für Teams brauchst: Kosten pro Kunde, Weiterverrechnung, Team & Rollen, Seats und Freigaben.",
  },
  {
    q: "Gibt es einen Jahresrabatt?",
    a: `Ja, bei jährlicher Abrechnung sparst du rund ${PLAEN.jahresRabattProzent} %. Den Rabatt siehst du oben im Toggle.`,
  },
  {
    q: "Brauche ich für den Test eine Kreditkarte?",
    a: "Nein. Der 14-Tage-Test startet ohne Zahlungsmittel. Du gibst nur dann Zahlungsdaten an, wenn du am Ende des Tests auf Pro oder Agentur bleibst.",
  },
];

function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="py-20 sm:py-24 bg-secondary/50">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <Reveal>
          <div className="text-center">
            <div className="text-xs font-semibold uppercase tracking-widest text-primary">
              FAQ
            </div>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl font-semibold tracking-tight">
              Häufige Fragen
            </h2>
          </div>
        </Reveal>

        <div className="mt-10 space-y-3">
          {FAQS.map((f, i) => {
            const isOpen = open === i;
            return (
              <Reveal key={f.q} delay={i * 50}>
                <div
                  className={cn(
                    "rounded-2xl border bg-card transition-colors",
                    isOpen ? "border-primary/40" : "border-border",
                  )}
                >
                  <button
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                  >
                    <span className="font-semibold">{f.q}</span>
                    <ChevronDown
                      className={cn(
                        "size-5 shrink-0 text-muted-foreground transition-transform",
                        isOpen && "rotate-180 text-primary",
                      )}
                    />
                  </button>
                  <div
                    className={cn(
                      "grid transition-all duration-300 ease-out",
                      isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                    )}
                  >
                    <div className="overflow-hidden">
                      <p className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">
                        {f.a}
                      </p>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <div className="relative overflow-hidden rounded-[32px] bg-foreground text-[color:var(--paper)] p-10 sm:p-16 text-center">
            <div className="absolute -top-20 -right-20 size-72 rounded-full bg-primary/40 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 size-72 rounded-full bg-coral/40 blur-3xl" />
            <div className="relative">
              <h2 className="font-display text-3xl sm:text-5xl font-semibold tracking-tight">
                Starte heute. Spar ab morgen.
              </h2>
              <p className="mt-4 text-lg opacity-80 max-w-xl mx-auto">
                14 Tage voller Zugang, danach Free oder bezahlt. Keine Kreditkarte nötig.
              </p>
              <a
                href="/onboarding"
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-7 py-4 text-base font-semibold text-primary-foreground shadow-lift hover:bg-primary/90 transition-all"
              >
                Kostenlos starten <ArrowRight className="size-4" />
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function PricingPage() {
  const [cadence, setCadence] = useState<Cadence>("jahr");
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />
      <Hero cadence={cadence} setCadence={setCadence} />
      <section className="pt-4 pb-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <PlanCards cadence={cadence} />
        </div>
      </section>
      <TrialNote />
      <Vergleich />
      <Trust />
      <FAQ />
      <FinalCTA />
      <Footer />
    </div>
  );
}

export default PricingPage;
