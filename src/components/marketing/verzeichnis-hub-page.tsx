import { useMemo, useState } from "react";
import {
  Search,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Layers,
  PenTool,
  Megaphone,
  Cpu,
  MessageSquare,
  Code2,
  Rocket,
  ShoppingCart,
  BarChart3,
  Wallet,
  ListChecks,
  Users,
  CheckCircle2,
  MapPin,
  Star,
  Plus,
  FileSignature,
} from "lucide-react";
import { Nav, Footer, Reveal } from "./marketing-home";
import { cn } from "@/lib/utils";

type Cluster = {
  name: string;
  slug: string;
  color: string; // hex
  icon: React.ComponentType<{ className?: string }>;
  count: number;
  top: string[];
};

const clusters: Cluster[] = [
  { name: "Vertragsmanagement", slug: "vertragsmanagement-software", color: "#6C5CE7", icon: FileSignature, count: 6, top: ["CLM", "E-Signatur (QES)", "KI-Vertragsanalyse"] },
  { name: "Design", slug: "design", color: "#E84393", icon: PenTool, count: 24, top: ["UI Design", "Prototyping", "Illustration"] },
  { name: "SEO & Marketing", slug: "seo-marketing", color: "#16A34A", icon: Megaphone, count: 31, top: ["SEO", "E-Mail Marketing", "Social Media"] },
  { name: "KI & API", slug: "ki-api", color: "#6C5CE7", icon: Cpu, count: 28, top: ["LLM-Plattformen", "Bildgenerierung", "Automatisierung"] },
  { name: "Kommunikation", slug: "kommunikation", color: "#3B82F6", icon: MessageSquare, count: 19, top: ["Team-Chat", "Video-Calls", "Async"] },
  { name: "Entwicklung", slug: "entwicklung", color: "#0FB5BA", icon: Code2, count: 35, top: ["Hosting", "CI/CD", "Code-Editor"] },
  { name: "Produktivität", slug: "produktivitaet", color: "#F5A623", icon: Rocket, count: 26, top: ["Notizen", "Wissensbasis", "To-do"] },
  { name: "eCommerce", slug: "ecommerce", color: "#FB923C", icon: ShoppingCart, count: 17, top: ["Shopsysteme", "Payments", "Versand"] },
  { name: "Analyse & Daten", slug: "analyse-daten", color: "#0EA5E9", icon: BarChart3, count: 22, top: ["Web Analytics", "BI", "Dashboards"] },
  { name: "Finanzen & Buchhaltung", slug: "finanzen", color: "#10B981", icon: Wallet, count: 14, top: ["Buchhaltung", "Rechnungen", "Steuer"] },
  { name: "Projektmanagement", slug: "projektmanagement", color: "#8B5CF6", icon: ListChecks, count: 21, top: ["Kanban", "Roadmaps", "Issue-Tracking"] },
  { name: "Vertrieb & CRM", slug: "vertrieb-crm", color: "#EF4444", icon: Users, count: 18, top: ["CRM", "Outreach", "Pipeline"] },
];

type Tool = {
  name: string;
  category: string;
  catColor: string;
  desc: string;
  price: string;
  verified?: boolean;
};

const popularTools: Tool[] = [
  { name: "Notion", category: "Produktivität", catColor: "#F5A623", desc: "Notizen, Wissensbasis und leichte Projekte in einer App.", price: "ab 9,50 €", verified: true },
  { name: "Figma", category: "Design", catColor: "#E84393", desc: "Kollaboratives UI-Design und Prototyping im Browser.", price: "ab 13,50 €", verified: true },
  { name: "Slack", category: "Kommunikation", catColor: "#3B82F6", desc: "Team-Chat, Kanäle und Integrationen für den Arbeitsalltag.", price: "ab 7,25 €" },
  { name: "Adobe Creative Cloud", category: "Design", catColor: "#E84393", desc: "Photoshop, Illustrator und Co. als Abo-Bundle.", price: "ab 59,99 €", verified: true },
  { name: "Ahrefs", category: "SEO & Marketing", catColor: "#16A34A", desc: "SEO-Suite für Backlinks, Keywords und Content.", price: "ab 99,00 €" },
  { name: "Linear", category: "Projektmanagement", catColor: "#8B5CF6", desc: "Schnelles Issue-Tracking für Produkt- und Engineering-Teams.", price: "ab 8,00 €", verified: true },
  { name: "Canva", category: "Design", catColor: "#E84393", desc: "Vorlagengetriebenes Design für Social, Präsentationen und Print.", price: "ab 11,99 €" },
  { name: "HubSpot", category: "Vertrieb & CRM", catColor: "#EF4444", desc: "CRM mit Marketing-, Sales- und Service-Modulen.", price: "ab 18,00 €" },
];

const newTools = [
  { name: "Cursor", category: "Entwicklung", catColor: "#0FB5BA" },
  { name: "Raycast", category: "Produktivität", catColor: "#F5A623" },
  { name: "Resend", category: "Entwicklung", catColor: "#0FB5BA" },
  { name: "Tella", category: "Kommunikation", catColor: "#3B82F6" },
  { name: "Beehiiv", category: "SEO & Marketing", catColor: "#16A34A" },
  { name: "Posthog", category: "Analyse & Daten", catColor: "#0EA5E9" },
];

const collections = [
  { title: "Beste Tools für Agenturen", desc: "Unsere Auswahl an Stacks für Design-, Marketing- und Dev-Agenturen.", tag: "Kuratiert", color: "#6C5CE7" },
  { title: "Günstige Alternativen", desc: "Schlanke Alternativen zu teuren Klassikern, fair verglichen.", tag: "Spar-Tipp", color: "#12B76A" },
  { title: "KI-Tools im Vergleich", desc: "Aktuelle KI-Helfer für Text, Bild und Code im direkten Vergleich.", tag: "Neu", color: "#FF7A66" },
  { title: "Tools für Solopreneure", desc: "Minimaler Stack, maximale Wirkung. Für Einzelkämpfer:innen.", tag: "Starter", color: "#3B82F6" },
];

const searchPills = ["Design", "KI", "SEO", "CRM", "Buchhaltung", "Projektmanagement"];

export function VerzeichnisHubPage() {
  const [query, setQuery] = useState("");

  const allResults = useMemo(
    () => [
      ...popularTools.map((t) => ({ type: "Tool" as const, name: t.name, meta: t.category, color: t.catColor, href: "/verzeichnis#tools" })),
      ...clusters.map((c) => ({ type: "Kategorie" as const, name: c.name, meta: `${c.count} Kategorien`, color: c.color, href: `/verzeichnis#cluster-${c.slug}` })),
    ],
    [],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return allResults
      .filter((r) => r.name.toLowerCase().includes(q) || r.meta.toLowerCase().includes(q))
      .slice(0, 6);
  }, [query, allResults]);

  return (
    <div id="top" className="min-h-screen bg-[color:var(--paper)] text-foreground">
      <Nav />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 -z-10 opacity-70"
          style={{
            background:
              "radial-gradient(60% 50% at 20% 10%, rgba(108,92,231,0.18), transparent 60%), radial-gradient(50% 40% at 85% 20%, rgba(255,122,102,0.16), transparent 60%)",
          }}
        />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-12 pb-16 sm:pt-20 sm:pb-24">
          <Reveal>
            <div className="flex items-center gap-2 text-xs font-semibold tracking-wide uppercase text-foreground/70">
              <span className="inline-flex items-center gap-1 rounded-full bg-card border border-border px-3 py-1 shadow-soft">
                <Sparkles className="size-3.5 text-primary" />
                Software-Verzeichnis für DACH
              </span>
            </div>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="mt-5 font-display text-4xl sm:text-5xl md:text-6xl font-semibold leading-[1.05] tracking-tight max-w-4xl">
              Finde, vergleiche und wechsle <span className="text-primary">deine Software</span>.
            </h1>
          </Reveal>
          <Reveal delay={140}>
            <p className="mt-5 max-w-2xl text-lg text-foreground/70">
              Das Verzeichnis für Agenturen, Freelancer und Solopreneure in DACH. Mit verifizierten Preisen aus echten Abrechnungen und einer klaren Haltung zur Neutralität.
            </p>
          </Reveal>

          {/* Search */}
          <Reveal delay={200}>
            <div className="mt-8 max-w-2xl">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-foreground/50" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Tool oder Kategorie suchen, z. B. Figma, KI, CRM"
                  className="w-full rounded-2xl border border-border bg-card pl-12 pr-32 py-4 text-base shadow-lift focus:outline-none focus:ring-2 focus:ring-primary/40"
                  aria-label="Tool oder Kategorie suchen"
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center gap-1.5 rounded-xl bg-primary text-primary-foreground px-4 py-2.5 text-sm font-semibold hover:opacity-90"
                >
                  Suchen <ArrowRight className="size-4" />
                </button>

                {filtered.length > 0 && (
                  <div className="absolute z-20 mt-2 w-full rounded-2xl border border-border bg-card shadow-lift p-2">
                    {filtered.map((r) => (
                      <a
                        key={`${r.type}-${r.name}`}
                        href={r.href}
                        className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 hover:bg-accent"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span
                            className="size-2.5 rounded-full shrink-0"
                            style={{ background: r.color }}
                            aria-hidden
                          />
                          <span className="font-medium truncate">{r.name}</span>
                          <span className="text-xs text-foreground/60 truncate">{r.meta}</span>
                        </div>
                        <span className="text-xs uppercase tracking-wide text-foreground/50">{r.type}</span>
                      </a>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="text-sm text-foreground/60">Beliebt:</span>
                {searchPills.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setQuery(p)}
                    className="rounded-full border border-border bg-card px-3 py-1.5 text-sm font-medium hover:bg-accent transition-colors"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Cluster & Top-Kategorien */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-20">
        <Reveal>
          <div className="flex items-end justify-between gap-6 flex-wrap">
            <div>
              <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight">
                Cluster & Top-Kategorien
              </h2>
              <p className="mt-2 text-foreground/70 max-w-2xl">
                Stöbere nach Themen. Jeder Cluster bündelt verwandte Kategorien mit verifizierten Preisen und Alternativen.
              </p>
            </div>
            <a
              href="/verzeichnis#alle"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
            >
              Alle Kategorien <ArrowRight className="size-4" />
            </a>
          </div>
        </Reveal>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {clusters.map((c, i) => {
            const Icon = c.icon;
            return (
              <Reveal key={c.slug} delay={i * 40}>
                <a
                  href={`/verzeichnis#cluster-${c.slug}`}
                  className="group block rounded-3xl border border-border bg-card p-6 shadow-soft hover:shadow-lift hover:-translate-y-0.5 transition-all"
                  style={{ borderTop: `4px solid ${c.color}` }}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="grid size-11 place-items-center rounded-2xl"
                      style={{ background: `${c.color}1A`, color: c.color }}
                    >
                      <Icon className="size-5" />
                    </span>
                    <div>
                      <div className="font-display text-lg font-semibold">{c.name}</div>
                      <div className="text-xs text-foreground/60">{c.count} Kategorien</div>
                    </div>
                  </div>
                  <ul className="mt-5 space-y-1.5">
                    {c.top.map((t) => (
                      <li key={t}>
                        <a
                          href={`/verzeichnis#kategorie-${c.slug}-${t.toLowerCase().replace(/\s+/g, "-")}`}
                          className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground/80 hover:text-foreground"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <span className="size-1.5 rounded-full" style={{ background: c.color }} aria-hidden />
                          {t}
                        </a>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    Cluster ansehen <ArrowRight className="size-4" />
                  </div>
                </a>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* Beliebte Tools */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-16 sm:pb-20">
        <Reveal>
          <div className="flex items-end justify-between gap-6 flex-wrap">
            <div>
              <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight">Beliebte Tools</h2>
              <p className="mt-2 text-foreground/70 max-w-2xl">
                Was DACH-Agenturen, Freelancer und Solopreneure aktuell am häufigsten nutzen.
              </p>
            </div>
          </div>
        </Reveal>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {popularTools.map((t, i) => (
            <Reveal key={t.name} delay={i * 30}>
              <a
                href={`/verzeichnis#tool-${t.name.toLowerCase().replace(/\s+/g, "-")}`}
                className="group block rounded-3xl border border-border bg-card p-5 shadow-soft hover:shadow-lift hover:-translate-y-0.5 transition-all h-full"
              >
                <div className="flex items-center justify-between">
                  <span
                    className="grid size-12 place-items-center rounded-2xl font-display text-lg font-semibold"
                    style={{ background: `${t.catColor}1A`, color: t.catColor }}
                    aria-hidden
                  >
                    {t.name.charAt(0)}
                  </span>
                  {t.verified && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[color:var(--success)]/15 text-[color:var(--success)] px-2 py-1 text-xs font-semibold">
                      <ShieldCheck className="size-3.5" />
                      Verifiziert
                    </span>
                  )}
                </div>
                <div className="mt-4">
                  <div className="font-display text-lg font-semibold">{t.name}</div>
                  <span
                    className="mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-semibold"
                    style={{ background: `${t.catColor}1A`, color: t.catColor }}
                  >
                    {t.category}
                  </span>
                </div>
                <p className="mt-3 text-sm text-foreground/70 line-clamp-3">{t.desc}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm font-semibold tabular-nums">{t.price}</span>
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    Ansehen <ArrowRight className="size-4" />
                  </span>
                </div>
              </a>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Neu im Verzeichnis */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-16 sm:pb-20">
        <Reveal>
          <div className="flex items-center justify-between gap-6 flex-wrap">
            <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight">Neu im Verzeichnis</h2>
            <a href="/verzeichnis#neu" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
              Alle neuen Tools <ArrowRight className="size-4" />
            </a>
          </div>
        </Reveal>
        <div className="mt-6 flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
          {newTools.map((t, i) => (
            <Reveal key={t.name} delay={i * 30}>
              <a
                href={`/verzeichnis#tool-${t.name.toLowerCase()}`}
                className="group inline-flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-soft hover:shadow-lift hover:-translate-y-0.5 transition-all shrink-0"
              >
                <span
                  className="grid size-9 place-items-center rounded-xl font-display text-sm font-semibold"
                  style={{ background: `${t.catColor}1A`, color: t.catColor }}
                >
                  {t.name.charAt(0)}
                </span>
                <div>
                  <div className="font-semibold text-sm">{t.name}</div>
                  <div className="text-xs text-foreground/60">{t.category}</div>
                </div>
                <Plus className="size-4 text-foreground/40 group-hover:text-primary transition-colors" />
              </a>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Warum dieses Verzeichnis anders ist */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-16 sm:pb-20">
        <Reveal>
          <div className="rounded-3xl border border-border bg-card p-8 sm:p-10 shadow-soft">
            <div className="flex items-center gap-2 text-xs font-semibold tracking-wide uppercase text-foreground/60">
              <ShieldCheck className="size-4 text-[color:var(--success)]" />
              Warum dieses Verzeichnis anders ist
            </div>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl font-semibold tracking-tight max-w-3xl">
              Verifizierte Preise, klare Neutralität, DACH-Fokus.
            </h2>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="grid size-11 place-items-center rounded-2xl bg-[color:var(--success)]/15 text-[color:var(--success)]">
                  <CheckCircle2 className="size-5" />
                </div>
                <div className="mt-4 font-display text-lg font-semibold">Verifizierte Preise</div>
                <p className="mt-1 text-sm text-foreground/70">
                  Preise stammen aus echten Abrechnungsdaten unserer Nutzer:innen, nicht aus Marketing-Seiten.
                </p>
              </div>
              <div>
                <div className="grid size-11 place-items-center rounded-2xl bg-primary/15 text-primary">
                  <Star className="size-5" />
                </div>
                <div className="mt-4 font-display text-lg font-semibold">Neutralität</div>
                <p className="mt-1 text-sm text-foreground/70">
                  Sichtbarkeit ist käuflich, Bewertungen und verifizierte Preisdaten nie. Gesponsertes ist klar gekennzeichnet.
                </p>
              </div>
              <div>
                <div className="grid size-11 place-items-center rounded-2xl bg-[color:var(--accent-coral,#FF7A66)]/15 text-[color:var(--accent-coral,#FF7A66)]">
                  <MapPin className="size-5" />
                </div>
                <div className="mt-4 font-display text-lg font-semibold">DACH-Fokus</div>
                <p className="mt-1 text-sm text-foreground/70">
                  Preise in Euro, deutschsprachige Beschreibungen und Hinweise zu Datenschutz und Sitz.
                </p>
              </div>
            </div>
            <div className="mt-8">
              <a
                href="/badge"
                className="inline-flex items-center gap-1.5 rounded-2xl border border-border bg-background px-4 py-2.5 text-sm font-semibold hover:bg-accent transition-colors"
              >
                Mehr zum Vertrauens-Badge <ArrowRight className="size-4" />
              </a>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Kuratierte Collections */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-16 sm:pb-20">
        <Reveal>
          <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight">Kuratierte Collections</h2>
          <p className="mt-2 text-foreground/70 max-w-2xl">
            Handverlesene Listen für typische Situationen. Gut für Entdeckung und zum schnellen Einstieg.
          </p>
        </Reveal>
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {collections.map((c, i) => (
            <Reveal key={c.title} delay={i * 40}>
              <a
                href={`/verzeichnis#collection-${c.title.toLowerCase().replace(/\s+/g, "-")}`}
                className="group block rounded-3xl p-6 shadow-soft hover:shadow-lift hover:-translate-y-0.5 transition-all h-full text-foreground"
                style={{ background: `${c.color}10`, border: `1px solid ${c.color}33` }}
              >
                <span
                  className="inline-block rounded-full px-2 py-0.5 text-xs font-semibold"
                  style={{ background: `${c.color}22`, color: c.color }}
                >
                  {c.tag}
                </span>
                <div className="mt-3 font-display text-lg font-semibold">{c.title}</div>
                <p className="mt-2 text-sm text-foreground/70">{c.desc}</p>
                <div className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold" style={{ color: c.color }}>
                  Liste öffnen <ArrowRight className="size-4" />
                </div>
              </a>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Schwungrad-Brücke zum Tracker */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-20">
        <Reveal>
          <div
            className="relative overflow-hidden rounded-3xl p-8 sm:p-12 text-primary-foreground"
            style={{
              background:
                "linear-gradient(135deg, #6C5CE7 0%, #5849c4 60%, #FF7A66 130%)",
            }}
          >
            <div className="relative z-10 max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur px-3 py-1 text-xs font-semibold uppercase tracking-wide">
                <Layers className="size-3.5" />
                Vom Finden zum Verwalten
              </div>
              <h2 className="mt-4 font-display text-3xl sm:text-4xl font-semibold leading-tight">
                Du hast dein Tool gefunden? Behalte mit Toolfolio den Überblick über alle deine Abos.
              </h2>
              <p className="mt-3 text-primary-foreground/85">
                Verträge, Kündigungsfristen, Seats und Kosten an einem Ort. Mit verifizierten Preisen, die direkt zurück ins Verzeichnis fließen.
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
