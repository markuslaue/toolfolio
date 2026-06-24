import {
  AlertTriangle,
  TrendingUp,
  Clock,
  Ghost,
  Zap,
  ArrowUpRight,
  Info,
  CreditCard,
  PiggyBank,
  Activity,
  Wallet,
  CheckCircle2,
  Search,
  Filter,
  ArrowUpDown,
  RefreshCw,
  AlertCircle,
  Sparkles,
  PartyPopper,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
  Line,
  LineChart,
} from "recharts";
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useCountUp } from "@/hooks/use-count-up";
import {
  abos,
  aktionen,
  aiCredits,
  anstehendeAbbuchungen,
  fmtDate,
  fmtEUR,
  kostenNachKanal,
  kostenNachKunde,
  kpis,
  sparvorschlaege,
  verlauf12M,
  type Kategorie,
  type Status,
} from "@/lib/toolfolio-data";

/* ---------------------------- Kategorie-Farben --------------------------- */

const katColor: Record<Kategorie, string> = {
  Design: "#E84393",
  SEO: "#12B76A",
  Kommunikation: "#3B82F6",
  "KI / API": "#6C5CE7",
  Entwicklung: "#0FB5BA",
  Produktivität: "#F5A623",
  eCommerce: "#FB923C",
};

function katPill(k: Kategorie) {
  const c = katColor[k];
  return {
    background: `${c}1A`,
    color: c,
  } as React.CSSProperties;
}

/* ----------------------------- Spar-Fortschritt --------------------------- */

function SparFortschritt() {
  const realisiert = 840;
  const ziel = 1284;
  const animated = useCountUp(realisiert);
  const pct = Math.min(1, animated / ziel);
  const size = 132;
  const stroke = 14;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <Card className="card-lift shadow-soft border-0 overflow-hidden">
      <CardContent className="p-5 sm:p-6 flex items-center gap-5">
        <div className="relative shrink-0" style={{ width: size, height: size }}>
          <svg width={size} height={size} className="-rotate-90">
            <circle cx={size / 2} cy={size / 2} r={r} stroke="var(--color-muted)" strokeWidth={stroke} fill="none" />
            <defs>
              <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#FF7A66" />
                <stop offset="100%" stopColor="#12B76A" />
              </linearGradient>
            </defs>
            <circle
              cx={size / 2}
              cy={size / 2}
              r={r}
              stroke="url(#ringGrad)"
              strokeWidth={stroke}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={c}
              strokeDashoffset={c * (1 - pct)}
              style={{ transition: "stroke-dashoffset 600ms ease-out" }}
            />
          </svg>
          <div className="absolute inset-0 grid place-items-center">
            <div className="text-center">
              <div className="font-display text-2xl font-bold leading-none">
                {Math.round(pct * 100)}%
              </div>
              <div className="text-[10px] text-muted-foreground mt-1">geholt</div>
            </div>
          </div>
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-xs font-medium text-coral">
            <Sparkles className="size-3.5" /> Dein Spar-Fortschritt 2026
          </div>
          <div className="font-display text-xl sm:text-2xl font-semibold leading-snug mt-1">
            Du hast schon{" "}
            <span style={{ color: "#12B76A" }}>{fmtEUR(animated)}</span>{" "}
            von {fmtEUR(ziel)} geholt.
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Stark. Noch 3 Vorschläge offen, dann hast du alles geholt.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

/* ------------------------------- KPI-Zeile ------------------------------- */

function CountEUR({ value }: { value: number }) {
  const v = useCountUp(value);
  return <>{fmtEUR(v)}</>;
}

function KpiCard({
  label,
  valueNode,
  hint,
  hintTone = "muted",
  icon: Icon,
  accent = "#6C5CE7",
  onClick,
  tooltip,
}: {
  label: string;
  valueNode: React.ReactNode;
  hint: string;
  hintTone?: "muted" | "success" | "destructive";
  icon: React.ComponentType<{ className?: string }>;
  accent?: string;
  onClick?: () => void;
  tooltip?: string;
}) {
  const toneClass =
    hintTone === "success"
      ? "text-success"
      : hintTone === "destructive"
        ? "text-destructive"
        : "text-muted-foreground";
  return (
    <Card
      onClick={onClick}
      className={`relative overflow-hidden border-0 shadow-soft card-lift ${onClick ? "cursor-pointer" : ""}`}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="text-xs font-medium text-muted-foreground flex items-center gap-1">
            {label}
            {tooltip && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="size-3.5 text-muted-foreground/70" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">{tooltip}</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          <div
            className="size-9 rounded-full grid place-items-center shrink-0"
            style={{ background: `${accent}1A`, color: accent }}
          >
            <Icon className="size-4" />
          </div>
        </div>
        <div className="mt-3 font-display font-semibold text-3xl sm:text-[2rem] leading-tight tracking-tight tabular" style={{ color: accent }}>
          {valueNode}
        </div>
        <div className={`mt-1 text-xs ${toneClass}`}>{hint}</div>
      </CardContent>
    </Card>
  );
}

function KpiRow() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <KpiCard
        label="Kosten pro Monat"
        valueNode={<CountEUR value={kpis.monatlich} />}
        hint={`+${kpis.vormonatProzent.toString().replace(".", ",")} % zum Vormonat`}
        hintTone="destructive"
        icon={Wallet}
        accent="#1F1D2B"
        tooltip="Summe aller monatlich aktiven Abos, jährliche Abos werden anteilig umgerechnet."
      />
      <KpiCard
        label="Hochrechnung pro Jahr"
        valueNode={<CountEUR value={kpis.jaehrlich} />}
        hint="auf Basis deiner aktuellen Abos"
        icon={TrendingUp}
        accent="#6C5CE7"
        tooltip="Lineare Hochrechnung auf 12 Monate basierend auf deinem aktuellen Bestand."
      />
      <KpiCard
        label="Aktive Abos"
        valueNode={`${kpis.aktiveAbos}`}
        hint={`+ ${kpis.trials} Trials, ${kpis.pausiert} pausiert`}
        icon={Activity}
        accent="#FF7A66"
      />
      <KpiCard
        label="Identifiziertes Sparpotenzial"
        valueNode={<CountEUR value={kpis.sparpotenzialJahr} />}
        hint={`pro Jahr, über ${kpis.vorschlaege} Vorschläge`}
        hintTone="success"
        icon={PiggyBank}
        accent="#12B76A"
        onClick={() => {
          const el = document.getElementById("sparvorschlaege");
          el?.scrollIntoView({ behavior: "smooth", block: "start" });
        }}
        tooltip="Summe aller Einsparvorschläge, die wir gerade für dich gefunden haben."
      />
    </div>
  );
}

/* ----------------------------- Aktions-Center ---------------------------- */

const aktionStyle: Record<
  string,
  { color: string; label: string; icon: React.ComponentType<{ className?: string }>; btnTone: "default" | "warning" | "destructive" }
> = {
  frist: { color: "#F5A623", label: "Frist", icon: Clock, btnTone: "warning" },
  trial: { color: "#F5A623", label: "Trial", icon: AlertTriangle, btnTone: "warning" },
  preis: { color: "#F0533D", label: "Preis", icon: TrendingUp, btnTone: "destructive" },
  zombie: { color: "#6C5CE7", label: "Zombie", icon: Ghost, btnTone: "default" },
  spike: { color: "#F0533D", label: "Spike", icon: Zap, btnTone: "destructive" },
};

function AktionsCenter() {
  return (
    <Card className="border-0 shadow-soft">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div>
            <CardTitle className="font-display text-xl flex items-center gap-2">
              <span className="size-8 rounded-full bg-accent grid place-items-center">
                <AlertCircle className="size-4 text-primary" />
              </span>
              Aktions-Center
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1.5">
              Das hier solltest du heute oder diese Woche entscheiden.
            </p>
          </div>
          <Badge className="rounded-full bg-accent text-primary border-0 px-3 py-1">
            {aktionen.length} offen
          </Badge>
        </div>
      </CardHeader>
      <CardContent class
="pt-0 space-y-2.5">
        <div className="flex items-start gap-3 p-3.5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10">
          <div className="size-10 rounded-full grid place-items-center shrink-0 bg-emerald-500/20 text-emerald-700">
            <Zap className="size-4.5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-semibold uppercase tracking-wide rounded-full px-2 py-0.5 bg-emerald-500/20 text-emerald-700">
                Live-API
              </span>
              <span className="text-sm font-semibold">OpenAI-Verbrauch diesen Monat +180&nbsp;%</span>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              Live aus der Anbieter-API gelesen. Wahrscheinlich ein neuer Prompt-Workflow.
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="shrink-0 hidden sm:inline-flex rounded-full border-emerald-500/40 text-emerald-700 hover:bg-emerald-500/10"
          >
            Verlauf ansehen
          </Button>
        </div>
        {aktionen.map((a) => {
          const s = aktionStyle[a.typ];
          const Icon = s.icon;
          return (
            <div
              key={a.id}
              className="flex items-start gap-3 p-3.5 rounded-2xl bg-muted/40 hover:bg-muted/70 transition-colors"
            >
              <div
                className="size-10 rounded-full grid place-items-center shrink-0"
                style={{ background: `${s.color}1F`, color: s.color }}
              >
                <Icon className="size-4.5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className="text-[10px] font-semibold uppercase tracking-wide rounded-full px-2 py-0.5"
                    style={{ background: `${s.color}1F`, color: s.color }}
                  >
                    {s.label}
                  </span>
                  <span className="text-sm font-semibold">{a.titel}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">{a.beschreibung}</p>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="shrink-0 hidden sm:inline-flex rounded-full border-0 shadow-sm"
                style={{ background: s.color, color: "white" }}
              >
                {a.button}
              </Button>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

/* ------------------------------ Kostenverlauf ----------------------------- */

function Pill({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
        active ? "bg-primary text-primary-foreground shadow-soft" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function Kostenverlauf() {
  const [view, setView] = useState<"kategorie" | "kanal">("kategorie");
  return (
    <Card className="border-0 shadow-soft animate-draw">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <CardTitle className="font-display text-xl">Kostenverlauf</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Letzte 12 Monate, in Euro</p>
          </div>
          <div className="inline-flex rounded-full bg-muted/60 p-1">
            <Pill active={view === "kategorie"} onClick={() => setView("kategorie")}>nach Kategorie</Pill>
            <Pill active={view === "kanal"} onClick={() => setView("kanal")}>nach Zahlungskanal</Pill>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={verlauf12M} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gFix" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6C5CE7" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#6C5CE7" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="gVar" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FF7A66" stopOpacity={0.55} />
                  <stop offset="100%" stopColor="#FF7A66" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="2 6" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="monat" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v} €`} width={50} />
              <RTooltip
                cursor={{ stroke: "#6C5CE7", strokeOpacity: 0.2, strokeWidth: 2 }}
                contentStyle={{
                  background: "var(--color-card)",
                  border: "none",
                  borderRadius: 14,
                  boxShadow: "var(--shadow-lift)",
                  fontSize: 12,
                  padding: "10px 12px",
                }}
                formatter={(v: number, n) => [fmtEUR(v), n === "fix" ? "Fixkosten" : "Variabel"]}
              />
              <Area type="monotone" dataKey="fix" stackId="1" stroke="#6C5CE7" strokeWidth={2.5} fill="url(#gFix)" />
              <Area type="monotone" dataKey="variabel" stackId="1" stroke="#FF7A66" strokeWidth={2.5} fill="url(#gVar)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5"><span className="size-2.5 rounded-full" style={{ background: "#6C5CE7" }} /> Fixkosten</span>
          <span className="inline-flex items-center gap-1.5"><span className="size-2.5 rounded-full" style={{ background: "#FF7A66" }} /> Variable Kosten</span>
          <span className="ml-auto hidden sm:inline">Ansicht: {view === "kategorie" ? "nach Kategorie" : "nach Zahlungskanal"}</span>
        </div>
      </CardContent>
    </Card>
  );
}

/* ------------------------ Kosten nach Kunde / Kanal ----------------------- */

const kundeFarben = ["#6C5CE7", "#12B76A", "#FF7A66", "#9CA3AF"];

function KostenNachKunde() {
  const data = kostenNachKunde.map((k, i) => ({ ...k, farbe: kundeFarben[i] ?? "#9CA3AF" }));
  const total = data.reduce((s, x) => s + x.wert, 0);
  return (
    <Card className="border-0 shadow-soft">
      <CardHeader className="pb-2">
        <CardTitle className="font-display text-xl">Kosten nach Kunde</CardTitle>
        <p className="text-sm text-muted-foreground">So verteilen sich deine Toolkosten auf deine Kunden.</p>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="2 6" stroke="var(--color-border)" horizontal={false} />
              <XAxis type="number" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v} €`} />
              <YAxis type="category" dataKey="name" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} width={150} />
              <RTooltip
                cursor={{ fill: "rgba(108,92,231,0.06)" }}
                contentStyle={{ background: "var(--color-card)", border: "none", borderRadius: 14, boxShadow: "var(--shadow-lift)", fontSize: 12, padding: "10px 12px" }}
                formatter={(v: number) => [fmtEUR(v), "Monat"]}
              />
              <Bar dataKey="wert" radius={[8, 8, 8, 8]}>
                {data.map((k) => (
                  <Cell key={k.name} fill={k.farbe} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-3 flex items-center justify-between gap-3 text-xs">
          <span className="text-muted-foreground">
            Nicht zugeordnet: <span className="text-foreground font-semibold tabular">{fmtEUR(1013)}</span> / Monat
          </span>
          <a href="#" className="font-medium text-primary hover:underline">jetzt zuordnen</a>
        </div>
        <div className="mt-2 text-[11px] text-muted-foreground">Gesamt: {fmtEUR(total)} / Monat</div>
      </CardContent>
    </Card>
  );
}

const kanalFarben = ["#6C5CE7", "#FF7A66", "#12B76A", "#F5A623", "#3B82F6"];

function KostenNachKanal() {
  const data = kostenNachKanal.map((k, i) => ({ ...k, farbe: kanalFarben[i] ?? "#9CA3AF" }));
  const total = data.reduce((s, x) => s + x.wert, 0);
  return (
    <Card className="border-0 shadow-soft">
      <CardHeader className="pb-2">
        <CardTitle className="font-display text-xl flex items-center gap-2">
          <span className="size-8 rounded-full bg-accent grid place-items-center">
            <CreditCard className="size-4 text-primary" />
          </span>
          Kosten nach Zahlungskanal
        </CardTitle>
        <p className="text-sm text-muted-foreground">Du nutzt mehrere Karten und Kanäle. Hier siehst du, welcher wofür.</p>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 flex-col sm:flex-row">
          <div className="h-[200px] w-full sm:w-[200px] shrink-0 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} dataKey="wert" nameKey="name" innerRadius={58} outerRadius={86} paddingAngle={4} cornerRadius={6}>
                  {data.map((k) => (
                    <Cell key={k.name} fill={k.farbe} stroke="var(--color-surface)" strokeWidth={3} />
                  ))}
                </Pie>
                <RTooltip
                  contentStyle={{ background: "var(--color-card)", border: "none", borderRadius: 14, boxShadow: "var(--shadow-lift)", fontSize: 12, padding: "10px 12px" }}
                  formatter={(v: number) => [fmtEUR(v), "Monat"]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 grid place-items-center pointer-events-none">
              <div className="text-center">
                <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Gesamt</div>
                <div className="font-display text-lg font-semibold">{fmtEUR(total)}</div>
              </div>
            </div>
          </div>
          <ul className="flex-1 w-full space-y-2 text-sm">
            {data.map((k) => (
              <li key={k.name} className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-2 min-w-0">
                  <span className="size-2.5 rounded-full shrink-0" style={{ background: k.farbe }} />
                  <span className="truncate">{k.name}</span>
                </span>
                <span className="text-foreground font-semibold tabular">{fmtEUR(k.wert)}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

/* ------------------------------- AI Credits ------------------------------ */

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const points = data.map((v, i) => ({ i, v }));
  return (
    <div className="h-10 w-28">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={points} margin={{ top: 4, right: 0, left: 0, bottom: 4 }}>
          <defs>
            <linearGradient id={`sp-${color}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.4} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Line type="monotone" dataKey="v" stroke={color} strokeWidth={2.5} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function AiCreditsBlock() {
  return (
    <Card className="border-0 shadow-soft">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <CardTitle className="font-display text-xl flex items-center gap-2">
              <span className="size-8 rounded-full bg-accent grid place-items-center">
                <Zap className="size-4 text-primary" />
              </span>
              AI-Credits & variable Kosten
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1.5">
              Verbrauchsbasierte Tools sind oft die unsichtbarsten Kosten.
            </p>
          </div>
          <Badge className="rounded-full bg-accent text-primary border-0 px-3 py-1 tabular">{fmtEUR(654.4)} im Juni</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-1">
        {aiCredits.map((c) => {
          const color =
            c.hinweisTyp === "danger"
              ? "#F0533D"
              : c.hinweisTyp === "warn"
                ? "#F5A623"
                : "#6C5CE7";
          return (
            <div
              key={c.tool}
              className="flex items-center gap-3 py-3 px-2 rounded-2xl hover:bg-muted/50 transition-colors flex-wrap sm:flex-nowrap"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div
                  className="size-10 rounded-xl grid place-items-center font-display text-sm font-bold text-white shrink-0"
                  style={{ background: color }}
                >
                  {c.tool[0]}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold truncate">{c.tool}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-2 flex-wrap mt-0.5">
                    {c.autoRecharge ? (
                      <span className="inline-flex items-center gap-1">
                        <RefreshCw className="size-3" /> lädt automatisch nach bei 0
                      </span>
                    ) : (
                      <span>kein Auto-Recharge</span>
                    )}
                    {c.hinweis && (
                      <span
                        className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold"
                        style={{
                          background: `${color}1F`,
                          color,
                        }}
                      >
                        <AlertTriangle className="size-3" /> {c.hinweis}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <Sparkline data={c.trend} color={color} />
              <div className="font-display text-base font-semibold tabular w-24 text-right shrink-0">
                {fmtEUR(c.verbrauch)}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

/* -------------------------- Anstehende Abbuchungen ------------------------ */

function AnstehendeAbbuchungen() {
  return (
    <Card className="border-0 shadow-soft">
      <CardHeader className="pb-2">
        <CardTitle className="font-display text-xl flex items-center gap-2">
          <span className="size-8 rounded-full bg-accent grid place-items-center">
            <Clock className="size-4 text-primary" />
          </span>
          Anstehende Abbuchungen
        </CardTitle>
        <p className="text-sm text-muted-foreground">Was diese und nächste Woche vom Konto geht.</p>
      </CardHeader>
      <CardContent className="space-y-0.5">
        {anstehendeAbbuchungen.map((a, i) => (
          <div key={i} className="flex items-center gap-3 py-2.5 px-2 rounded-xl hover:bg-muted/50 transition-colors">
            <div className="w-14 shrink-0 text-xs tabular font-semibold text-primary">
              {fmtDate(a.datum).slice(0, 5)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold truncate">{a.tool}</div>
              <div className="text-xs text-muted-foreground truncate">{a.kanal}</div>
            </div>
            <div className="font-display text-sm font-semibold tabular shrink-0">
              {fmtEUR(a.betrag)}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

/* ------------------------------ Sparvorschläge ---------------------------- */

function Confetti() {
  const pieces = Array.from({ length: 14 });
  const colors = ["#FF7A66", "#12B76A", "#6C5CE7", "#F5A623", "#3B82F6"];
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {pieces.map((_, i) => {
        const tx = (Math.random() - 0.5) * 220;
        const ty = -80 - Math.random() * 120;
        const color = colors[i % colors.length];
        return (
          <span
            key={i}
            className="absolute left-1/2 top-1/2 size-2 rounded-sm"
            style={{
              background: color,
              ["--tx" as never]: `${tx}px`,
              ["--ty" as never]: `${ty}px`,
              animation: `confetti-pop ${800 + Math.random() * 400}ms ease-out forwards`,
              animationDelay: `${Math.random() * 150}ms`,
            }}
          />
        );
      })}
    </div>
  );
}

function SparCard({ v }: { v: typeof sparvorschlaege[number] }) {
  const [done, setDone] = useState(false);
  return (
    <Card className="relative border-0 shadow-soft card-lift overflow-hidden" style={{ background: "linear-gradient(160deg, #ECFDF5 0%, #FFFFFF 60%)" }}>
      {done && <Confetti />}
      <CardContent className="p-5">
        <div className="flex items-center gap-2 text-success">
          <span className="size-8 rounded-full grid place-items-center" style={{ background: "#12B76A22" }}>
            <PiggyBank className="size-4" />
          </span>
          <span className="text-xs font-semibold">Sparvorschlag</span>
        </div>
        <div className="mt-3 font-display text-lg font-semibold">{v.titel}</div>
        <p className="mt-1 text-sm text-muted-foreground">{v.text}</p>
        <Button
          size="sm"
          onClick={() => setDone(true)}
          className="mt-4 gap-1.5 rounded-full bg-success text-success-foreground hover:bg-success/90 shadow-soft"
        >
          {done ? (<><PartyPopper className="size-3.5" /> Sauber gemacht</>) : (<>{v.button} <ArrowUpRight className="size-3.5" /></>)}
        </Button>
      </CardContent>
    </Card>
  );
}

function Sparvorschlaege() {
  return (
    <div id="sparvorschlaege" className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {sparvorschlaege.map((v) => <SparCard key={v.id} v={v} />)}
    </div>
  );
}

/* ----------------------------- Alle Abos Tabelle -------------------------- */

const statusBadge: Record<Status, { color: string; bg: string; icon: React.ComponentType<{ className?: string }> }> = {
  aktiv: { color: "#12B76A", bg: "#12B76A1A", icon: CheckCircle2 },
  Trial: { color: "#F5A623", bg: "#F5A6231F", icon: AlertTriangle },
  pausiert: { color: "#6B6779", bg: "#6B67791A", icon: Clock },
};

function AlleAbos() {
  const kategorien = useMemo(() => ["Alle", ...new Set(abos.map((a) => a.kategorie))], []);
  const [aktivKat, setAktivKat] = useState<string>("Alle");
  const [suche, setSuche] = useState("");

  const gefiltert = abos.filter(
    (a) =>
      (aktivKat === "Alle" || a.kategorie === aktivKat) &&
      (suche === "" ||
        a.tool.toLowerCase().includes(suche.toLowerCase()) ||
        a.kunde.toLowerCase().includes(suche.toLowerCase())),
  );

  return (
    <Card className="border-0 shadow-soft">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <CardTitle className="font-display text-xl">Alle Abos</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {gefiltert.length} von {abos.length} Abos sichtbar
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <input
                value={suche}
                onChange={(e) => setSuche(e.target.value)}
                placeholder="Suchen"
                className="h-9 pl-9 pr-3 rounded-full bg-muted/60 text-sm w-44 focus:outline-none focus:ring-2 focus:ring-ring border-0"
              />
            </div>
            <Button size="sm" variant="outline" className="gap-1.5 h-9 rounded-full border-0 bg-muted/60">
              <Filter className="size-3.5" /> Filter
            </Button>
            <Button size="sm" variant="outline" className="gap-1.5 h-9 rounded-full border-0 bg-muted/60">
              <ArrowUpDown className="size-3.5" /> Sortieren
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap mt-3">
          {kategorien.map((k) => {
            const active = aktivKat === k;
            const color = k === "Alle" ? "#6C5CE7" : katColor[k as Kategorie];
            return (
              <button
                key={k}
                onClick={() => setAktivKat(k)}
                className="text-xs px-3 py-1.5 rounded-full font-medium transition-all"
                style={
                  active
                    ? { background: color, color: "white" }
                    : { background: `${color}14`, color }
                }
              >
                {k}
              </button>
            );
          })}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-muted-foreground">
                <th className="text-left font-medium px-5 py-3">Tool / Anbieter</th>
                <th className="text-left font-medium px-3 py-3">Kategorie</th>
                <th className="text-right font-medium px-3 py-3">Kosten</th>
                <th className="text-left font-medium px-3 py-3">Intervall</th>
                <th className="text-left font-medium px-3 py-3">Nächste Abbuchung</th>
                <th className="text-left font-medium px-3 py-3">Zahlungskanal</th>
                <th className="text-left font-medium px-3 py-3">Kunde</th>
                <th className="text-left font-medium px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {gefiltert.map((a) => {
                const S = statusBadge[a.status];
                const SIcon = S.icon;
                const katC = katColor[a.kategorie];
                return (
                  <tr key={a.id} className="hover:bg-muted/40 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="size-9 rounded-xl grid place-items-center font-display font-bold text-sm text-white shadow-soft"
                          style={{ background: a.farbe }}
                        >
                          {a.initial}
                        </div>
                        <span className="font-semibold">{a.tool}</span>
                      </div>
                    </td>
                    <td className="px-3 py-4">
                      <span
                        className="inline-block text-[11px] font-semibold rounded-full px-2.5 py-1"
                        style={katPill(a.kategorie)}
                      >
                        {a.kategorie}
                      </span>
                    </td>
                    <td className="px-3 py-4 text-right tabular font-semibold">{fmtEUR(a.kosten)}</td>
                    <td className="px-3 py-4">
                      <span className="text-xs rounded-full px-2.5 py-1 bg-muted/70 text-muted-foreground">
                        {a.intervall}
                      </span>
                    </td>
                    <td className="px-3 py-4 text-xs tabular text-muted-foreground">{fmtDate(a.naechsteAbbuchung)}</td>
                    <td className="px-3 py-4 text-xs text-muted-foreground">{a.zahlungskanal}</td>
                    <td className="px-3 py-4 text-xs">{a.kunde}</td>
                    <td className="px-5 py-4">
                      <span
                        className="inline-flex items-center gap-1.5 text-[11px] font-semibold rounded-full px-2.5 py-1"
                        style={{ background: S.bg, color: S.color }}
                      >
                        <span className="size-1.5 rounded-full" style={{ background: S.color }} />
                        {a.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {gefiltert.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-12">
                    <div className="text-sm font-semibold">Keine Abos gefunden</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Passe deine Filter an oder lege ein neues Abo an.
                    </div>
                    <Button size="sm" className="mt-3 gap-1.5 rounded-full">
                      <PiggyBank className="size-4" /> Abo hinzufügen
                    </Button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

/* --------------------------------- Page --------------------------------- */

export function Dashboard() {
  return (
    <div className="space-y-6">
      <SparFortschritt />
      <KpiRow />
      <AktionsCenter />
      <Kostenverlauf />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <KostenNachKunde />
        <KostenNachKanal />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AiCreditsBlock />
        </div>
        <AnstehendeAbbuchungen />
      </div>
      <div>
        <h2 className="font-display text-xl font-semibold mb-3">Sparvorschläge</h2>
        <Sparvorschlaege />
      </div>
      <AlleAbos />
      <div className="text-center text-xs text-muted-foreground pt-2 pb-6">
        Toolfolio behält deine Software-Abos für dich im Blick.
      </div>
    </div>
  );
}
