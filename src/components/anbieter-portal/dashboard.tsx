import { Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Eye,
  MousePointerClick,
  Inbox,
  Star,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Info,
  CheckCircle2,
  Circle,
  Image as ImageIcon,
  FileText,
  Tag,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  AnbieterPortalShell,
  type AnbieterProfile,
} from "./portal-shell";

const profile: AnbieterProfile = {
  name: "fynk",
  initial: "f",
  category: "Vertragsmanagement",
  email: "team@fynk.com",
};

type Range = "7d" | "30d" | "90d";

const rangeLabel: Record<Range, string> = {
  "7d": "Letzte 7 Tage",
  "30d": "Letzte 30 Tage",
  "90d": "Letzte 90 Tage",
};

const kpiByRange: Record<
  Range,
  { views: number; clicks: number; leads: number; leadsNew: number; rating: number; ratingCount: number; trends: { views: number; clicks: number; leads: number; rating: number } }
> = {
  "7d": {
    views: 512,
    clicks: 74,
    leads: 2,
    leadsNew: 1,
    rating: 4.4,
    ratingCount: 23,
    trends: { views: 8, clicks: 5, leads: 0, rating: 0.1 },
  },
  "30d": {
    views: 2140,
    clicks: 318,
    leads: 7,
    leadsNew: 2,
    rating: 4.4,
    ratingCount: 23,
    trends: { views: 12, clicks: 9, leads: 3, rating: 0.2 },
  },
  "90d": {
    views: 6280,
    clicks: 921,
    leads: 19,
    leadsNew: 2,
    rating: 4.3,
    ratingCount: 21,
    trends: { views: 18, clicks: 14, leads: 6, rating: -0.1 },
  },
};

const seriesByRange: Record<Range, { label: string; views: number; clicks: number }[]> = {
  "7d": [
    { label: "Mo", views: 62, clicks: 9 },
    { label: "Di", views: 71, clicks: 11 },
    { label: "Mi", views: 68, clicks: 10 },
    { label: "Do", views: 80, clicks: 13 },
    { label: "Fr", views: 84, clicks: 12 },
    { label: "Sa", views: 58, clicks: 7 },
    { label: "So", views: 89, clicks: 12 },
  ],
  "30d": [
    { label: "W1", views: 410, clicks: 58 },
    { label: "W2", views: 470, clicks: 72 },
    { label: "W3", views: 560, clicks: 85 },
    { label: "W4", views: 700, clicks: 103 },
  ],
  "90d": [
    { label: "M1", views: 1820, clicks: 250 },
    { label: "M2", views: 2120, clicks: 310 },
    { label: "M3", views: 2340, clicks: 361 },
  ],
};

const leads = [
  {
    company: "Lindner & Partner",
    contact: "Sarah Lindner",
    date: "vor 2 Std.",
    status: "neu" as const,
    note: "Demo angefragt, 12 Seats",
  },
  {
    company: "Munich Legal Group",
    contact: "Tobias Bauer",
    date: "Gestern",
    status: "neu" as const,
    note: "Preisanfrage Pro-Plan",
  },
  {
    company: "Solo • Mara Köhler",
    contact: "Mara Köhler",
    date: "vor 3 Tagen",
    status: "beantwortet" as const,
    note: "Frage zu DATEV-Export",
  },
];

const profileChecklist = [
  { label: "Logo hochgeladen", done: true, icon: ImageIcon },
  { label: "Kurzbeschreibung", done: true, icon: FileText },
  { label: "Offizielle Preise hinterlegt", done: true, icon: Tag },
  { label: "Ausführliche Beschreibung ergänzen", done: false, icon: FileText },
  { label: "Screenshots oder Demo-Video hinzufügen", done: false, icon: ImageIcon },
  { label: "Integrationen prüfen", done: false, icon: AlertCircle },
];

const nextSteps = [
  {
    title: "Profil vervollständigen",
    text: "Drei offene Punkte. Vollständige Profile erhalten im Schnitt 38 % mehr Klicks.",
    to: "/anbieter-portal/listing" as const,
    cta: "Zum Listing",
  },
  {
    title: "Platzierung prüfen",
    text: "Du bist organisch auf Platz 5. Premium-Sichtbarkeit ist optional buchbar.",
    to: "/anbieter-portal/platzierung" as const,
    cta: "Optionen ansehen",
  },
  {
    title: "Leads beantworten",
    text: "Zwei neue Anfragen warten auf eine Antwort.",
    to: "/anbieter-portal/leads" as const,
    cta: "Zu den Leads",
  },
];

export function AnbieterDashboardPage() {
  const [range, setRange] = useState<Range>("30d");
  const kpi = kpiByRange[range];
  const series = seriesByRange[range];
  const completion = 70;

  return (
    <AnbieterPortalShell profile={profile}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:justify-between">
          <div>
            <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight">
              Willkommen zurück, {profile.name}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              So entwickelt sich dein Eintrag im Toolfolio-Verzeichnis.
            </p>
          </div>
          <RangePicker value={range} onChange={setRange} />
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            icon={Eye}
            label="Profil-Aufrufe"
            value={kpi.views.toLocaleString("de-DE")}
            trend={kpi.trends.views}
            sub={rangeLabel[range]}
          />
          <KpiCard
            icon={MousePointerClick}
            label="Klicks zum Anbieter"
            value={kpi.clicks.toLocaleString("de-DE")}
            trend={kpi.trends.clicks}
            sub={`${Math.round((kpi.clicks / kpi.views) * 100)} % Klickrate`}
          />
          <KpiCard
            icon={Inbox}
            label="Leads / Anfragen"
            value={kpi.leads.toString()}
            trend={kpi.trends.leads}
            badge={kpi.leadsNew > 0 ? `${kpi.leadsNew} neu` : undefined}
            sub={rangeLabel[range]}
          />
          <KpiCard
            icon={Star}
            label="Bewertung"
            value={kpi.rating.toFixed(1).replace(".", ",")}
            trend={kpi.trends.rating}
            trendUnit=""
            sub={`${kpi.ratingCount} Bewertungen`}
          />
        </div>

        {/* Visibility + Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <VisibilityCard />
          <div className="lg:col-span-2">
            <PerformanceChart series={series} range={range} />
          </div>
        </div>

        {/* Leads + Profile completion */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <LeadsPreview />
          </div>
          <ProfileStatusCard completion={completion} />
        </div>

        {/* Next steps */}
        <NextSteps />
      </div>
    </AnbieterPortalShell>
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

function KpiCard({
  icon: Icon,
  label,
  value,
  trend,
  trendUnit = "%",
  badge,
  sub,
}: {
  icon: typeof Eye;
  label: string;
  value: string;
  trend: number;
  trendUnit?: string;
  badge?: string;
  sub?: string;
}) {
  const up = trend >= 0;
  return (
    <div className="rounded-[20px] border bg-card p-5 shadow-soft transition-transform hover:-translate-y-0.5">
      <div className="flex items-center justify-between">
        <div className="inline-flex items-center justify-center size-9 rounded-xl bg-primary/10 text-primary">
          <Icon className="size-4" />
        </div>
        {badge ? (
          <span className="inline-flex items-center rounded-full bg-coral/15 text-coral text-[10px] font-semibold px-2 py-0.5">
            {badge}
          </span>
        ) : null}
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
          {trendUnit === "%" ? `${trend}%` : trend.toFixed(1).replace(".", ",")}
        </span>
        {sub ? <span className="text-muted-foreground">· {sub}</span> : null}
      </div>
    </div>
  );
}

function VisibilityCard() {
  return (
    <div className="rounded-[20px] border bg-card p-5 shadow-soft flex flex-col">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold">Sichtbarkeit im Verzeichnis</div>
        <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
          {profile.category}
        </span>
      </div>

      <div className="mt-4 rounded-xl bg-primary/5 border border-primary/15 p-4">
        <div className="text-xs text-muted-foreground">Organische Position</div>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="font-display text-3xl font-semibold tabular-nums">#5</span>
          <span className="text-xs text-muted-foreground">von 24 in {profile.category}</span>
        </div>
      </div>

      <div className="mt-3 rounded-xl border border-dashed border-border p-4">
        <div className="flex items-center gap-2 text-xs">
          <Sparkles className="size-3.5 text-coral" />
          <span className="font-semibold">Premium-Platzierung</span>
          <span className="ml-auto inline-flex items-center rounded-full bg-muted text-muted-foreground text-[10px] font-semibold px-2 py-0.5">
            inaktiv
          </span>
        </div>
        <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
          Du hast aktuell keine bezahlte Platzierung. Mit Premium erscheinst du oben in deiner
          Kategorie, klar als gesponsert gekennzeichnet.
        </p>
        <Button asChild size="sm" className="mt-3 w-full">
          <Link to="/anbieter-portal/platzierung">
            Sichtbarkeit erhöhen <ArrowRight className="size-3.5" />
          </Link>
        </Button>
      </div>

      <div className="mt-3 flex items-start gap-2 text-[11px] text-muted-foreground leading-relaxed">
        <Info className="size-3.5 mt-0.5 shrink-0" />
        <span>
          Die organische Position ist nicht käuflich. Nur Premium-Sichtbarkeit ist buchbar und wird
          immer als gesponsert markiert.
        </span>
      </div>
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
  const maxViews = Math.max(...series.map((s) => s.views));
  const maxClicks = Math.max(...series.map((s) => s.clicks));

  return (
    <div className="rounded-[20px] border bg-card p-5 shadow-soft h-full">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold">Performance-Verlauf</div>
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

function LeadsPreview() {
  return (
    <div className="rounded-[20px] border bg-card p-5 shadow-soft">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold">Letzte Leads</div>
          <div className="text-xs text-muted-foreground">Neueste Anfragen aus deinem Listing</div>
        </div>
        <Link
          to="/anbieter-portal/leads"
          className="text-xs font-medium text-primary hover:underline inline-flex items-center gap-1"
        >
          Alle Leads <ArrowRight className="size-3" />
        </Link>
      </div>

      <ul className="mt-4 divide-y divide-border">
        {leads.map((lead) => (
          <li key={lead.company} className="py-3 flex items-center gap-3">
            <div className="size-9 rounded-full bg-muted grid place-items-center text-xs font-semibold text-foreground/70 shrink-0">
              {lead.contact
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold truncate">{lead.company}</span>
                <span
                  className={cn(
                    "inline-flex items-center rounded-full text-[10px] font-semibold px-2 py-0.5",
                    lead.status === "neu"
                      ? "bg-coral/15 text-coral"
                      : "bg-success/15 text-success",
                  )}
                >
                  {lead.status === "neu" ? "neu" : "beantwortet"}
                </span>
              </div>
              <div className="text-xs text-muted-foreground truncate">{lead.note}</div>
            </div>
            <div className="text-[11px] text-muted-foreground shrink-0">{lead.date}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ProfileStatusCard({ completion }: { completion: number }) {
  const open = profileChecklist.filter((i) => !i.done);
  return (
    <div className="rounded-[20px] border bg-card p-5 shadow-soft">
      <div className="text-sm font-semibold">Profil-Status</div>

      <div className="mt-4">
        <div className="flex items-baseline justify-between">
          <span className="font-display text-3xl font-semibold tabular-nums">
            {completion}%
          </span>
          <span className="text-xs text-muted-foreground">vollständig</span>
        </div>
        <Progress value={completion} className="mt-2 h-2" />
      </div>

      <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-success/10 text-success px-3 py-1 text-xs font-semibold">
        <ShieldCheck className="size-3.5" /> Verifizierter Anbieter
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
              className={cn(
                item.done ? "text-muted-foreground line-through" : "text-foreground",
              )}
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

function NextSteps() {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-display text-xl font-semibold">Nächste Schritte</h2>
        <span className="text-xs text-muted-foreground">Empfehlungen für dich</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {nextSteps.map((step) => (
          <Link
            key={step.title}
            to={step.to}
            className="group rounded-[20px] border bg-card p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:border-primary/40"
          >
            <div className="text-sm font-semibold">{step.title}</div>
            <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">{step.text}</p>
            <div className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary">
              {step.cta} <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
