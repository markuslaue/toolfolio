import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Plus,
  MoreHorizontal,
  Pencil,
  Archive,
  FileText,
  ArrowRight,
  LayoutGrid,
  Table as TableIcon,
  Search,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { cn } from "@/lib/utils";
import { fmtEUR } from "@/lib/toolfolio-data";

type KundeStatus = "aktiv" | "inaktiv" | "archiviert";

interface Kunde {
  id: string;
  name: string;
  ansprechpartner?: string;
  email?: string;
  farbe: string;
  status: KundeStatus;
  tools: number;
  kostenMonat: number;
  weiterverrechnet: boolean;
  aufschlagProzent: number;
  notizen?: string;
}

const FARBEN = [
  "#6C5CE7",
  "#12B76A",
  "#FF7A66",
  "#F5A623",
  "#3A57E8",
  "#0EA371",
  "#cc785c",
  "#7a5af8",
  "#0e7ec6",
];

const initialKunden: Kunde[] = [
  {
    id: "k1",
    name: "Kunde Vitalplant",
    ansprechpartner: "Lara Hoffmann",
    email: "lara@vitalplant.de",
    farbe: "#6C5CE7",
    status: "aktiv",
    tools: 8,
    kostenMonat: 458,
    weiterverrechnet: true,
    aufschlagProzent: 15,
    notizen: "Monatliche Abrechnung, Rechnung am Monatsanfang.",
  },
  {
    id: "k2",
    name: "Kunde FULEX",
    ansprechpartner: "Jonas Maier",
    email: "j.maier@fulex.com",
    farbe: "#12B76A",
    status: "aktiv",
    tools: 5,
    kostenMonat: 312,
    weiterverrechnet: true,
    aufschlagProzent: 10,
  },
  {
    id: "k3",
    name: "Kunde ZAQQ",
    ansprechpartner: "Mara Becker",
    email: "ops@zaqq.io",
    farbe: "#FF7A66",
    status: "aktiv",
    tools: 4,
    kostenMonat: 230,
    weiterverrechnet: false,
    aufschlagProzent: 0,
    notizen: "Kunde möchte Toolkosten nicht separat ausgewiesen sehen.",
  },
  {
    id: "k4",
    name: "Kunde Nordlicht",
    ansprechpartner: "Tilda Sörensen",
    email: "hallo@nordlicht.de",
    farbe: "#F5A623",
    status: "aktiv",
    tools: 3,
    kostenMonat: 287,
    weiterverrechnet: true,
    aufschlagProzent: 20,
  },
  {
    id: "k5",
    name: "Kunde Bauer & Co.",
    farbe: "#3A57E8",
    status: "inaktiv",
    tools: 2,
    kostenMonat: 95,
    weiterverrechnet: false,
    aufschlagProzent: 0,
  },
  {
    id: "k6",
    name: "Kunde Sonnental",
    ansprechpartner: "Pia Renz",
    email: "p.renz@sonnental.ch",
    farbe: "#0e7ec6",
    status: "aktiv",
    tools: 2,
    kostenMonat: 85,
    weiterverrechnet: true,
    aufschlagProzent: 12,
  },
];

const INTERN_NICHT_ZUGEORDNET = 1013;

function statusPill(status: KundeStatus) {
  const m = {
    aktiv: { label: "aktiv", cls: "bg-success/10 text-success border-success/20" },
    inaktiv: { label: "inaktiv", cls: "bg-muted text-muted-foreground border-border" },
    archiviert: {
      label: "archiviert",
      cls: "bg-muted text-muted-foreground border-border",
    },
  } as const;
  const v = m[status];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium",
        v.cls,
      )}
    >
      {v.label}
    </span>
  );
}

function initialen(name: string): string {
  return name
    .replace(/^Kunde\s+/i, "")
    .split(/[\s&]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

type SortKey = "kosten" | "name" | "marge" | "status";
type View = "karten" | "tabelle";

export function Kunden() {
  const [kunden, setKunden] = useState<Kunde[]>(initialKunden);
  const [panelOpen, setPanelOpen] = useState(false);
  const [editKunde, setEditKunde] = useState<Kunde | null>(null);
  const [removeKunde, setRemoveKunde] = useState<Kunde | null>(null);
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("kosten");
  const [view, setView] = useState<View>("karten");

  const zugeordnet = useMemo(
    () => kunden.reduce((s, k) => s + k.kostenMonat, 0),
    [kunden],
  );
  const weiterverrechnet = useMemo(
    () =>
      kunden
        .filter((k) => k.weiterverrechnet)
        .reduce((s, k) => s + k.kostenMonat * (1 + k.aufschlagProzent / 100), 0),
    [kunden],
  );
  const selbstGetragen = useMemo(
    () =>
      kunden.filter((k) => !k.weiterverrechnet).reduce((s, k) => s + k.kostenMonat, 0),
    [kunden],
  );
  const marge = useMemo(
    () =>
      kunden
        .filter((k) => k.weiterverrechnet)
        .reduce((s, k) => s + (k.kostenMonat * k.aufschlagProzent) / 100, 0),
    [kunden],
  );

  const gefiltert = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q
      ? kunden.filter(
          (k) =>
            k.name.toLowerCase().includes(q) ||
            k.ansprechpartner?.toLowerCase().includes(q) ||
            k.email?.toLowerCase().includes(q),
        )
      : kunden;
    const sorted = [...list].sort((a, b) => {
      if (sortKey === "kosten") return b.kostenMonat - a.kostenMonat;
      if (sortKey === "name") return a.name.localeCompare(b.name, "de");
      if (sortKey === "marge")
        return (b.kostenMonat * b.aufschlagProzent) / 100 - (a.kostenMonat * a.aufschlagProzent) / 100;
      // status: weiterverrechnet vor selbst, aktiv vor inaktiv
      const sa = (a.weiterverrechnet ? 0 : 1) + (a.status === "aktiv" ? 0 : 1);
      const sb = (b.weiterverrechnet ? 0 : 1) + (b.status === "aktiv" ? 0 : 1);
      return sa - sb;
    });
    return sorted;
  }, [kunden, query, sortKey]);

  const gesamtMitIntern = zugeordnet + INTERN_NICHT_ZUGEORDNET;

  const openAdd = () => {
    setEditKunde(null);
    setPanelOpen(true);
  };
  const openEdit = (k: Kunde) => {
    setEditKunde(k);
    setPanelOpen(true);
  };

  const saveKunde = (k: Kunde) => {
    setKunden((prev) => {
      const exists = prev.some((p) => p.id === k.id);
      if (exists) return prev.map((p) => (p.id === k.id ? k : p));
      return [...prev, k];
    });
    setPanelOpen(false);
    toast.success(
      kunden.some((p) => p.id === k.id) ? "Kunde aktualisiert" : "Kunde hinzugefügt",
    );
  };

  const archivieren = (k: Kunde) => {
    setKunden((prev) =>
      prev.map((p) => (p.id === k.id ? { ...p, status: "archiviert" } : p)),
    );
    toast.success("Kunde archiviert");
  };

  const loeschen = (k: Kunde) => {
    setKunden((prev) => prev.filter((p) => p.id !== k.id));
    toast.success(`${k.name} entfernt, ${k.tools} Abos jetzt ohne Kunde`);
    setRemoveKunde(null);
  };

  return (
    <div className="space-y-6">
      {/* Kopf */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">Kunden</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {kunden.length} Kunden,{" "}
            <span className="font-medium tabular-nums text-foreground">
              {fmtEUR(zugeordnet)}
            </span>{" "}
            zugeordnet pro Monat
          </p>
        </div>
        <Button onClick={openAdd} className="gap-1.5">
          <Plus className="size-4" /> Kunde hinzufügen
        </Button>
      </div>

      {/* KPI-Zeile */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Zugeordnete Toolkosten / Monat"
          value={fmtEUR(zugeordnet)}
          hint={`${kunden.reduce((s, k) => s + k.tools, 0)} Tools verteilt`}
        />
        <KpiCardSplit
          weiter={weiterverrechnet - marge}
          selbst={selbstGetragen}
        />
        <KpiCard
          label="Marge aus Aufschlägen"
          value={fmtEUR(marge)}
          accent="success"
          hint="Summe aller Aufschläge pro Monat"
        />
        <KpiCard
          label="Intern / nicht zugeordnet"
          value={fmtEUR(INTERN_NICHT_ZUGEORDNET)}
          accent="warning"
          hint="ordne diese Abos einem Kunden zu"
          cta={
            <Link
              to="/abos"
              className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
            >
              Jetzt zuordnen <ArrowRight className="size-3" />
            </Link>
          }
        />
      </div>

      {/* Verteilungs-Chart */}
      <VerteilungChart kunden={kunden} intern={INTERN_NICHT_ZUGEORDNET} gesamt={gesamtMitIntern} />

      {/* Werkzeugleiste */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative max-w-sm flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Kunden suchen"
            className="pl-9"
          />
        </div>
        <Select value={sortKey} onValueChange={(v) => setSortKey(v as SortKey)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Sortieren" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="kosten">Sortieren: Kosten</SelectItem>
            <SelectItem value="name">Sortieren: Name</SelectItem>
            <SelectItem value="marge">Sortieren: Marge</SelectItem>
            <SelectItem value="status">Sortieren: Status</SelectItem>
          </SelectContent>
        </Select>
        <div className="ml-auto inline-flex rounded-md border border-border bg-card p-0.5">
          <button
            onClick={() => setView("karten")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded px-2.5 py-1.5 text-xs font-medium transition-colors",
              view === "karten"
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <LayoutGrid className="size-3.5" /> Karten
          </button>
          <button
            onClick={() => setView("tabelle")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded px-2.5 py-1.5 text-xs font-medium transition-colors",
              view === "tabelle"
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <TableIcon className="size-3.5" /> Tabelle
          </button>
        </div>
      </div>

      {/* Liste */}
      {gefiltert.length === 0 && kunden.length === 0 ? (
        <LeererZustand onAdd={openAdd} />
      ) : view === "karten" ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {gefiltert.map((k) => (
            <KundenCard
              key={k.id}
              kunde={k}
              gesamt={zugeordnet}
              onEdit={() => openEdit(k)}
              onArchive={() => archivieren(k)}
              onDelete={() => setRemoveKunde(k)}
            />
          ))}
          <InternCard />
        </div>
      ) : (
        <KundenTabelle
          kunden={gefiltert}
          gesamt={zugeordnet}
          onEdit={openEdit}
          onArchive={archivieren}
          onDelete={(k) => setRemoveKunde(k)}
        />
      )}

      <KundenPanel
        open={panelOpen}
        onOpenChange={setPanelOpen}
        initial={editKunde}
        onSave={saveKunde}
      />

      <AlertDialog open={!!removeKunde} onOpenChange={(o) => !o && setRemoveKunde(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{removeKunde?.name} wirklich löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Die {removeKunde?.tools} zugeordneten Abos stehen danach ohne Kunde da. Du kannst sie
              jederzeit neu zuordnen. Diese Aktion kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => removeKunde && loeschen(removeKunde)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/* ---------------------- KPI-Karten ---------------------- */

function KpiCard({
  label,
  value,
  hint,
  accent,
  cta,
}: {
  label: string;
  value: string;
  hint?: string;
  accent?: "success" | "warning";
  cta?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="text-xs font-medium text-muted-foreground">{label}</div>
      <div
        className={cn(
          "mt-2 font-display text-2xl font-semibold tabular-nums",
          accent === "success" && "text-success",
          accent === "warning" && "text-warning",
        )}
      >
        {value}
      </div>
      {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
      {cta}
    </div>
  );
}

function KpiCardSplit({ weiter, selbst }: { weiter: number; selbst: number }) {
  const gesamt = weiter + selbst;
  const pctW = gesamt > 0 ? (weiter / gesamt) * 100 : 0;
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="text-xs font-medium text-muted-foreground">
        Weiterverrechnet vs selbst getragen
      </div>
      <div className="mt-2 font-display text-2xl font-semibold tabular-nums text-success">
        {fmtEUR(weiter)}
      </div>
      <div className="text-xs text-muted-foreground">weiterverrechnet pro Monat</div>
      <div className="mt-3 flex h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full bg-success transition-all"
          style={{ width: `${pctW}%` }}
        />
        <div className="h-full flex-1 bg-warning" />
      </div>
      <div className="mt-2 flex items-center justify-between text-xs">
        <span className="text-muted-foreground">
          <span className="font-medium tabular-nums text-warning">{fmtEUR(selbst)}</span> trägst du
          selbst
        </span>
        <span className="tabular-nums text-muted-foreground">{Math.round(pctW)}%</span>
      </div>
    </div>
  );
}

/* ---------------------- Verteilung ---------------------- */

function VerteilungChart({
  kunden,
  intern,
  gesamt,
}: {
  kunden: Kunde[];
  intern: number;
  gesamt: number;
}) {
  const items = [
    ...kunden.map((k) => ({
      name: k.name,
      wert: k.kostenMonat,
      farbe: k.farbe,
      intern: false,
    })),
    {
      name: "Intern / nicht zugeordnet",
      wert: intern,
      farbe: "var(--color-muted-foreground)",
      intern: true,
    },
  ].sort((a, b) => b.wert - a.wert);

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
      <div className="mb-4 flex items-end justify-between">
        <div>
          <h2 className="font-display text-lg font-semibold">Kosten nach Kunde</h2>
          <p className="text-xs text-muted-foreground">
            inklusive intern getragener Tools
          </p>
        </div>
        <div className="text-right">
          <div className="font-display text-xl font-semibold tabular-nums">
            {fmtEUR(gesamt)}
          </div>
          <div className="text-xs text-muted-foreground">pro Monat</div>
        </div>
      </div>
      <ul className="space-y-3">
        {items.map((it) => {
          const pct = gesamt > 0 ? (it.wert / gesamt) * 100 : 0;
          return (
            <li key={it.name}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span
                  className={cn(
                    "min-w-0 truncate",
                    it.intern ? "italic text-muted-foreground" : "text-foreground",
                  )}
                >
                  {it.name}
                </span>
                <span className="ml-3 shrink-0 tabular-nums text-muted-foreground">
                  {fmtEUR(it.wert)}{" "}
                  <span className="ml-1 text-xs">({pct.toFixed(0)}%)</span>
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${pct}%`,
                    background: it.intern
                      ? "repeating-linear-gradient(45deg, var(--color-muted-foreground) 0 6px, transparent 6px 12px)"
                      : it.farbe,
                    opacity: it.intern ? 0.5 : 1,
                  }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ---------------------- Kunden-Karte ---------------------- */

function KundenCard({
  kunde,
  gesamt,
  onEdit,
  onArchive,
  onDelete,
}: {
  kunde: Kunde;
  gesamt: number;
  onEdit: () => void;
  onArchive: () => void;
  onDelete: () => void;
}) {
  const anteil = gesamt > 0 ? (kunde.kostenMonat / gesamt) * 100 : 0;
  const verrechnet = kunde.kostenMonat * (1 + kunde.aufschlagProzent / 100);
  const margeWert = (kunde.kostenMonat * kunde.aufschlagProzent) / 100;
  return (
    <div className="group flex flex-col rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start gap-3">
        <div
          className="grid size-11 shrink-0 place-items-center rounded-xl font-display text-sm font-semibold text-white"
          style={{ background: kunde.farbe }}
        >
          {initialen(kunde.name)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-display text-base font-semibold leading-tight">
              {kunde.name}
            </h3>
            {statusPill(kunde.status)}
          </div>
          {kunde.ansprechpartner && (
            <div className="mt-0.5 text-xs text-muted-foreground">
              {kunde.ansprechpartner}
              {kunde.email && <> · {kunde.email}</>}
            </div>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="ghost" className="size-8 shrink-0">
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={onEdit}>
              <Pencil className="mr-2 size-4" /> Bearbeiten
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => toast.info("Bericht-Export folgt")}>
              <FileText className="mr-2 size-4" /> Bericht erstellen
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onArchive}>
              <Archive className="mr-2 size-4" /> Archivieren
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={onDelete}
              className="text-destructive focus:text-destructive"
            >
              Löschen
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mt-4 flex items-end justify-between">
        <div>
          <div className="font-display text-2xl font-semibold tabular-nums">
            {fmtEUR(kunde.kostenMonat)}
          </div>
          <div className="text-xs text-muted-foreground">{kunde.tools} Tools · pro Monat</div>
        </div>
        {kunde.weiterverrechnet ? (
          <span className="inline-flex items-center gap-1 rounded-full border border-success/20 bg-success/10 px-2.5 py-1 text-[11px] font-medium text-success">
            <Check className="size-3" /> weiterverrechnet +{kunde.aufschlagProzent}%
          </span>
        ) : (
          <span className="inline-flex items-center rounded-full border border-warning/30 bg-warning/15 px-2.5 py-1 text-[11px] font-medium text-warning">
            nicht weiterverrechnet
          </span>
        )}
      </div>

      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${anteil}%`, background: kunde.farbe }}
        />
      </div>
      <div className="mt-1.5 text-[11px] text-muted-foreground">
        {anteil.toFixed(0)}% Anteil an zugeordneten Kosten
      </div>

      {kunde.weiterverrechnet ? (
        <div className="mt-3 rounded-lg bg-success/5 px-3 py-2 text-xs text-foreground/80">
          Verrechnet{" "}
          <span className="font-medium tabular-nums">{fmtEUR(verrechnet)}</span>, Marge{" "}
          <span className="font-medium tabular-nums text-success">+{fmtEUR(margeWert)}</span>
        </div>
      ) : (
        <div className="mt-3 rounded-lg bg-warning/10 px-3 py-2 text-xs text-foreground/80">
          Diese Kosten trägst du selbst.
        </div>
      )}

      <div className="mt-4 flex items-center gap-2 border-t border-border pt-4">
        <Button size="sm" variant="outline" className="flex-1" asChild>
          <Link to="/kunden/$kundeId" params={{ kundeId: kunde.id }}>
            Details
          </Link>
        </Button>
        <Button size="sm" className="flex-1" asChild>
          <Link to="/abos">Tools ansehen</Link>
        </Button>
      </div>
    </div>
  );
}

function InternCard() {
  return (
    <div className="flex flex-col rounded-2xl border border-dashed border-border bg-muted/30 p-5">
      <div className="flex items-start gap-3">
        <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-muted font-display text-sm font-semibold text-muted-foreground">
          IN
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-base font-semibold leading-tight text-muted-foreground">
            Intern / nicht zugeordnet
          </h3>
          <div className="mt-0.5 text-xs text-muted-foreground">
            Tools, die keinem Kunden zugeordnet sind
          </div>
        </div>
      </div>
      <div className="mt-4">
        <div className="font-display text-2xl font-semibold tabular-nums text-foreground/80">
          {fmtEUR(INTERN_NICHT_ZUGEORDNET)}
        </div>
        <div className="text-xs text-muted-foreground">pro Monat, von dir getragen</div>
      </div>
      <div className="mt-auto flex flex-col gap-2 pt-4">
        <p className="text-xs text-muted-foreground">
          Ordne diese Abos einem Kunden zu, um Kosten weiterzuverrechnen.
        </p>
        <Button size="sm" asChild>
          <Link to="/abos" className="gap-1.5">
            Jetzt zuordnen <ArrowRight className="size-3.5" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

/* ---------------------- Tabelle ---------------------- */

function KundenTabelle({
  kunden,
  gesamt,
  onEdit,
  onArchive,
  onDelete,
}: {
  kunden: Kunde[];
  gesamt: number;
  onEdit: (k: Kunde) => void;
  onArchive: (k: Kunde) => void;
  onDelete: (k: Kunde) => void;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/40 text-left text-xs text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Kunde</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Tools</th>
              <th className="px-4 py-3 font-medium text-right">Kosten / Monat</th>
              <th className="px-4 py-3 font-medium">Weiterverrechnung</th>
              <th className="px-4 py-3 font-medium text-right">Marge</th>
              <th className="px-4 py-3 font-medium text-right">Anteil</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {kunden.map((k) => {
              const anteil = gesamt > 0 ? (k.kostenMonat / gesamt) * 100 : 0;
              const margeWert = (k.kostenMonat * k.aufschlagProzent) / 100;
              return (
                <tr key={k.id} className="border-b border-border/60 last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="grid size-8 shrink-0 place-items-center rounded-lg text-xs font-semibold text-white"
                        style={{ background: k.farbe }}
                      >
                        {initialen(k.name)}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate font-medium">{k.name}</div>
                        {k.ansprechpartner && (
                          <div className="truncate text-xs text-muted-foreground">
                            {k.ansprechpartner}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">{statusPill(k.status)}</td>
                  <td className="px-4 py-3 tabular-nums">{k.tools}</td>
                  <td className="px-4 py-3 text-right tabular-nums font-medium">
                    {fmtEUR(k.kostenMonat)}
                  </td>
                  <td className="px-4 py-3">
                    {k.weiterverrechnet ? (
                      <span className="text-success">+{k.aufschlagProzent}%</span>
                    ) : (
                      <span className="text-warning">selbst getragen</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {k.weiterverrechnet ? (
                      <span className="text-success">+{fmtEUR(margeWert)}</span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                    {anteil.toFixed(0)}%
                  </td>
                  <td className="px-4 py-3 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost" className="size-8">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => onEdit(k)}>
                          <Pencil className="mr-2 size-4" /> Bearbeiten
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to="/abos">Tools ansehen</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toast.info("Bericht-Export folgt")}>
                          <FileText className="mr-2 size-4" /> Bericht erstellen
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onArchive(k)}>
                          <Archive className="mr-2 size-4" /> Archivieren
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => onDelete(k)}
                          className="text-destructive focus:text-destructive"
                        >
                          Löschen
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------------------- Leerer Zustand ---------------------- */

function LeererZustand({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card/50 p-10 text-center">
      <h3 className="font-display text-lg font-semibold">Noch keine Kunden</h3>
      <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
        Lege deinen ersten Kunden an, um Toolkosten zuzuordnen und weiterzuverrechnen.
      </p>
      <Button onClick={onAdd} className="mt-4 gap-1.5">
        <Plus className="size-4" /> Kunde hinzufügen
      </Button>
    </div>
  );
}

/* ---------------------- Slide-over Panel ---------------------- */

function KundenPanel({
  open,
  onOpenChange,
  initial,
  onSave,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  initial: Kunde | null;
  onSave: (k: Kunde) => void;
}) {
  const [name, setName] = useState("");
  const [ansprechpartner, setAnsprechpartner] = useState("");
  const [email, setEmail] = useState("");
  const [farbe, setFarbe] = useState(FARBEN[0]);
  const [status, setStatus] = useState<KundeStatus>("aktiv");
  const [weiterverrechnet, setWeiterverrechnet] = useState(true);
  const [aufschlag, setAufschlag] = useState(15);
  const [notizen, setNotizen] = useState("");
  const [error, setError] = useState<string | null>(null);

  const mode = initial ? "bearbeiten" : "anlegen";

  useEffect(() => {
    if (!open) return;
    setError(null);
    if (initial) {
      setName(initial.name);
      setAnsprechpartner(initial.ansprechpartner ?? "");
      setEmail(initial.email ?? "");
      setFarbe(initial.farbe);
      setStatus(initial.status);
      setWeiterverrechnet(initial.weiterverrechnet);
      setAufschlag(initial.aufschlagProzent || 0);
      setNotizen(initial.notizen ?? "");
    } else {
      setName("");
      setAnsprechpartner("");
      setEmail("");
      setFarbe(FARBEN[Math.floor(Math.random() * FARBEN.length)]);
      setStatus("aktiv");
      setWeiterverrechnet(true);
      setAufschlag(15);
      setNotizen("");
    }
  }, [open, initial]);

  const submit = () => {
    if (!name.trim()) {
      setError("Bitte gib einen Namen ein.");
      return;
    }
    const k: Kunde = {
      id: initial?.id ?? `k_${Date.now()}`,
      name: name.trim(),
      ansprechpartner: ansprechpartner.trim() || undefined,
      email: email.trim() || undefined,
      farbe,
      status,
      tools: initial?.tools ?? 0,
      kostenMonat: initial?.kostenMonat ?? 0,
      weiterverrechnet,
      aufschlagProzent: weiterverrechnet ? aufschlag : 0,
      notizen: notizen.trim() || undefined,
    };
    onSave(k);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full max-w-xl flex-col gap-0 p-0 sm:max-w-xl"
      >
        <VisuallyHidden>
          <SheetTitle>{mode === "anlegen" ? "Kunde anlegen" : "Kunde bearbeiten"}</SheetTitle>
          <SheetDescription>Erfasse oder bearbeite einen Kunden mit Weiterverrechnung.</SheetDescription>
        </VisuallyHidden>

        <div className="sticky top-0 z-10 border-b border-border bg-background/95 px-6 py-4 backdrop-blur">
          <h2 className="font-display text-xl font-semibold">
            {mode === "anlegen" ? "Kunde hinzufügen" : "Kunde bearbeiten"}
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Lege fest, wie Toolkosten diesem Kunden zugeordnet und weiterverrechnet werden.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="k-name">
                Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="k-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="z. B. Kunde Vitalplant"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="k-ap">Ansprechpartner</Label>
                <Input
                  id="k-ap"
                  value={ansprechpartner}
                  onChange={(e) => setAnsprechpartner(e.target.value)}
                  placeholder="optional"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="k-mail">Kontakt-E-Mail</Label>
                <Input
                  id="k-mail"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="optional"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Avatar-Farbe</Label>
              <div className="flex flex-wrap gap-2">
                {FARBEN.map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFarbe(f)}
                    className={cn(
                      "size-8 rounded-full ring-offset-2 ring-offset-background transition-all",
                      farbe === f && "ring-2 ring-foreground",
                    )}
                    style={{ background: f }}
                    aria-label={`Farbe ${f}`}
                  />
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-border bg-muted/30 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-medium">Weiterverrechnung</div>
                  <div className="text-xs text-muted-foreground">
                    Standard für neue Tools dieses Kunden
                  </div>
                </div>
                <Switch
                  checked={weiterverrechnet}
                  onCheckedChange={setWeiterverrechnet}
                />
              </div>
              {weiterverrechnet && (
                <div className="mt-3 space-y-1.5">
                  <Label htmlFor="k-auf">Aufschlag in Prozent</Label>
                  <div className="relative max-w-[160px]">
                    <Input
                      id="k-auf"
                      type="number"
                      min={0}
                      max={200}
                      value={aufschlag}
                      onChange={(e) => setAufschlag(Number(e.target.value) || 0)}
                      className="pr-8 tabular-nums"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      %
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as KundeStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aktiv">aktiv</SelectItem>
                  <SelectItem value="inaktiv">inaktiv</SelectItem>
                  <SelectItem value="archiviert">archiviert</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="k-notiz">Notizen</Label>
              <Textarea
                id="k-notiz"
                value={notizen}
                onChange={(e) => setNotizen(e.target.value)}
                placeholder="z. B. Abrechnungsrhythmus, Sonderkonditionen"
                rows={3}
              />
            </div>

            {error && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}

            {initial && (
              <div className="border-t border-border pt-4">
                <Button
                  variant="outline"
                  className="w-full text-warning"
                  onClick={() => {
                    onSave({ ...initial, status: "archiviert" });
                    toast.success(`${initial.name} archiviert`);
                  }}
                >
                  <Archive className="mr-2 size-4" /> Archivieren
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="sticky bottom-0 z-10 flex items-center justify-end gap-2 border-t border-border bg-background/95 px-6 py-3 backdrop-blur">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          <Button onClick={submit}>Speichern</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
