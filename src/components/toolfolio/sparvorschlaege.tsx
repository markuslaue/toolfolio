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
  Ticket,
  ShieldCheck,
  Copy,
  ExternalLink,
  Handshake,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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

type Typ =
  | "intervall"
  | "marktpreis"
  | "redundanz"
  | "zombie"
  | "alternative"
  | "guthaben"
  | "gutschein"
  | "retention";
type Status = "offen" | "umgesetzt" | "ignoriert";

interface Vorschlag {
  id: string;
  typ: Typ;
  titel: string;
  ersparnisJahr: number;
  ersparnisMax?: number; // für Spannen (Retention)
  geschaetzt?: boolean;
  weicherWert?: boolean; // zählt nicht voll ins offene Potenzial
  begruendung: string;
  tools: { name: string; farbe: string }[];
  aktion: string;
  hausmarke?: boolean;
  status: Status;
  // Gutschein
  code?: string;
  gueltig?: string;
  partner?: boolean;
  einloesenUrl?: string;
  // Retention
  konfidenz?: string;
}

const TYP_META: Record<Typ, { label: string; icon: typeof Calendar; tone: string; bg: string }> = {
  intervall: { label: "Sparvorschlag, Intervall", icon: Calendar, tone: "text-emerald-700", bg: "bg-emerald-100" },
  marktpreis: { label: "Sparvorschlag, Marktpreis", icon: TrendingDown, tone: "text-violet-700", bg: "bg-violet-100" },
  redundanz: { label: "Sparvorschlag, Redundanz", icon: LayersIcon, tone: "text-amber-700", bg: "bg-amber-100" },
  zombie: { label: "Sparvorschlag, Zombie-Abo", icon: Ghost, tone: "text-rose-700", bg: "bg-rose-100" },
  alternative: { label: "Sparvorschlag, Alternative", icon: ArrowLeftRight, tone: "text-violet-700", bg: "bg-violet-100" },
  guthaben: { label: "Sparvorschlag, Guthaben", icon: Wallet, tone: "text-amber-700", bg: "bg-amber-100" },
  gutschein: { label: "Sparvorschlag, Gutschein", icon: Ticket, tone: "text-emerald-700", bg: "bg-emerald-100" },
  retention: { label: "Sparvorschlag, Kündigungs-Rabatt", icon: ShieldPercent, tone: "text-violet-700", bg: "bg-gradient-to-r from-amber-100 to-violet-100" },
};

const INITIAL: Vorschlag[] = [
  // Offen
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
  // Neu: Gutscheine
  {
    id: "g1",
    typ: "gutschein",
    titel: "Gutschein für Calendly",
    ersparnisJahr: 32,
    begruendung: "2 Monate gratis bei Umstellung auf Jahreszahlung.",
    tools: [{ name: "Calendly", farbe: "#006bff" }],
    aktion: "Gutschein einlösen",
    status: "offen",
    code: "JAHR2FREI",
    gueltig: "gültig bis 31.07.2026",
    partner: true,
    einloesenUrl: "https://calendly.com/pricing",
  },
  {
    id: "g2",
    typ: "gutschein",
    titel: "Gutschein für Ahrefs",
    ersparnisJahr: 192,
    begruendung: "20 % Rabatt auf das erste Jahr.",
    tools: [{ name: "Ahrefs", farbe: "#0070f3" }],
    aktion: "Code kopieren",
    status: "offen",
    code: "AHREFS20",
    gueltig: "unbefristete Aktion",
    partner: false,
    einloesenUrl: "https://ahrefs.com/pricing",
  },
  // Neu: Retention
  {
    id: "r1",
    typ: "retention",
    titel: "Kündigungs-Rabatt möglich bei Adobe Creative Cloud",
    ersparnisJahr: 144,
    ersparnisMax: 216,
    geschaetzt: true,
    weicherWert: true,
    begruendung:
      "Viele Anbieter bieten im Kündigungsprozess einen Rabatt an, um dich zu halten, dauerhaft oder für einige Monate.",
    konfidenz: "erfahrungsgemäß, von der Community gemeldet, nicht garantiert",
    tools: [{ name: "Adobe CC", farbe: "#d83b01" }],
    aktion: "Rabatt-Strategie ansehen",
    status: "offen",
  },
  {
    id: "r2",
    typ: "retention",
    titel: "Kündigungs-Rabatt möglich bei Calendly",
    ersparnisJahr: 24,
    ersparnisMax: 48,
    geschaetzt: true,
    weicherWert: true,
    begruendung:
      "Im Kündigungsprozess wird häufig ein vorübergehender Rabatt für mehrere Monate angeboten.",
    konfidenz: "erfahrungsgemäß, von der Community gemeldet, nicht garantiert",
    tools: [{ name: "Calendly", farbe: "#006bff" }],
    aktion: "Rabatt-Strategie ansehen",
    status: "offen",
  },
  // Umgesetzt
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
    begruendung: "Günstigere Anbieter verfügbar, Performance ist uns aber wichtig.",
    tools: [{ name: "Vercel", farbe: "#0F1419" }],
    aktion: "Tarife vergleichen",
    status: "ignoriert",
  },
];

const REALISIERT_BASIS = 840;
const GESAMT_POTENZIAL = 1284;

export function Sparvorschlaege() {
  const [items, setItems] = useState<Vorschlag[]>(INITIAL);
  const [tab, setTab] = useState<Status>("offen");
  const [typFilter, setTypFilter] = useState<Set<Typ>>(new Set());
  const [sort, setSort] = useState<"hoch" | "niedrig">("hoch");
  const [confetti, setConfetti] = useState<{ key: number; amount: number } | null>(null);
  const [highlightId, setHighlightId] = useState<string | null>(null);

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

  // Hartes offenes Potenzial: ohne weiche Werte (Retention)
  const offenSumme = useMemo(
    () =>
      items
        .filter((i) => i.status === "offen" && !i.weicherWert)
        .reduce((s, i) => s + i.ersparnisJahr, 0),
    [items],
  );
  // Zusätzlich möglich: weiche Werte (Spannen-Untergrenze)
  const zusaetzlichMoeglich = useMemo(
    () =>
      items
        .filter((i) => i.status === "offen" && i.weicherWert)
        .reduce((s, i) => s + i.ersparnisJahr, 0),
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

  // Map: Tool -> verfügbarer Gutschein (für Chip an anderen Karten)
  const gutscheinByTool = useMemo(() => {
    const map = new Map<string, Vorschlag>();
    items
      .filter((i) => i.typ === "gutschein" && i.status === "offen")
      .forEach((g) => g.tools.forEach((t) => map.set(t.name, g)));
    return map;
  }, [items]);

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
  const ignorieren = (v: Vorschlag) => setStatus(v.id, "ignoriert", `${v.titel} ignoriert`);
  const wiederherstellen = (v: Vorschlag) =>
    setStatus(v.id, "offen", `${v.titel} zurück in Offen`);

  const jumpTo = (id: string) => {
    setTab("offen");
    setTypFilter(new Set());
    setTimeout(() => {
      const el = document.getElementById(`vorschlag-${id}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        setHighlightId(id);
        setTimeout(() => setHighlightId(null), 1600);
      }
    }, 60);
  };

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

      <SparHero
        realisiert={realisiert}
        offen={offenSumme}
        zusaetzlich={zusaetzlichMoeglich}
        anzahl={offenAnzahl}
      />

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
          {sichtbar.map((v) => {
            const gutschein =
              v.typ !== "gutschein"
                ? v.tools.map((t) => gutscheinByTool.get(t.name)).find(Boolean)
                : undefined;
            return (
              <VorschlagCard
                key={v.id}
                v={v}
                tab={tab}
                highlight={highlightId === v.id}
                gutscheinChip={gutschein ? { id: gutschein.id, tool: gutschein.tools[0].name } : null}
                onJumpToGutschein={(id) => jumpTo(id)}
                onUmsetzen={() => umsetzen(v)}
                onIgnorieren={() => ignorieren(v)}
                onWiederherstellen={() => wiederherstellen(v)}
                onErinnern={() =>
                  toast("Wir erinnern dich in 7 Tagen.", { description: v.titel })
                }
              />
            );
          })}
        </div>
      )}

      {confetti && <Confetti key={confetti.key} amount={confetti.amount} />}
    </div>
  );
}

function SparHero({
  realisiert,
  offen,
  zusaetzlich,
  anzahl,
}: {
  realisiert: number;
  offen: number;
  zusaetzlich: number;
  anzahl: number;
}) {
  const ziel = GESAMT_POTENZIAL;
  const animated = useCountUp(realisiert, 800);
  const pct = Math.min(1, animated / ziel);

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
            <circle cx={size / 2} cy={size / 2} r={r} stroke="hsl(20 90% 95%)" strokeWidth={stroke} fill="none" />
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

          <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Kpi label="offenes Potenzial" wert={fmtEUR(offen)} suffix="/ Jahr" tone="coral" />
            <Kpi label="realisiert" wert={fmtEUR(realisiert)} suffix="/ Jahr" tone="emerald" />
            <Kpi label="offene Vorschläge" wert={String(anzahl)} tone="violet" />
            <Kpi
              label="zusätzlich möglich"
              wert={`ab ${fmtEUR(zusaetzlich)}`}
              suffix="Kündigungs-Rabatte"
              tone="amber"
            />
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
  tone: "coral" | "emerald" | "violet" | "amber";
}) {
  const toneCls =
    tone === "coral"
      ? "text-orange-600"
      : tone === "emerald"
        ? "text-emerald-700"
        : tone === "amber"
          ? "text-amber-700"
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
              active ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
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

function TypFilter({ value, onChange }: { value: Set<Typ>; onChange: (s: Set<Typ>) => void }) {
  const all: Typ[] = [
    "intervall",
    "marktpreis",
    "redundanz",
    "zombie",
    "alternative",
    "guthaben",
    "gutschein",
    "retention",
  ];
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
      <DropdownMenuContent align="end" className="w-56">
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
          <ArrowUpDown className="size-4" />{" "}
          {value === "hoch" ? "Höchste Ersparnis" : "Geringste Ersparnis"}
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
  highlight,
  gutscheinChip,
  onJumpToGutschein,
  onUmsetzen,
  onIgnorieren,
  onWiederherstellen,
  onErinnern,
}: {
  v: Vorschlag;
  tab: Status;
  highlight: boolean;
  gutscheinChip: { id: string; tool: string } | null;
  onJumpToGutschein: (id: string) => void;
  onUmsetzen: () => void;
  onIgnorieren: () => void;
  onWiederherstellen: () => void;
  onErinnern: () => void;
}) {
  const meta = TYP_META[v.typ];
  const Icon = meta.icon;

  const copyCode = async () => {
    if (!v.code) return;
    try {
      await navigator.clipboard.writeText(v.code);
      toast("Code kopiert", { description: v.code });
    } catch {
      toast("Konnte Code nicht kopieren");
    }
  };

  return (
    <Card
      id={`vorschlag-${v.id}`}
      className={cn(
        "group rounded-3xl p-5 transition-all hover:-translate-y-0.5 hover:shadow-md animate-fade-in",
        highlight && "ring-2 ring-emerald-400 ring-offset-2",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
            meta.bg,
            meta.tone,
          )}
        >
          <Icon className="size-3.5" /> {meta.label}
        </span>
        <div className="flex items-center gap-1.5">
          {v.partner && (
            <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-medium text-violet-700 ring-1 ring-violet-200">
              <Handshake className="size-3" /> Partner-Deal
            </span>
          )}
          {v.hausmarke && (
            <span className="text-[10px] uppercase tracking-wide text-violet-700 bg-violet-50 rounded-full px-2 py-0.5">
              Hausmarke
            </span>
          )}
        </div>
      </div>

      <h3 className="mt-3 font-display text-lg font-semibold tracking-tight">{v.titel}</h3>

      {/* Spar-Badge */}
      {v.typ === "retention" ? (
        <div className="mt-2 inline-flex items-baseline gap-1.5 rounded-full bg-gradient-to-r from-amber-50 to-violet-50 px-3 py-1.5 text-violet-700 ring-1 ring-violet-100">
          <span className="font-display text-base font-semibold tabular-nums">
            erfahrungsgemäß {fmtEUR(v.ersparnisJahr)}
            {v.ersparnisMax ? ` bis ${fmtEUR(v.ersparnisMax)}` : ""}
          </span>
          <span className="text-xs">pro Jahr möglich</span>
        </div>
      ) : (
        <div className="mt-2 inline-flex items-baseline gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-emerald-700">
          <span className="font-display text-lg font-semibold tabular-nums">
            spare {fmtEUR(v.ersparnisJahr)}
          </span>
          <span className="text-xs">
            {v.typ === "gutschein" ? "im ersten Jahr" : "pro Jahr"}
          </span>
          {v.geschaetzt && <span className="text-[10px] text-emerald-700/70 ml-1">geschätzt</span>}
        </div>
      )}

      <p className="mt-3 text-sm text-muted-foreground">{v.begruendung}</p>

      {/* Gutschein-Code-Feld */}
      {v.typ === "gutschein" && v.code && (
        <div className="mt-3 flex items-center justify-between gap-2 rounded-xl border border-dashed border-emerald-300 bg-emerald-50/60 px-3 py-2">
          <div className="min-w-0">
            <div className="text-[10px] uppercase tracking-wide text-emerald-700/70">Code</div>
            <div className="font-mono text-sm font-semibold text-emerald-900 truncate">{v.code}</div>
          </div>
          <Button size="sm" variant="outline" className="rounded-full shrink-0" onClick={copyCode}>
            <Copy className="size-3.5 mr-1" /> Kopieren
          </Button>
        </div>
      )}

      {v.typ === "gutschein" && v.gueltig && (
        <div className="mt-2 text-[11px] text-muted-foreground">{v.gueltig}</div>
      )}

      {/* Retention Konfidenz */}
      {v.typ === "retention" && v.konfidenz && (
        <div className="mt-3 flex items-start gap-1.5 rounded-xl bg-amber-50 px-3 py-2 text-[11px] text-amber-800 ring-1 ring-amber-100">
          <Info className="size-3.5 mt-0.5 shrink-0" />
          <span>{v.konfidenz}</span>
        </div>
      )}

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

        {gutscheinChip && tab === "offen" && (
          <button
            type="button"
            onClick={() => onJumpToGutschein(gutscheinChip.id)}
            className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200 hover:bg-emerald-100 transition-colors"
          >
            <Ticket className="size-3.5" /> Gutschein verfügbar
          </button>
        )}
      </div>

      {v.typ === "marktpreis" && tab === "offen" && (
        <div className="mt-3 text-[11px] text-muted-foreground">
          basiert auf echten Abrechnungsdaten
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {tab === "offen" && (
          <>
            {v.typ === "gutschein" ? (
              <>
                {v.einloesenUrl && (
                  <Button
                    size="sm"
                    className="rounded-full bg-emerald-600 hover:bg-emerald-700"
                    asChild
                  >
                    <a href={v.einloesenUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="size-4 mr-1" /> Gutschein einlösen
                    </a>
                  </Button>
                )}
                {v.code && (
                  <Button size="sm" variant="outline" className="rounded-full" onClick={copyCode}>
                    <Copy className="size-4 mr-1" /> Code kopieren
                  </Button>
                )}
                <Button size="sm" variant="ghost" className="rounded-full" onClick={onUmsetzen}>
                  <Check className="size-4 mr-1" /> Eingelöst
                </Button>
              </>
            ) : v.typ === "retention" ? (
              <>
                <RetentionDialog v={v} onUmsetzen={onUmsetzen} />
                <Button size="sm" variant="ghost" className="rounded-full" onClick={onErinnern}>
                  <Bell className="size-4 mr-1" /> Später erinnern
                </Button>
              </>
            ) : (
              <>
                <Button
                  size="sm"
                  className="rounded-full bg-emerald-600 hover:bg-emerald-700"
                  onClick={onUmsetzen}
                >
                  <Check className="size-4 mr-1" /> {v.aktion}
                </Button>
                <Button size="sm" variant="ghost" className="rounded-full" onClick={onErinnern}>
                  <Bell className="size-4 mr-1" /> Später erinnern
                </Button>
              </>
            )}
            <Button
              size="sm"
              variant="ghost"
              className="rounded-full text-muted-foreground"
              onClick={onIgnorieren}
            >
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

function RetentionDialog({ v, onUmsetzen }: { v: Vorschlag; onUmsetzen: () => void }) {
  const [open, setOpen] = useState(false);
  const tool = v.tools[0]?.name ?? "den Anbieter";
  const schritte = [
    {
      titel: "Kündigung im Konto starten",
      text: `Geh in deinem ${tool}-Konto in die Abo-Einstellungen und starte die Kündigung. Halteangebote erscheinen meist erst, wenn der Anbieter merkt, dass du es ernst meinst.`,
    },
    {
      titel: "Auf das Halteangebot warten",
      text: "Im letzten Schritt kommt häufig ein Pop-up oder eine Mail mit Rabatt, Gratismonaten oder einem günstigeren Tarif. Lies das Angebot in Ruhe.",
    },
    {
      titel: "Angebot annehmen oder wirklich kündigen",
      text: "Passt das Angebot, nimm es an. Passt es nicht, zieh die Kündigung durch. Beides ist okay.",
    },
    {
      titel: "Ergebnis in Toolfolio festhalten",
      text: "Markiere danach hier 'Rabatt erhalten' oder 'gekündigt', damit dein Tracker stimmt. Den Ablauf kannst du auch über den Kündigungs-Assistenten starten.",
    },
  ];
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="rounded-full bg-violet-600 hover:bg-violet-700">
          <ShieldPercent className="size-4 mr-1" /> Rabatt-Strategie ansehen
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display">Kündigungs-Rabatt holen, Schritt für Schritt</DialogTitle>
          <DialogDescription>
            So gehst du bei {tool} vor. Erfahrungswert, kein garantierter Ablauf.
          </DialogDescription>
        </DialogHeader>
        <ol className="mt-2 space-y-3">
          {schritte.map((s, i) => (
            <li key={i} className="flex gap-3">
              <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-violet-100 text-violet-700 text-xs font-semibold">
                {i + 1}
              </span>
              <div>
                <div className="text-sm font-semibold">{s.titel}</div>
                <div className="text-sm text-muted-foreground">{s.text}</div>
              </div>
            </li>
          ))}
        </ol>
        <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
          <Button
            variant="outline"
            className="rounded-full"
            onClick={() => {
              setOpen(false);
              toast("Als gekündigt vermerkt", { description: v.titel });
            }}
          >
            Wirklich gekündigt
          </Button>
          <Button
            className="rounded-full bg-emerald-600 hover:bg-emerald-700"
            onClick={() => {
              setOpen(false);
              onUmsetzen();
            }}
          >
            <Check className="size-4 mr-1" /> Rabatt erhalten
          </Button>
        </div>
      </DialogContent>
    </Dialog>
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
