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
  Landmark,
  Wrench,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";
import { Reveal, fmtEUR } from "@/components/marketing/marketing-home";
import {
  PLANS,
  PLAN_ORDER,
  FREE_ABO_LIMIT,
  YEARLY_DISCOUNT,
  planPreisProMonat,
  empfohleneStufe,
  type PlanId,
  type Abrechnung,
} from "@/lib/constants";

// Slider-Grenzen (rein fuer die Marketing-Seite; Werte selbst kommen aus constants.ts).
const NUTZER_MIN = 1;
const NUTZER_MAX = 50;
const TOOLS_MIN = 5;
const TOOLS_MAX = 500;
const TOOLS_STEP = 5;

const META: Record<PlanId, { icon: typeof Sparkles; features: string[]; cta: string }> = {
  free: {
    icon: UserCheck,
    cta: "Kostenlos starten",
    features: [`Bis ${FREE_ABO_LIMIT} Abos im Tracker`, "Übersichts-Dashboard", "Kontoauszug-Import", "Manuelles Anlegen", "Fristen-Wächter (Basis)", "Benchmark als Teaser"],
  },
  pro: {
    icon: Sparkles,
    cta: "Pro starten",
    features: ["Unbegrenzte Erfassungswege", "Beleg-Postfach", "AI-Credit-Tracker", "Voller Benchmark", "Sparvorschläge und Deals", "Rechnungs- und Vertragsarchiv", "Steuer-Export"],
  },
  agentur: {
    icon: Building2,
    cta: "Agentur starten",
    features: ["Alles aus Pro", "Kosten pro Kunde", "Weiterverrechnungs-Reports", "Team & Rollen", "Seats-Verwaltung", "Freigabe-Workflow", "Mehrere Gesellschaften"],
  },
  unternehmen: {
    icon: Landmark,
    cta: "Unternehmen starten",
    features: ["Alles aus Agentur", "Unbegrenzte Tools", "SSO und Sicherheits-Review", "Priorisierter Support", "Persönliches Onboarding", "Individuelle Auswertungen"],
  },
};

function inklText(id: PlanId): string {
  const p = PLANS[id];
  const tools = p.inklTools === null ? "unbegrenzte Tools" : `${p.inklTools} Tools`;
  const nutzer = `${p.inklNutzer} ${p.inklNutzer === 1 ? "Nutzer" : "Nutzer"}`;
  return `inkl. ${nutzer}, ${tools}`;
}

function aufpreisText(id: PlanId, cadence: Abrechnung): string | null {
  const p = PLANS[id];
  if (!p.konfigurierbar) return null;
  const seat = cadence === "jahr" ? p.proNutzer.jahr : p.proNutzer.monat;
  const block = cadence === "jahr" ? p.proToolBlock.jahr : p.proToolBlock.monat;
  const teile: string[] = [];
  if (seat > 0) teile.push(`${fmtEUR(seat)} je weiterem Nutzer`);
  if (p.toolBlock > 0 && block > 0) teile.push(`${fmtEUR(block)} je ${p.toolBlock} weiteren Tools`);
  return teile.length ? teile.join(" · ") : null;
}

/* ---------------- Konfigurator (zwei Slider) ---------------- */

function Konfigurator({
  nutzer, setNutzer, tools, setTools, cadence, setCadence,
}: {
  nutzer: number; setNutzer: (n: number) => void;
  tools: number; setTools: (n: number) => void;
  cadence: Abrechnung; setCadence: (c: Abrechnung) => void;
}) {
  return (
    <div className="mx-auto mt-8 max-w-2xl rounded-3xl border border-border bg-card p-6 shadow-soft sm:p-8">
      <div className="flex flex-col gap-6">
        <div>
          <div className="flex items-center justify-between text-sm">
            <span className="inline-flex items-center gap-2 font-medium"><Users className="size-4 text-primary" /> Nutzer im Team</span>
            <span className="font-display text-lg font-semibold tabular-nums">{nutzer >= NUTZER_MAX ? `${NUTZER_MAX}+` : nutzer}</span>
          </div>
          <Slider className="mt-3" value={[nutzer]} min={NUTZER_MIN} max={NUTZER_MAX} step={1} onValueChange={(v) => setNutzer(v[0])} aria-label="Anzahl Nutzer" />
        </div>

        <div>
          <div className="flex items-center justify-between text-sm">
            <span className="inline-flex items-center gap-2 font-medium"><Wrench className="size-4 text-primary" /> Tools / Abos</span>
            <span className="font-display text-lg font-semibold tabular-nums">{tools >= TOOLS_MAX ? `${TOOLS_MAX}+` : tools}</span>
          </div>
          <Slider className="mt-3" value={[tools]} min={TOOLS_MIN} max={TOOLS_MAX} step={TOOLS_STEP} onValueChange={(v) => setTools(v[0])} aria-label="Anzahl Tools" />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5">
          <div className="inline-flex rounded-full border border-border bg-background p-1">
            {(["monat", "jahr"] as const).map((c) => (
              <button key={c} onClick={() => setCadence(c)} className={cn("relative z-10 rounded-full px-4 py-1.5 text-sm font-semibold transition-colors", cadence === c ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>
                {c === "monat" ? "Monatlich" : "Jährlich"}
              </button>
            ))}
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-3 py-1 text-xs font-semibold text-success">
            <Sparkles className="size-3" /> Spare {Math.round(YEARLY_DISCOUNT * 100)} % im Jahr
          </span>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Tarifkarten ---------------- */

function PlanCards({ nutzer, tools, cadence }: { nutzer: number; tools: number; cadence: Abrechnung }) {
  const empfohlen = empfohleneStufe(nutzer, tools);

  return (
    <div className="grid items-stretch gap-5 lg:grid-cols-4 md:grid-cols-2">
      {PLAN_ORDER.map((id, i) => {
        const p = PLANS[id];
        const meta = META[id];
        const Icon = meta.icon;
        const betrag = planPreisProMonat(id, cadence, nutzer, tools);
        const featured = id === empfohlen;
        const aufpreis = aufpreisText(id, cadence);

        return (
          <Reveal key={id} delay={i * 70}>
            <div className={cn("card-lift relative flex h-full flex-col rounded-3xl border p-6", featured ? "border-primary bg-card shadow-lift ring-1 ring-primary/30 lg:-translate-y-2" : "border-border bg-card")}>
              {featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground shadow-soft">Empfohlen</div>
              )}
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary"><Icon className="size-5" /></span>
                <div>
                  <div className="font-display text-lg font-semibold">{p.name}</div>
                  <div className="text-xs text-muted-foreground">{p.zielgruppe}</div>
                </div>
              </div>

              <div className="mt-5">
                {betrag === 0 ? (
                  <div className="flex items-baseline gap-2">
                    <span className="font-display text-4xl font-semibold tabular-nums">0 €</span>
                    <span className="text-sm text-muted-foreground">für immer</span>
                  </div>
                ) : (
                  <>
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-display text-4xl font-semibold tabular-nums">{fmtEUR(betrag).replace(/\s?€/, " €")}</span>
                      <span className="text-sm text-muted-foreground">/ Monat</span>
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {cadence === "jahr" ? `jährlich abgerechnet (${fmtEUR(Math.round(betrag * 12 * 100) / 100)})` : "monatlich abgerechnet"}
                    </div>
                  </>
                )}
                <div className="mt-2 text-xs font-medium text-foreground/70">{inklText(id)}</div>
                {aufpreis && <div className="mt-0.5 text-[11px] text-muted-foreground">{aufpreis}</div>}
              </div>

              <ul className="mt-5 space-y-2 text-sm">
                {meta.features.map((f) => (
                  <li key={f} className="flex items-start gap-2"><Check className="mt-0.5 size-4 shrink-0 text-success" /><span>{f}</span></li>
                ))}
              </ul>

              <Link href="/registrieren" className={cn("mt-6 inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition-all", featured ? "bg-primary text-primary-foreground shadow-soft hover:bg-primary/90 hover:shadow-lift" : "border border-border bg-card hover:bg-accent")}>
                {meta.cta} <ArrowRight className="size-4" />
              </Link>
            </div>
          </Reveal>
        );
      })}
    </div>
  );
}

function Hero({
  nutzer, setNutzer, tools, setTools, cadence, setCadence,
}: {
  nutzer: number; setNutzer: (n: number) => void;
  tools: number; setTools: (n: number) => void;
  cadence: Abrechnung; setCadence: (c: Abrechnung) => void;
}) {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute -left-20 -top-32 size-[480px] rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -right-20 top-40 size-[420px] rounded-full bg-coral/15 blur-3xl" />
      </div>
      <div className="mx-auto max-w-7xl px-4 pb-8 pt-14 text-center sm:px-6 sm:pt-20">
        <Reveal>
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground">
            <span className="size-1.5 rounded-full bg-coral" /> Preise
          </div>
          <h1 className="mt-5 font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
            Preise, die mit dir <span className="text-primary">mitwachsen.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
            Stell dein Team und deine Tool-Zahl ein, du siehst sofort den passenden Plan und den fairen Preis.
            Vom Solo-Tarif bis zum Unternehmen.
          </p>
          <Konfigurator nutzer={nutzer} setNutzer={setNutzer} tools={tools} setTools={setTools} cadence={cadence} setCadence={setCadence} />
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

const VERGLEICH: { gruppe: string; zeilen: { label: string; werte: [Cell, Cell, Cell, Cell] }[] }[] = [
  { gruppe: "Erfassung", zeilen: [
    { label: "Tools inklusive", werte: [`bis ${FREE_ABO_LIMIT}`, `${PLANS.pro.inklTools}+`, `${PLANS.agentur.inklTools}+`, "unbegrenzt"] },
    { label: "Manuelles Anlegen", werte: [true, true, true, true] },
    { label: "Kontoauszug-Import", werte: [true, true, true, true] },
    { label: "Beleg-Postfach", werte: [false, true, true, true] },
    { label: "Mailbox- und Workspace-Discovery", werte: [false, true, true, true] },
  ]},
  { gruppe: "Überblick & Wächter", zeilen: [
    { label: "Dashboard und Übersicht", werte: [true, true, true, true] },
    { label: "Fristen-Wächter", werte: ["Basis", "Voll", "Voll", "Voll"] },
    { label: "Budget & Forecast", werte: [false, true, true, true] },
    { label: "Benachrichtigungen", werte: ["Basis", "Voll", "Voll", "Voll"] },
  ]},
  { gruppe: "Intelligenz", zeilen: [
    { label: "Benchmark", werte: ["Teaser", "Voll", "Voll", "Voll"] },
    { label: "Sparvorschläge", werte: [false, true, true, true] },
    { label: "Deals und Gutscheine", werte: [false, true, true, true] },
    { label: "AI-Credit-Tracker", werte: [false, true, true, true] },
  ]},
  { gruppe: "Dokumente & Steuer", zeilen: [
    { label: "Rechnungsarchiv", werte: [false, true, true, true] },
    { label: "Vertragsarchiv", werte: [false, true, true, true] },
    { label: "Steuer-Export (DATEV/CSV)", werte: [false, true, true, true] },
  ]},
  { gruppe: "Agentur & Team", zeilen: [
    { label: "Kosten pro Kunde", werte: [false, false, true, true] },
    { label: "Weiterverrechnungs-Reports", werte: [false, false, true, true] },
    { label: "Team & Rollen", werte: [false, false, true, true] },
    { label: "Seats-Verwaltung", werte: [false, false, true, true] },
    { label: "Freigabe-Workflow", werte: [false, false, true, true] },
    { label: "Mehrere Gesellschaften", werte: [false, false, true, true] },
  ]},
  { gruppe: "Unternehmen", zeilen: [
    { label: "SSO und Sicherheits-Review", werte: [false, false, false, true] },
    { label: "Priorisierter Support", werte: [false, false, false, true] },
    { label: "Persönliches Onboarding", werte: [false, false, false, true] },
  ]},
];

function CellRender({ value }: { value: Cell }) {
  if (value === true) return <Check className="mx-auto size-4 text-success" />;
  if (value === false) return <Minus className="mx-auto size-4 text-muted-foreground/50" />;
  return <span className="text-sm font-medium tabular-nums">{value}</span>;
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
              Schwelle zwischen Pro und Agentur. Unternehmen ergänzt SSO, Support und Onboarding.
            </p>
          </div>
        </Reveal>
        <Reveal>
          <div className="mt-10 overflow-hidden rounded-3xl border border-border bg-card">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-sm">
                <thead className="sticky top-0 z-10 bg-secondary/80 backdrop-blur">
                  <tr>
                    <th className="px-5 py-4 text-left font-semibold">Funktion</th>
                    {(["Free", "Pro", "Agentur", "Unternehmen"] as const).map((n, i) => (
                      <th key={n} className={cn("px-5 py-4 text-center font-semibold", i === 1 && "text-primary")}>{n}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {VERGLEICH.map((grp) => (
                    <Fragment key={grp.gruppe}>
                      <tr className="bg-secondary/40">
                        <td colSpan={5} className="px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{grp.gruppe}</td>
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
  { q: "Wie wird der Preis berechnet?", a: "Jeder Plan hat einen Basispreis mit inklusiven Nutzern und Tools. Brauchst du mehr, kommt ein fairer Aufpreis je weiterem Nutzer und je zusätzlichem Tool-Block dazu. Den genauen Betrag siehst du oben sofort über die Slider." },
  { q: "Ist Free wirklich dauerhaft kostenlos?", a: `Ja. Free bleibt für immer 0 €, mit bis zu ${FREE_ABO_LIMIT} Tools und den wichtigsten Funktionen zum Überblick. Keine versteckten Kosten.` },
  { q: "Was passiert nach dem 14-Tage-Test?", a: "Nach 14 Tagen wählst du deinen Plan. Wenn du nichts auswählst, läuft dein Konto automatisch im Free-Plan weiter. Wir buchen niemals ohne deine Zustimmung ab." },
  { q: "Kann ich Nutzer und Tools später ändern?", a: "Ja. Du kannst dein Team und deine Tool-Zahl jederzeit anpassen, die Abrechnung passt sich zum nächsten Zeitraum an." },
  { q: "Was unterscheidet Agentur von Unternehmen?", a: "Agentur bringt den vollen Team- und Weiterverrechnungs-Layer. Unternehmen ergänzt unbegrenzte Tools, SSO, Sicherheits-Review, priorisierten Support und persönliches Onboarding." },
  { q: "Gibt es einen Jahresrabatt?", a: `Ja, bei jährlicher Abrechnung sparst du rund ${Math.round(YEARLY_DISCOUNT * 100)} %. Den Rabatt siehst du oben im Konfigurator.` },
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
  const [cadence, setCadence] = useState<Abrechnung>("jahr");
  const [nutzer, setNutzer] = useState(3);
  const [tools, setTools] = useState(40);
  return (
    <>
      <Hero nutzer={nutzer} setNutzer={setNutzer} tools={tools} setTools={setTools} cadence={cadence} setCadence={setCadence} />
      <section className="pb-6 pt-2">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <PlanCards nutzer={nutzer} tools={tools} cadence={cadence} />
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
