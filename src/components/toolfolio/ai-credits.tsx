import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Zap,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Clock,
  RefreshCw,
  Bell,
  Sparkles,
  X,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { aiProviders, findProvider } from "@/lib/ai-providers";
import { ConnectAiServiceModal } from "./connect-ai-service-modal";

// ---------- helpers ----------
const eur = (n: number) =>
  n.toLocaleString("de-DE", { style: "currency", currency: "EUR" });

const num = (n: number, d = 0) =>
  n.toLocaleString("de-DE", { minimumFractionDigits: d, maximumFractionDigits: d });

type Zeitraum = "monat" | "3monate" | "12monate";

type Ereignis =
  | { datum: string; typ: "recharge"; betrag: number }
  | { datum: string; typ: "spike"; faktor: number }
  | { datum: string; typ: "verfall"; betrag: number };

interface ToolDaten {
  id: string;
  name: string;
  initials: string;
  color: string; // hex for tile
  aboId?: string;
  monat: number; // aktueller Monat
  trendPct: number; // gegenueber Vormonat
  daily: number[]; // 30 Tage
  weekly12: number[]; // 12 Wochen Sparkline
  monthly12: number[]; // 12 Monate
  spikeIdx?: number; // index in daily where spike
  spikeFaktor?: number;
  autoRecharge: null | { schwelle: number; betrag: number };
  budget?: number;
  budgetAlarmPct?: number;
  verfallEUR?: number;
  verfallDatum?: string;
  rechargeAlarm?: boolean;
  ereignisse: Ereignis[];
}

const initialTools: ToolDaten[] = [
  {
    id: "anthropic",
    name: "Anthropic API",
    initials: "A",
    color: "#D97757",
    aboId: "anthropic-api",
    monat: 312.4,
    trendPct: 38,
    daily: [4, 6, 5, 8, 7, 9, 12, 10, 14, 11, 9, 13, 18, 22, 28, 41, 19, 12, 10, 9, 8, 11, 13, 12, 10, 9, 8, 7, 6, 6.4],
    weekly12: [42, 38, 51, 60, 72, 88, 110, 145, 180, 220, 270, 312],
    monthly12: [120, 140, 132, 158, 170, 180, 175, 190, 210, 225, 240, 312],
    spikeIdx: 15,
    spikeFaktor: 3.1,
    autoRecharge: { schwelle: 0, betrag: 100 },
    budget: 500,
    budgetAlarmPct: 80,
    ereignisse: [
      { datum: "01.07.", typ: "recharge", betrag: 100 },
      { datum: "03.07.", typ: "spike", faktor: 3.1 },
      { datum: "12.07.", typ: "recharge", betrag: 100 },
      { datum: "20.07.", typ: "recharge", betrag: 100 },
    ],
  },
  {
    id: "openai",
    name: "OpenAI",
    initials: "O",
    color: "#10A37F",
    aboId: "openai",
    monat: 184.2,
    trendPct: 12,
    daily: [5, 6, 5, 7, 6, 8, 7, 6, 5, 7, 8, 6, 7, 8, 9, 7, 6, 8, 7, 6, 5, 6, 7, 8, 7, 6, 5, 6, 7, 6.2],
    weekly12: [30, 35, 40, 42, 48, 55, 60, 62, 70, 75, 80, 84],
    monthly12: [110, 120, 125, 130, 135, 140, 150, 155, 160, 170, 175, 184],
    autoRecharge: { schwelle: 0, betrag: 50 },
    ereignisse: [
      { datum: "05.07.", typ: "recharge", betrag: 50 },
      { datum: "18.07.", typ: "recharge", betrag: 50 },
    ],
  },
  {
    id: "lovable",
    name: "Lovable Credits",
    initials: "L",
    color: "#6C5CE7",
    aboId: "lovable",
    monat: 89,
    trendPct: 2,
    daily: [3, 3, 2.5, 3, 3, 2, 3, 3, 3.5, 3, 3, 3, 3, 2.5, 3, 3, 3, 3, 3, 3, 3, 3, 2.5, 3, 3, 3, 3, 3, 3, 2.5],
    weekly12: [22, 21, 22, 23, 22, 22, 21, 22, 22, 22, 22, 22],
    monthly12: [80, 82, 84, 85, 86, 87, 87, 88, 88, 89, 89, 89],
    autoRecharge: null,
    ereignisse: [],
  },
  {
    id: "elevenlabs",
    name: "ElevenLabs",
    initials: "E",
    color: "#1F1D2B",
    aboId: "elevenlabs",
    monat: 22,
    trendPct: -8,
    daily: [1, 0.5, 0.8, 1, 0.7, 0.6, 0.5, 0.9, 1, 0.7, 0.8, 0.6, 0.7, 0.8, 0.5, 0.6, 0.7, 0.8, 0.9, 1, 0.7, 0.6, 0.5, 0.8, 0.7, 0.6, 0.7, 0.8, 0.5, 0.6],
    weekly12: [8, 7, 9, 6, 7, 5, 6, 5, 6, 5, 5, 5.5],
    monthly12: [30, 28, 25, 27, 26, 25, 24, 25, 23, 22, 23, 22],
    autoRecharge: null,
    verfallEUR: 12,
    verfallDatum: "30.06.",
    ereignisse: [{ datum: "30.06.", typ: "verfall", betrag: 12 }],
  },
  {
    id: "replicate",
    name: "Replicate",
    initials: "R",
    color: "#FF7A66",
    aboId: "replicate",
    monat: 46.8,
    trendPct: -4,
    daily: [2, 1, 3, 2, 8, 2, 1, 2, 3, 2, 1, 2, 14, 3, 2, 1, 2, 3, 2, 1, 2, 3, 2, 1, 2, 3, 2, 1, 2, 1.8],
    weekly12: [12, 8, 14, 9, 10, 22, 8, 9, 28, 10, 8, 11],
    monthly12: [40, 35, 48, 38, 52, 60, 42, 45, 78, 50, 44, 47],
    spikeIdx: 12,
    spikeFaktor: 4.2,
    autoRecharge: null,
    ereignisse: [
      { datum: "04.07.", typ: "spike", faktor: 2.6 },
      { datum: "13.07.", typ: "spike", faktor: 4.2 },
    ],
  },
];

// ---------- mini chart components ----------
function Sparkline({
  data,
  color,
  spikeIdx,
  height = 36,
}: {
  data: number[];
  color: string;
  spikeIdx?: number;
  height?: number;
}) {
  const w = 120;
  const h = height;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = Math.max(max - min, 0.0001);
  const step = w / (data.length - 1);
  const pts = data.map((v, i) => [i * step, h - ((v - min) / range) * (h - 6) - 3] as const);
  const d = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x},${y}`).join(" ");
  const area = `${d} L${w},${h} L0,${h} Z`;
  return (
    <svg width={w} height={h} className="overflow-visible">
      <path d={area} fill={color} opacity={0.12} />
      <path d={d} fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      {spikeIdx !== undefined && pts[spikeIdx] && (
        <circle cx={pts[spikeIdx][0]} cy={pts[spikeIdx][1]} r={3} fill="#F0533D" stroke="#fff" strokeWidth={1.5} />
      )}
    </svg>
  );
}

function BigChart({
  data,
  color,
  labels,
  spikes = [],
  recharges = [],
  height = 220,
}: {
  data: number[];
  color: string;
  labels: string[];
  spikes?: number[];
  recharges?: number[];
  height?: number;
}) {
  const w = 800;
  const h = height;
  const pad = { l: 36, r: 12, t: 12, b: 26 };
  const iw = w - pad.l - pad.r;
  const ih = h - pad.t - pad.b;
  const max = Math.max(...data, 1);
  const step = iw / (data.length - 1);
  const pts = data.map(
    (v, i) => [pad.l + i * step, pad.t + ih - (v / max) * ih] as const,
  );
  const line = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x},${y}`).join(" ");
  const area = `${line} L${pad.l + iw},${pad.t + ih} L${pad.l},${pad.t + ih} Z`;
  const yTicks = [0, 0.5, 1].map((t) => ({
    y: pad.t + ih - t * ih,
    label: eur(max * t),
  }));
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto">
      {yTicks.map((t, i) => (
        <g key={i}>
          <line x1={pad.l} x2={pad.l + iw} y1={t.y} y2={t.y} stroke="hsl(var(--border))" strokeDasharray="2 4" />
          <text x={4} y={t.y + 4} fontSize={10} fill="hsl(var(--muted-foreground))">
            {t.label}
          </text>
        </g>
      ))}
      <path d={area} fill={color} opacity={0.16} />
      <path d={line} fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
      {recharges.map((idx) =>
        pts[idx] ? (
          <g key={`r-${idx}`}>
            <line
              x1={pts[idx][0]}
              x2={pts[idx][0]}
              y1={pad.t}
              y2={pad.t + ih}
              stroke="#6C5CE7"
              strokeDasharray="3 3"
              opacity={0.5}
            />
            <circle cx={pts[idx][0]} cy={pts[idx][1]} r={4} fill="#6C5CE7" stroke="#fff" strokeWidth={1.5} />
          </g>
        ) : null,
      )}
      {spikes.map((idx) =>
        pts[idx] ? (
          <g key={`s-${idx}`}>
            <circle cx={pts[idx][0]} cy={pts[idx][1]} r={6} fill="#F0533D" opacity={0.25} />
            <circle cx={pts[idx][0]} cy={pts[idx][1]} r={4} fill="#F0533D" stroke="#fff" strokeWidth={1.5} />
          </g>
        ) : null,
      )}
      {labels.map((l, i) => {
        const everyN = Math.ceil(labels.length / 8);
        if (i % everyN !== 0) return null;
        return (
          <text
            key={i}
            x={pad.l + i * step}
            y={h - 6}
            fontSize={10}
            textAnchor="middle"
            fill="hsl(var(--muted-foreground))"
          >
            {l}
          </text>
        );
      })}
    </svg>
  );
}

// ---------- subcomponents ----------
function KpiCard({
  label,
  value,
  hint,
  hintTone,
  icon,
}: {
  label: string;
  value: string;
  hint?: string;
  hintTone?: "muted" | "good" | "warn" | "bad";
  icon?: React.ReactNode;
}) {
  const tone =
    hintTone === "good"
      ? "text-emerald-600"
      : hintTone === "warn"
      ? "text-amber-600"
      : hintTone === "bad"
      ? "text-rose-600"
      : "text-muted-foreground";
  return (
    <div className="rounded-3xl border border-border bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
        <span>{label}</span>
        {icon}
      </div>
      <div className="mt-2 font-display text-3xl font-semibold tracking-tight tabular-nums">
        {value}
      </div>
      {hint && <div className={`mt-1 text-xs font-medium ${tone}`}>{hint}</div>}
    </div>
  );
}

function ZeitraumSwitch({
  value,
  onChange,
}: {
  value: Zeitraum;
  onChange: (z: Zeitraum) => void;
}) {
  const opts: { v: Zeitraum; l: string }[] = [
    { v: "monat", l: "Dieser Monat" },
    { v: "3monate", l: "Letzte 3 Monate" },
    { v: "12monate", l: "12 Monate" },
  ];
  return (
    <div className="inline-flex rounded-full border border-border bg-card p-1 shadow-sm">
      {opts.map((o) => (
        <button
          key={o.v}
          onClick={() => onChange(o.v)}
          className={`px-3 sm:px-4 h-8 rounded-full text-xs font-medium transition ${
            value === o.v
              ? "bg-primary text-primary-foreground shadow"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {o.l}
        </button>
      ))}
    </div>
  );
}

function ToolCard({
  t,
  onOpen,
  onSetBudget,
  onConnect,
}: {
  t: ToolDaten;
  onOpen: () => void;
  onSetBudget: () => void;
  onConnect: (providerId: string) => void;
}) {
  const trendPos = t.trendPct >= 0;
  const budgetPct = t.budget ? Math.min(100, (t.monat / t.budget) * 100) : 0;
  const budgetTone =
    !t.budget
      ? ""
      : budgetPct >= 100
      ? "bg-rose-500"
      : budgetPct >= (t.budgetAlarmPct ?? 80)
      ? "bg-amber-500"
      : "bg-emerald-500";

  // Datenquelle: live, wenn das Tool per API verbunden ist; sonst Rechnung.
  const providerId =
    t.id === "openai" ? "openai" : t.id === "anthropic" ? "anthropic" : undefined;
  const live = !!providerId;
  const connectable =
    !live && (t.id === "elevenlabs" || t.id === "replicate" || t.id === "lovable");

  return (
    <div className="rounded-3xl border border-border bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="size-11 rounded-xl grid place-items-center font-display font-bold text-white shrink-0"
            style={{ background: t.color }}
          >
            {t.initials}
          </div>
          <div className="min-w-0">
            <div className="font-display text-base font-semibold truncate">{t.name}</div>
            <div className="mt-0.5 flex flex-wrap items-center gap-1">
              <span
                className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                style={{ background: "rgba(108,92,231,0.12)", color: "#6C5CE7" }}
              >
                <Sparkles className="size-2.5" /> KI / API
              </span>
              <span
                className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                style={
                  live
                    ? { background: "#E7F8EF", color: "#0B6B40" }
                    : { background: "#ECE6DA", color: "#3D3A4D" }
                }
                title={live ? "Verbrauch wird live per API gelesen" : "Verbrauch wird aus Rechnung uebernommen"}
              >
                {live ? "Live-API" : "aus Rechnung"}
              </span>
            </div>
          </div>
        </div>
        {t.spikeFaktor && (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/12 px-2 py-1 text-[10px] font-semibold text-rose-600">
            <AlertTriangle className="size-3" /> Spike {t.spikeFaktor}x
          </span>
        )}
      </div>
      {connectable && (
        <div className="mt-3 rounded-lg bg-emerald-500/10 px-3 py-2 text-[11px] text-emerald-800 flex items-center justify-between gap-2">
          <span>Per API verbinden fuer Live-Daten statt Rechnungs-Schaetzung.</span>
          <button
            className="font-semibold underline shrink-0"
            onClick={() => onConnect(t.id)}
          >
            Verbinden
          </button>
        </div>
      )}

      <div className="mt-4 flex items-end justify-between gap-3">
        <div>
          <div className="font-display text-2xl font-semibold tabular-nums">{eur(t.monat)}</div>
          <div
            className={`mt-0.5 inline-flex items-center gap-1 text-xs font-medium ${
              trendPos ? "text-rose-600" : "text-emerald-600"
            }`}
          >
            {trendPos ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
            {trendPos ? "+" : ""}
            {t.trendPct}% ggü. Vormonat
          </div>
        </div>
        <Sparkline data={t.weekly12} color={t.color} spikeIdx={t.spikeIdx ? 8 : undefined} />
      </div>

      <div className="mt-4 space-y-2 text-xs">
        <div className="flex items-center gap-2 text-muted-foreground">
          <RefreshCw className="size-3.5" />
          {t.autoRecharge ? (
            <span>
              Lädt automatisch bei {eur(t.autoRecharge.schwelle)} nach, jeweils{" "}
              <span className="font-semibold text-foreground">{eur(t.autoRecharge.betrag)}</span>
            </span>
          ) : (
            <span>Kein Auto-Recharge</span>
          )}
        </div>
        {t.autoRecharge && (
          <div className="rounded-lg bg-amber-500/8 px-3 py-2 text-[11px] text-amber-700 flex items-start gap-2">
            <AlertTriangle className="size-3.5 mt-0.5 shrink-0" />
            <span>
              Auto-Recharge kann zu still steigenden Kosten führen.{" "}
              <button className="font-semibold underline" onClick={onOpen}>
                Recharge-Alarm setzen
              </button>
            </span>
          </div>
        )}
        {t.verfallEUR && (
          <div className="rounded-lg bg-amber-500/12 px-3 py-2 text-[11px] text-amber-700 flex items-center gap-2">
            <Clock className="size-3.5 shrink-0" />
            <span>
              <span className="font-semibold">{eur(t.verfallEUR)}</span> Guthaben verfallen am {t.verfallDatum}
            </span>
          </div>
        )}
      </div>

      <div className="mt-4">
        {t.budget ? (
          <>
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span>
                <span className="font-semibold text-foreground tabular-nums">{eur(t.monat)}</span> von{" "}
                <span className="tabular-nums">{eur(t.budget)}</span> Budget
              </span>
              <button onClick={onSetBudget} className="font-medium text-primary hover:underline">
                ändern
              </button>
            </div>
            <div className="mt-1.5 h-2 w-full rounded-full bg-muted overflow-hidden">
              <div className={`h-full ${budgetTone} transition-all`} style={{ width: `${budgetPct}%` }} />
            </div>
          </>
        ) : (
          <Button variant="outline" size="sm" className="w-full" onClick={onSetBudget}>
            Budget setzen
          </Button>
        )}
      </div>

      <div className="mt-4 flex items-center gap-2">
        <Button variant="outline" size="sm" className="flex-1" onClick={onOpen}>
          Verlauf ansehen
        </Button>
        {t.aboId && (
          <Button asChild variant="ghost" size="sm">
            <Link to="/abos/$aboId" params={{ aboId: t.aboId }}>
              Zum Abo <ChevronRight className="size-3.5" />
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}

// ---------- drilldown sheet ----------
function ToolDrilldown({
  open,
  onClose,
  tool,
  onUpdate,
}: {
  open: boolean;
  onClose: () => void;
  tool: ToolDaten | null;
  onUpdate: (t: ToolDaten) => void;
}) {
  const [budget, setBudget] = useState<string>(tool?.budget?.toString() ?? "");
  const [alarmPct, setAlarmPct] = useState<string>(tool?.budgetAlarmPct?.toString() ?? "80");
  const [rechargeAlarm, setRechargeAlarm] = useState<boolean>(tool?.rechargeAlarm ?? false);

  // sync on open
  useMemo(() => {
    if (tool) {
      setBudget(tool.budget?.toString() ?? "");
      setAlarmPct(tool.budgetAlarmPct?.toString() ?? "80");
      setRechargeAlarm(tool.rechargeAlarm ?? false);
    }
  }, [tool?.id]);

  if (!tool) return null;

  const labels = Array.from({ length: tool.daily.length }, (_, i) => `${i + 1}.`);
  const spikes = tool.spikeIdx !== undefined ? [tool.spikeIdx] : [];
  const recharges = tool.ereignisse
    .map((e, i) => (e.typ === "recharge" ? i : -1))
    .filter((i) => i >= 0)
    .map((_, k) => Math.floor(((k + 1) * tool.daily.length) / (tool.ereignisse.filter((e) => e.typ === "recharge").length + 1)));

  const saveBudget = () => {
    const b = parseFloat(budget.replace(",", "."));
    const a = parseFloat(alarmPct);
    onUpdate({
      ...tool,
      budget: isFinite(b) && b > 0 ? b : undefined,
      budgetAlarmPct: isFinite(a) ? a : 80,
    });
    toast.success("Budget aktualisiert", { description: `${tool.name}: ${budget ? eur(parseFloat(budget.replace(",", "."))) : "kein Budget"}` });
  };
  const saveRecharge = (v: boolean) => {
    setRechargeAlarm(v);
    onUpdate({ ...tool, rechargeAlarm: v });
    toast.success(v ? "Recharge-Alarm aktiviert" : "Recharge-Alarm deaktiviert", {
      description: tool.name,
    });
  };

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center gap-3">
            <div
              className="size-10 rounded-xl grid place-items-center font-display font-bold text-white"
              style={{ background: tool.color }}
            >
              {tool.initials}
            </div>
            <div>
              <SheetTitle className="font-display text-xl">{tool.name}</SheetTitle>
              <SheetDescription>Verbrauchs-Verlauf, Ereignisse und Einstellungen</SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-muted-foreground">Verbrauch täglich (30 Tage)</div>
                <div className="font-display text-2xl font-semibold tabular-nums mt-1">
                  {eur(tool.monat)}
                </div>
              </div>
              <div className="text-[11px] text-muted-foreground flex items-center gap-3">
                <span className="inline-flex items-center gap-1">
                  <span className="size-2 rounded-full bg-rose-500" /> Spike
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="size-2 rounded-full bg-[#6C5CE7]" /> Recharge
                </span>
              </div>
            </div>
            <div className="mt-2">
              <BigChart
                data={tool.daily}
                color={tool.color}
                labels={labels}
                spikes={spikes}
                recharges={recharges}
                height={180}
              />
            </div>
          </div>

          <div>
            <h3 className="font-display text-sm font-semibold mb-2">Ereignisse</h3>
            <div className="rounded-2xl border border-border bg-card divide-y divide-border">
              {tool.ereignisse.length === 0 && (
                <div className="p-4 text-sm text-muted-foreground">Keine besonderen Ereignisse.</div>
              )}
              {tool.ereignisse.map((e, i) => (
                <div key={i} className="p-3 flex items-center gap-3 text-sm">
                  <span className="text-xs text-muted-foreground w-14 tabular-nums">{e.datum}</span>
                  {e.typ === "recharge" && (
                    <>
                      <RefreshCw className="size-4 text-[#6C5CE7]" />
                      <span>
                        Auto-Recharge <span className="font-semibold tabular-nums">{eur(e.betrag)}</span>
                      </span>
                    </>
                  )}
                  {e.typ === "spike" && (
                    <>
                      <AlertTriangle className="size-4 text-rose-600" />
                      <span>
                        Spike erkannt, <span className="font-semibold">{e.faktor}x</span> Schnitt
                      </span>
                    </>
                  )}
                  {e.typ === "verfall" && (
                    <>
                      <Clock className="size-4 text-amber-600" />
                      <span>
                        <span className="font-semibold tabular-nums">{eur(e.betrag)}</span> Guthaben verfallen
                      </span>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
            <h3 className="font-display text-sm font-semibold">Monatsbudget</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Budget (€)</Label>
                <Input
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="z. B. 500"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">Alarm bei %</Label>
                <Input
                  value={alarmPct}
                  onChange={(e) => setAlarmPct(e.target.value)}
                  placeholder="80"
                  className="mt-1"
                />
              </div>
            </div>
            <Button onClick={saveBudget} className="w-full">
              Budget speichern
            </Button>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4">
            <h3 className="font-display text-sm font-semibold">Auto-Recharge</h3>
            {tool.autoRecharge ? (
              <div className="mt-2 text-sm text-muted-foreground">
                Aktiv: Bei Restguthaben von{" "}
                <span className="font-semibold text-foreground tabular-nums">
                  {eur(tool.autoRecharge.schwelle)}
                </span>{" "}
                wird automatisch{" "}
                <span className="font-semibold text-foreground tabular-nums">
                  {eur(tool.autoRecharge.betrag)}
                </span>{" "}
                nachgeladen.
              </div>
            ) : (
              <div className="mt-2 text-sm text-muted-foreground">
                Auto-Recharge ist nicht aktiv.
              </div>
            )}
            <div className="mt-3 flex items-center justify-between rounded-xl bg-muted/40 p-3">
              <div className="flex items-center gap-2">
                <Bell className="size-4 text-primary" />
                <div>
                  <div className="text-sm font-medium">Recharge-Alarm</div>
                  <div className="text-xs text-muted-foreground">
                    Benachrichtigung bei jeder automatischen Nachladung
                  </div>
                </div>
              </div>
              <Switch checked={rechargeAlarm} onCheckedChange={saveRecharge} />
            </div>
          </div>

          {tool.aboId && (
            <Button asChild variant="outline" className="w-full">
              <Link to="/abos/$aboId" params={{ aboId: tool.aboId }}>
                Zur Abo-Detailseite
              </Link>
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ---------- main ----------
export function AiCredits() {
  const [zeitraum, setZeitraum] = useState<Zeitraum>("monat");
  const [tools, setTools] = useState<ToolDaten[]>(initialTools);
  const [openId, setOpenId] = useState<string | null>(null);
  const [connectProviderId, setConnectProviderId] = useState<string | null>(null);
  const openTool = tools.find((t) => t.id === openId) ?? null;
  const connectProvider =
    aiProviders.find((p) => p.id === connectProviderId) ?? null;

  const gesamtMonat = tools.reduce((s, t) => s + t.monat, 0);
  const monatsSchnitt = 475; // fiktiver Schnitt
  const diffPct = Math.round(((gesamtMonat - monatsSchnitt) / monatsSchnitt) * 100);
  // Prognose: tag X von 30
  const heuteTag = 24;
  const prognose = Math.round((gesamtMonat / heuteTag) * 30);
  const verfallSumme = tools.reduce((s, t) => s + (t.verfallEUR ?? 0), 0);
  const aktiveSpikes = tools.filter((t) => t.spikeFaktor);

  const gesamtVerlauf = useMemo(() => {
    if (zeitraum === "monat") {
      const len = tools[0].daily.length;
      return Array.from({ length: len }, (_, i) =>
        tools.reduce((s, t) => s + (t.daily[i] ?? 0), 0),
      );
    }
    if (zeitraum === "3monate") {
      return tools[0].weekly12.slice(-12).map((_, i) =>
        tools.reduce((s, t) => s + (t.weekly12[i] ?? 0), 0),
      );
    }
    return Array.from({ length: 12 }, (_, i) =>
      tools.reduce((s, t) => s + (t.monthly12[i] ?? 0), 0),
    );
  }, [tools, zeitraum]);

  const gesamtLabels = useMemo(() => {
    if (zeitraum === "monat") return gesamtVerlauf.map((_, i) => `${i + 1}.`);
    if (zeitraum === "3monate") return gesamtVerlauf.map((_, i) => `W${i + 1}`);
    return ["Aug", "Sep", "Okt", "Nov", "Dez", "Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul"];
  }, [gesamtVerlauf, zeitraum]);

  const updateTool = (t: ToolDaten) => {
    setTools((prev) => prev.map((x) => (x.id === t.id ? t : x)));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight">
            AI-Credits & variable Kosten
          </h1>
          <p className="mt-1 text-sm text-muted-foreground max-w-xl">
            Die Kosten, die sonst niemand im Blick hat.
          </p>
        </div>
        <ZeitraumSwitch value={zeitraum} onChange={setZeitraum} />
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Variabel diesen Monat"
          value={eur(gesamtMonat)}
          hint={`${diffPct >= 0 ? "+" : ""}${diffPct} % zum Monatsschnitt`}
          hintTone={diffPct > 0 ? "bad" : "good"}
          icon={<Zap className="size-4 text-primary" />}
        />
        <KpiCard
          label="Prognose Monatsende"
          value={eur(prognose)}
          hint="bei aktuellem Tempo"
          hintTone="warn"
          icon={<TrendingUp className="size-4 text-amber-600" />}
        />
        <KpiCard
          label="Variable Tools"
          value={num(tools.length)}
          hint="aktiv im Verbrauch"
          icon={<Sparkles className="size-4 text-primary" />}
        />
        <KpiCard
          label="Verfallendes Guthaben"
          value={eur(verfallSumme)}
          hint="ungenutzt diesen Monat"
          hintTone="warn"
          icon={<Clock className="size-4 text-amber-600" />}
        />
      </div>

      {/* Alarm Banners */}
      {aktiveSpikes.length > 0 && (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/8 p-4 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-start gap-3 flex-1">
            <div className="size-9 rounded-xl bg-rose-500/15 grid place-items-center text-rose-600 shrink-0">
              <AlertTriangle className="size-4" />
            </div>
            <div className="min-w-0">
              <div className="font-display text-sm font-semibold">
                {aktiveSpikes.length === 1
                  ? `${aktiveSpikes[0].name}-Spend diesen Monat ${aktiveSpikes[0].spikeFaktor}x so hoch wie im Schnitt.`
                  : `${aktiveSpikes.length} Tools mit auffälligen Spikes.`}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                Schau dir den Verlauf an, um die Ursache zu finden.
              </div>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="border-rose-500/30 text-rose-700 hover:bg-rose-500/10"
            onClick={() => setOpenId(aktiveSpikes[0].id)}
          >
            Verlauf ansehen
          </Button>
        </div>
      )}
      {verfallSumme > 0 && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/8 p-4 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-start gap-3 flex-1">
            <div className="size-9 rounded-xl bg-amber-500/15 grid place-items-center text-amber-600 shrink-0">
              <Clock className="size-4" />
            </div>
            <div className="min-w-0">
              <div className="font-display text-sm font-semibold">
                {eur(verfallSumme)} Guthaben verfallen, wenn du nichts tust.
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                Guthaben rechtzeitig nutzen oder Auto-Recharge prüfen.
              </div>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="border-amber-500/30 text-amber-700 hover:bg-amber-500/10"
            onClick={() => {
              const v = tools.find((t) => t.verfallEUR);
              if (v) setOpenId(v.id);
            }}
          >
            Details ansehen
          </Button>
        </div>
      )}

      {/* Gesamt-Verlauf */}
      <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-display text-lg font-semibold tracking-tight">
              Variable Kosten gesamt
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {zeitraum === "monat"
                ? "täglich diesen Monat"
                : zeitraum === "3monate"
                ? "wöchentlich, letzte 3 Monate"
                : "monatlich, letzte 12 Monate"}
              , Spikes und Auto-Recharges markiert
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-3 text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <span className="size-2 rounded-full bg-rose-500" /> Spike
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="size-2 rounded-full bg-[#6C5CE7]" /> Recharge
            </span>
          </div>
        </div>
        <BigChart
          data={gesamtVerlauf}
          color="#6C5CE7"
          labels={gesamtLabels}
          spikes={zeitraum === "monat" ? [15, 13] : zeitraum === "3monate" ? [5, 8] : [8, 11]}
          recharges={zeitraum === "monat" ? [1, 5, 12, 18, 20] : []}
          height={240}
        />
      </div>

      {/* Pro-Tool */}
      <div>
        <h2 className="font-display text-lg font-semibold tracking-tight mb-3">
          Pro Tool
        </h2>
        {tools.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-card p-10 text-center">
            <div className="mx-auto size-12 rounded-full bg-primary/10 grid place-items-center text-primary mb-3">
              <Sparkles className="size-5" />
            </div>
            <div className="font-display text-base font-semibold">Noch keine variablen Tools</div>
            <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
              Du hast aktuell keine verbrauchsbasierten Tools. Hier tauchen KI-APIs und
              Credit-Tools auf, sobald du welche erfasst.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {tools.map((t) => (
              <ToolCard
                key={t.id}
                t={t}
                onOpen={() => setOpenId(t.id)}
                onSetBudget={() => setOpenId(t.id)}
              />
            ))}
          </div>
        )}
      </div>

      <ToolDrilldown
        open={!!openTool}
        onClose={() => setOpenId(null)}
        tool={openTool}
        onUpdate={updateTool}
      />
    </div>
  );
}
