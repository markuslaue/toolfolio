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
  Search,
  Inbox,
  Building2,
  Briefcase,
  User as UserIcon,
  LayoutDashboard,
  FileSpreadsheet,
  Eye,
  Lightbulb,
  Wallet,
  AlertTriangle,
  Hourglass,
  CreditCard,
  Bot,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const fmtEUR = (n: number) =>
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

export function Reveal({
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

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links: Array<{
    label: string;
    href: string;
    children?: Array<{ label: string; href: string }>;
  }> = [
    { label: "Produkt", href: "/features" },
    {
      label: "Für wen",
      href: "/fuer/agenturen",
      children: [
        { label: "Agenturen", href: "/fuer/agenturen" },
        { label: "Freelancer", href: "/fuer/freelancer" },
        { label: "Solopreneure", href: "/fuer/solopreneure" },
      ],
    },
    {
      label: "Vergleich",
      href: "/vergleich/excel",
      children: [
        { label: "vs. Excel", href: "/vergleich/excel" },
        { label: "vs. Sastrify / Deel IT", href: "/vergleich/sastrify" },
        { label: "vs. Cledara", href: "/vergleich/cledara" },
        { label: "vs. Spendesk", href: "/vergleich/spendesk" },
        { label: "vs. Pleo", href: "/vergleich/pleo" },
        { label: "vs. Zluri", href: "/vergleich/zluri" },
        { label: "vs. Torii", href: "/vergleich/torii" },
      ],
    },
    { label: "Preise", href: "/preise" },
    { label: "Über uns", href: "/ueber-uns" },
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
            {links.map((l) =>
              l.children ? (
                <div key={l.href} className="relative group">
                  <a
                    href={l.href}
                    className="inline-flex items-center gap-1 rounded-full px-4 py-2 text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-accent transition-colors"
                  >
                    {l.label}
                    <svg
                      className="size-3 opacity-60"
                      viewBox="0 0 12 12"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M3 4.5 6 7.5 9 4.5" />
                    </svg>
                  </a>
                  <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 absolute left-0 top-full pt-2 transition-opacity z-50">
                    <div className="min-w-[220px] rounded-2xl border border-border bg-card p-2 shadow-lift">
                      {l.children.map((c) => (
                        <a
                          key={c.href}
                          href={c.href}
                          className="block rounded-xl px-3 py-2 text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-accent"
                        >
                          {c.label}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <a
                  key={l.href}
                  href={l.href}
                  className="rounded-full px-4 py-2 text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-accent transition-colors"
                >
                  {l.label}
                </a>
              ),
            )}
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
              <div key={l.href}>
                <a
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-xl px-4 py-3 text-sm font-semibold hover:bg-accent"
                >
                  {l.label}
                </a>
                {l.children && (
                  <div className="ml-3 border-l border-border pl-3 space-y-0.5">
                    {l.children.map((c) => (
                      <a
                        key={c.href}
                        href={c.href}
                        onClick={() => setOpen(false)}
                        className="block rounded-lg px-3 py-2 text-sm text-foreground/70 hover:bg-accent hover:text-foreground"
                      >
                        {c.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
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

/**
 * Wiederverwendbarer Screenshot-Slot im Browser-Rahmen (16:10).
 * Hier können später echte Backend-Screenshots eingesetzt werden,
 * indem der `children`-Inhalt durch ein <img /> ersetzt wird.
 */
export function ScreenshotFrame({
  label,
  caption,
  children,
  className,
}: {
  label: string;
  caption?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("relative", className)}>
      <div className="absolute -inset-6 bg-[radial-gradient(60%_60%_at_50%_40%,color-mix(in_oklab,var(--primary)_14%,transparent),transparent)] blur-2xl -z-10" />
      <div className="rounded-[24px] border border-border bg-card shadow-lift overflow-hidden card-lift">
        <div className="flex items-center gap-2 border-b border-border bg-secondary/60 px-4 py-2.5">
          <span className="size-2.5 rounded-full bg-[color:var(--destructive)]/60" />
          <span className="size-2.5 rounded-full bg-[color:var(--warning)]/70" />
          <span className="size-2.5 rounded-full bg-[color:var(--success)]/70" />
          <div className="ml-3 hidden sm:flex items-center gap-2 rounded-full bg-card/80 border border-border px-3 py-1 text-[11px] text-muted-foreground">
            <Globe2 className="size-3" /> app.toolfolio.de{caption ? ` / ${caption}` : ""}
          </div>
        </div>
        <div className="relative aspect-[16/10] bg-[color:var(--paper)]">
          {children ?? (
            <div className="absolute inset-0 grid place-items-center p-6 text-center">
              <div>
                <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
                  <LayoutDashboard className="size-6" />
                </div>
                <div className="mt-3 font-display text-base font-semibold">
                  Screenshot-Slot
                </div>
                <div className="mt-1 text-xs text-muted-foreground max-w-xs">
                  {label}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- Eingebettete Backend-Vorschauen (austauschbar gegen echte Screenshots) ---------- */

export function PreviewDashboard() {
  return (
    <div className="absolute inset-0 p-5 grid grid-cols-3 gap-3">
      <div className="col-span-2 rounded-2xl bg-card border border-border p-4 flex flex-col">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Monatliche Tool-Kosten</span>
          <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-success font-semibold">
            12 % unter Benchmark
          </span>
        </div>
        <div className="mt-1 font-display text-3xl font-semibold tabular">
          {fmtEUR(4280)}
        </div>
        <div className="mt-3 flex-1 flex items-end gap-1">
          {[40, 55, 48, 62, 70, 58, 65, 72, 68, 60, 55, 50].map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-t bg-primary/70"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      </div>
      <div className="rounded-2xl bg-card border border-border p-4 flex flex-col items-center justify-center">
        <div className="relative size-20">
          <svg viewBox="0 0 100 100" className="size-20 -rotate-90">
            <circle cx="50" cy="50" r="42" fill="none" stroke="color-mix(in oklab, var(--primary) 15%, transparent)" strokeWidth="10" />
            <circle cx="50" cy="50" r="42" fill="none" stroke="var(--success)" strokeWidth="10" strokeDasharray={`${0.68 * 264} 264`} strokeLinecap="round" />
          </svg>
          <div className="absolute inset-0 grid place-items-center">
            <div className="text-center">
              <div className="font-display text-base font-semibold tabular">68 %</div>
              <div className="text-[9px] text-muted-foreground">Spar-Ziel</div>
            </div>
          </div>
        </div>
        <div className="mt-2 text-[10px] text-muted-foreground text-center">
          {fmtEUR(1840)} dieses Jahr gespart
        </div>
      </div>
      <div className="col-span-3 rounded-2xl bg-card border border-border p-3 space-y-1.5">
        {[
          { n: "Figma", p: "Team", price: 540 },
          { n: "Notion", p: "Plus", price: 96, warn: true },
          { n: "OpenAI", p: "Credits", price: 184 },
        ].map((r) => (
          <div key={r.n} className="flex items-center justify-between rounded-lg bg-secondary/40 px-2.5 py-1.5 text-xs">
            <div className="flex items-center gap-2">
              <span className="grid size-6 place-items-center rounded-md bg-card text-[10px] font-semibold border border-border">
                {r.n[0]}
              </span>
              <div>
                <div className="font-medium leading-tight">{r.n}</div>
                <div className="text-[10px] text-muted-foreground">{r.p}</div>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              {r.warn && (
                <span className="rounded-full bg-[color:var(--warning)]/15 px-1.5 py-0.5 text-[9px] font-semibold text-[color:var(--warning)]">
                  Frist 14 T
                </span>
              )}
              <span className="font-semibold tabular">{fmtEUR(r.price)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PreviewImport() {
  const rows = [
    { d: "01.06.", t: "STRIPE *FIGMA", b: 45, ok: true, neu: false },
    { d: "03.06.", t: "ANTHROPIC API", b: 312, ok: true, neu: true },
    { d: "05.06.", t: "MAKE.COM", b: 29, ok: true, neu: false },
    { d: "09.06.", t: "FRAMER TRIAL", b: 29, ok: false, neu: true },
  ];
  return (
    <div className="absolute inset-0 p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 font-semibold">
          <FileSpreadsheet className="size-4 text-primary" /> kontoauszug_juni.csv
        </div>
        <span className="rounded-full bg-success/10 text-success px-2 py-0.5 text-[10px] font-semibold">
          4 Buchungen erkannt
        </span>
      </div>
      <div className="flex-1 rounded-2xl border border-border bg-card overflow-hidden">
        <div className="grid grid-cols-[auto_1fr_auto_auto] text-[10px] uppercase tracking-wide text-muted-foreground px-3 py-2 border-b border-border">
          <span className="w-12">Datum</span><span>Beschreibung</span><span>Betrag</span><span className="pl-3">Status</span>
        </div>
        {rows.map((r) => (
          <div key={r.t} className="grid grid-cols-[auto_1fr_auto_auto] items-center px-3 py-2 text-xs border-b border-border last:border-0">
            <span className="w-12 tabular text-muted-foreground">{r.d}</span>
            <span className="font-medium truncate">{r.t}</span>
            <span className="tabular font-semibold">{fmtEUR(r.b)}</span>
            <span className="pl-3">
              {r.neu ? (
                <span className="rounded-full bg-coral/15 text-coral px-2 py-0.5 text-[10px] font-semibold">Neu</span>
              ) : (
                <span className="rounded-full bg-success/10 text-success px-2 py-0.5 text-[10px] font-semibold">Bekannt</span>
              )}
            </span>
          </div>
        ))}
      </div>
      <div className="flex justify-end gap-2">
        <span className="rounded-full border border-border bg-card px-3 py-1.5 text-xs">Ignorieren</span>
        <span className="rounded-full bg-primary text-primary-foreground px-3 py-1.5 text-xs font-semibold">Alle übernehmen</span>
      </div>
    </div>
  );
}

export function PreviewFristen() {
  const items = [
    { t: "Adobe Creative Cloud", days: 4, severity: "danger", note: "Verlängert sich um 12 Monate" },
    { t: "Framer Trial", days: 9, severity: "warn", note: "Wird kostenpflichtig" },
    { t: "Ahrefs", days: 38, severity: "ok", note: "Kündbar bis 14.08." },
  ];
  return (
    <div className="absolute inset-0 p-5 flex flex-col gap-3">
      <div className="text-xs font-semibold flex items-center gap-2">
        <Hourglass className="size-4 text-[color:var(--warning)]" /> Anstehende Fristen
      </div>
      <div className="space-y-2 flex-1">
        {items.map((i) => {
          const color =
            i.severity === "danger" ? "var(--destructive)" :
            i.severity === "warn" ? "var(--warning)" : "var(--success)";
          return (
            <div key={i.t} className="rounded-xl border border-border bg-card p-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold">{i.t}</span>
                <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ background: `color-mix(in oklab, ${color} 15%, transparent)`, color }}>
                  Noch {i.days} Tage
                </span>
              </div>
              <div className="mt-2 h-1.5 rounded-full bg-secondary overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${Math.max(6, 100 - i.days * 2)}%`, background: color }} />
              </div>
              <div className="mt-1.5 text-[10px] text-muted-foreground">{i.note}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function PreviewAiCredits() {
  return (
    <div className="absolute inset-0 p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between text-xs">
        <div className="font-semibold flex items-center gap-2">
          <Bot className="size-4 text-coral" /> AI-Credit-Verbrauch
        </div>
        <span className="rounded-full bg-[color:var(--destructive)]/15 text-[color:var(--destructive)] px-2 py-0.5 text-[10px] font-semibold inline-flex items-center gap-1">
          <AlertTriangle className="size-3" /> Spike erkannt
        </span>
      </div>
      <div className="rounded-2xl border border-border bg-card p-3 flex-1">
        <div className="text-[10px] text-muted-foreground">Anthropic API · Juni</div>
        <div className="font-display text-2xl font-semibold tabular">{fmtEUR(312)}</div>
        <div className="mt-2 h-20 flex items-end gap-1">
          {[20, 25, 22, 28, 30, 26, 24, 28, 32, 70, 95, 100].map((h, i) => (
            <div key={i} className="flex-1 rounded-t" style={{ height: `${h}%`, background: i >= 9 ? "var(--destructive)" : "color-mix(in oklab, var(--coral) 70%, transparent)" }} />
          ))}
        </div>
        <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground">
          <span>3,1× über Monats-Schnitt</span>
          <span>Budget {fmtEUR(200)}</span>
        </div>
      </div>
    </div>
  );
}

export function PreviewBenchmark() {
  const rows = [
    { t: "Linear", you: 49, market: 39, diff: 10 },
    { t: "Notion", you: 96, market: 84, diff: 12 },
    { t: "Slack", you: 78, market: 78, diff: 0 },
  ];
  return (
    <div className="absolute inset-0 p-5 flex flex-col gap-3">
      <div className="text-xs font-semibold flex items-center gap-2">
        <BarChart3 className="size-4 text-primary" /> Du gegenüber Markt-Median
      </div>
      <div className="space-y-2 flex-1">
        {rows.map((r) => {
          const max = Math.max(r.you, r.market);
          return (
            <div key={r.t} className="rounded-xl border border-border bg-card p-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold">{r.t}</span>
                {r.diff > 0 ? (
                  <span className="rounded-full bg-[color:var(--destructive)]/15 text-[color:var(--destructive)] px-2 py-0.5 text-[10px] font-semibold tabular">+{fmtEUR(r.diff)}</span>
                ) : (
                  <span className="rounded-full bg-success/15 text-success px-2 py-0.5 text-[10px] font-semibold">Fair</span>
                )}
              </div>
              <div className="mt-2 space-y-1">
                <div className="flex items-center gap-2 text-[10px]">
                  <span className="w-10 text-muted-foreground">Du</span>
                  <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                    <div className="h-full bg-coral" style={{ width: `${(r.you / max) * 100}%` }} />
                  </div>
                  <span className="tabular font-semibold w-10 text-right">{fmtEUR(r.you)}</span>
                </div>
                <div className="flex items-center gap-2 text-[10px]">
                  <span className="w-10 text-muted-foreground">Markt</span>
                  <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                    <div className="h-full bg-primary/70" style={{ width: `${(r.market / max) * 100}%` }} />
                  </div>
                  <span className="tabular font-semibold w-10 text-right">{fmtEUR(r.market)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function PreviewSparvorschlaege() {
  const items = [
    { t: "Figma jährlich statt monatlich", save: 144, btn: "Umstellen" },
    { t: "Loom seit 5 Monaten ungenutzt", save: 180, btn: "Prüfen" },
    { t: "Notion zu Coda redundant", save: 96, btn: "Vergleichen" },
  ];
  return (
    <div className="absolute inset-0 p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between text-xs">
        <div className="font-semibold flex items-center gap-2">
          <Lightbulb className="size-4 text-[color:var(--warning)]" /> Sparvorschläge
        </div>
        <span className="rounded-full bg-success/15 text-success px-2 py-0.5 text-[10px] font-semibold tabular">
          {fmtEUR(420)} / Jahr möglich
        </span>
      </div>
      <div className="space-y-2 flex-1">
        {items.map((i) => (
          <div key={i.t} className="rounded-xl border border-border bg-card p-3 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-xs font-semibold truncate">{i.t}</div>
              <div className="text-[10px] text-success tabular">+ {fmtEUR(i.save)} / Jahr</div>
            </div>
            <span className="shrink-0 rounded-full bg-primary text-primary-foreground px-3 py-1 text-[10px] font-semibold">
              {i.btn}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PreviewKunde() {
  const tools = [
    { t: "Figma", k: 45, c: "var(--color-cat-design)" },
    { t: "OpenAI", k: 184, c: "var(--color-cat-ai)" },
    { t: "Vercel", k: 68, c: "var(--color-cat-dev)" },
  ];
  const summe = tools.reduce((a, t) => a + t.k, 0);
  return (
    <div className="absolute inset-0 p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[10px] text-muted-foreground">Kunde</div>
          <div className="font-display text-base font-semibold">Nordwerk Studio</div>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-muted-foreground">Tool-Kosten / Monat</div>
          <div className="font-display text-base font-semibold tabular">{fmtEUR(summe)}</div>
        </div>
      </div>
      <div className="rounded-2xl border border-border bg-card p-3 flex-1 space-y-2">
        {tools.map((t) => (
          <div key={t.t} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="size-2.5 rounded-full" style={{ background: t.c }} />
              <span className="font-medium">{t.t}</span>
            </div>
            <span className="tabular font-semibold">{fmtEUR(t.k)}</span>
          </div>
        ))}
        <div className="mt-2 pt-2 border-t border-border flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Weiterverrechnet</span>
          <span className="tabular font-semibold text-success">{fmtEUR(Math.round(summe * 1.2))}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Marge</span>
          <span className="tabular font-semibold">20 %</span>
        </div>
      </div>
    </div>
  );
}

export function PreviewVerzeichnis() {
  const rows = [
    { t: "Linear", cat: "Entwicklung", ab: 8, verified: true },
    { t: "Height", cat: "Entwicklung", ab: 6, verified: true },
    { t: "Shortcut", cat: "Entwicklung", ab: 10, verified: false },
  ];
  return (
    <div className="absolute inset-0 p-5 flex flex-col gap-3">
      <div className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-xs text-muted-foreground">
        <Search className="size-3.5" /> Suche „Projektmanagement"
      </div>
      <div className="space-y-2 flex-1">
        {rows.map((r) => (
          <div key={r.t} className="rounded-xl border border-border bg-card p-3 flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold">{r.t}</div>
              <div className="text-[10px] text-muted-foreground">{r.cat}</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold tabular">ab {fmtEUR(r.ab)}</div>
              <div className="text-[10px]">
                {r.verified ? (
                  <span className="text-success font-semibold inline-flex items-center gap-1">
                    <CheckCircle2 className="size-3" /> verifizierter Preis
                  </span>
                ) : (
                  <span className="text-muted-foreground">Listenpreis</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Sektionen ---------- */

function Hero() {
  return (
    <section id="top" className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-32 -left-20 size-[480px] rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute top-40 -right-20 size-[420px] rounded-full bg-coral/15 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-10 sm:pt-16 pb-16 sm:pb-24">
        <div className="grid lg:grid-cols-[1.05fr_1.1fr] gap-12 lg:gap-14 items-center">
          <Reveal>
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground">
              <span className="size-1.5 rounded-full bg-coral" />
              Für Agenturen, Freelancer und Solopreneure im DACH-Raum
            </div>
            <h1 className="mt-5 font-display text-4xl sm:text-5xl lg:text-6xl font-semibold leading-[1.05] tracking-tight">
              Behalte den Überblick über jede Software, die dein Geld abbucht.{" "}
              <span className="text-primary">Und zahl weniger dafür.</span>
            </h1>
            <p className="mt-5 text-lg text-muted-foreground max-w-xl">
              Toolfolio zeigt dir, was wirklich läuft, warnt dich vor stillen Verlängerungen
              und macht günstigere Alternativen sichtbar. Belegt durch echte Marktpreise.
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
            <ScreenshotFrame label="Dashboard mit KPI-Karten, Verlauf und Spar-Fortschritt." caption="dashboard">
              <PreviewDashboard />
            </ScreenshotFrame>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Schmerz() {
  const items = [
    {
      icon: Eye,
      title: "Du weißt gar nicht mehr, welche Tools überhaupt noch laufen.",
      desc: "Abos verteilen sich auf drei Konten, zwei Karten und das PayPal vom Praktikanten.",
    },
    {
      icon: Hourglass,
      title: "Trial vergessen zu kündigen, vier Monate ungenutzt im Abo.",
      desc: "Die kostenlose Version ist abgelaufen, das Geld wurde trotzdem jeden Monat abgebucht.",
    },
    {
      icon: CalendarClock,
      title: "Vertrag hat sich still um ein Jahr verlängert.",
      desc: "Die Kündigungsfrist war vor zwei Wochen. Niemand hat dran gedacht.",
    },
    {
      icon: Bot,
      title: "KI-Credits laufen unbemerkt aus dem Ruder.",
      desc: "Am Monatsende ist die OpenAI-Rechnung doppelt so hoch wie geplant.",
    },
    {
      icon: Users,
      title: "Keiner weiß, welche Toolkosten zu welchem Kunden gehören.",
      desc: "Beim Reporting wird geschätzt. Marge bleibt unklar, Weiterverrechnung lückenhaft.",
    },
  ];
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <div className="max-w-2xl">
            <div className="text-xs font-semibold uppercase tracking-widest text-coral">
              Kennst du das?
            </div>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl font-semibold tracking-tight">
              Software-Abos sind der blinde Fleck in deiner Kalkulation.
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Jede dieser Situationen ist real, alltäglich und kostet jeden Monat Geld.
              Toolfolio macht genau hier den Unterschied.
            </p>
          </div>
        </Reveal>

        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((it, i) => (
            <Reveal key={it.title} delay={i * 60}>
              <div className="h-full rounded-2xl border border-border bg-card p-6 card-lift">
                <span className="grid size-10 place-items-center rounded-xl bg-coral/15 text-coral">
                  <it.icon className="size-5" />
                </span>
                <h3 className="mt-4 font-semibold leading-snug">{it.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{it.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Wert() {
  const steps = [
    {
      icon: Eye,
      title: "Überblick",
      desc: "Du siehst lückenlos, welche Software dein Geld abbucht, wann und in welchem Rhythmus.",
    },
    {
      icon: Wallet,
      title: "Kostenbewusstsein",
      desc: "Du weißt jederzeit, welche Kosten du produzierst. Pro Tool, pro Kunde, pro Monat.",
    },
    {
      icon: Tag,
      title: "Weniger zahlen bei gleicher Leistung",
      desc: "Mit echten Marktpreisen und Sparvorschlägen handelst du, wo es sich rechnet.",
    },
  ];
  return (
    <section className="py-20 sm:py-28 bg-secondary/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid lg:grid-cols-[1fr_1.1fr] gap-12 items-center">
          <Reveal>
            <div>
              <div className="text-xs font-semibold uppercase tracking-widest text-primary">
                Warum das zählt
              </div>
              <h2 className="mt-3 font-display text-3xl sm:text-4xl font-semibold tracking-tight">
                Überblick ist kein Selbstzweck. Es ist betriebswirtschaftlich.
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Wer ständig weiß, welche Kosten er produziert, kann handeln. Und bei gleicher
                Leistung will man weniger zahlen. Das ist einfach gutes betriebswirtschaftliches
                Handeln. Toolfolio macht aus diffusem Kostenchaos eine Grundlage für bewusste
                Entscheidungen.
              </p>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="space-y-4">
              {steps.map((s, i) => (
                <div key={s.title} className="rounded-2xl border border-border bg-card p-5 flex items-start gap-4">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                    <s.icon className="size-5" />
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-muted-foreground tabular">
                        0{i + 1}
                      </span>
                      <h3 className="font-display text-lg font-semibold">{s.title}</h3>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
                  </div>
                  {i < steps.length - 1 && (
                    <ArrowRight className="hidden lg:block size-4 text-muted-foreground self-center" />
                  )}
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Features() {
  const blocks = [
    {
      icon: LayoutDashboard,
      eyebrow: "Der vollständige Überblick",
      title: "Alle Abos, Kosten und Abrechnungszeiträume auf einen Blick.",
      desc: "Du siehst Monat und Jahr, jährlich und monatlich, alles in einer Zahl. Filter nach Kategorie, Kunde oder Karte.",
      Preview: PreviewDashboard,
      caption: "dashboard",
      slot: "Dashboard mit KPI-Karten und Spar-Fortschritt.",
    },
    {
      icon: FileSpreadsheet,
      eyebrow: "Alles drin in Minuten",
      title: "Drei-Wege-Erfassung. Auch das, was du vergessen hattest.",
      desc: "Importiere den Kontoauszug, leite Belege an dein Toolfolio-Postfach weiter oder pflege manuell. Der Importer findet auch die Abos, die du längst vergessen hast.",
      Preview: PreviewImport,
      caption: "import",
      slot: "Import-Review mit erkannten Buchungen.",
    },
    {
      icon: CalendarClock,
      eyebrow: "Nie wieder eine stille Verlängerung",
      title: "Der Kündigungsfristen- und Trial-Wächter warnt rechtzeitig.",
      desc: "Genau gegen den Schmerz von oben. Du bekommst die richtige Erinnerung zur richtigen Zeit. Verlängerungen passieren nur noch, wenn du sie willst.",
      Preview: PreviewFristen,
      caption: "fristen",
      slot: "Fristen-Timeline mit Restlaufzeit pro Vertrag.",
    },
    {
      icon: Cpu,
      eyebrow: "AI-Credits unter Kontrolle",
      title: "Auch die variablen KI-Kosten im Griff.",
      desc: "OpenAI, Anthropic, ElevenLabs und mehr. Du erkennst Spikes, setzt Budgets und vermeidest, dass am Monatsende die doppelte Rechnung kommt.",
      Preview: PreviewAiCredits,
      caption: "ai-credits",
      slot: "AI-Credit-Verlauf mit Spike-Erkennung.",
    },
    {
      icon: BarChart3,
      eyebrow: "Wo du zu viel zahlst",
      title: "Benchmark aus echten Abrechnungsdaten.",
      desc: "Vergleichbare Agenturen, gleiche Leistung. Du siehst, ob dein Preis fair ist oder ob du ohne Weiteres weniger zahlen könntest.",
      Preview: PreviewBenchmark,
      caption: "benchmark",
      slot: "Benchmark-Vergleich Du gegen Markt-Median.",
    },
    {
      icon: Sparkles,
      eyebrow: "Sparen mit einem Klick",
      title: "Sparvorschläge, Intervallwechsel und Deals.",
      desc: "Jährlich statt monatlich. Redundante Tools erkannt. Gutscheine eingelöst. Konkrete Maßnahmen, kein abstrakter Bericht.",
      Preview: PreviewSparvorschlaege,
      caption: "sparvorschlaege",
      slot: "Sparvorschläge mit Jahres-Ersparnis.",
    },
    {
      icon: Users,
      eyebrow: "Für Agenturen",
      title: "Toolkosten pro Kunde. Zuordnen, weiterverrechnen, Marge sehen.",
      desc: "Jedes Tool kann einem Kunden zugeordnet werden. Du siehst die Kosten, den weiterverrechneten Anteil und die Marge auf einen Blick.",
      Preview: PreviewKunde,
      caption: "kunden",
      slot: "Kunden-Detail mit Tool-Kosten und Marge.",
    },
  ];

  return (
    <section id="features" className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <div className="max-w-2xl">
            <div className="text-xs font-semibold uppercase tracking-widest text-primary">
              Was Toolfolio konkret macht
            </div>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl font-semibold tracking-tight">
              Sieben Werkzeuge gegen sieben echte Probleme.
            </h2>
          </div>
        </Reveal>

        <div className="mt-14 space-y-20 sm:space-y-28">
          {blocks.map((b, i) => {
            const reverse = i % 2 === 1;
            const Preview = b.Preview;
            return (
              <div
                key={b.title}
                className={cn(
                  "grid lg:grid-cols-2 gap-10 lg:gap-14 items-center",
                )}
              >
                <Reveal className={cn(reverse && "lg:order-2")}>
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                      <b.icon className="size-3.5" /> {b.eyebrow}
                    </div>
                    <h3 className="mt-4 font-display text-2xl sm:text-3xl font-semibold tracking-tight leading-tight">
                      {b.title}
                    </h3>
                    <p className="mt-4 text-base sm:text-lg text-muted-foreground">
                      {b.desc}
                    </p>
                    <a
                      href="#"
                      className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
                    >
                      Mehr erfahren <ArrowRight className="size-4" />
                    </a>
                  </div>
                </Reveal>
                <Reveal delay={120} className={cn(reverse && "lg:order-1")}>
                  <ScreenshotFrame label={b.slot} caption={b.caption}>
                    <Preview />
                  </ScreenshotFrame>
                </Reveal>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Flywheel() {
  const steps = [
    { label: "Erfassen", icon: Inbox, color: "var(--primary)" },
    { label: "Verstehen", icon: BarChart3, color: "var(--coral)" },
    { label: "Handeln", icon: Sparkles, color: "var(--warning)" },
    { label: "Sparen", icon: Wallet, color: "var(--success)" },
  ];

  return (
    <section className="py-20 sm:py-28 bg-secondary/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid lg:grid-cols-[1fr_1.1fr] gap-12 items-center">
          <Reveal>
            <div>
              <div className="text-xs font-semibold uppercase tracking-widest text-primary">
                Das Schwungrad
              </div>
              <h2 className="mt-3 font-display text-3xl sm:text-4xl font-semibold tracking-tight">
                Tracker und Verzeichnis verstärken sich gegenseitig.
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Der Tracker erzeugt echte Preisdaten. Das Verzeichnis macht sie als Benchmark
                und Alternative nutzbar. Das spart dir Geld. Mehr Nutzer verbessern die Daten
                für alle.
              </p>
            </div>
          </Reveal>

          <Reveal delay={120}>
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
        </div>
      </div>
    </section>
  );
}

function Verzeichnis() {
  return (
    <section id="verzeichnis" className="py-20 sm:py-28">
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
                  "Verifizierte Markt-Preise statt Listenpreise",
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
            <ScreenshotFrame label="Verzeichnis-Suche mit verifizierten Preisen." caption="verzeichnis">
              <PreviewVerzeichnis />
            </ScreenshotFrame>
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
    <section className="py-20 sm:py-28 bg-secondary/50">
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
    <section className="py-20 sm:py-28">
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
      desc: "Bank- und Mailbox-Zugriffe nur lesend, gehostet in der EU, dokumentierter AVV.",
    },
    {
      icon: Globe2,
      title: "Anonymisierte Markt-Daten",
      desc: "Beträge fließen anonymisiert in Benchmarks. Niemand sieht deine Zahlen einzeln.",
    },
  ];
  return (
    <section className="py-20 sm:py-28 bg-secondary/50">
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

function PricingTeaser() {
  const plans = [
    { name: "Free", price: "0 €", sub: "für immer", note: "Bis 15 Abos, manuelles Erfassen, Fristen-Erinnerungen.", featured: false },
    { name: "Pro", price: fmtEUR(14), sub: "pro Monat", note: "Unbegrenzte Abos, Import, Benchmark, Sparvorschläge.", featured: true },
    { name: "Agentur", price: fmtEUR(69), sub: "pro Monat", note: "Kosten pro Kunde, Team & Rollen, mehrere Gesellschaften.", featured: false },
  ];
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <div className="flex items-end justify-between flex-wrap gap-4">
            <div className="max-w-2xl">
              <div className="text-xs font-semibold uppercase tracking-widest text-primary">
                Pricing-Teaser
              </div>
              <h2 className="mt-3 font-display text-3xl sm:text-4xl font-semibold tracking-tight">
                Faire Preise. 14 Tage kostenlos testen.
              </h2>
            </div>
            <a
              href="/preise"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
            >
              Alle Preise ansehen <ArrowRight className="size-4" />
            </a>
          </div>
        </Reveal>

        <div className="mt-10 grid md:grid-cols-3 gap-5">
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
                <p className="mt-3 text-sm text-muted-foreground">{p.note}</p>
                <a
                  href="/preise"
                  className={cn(
                    "mt-6 inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition-all",
                    p.featured
                      ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-soft hover:shadow-lift"
                      : "border border-border hover:bg-accent",
                  )}
                >
                  Plan ansehen
                </a>
              </div>
            </Reveal>
          ))}
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
                Schluss mit stillen Verlängerungen.
              </h2>
              <p className="mt-4 text-lg opacity-80 max-w-xl mx-auto">
                In zehn Minuten eingerichtet. Erste Sparvorschläge noch heute.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <a
                  href="/onboarding"
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-4 text-base font-semibold text-primary-foreground shadow-lift hover:bg-primary/90 transition-all"
                >
                  Kostenlos starten <ArrowRight className="size-4" />
                </a>
                <a
                  href="/preise"
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 px-7 py-4 text-base font-semibold text-[color:var(--paper)] hover:bg-white/10 transition-all"
                >
                  <CreditCard className="size-4" /> Preise ansehen
                </a>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function Footer() {
  const cols: { title: string; links: { label: string; href: string }[] }[] = [
    {
      title: "Produkt",
      links: [
        { label: "Funktionen", href: "/features" },
        { label: "Preise", href: "/preise" },
        { label: "Dashboard", href: "/dashboard" },
      ],
    },
    {
      title: "Für wen",
      links: [
        { label: "Agenturen", href: "/fuer/agenturen" },
        { label: "Freelancer", href: "/fuer/freelancer" },
        { label: "Solopreneure", href: "/fuer/solopreneure" },
      ],
    },
    {
      title: "Vergleiche",
      links: [
        { label: "vs. Excel", href: "/vergleich/excel" },
        { label: "vs. Sastrify / Deel IT", href: "/vergleich/sastrify" },
        { label: "vs. Cledara", href: "/vergleich/cledara" },
        { label: "vs. Spendesk", href: "/vergleich/spendesk" },
        { label: "vs. Pleo", href: "/vergleich/pleo" },
      ],
    },
    {
      title: "Über uns",
      links: [
        { label: "Mission", href: "#" },
        { label: "Blog", href: "#" },
        { label: "Kontakt", href: "#" },
      ],
    },
    {
      title: "Recht",
      links: [
        { label: "Impressum", href: "#" },
        { label: "Datenschutz", href: "#" },
        { label: "AGB", href: "#" },
      ],
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
                  <li key={l.label}>
                    <a
                      href={l.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {l.label}
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
      <Schmerz />
      <Wert />
      <Features />
      <Flywheel />
      <Verzeichnis />
      <Zielgruppen />
      <SocialProof />
      <Trust />
      <PricingTeaser />
      <FinalCTA />
      <Footer />
    </div>
  );
}

export default MarketingHome;
