"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  TrendingUp,
  TrendingDown,
  Info,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  Calendar,
  Zap,
  Tag,
  PiggyBank,
  Wallet,
  Edit3,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useReadOnly } from "@/components/app/read-only-context";
import { cn } from "@/lib/utils";
import { formatEur as euro } from "@/lib/constants";
import { KATEGORIE_FARBEN } from "@/lib/abos";
import type { MonatDaten } from "@/lib/budget";
import { saveBudget, saveKategorieBudget } from "@/app/app/budget/actions";

type View = "gesamt" | "fixVar" | "kategorie" | "kunde";

export type Treiber = {
  monat: string;
  typ: "verlaengerung" | "trial" | "preis" | "variabel";
  titel: string;
  text: string;
  href: string;
  linkLabel: string;
};

const KUNDEN_PALETTE = ["#6C5CE7", "#FF7A66", "#12B76A", "#F5A623", "#3B82F6", "#0FB5BA", "#E84393"];

const TREIBER_META: Record<
  Treiber["typ"],
  { icon: React.ComponentType<{ className?: string }>; bg: string; fg: string }
> = {
  verlaengerung: { icon: Tag, bg: "bg-warning/15", fg: "text-warning" },
  trial: { icon: Sparkles, bg: "bg-primary/10", fg: "text-primary" },
  preis: { icon: TrendingUp, bg: "bg-warning/15", fg: "text-warning" },
  variabel: { icon: Zap, bg: "bg-coral/15", fg: "text-coral" },
};

export function BudgetClient({
  monate,
  kategorienFix,
  kundenFix,
  forecastJahr,
  budgetJahr,
  kategorieBudgets,
  ersparnisOffen,
  treiber,
}: {
  monate: MonatDaten[];
  kategorienFix: Record<string, number>;
  kundenFix: Record<string, number>;
  forecastJahr: number;
  budgetJahr: number | null;
  kategorieBudgets: Record<string, number>;
  ersparnisOffen: number;
  treiber: Treiber[];
}) {
  const readOnly = useReadOnly();
  const router = useRouter();
  const [view, setView] = useState<View>("gesamt");
  const [whatIf, setWhatIf] = useState(false);
  const [budget, setBudget] = useState<number>(budgetJahr ?? 0);
  const [dialog, setDialog] = useState(false);
  const [hover, setHover] = useState<number | null>(null);
  const [pending, start] = useTransition();

  const kundenFarbe = useMemo(() => {
    const map: Record<string, string> = {};
    Object.keys(kundenFix)
      .sort()
      .forEach((k, i) => {
        map[k] = k === "ohne Kunde" ? "#9CA3AF" : KUNDEN_PALETTE[i % KUNDEN_PALETTE.length];
      });
    return map;
  }, [kundenFix]);

  const katFarbe = (k: string) => (k === "AI" ? "#FF7A66" : (KATEGORIE_FARBEN[k] ?? "#6C5CE7"));

  const monatsBudget = budget > 0 ? budget / 12 : 0;
  const totals = monate.map((d) => d.fix + d.variabel);
  const deltaMonat = ersparnisOffen / 12;
  const anzeige = monate.map((d, i) => (whatIf && !d.ist ? Math.max(0, totals[i] - deltaMonat) : totals[i]));
  const max = Math.max(...anzeige, monatsBudget * 1.4, 1);

  // Der aktuelle Monat ist der letzte Ist-Monat im Fenster.
  const jetztIdx = monate.reduce((acc, d, i) => (d.ist ? i : acc), 0);
  const aktuell = totals[jetztIdx] ?? 0;
  const forecastAnzeige = whatIf ? Math.max(0, forecastJahr - ersparnisOffen) : forecastJahr;
  const abweichung = budget > 0 ? forecastAnzeige - budget : null;

  const gerissen = monate
    .map((d, i) => ({ d, total: anzeige[i] }))
    .filter(({ d, total }) => !d.ist && monatsBudget > 0 && total > monatsBudget);

  function budgetSpeichern() {
    start(async () => {
      const res = await saveBudget(budget > 0 ? budget : null);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success("Budget gespeichert.");
      setDialog(false);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">Budget und Forecast</h1>
          <p className="mt-1 max-w-2xl text-muted-foreground">
            Was in den nächsten zwölf Monaten auf dich zukommt, inklusive Verlängerungen, Trials und bekannter
            Preisänderungen.
          </p>
        </div>
        {!readOnly && (
          <Button variant="outline" className="gap-1.5" onClick={() => setDialog(true)}>
            <Edit3 className="size-4" /> Budget bearbeiten
          </Button>
        )}
      </div>

      <div className="flex items-start gap-3 rounded-2xl border bg-card/60 px-4 py-3 text-sm">
        <Info className="mt-0.5 size-4 shrink-0 text-primary" />
        <p className="text-muted-foreground">
          Der Forecast ist eine Projektion aus deinen laufenden Abos. Die variablen KI-Kosten sind eine Schätzung aus
          dem Schnitt der Monate mit Verbrauch, keine Zusage. Per API verbundene Dienste liefern Istwerte und
          präzisieren die Hochrechnung.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi icon={Wallet} label="Aktueller Monat" wert={euro(aktuell)} hint="fix plus variabel" />
        <Kpi
          icon={TrendingUp}
          label="Forecast zwölf Monate"
          wert={euro(forecastAnzeige)}
          hint={whatIf ? "mit umgesetzten Sparvorschlägen" : "auf Basis der laufenden Abos"}
          tone="violet"
        />
        <Kpi
          icon={PiggyBank}
          label="Jahresbudget"
          wert={budget > 0 ? euro(budget) : "nicht gesetzt"}
          hint={budget > 0 ? `monatlich ${euro(monatsBudget)}` : "leg eins fest, dann warnen wir dich"}
        />
        <Kpi
          icon={abweichung !== null && abweichung > 0 ? AlertTriangle : TrendingDown}
          label="Abweichung"
          wert={abweichung === null ? "—" : `${abweichung > 0 ? "+" : ""}${euro(abweichung)}`}
          hint={abweichung === null ? "ohne Budget kein Vergleich" : abweichung > 0 ? "über Budget" : "unter Budget"}
          tone={abweichung === null ? undefined : abweichung > 0 ? "amber" : "emerald"}
        />
      </div>

      {/* Diagramm */}
      <div className="rounded-3xl border bg-card p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="font-display text-lg font-semibold">Verlauf und Forecast</div>
            <div className="mt-0.5 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <span className="inline-block size-2.5 rounded-sm bg-foreground" /> Ist
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="inline-block size-2.5 rounded-sm bg-primary/70" /> Forecast
              </span>
              {monatsBudget > 0 && (
                <span className="inline-flex items-center gap-1">
                  <span className="inline-block h-0.5 w-4 bg-success" /> Monatsbudget
                </span>
              )}
            </div>
          </div>
          <div className="inline-flex rounded-full bg-muted p-0.5 text-xs font-medium">
            {(
              [
                ["gesamt", "Gesamt"],
                ["fixVar", "Fix und variabel"],
                ["kategorie", "Kategorie"],
                ["kunde", "Kunde"],
              ] as [View, string][]
            ).map(([v, l]) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={cn(
                  "rounded-full px-3 py-1.5 transition-colors",
                  view === v ? "bg-card text-foreground shadow" : "text-muted-foreground",
                )}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        <div className="relative mt-6 h-72">
          {monatsBudget > 0 && monatsBudget / max <= 1 && (
            <div
              className="absolute left-0 right-0 border-t-2 border-dashed border-success"
              style={{ bottom: `${(monatsBudget / max) * 100}%` }}
            >
              <span className="absolute -top-5 right-0 text-[11px] font-semibold text-success">
                Monatsbudget {euro(monatsBudget)}
              </span>
            </div>
          )}

          <div className="flex h-full items-end gap-1.5 pt-6">
            {monate.map((d, i) => {
              const total = anzeige[i];
              const ueber = monatsBudget > 0 && total > monatsBudget * 1.15;
              const knapp = monatsBudget > 0 && total > monatsBudget;
              const grund = d.ist ? "#1F1D2B" : ueber ? "#F0533D" : knapp ? "#F5A623" : "#6C5CE7";
              const skala = totals[i] > 0 ? total / totals[i] : 1;

              const teile =
                view === "gesamt"
                  ? [
                      { v: d.fix, color: grund, opacity: d.ist ? 1 : 0.85 },
                      { v: d.variabel, color: grund, opacity: d.ist ? 0.55 : 0.4 },
                    ]
                  : view === "fixVar"
                    ? [
                        { v: d.fix, color: "#6C5CE7", opacity: d.ist ? 1 : 0.85 },
                        { v: d.variabel, color: "#FF7A66", opacity: d.ist ? 1 : 0.7 },
                      ]
                    : view === "kategorie"
                      ? Object.entries(d.kategorien).map(([k, v]) => ({
                          v,
                          color: katFarbe(k),
                          opacity: d.ist ? 1 : 0.8,
                        }))
                      : Object.entries(d.kunden).map(([k, v]) => ({
                          v,
                          color: kundenFarbe[k] ?? "#9CA3AF",
                          opacity: d.ist ? 1 : 0.8,
                        }));

              return (
                <div
                  key={`${d.jahr}-${d.monat}`}
                  className="group relative flex flex-1 flex-col items-center"
                  onMouseEnter={() => setHover(i)}
                  onMouseLeave={() => setHover(null)}
                >
                  {hover === i && (
                    <div className="absolute -top-2 z-10 w-56 -translate-y-full rounded-xl border bg-card p-3 text-xs shadow-lg">
                      <div className="mb-1 font-semibold">
                        {d.label} {d.jahr} {d.ist ? "(Ist)" : "(Forecast)"}
                      </div>
                      <div className="space-y-0.5">
                        <Zeile label="Fix" wert={euro(d.fix)} />
                        <Zeile label="Variabel" wert={euro(d.variabel)} hint={d.ist ? undefined : "Schätzung"} />
                        {whatIf && !d.ist && deltaMonat > 0 && (
                          <Zeile label="Sparvorschläge" wert={`- ${euro(deltaMonat)}`} tone="success" />
                        )}
                        <div className="mt-1 flex justify-between border-t pt-1 font-semibold">
                          <span>Gesamt</span>
                          <span className="tabular-nums">{euro(total)}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex h-full w-full flex-col justify-end">
                    <BarStack teile={teile} skala={skala} max={max} />
                  </div>
                  <div className={cn("mt-2 text-[10px] font-medium", d.ist ? "text-foreground" : "text-muted-foreground")}>
                    {d.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {(view === "kategorie" || view === "kunde") && (
          <div className="mt-4 flex flex-wrap gap-3 text-xs">
            {(view === "kategorie"
              ? [...new Set(monate.flatMap((m) => Object.keys(m.kategorien)))]
              : [...new Set(monate.flatMap((m) => Object.keys(m.kunden)))]
            )
              .sort()
              .map((k) => (
                <span key={k} className="inline-flex items-center gap-1.5">
                  <span
                    className="inline-block size-2.5 rounded-sm"
                    style={{ background: view === "kategorie" ? katFarbe(k) : (kundenFarbe[k] ?? "#9CA3AF") }}
                  />
                  {k}
                </span>
              ))}
          </div>
        )}
      </div>

      {/* Budget und What-if */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <PiggyBank className="size-5 text-primary" />
            <div className="font-display text-lg font-semibold">Budget</div>
          </div>
          <div className="mt-0.5 text-xs text-muted-foreground">
            Jahresbudget setzen und auf die Kategorien verteilen.
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="jahresbudget" className="text-xs">
                Jahresbudget
              </Label>
              <Input
                id="jahresbudget"
                type="number"
                min={0}
                value={budget || ""}
                onChange={(e) => setBudget(Number(e.target.value) || 0)}
                onBlur={budgetSpeichern}
                disabled={readOnly || pending}
                className="mt-1 tabular-nums"
              />
            </div>
            <div>
              <Label className="text-xs">Monatsbudget</Label>
              <Input value={monatsBudget > 0 ? euro(monatsBudget) : "—"} disabled className="mt-1 tabular-nums" />
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {Object.keys(kategorienFix).length === 0 && (
              <p className="text-sm text-muted-foreground">Noch keine Kategorien, weil noch keine Abos laufen.</p>
            )}
            {Object.entries(kategorienFix)
              .sort((a, b) => b[1] - a[1])
              .map(([k, monatsWert]) => (
                <KategorieBudget
                  key={k}
                  kategorie={k}
                  farbe={katFarbe(k)}
                  istJahr={Math.round(monatsWert * 12 * 100) / 100}
                  budgetJahr={kategorieBudgets[k] ?? null}
                  readOnly={readOnly}
                />
              ))}
          </div>

          {gerissen.length > 0 && (
            <div className="mt-4 rounded-2xl border bg-background/60 p-3 text-xs">
              <div className="mb-1 font-semibold text-foreground">Budget wird gerissen in:</div>
              <div className="flex flex-wrap gap-1.5">
                {gerissen.map(({ d, total }) => (
                  <span
                    key={`${d.jahr}-${d.monat}`}
                    className="inline-flex items-center gap-1 rounded-full border border-warning/40 bg-warning/10 px-2 py-0.5 text-[11px] font-semibold text-warning"
                  >
                    {d.label} {d.jahr} · +{euro(total - monatsBudget)}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="rounded-3xl border bg-card p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="size-5 text-primary" />
              <div>
                <div className="font-display text-lg font-semibold">What-if</div>
                <div className="text-xs text-muted-foreground">Was passiert, wenn du die Sparvorschläge umsetzt?</div>
              </div>
            </div>
            <Switch
              checked={whatIf}
              onCheckedChange={setWhatIf}
              disabled={ersparnisOffen <= 0}
              aria-label="Sparvorschläge einrechnen"
            />
          </div>

          {ersparnisOffen <= 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">
              Aktuell ist kein Sparvorschlag offen. Sobald wir einen finden, kannst du hier durchrechnen, was er bringt.
            </p>
          ) : (
            <>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border bg-muted/40 p-3">
                  <div className="text-xs text-muted-foreground">Aktuell</div>
                  <div className="mt-0.5 font-display text-xl font-bold tabular-nums">{euro(forecastJahr)}</div>
                  <div className="text-[11px] text-muted-foreground">pro Jahr</div>
                </div>
                <div
                  className={cn(
                    "rounded-2xl border p-3",
                    whatIf ? "border-success/40 bg-success/10" : "border-dashed bg-background/60",
                  )}
                >
                  <div className="text-xs text-muted-foreground">Mit Sparvorschlägen</div>
                  <div className={cn("mt-0.5 font-display text-xl font-bold tabular-nums", whatIf && "text-success")}>
                    {euro(Math.max(0, forecastJahr - ersparnisOffen))}
                  </div>
                  <div className="text-[11px] text-muted-foreground">spart {euro(ersparnisOffen)} pro Jahr</div>
                </div>
              </div>

              <Link
                href="/app/sparen"
                className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
              >
                Sparvorschläge ansehen <ArrowRight className="size-4" />
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Forecast-Treiber */}
      <div className="rounded-3xl border bg-card p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <Calendar className="size-5 text-primary" />
          <div>
            <div className="font-display text-lg font-semibold">Forecast-Treiber</div>
            <div className="text-xs text-muted-foreground">
              Ereignisse, die deine Kosten über das reine Hochrechnen hinaus bewegen.
            </div>
          </div>
        </div>

        {treiber.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            Aktuell kein bekanntes Ereignis: kein Trial, das ausläuft, keine Jahresverlängerung in Sicht.
          </p>
        ) : (
          <div className="mt-4 divide-y">
            {treiber.map((t, i) => {
              const meta = TREIBER_META[t.typ];
              const Icon = meta.icon;
              return (
                <div key={i} className="flex flex-wrap items-start gap-3 py-3 first:pt-0 last:pb-0">
                  <span className={cn("grid size-9 shrink-0 place-items-center rounded-xl", meta.bg, meta.fg)}>
                    <Icon className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold">{t.titel}</div>
                    <div className="text-xs text-muted-foreground">{t.text}</div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="text-xs text-muted-foreground">{t.monat}</div>
                    <Link href={t.href} className="text-xs font-medium text-primary hover:underline">
                      {t.linkLabel}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Dialog open={dialog} onOpenChange={setDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Jahresbudget bearbeiten</DialogTitle>
            <DialogDescription>Setz dein Jahresbudget. Daraus leiten wir dein Monatsbudget ab.</DialogDescription>
          </DialogHeader>
          <div>
            <Label htmlFor="budget-dialog" className="text-xs">
              Jahresbudget
            </Label>
            <Input
              id="budget-dialog"
              type="number"
              min={0}
              value={budget || ""}
              onChange={(e) => setBudget(Number(e.target.value) || 0)}
              className="mt-1 tabular-nums"
            />
            <div className="mt-1 text-xs text-muted-foreground">
              Monatsbudget: {monatsBudget > 0 ? euro(monatsBudget) : "—"}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(false)}>
              Abbrechen
            </Button>
            <Button onClick={budgetSpeichern} disabled={pending}>
              {pending && <Loader2 className="size-4 animate-spin" />} Speichern
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ------------------------------- Bausteine -------------------------------- */

function BarStack({
  teile,
  skala,
  max,
}: {
  teile: { v: number; color: string; opacity?: number }[];
  /** Faktor fuer den What-if-Abzug, damit die Anteile stimmen. */
  skala: number;
  max: number;
}) {
  const summe = teile.reduce((s, x) => s + x.v, 0);
  const hoehe = summe > 0 ? ((summe * skala) / max) * 100 : 0;
  return (
    <div
      className="flex w-full flex-col justify-end overflow-hidden rounded-md transition-all"
      style={{ height: `${Math.min(100, hoehe)}%`, minHeight: 4 }}
    >
      {teile
        .filter((t) => t.v > 0)
        .map((t, i) => (
          <div key={i} style={{ height: `${(t.v / summe) * 100}%`, background: t.color, opacity: t.opacity ?? 1 }} />
        ))}
    </div>
  );
}

function Zeile({ label, wert, hint, tone }: { label: string; wert: string; hint?: string; tone?: "success" }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="min-w-0 truncate text-muted-foreground">
        {label}
        {hint && <span className="ml-1 text-[10px]">({hint})</span>}
      </span>
      <span className={cn("shrink-0 tabular-nums", tone === "success" && "text-success")}>{wert}</span>
    </div>
  );
}

function Kpi({
  icon: Icon,
  label,
  wert,
  hint,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  wert: string;
  hint?: string;
  tone?: "amber" | "emerald" | "violet";
}) {
  const cls =
    tone === "amber"
      ? "text-warning"
      : tone === "emerald"
        ? "text-success"
        : tone === "violet"
          ? "text-primary"
          : "text-foreground";
  return (
    <div className="rounded-3xl border bg-card p-4 shadow-sm">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className="size-3.5" /> {label}
      </div>
      <div className={cn("mt-1 font-display text-2xl font-semibold tabular-nums", cls)}>{wert}</div>
      {hint && <div className="mt-0.5 text-[11px] text-muted-foreground">{hint}</div>}
    </div>
  );
}

function KategorieBudget({
  kategorie,
  farbe,
  istJahr,
  budgetJahr,
  readOnly,
}: {
  kategorie: string;
  farbe: string;
  istJahr: number;
  budgetJahr: number | null;
  readOnly: boolean;
}) {
  const router = useRouter();
  const [wert, setWert] = useState(budgetJahr ? String(budgetJahr) : "");
  const [pending, start] = useTransition();

  function speichern() {
    const n = wert.trim() === "" ? null : Number(wert);
    if (n === (budgetJahr ?? null)) return;
    start(async () => {
      const res = await saveKategorieBudget(kategorie, n);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      router.refresh();
    });
  }

  const ziel = budgetJahr ?? 0;
  const pct = ziel > 0 ? Math.round((istJahr / ziel) * 100) : 0;
  const ueber = ziel > 0 && istJahr > ziel;

  return (
    <div>
      <div className="flex items-center justify-between gap-2 text-sm">
        <div className="flex min-w-0 items-center gap-2">
          <span className="size-2.5 shrink-0 rounded-sm" style={{ background: farbe }} />
          <span className="truncate font-medium">{kategorie}</span>
        </div>
        <div className="shrink-0 text-xs tabular-nums text-muted-foreground">
          {euro(istJahr)} {ziel > 0 ? `/ ${euro(ziel)}` : "pro Jahr"}
        </div>
      </div>
      <div className="mt-1 flex items-center gap-2">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
          {ziel > 0 && (
            <div
              className="h-full transition-all"
              style={{ width: `${Math.min(100, (istJahr / ziel) * 100)}%`, background: ueber ? "#F0533D" : farbe }}
            />
          )}
        </div>
        <input
          type="number"
          min={0}
          value={wert}
          onChange={(e) => setWert(e.target.value)}
          onBlur={speichern}
          disabled={readOnly || pending}
          placeholder="Budget"
          aria-label={`Jahresbudget für ${kategorie}`}
          className="h-7 w-24 rounded-md border bg-background px-2 text-xs tabular-nums disabled:opacity-60"
        />
      </div>
      {ueber && <div className="mt-1 text-[11px] text-warning">{pct} % vom Budget verbraucht</div>}
    </div>
  );
}
