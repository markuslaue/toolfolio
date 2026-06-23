import { useMemo, useState } from "react";
import {
  Search,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Info,
  Filter,
  SlidersHorizontal,
  Star,
  Users,
  BellRing,
  Globe2,
  FileSignature,
  Brain,
  Sparkles,
  CheckCircle2,
  X,
} from "lucide-react";
import { Nav, Footer, Reveal } from "./marketing-home";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export type CategoryTool = {
  slug: string;
  name: string;
  desc: string;
  price: string;
  priceNote?: string;
  rating: number; // 0-5
  reviewCount: number;
  features: string[]; // e.g. ["QES", "KI-Analyse", "Fristen"]
  size: "Solo" | "KMU" | "Mittelstand" | "Enterprise";
  dachHosting: boolean;
  verified: boolean;
};

export type SponsoredTool = {
  slug: string;
  name: string;
  pitch: string;
  highlight: string; // headline benefit
  price: string;
  priceNote?: string;
};

export type CommunityTool = {
  slug: string;
  name: string;
  desc: string;
  author: string;
};

export type RelatedLink = { title: string; href: string; tag: string };

export type CategoryFaq = { q: string; a: string };

export type CategoryData = {
  clusterSlug: string;
  clusterName: string;
  slug: string;
  name: string; // "Vertragsmanagement"
  h1: string;
  subline: string;
  color: string;
  intro: string[];
  sponsored: SponsoredTool[];
  organic: CategoryTool[];
  community: CommunityTool[];
  related: RelatedLink[];
  faqs: CategoryFaq[];
};

export const vertragsmanagementCategory: CategoryData = {
  clusterSlug: "vertragsmanagement-software",
  clusterName: "Vertragsmanagement-Software",
  slug: "vertragsmanagement",
  name: "Vertragsmanagement",
  h1: "Vertragsmanagement-Tools im Vergleich",
  subline:
    "Neutral verglichene Lösungen für den gesamten Vertragslebenszyklus. Mit klar getrennten Zonen für gesponsert, organisches Ranking und Community-Tools.",
  color: "#6C5CE7",
  intro: [
    "Vertragsmanagement-Tools bündeln Erstellung, Verhandlung, Signatur, Fristen und Archivierung deiner Verträge an einem Ort. So vermeidest du verstreute PDFs und verpasste Kündigungen.",
    "Beim Vergleich zählen vor allem: zuverlässiges Fristenmanagement, passende E-Signatur-Stufen wie QES, optionale KI-Vertragsanalyse, DACH-Hosting und faire Preise für deine Unternehmensgröße.",
  ],
  sponsored: [
    {
      slug: "fynk",
      name: "fynk",
      highlight: "CLM mit KI-Analyse und Fristen-Wächter",
      pitch:
        "Moderne Plattform für Vertragsmanagement mit Vorlagen, KI-gestützter Auslesung und automatischen Erinnerungen vor Kündigungsfristen.",
      price: "ab 19,00 € pro Nutzer",
      priceNote: "[verifizieren]",
    },
  ],
  organic: [
    {
      slug: "inhubber",
      name: "Inhubber",
      desc: "Vertragsmanagement mit KI-Auslesung, Fristen-Tracking und Berichten, klar auf den DACH-Raum zugeschnitten.",
      price: "ab 14,99 € pro Nutzer",
      priceNote: "[verifizieren]",
      rating: 4.6,
      reviewCount: 84,
      features: ["KI-Analyse", "Fristen", "DACH"],
      size: "KMU",
      dachHosting: true,
      verified: true,
    },
    {
      slug: "contracthero",
      name: "ContractHero",
      desc: "CLM für Mittelstand und KMU mit Workflows, E-Signatur-Integration und übersichtlichem Reporting.",
      price: "Preis auf Anfrage",
      priceNote: "[verifizieren]",
      rating: 4.5,
      reviewCount: 62,
      features: ["Workflows", "E-Signatur", "Reporting"],
      size: "Mittelstand",
      dachHosting: true,
      verified: true,
    },
    {
      slug: "paperless",
      name: "Paperless",
      desc: "Digitale Vertragsabwicklung mit Vorlagen und E-Signatur, Fokus auf schnelle Abschlüsse.",
      price: "ab 149,00 € pro Monat",
      priceNote: "[verifizieren]",
      rating: 4.3,
      reviewCount: 47,
      features: ["E-Signatur", "Vorlagen"],
      size: "KMU",
      dachHosting: false,
      verified: true,
    },
    {
      slug: "skribble",
      name: "Skribble",
      desc: "Schweizer Signaturdienst mit SES, AES und QES nach eIDAS und ZertES.",
      price: "ab 9,00 € pro Nutzer",
      priceNote: "[verifizieren]",
      rating: 4.7,
      reviewCount: 138,
      features: ["QES", "E-Signatur", "DACH"],
      size: "Solo",
      dachHosting: true,
      verified: true,
    },
    {
      slug: "agorum-core",
      name: "agorum core",
      desc: "DMS- und ECM-Plattform aus Deutschland, ausbaubar zum vollwertigen Vertragsmanagement.",
      price: "ab 30,00 € pro Nutzer",
      priceNote: "[verifizieren]",
      rating: 4.2,
      reviewCount: 29,
      features: ["DMS", "Workflows", "DACH"],
      size: "Mittelstand",
      dachHosting: true,
      verified: true,
    },
    {
      slug: "otris-software",
      name: "otris software",
      desc: "Enterprise-Lösung für Vertragsmanagement und Legal Operations mit modularen Workflows.",
      price: "Preis auf Anfrage",
      priceNote: "[verifizieren]",
      rating: 4.4,
      reviewCount: 18,
      features: ["Enterprise", "Workflows", "DACH"],
      size: "Enterprise",
      dachHosting: true,
      verified: true,
    },
    {
      slug: "contractbook",
      name: "Contractbook",
      desc: "CLM mit Automationen, Vorlagen und vielen Integrationen, internationaler Anbieter.",
      price: "Preis auf Anfrage",
      priceNote: "[verifizieren]",
      rating: 4.1,
      reviewCount: 56,
      features: ["Automation", "Integrationen"],
      size: "KMU",
      dachHosting: false,
      verified: true,
    },
    {
      slug: "dilitrust-suite",
      name: "DiliTrust Suite",
      desc: "Modulare Legal-Tech-Suite für Vertrags-, Gesellschafts- und Compliance-Themen.",
      price: "Preis auf Anfrage",
      priceNote: "[verifizieren]",
      rating: 4.0,
      reviewCount: 22,
      features: ["Enterprise", "Compliance"],
      size: "Enterprise",
      dachHosting: true,
      verified: true,
    },
  ],
  community: [
    {
      slug: "contrax",
      name: "Contrax",
      desc: "Schlanke Open-Source-Vertragsablage für Indie-Teams.",
      author: "Indie-Projekt",
    },
    {
      slug: "klauselbox",
      name: "Klauselbox",
      desc: "Community-Sammlung von Vertragsklauseln mit einfacher Vorlagen-Engine.",
      author: "Community",
    },
    {
      slug: "fristik",
      name: "Fristik",
      desc: "Minimaler Fristen-Tracker für Solo-Selbstständige, in Beta.",
      author: "Indie-Entwickler",
    },
  ],
  related: [
    { title: "E-Signatur (SES, AES, QES)", href: "/verzeichnis/vertragsmanagement-software/e-signatur", tag: "Kategorie" },
    { title: "KI-Vertragsanalyse", href: "/verzeichnis/vertragsmanagement-software/ki-vertragsanalyse", tag: "Kategorie" },
    { title: "Dokumentenmanagement (DMS)", href: "/verzeichnis/vertragsmanagement-software/dms", tag: "Kategorie" },
    { title: "Vertragsmanagement für KMU", href: "/verzeichnis#collection-clm-kmu", tag: "Vergleich" },
    { title: "Tools mit QES", href: "/verzeichnis#collection-qes", tag: "Vergleich" },
  ],
  faqs: [
    {
      q: "Wie ordnet Toolfolio diese Liste?",
      a: "Wir trennen drei Zonen sichtbar: Gesponserte Plätze sind als solche markiert. Das organische Ranking ist neutral und nach echten Kriterien wie Bewertung, Funktionsumfang und verifizierten Daten sortiert. Community-Tools stehen abgesetzt darunter und sind als nicht geprüft gekennzeichnet.",
    },
    {
      q: "Kann man sich nach oben kaufen?",
      a: "Nein. Im organischen Ranking ist Sichtbarkeit nicht käuflich. Bezahlte Sichtbarkeit gibt es ausschließlich auf den gesponserten Plätzen, die immer als gesponsert gekennzeichnet sind. Bewertungen und verifizierte Preisdaten sind nie käuflich.",
    },
    {
      q: "Was ist ein Community-Tool?",
      a: "Community-Tools sind gelistet, aber nicht von uns geprüft. Sie stammen häufig von kleinen Anbietern oder Indie-Entwicklern. Sie tragen kein Vertrauens-Badge und stehen klar abgesetzt vom organischen Ranking.",
    },
    {
      q: "Was kostet Vertragsmanagement-Software?",
      a: "Die Preise reichen je nach Funktionsumfang von rund 10 € pro Nutzer und Monat bis weit in den dreistelligen Bereich für Enterprise-Suiten. Plane neben dem Lizenzpreis Aufwände für Einführung und Schulung ein.",
    },
  ],
};

const featureChoices = ["QES", "KI-Analyse", "Fristen", "E-Signatur", "DMS", "Workflows"];
const sizeChoices: CategoryTool["size"][] = ["Solo", "KMU", "Mittelstand", "Enterprise"];
const sortChoices = [
  { id: "relevance", label: "Relevanz" },
  { id: "rating", label: "Bewertung" },
  { id: "verified", label: "Verifizierte Daten" },
  { id: "price", label: "Preis (niedrig zuerst)" },
] as const;

function parsePrice(p: string): number {
  const m = p.match(/(\d+[\.,]?\d*)/);
  if (!m) return Number.POSITIVE_INFINITY;
  return parseFloat(m[1].replace(",", "."));
}

function Stars({ value }: { value: number }) {
  const full = Math.round(value);
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${value} von 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={
            i < full
              ? "size-3.5 fill-[#F5A623] text-[#F5A623]"
              : "size-3.5 text-foreground/25"
          }
        />
      ))}
      <span className="ml-1 text-xs font-semibold tabular-nums text-foreground/70">
        {value.toFixed(1)}
      </span>
    </span>
  );
}

export function KategoriePage({ data }: { data: CategoryData }) {
  const [query, setQuery] = useState("");
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [features, setFeatures] = useState<string[]>([]);
  const [sizes, setSizes] = useState<CategoryTool["size"][]>([]);
  const [dachOnly, setDachOnly] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sort, setSort] = useState<(typeof sortChoices)[number]["id"]>("relevance");
  const [filterOpen, setFilterOpen] = useState(false);

  const filteredOrganic = useMemo(() => {
    let list = [...data.organic];
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.desc.toLowerCase().includes(q) ||
          t.features.some((f) => f.toLowerCase().includes(q)),
      );
    }
    if (maxPrice != null) {
      list = list.filter((t) => parsePrice(t.price) <= maxPrice);
    }
    if (features.length) {
      list = list.filter((t) => features.every((f) => t.features.includes(f)));
    }
    if (sizes.length) {
      list = list.filter((t) => sizes.includes(t.size));
    }
    if (dachOnly) list = list.filter((t) => t.dachHosting);
    if (verifiedOnly) list = list.filter((t) => t.verified);

    switch (sort) {
      case "rating":
        list.sort((a, b) => b.rating - a.rating);
        break;
      case "verified":
        list.sort((a, b) => Number(b.verified) - Number(a.verified) || b.rating - a.rating);
        break;
      case "price":
        list.sort((a, b) => parsePrice(a.price) - parsePrice(b.price));
        break;
      default:
        // relevance: keep original order
        break;
    }
    return list;
  }, [data.organic, query, maxPrice, features, sizes, dachOnly, verifiedOnly, sort]);

  const toggle = <T,>(arr: T[], setArr: (v: T[]) => void, val: T) => {
    setArr(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);
  };

  const resetFilters = () => {
    setQuery("");
    setMaxPrice(null);
    setFeatures([]);
    setSizes([]);
    setDachOnly(false);
    setVerifiedOnly(false);
    setSort("relevance");
  };

  return (
    <div id="top" className="min-h-screen bg-[color:var(--paper)] text-foreground">
      <Nav />

      {/* Breadcrumb */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-6">
        <nav aria-label="Brotkrumen" className="text-sm text-foreground/60">
          <ol className="flex items-center gap-1.5 flex-wrap">
            <li>
              <a href="/verzeichnis" className="hover:text-foreground">Verzeichnis</a>
            </li>
            <li aria-hidden><ChevronRight className="size-3.5" /></li>
            <li>
              <a href={`/verzeichnis/${data.clusterSlug}`} className="hover:text-foreground">
                {data.clusterName}
              </a>
            </li>
            <li aria-hidden><ChevronRight className="size-3.5" /></li>
            <li className="text-foreground font-medium">{data.name}</li>
          </ol>
        </nav>
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 -z-10 opacity-70"
          style={{
            background: `radial-gradient(55% 45% at 15% 10%, ${data.color}22, transparent 60%)`,
          }}
        />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-10 pb-10 sm:pt-14 sm:pb-12">
          <Reveal>
            <span
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold uppercase tracking-wide shadow-soft"
              style={{ color: data.color }}
            >
              <Sparkles className="size-3.5" />
              Kategorie im Verzeichnis
            </span>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="mt-5 font-display text-4xl sm:text-5xl md:text-6xl font-semibold leading-[1.05] tracking-tight max-w-4xl">
              {data.h1}
            </h1>
          </Reveal>
          <Reveal delay={140}>
            <p className="mt-5 max-w-2xl text-lg text-foreground/70">{data.subline}</p>
          </Reveal>
          <Reveal delay={180}>
            <div className="mt-4 text-sm text-foreground/60">
              {data.organic.length + data.sponsored.length} Lösungen gelistet · {data.community.length} Community-Tools
            </div>
          </Reveal>

          <Reveal delay={220}>
            <div className="mt-6 max-w-2xl">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-foreground/50" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={`In ${data.name} suchen, z. B. QES, KI, KMU`}
                  className="w-full rounded-2xl border border-border bg-card pl-12 pr-4 py-4 text-base shadow-lift focus:outline-none focus:ring-2 focus:ring-primary/40"
                  aria-label={`In ${data.name} suchen`}
                />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Intro */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-10">
        <Reveal>
          <h2 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight">
            Was diese Kategorie umfasst
          </h2>
          <div className="mt-4 max-w-3xl space-y-3 text-foreground/80 leading-relaxed">
            {data.intro.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </Reveal>
      </section>

      {/* Transparenz-Hinweis */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-10">
        <Reveal>
          <div className="flex items-start gap-3 rounded-2xl border border-border bg-card px-4 py-3 text-sm text-foreground/80 shadow-soft">
            <Info className="size-5 shrink-0 mt-0.5 text-primary" />
            <p>
              So ordnen wir diese Seite: Das organische Ranking ist neutral und nicht käuflich. Gesponserte Plätze sind als solche markiert. Community-Tools sind gelistet, aber nicht geprüft.{" "}
              <a href="/badge" className="font-semibold text-primary hover:underline">
                Mehr zum Vertrauens-Badge
              </a>
              .
            </p>
          </div>
        </Reveal>
      </section>

      {/* Filter & Sortierung */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-8">
        <Reveal>
          <div className="rounded-3xl border border-border bg-card p-4 sm:p-5 shadow-soft">
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setFilterOpen((v) => !v)}
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-sm font-semibold sm:hidden"
              >
                <Filter className="size-4" />
                Filter
              </button>
              <div className="hidden sm:flex items-center gap-2 text-sm font-semibold">
                <SlidersHorizontal className="size-4 text-primary" />
                Filter
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-foreground/60">Sortieren nach</label>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as typeof sort)}
                  className="rounded-xl border border-border bg-background px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  {sortChoices.map((s) => (
                    <option key={s.id} value={s.id}>{s.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className={(filterOpen ? "block" : "hidden") + " sm:block mt-4"}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-foreground/60">
                    Preis bis (€/Nutzer)
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    {[null, 15, 30, 50].map((p) => (
                      <button
                        key={String(p)}
                        type="button"
                        onClick={() => setMaxPrice(p)}
                        className={
                          "rounded-full px-3 py-1.5 text-xs font-semibold border transition-colors " +
                          (maxPrice === p
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-background hover:bg-accent")
                        }
                      >
                        {p == null ? "Alle" : `≤ ${p}`}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-foreground/60">
                    Features
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {featureChoices.map((f) => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => toggle(features, setFeatures, f)}
                        className={
                          "rounded-full px-3 py-1.5 text-xs font-semibold border transition-colors " +
                          (features.includes(f)
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-background hover:bg-accent")
                        }
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-foreground/60">
                    Unternehmensgröße
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {sizeChoices.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => toggle(sizes, setSizes, s)}
                        className={
                          "rounded-full px-3 py-1.5 text-xs font-semibold border transition-colors " +
                          (sizes.includes(s)
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-background hover:bg-accent")
                        }
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-foreground/60">
                    Vertrauen
                  </div>
                  <div className="mt-2 flex flex-col gap-2 text-sm">
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={dachOnly}
                        onChange={(e) => setDachOnly(e.target.checked)}
                        className="size-4 rounded border-border accent-primary"
                      />
                      DACH-Hosting
                    </label>
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={verifiedOnly}
                        onChange={(e) => setVerifiedOnly(e.target.checked)}
                        className="size-4 rounded border-border accent-primary"
                      />
                      Nur verifiziert
                    </label>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between text-xs text-foreground/60">
                <span>Hinweis: Sortierung wirkt nur auf das organische Ranking, nie auf gesponserte Plätze.</span>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="inline-flex items-center gap-1 text-foreground/70 hover:text-foreground"
                >
                  <X className="size-3.5" /> Zurücksetzen
                </button>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Zone 1: Gesponsert */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-12">
        <Reveal>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-[#F5A623]/15 text-[#8a5d0e] px-2.5 py-1 text-xs font-bold uppercase tracking-wide">
                Gesponsert
              </span>
              <a href="/badge" className="text-xs text-foreground/60 hover:text-foreground underline-offset-2 hover:underline">
                Was heißt gesponsert?
              </a>
            </div>
          </div>
          <div
            className="mt-3 rounded-3xl p-4 sm:p-5"
            style={{
              background: "repeating-linear-gradient(135deg, rgba(245,166,35,0.06) 0 12px, transparent 12px 24px)",
              border: "1px dashed rgba(245,166,35,0.45)",
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {data.sponsored.map((s) => (
                <a
                  key={s.slug}
                  href={`/verzeichnis/${data.clusterSlug}/${data.slug}/tool/${s.slug}`}
                  className="group block rounded-2xl border border-border bg-card p-5 shadow-soft hover:shadow-lift hover:-translate-y-0.5 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className="grid size-12 place-items-center rounded-2xl font-display text-lg font-semibold shrink-0"
                        style={{ background: `${data.color}1A`, color: data.color }}
                        aria-hidden
                      >
                        {s.name.charAt(0)}
                      </span>
                      <div className="min-w-0">
                        <div className="font-display text-lg font-semibold truncate">{s.name}</div>
                        <div className="text-sm text-foreground/70 truncate">{s.highlight}</div>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#F5A623]/15 text-[#8a5d0e] px-2 py-1 text-xs font-bold uppercase shrink-0">
                      Gesponsert
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-foreground/70">{s.pitch}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold tabular-nums">{s.price}</div>
                      {s.priceNote && (
                        <div className="text-xs text-foreground/50">{s.priceNote}</div>
                      )}
                    </div>
                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                      Details <ArrowRight className="size-4" />
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* Zone 2: Organisches Ranking */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-16">
        <Reveal>
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight">
                Organisches Ranking
              </h2>
              <p className="mt-1 text-sm text-foreground/60">
                Neutral, unkäuflich. Sortiert nach den oben gewählten Kriterien.
              </p>
            </div>
            <span className="text-sm text-foreground/60 tabular-nums">
              {filteredOrganic.length} von {data.organic.length} Tools
            </span>
          </div>
        </Reveal>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredOrganic.map((t, i) => (
            <Reveal key={t.slug} delay={i * 25}>
              <a
                href={`/verzeichnis/${data.clusterSlug}/${data.slug}/tool/${t.slug}`}
                className="group block rounded-3xl border border-border bg-card p-5 shadow-soft hover:shadow-lift hover:-translate-y-0.5 transition-all h-full"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className="grid size-12 place-items-center rounded-2xl font-display text-lg font-semibold shrink-0"
                      style={{ background: `${data.color}1A`, color: data.color }}
                      aria-hidden
                    >
                      {t.name.charAt(0)}
                    </span>
                    <div className="min-w-0">
                      <div className="font-display text-lg font-semibold truncate">{t.name}</div>
                      <Stars value={t.rating} />
                      <div className="text-xs text-foreground/55">{t.reviewCount} Bewertungen</div>
                    </div>
                  </div>
                  {t.verified && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[color:var(--success)]/15 text-[color:var(--success)] px-2 py-1 text-xs font-semibold shrink-0">
                      <ShieldCheck className="size-3.5" />
                      Verifiziert
                    </span>
                  )}
                </div>
                <p className="mt-3 text-sm text-foreground/70 line-clamp-2">{t.desc}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {t.features.slice(0, 3).map((f) => (
                    <span
                      key={f}
                      className="inline-flex items-center rounded-full bg-muted text-foreground/80 px-2 py-0.5 text-xs font-semibold"
                    >
                      {f}
                    </span>
                  ))}
                  {t.dachHosting && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary px-2 py-0.5 text-xs font-semibold">
                      <Globe2 className="size-3" /> DACH
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 rounded-full bg-background border border-border px-2 py-0.5 text-xs font-semibold text-foreground/70">
                    <Users className="size-3" /> {t.size}
                  </span>
                </div>
                <div className="mt-4 flex items-end justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold tabular-nums truncate">{t.price}</div>
                    {t.priceNote && (
                      <div className="text-xs text-foreground/50">{t.priceNote}</div>
                    )}
                  </div>
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    Details <ArrowRight className="size-4" />
                  </span>
                </div>
              </a>
            </Reveal>
          ))}
          {filteredOrganic.length === 0 && (
            <div className="col-span-full rounded-3xl border border-dashed border-border bg-card p-8 text-center text-foreground/60">
              Keine Tools für deine Auswahl. Setze Filter zurück oder probiere einen anderen Begriff.
            </div>
          )}
        </div>
      </section>

      {/* Zone 3: Community-Tools */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-16">
        <Reveal>
          <div className="rounded-3xl border border-dashed border-border bg-background/40 p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-muted text-foreground/70 px-2.5 py-1 text-xs font-bold uppercase tracking-wide">
                  Community-Tools
                </div>
                <h2 className="mt-3 font-display text-2xl sm:text-3xl font-semibold tracking-tight">
                  Gelistet, aber nicht geprüft
                </h2>
                <p className="mt-2 max-w-2xl text-sm text-foreground/70">
                  Diese Tools stammen häufig von kleinen Anbietern oder Indie-Entwicklern. Sie sind hier gelistet, tragen aber kein Vertrauens-Badge.{" "}
                  <a href="/badge" className="font-semibold text-primary hover:underline">
                    Was prüfen wir?
                  </a>
                </p>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.community.map((c) => (
                <a
                  key={c.slug}
                  href={`/verzeichnis/${data.clusterSlug}/${data.slug}/tool/${c.slug}`}
                  className="group block rounded-2xl border border-border bg-card p-4 hover:shadow-soft hover:-translate-y-0.5 transition-all"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-display text-base font-semibold truncate">{c.name}</div>
                    <span className="inline-flex items-center rounded-full bg-muted text-foreground/70 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide shrink-0">
                      Community-Tool
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-foreground/70 line-clamp-2">{c.desc}</p>
                  <div className="mt-3 flex items-center justify-between text-xs text-foreground/55">
                    <span>{c.author}</span>
                    <span className="inline-flex items-center gap-1 font-semibold text-foreground/70 group-hover:text-primary">
                      Details <ArrowRight className="size-3.5" />
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* Verwandte Vergleiche / Kategorien */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-16">
        <Reveal>
          <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight">
            Verwandte Vergleiche und Kategorien
          </h2>
          <p className="mt-2 text-foreground/70 max-w-2xl">
            Weiter stöbern in benachbarten Bereichen rund um Verträge, Signatur und Dokumente.
          </p>
        </Reveal>
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.related.map((r, i) => (
            <Reveal key={r.href} delay={i * 30}>
              <a
                href={r.href}
                className="group block rounded-2xl border border-border bg-card p-5 shadow-soft hover:shadow-lift hover:-translate-y-0.5 transition-all h-full"
              >
                <span className="inline-block rounded-full bg-muted text-foreground/70 px-2 py-0.5 text-xs font-semibold">
                  {r.tag}
                </span>
                <div className="mt-3 font-display text-lg font-semibold">{r.title}</div>
                <div className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  Öffnen <ArrowRight className="size-4" />
                </div>
              </a>
            </Reveal>
          ))}
        </div>
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

      {/* Tracker-Brücke */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-20">
        <Reveal>
          <div
            className="relative overflow-hidden rounded-3xl p-8 sm:p-12 text-primary-foreground"
            style={{
              background: `linear-gradient(135deg, ${data.color} 0%, #5849c4 60%, #FF7A66 130%)`,
            }}
          >
            <div className="relative z-10 max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur px-3 py-1 text-xs font-semibold uppercase tracking-wide">
                <BellRing className="size-3.5" />
                Fristen-Wächter
              </div>
              <h2 className="mt-4 font-display text-3xl sm:text-4xl font-semibold leading-tight">
                Tool ausgewählt? Behalte Fristen und Kosten mit Toolfolio im Griff.
              </h2>
              <p className="mt-3 text-primary-foreground/85">
                Verträge, Abos und Kündigungsfristen an einem Ort. Mit verifizierten Preisen, die direkt zurück ins Verzeichnis fließen.
              </p>
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
                  So funktioniert Toolfolio
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

      <Footer />
    </div>
  );
}
