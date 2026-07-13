import { useMemo, useState } from "react";
import {
  Search,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Info,
  SlidersHorizontal,
  Star,
  Users,
  BellRing,
  Globe2,
  Sparkles,
  X,
  Zap,
  TrendingUp,
  Circle,
  ArrowUpRight,
  Command,
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
  rating: number;
  reviewCount: number;
  features: string[];
  size: "Solo" | "KMU" | "Mittelstand" | "Enterprise";
  dachHosting: boolean;
  verified: boolean;
};

export type SponsoredTool = {
  slug: string;
  name: string;
  pitch: string;
  highlight: string;
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
  name: string;
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
    { slug: "inhubber", name: "Inhubber", desc: "Vertragsmanagement mit KI-Auslesung, Fristen-Tracking und Berichten, klar auf den DACH-Raum zugeschnitten.", price: "ab 14,99 € pro Nutzer", priceNote: "[verifizieren]", rating: 4.6, reviewCount: 84, features: ["KI-Analyse", "Fristen", "DACH"], size: "KMU", dachHosting: true, verified: true },
    { slug: "contracthero", name: "ContractHero", desc: "CLM für Mittelstand und KMU mit Workflows, E-Signatur-Integration und übersichtlichem Reporting.", price: "Preis auf Anfrage", priceNote: "[verifizieren]", rating: 4.5, reviewCount: 62, features: ["Workflows", "E-Signatur", "Reporting"], size: "Mittelstand", dachHosting: true, verified: true },
    { slug: "paperless", name: "Paperless", desc: "Digitale Vertragsabwicklung mit Vorlagen und E-Signatur, Fokus auf schnelle Abschlüsse.", price: "ab 149,00 € pro Monat", priceNote: "[verifizieren]", rating: 4.3, reviewCount: 47, features: ["E-Signatur", "Vorlagen"], size: "KMU", dachHosting: false, verified: true },
    { slug: "skribble", name: "Skribble", desc: "Schweizer Signaturdienst mit SES, AES und QES nach eIDAS und ZertES.", price: "ab 9,00 € pro Nutzer", priceNote: "[verifizieren]", rating: 4.7, reviewCount: 138, features: ["QES", "E-Signatur", "DACH"], size: "Solo", dachHosting: true, verified: true },
    { slug: "agorum-core", name: "agorum core", desc: "DMS- und ECM-Plattform aus Deutschland, ausbaubar zum vollwertigen Vertragsmanagement.", price: "ab 30,00 € pro Nutzer", priceNote: "[verifizieren]", rating: 4.2, reviewCount: 29, features: ["DMS", "Workflows", "DACH"], size: "Mittelstand", dachHosting: true, verified: true },
    { slug: "otris-software", name: "otris software", desc: "Enterprise-Lösung für Vertragsmanagement und Legal Operations mit modularen Workflows.", price: "Preis auf Anfrage", priceNote: "[verifizieren]", rating: 4.4, reviewCount: 18, features: ["Enterprise", "Workflows", "DACH"], size: "Enterprise", dachHosting: true, verified: true },
    { slug: "contractbook", name: "Contractbook", desc: "CLM mit Automationen, Vorlagen und vielen Integrationen, internationaler Anbieter.", price: "Preis auf Anfrage", priceNote: "[verifizieren]", rating: 4.1, reviewCount: 56, features: ["Automation", "Integrationen"], size: "KMU", dachHosting: false, verified: true },
    { slug: "dilitrust-suite", name: "DiliTrust Suite", desc: "Modulare Legal-Tech-Suite für Vertrags-, Gesellschafts- und Compliance-Themen.", price: "Preis auf Anfrage", priceNote: "[verifizieren]", rating: 4.0, reviewCount: 22, features: ["Enterprise", "Compliance"], size: "Enterprise", dachHosting: true, verified: true },
  ],
  community: [
    { slug: "contrax", name: "Contrax", desc: "Schlanke Open-Source-Vertragsablage für Indie-Teams.", author: "Indie-Projekt" },
    { slug: "klauselbox", name: "Klauselbox", desc: "Community-Sammlung von Vertragsklauseln mit einfacher Vorlagen-Engine.", author: "Community" },
    { slug: "fristik", name: "Fristik", desc: "Minimaler Fristen-Tracker für Solo-Selbstständige, in Beta.", author: "Indie-Entwickler" },
  ],
  related: [
    { title: "E-Signatur (SES, AES, QES)", href: "/verzeichnis/vertragsmanagement-software/e-signatur", tag: "Kategorie" },
    { title: "KI-Vertragsanalyse", href: "/verzeichnis/vertragsmanagement-software/ki-vertragsanalyse", tag: "Kategorie" },
    { title: "Dokumentenmanagement (DMS)", href: "/verzeichnis/vertragsmanagement-software/dms", tag: "Kategorie" },
    { title: "Vertragsmanagement für KMU", href: "/verzeichnis#collection-clm-kmu", tag: "Vergleich" },
    { title: "Tools mit QES", href: "/verzeichnis#collection-qes", tag: "Vergleich" },
  ],
  faqs: [
    { q: "Wie ordnet Toolfolio diese Liste?", a: "Wir trennen drei Zonen sichtbar: Gesponserte Plätze sind als solche markiert. Das organische Ranking ist neutral und nach echten Kriterien wie Bewertung, Funktionsumfang und verifizierten Daten sortiert. Community-Tools stehen abgesetzt darunter und sind als nicht geprüft gekennzeichnet." },
    { q: "Kann man sich nach oben kaufen?", a: "Nein. Im organischen Ranking ist Sichtbarkeit nicht käuflich. Bezahlte Sichtbarkeit gibt es ausschließlich auf den gesponserten Plätzen, die immer als gesponsert gekennzeichnet sind. Bewertungen und verifizierte Preisdaten sind nie käuflich." },
    { q: "Was ist ein Community-Tool?", a: "Community-Tools sind gelistet, aber nicht von uns geprüft. Sie stammen häufig von kleinen Anbietern oder Indie-Entwicklern. Sie tragen kein Vertrauens-Badge und stehen klar abgesetzt vom organischen Ranking." },
    { q: "Was kostet Vertragsmanagement-Software?", a: "Die Preise reichen je nach Funktionsumfang von rund 10 € pro Nutzer und Monat bis weit in den dreistelligen Bereich für Enterprise-Suiten. Plane neben dem Lizenzpreis Aufwände für Einführung und Schulung ein." },
  ],
};

const featureChoices = ["QES", "KI-Analyse", "Fristen", "E-Signatur", "DMS", "Workflows"];
const sizeChoices: CategoryTool["size"][] = ["Solo", "KMU", "Mittelstand", "Enterprise"];
const sortChoices = [
  { id: "relevance", label: "Relevanz" },
  { id: "rating", label: "Bewertung" },
  { id: "verified", label: "Verifiziert" },
  { id: "price", label: "Preis ↑" },
] as const;

function parsePrice(p: string): number {
  const m = p.match(/(\d+[.,]?\d*)/);
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
              ? "size-3 fill-[#F5A623] text-[#F5A623]"
              : "size-3 text-foreground/20"
          }
        />
      ))}
      <span className="ml-1 text-[11px] font-semibold tabular-nums text-foreground/70">
        {value.toFixed(1)}
      </span>
    </span>
  );
}

// Small stat pill
function Stat({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="rounded-xl border border-border/70 bg-card/60 px-3 py-2 backdrop-blur">
      <div className="text-[10px] font-semibold uppercase tracking-widest text-foreground/50">{label}</div>
      <div className="mt-0.5 font-display text-base font-semibold tabular-nums" style={accent ? { color: accent } : undefined}>{value}</div>
    </div>
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
    if (maxPrice != null) list = list.filter((t) => parsePrice(t.price) <= maxPrice);
    if (features.length) list = list.filter((t) => features.every((f) => t.features.includes(f)));
    if (sizes.length) list = list.filter((t) => sizes.includes(t.size));
    if (dachOnly) list = list.filter((t) => t.dachHosting);
    if (verifiedOnly) list = list.filter((t) => t.verified);

    switch (sort) {
      case "rating": list.sort((a, b) => b.rating - a.rating); break;
      case "verified": list.sort((a, b) => Number(b.verified) - Number(a.verified) || b.rating - a.rating); break;
      case "price": list.sort((a, b) => parsePrice(a.price) - parsePrice(b.price)); break;
      default: break;
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

  // KPIs derived from data
  const avgRating = (data.organic.reduce((s, t) => s + t.rating, 0) / data.organic.length).toFixed(1);
  const dachCount = data.organic.filter((t) => t.dachHosting).length;
  const verifiedCount = data.organic.filter((t) => t.verified).length;
  const activeFilters =
    (maxPrice != null ? 1 : 0) + features.length + sizes.length + (dachOnly ? 1 : 0) + (verifiedOnly ? 1 : 0);

  return (
    <div id="top" className="min-h-screen bg-[color:var(--paper)] text-foreground">
      <Nav />

      {/* Breadcrumb */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-6">
        <nav aria-label="Brotkrumen" className="text-xs sm:text-sm text-foreground/55">
          <ol className="flex items-center gap-1.5 flex-wrap">
            <li><a href="/verzeichnis" className="hover:text-foreground">Verzeichnis</a></li>
            <li aria-hidden><ChevronRight className="size-3.5" /></li>
            <li><a href={`/verzeichnis/${data.clusterSlug}`} className="hover:text-foreground">{data.clusterName}</a></li>
            <li aria-hidden><ChevronRight className="size-3.5" /></li>
            <li className="text-foreground font-medium">{data.name}</li>
          </ol>
        </nav>
      </div>

      {/* Hero — split layout with data widget */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 -z-10"
          style={{
            background: `radial-gradient(60% 55% at 12% 10%, ${data.color}22, transparent 65%), radial-gradient(45% 45% at 95% 5%, #FF7A6614, transparent 60%)`,
          }}
        />
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 -z-10 h-full opacity-[0.15]"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(31,29,43,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(31,29,43,0.08) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
            maskImage: "linear-gradient(to bottom, black 30%, transparent 100%)",
          }}
        />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-8 pb-12 sm:pt-12 sm:pb-16">
          <div className="grid lg:grid-cols-[1.35fr_1fr] gap-10 lg:gap-14 items-end">
            <div>
              <Reveal>
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-[11px] font-semibold uppercase tracking-widest shadow-soft"
                    style={{ color: data.color }}
                  >
                    <Sparkles className="size-3.5" />
                    Kategorie
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-foreground/[0.04] px-2.5 py-1 text-[11px] font-semibold text-foreground/60">
                    <Circle className="size-1.5 fill-[color:var(--success)] text-[color:var(--success)]" />
                    Live-Verzeichnis · zuletzt aktualisiert heute
                  </span>
                </div>
              </Reveal>
              <Reveal delay={80}>
                <h1 className="mt-5 font-display text-4xl sm:text-5xl md:text-6xl font-semibold leading-[1.02] tracking-tight max-w-3xl">
                  {data.h1}
                </h1>
              </Reveal>
              <Reveal delay={140}>
                <p className="mt-5 max-w-2xl text-base sm:text-lg text-foreground/70 leading-relaxed">
                  {data.subline}
                </p>
              </Reveal>

              <Reveal delay={200}>
                <div className="mt-7 max-w-2xl">
                  <div className="relative group">
                    <div
                      aria-hidden
                      className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity"
                      style={{ background: `linear-gradient(135deg, ${data.color}, #FF7A66)`, filter: "blur(14px)" }}
                    />
                    <div className="relative flex items-center gap-2 rounded-2xl border border-border bg-card pl-4 pr-2 py-2 shadow-lift">
                      <Search className="size-5 text-foreground/50 shrink-0" />
                      <input
                        type="search"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={`In ${data.name} suchen · z. B. QES, KI, KMU`}
                        className="w-full bg-transparent py-2.5 text-base focus:outline-none placeholder:text-foreground/45"
                        aria-label={`In ${data.name} suchen`}
                      />
                      <kbd className="hidden sm:inline-flex items-center gap-1 rounded-lg border border-border bg-background px-2 py-1 text-[10px] font-semibold text-foreground/50">
                        <Command className="size-3" /> K
                      </kbd>
                      <a
                        href="#ranking"
                        className="inline-flex items-center gap-1 rounded-xl bg-foreground text-[color:var(--paper)] px-3.5 py-2 text-sm font-semibold hover:opacity-90 transition-opacity"
                      >
                        Vergleichen <ArrowRight className="size-4" />
                      </a>
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>

            {/* Data widget */}
            <Reveal delay={240}>
              <div className="relative rounded-3xl border border-border bg-card p-5 sm:p-6 shadow-lift">
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-foreground/50">
                    <Zap className="size-3.5" style={{ color: data.color }} />
                    Kategorie-Snapshot
                  </div>
                  <span className="text-[10px] font-mono text-foreground/40">/{data.slug}</span>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2.5">
                  <Stat label="Anbieter" value={String(data.organic.length + data.sponsored.length)} />
                  <Stat label="Ø Bewertung" value={avgRating} accent={data.color} />
                  <Stat label="DACH-Hosting" value={`${dachCount}/${data.organic.length}`} />
                  <Stat label="Verifiziert" value={`${verifiedCount}/${data.organic.length}`} accent="#12B76A" />
                </div>

                <div className="mt-4 rounded-2xl bg-foreground text-[color:var(--paper)] p-4">
                  <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest opacity-70">
                    <TrendingUp className="size-3.5" /> Marktsignal
                  </div>
                  <div className="mt-1.5 text-sm leading-snug">
                    Nachfrage nach <span className="font-semibold" style={{ color: "#FF7A66" }}>KI-Analyse</span> und
                    <span className="font-semibold text-white"> QES</span> steigt in dieser Kategorie.
                  </div>
                  {/* mini sparkline */}
                  <svg viewBox="0 0 200 40" className="mt-3 w-full h-9" aria-hidden>
                    <defs>
                      <linearGradient id="spark" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#FF7A66" stopOpacity="0.6" />
                        <stop offset="100%" stopColor="#FF7A66" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path d="M0,30 L20,28 L40,26 L60,24 L80,22 L100,18 L120,20 L140,14 L160,10 L180,12 L200,6 L200,40 L0,40 Z" fill="url(#spark)" />
                    <path d="M0,30 L20,28 L40,26 L60,24 L80,22 L100,18 L120,20 L140,14 L160,10 L180,12 L200,6" fill="none" stroke="#FF7A66" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Sub-nav / anchors */}
      <div className="sticky top-16 z-30 border-y border-border/70 bg-[color:var(--paper)]/85 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex items-center gap-1 overflow-x-auto py-2 text-sm">
            {[
              { id: "einordnung", label: "Einordnung" },
              { id: "gesponsert", label: "Gesponsert" },
              { id: "ranking", label: "Ranking" },
              { id: "community", label: "Community" },
              { id: "verwandt", label: "Verwandt" },
              { id: "faq", label: "FAQ" },
            ].map((a) => (
              <a
                key={a.id}
                href={`#${a.id}`}
                className="shrink-0 rounded-full px-3 py-1.5 text-foreground/60 hover:text-foreground hover:bg-foreground/[0.05] font-medium"
              >
                {a.label}
              </a>
            ))}
            <div className="ml-auto hidden md:flex items-center gap-2 text-xs text-foreground/50">
              <ShieldCheck className="size-3.5" style={{ color: data.color }} />
              Neutral, unabhängig, mit verifizierten Daten
            </div>
          </div>
        </div>
      </div>

      {/* Intro + Trust in one row */}
      <section id="einordnung" className="scroll-mt-32 mx-auto max-w-7xl px-4 sm:px-6 pt-12 pb-10">
        <div className="grid lg:grid-cols-[1.4fr_1fr] gap-8">
          <Reveal>
            <div className="text-[11px] font-semibold uppercase tracking-widest text-foreground/50">
              Einordnung
            </div>
            <h2 className="mt-2 font-display text-2xl sm:text-3xl font-semibold tracking-tight">
              Was diese Kategorie umfasst
            </h2>
            <div className="mt-4 max-w-3xl space-y-3 text-foreground/75 leading-relaxed">
              {data.intro.map((p, i) => <p key={i}>{p}</p>)}
            </div>
          </Reveal>
          <Reveal delay={100}>
            <div className="rounded-3xl border border-border bg-gradient-to-br from-card to-[color:var(--accent)]/40 p-5 shadow-soft">
              <div className="flex items-start gap-3">
                <div className="grid size-10 place-items-center rounded-2xl bg-primary/10 text-primary shrink-0">
                  <Info className="size-5" />
                </div>
                <div>
                  <div className="font-display text-base font-semibold">
                    So ordnen wir diese Seite
                  </div>
                  <p className="mt-1.5 text-sm text-foreground/70 leading-relaxed">
                    Organisches Ranking ist neutral und nicht käuflich. Gesponserte Plätze sind sichtbar markiert. Community-Tools sind gelistet, aber nicht geprüft.
                  </p>
                  <a href="/badge" className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
                    Mehr zum Vertrauens-Badge <ArrowUpRight className="size-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Filter & Sortierung */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-8">
        <Reveal>
          <div className="rounded-3xl border border-border bg-card shadow-soft overflow-hidden">
            <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3 border-b border-border/70 bg-background/40">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <SlidersHorizontal className="size-4 text-primary" />
                Filter
                {activeFilters > 0 && (
                  <span className="ml-1 inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold px-1.5 min-w-[18px] h-[18px]">
                    {activeFilters}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setFilterOpen((v) => !v)}
                  className="ml-2 sm:hidden text-xs font-semibold text-primary underline-offset-2 hover:underline"
                >
                  {filterOpen ? "Ausblenden" : "Anzeigen"}
                </button>
              </div>
              <div className="flex items-center gap-2">
                {activeFilters > 0 && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-foreground/60 hover:text-foreground"
                  >
                    <X className="size-3.5" /> Zurücksetzen
                  </button>
                )}
                <label className="text-xs font-semibold text-foreground/60">Sortierung</label>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as typeof sort)}
                  className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  {sortChoices.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
              </div>
            </div>

            <div className={(filterOpen ? "block" : "hidden") + " sm:block px-4 sm:px-5 py-4"}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-widest text-foreground/50">Preis bis €/Nutzer</div>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    {[null, 15, 30, 50].map((p) => (
                      <button
                        key={String(p)}
                        type="button"
                        onClick={() => setMaxPrice(p)}
                        className={
                          "rounded-lg px-2.5 py-1.5 text-xs font-semibold border transition-all " +
                          (maxPrice === p
                            ? "border-foreground bg-foreground text-[color:var(--paper)]"
                            : "border-border bg-background hover:border-foreground/40")
                        }
                      >
                        {p == null ? "Alle" : `≤ ${p} €`}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-widest text-foreground/50">Features</div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {featureChoices.map((f) => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => toggle(features, setFeatures, f)}
                        className={
                          "rounded-lg px-2.5 py-1.5 text-xs font-semibold border transition-all " +
                          (features.includes(f)
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border bg-background hover:border-foreground/40")
                        }
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-widest text-foreground/50">Unternehmensgröße</div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {sizeChoices.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => toggle(sizes, setSizes, s)}
                        className={
                          "rounded-lg px-2.5 py-1.5 text-xs font-semibold border transition-all " +
                          (sizes.includes(s)
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border bg-background hover:border-foreground/40")
                        }
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-widest text-foreground/50">Vertrauen</div>
                  <div className="mt-2 flex flex-col gap-1.5 text-sm">
                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={dachOnly} onChange={(e) => setDachOnly(e.target.checked)} className="size-4 rounded border-border accent-primary" />
                      <span className="inline-flex items-center gap-1"><Globe2 className="size-3.5 text-primary" /> DACH-Hosting</span>
                    </label>
                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={verifiedOnly} onChange={(e) => setVerifiedOnly(e.target.checked)} className="size-4 rounded border-border accent-primary" />
                      <span className="inline-flex items-center gap-1"><ShieldCheck className="size-3.5 text-[color:var(--success)]" /> Nur verifiziert</span>
                    </label>
                  </div>
                </div>
              </div>
              <div className="mt-4 text-[11px] text-foreground/50">
                Hinweis: Sortierung wirkt nur auf das organische Ranking, nie auf gesponserte Plätze.
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Zone 1: Gesponsert */}
      <section id="gesponsert" className="scroll-mt-32 mx-auto max-w-7xl px-4 sm:px-6 pb-14">
        <Reveal>
          <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-center gap-1 rounded-md bg-[#F5A623]/15 text-[#8a5d0e] px-2 py-1 text-[10px] font-bold uppercase tracking-widest">
                Gesponsert
              </span>
              <span className="text-[11px] text-foreground/50 uppercase tracking-widest font-semibold">Featured Partner</span>
            </div>
            <a href="/badge" className="text-xs text-foreground/60 hover:text-foreground inline-flex items-center gap-1">
              Was heißt gesponsert? <ArrowUpRight className="size-3" />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.sponsored.map((s) => (
              <a
                key={s.slug}
                href={`/verzeichnis/${data.clusterSlug}/${data.slug}/tool/${s.slug}`}
                className="group relative block overflow-hidden rounded-3xl border border-[#F5A623]/40 bg-card shadow-lift hover:-translate-y-0.5 transition-all"
              >
                <div
                  aria-hidden
                  className="absolute inset-x-0 top-0 h-1"
                  style={{ background: `linear-gradient(90deg, ${data.color}, #F5A623, #FF7A66)` }}
                />
                <div className="p-5 sm:p-6">
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
                    <span className="inline-flex items-center gap-1 rounded-md bg-[#F5A623]/15 text-[#8a5d0e] px-2 py-1 text-[10px] font-bold uppercase tracking-wider shrink-0">
                      Gesponsert
                    </span>
                  </div>
                  <p className="mt-4 text-sm text-foreground/70 leading-relaxed">{s.pitch}</p>
                  <div className="mt-5 flex items-end justify-between pt-4 border-t border-border/70">
                    <div className="min-w-0">
                      <div className="text-[10px] font-semibold uppercase tracking-widest text-foreground/50">Preis</div>
                      <div className="mt-0.5 text-base font-semibold tabular-nums">{s.price}</div>
                      {s.priceNote && <div className="text-[11px] text-foreground/50">{s.priceNote}</div>}
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-xl bg-foreground text-[color:var(--paper)] px-3.5 py-2 text-sm font-semibold group-hover:opacity-90">
                      Zum Anbieter <ArrowRight className="size-4" />
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </Reveal>
      </section>

      {/* Zone 2: Organisches Ranking */}
      <section id="ranking" className="scroll-mt-32 mx-auto max-w-7xl px-4 sm:px-6 pb-16">
        <Reveal>
          <div className="flex items-end justify-between gap-4 flex-wrap mb-6">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-widest text-foreground/50">Zone 02</div>
              <h2 className="mt-1 font-display text-3xl sm:text-4xl font-semibold tracking-tight">
                Organisches Ranking
              </h2>
              <p className="mt-1 text-sm text-foreground/60">
                Neutral, unkäuflich · sortiert nach {sortChoices.find((s) => s.id === sort)?.label}
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-sm">
              <span className="tabular-nums font-semibold">{filteredOrganic.length}</span>
              <span className="text-foreground/50">von {data.organic.length} Tools</span>
            </div>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOrganic.map((t, i) => (
            <Reveal key={t.slug} delay={i * 25}>
              <a
                href={`/verzeichnis/${data.clusterSlug}/${data.slug}/tool/${t.slug}`}
                className="group relative flex flex-col h-full rounded-3xl border border-border bg-card p-5 hover:shadow-lift hover:-translate-y-0.5 hover:border-foreground/20 transition-all"
              >
                {/* Rank chip */}
                <div className="absolute top-4 right-4 grid size-7 place-items-center rounded-lg bg-foreground/[0.04] text-[11px] font-mono font-bold tabular-nums text-foreground/50 group-hover:bg-foreground group-hover:text-[color:var(--paper)] transition-colors">
                  {String(i + 1).padStart(2, "0")}
                </div>

                <div className="flex items-start gap-3 pr-10">
                  <span
                    className="grid size-11 place-items-center rounded-2xl font-display text-base font-semibold shrink-0"
                    style={{ background: `${data.color}18`, color: data.color }}
                    aria-hidden
                  >
                    {t.name.charAt(0)}
                  </span>
                  <div className="min-w-0">
                    <div className="font-display text-lg font-semibold truncate">{t.name}</div>
                    <div className="mt-0.5 flex items-center gap-2">
                      <Stars value={t.rating} />
                      <span className="text-[11px] text-foreground/50">· {t.reviewCount}</span>
                    </div>
                  </div>
                </div>

                <p className="mt-3 text-[13px] text-foreground/70 leading-relaxed line-clamp-2">{t.desc}</p>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {t.features.slice(0, 3).map((f) => (
                    <span
                      key={f}
                      className="inline-flex items-center rounded-md bg-foreground/[0.05] text-foreground/75 px-1.5 py-0.5 text-[11px] font-semibold"
                    >
                      {f}
                    </span>
                  ))}
                  <span className="inline-flex items-center gap-1 rounded-md bg-background border border-border px-1.5 py-0.5 text-[11px] font-semibold text-foreground/60">
                    <Users className="size-3" /> {t.size}
                  </span>
                </div>

                <div className="mt-auto pt-4 flex items-end justify-between gap-2 border-t border-border/60 mt-4">
                  <div className="min-w-0">
                    <div className="text-[10px] font-semibold uppercase tracking-widest text-foreground/50">Preis</div>
                    <div className="text-sm font-semibold tabular-nums truncate">{t.price}</div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <div className="flex items-center gap-1">
                      {t.dachHosting && (
                        <span title="DACH-Hosting" className="inline-flex items-center rounded-md bg-primary/10 text-primary px-1.5 py-0.5 text-[10px] font-bold">
                          <Globe2 className="size-3 mr-0.5" /> DACH
                        </span>
                      )}
                      {t.verified && (
                        <span title="Verifiziert" className="inline-flex items-center rounded-md bg-[color:var(--success)]/12 text-[color:var(--success)] px-1.5 py-0.5 text-[10px] font-bold">
                          <ShieldCheck className="size-3 mr-0.5" /> V
                        </span>
                      )}
                    </div>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-foreground/50 group-hover:text-primary transition-colors">
                      Details <ArrowRight className="size-3.5" />
                    </span>
                  </div>
                </div>
              </a>
            </Reveal>
          ))}
          {filteredOrganic.length === 0 && (
            <div className="col-span-full rounded-3xl border border-dashed border-border bg-card p-10 text-center">
              <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-foreground/5 text-foreground/50">
                <Search className="size-5" />
              </div>
              <div className="mt-3 font-display text-lg font-semibold">Keine Treffer</div>
              <div className="mt-1 text-sm text-foreground/60">Setze Filter zurück oder probiere einen anderen Begriff.</div>
              <button
                type="button"
                onClick={resetFilters}
                className="mt-4 inline-flex items-center gap-1 rounded-xl bg-foreground text-[color:var(--paper)] px-4 py-2 text-sm font-semibold hover:opacity-90"
              >
                <X className="size-3.5" /> Filter zurücksetzen
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Zone 3: Community */}
      <section id="community" className="scroll-mt-32 mx-auto max-w-7xl px-4 sm:px-6 pb-16">
        <Reveal>
          <div className="rounded-3xl border border-dashed border-border bg-[color:var(--paper)] p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-widest text-foreground/50">Zone 03</div>
                <div className="mt-1 inline-flex items-center gap-1.5 rounded-md bg-foreground/[0.06] text-foreground/70 px-2 py-1 text-[10px] font-bold uppercase tracking-wider">
                  Community-Tools
                </div>
                <h2 className="mt-3 font-display text-2xl sm:text-3xl font-semibold tracking-tight">
                  Gelistet, aber nicht geprüft
                </h2>
                <p className="mt-2 max-w-2xl text-sm text-foreground/70 leading-relaxed">
                  Diese Tools stammen häufig von kleinen Anbietern oder Indie-Entwicklern. Sie sind hier gelistet, tragen aber kein Vertrauens-Badge.{" "}
                  <a href="/badge" className="font-semibold text-primary hover:underline">Was prüfen wir?</a>
                </p>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {data.community.map((c) => (
                <a
                  key={c.slug}
                  href={`/verzeichnis/${data.clusterSlug}/${data.slug}/tool/${c.slug}`}
                  className="group block rounded-2xl border border-border bg-card p-4 hover:shadow-soft hover:-translate-y-0.5 transition-all"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-display text-base font-semibold truncate">{c.name}</div>
                    <span className="inline-flex items-center rounded-md bg-foreground/[0.05] text-foreground/60 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider shrink-0">
                      Community
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-foreground/70 line-clamp-2 leading-relaxed">{c.desc}</p>
                  <div className="mt-3 flex items-center justify-between text-xs text-foreground/50">
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

      {/* Verwandt */}
      <section id="verwandt" className="scroll-mt-32 mx-auto max-w-7xl px-4 sm:px-6 pb-16">
        <Reveal>
          <div className="text-[11px] font-semibold uppercase tracking-widest text-foreground/50">Weiter stöbern</div>
          <h2 className="mt-1 font-display text-3xl sm:text-4xl font-semibold tracking-tight">
            Verwandte Vergleiche und Kategorien
          </h2>
        </Reveal>
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {data.related.map((r, i) => (
            <Reveal key={r.href} delay={i * 30}>
              <a
                href={r.href}
                className="group flex items-start gap-3 rounded-2xl border border-border bg-card p-4 hover:shadow-soft hover:-translate-y-0.5 hover:border-foreground/20 transition-all h-full"
              >
                <span className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary shrink-0">
                  <ArrowUpRight className="size-4" />
                </span>
                <div className="min-w-0">
                  <span className="inline-block rounded-md bg-foreground/[0.05] text-foreground/60 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                    {r.tag}
                  </span>
                  <div className="mt-1.5 font-display text-base font-semibold leading-tight">{r.title}</div>
                </div>
              </a>
            </Reveal>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="scroll-mt-32 mx-auto max-w-4xl px-4 sm:px-6 pb-16">
        <Reveal>
          <div className="text-[11px] font-semibold uppercase tracking-widest text-foreground/50 text-center">FAQ</div>
          <h2 className="mt-1 font-display text-3xl sm:text-4xl font-semibold tracking-tight text-center">
            Häufige Fragen
          </h2>
        </Reveal>
        <Reveal delay={80}>
          <div className="mt-8 rounded-3xl border border-border bg-card shadow-soft overflow-hidden">
            <Accordion type="single" collapsible className="w-full">
              {data.faqs.map((f, i) => (
                <AccordionItem key={i} value={`faq-${i}`} className="border-border">
                  <AccordionTrigger className="text-left font-display text-base font-semibold px-5 py-4 hover:no-underline">
                    {f.q}
                  </AccordionTrigger>
                  <AccordionContent className="px-5 pb-4 text-foreground/75 leading-relaxed">
                    {f.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </Reveal>
      </section>

      {/* Tracker CTA */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-20">
        <Reveal>
          <div
            className="relative overflow-hidden rounded-[32px] p-8 sm:p-14 text-primary-foreground"
            style={{ background: `linear-gradient(135deg, ${data.color} 0%, #5849c4 55%, #FF7A66 135%)` }}
          >
            <div
              aria-hidden
              className="absolute inset-0 opacity-[0.12]"
              style={{
                backgroundImage:
                  "linear-gradient(to right, rgba(255,255,255,0.35) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.35) 1px, transparent 1px)",
                backgroundSize: "40px 40px",
                maskImage: "radial-gradient(70% 70% at 30% 40%, black, transparent 80%)",
              }}
            />
            <div className="relative z-10 grid lg:grid-cols-[1.4fr_1fr] gap-8 items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur px-3 py-1 text-[11px] font-semibold uppercase tracking-widest">
                  <BellRing className="size-3.5" />
                  Fristen-Wächter
                </div>
                <h2 className="mt-4 font-display text-3xl sm:text-4xl font-semibold leading-tight max-w-2xl">
                  Tool ausgewählt? Behalte Fristen und Kosten mit Toolfolio im Griff.
                </h2>
                <p className="mt-3 max-w-xl text-primary-foreground/85">
                  Verträge, Abos und Kündigungsfristen an einem Ort. Mit verifizierten Preisen, die direkt zurück ins Verzeichnis fließen.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <a href="/preise" className="inline-flex items-center gap-1.5 rounded-2xl bg-white text-foreground px-5 py-3 text-sm font-semibold hover:opacity-90">
                    Kostenlos starten <ArrowRight className="size-4" />
                  </a>
                  <a href="/features" className="inline-flex items-center gap-1.5 rounded-2xl bg-white/10 border border-white/30 px-5 py-3 text-sm font-semibold hover:bg-white/20">
                    So funktioniert Toolfolio
                  </a>
                </div>
              </div>
              <div className="hidden lg:block">
                <div className="ml-auto max-w-sm rounded-2xl bg-white/10 backdrop-blur border border-white/20 p-4">
                  <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest opacity-80">
                    <Zap className="size-3.5" /> Nächste Frist
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <div className="font-display text-3xl font-semibold tabular-nums">14</div>
                    <div className="text-sm opacity-80">Tage bis Kündigung</div>
                  </div>
                  <div className="mt-3 h-1.5 rounded-full bg-white/20 overflow-hidden">
                    <div className="h-full w-[65%] rounded-full bg-white" />
                  </div>
                  <div className="mt-3 text-xs opacity-80">Beispielhafter Vertrag · Toolfolio erinnert dich automatisch.</div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* SEO Long-Form */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 pb-20">
        <Reveal>
          <div className="rounded-3xl border border-border bg-card p-6 sm:p-10 shadow-soft">
            <div className="text-[11px] font-semibold uppercase tracking-widest text-foreground/50">Deep Dive</div>
            <h2 className="mt-1 font-display text-2xl sm:text-3xl font-semibold tracking-tight">
              {data.name} im Vergleich: Worauf du bei der Auswahl wirklich achten solltest
            </h2>
            <div className="mt-6 space-y-5 text-foreground/80 leading-relaxed text-[15px]">
              <p>
                {data.name} ist eine der zentralen Kategorien innerhalb von {data.clusterName}. Die Auswahl auf dem deutschsprachigen Markt ist groß, und die Anbieter überschneiden sich in vielen Funktionen. Die spannenden Unterschiede zeigen sich erst, wenn du genauer hinsiehst: bei der Tiefe einzelner Workflows, bei der Verlässlichkeit von Erinnerungen und Eskalationen, bei der Qualität der Suche über deinen Vertragsbestand und nicht zuletzt bei der Preistransparenz. Dieses Verzeichnis sortiert die wichtigsten Tools nach klar dokumentierten Kriterien und kennzeichnet bezahlte Platzierungen sichtbar, damit du eine faire Vergleichsgrundlage hast.
              </p>
              <p>
                Bevor du in die Detailseiten einsteigst, lohnt es sich, die eigenen Anforderungen ehrlich zu sortieren. Wie viele Verträge verwaltest du heute, und wie schnell wächst der Bestand? Wer im Unternehmen liest mit, wer entscheidet, und welche Abteilungen müssen Zugriff bekommen? Brauchst du echte Workflows mit Genehmigung und Versionierung, oder reicht eine strukturierte Ablage mit guter Suche? Diese Fragen entscheiden mehr über die Eignung eines Tools als das umfangreichste Feature-Datenblatt. Eine Lösung, die für ein kleines Team perfekt sitzt, kann im Konzernumfeld zu starr sein, und umgekehrt.
              </p>
              <p>
                Für den DACH-Markt gelten zusätzliche, sehr konkrete Anforderungen. DSGVO-Konformität, ein belastbarer Auftragsverarbeitungsvertrag und nach Möglichkeit Hosting in der EU oder in Deutschland sind die Basis. Wenn du elektronisch signierst, lohnt der Blick auf eIDAS-konforme Vertrauensdienste und die Frage, ob die qualifizierte elektronische Signatur sauber integriert ist oder über externe Drittanbieter zugekauft werden muss. Auch Themen wie Schriftformerfordernis, branchenspezifische Aufbewahrungsfristen und der Umgang mit Sub-Auftragsverarbeitern können einzelne Anbieter aus dem Rennen nehmen, lange bevor es um Funktionen geht.
              </p>
              <p>
                Beim Preis hilft ein ehrlicher Blick auf die Gesamtkosten. Viele Anbieter werben mit niedrigen Einstiegspreisen pro Nutzer, rechnen aber Signaturen, Vorlagen, Schnittstellen oder erweiterte Rollen separat ab. Wir verifizieren Preise so weit wie möglich und markieren offene Punkte als zu prüfen, statt sie zu schönen. Wenn du mehrere Tools in die engere Wahl nimmst, vergleiche bewusst gleiche Szenarien: gleiche Nutzerzahl, gleiche Anzahl an Signaturen pro Monat, gleiche Integrationen. Erst dann werden Listenpreise vergleichbar.
              </p>
              <p>
                Die letzte Etappe vor der Entscheidung ist meist ein kurzer, fokussierter Test. Lege vorher fest, welche zwei oder drei Workflows du wirklich abbilden willst, und prüfe, wie schnell ein neues Teammitglied damit klarkommt. Wenn du anschließend die Vertragsdaten, Laufzeiten und Kündigungsfristen sauber in den Fristen-Wächter überträgst, schließt sich der Kreis: Aus einer Auswahlentscheidung im Verzeichnis wird ein dauerhaft kontrollierter Bestand, der dich nicht mehr überrascht.
              </p>
            </div>
          </div>
        </Reveal>
      </section>

      <Footer />
    </div>
  );
}
