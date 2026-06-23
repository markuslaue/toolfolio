import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  AlarmClock,
  CalendarDays,
  ListOrdered,
  Bell,
  CreditCard,
  RefreshCw,
  TimerReset,
  ChevronLeft,
  ChevronRight,
  Check,
  FileSignature,
  Eye,
  Filter,
  ShieldCheck,
  CalendarCheck,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { fmtEUR } from "@/lib/toolfolio-data";

type FristTyp = "kuendigung" | "verlaengerung" | "trial" | "karte";
type Status = "offen" | "behalten" | "erledigt";

interface Frist {
  id: string;
  typ: FristTyp;
  tool: { name: string; farbe: string };
  kunde?: string;
  datum: string; // ISO YYYY-MM-DD
  jahreswert?: number; // € pro Jahr
  monatswert?: number; // für Trial
  konsequenz: string;
  erinnerungTage: number;
  status: Status;
}

const HEUTE = new Date("2026-07-23"); // fester Mock-Bezug

const INITIAL: Frist[] = [
  {
    id: "f1",
    typ: "trial",
    tool: { name: "Framer", farbe: "#0055ff" },
    datum: "2026-07-26",
    monatswert: 29,
    konsequenz: "Trial endet, danach kostenpflichtig mit 29,00 € pro Monat (348,00 € pro Jahr).",
    jahreswert: 348,
    erinnerungTage: 2,
    status: "offen",
  },
  {
    id: "f2",
    typ: "kuendigung",
    tool: { name: "Ahrefs", farbe: "#0070f3" },
    kunde: "Kessler",
    datum: "2026-08-14",
    jahreswert: 1188,
    konsequenz: "Kündbar bis 14.08.2026, sonst Verlängerung um 12 Monate (1.188,00 € pro Jahr).",
    erinnerungTage: 14,
    status: "offen",
  },
  {
    id: "f3",
    typ: "karte",
    tool: { name: "Mastercard •••• 7093", farbe: "#1f1d2b" },
    datum: "2026-08-31",
    jahreswert: 720,
    konsequenz: "Karte läuft ab, betrifft 4 Abos mit zusammen 720,00 € Jahreswert.",
    erinnerungTage: 30,
    status: "offen",
  },
  {
    id: "f4",
    typ: "kuendigung",
    tool: { name: "Screaming Frog", farbe: "#0f1419" },
    kunde: "Kessler",
    datum: "2026-09-01",
    jahreswert: 239,
    konsequenz: "Kündbar bis 01.09.2026, sonst Verlängerung um 12 Monate (239,00 € pro Jahr).",
    erinnerungTage: 14,
    status: "offen",
  },
  {
    id: "f5",
    typ: "verlaengerung",
    tool: { name: "Adobe Creative Cloud", farbe: "#d83b01" },
    datum: "2026-11-12",
    jahreswert: 720,
    konsequenz: "Jahresvertrag verlängert sich am 12.11.2026 automatisch (720,00 € pro Jahr).",
    erinnerungTage: 30,
    status: "offen",
  },
  {
    id: "f6",
    typ: "verlaengerung",
    tool: { name: "Canva Teams", farbe: "#00c4cc" },
    datum: "2026-12-02",
    jahreswert: 156,
    konsequenz: "Jahresabo verlängert sich am 02.12.2026 automatisch (156,00 € pro Jahr).",
    erinnerungTage: 14,
    status: "offen",
  },
];

const TYP_META: Record<FristTyp, { label: string; icon: typeof AlarmClock; bg: string; fg: string }> = {
  kuendigung: { label: "Kündigungsfrist", icon: AlarmClock, bg: "bg-amber-100", fg: "text-amber-700" },
  verlaengerung: {
    label: "Vertragsverlängerung",
    icon: RefreshCw,
    bg: "bg-violet-100",
    fg: "text-violet-700",
  },
  trial: { label: "Trial-Ende", icon: TimerReset, bg: "bg-rose-100", fg: "text-rose-700" },
  karte: { label: "Karte läuft ab", icon: CreditCard, bg: "bg-amber-100", fg: "text-amber-700" },
};

function parseDate(iso: string) {
  return new Date(iso + "T00:00:00");
}
function fmtDate(iso: string) {
  const d = parseDate(iso);
  return d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
}
function daysUntil(iso: string) {
  const ms = parseDate(iso).getTime() - HEUTE.getTime();
  return Math.round(ms / 86400000);
}
function urgency(iso: string): "ueberfaellig" | "sehrbald" | "bald" | "weiter" {
  const d = daysUntil(iso);
  if (d < 0) return "ueberfaellig";
  if (d <= 7) return "sehrbald";
  if (d <= 30) return "bald";
  return "weiter";
}
function urgencyMeta(u: ReturnType<typeof urgency>) {
  switch (u) {
    case "ueberfaellig":
      return { label: "überfällig", text: "text-rose-700", chip: "bg-rose-100 text-rose-700", dot: "bg-rose-600" };
    case "sehrbald":
      return { label: "sehr bald", text: "text-rose-700", chip: "bg-rose-100 text-rose-700", dot: "bg-rose-600" };
    case "bald":
      return { label: "bald", text: "text-amber-700", chip: "bg-amber-100 text-amber-700", dot: "bg-amber-500" };
    case "weiter":
      return { label: "weiter weg", text: "text-muted-foreground", chip: "bg-muted text-muted-foreground", dot: "bg-muted-foreground/60" };
  }
}
function countdownLabel(iso: string) {
  const d = daysUntil(iso);
  if (d < 0) return `überfällig seit ${Math.abs(d)} ${Math.abs(d) === 1 ? "Tag" : "Tagen"}`;
  if (d === 0) return "heute";
  if (d === 1) return "morgen";
  return `in ${d} Tagen`;
}
function monatLabel(iso: string) {
  return parseDate(iso).toLocaleDateString("de-DE", { month: "long", year: "numeric" });
}

export function Fristen() {
  const [items, setItems] = useState<Frist[]>(INITIAL);
  const [view, setView] = useState<"timeline" | "kalender">("timeline");
  const [filterTyp, setFilterTyp] = useState<Set<FristTyp>>(new Set());
  const [zeitraum, setZeitraum] = useState<"alle" | "30" | "90">("alle");

  const sichtbar = useMemo(() => {
    let list = items.filter((f) => f.status === "offen");
    if (filterTyp.size > 0) list = list.filter((f) => filterTyp.has(f.typ));
    if (zeitraum !== "alle") {
      const max = parseInt(zeitraum, 10);
      list = list.filter((f) => daysUntil(f.datum) <= max && daysUntil(f.datum) >= -7);
    }
    list = [...list].sort((a, b) => parseDate(a.datum).getTime() - parseDate(b.datum).getTime());
    return list;
  }, [items, filterTyp, zeitraum]);

  // KPIs
  const in30 = items.filter((f) => f.status === "offen" && daysUntil(f.datum) <= 30 && daysUntil(f.datum) >= -7);
  const in30Dring = in30.filter((f) => {
    const u = urgency(f.datum);
    return u === "sehrbald" || u === "ueberfaellig" || u === "bald";
  }).length;
  const in90 = items.filter(
    (f) => f.status === "offen" && daysUntil(f.datum) <= 90 && daysUntil(f.datum) >= -7,
  ).length;
  const autoVerlaengerung = items.filter(
    (f) => f.status === "offen" && (f.typ === "kuendigung" || f.typ === "verlaengerung"),
  );
  const atRisk = autoVerlaengerung.reduce((s, f) => s + (f.jahreswert ?? 0), 0);
  const autoDrohend = autoVerlaengerung.filter((f) => daysUntil(f.datum) <= 60).length;

  const setStatus = (id: string, neu: Status, msg: string) => {
    const prev = items;
    setItems(items.map((f) => (f.id === id ? { ...f, status: neu } : f)));
    toast(msg, { action: { label: "Rückgängig", onClick: () => setItems(prev) } });
  };

  const toggleTyp = (t: FristTyp) => {
    const next = new Set(filterTyp);
    if (next.has(t)) next.delete(t);
    else next.add(t);
    setFilterTyp(next);
  };

  return (
    <div className="space-y-6">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 sm:flex sm:flex-wrap sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight truncate">
            Fristen-Wächter
          </h1>
          <p className="mt-1 text-muted-foreground">Damit sich kein Vertrag still verlängert.</p>
        </div>
        <ViewToggle view={view} onChange={setView} />
      </header>

      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <Kpi
          label="in 30 Tagen"
          wert={String(in30.length)}
          sub={in30Dring > 0 ? `${in30Dring} dringend` : "alles ruhig"}
          tone={in30Dring > 0 ? "rose" : "muted"}
          icon={AlarmClock}
        />
        <Kpi
          label="in 90 Tagen"
          wert={String(in90)}
          sub="Fristen insgesamt"
          tone="violet"
          icon={CalendarDays}
        />
        <Kpi
          label="Jahreswert in Verlängerung"
          wert={fmtEUR(atRisk)}
          sub="verlängert sich automatisch"
          tone="amber"
          icon={ShieldCheck}
          big
        />
        <Kpi
          label="drohende Auto-Verlängerungen"
          wert={String(autoDrohend)}
          sub="in den nächsten 60 Tagen"
          tone="rose"
          icon={RefreshCw}
        />
      </div>

      <FilterBar
        filterTyp={filterTyp}
        onToggleTyp={toggleTyp}
        onReset={() => {
          setFilterTyp(new Set());
          setZeitraum("alle");
        }}
        zeitraum={zeitraum}
        onZeitraum={setZeitraum}
      />

      {view === "timeline" ? (
        <Timeline
          items={sichtbar}
          onKuendigen={(f) => setStatus(f.id, "erledigt", `Kündigung für ${f.tool.name} vorbereitet`)}
          onBehalten={(f) => setStatus(f.id, "behalten", `${f.tool.name} bewusst behalten`)}
          onErinnern={(f) =>
            toast("Erinnerung aktualisiert", { description: `${f.tool.name}, ${f.erinnerungTage} Tage vorher` })
          }
        />
      ) : (
        <Kalender
          items={items.filter((f) => f.status === "offen")}
          onKuendigen={(f) => setStatus(f.id, "erledigt", `Kündigung für ${f.tool.name} vorbereitet`)}
          onBehalten={(f) => setStatus(f.id, "behalten", `${f.tool.name} bewusst behalten`)}
          onErinnern={(f) =>
            toast("Erinnerung aktualisiert", { description: `${f.tool.name}, ${f.erinnerungTage} Tage vorher` })
          }
        />
      )}
    </div>
  );
}

function ViewToggle({
  view,
  onChange,
}: {
  view: "timeline" | "kalender";
  onChange: (v: "timeline" | "kalender") => void;
}) {
  return (
    <div className="inline-flex items-center gap-1 rounded-full bg-muted p-1 shrink-0">
      <button
        onClick={() => onChange("timeline")}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
          view === "timeline" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
        )}
      >
        <ListOrdered className="size-4" /> Timeline
      </button>
      <button
        onClick={() => onChange("kalender")}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
          view === "kalender" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
        )}
      >
        <CalendarDays className="size-4" /> Kalender
      </button>
    </div>
  );
}

function Kpi({
  label,
  wert,
  sub,
  tone,
  icon: Icon,
  big,
}: {
  label: string;
  wert: string;
  sub: string;
  tone: "rose" | "amber" | "violet" | "muted";
  icon: typeof AlarmClock;
  big?: boolean;
}) {
  const toneText =
    tone === "rose"
      ? "text-rose-700"
      : tone === "amber"
        ? "text-amber-700"
        : tone === "violet"
          ? "text-violet-700"
          : "text-foreground";
  const toneBg =
    tone === "rose"
      ? "bg-rose-100"
      : tone === "amber"
        ? "bg-amber-100"
        : tone === "violet"
          ? "bg-violet-100"
          : "bg-muted";
  return (
    <Card className="rounded-2xl p-4 sm:p-5">
      <div className="flex items-center gap-2">
        <span className={cn("grid size-8 place-items-center rounded-full", toneBg, toneText)}>
          <Icon className="size-4" />
        </span>
        <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</div>
      </div>
      <div className={cn("mt-2 font-display font-semibold tabular-nums", toneText, big ? "text-2xl sm:text-3xl" : "text-2xl")}>
        {wert}
      </div>
      <div className="text-xs text-muted-foreground">{sub}</div>
    </Card>
  );
}

function FilterBar({
  filterTyp,
  onToggleTyp,
  zeitraum,
  onZeitraum,
  onReset,
}: {
  filterTyp: Set<FristTyp>;
  onToggleTyp: (t: FristTyp) => void;
  zeitraum: "alle" | "30" | "90";
  onZeitraum: (z: "alle" | "30" | "90") => void;
  onReset: () => void;
}) {
  const all: FristTyp[] = ["kuendigung", "verlaengerung", "trial", "karte"];
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <Filter className="size-4 text-muted-foreground shrink-0" />
      {all.map((t) => {
        const meta = TYP_META[t];
        const active = filterTyp.has(t);
        return (
          <button
            key={t}
            onClick={() => onToggleTyp(t)}
            className={cn(
              "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              active
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:text-foreground hover:bg-muted",
            )}
          >
            <meta.icon className="size-3.5" /> {meta.label}
          </button>
        );
      })}
      <span className="mx-1 hidden sm:inline-block h-5 w-px bg-border" />
      {([
        ["alle", "Alle"],
        ["30", "Nächste 30 Tage"],
        ["90", "Nächste 90 Tage"],
      ] as const).map(([key, label]) => (
        <button
          key={key}
          onClick={() => onZeitraum(key)}
          className={cn(
            "inline-flex items-center whitespace-nowrap rounded-full border px-3 py-1 text-xs font-medium transition-colors",
            zeitraum === key
              ? "border-primary bg-primary/10 text-primary"
              : "border-border text-muted-foreground hover:text-foreground hover:bg-muted",
          )}
        >
          {label}
        </button>
      ))}
      {(filterTyp.size > 0 || zeitraum !== "alle") && (
        <button
          onClick={onReset}
          className="ml-1 inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <X className="size-3" /> Zurücksetzen
        </button>
      )}
    </div>
  );
}

interface FristActions {
  onKuendigen: (f: Frist) => void;
  onBehalten: (f: Frist) => void;
  onErinnern: (f: Frist) => void;
}

function Timeline({ items, ...actions }: { items: Frist[] } & FristActions) {
  if (items.length === 0) return <EmptyState />;
  // gruppieren nach Monat
  const groups = new Map<string, Frist[]>();
  items.forEach((f) => {
    const key = monatLabel(f.datum);
    const arr = groups.get(key) ?? [];
    arr.push(f);
    groups.set(key, arr);
  });
  return (
    <div className="space-y-8">
      {Array.from(groups.entries()).map(([monat, list]) => (
        <section key={monat} className="space-y-3">
          <h2 className="font-display text-lg font-semibold capitalize">{monat}</h2>
          <div className="relative pl-6">
            <span aria-hidden className="absolute left-2 top-2 bottom-2 w-px bg-border" />
            <div className="space-y-3">
              {list.map((f) => (
                <FristKarte key={f.id} f={f} {...actions} />
              ))}
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}

function FristKarte({ f, onKuendigen, onBehalten, onErinnern }: { f: Frist } & FristActions) {
  const u = urgency(f.datum);
  const um = urgencyMeta(u);
  const meta = TYP_META[f.typ];
  const Icon = meta.icon;
  return (
    <div className="relative">
      <span
        aria-hidden
        className={cn("absolute -left-[1.05rem] top-5 size-3 rounded-full ring-4 ring-background", um.dot)}
      />
      <Card
        className={cn(
          "rounded-2xl p-4 sm:p-5 transition-all hover:-translate-y-0.5 hover:shadow-md",
          (u === "sehrbald" || u === "ueberfaellig") && "ring-1 ring-rose-200",
        )}
      >
        <div className="flex flex-wrap items-start gap-3">
          <div
            className="size-10 shrink-0 rounded-xl grid place-items-center text-white font-display font-bold"
            style={{ background: f.tool.farbe }}
          >
            {f.tool.name[0]}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-display text-base sm:text-lg font-semibold truncate">{f.tool.name}</h3>
              <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium", meta.bg, meta.fg)}>
                <Icon className="size-3" /> {meta.label}
              </span>
              {f.kunde && (
                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                  Kunde {f.kunde}
                </span>
              )}
            </div>
            <p className="mt-1.5 text-sm text-foreground">{f.konsequenz}</p>
            <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
              <Bell className="size-3.5" /> Erinnerung {f.erinnerungTage} Tage vorher aktiv
            </div>
          </div>

          <div className="text-right shrink-0 min-w-[7rem]">
            <div className="font-display text-xl sm:text-2xl font-semibold tabular-nums">
              {fmtDate(f.datum)}
            </div>
            <div className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium mt-1", um.chip)}>
              <AlarmClock className="size-3" /> {countdownLabel(f.datum)}
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {f.typ === "karte" ? (
            <Button asChild size="sm" className="rounded-full">
              <Link to="/zahlungskanaele">
                <CreditCard className="size-4 mr-1.5" /> Karte aktualisieren
              </Link>
            </Button>
          ) : (
            <Button size="sm" className="rounded-full" onClick={() => onKuendigen(f)}>
              <FileSignature className="size-4 mr-1.5" /> Kündigung vorbereiten
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            className="rounded-full"
            onClick={() => onErinnern(f)}
          >
            <Bell className="size-4 mr-1.5" /> Erinnerung anpassen
          </Button>
          <Button asChild size="sm" variant="ghost" className="rounded-full text-muted-foreground">
            <Link to="/abos">
              <Eye className="size-4 mr-1.5" /> Vertrag ansehen
            </Link>
          </Button>
          {f.typ !== "karte" && (
            <Button
              size="sm"
              variant="ghost"
              className="rounded-full text-muted-foreground ml-auto"
              onClick={() => onBehalten(f)}
            >
              <Check className="size-4 mr-1.5" /> behalten
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}

function EmptyState() {
  return (
    <Card className="rounded-3xl p-10 text-center bg-gradient-to-br from-emerald-50 to-white border-emerald-100">
      <div className="mx-auto size-14 rounded-full bg-emerald-100 grid place-items-center text-emerald-700">
        <CalendarCheck className="size-7" />
      </div>
      <h3 className="mt-4 font-display text-xl font-semibold">
        Aktuell läuft nichts ab, alles im grünen Bereich.
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Wir melden uns, sobald sich eine Frist nähert.
      </p>
    </Card>
  );
}

/* ----------------- Kalender ----------------- */

function Kalender({ items, ...actions }: { items: Frist[] } & FristActions) {
  const [cursor, setCursor] = useState(() => new Date(HEUTE.getFullYear(), HEUTE.getMonth(), 1));
  const [selectedIso, setSelectedIso] = useState<string | null>(null);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const startOffset = (first.getDay() + 6) % 7; // Montag = 0
  const days: ({ iso: string; day: number } | null)[] = [];
  for (let i = 0; i < startOffset; i++) days.push(null);
  for (let d = 1; d <= last.getDate(); d++) {
    const iso = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    days.push({ iso, day: d });
  }
  while (days.length % 7 !== 0) days.push(null);

  const byDay = new Map<string, Frist[]>();
  items.forEach((f) => {
    const arr = byDay.get(f.datum) ?? [];
    arr.push(f);
    byDay.set(f.datum, arr);
  });

  const monatTitel = cursor.toLocaleDateString("de-DE", { month: "long", year: "numeric" });
  const todayIso = HEUTE.toISOString().slice(0, 10);

  const selected = selectedIso ? byDay.get(selectedIso) ?? [] : [];

  const agenda = [...items]
    .sort((a, b) => parseDate(a.datum).getTime() - parseDate(b.datum).getTime())
    .slice(0, 5);

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_22rem]">
      <Card className="rounded-2xl p-3 sm:p-5">
        <div className="flex items-center justify-between mb-4">
          <Button
            size="icon"
            variant="ghost"
            className="rounded-full"
            onClick={() => setCursor(new Date(year, month - 1, 1))}
            aria-label="Vorheriger Monat"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <div className="font-display text-lg font-semibold capitalize">{monatTitel}</div>
          <Button
            size="icon"
            variant="ghost"
            className="rounded-full"
            onClick={() => setCursor(new Date(year, month + 1, 1))}
            aria-label="Nächster Monat"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>

        <div className="hidden sm:grid grid-cols-7 gap-1 text-[11px] uppercase tracking-wide text-muted-foreground mb-1 px-1">
          {["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"].map((d) => (
            <div key={d} className="text-center">{d}</div>
          ))}
        </div>

        {/* Desktop-Raster */}
        <div className="hidden sm:grid grid-cols-7 gap-1">
          {days.map((cell, i) => {
            if (!cell) return <div key={i} className="aspect-square" />;
            const day = byDay.get(cell.iso) ?? [];
            const isToday = cell.iso === todayIso;
            const isSelected = cell.iso === selectedIso;
            return (
              <button
                key={i}
                onClick={() => setSelectedIso(cell.iso)}
                className={cn(
                  "aspect-square rounded-xl border p-1.5 text-left flex flex-col transition-colors",
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/40 hover:bg-muted/40",
                  isToday && !isSelected && "bg-amber-50/60",
                )}
              >
                <div className={cn("text-xs tabular-nums", isToday ? "font-semibold text-amber-700" : "text-muted-foreground")}>
                  {cell.day}
                </div>
                <div className="mt-auto flex flex-wrap gap-0.5">
                  {day.slice(0, 4).map((f) => (
                    <span
                      key={f.id}
                      title={`${f.tool.name}, ${TYP_META[f.typ].label}`}
                      className={cn("size-1.5 rounded-full", urgencyMeta(urgency(f.datum)).dot)}
                    />
                  ))}
                  {day.length > 4 && (
                    <span className="text-[9px] text-muted-foreground tabular-nums">+{day.length - 4}</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Mobile Agenda-Liste statt Raster */}
        <div className="sm:hidden divide-y divide-border">
          {[...byDay.entries()]
            .filter(([iso]) => iso.startsWith(`${year}-${String(month + 1).padStart(2, "0")}`))
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([iso, list]) => (
              <button
                key={iso}
                onClick={() => setSelectedIso(iso)}
                className="w-full flex items-center gap-3 py-3 text-left"
              >
                <div className="w-16 shrink-0">
                  <div className="font-display text-lg font-semibold tabular-nums">
                    {parseDate(iso).getDate()}.
                  </div>
                  <div className="text-[10px] uppercase text-muted-foreground">
                    {parseDate(iso).toLocaleDateString("de-DE", { weekday: "short" })}
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium truncate">{list.map((l) => l.tool.name).join(", ")}</div>
                  <div className="text-[11px] text-muted-foreground">
                    {list.length} {list.length === 1 ? "Frist" : "Fristen"}
                  </div>
                </div>
                <span className={cn("size-2 rounded-full", urgencyMeta(urgency(iso)).dot)} />
              </button>
            ))}
          {[...byDay.entries()].filter(([iso]) => iso.startsWith(`${year}-${String(month + 1).padStart(2, "0")}`)).length === 0 && (
            <div className="py-6 text-center text-sm text-muted-foreground">
              Keine Fristen in diesem Monat.
            </div>
          )}
        </div>
      </Card>

      <div className="space-y-4">
        <Card className="rounded-2xl p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
            {selectedIso ? fmtDate(selectedIso) : "Tag wählen"}
          </div>
          {selected.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {selectedIso ? "Keine Frist an diesem Tag." : "Klick auf einen Tag, um die Fristen zu sehen."}
            </p>
          ) : (
            <div className="space-y-2">
              {selected.map((f) => (
                <KompaktKarte key={f.id} f={f} {...actions} />
              ))}
            </div>
          )}
        </Card>

        <Card className="rounded-2xl p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
            Anstehend
          </div>
          <ul className="space-y-2">
            {agenda.map((f) => (
              <li key={f.id} className="flex items-center gap-2 text-sm">
                <span className={cn("size-2 rounded-full shrink-0", urgencyMeta(urgency(f.datum)).dot)} />
                <span className="min-w-0 flex-1 truncate">{f.tool.name}</span>
                <span className="text-xs text-muted-foreground tabular-nums shrink-0">
                  {fmtDate(f.datum)}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}

function KompaktKarte({ f, onKuendigen, onBehalten }: { f: Frist } & FristActions) {
  const meta = TYP_META[f.typ];
  const um = urgencyMeta(urgency(f.datum));
  const Icon = meta.icon;
  return (
    <div className="rounded-xl border border-border p-3">
      <div className="flex items-start gap-2">
        <div
          className="size-8 shrink-0 rounded-lg grid place-items-center text-white text-xs font-bold"
          style={{ background: f.tool.farbe }}
        >
          {f.tool.name[0]}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-medium text-sm truncate">{f.tool.name}</span>
            <span className={cn("inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px]", meta.bg, meta.fg)}>
              <Icon className="size-3" /> {meta.label}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{f.konsequenz}</p>
          <div className={cn("mt-1 inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px]", um.chip)}>
            {countdownLabel(f.datum)}
          </div>
        </div>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        {f.typ === "karte" ? (
          <Button asChild size="sm" variant="outline" className="rounded-full h-7 text-xs">
            <Link to="/zahlungskanaele">Karte aktualisieren</Link>
          </Button>
        ) : (
          <Button size="sm" variant="outline" className="rounded-full h-7 text-xs" onClick={() => onKuendigen(f)}>
            Kündigung vorbereiten
          </Button>
        )}
        {f.typ !== "karte" && (
          <Button size="sm" variant="ghost" className="rounded-full h-7 text-xs text-muted-foreground" onClick={() => onBehalten(f)}>
            behalten
          </Button>
        )}
      </div>
    </div>
  );
}
