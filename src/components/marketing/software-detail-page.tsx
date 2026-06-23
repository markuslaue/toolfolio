import { useState, type ReactNode } from "react";
import {
  ArrowRight,
  ChevronRight,
  Star,
  Info,
  Sparkles,
  CheckCircle2,
  BellRing,
  PiggyBank,
  Users,
  Globe2,
  Plug,
  ShieldCheck,
  Lock,
  Building2,
  Briefcase,
  UserRound,
  ThumbsUp,
  ThumbsDown,
  Server,
  KeyRound,
} from "lucide-react";
import {
  Nav,
  Footer,
  Reveal,
  ScreenshotFrame,
  PreviewDashboard,
  PreviewImport,
  PreviewFristen,
  PreviewAiCredits,
  PreviewBenchmark,
  PreviewSparvorschlaege,
  PreviewKunde,
  PreviewVerzeichnis,
} from "./marketing-home";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// ---------- Types ----------
export type DetailPrice = {
  name: string;
  price: string; // e.g. "0,00 €" or "ab 12,00 €"
  unit?: string; // e.g. "pro Monat"
  description: string;
  features: string[];
  highlight?: boolean;
};

export type DetailFeature = {
  group: string;
  icon: React.ComponentType<{ className?: string }>;
  items: { title: string; text: string }[];
};

export type DetailAlternative = {
  name: string;
  desc: string;
  href: string;
  origin: string; // e.g. "EU", "USA"
};

export type DetailFaq = { q: string; a: string };

export type DetailReview = { author: string; role: string; rating: number; text: string };

export type SoftwareDetailData = {
  // Breadcrumb
  clusterSlug: string;
  clusterName: string;
  categorySlug: string;
  categoryName: string;
  // Header
  name: string;
  logoChar: string; // initial for placeholder logo
  h1: string;
  tagline: string;
  rating: number;
  reviewCount: number;
  selfListed?: boolean; // toggles "Eigenes Produkt" label
  vendor: string;
  vendorNote?: string;
  hq: string;
  startingPrice: string;
  // Self-listing transparency
  selfListingNote?: string;
  // Description
  description: string[];
  // Pricing
  prices: DetailPrice[];
  pricingNote?: string;
  // Features
  features: DetailFeature[];
  // Reviews
  reviews: DetailReview[];
  reviewsNote: string;
  // Cancellation
  cancellation: string[];
  // Alternatives
  alternatives: DetailAlternative[];
  // Deals
  deal?: { title: string; text: string };
  // CTA
  cta: { headline: string; text: string };
  // FAQ
  faqs: DetailFaq[];
};

// ---------- Toolfolio data ----------
export const toolfolioDetail: SoftwareDetailData = {
  clusterSlug: "finanzen-kostenmanagement",
  clusterName: "Finanzen & Kostenmanagement",
  categorySlug: "saas-spend-management",
  categoryName: "SaaS Spend Management",
  name: "Toolfolio",
  logoChar: "T",
  h1: "Toolfolio, Software-Kostenmanagement für Agenturen",
  tagline:
    "Alle Software-Abos zentral verwalten, vor Kosten und Fristen warnen, Sparpotenzial sichtbar machen.",
  rating: 4.6,
  reviewCount: 0,
  selfListed: true,
  vendor: "OMMM GmbH",
  vendorNote: "[bestätigen]",
  hq: "Leipzig, Deutschland (DACH)",
  startingPrice: "0,00 €",
  selfListingNote:
    "Toolfolio betreibt dieses Verzeichnis und listet sich hier selbst. Das passiert sichtbar gekennzeichnet, ohne besseren Platz im organischen Ranking und ohne verifiziert-Badge. Die gezeigten Preise sind offizielle Anbieterangaben.",
  description: [
    "Toolfolio bündelt alle Software-Abos deines Unternehmens an einem Ort: vom kleinen Kreativ-Tool bis zur großen Plattform-Lizenz. Du siehst auf einen Blick, was wirklich läuft, was Geld kostet und welche Verträge demnächst auslaufen oder sich automatisch verlängern.",
    "Der Fokus liegt auf Agenturen, Freelancern und Solopreneuren im DACH-Raum. Du verteilst Kosten sauber pro Kunde, behältst Kündigungsfristen im Griff und vergleichst Tools über das integrierte Verzeichnis. Was du im Vergleich findest, kannst du direkt in deinen Bestand übernehmen.",
    "Toolfolio ist ehrlich aufgestellt: Bewertungen sind nicht käuflich, Preise werden so transparent wie möglich gepflegt, und unsere eigene Listung läuft nicht mit Sonderrang, sondern neben allen anderen Anbietern.",
  ],
  prices: [
    {
      name: "Free",
      price: "0,00 €",
      unit: "pro Monat",
      description: "Bis zu 15 Abos, dauerhaft kostenlos. Kein langfristiger Vertrag.",
      features: [
        "Bis zu 15 Software-Abos",
        "Fristen-Wächter Basis",
        "Verzeichnis-Zugriff",
        "Manuelle Erfassung",
      ],
    },
    {
      name: "Pro",
      price: "ab 12,00 €",
      unit: "pro Monat",
      description: "Alle Features ohne Agentur-Layer. Für Solopreneure und Freelancer.",
      features: [
        "Unbegrenzte Abos",
        "Drei-Wege-Erfassung",
        "AI-Credit-Tracker",
        "Sparvorschläge",
        "Rechnungs- und Vertragsarchiv",
      ],
      highlight: true,
    },
    {
      name: "Agentur",
      price: "ab 49,00 €",
      unit: "pro Monat",
      description:
        "Inklusive Kosten pro Kunde, Weiterverrechnung, Team-Seats. 14 Tage voller Agentur-Zugang zum Start, Jahresrabatt verfügbar.",
      features: [
        "Alles aus Pro",
        "Kosten pro Kunde",
        "Weiterverrechnung",
        "Team-Seats",
        "Freigaben und Rollen",
        "Benchmark aus echten Abrechnungsdaten",
      ],
    },
  ],
  pricingNote:
    "Offizielle Anbieterangaben, nicht aus Abrechnungsdaten verifiziert (weil wir uns nicht selbst verifizieren).",
  features: [
    {
      group: "Erfassen ohne Doppelarbeit",
      icon: Sparkles,
      items: [
        {
          title: "Drei-Wege-Erfassung",
          text: "E-Mail-Postfach für Rechnungen, manuelle Eingabe und Import. Du wählst den Weg, der zu deinem Setup passt.",
        },
        {
          title: "Rechnungs- und Vertragsarchiv",
          text: "Belege und Verträge zentral gespeichert, durchsuchbar, mit Bezug zum jeweiligen Abo.",
        },
      ],
    },
    {
      group: "Kosten und Fristen im Griff",
      icon: BellRing,
      items: [
        {
          title: "Kündigungsfristen-Wächter",
          text: "Erinnerungen rechtzeitig vor jedem Renewal. Keine vergessenen Verlängerungen mehr.",
        },
        {
          title: "Benchmark aus echten Abrechnungen",
          text: "Sieh, was vergleichbare Teams für ähnliche Tools zahlen. Verdichtet und anonymisiert.",
        },
      ],
    },
    {
      group: "Sparen, statt nur tracken",
      icon: PiggyBank,
      items: [
        {
          title: "Sparvorschläge und Deals",
          text: "Konkrete Hinweise auf günstigere Tarife, Wechselkandidaten und Bündel-Angebote.",
        },
        {
          title: "AI-Credit-Tracker",
          text: "Behalte Verbrauch und Kosten von KI-Credits über alle Anbieter hinweg im Blick.",
        },
      ],
    },
    {
      group: "Agentur-Layer",
      icon: Users,
      items: [
        {
          title: "Kosten pro Kunde",
          text: "Software-Kosten sauber auf Kunden und Projekte verteilt, statt pauschal in den Gemeinkosten.",
        },
        {
          title: "Weiterverrechnung und Steuer-Export",
          text: "Strukturierte Exporte für deine Buchhaltung, Reports für die Weiterverrechnung an Kunden.",
        },
      ],
    },
  ],
  reviews: [
    {
      author: "Platzhalter",
      role: "Agenturinhaber, Beispielagentur",
      rating: 5,
      text: "Beispielzitat: hier erscheinen Bewertungen von echten Nutzerinnen und Nutzern, sobald freigegeben. Bewertungen sind nicht käuflich.",
    },
    {
      author: "Platzhalter",
      role: "Freelancerin, Beispielprojekt",
      rating: 4,
      text: "Beispielzitat: wir veröffentlichen hier ausschließlich echte Erfahrungsberichte, ohne erfundene Personen oder gekaufte Sterne.",
    },
  ],
  reviewsNote:
    "Bewertungen sind nicht käuflich. Wir kennzeichnen Platzhalter als Platzhalter und ergänzen echte Stimmen, sobald sie freigegeben sind.",
  cancellation: [
    "Monatlich kündbar, kein langfristiger Vertrag.",
    "Free bleibt dauerhaft kostenlos im Rahmen der Limits.",
    "Jahresabrechnung optional mit Rabatt, ebenfalls monatlich kündbar zum Laufzeitende.",
  ],
  alternatives: [
    {
      name: "Cledara",
      desc: "SaaS-Management für mittelständische Teams, starker Fokus auf zentrale Abrechnung.",
      href: "/verzeichnis/finanzen-kostenmanagement/saas-spend-management/cledara",
      origin: "UK",
    },
    {
      name: "Spendesk",
      desc: "Spend Management inkl. Karten, Auslagen und Software-Abos.",
      href: "/verzeichnis/finanzen-kostenmanagement/saas-spend-management/spendesk",
      origin: "EU",
    },
    {
      name: "Pleo",
      desc: "Firmenkarten und Ausgabenverwaltung, mit Abo-Erkennung.",
      href: "/verzeichnis/finanzen-kostenmanagement/saas-spend-management/pleo",
      origin: "EU",
    },
    {
      name: "Zluri",
      desc: "SaaS-Management-Plattform mit umfangreichen Discovery-Funktionen.",
      href: "/verzeichnis/finanzen-kostenmanagement/saas-spend-management/zluri",
      origin: "USA",
    },
    {
      name: "Sastrify / Deel IT",
      desc: "Verhandlungs- und Beschaffungs-Support für SaaS-Verträge.",
      href: "/verzeichnis/finanzen-kostenmanagement/saas-spend-management/sastrify",
      origin: "EU",
    },
    {
      name: "Subly",
      desc: "Schlanke Abo-Verwaltung für kleine Teams und Freelancer.",
      href: "/verzeichnis/finanzen-kostenmanagement/saas-spend-management/subly",
      origin: "UK",
    },
  ],
  deal: {
    title: "14 Tage voller Agentur-Zugang",
    text: "Zum Start bekommst du 14 Tage lang vollen Zugriff auf alle Agentur-Funktionen, ohne automatische Verlängerung. Jahresrabatt verfügbar, transparent ausgewiesen.",
  },
  cta: {
    headline: "Starte kostenlos und behalte alle deine Software-Abos im Griff.",
    text: "Toolfolio ist selbst der Tracker. Lege in wenigen Minuten los, ohne Kreditkarte.",
  },
  faqs: [
    {
      q: "Was kostet Toolfolio?",
      a: "Free dauerhaft 0,00 € (bis 15 Abos), Pro ab 12,00 € pro Monat, Agentur ab 49,00 € pro Monat. Alle Preise sind offizielle Anbieterangaben.",
    },
    {
      q: "Gibt es eine kostenlose Version?",
      a: "Ja, der Free-Plan ist dauerhaft kostenlos im Rahmen der Limits. Keine Kreditkarte nötig, keine automatische Umwandlung in einen Bezahltarif.",
    },
    {
      q: "Für wen ist Toolfolio gedacht?",
      a: "Agenturen, Freelancer und Solopreneure im DACH-Raum, die ihre Software-Abos zentral verwalten, Fristen kontrollieren und Kosten pro Kunde verteilen wollen.",
    },
    {
      q: "Wie unterscheidet sich Toolfolio von Cledara oder Zluri?",
      a: "Cledara und Zluri richten sich primär an größere Teams mit Karten- oder Discovery-Fokus. Toolfolio kombiniert Abo-Verwaltung mit einem neutralen Verzeichnis und Agentur-Funktionen wie Weiterverrechnung und Kosten pro Kunde.",
    },
    {
      q: "Warum listet sich Toolfolio im eigenen Verzeichnis?",
      a: "Aus Transparenz. Wenn wir eine Kategorie wie SaaS Spend Management führen, gehört unser Produkt sichtbar dazu, statt versteckt zu werden. Diese Listung erhält keinen Sonderrang und keinen verifiziert-Badge.",
    },
  ],
};

// ---------- Component ----------
export function SoftwareDetailPage({ data }: { data: SoftwareDetailData }) {
  const labelColor = "#6C5CE7";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />

      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="mx-auto max-w-7xl px-4 sm:px-6 pt-6 text-sm text-foreground/70"
      >
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <a href="/verzeichnis" className="hover:text-foreground">
              Verzeichnis
            </a>
          </li>
          <li aria-hidden>
            <ChevronRight className="size-3.5 opacity-50" />
          </li>
          <li>
            <a
              href={`/verzeichnis/${data.clusterSlug}`}
              className="hover:text-foreground"
            >
              {data.clusterName}
            </a>
          </li>
          <li aria-hidden>
            <ChevronRight className="size-3.5 opacity-50" />
          </li>
          <li>
            <a
              href={`/verzeichnis/${data.clusterSlug}/${data.categorySlug}`}
              className="hover:text-foreground"
            >
              {data.categoryName}
            </a>
          </li>
          <li aria-hidden>
            <ChevronRight className="size-3.5 opacity-50" />
          </li>
          <li aria-current="page" className="text-foreground font-medium">
            {data.name}
          </li>
        </ol>
      </nav>

      {/* Hero / Header */}
      <header className="mx-auto max-w-7xl px-4 sm:px-6 pt-8 pb-12 sm:pt-12 sm:pb-16">
        <Reveal>
          <div className="rounded-3xl border border-border bg-card p-6 sm:p-10 shadow-soft">
            <div className="flex flex-col md:flex-row md:items-start gap-6 md:gap-8">
              {/* Logo */}
              <div
                className="flex size-20 sm:size-24 shrink-0 items-center justify-center rounded-2xl text-3xl sm:text-4xl font-display font-semibold text-primary-foreground"
                style={{ background: `linear-gradient(135deg, ${labelColor}, #5849c4)` }}
                aria-hidden
              >
                {data.logoChar}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  {data.selfListed && (
                    <span
                      className="group relative inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/60 px-3 py-1 text-xs font-semibold text-foreground/80"
                      title="Toolfolio betreibt dieses Verzeichnis und listet sich hier selbst. Diese Listung erhält keinen Sonderrang und keinen verifiziert-Badge."
                    >
                      <Info className="size-3.5" />
                      Eigenes Produkt von Toolfolio
                    </span>
                  )}
                  <a
                    href="/badge"
                    className="text-xs text-foreground/60 underline underline-offset-2 hover:text-foreground"
                  >
                    Was bedeutet das?
                  </a>
                </div>

                <h1 className="mt-3 font-display text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight">
                  {data.h1}
                </h1>
                <p className="mt-3 max-w-2xl text-foreground/75 leading-relaxed">
                  {data.tagline}
                </p>

                {/* Rating */}
                <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
                  <div className="flex items-center gap-1" aria-label={`Bewertung ${data.rating} von 5`}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`size-4 ${
                          i < Math.round(data.rating)
                            ? "fill-[#F5A623] text-[#F5A623]"
                            : "text-foreground/20"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="tabular-nums font-medium">{data.rating.toFixed(1)}</span>
                  <span className="text-foreground/60">
                    {data.reviewCount === 0
                      ? "(noch keine veröffentlichten Bewertungen)"
                      : `(${data.reviewCount} Bewertungen)`}
                  </span>
                </div>

                {/* Key facts */}
                <dl className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  <div className="rounded-2xl border border-border bg-background/60 p-4">
                    <dt className="text-foreground/60 text-xs uppercase tracking-wide">
                      Anbieter
                    </dt>
                    <dd className="mt-1 font-medium">
                      {data.vendor}{" "}
                      {data.vendorNote && (
                        <span className="text-foreground/50 text-xs">{data.vendorNote}</span>
                      )}
                    </dd>
                  </div>
                  <div className="rounded-2xl border border-border bg-background/60 p-4">
                    <dt className="text-foreground/60 text-xs uppercase tracking-wide">Sitz</dt>
                    <dd className="mt-1 font-medium inline-flex items-center gap-1.5">
                      <Globe2 className="size-4 text-foreground/60" />
                      {data.hq}
                    </dd>
                  </div>
                  <div className="rounded-2xl border border-border bg-background/60 p-4">
                    <dt className="text-foreground/60 text-xs uppercase tracking-wide">
                      Ab-Preis
                    </dt>
                    <dd className="mt-1 font-display text-xl font-semibold tabular-nums">
                      {data.startingPrice}
                    </dd>
                  </div>
                </dl>

                {/* CTAs */}
                <div className="mt-6 flex flex-wrap gap-3">
                  <a
                    href="/preise"
                    className="inline-flex items-center gap-1.5 rounded-2xl bg-primary text-primary-foreground px-5 py-3 text-sm font-semibold hover:opacity-90"
                  >
                    Kostenlos starten <ArrowRight className="size-4" />
                  </a>
                  <a
                    href="#features"
                    className="inline-flex items-center gap-1.5 rounded-2xl border border-border bg-card px-5 py-3 text-sm font-semibold hover:bg-muted"
                  >
                    Alle Funktionen
                  </a>
                  <a
                    href="#alternativen"
                    className="inline-flex items-center gap-1.5 rounded-2xl border border-border bg-card px-5 py-3 text-sm font-semibold hover:bg-muted"
                  >
                    Alternativen ansehen
                  </a>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </header>

      {/* Self-listing transparency */}
      {data.selfListed && data.selfListingNote && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-12">
          <Reveal>
            <div className="rounded-3xl border border-dashed border-border bg-muted/40 p-6 sm:p-8">
              <div className="flex items-start gap-3">
                <Info className="mt-1 size-5 shrink-0 text-foreground/70" />
                <div>
                  <h2 className="font-display text-xl sm:text-2xl font-semibold">
                    Transparenz: Selbstlistung
                  </h2>
                  <p className="mt-3 text-foreground/80 leading-relaxed">
                    {data.selfListingNote}
                  </p>
                  <p className="mt-3 text-foreground/70 leading-relaxed">
                    Für andere Tools nutzen wir, wo möglich, verifizierte Abrechnungsdaten aus
                    echten Konten. Für unser eigenes Produkt zeigen wir bewusst nur die offiziellen
                    Anbieterpreise, weil wir uns nicht selbst verifizieren.
                  </p>
                  <a
                    href="/badge"
                    className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
                  >
                    So funktionieren Verifizierung und Ranking <ArrowRight className="size-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </Reveal>
        </section>
      )}

      {/* Description */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 pb-16">
        <Reveal>
          <h2 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight">
            Was {data.name} macht
          </h2>
        </Reveal>
        <div className="mt-5 space-y-4 text-foreground/80 leading-relaxed text-[15px]">
          {data.description.map((p, i) => (
            <Reveal key={i} delay={i * 40}>
              <p>{p}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="preise" className="mx-auto max-w-7xl px-4 sm:px-6 pb-16">
        <Reveal>
          <h2 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight">
            Preise
          </h2>
          {data.pricingNote && (
            <p className="mt-2 text-sm text-foreground/60">{data.pricingNote}</p>
          )}
        </Reveal>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {data.prices.map((p, i) => (
            <Reveal key={p.name} delay={i * 60}>
              <div
                className={`relative h-full rounded-3xl border p-6 sm:p-7 shadow-soft transition hover:-translate-y-0.5 ${
                  p.highlight
                    ? "border-primary bg-card"
                    : "border-border bg-card"
                }`}
              >
                {p.highlight && (
                  <span className="absolute -top-3 left-6 inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                    Empfehlung
                  </span>
                )}
                <div className="font-display text-lg font-semibold">{p.name}</div>
                <div className="mt-3 flex items-baseline gap-1.5">
                  <span className="font-display text-3xl font-semibold tabular-nums">
                    {p.price}
                  </span>
                  {p.unit && <span className="text-sm text-foreground/60">{p.unit}</span>}
                </div>
                <p className="mt-3 text-sm text-foreground/70 leading-relaxed">{p.description}</p>
                <ul className="mt-4 space-y-2 text-sm">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[#12B76A]" />
                      <span className="text-foreground/85">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl px-4 sm:px-6 pb-16">
        <Reveal>
          <h2 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight">
            Funktionen
          </h2>
          <p className="mt-2 max-w-2xl text-foreground/70">
            Gruppiert nach Nutzen statt nach Modulen. So siehst du schnell, was dir konkret hilft.
          </p>
        </Reveal>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-5">
          {data.features.map((g, i) => {
            const Icon = g.icon;
            return (
              <Reveal key={g.group} delay={i * 50}>
                <div className="h-full rounded-3xl border border-border bg-card p-6 sm:p-7 shadow-soft">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex size-10 items-center justify-center rounded-xl"
                      style={{ background: `${labelColor}1A`, color: labelColor }}
                    >
                      <Icon className="size-5" />
                    </div>
                    <h3 className="font-display text-lg font-semibold">{g.group}</h3>
                  </div>
                  <ul className="mt-5 space-y-4">
                    {g.items.map((it) => (
                      <li key={it.title}>
                        <div className="font-medium">{it.title}</div>
                        <p className="mt-1 text-sm text-foreground/70 leading-relaxed">
                          {it.text}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* Reviews */}
      <section id="bewertungen" className="mx-auto max-w-7xl px-4 sm:px-6 pb-16">
        <Reveal>
          <h2 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight">
            Bewertungen
          </h2>
          <p className="mt-2 text-sm text-foreground/60">{data.reviewsNote}</p>
        </Reveal>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-5">
          {data.reviews.map((r, i) => (
            <Reveal key={i} delay={i * 60}>
              <div className="h-full rounded-3xl border border-dashed border-border bg-card/70 p-6 sm:p-7">
                <div className="flex items-center gap-1" aria-label={`Bewertung ${r.rating} von 5`}>
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star
                      key={j}
                      className={`size-4 ${
                        j < r.rating ? "fill-[#F5A623] text-[#F5A623]" : "text-foreground/20"
                      }`}
                    />
                  ))}
                </div>
                <p className="mt-3 text-foreground/80 leading-relaxed italic">
                  „{r.text}"
                </p>
                <div className="mt-4 text-sm">
                  <div className="font-medium">{r.author}</div>
                  <div className="text-foreground/60">{r.role}</div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Cancellation */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-16">
        <Reveal>
          <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-soft">
            <h2 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight">
              Kündigungsfristen und Vertragsdaten
            </h2>
            <ul className="mt-5 space-y-3 text-foreground/80">
              {data.cancellation.map((c) => (
                <li key={c} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-[#12B76A]" />
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </section>

      {/* Alternatives */}
      <section id="alternativen" className="mx-auto max-w-7xl px-4 sm:px-6 pb-16">
        <Reveal>
          <h2 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight">
            Faire Alternativen
          </h2>
          <p className="mt-2 max-w-2xl text-foreground/70">
            Andere Lösungen im Bereich {data.categoryName}. Kein versteckter Wettbewerber-Bashing,
            sondern ehrliche Verweise auf passende Anbieter.
          </p>
        </Reveal>
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.alternatives.map((a, i) => (
            <Reveal key={a.name} delay={i * 40}>
              <a
                href={a.href}
                className="group block h-full rounded-3xl border border-border bg-card p-5 sm:p-6 shadow-soft transition hover:-translate-y-0.5 hover:border-primary/40"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="font-display text-lg font-semibold">{a.name}</div>
                  <span className="rounded-full border border-border px-2 py-0.5 text-xs text-foreground/60">
                    {a.origin}
                  </span>
                </div>
                <p className="mt-2 text-sm text-foreground/70 leading-relaxed">{a.desc}</p>
                <div className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                  Im Verzeichnis ansehen{" "}
                  <ArrowRight className="size-3.5 transition group-hover:translate-x-0.5" />
                </div>
              </a>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Deal */}
      {data.deal && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-16">
          <Reveal>
            <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-soft">
              <div className="flex items-start gap-4">
                <div
                  className="flex size-12 items-center justify-center rounded-2xl"
                  style={{ background: "#12B76A1A", color: "#0e8a51" }}
                >
                  <Sparkles className="size-5" />
                </div>
                <div>
                  <h2 className="font-display text-xl sm:text-2xl font-semibold">
                    {data.deal.title}
                  </h2>
                  <p className="mt-2 text-foreground/80 leading-relaxed">{data.deal.text}</p>
                </div>
              </div>
            </div>
          </Reveal>
        </section>
      )}

      {/* CTA (statt Tracker-Brücke) */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-16">
        <Reveal>
          <div
            className="relative overflow-hidden rounded-3xl p-8 sm:p-12 text-primary-foreground"
            style={{
              background: `linear-gradient(135deg, ${labelColor} 0%, #5849c4 60%, #FF7A66 130%)`,
            }}
          >
            <div className="relative z-10 max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur px-3 py-1 text-xs font-semibold uppercase tracking-wide">
                <Sparkles className="size-3.5" />
                Direkt loslegen
              </div>
              <h2 className="mt-4 font-display text-3xl sm:text-4xl font-semibold leading-tight">
                {data.cta.headline}
              </h2>
              <p className="mt-3 text-primary-foreground/85">{data.cta.text}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href="/preise"
                  className="inline-flex items-center gap-1.5 rounded-2xl bg-white text-foreground px-5 py-3 text-sm font-semibold hover:opacity-90"
                >
                  Kostenlos starten <ArrowRight className="size-4" />
                </a>
                <a
                  href="/features"
                  className="inline-flex items-center gap-1.5 rounded-2xl bg-white/10 border border-white/30 px-5 py-3 text-sm font-semibold hover:bg-white/20"
                >
                  Alle Funktionen ansehen
                </a>
              </div>
            </div>
            <div
              aria-hidden
              className="absolute -right-20 -bottom-20 size-80 rounded-full bg-white/10 blur-2xl"
            />
          </div>
        </Reveal>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-16">
        <Reveal>
          <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight">
            Häufige Fragen
          </h2>
        </Reveal>
        <Reveal delay={80}>
          <div className="mt-6 rounded-3xl border border-border bg-card p-2 sm:p-4 shadow-soft">
            <Accordion type="single" collapsible className="w-full">
              {data.faqs.map((f, i) => (
                <AccordionItem key={i} value={`faq-${i}`} className="border-border">
                  <AccordionTrigger className="text-left font-display text-base font-semibold px-3 sm:px-4">
                    {f.q}
                  </AccordionTrigger>
                  <AccordionContent className="px-3 sm:px-4 text-foreground/80 leading-relaxed">
                    {f.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </Reveal>
      </section>

      {/* SEO Long-Form */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 pb-20">
        <Reveal>
          <div className="rounded-3xl border border-border bg-card/50 p-6 sm:p-10 shadow-soft">
            <h2 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight">
              {data.name} im Kontext von {data.categoryName}
            </h2>
            <div className="mt-6 space-y-5 text-foreground/80 leading-relaxed text-[15px]">
              <p>
                {data.name} ordnet sich in die Kategorie {data.categoryName} ein, einen Bereich, in
                dem es vor allem darum geht, den realen Software-Bestand eines Unternehmens
                sichtbar, planbar und steuerbar zu machen. Viele Teams arbeiten heute mit Dutzenden
                SaaS-Abos parallel, oft gewachsen über Jahre, oft auf verschiedenen Kreditkarten
                und in verschiedenen Konten. {data.name} setzt genau hier an und schafft einen
                zentralen Ort, an dem Verträge, Kosten, Fristen und Verantwortlichkeiten
                zusammenkommen.
              </p>
              <p>
                Der Unterschied zu klassischen Spend-Management-Plattformen liegt im Zuschnitt auf
                Agenturen, Freelancer und Solopreneure im DACH-Raum. Statt einer schweren
                Enterprise-Suite bekommst du eine schlanke Lösung, die in Minuten startet und mit
                deinem Bestand mitwächst. Funktionen wie Kosten pro Kunde, Weiterverrechnung und
                Steuer-Export sind dabei nicht Add-ons, sondern fester Teil des Agentur-Layers.
              </p>
              <p>
                Beim Vergleich mit Tools wie Cledara, Zluri oder Sastrify lohnt der Blick auf die
                Zielgruppe: Wer hunderte SaaS-Verträge in einem Konzern verwaltet, fährt mit den
                großen Discovery-Plattformen oft besser. Wer als Agentur ehrlich verstehen will,
                welcher Kunde welche Tools wirklich verursacht und wo sich Bündelungen oder
                Wechsel lohnen, findet in {data.name} eine deutlich passendere Antwort. Das
                integrierte Verzeichnis verbindet diese Auswertung direkt mit konkreten
                Alternativen.
              </p>
              <p>
                Transparenz ist bei {data.name} bewusst Programm. Bewertungen sind nicht käuflich,
                Preise werden so transparent wie möglich gepflegt, und die eigene Listung im
                Verzeichnis läuft ohne Sonderrang. Wer ein Tool für SaaS Spend Management sucht,
                soll eine ehrliche Entscheidung treffen können, auch wenn diese am Ende gegen das
                eigene Produkt ausfällt. Genau diese Haltung steckt im gesamten Verzeichnis.
              </p>
            </div>
          </div>
        </Reveal>
      </section>

      <Footer />
    </div>
  );
}
