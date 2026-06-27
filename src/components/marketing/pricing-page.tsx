"use client";

import { Fragment, useState } from "react";
import Link from "next/link";
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
import { Reveal, fmtEUR } from "@/components/marketing/marketing-home";
import { PLANS, FREE_ABO_LIMIT, YEARLY_DISCOUNT } from "@/lib/constants";

/**
 * Preise & Limits kommen zentral aus src/lib/constants.ts (einzige Quelle der Wahrheit).
 * Hier nur die Abbildung auf die Seitenstruktur, keine eigenen Preiswerte.
 */
const PLAEN = {
  jahresRabattProzent: Math.round(YEARLY_DISCOUNT * 100),
  free: { monat: PLANS.free.monthlyEur, jahrProMonat: PLANS.free.yearlyMonthlyEur, aboLimit: FREE_ABO_LIMIT, nutzer: PLANS.free.nutzer },
  pro: { monat: PLANS.pro.monthlyEur, jahrProMonat: PLANS.pro.yearlyMonthlyEur, nutzer: PLANS.pro.nutzer },
  agentur: { monat: PLANS.agentur.monthlyEur, jahrProMonat: PLANS.agentur.yearlyMonthlyEur, nutzer: PLANS.agentur.nutzer },
} as const;

type Cadence = "monat" | "jahr";

function PriceBlock({ betrag, cadence, hinweis }: { betrag: number; cadence: Cadence; hinweis?: string }) {
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
        <span className="font-display text-5xl font-semibold tabular">{fmtEUR(betrag).replace(/\s?€/, " €")}</span>
        <span className="text-sm text-muted-foreground">/ Monat</span>
      </div>
      <div className="mt-1 text-xs text-muted-foreground">
        {cadence === "jahr" ? "jährlich abgerechnet" : "monatlich abgerechnet"}
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
      name: "Free", zielgruppe: "Für Solo und Einsteiger", betrag: 0, featured: false, icon: UserCheck,
      features: [`Bis ${PLAEN.free.aboLimit} Abos im Tracker`, "Übersichts-Dashboard", "Kontoauszug-Import", "Manuelles Anlegen", "Fristen-Wächter (Basis)", "Benchmark als Teaser", "1 Nutzer"],
      cta: "Kostenlos starten", ctaHref: "/registrieren", ctaVariant: "ghost" as const,
    },
    {
      name: "Pro", zielgruppe: "Für Solopreneure und Freelancer", betrag: proPreis, featured: true, icon: Sparkles,
      features: ["Unbegrenzte Abos", "Beleg-Postfach & alle Erfassungswege", "AI-Credit-Tracker", "Voller Benchmark", "Sparvorschläge und Deals", "Rechnungs- und Vertragsarchiv", "Steuer-Export", "1 Nutzer"],
      cta: "Pro starten", ctaHref: "/registrieren", ctaVariant: "primary" as const,
    },
    {
      name: "Agentur", zielgruppe: "Für Agenturen und Teams", betrag: agPreis, featured: false, icon: Building2,
      features: ["Alles aus Pro", "Kosten pro Kunde", "Weiterverrechnungs-Reports", "Team & Rollen", "Seats-Verwaltung", "Freigabe-Workflow", "Mehrere Nutzer"],
      cta: "Agentur starten", ctaHref: "/registrieren", ctaVariant: "outline" as const,
    },
  ];

  return (
    <div className="grid items-stretch gap-5 md:grid-cols-3">
      {plans.map((p, i) => (
        <Reveal key={p.name} delay={i * 80}>
          <div className={cn("card-lift relative flex h-full flex-col rounded-3xl border p-7", p.featured ? "border-primary bg-card shadow-lift ring-1 ring-primary/30 md:-translate-y-2" : "border-border bg-card")}>
            {p.featured && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground shadow-soft">Beliebt</div>
            )}
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary"><p.icon className="size-5" /></span>
              <div>
                <div className="font-display text-xl font-semibold">{p.name}</div>
                <div className="text-xs text-muted-foreground">{p.zielgruppe}</div>
              </div>
            </div>
            <div className="mt-6"><PriceBlock betrag={p.betrag} cadence={cadence} /></div>
            <ul className="mt-6 space-y-2.5 text-sm">
              {p.features.map((f) => (
                <li key={f} className="flex items-start gap-2"><Check className="mt-0.5 size-4 shrink-0 text-success" /><span>{f}</span></li>
              ))}
            </ul>
            <Link href={p.ctaHref} className={cn("mt-7 inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition-all", p.ctaVariant === "primary" && "bg-primary text-primary-foreground shadow-soft hover:bg-primary/90 hover:shadow-lift", p.ctaVariant === "outline" && "border border-border bg-card hover:bg-accent", p.ctaVariant === "ghost" && "bg-secondary text-foreground hover:bg-secondary/70")}>
              {p.cta} <ArrowRight className="size-4" />
            </Link>
          </div>
        </Reveal>
      ))}
    </div>
  );
}

function BillingToggle({ value, onChange }: { value: Cadence; onChange: (v: Cadence) => void }) {
  return (
    <div className="inline-flex items-center gap-3">
      <div className="relative inline-flex rounded-full border border-border bg-card p-1 shadow-soft">
        {(["monat", "jahr"] as const).map((c) => (
          <button key={c} onClick={() => onChange(c)} className={cn("relative z-10 rounded-full px-5 py-2 text-sm font-semibold transition-colors", value === c ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>
            {c === "monat" ? "Monatlich" : "Jährlich"}
            {value === c && <span className="absolute inset-0 -z-10 rounded-full bg-primary transition-all" />}
          </button>
        ))}
      </div>
      <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-3 py-1 text-xs font-semibold text-success">
        <Sparkles className="size-3" /> Spare {PLAEN.jahresRabattProzent} % im Jahr
      </span>
    </div>
  );
}

function Hero({ cadence, setCadence }: { cadence: Cadence; setCadence: (c: Cadence) => void }) {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute -left-20 -top-32 size-[480px] rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -right-20 top-40 size-[420px] rounded-full bg-coral/15 blur-3xl" />
      </div>
      <div className="mx-auto max-w-7xl px-4 pb-10 pt-14 text-center sm:px-6 sm:pt-20">
        <Reveal>
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground">
            <span className="size-1.5 rounded-full bg-coral" /> Preise
          </div>
          <h1 className="mt-5 font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
            Zahl weniger, <span className="text-primary">als du sparst.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
            Schon der Free-Tarif bringt dir den Überblick. Die bezahlten Pläne sparen aktiv Geld,
            indem sie Fristen wahren, Redundanzen aufdecken und Alternativen vorschlagen.
          </p>
          <div className="mt-8 flex justify-center"><BillingToggle value={cadence} onChange={setCadence} /></div>
        </Reveal>
      </div>
    </section>
  );
}

function TrialNote() {
  return (
    <section className="pb-10 pt-2">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <Reveal>
          <div className="rounded-2xl border border-success/30 bg-success/5 p-5 text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-success/15 px-3 py-1 text-xs font-semibold text-success">
              <Sparkles className="size-3" /> 14 Tage kostenlos testen
            </div>
            <p className="mt-3 text-sm text-foreground sm:text-base">
              Jeder startet mit 14 Tagen vollem Agentur-Zugang. Danach wählst du deinen Plan oder
              bleibst kostenlos. Keine Kreditkarte nötig.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

type Cell = boolean | string;

const VERGLEICH: { gruppe: string; zeilen: { label: string; werte: [Cell, Cell, Cell] }[] }[] = [
  { gruppe: "Erfassung", zeilen: [
    { label: "Abo-Limit", werte: [`bis ${PLAEN.free.aboLimit}`, "unbegrenzt", "unbegrenzt"] },
    { label: "Manuelles Anlegen", werte: [true, true, true] },
    { label: "Kontoauszug-Import", werte: [true, true, true] },
    { label: "Beleg-Postfach", werte: [false, true, true] },
    { label: "Mailbox- und Workspace-Discovery", werte: [false, true, true] },
  ]},
  { gruppe: "Überblick & Wächter", zeilen: [
    { label: "Dashboard und Übersicht", werte: [true, true, true] },
    { label: "Fristen-Wächter", werte: ["Basis", "Voll", "Voll"] },
    { label: "Budget & Forecast", werte: [false, true, true] },
    { label: "Benachrichtigungen", werte: ["Basis", "Voll", "Voll"] },
  ]},
  { gruppe: "Intelligenz", zeilen: [
    { label: "Benchmark", werte: ["Teaser", "Voll", "Voll"] },
    { label: "Sparvorschläge", werte: [false, true, true] },
    { label: "Deals und Gutscheine", werte: [false, true, true] },
    { label: "AI-Credit-Tracker", werte: [false, true, true] },
  ]},
  { gruppe: "Dokumente & Steuer", zeilen: [
    { label: "Rechnungsarchiv", werte: [false, true, true] },
    { label: "Vertragsarchiv", werte: [false, true, true] },
    { label: "Steuer-Export (DATEV/CSV)", werte: [false, true, true] },
  ]},
  { gruppe: "Agentur", zeilen: [
    { label: "Kosten pro Kunde", werte: [false, false, true] },
    { label: "Weiterverrechnungs-Reports", werte: [false, false, true] },
    { label: "Team & Rollen", werte: [false, false, true] },
    { label: "Seats-Verwaltung", werte: [false, false, true] },
    { label: "Freigabe-Workflow", werte: [false, false, true] },
    { label: "Mehrere Gesellschaften", werte: [false, false, true] },
  ]},
  { gruppe: "Nutzer", zeilen: [
    { label: "Inklusive Nutzer", werte: [`${PLAEN.free.nutzer}`, `${PLAEN.pro.nutzer}`, String(PLAEN.agentur.nutzer)] },
  ]},
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
            <div className="text-xs font-semibold uppercase tracking-widest text-primary">Funktions-Vergleich</div>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">Alles auf einen Blick.</h2>
            <p className="mt-3 text-muted-foreground">
              Der Agentur-Layer (Kosten pro Kunde, Weiterverrechnung, Team, Seats, Freigaben) ist die
              klare Schwelle zwischen Pro und Agentur.
            </p>
          </div>
        </Reveal>
        <Reveal>
          <div className="mt-10 overflow-hidden rounded-3xl border border-border bg-card">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead className="sticky top-0 z-10 bg-secondary/80 backdrop-blur">
                  <tr>
                    <th className="px-5 py-4 text-left font-semibold">Funktion</th>
                    {(["Free", "Pro", "Agentur"] as const).map((n, i) => (
                      <th key={n} className={cn("px-5 py-4 text-center font-semibold", i === 1 && "text-primary")}>{n}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {VERGLEICH.map((grp) => (
                    <Fragment key={grp.gruppe}>
                      <tr className="bg-secondary/40">
                        <td colSpan={4} className="px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{grp.gruppe}</td>
                      </tr>
                      {grp.zeilen.map((z) => (
                        <tr key={z.label} className="border-t border-border/60">
                          <td className="px-5 py-3 text-foreground/90">{z.label}</td>
                          {z.werte.map((v, i) => (
                            <td key={i} className={cn("px-5 py-3 text-center", i === 1 && "bg-primary/5")}><CellRender value={v} /></td>
                          ))}
                        </tr>
                      ))}
                    </Fragment>
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
        <div className="grid gap-4 rounded-3xl border border-border bg-card p-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((it) => (
            <div key={it.text} className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-success/15 text-success"><it.icon className="size-5" /></span>
              <span className="text-sm font-medium">{it.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const FAQS = [
  { q: "Ist Free wirklich dauerhaft kostenlos?", a: `Ja. Free bleibt für immer 0 €, mit bis zu ${PLAEN.free.aboLimit} Abos und den wichtigsten Funktionen zum Überblick. Keine versteckten Kosten.` },
  { q: "Was passiert nach dem 14-Tage-Test?", a: "Nach 14 Tagen wählst du Pro oder Agentur. Wenn du nichts auswählst, läuft dein Konto automatisch im Free-Plan weiter. Wir buchen niemals ohne deine Zustimmung ab." },
  { q: "Kann ich jederzeit wechseln oder kündigen?", a: "Ja. Upgrade, Downgrade und Kündigung sind jederzeit zum Ende des laufenden Abrechnungszeitraums möglich, direkt in deinen Einstellungen." },
  { q: "Wie funktioniert der Benchmark und sind meine Daten sicher?", a: "Benchmarks basieren auf anonymisierten Aggregat-Daten aus dem Toolfolio-Netzwerk. Niemand sieht deine Beträge einzeln. Du kannst die Teilnahme jederzeit deaktivieren." },
  { q: "Was unterscheidet Pro von Agentur?", a: "Pro ist der volle Tracker für eine Person. Agentur ergänzt alles, was du für Teams brauchst: Kosten pro Kunde, Weiterverrechnung, Team & Rollen, Seats und Freigaben." },
  { q: "Gibt es einen Jahresrabatt?", a: `Ja, bei jährlicher Abrechnung sparst du rund ${PLAEN.jahresRabattProzent} %. Den Rabatt siehst du oben im Toggle.` },
  { q: "Brauche ich für den Test eine Kreditkarte?", a: "Nein. Der 14-Tage-Test startet ohne Zahlungsmittel. Du gibst nur dann Zahlungsdaten an, wenn du am Ende des Tests auf Pro oder Agentur bleibst." },
];

function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="bg-secondary/50 py-20 sm:py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <Reveal>
          <div className="text-center">
            <div className="text-xs font-semibold uppercase tracking-widest text-primary">FAQ</div>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">Häufige Fragen</h2>
          </div>
        </Reveal>
        <div className="mt-10 space-y-3">
          {FAQS.map((f, i) => {
            const isOpen = open === i;
            return (
              <Reveal key={f.q} delay={i * 50}>
                <div className={cn("rounded-2xl border bg-card transition-colors", isOpen ? "border-primary/40" : "border-border")}>
                  <button onClick={() => setOpen(isOpen ? null : i)} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left">
                    <span className="font-semibold">{f.q}</span>
                    <ChevronDown className={cn("size-5 shrink-0 text-muted-foreground transition-transform", isOpen && "rotate-180 text-primary")} />
                  </button>
                  <div className={cn("grid transition-all duration-300 ease-out", isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0")}>
                    <div className="overflow-hidden"><p className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">{f.a}</p></div>
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
          <div className="relative overflow-hidden rounded-[32px] bg-foreground p-10 text-center text-[color:var(--paper)] sm:p-16">
            <div className="absolute -right-20 -top-20 size-72 rounded-full bg-primary/40 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 size-72 rounded-full bg-coral/40 blur-3xl" />
            <div className="relative">
              <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-5xl">Starte heute. Spar ab morgen.</h2>
              <p className="mx-auto mt-4 max-w-xl text-lg opacity-80">14 Tage voller Zugang, danach Free oder bezahlt. Keine Kreditkarte nötig.</p>
              <Link href="/registrieren" className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-7 py-4 text-base font-semibold text-primary-foreground shadow-lift transition-all hover:bg-primary/90">
                Kostenlos starten <ArrowRight className="size-4" />
              </Link>
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
    <>
      <Hero cadence={cadence} setCadence={setCadence} />
      <section className="pb-6 pt-4">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <PlanCards cadence={cadence} />
        </div>
      </section>
      <TrialNote />
      <Vergleich />
      <Trust />
      <FAQ />
      <FinalCTA />
    </>
  );
}
