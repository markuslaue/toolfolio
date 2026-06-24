import { Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Eye,
  MousePointerClick,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  ShieldCheck,
  Info,
  CheckCircle2,
  Circle,
  Image as ImageIcon,
  FileText,
  Video,
  Sparkles,
  BadgeCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  AnbieterPortalShell,
  type AnbieterProfile,
} from "./portal-shell";

const profile: AnbieterProfile = {
  name: "Klauselscan",
  initial: "K",
  category: "Vertragsmanagement",
  email: "hi@klauselscan.dev",
};

type Range = "7d" | "30d" | "90d";
type Status = "community" | "verifiziert";

const rangeLabel: Record<Range, string> = {
  "7d": "Letzte 7 Tage",
  "30d": "Letzte 30 Tage",
  "90d": "Letzte 90 Tage",
};

const kpiByRange: Record<
  Range,
  {
    views: number;
    clicks: number;
    requests: number;
    trends: { views: number; clicks: number; requests: number };
  }
> = {
  "7d": {
    views: 84,
    clicks: 12,
    requests: 1,
    trends: { views: 6, clicks: 4, requests: 0 },
  },
  "30d": {
    views: 340,
    clicks: 52,
    requests: 3,
    trends: { views: 11, clicks: 8, requests: 1 },
  },
  "90d": {
    views: 920,
    clicks: 138,
    requests: 7,
    trends: { views: 19, clicks: 14, requests: 2 },
  },
};

const seriesByRange: Record<Range, { label: string; views: number; clicks: number }[]> = {
  "7d": [
    { label: "Mo", views: 9, clicks: 1 },
    { label: "Di", views: 12, clicks: 2 },
    { label: "Mi", views: 10, clicks: 2 },
    { label: "Do", views: 14, clicks: 2 },
    { label: "Fr", views: 15, clicks: 2 },
    { label: "Sa", views: 8, clicks: 1 },
    { label: "So", views: 16, clicks: 2 },
  ],
  "30d": [
    { label: "W1", views: 70, clicks: 10 },
    { label: "W2", views: 78, clicks: 12 },
    { label: "W3", views: 88, clicks: 14 },
    { label: "W4", views: 104, clicks: 16 },
  ],
  "90d": [
    { label: "M1", views: 260, clicks: 38 },
    { label: "M2", views: 300, clicks: 46 },
    { label: "M3", views: 360, clicks: 54 },
  ],
};

const profileChecklist = [
  { label: "Logo hochgeladen", done: true, icon: ImageIcon },
  { label: "Kurzbeschreibung", done: true, icon: FileText },
  { label: "Öffentliche Preise hinterlegt", done: true, icon: FileText },
  { label: "Ausführliche Beschreibung ergänzen", done: false, icon: FileText },
  { label: "Screenshots hinzufügen", done: false, icon: ImageIcon },
  { label: "Demo-Video verlinken", done: false, icon: Video },
];

export function BuilderDashboardPage() {
  const [range, setRange] = useState<Range>("30d");
  const [status, setStatus] = useState<Status>("community");
  const kpi = kpiByRange[range];
  const series = seriesByRange[range];
  const completion = 60;
  const isEmpty = kpi.views < 10;

  return (
    <AnbieterPortalShell profile={profile}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
              Builder-Cockpit
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight mt-1">
              Hi, {profile.name}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Schlankes Cockpit für dein Indie-Listing. Du siehst nur anonyme Zähler, keine
              Interessentendaten.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <DemoSwitch status={status} onChange={setStatus} />
            <RangePicker value={range} onChange={setRange} />
          </div>
        </div>

        {/* Listing-Status */}
        <ListingStatusCard status={status} />

        {/* KPI Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <KpiCard
            icon={Eye}
            label="Profil-Aufrufe"
            value={kpi.views.toLocaleString("de-DE")}
            trend={kpi.trends.views}
            sub={rangeLabel[range]}
          />
          <KpiCard
            icon={MousePointerClick}
            label="Klicks zu deinem Tool"
            value={kpi.clicks.toLocaleString("de-DE")}
            trend={kpi.trends.clicks}
            sub={`${Math.round((kpi.clicks / Math.max(kpi.views, 1)) * 100)} % Klickrate`}
          />
          <KpiCard
            icon={MessageSquare}
            label="Vermittelte Anfragen"
            value={kpi.requests.toString()}
            trend={kpi.trends.requests}
            sub="anonymer Zähler"
            note="Anfragen gehen direkt an dich, wir speichern keine Daten."
          />
        </div>

        {/* Empty hint */}
        {isEmpty ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-5 flex items-start gap-3">
            <Sparkles className="size-5 text-coral mt-0.5 shrink-0" />
            <div className="text-sm">
              <div className="font-semibold">Noch wenig los, das ist normal.</div>
              <p className="mt-1 text-muted-foreground leading-relaxed">
                Frisch gelistete Tools brauchen ein paar Tage Sichtbarkeit. Statt erfundener Zahlen
                zeigen wir dir die echten Werte. Vervollständige zuerst dein Profil, das bringt
                erfahrungsgemäß die größten Sprünge.
              </p>
            </div>
          </div>
        ) : null}

        {/* Chart + Profile completion */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <PerformanceChart series={series} range={range} />
          </div>
          <ProfileStatusCard completion={completion} />
        </div>

        {/* Neutralität */}
        <div className="rounded-2xl border bg-primary/5 border-primary/15 p-5 flex items-start gap-3">
          <Info className="size-4 mt-0.5 text-primary shrink-0" />
          <div className="text-sm">
            <div className="font-semibold">Organische Position ist nicht käuflich.</div>
            <p className="mt-1 text-muted-foreground leading-relaxed">
              Nur zusätzliche Sichtbarkeit lässt sich buchen und wird klar als gesponsert
              gekennzeichnet. Mehr in unseren{" "}
              <Link to="/badge" className="text-primary font-medium hover:underline">
                Neutralitäts-Regeln
              </Link>
              .
            </p>
          </div>
        </div>

        {/* Next steps */}
        <NextSteps status={status} />
      </div>
    </AnbieterPortalShell>
  );
}

function DemoSwitch({ status, onChange }: { status: Status; onChange: (s: Status) => void }) {
  const opts: { v: Status; l: string }[] = [
    { v: "community", l: "Community" },
    { v: "verifiziert", l: "Verifiziert" },
  ];
  return (
    <div
      className="inline-flex items-center rounded-full border border-dashed border-border bg-card p-1 text-xs font-medium"
      title="Demo-Umschalter für den Listing-Status"
    >
      {opts.map((o) => (
        <button
          key={o.v}
          onClick={() => onChange(o.v)}
          className={cn(
            "px-3 py-1.5 rounded-full transition-colors",
            status === o.v
              ? "bg-foreground text-background"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {o.l}
        </button>
      ))}
    </div>
  );
}

function RangePicker({ value, onChange }: { value: Range; onChange: (r: Range) => void }) {
  const options: Range[] = ["7d", "30d", "90d"];
  return (
    <div className="inline-flex items-center rounded-full border border-border bg-card p-1 text-xs font-medium">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={cn(
            "px-3 py-1.5 rounded-full transition-colors",
            value === opt
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {rangeLabel[opt]}
        </button>
      ))}
    </div>
  );
}

function ListingStatusCard({ status }: { status: Status }) {
  if (status === "verifiziert") {
    return (
      <div className="rounded-[20px] border bg-card p-5 shadow-soft">
        <div className="flex flex-col md:flex-row md:items-center gap-4 md:justify-between">
          <div className="flex items-start gap-3">
            <div className="inline-flex items-center justify-center size-11 rounded-xl bg-success/15 text-success shrink-0">
              <BadgeCheck className="size-5" />
            </div>
            <div>
              <div className="inline-flex items-center gap-2">
                <span className="font-display text-lg font-semibold">Verifiziertes Listing</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-success/15 text-success text-[10px] font-semibold px-2 py-0.5">
                  <ShieldCheck className="size-3" /> Badge aktiv
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed max-w-xl">
                Du hast die Selbstauskunft und die externen Checks bestanden. Der Badge ist gültig
                bis <strong className="text-foreground">31.05.2027</strong>. Nächste erneute Prüfung
                am <strong className="text-foreground">15.05.2027</strong>.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild size="sm" variant="outline">
              <Link to="/badge">Badge-Regeln</Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/anbieter-portal/listing">Listing bearbeiten</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[20px] border bg-card p-5 shadow-soft">
      <div className="flex flex-col md:flex-row md:items-center gap-4 md:justify-between">
        <div className="flex items-start gap-3">
          <div className="inline-flex items-center justify-center size-11 rounded-xl bg-muted text-foreground/70 shrink-0">
            <Sparkles className="size-5" />
          </div>
          <div>
            <div className="inline-flex items-center gap-2">
              <span className="font-display text-lg font-semibold">Community-Tool</span>
              <span className="inline-flex items-center rounded-full bg-muted text-foreground/70 text-[10px] font-semibold px-2 py-0.5">
                ohne Badge
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed max-w-xl">
              Dein Listing ist sichtbar und als Community-Tool gekennzeichnet. Für mehr Vertrauen
              kannst du dich einmalig verifizieren lassen (49 Euro, keine laufenden Kosten).
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild size="sm" variant="outline">
            <Link to="/badge">Badge-Regeln</Link>
          </Button>
          <Button asChild size="sm">
            <Link to="/anbieter-portal/einreichen">
              Verifizieren lassen <ArrowRight className="size-3.5" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

function KpiCard({
  icon: Icon,
  label,
  value,
  trend,
  sub,
  note,
}: {
  icon: typeof Eye;
  label: string;
  value: string;
  trend: number;
  sub?: string;
  note?: string;
}) {
  const up = trend >= 0;
  return (
    <div className="rounded-[20px] border bg-card p-5 shadow-soft transition-transform hover:-translate-y-0.5">
      <div className="flex items-center justify-between">
        <div className="inline-flex items-center justify-center size-9 rounded-xl bg-primary/10 text-primary">
          <Icon className="size-4" />
        </div>
      </div>
      <div className="mt-4 font-display text-3xl font-semibold tracking-tight tabular-nums">
        {value}
      </div>
      <div className="mt-1 text-xs text-muted-foreground">{label}</div>
      <div className="mt-3 flex items-center gap-2 text-xs">
        <span
          className={cn(
            "inline-flex items-center gap-1 font-semibold",
            up ? "text-success" : "text-coral",
          )}
        >
          {up ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
          {up ? "+" : ""}
          {trend}%
        </span>
        {sub ? <span className="text-muted-foreground">· {sub}</span> : null}
      </div>
      {note ? (
        <p className="mt-3 text-[11px] text-muted-foreground leading-relaxed border-t border-border pt-3">
          {note}
        </p>
      ) : null}
    </div>
  );
}

function PerformanceChart({
  series,
  range,
}: {
  series: { label: string; views: number; clicks: number }[];
  range: Range;
}) {
  const maxViews = Math.max(...series.map((s) => s.views), 1);
  const maxClicks = Math.max(...series.map((s) => s.clicks), 1);

  return (
    <div className="rounded-[20px] border bg-card p-5 shadow-soft h-full">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold">Aufrufe und Klicks</div>
          <div className="text-xs text-muted-foreground">{rangeLabel[range]}</div>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-primary" /> Aufrufe
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-coral" /> Klicks
          </span>
        </div>
      </div>

      <div className="mt-5 flex items-end gap-3 h-48">
        {series.map((s) => (
          <div key={s.label} className="flex-1 flex flex-col items-center gap-2">
            <div className="w-full flex items-end gap-1 h-40">
              <div
                className="flex-1 rounded-t-md bg-primary/80 transition-all"
                style={{ height: `${(s.views / maxViews) * 100}%` }}
                title={`${s.views} Aufrufe`}
              />
              <div
                className="flex-1 rounded-t-md bg-coral/80 transition-all"
                style={{ height: `${(s.clicks / maxClicks) * 100}%` }}
                title={`${s.clicks} Klicks`}
              />
            </div>
            <div className="text-[10px] font-medium text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProfileStatusCard({ completion }: { completion: number }) {
  const open = profileChecklist.filter((i) => !i.done);
  return (
    <div className="rounded-[20px] border bg-card p-5 shadow-soft">
      <div className="text-sm font-semibold">Profil-Vollständigkeit</div>

      <div className="mt-4">
        <div className="flex items-baseline justify-between">
          <span className="font-display text-3xl font-semibold tabular-nums">{completion}%</span>
          <span className="text-xs text-muted-foreground">vollständig</span>
        </div>
        <Progress value={completion} className="mt-2 h-2" />
      </div>

      <ul className="mt-4 space-y-2">
        {profileChecklist.map((item) => (
          <li key={item.label} className="flex items-center gap-2 text-xs">
            {item.done ? (
              <CheckCircle2 className="size-4 text-success shrink-0" />
            ) : (
              <Circle className="size-4 text-muted-foreground shrink-0" />
            )}
            <span
              className={cn(item.done ? "text-muted-foreground line-through" : "text-foreground")}
            >
              {item.label}
            </span>
          </li>
        ))}
      </ul>

      {open.length > 0 ? (
        <Button asChild size="sm" variant="outline" className="mt-4 w-full">
          <Link to="/anbieter-portal/listing">
            {open.length} Punkte ergänzen <ArrowRight className="size-3.5" />
          </Link>
        </Button>
      ) : null}
    </div>
  );
}

function NextSteps({ status }: { status: Status }) {
  const steps = [
    {
      title: "Profil schärfen",
      text: "Eine klare Beschreibung und drei Screenshots erhöhen die Klickrate spürbar.",
      to: "/anbieter-portal/listing" as const,
      cta: "Zum Listing",
    },
    status === "community"
      ? {
          title: "Verifizieren lassen",
          text: "Einmalig 49 Euro, manueller Check und Badge. Keine laufenden Kosten.",
          to: "/anbieter-portal/einreichen" as const,
          cta: "Jetzt einreichen",
        }
      : {
          title: "Badge präsentieren",
          text: "Binde den Badge auf deiner Website ein. Wir liefern Snippet und Regeln.",
          to: "/badge" as const,
          cta: "Badge-Snippet",
        },
    {
      title: "Demo-Video verlinken",
      text: "Ein 60-Sekunden-Clip beantwortet die häufigsten Fragen, bevor sie entstehen.",
      to: "/anbieter-portal/listing" as const,
      cta: "Link hinterlegen",
    },
  ];
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-display text-xl font-semibold">Nächste Schritte</h2>
        <span className="text-xs text-muted-foreground">Empfehlungen für dich</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {steps.map((step) => (
          <Link
            key={step.title}
            to={step.to}
            className="group rounded-[20px] border bg-card p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:border-primary/40"
          >
            <div className="text-sm font-semibold">{step.title}</div>
            <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">{step.text}</p>
            <div className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary">
              {step.cta}{" "}
              <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
