import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Users,
  Shield,
  Sliders,
  HelpCircle,
  ArrowRight,
  BarChart3,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const eur = (n: number) =>
  n.toLocaleString("de-DE", { style: "currency", currency: "EUR" });

type Status = "ueber" | "neutral" | "unter" | "wenig";

interface ToolBench {
  id: string;
  name: string;
  initials: string;
  color: string;
  kategorieId: string;
  kategorieLabel: string;
  kategorieColor: string;
  mein: number | null;
  median: number | null;
  stichprobe: number; // 0 = zu wenig
  aboId?: string;
}

const initialTools: ToolBench[] = [
  {
    id: "calendly",
    name: "Calendly",
    initials: "C",
    color: "#12B76A",
    kategorieId: "termine",
    kategorieLabel: "Termine",
    kategorieColor: "#12B76A",
    mein: 16,
    median: 12,
    stichprobe: 180,
    aboId: "calendly",
  },
  {
    id: "figma",
    name: "Figma",
    initials: "F",
    color: "#FF7A66",
    kategorieId: "design",
    kategorieLabel: "Design",
    kategorieColor: "#FF7A66",
    mein: 45,
    median: 38,
    stichprobe: 212,
    aboId: "figma",
  },
  {
    id: "adobe",
    name: "Adobe Creative Cloud",
    initials: "A",
    color: "#E84E1B",
    kategorieId: "design",
    kategorieLabel: "Design",
    kategorieColor: "#FF7A66",
    mein: 60,
    median: 66,
    stichprobe: 196,
    aboId: "adobe-cc",
  },
  {
    id: "notion",
    name: "Notion",
    initials: "N",
    color: "#1F1D2B",
    kategorieId: "produktivitaet",
    kategorieLabel: "Produktivität",
    kategorieColor: "#6C5CE7",
    mein: 96,
    median: 110,
    stichprobe: 224,
    aboId: "notion",
  },
  {
    id: "ahrefs",
    name: "Ahrefs",
    initials: "A",
    color: "#0F4C81",
    kategorieId: "seo",
    kategorieLabel: "SEO",
    kategorieColor: "#12B76A",
    mein: 199,
    median: 199,
    stichprobe: 134,
    aboId: "ahrefs",
  },
  {
    id: "screaming-frog",
    name: "Screaming Frog",
    initials: "S",
    color: "#1F1D2B",
    kategorieId: "seo",
    kategorieLabel: "SEO",
    kategorieColor: "#12B76A",
    mein: 17,
    median: null,
    stichprobe: 0,
    aboId: "screaming-frog",
  },
];

interface KategorieBench {
  id: string;
  label: string;
  color: string;
  mein: number;
  median: number;
}

const initialKategorien: KategorieBench[] = [
  { id: "design", label: "Design", color: "#FF7A66", mein: 105, median: 104 },
  { id: "produktivitaet", label: "Produktivität", color: "#6C5CE7", mein: 96, median: 110 },
  { id: "seo", label: "SEO", color: "#12B76A", mein: 216, median: 215 },
  { id: "ai", label: "KI / API", color: "#6C5CE7", mein: 654, median: 780 },
  { id: "kommunikation", label: "Kommunikation", color: "#F5A623", mein: 87, median: 92 },
  { id: "termine", label: "Termine", color: "#12B76A", mein: 16, median: 12 },
];

const statusOf = (t: ToolBench): Status => {
  if (t.median === null || t.stichprobe === 0) return "wenig";
  if (t.mein === null) return "wenig";
  const diff = t.mein - t.median;
  if (Math.abs(diff) / t.median < 0.03) return "neutral";
  return diff > 0 ? "ueber" : "unter";
};

function Pill({ tone, children }: { tone: "emerald" | "amber" | "muted" | "primary"; children: React.ReactNode }) {
  const map = {
    emerald: "bg-emerald-500/12 text-emerald-700",
    amber: "bg-amber-500/15 text-amber-700",
    muted: "bg-muted text-muted-foreground",
    primary: "bg-primary/12 text-primary",
  } as const;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${map[tone]}`}>
      {children}
    </span>
  );
}

function ToolTile({ initials, color, size = 40 }: { initials: string; color: string; size?: number }) {
  return (
    <div
      className="rounded-xl grid place-items-center font-display font-bold text-white shrink-0"
      style={{ background: color, width: size, height: size, fontSize: size * 0.42 }}
    >
      {initials}
    </div>
  );
}

// ---------- Hero comparison ----------
function HeroVergleich({
  mein,
  median,
  jahr,
}: {
  mein: number;
  median: number;
  jahr: number;
}) {
  const diff = mein - median;
  const ueber = diff > 0;
  const max = Math.max(mein, median) * 1.1;
  const meinPct = (mein / max) * 100;
  const medianPct = (median / max) * 100;

  const tone = ueber ? "amber" : "emerald";

  return (
    <div className="rounded-3xl border border-border bg-card p-5 sm:p-7 shadow-sm">
      <div className="grid lg:grid-cols-[1.2fr_1fr] gap-6 lg:gap-10 items-center">
        <div>
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Stack-Vergleich pro Monat
          </div>
          <div className="mt-3 space-y-4">
            <div>
              <div className="flex items-baseline justify-between text-sm mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="size-2.5 rounded-full bg-primary" />
                  <span className="font-medium">Dein Stack</span>
                </div>
                <span className="font-display text-lg font-semibold tabular-nums">{eur(mein)}</span>
              </div>
              <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-700"
                  style={{ width: `${meinPct}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-baseline justify-between text-sm mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="size-2.5 rounded-full bg-muted-foreground/50" />
                  <span className="font-medium">Median vergleichbarer Agenturen</span>
                </div>
                <span className="font-display text-lg font-semibold tabular-nums">{eur(median)}</span>
              </div>
              <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-muted-foreground/40 transition-all duration-700"
                  style={{ width: `${medianPct}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div
          className={`rounded-3xl p-5 sm:p-6 ${
            ueber ? "bg-amber-500/8 border border-amber-500/20" : "bg-emerald-500/8 border border-emerald-500/20"
          }`}
        >
          <div className={`inline-flex items-center gap-1.5 text-xs font-semibold ${ueber ? "text-amber-700" : "text-emerald-700"}`}>
            {ueber ? <TrendingUp className="size-3.5" /> : <TrendingDown className="size-3.5" />}
            {ueber ? "Über dem Median" : "Unter dem Median"}
          </div>
          <div className="mt-2 font-display text-3xl sm:text-4xl font-semibold tracking-tight tabular-nums">
            {ueber ? "+" : "−"}
            {eur(Math.abs(diff))}
          </div>
          <div className="text-sm text-muted-foreground">pro Monat</div>
          <div className={`mt-2 text-xs font-medium ${ueber ? "text-amber-700" : "text-emerald-700"} tabular-nums`}>
            das sind {ueber ? "" : "−"}
            {eur(Math.abs(jahr))} pro Jahr
          </div>
          {ueber ? (
            <div className="mt-4 text-xs text-muted-foreground">
              Ein Teil davon ist vermeidbar.{" "}
              <Link to="/sparvorschlaege" className="font-semibold text-primary hover:underline inline-flex items-center gap-1">
                Sparvorschläge ansehen <ArrowRight className="size-3" />
              </Link>
            </div>
          ) : (
            <div className="mt-4 text-xs text-emerald-800/80">
              Stark. Du wirtschaftest schlanker als der Markt.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------- Vergleichsgruppen-Card ----------
interface Gruppe {
  groesse: "1-5" | "5-15" | "15-50" | "50+";
  branche: "agentur" | "saas" | "freelance";
  region: "dach" | "eu" | "global";
  stichprobe: number;
}

const groessenLabel = { "1-5": "1 bis 5", "5-15": "5 bis 15", "15-50": "15 bis 50", "50+": "50+" } as const;
const branchenLabel = { agentur: "Agenturen", saas: "SaaS-Unternehmen", freelance: "Freelancer" } as const;
const regionLabel = { dach: "DACH", eu: "EU", global: "weltweit" } as const;

function GruppenCard({
  g,
  onOpen,
}: {
  g: Gruppe;
  onOpen: () => void;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="size-10 rounded-xl bg-primary/10 grid place-items-center text-primary shrink-0">
            <Users className="size-5" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Vergleichsgruppe
            </div>
            <div className="font-display text-base sm:text-lg font-semibold mt-0.5">
              {branchenLabel[g.branche]}, {groessenLabel[g.groesse]} Mitarbeiter, {regionLabel[g.region]}
            </div>
            <div className="text-xs text-muted-foreground mt-1 tabular-nums">
              Median aus {g.stichprobe} {branchenLabel[g.branche].toLowerCase()}
            </div>
          </div>
        </div>
        <Button size="sm" variant="outline" onClick={onOpen} className="gap-1.5 shrink-0">
          <Sliders className="size-3.5" /> Anpassen
        </Button>
      </div>
    </div>
  );
}

function GruppenSheet({
  open,
  onClose,
  g,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  g: Gruppe;
  onSave: (g: Gruppe) => void;
}) {
  const [groesse, setGroesse] = useState(g.groesse);
  const [branche, setBranche] = useState(g.branche);
  const [region, setRegion] = useState(g.region);

  const save = () => {
    // simulate stichprobe based on filters
    const base = 240;
    const factor = (groesse === "5-15" ? 1 : 0.7) * (region === "dach" ? 1 : 0.6) * (branche === "agentur" ? 1 : 0.6);
    const stichprobe = Math.max(28, Math.round(base * factor));
    onSave({ groesse, branche, region, stichprobe });
    toast.success("Vergleichsgruppe aktualisiert", {
      description: `${branchenLabel[branche]}, ${groessenLabel[groesse]} Mitarbeiter, ${regionLabel[region]}`,
    });
    onClose();
  };

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="font-display text-xl">Vergleichsgruppe anpassen</SheetTitle>
          <SheetDescription>
            Je präziser die Gruppe, desto belastbarer der Median. Bei zu wenigen Daten wird das transparent angezeigt.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-4">
          <div>
            <Label className="text-xs">Mitarbeiterzahl</Label>
            <Select value={groesse} onValueChange={(v) => setGroesse(v as Gruppe["groesse"])}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1-5">1 bis 5</SelectItem>
                <SelectItem value="5-15">5 bis 15</SelectItem>
                <SelectItem value="15-50">15 bis 50</SelectItem>
                <SelectItem value="50+">50+</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Branche</Label>
            <Select value={branche} onValueChange={(v) => setBranche(v as Gruppe["branche"])}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="agentur">Agenturen</SelectItem>
                <SelectItem value="saas">SaaS-Unternehmen</SelectItem>
                <SelectItem value="freelance">Freelancer</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Region</Label>
            <Select value={region} onValueChange={(v) => setRegion(v as Gruppe["region"])}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dach">DACH</SelectItem>
                <SelectItem value="eu">EU</SelectItem>
                <SelectItem value="global">weltweit</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={save} className="w-full">
            Übernehmen
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ---------- Pro Tool Row ----------
function ToolRow({ t }: { t: ToolBench }) {
  const status = statusOf(t);
  const diff = t.mein !== null && t.median !== null ? t.mein - t.median : 0;
  const pct = t.median ? Math.round((diff / t.median) * 100) : 0;
  const max = Math.max(t.mein ?? 0, t.median ?? 0) * 1.25 || 1;
  const meinPct = ((t.mein ?? 0) / max) * 100;
  const medianPct = ((t.median ?? 0) / max) * 100;

  const statusConf = {
    ueber: {
      pill: <Pill tone="amber"><TrendingUp className="size-3" /> Über Median</Pill>,
      text: "text-amber-700",
      bar: "bg-amber-500",
    },
    unter: {
      pill: <Pill tone="emerald"><TrendingDown className="size-3" /> Unter Median</Pill>,
      text: "text-emerald-700",
      bar: "bg-emerald-500",
    },
    neutral: {
      pill: <Pill tone="muted"><Minus className="size-3" /> Auf Marktniveau</Pill>,
      text: "text-muted-foreground",
      bar: "bg-muted-foreground/50",
    },
    wenig: {
      pill: <Pill tone="muted"><HelpCircle className="size-3" /> Zu wenig Daten</Pill>,
      text: "text-muted-foreground",
      bar: "bg-muted-foreground/30",
    },
  }[status];

  return (
    <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start gap-3 sm:gap-4">
        <ToolTile initials={t.initials} color={t.color} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="font-display text-base font-semibold truncate">{t.name}</div>
            <span
              className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
              style={{ background: `${t.kategorieColor}1f`, color: t.kategorieColor }}
            >
              {t.kategorieLabel}
            </span>
            {statusConf.pill}
          </div>

          {status !== "wenig" ? (
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 sm:gap-6 items-center">
              <div className="space-y-1.5 max-w-md">
                <div className="flex items-baseline justify-between text-xs">
                  <span className="text-muted-foreground">Du zahlst</span>
                  <span className="font-display text-sm font-semibold tabular-nums">{eur(t.mein!)}</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-primary transition-all duration-700" style={{ width: `${meinPct}%` }} />
                </div>
                <div className="flex items-baseline justify-between text-xs">
                  <span className="text-muted-foreground">Median</span>
                  <span className="font-medium tabular-nums">{eur(t.median!)}</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div className={`h-full ${statusConf.bar} transition-all duration-700`} style={{ width: `${medianPct}%` }} />
                </div>
              </div>

              <div className="sm:text-right">
                <div className={`font-display text-xl font-semibold tabular-nums ${statusConf.text}`}>
                  {diff > 0 ? "+" : diff < 0 ? "−" : ""}
                  {eur(Math.abs(diff))}
                </div>
                <div className={`text-xs ${statusConf.text}`}>
                  {pct > 0 ? `+${pct}` : pct}% {diff > 0 ? "mehr" : diff < 0 ? "weniger" : "Differenz"}
                </div>
                <div className="text-[11px] text-muted-foreground mt-1 tabular-nums">
                  Median aus {t.stichprobe} Agenturen
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-3 rounded-xl bg-muted/40 px-3 py-2.5 text-xs text-muted-foreground flex items-start gap-2">
              <HelpCircle className="size-3.5 mt-0.5 shrink-0" />
              <span>
                Für {t.name} liegen noch zu wenige Vergleichsdaten vor. Wir zeigen erst einen Median, sobald
                die Stichprobe groß genug ist.
              </span>
            </div>
          )}

          {status === "ueber" && (
            <div className="mt-3 flex flex-wrap gap-2">
              <Button asChild size="sm" variant="outline">
                <Link to="/verzeichnis">Tarife vergleichen</Link>
              </Button>
              <Button asChild size="sm" variant="ghost">
                <Link to="/sparvorschlaege">
                  Alternative ansehen <ArrowRight className="size-3.5" />
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------- Kategorie Diagramm ----------
function KategorieDiagramm({ items }: { items: KategorieBench[] }) {
  const max = Math.max(...items.flatMap((i) => [i.mein, i.median])) * 1.15;
  return (
    <div className="rounded-3xl border border-border bg-card p-5 sm:p-6 shadow-sm">
      <div className="flex items-end justify-between mb-4">
        <div>
          <h2 className="font-display text-lg font-semibold tracking-tight inline-flex items-center gap-2">
            <BarChart3 className="size-4 text-primary" /> Pro Kategorie
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Deine Ausgaben gegen den Median, pro Monat
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-3 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-primary" /> Du
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-muted-foreground/50" /> Median
          </span>
        </div>
      </div>
      <div className="overflow-x-auto -mx-2">
        <div className="px-2 min-w-[520px] space-y-4">
          {items.map((k) => {
            const diff = k.mein - k.median;
            const ueber = diff > 0;
            const neutralish = Math.abs(diff) / k.median < 0.03;
            return (
              <div key={k.id}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="text-sm font-medium flex items-center gap-2">
                    <span className="size-2 rounded-full" style={{ background: k.color }} />
                    {k.label}
                  </div>
                  <div className={`text-xs font-medium tabular-nums ${neutralish ? "text-muted-foreground" : ueber ? "text-amber-700" : "text-emerald-700"}`}>
                    {neutralish ? "auf Niveau" : `${ueber ? "+" : "−"}${eur(Math.abs(diff))}`}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-700"
                        style={{ width: `${(k.mein / max) * 100}%` }}
                      />
                    </div>
                    <div className="w-20 text-right text-xs tabular-nums font-medium">{eur(k.mein)}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-muted-foreground/40 transition-all duration-700"
                        style={{ width: `${(k.median / max) * 100}%` }}
                      />
                    </div>
                    <div className="w-20 text-right text-xs tabular-nums text-muted-foreground">{eur(k.median)}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ---------- Main ----------
export function Benchmark() {
  const [gruppe, setGruppe] = useState<Gruppe>({
    groesse: "5-15",
    branche: "agentur",
    region: "dach",
    stichprobe: 240,
  });
  const [gruppenOpen, setGruppenOpen] = useState(false);

  const tools = useMemo(() => {
    // simulate slight shifts based on group selection
    const scale =
      (gruppe.groesse === "1-5" ? 0.92 : gruppe.groesse === "15-50" ? 1.08 : gruppe.groesse === "50+" ? 1.18 : 1) *
      (gruppe.region === "global" ? 0.95 : 1);
    return initialTools.map((t) =>
      t.median === null ? t : { ...t, median: Math.round(t.median * scale * 100) / 100 },
    );
  }, [gruppe]);

  const sortedTools = useMemo(() => {
    return [...tools].sort((a, b) => {
      const sa = statusOf(a);
      const sb = statusOf(b);
      const rank = (s: Status) => (s === "ueber" ? 0 : s === "neutral" ? 1 : s === "unter" ? 2 : 3);
      if (rank(sa) !== rank(sb)) return rank(sa) - rank(sb);
      const da = a.mein && a.median ? a.mein - a.median : -Infinity;
      const db = b.mein && b.median ? b.mein - b.median : -Infinity;
      return db - da;
    });
  }, [tools]);

  const meinGesamt = 2480;
  const medianGesamt = useMemo(() => {
    const scale =
      (gruppe.groesse === "1-5" ? 0.92 : gruppe.groesse === "15-50" ? 1.08 : gruppe.groesse === "50+" ? 1.18 : 1) *
      (gruppe.region === "global" ? 0.95 : 1);
    return Math.round(2210 * scale);
  }, [gruppe]);

  const jahr = (meinGesamt - medianGesamt) * 12;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight">
          Benchmark
        </h1>
        <p className="mt-1 text-sm text-muted-foreground max-w-xl">
          So zahlst du im Vergleich zu ähnlichen Agenturen.
        </p>
      </div>

      <HeroVergleich mein={meinGesamt} median={medianGesamt} jahr={jahr} />

      <GruppenCard g={gruppe} onOpen={() => setGruppenOpen(true)} />

      <section>
        <div className="flex items-end justify-between mb-3">
          <div>
            <h2 className="font-display text-lg font-semibold tracking-tight inline-flex items-center gap-2">
              <Sparkles className="size-4 text-primary" /> Pro Tool
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Sortiert nach größter Mehrzahlung
            </p>
          </div>
        </div>
        <div className="space-y-3">
          {sortedTools.map((t) => (
            <ToolRow key={t.id} t={t} />
          ))}
        </div>
      </section>

      <KategorieDiagramm items={initialKategorien} />

      <div className="rounded-3xl border border-border bg-card p-5 shadow-sm flex items-start gap-3">
        <div className="size-9 rounded-xl bg-emerald-500/15 grid place-items-center text-emerald-600 shrink-0">
          <Shield className="size-4" />
        </div>
        <div className="text-sm text-foreground/80">
          <div className="font-display font-semibold text-foreground">Anonym und gegenseitig</div>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            Deine Daten fließen anonymisiert in den Vergleich ein, genauso profitierst du von den Daten anderer.
            Einzelne Agenturen sind nie erkennbar. Alle Werte sind Schätzwerte aus aggregierten Abrechnungsdaten
            und keine garantierten Preise.
          </p>
        </div>
      </div>

      <GruppenSheet
        open={gruppenOpen}
        onClose={() => setGruppenOpen(false)}
        g={gruppe}
        onSave={setGruppe}
      />
    </div>
  );
}
