"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { Info, Edit3, Wallet, TrendingUp, TrendingDown, PiggyBank, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { formatEur as euro } from "@/lib/constants";
import type { MonatDaten } from "@/lib/budget";
import { saveBudget } from "@/app/app/budget/actions";

type View = "gesamt" | "fixVar" | "kategorie";
const PALETTE = ["#6C5CE7", "#FF7A66", "#12B76A", "#F5A623", "#0099ff", "#D97757", "#1F1D2B", "#8b5cf6"];

export function BudgetClient({
  monate, kategorienFix, forecastJahr, budgetJahr, ersparnisOffen,
}: {
  monate: MonatDaten[]; kategorienFix: Record<string, number>; forecastJahr: number; budgetJahr: number | null; ersparnisOffen: number;
}) {
  const [view, setView] = useState<View>("gesamt");
  const [whatIf, setWhatIf] = useState(false);
  const [budget, setBudget] = useState<number>(budgetJahr ?? 0);
  const [dialog, setDialog] = useState(false);

  const katFarbe = useMemo(() => {
    const keys = [...new Set([...Object.keys(kategorienFix), "AI"])];
    const map: Record<string, string> = {};
    keys.forEach((k, i) => { map[k] = PALETTE[i % PALETTE.length]; });
    return map;
  }, [kategorienFix]);

  const monatsBudget = budget > 0 ? budget / 12 : 0;
  const totals = monate.map((d) => d.fix + d.variabel);
  const deltaMonat = ersparnisOffen / 12;
  const totalsAnzeige = monate.map((d, i) => (whatIf && !d.ist ? Math.max(0, totals[i] - deltaMonat) : totals[i]));
  const max = Math.max(...totals, monatsBudget * 1.4, 1);

  const aktuell = totals[5] ?? 0; // aktueller Monat (Offset 0)
  const forecastAnzeige = whatIf ? Math.max(0, forecastJahr - ersparnisOffen) : forecastJahr;
  const abweichung = forecastAnzeige - budget;

  function speichern() {
    const wert = budget > 0 ? budget : null;
    saveBudgetTransition(wert);
  }
  const [pending, startT] = useTransition();
  function saveBudgetTransition(wert: number | null) {
    startT(async () => {
      const r = await saveBudget(wert);
      if (r.error) toast.error(r.error);
      else { toast.success("Budget gespeichert"); setDialog(false); }
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight">Budget & Forecast</h1>
          <p className="text-muted-foreground max-w-2xl mt-1">Was in den nächsten 12 Monaten auf dich zukommt, auf Basis deiner aktuellen Abos und variablen AI-Kosten.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-sm">
            <Switch checked={whatIf} onCheckedChange={setWhatIf} id="whatif" />
            <Label htmlFor="whatif" className="cursor-pointer">Mit Sparvorschlägen</Label>
          </div>
          <Button variant="outline" className="gap-1.5" onClick={() => setDialog(true)}><Edit3 className="size-4" /> Budget bearbeiten</Button>
        </div>
      </div>

      <div className="flex items-start gap-3 rounded-2xl border border-border bg-card/60 px-4 py-3 text-sm">
        <Info className="size-4 text-primary mt-0.5 shrink-0" />
        <p className="text-muted-foreground">Forecast ist eine Projektion: fixe Abokosten sind bekannt, variable AI-Kosten werden aus deinen Istwerten fortgeschrieben. Vergangene Monate zeigen die erfassten AI-Istwerte.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi icon={Wallet} label="Aktueller Monat" wert={euro(aktuell)} />
        <Kpi icon={TrendingUp} label="Forecast 12 Monate" wert={euro(forecastAnzeige)} hint={whatIf ? "mit Sparvorschlägen" : "fix + variabel"} tone="violet" />
        <Kpi icon={PiggyBank} label="Jahresbudget" wert={budget > 0 ? euro(budget) : "—"} hint={budget > 0 ? `monatlich ${euro(monatsBudget)}` : "noch nicht gesetzt"} />
        <Kpi icon={abweichung > 0 ? AlertTriangle : TrendingDown} label="Abweichung" wert={budget > 0 ? `${abweichung > 0 ? "+" : ""}${euro(abweichung)}` : "—"} hint={budget > 0 ? (abweichung > 0 ? "über Budget" : "unter Budget") : "Budget setzen"} tone={budget > 0 ? (abweichung > 0 ? "amber" : "emerald") : "muted"} />
      </div>

      <div className="rounded-3xl bg-card border border-border shadow-sm p-5">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <div className="font-display text-lg font-semibold">Forecast 12 Monate</div>
            <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-3 flex-wrap">
              <span className="inline-flex items-center gap-1"><span className="inline-block size-2.5 rounded-sm bg-[#1F1D2B]" /> Ist</span>
              <span className="inline-flex items-center gap-1"><span className="inline-block size-2.5 rounded-sm bg-primary/70" /> Forecast (fix)</span>
              <span className="inline-flex items-center gap-1"><span className="inline-block size-2.5 rounded-sm border border-dashed border-primary bg-primary/20" /> variabel (Schätzung)</span>
              {budget > 0 && <span className="inline-flex items-center gap-1"><span className="inline-block w-4 h-0.5 bg-[#12B76A]" /> Budget</span>}
            </div>
          </div>
          <div className="inline-flex rounded-full bg-muted p-0.5 text-xs font-medium">
            {([["gesamt", "Gesamt"], ["fixVar", "Fix / Variabel"], ["kategorie", "Kategorie"]] as [View, string][]).map(([v, l]) => (
              <button key={v} onClick={() => setView(v)} className={cn("rounded-full px-3 py-1.5 transition-colors", view === v ? "bg-card shadow text-foreground" : "text-muted-foreground")}>{l}</button>
            ))}
          </div>
        </div>

        <div className="mt-6 relative h-72">
          {budget > 0 && (
            <div className="absolute left-0 right-0 border-t-2 border-dashed border-[#12B76A] z-[1]" style={{ bottom: `${Math.min(100, (monatsBudget / max) * 100)}%` }}>
              <span className="absolute -top-5 right-0 text-[11px] font-semibold text-[#12B76A]">Monatsbudget {euro(monatsBudget)}</span>
            </div>
          )}
          <div className="flex items-end gap-1.5 h-full pt-6">
            {monate.map((d, i) => {
              const used = totalsAnzeige[i];
              const ueber = monatsBudget > 0 && used > monatsBudget * 1.15;
              const leicht = monatsBudget > 0 && used > monatsBudget;
              const fixFarbe = d.ist ? "#1F1D2B" : ueber ? "#F0533D" : leicht ? "#F5A623" : "#6C5CE7";
              let items: { v: number; color: string; opacity: number; dashed?: boolean }[];
              if (view === "fixVar") items = [{ v: d.fix, color: "#6C5CE7", opacity: d.ist ? 1 : 0.85 }, { v: d.variabel, color: "#FF7A66", opacity: d.ist ? 1 : 0.7, dashed: !d.ist }];
              else if (view === "kategorie") items = Object.entries(d.kategorien).map(([k, v]) => ({ v, color: katFarbe[k] ?? "#999", opacity: d.ist ? 1 : 0.8, dashed: !d.ist && k === "AI" }));
              else items = [{ v: d.fix, color: fixFarbe, opacity: d.ist ? 1 : 0.85 }, { v: d.variabel, color: fixFarbe, opacity: d.ist ? 0.55 : 0.4, dashed: !d.ist }];
              return (
                <div key={`${d.jahr}-${d.monat}`} className="flex-1 flex flex-col items-center group relative" title={`${d.label} ${d.jahr} ${d.ist ? "(Ist)" : "(Forecast)"}: ${euro(used)}`}>
                  <div className="w-full flex flex-col justify-end h-full"><BarStack items={items} max={max} /></div>
                  <span className="mt-1 text-[10px] text-muted-foreground">{d.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <Dialog open={dialog} onOpenChange={setDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Jahresbudget bearbeiten</DialogTitle>
            <DialogDescription>Setze ein Jahresbudget für deine Softwarekosten. Die Budget-Linie im Diagramm zeigt das Monatsbudget.</DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label htmlFor="budget">Jahresbudget (EUR)</Label>
            <Input id="budget" inputMode="decimal" value={budget || ""} onChange={(e) => setBudget(Number(e.target.value.replace(",", ".")) || 0)} placeholder="30000" />
          </div>
          <DialogFooter>
            <Button onClick={speichern} disabled={pending} className="gap-2">{pending && <Loader2 className="size-4 animate-spin" />} Speichern</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function BarStack({ items, max }: { items: { v: number; color: string; opacity: number; dashed?: boolean }[]; max: number }) {
  return (
    <div className="w-full flex flex-col justify-end rounded-md overflow-hidden">
      {items.filter((it) => it.v > 0).map((it, i) => (
        <div key={i} style={{ height: `${(it.v / max) * 270}px`, background: it.color, opacity: it.opacity }} className={cn("w-full", it.dashed && "border border-dashed border-white/60")} />
      ))}
    </div>
  );
}

function Kpi({ icon: Icon, label, wert, hint, tone }: { icon: typeof Wallet; label: string; wert: string; hint?: string; tone?: "violet" | "amber" | "emerald" | "muted" }) {
  const toneCls = tone === "violet" ? "text-primary" : tone === "amber" ? "text-amber-600" : tone === "emerald" ? "text-emerald-600" : "";
  return (
    <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between text-xs font-medium text-muted-foreground"><span>{label}</span><Icon className="size-4" /></div>
      <div className={cn("mt-2 font-display text-2xl font-semibold tracking-tight tabular-nums", toneCls)}>{wert}</div>
      {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}
