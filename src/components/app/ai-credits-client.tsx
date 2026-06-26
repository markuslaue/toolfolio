"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { Bot, Plus, AlertTriangle, TrendingUp, TrendingDown, Loader2, Trash2, Cpu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { formatEur as eur } from "@/lib/constants";
import type { ServiceDaten } from "@/lib/ai-credits";
import { createService, setBudget, deleteService, upsertSpend } from "@/app/app/ai-credits/actions";

type Zeitraum = "monat" | "3monate" | "12monate";
const FENSTER: Record<Zeitraum, number> = { monat: 6, "3monate": 3, "12monate": 12 };

function Sparkline({ data, color, height = 36 }: { data: number[]; color: string; height?: number }) {
  const w = 120, h = height;
  const max = Math.max(...data, 0.0001), min = Math.min(...data);
  const range = Math.max(max - min, 0.0001);
  const step = w / Math.max(data.length - 1, 1);
  const pts = data.map((v, i) => [i * step, h - ((v - min) / range) * (h - 6) - 3] as const);
  const d = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x},${y}`).join(" ");
  return (
    <svg width={w} height={h} className="overflow-visible">
      <path d={`${d} L${w},${h} L0,${h} Z`} fill={color} opacity={0.12} />
      <path d={d} fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BigChart({ data, labels, color, height = 220 }: { data: number[]; labels: string[]; color: string; height?: number }) {
  const w = 800, h = height, pad = { l: 40, r: 12, t: 12, b: 26 };
  const iw = w - pad.l - pad.r, ih = h - pad.t - pad.b;
  const max = Math.max(...data, 1);
  const step = iw / Math.max(data.length - 1, 1);
  const pts = data.map((v, i) => [pad.l + i * step, pad.t + ih - (v / max) * ih] as const);
  const line = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x},${y}`).join(" ");
  const yTicks = [0, 0.5, 1].map((t) => ({ y: pad.t + ih - t * ih, label: eur(max * t) }));
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto">
      {yTicks.map((t, i) => (
        <g key={i}>
          <line x1={pad.l} x2={pad.l + iw} y1={t.y} y2={t.y} stroke="#ece6da" strokeDasharray="2 4" />
          <text x={4} y={t.y + 4} fontSize={10} fill="#8b8794">{t.label}</text>
        </g>
      ))}
      <path d={`${line} L${pad.l + iw},${pad.t + ih} L${pad.l},${pad.t + ih} Z`} fill={color} opacity={0.16} />
      <path d={line} fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
      {labels.map((l, i) => {
        const everyN = Math.ceil(labels.length / 8);
        if (i % everyN !== 0) return null;
        return <text key={i} x={pad.l + i * step} y={h - 6} fontSize={10} textAnchor="middle" fill="#8b8794">{l}</text>;
      })}
    </svg>
  );
}

function KpiCard({ label, value, hint, hintTone, icon }: { label: string; value: string; hint?: string; hintTone?: "muted" | "good" | "warn" | "bad"; icon?: React.ReactNode }) {
  const tone = hintTone === "good" ? "text-emerald-600" : hintTone === "warn" ? "text-amber-600" : hintTone === "bad" ? "text-rose-600" : "text-muted-foreground";
  return (
    <div className="rounded-3xl border border-border bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center justify-between text-xs font-medium text-muted-foreground"><span>{label}</span>{icon}</div>
      <div className="mt-2 font-display text-3xl font-semibold tracking-tight tabular-nums">{value}</div>
      {hint && <div className={`mt-1 text-xs font-medium ${tone}`}>{hint}</div>}
    </div>
  );
}

export function AiCreditsClient({ daten, gesamtMonat, gesamtVormonat, jahr, monat }: { daten: ServiceDaten[]; gesamtMonat: number; gesamtVormonat: number; jahr: number; monat: number }) {
  const [zeitraum, setZeitraum] = useState<Zeitraum>("12monate");
  const [drill, setDrill] = useState<ServiceDaten | null>(null);

  const n = FENSTER[zeitraum];
  const gesamtReihe = useMemo(() => {
    const len = daten[0]?.reihe.length ?? 12;
    const start = Math.max(0, len - n);
    const labels = (daten[0]?.reihe ?? []).slice(start).map((p) => p.label);
    const sums = Array.from({ length: len - start }, (_, i) =>
      daten.reduce((s, d) => s + (d.reihe[start + i]?.betrag ?? 0), 0),
    );
    return { labels, sums };
  }, [daten, n]);

  const trendPct = gesamtVormonat > 0 ? Math.round(((gesamtMonat - gesamtVormonat) / gesamtVormonat) * 100) : 0;
  const spikes = daten.filter((d) => d.spikeFaktor).length;
  const ueberBudget = daten.filter((d) => d.budget && d.monat > d.budget).length;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight">AI-Credits</h1>
          <p className="mt-1 text-muted-foreground">Auch die variablen KI-Kosten im Griff. Erkenne Spikes und setze Budgets.</p>
        </div>
        <div className="flex items-center gap-2">
          <ZeitraumSwitch value={zeitraum} onChange={setZeitraum} />
          <AddServiceDialog />
        </div>
      </header>

      {daten.length === 0 ? (
        <div className="rounded-3xl border border-dashed bg-card p-12 text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-coral/10 text-coral"><Cpu className="size-6" /></span>
          <h2 className="mt-4 font-display text-lg font-semibold">Noch keine KI-Dienste</h2>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
            Lege Dienste wie OpenAI, Anthropic oder ElevenLabs an und trage ihre monatlichen Kosten ein. So erkennst du Spikes und behältst Budgets im Blick.
          </p>
          <div className="mt-5 flex justify-center"><AddServiceDialog /></div>
          <p className="mt-4 text-xs text-muted-foreground">Automatischer Abruf per API-Schlüssel folgt mit den Integrationen.</p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard label="Diesen Monat" value={eur(gesamtMonat)} hint={`${trendPct >= 0 ? "+" : ""}${trendPct}% ggü. Vormonat`} hintTone={trendPct > 0 ? "bad" : "good"} icon={<Bot className="size-4 text-coral" />} />
            <KpiCard label="Aktive Dienste" value={String(daten.length)} hintTone="muted" />
            <KpiCard label="Spikes erkannt" value={String(spikes)} hint={spikes > 0 ? "über 1,5x Schnitt" : "alles ruhig"} hintTone={spikes > 0 ? "warn" : "good"} icon={<AlertTriangle className="size-4 text-amber-500" />} />
            <KpiCard label="Über Budget" value={String(ueberBudget)} hintTone={ueberBudget > 0 ? "bad" : "good"} />
          </div>

          <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
            <div className="mb-2 text-sm font-medium text-muted-foreground">Gesamtverlauf (monatlich)</div>
            <BigChart data={gesamtReihe.sums} labels={gesamtReihe.labels} color="#6C5CE7" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {daten.map((d) => <ServiceCard key={d.id} d={d} window={n} onOpen={() => setDrill(d)} />)}
          </div>
        </>
      )}

      {drill && <DrilldownDialog key={drill.id} service={drill} jahr={jahr} monat={monat} onClose={() => setDrill(null)} />}
    </div>
  );
}

function ZeitraumSwitch({ value, onChange }: { value: Zeitraum; onChange: (z: Zeitraum) => void }) {
  const opts: { v: Zeitraum; l: string }[] = [
    { v: "monat", l: "6 Monate" },
    { v: "3monate", l: "3 Monate" },
    { v: "12monate", l: "12 Monate" },
  ];
  return (
    <div className="inline-flex rounded-full border border-border bg-card p-1 shadow-sm">
      {opts.map((o) => (
        <button key={o.v} onClick={() => onChange(o.v)} className={cn("px-3 sm:px-4 h-8 rounded-full text-xs font-medium transition", value === o.v ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground")}>{o.l}</button>
      ))}
    </div>
  );
}

function ServiceCard({ d, window, onOpen }: { d: ServiceDaten; window: number; onOpen: () => void }) {
  const reihe = d.reihe.slice(Math.max(0, d.reihe.length - window));
  const trendPos = d.trendPct >= 0;
  const budgetPct = d.budgetPct ?? 0;
  const budgetTone = budgetPct >= 100 ? "bg-rose-500" : budgetPct >= 80 ? "bg-amber-500" : "bg-emerald-500";
  return (
    <button onClick={onOpen} className="group text-left rounded-3xl border border-border bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl text-sm font-bold text-white" style={{ background: d.color }}>{d.initials}</span>
          <span className="truncate font-display font-semibold">{d.name}</span>
        </div>
        {d.spikeFaktor && (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-medium text-rose-700"><AlertTriangle className="size-3" /> Spike {String(d.spikeFaktor).replace(".", ",")}x</span>
        )}
      </div>

      <div className="mt-4 flex items-end justify-between">
        <div>
          <div className="font-display text-2xl font-semibold tabular-nums">{eur(d.monat)}</div>
          <div className={cn("mt-0.5 flex items-center gap-1 text-xs font-medium", trendPos ? "text-rose-600" : "text-emerald-600")}>
            {trendPos ? <TrendingUp className="size-3.5" /> : <TrendingDown className="size-3.5" />}
            {d.trendPct >= 0 ? "+" : ""}{d.trendPct}% ggü. Vormonat
          </div>
        </div>
        <Sparkline data={reihe.map((p) => p.betrag)} color={d.color} />
      </div>

      {d.budget ? (
        <div className="mt-4">
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted"><div className={cn("h-full rounded-full transition-all", budgetTone)} style={{ width: `${budgetPct}%` }} /></div>
          <div className="mt-1.5 text-xs text-muted-foreground"><span className="font-semibold text-foreground tabular-nums">{eur(d.monat)}</span> von <span className="tabular-nums">{eur(d.budget)}</span> Budget</div>
        </div>
      ) : (
        <div className="mt-4 text-xs text-primary group-hover:underline">Budget setzen und Verbrauch eintragen</div>
      )}
    </button>
  );
}

function AddServiceDialog() {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  function submit(fd: FormData) {
    start(async () => {
      const r = await createService({}, fd);
      if (r.error) toast.error(r.error);
      else { toast.success("Dienst angelegt"); setOpen(false); }
    });
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button className="gap-2"><Plus className="size-4" /> Dienst hinzufügen</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>KI-Dienst hinzufügen</DialogTitle>
          <DialogDescription>Trage einen Dienst mit variablen Kosten ein, z. B. OpenAI oder Anthropic.</DialogDescription>
        </DialogHeader>
        <form action={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" required placeholder="OpenAI" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="budget">Monatsbudget (optional, EUR)</Label>
            <Input id="budget" name="budget" inputMode="decimal" placeholder="500" />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={pending} className="gap-2">{pending && <Loader2 className="size-4 animate-spin" />} Anlegen</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DrilldownDialog({ service, jahr, monat, onClose }: { service: ServiceDaten; jahr: number; monat: number; onClose: () => void }) {
  const [busy, start] = useTransition();
  const [budget, setBudgetVal] = useState(service.budget?.toString().replace(".", ",") ?? "");
  const [werte, setWerte] = useState<Record<string, string>>(() => {
    const w: Record<string, string> = {};
    service.reihe.forEach((p) => { if (p.betrag) w[`${p.jahr}-${p.monat}`] = String(p.betrag).replace(".", ","); });
    return w;
  });

  const speichernBudget = () => {
    const num = budget.trim() ? Number(budget.replace(",", ".")) : null;
    start(async () => {
      const r = await setBudget(service.id, num);
      if (r.error) toast.error(r.error); else toast.success("Budget gespeichert");
    });
  };
  const speichernWert = (jahr: number, monat: number, raw: string) => {
    const num = raw.trim() ? Number(raw.replace(",", ".")) : 0;
    if (Number.isNaN(num) || num < 0) return;
    start(async () => {
      const r = await upsertSpend(service.id, jahr, monat, num);
      if (r.error) toast.error(r.error);
    });
  };
  const loeschen = () => start(async () => {
    const r = await deleteService(service.id);
    if (r.error) toast.error(r.error); else { toast.success("Dienst gelöscht"); onClose(); }
  });

  return (
    <Dialog open={!!service} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="grid size-7 place-items-center rounded-lg text-xs font-bold text-white" style={{ background: service.color }}>{service.initials}</span>
            {service.name}
          </DialogTitle>
          <DialogDescription>
            Diesen Monat {eur(service.monat)}{service.schnitt > 0 ? `, Schnitt der Vormonate ${eur(service.schnitt)}` : ""}.
            {service.spikeFaktor ? ` Spike: ${String(service.spikeFaktor).replace(".", ",")}x.` : ""}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-1.5">
          <Label className="text-xs">Monatsbudget (EUR)</Label>
          <div className="flex gap-2">
            <Input value={budget} onChange={(e) => setBudgetVal(e.target.value)} inputMode="decimal" placeholder="kein Budget" />
            <Button variant="outline" onClick={speichernBudget} disabled={busy}>Speichern</Button>
          </div>
        </div>

        <div className="mt-2">
          <div className="mb-1.5 text-xs font-medium text-muted-foreground">Monatliche Kosten (zum Bearbeiten tippen, mit Enter speichern)</div>
          <div className="max-h-64 space-y-1 overflow-y-auto pr-1">
            {[...service.reihe].reverse().map((p) => {
              const key = `${p.jahr}-${p.monat}`;
              const isAktuell = p.jahr === jahr && p.monat === monat;
              return (
                <div key={key} className="flex items-center gap-2">
                  <span className={cn("w-24 text-sm", isAktuell ? "font-semibold" : "text-muted-foreground")}>{p.label} {p.jahr}</span>
                  <Input
                    className="h-8"
                    value={werte[key] ?? ""}
                    inputMode="decimal"
                    placeholder="0,00"
                    onChange={(e) => setWerte((w) => ({ ...w, [key]: e.target.value }))}
                    onKeyDown={(e) => { if (e.key === "Enter") speichernWert(p.jahr, p.monat, (e.target as HTMLInputElement).value); }}
                    onBlur={(e) => speichernWert(p.jahr, p.monat, e.target.value)}
                  />
                </div>
              );
            })}
          </div>
        </div>

        <DialogFooter className="sm:justify-between">
          <Button variant="ghost" className="gap-2 text-destructive hover:text-destructive" onClick={loeschen} disabled={busy}><Trash2 className="size-4" /> Dienst löschen</Button>
          <Button onClick={onClose}>Fertig</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
