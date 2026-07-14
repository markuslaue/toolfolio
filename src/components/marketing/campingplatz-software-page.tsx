import { useMemo, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  BellRing,
  Building2,
  Calendar,
  ChevronRight,
  Circle,
  Command,
  CreditCard,
  FileText,
  Globe2,
  Landmark,
  MapPin,
  Quote,
  Search,
  ShieldCheck,
  Star,
  Sparkles,
  Tent,
  TrendingUp,
  Users,
  Wifi,
  Zap,
} from "lucide-react";
import { Nav, Footer, Reveal } from "./marketing-home";
import heroBg from "@/assets/campingplatz-hero-bg.jpg";
import { CollectionFinder, campingplatzFinderConfig } from "./collection-finder";

// ─── Content model ────────────────────────────────────────────────────────────

type Tool = {
  rank: number;
  slug: string;
  name: string;
  vendor: string;
  initials: string;
  desc: string;
  features: string[];
  price?: string;
  priceNote?: string;
  rating: number; // 0..5
  reviews: number;
  toolfolioUsers: number;
};

const clusterSlug = "gastro-hotel-freizeit";
const clusterName = "Gastro, Hotel & Freizeit";
const category = "Campingplatz Software";
const categorySlug = "campingplatz-software";
const accent = "#12B76A"; // camping = grün. Passt zu Toolfolio-Palette.

const tools: Tool[] = [
  {
    rank: 1,
    slug: "eviivo-suite",
    name: "eviivo Suite",
    vendor: "eviivo",
    initials: "EV",
    desc:
      "All-in-One Plattform zur Verwaltung von Unterkünften. Bündelt Buchungen, Kanäle, Gästekommunikation, Zahlungen und Auswertungen an einem Ort. Für Hotels, Ferienunterkünfte und Campingplätze.",
    features: [
      "Channel Manager für alle Vertriebskanäle",
      "Direktbuchungsmaschine und Website Manager",
      "KI-gestützte Gästekommunikation",
      "Automatisierung von Betriebsabläufen",
    ],
    rating: 4.6,
    reviews: 128,
    toolfolioUsers: 342,
  },
  {
    rank: 2,
    slug: "resavio",
    name: "RESAVIO",
    vendor: "RESAVIO",
    initials: "RE",
    desc:
      "Cloud-basiertes Property-Management-System mit Online-Buchungssystem für Unterkünfte aller Art, darunter Campingplätze. Vereint Verwaltung, Channel Management und digitale Gästemappe in einer Lösung.",
    features: [
      "Unterkunft-Verwaltung",
      "Channel Manager",
      "Online-Buchungssystem",
      "Digitale Gästemappe mit Online-Checkin und Checkout",
    ],
    rating: 4.4,
    reviews: 87,
    toolfolioUsers: 254,
  },
  {
    rank: 3,
    slug: "easycamp",
    name: "EASYCAMP",
    vendor: "agila.group",
    initials: "EA",
    desc:
      "Modulare Software zur Verwaltung von Campingplätzen. Deckt Standardfunktionen der Platzverwaltung ab und lässt sich über Erweiterungsmodule und Schnittstellen individuell anpassen.",
    features: ["Schrankensteuerung", "Dauercamper-Verwaltung", "Self-Service Gästeportal", "Zutrittssysteme"],
    rating: 4.7,
    reviews: 214,
    toolfolioUsers: 489,
  },
  {
    rank: 4,
    slug: "c1-manager",
    name: "c1:Manager",
    vendor: "jawigo (Dietmar Jank...)",
    initials: "C1",
    desc:
      "Modulare Verwaltungssoftware für Campingplätze und Freizeitanlagen. Unterstützt bei der Betriebsverwaltung und digitalisiert Buchungsprozesse der Gäste.",
    features: ["Modularer Aufbau", "Onlinebuchung", "Dauercampermodul", "Mehrplatzmodul"],
    rating: 4.2,
    reviews: 63,
    toolfolioUsers: 178,
  },
  {
    rank: 5,
    slug: "compusoft",
    name: "CompuSoft",
    vendor: "CompuSoft",
    initials: "CO",
    desc:
      "All-in-One Buchungssystem für Campingplätze, Ferienparks und Attraktionen. Bündelt Buchung, Gästeverwaltung und den täglichen Betrieb, um Abläufe zu automatisieren und mehr Direktbuchungen zu erzielen.",
    features: [
      "Buchungssystem und Gästeverwaltung",
      "Onlinebuchung und OTA-Anbindung",
      "Selbstbedienung und Gäste-App",
      "Dynamische Preisgestaltung",
    ],
    rating: 4.3,
    reviews: 94,
    toolfolioUsers: 213,
  },
  {
    rank: 6,
    slug: "mycampsoft",
    name: "MyCampSoft",
    vendor: "guweb.software",
    initials: "MY",
    desc:
      "Cloudbasierte Komplettlösung zur Verwaltung von Campingplätzen. Deckt Reservierungen, Gästemanagement, Belegungsplanung und Rechnungsstellung ab.",
    features: [
      "Eigene Online-Buchungsstrecke",
      "An- und Abreiseplanung",
      "Gästemanager von Anfrage bis Reservierung",
      "Grafischer und tabellarischer Belegungsplan",
    ],
    rating: 4.1,
    reviews: 52,
    toolfolioUsers: 141,
  },
  {
    rank: 7,
    slug: "camping-care",
    name: "Camping.care",
    vendor: "Camping.care",
    initials: "CA",
    desc:
      "Cloudbasierte All-in-One Plattform für Campingplätze und Outdoor-Betriebe. Reservierung, Objektverwaltung, Buchung und viele weitere Funktionen in einem System. Über zahlreiche Apps und Integrationen erweiterbar.",
    features: [
      "Property Management System (PMS)",
      "Online Booking Engine",
      "Kostenloses Konto für kleine Campingplätze",
    ],
    price: "Listenpreis",
    priceNote: "Stand 13.07.2026",
    rating: 4.5,
    reviews: 108,
    toolfolioUsers: 297,
  },
  {
    rank: 8,
    slug: "campsite-os",
    name: "Campsite OS",
    vendor: "Campsite OS",
    initials: "CO",
    desc:
      "Software für Campingplätze, die den gesamten Ablauf von der Buchung über den Check-in bis zur Abrechnung in einer Plattform abbildet. Bindet zusätzlich IoT-Geräte wie Stromzähler und Schranken ein.",
    features: [
      "Buchungsverwaltung mit interaktiver Platzkarte",
      "Gästemanagement mit Buchungshistorie",
      "GoBD-konforme Rechnungen und DATEV-Export",
      "Channel Manager für Portale",
    ],
    rating: 3.9,
    reviews: 41,
    toolfolioUsers: 96,
  },
];

const toc = [
  { id: "leistet", label: "Was sie wirklich leistet" },
  { id: "funktionen", label: "Diese Funktionen zählen" },
  { id: "auswahl", label: "Worauf achten" },
  { id: "preise", label: "Preismodelle" },
  { id: "fehler", label: "Typische Fehler" },
  { id: "recht", label: "Rechtliches DACH" },
  { id: "vorgehen", label: "So gehst du vor" },
];

// ─── Small building blocks ────────────────────────────────────────────────────

function Stat({ label, value, accentColor }: { label: string; value: string; accentColor?: string }) {
  return (
    <div className="rounded-xl border border-border/70 bg-card/70 px-3 py-2 backdrop-blur">
      <div className="text-[10px] font-semibold uppercase tracking-widest text-foreground/50">{label}</div>
      <div className="mt-0.5 font-display text-base font-semibold tabular-nums" style={accentColor ? { color: accentColor } : undefined}>
        {value}
      </div>
    </div>
  );
}

function SectionHeader({ eyebrow, title, id }: { eyebrow: string; title: string; id?: string }) {
  return (
    <div id={id} className="scroll-mt-32">
      <div className="text-[11px] font-semibold uppercase tracking-widest text-foreground/50">{eyebrow}</div>
      <h2 className="mt-1 font-display text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight leading-[1.1]">
        {title}
      </h2>
    </div>
  );
}

function Prose({ children }: { children: React.ReactNode }) {
  return <div className="mt-5 space-y-4 text-foreground/80 leading-relaxed text-[15.5px] max-w-3xl">{children}</div>;
}

function FeatureCard({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-soft hover:shadow-lift transition-shadow">
      <div className="flex items-start gap-3">
        <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary shrink-0">
          <Icon className="size-5" />
        </span>
        <div>
          <div className="font-display text-base font-semibold">{title}</div>
          <p className="mt-1.5 text-sm text-foreground/70 leading-relaxed">{children}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function CampingplatzSoftwarePage() {
  const [query] = useState("");
  const [finderOpen, setFinderOpen] = useState(false);

  const openFinder = () => {
    setFinderOpen(true);
    // Sicherstellen, dass zur Finder-Sektion gescrollt wird (auch bei bereits offen).
    requestAnimationFrame(() => {
      document.getElementById("finder")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tools;
    return tools.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.vendor.toLowerCase().includes(q) ||
        t.desc.toLowerCase().includes(q) ||
        t.features.some((f) => f.toLowerCase().includes(q)),
    );
  }, [query]);

  return (
    <div id="top" className="min-h-screen bg-[color:var(--paper)] text-foreground">
      <Nav />

      {/* Preview-Hinweisstreifen (kann entfernt werden, bleibt hier als Vorlage-Marker) */}
      <div className="border-b border-dashed border-[#F5A623]/50 bg-[#F5A623]/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs text-[#8a5d0e]">
          <div className="inline-flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-md bg-[#F5A623]/25 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest">
              Vorschau
            </span>
            <span className="font-medium">
              Collection: <span className="font-semibold">entwurf</span> · Von der KI geschrieben, noch nicht geprüft.
            </span>
          </div>
          <div className="tabular-nums font-mono opacity-80">1282 Wörter · 8 Produkte · 8 ungeprüft</div>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-6">
        <nav aria-label="Brotkrumen" className="text-xs sm:text-sm text-foreground/55">
          <ol className="flex items-center gap-1.5 flex-wrap">
            <li>
              <a href="/verzeichnis" className="hover:text-foreground">Verzeichnis</a>
            </li>
            <li aria-hidden><ChevronRight className="size-3.5" /></li>
            <li>
              <a href={`/verzeichnis/${clusterSlug}`} className="hover:text-foreground">{clusterName}</a>
            </li>
            <li aria-hidden><ChevronRight className="size-3.5" /></li>
            <li className="text-foreground font-medium">{category}</li>
          </ol>
        </nav>
      </div>

      {/* Hero */}
      <section className="relative isolate overflow-hidden">
        {/* Foto-Hintergrund (kategoriegebunden) */}
        <div
          aria-hidden
          className="absolute inset-0 -z-20 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroBg})`, filter: "blur(2px) saturate(100%)", transform: "scale(1.03)" }}
        />
        {/* Wash: hebt Text und Widget lesbar hervor */}
        <div
          aria-hidden
          className="absolute inset-0 -z-10"
          style={{
            background:
              `linear-gradient(180deg, color-mix(in oklab, var(--paper) 35%, transparent) 0%, color-mix(in oklab, var(--paper) 60%, transparent) 60%, var(--paper) 100%), ` +
              `radial-gradient(58% 55% at 12% 10%, ${accent}18, transparent 65%), ` +
              `radial-gradient(45% 45% at 95% 5%, #6C5CE710, transparent 60%)`,
          }}
        />
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 -z-10 h-full opacity-[0.14]"
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
                    style={{ color: accent }}
                  >
                    <Tent className="size-3.5" />
                    Kategorie · {clusterName}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-foreground/[0.04] px-2.5 py-1 text-[11px] font-semibold text-foreground/60">
                    <Circle className="size-1.5 fill-[color:var(--success)] text-[color:var(--success)]" />
                    Live-Verzeichnis · zuletzt aktualisiert 13.07.2026
                  </span>
                </div>
              </Reveal>

              <Reveal delay={80}>
                <h1 className="mt-5 font-display text-4xl sm:text-5xl md:text-6xl font-semibold leading-[1.02] tracking-tight max-w-3xl">
                  Campingplatz Software im Vergleich
                </h1>
              </Reveal>

              <Reveal delay={140}>
                <p className="mt-5 max-w-2xl text-base sm:text-lg text-foreground/70 leading-relaxed">
                  Verwaltet Stellplätze, Buchungen, Gästemeldungen und Abrechnung an einer Stelle statt in drei
                  getrennten Systemen und einem Belegungsplan aus Papier. Unten findest du 8 konkrete Tools, danach
                  erklären wir, was diese Systeme wirklich leisten, was du bezahlst und wo du beim Auswählen aufpassen musst.
                </p>
              </Reveal>

              <Reveal delay={200}>
                <div className="mt-7 max-w-2xl">
                  <div className="relative group">
                    <div
                      aria-hidden
                      className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity"
                      style={{ background: `linear-gradient(135deg, ${accent}, #6C5CE7)`, filter: "blur(14px)" }}
                    />
                    <div className="relative flex items-center gap-2 rounded-2xl border border-border bg-card pl-4 pr-2 py-2 shadow-lift">
                      <Search className="size-5 text-foreground/50 shrink-0" />
                      <input
                        type="search"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Im Vergleich suchen · z. B. Dauercamper, Channel Manager, GoBD"
                        className="w-full bg-transparent py-2.5 text-base focus:outline-none placeholder:text-foreground/45"
                        aria-label="Campingplatz Software durchsuchen"
                      />
                      <kbd className="hidden sm:inline-flex items-center gap-1 rounded-lg border border-border bg-background px-2 py-1 text-[10px] font-semibold text-foreground/50">
                        <Command className="size-3" /> K
                      </kbd>
                      <a
                        href="#ranking"
                        className="inline-flex items-center gap-1 rounded-xl bg-foreground text-[color:var(--paper)] px-3.5 py-2 text-sm font-semibold hover:opacity-90"
                      >
                        Vergleichen <ArrowRight className="size-4" />
                      </a>
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>

            {/* Snapshot widget */}
            <Reveal delay={240}>
              <div className="relative rounded-3xl border border-border bg-card p-5 sm:p-6 shadow-lift">
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-foreground/50">
                    <Zap className="size-3.5" style={{ color: accent }} /> Kategorie-Snapshot
                  </div>
                  <span className="text-[10px] font-mono text-foreground/40">/{categorySlug}</span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2.5">
                  <Stat label="Anbieter" value="8" />
                  <Stat label="DACH-Fokus" value="Ja" accentColor={accent} />
                  <Stat label="Cloud-basiert" value="7 / 8" />
                  <Stat label="Kassenpflicht" value="DE + AT" accentColor="#F5A623" />
                </div>

                <div className="mt-4 rounded-2xl bg-foreground text-[color:var(--paper)] p-4">
                  <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest opacity-70">
                    <TrendingUp className="size-3.5" /> Marktsignal
                  </div>
                  <div className="mt-1.5 text-sm leading-snug">
                    Wachsende Nachfrage nach <span className="font-semibold" style={{ color: accent }}>Dauercamper-Modulen</span> und{" "}
                    <span className="font-semibold text-white">IoT-Anbindung</span> (Schranke, Stromzähler).
                  </div>
                  <svg viewBox="0 0 200 40" className="mt-3 w-full h-9" aria-hidden>
                    <defs>
                      <linearGradient id="spark-camp" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor={accent} stopOpacity="0.6" />
                        <stop offset="100%" stopColor={accent} stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path d="M0,32 L20,30 L40,26 L60,22 L80,24 L100,18 L120,20 L140,12 L160,14 L180,8 L200,6 L200,40 L0,40 Z" fill="url(#spark-camp)" />
                    <path d="M0,32 L20,30 L40,26 L60,22 L80,24 L100,18 L120,20 L140,12 L160,14 L180,8 L200,6" fill="none" stroke={accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Sticky Sub-Nav */}
      <div className="sticky top-16 z-30 border-y border-border/70 bg-[color:var(--paper)]/85 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex items-center gap-1 overflow-x-auto py-2 text-sm">
            <a href="#ranking" className="shrink-0 rounded-full px-3 py-1.5 font-semibold text-foreground/80 hover:text-foreground hover:bg-foreground/[0.05]">
              Tool-Ranking
            </a>
            {toc.map((a) => (
              <a
                key={a.id}
                href={`#${a.id}`}
                className="shrink-0 rounded-full px-3 py-1.5 text-foreground/60 hover:text-foreground hover:bg-foreground/[0.05] font-medium"
              >
                {a.label}
              </a>
            ))}
            <div className="ml-auto hidden md:flex items-center gap-2 text-xs text-foreground/50">
              <ShieldCheck className="size-3.5" style={{ color: accent }} />
              Serverseitig sortiert · nicht käuflich
            </div>
          </div>
        </div>
      </div>

      {/* Premium Featured Slot (Anzeige) — freigestellt, klar als Werbung markiert */}
      <section id="premium" className="scroll-mt-32 mx-auto max-w-7xl px-4 sm:px-6 pt-10">
        <Reveal>
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-foreground/50">
              <Sparkles className="size-3.5" style={{ color: "#F5A623" }} />
              Zone 00 · Premium-Platzierung
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#F5A623]/40 bg-[#F5A623]/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-[#8a5d0e]">
              Anzeige
            </span>
          </div>

          <article
            className="relative overflow-hidden rounded-3xl border border-[#F5A623]/40 bg-card shadow-lift"
            style={{
              backgroundImage:
                "radial-gradient(120% 90% at 0% 0%, rgba(245,166,35,0.10), transparent 55%), radial-gradient(90% 80% at 100% 100%, rgba(108,92,231,0.08), transparent 60%)",
            }}
          >

            <div className="grid lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,1fr)] gap-0">
              {/* Content */}
              <div className="p-6 sm:p-8 lg:p-10">
                <div className="flex items-center gap-3">
                  <span
                    className="grid size-14 place-items-center rounded-2xl font-display text-lg font-bold text-white shadow-soft"
                    style={{ background: "linear-gradient(135deg, #12B76A, #059669)" }}
                    aria-hidden
                  >
                    EV
                  </span>
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-widest text-foreground/50">
                      eviivo · Premium Partner
                    </div>
                    <h3 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight">
                      eviivo Suite
                    </h3>
                  </div>
                </div>

                <p className="mt-5 text-base text-foreground/75 leading-relaxed max-w-xl">
                  All-in-One Plattform für Campingplätze, Ferienunterkünfte und Hotels: Buchungen, Kanäle,
                  Gästekommunikation und Zahlungen bündeln — mit KI-Assistenz und Direktbuchungsmaschine.
                </p>

                <ul className="mt-5 grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm text-foreground/80">
                  {[
                    "Channel Manager (Booking, ACSI, Camping.info)",
                    "Direktbuchungsmaschine + Website Builder",
                    "KI-gestützte Gästekommunikation",
                    "Automatisierte Betriebsabläufe & Reports",
                  ].map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <span className="mt-1.5 size-1.5 rounded-full bg-[color:var(--success)] shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-7 flex flex-wrap items-center gap-3">
                  <a
                    href="#"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-foreground text-[color:var(--paper)] px-4 py-2.5 text-sm font-semibold hover:opacity-90"
                  >
                    Zum Anbieter <ArrowUpRight className="size-4" />
                  </a>
                  <a
                    href="#"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background/60 px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-background"
                  >
                    Details ansehen <ArrowRight className="size-4" />
                  </a>
                  <span className="inline-flex items-center gap-1.5 text-xs text-foreground/55">
                    <ShieldCheck className="size-3.5" style={{ color: accent }} />
                    Verifiziertes Profil · DACH-Support
                  </span>
                </div>
              </div>

              {/* Meta Panel */}
              <aside className="border-t lg:border-t-0 lg:border-l border-border bg-background/40 p-6 sm:p-8 lg:p-10 flex flex-col gap-5">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-widest text-foreground/50">
                    Bewertung
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="flex" aria-hidden>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="size-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <span className="font-display text-lg font-semibold">4.6</span>
                    <span className="text-xs text-foreground/55">(128 Reviews)</span>
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-widest text-foreground/50">
                    Toolfolio-Nutzer
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <Users className="size-4 text-foreground/60" />
                    <span className="font-display text-lg font-semibold tabular-nums">342</span>
                    <span className="text-xs text-foreground/55">verwenden dieses Tool</span>
                  </div>
                </div>

                <div className="rounded-2xl border border-border bg-card p-4">
                  <div className="text-[10px] font-semibold uppercase tracking-widest text-foreground/50">
                    Warum hier?
                  </div>
                  <p className="mt-1.5 text-xs text-foreground/70 leading-relaxed">
                    Dieser Platz ist eine <span className="font-semibold text-foreground">bezahlte Anzeige</span>{" "}
                    und beeinflusst nicht das organische Ranking unten. Anbieter buchen Premium-Platzierungen
                    transparent im Toolfolio-Anbieterportal.
                  </p>
                </div>
              </aside>
            </div>
          </article>
        </Reveal>
      </section>

      {/* Tool ranking */}
      <section id="ranking" className="scroll-mt-32 mx-auto max-w-7xl px-4 sm:px-6 pt-12 pb-16">
        <Reveal>
          <div className="flex items-end justify-between gap-4 flex-wrap mb-6">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-widest text-foreground/50">Zone 01 · Organisch</div>
              <h2 className="mt-1 font-display text-3xl sm:text-4xl font-semibold tracking-tight">
                8 Tools im Vergleich
              </h2>
              <p className="mt-1 text-sm text-foreground/60 max-w-2xl">
                Serverseitig sortiert nach Vollständigkeit und verifizierten Bewertungen. Nicht käuflich.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-sm">
              <span className="tabular-nums font-semibold">{filtered.length}</span>
              <span className="text-foreground/50">von {tools.length} Tools</span>
            </div>
          </div>
        </Reveal>

        <div className="flex flex-col gap-4">
          {filtered.map((t, i) => {
            const detailHref = `/verzeichnis/${clusterSlug}/${categorySlug}/tool/${t.slug}`;
            const palette = [
              "#12B76A", // green
              "#2563EB", // blue
              "#F59E0B", // amber
              "#EC4899", // pink
              "#8B5CF6", // violet
              "#06B6D4", // cyan
              "#EF4444", // red
              "#0EA5E9", // sky
            ];
            const tone = palette[(t.rank - 1) % palette.length];
            return (
              <Reveal key={t.slug} delay={i * 20}>
                <article className="group relative rounded-3xl border border-border bg-card overflow-hidden shadow-soft hover:shadow-lift hover:-translate-y-0.5 hover:border-foreground/20 transition-all">
                  {/* Rank accent bar */}
                  <div
                    className="absolute left-0 top-0 bottom-0 w-1.5 opacity-80 group-hover:opacity-100 transition-opacity"
                    style={{ background: tone }}
                    aria-hidden
                  />
                  {/* Soft tint wash */}
                  <div
                    className="absolute inset-0 opacity-[0.035] pointer-events-none"
                    style={{ background: `radial-gradient(120% 80% at 0% 0%, ${tone} 0%, transparent 55%)` }}
                    aria-hidden
                  />
                  <div className="relative grid lg:grid-cols-[minmax(260px,1.1fr)_minmax(0,2fr)_minmax(200px,1fr)_auto] gap-5 lg:gap-8 items-stretch p-5 sm:p-6 pl-6 sm:pl-7">
                    {/* Column 1: Identity */}
                    <div className="flex items-start gap-4 min-w-0">
                      <div className="flex flex-col items-center gap-1.5 shrink-0">
                        <span
                          className="grid size-14 place-items-center rounded-2xl font-display text-base font-bold tracking-wide ring-1"
                          style={{ background: `${tone}18`, color: tone, boxShadow: `inset 0 0 0 1px ${tone}25` }}
                          aria-hidden
                        >
                          {t.initials}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-md bg-foreground/[0.05] px-1.5 py-0.5 text-[10px] font-mono font-bold tabular-nums text-foreground/60">
                          #{String(t.rank).padStart(2, "0")}
                        </span>
                      </div>
                      <div className="min-w-0 pt-0.5">
                        <a
                          href={detailHref}
                          className="font-display text-xl font-semibold leading-tight hover:text-primary transition-colors block truncate"
                        >
                          {t.name}
                        </a>
                        <div className="mt-0.5 flex items-center gap-1.5 text-[12px] text-foreground/55">
                          <Building2 className="size-3 shrink-0" />
                          <span className="truncate">{t.vendor}</span>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-1">
                          <span className="inline-flex items-center gap-1 rounded-md border border-border bg-background/60 px-1.5 py-0.5 text-[10px] font-medium text-foreground/60">
                            <Tent className="size-2.5" /> Campingplatz
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-md border border-border bg-background/60 px-1.5 py-0.5 text-[10px] font-medium text-foreground/60">
                            Cloud
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Column 2: Description + features */}
                    <div className="min-w-0 lg:border-l lg:border-border/70 lg:pl-6 xl:pl-8">
                      <p className="text-[13.5px] leading-relaxed text-foreground/75 line-clamp-3">
                        {t.desc}
                      </p>
                      <div className="mt-3">
                        <div className="text-[10px] font-semibold uppercase tracking-widest text-foreground/45 mb-1.5">
                          Kernfunktionen
                        </div>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
                          {t.features.map((f) => (
                            <li key={f} className="flex items-start gap-1.5 text-[12.5px] text-foreground/75">
                              <span
                                className="mt-1.5 size-1.5 shrink-0 rounded-full"
                                style={{ background: tone }}
                                aria-hidden
                              />
                              <span className="truncate">{f}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Column 3: Meta / price */}
                    <div className="lg:border-l lg:border-border/70 lg:pl-6 flex flex-col gap-3 justify-center">
                      {/* Rating */}
                      <div>
                        <div className="text-[10px] font-semibold uppercase tracking-widest text-foreground/45">Bewertung</div>
                        <div className="mt-1 flex items-center gap-1.5">
                          <div className="flex items-center" aria-label={`${t.rating.toFixed(1)} von 5`}>
                            {[0, 1, 2, 3, 4].map((idx) => {
                              const fill = Math.max(0, Math.min(1, t.rating - idx));
                              return (
                                <span key={idx} className="relative inline-block size-3.5">
                                  <Star className="absolute inset-0 size-3.5 text-foreground/15" strokeWidth={2} />
                                  <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
                                    <Star className="size-3.5 fill-amber-400 text-amber-400" strokeWidth={2} />
                                  </span>
                                </span>
                              );
                            })}
                          </div>
                          <span className="font-display text-sm font-semibold tabular-nums">{t.rating.toFixed(1)}</span>
                          <span className="text-[11px] text-foreground/50">({t.reviews})</span>
                        </div>
                      </div>

                      {/* Toolfolio users */}
                      <div className="flex items-center gap-2.5 rounded-xl border border-border/70 bg-background/50 px-2.5 py-2">
                        <span
                          className="grid size-8 place-items-center rounded-lg shrink-0"
                          style={{ background: `${tone}18`, color: tone }}
                          aria-hidden
                        >
                          <Users className="size-4" />
                        </span>
                        <div className="min-w-0">
                          <div className="font-display text-sm font-semibold tabular-nums leading-tight">
                            {t.toolfolioUsers.toLocaleString("de-DE")}
                          </div>
                          <div className="text-[10.5px] text-foreground/55 leading-tight">Toolfolio-Nutzer</div>
                        </div>
                      </div>

                      {/* Price */}
                      <div>
                        <div className="text-[10px] font-semibold uppercase tracking-widest text-foreground/45">Preis</div>
                        {t.price ? (
                          <div className="mt-0.5 font-display text-base font-semibold tabular-nums">{t.price}</div>
                        ) : (
                          <div className="mt-0.5 text-sm font-semibold text-foreground/70">Auf Anfrage</div>
                        )}
                        {t.priceNote && (
                          <a href="#preise" className="inline-flex items-center gap-1 text-[11px] text-foreground/50 hover:text-foreground">
                            {t.priceNote} <ArrowUpRight className="size-3" />
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Column 4: Action */}
                    <div className="flex lg:flex-col items-stretch justify-end gap-2 lg:min-w-[150px]">
                      <a
                        href={detailHref}
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-foreground text-[color:var(--paper)] px-4 py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity"
                      >
                        Details <ArrowRight className="size-4" />
                      </a>
                      <a
                        href="#preise"
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-border bg-background/60 px-4 py-2.5 text-sm font-medium text-foreground/80 hover:border-foreground/30 hover:text-foreground transition-colors"
                      >
                        Preise
                      </a>
                    </div>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* Content: Was leistet + Funktionen */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-16">
        <div className="grid lg:grid-cols-[1.4fr_1fr] gap-10">
          <Reveal>
            <SectionHeader eyebrow="Grundverständnis" title="Was eine Campingplatz Software wirklich leistet" id="leistet" />
            <Prose>
              <p>
                Eine Campingplatz Software ist im Kern ein Verwaltungssystem, das drei Dinge zusammenbringt: die
                Belegung deiner Stellplätze und Unterkünfte, die Buchungen deiner Gäste und die Abrechnung. Klingt simpel,
                ist es aber nicht, weil ein Campingplatz eine andere Logik hat als ein Hotel. Du hast Stellplätze in
                verschiedenen Kategorien, Mietunterkünfte, Dauercamper, Saisongäste, Kurzbucher und oft noch einen Kiosk
                oder Restaurant. All das muss die Software abbilden, ohne dass du an der Rezeption zwischen fünf
                Programmen springst.
              </p>
              <p>
                Der eigentliche Wert liegt nicht im schönen Kalender, sondern darin, dass eine Buchung nur einmal
                erfasst wird und dann alles Weitere automatisch passiert: Stellplatz wird geblockt, Gastdaten wandern
                in die Meldung, die Rechnung entsteht mit korrekter Kurtaxe, und die Zahlung wird zugeordnet. Wenn du
                das im Kopf behältst, trennst du bei der Auswahl schnell die Systeme, die den ganzen Prozess denken,
                von denen, die nur eine hübsche Oberfläche für den Belegungsplan sind.
              </p>
            </Prose>
          </Reveal>

          {/* Inhalt / TOC card */}
          <Reveal delay={100}>
            <div className="lg:sticky lg:top-32 rounded-3xl border border-border bg-gradient-to-br from-card to-[color:var(--accent)]/40 p-5 shadow-soft">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-foreground/50">Inhalt</div>
              <div className="mt-1 font-display text-base font-semibold">In diesem Guide</div>
              <ul className="mt-4 space-y-1">
                {toc.map((a, i) => (
                  <li key={a.id}>
                    <a
                      href={`#${a.id}`}
                      className="group flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-foreground/75 hover:bg-card hover:text-foreground transition-colors"
                    >
                      <span className="grid size-6 place-items-center rounded-md bg-foreground/[0.05] text-[10px] font-mono font-bold text-foreground/50 group-hover:bg-foreground group-hover:text-[color:var(--paper)]">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="font-medium">{a.label}</span>
                      <ArrowRight className="ml-auto size-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Funktionen im Alltag */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-16">
        <Reveal>
          <SectionHeader eyebrow="Feature-Deep-Dive" title="Diese Funktionen zählen im Alltag" id="funktionen" />
          <p className="mt-3 max-w-2xl text-foreground/70">
            Nicht die Feature-Liste entscheidet, sondern wie sauber diese fünf Bereiche im echten Betrieb funktionieren.
          </p>
        </Reveal>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <FeatureCard icon={Calendar} title="Belegungsplan und Stellplatzverwaltung">
            Kommt der Plan mit unterschiedlichen Stellplatzgrößen, Strom-Optionen, Wohnmobil-Zufahrt, Unterkünften und
            Zeltwiesen ohne feste Nummern zurecht? Achte auf Drag-and-drop-Umbuchung und Warnung bei Doppelbelegung.
            Hier passieren die teuren Fehler.
          </FeatureCard>
          <FeatureCard icon={Wifi} title="Online-Buchung und Verfügbarkeit">
            Ein Modul, das in Echtzeit mit dem Belegungsplan spricht, spart am meisten Telefon- und Mailarbeit. Prüfe
            Stellplatz-Auswahl durch Gäste und automatische Anzahlungen. Ein reines Anfrageformular ist keine
            Online-Buchung.
          </FeatureCard>
          <FeatureCard icon={FileText} title="Gästemeldung und Meldeschein">
            Elektronische Meldung und Kurtaxe sind DACH-Pflichtprozess. Gute Systeme füllen den Meldeschein aus
            Buchungsdaten vor und übertragen die Kurtaxe an die Gemeinde. Frag nach der Anbindung an dein regionales
            Meldeverfahren.
          </FeatureCard>
          <FeatureCard icon={CreditCard} title="Abrechnung, Kasse und Zahlung">
            Rechnungen mit korrekten Steuersätzen, Kassenfunktion für Kiosk und Rezeption, Zuordnung von
            Online-Zahlungen. Teilzahlungen, Anzahlungen und Endabrechnung bei Verlängerung / Verkürzung müssen sauber
            abgebildet sein.
          </FeatureCard>
          <FeatureCard icon={Users} title="Dauercamper und Saisonverwaltung">
            Jahrespacht, Stromabrechnung nach Zählerstand, Nebenkosten. Viele Systeme sind auf Kurzbucher ausgelegt und
            tun sich mit Dauergästen schwer. Wenn Dauercamper relevant sind, mach das zum Ausschlusskriterium.
          </FeatureCard>
          <FeatureCard icon={Globe2} title="Channel-Anbindung">
            Ohne synchronisierte Verfügbarkeiten kassierst du Doppelbuchungen. Prüfe konkret welche Portale angebunden
            sind und ob das im Basispreis enthalten ist oder als Aufpreis kommt.
          </FeatureCard>
        </div>
      </section>

      {/* Experten-Zitat */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-16">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-lift">
            <div
              aria-hidden
              className="absolute inset-0 opacity-[0.5]"
              style={{
                background: `radial-gradient(50% 60% at 100% 0%, ${accent}14, transparent 60%), radial-gradient(45% 55% at 0% 100%, #6C5CE712, transparent 60%)`,
              }}
            />
            <div className="relative p-6 sm:p-10 grid md:grid-cols-[auto_1fr] gap-6 items-start">
              <div className="flex md:flex-col items-center md:items-start gap-4">
                <div
                  className="grid size-20 place-items-center rounded-3xl font-display text-2xl font-semibold shrink-0"
                  style={{ background: `${accent}20`, color: accent }}
                >
                  ML
                </div>
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-widest text-foreground/50">Toolfolio-Experte</div>
                  <div className="mt-0.5 font-display text-base font-semibold">Markus Laue</div>
                  <div className="text-xs text-foreground/60">Gründer von Toolfolio</div>
                </div>
              </div>
              <div>
                <Quote className="size-8 text-foreground/15" />
                <blockquote className="mt-2 font-display text-lg sm:text-xl leading-snug text-foreground/90">
                  Der häufigste Fehler, den ich sehe: Betriebe wählen die Software nach dem Buchungskalender aus und
                  behandeln die Abrechnung als Nebensache. Genau da geht dann im Alltag die Zeit verloren, weil Kurtaxe,
                  Meldescheine und Rechnungen doppelt gepflegt werden.
                </blockquote>
                <p className="mt-4 text-[15px] text-foreground/70 leading-relaxed">
                  Ich empfehle, den Prozess einmal von der Anreise bis zur Rechnung durchzuspielen — mit echten Fällen
                  wie Dauercamper, Kurzbucher und Gruppen. Was dabei hakt, wird auch im Betrieb haken. Und rechne beim
                  Preis immer die Transaktionsgebühren für Online-Zahlung mit ein, die stehen selten auf der ersten
                  Preisseite.
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Auswahl + Integrationen */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-16">
        <Reveal>
          <SectionHeader eyebrow="Entscheidungshilfe" title="Worauf du bei der Auswahl achten solltest" id="auswahl" />
          <Prose>
            <p>
              Bevor du dir Demos ansiehst, schreib deinen tatsächlichen Prozess auf. Nicht den idealen, sondern den
              echten: Wie kommt eine Buchung rein, wer erfasst sie, was passiert bei Anreise, wie läuft die Abrechnung,
              wie viele Anfragen kommen über welchen Kanal. Genau diesen Ablauf spielst du dann in jeder Demo durch,
              mit deinen eigenen Fällen. Ein System, das im Verkaufsgespräch glänzt, aber deinen Gruppenbucher oder
              deinen Dauercamper nicht sauber abbildet, kostet dich später jeden Tag Zeit.
            </p>
            <p>
              Achte auf Rezeptionstauglichkeit. Die Person am Empfang arbeitet oft in Stresssituationen, mit wartenden
              Gästen. Wenige Klicks bis zur bestätigten Buchung sind mehr wert als jedes Zusatzfeature. Lass die
              Software in der Demo von jemandem bedienen, der später wirklich damit arbeitet — nicht nur vom Chef.
            </p>
            <p>
              Ein unterschätzter Punkt ist die Datenhoheit. Frag, ob du deine Buchungs- und Gästedaten jederzeit
              exportieren kannst und in welchem Format. Wenn du das System irgendwann wechseln willst, entscheidet das
              darüber, ob die Migration ein Nachmittag oder ein Albtraum wird.
            </p>
          </Prose>
        </Reveal>

        <Reveal delay={120}>
          <div className="mt-8 rounded-3xl border border-border bg-card p-6 shadow-soft grid md:grid-cols-[auto_1fr] gap-5">
            <span className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary shrink-0">
              <Globe2 className="size-6" />
            </span>
            <div>
              <div className="font-display text-lg font-semibold">Integrationen und Channel Management</div>
              <p className="mt-2 text-[15px] text-foreground/75 leading-relaxed">
                Wenn du über Buchungsportale oder Camping-spezifische Plattformen verkaufst, brauchst du eine Anbindung,
                die Verfügbarkeiten synchron hält. Ohne diese Synchronisierung kassierst du Doppelbuchungen. Prüfe,
                welche Kanäle konkret angebunden sind und ob das im Basispreis enthalten ist oder als Aufpreis kommt.
                Genauso wichtig: die Anbindung an deine Buchhaltung oder deinen Steuerberater, damit die Umsätze nicht
                per Hand übertragen werden.
              </p>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Preismodelle */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-16">
        <Reveal>
          <SectionHeader eyebrow="Total Cost of Ownership" title="Übliche Preismodelle bei Campingplatz Software" id="preise" />
          <Prose>
            <p>
              Es gibt kein einheitliches Modell, aber ein paar Muster, die du kennen solltest. Verbreitet ist die
              Abrechnung pro Stellplatz beziehungsweise pro verwaltbarer Einheit und Monat. Je größer dein Platz, desto
              teurer — was fair klingt, aber bei großen Plätzen ins Geld geht. Andere Anbieter rechnen als feste
              Monats- oder Jahresgebühr für eine Funktionsstufe, oft gestaffelt nach Umfang.
            </p>
          </Prose>
        </Reveal>

        <Reveal delay={100}>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                tag: "Modell A",
                title: "Pro Stellplatz / Einheit",
                desc: "Skaliert mit Plätzen. Fair für kleine Plätze, wird bei großen Plätzen teuer.",
              },
              {
                tag: "Modell B",
                title: "Feste Monats- oder Jahresgebühr",
                desc: "Nach Funktionsstufe gestaffelt. Planbar, aber Module wie Kasse oder Channel oft extra.",
              },
              {
                tag: "Modell C",
                title: "Transaktionsgebühr Online-Zahlung",
                desc: "Wird fast immer unterschätzt. Bei hohem Online-Anteil oft mehr als die Grundgebühr.",
              },
            ].map((m) => (
              <div key={m.title} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
                <div className="text-[10px] font-semibold uppercase tracking-widest text-foreground/50">{m.tag}</div>
                <div className="mt-1 font-display text-base font-semibold">{m.title}</div>
                <p className="mt-2 text-sm text-foreground/70 leading-relaxed">{m.desc}</p>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal delay={200}>
          <div className="mt-6 rounded-2xl border border-dashed border-border bg-background/50 p-5 text-[15px] text-foreground/80 leading-relaxed max-w-3xl">
            Der Posten, den fast alle unterschätzen, sind die <strong>Transaktionsgebühren bei Online-Zahlung</strong>.
            Rechne das mit deinem realistischen Buchungsvolumen durch, nicht mit dem, was auf der Preisseite steht. Dazu
            kommen oft Einmalkosten für Einrichtung und Datenübernahme, Aufpreise für zusätzliche Module und manchmal
            Gebühren pro Nutzer. <strong>Frag immer nach dem Gesamtpreis</strong> inklusive aller Module, die du wirklich
            brauchst, über ein volles Jahr gerechnet.
          </div>
        </Reveal>
      </section>

      {/* Fehler */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-16">
        <Reveal>
          <SectionHeader eyebrow="Aus der Praxis" title="Fehler, die in der Praxis wirklich passieren" id="fehler" />
        </Reveal>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              num: "01",
              title: "Nach dem Kalender wählen",
              desc: "Abrechnung, Meldewesen und Kassenpflicht werden zur Nebensache. Genau diese drei Themen fressen im Alltag die Zeit, wenn das System sie nicht sauber löst.",
            },
            {
              num: "02",
              title: "Zu groß kaufen",
              desc: "Ein System für die Ferienanlage, obwohl du einen überschaubaren Naturcampingplatz betreibst. Du zahlst für Komplexität, die dich nur ausbremst.",
            },
            {
              num: "03",
              title: "Keine echten Testdaten",
              desc: "Entscheidung nach Optik und Bauchgefühl, statt eine reale Woche mit echten Buchungen nachzustellen.",
            },
            {
              num: "04",
              title: "Migration unterschätzt",
              desc: "Wenn du Dauercamper mit Historie hast, ist der Umzug der Altdaten die eigentliche Arbeit. Kläre vorher, wer das macht und was es kostet.",
            },
          ].map((f) => (
            <Reveal key={f.num} delay={parseInt(f.num) * 40}>
              <div className="group flex gap-4 rounded-3xl border border-border bg-card p-5 hover:shadow-lift transition-shadow h-full">
                <div className="font-display text-4xl font-semibold tabular-nums text-foreground/15 group-hover:text-[color:var(--coral)] transition-colors leading-none">
                  {f.num}
                </div>
                <div>
                  <div className="font-display text-base font-semibold">{f.title}</div>
                  <p className="mt-1.5 text-sm text-foreground/70 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Rechtliches DACH */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-16">
        <Reveal>
          <SectionHeader eyebrow="Compliance" title="Rechtliche Anforderungen in DACH" id="recht" />
          <p className="mt-3 max-w-2xl text-foreground/70">
            Kassenpflicht, Kurtaxe und Datenschutz unterscheiden sich pro Land. Prüfe vor der Auswahl, ob der Anbieter
            zertifiziert oder nachweislich konform ist.
          </p>
        </Reveal>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              flag: "DE",
              country: "Deutschland",
              icon: Building2,
              body: "Kassenpflicht ist das zentrale Thema. Elektronische Kassen brauchen technische Sicherheitseinrichtung und Belegausgabe. Software muss Exporte für die Kassennachschau liefern. Dazu Kurtaxe je Gemeinde und elektronische Gästemeldung.",
            },
            {
              flag: "AT",
              country: "Österreich",
              icon: Landmark,
              body: "Registrierkassen- und Belegerteilungspflicht. Kasse braucht Signaturerstellungseinheit. Ortstaxe regional geregelt. Prüfe, ob die Software für den österreichischen Markt zertifiziert / konform ist — nicht automatisch bei jedem Anbieter.",
            },
            {
              flag: "CH",
              country: "Schweiz",
              icon: MapPin,
              body: "Kassenanforderungen weniger streng. Korrekte Mehrwertsteuerbehandlung und Kurtaxe je Kanton und Gemeinde müssen sauber abgebildet sein. Bei grenzüberschreitender Nutzung ist Mehrwährungsfähigkeit praktisch.",
            },
          ].map((c) => (
            <Reveal key={c.flag}>
              <div className="rounded-3xl border border-border bg-card p-6 shadow-soft h-full">
                <div className="flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-xl bg-foreground text-[color:var(--paper)] font-mono text-[11px] font-bold">
                    {c.flag}
                  </span>
                  <div>
                    <div className="font-display text-lg font-semibold">{c.country}</div>
                    <div className="inline-flex items-center gap-1 text-[11px] text-foreground/55">
                      <c.icon className="size-3" /> Regulierung
                    </div>
                  </div>
                </div>
                <p className="mt-4 text-sm text-foreground/75 leading-relaxed">{c.body}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={200}>
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-border bg-[color:var(--accent)]/40 p-4 text-sm text-foreground/80 max-w-3xl">
            <ShieldCheck className="size-5 shrink-0 mt-0.5 text-primary" />
            <p>
              In allen drei Ländern gilt: Datenschutz betrifft dich direkt, weil du Gästedaten und Meldescheine
              verarbeitest. Frag den Anbieter, wo die Daten liegen und ob ein Auftragsverarbeitungsvertrag existiert.
            </p>
          </div>
        </Reveal>
      </section>

      {/* Vorgehen */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-16">
        <Reveal>
          <SectionHeader eyebrow="Playbook" title="So gehst du die Auswahl konkret an" id="vorgehen" />
        </Reveal>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Reveal>
            <div className="rounded-3xl border border-border bg-card p-6 shadow-soft h-full">
              <div className="inline-flex items-center gap-2 rounded-lg bg-primary/10 text-primary px-2.5 py-1 text-[11px] font-bold uppercase tracking-widest">
                Schritt 1
              </div>
              <div className="mt-3 font-display text-xl font-semibold">Ausschlusskriterien definieren</div>
              <p className="mt-2 text-[15px] text-foreground/75 leading-relaxed">
                Kurze Liste mit deinen echten K.o.-Kriterien: Dauercamper ja / nein, Kassenpflicht in deinem Land,
                Anbindung an deine Verkaufskanäle, Datenexport. Alles, was das nicht erfüllt, fällt sofort raus — egal
                wie gut es sonst aussieht.
              </p>
            </div>
          </Reveal>
          <Reveal delay={80}>
            <div className="rounded-3xl border border-border bg-card p-6 shadow-soft h-full">
              <div className="inline-flex items-center gap-2 rounded-lg bg-primary/10 text-primary px-2.5 py-1 text-[11px] font-bold uppercase tracking-widest">
                Schritt 2
              </div>
              <div className="mt-3 font-display text-xl font-semibold">Realen Prozess durchspielen</div>
              <p className="mt-2 text-[15px] text-foreground/75 leading-relaxed">
                Zwei bis drei Kandidaten. Lass die Rezeptionskraft mitmachen, frag nach dem Gesamtpreis über ein Jahr
                inklusive Transaktionsgebühren, lass dir die Migration der Bestandsdaten zeigen. Am Ende entscheidet
                nicht die Funktionsliste, sondern wie viele Handgriffe eine normale Buchung tatsächlich kostet.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Autor */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 pb-16">
        <Reveal>
          <div className="text-[11px] font-semibold uppercase tracking-widest text-foreground/50">Über den Autor</div>
          <div className="mt-3 rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-soft grid sm:grid-cols-[auto_1fr] gap-5 items-start">
            <div
              className="grid size-16 place-items-center rounded-2xl font-display text-xl font-semibold shrink-0"
              style={{ background: `${accent}20`, color: accent }}
            >
              ML
            </div>
            <div>
              <div className="font-display text-lg font-semibold">Markus Laue</div>
              <div className="text-sm text-foreground/60">Gründer von Toolfolio</div>
              <p className="mt-3 text-[15px] text-foreground/75 leading-relaxed">
                Gründer von Toolfolio und Geschäftsführer der OMMM GmbH in Leipzig. Schwerpunkte:
                Software-Kostenmanagement, SaaS-Abonnements und Lizenzmodelle, Toolauswahl für Agenturen und
                Freelancer.
              </p>
              <a
                href="/kontakt"
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-foreground text-[color:var(--paper)] px-4 py-2 text-sm font-semibold hover:opacity-90"
              >
                Schreib mir <ArrowRight className="size-4" />
              </a>
            </div>
          </div>
        </Reveal>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-20">
        <Reveal>
          <div
            className="relative overflow-hidden rounded-[32px] p-8 sm:p-14 text-primary-foreground"
            style={{ background: `linear-gradient(135deg, ${accent} 0%, #0f9c5b 45%, #6C5CE7 130%)` }}
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
                <p className="mt-3 max-w-xl text-primary-foreground/90">
                  Verträge, Abos und Kündigungsfristen an einem Ort — inkl. Transaktionsgebühren-Tracking, damit die
                  wahren Kosten deiner Campingplatz-Software transparent bleiben.
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
                    <Sparkles className="size-3.5" /> Beispielhafte Ersparnis
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <div className="font-display text-3xl font-semibold tabular-nums">312 €</div>
                    <div className="text-sm opacity-80">pro Jahr</div>
                  </div>
                  <div className="mt-3 h-1.5 rounded-full bg-white/20 overflow-hidden">
                    <div className="h-full w-[72%] rounded-full bg-white" />
                  </div>
                  <div className="mt-3 text-xs opacity-80">Durch Wechsel auf Jahresplan + Wegfall Redundanz.</div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      <Footer />
    </div>
  );
}

export default CampingplatzSoftwarePage;
