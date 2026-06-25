"use client";

import { useState, type ComponentType } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ChevronRight,
  Check,
  Minus as MinusIcon,
  Plus,
  Minus,
  FileSpreadsheet,
  Building2,
  Scale,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Reveal,
  ScreenshotFrame,
  PreviewDashboard,
  PreviewImport,
  PreviewFristen,
  PreviewBenchmark,
  PreviewSparvorschlaege,
  PreviewKunde,
} from "@/components/marketing/marketing-home";

export type ComparisonSlug = "excel" | "sastrify" | "cledara" | "spendesk" | "pleo" | "zluri" | "torii";

type Row = { feature: string; toolfolio: string | boolean; alt: string | boolean };
type Group = { label: string; rows: Row[] };
type Diff = { title: string; body: string; slot: string; Preview: ComponentType };
type Faq = { q: string; a: string };

export type ComparisonData = {
  slug: ComparisonSlug;
  alt: string;
  altKind: "excel" | "enterprise";
  icon: ComponentType<{ className?: string }>;
  h1: string;
  subline: string;
  altStatusNote?: string;
  verdict: string;
  painLead: string;
  painBullets: { title: string; body: string }[];
  groups: Group[];
  altDataAsOf: string;
  diffs: Diff[];
  altStrengths: string[];
  switchSteps: { title: string; body: string }[];
  faqs: Faq[];
};

function FaqItem({ q, a }: Faq) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-3xl border border-[#1F1D2B]/10 bg-white p-5 shadow-[0_8px_28px_-18px_rgba(31,29,43,0.25)]">
      <button type="button" onClick={() => setOpen((v) => !v)} className="flex w-full items-center justify-between gap-4 text-left">
        <span className="font-display text-lg font-semibold text-[#1F1D2B]">{q}</span>
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#FBF7F1] text-[#6C5CE7]">
          {open ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        </span>
      </button>
      {open && <p className="mt-3 text-[15px] leading-relaxed text-[#1F1D2B]/75">{a}</p>}
    </div>
  );
}

function Cell({ v }: { v: string | boolean }) {
  if (v === true) return <span className="inline-flex items-center gap-1.5 text-[#12B76A]"><Check className="h-4 w-4" /> Ja</span>;
  if (v === false) return <span className="inline-flex items-center gap-1.5 text-[#1F1D2B]/40"><MinusIcon className="h-4 w-4" /> Nein</span>;
  return <span className="tabular-nums text-[#1F1D2B]/85">{v}</span>;
}

function PlaceholderHint({ children }: { children: React.ReactNode }) {
  return (
    <div className="absolute left-3 top-3 z-10 rounded-full bg-[#1F1D2B]/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white/90">
      {children}
    </div>
  );
}

function ChaosTablePreview() {
  return (
    <div className="h-full w-full bg-white p-5 text-[11px] text-[#1F1D2B]" style={{ fontVariantNumeric: "tabular-nums" }}>
      <div className="mb-2 font-semibold text-[#1F1D2B]/60">tools_2024_final_v3_NEU.xlsx</div>
      <div className="grid grid-cols-[1fr_70px_90px_70px] gap-px bg-[#1F1D2B]/15 text-[10px]">
        {["Tool", "Kosten", "Frist", "Notiz"].map((h) => (<div key={h} className="bg-[#F0EBE3] px-2 py-1 font-semibold">{h}</div>))}
        {[
          ["Figma", "15 €", "???", "verlängert?"],
          ["Notion", "8 €", "leer", ""],
          ["Slack", "?", "?", "Pia fragen"],
          ["Adobe", "59,99", "Mai", "kündigen!!"],
          ["Loom", "12", "leer", ""],
          ["???", "29", "?", "wer hat das?"],
          ["Calendly", "10$", "?", "USD?"],
          ["", "", "", ""],
        ].flatMap((row, i) => row.map((cell, j) => (
          <div key={`${i}-${j}`} className={cn("bg-white px-2 py-1", cell.includes("?") && "text-[#F5A623]", cell.includes("!") && "font-semibold text-[#FF7A66]")}>{cell}</div>
        )))}
      </div>
      <div className="mt-3 text-[10px] text-[#1F1D2B]/50">Zuletzt aktualisiert von Pia · vor 4 Monaten</div>
    </div>
  );
}

export function ComparisonBySlug({ slug }: { slug: ComparisonSlug }) {
  const data = comparisonData[slug];
  if (!data) return null;
  return <ComparisonPage data={data} />;
}

export function ComparisonPage({ data }: { data: ComparisonData }) {
  const Icon = data.icon;
  return (
    <div className="bg-[#FBF7F1] text-[#1F1D2B]">
      {/* Breadcrumb */}
      <div className="mx-auto max-w-7xl px-6 pt-12">
        <nav className="flex items-center gap-2 text-sm text-[#1F1D2B]/60">
          <Link href="/" className="hover:text-[#6C5CE7]">Start</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span>Vergleich</span>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-[#1F1D2B]">Toolfolio vs. {data.alt}</span>
        </nav>
      </div>

      {/* Hero */}
      <header className="mx-auto max-w-7xl px-6 pb-12 pt-8">
        <Reveal>
          <div className="inline-flex items-center gap-2 rounded-full border border-[#1F1D2B]/10 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#1F1D2B]/70">
            <Scale className="h-3.5 w-3.5 text-[#6C5CE7]" /> Vergleich
          </div>
          <h1 className="mt-5 max-w-4xl font-display text-5xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">{data.h1}</h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-[#1F1D2B]/75">{data.subline}</p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/registrieren" className="inline-flex items-center gap-2 rounded-full bg-[#6C5CE7] px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_-12px_rgba(108,92,231,0.6)] transition hover:-translate-y-0.5">
              Kostenlos starten <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/produkt" className="inline-flex items-center gap-2 rounded-full border border-[#1F1D2B]/15 bg-white px-6 py-3 text-sm font-semibold text-[#1F1D2B] transition hover:border-[#1F1D2B]/30">
              Alle Funktionen
            </Link>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <div className="mt-12 grid gap-5 lg:grid-cols-2">
            <div className="relative">
              <div className="absolute left-3 top-3 z-10 rounded-full bg-[#F5A623]/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">Vorher · {data.alt}</div>
              <div className="overflow-hidden rounded-[1.5rem] border border-[#1F1D2B]/10 bg-white shadow-[0_20px_60px_-30px_rgba(31,29,43,0.3)]">
                <div className="flex items-center gap-1.5 border-b border-[#1F1D2B]/10 bg-[#F5F2EA] px-4 py-2.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#FF7A66]/70" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#F5A623]/70" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#12B76A]/70" />
                </div>
                <div className="aspect-[16/10]">
                  {data.altKind === "excel" ? (
                    <ChaosTablePreview />
                  ) : (
                    <div className="grid h-full place-items-center bg-[#F5F2EA] p-8 text-center">
                      <div>
                        <Icon className="mx-auto h-12 w-12 text-[#1F1D2B]/30" />
                        <div className="mt-4 font-display text-lg font-semibold text-[#1F1D2B]/60">{data.alt}</div>
                        <div className="mt-1 text-xs text-[#1F1D2B]/45">Aus Fairness zeigen wir keinen Screenshot des Wettbewerbers.</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute left-3 top-3 z-10 rounded-full bg-[#12B76A]/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">Mit Toolfolio</div>
              <ScreenshotFrame label="Dashboard"><PreviewDashboard /></ScreenshotFrame>
            </div>
          </div>
        </Reveal>
      </header>

      {/* Verdict */}
      <section className="mx-auto max-w-5xl px-6 py-12">
        <Reveal>
          <div className="rounded-[2rem] border border-[#6C5CE7]/20 bg-gradient-to-br from-white to-[#6C5CE7]/5 p-8 shadow-[0_12px_40px_-20px_rgba(108,92,231,0.3)]">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#6C5CE7]"><Info className="h-3.5 w-3.5" /> Kurz gesagt</div>
            <p className="mt-3 text-xl leading-relaxed text-[#1F1D2B]/90 sm:text-2xl">{data.verdict}</p>
          </div>
        </Reveal>
      </section>

      {/* Schmerz */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#FF7A66]">Der Schmerz mit {data.alt}</p>
          <h2 className="mt-3 max-w-3xl font-display text-4xl font-bold leading-tight sm:text-5xl">Was im Alltag wirklich nervt.</h2>
          <p className="mt-4 max-w-3xl text-lg leading-relaxed text-[#1F1D2B]/75">{data.painLead}</p>
        </Reveal>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {data.painBullets.map((p, i) => (
            <Reveal key={p.title} delay={i * 80}>
              <div className="h-full rounded-3xl border border-[#1F1D2B]/10 bg-white p-6">
                <div className="font-display text-lg font-semibold">{p.title}</div>
                <p className="mt-2 text-sm leading-relaxed text-[#1F1D2B]/70">{p.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Vergleichstabelle */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-6">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#6C5CE7]">Funktion für Funktion</p>
            <h2 className="mt-3 max-w-3xl font-display text-4xl font-bold leading-tight sm:text-5xl">Sachlicher Vergleich.</h2>
            <p className="mt-3 text-sm text-[#1F1D2B]/55">Stand der Daten zu {data.alt}: {data.altDataAsOf}. Wo etwas unklar war, haben wir das Feld neutral gelassen.</p>
          </Reveal>
          <Reveal>
            <div className="mt-10 overflow-x-auto">
              <table className="w-full min-w-[640px] border-separate border-spacing-0 text-left text-sm">
                <thead className="sticky top-0 z-10 bg-white">
                  <tr>
                    <th className="border-b border-[#1F1D2B]/10 px-4 py-4 font-semibold text-[#1F1D2B]/60">Funktion</th>
                    <th className="border-b border-[#1F1D2B]/10 bg-[#12B76A]/8 px-4 py-4 font-display font-bold text-[#12B76A]">Toolfolio</th>
                    <th className="border-b border-[#1F1D2B]/10 px-4 py-4 font-display font-bold text-[#1F1D2B]/70">{data.alt}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.groups.flatMap((g) => [
                    <tr key={`group-${g.label}`}>
                      <td colSpan={3} className="bg-[#FBF7F1] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#1F1D2B]/60">{g.label}</td>
                    </tr>,
                    ...g.rows.map((r) => (
                      <tr key={`row-${g.label}-${r.feature}`}>
                        <td className="border-b border-[#1F1D2B]/8 px-4 py-3 font-medium">{r.feature}</td>
                        <td className="border-b border-[#1F1D2B]/8 bg-[#12B76A]/5 px-4 py-3"><Cell v={r.toolfolio} /></td>
                        <td className="border-b border-[#1F1D2B]/8 px-4 py-3 text-[#1F1D2B]/70"><Cell v={r.alt} /></td>
                      </tr>
                    )),
                  ])}
                </tbody>
              </table>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Diffs */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#6C5CE7]">Die wichtigsten Unterschiede</p>
          <h2 className="mt-3 max-w-3xl font-display text-4xl font-bold leading-tight sm:text-5xl">Was Toolfolio konkret anders macht.</h2>
        </Reveal>
        <div className="mt-16 space-y-24">
          {data.diffs.map((d, i) => {
            const reverse = i % 2 === 1;
            return (
              <div key={d.title} className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
                <Reveal className={reverse ? "lg:order-2" : ""}>
                  <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#6C5CE7]">Unterschied {String(i + 1).padStart(2, "0")}</div>
                  <h3 className="mt-4 font-display text-3xl font-bold leading-tight sm:text-4xl">{d.title}</h3>
                  <p className="mt-4 text-[17px] leading-relaxed text-[#1F1D2B]/75">{d.body}</p>
                </Reveal>
                <Reveal className={reverse ? "lg:order-1" : ""} delay={100}>
                  <div className="relative">
                    <PlaceholderHint>Toolfolio · {d.slot}</PlaceholderHint>
                    <ScreenshotFrame label={d.slot}><d.Preview /></ScreenshotFrame>
                  </div>
                </Reveal>
              </div>
            );
          })}
        </div>
      </section>

      {/* Fair */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-5xl px-6">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#F5A623]">Fair gesagt</p>
            <h2 className="mt-3 font-display text-4xl font-bold leading-tight sm:text-5xl">Wofür {data.alt} besser ist.</h2>
            <p className="mt-3 text-[15px] text-[#1F1D2B]/65">Wir bauen Toolfolio für kleine Agenturen, Freelancer und Solopreneure im DACH-Raum. Wenn dein Fall anders liegt, sind wir die ehrlichen Ersten, die das sagen.</p>
          </Reveal>
          <ul className="mt-8 space-y-3">
            {data.altStrengths.map((s, i) => (
              <Reveal key={s} delay={i * 60}>
                <li className="flex items-start gap-3 rounded-2xl border border-[#1F1D2B]/10 bg-[#FBF7F1] p-4">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#F5A623]" />
                  <span className="text-[15px] text-[#1F1D2B]/85">{s}</span>
                </li>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* Wechseln */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#12B76A]">Wechseln ist einfach</p>
          <h2 className="mt-3 max-w-3xl font-display text-4xl font-bold leading-tight sm:text-5xl">In wenigen Minuten drin.</h2>
        </Reveal>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {data.switchSteps.map((s, i) => (
            <Reveal key={s.title} delay={i * 80}>
              <div className="h-full rounded-3xl border border-[#1F1D2B]/10 bg-white p-6">
                <div className="grid h-9 w-9 place-items-center rounded-full bg-[#6C5CE7] font-display text-sm font-bold text-white">{i + 1}</div>
                <div className="mt-4 font-display text-lg font-semibold">{s.title}</div>
                <p className="mt-2 text-sm leading-relaxed text-[#1F1D2B]/70">{s.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-4xl px-6 py-24">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#6C5CE7]">Häufige Fragen</p>
          <h2 className="mt-3 font-display text-4xl font-bold leading-tight sm:text-5xl">Zum Vergleich mit {data.alt}.</h2>
        </Reveal>
        <div className="mt-10 space-y-3">
          {data.faqs.map((f) => (<FaqItem key={f.q} {...f} />))}
        </div>
      </section>

      {/* Weitere Vergleiche */}
      <section className="mx-auto max-w-7xl px-6 pb-24">
        <Reveal><h2 className="font-display text-3xl font-bold">Weitere Vergleiche</h2></Reveal>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Object.values(comparisonData).filter((c) => c.slug !== data.slug).map((c) => (
            <Link key={c.slug} href={`/vergleich/${c.slug}`} className="group rounded-3xl border border-[#1F1D2B]/10 bg-white p-5 transition hover:-translate-y-1 hover:border-[#6C5CE7]/40">
              <div className="flex items-center justify-between">
                <div className="font-display text-lg font-bold">Toolfolio vs. {c.alt}</div>
                <ArrowRight className="h-4 w-4 text-[#6C5CE7] transition group-hover:translate-x-1" />
              </div>
              {c.altStatusNote && (<div className="mt-1 text-xs text-[#1F1D2B]/55">{c.altStatusNote}</div>)}
            </Link>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-7xl px-6 pb-24">
        <Reveal>
          <div className="rounded-[2rem] bg-[#1F1D2B] p-12 text-center text-white">
            <h2 className="font-display text-4xl font-bold leading-tight sm:text-5xl">Probier Toolfolio kostenlos aus.</h2>
            <p className="mx-auto mt-4 max-w-xl text-white/75">14 Tage voller Zugang. Keine Kreditkarte. Wenn es nicht passt, bleibst du einfach bei {data.alt}.</p>
            <Link href="/registrieren" className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#6C5CE7] px-7 py-3.5 text-sm font-semibold text-white shadow-[0_15px_40px_-15px_rgba(108,92,231,0.8)] transition hover:-translate-y-0.5">
              Kostenlos starten <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Reveal>
      </section>
    </div>
  );
}

/* ---------- Instances ---------- */

export const comparisonData: Record<ComparisonSlug, ComparisonData> = {
  excel: {
    slug: "excel",
    alt: "Excel",
    altKind: "excel",
    icon: FileSpreadsheet,
    h1: "Toolfolio vs. Excel. Wann sich der Umstieg lohnt.",
    subline: "Für alle, die ihre Software-Abos heute in einer Tabelle pflegen und merken, dass die Tabelle veraltet ist, niemand sie aktualisiert und Fristen still durchrutschen.",
    verdict: "Excel ist kostenlos und maximal flexibel. Aber es warnt dich nicht vor Fristen, erkennt keine Spar-Chancen und niemand pflegt es zuverlässig. Toolfolio nimmt dir genau das ab und ist trotzdem schlank und bezahlbar.",
    painLead: "Die Abo-Tabelle ist ein Klassiker: einmal angelegt, dann vergessen. Niemand aktualisiert sie, Fristen stehen nirgends, Erinnerungen gibt es keine, Sparpotenzial bleibt unentdeckt, und nach drei Monaten weißt du nicht mehr, welcher Stand stimmt.",
    painBullets: [
      { title: "Niemand pflegt es", body: "Heute aktuell, in drei Monaten Schrott. Niemand fühlt sich verantwortlich." },
      { title: "Keine Fristen-Warnung", body: "Excel schickt dir keine Mail, bevor die Jahres-Lizenz still verlängert." },
      { title: "Kein Benchmark", body: "Du weißt nicht, ob du zu viel zahlst. Ein anonymer Markt-Vergleich fehlt." },
      { title: "Belege verstreut", body: "Rechnungen liegen in zehn Inboxen, nicht am Abo dran." },
    ],
    altDataAsOf: "November 2025",
    groups: [
      { label: "Überblick", rows: [{ feature: "Alle Abos zentral", toolfolio: true, alt: "Manuell pflegen" }, { feature: "Monats- und Jahressicht", toolfolio: true, alt: "Selbst bauen" }, { feature: "Auto-Kategorien", toolfolio: true, alt: false }] },
      { label: "Erfassung", rows: [{ feature: "Mail-Forward Import", toolfolio: true, alt: false }, { feature: "Kontoauszug Import", toolfolio: "CSV", alt: "Copy-Paste" }, { feature: "Auto-Erkennung Anbieter", toolfolio: true, alt: false }] },
      { label: "Kündigungsfristen", rows: [{ feature: "Fristen-Wächter", toolfolio: true, alt: false }, { feature: "Mehrstufige Warnungen", toolfolio: "30/14/3 Tage", alt: false }, { feature: "Kalender-Sync", toolfolio: true, alt: false }] },
      { label: "Kosten optimieren", rows: [{ feature: "Benchmark gegen Markt", toolfolio: true, alt: false }, { feature: "Konkrete Sparvorschläge", toolfolio: true, alt: false }, { feature: "AI-Credits Multi-Provider", toolfolio: true, alt: false }] },
      { label: "Agentur-Funktionen", rows: [{ feature: "Kosten pro Kunde", toolfolio: true, alt: "Manuell" }, { feature: "Weiterverrechnungs-Report", toolfolio: true, alt: false }, { feature: "Marge pro Kunde", toolfolio: true, alt: false }] },
      { label: "Steuer & Belege", rows: [{ feature: "DATEV-Export", toolfolio: true, alt: false }, { feature: "Reverse-Charge automatisch", toolfolio: true, alt: "Selbst pflegen" }, { feature: "Belege am Abo", toolfolio: true, alt: false }] },
      { label: "Preis und Einrichtung", rows: [{ feature: "Preis", toolfolio: "Free, ab 19 €/Monat", alt: "Kostenlos" }, { feature: "Einrichtung", toolfolio: "5 Minuten", alt: "Stunden" }, { feature: "Sprache", toolfolio: "Deutsch, DACH-spezifisch", alt: "Sprachunabhängig" }] },
    ],
    diffs: [
      { title: "Automatische Erfassung statt Handarbeit.", body: "Du leitest Rechnungs-Mails an deine Toolfolio-Adresse weiter. Anbieter, Betrag, Verlängerung werden erkannt, die Tabelle pflegt sich von selbst.", slot: "Import-Flow", Preview: PreviewImport },
      { title: "Fristen-Wächter statt vergessener Daten.", body: "Toolfolio warnt rechtzeitig vor jeder Verlängerung, mehrstufig, im Kalender und per Mail. In Excel passiert das nicht.", slot: "Fristen-Übersicht", Preview: PreviewFristen },
      { title: "Benchmark statt Bauchgefühl.", body: "Wir vergleichen deine Tools anonym mit dem Markt. Wenn du für die Leistung zu viel zahlst, weißt du es, statt es zu vermuten.", slot: "Benchmark", Preview: PreviewBenchmark },
      { title: "Sparvorschläge statt Stillstand.", body: "Konkrete Alternativen mit konkreter Sparsumme. Excel kann das nicht, weil es deinen Markt nicht kennt.", slot: "Sparvorschläge", Preview: PreviewSparvorschlaege },
    ],
    altStrengths: ["Komplett kostenlos und überall verfügbar.", "Maximal flexibel, du baust dir alles so, wie du willst.", "Jeder im Team kennt es, keine Lernkurve.", "Funktioniert offline und ohne Account."],
    switchSteps: [
      { title: "Tabelle exportieren", body: "Speichere deine bestehende Liste als CSV oder Excel-Datei." },
      { title: "In Toolfolio importieren", body: "Per Drag-and-drop, Toolfolio mappt die Spalten automatisch." },
      { title: "Mail-Forward aktivieren", body: "Ab jetzt landet jede neue Rechnung automatisch am richtigen Abo." },
    ],
    faqs: [
      { q: "Ist Toolfolio nicht teurer als meine Excel-Tabelle?", a: "Excel ist gratis, Toolfolio startet im Free-Plan bei 0 €. Pro kostet 19 € im Monat und spart laut Mediandaten 89 bis 127 € pro Monat ein, allein durch erkannte vergessene Abos und Sparvorschläge." },
      { q: "Kann ich meine bestehende Tabelle importieren?", a: "Ja. CSV oder Excel hochladen, Spalten automatisch mappen, fertig. Die History bleibt erhalten." },
      { q: "Lohnt sich der Umstieg für ein kleines Team?", a: "Gerade dann. In kleinen Teams pflegt die Tabelle niemand. Toolfolio pflegt sich von selbst, das ist der Hebel." },
      { q: "Was, wenn ich später doch zurück will?", a: "Du exportierst alle Daten jederzeit als CSV. Kein Lock-in." },
      { q: "Brauche ich technisches Wissen?", a: "Nein. Wenn du Excel öffnen kannst, kannst du Toolfolio bedienen." },
    ],
  },

  sastrify: {
    slug: "sastrify",
    alt: "Sastrify / Deel IT",
    altKind: "enterprise",
    altStatusNote: "Stand: Sastrify ist seit Mai 2026 Teil von Deel IT.",
    icon: Building2,
    h1: "Toolfolio als Alternative zu Sastrify (Deel IT).",
    subline: "Für kleine Agenturen, Freelancer und Solopreneure im DACH-Raum, denen Enterprise-SaaS-Management zu groß, zu teuer und zu komplex ist.",
    verdict: "Sastrify (heute Teil von Deel IT) ist ein starkes Enterprise-Tool für Organisationen mit eigenem Procurement-Team. Für ein kleines Team ist das Overkill. Toolfolio ist die schlanke, bezahlbare DACH-Alternative, die du in fünf Minuten startest.",
    painLead: "Enterprise-SaaS-Management ist für hundert plus Mitarbeitende gebaut. Lange Einrichtung, hohe Mindestpreise, viele Funktionen, die du nie brauchst. Für ein Studio mit fünf Leuten passt das nicht.",
    painBullets: [
      { title: "Zu teuer für kleine Teams", body: "Enterprise-Pricing startet im hohen vierstelligen Bereich pro Jahr." },
      { title: "Lange Einrichtung", body: "Procurement-Workflows, SSO-Setup, Integrationen. Wochen statt Minuten." },
      { title: "Funktions-Overkill", body: "Governance-Module, die du als Solopreneur nie öffnest." },
      { title: "Wenig DACH-Fokus", body: "Reverse-Charge, DATEV, deutsche Anbieter, oft Stiefkind." },
    ],
    altDataAsOf: "November 2025, Sastrify als Teil von Deel IT",
    groups: [
      { label: "Zielgruppe", rows: [{ feature: "Kleine Teams (1 bis 20)", toolfolio: true, alt: "Eher 50+" }, { feature: "Freelancer und Solopreneure", toolfolio: true, alt: false }, { feature: "Enterprise mit Procurement", toolfolio: false, alt: true }] },
      { label: "Preis und Einstieg", rows: [{ feature: "Free-Plan", toolfolio: true, alt: "Nicht öffentlich beziffert" }, { feature: "Startpreis", toolfolio: "ab 19 €/Monat", alt: "Auf Anfrage" }, { feature: "Einrichtung", toolfolio: "5 Minuten", alt: "Onboarding-Prozess" }] },
      { label: "DACH-Fokus", rows: [{ feature: "DATEV-Export", toolfolio: true, alt: "" }, { feature: "Reverse-Charge automatisch", toolfolio: true, alt: "" }, { feature: "Deutsche Oberfläche", toolfolio: true, alt: "Englisch primär" }] },
      { label: "Funktionen", rows: [{ feature: "Fristen-Wächter", toolfolio: true, alt: true }, { feature: "Benchmark", toolfolio: true, alt: true }, { feature: "Kosten pro Kunde / Weiterverrechnung", toolfolio: true, alt: "" }, { feature: "SSO-Discovery / IT-Governance", toolfolio: false, alt: true }] },
    ],
    diffs: [
      { title: "Schlank statt Enterprise.", body: "Du kommst aus dem Browser, leitest Mails weiter, fertig. Kein Procurement-Workshop, kein IT-Projekt.", slot: "Dashboard", Preview: PreviewDashboard },
      { title: "Bezahlbar statt vierstellig.", body: "19 € im Monat statt einer Enterprise-Lizenz. Für die meisten kleinen Teams ist das die ehrlichere Wahl.", slot: "Sparvorschläge", Preview: PreviewSparvorschlaege },
      { title: "DACH-spezifisch statt englisch erst.", body: "Reverse-Charge, DATEV, deutsche Anbieter werden korrekt behandelt, nicht nachträglich gepatcht.", slot: "Fristen", Preview: PreviewFristen },
      { title: "Agentur-Layer statt nur Inventar.", body: "Kosten pro Kunde und Weiterverrechnung gibt es nur bei uns, weil wir genau diese Zielgruppe meinen.", slot: "Kunden-Detail", Preview: PreviewKunde },
    ],
    altStrengths: ["Tiefe IT-Governance für große Organisationen.", "SSO-basierte Tool-Discovery in komplexen Umgebungen.", "Procurement-Workflows mit Genehmigungsketten.", "Verhandlungs-Service für Enterprise-Verträge."],
    switchSteps: [
      { title: "Bestehende Tools exportieren", body: "Liste deiner Abos aus Sastrify ziehen oder per Mail-Forward starten." },
      { title: "In Toolfolio importieren", body: "Liste hochladen, Toolfolio mappt automatisch." },
      { title: "Mail-Forward aktivieren", body: "Neue Rechnungen landen ab sofort am richtigen Abo." },
    ],
    faqs: [
      { q: "Stimmt es, dass Sastrify jetzt Deel IT ist?", a: "Ja. Sastrify ist seit Mai 2026 Teil von Deel IT. Das Produkt wird unter Deel IT weitergeführt. Diese Seite zieht den Vergleich gegen Sastrify als Teil von Deel IT." },
      { q: "Kann Toolfolio SSO-Discovery wie Enterprise-Tools?", a: "Nein. SSO-basierte Discovery setzt eine bestehende SSO-Landschaft voraus, die unsere Zielgruppe meist nicht hat. Wir setzen auf Mail-Forward und Kontoauszug." },
      { q: "Ist Toolfolio für hundert plus Mitarbeitende geeignet?", a: "Da sind Enterprise-Tools wie Sastrify (Deel IT), Zluri oder Torii in der Regel die bessere Wahl. Wir bauen für kleine Teams." },
      { q: "Wie aktuell sind die Daten in dieser Tabelle?", a: "Stand November 2025. Wir aktualisieren regelmäßig, melde uns gerne, falls dir etwas auffällt." },
    ],
  },

  cledara: {
    slug: "cledara",
    alt: "Cledara",
    altKind: "enterprise",
    icon: Building2,
    h1: "Toolfolio als Alternative zu Cledara.",
    subline: "Für DACH-Teams, die Software-Verwaltung ohne virtuelle Kreditkarten und ohne Mid-Market-Preise wollen.",
    verdict: "Cledara setzt stark auf virtuelle Kreditkarten und ist auf Mid-Market in UK und USA zugeschnitten. Toolfolio bleibt schlank, ist DACH-spezifisch und braucht keine eigene Karten-Infrastruktur.",
    painLead: "Wenn du keine virtuellen Karten ausgeben willst und deine Anbieter und Belege im DACH-Kontext sauber laufen sollen, ist ein britisch geprägtes Mid-Market-Tool oft unpassend zugeschnitten.",
    painBullets: [
      { title: "Karten-Pflicht oft im Weg", body: "Karten-zentrierte Workflows passen nicht zu allen Buchhaltungs-Setups." },
      { title: "Mid-Market-Preise", body: "Pricing zielt auf größere Teams, nicht auf Solo und Kleinst-Agentur." },
      { title: "DACH eher Nebenrolle", body: "DATEV, Reverse-Charge, deutsche Oberfläche meist nicht im Fokus." },
      { title: "Funktions-Overlap", body: "Viele Features, die kleine Teams nie nutzen." },
    ],
    altDataAsOf: "November 2025",
    groups: [
      { label: "Modell", rows: [{ feature: "Karten-frei nutzbar", toolfolio: true, alt: "" }, { feature: "Auch ohne IT-Setup", toolfolio: true, alt: "" }] },
      { label: "DACH", rows: [{ feature: "DATEV-Export", toolfolio: true, alt: "" }, { feature: "Reverse-Charge", toolfolio: true, alt: "" }, { feature: "Deutsche Oberfläche", toolfolio: true, alt: "Englisch primär" }] },
      { label: "Preis", rows: [{ feature: "Free-Plan", toolfolio: true, alt: "" }, { feature: "Startpreis", toolfolio: "ab 19 €/Monat", alt: "Auf Anfrage" }] },
    ],
    diffs: [
      { title: "Ohne Karten-Pflicht.", body: "Du brauchst keine virtuellen Karten, um Toolfolio zu nutzen. Mail-Forward und Kontoauszug reichen.", slot: "Import", Preview: PreviewImport },
      { title: "DACH first.", body: "DATEV-Export und Reverse-Charge sind Kernfunktion, nicht Add-on.", slot: "Dashboard", Preview: PreviewDashboard },
      { title: "Agentur-Layer.", body: "Kosten pro Kunde mit Marge sind bei uns Standard.", slot: "Kunden-Detail", Preview: PreviewKunde },
    ],
    altStrengths: ["Karten-Workflow integriert, wenn du das willst.", "Englischsprachige Märkte gut abgedeckt.", "Größere Mid-Market-Funktions-Tiefe."],
    switchSteps: [
      { title: "Abo-Liste exportieren", body: "Aus dem bestehenden Tool oder per Mail-Forward starten." },
      { title: "In Toolfolio importieren", body: "Liste hochladen, automatisches Mapping." },
      { title: "Karten optional weiterführen", body: "Du behältst deine bestehende Karten-Lösung, falls du eine hast." },
    ],
    faqs: [
      { q: "Brauche ich virtuelle Karten?", a: "Nein. Toolfolio funktioniert ohne. Du kannst deine bestehende Karten-Lösung weiternutzen." },
      { q: "Wie aktuell sind die Wettbewerberdaten?", a: "Stand November 2025. Wo etwas nicht öffentlich war, haben wir das Feld neutral gelassen." },
    ],
  },

  spendesk: {
    slug: "spendesk",
    alt: "Spendesk",
    altKind: "enterprise",
    icon: Building2,
    h1: "Toolfolio als Alternative zu Spendesk.",
    subline: "Spendesk ist Spend-Management. Toolfolio fokussiert sich auf Software-Abos. Wann welches die bessere Wahl ist.",
    verdict: "Spendesk deckt Spesen, Karten und Rechnungen breit ab. Toolfolio macht eine Sache richtig gut: Software-Abos verwalten. Wenn du genau das brauchst, ohne Karten-Plattform, ist Toolfolio die schlankere Wahl.",
    painLead: "Spend-Management-Plattformen sind mächtig, aber für reine Software-Abo-Verwaltung oft überdimensioniert und in DACH-Buchhaltung nicht immer der schlankste Weg.",
    painBullets: [
      { title: "Breiter Scope", body: "Spesen, Karten, Rechnungen, Abos in einem. Schwer, falls du nur Abos willst." },
      { title: "Höhere Komplexität", body: "Mehr Workflows, mehr Onboarding, mehr Lernkurve." },
      { title: "Karten-zentriert", body: "Funktionen entfalten sich, wenn du Karten nutzt." },
      { title: "Agentur-Layer fehlt", body: "Weiterverrechnung pro Kunde ist kein Kernthema." },
    ],
    altDataAsOf: "November 2025",
    groups: [
      { label: "Scope", rows: [{ feature: "Spezialisierung auf SaaS-Abos", toolfolio: true, alt: "Teil eines breiteren Scopes" }, { feature: "Spesen / Mitarbeiterkarten", toolfolio: false, alt: true }] },
      { label: "Agentur-Funktionen", rows: [{ feature: "Kosten pro Kunde", toolfolio: true, alt: "" }, { feature: "Weiterverrechnungs-Report", toolfolio: true, alt: "" }] },
      { label: "Preis und DACH", rows: [{ feature: "Free-Plan", toolfolio: true, alt: "" }, { feature: "DATEV-Export", toolfolio: true, alt: "Vorhanden, je nach Plan" }] },
    ],
    diffs: [
      { title: "Spezialist statt Allrounder.", body: "Wir machen Software-Abos. Tiefer, einfacher, im DACH-Kontext.", slot: "Dashboard", Preview: PreviewDashboard },
      { title: "Weiterverrechnung pro Kunde.", body: "Mit Marge, fertig für die Rechnung, ohne Karten.", slot: "Kunden-Detail", Preview: PreviewKunde },
      { title: "Schnelles Setup.", body: "Mail-Forward einrichten und loslegen. Kein Karten-Rollout.", slot: "Import", Preview: PreviewImport },
    ],
    altStrengths: ["Spesen, Karten und Rechnungen in einer Plattform.", "Genehmigungs-Workflows für größere Teams.", "Etablierte Buchhaltungs-Integrationen."],
    switchSteps: [
      { title: "SaaS-Abos identifizieren", body: "Aus deinem aktuellen Tool die Liste der Abos exportieren." },
      { title: "In Toolfolio importieren", body: "Datei hochladen, Mapping automatisch." },
      { title: "Spesen-Tool behalten", body: "Du kannst Spendesk weiter für Karten und Spesen nutzen, falls sinnvoll." },
    ],
    faqs: [{ q: "Ersetzt Toolfolio Spendesk komplett?", a: "Nein. Toolfolio macht keine Mitarbeiter-Karten und keine Spesen-Workflows. Wir machen SaaS-Abos." }],
  },

  pleo: {
    slug: "pleo",
    alt: "Pleo",
    altKind: "enterprise",
    icon: Building2,
    h1: "Toolfolio als Alternative zu Pleo.",
    subline: "Pleo ist Karten- und Spesen-Management. Toolfolio macht Software-Abos. Wann sich welches lohnt.",
    verdict: "Pleo löst Karten und Spesen sehr gut. Software-Abo-Verwaltung ist nicht sein Kern. Wenn du Fristen, Benchmark und Weiterverrechnung pro Kunde brauchst, ist Toolfolio die passende Ergänzung oder Alternative.",
    painLead: "Karten-Tools sehen deine Ausgaben, aber sie wissen nichts über Kündigungsfristen, Markt-Benchmarks oder Marge pro Kunde.",
    painBullets: [
      { title: "Kein Fristen-Wächter", body: "Die Karte sieht die Abbuchung, aber nicht die Kündigungsfrist." },
      { title: "Kein Markt-Benchmark", body: "Du weißt, was du zahlst, nicht ob es fair ist." },
      { title: "Kein Agentur-Layer", body: "Kosten pro Kunde und Weiterverrechnung ist kein Thema." },
      { title: "Karten-Pflicht", body: "Funktionen entfalten sich erst mit Pleo-Karten." },
    ],
    altDataAsOf: "November 2025",
    groups: [
      { label: "Scope", rows: [{ feature: "Software-Abos spezialisiert", toolfolio: true, alt: "" }, { feature: "Mitarbeiter-Karten", toolfolio: false, alt: true }] },
      { label: "Abo-Funktionen", rows: [{ feature: "Fristen-Wächter", toolfolio: true, alt: "" }, { feature: "Benchmark", toolfolio: true, alt: "" }, { feature: "Weiterverrechnung pro Kunde", toolfolio: true, alt: "" }] },
    ],
    diffs: [
      { title: "Fokus auf Abo-Lifecycle.", body: "Frist, Verlängerung, Kündigung, Archiv. Genau dafür gebaut.", slot: "Fristen", Preview: PreviewFristen },
      { title: "Markt-Benchmark.", body: "Wir vergleichen deine Tools anonym mit dem Markt, Karten-Tools nicht.", slot: "Benchmark", Preview: PreviewBenchmark },
      { title: "Pro Kunde abrechnen.", body: "Mit Marge, fertig als Report.", slot: "Kunden-Detail", Preview: PreviewKunde },
    ],
    altStrengths: ["Mitarbeiter-Karten mit Echtzeit-Limits.", "Spesen-Workflow inklusive Beleg-Scan.", "Integration in viele Buchhaltungs-Tools."],
    switchSteps: [
      { title: "Abo-Abbuchungen identifizieren", body: "Aus Pleo oder Kontoauszug die wiederkehrenden Posten ziehen." },
      { title: "In Toolfolio aufnehmen", body: "Mail-Forward oder CSV-Import, fertig." },
      { title: "Pleo parallel nutzen", body: "Karten und Spesen bleiben bei Pleo, Abos bei Toolfolio." },
    ],
    faqs: [{ q: "Konkurriert Toolfolio mit Pleo?", a: "Nur teilweise. Pleo macht Karten und Spesen, wir machen Abo-Lifecycle. Viele Teams nutzen beides parallel." }],
  },

  zluri: {
    slug: "zluri",
    alt: "Zluri",
    altKind: "enterprise",
    icon: Building2,
    h1: "Toolfolio als Alternative zu Zluri.",
    subline: "Zluri ist Enterprise-SaaS-Management mit SSO-Discovery. Toolfolio ist die schlanke DACH-Alternative für kleine Teams.",
    verdict: "Zluri ist mächtig für IT-Teams mit hunderten Tools und SSO. Für ein Studio mit fünf Leuten ist das zu groß. Toolfolio gibt dir die wichtigsten Funktionen in fünf Minuten.",
    painLead: "Enterprise-Discovery setzt SSO und IT-Setup voraus. Beides haben kleine Teams selten. Die Komplexität lohnt sich erst ab einer gewissen Größe.",
    painBullets: [
      { title: "SSO-Voraussetzung", body: "Discovery funktioniert nur mit SSO-Landschaft, die kleine Teams nicht haben." },
      { title: "Enterprise-Pricing", body: "Pricing zielt auf 100+ Mitarbeitende und Procurement-Teams." },
      { title: "Komplexität", body: "Viele Module, langes Onboarding." },
      { title: "DACH zweitrangig", body: "DATEV, Reverse-Charge selten Kernfunktion." },
    ],
    altDataAsOf: "November 2025",
    groups: [
      { label: "Zielgruppe", rows: [{ feature: "1 bis 20 Personen", toolfolio: true, alt: "Eher 100+" }, { feature: "DACH-fokussiert", toolfolio: true, alt: "" }] },
      { label: "Funktionen", rows: [{ feature: "SSO-Discovery", toolfolio: false, alt: true }, { feature: "Mail-Forward Import", toolfolio: true, alt: "" }, { feature: "Weiterverrechnung pro Kunde", toolfolio: true, alt: "" }] },
    ],
    diffs: [
      { title: "Ohne SSO startbar.", body: "Mail-Forward reicht, du brauchst kein Identity-Provider-Projekt.", slot: "Import", Preview: PreviewImport },
      { title: "Agentur-Layer.", body: "Kosten pro Kunde, Marge, Weiterverrechnung.", slot: "Kunden-Detail", Preview: PreviewKunde },
    ],
    altStrengths: ["Tiefe SSO-Discovery in großen Umgebungen.", "IT-Governance und Lifecycle-Automation.", "Skaliert auf tausende Tools."],
    switchSteps: [
      { title: "Tools-Liste ziehen", body: "Aus dem aktuellen Tool exportieren." },
      { title: "In Toolfolio importieren", body: "Mapping läuft automatisch." },
      { title: "Mail-Forward aktivieren", body: "Neue Rechnungen pflegen sich selbst." },
    ],
    faqs: [{ q: "Brauche ich SSO für Toolfolio?", a: "Nein. Wir setzen auf Mail-Forward und Kontoauszug, damit auch kleine Teams ohne IT-Setup loslegen können." }],
  },

  torii: {
    slug: "torii",
    alt: "Torii",
    altKind: "enterprise",
    icon: Building2,
    h1: "Toolfolio als Alternative zu Torii.",
    subline: "Torii ist Enterprise-SaaS-Management. Toolfolio ist die schlanke, DACH-spezifische Alternative für kleine Teams.",
    verdict: "Torii ist auf IT-Teams in großen Organisationen zugeschnitten. Für Agenturen, Freelancer und Solopreneure ist Toolfolio die einfachere, bezahlbare Wahl.",
    painLead: "Enterprise-SaaS-Management Tools setzen IT-Reife, SSO und Procurement-Prozesse voraus. Das hat in kleinen Teams kaum jemand.",
    painBullets: [
      { title: "Enterprise-Setup", body: "Onboarding ist ein Projekt, nicht ein Klick." },
      { title: "Hohe Preise", body: "Pricing greift erst ab größerer Org-Größe." },
      { title: "DACH-Spezifika fehlen", body: "Reverse-Charge, DATEV oft Add-on, nicht Kern." },
      { title: "Kein Agentur-Layer", body: "Weiterverrechnung pro Kunde ist kein Standard." },
    ],
    altDataAsOf: "November 2025",
    groups: [
      { label: "Zielgruppe", rows: [{ feature: "Kleine Teams", toolfolio: true, alt: "Eher Enterprise" }] },
      { label: "Funktionen", rows: [{ feature: "SSO-Discovery", toolfolio: false, alt: true }, { feature: "Weiterverrechnung pro Kunde", toolfolio: true, alt: "" }, { feature: "DATEV-Export", toolfolio: true, alt: "" }] },
    ],
    diffs: [
      { title: "Schlank statt Enterprise.", body: "Schneller Start, klares Pricing, kein IT-Projekt.", slot: "Dashboard", Preview: PreviewDashboard },
      { title: "DACH-spezifisch.", body: "DATEV und Reverse-Charge sind Kern, nicht Beiwerk.", slot: "Steuer-Export", Preview: PreviewBenchmark },
    ],
    altStrengths: ["Tiefe Discovery- und Lifecycle-Workflows.", "Skaliert auf große Organisationen.", "Automatisierungen für IT-Teams."],
    switchSteps: [
      { title: "Liste exportieren", body: "Aus dem aktuellen Tool ziehen." },
      { title: "In Toolfolio importieren", body: "Automatisches Mapping." },
      { title: "Loslegen", body: "Mail-Forward aktivieren, fertig." },
    ],
    faqs: [{ q: "Wann ist Torii die bessere Wahl?", a: "Wenn du IT-Team, SSO-Landschaft und hunderte Tools hast. In dem Fall ist Enterprise das Richtige." }],
  },
};
