"use client";

import { useState, type ComponentType } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ChevronRight,
  CheckCircle2,
  Quote,
  Plus,
  Minus,
  Building2,
  Briefcase,
  User as UserIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Reveal,
  ScreenshotFrame,
  PreviewDashboard,
  PreviewFristen,
  PreviewAiCredits,
  PreviewBenchmark,
  PreviewSparvorschlaege,
  PreviewKunde,
} from "@/components/marketing/marketing-home";

export type AudienceSlug = "agenturen" | "freelancer" | "solopreneure";

type Pain = { title: string; body: string };
type FeatureBlock = {
  title: string;
  body: string;
  bullets: string[];
  slot: string;
  Preview: ComponentType;
  href?: string;
};
type Faq = { q: string; a: string };

export type AudienceData = {
  slug: AudienceSlug;
  segmentLabel: string;
  breadcrumb: string;
  icon: ComponentType<{ className?: string }>;
  h1: string;
  subline: string;
  heroSlot: string;
  HeroPreview: ComponentType;
  situationLead: string;
  pains: Pain[];
  features: FeatureBlock[];
  outcomes: { kpi: string; label: string }[];
  outcomeBody: string;
  planName: string;
  planReason: string;
  planPrice: string;
  faqs: Faq[];
  otherAudiences: { slug: AudienceSlug; label: string; teaser: string }[];
};

function PlaceholderHint({ children }: { children: React.ReactNode }) {
  return (
    <div className="absolute left-3 top-3 z-10 rounded-full bg-[#1F1D2B]/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white/90">
      {children}
    </div>
  );
}

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

/** Client-Wrapper: loest die Daten clientseitig auf (audienceData liegt im "use client"-Modul). */
export function AudienceBySlug({ slug }: { slug: AudienceSlug }) {
  const data = audienceData[slug];
  if (!data) return null;
  return <AudiencePage data={data} />;
}

export function AudiencePage({ data }: { data: AudienceData }) {
  const Icon = data.icon;
  return (
    <div className="bg-[#FBF7F1] text-[#1F1D2B]">
      {/* Breadcrumb */}
      <div className="mx-auto max-w-7xl px-6 pt-12">
        <nav className="flex items-center gap-2 text-sm text-[#1F1D2B]/60">
          <Link href="/" className="hover:text-[#6C5CE7]">Start</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span>Für wen</span>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-[#1F1D2B]">{data.breadcrumb}</span>
        </nav>
      </div>

      {/* Hero */}
      <header className="mx-auto max-w-7xl px-6 pb-16 pt-8">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_1fr]">
          <Reveal>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#1F1D2B]/10 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#1F1D2B]/70">
              <Icon className="h-3.5 w-3.5 text-[#6C5CE7]" />
              Toolfolio für {data.segmentLabel}
            </div>
            <h1 className="mt-5 font-display text-5xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">{data.h1}</h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-[#1F1D2B]/75">{data.subline}</p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/registrieren" className="inline-flex items-center gap-2 rounded-full bg-[#6C5CE7] px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_-12px_rgba(108,92,231,0.6)] transition hover:-translate-y-0.5">
                Kostenlos starten <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/preise" className="inline-flex items-center gap-2 rounded-full border border-[#1F1D2B]/15 bg-white px-6 py-3 text-sm font-semibold text-[#1F1D2B] transition hover:border-[#1F1D2B]/30">
                Preise ansehen
              </Link>
            </div>
            <p className="mt-4 text-xs text-[#1F1D2B]/55">14 Tage voller Agentur-Zugang, danach Plan wählen oder Free. Keine Kreditkarte.</p>
          </Reveal>

          <Reveal delay={120}>
            <div className="relative">
              <PlaceholderHint>Screenshot · {data.heroSlot}</PlaceholderHint>
              <ScreenshotFrame label={data.heroSlot}>
                <data.HeroPreview />
              </ScreenshotFrame>
            </div>
          </Reveal>
        </div>
      </header>

      {/* Situation */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#FF7A66]">Die Situation</p>
          <h2 className="mt-3 max-w-3xl font-display text-4xl font-bold leading-tight sm:text-5xl">Kennst du das auch?</h2>
          <p className="mt-4 max-w-3xl text-lg leading-relaxed text-[#1F1D2B]/75">{data.situationLead}</p>
        </Reveal>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {data.pains.map((p, i) => (
            <Reveal key={p.title} delay={i * 80}>
              <div className="h-full rounded-3xl border border-[#1F1D2B]/10 bg-white p-6 shadow-[0_8px_30px_-18px_rgba(31,29,43,0.25)] transition hover:-translate-y-1">
                <div className="font-display text-lg font-semibold text-[#1F1D2B]">{p.title}</div>
                <p className="mt-2 text-sm leading-relaxed text-[#1F1D2B]/70">{p.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-6">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#6C5CE7]">Darum Toolfolio</p>
            <h2 className="mt-3 max-w-3xl font-display text-4xl font-bold leading-tight sm:text-5xl">Das brauchst du wirklich als {data.segmentLabel}.</h2>
          </Reveal>
          <div className="mt-16 space-y-24">
            {data.features.map((f, i) => {
              const reverse = i % 2 === 1;
              return (
                <div key={f.title} className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
                  <Reveal className={reverse ? "lg:order-2" : ""}>
                    <div className="inline-flex items-center gap-2 rounded-full bg-[#FBF7F1] px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#6C5CE7]">
                      Funktion {String(i + 1).padStart(2, "0")}
                    </div>
                    <h3 className="mt-4 font-display text-3xl font-bold leading-tight sm:text-4xl">{f.title}</h3>
                    <p className="mt-4 text-[17px] leading-relaxed text-[#1F1D2B]/75">{f.body}</p>
                    <ul className="mt-5 space-y-2.5">
                      {f.bullets.map((b) => (
                        <li key={b} className="flex items-start gap-2.5 text-[15px] text-[#1F1D2B]/80">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#12B76A]" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                    {f.href && (
                      <Link href="/produkt" className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-[#6C5CE7] transition-all hover:gap-2.5">
                        Mehr erfahren <ArrowRight className="h-4 w-4" />
                      </Link>
                    )}
                  </Reveal>
                  <Reveal className={reverse ? "lg:order-1" : ""} delay={100}>
                    <div className="relative">
                      <PlaceholderHint>Screenshot · {f.slot}</PlaceholderHint>
                      <ScreenshotFrame label={f.slot}>
                        <f.Preview />
                      </ScreenshotFrame>
                    </div>
                  </Reveal>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Outcome */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#12B76A]">Was es dir bringt</p>
          <h2 className="mt-3 max-w-3xl font-display text-4xl font-bold leading-tight sm:text-5xl">Konkret weniger Chaos, mehr Marge.</h2>
          <p className="mt-4 max-w-3xl text-lg leading-relaxed text-[#1F1D2B]/75">{data.outcomeBody}</p>
        </Reveal>
        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          {data.outcomes.map((o, i) => (
            <Reveal key={o.label} delay={i * 80}>
              <div className="rounded-3xl border border-[#1F1D2B]/10 bg-white p-7 text-center shadow-[0_8px_30px_-18px_rgba(31,29,43,0.25)]">
                <div className="font-display text-4xl font-extrabold tabular-nums text-[#6C5CE7]">{o.kpi}</div>
                <div className="mt-2 text-sm text-[#1F1D2B]/70">{o.label}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Plan */}
      <section className="mx-auto max-w-7xl px-6 pb-24">
        <Reveal>
          <div className="overflow-hidden rounded-[2rem] border border-[#1F1D2B]/10 bg-gradient-to-br from-[#6C5CE7] to-[#5544c9] p-10 text-white shadow-[0_30px_60px_-30px_rgba(108,92,231,0.5)]">
            <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-center">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">Der passende Plan</p>
                <h2 className="mt-3 font-display text-4xl font-bold leading-tight sm:text-5xl">{data.planName} für {data.segmentLabel}</h2>
                <p className="mt-4 max-w-xl text-[17px] leading-relaxed text-white/85">{data.planReason}</p>
              </div>
              <div className="rounded-3xl bg-white/10 p-6 backdrop-blur">
                <div className="text-sm text-white/70">Ab</div>
                <div className="mt-1 font-display text-5xl font-extrabold tabular-nums">{data.planPrice}</div>
                <div className="mt-1 text-sm text-white/70">pro Monat, jährlich</div>
                <Link href="/preise" className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#6C5CE7] transition hover:-translate-y-0.5">
                  Alle Pläne ansehen <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-4xl px-6 py-24">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#6C5CE7]">Häufige Fragen</p>
          <h2 className="mt-3 font-display text-4xl font-bold leading-tight sm:text-5xl">Antworten für {data.segmentLabel}.</h2>
        </Reveal>
        <div className="mt-10 space-y-3">
          {data.faqs.map((f) => (<FaqItem key={f.q} {...f} />))}
        </div>
      </section>

      {/* Other audiences */}
      <section className="mx-auto max-w-7xl px-6 pb-24">
        <Reveal><h2 className="font-display text-3xl font-bold">Auch interessant</h2></Reveal>
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {data.otherAudiences.map((o) => (
            <Link key={o.slug} href={`/fuer/${o.slug}`} className="group rounded-3xl border border-[#1F1D2B]/10 bg-white p-6 transition hover:-translate-y-1 hover:border-[#6C5CE7]/40">
              <div className="flex items-center justify-between">
                <div className="font-display text-xl font-bold">Toolfolio für {o.label}</div>
                <ArrowRight className="h-5 w-5 text-[#6C5CE7] transition group-hover:translate-x-1" />
              </div>
              <p className="mt-2 text-sm text-[#1F1D2B]/70">{o.teaser}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-7xl px-6 pb-24">
        <Reveal>
          <div className="rounded-[2rem] bg-[#1F1D2B] p-12 text-center text-white">
            <h2 className="font-display text-4xl font-bold leading-tight sm:text-5xl">Bereit, deine Toolkosten in den Griff zu bekommen?</h2>
            <p className="mx-auto mt-4 max-w-xl text-white/75">14 Tage voller Zugang. Keine Kreditkarte. Jederzeit kündbar.</p>
            <Link href="/registrieren" className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#6C5CE7] px-7 py-3.5 text-sm font-semibold text-white shadow-[0_15px_40px_-15px_rgba(108,92,231,0.8)] transition hover:-translate-y-0.5">
              Kostenlos starten <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Reveal>
      </section>
    </div>
  );
}

/* ---------- Mini-Previews ---------- */

function PreviewReport() {
  return (
    <div className="h-full w-full bg-white p-5 text-[#1F1D2B]" style={{ fontVariantNumeric: "tabular-nums" }}>
      <div className="flex items-center justify-between">
        <div className="font-display text-sm font-bold">Weiterverrechnungs-Report · November</div>
        <div className="rounded-full bg-[#12B76A]/15 px-2 py-0.5 text-[10px] font-semibold text-[#12B76A]">Bereit zum Versand</div>
      </div>
      <div className="mt-4 space-y-2 text-[12px]">
        {[["Nordwerk Studio", "1.249,00 €", "+18% Marge"], ["Kessler", "684,00 €", "+22% Marge"], ["Solea", "412,00 €", "+15% Marge"], ["Atelier Norden", "298,00 €", "+12% Marge"]].map(([k, v, m]) => (
          <div key={k} className="flex items-center justify-between rounded-lg border border-[#1F1D2B]/10 px-3 py-2">
            <span className="font-medium">{k}</span>
            <span className="text-[#1F1D2B]/60">{m}</span>
            <span className="font-semibold tabular-nums">{v}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between rounded-xl bg-[#FBF7F1] p-3 text-[12px]">
        <span className="font-semibold">Summe weiterverrechnen</span>
        <span className="font-display text-lg font-extrabold">2.643,00 €</span>
      </div>
    </div>
  );
}

function PreviewSeats() {
  return (
    <div className="h-full w-full bg-white p-5 text-[#1F1D2B]" style={{ fontVariantNumeric: "tabular-nums" }}>
      <div className="font-display text-sm font-bold">Wer nutzt was · Seats</div>
      <div className="mt-3 grid grid-cols-3 gap-2 text-[11px]">
        <div className="rounded-xl border border-[#1F1D2B]/10 p-3"><div className="text-[#1F1D2B]/60">Bezahlte Seats</div><div className="mt-1 font-display text-xl font-extrabold">24</div></div>
        <div className="rounded-xl border border-[#F5A623]/40 bg-[#F5A623]/10 p-3"><div className="text-[#1F1D2B]/60">Ungenutzt</div><div className="mt-1 font-display text-xl font-extrabold text-[#F5A623]">7</div></div>
        <div className="rounded-xl border border-[#12B76A]/40 bg-[#12B76A]/10 p-3"><div className="text-[#1F1D2B]/60">Sparpotenzial</div><div className="mt-1 font-display text-xl font-extrabold text-[#12B76A]">189 €</div></div>
      </div>
      <div className="mt-4 space-y-1.5 text-[12px]">
        {[["Figma", "Pia, Jonas, Lina", "1 ungenutzt"], ["Notion", "ganzes Team", "alle aktiv"], ["Adobe CC", "Mara, Tim", "2 ungenutzt"], ["Linear", "Jonas, Lina", "ok"]].map(([t, u, s]) => (
          <div key={t} className="flex items-center justify-between rounded-lg border border-[#1F1D2B]/10 px-3 py-1.5">
            <span className="font-semibold">{t}</span>
            <span className="text-[#1F1D2B]/60">{u}</span>
            <span className={cn("text-xs", s.includes("ungenutzt") ? "text-[#F5A623]" : "text-[#12B76A]")}>{s}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PreviewSteuer() {
  return (
    <div className="h-full w-full bg-white p-5 text-[#1F1D2B]" style={{ fontVariantNumeric: "tabular-nums" }}>
      <div className="font-display text-sm font-bold">Steuer-Export · Q4</div>
      <div className="mt-3 space-y-2 text-[12px]">
        {[["EU Reverse-Charge", "1.842,00 €", "12 Belege"], ["Inland 19%", "2.103,00 €", "23 Belege"], ["Drittland", "412,00 €", "4 Belege"]].map(([k, v, c]) => (
          <div key={k} className="flex items-center justify-between rounded-lg border border-[#1F1D2B]/10 px-3 py-2">
            <span className="font-medium">{k}</span>
            <span className="text-[#1F1D2B]/60">{c}</span>
            <span className="font-semibold">{v}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-xl bg-[#FBF7F1] p-3 text-[11px] text-[#1F1D2B]/70">Export als DATEV-CSV bereit. Reverse-Charge korrekt gekennzeichnet.</div>
    </div>
  );
}

function PreviewArchiv() {
  return (
    <div className="h-full w-full bg-white p-5 text-[#1F1D2B]" style={{ fontVariantNumeric: "tabular-nums" }}>
      <div className="font-display text-sm font-bold">Archiv · gekündigte Abos</div>
      <div className="mt-3 space-y-1.5 text-[12px]">
        {[["Trello", "gekündigt 09/25", "−16 €/Mo"], ["Loom Business", "gekündigt 08/25", "−24 €/Mo"], ["Webflow CMS", "gekündigt 06/25", "−39 €/Mo"], ["Calendly Teams", "gekündigt 05/25", "−12 €/Mo"]].map(([t, d, s]) => (
          <div key={t} className="flex items-center justify-between rounded-lg border border-[#1F1D2B]/10 px-3 py-2">
            <span className="font-semibold">{t}</span>
            <span className="text-[#1F1D2B]/60">{d}</span>
            <span className="font-semibold text-[#12B76A]">{s}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-xl bg-[#12B76A]/10 p-3 text-[11px] font-semibold text-[#12B76A]">Eingespart insgesamt: 91 € / Monat</div>
    </div>
  );
}

/* ---------- Instances ---------- */

export const audienceData: Record<AudienceSlug, AudienceData> = {
  agenturen: {
    slug: "agenturen",
    segmentLabel: "Agenturen",
    breadcrumb: "Für Agenturen",
    icon: Building2,
    h1: "Toolfolio für Agenturen. Toolkosten im Griff und sauber pro Kunde verrechnet.",
    subline: "Du betreust viele Kunden mit vielen Tools und weißt nicht, welche Kosten zu wem gehören. Toolfolio ordnet jedes Abo dem richtigen Kunden zu, zeigt deine Marge und macht die Weiterverrechnung zur Routine.",
    heroSlot: "Kosten nach Kunde",
    HeroPreview: PreviewKunde,
    situationLead: "Eine Agentur jongliert dreißig, fünfzig, hundert Tools über zehn oder zwanzig Kunden. Niemand weiß genau, welche Kosten zu welchem Projekt gehören. Die Weiterverrechnung passiert nach Bauchgefühl, Zugänge ausgeschiedener Mitarbeiter laufen still weiter und bezahlte Seats stehen leer.",
    pains: [
      { title: "Wem gehört welches Tool?", body: "Figma, Notion, Adobe, alles über die Agentur-Kreditkarte. Welcher Kunde verursacht eigentlich welche Kosten?" },
      { title: "Weiterverrechnung nach Bauchgefühl", body: "Du schätzt am Monatsende, was du dem Kunden draufrechnest. Die Marge bleibt im Dunkeln." },
      { title: "Zugänge laufen weiter", body: "Ein Freelancer geht, sein Slack-Seat bleibt. Mal drei, mal fünf, summiert sich." },
      { title: "Bezahlte Seats stehen leer", body: "Adobe-Lizenzen für Leute, die seit Monaten nichts mehr anfassen. Jeden Monat 79 € umsonst." },
    ],
    features: [
      { title: "Toolkosten pro Kunde, mit echter Marge.", body: "Ordne jedes Abo dem richtigen Kunden zu. Toolfolio rechnet Kosten, Aufschlag und Marge pro Kunde aus. Du siehst sofort, wo du verdienst und wo du draufzahlst.", bullets: ["Drag-and-drop Zuordnung", "Aufschlag in % oder fix", "Marge pro Kunde live"], slot: "Kunden-Detail mit Marge", Preview: PreviewKunde, href: "/features/agentur-layer" },
      { title: "Weiterverrechnungs-Report, fertig für die Rechnung.", body: "Am Monatsende ein Klick. Du bekommst eine saubere Aufstellung pro Kunde, bereit zum Anhängen an die Rechnung oder zum Übernehmen in dein Faktura-Tool.", bullets: ["Pro Kunde gruppiert", "Reverse-Charge korrekt", "Export als PDF und CSV"], slot: "Report-Vorschau", Preview: PreviewReport, href: "/features/berichte" },
      { title: "Team, Seats und Offboarding ohne Lecks.", body: "Sieh, wer welches Tool wirklich nutzt. Hol ungenutzte Plätze zurück. Wenn jemand geht, weißt du auf einen Blick, welche Zugänge entzogen werden müssen.", bullets: ["Wer-nutzt-was Übersicht", "Inaktive Seats aufspüren", "Offboarding-Checkliste"], slot: "Seats und Nutzung", Preview: PreviewSeats, href: "/features/agentur-layer" },
      { title: "Benchmark: bei gleicher Leistung günstiger.", body: "Wir vergleichen deine Tools anonym mit dem Markt. Wenn du für die Leistung zu viel zahlst, schlagen wir konkret eine Alternative vor.", bullets: ["Anonymisierte Vergleichsdaten", "Konkrete Sparvorschläge", "Migrations-Hinweise"], slot: "Benchmark", Preview: PreviewBenchmark, href: "/features/benchmark" },
      { title: "Fristen-Wächter: keine stille Verlängerung.", body: "Bei dreißig Verträgen verpasst du Kündigungsfristen. Toolfolio warnt rechtzeitig, vor jeder Verlängerung, pro Kunde gruppiert.", bullets: ["Mehrstufige Warnungen", "Pro Kunde sortiert", "Kalender-Export"], slot: "Fristen-Übersicht", Preview: PreviewFristen, href: "/features/kuendigungsfristen-waechter" },
    ],
    outcomeBody: "Du siehst pro Kunde, wie viel Tool-Kosten reinkommen und wie viel rausgeht. Du hast eine saubere Grundlage für die Verhandlung des nächsten Retainers. Und du sparst dir das Excel am Monatsende.",
    /* HIER STANDEN ERFUNDENE MEDIAN-WERTE ("189 EUR Sparpotenzial pro Monat (Median)",
       "+23% mehr Marge pro Kunde"). Das Wort "Median" behauptet eine Auswertung ueber
       eine Nutzerbasis, die es nicht gibt. Weg damit, bis wir wirklich messen koennen. */
    outcomes: [],
    planName: "Agentur-Plan",
    planReason: "Der Agentur-Plan schaltet die Kunden-Zuordnung, Weiterverrechnungs-Reports und das Team-Offboarding frei. Genau das, was du brauchst, um Toolkosten in Marge zu verwandeln.",
    planPrice: "49 €",
    faqs: [
      { q: "Kann ich Toolkosten pro Kunde weiterverrechnen?", a: "Ja. Jedes Abo lässt sich einem Kunden zuordnen, mit Aufschlag in Prozent oder als fixer Betrag. Der Monats-Report ist sofort fertig zum Anhängen an deine Rechnung." },
      { q: "Wie funktioniert die Marge-Berechnung?", a: "Toolfolio rechnet Tool-Kosten gegen den weiterverrechneten Betrag pro Kunde. Du siehst die Marge in Euro und in Prozent, pro Kunde und insgesamt." },
      { q: "Können mehrere Teammitglieder mitarbeiten?", a: "Ja. Im Agentur-Plan ist die Teamarbeit mit Rollen (Admin, Mitglied, Read-only) inklusive. Jedes Mitglied sieht nur die zugewiesenen Bereiche." },
      { q: "Was passiert beim Offboarding eines Mitarbeiters?", a: "Du markierst die Person als ausgeschieden und siehst auf einen Blick alle Tools, in denen sie noch einen Seat hat. Inklusive Checkliste zum Entziehen der Zugänge." },
      { q: "Funktioniert Reverse-Charge bei EU-Tools?", a: "Ja. Toolfolio erkennt EU-Reverse-Charge automatisch und kennzeichnet es im Steuer-Export korrekt." },
    ],
    otherAudiences: [
      { slug: "freelancer", label: "Freelancer", teaser: "Überblick, Fristen, Steuer-Export. Alles, was du als Solo-Profi brauchst." },
      { slug: "solopreneure", label: "Solopreneure", teaser: "Einfach Überblick behalten, vergessene Trials stoppen, sparen." },
    ],
  },

  freelancer: {
    slug: "freelancer",
    segmentLabel: "Freelancer",
    breadcrumb: "Für Freelancer",
    icon: Briefcase,
    h1: "Toolfolio für Freelancer. Alle Abos im Blick, Fristen sicher, Steuer-Export in einer Minute.",
    subline: "Du arbeitest mit zehn, zwanzig Tools und verlierst den Überblick. Toolfolio sammelt deine Abos, warnt vor Verlängerungen und liefert den Steuer-Export ohne Excel-Akrobatik.",
    heroSlot: "Dashboard für Freelancer",
    HeroPreview: PreviewDashboard,
    situationLead: "Als Freelancer trägst du alles selbst: Tool-Auswahl, Buchhaltung, Steuer. Du zahlst monatlich für Dinge, die du seit Wochen nicht mehr nutzt. Du verpasst Kündigungsfristen, weil sie nie an einem Ort stehen. Und am Quartalsende sammelst du Belege aus zehn Mail-Postfächern.",
    pains: [
      { title: "Vergessene Abos", body: "Tools, die du letztes Jahr getestet hast, laufen still weiter. 9 € hier, 14 € dort, am Ende des Jahres ein dreistelliger Betrag." },
      { title: "Verpasste Fristen", body: "Die Jahres-Lizenz verlängert sich, weil die Mail im Spam landete. Wieder ein Jahr bezahlt." },
      { title: "Steuer-Chaos", body: "Quartalsende, du suchst Rechnungen in zehn Inboxen. Reverse-Charge richtig kennzeichnen, eine Nervensache." },
      { title: "AI-Credits unklar", body: "Du hast drei AI-Tools, jedes mit eigenem Credit-System. Wann ist welches leer?" },
    ],
    features: [
      { title: "Alle Abos auf einer Seite.", body: "Importiere per Mail-Forward, sieh alle Kosten, Verlängerungen und Kategorien an einem Ort. Endlich Überblick.", bullets: ["Mail-Forward-Import", "Auto-Kategorien", "Monats- und Jahressicht"], slot: "Dashboard", Preview: PreviewDashboard, href: "/features/ueberblick" },
      { title: "Fristen-Wächter gegen stille Verlängerung.", body: "Toolfolio warnt rechtzeitig vor jeder Verlängerung. Mehrstufig, im Kalender, per Mail. Du verpasst nichts mehr.", bullets: ["Warnungen 30/14/3 Tage vorher", "Kalender-Sync", "Schnelle Kündigung dokumentieren"], slot: "Fristen-Übersicht", Preview: PreviewFristen, href: "/features/kuendigungsfristen-waechter" },
      { title: "AI-Credits an einem Ort.", body: "ChatGPT, Claude, Midjourney. Toolfolio zeigt, wo wie viel Credit übrig ist und wann nachgeladen wird.", bullets: ["Multi-Provider", "Verbrauchstrend", "Warnung bei niedrigem Stand"], slot: "AI-Credits", Preview: PreviewAiCredits, href: "/features/ai-credits" },
      { title: "Steuer-Export ohne Excel.", body: "Ein Klick, du bekommst CSV oder DATEV-fertige Datei. Reverse-Charge korrekt gekennzeichnet, Belege verlinkt.", bullets: ["DATEV-Export", "Reverse-Charge automatisch", "Belege als PDF angehängt"], slot: "Steuer-Export", Preview: PreviewSteuer, href: "/features/steuer-export" },
      { title: "Archiv: was du gekündigt hast und was du sparst.", body: "Jede Kündigung landet im Archiv. Du siehst, was du im letzten Jahr eingespart hast, schwarz auf weiß.", bullets: ["Kündigungs-Historie", "Sparsumme pro Jahr", "Wiederaufnahme jederzeit"], slot: "Archiv", Preview: PreviewArchiv, href: "/features/archiv" },
    ],
    outcomeBody: "Keine vergessenen Abos mehr, keine verpassten Fristen, kein Steuer-Stress am Quartalsende. Du arbeitest, Toolfolio kümmert sich um den Rest.",
    /* HIER STANDEN ERFUNDENE MEDIAN-WERTE ("189 EUR Sparpotenzial pro Monat (Median)",
       "+23% mehr Marge pro Kunde"). Das Wort "Median" behauptet eine Auswertung ueber
       eine Nutzerbasis, die es nicht gibt. Weg damit, bis wir wirklich messen koennen. */
    outcomes: [],
    planName: "Pro-Plan",
    planReason: "Pro schaltet AI-Credits, Steuer-Export und unbegrenzte Abos frei. Genau das, was du als Freelancer brauchst, ohne Agentur-Overhead.",
    planPrice: "19 €",
    faqs: [
      { q: "Wie bekomme ich meine Abos in Toolfolio?", a: "Du leitest die Rechnungs-Mails an deine persönliche Toolfolio-Adresse weiter. Wir extrahieren Anbieter, Betrag und Verlängerung automatisch." },
      { q: "Funktioniert der Steuer-Export mit meiner Steuerberatung?", a: "Ja. Wir exportieren als DATEV-CSV und als generische CSV. Reverse-Charge ist korrekt gekennzeichnet." },
      { q: "Was, wenn ich zwischen Pro und Free wechseln will?", a: "Jederzeit möglich. Deine Daten bleiben erhalten, nur die Features passen sich an." },
      { q: "Brauche ich ein eigenes Geschäftskonto?", a: "Nein. Toolfolio funktioniert unabhängig von deiner Bank. Wir lesen aus Mail-Rechnungen, nicht aus Konten." },
      { q: "Kann ich Abos manuell hinzufügen?", a: "Ja, jederzeit. Mail-Import ist nur eine bequeme Variante, manuelles Erfassen funktioniert genauso." },
    ],
    otherAudiences: [
      { slug: "agenturen", label: "Agenturen", teaser: "Kosten pro Kunde, saubere Weiterverrechnung, Marge im Blick." },
      { slug: "solopreneure", label: "Solopreneure", teaser: "Einfach starten, vergessene Trials stoppen, Geld sparen." },
    ],
  },

  solopreneure: {
    slug: "solopreneure",
    segmentLabel: "Solopreneure",
    breadcrumb: "Für Solopreneure",
    icon: UserIcon,
    h1: "Toolfolio für Solopreneure. Einfach Überblick behalten und nie wieder ein vergessenes Trial bezahlen.",
    subline: "Du baust dein Business alleine auf, jeder Euro zählt. Toolfolio zeigt, was du wirklich nutzt, stoppt vergessene Trials und schlägt Sparvarianten vor.",
    heroSlot: "Übersicht für Solopreneure",
    HeroPreview: PreviewDashboard,
    situationLead: "Du testest viel, abonnierst spontan, vergisst zu kündigen. Am Monatsende fragst du dich, wofür eigentlich die ganzen Abbuchungen waren. Vergessene Trials werden zu Dauer-Abos, und keiner sagt dir, dass es das gleiche Tool für die Hälfte gibt.",
    pains: [
      { title: "Vergessene Trials", body: "Du hast es testen wollen, vergessen zu kündigen, jetzt zahlst du 29 € im Monat für etwas, das du einmal benutzt hast." },
      { title: "Kein Überblick", body: "Welche Abos hast du eigentlich? Du musst dich durch Mail und Bankkonto wühlen, um es zu wissen." },
      { title: "Zu teuer eingekauft", body: "Du zahlst Enterprise-Preise für Funktionen, die du nie nutzt. Eine günstige Alternative gibt es immer." },
      { title: "Keine Zeit für Buchhaltung", body: "Du baust dein Business, du willst keine Excel-Listen pflegen." },
    ],
    features: [
      { title: "Einfacher Überblick, ohne Setup.", body: "Mail-Forward einrichten, Toolfolio erkennt deine Abos automatisch. Nach fünf Minuten siehst du, wofür du jeden Monat zahlst.", bullets: ["Auto-Import via Mail", "Sortiert nach Kosten", "Monats- und Jahresblick"], slot: "Dashboard", Preview: PreviewDashboard, href: "/features/ueberblick" },
      { title: "Trial-Wächter: kein bezahltes Vergessen mehr.", body: "Toolfolio erkennt Trials und warnt dich vor dem Übergang in ein bezahltes Abo. Du entscheidest bewusst, statt zu zahlen weil du vergessen hast.", bullets: ["Trial-Erkennung", "Warnung 3 Tage vor Ablauf", "Direkt im Kalender"], slot: "Trial-Warnung", Preview: PreviewFristen, href: "/features/trial-erkennung" },
      { title: "Sparvorschläge: dasselbe für weniger.", body: "Wir schlagen Alternativen vor, die für dich genauso funktionieren, aber günstiger sind. Konkret, mit Migrations-Hinweis.", bullets: ["Anonymer Markt-Vergleich", "Konkrete Sparsumme", "Wechsel-Hinweise"], slot: "Sparvorschläge", Preview: PreviewSparvorschlaege, href: "/features/sparvorschlaege" },
      { title: "Archiv: das Spargedächtnis.", body: "Jede Kündigung wird festgehalten. Du siehst am Jahresende, was du wirklich eingespart hast.", bullets: ["Sparsumme pro Jahr", "Kündigungs-Historie", "Belege archiviert"], slot: "Archiv", Preview: PreviewArchiv, href: "/features/archiv" },
    ],
    outcomeBody: "Du behältst die Kontrolle, ohne ein zweites Excel zu führen. Du sparst echtes Geld, das du in dein Business stecken kannst. Und du schläfst nachts ruhiger.",
    /* HIER STANDEN ERFUNDENE MEDIAN-WERTE ("189 EUR Sparpotenzial pro Monat (Median)",
       "+23% mehr Marge pro Kunde"). Das Wort "Median" behauptet eine Auswertung ueber
       eine Nutzerbasis, die es nicht gibt. Weg damit, bis wir wirklich messen koennen. */
    outcomes: [],
    planName: "Free, dann Pro",
    planReason: "Starte komplett kostenlos. Wenn du mehr Abos verwalten oder den Steuer-Export brauchst, wechselst du in einem Klick zu Pro.",
    planPrice: "0 €",
    faqs: [
      { q: "Was kostet mich Free wirklich?", a: "Free ist komplett kostenlos. Bis zu 10 Abos, Übersicht, Trial-Warnungen. Kein Trick, keine Kreditkarte." },
      { q: "Wann lohnt sich Pro?", a: "Sobald du mehr als 10 Abos hast oder den Steuer-Export brauchst. Du wechselst in einem Klick." },
      { q: "Erkennt ihr wirklich alle Trials?", a: "Wir erkennen Trials aus den üblichen Anbieter-Mails. Falls einer durchrutscht, kannst du ihn manuell als Trial markieren." },
      { q: "Was passiert mit meinen Daten, wenn ich kündige?", a: "Du kannst alle Daten als CSV exportieren. Nach 30 Tagen werden sie endgültig gelöscht." },
    ],
    otherAudiences: [
      { slug: "agenturen", label: "Agenturen", teaser: "Kosten pro Kunde sauber weiterverrechnen, Marge im Blick." },
      { slug: "freelancer", label: "Freelancer", teaser: "Überblick, Fristen, AI-Credits, Steuer-Export." },
    ],
  },
};
