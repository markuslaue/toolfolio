import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
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

/* ------------------------------- KPI-Zeile ------------------------------- */

function KpiCard({
  label,
  value,
  hint,
  hintTone = "muted",
  icon: Icon,
  onClick,
  tooltip,
}: {
  label: string;
  value: string;
  hint: string;
  hintTone?: "muted" | "success" | "destructive";
  icon: React.ComponentType<{ className?: string }>;
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
      className={`relative overflow-hidden ${onClick ? "cursor-pointer transition-colors hover:border-primary/40" : ""}`}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground flex items-center gap-1">
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
          <Icon className="size-4 text-muted-foreground/70 shrink-0" />
        </div>
        <div className="mt-2 font-mono font-semibold text-2xl sm:text-3xl tracking-tight tabular">
          {value}
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
        value={fmtEUR(kpis.monatlich)}
        hint={`+${kpis.vormonatProzent.toString().replace(".", ",")} % zum Vormonat`}
        hintTone="destructive"
        icon={Wallet}
        tooltip="Summe aller monatlich aktiven Abos, jährliche Abos werden anteilig umgerechnet."
      />
      <KpiCard
        label="Hochrechnung pro Jahr"
        value={fmtEUR(kpis.jaehrlich)}
        hint="auf Basis deiner aktuellen Abos"
        icon={TrendingUp}
        tooltip="Lineare Hochrechnung auf 12 Monate basierend auf deinem aktuellen Bestand."
      />
      <KpiCard
        label="Aktive Abos"
        value={`${kpis.aktiveAbos}`}
        hint={`+ ${kpis.trials} Trials, ${kpis.pausiert} pausiert`}
        icon={Activity}
      />
      <KpiCard
        label="Identifiziertes Sparpotenzial"
        value={fmtEUR(kpis.sparpotenzialJahr)}
        hint={`pro Jahr, über ${kpis.vorschlaege} Vorschläge`}
        hintTone="success"
        icon={PiggyBank}
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
  { tone: string; badge: string; label: string; icon: React.ComponentType<{ className?: string }> }
> = {
  frist: { tone: "border-l-warning", badge: "bg-warning/15 text-warning-foreground border border-warning/30", label: "Frist", icon: Clock },
  trial: { tone: "border-l-warning", badge: "bg-warning/15 text-warning-foreground border border-warning/30", label: "Trial", icon: AlertTriangle },
  preis: { tone: "border-l-destructive", badge: "bg-destructive/10 text-destructive border border-destructive/30", label: "Preis", icon: TrendingUp },
  zombie: { tone: "border-l-muted-foreground", badge: "bg-muted text-muted-foreground border border-border", label: "Zombie", icon: Ghost },
  spike: { tone: "border-l-destructive", badge: "bg-destructive/10 text-destructive border border-destructive/30", label: "Spike", icon: Zap },
};

function AktionsCenter() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div>
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <AlertCircle className="size-5 text-primary" /> Aktions-Center
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Das hier solltest du heute oder diese Woche entscheiden.
            </p>
          </div>
          <Badge variant="secondary" className="font-mono">
            {aktionen.length} offen
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <ul className="divide-y divide-border">
          {aktionen.map((a) => {
            const s = aktionStyle[a.typ];
            const Icon = s.icon;
            return (
              <li
                key={a.id}
                className={`flex items-start gap-3 py-3.5 border-l-2 pl-3 ${s.tone}`}
              >
                <div className="mt-0.5 size-8 rounded-md bg-muted grid place-items-center shrink-0">
                  <Icon className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide rounded px-1.5 py-0.5 ${s.badge}`}>
                      {s.label}
                    </span>
                    <span className="text-sm font-medium">{a.titel}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">{a.beschreibung}</p>
                </div>
                <Button size="sm" variant="outline" className="shrink-0 hidden sm:inline-flex">
                  {a.button}
                </Button>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}

/* ------------------------------ Kostenverlauf ----------------------------- */

function Kostenverlauf() {
  const [view, setView] = useState<"kategorie" | "kanal">("kategorie");
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <CardTitle className="font-display text-lg">Kostenverlauf</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">Letzte 12 Monate, in Euro</p>
          </div>
          <div className="inline-flex rounded-md border border-border bg-background p-0.5 text-xs">
            <button
              onClick={() => setView("kategorie")}
              className={`px-3 py-1.5 rounded ${view === "kategorie" ? "bg-accent text-foreground font-medium" : "text-muted-foreground hover:text-foreground"}`}
            >
              nach Kategorie
            </button>
            <button
              onClick={() => setView("kanal")}
              className={`px-3 py-1.5 rounded ${view === "kanal" ? "bg-accent text-foreground font-medium" : "text-muted-foreground hover:text-foreground"}`}
            >
              nach Zahlungskanal
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={verlauf12M} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gFix" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="gVar" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-warning)" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="var(--color-warning)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="monat" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v} €`} width={50} />
              <RTooltip
                contentStyle={{
                  background: "var(--color-card)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
                formatter={(v: number, n) => [fmtEUR(v), n === "fix" ? "Fixkosten" : "Variabel"]}
              />
              <Area type="monotone" dataKey="fix" stackId="1" stroke="var(--color-primary)" fill="url(#gFix)" />
              <Area type="monotone" dataKey="variabel" stackId="1" stroke="var(--color-warning)" fill="url(#gVar)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-primary" /> Fixkosten</span>
          <span className="inline-flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-warning" /> Variable Kosten</span>
          <span className="ml-auto hidden sm:inline">Ansicht: {view === "kategorie" ? "nach Kategorie" : "nach Zahlungskanal"}</span>
        </div>
      </CardContent>
    </Card>
  );
}

/* ------------------------ Kosten nach Kunde / Kanal ----------------------- */

function KostenNachKunde() {
  const total = kostenNachKunde.reduce((s, x) => s + x.wert, 0);
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="font-display text-lg">Kosten nach Kunde</CardTitle>
        <p className="text-xs text-muted-foreground">So verteilen sich deine Toolkosten auf deine Kunden.</p>
      </CardHeader>
      <CardContent>
        <div className="h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={kostenNachKunde} layout="vertical" margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} />
              <XAxis type="number" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v} €`} />
              <YAxis type="category" dataKey="name" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} width={150} />
              <RTooltip
                contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }}
                formatter={(v: number) => [fmtEUR(v), "Monat"]}
              />
              <Bar dataKey="wert" radius={[0, 4, 4, 0]}>
                {kostenNachKunde.map((k) => (
                  <Cell key={k.name} fill={k.farbe} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-3 flex items-center justify-between gap-3 text-xs">
          <span className="text-muted-foreground">
            Nicht zugeordnet: <span className="font-mono text-foreground">{fmtEUR(1013)}</span> / Monat
          </span>
          <a href="#" className="font-medium text-primary hover:underline">jetzt zuordnen</a>
        </div>
        <div className="mt-2 text-[11px] text-muted-foreground">Gesamt: {fmtEUR(total)} / Monat</div>
      </CardContent>
    </Card>
  );
}

function KostenNachKanal() {
  const total = kostenNachKanal.reduce((s, x) => s + x.wert, 0);
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="font-display text-lg flex items-center gap-2">
          <CreditCard className="size-4 text-primary" /> Kosten nach Zahlungskanal
        </CardTitle>
        <p className="text-xs text-muted-foreground">Du nutzt mehrere Karten und Kanäle, hier siehst du, welcher wofür.</p>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 flex-col sm:flex-row">
          <div className="h-[180px] w-full sm:w-[180px] shrink-0 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={kostenNachKanal} dataKey="wert" nameKey="name" innerRadius={50} outerRadius={75} paddingAngle={2}>
                  {kostenNachKanal.map((k) => (
                    <Cell key={k.name} fill={k.farbe} stroke="var(--color-surface)" strokeWidth={2} />
                  ))}
                </Pie>
                <RTooltip
                  contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }}
                  formatter={(v: number) => [fmtEUR(v), "Monat"]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 grid place-items-center pointer-events-none">
              <div className="text-center">
                <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Gesamt</div>
                <div className="font-mono text-sm font-semibold">{fmtEUR(total)}</div>
              </div>
            </div>
          </div>
          <ul className="flex-1 w-full space-y-1.5 text-xs">
            {kostenNachKanal.map((k) => (
              <li key={k.name} className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-2 min-w-0">
                  <span className="size-2.5 rounded-sm shrink-0" style={{ background: k.farbe }} />
                  <span className="truncate">{k.name}</span>
                </span>
                <span className="font-mono text-foreground">{fmtEUR(k.wert)}</span>
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
    <div className="h-8 w-24">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={points} margin={{ top: 2, right: 0, left: 0, bottom: 2 }}>
          <Line type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function AiCreditsBlock() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <Zap className="size-4 text-primary" /> AI-Credits & variable Kosten
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Verbrauchsbasierte Tools, oft die unsichtbarsten Kosten.
            </p>
          </div>
          <Badge variant="secondary" className="font-mono">{fmtEUR(654.4)} im Juni</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <ul className="divide-y divide-border">
          {aiCredits.map((c) => {
            const color =
              c.hinweisTyp === "danger"
                ? "var(--color-destructive)"
                : c.hinweisTyp === "warn"
                  ? "var(--color-warning)"
                  : "var(--color-primary)";
            return (
              <li key={c.tool} className="flex items-center gap-3 py-3 flex-wrap sm:flex-nowrap">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="size-8 rounded-md bg-muted grid place-items-center font-mono text-xs font-semibold">
                    {c.tool[0]}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{c.tool}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-2 flex-wrap">
                      {c.autoRecharge ? (
                        <span className="inline-flex items-center gap-1">
                          <RefreshCw className="size-3" /> lädt automatisch nach bei 0
                        </span>
                      ) : (
                        <span>kein Auto-Recharge</span>
                      )}
                      {c.hinweis && (
                        <span
                          className={`inline-flex items-center gap-1 font-medium ${
                            c.hinweisTyp === "danger"
                              ? "text-destructive"
                              : c.hinweisTyp === "warn"
                                ? "text-warning"
                                : "text-muted-foreground"
                          }`}
                        >
                          <AlertTriangle className="size-3" /> {c.hinweis}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <Sparkline data={c.trend} color={color} />
                <div className="font-mono text-sm font-semibold tabular w-24 text-right shrink-0">
                  {fmtEUR(c.verbrauch)}
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}

/* -------------------------- Anstehende Abbuchungen ------------------------ */

function AnstehendeAbbuchungen() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="font-display text-lg flex items-center gap-2">
          <Clock className="size-4 text-primary" /> Anstehende Abbuchungen
        </CardTitle>
        <p className="text-xs text-muted-foreground">Was diese und nächste Woche vom Konto geht.</p>
      </CardHeader>
      <CardContent>
        <ul className="divide-y divide-border">
          {anstehendeAbbuchungen.map((a, i) => (
            <li key={i} className="flex items-center gap-3 py-2.5">
              <div className="w-16 shrink-0 text-xs font-mono text-muted-foreground">
                {fmtDate(a.datum).slice(0, 5)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium truncate">{a.tool}</div>
                <div className="text-xs text-muted-foreground truncate">{a.kanal}</div>
              </div>
              <div className="font-mono text-sm font-semibold tabular shrink-0">
                {fmtEUR(a.betrag)}
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

/* ------------------------------ Sparvorschläge ---------------------------- */

function Sparvorschlaege() {
  return (
    <div id="sparvorschlaege" className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {sparvorschlaege.map((v) => (
        <Card key={v.id} className="border-success/30 bg-success/5">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 text-success">
              <PiggyBank className="size-4" />
              <span className="text-[10px] font-semibold uppercase tracking-wide">Sparvorschlag</span>
            </div>
            <div className="mt-2 font-display text-base font-semibold">{v.titel}</div>
            <p className="mt-1 text-sm text-muted-foreground">{v.text}</p>
            <Button size="sm" variant="outline" className="mt-4 gap-1.5 border-success/40 text-foreground hover:bg-success/10">
              {v.button} <ArrowUpRight className="size-3.5" />
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/* ----------------------------- Alle Abos Tabelle -------------------------- */

const statusBadge: Record<Status, { cls: string; icon: React.ComponentType<{ className?: string }> }> = {
  aktiv: { cls: "bg-success/10 text-success border border-success/30", icon: CheckCircle2 },
  Trial: { cls: "bg-warning/15 text-warning-foreground border border-warning/40", icon: AlertTriangle },
  pausiert: { cls: "bg-muted text-muted-foreground border border-border", icon: Clock },
};

const kategorieFarbe: Record<Kategorie, string> = {
  Design: "bg-[oklch(0.95_0.04_300)] text-[oklch(0.4_0.18_300)] border border-[oklch(0.85_0.08_300)]",
  SEO: "bg-[oklch(0.95_0.04_220)] text-[oklch(0.4_0.18_220)] border border-[oklch(0.85_0.08_220)]",
  Kommunikation: "bg-[oklch(0.95_0.04_30)] text-[oklch(0.45_0.16_30)] border border-[oklch(0.85_0.08_30)]",
  "KI / API": "bg-[oklch(0.95_0.04_160)] text-[oklch(0.4_0.16_160)] border border-[oklch(0.85_0.08_160)]",
  Entwicklung: "bg-accent text-accent-foreground border border-border",
  Produktivität: "bg-[oklch(0.95_0.04_80)] text-[oklch(0.4_0.16_80)] border border-[oklch(0.85_0.08_80)]",
  eCommerce: "bg-[oklch(0.95_0.04_140)] text-[oklch(0.4_0.16_140)] border border-[oklch(0.85_0.08_140)]",
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
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <CardTitle className="font-display text-lg">Alle Abos</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              {gefiltert.length} von {abos.length} Abos sichtbar
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <input
                value={suche}
                onChange={(e) => setSuche(e.target.value)}
                placeholder="Suchen"
                className="h-8 pl-8 pr-3 rounded-md border border-border bg-background text-sm w-44 focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <Button size="sm" variant="outline" className="gap-1.5 h-8">
              <Filter className="size-3.5" /> Filter
            </Button>
            <Button size="sm" variant="outline" className="gap-1.5 h-8">
              <ArrowUpDown className="size-3.5" /> Sortieren
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap mt-2">
          {kategorien.map((k) => (
            <button
              key={k}
              onClick={() => setAktivKat(k)}
              className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                aktivKat === k
                  ? "bg-foreground text-background border-foreground"
                  : "bg-background text-muted-foreground border-border hover:text-foreground hover:border-foreground/40"
              }`}
            >
              {k}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-y border-border bg-muted/40 text-xs text-muted-foreground">
                <th className="text-left font-medium px-4 py-2.5">Tool / Anbieter</th>
                <th className="text-left font-medium px-4 py-2.5">Kategorie</th>
                <th className="text-right font-medium px-4 py-2.5">Kosten</th>
                <th className="text-left font-medium px-4 py-2.5">Intervall</th>
                <th className="text-left font-medium px-4 py-2.5">Nächste Abbuchung</th>
                <th className="text-left font-medium px-4 py-2.5">Zahlungskanal</th>
                <th className="text-left font-medium px-4 py-2.5">Kunde</th>
                <th className="text-left font-medium px-4 py-2.5">Status</th>
              </tr>
            </thead>
            <tbody>
              {gefiltert.map((a) => {
                const S = statusBadge[a.status];
                const SIcon = S.icon;
                return (
                  <tr key={a.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="size-7 rounded-md grid place-items-center font-display font-bold text-xs text-white"
                          style={{ background: a.farbe }}
                        >
                          {a.initial}
                        </div>
                        <span className="font-medium">{a.tool}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block text-[10px] font-semibold uppercase tracking-wide rounded px-2 py-0.5 ${kategorieFarbe[a.kategorie]}`}>
                        {a.kategorie}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-right tabular">{fmtEUR(a.kosten)}</td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="font-normal text-xs">
                        {a.intervall}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{fmtDate(a.naechsteAbbuchung)}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{a.zahlungskanal}</td>
                    <td className="px-4 py-3 text-xs">{a.kunde}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide rounded px-1.5 py-0.5 ${S.cls}`}>
                        <SIcon className="size-3" /> {a.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {gefiltert.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-12">
                    <div className="text-sm font-medium">Keine Abos gefunden</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Passe deine Filter an oder lege ein neues Abo an.
                    </div>
                    <Button size="sm" className="mt-3 gap-1.5">
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
    <div className="space-y-5">
      <KpiRow />
      <AktionsCenter />
      <Kostenverlauf />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <KostenNachKunde />
        <KostenNachKanal />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <AiCreditsBlock />
        </div>
        <AnstehendeAbbuchungen />
      </div>
      <div>
        <h2 className="font-display text-lg font-semibold mb-3">Sparvorschläge</h2>
        <Sparvorschlaege />
      </div>
      <AlleAbos />
      <div className="text-center text-xs text-muted-foreground pt-2 pb-6">
        Toolfolio behält deine Software-Abos für dich im Blick.
      </div>
    </div>
  );
}
