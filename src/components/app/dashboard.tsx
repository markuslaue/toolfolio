"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
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
  RefreshCw,
  AlertCircle,
  Sparkles,
  PartyPopper,
  Plus,
  Receipt,
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useCountUp } from "@/hooks/use-count-up";
import { formatEur } from "@/lib/constants";
import { KATEGORIE_FARBEN, INTERVALL_LABEL, type AboStatus, type Intervall } from "@/lib/abos";
import type { ServiceDaten } from "@/lib/ai-credits";
import type { VerlaufPunkt } from "@/lib/kostenverlauf";
import { setVorschlagStatus, type SparSnapshot } from "@/app/app/sparen/actions";

/* ------------------------------- Typen ---------------------------------- */

export type AktionTyp = "frist" | "trial" | "preis" | "zombie" | "spike";

export type Aktion = {
  key: string;
  typ: AktionTyp;
  titel: string;
  beschreibung: string;
  button: string;
  href: string;
  /** Aus einer angebundenen Anbieter-API gelesen, nicht geschaetzt. */
  live?: boolean;
};

export type AboZeile = {
  id: string;
  tool: string;
  initial: string;
  farbe: string;
  kategorie: string;
  kosten: number;
  waehrung: string;
  intervall: string;
  naechsteAbbuchung: string | null;
  zahlungskanal: string | null;
  kunde: string | null;
  status: AboStatus;
};

export type Anstehend = {
  id: string;
  tool: string;
  kanal: string;
  datum: string;
  betrag: number;
  waehrung: string;
};

export type SparKarte = SparSnapshot & { aktion: string };

export type DashboardProps = {
  spar: { realisiert: number; ziel: number; offen: number };
  kpis: {
    monatlich: number;
    jaehrlich: number;
    aktiveAbos: number;
    trials: number;
    pausiert: number;
    sparpotenzialJahr: number;
    vorschlaege: number;
    vormonatProzent: number | null;
  };
  aktionen: Aktion[];
  verlauf: VerlaufPunkt[];
  verlaufUnvollstaendig: boolean;
  kostenNachKunde: { name: string; wert: number }[];
  nichtZugeordnet: number;
  kostenNachKanal: { name: string; wert: number }[];
  aiCredits: ServiceDaten[];
  aiMonatSumme: number;
  aiMonatLabel: string;
  anstehend: Anstehend[];
  sparkarten: SparKarte[];
  abos: AboZeile[];
};

/* ------------------------------- Helfer ---------------------------------- */

function fmtEUR(n: number): string {
  return formatEur(n);
}
function fmtDate(v: string): string {
  const [y, m, d] = v.split("-");
  return d ? `${d}.${m}.${y}` : v;
}
function preis(betrag: number, waehrung: string): string {
  const wert = formatEur(betrag).replace("€", "").trim();
  return waehrung === "USD" ? `$${wert}` : `${wert} €`;
}
function katFarbe(k: string): string {
  return KATEGORIE_FARBEN[k] ?? "#6C5CE7";
}
function katPill(k: string): React.CSSProperties {
  const c = katFarbe(k);
  return { background: `${c}1A`, color: c };
}

/* ----------------------------- Spar-Fortschritt --------------------------- */

function SparFortschritt({ realisiert, ziel, offen }: { realisiert: number; ziel: number; offen: number }) {
  const animated = useCountUp(Math.round(realisiert));
  const pct = ziel > 0 ? Math.min(1, animated / ziel) : 0;
  const size = 132;
  const stroke = 14;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <Card className="card-lift shadow-soft border-0 overflow-hidden">
      <CardContent className="p-5 sm:p-6 flex items-center gap-5 flex-col sm:flex-row text-center sm:text-left">
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
              <div className="font-display text-2xl font-bold leading-none">{Math.round(pct * 100)}%</div>
              <div className="text-[10px] text-muted-foreground mt-1">geholt</div>
            </div>
          </div>
        </div>
        <div className="min-w-0">
          <div className="flex items-center justify-center gap-1.5 text-xs font-medium text-coral sm:justify-start">
            <Sparkles className="size-3.5" /> Dein Spar-Fortschritt
          </div>
          <div className="font-display text-xl sm:text-2xl font-semibold leading-snug mt-1">
            Du hast schon <span style={{ color: "#12B76A" }}>{fmtEUR(animated)}</span> von {fmtEUR(ziel)} geholt.
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {offen === 0
              ? "Stark. Aktuell ist kein Vorschlag mehr offen."
              : `Stark. Noch ${offen} ${offen === 1 ? "Vorschlag" : "Vorschläge"} offen, dann hast du alles geholt.`}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

/* ------------------------------- KPI-Zeile ------------------------------- */

function CountEUR({ value }: { value: number }) {
  const v = useCountUp(Math.round(value));
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
    hintTone === "success" ? "text-success" : hintTone === "destructive" ? "text-destructive" : "text-muted-foreground";
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
        <div
          className="mt-3 font-display font-semibold text-3xl sm:text-[2rem] leading-tight tracking-tight tabular"
          style={{ color: accent }}
        >
          {valueNode}
        </div>
        <div className={`mt-1 text-xs ${toneClass}`}>{hint}</div>
      </CardContent>
    </Card>
  );
}

function KpiRow({ kpis }: { kpis: DashboardProps["kpis"] }) {
  const vm = kpis.vormonatProzent;
  const vmText =
    vm === null
      ? "keine Vergleichsdaten aus dem Vormonat"
      : vm === 0
        ? "unverändert zum Vormonat"
        : `${vm > 0 ? "+" : ""}${vm.toString().replace(".", ",")} % zum Vormonat`;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <KpiCard
        label="Kosten pro Monat"
        valueNode={<CountEUR value={kpis.monatlich} />}
        hint={vmText}
        hintTone={vm === null || vm === 0 ? "muted" : vm > 0 ? "destructive" : "success"}
        icon={Wallet}
        accent="#1F1D2B"
        tooltip="Summe aller laufenden Abos, jährliche und quartalsweise Abos werden anteilig auf den Monat umgerechnet."
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
        hint={
          kpis.vorschlaege === 0
            ? "gerade kein offener Vorschlag"
            : `pro Jahr, über ${kpis.vorschlaege} ${kpis.vorschlaege === 1 ? "Vorschlag" : "Vorschläge"}`
        }
        hintTone="success"
        icon={PiggyBank}
        accent="#12B76A"
        onClick={() => document.getElementById("sparvorschlaege")?.scrollIntoView({ behavior: "smooth", block: "start" })}
        tooltip="Summe aller offenen Einsparvorschläge, die wir aus deinen Daten berechnet haben. Geschätzte Werte sind als solche gekennzeichnet."
      />
    </div>
  );
}

/* ----------------------------- Aktions-Center ---------------------------- */

const aktionStyle: Record<
  AktionTyp,
  { color: string; label: string; icon: React.ComponentType<{ className?: string }> }
> = {
  frist: { color: "#F5A623", label: "Frist", icon: Clock },
  trial: { color: "#F5A623", label: "Trial", icon: AlertTriangle },
  preis: { color: "#F0533D", label: "Preis", icon: TrendingUp },
  zombie: { color: "#6C5CE7", label: "Zombie", icon: Ghost },
  spike: { color: "#F0533D", label: "Spike", icon: Zap },
};

function AktionsCenter({ aktionen }: { aktionen: Aktion[] }) {
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
      <CardContent className="pt-0 space-y-2.5">
        {aktionen.length === 0 && (
          <div className="flex items-center gap-3 rounded-2xl bg-success/10 p-4">
            <span className="size-10 rounded-full grid place-items-center bg-success/20 text-success shrink-0">
              <CheckCircle2 className="size-4.5" />
            </span>
            <div>
              <div className="text-sm font-semibold">Alles im grünen Bereich</div>
              <p className="text-sm text-muted-foreground">
                Keine Fristen, Trials oder Auffälligkeiten, um die du dich jetzt kümmern musst.
              </p>
            </div>
          </div>
        )}

        {aktionen.map((a) => {
          const s = aktionStyle[a.typ];
          const Icon = s.icon;
          // Live aus einer Anbieter-API gelesen: eigene, gruene Kennzeichnung.
          if (a.live) {
            return (
              <div
                key={a.key}
                className="flex items-start gap-3 p-3.5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10"
              >
                <div className="size-10 rounded-full grid place-items-center shrink-0 bg-emerald-500/20 text-emerald-700">
                  <Zap className="size-4.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-semibold uppercase tracking-wide rounded-full px-2 py-0.5 bg-emerald-500/20 text-emerald-700">
                      Live-API
                    </span>
                    <span className="text-sm font-semibold">{a.titel}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">{a.beschreibung}</p>
                </div>
                <Button
                  asChild
                  size="sm"
                  variant="outline"
                  className="shrink-0 hidden sm:inline-flex rounded-full border-emerald-500/40 text-emerald-700 hover:bg-emerald-500/10"
                >
                  <Link href={a.href}>{a.button}</Link>
                </Button>
              </div>
            );
          }
          return (
            <div
              key={a.key}
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
                asChild
                size="sm"
                variant="outline"
                className="shrink-0 hidden sm:inline-flex rounded-full border-0 shadow-sm hover:opacity-90"
                style={{ background: s.color, color: "white" }}
              >
                <Link href={a.href}>{a.button}</Link>
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

const KANAL_FARBEN = ["#6C5CE7", "#FF7A66", "#12B76A", "#F5A623", "#3B82F6", "#0FB5BA", "#E84393", "#9CA3AF"];

function Kostenverlauf({ verlauf, unvollstaendig }: { verlauf: VerlaufPunkt[]; unvollstaendig: boolean }) {
  const [view, setView] = useState<"gesamt" | "kategorie" | "kanal">("gesamt");

  // Serien je Ansicht: gesamt = Fix/Variabel, sonst Fixkosten aufgeteilt + Variabel obendrauf.
  const { daten, serien } = useMemo(() => {
    if (view === "gesamt") {
      return {
        daten: verlauf.map((p) => ({ label: p.label, Fixkosten: p.fix, "Variable Kosten": p.variabel })),
        serien: [
          { name: "Fixkosten", farbe: "#6C5CE7" },
          { name: "Variable Kosten", farbe: "#FF7A66" },
        ],
      };
    }
    const feld = view === "kategorie" ? "kategorien" : "kanaele";
    const keys = new Set<string>();
    for (const p of verlauf) for (const k of Object.keys(p[feld])) keys.add(k);
    const namen = [...keys].sort();
    const serien = namen.map((n, i) => ({
      name: n,
      farbe: view === "kategorie" ? katFarbe(n) : (KANAL_FARBEN[i % KANAL_FARBEN.length] as string),
    }));
    serien.push({ name: "Variable Kosten", farbe: "#FF7A66" });
    const daten = verlauf.map((p) => {
      const row: Record<string, string | number> = { label: p.label };
      for (const n of namen) row[n] = p[feld][n] ?? 0;
      row["Variable Kosten"] = p.variabel;
      return row;
    });
    return { daten, serien };
  }, [verlauf, view]);

  return (
    <Card className="border-0 shadow-soft animate-draw">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <CardTitle className="font-display text-xl">Kostenverlauf</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Letzte 12 Monate, in Euro</p>
          </div>
          <div className="inline-flex rounded-full bg-muted/60 p-1">
            <Pill active={view === "gesamt"} onClick={() => setView("gesamt")}>
              gesamt
            </Pill>
            <Pill active={view === "kategorie"} onClick={() => setView("kategorie")}>
              nach Kategorie
            </Pill>
            <Pill active={view === "kanal"} onClick={() => setView("kanal")}>
              nach Zahlungskanal
            </Pill>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={daten} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                {serien.map((s) => (
                  <linearGradient key={s.name} id={`g-${s.name.replace(/\W/g, "")}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={s.farbe} stopOpacity={0.5} />
                    <stop offset="100%" stopColor={s.farbe} stopOpacity={0.02} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="2 6" stroke="var(--color-border)" vertical={false} />
              <XAxis
                dataKey="label"
                stroke="var(--color-muted-foreground)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="var(--color-muted-foreground)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${Math.round(Number(v))} €`}
                width={56}
              />
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
                formatter={(v, n) => [fmtEUR(Number(v)), String(n)]}
              />
              {serien.map((s) => (
                <Area
                  key={s.name}
                  type="monotone"
                  dataKey={s.name}
                  stackId="1"
                  stroke={s.farbe}
                  strokeWidth={2.5}
                  fill={`url(#g-${s.name.replace(/\W/g, "")})`}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-3 flex items-center gap-x-4 gap-y-1.5 flex-wrap text-xs text-muted-foreground">
          {serien.map((s) => (
            <span key={s.name} className="inline-flex items-center gap-1.5">
              <span className="size-2.5 rounded-full" style={{ background: s.farbe }} /> {s.name}
            </span>
          ))}
        </div>
        {unvollstaendig && (
          <p className="mt-3 flex items-start gap-1.5 text-[11px] text-muted-foreground">
            <Info className="size-3.5 shrink-0 mt-px" />
            Die Fixkosten sind aus dem Startdatum deiner laufenden Abos rekonstruiert. Abos, die du in diesem Zeitraum
            schon beendet hast, fehlen darin. Die variablen Kosten sind Istwerte.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

/* ------------------------ Kosten nach Kunde / Kanal ----------------------- */

const kundeFarben = ["#6C5CE7", "#12B76A", "#FF7A66", "#F5A623", "#3B82F6", "#9CA3AF"];

function KostenNachKunde({
  daten,
  nichtZugeordnet,
}: {
  daten: { name: string; wert: number }[];
  nichtZugeordnet: number;
}) {
  const data = daten.map((k, i) => ({ ...k, farbe: kundeFarben[i % kundeFarben.length] }));
  const total = data.reduce((s, x) => s + x.wert, 0);
  return (
    <Card className="border-0 shadow-soft">
      <CardHeader className="pb-2">
        <CardTitle className="font-display text-xl">Kosten nach Kunde</CardTitle>
        <p className="text-sm text-muted-foreground">So verteilen sich deine Toolkosten auf deine Kunden.</p>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-sm text-muted-foreground">
              Noch keinem Kunden zugeordnet. Ordne Abos einem Kunden zu, dann siehst du hier die Verteilung.
            </p>
            <Button asChild size="sm" variant="outline" className="mt-3 rounded-full">
              <Link href="/app/kunden">Kunden anlegen</Link>
            </Button>
          </div>
        ) : (
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="2 6" stroke="var(--color-border)" horizontal={false} />
                <XAxis
                  type="number"
                  stroke="var(--color-muted-foreground)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `${Math.round(Number(v))} €`}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  stroke="var(--color-muted-foreground)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  width={150}
                />
                <RTooltip
                  cursor={{ fill: "rgba(108,92,231,0.06)" }}
                  contentStyle={{
                    background: "var(--color-card)",
                    border: "none",
                    borderRadius: 14,
                    boxShadow: "var(--shadow-lift)",
                    fontSize: 12,
                    padding: "10px 12px",
                  }}
                  formatter={(v) => [fmtEUR(Number(v)), "Monat"]}
                />
                <Bar dataKey="wert" radius={[8, 8, 8, 8]}>
                  {data.map((k) => (
                    <Cell key={k.name} fill={k.farbe} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
        {nichtZugeordnet > 0 && (
          <div className="mt-3 flex items-center justify-between gap-3 text-xs">
            <span className="text-muted-foreground">
              Nicht zugeordnet:{" "}
              <span className="text-foreground font-semibold tabular">{fmtEUR(nichtZugeordnet)}</span> / Monat
            </span>
            <Link href="/app/abos" className="font-medium text-primary hover:underline">
              jetzt zuordnen
            </Link>
          </div>
        )}
        {data.length > 0 && (
          <div className="mt-2 text-[11px] text-muted-foreground">Gesamt: {fmtEUR(total)} / Monat</div>
        )}
      </CardContent>
    </Card>
  );
}

function KostenNachKanal({ daten }: { daten: { name: string; wert: number }[] }) {
  const data = daten.map((k, i) => ({ ...k, farbe: KANAL_FARBEN[i % KANAL_FARBEN.length] }));
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
        <p className="text-sm text-muted-foreground">
          Du nutzt mehrere Karten und Kanäle. Hier siehst du, welcher wofür.
        </p>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-sm text-muted-foreground">
              Noch kein Zahlungskanal hinterlegt. Trag deine Karten und Konten ein, dann siehst du hier, was worüber
              läuft.
            </p>
            <Button asChild size="sm" variant="outline" className="mt-3 rounded-full">
              <Link href="/app/zahlungskanaele">Zahlungskanal anlegen</Link>
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-4 flex-col sm:flex-row">
            <div className="h-[200px] w-full sm:w-[200px] shrink-0 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    dataKey="wert"
                    nameKey="name"
                    innerRadius={58}
                    outerRadius={86}
                    paddingAngle={4}
                    cornerRadius={6}
                  >
                    {data.map((k) => (
                      <Cell key={k.name} fill={k.farbe} stroke="var(--color-surface)" strokeWidth={3} />
                    ))}
                  </Pie>
                  <RTooltip
                    contentStyle={{
                      background: "var(--color-card)",
                      border: "none",
                      borderRadius: 14,
                      boxShadow: "var(--shadow-lift)",
                      fontSize: 12,
                      padding: "10px 12px",
                    }}
                    formatter={(v) => [fmtEUR(Number(v)), "Monat"]}
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
        )}
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
          <Line type="monotone" dataKey="v" stroke={color} strokeWidth={2.5} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function AiCreditsBlock({
  services,
  summe,
  monatLabel,
}: {
  services: ServiceDaten[];
  summe: number;
  monatLabel: string;
}) {
  return (
    <Card className="border-0 shadow-soft">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <CardTitle className="font-display text-xl flex items-center gap-2">
              <span className="size-8 rounded-full bg-accent grid place-items-center">
                <Zap className="size-4 text-primary" />
              </span>
              AI-Credits und variable Kosten
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1.5">
              Verbrauchsbasierte Tools sind oft die unsichtbarsten Kosten.
            </p>
          </div>
          <Badge className="rounded-full bg-accent text-primary border-0 px-3 py-1 tabular">
            {fmtEUR(summe)} im {monatLabel}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-1">
        {services.length === 0 && (
          <div className="py-8 text-center">
            <p className="text-sm text-muted-foreground">
              Noch kein verbrauchsbasierter Dienst erfasst. Leg einen an, dann siehst du hier den Verlauf.
            </p>
            <Button asChild size="sm" variant="outline" className="mt-3 rounded-full">
              <Link href="/app/ai-credits">AI-Credits einrichten</Link>
            </Button>
          </div>
        )}
        {services.map((c) => {
          const color =
            c.spikeFaktor !== null
              ? "#F0533D"
              : c.budgetPct !== null && c.budgetPct >= 80
                ? "#F5A623"
                : (c.color ?? "#6C5CE7");
          const hinweis =
            c.spikeFaktor !== null
              ? `${c.spikeFaktor.toString().replace(".", ",")}× über deinem Schnitt`
              : c.budgetPct !== null && c.budgetPct >= 80
                ? `${c.budgetPct} % vom Monatsbudget`
                : null;
          return (
            <Link
              key={c.id}
              href="/app/ai-credits"
              className="flex items-center gap-3 py-3 px-2 rounded-2xl hover:bg-muted/50 transition-colors flex-wrap sm:flex-nowrap"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div
                  className="size-10 rounded-xl grid place-items-center font-display text-sm font-bold text-white shrink-0"
                  style={{ background: color }}
                >
                  {c.initials}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold truncate">{c.name}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-2 flex-wrap mt-0.5">
                    {c.budget ? (
                      <span className="inline-flex items-center gap-1">
                        <RefreshCw className="size-3" /> Budget {fmtEUR(c.budget)} pro Monat
                      </span>
                    ) : (
                      <span>kein Budget hinterlegt</span>
                    )}
                    {hinweis && (
                      <span
                        className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold"
                        style={{ background: `${color}1F`, color }}
                      >
                        <AlertTriangle className="size-3" /> {hinweis}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <Sparkline data={c.reihe.map((p) => p.betrag)} color={color} />
              <div className="font-display text-base font-semibold tabular w-24 text-right shrink-0">
                {fmtEUR(c.monat)}
              </div>
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}

/* -------------------------- Anstehende Abbuchungen ------------------------ */

function AnstehendeAbbuchungen({ anstehend }: { anstehend: Anstehend[] }) {
  return (
    <Card className="border-0 shadow-soft">
      <CardHeader className="pb-2">
        <CardTitle className="font-display text-xl flex items-center gap-2">
          <span className="size-8 rounded-full bg-accent grid place-items-center">
            <Clock className="size-4 text-primary" />
          </span>
          Anstehende Abbuchungen
        </CardTitle>
        <p className="text-sm text-muted-foreground">Was demnächst vom Konto geht.</p>
      </CardHeader>
      <CardContent className="space-y-0.5">
        {anstehend.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Keine anstehenden Abbuchungen hinterlegt.
          </p>
        )}
        {anstehend.map((a) => (
          <Link
            key={a.id}
            href={`/app/abos/${a.id}`}
            className="flex items-center gap-3 py-2.5 px-2 rounded-xl hover:bg-muted/50 transition-colors"
          >
            <div className="w-14 shrink-0 text-xs tabular font-semibold text-primary">
              {fmtDate(a.datum).slice(0, 6)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold truncate">{a.tool}</div>
              <div className="text-xs text-muted-foreground truncate">{a.kanal}</div>
            </div>
            <div className="font-display text-sm font-semibold tabular shrink-0">{preis(a.betrag, a.waehrung)}</div>
          </Link>
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

function SparCard({ v }: { v: SparKarte }) {
  const [done, setDone] = useState(false);
  const [pending, start] = useTransition();

  function umsetzen() {
    setDone(true); // sofortiges Feedback, der Server zieht nach
    start(async () => {
      const res = await setVorschlagStatus(v, "umgesetzt");
      if (res.error) setDone(false);
    });
  }

  return (
    <Card
      className="relative border-0 shadow-soft card-lift overflow-hidden"
      style={{ background: "linear-gradient(160deg, #ECFDF5 0%, var(--color-card) 60%)" }}
    >
      {done && <Confetti />}
      <CardContent className="p-5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-success">
            <span className="size-8 rounded-full grid place-items-center" style={{ background: "#12B76A22" }}>
              <PiggyBank className="size-4" />
            </span>
            <span className="text-xs font-semibold">Sparvorschlag</span>
          </div>
          <span className="font-display text-sm font-semibold tabular text-success">
            {fmtEUR(v.ersparnisJahr)} / Jahr
          </span>
        </div>
        <div className="mt-3 font-display text-lg font-semibold">{v.titel}</div>
        <p className="mt-1 text-sm text-muted-foreground">{v.begruendung}</p>
        {v.geschaetzt && (
          <p className="mt-2 text-[11px] text-muted-foreground">Geschätzt, kein garantierter Wert.</p>
        )}
        <Button
          size="sm"
          onClick={umsetzen}
          disabled={done || pending}
          className="mt-4 gap-1.5 rounded-full bg-success text-success-foreground hover:bg-success/90 shadow-soft"
        >
          {done ? (
            <>
              <PartyPopper className="size-3.5" /> Sauber gemacht
            </>
          ) : (
            <>
              {v.aktion} <ArrowUpRight className="size-3.5" />
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

/* ----------------------------- Alle Abos Tabelle -------------------------- */

const statusBadge: Record<string, { color: string; bg: string; icon: React.ComponentType<{ className?: string }> }> = {
  aktiv: { color: "#12B76A", bg: "#12B76A1A", icon: CheckCircle2 },
  Trial: { color: "#F5A623", bg: "#F5A6231F", icon: AlertTriangle },
  pausiert: { color: "#6B6779", bg: "#6B67791A", icon: Clock },
  gekuendigt: { color: "#F0533D", bg: "#F0533D1A", icon: AlertTriangle },
  archiviert: { color: "#6B6779", bg: "#6B67791A", icon: Clock },
};

function AlleAbos({ abos }: { abos: AboZeile[] }) {
  const kategorien = useMemo(() => ["Alle", ...new Set(abos.map((a) => a.kategorie))], [abos]);
  const [aktivKat, setAktivKat] = useState<string>("Alle");
  const [suche, setSuche] = useState("");

  const gefiltert = abos.filter(
    (a) =>
      (aktivKat === "Alle" || a.kategorie === aktivKat) &&
      (suche === "" ||
        a.tool.toLowerCase().includes(suche.toLowerCase()) ||
        (a.kunde ?? "").toLowerCase().includes(suche.toLowerCase())),
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
                aria-label="Abos durchsuchen"
                className="h-9 pl-9 pr-3 rounded-full bg-muted/60 text-sm w-44 focus:outline-none focus:ring-2 focus:ring-ring border-0"
              />
            </div>
            <Button asChild size="sm" variant="outline" className="gap-1.5 h-9 rounded-full border-0 bg-muted/60">
              <Link href="/app/abos">
                <Plus className="size-3.5" /> Abo anlegen
              </Link>
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap mt-3">
          {kategorien.map((k) => {
            const active = aktivKat === k;
            const color = k === "Alle" ? "#6C5CE7" : katFarbe(k);
            return (
              <button
                key={k}
                onClick={() => setAktivKat(k)}
                className="text-xs px-3 py-1.5 rounded-full font-medium transition-all"
                style={active ? { background: color, color: "white" } : { background: `${color}14`, color }}
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
                const S = statusBadge[a.status] ?? statusBadge.aktiv;
                return (
                  <tr key={a.id} className="hover:bg-muted/40 transition-colors cursor-pointer">
                    <td className="px-5 py-4">
                      <Link href={`/app/abos/${a.id}`} className="flex items-center gap-3">
                        <div
                          className="size-9 rounded-xl grid place-items-center font-display font-bold text-sm text-white shadow-soft shrink-0"
                          style={{ background: a.farbe }}
                        >
                          {a.initial}
                        </div>
                        <span className="font-semibold">{a.tool}</span>
                      </Link>
                    </td>
                    <td className="px-3 py-4">
                      <span
                        className="inline-block text-[11px] font-semibold rounded-full px-2.5 py-1 whitespace-nowrap"
                        style={katPill(a.kategorie)}
                      >
                        {a.kategorie}
                      </span>
                    </td>
                    <td className="px-3 py-4 text-right tabular font-semibold whitespace-nowrap">
                      {preis(a.kosten, a.waehrung)}
                    </td>
                    <td className="px-3 py-4">
                      <span className="text-xs rounded-full px-2.5 py-1 bg-muted/70 text-muted-foreground whitespace-nowrap">
                        {INTERVALL_LABEL[a.intervall as Intervall] ?? a.intervall}
                      </span>
                    </td>
                    <td className="px-3 py-4 text-xs tabular text-muted-foreground whitespace-nowrap">
                      {a.naechsteAbbuchung ? fmtDate(a.naechsteAbbuchung) : "—"}
                    </td>
                    <td className="px-3 py-4 text-xs text-muted-foreground">{a.zahlungskanal ?? "—"}</td>
                    <td className="px-3 py-4 text-xs">{a.kunde ?? "—"}</td>
                    <td className="px-5 py-4">
                      <span
                        className="inline-flex items-center gap-1.5 text-[11px] font-semibold rounded-full px-2.5 py-1 whitespace-nowrap"
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
                    <Button asChild size="sm" className="mt-3 gap-1.5 rounded-full">
                      <Link href="/app/abos">
                        <Plus className="size-4" /> Abo hinzufügen
                      </Link>
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

/* --------------------------------- Seite --------------------------------- */

export function Dashboard(p: DashboardProps) {
  if (p.abos.length === 0) {
    return (
      <div className="rounded-[20px] border border-dashed bg-card p-12 text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
          <Receipt className="size-6" />
        </span>
        <h1 className="mt-4 font-display text-xl font-semibold">Willkommen bei Toolfolio</h1>
        <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
          Lege dein erstes Abo an oder importiere einen Kontoauszug. Danach erscheinen hier deine Gesamtkosten, dein
          Kostenverlauf, Fristen und die Sparvorschläge.
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          <Button asChild className="gap-2">
            <Link href="/app/abos">
              <Plus className="size-4" /> Erstes Abo anlegen
            </Link>
          </Button>
          <Button asChild variant="outline" className="gap-2">
            <Link href="/app/abos?import=1">
              <Receipt className="size-4" /> Kontoauszug importieren
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {p.spar.ziel > 0 && (
        <SparFortschritt realisiert={p.spar.realisiert} ziel={p.spar.ziel} offen={p.spar.offen} />
      )}
      <KpiRow kpis={p.kpis} />
      <AktionsCenter aktionen={p.aktionen} />
      <Kostenverlauf verlauf={p.verlauf} unvollstaendig={p.verlaufUnvollstaendig} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <KostenNachKunde daten={p.kostenNachKunde} nichtZugeordnet={p.nichtZugeordnet} />
        <KostenNachKanal daten={p.kostenNachKanal} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AiCreditsBlock services={p.aiCredits} summe={p.aiMonatSumme} monatLabel={p.aiMonatLabel} />
        </div>
        <AnstehendeAbbuchungen anstehend={p.anstehend} />
      </div>
      {p.sparkarten.length > 0 && (
        <div>
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="font-display text-xl font-semibold">Sparvorschläge</h2>
            <Link href="/app/sparen" className="text-sm font-medium text-primary hover:underline">
              alle ansehen
            </Link>
          </div>
          <div id="sparvorschlaege" className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {p.sparkarten.map((v) => (
              <SparCard key={v.key} v={v} />
            ))}
          </div>
        </div>
      )}
      <AlleAbos abos={p.abos} />
      <div className="text-center text-xs text-muted-foreground pt-2 pb-6">
        Toolfolio behält deine Software-Abos für dich im Blick.
      </div>
    </div>
  );
}
