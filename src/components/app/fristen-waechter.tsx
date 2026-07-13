"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  AlarmClock,
  CalendarDays,
  ListOrdered,
  Bell,
  BellOff,
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
import { useReadOnly } from "@/components/app/read-only-context";
import { cn } from "@/lib/utils";
import { formatEur } from "@/lib/constants";
import {
  ART_LABEL,
  dringlichkeit,
  tageBis,
  type Frist,
  type FristArt,
  type Dringlichkeit,
} from "@/lib/fristen";
import { quittiereFrist } from "@/app/app/fristen/actions";

/* -------------------------------- Helfer ---------------------------------- */

const TYP_META: Record<
  FristArt,
  { label: string; icon: React.ComponentType<{ className?: string }>; bg: string; fg: string }
> = {
  kuendigung: { label: ART_LABEL.kuendigung, icon: AlarmClock, bg: "bg-warning/15", fg: "text-warning" },
  verlaengerung: { label: ART_LABEL.verlaengerung, icon: RefreshCw, bg: "bg-primary/10", fg: "text-primary" },
  trial: { label: ART_LABEL.trial, icon: TimerReset, bg: "bg-coral/15", fg: "text-coral" },
  karte: { label: ART_LABEL.karte, icon: CreditCard, bg: "bg-warning/15", fg: "text-warning" },
};

const ALLE_TYPEN: FristArt[] = ["kuendigung", "verlaengerung", "trial", "karte"];

function parseDate(iso: string) {
  return new Date(iso + "T00:00:00");
}
function fmtDate(iso: string) {
  return parseDate(iso).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
}
function monatLabel(iso: string) {
  return parseDate(iso).toLocaleDateString("de-DE", { month: "long", year: "numeric" });
}
function countdown(iso: string) {
  const d = tageBis(iso);
  if (d < 0) return `überfällig seit ${Math.abs(d)} ${Math.abs(d) === 1 ? "Tag" : "Tagen"}`;
  if (d === 0) return "heute";
  if (d === 1) return "morgen";
  return `in ${d} Tagen`;
}

function dringMeta(u: Dringlichkeit) {
  switch (u) {
    case "ueberfaellig":
      return { label: "überfällig", chip: "bg-destructive/10 text-destructive", dot: "bg-destructive" };
    case "sehrbald":
      return { label: "sehr bald", chip: "bg-destructive/10 text-destructive", dot: "bg-destructive" };
    case "bald":
      return { label: "bald", chip: "bg-warning/15 text-warning", dot: "bg-warning" };
    default:
      return { label: "weiter weg", chip: "bg-muted text-muted-foreground", dot: "bg-muted-foreground/60" };
  }
}

/* ------------------------------ Hauptansicht ------------------------------ */

export function FristenWaechter({ fristen }: { fristen: Frist[] }) {
  const router = useRouter();
  const readOnly = useReadOnly();
  const [view, setView] = useState<"timeline" | "kalender">("timeline");
  const [filterTyp, setFilterTyp] = useState<Set<FristArt>>(new Set());
  const [zeitraum, setZeitraum] = useState<"alle" | "30" | "90">("alle");
  const [pending, start] = useTransition();

  const sichtbar = useMemo(() => {
    let list = fristen;
    if (filterTyp.size > 0) list = list.filter((f) => filterTyp.has(f.art));
    if (zeitraum !== "alle") {
      const max = Number(zeitraum);
      list = list.filter((f) => {
        const t = tageBis(f.datum);
        return t <= max && t >= -7;
      });
    }
    return [...list].sort((a, b) => (a.datum < b.datum ? -1 : 1));
  }, [fristen, filterTyp, zeitraum]);

  /* KPI */
  const in30 = fristen.filter((f) => tageBis(f.datum) <= 30 && tageBis(f.datum) >= -7);
  const in30Dringend = in30.filter((f) => dringlichkeit(f.datum) !== "weiter").length;
  const in90 = fristen.filter((f) => tageBis(f.datum) <= 90 && tageBis(f.datum) >= -7).length;
  const verlaengert = fristen.filter((f) => f.art === "kuendigung" || f.art === "verlaengerung");
  const jahreswertRisiko = verlaengert.reduce((s, f) => s + f.jahreswert, 0);
  const drohend = verlaengert.filter((f) => tageBis(f.datum) <= 60).length;

  function quittieren(f: Frist, status: "erledigt" | "behalten") {
    start(async () => {
      const res = await quittiereFrist({
        quelle: f.quelle,
        quelle_id: f.quelle_id,
        art: f.art,
        datum: f.datum,
        status,
      });
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success(
        status === "behalten" ? `${f.titel} bewusst behalten.` : `Frist für ${f.titel} als erledigt markiert.`,
      );
      router.refresh();
    });
  }

  const aktionen: FristAktionen = {
    readOnly,
    pending,
    onErledigt: (f) => quittieren(f, "erledigt"),
    onBehalten: (f) => quittieren(f, "behalten"),
  };

  return (
    <div className="space-y-6">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 sm:flex sm:flex-wrap sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="truncate font-display text-3xl font-semibold tracking-tight sm:text-4xl">Fristen-Wächter</h1>
          <p className="mt-1 text-muted-foreground">Damit sich kein Vertrag still verlängert.</p>
        </div>
        <ViewToggle view={view} onChange={setView} />
      </header>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi
          label="in 30 Tagen"
          wert={String(in30.length)}
          sub={in30Dringend > 0 ? `${in30Dringend} dringend` : "alles ruhig"}
          tone={in30Dringend > 0 ? "rose" : "muted"}
          icon={AlarmClock}
        />
        <Kpi label="in 90 Tagen" wert={String(in90)} sub="Fristen insgesamt" tone="violet" icon={CalendarDays} />
        <Kpi
          label="Jahreswert in Verlängerung"
          wert={formatEur(jahreswertRisiko)}
          sub="verlängert sich automatisch"
          tone="amber"
          icon={ShieldCheck}
          big
        />
        <Kpi
          label="drohende Verlängerungen"
          wert={String(drohend)}
          sub="in den nächsten 60 Tagen"
          tone="rose"
          icon={RefreshCw}
        />
      </div>

      <FilterBar
        filterTyp={filterTyp}
        onToggleTyp={(t) => {
          const next = new Set(filterTyp);
          if (next.has(t)) next.delete(t);
          else next.add(t);
          setFilterTyp(next);
        }}
        zeitraum={zeitraum}
        onZeitraum={setZeitraum}
        onReset={() => {
          setFilterTyp(new Set());
          setZeitraum("alle");
        }}
      />

      {view === "timeline" ? (
        <Timeline items={sichtbar} aktionen={aktionen} />
      ) : (
        <Kalender items={sichtbar} aktionen={aktionen} />
      )}
    </div>
  );
}

type FristAktionen = {
  readOnly: boolean;
  pending: boolean;
  onErledigt: (f: Frist) => void;
  onBehalten: (f: Frist) => void;
};

/* ------------------------------- Bausteine -------------------------------- */

function ViewToggle({
  view,
  onChange,
}: {
  view: "timeline" | "kalender";
  onChange: (v: "timeline" | "kalender") => void;
}) {
  return (
    <div className="inline-flex shrink-0 items-center gap-1 rounded-full bg-muted p-1">
      {(
        [
          ["timeline", ListOrdered, "Timeline"],
          ["kalender", CalendarDays, "Kalender"],
        ] as const
      ).map(([v, Icon, label]) => (
        <button
          key={v}
          onClick={() => onChange(v)}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
            view === v ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Icon className="size-4" /> {label}
        </button>
      ))}
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
  icon: React.ComponentType<{ className?: string }>;
  big?: boolean;
}) {
  const text =
    tone === "rose"
      ? "text-destructive"
      : tone === "amber"
        ? "text-warning"
        : tone === "violet"
          ? "text-primary"
          : "text-foreground";
  const bg =
    tone === "rose"
      ? "bg-destructive/10"
      : tone === "amber"
        ? "bg-warning/15"
        : tone === "violet"
          ? "bg-primary/10"
          : "bg-muted";
  return (
    <Card className="rounded-2xl p-4 sm:p-5">
      <div className="flex items-center gap-2">
        <span className={cn("grid size-8 place-items-center rounded-full", bg, text)}>
          <Icon className="size-4" />
        </span>
        <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</div>
      </div>
      <div className={cn("mt-2 font-display font-semibold tabular-nums", text, big ? "text-2xl sm:text-3xl" : "text-2xl")}>
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
  filterTyp: Set<FristArt>;
  onToggleTyp: (t: FristArt) => void;
  zeitraum: "alle" | "30" | "90";
  onZeitraum: (z: "alle" | "30" | "90") => void;
  onReset: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <Filter className="size-4 shrink-0 text-muted-foreground" />
      {ALLE_TYPEN.map((t) => {
        const meta = TYP_META[t];
        const Icon = meta.icon;
        const active = filterTyp.has(t);
        return (
          <button
            key={t}
            onClick={() => onToggleTyp(t)}
            className={cn(
              "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              active
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon className="size-3.5" /> {meta.label}
          </button>
        );
      })}
      <span className="mx-1 hidden h-5 w-px bg-border sm:inline-block" />
      {(
        [
          ["alle", "Alle"],
          ["30", "Nächste 30 Tage"],
          ["90", "Nächste 90 Tage"],
        ] as const
      ).map(([key, label]) => (
        <button
          key={key}
          onClick={() => onZeitraum(key)}
          className={cn(
            "inline-flex items-center whitespace-nowrap rounded-full border px-3 py-1 text-xs font-medium transition-colors",
            zeitraum === key
              ? "border-primary bg-primary/10 text-primary"
              : "border-border text-muted-foreground hover:bg-muted hover:text-foreground",
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

/* -------------------------------- Timeline -------------------------------- */

function Timeline({ items, aktionen }: { items: Frist[]; aktionen: FristAktionen }) {
  if (items.length === 0) return <LeererZustand />;

  const gruppen = new Map<string, Frist[]>();
  for (const f of items) {
    const key = monatLabel(f.datum);
    const arr = gruppen.get(key) ?? [];
    arr.push(f);
    gruppen.set(key, arr);
  }

  return (
    <div className="space-y-8">
      {[...gruppen.entries()].map(([monat, list]) => (
        <section key={monat} className="space-y-3">
          <h2 className="font-display text-lg font-semibold capitalize">{monat}</h2>
          <div className="relative pl-6">
            <span aria-hidden className="absolute bottom-2 left-2 top-2 w-px bg-border" />
            <div className="space-y-3">
              {list.map((f) => (
                <FristKarte key={f.key} f={f} aktionen={aktionen} />
              ))}
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}

function FristKarte({ f, aktionen }: { f: Frist; aktionen: FristAktionen }) {
  const u = dringlichkeit(f.datum);
  const um = dringMeta(u);
  const meta = TYP_META[f.art];
  const Icon = meta.icon;
  const href = f.quelle === "abo" ? `/app/abos/${f.quelle_id}` : "/app/zahlungskanaele";

  return (
    <div className="relative">
      <span
        aria-hidden
        className={cn("absolute -left-[1.05rem] top-5 size-3 rounded-full ring-4 ring-background", um.dot)}
      />
      <Card
        className={cn(
          "rounded-2xl p-4 transition-all hover:-translate-y-0.5 hover:shadow-md sm:p-5",
          (u === "sehrbald" || u === "ueberfaellig") && "ring-1 ring-destructive/30",
        )}
      >
        <div className="flex flex-wrap items-start gap-3">
          <div
            className="grid size-10 shrink-0 place-items-center rounded-xl font-display font-bold text-white"
            style={{ background: f.farbe }}
          >
            {f.titel[0]?.toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate font-display text-base font-semibold sm:text-lg">{f.titel}</h3>
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
                  meta.bg,
                  meta.fg,
                )}
              >
                <Icon className="size-3" /> {meta.label}
              </span>
              {f.kunde && (
                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                  Kunde {f.kunde}
                </span>
              )}
            </div>
            <p className="mt-1.5 text-sm text-foreground">{f.konsequenz}</p>
            <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
              {f.erinnerung ? (
                <>
                  <Bell className="size-3.5" /> Erinnerung ist aktiv
                </>
              ) : (
                <>
                  <BellOff className="size-3.5" /> keine Erinnerung hinterlegt
                </>
              )}
            </div>
          </div>

          <div className="min-w-[7rem] shrink-0 text-right">
            <div className="font-display text-xl font-semibold tabular-nums sm:text-2xl">{fmtDate(f.datum)}</div>
            <div
              className={cn(
                "mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
                um.chip,
              )}
            >
              <AlarmClock className="size-3" /> {countdown(f.datum)}
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {f.art === "karte" ? (
            <Button asChild size="sm" className="rounded-full">
              <Link href="/app/zahlungskanaele">
                <CreditCard className="mr-1.5 size-4" /> Karte aktualisieren
              </Link>
            </Button>
          ) : (
            !aktionen.readOnly && (
              <Button
                size="sm"
                className="rounded-full"
                onClick={() => aktionen.onErledigt(f)}
                disabled={aktionen.pending}
              >
                <FileSignature className="mr-1.5 size-4" /> Gekündigt, erledigt
              </Button>
            )
          )}
          <Button asChild size="sm" variant="ghost" className="rounded-full text-muted-foreground">
            <Link href={href}>
              <Eye className="mr-1.5 size-4" /> Vertrag ansehen
            </Link>
          </Button>
          {f.art !== "karte" && !aktionen.readOnly && (
            <Button
              size="sm"
              variant="ghost"
              className="ml-auto rounded-full text-muted-foreground"
              onClick={() => aktionen.onBehalten(f)}
              disabled={aktionen.pending}
            >
              <Check className="mr-1.5 size-4" /> bewusst behalten
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}

function LeererZustand() {
  return (
    <Card className="rounded-3xl border-success/20 bg-success/5 p-10 text-center">
      <div className="mx-auto grid size-14 place-items-center rounded-full bg-success/15 text-success">
        <CalendarCheck className="size-7" />
      </div>
      <h3 className="mt-4 font-display text-xl font-semibold">Aktuell läuft nichts ab, alles im grünen Bereich.</h3>
      <p className="mt-1 text-sm text-muted-foreground">Wir melden uns, sobald sich eine Frist nähert.</p>
    </Card>
  );
}

/* -------------------------------- Kalender -------------------------------- */

function Kalender({ items, aktionen }: { items: Frist[]; aktionen: FristAktionen }) {
  const heute = new Date();
  const [cursor, setCursor] = useState(() => new Date(heute.getFullYear(), heute.getMonth(), 1));
  const [gewaehlt, setGewaehlt] = useState<string | null>(null);

  const jahr = cursor.getFullYear();
  const monat = cursor.getMonth();
  const ersterTag = new Date(jahr, monat, 1);
  const letzterTag = new Date(jahr, monat + 1, 0);
  const versatz = (ersterTag.getDay() + 6) % 7; // Montag = 0

  const zellen: ({ iso: string; tag: number } | null)[] = [];
  for (let i = 0; i < versatz; i++) zellen.push(null);
  for (let d = 1; d <= letzterTag.getDate(); d++) {
    zellen.push({ iso: `${jahr}-${String(monat + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`, tag: d });
  }
  while (zellen.length % 7 !== 0) zellen.push(null);

  const proTag = new Map<string, Frist[]>();
  for (const f of items) {
    const arr = proTag.get(f.datum) ?? [];
    arr.push(f);
    proTag.set(f.datum, arr);
  }

  const heuteIso = `${heute.getFullYear()}-${String(heute.getMonth() + 1).padStart(2, "0")}-${String(heute.getDate()).padStart(2, "0")}`;
  const gewaehlteFristen = gewaehlt ? (proTag.get(gewaehlt) ?? []) : [];
  const agenda = [...items].sort((a, b) => (a.datum < b.datum ? -1 : 1)).slice(0, 5);
  const monatsPraefix = `${jahr}-${String(monat + 1).padStart(2, "0")}`;
  const monatsTage = [...proTag.entries()].filter(([iso]) => iso.startsWith(monatsPraefix)).sort();

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_22rem]">
      <Card className="rounded-2xl p-3 sm:p-5">
        <div className="mb-4 flex items-center justify-between">
          <Button
            size="icon"
            variant="ghost"
            className="rounded-full"
            onClick={() => setCursor(new Date(jahr, monat - 1, 1))}
            aria-label="Vorheriger Monat"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <div className="font-display text-lg font-semibold capitalize">
            {cursor.toLocaleDateString("de-DE", { month: "long", year: "numeric" })}
          </div>
          <Button
            size="icon"
            variant="ghost"
            className="rounded-full"
            onClick={() => setCursor(new Date(jahr, monat + 1, 1))}
            aria-label="Nächster Monat"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>

        <div className="mb-1 hidden grid-cols-7 gap-1 px-1 text-[11px] uppercase tracking-wide text-muted-foreground sm:grid">
          {["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"].map((d) => (
            <div key={d} className="text-center">
              {d}
            </div>
          ))}
        </div>

        {/* Raster ab sm */}
        <div className="hidden grid-cols-7 gap-1 sm:grid">
          {zellen.map((zelle, i) => {
            if (!zelle) return <div key={i} className="aspect-square" />;
            const tagesFristen = proTag.get(zelle.iso) ?? [];
            const istHeute = zelle.iso === heuteIso;
            const istGewaehlt = zelle.iso === gewaehlt;
            return (
              <button
                key={i}
                onClick={() => setGewaehlt(zelle.iso)}
                className={cn(
                  "flex aspect-square flex-col rounded-xl border p-1.5 text-left transition-colors",
                  istGewaehlt
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/40 hover:bg-muted/40",
                  istHeute && !istGewaehlt && "bg-warning/10",
                )}
              >
                <div
                  className={cn(
                    "text-xs tabular-nums",
                    istHeute ? "font-semibold text-warning" : "text-muted-foreground",
                  )}
                >
                  {zelle.tag}
                </div>
                <div className="mt-auto flex flex-wrap gap-0.5">
                  {tagesFristen.slice(0, 4).map((f) => (
                    <span
                      key={f.key}
                      title={`${f.titel}, ${TYP_META[f.art].label}`}
                      className={cn("size-1.5 rounded-full", dringMeta(dringlichkeit(f.datum)).dot)}
                    />
                  ))}
                  {tagesFristen.length > 4 && (
                    <span className="text-[9px] tabular-nums text-muted-foreground">+{tagesFristen.length - 4}</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Auf dem Handy eine Agenda statt des Rasters */}
        <div className="divide-y sm:hidden">
          {monatsTage.length === 0 && (
            <div className="py-6 text-center text-sm text-muted-foreground">Keine Fristen in diesem Monat.</div>
          )}
          {monatsTage.map(([iso, list]) => (
            <button key={iso} onClick={() => setGewaehlt(iso)} className="flex w-full items-center gap-3 py-3 text-left">
              <div className="w-16 shrink-0">
                <div className="font-display text-lg font-semibold tabular-nums">{parseDate(iso).getDate()}.</div>
                <div className="text-[10px] uppercase text-muted-foreground">
                  {parseDate(iso).toLocaleDateString("de-DE", { weekday: "short" })}
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">{list.map((l) => l.titel).join(", ")}</div>
                <div className="text-[11px] text-muted-foreground">
                  {list.length} {list.length === 1 ? "Frist" : "Fristen"}
                </div>
              </div>
              <span className={cn("size-2 rounded-full", dringMeta(dringlichkeit(iso)).dot)} />
            </button>
          ))}
        </div>
      </Card>

      <div className="space-y-4">
        <Card className="rounded-2xl p-4">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {gewaehlt ? fmtDate(gewaehlt) : "Tag wählen"}
          </div>
          {gewaehlteFristen.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {gewaehlt ? "Keine Frist an diesem Tag." : "Klick auf einen Tag, um die Fristen zu sehen."}
            </p>
          ) : (
            <div className="space-y-2">
              {gewaehlteFristen.map((f) => (
                <KompaktKarte key={f.key} f={f} aktionen={aktionen} />
              ))}
            </div>
          )}
        </Card>

        <Card className="rounded-2xl p-4">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Anstehend</div>
          {agenda.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nichts steht an.</p>
          ) : (
            <ul className="space-y-2">
              {agenda.map((f) => (
                <li key={f.key} className="flex items-center gap-2 text-sm">
                  <span className={cn("size-2 shrink-0 rounded-full", dringMeta(dringlichkeit(f.datum)).dot)} />
                  <span className="min-w-0 flex-1 truncate">{f.titel}</span>
                  <span className="shrink-0 text-xs tabular-nums text-muted-foreground">{fmtDate(f.datum)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}

function KompaktKarte({ f, aktionen }: { f: Frist; aktionen: FristAktionen }) {
  const meta = TYP_META[f.art];
  const um = dringMeta(dringlichkeit(f.datum));
  const Icon = meta.icon;
  return (
    <div className="rounded-xl border p-3">
      <div className="flex items-start gap-2">
        <div
          className="grid size-8 shrink-0 place-items-center rounded-lg text-xs font-bold text-white"
          style={{ background: f.farbe }}
        >
          {f.titel[0]?.toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="truncate text-sm font-medium">{f.titel}</span>
            <span
              className={cn("inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px]", meta.bg, meta.fg)}
            >
              <Icon className="size-3" /> {meta.label}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{f.konsequenz}</p>
          <div className={cn("mt-1 inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px]", um.chip)}>
            {countdown(f.datum)}
          </div>
        </div>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        {f.art === "karte" ? (
          <Button asChild size="sm" variant="outline" className="h-7 rounded-full text-xs">
            <Link href="/app/zahlungskanaele">Karte aktualisieren</Link>
          </Button>
        ) : (
          !aktionen.readOnly && (
            <>
              <Button
                size="sm"
                variant="outline"
                className="h-7 rounded-full text-xs"
                onClick={() => aktionen.onErledigt(f)}
                disabled={aktionen.pending}
              >
                Gekündigt
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 rounded-full text-xs text-muted-foreground"
                onClick={() => aktionen.onBehalten(f)}
                disabled={aktionen.pending}
              >
                behalten
              </Button>
            </>
          )
        )}
      </div>
    </div>
  );
}
