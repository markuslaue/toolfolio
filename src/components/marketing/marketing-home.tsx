import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Menu,
  X,
  ShieldCheck,
  Sparkles,
  
  CalendarClock,
  Cpu,
  Users,
  BarChart3,
  Tag,
  CheckCircle2,
  Quote,
  Lock,
  Globe2,
  TrendingUp,
  Search,
  Inbox,
  Building2,
  Briefcase,
  User as UserIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const fmtEUR = (n: number) =>
  new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);

function useReveal<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      ([e]) => e.isIntersecting && setShown(true),
      { threshold: 0.12 },
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return { ref, shown };
}

function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const { ref, shown } = useReveal<HTMLDivElement>();
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={cn(
        "transition-all duration-700 ease-out",
        shown ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
        className,
      )}
    >
      {children}
    </div>
  );
}

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { label: "Produkt", href: "#schwungrad" },
    { label: "Verzeichnis", href: "#verzeichnis" },
    { label: "Preise", href: "#preise" },
    { label: "Über uns", href: "#footer" },
  ];

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all",
        scrolled
          ? "backdrop-blur bg-[color:var(--paper)]/85 border-b border-border shadow-soft"
          : "bg-transparent",
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div
          className={cn(
            "flex items-center justify-between transition-all",
            scrolled ? "h-14" : "h-20",
          )}
        >
          <a href="#top" className="flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground font-display text-lg font-bold">
              T
            </span>
            <span className="font-display text-xl font-semibold tracking-tight">
              Toolfolio
            </span>
          </a>

          <nav className="hidden md:flex items-center gap-1">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="rounded-full px-4 py-2 text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-accent transition-colors"
              >
                {l.label}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-2">
            <a
              href="/dashboard"
              className="rounded-full px-4 py-2 text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
            >
              Anmelden
            </a>
            <a
              href="/onboarding"
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft hover:bg-primary/90 hover:shadow-lift transition-all"
            >
              Kostenlos starten <ArrowRight className="size-4" />
            </a>
          </div>

          <button
            className="md:hidden grid size-10 place-items-center rounded-xl border border-border bg-card"
            onClick={() => setOpen((o) => !o)}
            aria-label="Menü"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>

        {open && (
          <div className="md:hidden pb-4 space-y-1">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="block rounded-xl px-4 py-3 text-sm font-medium hover:bg-accent"
              >
                {l.label}
              </a>
            ))}
            <div className="flex gap-2 pt-2">
              <a
                href="/dashboard"
                className="flex-1 rounded-full border border-border px-4 py-2.5 text-center text-sm font-medium"
              >
                Anmelden
              </a>
              <a
                href="/onboarding"
                className="flex-1 rounded-full bg-primary px-4 py-2.5 text-center text-sm font-semibold text-primary-foreground"
              >
                Kostenlos starten
              </a>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

function HeroVisual() {
  return (
    <div className="relative">
      <div className="absolute -inset-8 bg-[radial-gradient(60%_60%_at_50%_40%,color-mix(in_oklab,var(--primary)_18%,transparent),transparent)] blur-2xl" />
      <div className="relative rounded-[28px] border border-border bg-card p-5 shadow-lift">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-success" />
            Live-Cockpit
          </span>
          <span>Oktober</span>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="col-span-2 rounded-2xl bg-secondary/60 p-4">
            <div className="text-xs text-muted-foreground">Monatliche Tool-Kosten</div>
            <div className="mt-1 font-display text-3xl font-semibold tabular">
              {fmtEUR(4280)}
            </div>
            <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-1 text-xs font-semibold text-success">
              <TrendingUp className="size-3 rotate-180" /> 12 % unter Benchmark
            </div>
            <div className="mt-4 h-16 flex items-end gap-1">
              {[40, 55, 48, 62, 70, 58, 65, 72, 68, 60, 55, 50].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t bg-primary/70"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-secondary/60 p-4 flex flex-col items-center justify-center">
            <div className="relative size-24">
              <svg viewBox="0 0 100 100" className="size-24 -rotate-90">
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="color-mix(in oklab, var(--primary) 15%, transparent)"
                  strokeWidth="10"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="var(--success)"
                  strokeWidth="10"
                  strokeDasharray={`${0.68 * 264} 264`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 grid place-items-center">
                <div className="text-center">
                  <div className="font-display text-lg font-semibold tabular">68 %</div>
                  <div className="text-[10px] text-muted-foreground">Spar-Ziel</div>
                </div>
              </div>
            </div>
            <div className="mt-2 text-[11px] text-muted-foreground text-center">
              {fmtEUR(1840)} dieses Jahr gespart
            </div>
          </div>
        </div>

        <div className="mt-3 space-y-2">
          {[
            { name: "Figma", plan: "Team", price: 540, warn: false },
            { name: "Notion", plan: "Plus", price: 96, warn: true },
            { name: "OpenAI", plan: "Credits", price: 184, warn: false },
          ].map((row) => (
            <div
              key={row.name}
              className="flex items-center justify-between rounded-xl bg-secondary/40 px-3 py-2.5"
            >
              <div className="flex items-center gap-2.5">
                <span className="grid size-8 place-items-center rounded-lg bg-card text-xs font-semibold">
                  {row.name[0]}
                </span>
                <div>
                  <div className="text-sm font-medium leading-tight">{row.name}</div>
                  <div className="text-[11px] text-muted-foreground">{row.plan}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {row.warn && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[color:var(--warning)]/15 px-2 py-0.5 text-[10px] font-semibold text-[color:var(--warning)]">
                    <CalendarClock className="size-3" /> Frist 14 T
                  </span>
                )}
                <span className="text-sm font-semibold tabular">{fmtEUR(row.price)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute -left-6 -bottom-6 hidden sm:block rounded-2xl bg-card border border-border shadow-lift p-3 w-48">
        <div className="flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-lg bg-coral/15 text-coral">
            <Sparkles className="size-4" />
          </span>
          <div>
            <div className="text-xs font-semibold">Sparvorschlag</div>
            <div className="text-[11px] text-muted-foreground">Wechsel auf Jahresplan</div>
          </div>
        </div>
        <div className="mt-2 text-sm font-semibold text-success tabular">
          + {fmtEUR(420)} / Jahr
        </div>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section id="top" className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-32 -left-20 size-[480px] rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute top-40 -right-20 size-[420px] rounded-full bg-coral/15 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-12 sm:pt-20 pb-20 sm:pb-28">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <Reveal>
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground">
              <span className="size-1.5 rounded-full bg-coral" />
              Für Agenturen, Freelancer und Solopreneure im DACH-Raum
            </div>
            <h1 className="mt-5 font-display text-4xl sm:text-5xl lg:text-6xl font-semibold leading-[1.05] tracking-tight">
              Alle deine Software-Abos im Griff.{" "}
              <span className="text-primary">Und du sparst dabei.</span>
            </h1>
            <p className="mt-5 text-lg text-muted-foreground max-w-xl">
              Toolfolio ist Tracker und Verzeichnis in einem. Du siehst, was läuft, wirst vor
              Fristen gewarnt und findest günstigere Alternativen mit echten Marktdaten.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href="/onboarding"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3.5 text-base font-semibold text-primary-foreground shadow-soft hover:bg-primary/90 hover:shadow-lift transition-all"
              >
                Kostenlos starten <ArrowRight className="size-4" />
              </a>
              <a
                href="#verzeichnis"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3.5 text-base font-semibold hover:bg-accent transition-colors"
              >
                <Search className="size-4" /> Verzeichnis erkunden
              </a>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="size-4 text-success" /> DSGVO-konform
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Lock className="size-4 text-success" /> Keine Passwörter gespeichert
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Globe2 className="size-4 text-success" /> Made for DACH
              </span>
            </div>
          </Reveal>

          <Reveal delay={150}>
            <HeroVisual />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Problem() {
  const items = [
    {
      title: "Niemand weiß, was monatlich wirklich abzieht.",
      desc: "Abos verteilen sich auf drei Konten und vier Kreditkarten.",
    },
    {
      title: "Verträge verlängern sich still im Hintergrund.",
      desc: "Die Kündigungsfrist verpasst, ein Jahr Bindung kassiert.",
    },
    {
      title: "KI-Credits laufen unbemerkt aus dem Ruder.",
      desc: "Variable Kosten, die kein klassisches Tool sauber abbildet.",
    },
    {
      title: "Bei Agenturen verteilen sich Toolkosten ungeordnet.",
      desc: "Wer zahlt eigentlich für was und welcher Kunde nutzt es?",
    },
  ];
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <div className="max-w-2xl">
            <div className="text-xs font-semibold uppercase tracking-widest text-coral">
              Das Problem
            </div>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl font-semibold tracking-tight">
              Software-Abos sind ein blinder Fleck in deiner Kalkulation.
            </h2>
          </div>
        </Reveal>

        <div className="mt-10 grid sm:grid-cols-2 gap-4">
          {items.map((it, i) => (
            <Reveal key={it.title} delay={i * 80}>
              <div className="rounded-2xl border border-border bg-card p-6 card-lift">
                <div className="flex items-start gap-3">
                  <span className="mt-1 grid size-8 place-items-center rounded-lg bg-coral/15 text-coral text-sm font-bold">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="font-semibold">{it.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{it.desc}</p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Flywheel() {
  const steps = [
    {
      label: "Erfassen",
      desc: "Kontoauszug, Beleg-Postfach oder manuell. Alle Abos kommen rein.",
      icon: Inbox,
      color: "var(--primary)",
    },
    {
      label: "Verstehen",
      desc: "Benchmark und Fristen-Wächter zeigen, wo du zu viel zahlst.",
      icon: BarChart3,
      color: "var(--coral)",
    },
    {
      label: "Handeln",
      desc: "Im Verzeichnis günstigere Alternative finden und wechseln.",
      icon: Search,
      color: "var(--warning)",
    },
    {
      label: "Sparen",
      desc: "Mehr Daten machen die Benchmarks für alle noch besser.",
      icon: Sparkles,
      color: "var(--success)",
    },
  ];

  return (
    <section id="schwungrad" className="py-20 sm:py-28 bg-secondary/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <div className="max-w-3xl">
            <div className="text-xs font-semibold uppercase tracking-widest text-primary">
              Das Schwungrad
            </div>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl font-semibold tracking-tight">
              Tracker und Verzeichnis verstärken sich gegenseitig.
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Je mehr Agenturen mitmachen, desto besser werden Benchmarks und
              Alternativ-Vorschläge. Du profitierst sofort und gibst kleine,
              anonymisierte Signale zurück.
            </p>
          </div>
        </Reveal>

        <div className="mt-14 grid lg:grid-cols-[1fr_1.1fr] gap-12 items-center">
          <Reveal>
            <div className="relative mx-auto aspect-square w-full max-w-md">
              <div className="absolute inset-6 rounded-full border-2 border-dashed border-primary/30" />
              <div className="absolute inset-0 grid place-items-center">
                <div className="text-center">
                  <div className="font-display text-2xl font-semibold">Toolfolio</div>
                  <div className="text-xs text-muted-foreground">Schwungrad</div>
                </div>
              </div>
              {steps.map((s, i) => {
                const angle = (i / steps.length) * 2 * Math.PI - Math.PI / 2;
                const r = 42;
                const x = 50 + r * Math.cos(angle);
                const y = 50 + r * Math.sin(angle);
                return (
                  <div
                    key={s.label}
                    className="absolute -translate-x-1/2 -translate-y-1/2"
                    style={{ left: `${x}%`, top: `${y}%` }}
                  >
                    <div className="rounded-2xl border border-border bg-card px-3 py-2 shadow-soft flex items-center gap-2">
                      <span
                        className="grid size-7 place-items-center rounded-lg"
                        style={{
                          background: `color-mix(in oklab, ${s.color} 18%, transparent)`,
                          color: s.color,
                        }}
                      >
                        <s.icon className="size-4" />
                      </span>
                      <span className="text-sm font-semibold">{s.label}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Reveal>

          <div className="space-y-4">
            {steps.map((s, i) => (
              <Reveal key={s.label} delay={i * 100}>
                <div className="rounded-2xl border border-border bg-card p-5 flex gap-4">
                  <span
                    className="grid size-11 shrink-0 place-items-center rounded-xl"
                    style={{
                      background: `color-mix(in oklab, ${s.color} 18%, transparent)`,
                      color: s.color,
                    }}
                  >
                    <s.icon className="size-5" />
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-muted-foreground tabular">
                        0{i + 1}
                      </span>
                      <h3 className="font-display text-lg font-semibold">{s.label}</h3>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Features() {
  const items = [
    {
      icon: Inbox,
      title: "Drei-Wege-Erfassung",
      desc: "Kontoauszug-Import, Beleg-Postfach oder manuell. Du wählst, was passt.",
      color: "var(--primary)",
    },
    {
      icon: CalendarClock,
      title: "Kündigungsfristen-Wächter",
      desc: "Nie wieder eine stille Jahresverlängerung. Der deutsche USP.",
      color: "var(--warning)",
      highlight: true,
    },
    {
      icon: Cpu,
      title: "AI-Credit-Tracker",
      desc: "Auch die variablen KI-Kosten von OpenAI, Anthropic & Co. im Blick.",
      color: "var(--coral)",
    },
    {
      icon: Users,
      title: "Kosten pro Kunde",
      desc: "Toolkosten zuordnen und sauber weiterverrechnen. Der Agentur-Vorteil.",
      color: "var(--primary)",
    },
    {
      icon: BarChart3,
      title: "Echter Benchmark",
      desc: "Sieh, ob du mehr zahlst als vergleichbare Agenturen. Belegt durch Daten.",
      color: "var(--success)",
    },
    {
      icon: Tag,
      title: "Sparvorschläge & Deals",
      desc: "Intervallwechsel, Redundanzen, Gutscheine. Direkt umsetzbar.",
      color: "var(--coral)",
    },
  ];
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <div className="max-w-2xl">
            <div className="text-xs font-semibold uppercase tracking-widest text-primary">
              Features
            </div>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl font-semibold tracking-tight">
              Alles, was Excel nicht kann.
            </h2>
          </div>
        </Reveal>

        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((f, i) => (
            <Reveal key={f.title} delay={i * 60}>
              <div
                className={cn(
                  "h-full rounded-3xl border bg-card p-6 card-lift",
                  f.highlight ? "border-[color:var(--warning)]/40 bg-[color:var(--warning)]/5" : "border-border",
                )}
              >
                <span
                  className="grid size-11 place-items-center rounded-xl"
                  style={{
                    background: `color-mix(in oklab, ${f.color} 18%, transparent)`,
                    color: f.color,
                  }}
                >
                  <f.icon className="size-5" />
                </span>
                <h3 className="mt-4 font-display text-xl font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Verzeichnis() {
  const kategorien = [
    { name: "Design", color: "var(--color-cat-design)", count: 124 },
    { name: "SEO", color: "var(--color-cat-seo)", count: 86 },
    { name: "KI", color: "var(--color-cat-ai)", count: 142 },
    { name: "Kommunikation", color: "var(--color-cat-comm)", count: 64 },
    { name: "Entwicklung", color: "var(--color-cat-dev)", count: 198 },
    { name: "Produktivität", color: "var(--color-cat-prod)", count: 112 },
    { name: "E-Commerce", color: "var(--color-cat-ecom)", count: 73 },
    { name: "Analytics", color: "var(--primary)", count: 58 },
  ];
  return (
    <section id="verzeichnis" className="py-20 sm:py-28 bg-secondary/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <Reveal>
            <div>
              <div className="text-xs font-semibold uppercase tracking-widest text-coral">
                Das Verzeichnis
              </div>
              <h2 className="mt-3 font-display text-3xl sm:text-4xl font-semibold tracking-tight">
                Das DACH-Verzeichnis mit Preisen, die echt sind.
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Vergleiche Software, finde günstigere Alternativen und wechsle in Minuten.
                Bewertungen und Preise sind verifiziert durch echte, anonymisierte
                Abrechnungsdaten der Toolfolio-Community.
              </p>

              <ul className="mt-6 space-y-2">
                {[
                  "Verifizierte Markt-Preise statt Listenpreisen",
                  "Alternativ-Vorschläge mit Spar-Potenzial",
                  "Filter für DSGVO, Hosting in EU und mehr",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="mt-0.5 size-5 text-success shrink-0" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>

              <a
                href="/verzeichnis"
                className="mt-7 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-soft hover:bg-primary/90 hover:shadow-lift transition-all"
              >
                Verzeichnis erkunden <ArrowRight className="size-4" />
              </a>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="rounded-[28px] border border-border bg-card p-6 shadow-lift">
              <div className="flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-4 py-2.5">
                <Search className="size-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Suche nach „Projektmanagement"...
                </span>
              </div>
              <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
                {kategorien.map((k) => (
                  <div
                    key={k.name}
                    className="rounded-2xl border border-border bg-card p-3 card-lift"
                  >
                    <span
                      className="block size-8 rounded-lg"
                      style={{ background: `color-mix(in oklab, ${k.color} 22%, transparent)` }}
                    />
                    <div className="mt-3 text-sm font-semibold">{k.name}</div>
                    <div className="text-xs text-muted-foreground tabular">
                      {k.count} Tools
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Zielgruppen() {
  const items = [
    {
      icon: Building2,
      title: "Agenturen",
      desc: "Toolkosten pro Kunde zuordnen, sauber weiterverrechnen und Teams sauber verwalten.",
    },
    {
      icon: Briefcase,
      title: "Freelancer",
      desc: "Alle Abos auf einen Blick und nie wieder eine Frist verpassen.",
    },
    {
      icon: UserIcon,
      title: "Solopreneure",
      desc: "Behalte deinen Software-Stack schlank und deine Kosten unter Kontrolle.",
    },
  ];
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <div className="max-w-2xl">
            <div className="text-xs font-semibold uppercase tracking-widest text-primary">
              Für wen
            </div>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl font-semibold tracking-tight">
              Gebaut für die, die schnell und schlank arbeiten.
            </h2>
          </div>
        </Reveal>

        <div className="mt-12 grid md:grid-cols-3 gap-5">
          {items.map((it, i) => (
            <Reveal key={it.title} delay={i * 100}>
              <div className="h-full rounded-3xl border border-border bg-card p-7 card-lift">
                <span className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
                  <it.icon className="size-6" />
                </span>
                <h3 className="mt-5 font-display text-2xl font-semibold">{it.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{it.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function SocialProof() {
  const stats = [
    { label: "Agenturen vertrauen Toolfolio", value: "1.200+" },
    { label: "Ø Ersparnis pro Jahr", value: fmtEUR(2400) },
    { label: "Tools im DACH-Verzeichnis", value: "5.800+" },
  ];
  const stimmen = [
    {
      text: "Endlich ein Tool, das mir den deutschen Vertragsalltag abnimmt. Die Fristen-Erinnerungen sind Gold wert.",
      autor: "Platzhalter, Agenturinhaber",
    },
    {
      text: "Wir wussten nie, welcher Kunde welche Lizenz nutzt. Jetzt ist es ein Klick und die Marge stimmt wieder.",
      autor: "Platzhalter, Operations Lead",
    },
    {
      text: "Der Benchmark hat uns gezeigt, dass wir bei zwei Tools deutlich überzahlen. Direkt gewechselt.",
      autor: "Platzhalter, Freelancerin",
    },
  ];
  return (
    <section className="py-20 sm:py-28 bg-secondary/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <div className="grid sm:grid-cols-3 gap-4">
            {stats.map((s) => (
              <div
                key={s.label}
                className="rounded-2xl border border-border bg-card p-6 text-center"
              >
                <div className="font-display text-3xl sm:text-4xl font-semibold tabular text-primary">
                  {s.value}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </Reveal>

        <div className="mt-12 grid lg:grid-cols-3 gap-5">
          {stimmen.map((s, i) => (
            <Reveal key={i} delay={i * 100}>
              <div className="h-full rounded-3xl border border-border bg-card p-7 card-lift">
                <Quote className="size-6 text-primary/50" />
                <p className="mt-3 text-base leading-relaxed">{s.text}</p>
                <div className="mt-5 flex items-center gap-3 border-t border-border pt-4">
                  <span className="grid size-9 place-items-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                    PH
                  </span>
                  <span className="text-sm text-muted-foreground">{s.autor}</span>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 opacity-60">
            {["Logo", "Marke", "Studio", "Kollektiv", "Atelier", "Werkstatt"].map((l) => (
              <span
                key={l}
                className="font-display text-xl font-semibold tracking-wide text-muted-foreground"
              >
                {l}
              </span>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Trust() {
  const items = [
    {
      icon: Lock,
      title: "Keine Passwörter, keine Kartennummern",
      desc: "Wir speichern keine Zugangsdaten und keine vollständigen Kreditkartennummern.",
    },
    {
      icon: ShieldCheck,
      title: "Read-only und DSGVO-konform",
      desc: "Bank- und Mailbox-Zugriffe nur lesend, gehostet in der EU, dokumentiert AVV.",
    },
    {
      icon: Globe2,
      title: "Anonymisierte Markt-Daten",
      desc: "Beträge fließen anonymisiert in Benchmarks. Niemand sieht deine Zahlen einzeln.",
    },
  ];
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <div className="max-w-2xl">
            <div className="text-xs font-semibold uppercase tracking-widest text-success">
              Vertrauen & Datenschutz
            </div>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl font-semibold tracking-tight">
              Sicher genug für deine Buchhaltung.
            </h2>
          </div>
        </Reveal>

        <div className="mt-10 grid md:grid-cols-3 gap-5">
          {items.map((it, i) => (
            <Reveal key={it.title} delay={i * 100}>
              <div className="h-full rounded-3xl border border-border bg-card p-7">
                <span className="grid size-11 place-items-center rounded-xl bg-success/15 text-success">
                  <it.icon className="size-5" />
                </span>
                <h3 className="mt-5 font-semibold">{it.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{it.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  const plans = [
    {
      name: "Free",
      price: "0 €",
      sub: "für immer",
      features: ["Bis 10 Abos", "Fristen-Erinnerungen", "Manuelles Erfassen"],
      cta: "Kostenlos starten",
      featured: false,
    },
    {
      name: "Pro",
      price: fmtEUR(19),
      sub: "pro Monat",
      features: [
        "Unbegrenzte Abos",
        "Kontoauszug-Import",
        "Beleg-Postfach",
        "Benchmark & Sparvorschläge",
      ],
      cta: "14 Tage testen",
      featured: true,
    },
    {
      name: "Studio",
      price: fmtEUR(49),
      sub: "pro Monat",
      features: ["Alles aus Pro", "Kosten pro Kunde", "Team & Rollen", "Mehrere Gesellschaften"],
      cta: "14 Tage testen",
      featured: false,
    },
  ];
  return (
    <section id="preise" className="py-20 sm:py-28 bg-secondary/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <div className="max-w-2xl">
            <div className="text-xs font-semibold uppercase tracking-widest text-primary">
              Pricing
            </div>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl font-semibold tracking-tight">
              Faire Preise. Keine versteckten Kosten.
            </h2>
          </div>
        </Reveal>

        <div className="mt-12 grid md:grid-cols-3 gap-5">
          {plans.map((p, i) => (
            <Reveal key={p.name} delay={i * 80}>
              <div
                className={cn(
                  "h-full rounded-3xl border p-7 flex flex-col",
                  p.featured
                    ? "border-primary bg-card shadow-lift ring-1 ring-primary/30"
                    : "border-border bg-card",
                )}
              >
                {p.featured && (
                  <div className="self-start mb-3 rounded-full bg-primary/10 text-primary text-xs font-semibold px-3 py-1">
                    Beliebt
                  </div>
                )}
                <div className="font-display text-xl font-semibold">{p.name}</div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="font-display text-4xl font-semibold tabular">{p.price}</span>
                  <span className="text-sm text-muted-foreground">{p.sub}</span>
                </div>
                <ul className="mt-5 space-y-2 text-sm">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 size-4 text-success shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href="/onboarding"
                  className={cn(
                    "mt-7 inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition-all",
                    p.featured
                      ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-soft hover:shadow-lift"
                      : "border border-border hover:bg-accent",
                  )}
                >
                  {p.cta}
                </a>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="mt-8 text-center">
          <a
            href="#preise"
            className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
          >
            Alle Preise ansehen <ArrowRight className="size-4" />
          </a>
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
          <div className="relative overflow-hidden rounded-[32px] bg-foreground text-[color:var(--paper)] p-10 sm:p-16 text-center">
            <div className="absolute -top-20 -right-20 size-72 rounded-full bg-primary/40 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 size-72 rounded-full bg-coral/40 blur-3xl" />
            <div className="relative">
              <h2 className="font-display text-3xl sm:text-5xl font-semibold tracking-tight">
                Behalte deinen Stack im Griff.
              </h2>
              <p className="mt-4 text-lg opacity-80 max-w-xl mx-auto">
                In zehn Minuten eingerichtet. Erste Sparvorschläge noch heute.
              </p>
              <a
                href="/onboarding"
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-7 py-4 text-base font-semibold text-primary-foreground shadow-lift hover:bg-primary/90 transition-all"
              >
                Kostenlos starten <ArrowRight className="size-4" />
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Footer() {
  const cols = [
    {
      title: "Produkt",
      links: ["Features", "Schwungrad", "Sicherheit", "Roadmap"],
    },
    {
      title: "Verzeichnis",
      links: ["Kategorien", "Top-Tools", "Alternativen", "Deals"],
    },
    {
      title: "Preise",
      links: ["Pläne", "Für Agenturen", "Für Freelancer", "FAQ"],
    },
    {
      title: "Über uns",
      links: ["Mission", "Team", "Blog", "Kontakt"],
    },
    {
      title: "Recht",
      links: ["Impressum", "Datenschutz", "AGB", "AVV"],
    },
  ];
  return (
    <footer id="footer" className="border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14">
        <div className="grid lg:grid-cols-[1.4fr_repeat(5,1fr)] gap-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground font-display text-lg font-bold">
                T
              </span>
              <span className="font-display text-xl font-semibold">Toolfolio</span>
            </div>
            <p className="mt-4 text-sm text-muted-foreground max-w-xs">
              Dein Software-Cockpit. Für Agenturen, Freelancer und Solopreneure im DACH-Raum.
            </p>
            <div className="mt-5 flex items-center gap-2">
              {["X", "in", "YT", "Rs"].map((s) => (
                <a
                  key={s}
                  href="#"
                  className="grid size-9 place-items-center rounded-full border border-border text-xs font-semibold hover:bg-accent"
                >
                  {s}
                </a>
              ))}
            </div>
          </div>
          {cols.map((c) => (
            <div key={c.title}>
              <div className="font-semibold text-sm">{c.title}</div>
              <ul className="mt-4 space-y-2">
                {c.links.map((l) => (
                  <li key={l}>
                    <a
                      href="#"
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground">
          <div>© {new Date().getFullYear()} Toolfolio. Alle Rechte vorbehalten.</div>
          <div className="flex items-center gap-2">
            <Globe2 className="size-4" /> Deutsch (DACH)
          </div>
        </div>
      </div>
    </footer>
  );
}

export function MarketingHome() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />
      <Hero />
      <Problem />
      <Flywheel />
      <Features />
      <Verzeichnis />
      <Zielgruppen />
      <SocialProof />
      <Trust />
      <Pricing />
      <FinalCTA />
      <Footer />
    </div>
  );
}

export default MarketingHome;
