import { useMemo, useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import {
  Calendar,
  TrendingDown,
  Layers as LayersIcon,
  Ghost,
  ArrowLeftRight,
  Wallet,
  Filter,
  ArrowUpDown,
  Check,
  Bell,
  X,
  PartyPopper,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { fmtEUR } from "@/lib/toolfolio-data";
import { useCountUp } from "@/hooks/use-count-up";

type Typ = "intervall" | "marktpreis" | "redundanz" | "zombie" | "alternative" | "guthaben";
type Status = "offen" | "umgesetzt" | "ignoriert";

interface Vorschlag {
  id: string;
  typ: Typ;
  titel: string;
  ersparnisJahr: number;
  geschaetzt?: boolean;
  begruendung: string;
  tools: { name: string; farbe: string }[];
  aktion: string;
  hausmarke?: boolean;
  status: Status;
}

const TYP_META: Record<Typ, { label: string; icon: typeof Calendar; tone: string; bg: string }> = {
  intervall: { label: "Sparvorschlag, Intervall", icon: Calendar, tone: "text-emerald-700", bg: "bg-emerald-100" },
  marktpreis: { label: "Sparvorschlag, Marktpreis", icon: TrendingDown, tone: "text-violet-700", bg: "bg-violet-100" },
  redundanz: { label: "Sparvorschlag, Redundanz", icon: LayersIcon, tone: "text-amber-700", bg: "bg-amber-100" },
  zombie: { label: "Sparvorschlag, Zombie-Abo", icon: Ghost, tone: "text-rose-700", bg: "bg-rose-100" },
  alternative: { label: "Sparvorschlag, Alternative", icon: ArrowLeftRight, tone: "text-violet-700", bg: "bg-violet-100" },
  guthaben: { label: "Sparvorschlag, Guthaben", icon: Wallet, tone: "text-amber-700", bg: "bg-amber-100" },
};

const INITIAL: Vorschlag[] = [
  // Offen (Summe etwa 444 €)
  {
    id: "v1",
    typ: "marktpreis",
    titel: "Calendly über Marktpreis",
    ersparnisJahr: 168,
    geschaetzt: true,
    begruendung: "Du zahlst 16,00 € pro Platz. Vergleichbare Agenturen zahlen im Median 12,00 €.",
    tools: [{ name: "Calendly", farbe: "#006bff" }],
    aktion: "Tarife vergleichen",
    status: "offen",
  },
  {
    id: "v2",
    typ: "intervall",
    titel: "Figma jährlich statt monatlich",
    ersparnisJahr: 144,
    begruendung: "Stell Figma von monatlich auf jährlich um und spar dir 12,00 € pro Monat.",
    tools: [{ name: "Figma", farbe: "#a259ff" }],
    aktion: "Umstellen",
    status: "offen",
  },
  {
    id: "v3",
    typ: "zombie",
    titel: "Loom läuft ohne Nutzung",
    ersparnisJahr: 90,
    begruendung: "Loom läuft seit 5 Monaten ohne aktive Nutzung. Letzte Aufnahme im Januar.",
    tools: [{ name: "Loom", farbe: "#625df5" }],
    aktion: "Kündigung prüfen",
    status: "offen",
  },
  {
    id: "v4",
    typ: "redundanz",
    titel: "Notion und Coda decken sich",
    ersparnisJahr: 30,
    geschaetzt: true,
    begruendung: "Beide Tools werden für Doku und Wikis genutzt. Eines davon kannst du einsparen.",
    tools: [
      { name: "Notion", farbe: "#0F1419" },
      { name: "Coda", farbe: "#f46a54" },
    ],
    aktion: "Redundanz prüfen",
    status: "offen",
  },
  {
    id: "v5",
    typ: "guthaben",
    titel: "ElevenLabs-Guthaben verfällt",
    ersparnisJahr: 12,
    begruendung: "12,00 € Restguthaben bei ElevenLabs verfallen am 31.07. ungenutzt.",
    tools: [{ name: "ElevenLabs", farbe: "#0F1419" }],
    aktion: "Ansehen",
    status: "offen",
  },
  // Umgesetzt (Summe 840 €)
  {
    id: "v6",
    typ: "alternative",
    titel: "Calendly durch Cal.com ersetzt",
    ersparnisJahr: 360,
    begruendung: "Cal.com deckt denselben Funktionsumfang ab und ist günstiger.",
    tools: [{ name: "Cal.com", farbe: "#111827" }],
    aktion: "Vergleichen",
    status: "umgesetzt",
  },
  {
    id: "v7",
    typ: "intervall",
    titel: "Adobe CC auf Jahresvertrag umgestellt",
    ersparnisJahr: 240,
    begruendung: "Wechsel von monatlich auf jährlich brachte 20,00 € pro Monat.",
    tools: [{ name: "Adobe CC", farbe: "#d83b01" }],
    aktion: "Umstellen",
    status: "umgesetzt",
  },
  {
    id: "v8",
    typ: "zombie",
    titel: "Mailchimp gekündigt",
    ersparnisJahr: 180,
    begruendung: "Unbenutzt seit 8 Monaten, ersatzlos gekündigt.",
    tools: [{ name: "Mailchimp", farbe: "#ffe01b" }],
    aktion: "Kündigung prüfen",
    status: "umgesetzt",
  },
  {
    id: "v9",
    typ: "redundanz",
    titel: "Trello entfernt zugunsten Linear",
    ersparnisJahr: 60,
    begruendung: "Doppelte Projektverwaltung aufgelöst.",
    tools: [{ name: "Trello", farbe: "#0079bf" }],
    aktion: "Redundanz prüfen",
    status: "umgesetzt",
  },
  // Ignoriert
  {
    id: "v10",
    typ: "alternative",
    titel: "Slack durch Discord ersetzen",
    ersparnisJahr: 420,
    geschaetzt: true,
    begruendung: "Discord wäre günstiger, passt aber nicht zum Kundenkontakt.",
    tools: [{ name: "Slack", farbe: "#611f69" }],
    aktion: "Vergleichen",
    status: "ignoriert",
  },
  {
    id: "v11",
    typ: "marktpreis",
    titel: "Vercel-Tarif zu hoch",
    ersparnisJahr: 96,
    geschaetzt: true,
    begruendung: "Cheaper Anbieter verfügbar, Performance ist uns aber wichtig.",
    tools: [{ name: "Vercel", farbe: "#0F1419" }],
    aktion: "Tarife vergleichen",
    status: "ignoriert",
  },
];

const REALISIERT_BASIS = 840; // bereits realisiert vor den umgesetzten Karten
const GESAMT_POTENZIAL = 1284;

export function Sparvorschlaege() {
  const [items, setItems] = useState<Vorschlag[]>(INITIAL);
  const [tab, setTab] = useState<Status>("offen");
  const [typFilter, setTypFilter] = useState<Set<Typ>>(new Set());
  const [sort, setSort] = useState<"hoch" | "niedrig">("hoch");
  const [confetti, setConfetti] = useState<{ key: number; amount: number } | null>(null);

  // Anfangs sind 4 umgesetzte Karten Teil der 840 € Basis. Spätere Umsetzungen
  // erhöhen den realisierten Wert direkt.
  const umgesetztInitialIds = useMemo(
    () => new Set(INITIAL.filter((i) => i.status === "umgesetzt").map((i) => i.id)),
    [],
  );

  const realisiert = useMemo(() => {
    const zusatz = items
      .filter((i) => i.status === "umgesetzt" && !umgesetztInitialIds.has(i.id))
      .reduce((s, i) => s + i.ersparnisJahr, 0);
    const entfernt = INITIAL.filter(
      (i) => umgesetztInitialIds.has(i.id) && items.find((x) => x.id === i.id)?.status !== "umgesetzt",
    ).reduce((s, i) => s + i.ersparnisJahr, 0);
    return REALISIERT_BASIS + zusatz - entfernt;
  }, [items, umgesetztInitialIds]);

  const offenSumme = useMemo(
    () => items.filter((i) => i.status === "offen").reduce((s, i) => s + i.ersparnisJahr, 0),
    [items],
  );
  const offenAnzahl = items.filter((i) => i.status === "offen").length;

  const sichtbar = useMemo(() => {
    let list = items.filter((i) => i.status === tab);
    if (typFilter.size > 0) list = list.filter((i) => typFilter.has(i.typ));
    list = [...list].sort((a, b) =>
      sort === "hoch" ? b.ersparnisJahr - a.ersparnisJahr : a.ersparnisJahr - b.ersparnisJahr,
    );
    return list;
  }, [items, tab, typFilter, sort]);

  const setStatus = (id: string, neu: Status, undoMsg: string) => {
    const prev = items;
    const target = items.find((i) => i.id === id);
    setItems(items.map((i) => (i.id === id ? { ...i, status: neu } : i)));
    toast(undoMsg, {
      action: { label: "Rückgängig", onClick: () => setItems(prev) },
    });
    if (neu === "umgesetzt" && target) {
      setConfetti({ key: Date.now(), amount: target.ersparnisJahr });
      setTimeout(() => setConfetti(null), 1800);
    }
  };

  const umsetzen = (v: Vorschlag) =>
    setStatus(v.id, "umgesetzt", `Stark, ${fmtEUR(v.ersparnisJahr)} pro Jahr geholt`);
  const ignorieren = (v: Vorschlag) =>
    setStatus(v.id, "ignoriert", `${v.titel} ignoriert`);
  const wiederherstellen = (v: Vorschlag) =>
    setStatus(v.id, "offen", `${v.titel} zurück in Offen`);

  const counts = {
    offen: items.filter((i) => i.status === "offen").length,
    umgesetzt: items.filter((i) => i.status === "umgesetzt").length,
    ignoriert: items.filter((i) => i.status === "ignoriert").length,
  };

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight">
          Sparvorschläge
        </h1>
        <p className="text-muted-foreground">Hol dir zurück, was du zu viel zahlst.</p>
      </header>

      <SparHero realisiert={realisiert} offen={offenSumme} anzahl={offenAnzahl} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs current={tab} onChange={setTab} counts={counts} />
        <div className="flex items-center gap-2">
          <TypFilter value={typFilter} onChange={setTypFilter} />
          <SortDropdown value={sort} onChange={setSort} />
        </div>
      </div>

      {sichtbar.length === 0 ? (
        <EmptyState tab={tab} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {sichtbar.map((v) => (
            <VorschlagCard
              key={v.id}
              v={v}
              tab={tab}
              onUmsetzen={() => umsetzen(v)}
              onIgnorieren={() => ignorieren(v)}
              onWiederherstellen={() => wiederherstellen(v)}
              onErinnern={() =>
                toast("Wir erinnern dich in 7 Tagen.", { description: v.titel })
              }
            />
          ))}
        </div>
      )}

      {confetti && <Confetti key={confetti.key} amount={confetti.amount} />}
    </div>
  );
}

function SparHero({
  realisiert,
  offen,
  anzahl,
}: {
  realisiert: number;
  offen: number;
  anzahl: number;
}) {
  const ziel = GESAMT_POTENZIAL;
  const animated = useCountUp(realisiert, 800);
  const pct = Math.min(1, animated / ziel);

  // Ring
  const size = 200;
  const stroke = 18;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = c * pct;

  return (
    <Card className="overflow-hidden rounded-3xl border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-orange-50 p-6 sm:p-8 shadow-sm">
      <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10">
        <div className="relative shrink-0" style={{ width: size, height: size }}>
          <svg width={size} height={size} className="-rotate-90">
            <circle
              cx={size / 2}
              cy={size / 2}
              r={r}
              stroke="hsl(20 90% 95%)"
              strokeWidth={stroke}
              fill="none"
            />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={r}
              stroke="url(#sparGrad)"
              strokeWidth={stroke}
              fill="none"
              strokeDasharray={`${dash} ${c - dash}`}
              strokeLinecap="round"
              className="transition-[stroke-dasharray] duration-700"
            />
            <defs>
              <linearGradient id="sparGrad" x1="0" x2="1" y1="0" y2="1">
                <stop offset="0%" stopColor="#FF7A66" />
                <stop offset="100%" stopColor="#12B76A" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 grid place-items-center text-center">
            <div>
              <div className="text-xs font-medium text-muted-foreground">realisiert</div>
              <div className="font-display text-3xl font-semibold tabular-nums text-emerald-700">
                {fmtEUR(animated)}
              </div>
              <div className="text-xs text-muted-foreground tabular-nums">
                von {fmtEUR(ziel)} / Jahr
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 w-full">
          <div className="font-display text-xl sm:text-2xl font-semibold tracking-tight">
            Du hast schon {fmtEUR(realisiert)} von {fmtEUR(ziel)} möglichem Sparpotenzial pro Jahr
            realisiert.
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Bleib dran, jeder umgesetzte Vorschlag füllt den Ring weiter.
          </p>

          <div className="mt-5 grid grid-cols-3 gap-3">
            <Kpi label="offenes Potenzial" wert={fmtEUR(offen)} suffix="/ Jahr" tone="coral" />
            <Kpi label="realisiert" wert={fmtEUR(realisiert)} suffix="/ Jahr" tone="emerald" />
            <Kpi label="offene Vorschläge" wert={String(anzahl)} tone="violet" />
          </div>
        </div>
      </div>
    </Card>
  );
}

function Kpi({
  label,
  wert,
  suffix,
  tone,
}: {
  label: string;
  wert: string;
  suffix?: string;
  tone: "coral" | "emerald" | "violet";
}) {
  const toneCls =
    tone === "coral"
      ? "text-orange-600"
      : tone === "emerald"
        ? "text-emerald-700"
        : "text-violet-700";
  return (
    <div className="rounded-2xl bg-white/70 backdrop-blur p-3 border border-white">
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className={cn("font-display text-lg sm:text-xl font-semibold tabular-nums", toneCls)}>
        {wert}
      </div>
      {suffix && <div className="text-[11px] text-muted-foreground tabular-nums">{suffix}</div>}
    </div>
  );
}

function Tabs({
  current,
  onChange,
  counts,
}: {
  current: Status;
  onChange: (s: Status) => void;
  counts: Record<Status, number>;
}) {
  const tabs: { key: Status; label: string }[] = [
    { key: "offen", label: "Offen" },
    { key: "umgesetzt", label: "Umgesetzt" },
    { key: "ignoriert", label: "Ignoriert" },
  ];
  return (
    <div className="inline-flex items-center gap-1 rounded-full bg-muted p-1 overflow-x-auto">
      {tabs.map((t) => {
        const active = current === t.key;
        return (
          <button
            key={t.key}
            onClick={() => onChange(t.key)}
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-colors whitespace-nowrap",
              active
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
            <span
              className={cn(
                "inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] tabular-nums",
                active ? "bg-primary/10 text-primary" : "bg-foreground/10",
              )}
            >
              {counts[t.key]}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function TypFilter({
  value,
  onChange,
}: {
  value: Set<Typ>;
  onChange: (s: Set<Typ>) => void;
}) {
  const all: Typ[] = ["intervall", "marktpreis", "redundanz", "zombie", "alternative", "guthaben"];
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5 rounded-full">
          <Filter className="size-4" /> Typ
          {value.size > 0 && (
            <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary/10 px-1.5 text-[11px] text-primary tabular-nums">
              {value.size}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel>Nach Typ filtern</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {all.map((t) => (
          <DropdownMenuCheckboxItem
            key={t}
            checked={value.has(t)}
            onCheckedChange={(checked) => {
              const next = new Set(value);
              if (checked) next.add(t);
              else next.delete(t);
              onChange(next);
            }}
          >
            {TYP_META[t].label.replace("Sparvorschlag, ", "")}
          </DropdownMenuCheckboxItem>
        ))}
        {value.size > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onChange(new Set())}>Zurücksetzen</DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function SortDropdown({
  value,
  onChange,
}: {
  value: "hoch" | "niedrig";
  onChange: (s: "hoch" | "niedrig") => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5 rounded-full">
          <ArrowUpDown className="size-4" /> {value === "hoch" ? "Höchste Ersparnis" : "Geringste Ersparnis"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onChange("hoch")}>Höchste Ersparnis zuerst</DropdownMenuItem>
        <DropdownMenuItem onClick={() => onChange("niedrig")}>Geringste zuerst</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function VorschlagCard({
  v,
  tab,
  onUmsetzen,
  onIgnorieren,
  onWiederherstellen,
  onErinnern,
}: {
  v: Vorschlag;
  tab: Status;
  onUmsetzen: () => void;
  onIgnorieren: () => void;
  onWiederherstellen: () => void;
  onErinnern: () => void;
}) {
  const meta = TYP_META[v.typ];
  const Icon = meta.icon;

  return (
    <Card className="group rounded-3xl p-5 transition-all hover:-translate-y-0.5 hover:shadow-md animate-fade-in">
      <div className="flex items-center justify-between">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
            meta.bg,
            meta.tone,
          )}
        >
          <Icon className="size-3.5" /> {meta.label}
        </span>
        {v.hausmarke && (
          <span className="text-[10px] uppercase tracking-wide text-violet-700 bg-violet-50 rounded-full px-2 py-0.5">
            Hausmarke
          </span>
        )}
      </div>

      <h3 className="mt-3 font-display text-lg font-semibold tracking-tight">{v.titel}</h3>

      <div className="mt-2 inline-flex items-baseline gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-emerald-700">
        <span className="font-display text-lg font-semibold tabular-nums">
          spare {fmtEUR(v.ersparnisJahr)}
        </span>
        <span className="text-xs">pro Jahr</span>
        {v.geschaetzt && <span className="text-[10px] text-emerald-700/70 ml-1">geschätzt</span>}
      </div>

      <p className="mt-3 text-sm text-muted-foreground">{v.begruendung}</p>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {v.tools.map((t) => (
          <span
            key={t.name}
            className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-medium"
          >
            <span
              className="size-4 rounded-full grid place-items-center text-[9px] font-bold text-white"
              style={{ background: t.farbe }}
            >
              {t.name[0]}
            </span>
            {t.name}
          </span>
        ))}
      </div>

      {v.typ === "marktpreis" && tab === "offen" && (
        <div className="mt-3 text-[11px] text-muted-foreground">
          basiert auf echten Abrechnungsdaten
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {tab === "offen" && (
          <>
            <Button size="sm" className="rounded-full bg-emerald-600 hover:bg-emerald-700" onClick={onUmsetzen}>
              <Check className="size-4 mr-1" /> {v.aktion}
            </Button>
            <Button size="sm" variant="ghost" className="rounded-full" onClick={onErinnern}>
              <Bell className="size-4 mr-1" /> Später erinnern
            </Button>
            <Button size="sm" variant="ghost" className="rounded-full text-muted-foreground" onClick={onIgnorieren}>
              <X className="size-4 mr-1" /> Ignorieren
            </Button>
          </>
        )}
        {tab === "umgesetzt" && (
          <>
            <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
              <Check className="size-3.5" /> Umgesetzt
            </span>
            <Button size="sm" variant="ghost" className="rounded-full ml-auto" onClick={onWiederherstellen}>
              Zurück in Offen
            </Button>
          </>
        )}
        {tab === "ignoriert" && (
          <>
            <span className="text-xs text-muted-foreground">Ignoriert</span>
            <Button size="sm" variant="ghost" className="rounded-full ml-auto" onClick={onWiederherstellen}>
              Wieder aufnehmen
            </Button>
          </>
        )}
      </div>
    </Card>
  );
}

function EmptyState({ tab }: { tab: Status }) {
  const texts: Record<Status, { titel: string; sub: string }> = {
    offen: {
      titel: "Sauber, aktuell nichts zu optimieren.",
      sub: "Wir melden uns, sobald sich was findet.",
    },
    umgesetzt: { titel: "Noch nichts umgesetzt.", sub: "Hol dir den ersten Vorschlag." },
    ignoriert: { titel: "Keine ignorierten Vorschläge.", sub: "Alles auf dem Schirm." },
  };
  const t = texts[tab];
  return (
    <Card className="rounded-3xl p-10 text-center bg-gradient-to-br from-emerald-50 to-white border-emerald-100">
      <div className="mx-auto size-14 rounded-full bg-emerald-100 grid place-items-center text-emerald-700">
        <PartyPopper className="size-7" />
      </div>
      <h3 className="mt-4 font-display text-xl font-semibold">{t.titel}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{t.sub}</p>
    </Card>
  );
}

function Confetti({ amount }: { amount: number }) {
  const colors = ["#FF7A66", "#12B76A", "#6C5CE7", "#F5A623", "#0099ff"];
  const pieces = useRef(
    Array.from({ length: 36 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.2,
      duration: 1.2 + Math.random() * 0.8,
      color: colors[i % colors.length],
      rot: Math.random() * 360,
    })),
  ).current;

  useEffect(() => {
    if (typeof document === "undefined") return;
    const style = document.createElement("style");
    style.innerHTML = `@keyframes tf-confetti { 0% { transform: translateY(-20vh) rotate(0); opacity: 1 } 100% { transform: translateY(90vh) rotate(720deg); opacity: 0 } }`;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {pieces.map((p) => (
        <span
          key={p.id}
          style={{
            position: "absolute",
            top: 0,
            left: `${p.left}%`,
            width: 8,
            height: 14,
            background: p.color,
            borderRadius: 2,
            transform: `rotate(${p.rot}deg)`,
            animation: `tf-confetti ${p.duration}s cubic-bezier(.2,.6,.4,1) ${p.delay}s forwards`,
          }}
        />
      ))}
      <div className="absolute left-1/2 top-24 -translate-x-1/2 rounded-full bg-emerald-600 text-white px-4 py-2 text-sm font-medium shadow-lg animate-fade-in">
        Stark, {fmtEUR(amount)} pro Jahr geholt
      </div>
    </div>
  );
}
