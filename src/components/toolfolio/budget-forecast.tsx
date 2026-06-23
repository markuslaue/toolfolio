import { useMemo, useState } from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";

type View = "gesamt" | "kategorie" | "kunde" | "fixVar";

type MonatDaten = {
  label: string;
  ist?: boolean;
  fix: number;
  variabel: number;
  ereignisse: { label: string; betrag: number }[];
  kategorien: Record<string, number>;
  kunden: Record<string, number>;
};

const monate: MonatDaten[] = [
  // vergangene Monate (Ist)
  m("Jul 25", true, 2380, 380, [], { Design: 720, AI: 520, Web: 540, Sonst: 600 }, { Nordwerk: 800, Holzbau Kessler: 760, "ohne Kunde": 820 }),
  m("Aug 25", true, 2415, 420, [{ label: "Framer-Trial wird kostenpflichtig", betrag: 29 }], { Design: 730, AI: 560, Web: 560, Sonst: 605 }, { Nordwerk: 810, Holzbau Kessler: 770, "ohne Kunde": 835 }),
  m("Sep 25", true, 2480, 440, [{ label: "Notion Preiserhöhung +18%", betrag: 18 }, { label: "Screaming Frog Jahresvertrag", betrag: 239 }], { Design: 740, AI: 580, Web: 590, Sonst: 610 }, { Nordwerk: 815, Holzbau Kessler: 800, "ohne Kunde": 865 }),
  // aktueller Monat
  m("Okt 25", true, 2480, 460, [], { Design: 745, AI: 600, Web: 580, Sonst: 615 }, { Nordwerk: 820, Holzbau Kessler: 795, "ohne Kunde": 865 }),
  // Forecast
  m("Nov 25", false, 2520, 480, [{ label: "Adobe Creative Cloud Jahresverlängerung", betrag: 720 }], { Design: 1490, AI: 620, Web: 580, Sonst: 630 }, { Nordwerk: 850, Holzbau Kessler: 1480, "ohne Kunde": 890 }),
  m("Dez 25", false, 2520, 490, [{ label: "Canva Pro Jahresverlängerung", betrag: 119 }], { Design: 870, AI: 630, Web: 590, Sonst: 640 }, { Nordwerk: 870, Holzbau Kessler: 810, "ohne Kunde": 910 }),
  m("Jan 26", false, 2540, 500, [], { Design: 760, AI: 640, Web: 600, Sonst: 640 }, { Nordwerk: 880, Holzbau Kessler: 820, "ohne Kunde": 920 }),
  m("Feb 26", false, 2540, 510, [], { Design: 760, AI: 650, Web: 600, Sonst: 650 }, { Nordwerk: 880, Holzbau Kessler: 825, "ohne Kunde": 925 }),
  m("Mär 26", false, 2560, 520, [], { Design: 770, AI: 660, Web: 605, Sonst: 655 }, { Nordwerk: 890, Holzbau Kessler: 830, "ohne Kunde": 940 }),
  m("Apr 26", false, 2560, 540, [], { Design: 770, AI: 680, Web: 610, Sonst: 660 }, { Nordwerk: 890, Holzbau Kessler: 840, "ohne Kunde": 950 }),
  m("Mai 26", false, 2580, 555, [], { Design: 780, AI: 695, Web: 615, Sonst: 665 }, { Nordwerk: 900, Holzbau Kessler: 845, "ohne Kunde": 960 }),
  m("Jun 26", false, 2580, 570, [], { Design: 780, AI: 710, Web: 625, Sonst: 670 }, { Nordwerk: 905, Holzbau Kessler: 850, "ohne Kunde": 970 }),
];

function m(
  label: string,
  ist: boolean,
  fix: number,
  variabel: number,
  ereignisse: { label: string; betrag: number }[],
  kategorien: Record<string, number>,
  kunden: Record<string, number>
): MonatDaten {
  return { label, ist, fix, variabel, ereignisse, kategorien, kunden };
}

const monatTotal = (d: MonatDaten) =>
  d.fix + d.variabel + d.ereignisse.reduce((s, e) => s + e.betrag, 0);

const euro = (n: number) =>
  n.toLocaleString("de-DE", { style: "currency", currency: "EUR" });

const kategorieFarben: Record<string, string> = {
  Design: "#6C5CE7",
  AI: "#FF7A66",
  Web: "#12B76A",
  Sonst: "#F5A623",
};
const kundenFarben: Record<string, string> = {
  Nordwerk: "#6C5CE7",
  Holzbau Kessler: "#FF7A66",
  "ohne Kunde": "#9CA3AF",
};

export function BudgetForecast() {
  const [view, setView] = useState<View>("gesamt");
  const [budget, setBudget] = useState(30000);
  const [whatIf, setWhatIf] = useState(false);
  const [budgetOffen, setBudgetOffen] = useState(false);
  const [katBudgets, setKatBudgets] = useState<Record<string, number>>({
    Design: 11000,
    AI: 7500,
    Web: 7000,
    Sonst: 7500,
  });
  const [hover, setHover] = useState<number | null>(null);

  const ersparnis = 1284;
  const monatsBudget = budget / 12;

  const totals = useMemo(() => monate.map(monatTotal), []);
  const totalsWhatIf = useMemo(
    () => totals.map((v, i) => (monate[i].ist ? v : v - ersparnis / 12)),
    [totals]
  );

  const aktuell = totals[3]; // Okt
  const forecastJahr = useMemo(() => {
    // nächste 12 Monate ab aktuellem Monat
    return totals.slice(3).reduce((s, v) => s + v, 0);
  }, [totals]);
  const forecastWhatIf = forecastJahr - ersparnis;
  const abweichung = forecastJahr - budget;

  const max = Math.max(...totals, budget / 12 * 1.4);

  return (
    <div className="space-y-6">
      {/* Kopf */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight">
            Budget & Forecast
          </h1>
          <p className="text-muted-foreground max-w-2xl mt-1">
            Was in den nächsten 12 Monaten auf dich zukommt. Inklusive
            Verlängerungen, Trials und angekündigten Preiserhöhungen.
          </p>
        </div>
        <Button variant="outline" className="gap-1.5" onClick={() => setBudgetOffen(true)}>
          <Edit3 className="size-4" /> Budget bearbeiten
        </Button>
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-3 rounded-2xl border border-border bg-card/60 px-4 py-3 text-sm">
        <Info className="size-4 text-primary mt-0.5 shrink-0" />
        <p className="text-muted-foreground">
          Forecast ist eine Projektion auf Basis deiner aktuellen Abos und
          bekannter Ereignisse. Variable Kosten sind Schätzungen, erkennbar am
          gestrichelten Anteil.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi icon={Wallet} label="Aktueller Monat" wert={euro(aktuell)} hint="Okt 2025" />
        <Kpi
          icon={TrendingUp}
          label="Forecast 12 Monate"
          wert={euro(whatIf ? forecastWhatIf : forecastJahr)}
          hint={whatIf ? "mit Sparvorschlägen" : "inkl. Ereignisse"}
          tone="violet"
        />
        <Kpi icon={PiggyBank} label="Jahresbudget" wert={euro(budget)} hint={`monatlich ${euro(monatsBudget)}`} />
        <Kpi
          icon={abweichung > 0 ? AlertTriangle : TrendingDown}
          label="Abweichung"
          wert={`${abweichung > 0 ? "+" : ""}${euro((whatIf ? forecastWhatIf : forecastJahr) - budget)}`}
          hint={(whatIf ? forecastWhatIf : forecastJahr) > budget ? "über Budget" : "unter Budget"}
          tone={(whatIf ? forecastWhatIf : forecastJahr) > budget ? "amber" : "emerald"}
        />
      </div>

      {/* Forecast-Diagramm */}
      <div className="rounded-3xl bg-card border border-border shadow-sm p-5">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <div className="font-display text-lg font-semibold">Forecast nächste 12 Monate</div>
            <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-3 flex-wrap">
              <span className="inline-flex items-center gap-1">
                <span className="inline-block size-2.5 rounded-sm bg-[#1F1D2B]" /> Ist
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="inline-block size-2.5 rounded-sm bg-primary/70" /> Forecast (fix)
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="inline-block size-2.5 rounded-sm border border-dashed border-primary bg-primary/20" />
                variabel (Schätzung)
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="inline-block w-4 h-0.5 bg-[#12B76A]" /> Budget
              </span>
            </div>
          </div>
          <div className="inline-flex rounded-full bg-muted p-0.5 text-xs font-medium">
            {([
              ["gesamt", "Gesamt"],
              ["fixVar", "Fix / Variabel"],
              ["kategorie", "Kategorie"],
              ["kunde", "Kunde"],
            ] as [View, string][]).map(([v, l]) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`rounded-full px-3 py-1.5 transition-colors ${
                  view === v ? "bg-card shadow text-foreground" : "text-muted-foreground"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Chart */}
        <div className="mt-6 relative h-72">
          {/* Budget-Linie */}
          <div
            className="absolute left-0 right-0 border-t-2 border-dashed border-[#12B76A]"
            style={{ bottom: `${(monatsBudget / max) * 100}%` }}
          >
            <span className="absolute -top-5 right-0 text-[11px] font-semibold text-[#12B76A]">
              Monatsbudget {euro(monatsBudget)}
            </span>
          </div>

          {/* Balken */}
          <div className="flex items-end gap-1.5 h-full pt-6">
            {monate.map((d, i) => {
              const totalNorm = totals[i];
              const totalUsed = whatIf && !d.ist ? totalsWhatIf[i] : totalNorm;
              const ueber = totalUsed > monatsBudget * 1.15;
              const leichtUeber = totalUsed > monatsBudget;
              const farbe = d.ist
                ? "#1F1D2B"
                : ueber
                ? "#F0533D"
                : leichtUeber
                ? "#F5A623"
                : "#6C5CE7";

              return (
                <div
                  key={d.label}
                  className="flex-1 flex flex-col items-center group relative"
                  onMouseEnter={() => setHover(i)}
                  onMouseLeave={() => setHover(null)}
                >
                  {/* Tooltip */}
                  {hover === i && (
                    <div className="absolute -top-2 -translate-y-full z-10 w-52 rounded-xl border border-border bg-card p-3 text-xs shadow-lg">
                      <div className="font-semibold mb-1">{d.label} {d.ist ? "(Ist)" : "(Forecast)"}</div>
                      <div className="space-y-0.5">
                        <Row label="Fix" wert={euro(d.fix)} />
                        <Row label="Variabel" wert={euro(d.variabel)} hint="Schätzung" />
                        {d.ereignisse.map((e, k) => (
                          <Row key={k} label={e.label} wert={euro(e.betrag)} tone="amber" />
                        ))}
                        <div className="border-t border-border pt-1 mt-1 flex justify-between font-semibold">
                          <span>Gesamt</span>
                          <span className="tabular-nums">{euro(totalUsed)}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Bar */}
                  <div className="w-full flex flex-col justify-end h-full">
                    {view === "gesamt" && (
                      <BarStack
                        items={[
                          { v: d.fix, color: farbe, opacity: d.ist ? 1 : 0.85 },
                          { v: d.variabel, color: farbe, opacity: d.ist ? 0.55 : 0.4, dashed: !d.ist },
                          ...d.ereignisse.map((e) => ({
                            v: e.betrag,
                            color: "#F5A623",
                            opacity: 0.9,
                          })),
                        ]}
                        max={max}
                        whatIfDelta={whatIf && !d.ist ? ersparnis / 12 : 0}
                      />
                    )}
                    {view === "fixVar" && (
                      <BarStack
                        items={[
                          { v: d.fix, color: "#6C5CE7", opacity: d.ist ? 1 : 0.85 },
                          { v: d.variabel, color: "#FF7A66", opacity: d.ist ? 1 : 0.7, dashed: !d.ist },
                          ...d.ereignisse.map((e) => ({ v: e.betrag, color: "#F5A623", opacity: 0.9 })),
                        ]}
                        max={max}
                        whatIfDelta={whatIf && !d.ist ? ersparnis / 12 : 0}
                      />
                    )}
                    {view === "kategorie" && (
                      <BarStack
                        items={Object.entries(d.kategorien).map(([k, v]) => ({
                          v,
                          color: kategorieFarben[k],
                          opacity: d.ist ? 1 : 0.8,
                          dashed: !d.ist && k === "AI",
                        }))}
                        max={max}
                        whatIfDelta={whatIf && !d.ist ? ersparnis / 12 : 0}
                      />
                    )}
                    {view === "kunde" && (
                      <BarStack
                        items={Object.entries(d.kunden).map(([k, v]) => ({
                          v,
                          color: kundenFarben[k],
                          opacity: d.ist ? 1 : 0.8,
                        }))}
                        max={max}
                        whatIfDelta={whatIf && !d.ist ? ersparnis / 12 : 0}
                      />
                    )}
                  </div>
                  <div className={`mt-2 text-[10px] font-medium ${d.ist ? "text-foreground" : "text-muted-foreground"}`}>
                    {d.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Legende Kategorie/Kunde */}
        {(view === "kategorie" || view === "kunde") && (
          <div className="mt-4 flex flex-wrap gap-3 text-xs">
            {Object.entries(view === "kategorie" ? kategorieFarben : kundenFarben).map(([k, c]) => (
              <span key={k} className="inline-flex items-center gap-1.5">
                <span className="inline-block size-2.5 rounded-sm" style={{ background: c }} /> {k}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Budget + What-if */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl bg-card border border-border shadow-sm p-5 hover:-translate-y-0.5 hover:shadow-md transition-all">
          <div className="flex items-center gap-2">
            <PiggyBank className="size-5 text-primary" />
            <div className="font-display text-lg font-semibold">Budget</div>
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">
            Jahresbudget setzen und pro Kategorie verteilen.
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Jahresbudget</Label>
              <Input
                type="number"
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value) || 0)}
                className="mt-1 tabular-nums"
              />
            </div>
            <div>
              <Label className="text-xs">Monatsbudget</Label>
              <Input value={euro(monatsBudget)} disabled className="mt-1 tabular-nums" />
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {Object.entries(katBudgets).map(([k, v]) => {
              const ist = monate.slice(3).reduce((s, x) => s + (x.kategorien[k] ?? 0), 0);
              const pct = Math.min(100, Math.round((ist / v) * 100));
              const ueber = ist > v;
              return (
                <div key={k}>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span
                        className="size-2.5 rounded-sm"
                        style={{ background: kategorieFarben[k] }}
                      />
                      <span className="font-medium">{k}</span>
                    </div>
                    <div className="text-xs text-muted-foreground tabular-nums">
                      {euro(ist)} / {euro(v)}
                    </div>
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full transition-all"
                        style={{
                          width: `${Math.min(100, (ist / v) * 100)}%`,
                          background: ueber ? "#F0533D" : kategorieFarben[k],
                        }}
                      />
                    </div>
                    <input
                      type="number"
                      value={v}
                      onChange={(e) =>
                        setKatBudgets((b) => ({ ...b, [k]: Number(e.target.value) || 0 }))
                      }
                      className="w-20 h-7 rounded-md border border-border bg-background px-2 text-xs tabular-nums"
                    />
                  </div>
                  {ueber && (
                    <div className="mt-1 text-[11px] text-[#B45309]">{pct}% vom Budget verbraucht</div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-4 rounded-2xl border border-border bg-background/60 p-3 text-xs text-muted-foreground">
            <div className="font-semibold text-foreground mb-1">Budget wird gerissen in:</div>
            <div className="flex flex-wrap gap-1.5">
              {monate
                .slice(3)
                .map((d, i) => ({ d, total: totals[3 + i] }))
                .filter(({ total }) => total > monatsBudget)
                .map(({ d, total }) => (
                  <span
                    key={d.label}
                    className="inline-flex items-center gap-1 rounded-full bg-[#FFF6E5] border border-[#F5A623]/40 px-2 py-0.5 text-[11px] font-semibold text-[#B45309]"
                  >
                    {d.label} · +{euro(total - monatsBudget)}
                  </span>
                ))}
            </div>
          </div>
        </div>

        <div className="rounded-3xl bg-card border border-border shadow-sm p-5 hover:-translate-y-0.5 hover:shadow-md transition-all">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="size-5 text-primary" />
              <div>
                <div className="font-display text-lg font-semibold">What-if</div>
                <div className="text-xs text-muted-foreground">
                  Was passiert, wenn du die Sparvorschläge umsetzt?
                </div>
              </div>
            </div>
            <Switch checked={whatIf} onCheckedChange={setWhatIf} />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-muted/40 border border-border p-3">
              <div className="text-xs text-muted-foreground">Aktuell</div>
              <div className="font-display text-xl font-bold tabular-nums mt-0.5">
                {euro(forecastJahr)}
              </div>
              <div className="text-[11px] text-muted-foreground">pro Jahr</div>
            </div>
            <div
              className={`rounded-2xl border p-3 ${
                whatIf
                  ? "bg-[#ECFDF3] border-[#12B76A]/40"
                  : "bg-background/60 border-dashed border-border"
              }`}
            >
              <div className="text-xs text-muted-foreground">Mit Sparvorschlägen</div>
              <div
                className={`font-display text-xl font-bold tabular-nums mt-0.5 ${
                  whatIf ? "text-[#067647]" : ""
                }`}
              >
                {euro(forecastWhatIf)}
              </div>
              <div className="text-[11px] text-muted-foreground">
                spart {euro(ersparnis)} pro Jahr
              </div>
            </div>
          </div>

          <Link
            to={"/sparvorschlaege" as "/"}
            className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            Sparvorschläge ansehen <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>

      {/* Forecast-Treiber */}
      <div className="rounded-3xl bg-card border border-border shadow-sm p-5">
        <div className="flex items-center gap-2">
          <Calendar className="size-5 text-primary" />
          <div>
            <div className="font-display text-lg font-semibold">Forecast-Treiber</div>
            <div className="text-xs text-muted-foreground">
              Ereignisse, die deinen Forecast über das reine Hochrechnen hinaus
              bewegen.
            </div>
          </div>
        </div>

        <div className="mt-4 divide-y divide-border">
          <TreiberRow
            monat="November 2025"
            icon={Tag}
            tone="amber"
            titel="Adobe Creative Cloud Jahresverlängerung"
            text="Einmalig +720,00 € in diesem Monat."
            link={{ to: "/fristen", label: "im Fristen-Wächter" }}
          />
          <TreiberRow
            monat="Dezember 2025"
            icon={Tag}
            tone="amber"
            titel="Canva Pro Jahresverlängerung"
            text="Einmalig +119,00 € in diesem Monat."
            link={{ to: "/fristen", label: "im Fristen-Wächter" }}
          />
          <TreiberRow
            monat="August 2025"
            icon={Sparkles}
            tone="violet"
            titel="Framer-Trial wird kostenpflichtig"
            text="Wiederkehrend +29,00 € pro Monat."
            link={{ to: "/fristen", label: "Trial ansehen" }}
          />
          <TreiberRow
            monat="September 2025"
            icon={TrendingUp}
            tone="amber"
            titel="Notion Preiserhöhung +18%"
            text="Erkannt aus Anbieter-Mitteilung."
            link={{ to: "/benachrichtigungen", label: "Benachrichtigung öffnen" }}
          />
          <TreiberRow
            monat="laufend"
            icon={Zap}
            tone="koralle"
            titel="Variable KI-Kosten geschätzt steigend"
            text="Schätzung auf Basis der letzten 60 Tage."
            link={{ to: "/ai-credits", label: "AI-Kosten ansehen" }}
          />
        </div>
      </div>

      {/* Budget Dialog */}
      <Dialog open={budgetOffen} onOpenChange={setBudgetOffen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Jahresbudget bearbeiten</DialogTitle>
            <DialogDescription>
              Setze dein Jahresbudget. Wir leiten daraus dein Monatsbudget ab.
            </DialogDescription>
          </DialogHeader>
          <div>
            <Label className="text-xs">Jahresbudget</Label>
            <Input
              type="number"
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value) || 0)}
              className="mt-1 tabular-nums"
            />
            <div className="mt-1 text-xs text-muted-foreground">
              Monatsbudget: {euro(monatsBudget)}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBudgetOffen(false)}>
              Abbrechen
            </Button>
            <Button
              onClick={() => {
                setBudgetOffen(false);
                toast.success("Budget aktualisiert");
              }}
            >
              Speichern
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function BarStack({
  items,
  max,
  whatIfDelta,
}: {
  items: { v: number; color: string; opacity?: number; dashed?: boolean }[];
  max: number;
  whatIfDelta: number;
}) {
  const total = items.reduce((s, x) => s + x.v, 0) - whatIfDelta;
  const heightPct = (total / max) * 100;
  return (
    <div
      className="w-full flex flex-col justify-end rounded-md overflow-hidden transition-all"
      style={{ height: `${heightPct}%`, minHeight: 4 }}
    >
      {items.map((it, i) => {
        const share = (it.v / items.reduce((s, x) => s + x.v, 0)) * 100;
        return (
          <div
            key={i}
            style={{
              height: `${share}%`,
              background: it.color,
              opacity: it.opacity ?? 1,
              borderTop: it.dashed ? `1px dashed rgba(255,255,255,0.6)` : undefined,
            }}
          />
        );
      })}
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
  tone?: "violet" | "amber" | "emerald";
}) {
  const toneClass =
    tone === "amber"
      ? "text-[#B45309]"
      : tone === "emerald"
      ? "text-[#067647]"
      : tone === "violet"
      ? "text-primary"
      : "text-foreground";
  return (
    <div className="rounded-3xl bg-card border border-border shadow-sm p-4 hover:-translate-y-0.5 hover:shadow-md transition-all">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className="size-3.5" /> {label}
      </div>
      <div className={`mt-1 font-display text-2xl font-semibold tabular-nums ${toneClass}`}>
        {wert}
      </div>
      {hint && <div className="text-[11px] text-muted-foreground mt-0.5">{hint}</div>}
    </div>
  );
}

function Row({
  label,
  wert,
  hint,
  tone,
}: {
  label: string;
  wert: string;
  hint?: string;
  tone?: "amber";
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className={`truncate ${tone === "amber" ? "text-[#B45309]" : "text-muted-foreground"}`}>
        {label}
        {hint && <span className="text-[10px] ml-1">({hint})</span>}
      </span>
      <span className="tabular-nums font-medium">{wert}</span>
    </div>
  );
}

function TreiberRow({
  monat,
  icon: Icon,
  tone,
  titel,
  text,
  link,
}: {
  monat: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: "amber" | "violet" | "koralle";
  titel: string;
  text: string;
  link: { to: string; label: string };
}) {
  const toneClass = {
    amber: "bg-[#FFF6E5] text-[#B45309]",
    violet: "bg-primary/10 text-primary",
    koralle: "bg-[#FFF1EE] text-[#C2410C]",
  }[tone];
  return (
    <div className="flex items-start gap-3 py-3 first:pt-0 last:pb-0 flex-wrap">
      <div className={`size-9 rounded-xl grid place-items-center shrink-0 ${toneClass}`}>
        <Icon className="size-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">{monat}</div>
        <div className="text-sm font-semibold">{titel}</div>
        <div className="text-xs text-muted-foreground">{text}</div>
      </div>
      <Link
        to={link.to as "/"}
        className="text-xs font-medium text-primary hover:underline inline-flex items-center gap-1"
      >
        {link.label} <ArrowRight className="size-3" />
      </Link>
    </div>
  );
}
