import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  AlarmClock,
  TimerReset,
  TrendingUp,
  Activity as ActivityIcon,
  Ghost,
  PiggyBank,
  Ticket,
  CreditCard,
  Wallet,
  Download,
  Settings,
  CheckCheck,
  Bell,
  BellOff,
  MoreHorizontal,
  Filter,
  PartyPopper,
  Plus,
  UserPlus,
  ArrowUpRight,
  FileBarChart,
  Edit3,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type AktionTyp =
  | "frist"
  | "trial"
  | "preiserhoehung"
  | "spike"
  | "zombie"
  | "sparvorschlag"
  | "gutschein"
  | "karte"
  | "guthaben"
  | "import";

type Zeitgruppe = "Heute" | "Gestern" | "Diese Woche" | "Älter";

interface Aktion {
  id: string;
  typ: AktionTyp;
  titel: string;
  beschreibung: string;
  chip?: { label: string; tone?: "tool" | "kunde" };
  zeit: string; // relativ
  gruppe: Zeitgruppe;
  ungelesen: boolean;
  aktion: { label: string; to?: string };
}

interface AktivitaetsEintrag {
  id: string;
  typ:
    | "abo-add"
    | "kunde-zuordnen"
    | "import"
    | "vorschlag-umgesetzt"
    | "preis-erhoehung"
    | "report"
    | "zahlungskanal";
  text: string;
  zeit: string;
  gruppe: Zeitgruppe;
}

const TYP_META: Record<
  AktionTyp,
  { icon: typeof AlarmClock; bg: string; fg: string; ring: string }
> = {
  frist: { icon: AlarmClock, bg: "bg-amber-100", fg: "text-amber-700", ring: "ring-amber-200" },
  trial: { icon: TimerReset, bg: "bg-amber-100", fg: "text-amber-700", ring: "ring-amber-200" },
  preiserhoehung: { icon: TrendingUp, bg: "bg-rose-100", fg: "text-rose-700", ring: "ring-rose-200" },
  spike: { icon: ActivityIcon, bg: "bg-rose-100", fg: "text-rose-700", ring: "ring-rose-200" },
  zombie: { icon: Ghost, bg: "bg-muted", fg: "text-muted-foreground", ring: "ring-border" },
  sparvorschlag: { icon: PiggyBank, bg: "bg-emerald-100", fg: "text-emerald-700", ring: "ring-emerald-200" },
  gutschein: { icon: Ticket, bg: "bg-emerald-100", fg: "text-emerald-700", ring: "ring-emerald-200" },
  karte: { icon: CreditCard, bg: "bg-amber-100", fg: "text-amber-700", ring: "ring-amber-200" },
  guthaben: { icon: Wallet, bg: "bg-amber-100", fg: "text-amber-700", ring: "ring-amber-200" },
  import: { icon: Download, bg: "bg-violet-100", fg: "text-violet-700", ring: "ring-violet-200" },
};

const TYP_LABEL: Record<AktionTyp, string> = {
  frist: "Fristen",
  trial: "Trials",
  preiserhoehung: "Preiserhöhungen",
  spike: "Spikes",
  zombie: "Zombies",
  sparvorschlag: "Sparvorschläge",
  gutschein: "Gutscheine",
  karte: "Karten",
  guthaben: "Guthaben",
  import: "Import",
};

const INITIAL_AKTIONEN: Aktion[] = [
  {
    id: "a1",
    typ: "frist",
    titel: "Kündigungsfrist für Adobe Creative Cloud läuft bald ab",
    beschreibung: "Noch 9 Tage, um vor der nächsten Verlängerung zu kündigen.",
    chip: { label: "Adobe CC", tone: "tool" },
    zeit: "vor 2 Stunden",
    gruppe: "Heute",
    ungelesen: true,
    aktion: { label: "Frist ansehen", to: "/abos" },
  },
  {
    id: "a2",
    typ: "preiserhoehung",
    titel: "Preiserhöhung bei Notion erkannt",
    beschreibung: "Der Platzpreis steigt um 18 %, ab nächstem Abrechnungszyklus.",
    chip: { label: "Notion", tone: "tool" },
    zeit: "vor 4 Stunden",
    gruppe: "Heute",
    ungelesen: true,
    aktion: { label: "Vergleichen", to: "/abos" },
  },
  {
    id: "a3",
    typ: "sparvorschlag",
    titel: "Neuer Sparvorschlag: Figma jährlich",
    beschreibung: "Stell Figma auf jährlich um und spar 144,00 € im Jahr.",
    chip: { label: "Figma", tone: "tool" },
    zeit: "vor 6 Stunden",
    gruppe: "Heute",
    ungelesen: true,
    aktion: { label: "Vorschlag ansehen", to: "/sparvorschlaege" },
  },
  {
    id: "a4",
    typ: "trial",
    titel: "Trial bei Linear kippt morgen in ein Abo",
    beschreibung: "Wenn du nichts tust, wird ab morgen monatlich abgerechnet.",
    chip: { label: "Linear", tone: "tool" },
    zeit: "gestern",
    gruppe: "Gestern",
    ungelesen: false,
    aktion: { label: "Entscheiden", to: "/abos" },
  },
  {
    id: "a5",
    typ: "spike",
    titel: "AI-Spend-Spike bei OpenAI",
    beschreibung: "Verbrauch liegt diesen Monat 62 % über deinem Schnitt.",
    chip: { label: "OpenAI", tone: "tool" },
    zeit: "gestern",
    gruppe: "Gestern",
    ungelesen: true,
    aktion: { label: "Verlauf ansehen", to: "/abos" },
  },
  {
    id: "a6",
    typ: "gutschein",
    titel: "Neuer Gutschein für Calendly",
    beschreibung: "2 Monate gratis bei Jahreszahlung, gültig bis 31.07.2026.",
    chip: { label: "Calendly", tone: "tool" },
    zeit: "vor 2 Tagen",
    gruppe: "Diese Woche",
    ungelesen: false,
    aktion: { label: "Gutschein ansehen", to: "/sparvorschlaege" },
  },
  {
    id: "a7",
    typ: "karte",
    titel: "Mastercard •••• 7093 läuft im August ab",
    beschreibung: "Aktualisiere die Karte rechtzeitig, damit keine Zahlung fehlschlägt.",
    chip: { label: "Zahlungskanal", tone: "kunde" },
    zeit: "vor 3 Tagen",
    gruppe: "Diese Woche",
    ungelesen: false,
    aktion: { label: "Karte aktualisieren", to: "/zahlungskanaele" },
  },
  {
    id: "a8",
    typ: "zombie",
    titel: "Loom läuft ohne Nutzung",
    beschreibung: "Seit 5 Monaten keine Aufnahme, ein Kandidat zum Kündigen.",
    chip: { label: "Loom", tone: "tool" },
    zeit: "vor 4 Tagen",
    gruppe: "Diese Woche",
    ungelesen: false,
    aktion: { label: "Kündigung prüfen", to: "/sparvorschlaege" },
  },
  {
    id: "a9",
    typ: "guthaben",
    titel: "ElevenLabs-Guthaben verfällt",
    beschreibung: "12,00 € Restguthaben verfallen am 31.07. ungenutzt.",
    chip: { label: "ElevenLabs", tone: "tool" },
    zeit: "vor 5 Tagen",
    gruppe: "Diese Woche",
    ungelesen: false,
    aktion: { label: "Vorschlag ansehen", to: "/sparvorschlaege" },
  },
  {
    id: "a10",
    typ: "import",
    titel: "Kontoauszug erfolgreich importiert",
    beschreibung: "14 neue Abos erkannt, du kannst sie jetzt zuordnen.",
    chip: { label: "Import", tone: "kunde" },
    zeit: "vor 6 Tagen",
    gruppe: "Diese Woche",
    ungelesen: false,
    aktion: { label: "Abos ansehen", to: "/abos" },
  },
];

const AKTIVITAET: AktivitaetsEintrag[] = [
  { id: "h1", typ: "abo-add", text: "Abo Notion hinzugefügt.", zeit: "vor 1 Stunde", gruppe: "Heute" },
  { id: "h2", typ: "kunde-zuordnen", text: "Kunde Kessler zu Calendly zugeordnet.", zeit: "vor 3 Stunden", gruppe: "Heute" },
  { id: "h3", typ: "vorschlag-umgesetzt", text: "Sparvorschlag Adobe CC umgesetzt, 240,00 € pro Jahr geholt.", zeit: "vor 5 Stunden", gruppe: "Heute" },
  { id: "h4", typ: "preis-erhoehung", text: "Preiserhöhung bei Notion erkannt (+18 %).", zeit: "gestern", gruppe: "Gestern" },
  { id: "h5", typ: "report", text: "Weiterverrechnungs-Report für Nordwerk erstellt.", zeit: "gestern", gruppe: "Gestern" },
  { id: "h6", typ: "import", text: "Kontoauszug importiert, 14 Abos hinzugefügt.", zeit: "vor 2 Tagen", gruppe: "Diese Woche" },
  { id: "h7", typ: "vorschlag-umgesetzt", text: "Sparvorschlag Figma umgesetzt, 144,00 € pro Jahr geholt.", zeit: "vor 3 Tagen", gruppe: "Diese Woche" },
  { id: "h8", typ: "kunde-zuordnen", text: "Kunde Solea zu Loom zugeordnet.", zeit: "vor 3 Tagen", gruppe: "Diese Woche" },
  { id: "h9", typ: "zahlungskanal", text: "Zahlungskanal Mastercard •••• 7093 bearbeitet.", zeit: "vor 4 Tagen", gruppe: "Diese Woche" },
  { id: "h10", typ: "abo-add", text: "Abo Linear hinzugefügt.", zeit: "vor 5 Tagen", gruppe: "Diese Woche" },
  { id: "h11", typ: "report", text: "Monatsbericht Juni erstellt.", zeit: "vor 8 Tagen", gruppe: "Älter" },
  { id: "h12", typ: "vorschlag-umgesetzt", text: "Sparvorschlag Mailchimp umgesetzt, 180,00 € pro Jahr geholt.", zeit: "vor 12 Tagen", gruppe: "Älter" },
  { id: "h13", typ: "preis-erhoehung", text: "Preiserhöhung bei Slack erkannt (+10 %).", zeit: "vor 14 Tagen", gruppe: "Älter" },
  { id: "h14", typ: "import", text: "PayPal-Konto verbunden und 6 Abos importiert.", zeit: "vor 18 Tagen", gruppe: "Älter" },
  { id: "h15", typ: "zahlungskanal", text: "Zahlungskanal Visa •••• 4421 hinzugefügt.", zeit: "vor 22 Tagen", gruppe: "Älter" },
];

const AKTIVITAET_ICON: Record<AktivitaetsEintrag["typ"], typeof Plus> = {
  "abo-add": Plus,
  "kunde-zuordnen": UserPlus,
  import: Download,
  "vorschlag-umgesetzt": Check,
  "preis-erhoehung": ArrowUpRight,
  report: FileBarChart,
  zahlungskanal: Edit3,
};

const GRUPPEN: Zeitgruppe[] = ["Heute", "Gestern", "Diese Woche", "Älter"];

export function Benachrichtigungen() {
  const [aktionen, setAktionen] = useState<Aktion[]>(INITIAL_AKTIONEN);
  const [archiv, setArchiv] = useState<Aktion[]>([]);
  const [tab, setTab] = useState<"aktionen" | "aktivitaet">("aktionen");
  const [filter, setFilter] = useState<Set<AktionTyp>>(new Set());

  const offen = aktionen.length;
  const ungelesen = aktionen.filter((a) => a.ungelesen).length;

  const gefiltert = useMemo(() => {
    if (filter.size === 0) return aktionen;
    return aktionen.filter((a) => filter.has(a.typ));
  }, [aktionen, filter]);

  const gruppiertAktionen = useMemo(() => {
    return GRUPPEN.map((g) => ({ gruppe: g, items: gefiltert.filter((a) => a.gruppe === g) }));
  }, [gefiltert]);

  const gruppiertAktivitaet = useMemo(() => {
    return GRUPPEN.map((g) => ({ gruppe: g, items: AKTIVITAET.filter((a) => a.gruppe === g) }));
  }, []);

  const markGelesen = (id: string) => {
    setAktionen((prev) => prev.map((a) => (a.id === id ? { ...a, ungelesen: false } : a)));
  };

  const removeAktion = (id: string, undoMsg: string) => {
    const target = aktionen.find((a) => a.id === id);
    if (!target) return;
    const prev = aktionen;
    setAktionen((p) => p.filter((a) => a.id !== id));
    setArchiv((p) => [target, ...p]);
    toast(undoMsg, {
      action: { label: "Rückgängig", onClick: () => setAktionen(prev) },
    });
  };

  const alleGelesen = () => {
    const prev = aktionen;
    setAktionen([]);
    setArchiv((p) => [...prev, ...p]);
    toast("Alles auf gelesen gesetzt", {
      action: { label: "Rückgängig", onClick: () => setAktionen(prev) },
    });
  };

  const toggleFilter = (t: AktionTyp) => {
    const next = new Set(filter);
    if (next.has(t)) next.delete(t);
    else next.add(t);
    setFilter(next);
  };

  return (
    <div className="space-y-6">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 sm:flex sm:flex-wrap sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight truncate">
              Benachrichtigungen
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
              {offen} offen
            </span>
          </div>
          <p className="mt-1 text-muted-foreground">
            Hier landet, was deine Aufmerksamkeit braucht, und was schon passiert ist.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            className="rounded-full gap-1.5"
            onClick={alleGelesen}
            disabled={offen === 0}
          >
            <CheckCheck className="size-4" /> <span className="hidden sm:inline">Alle als gelesen</span>
          </Button>
          <Button variant="ghost" size="sm" className="rounded-full gap-1.5 text-muted-foreground" asChild>
            <a href="#" aria-label="Benachrichtigungs-Einstellungen">
              <Settings className="size-4" /> <span className="hidden md:inline">Einstellungen</span>
            </a>
          </Button>
        </div>
      </header>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs
          current={tab}
          onChange={setTab}
          counts={{ aktionen: offen, aktivitaet: AKTIVITAET.length }}
        />
        {tab === "aktionen" && (
          <FilterChips filter={filter} onToggle={toggleFilter} onReset={() => setFilter(new Set())} />
        )}
      </div>

      {tab === "aktionen" ? (
        offen === 0 ? (
          <EmptyAktionen />
        ) : (
          <div className="space-y-6">
            {gruppiertAktionen.map(
              ({ gruppe, items }) =>
                items.length > 0 && (
                  <section key={gruppe} className="space-y-2">
                    <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground px-1">
                      {gruppe}
                    </h2>
                    <div className="space-y-2">
                      {items.map((a) => (
                        <AktionRow
                          key={a.id}
                          a={a}
                          onMarkGelesen={() => markGelesen(a.id)}
                          onErledigt={() => removeAktion(a.id, `${a.titel} erledigt`)}
                          onIgnorieren={() => removeAktion(a.id, `${a.titel} ignoriert`)}
                          onErinnern={() =>
                            toast("In 7 Tagen erinnern wir dich.", { description: a.titel })
                          }
                        />
                      ))}
                    </div>
                  </section>
                ),
            )}
            {ungelesen > 0 && (
              <p className="text-xs text-muted-foreground px-1">
                {ungelesen} ungelesen
              </p>
            )}
          </div>
        )
      ) : (
        <div className="space-y-6">
          {gruppiertAktivitaet.map(
            ({ gruppe, items }) =>
              items.length > 0 && (
                <section key={gruppe} className="space-y-2">
                  <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground px-1">
                    {gruppe}
                  </h2>
                  <Card className="rounded-2xl p-2">
                    <ol className="relative">
                      <span
                        aria-hidden
                        className="absolute left-[1.4rem] top-3 bottom-3 w-px bg-border"
                      />
                      {items.map((h) => {
                        const Icon = AKTIVITAET_ICON[h.typ];
                        return (
                          <li
                            key={h.id}
                            className="relative flex items-start gap-3 rounded-xl px-3 py-2.5 hover:bg-muted/50 transition-colors"
                          >
                            <span className="relative z-10 grid size-7 shrink-0 place-items-center rounded-full bg-background ring-1 ring-border text-muted-foreground">
                              <Icon className="size-3.5" />
                            </span>
                            <div className="min-w-0 flex-1">
                              <div className="text-sm">{h.text}</div>
                              <div className="text-[11px] text-muted-foreground tabular-nums">
                                {h.zeit}
                              </div>
                            </div>
                          </li>
                        );
                      })}
                    </ol>
                  </Card>
                </section>
              ),
          )}
        </div>
      )}
    </div>
  );
}

function Tabs({
  current,
  onChange,
  counts,
}: {
  current: "aktionen" | "aktivitaet";
  onChange: (t: "aktionen" | "aktivitaet") => void;
  counts: { aktionen: number; aktivitaet: number };
}) {
  const tabs = [
    { key: "aktionen" as const, label: "Aktionen" },
    { key: "aktivitaet" as const, label: "Aktivität" },
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

function FilterChips({
  filter,
  onToggle,
  onReset,
}: {
  filter: Set<AktionTyp>;
  onToggle: (t: AktionTyp) => void;
  onReset: () => void;
}) {
  const all: AktionTyp[] = [
    "frist",
    "trial",
    "spike",
    "preiserhoehung",
    "sparvorschlag",
    "gutschein",
    "karte",
    "import",
  ];
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto -mx-1 px-1 max-w-full">
      <Filter className="size-4 text-muted-foreground shrink-0" />
      {all.map((t) => {
        const active = filter.has(t);
        return (
          <button
            key={t}
            onClick={() => onToggle(t)}
            className={cn(
              "inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              active
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:text-foreground hover:bg-muted",
            )}
          >
            {TYP_LABEL[t]}
          </button>
        );
      })}
      {filter.size > 0 && (
        <button
          onClick={onReset}
          className="ml-1 inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
        >
          Zurücksetzen
        </button>
      )}
    </div>
  );
}

function AktionRow({
  a,
  onMarkGelesen,
  onErledigt,
  onIgnorieren,
  onErinnern,
}: {
  a: Aktion;
  onMarkGelesen: () => void;
  onErledigt: () => void;
  onIgnorieren: () => void;
  onErinnern: () => void;
}) {
  const meta = TYP_META[a.typ];
  const Icon = meta.icon;
  return (
    <Card
      className={cn(
        "group rounded-2xl p-4 sm:p-5 transition-all hover:-translate-y-0.5 hover:shadow-md",
        a.ungelesen && "ring-1 ring-primary/30 bg-primary/[0.02]",
      )}
    >
      <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3 sm:gap-4">
        <span
          className={cn(
            "relative grid size-10 shrink-0 place-items-center rounded-full ring-1",
            meta.bg,
            meta.fg,
            meta.ring,
          )}
        >
          <Icon className="size-5" />
          {a.ungelesen && (
            <span className="absolute -top-0.5 -right-0.5 size-2.5 rounded-full bg-primary ring-2 ring-background" />
          )}
        </span>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <h3 className="font-display text-base sm:text-lg font-semibold leading-tight">
              {a.titel}
            </h3>
            {a.chip && (
              <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                {a.chip.label}
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{a.beschreibung}</p>
          <div className="mt-1.5 text-[11px] text-muted-foreground tabular-nums">{a.zeit}</div>

          {/* Aktionen unterhalb auf Mobile */}
          <div className="mt-3 flex flex-wrap items-center gap-2 sm:hidden">
            <PrimaryAktion a={a} onErledigt={onErledigt} />
            <RowMenu
              ungelesen={a.ungelesen}
              onMarkGelesen={onMarkGelesen}
              onErinnern={onErinnern}
              onIgnorieren={onIgnorieren}
            />
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1 shrink-0">
          <PrimaryAktion a={a} onErledigt={onErledigt} />
          <RowMenu
            ungelesen={a.ungelesen}
            onMarkGelesen={onMarkGelesen}
            onErinnern={onErinnern}
            onIgnorieren={onIgnorieren}
          />
        </div>
      </div>
    </Card>
  );
}

function PrimaryAktion({ a, onErledigt }: { a: Aktion; onErledigt: () => void }) {
  if (a.aktion.to) {
    return (
      <Button asChild size="sm" className="rounded-full" onClick={onErledigt}>
        <Link to={a.aktion.to as "/"}>{a.aktion.label}</Link>
      </Button>
    );
  }
  return (
    <Button size="sm" className="rounded-full" onClick={onErledigt}>
      {a.aktion.label}
    </Button>
  );
}

function RowMenu({
  ungelesen,
  onMarkGelesen,
  onErinnern,
  onIgnorieren,
}: {
  ungelesen: boolean;
  onMarkGelesen: () => void;
  onErinnern: () => void;
  onIgnorieren: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full" aria-label="Weitere Aktionen">
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {ungelesen && (
          <DropdownMenuItem onClick={onMarkGelesen}>
            <Bell className="size-4 mr-2" /> Als gelesen markieren
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={onErinnern}>
          <TimerReset className="size-4 mr-2" /> Später erinnern
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onIgnorieren} className="text-muted-foreground">
          <BellOff className="size-4 mr-2" /> Ignorieren
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function EmptyAktionen() {
  return (
    <Card className="rounded-3xl p-10 text-center bg-gradient-to-br from-emerald-50 to-white border-emerald-100">
      <div className="mx-auto size-14 rounded-full bg-emerald-100 grid place-items-center text-emerald-700">
        <PartyPopper className="size-7" />
      </div>
      <h3 className="mt-4 font-display text-xl font-semibold">
        Alles erledigt, hier ist gerade nichts zu tun.
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Wir melden uns, sobald etwas deine Aufmerksamkeit braucht.
      </p>
    </Card>
  );
}
