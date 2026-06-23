import { useMemo, useState } from "react";
import {
  Search,
  ArrowRight,
  ShieldCheck,
  Star,
  Info,
  SlidersHorizontal,
  X,
  Filter,
  Sparkles,
  Globe2,
  Users,
} from "lucide-react";
import { Nav, Footer, Reveal } from "./marketing-home";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// ---------- Types ----------
export type SearchTool = {
  slug: string; // for detail URL: /verzeichnis/{slug}-erfahrung
  name: string;
  desc: string;
  cluster: string; // display name
  clusterSlug: string;
  category: string;
  categorySlug: string;
  categoryColor: string;
  price: string; // "ab 19,00 €"
  priceNote?: string; // "[verifizieren]"
  priceValue: number; // for sorting (monthly EUR per user, 0 = free)
  rating: number;
  reviewCount: number;
  features: string[];
  size: ("Solo" | "KMU" | "Mittelstand" | "Enterprise")[];
  dachHosting: boolean;
  status: "verifiziert" | "community";
};

export type SearchSponsored = {
  slug: string;
  name: string;
  pitch: string;
  category: string;
  price: string;
  priceNote?: string;
};

export type SuggestionPill = { label: string; href: string };

// ---------- Mock data (example: "vertragsmanagement") ----------
const VIOLET = "#6C5CE7";
const TEAL = "#14B8A6";
const CORAL = "#FF7A66";

export const exampleSearch = {
  query: "vertragsmanagement",
  totalCount: 142,
  didYouMean: "vertragsmanagement-software",
  related: [
    { label: "E-Signatur", href: "/verzeichnis/suche?q=e-signatur" },
    { label: "KI-Vertragsanalyse", href: "/verzeichnis/suche?q=ki-vertragsanalyse" },
    { label: "CLM", href: "/verzeichnis/suche?q=clm" },
    { label: "Fristenmanagement", href: "/verzeichnis/suche?q=fristenmanagement" },
  ] as SuggestionPill[],
  sponsored: {
    slug: "fynk",
    name: "fynk",
    pitch:
      "CLM mit KI-Analyse und Fristen-Wächter, monatlich kündbar, Hosting in der EU.",
    category: "Vertragsmanagement",
    price: "ab 19,00 €",
    priceNote: "[verifizieren]",
  } as SearchSponsored,
  organic: [
    {
      slug: "contracthero",
      name: "ContractHero",
      desc: "Strukturierte Vertragsverwaltung mit Fristen, Rollen und einfacher KI-Auslesung.",
      cluster: "Vertragsmanagement-Software",
      clusterSlug: "vertragsmanagement-software",
      category: "Vertragsmanagement",
      categorySlug: "vertragsmanagement",
      categoryColor: VIOLET,
      price: "ab 24,00 €",
      priceNote: "[verifizieren]",
      priceValue: 24,
      rating: 4.5,
      reviewCount: 86,
      features: ["Fristenmanagement", "KI-Analyse", "DACH-Hosting"],
      size: ["KMU", "Mittelstand"],
      dachHosting: true,
      status: "verifiziert",
    },
    {
      slug: "inhubber",
      name: "Inhubber",
      desc: "KI-gestütztes Vertragsmanagement mit Fokus auf strukturierte Datenextraktion.",
      cluster: "Vertragsmanagement-Software",
      clusterSlug: "vertragsmanagement-software",
      category: "Vertragsmanagement",
      categorySlug: "vertragsmanagement",
      categoryColor: VIOLET,
      price: "ab 29,00 €",
      priceNote: "[verifizieren]",
      priceValue: 29,
      rating: 4.4,
      reviewCount: 41,
      features: ["KI-Analyse", "Fristenmanagement", "DACH-Hosting"],
      size: ["KMU", "Mittelstand"],
      dachHosting: true,
      status: "verifiziert",
    },
    {
      slug: "paperless",
      name: "Paperless",
      desc: "Schlankes Vertrags- und Dokumentenmanagement, gut für kleinere Teams.",
      cluster: "Vertragsmanagement-Software",
      clusterSlug: "vertragsmanagement-software",
      category: "Dokumentenmanagement",
      categorySlug: "dokumentenmanagement",
      categoryColor: VIOLET,
      price: "ab 9,00 €",
      priceNote: "[verifizieren]",
      priceValue: 9,
      rating: 4.2,
      reviewCount: 53,
      features: ["Fristenmanagement", "DACH-Hosting"],
      size: ["Solo", "KMU"],
      dachHosting: true,
      status: "verifiziert",
    },
    {
      slug: "skribble",
      name: "Skribble",
      desc: "E-Signatur-Lösung aus der Schweiz mit QES nach eIDAS und ZertES.",
      cluster: "Vertragsmanagement-Software",
      clusterSlug: "vertragsmanagement-software",
      category: "E-Signatur (QES)",
      categorySlug: "e-signatur",
      categoryColor: TEAL,
      price: "ab 12,00 €",
      priceNote: "[verifizieren]",
      priceValue: 12,
      rating: 4.6,
      reviewCount: 132,
      features: ["QES", "DACH-Hosting"],
      size: ["Solo", "KMU", "Mittelstand"],
      dachHosting: true,
      status: "verifiziert",
    },
    {
      slug: "agorum-core",
      name: "agorum core",
      desc: "ECM-Plattform aus Deutschland mit Vertrags- und Dokumentenmodulen.",
      cluster: "Vertragsmanagement-Software",
      clusterSlug: "vertragsmanagement-software",
      category: "Vertragsmanagement",
      categorySlug: "vertragsmanagement",
      categoryColor: VIOLET,
      price: "ab 39,00 €",
      priceNote: "[verifizieren]",
      priceValue: 39,
      rating: 4.1,
      reviewCount: 22,
      features: ["Fristenmanagement", "DACH-Hosting"],
      size: ["Mittelstand", "Enterprise"],
      dachHosting: true,
      status: "verifiziert",
    },
    {
      slug: "contractbook",
      name: "Contractbook",
      desc: "End-to-end CLM mit modernen Workflows und Integrationen.",
      cluster: "Vertragsmanagement-Software",
      clusterSlug: "vertragsmanagement-software",
      category: "Vertragsmanagement",
      categorySlug: "vertragsmanagement",
      categoryColor: VIOLET,
      price: "ab 41,00 €",
      priceNote: "[verifizieren]",
      priceValue: 41,
      rating: 4.3,
      reviewCount: 67,
      features: ["KI-Analyse", "Fristenmanagement"],
      size: ["KMU", "Mittelstand"],
      dachHosting: false,
      status: "verifiziert",
    },
    {
      slug: "dilitrust",
      name: "DiliTrust Suite",
      desc: "Enterprise-Lösung mit Vertragsmanagement, Compliance und Board-Modulen.",
      cluster: "Vertragsmanagement-Software",
      clusterSlug: "vertragsmanagement-software",
      category: "Vertragsmanagement",
      categorySlug: "vertragsmanagement",
      categoryColor: VIOLET,
      price: "auf Anfrage",
      priceNote: "[verifizieren]",
      priceValue: 99,
      rating: 4.0,
      reviewCount: 18,
      features: ["KI-Analyse", "Fristenmanagement"],
      size: ["Enterprise"],
      dachHosting: false,
      status: "verifiziert",
    },
    {
      slug: "contrax",
      name: "Contrax",
      desc: "Kleines Vertragstool aus Berlin, fokussiert auf Solo-Selbstständige.",
      cluster: "Vertragsmanagement-Software",
      clusterSlug: "vertragsmanagement-software",
      category: "Vertragsmanagement",
      categorySlug: "vertragsmanagement",
      categoryColor: VIOLET,
      price: "ab 0,00 €",
      priceNote: "Free verfügbar",
      priceValue: 0,
      rating: 3.9,
      reviewCount: 7,
      features: ["Fristenmanagement", "DACH-Hosting"],
      size: ["Solo"],
      dachHosting: true,
      status: "community",
    },
    {
      slug: "klauselbox",
      name: "Klauselbox",
      desc: "Indie-Tool für Klauselbibliotheken, gepflegt von einem kleinen Team.",
      cluster: "Vertragsmanagement-Software",
      clusterSlug: "vertragsmanagement-software",
      category: "Vertragsmanagement",
      categorySlug: "vertragsmanagement",
      categoryColor: VIOLET,
      price: "ab 5,00 €",
      priceNote: "[ungeprüft]",
      priceValue: 5,
      rating: 4.0,
      reviewCount: 4,
      features: ["DACH-Hosting"],
      size: ["Solo", "KMU"],
      dachHosting: true,
      status: "community",
    },
  ] as SearchTool[],
};

const ALL_FEATURES = ["QES", "KI-Analyse", "Fristenmanagement"];
const ALL_SIZES = ["Solo", "KMU", "Mittelstand", "Enterprise"] as const;

// ---------- Component ----------
export function SuchePage({
  initialQuery,
  data = exampleSearch,
}: {
  initialQuery?: string;
  data?: typeof exampleSearch;
}) {
  const [query, setQuery] = useState(initialQuery ?? data.query);
  const [categories, setCategories] = useState<string[]>([]);
  const [features, setFeatures] = useState<string[]>([]);
  const [sizes, setSizes] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState<number>(100);
  const [dachOnly, setDachOnly] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [communityIncluded, setCommunityIncluded] = useState(true);
  const [sort, setSort] = useState<"relevanz" | "bewertung" | "preis">("relevanz");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const allCategories = useMemo(() => {
    const map = new Map<string, { name: string; color: string; count: number }>();
    data.organic.forEach((t) => {
      const existing = map.get(t.categorySlug);
      if (existing) existing.count += 1;
      else map.set(t.categorySlug, { name: t.category, color: t.categoryColor, count: 1 });
    });
    return Array.from(map.entries()).map(([slug, v]) => ({ slug, ...v }));
  }, [data.organic]);

  const filtered = useMemo(() => {
    let list = data.organic.filter((t) => {
      if (query) {
        const q = query.toLowerCase();
        if (
          !t.name.toLowerCase().includes(q) &&
          !t.desc.toLowerCase().includes(q) &&
          !t.category.toLowerCase().includes(q) &&
          !t.cluster.toLowerCase().includes(q) &&
          !t.features.some((f) => f.toLowerCase().includes(q))
        )
          return false;
      }
      if (categories.length && !categories.includes(t.categorySlug)) return false;
      if (features.length && !features.every((f) => t.features.includes(f))) return false;
      if (sizes.length && !sizes.some((s) => t.size.includes(s as typeof ALL_SIZES[number])))
        return false;
      if (maxPrice < 100 && t.priceValue > maxPrice) return false;
      if (dachOnly && !t.dachHosting) return false;
      if (verifiedOnly && t.status !== "verifiziert") return false;
      if (!communityIncluded && t.status === "community") return false;
      return true;
    });
    if (sort === "bewertung") list = [...list].sort((a, b) => b.rating - a.rating);
    else if (sort === "preis") list = [...list].sort((a, b) => a.priceValue - b.priceValue);
    return list;
  }, [
    data.organic,
    query,
    categories,
    features,
    sizes,
    maxPrice,
    dachOnly,
    verifiedOnly,
    communityIncluded,
    sort,
  ]);

  const activePills: { label: string; clear: () => void }[] = [];
  categories.forEach((slug) => {
    const c = allCategories.find((x) => x.slug === slug);
    if (c)
      activePills.push({
        label: `Kategorie: ${c.name}`,
        clear: () => setCategories((p) => p.filter((s) => s !== slug)),
      });
  });
  features.forEach((f) =>
    activePills.push({
      label: f,
      clear: () => setFeatures((p) => p.filter((x) => x !== f)),
    }),
  );
  sizes.forEach((s) =>
    activePills.push({
      label: `Größe: ${s}`,
      clear: () => setSizes((p) => p.filter((x) => x !== s)),
    }),
  );
  if (maxPrice < 100)
    activePills.push({
      label: `Preis bis ${maxPrice} €`,
      clear: () => setMaxPrice(100),
    });
  if (dachOnly)
    activePills.push({ label: "DACH-Hosting", clear: () => setDachOnly(false) });
  if (verifiedOnly)
    activePills.push({ label: "Nur verifiziert", clear: () => setVerifiedOnly(false) });
  if (!communityIncluded)
    activePills.push({
      label: "Community ausgeblendet",
      clear: () => setCommunityIncluded(true),
    });

  const clearAll = () => {
    setCategories([]);
    setFeatures([]);
    setSizes([]);
    setMaxPrice(100);
    setDachOnly(false);
    setVerifiedOnly(false);
    setCommunityIncluded(true);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />

      {/* Suchkopf */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pt-8 sm:pt-12 pb-6">
        <Reveal>
          <div className="rounded-3xl border border-border bg-card p-5 sm:p-8 shadow-soft">
            <div className="flex flex-col gap-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-foreground/60">
                Verzeichnis · Suche
              </div>
              <div className="flex items-center gap-2 rounded-2xl border border-border bg-background px-4 py-3">
                <Search className="size-5 text-foreground/50" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Suche im gesamten Verzeichnis"
                  className="w-full bg-transparent text-base outline-none placeholder:text-foreground/40"
                  aria-label="Suchanfrage"
                />
                {query && (
                  <button
                    onClick={() => setQuery("")}
                    className="rounded-full p-1 text-foreground/50 hover:bg-muted"
                    aria-label="Suche leeren"
                  >
                    <X className="size-4" />
                  </button>
                )}
              </div>
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight">
                  {filtered.length} Tools gefunden
                  {query && (
                    <>
                      {" "}
                      für <span className="text-primary">{query}</span>
                    </>
                  )}
                </h1>
                <span className="text-sm text-foreground/60 tabular-nums">
                  (gesamt {data.totalCount} im Verzeichnis)
                </span>
              </div>

              {data.didYouMean && (
                <div className="text-sm text-foreground/70">
                  Meintest du{" "}
                  <button
                    onClick={() => setQuery(data.didYouMean!)}
                    className="font-semibold text-primary hover:underline"
                  >
                    {data.didYouMean}
                  </button>
                  ?
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-foreground/60">Verwandt:</span>
                {data.related.map((r) => (
                  <button
                    key={r.label}
                    onClick={() => setQuery(r.label.toLowerCase())}
                    className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium hover:bg-muted"
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Hauptlayout */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
          {/* Mobile filter toggle */}
          <div className="lg:hidden">
            <button
              onClick={() => setFiltersOpen((v) => !v)}
              className="inline-flex w-full items-center justify-between rounded-2xl border border-border bg-card px-4 py-3 text-sm font-semibold"
            >
              <span className="inline-flex items-center gap-2">
                <SlidersHorizontal className="size-4" />
                Filter {activePills.length > 0 && `(${activePills.length})`}
              </span>
              <span className="text-foreground/50">{filtersOpen ? "schließen" : "öffnen"}</span>
            </button>
          </div>

          {/* Filter-Panel */}
          <aside
            className={`${filtersOpen ? "block" : "hidden"} lg:block space-y-5`}
            aria-label="Filter"
          >
            <FilterCard title="Kategorie">
              <div className="space-y-2">
                {allCategories.map((c) => (
                  <label
                    key={c.slug}
                    className="flex cursor-pointer items-center justify-between gap-2 text-sm"
                  >
                    <span className="inline-flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={categories.includes(c.slug)}
                        onChange={(e) =>
                          setCategories((p) =>
                            e.target.checked ? [...p, c.slug] : p.filter((s) => s !== c.slug),
                          )
                        }
                        className="size-4 rounded border-border accent-primary"
                      />
                      <span className="inline-flex items-center gap-1.5">
                        <span
                          className="size-2 rounded-full"
                          style={{ background: c.color }}
                          aria-hidden
                        />
                        {c.name}
                      </span>
                    </span>
                    <span className="tabular-nums text-xs text-foreground/50">{c.count}</span>
                  </label>
                ))}
              </div>
            </FilterCard>

            <FilterCard title="Preis">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Bis</span>
                  <span className="tabular-nums font-medium">
                    {maxPrice >= 100 ? "beliebig" : `${maxPrice} € / Monat`}
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-primary"
                  aria-label="Maximaler Preis pro Monat"
                />
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={maxPrice === 0}
                    onChange={(e) => setMaxPrice(e.target.checked ? 0 : 100)}
                    className="size-4 rounded border-border accent-primary"
                  />
                  Nur kostenlose Tools
                </label>
              </div>
            </FilterCard>

            <FilterCard title="Features">
              <div className="space-y-2">
                {ALL_FEATURES.map((f) => (
                  <label key={f} className="flex cursor-pointer items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={features.includes(f)}
                      onChange={(e) =>
                        setFeatures((p) =>
                          e.target.checked ? [...p, f] : p.filter((x) => x !== f),
                        )
                      }
                      className="size-4 rounded border-border accent-primary"
                    />
                    {f}
                  </label>
                ))}
              </div>
            </FilterCard>

            <FilterCard title="Unternehmensgröße">
              <div className="space-y-2">
                {ALL_SIZES.map((s) => (
                  <label key={s} className="flex cursor-pointer items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={sizes.includes(s)}
                      onChange={(e) =>
                        setSizes((p) =>
                          e.target.checked ? [...p, s] : p.filter((x) => x !== s),
                        )
                      }
                      className="size-4 rounded border-border accent-primary"
                    />
                    {s}
                  </label>
                ))}
              </div>
            </FilterCard>

            <FilterCard title="Hosting & Status">
              <div className="space-y-2 text-sm">
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={dachOnly}
                    onChange={(e) => setDachOnly(e.target.checked)}
                    className="size-4 rounded border-border accent-primary"
                  />
                  <Globe2 className="size-4 text-foreground/60" />
                  Nur DACH-Hosting
                </label>
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={verifiedOnly}
                    onChange={(e) => setVerifiedOnly(e.target.checked)}
                    className="size-4 rounded border-border accent-primary"
                  />
                  <ShieldCheck className="size-4 text-[#12B76A]" />
                  Nur verifizierte Tools
                </label>
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={communityIncluded}
                    onChange={(e) => setCommunityIncluded(e.target.checked)}
                    className="size-4 rounded border-border accent-primary"
                  />
                  <Users className="size-4 text-foreground/60" />
                  Community-Tools einschließen
                </label>
              </div>
            </FilterCard>

            <button
              onClick={clearAll}
              className="w-full rounded-2xl border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-muted"
            >
              Alle Filter zurücksetzen
            </button>
          </aside>

          {/* Ergebnisse */}
          <div className="min-w-0">
            {/* Sort + active pills */}
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                {activePills.length === 0 ? (
                  <span className="text-xs text-foreground/50 inline-flex items-center gap-1.5">
                    <Filter className="size-3.5" />
                    Keine aktiven Filter
                  </span>
                ) : (
                  activePills.map((p, i) => (
                    <button
                      key={i}
                      onClick={p.clear}
                      className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary hover:bg-primary/15"
                    >
                      {p.label}
                      <X className="size-3" />
                    </button>
                  ))
                )}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <label htmlFor="sort" className="text-foreground/60">
                  Sortieren:
                </label>
                <select
                  id="sort"
                  value={sort}
                  onChange={(e) => setSort(e.target.value as typeof sort)}
                  className="rounded-xl border border-border bg-card px-3 py-1.5 text-sm font-medium outline-none"
                >
                  <option value="relevanz">Relevanz</option>
                  <option value="bewertung">Bewertung</option>
                  <option value="preis">Preis</option>
                </select>
              </div>
            </div>

            {/* Transparenz-Hinweis */}
            <div className="mb-5 flex items-start gap-2 rounded-2xl border border-dashed border-border bg-muted/40 px-4 py-3 text-xs text-foreground/70">
              <Info className="mt-0.5 size-4 shrink-0" />
              <p>
                Organische Reihung ist neutral und nicht käuflich. Gesponserte Treffer sind sichtbar
                markiert, Community-Tools sind ungeprüft.{" "}
                <a href="/badge" className="font-semibold text-primary hover:underline">
                  So funktioniert das Ranking
                </a>
                .
              </p>
            </div>

            {/* Sponsored */}
            {data.sponsored && (
              <Reveal>
                <article className="mb-5 rounded-3xl border-2 border-dashed border-[#C9A227] bg-[#FFF8E1]/60 p-5 sm:p-6 shadow-soft">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex size-12 items-center justify-center rounded-2xl text-lg font-display font-semibold text-primary-foreground"
                        style={{ background: VIOLET }}
                        aria-hidden
                      >
                        {data.sponsored.name[0]}
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-[#C9A227]/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#7a6113]">
                            Gesponsert
                          </span>
                          <span className="rounded-full border border-border bg-background px-2 py-0.5 text-xs font-medium">
                            {data.sponsored.category}
                          </span>
                        </div>
                        <h3 className="mt-1.5 font-display text-xl font-semibold">
                          {data.sponsored.name}
                        </h3>
                      </div>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-foreground/80 leading-relaxed">
                    {data.sponsored.pitch}
                  </p>
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="text-sm">
                      <span className="font-display text-lg font-semibold tabular-nums">
                        {data.sponsored.price}
                      </span>{" "}
                      {data.sponsored.priceNote && (
                        <span className="text-xs text-foreground/50">
                          {data.sponsored.priceNote}
                        </span>
                      )}
                    </div>
                    <a
                      href={`/verzeichnis/${data.sponsored.slug}-erfahrung`}
                      className="inline-flex items-center gap-1.5 rounded-2xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
                    >
                      Zum Tool <ArrowRight className="size-4" />
                    </a>
                  </div>
                </article>
              </Reveal>
            )}

            {/* Organic results */}
            {filtered.length === 0 ? (
              <EmptyState query={query} clearAll={clearAll} />
            ) : (
              <div className="space-y-4">
                {filtered.map((t, i) => (
                  <Reveal key={t.slug} delay={i * 30}>
                    <ResultCard tool={t} />
                  </Reveal>
                ))}
              </div>
            )}

            {/* Pagination (visual mock) */}
            {filtered.length > 0 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <button
                  className="rounded-xl border border-border bg-card px-3 py-2 text-sm font-medium opacity-50"
                  disabled
                >
                  Zurück
                </button>
                {[1, 2, 3].map((n) => (
                  <button
                    key={n}
                    className={`rounded-xl px-3.5 py-2 text-sm font-medium ${
                      n === 1
                        ? "bg-primary text-primary-foreground"
                        : "border border-border bg-card hover:bg-muted"
                    }`}
                  >
                    {n}
                  </button>
                ))}
                <button className="rounded-xl border border-border bg-card px-3 py-2 text-sm font-medium hover:bg-muted">
                  Weiter
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Hilfe-FAQ */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 pb-16">
        <Reveal>
          <h2 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight">
            Hinweise zur Suche
          </h2>
        </Reveal>
        <Reveal delay={80}>
          <div className="mt-5 rounded-3xl border border-border bg-card p-2 sm:p-4 shadow-soft">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="rank" className="border-border">
                <AccordionTrigger className="text-left font-display text-base font-semibold px-3 sm:px-4">
                  Wie kommt die Reihenfolge zustande?
                </AccordionTrigger>
                <AccordionContent className="px-3 sm:px-4 text-foreground/80 leading-relaxed">
                  Die organische Reihung ist neutral und nicht käuflich. Sie basiert auf
                  Relevanz, Bewertungen, verifizierten Daten und Vollständigkeit des Profils.
                  Bezahlung beeinflusst niemals die organische Reihenfolge.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="sponsored" className="border-border">
                <AccordionTrigger className="text-left font-display text-base font-semibold px-3 sm:px-4">
                  Was bedeutet "gesponsert"?
                </AccordionTrigger>
                <AccordionContent className="px-3 sm:px-4 text-foreground/80 leading-relaxed">
                  Anbieter können einen sichtbar markierten Platz buchen. Diese Treffer sind klar
                  abgesetzt und niemals als organische Reihung getarnt. Maximal ein bis zwei
                  gesponserte Treffer pro Ergebnisliste.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="community" className="border-border">
                <AccordionTrigger className="text-left font-display text-base font-semibold px-3 sm:px-4">
                  Warum sind Community-Tools extra markiert?
                </AccordionTrigger>
                <AccordionContent className="px-3 sm:px-4 text-foreground/80 leading-relaxed">
                  Community-Tools sind kleinere oder neue Lösungen, deren Daten wir noch nicht
                  vollständig geprüft haben. Sie bekommen ein eigenes Label, damit du den
                  Unterschied zu verifizierten Tools sofort siehst.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </Reveal>
      </section>

      <Footer />
    </div>
  );
}

// ---------- Subcomponents ----------
function FilterCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 sm:p-5">
      <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-foreground/70">
        {title}
      </h3>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function ResultCard({ tool }: { tool: SearchTool }) {
  const isCommunity = tool.status === "community";
  return (
    <article
      className={`rounded-3xl border bg-card p-5 sm:p-6 shadow-soft transition hover:-translate-y-0.5 hover:border-primary/40 ${
        isCommunity ? "border-dashed border-border bg-card/70" : "border-border"
      }`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div
          className="flex size-12 shrink-0 items-center justify-center rounded-2xl text-lg font-display font-semibold text-primary-foreground"
          style={{ background: tool.categoryColor }}
          aria-hidden
        >
          {tool.name[0]}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="rounded-full px-2.5 py-0.5 text-xs font-medium"
              style={{ background: `${tool.categoryColor}1A`, color: tool.categoryColor }}
            >
              {tool.category}
            </span>
            {tool.status === "verifiziert" ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#12B76A]/15 px-2 py-0.5 text-xs font-semibold text-[#0e8a51]">
                <ShieldCheck className="size-3" />
                Verifiziert
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2 py-0.5 text-xs font-semibold text-foreground/70">
                <Users className="size-3" />
                Community-Tool
              </span>
            )}
            {tool.dachHosting && (
              <span className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5 text-xs text-foreground/70">
                <Globe2 className="size-3" />
                DACH
              </span>
            )}
          </div>

          <h3 className="mt-2 font-display text-xl font-semibold">{tool.name}</h3>
          <p className="mt-1.5 text-sm text-foreground/75 leading-relaxed">{tool.desc}</p>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {tool.features.map((f) => (
              <span
                key={f}
                className="rounded-full border border-border bg-background px-2 py-0.5 text-xs text-foreground/70"
              >
                {f}
              </span>
            ))}
          </div>
        </div>

        <div className="flex w-full shrink-0 flex-col items-start gap-2 sm:w-44 sm:items-end">
          <div className="flex items-center gap-1.5 text-sm">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`size-3.5 ${
                    i < Math.round(tool.rating)
                      ? "fill-[#F5A623] text-[#F5A623]"
                      : "text-foreground/20"
                  }`}
                />
              ))}
            </div>
            <span className="tabular-nums font-medium">{tool.rating.toFixed(1)}</span>
            <span className="text-xs text-foreground/50">({tool.reviewCount})</span>
          </div>
          <div className="text-right">
            <div className="font-display text-lg font-semibold tabular-nums">{tool.price}</div>
            {tool.priceNote && (
              <div className="text-xs text-foreground/50">{tool.priceNote}</div>
            )}
          </div>
          <a
            href={`/verzeichnis/${tool.slug}-erfahrung`}
            className="mt-1 inline-flex w-full items-center justify-center gap-1.5 rounded-2xl border border-border bg-background px-4 py-2 text-sm font-semibold hover:bg-muted sm:w-auto"
          >
            Zum Tool <ArrowRight className="size-4" />
          </a>
        </div>
      </div>
    </article>
  );
}

function EmptyState({ query, clearAll }: { query: string; clearAll: () => void }) {
  return (
    <div className="rounded-3xl border border-dashed border-border bg-card/60 p-8 sm:p-12 text-center">
      <div
        className="mx-auto flex size-14 items-center justify-center rounded-2xl"
        style={{ background: `${CORAL}1A`, color: CORAL }}
      >
        <Search className="size-6" />
      </div>
      <h2 className="mt-4 font-display text-2xl font-semibold">
        Keine Treffer{query && <> für „{query}"</>}
      </h2>
      <p className="mt-2 text-foreground/70">
        Probier weniger Filter oder einen anderen Suchbegriff. Vielleicht hilft auch einer der
        Vorschläge unten.
      </p>
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        <a
          href="/verzeichnis/vertragsmanagement-software"
          className="rounded-full border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-muted"
        >
          Vertragsmanagement-Software
        </a>
        <a
          href="/verzeichnis/finanzen-kostenmanagement"
          className="rounded-full border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-muted"
        >
          Finanzen & Kostenmanagement
        </a>
        <a
          href="/verzeichnis"
          className="rounded-full border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-muted"
        >
          Alle Cluster ansehen
        </a>
      </div>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={clearAll}
          className="inline-flex items-center gap-1.5 rounded-2xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          Filter zurücksetzen
        </button>
        <a
          href="/anbieter"
          className="inline-flex items-center gap-1.5 rounded-2xl border border-border bg-card px-5 py-2.5 text-sm font-semibold hover:bg-muted"
        >
          <Sparkles className="size-4" />
          Tool fehlt? Schlag es vor
        </a>
      </div>
    </div>
  );
}
