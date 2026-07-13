"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
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
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { KundeDialog } from "@/components/app/kunde-dialog";
import { WennSchreibbar, useReadOnly } from "@/components/app/read-only-context";
import { cn } from "@/lib/utils";
import { formatEur } from "@/lib/constants";
import { KUNDE_STATUS_LABEL, kundeInitial, type KundeMitStats, type KundeStatus } from "@/lib/kunden";
import { archiveKunde, deleteKunde } from "@/app/app/kunden/actions";

type SortKey = "kosten" | "name" | "marge" | "status";
type View = "karten" | "tabelle";

const STATUS_STYLE: Record<KundeStatus, string> = {
  aktiv: "bg-success/10 text-success border-success/20",
  inaktiv: "bg-muted text-muted-foreground border-border",
  archiviert: "bg-muted text-muted-foreground border-border",
};

function StatusPill({ status }: { status: KundeStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium",
        STATUS_STYLE[status],
      )}
    >
      {KUNDE_STATUS_LABEL[status]}
    </span>
  );
}

/** Aufschlag eines Kunden, 0 wenn nicht weiterverrechnet wird. */
function aufschlag(k: KundeMitStats): number {
  return k.weiterverrechnet ? (k.aufschlag_prozent ?? 0) : 0;
}
function margeVon(k: KundeMitStats): number {
  return (k.kostenMonat * aufschlag(k)) / 100;
}

export function KundenClient({
  kunden,
  internKosten,
  internTools,
}: {
  kunden: KundeMitStats[];
  /** Monatskosten der Abos, die keinem Kunden zugeordnet sind. */
  internKosten: number;
  internTools: number;
}) {
  const router = useRouter();
  const readOnly = useReadOnly();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [aktiv, setAktiv] = useState<KundeMitStats | null>(null);
  const [dialogSeq, setDialogSeq] = useState(0);
  const [loesch, setLoesch] = useState<KundeMitStats | null>(null);
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("kosten");
  const [view, setView] = useState<View>("karten");
  const [pending, start] = useTransition();

  const zugeordnet = useMemo(() => kunden.reduce((s, k) => s + k.kostenMonat, 0), [kunden]);
  const weiterverrechnet = useMemo(
    () => kunden.filter((k) => k.weiterverrechnet).reduce((s, k) => s + k.kostenMonat * (1 + aufschlag(k) / 100), 0),
    [kunden],
  );
  const selbstGetragen = useMemo(
    () => kunden.filter((k) => !k.weiterverrechnet).reduce((s, k) => s + k.kostenMonat, 0) + internKosten,
    [kunden, internKosten],
  );
  const marge = useMemo(() => kunden.reduce((s, k) => s + margeVon(k), 0), [kunden]);
  const toolsGesamt = useMemo(() => kunden.reduce((s, k) => s + k.tools, 0), [kunden]);
  const gesamtMitIntern = zugeordnet + internKosten;

  const gefiltert = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q
      ? kunden.filter(
          (k) =>
            k.name.toLowerCase().includes(q) ||
            (k.ansprechpartner ?? "").toLowerCase().includes(q) ||
            (k.email ?? "").toLowerCase().includes(q),
        )
      : kunden;
    return [...list].sort((a, b) => {
      if (sortKey === "kosten") return b.kostenMonat - a.kostenMonat;
      if (sortKey === "name") return a.name.localeCompare(b.name, "de");
      if (sortKey === "marge") return margeVon(b) - margeVon(a);
      // Status: weiterverrechnet vor selbst getragen, aktiv vor inaktiv.
      const rang = (k: KundeMitStats) => (k.weiterverrechnet ? 0 : 1) + (k.status === "aktiv" ? 0 : 1);
      return rang(a) - rang(b);
    });
  }, [kunden, query, sortKey]);

  // Zaehler erzwingt bei jedem Oeffnen einen frischen Mount, damit keine Werte
  // des zuvor bearbeiteten Kunden stehen bleiben.
  function neu() {
    setAktiv(null);
    setDialogSeq((s) => s + 1);
    setDialogOpen(true);
  }
  function bearbeiten(k: KundeMitStats) {
    setAktiv(k);
    setDialogSeq((s) => s + 1);
    setDialogOpen(true);
  }

  function archivieren(k: KundeMitStats) {
    start(async () => {
      const res = await archiveKunde(k.id);
      if (res.error) toast.error(res.error);
      else {
        toast.success(`${k.name} archiviert.`);
        router.refresh();
      }
    });
  }

  function loeschen() {
    if (!loesch) return;
    const k = loesch;
    setLoesch(null);
    start(async () => {
      const res = await deleteKunde(k.id);
      if (res.error) toast.error(res.error);
      else {
        toast.success(
          k.tools > 0
            ? `${k.name} entfernt, ${k.tools} ${k.tools === 1 ? "Abo steht" : "Abos stehen"} jetzt ohne Kunde da.`
            : `${k.name} entfernt.`,
        );
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* Kopf */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">Kunden</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {kunden.length} {kunden.length === 1 ? "Kunde" : "Kunden"},{" "}
            <span className="font-medium tabular-nums text-foreground">{formatEur(zugeordnet)}</span> zugeordnet pro
            Monat
          </p>
        </div>
        <WennSchreibbar>
          <Button onClick={neu} className="gap-1.5">
            <Plus className="size-4" /> Kunde hinzufügen
          </Button>
        </WennSchreibbar>
      </div>

      {kunden.length === 0 && internKosten === 0 ? (
        <LeererZustand onAdd={neu} readOnly={readOnly} />
      ) : (
        <>
          {/* KPI-Zeile */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard
              label="Zugeordnete Toolkosten / Monat"
              value={formatEur(zugeordnet)}
              hint={`${toolsGesamt} ${toolsGesamt === 1 ? "Tool" : "Tools"} verteilt`}
            />
            <KpiCardSplit weiter={weiterverrechnet - marge} selbst={selbstGetragen} />
            <KpiCard
              label="Marge aus Aufschlägen"
              value={formatEur(marge)}
              accent="success"
              hint="Summe aller Aufschläge pro Monat"
            />
            <KpiCard
              label="Intern, nicht zugeordnet"
              value={formatEur(internKosten)}
              accent="warning"
              hint={
                internTools === 0
                  ? "alles zugeordnet"
                  : `${internTools} ${internTools === 1 ? "Abo" : "Abos"} ohne Kunde`
              }
              cta={
                internTools > 0 ? (
                  <Link
                    href="/app/abos"
                    className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                  >
                    Jetzt zuordnen <ArrowRight className="size-3" />
                  </Link>
                ) : undefined
              }
            />
          </div>

          {/* Verteilung */}
          <VerteilungChart kunden={kunden} intern={internKosten} gesamt={gesamtMitIntern} />

          {/* Werkzeugleiste */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[200px] max-w-sm flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Kunden suchen"
                aria-label="Kunden suchen"
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
            <div className="ml-auto inline-flex rounded-md border bg-card p-0.5">
              {(
                [
                  ["karten", LayoutGrid, "Karten"],
                  ["tabelle", TableIcon, "Tabelle"],
                ] as const
              ).map(([v, Icon, label]) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded px-2.5 py-1.5 text-xs font-medium transition-colors",
                    view === v ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Icon className="size-3.5" /> {label}
                </button>
              ))}
            </div>
          </div>

          {/* Liste */}
          {view === "karten" ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {gefiltert.map((k) => (
                <KundenCard
                  key={k.id}
                  kunde={k}
                  gesamt={zugeordnet}
                  readOnly={readOnly}
                  pending={pending}
                  onEdit={() => bearbeiten(k)}
                  onArchive={() => archivieren(k)}
                  onDelete={() => setLoesch(k)}
                />
              ))}
              {internKosten > 0 && <InternCard kosten={internKosten} tools={internTools} />}
              {gefiltert.length === 0 && (
                <p className="col-span-full py-10 text-center text-sm text-muted-foreground">
                  Kein Kunde passt zu deiner Suche.
                </p>
              )}
            </div>
          ) : (
            <KundenTabelle
              kunden={gefiltert}
              gesamt={zugeordnet}
              readOnly={readOnly}
              onEdit={bearbeiten}
              onArchive={archivieren}
              onDelete={(k) => setLoesch(k)}
            />
          )}
        </>
      )}

      <KundeDialog
        key={`${aktiv?.id ?? "neu"}-${dialogSeq}`}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        kunde={aktiv}
      />

      <AlertDialog open={!!loesch} onOpenChange={(o) => !o && setLoesch(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{loesch?.name} wirklich löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              {loesch && loesch.tools > 0
                ? `Die ${loesch.tools} zugeordneten ${loesch.tools === 1 ? "Abo steht" : "Abos stehen"} danach ohne Kunde da. Du kannst sie jederzeit neu zuordnen. Diese Aktion lässt sich nicht rückgängig machen.`
                : "Diese Aktion lässt sich nicht rückgängig machen. Willst du den Kunden nur vorübergehend ausblenden, archiviere ihn stattdessen."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={loeschen}
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

/* ------------------------------- KPI-Karten ------------------------------- */

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
    <div className="rounded-2xl border bg-card p-5 shadow-sm">
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
    <div className="rounded-2xl border bg-card p-5 shadow-sm">
      <div className="text-xs font-medium text-muted-foreground">Weiterverrechnet und selbst getragen</div>
      <div className="mt-2 font-display text-2xl font-semibold tabular-nums text-success">{formatEur(weiter)}</div>
      <div className="text-xs text-muted-foreground">weiterverrechnet pro Monat</div>
      <div className="mt-3 flex h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div className="h-full bg-success transition-all" style={{ width: `${pctW}%` }} />
        <div className="h-full flex-1 bg-warning" />
      </div>
      <div className="mt-2 flex items-center justify-between text-xs">
        <span className="text-muted-foreground">
          <span className="font-medium tabular-nums text-warning">{formatEur(selbst)}</span> trägst du selbst
        </span>
        <span className="tabular-nums text-muted-foreground">{Math.round(pctW)} %</span>
      </div>
    </div>
  );
}

/* -------------------------------- Verteilung ------------------------------ */

function VerteilungChart({
  kunden,
  intern,
  gesamt,
}: {
  kunden: KundeMitStats[];
  intern: number;
  gesamt: number;
}) {
  const items = [
    ...kunden
      .filter((k) => k.kostenMonat > 0)
      .map((k) => ({ name: k.name, wert: k.kostenMonat, farbe: k.farbe, intern: false })),
    ...(intern > 0
      ? [{ name: "Intern, nicht zugeordnet", wert: intern, farbe: "var(--color-muted-foreground)", intern: true }]
      : []),
  ].sort((a, b) => b.wert - a.wert);

  if (items.length === 0) return null;

  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-lg font-semibold">Kosten nach Kunde</h2>
          <p className="text-xs text-muted-foreground">inklusive intern getragener Tools</p>
        </div>
        <div className="text-right">
          <div className="font-display text-xl font-semibold tabular-nums">{formatEur(gesamt)}</div>
          <div className="text-xs text-muted-foreground">pro Monat</div>
        </div>
      </div>
      <ul className="space-y-3">
        {items.map((it) => {
          const pct = gesamt > 0 ? (it.wert / gesamt) * 100 : 0;
          return (
            <li key={it.name}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className={cn("min-w-0 truncate", it.intern ? "italic text-muted-foreground" : "text-foreground")}>
                  {it.name}
                </span>
                <span className="ml-3 shrink-0 tabular-nums text-muted-foreground">
                  {formatEur(it.wert)} <span className="ml-1 text-xs">({pct.toFixed(0)} %)</span>
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

/* ------------------------------ Kunden-Karte ------------------------------ */

function KundenCard({
  kunde,
  gesamt,
  readOnly,
  pending,
  onEdit,
  onArchive,
  onDelete,
}: {
  kunde: KundeMitStats;
  gesamt: number;
  readOnly: boolean;
  pending: boolean;
  onEdit: () => void;
  onArchive: () => void;
  onDelete: () => void;
}) {
  const anteil = gesamt > 0 ? (kunde.kostenMonat / gesamt) * 100 : 0;
  const proz = aufschlag(kunde);
  const verrechnet = kunde.kostenMonat * (1 + proz / 100);
  const margeWert = margeVon(kunde);

  return (
    <div className="group flex flex-col rounded-2xl border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start gap-3">
        <div
          className="grid size-11 shrink-0 place-items-center rounded-xl font-display text-sm font-semibold text-white"
          style={{ background: kunde.farbe }}
        >
          {kundeInitial(kunde.name)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-display text-base font-semibold leading-tight">{kunde.name}</h3>
            <StatusPill status={kunde.status} />
          </div>
          {(kunde.ansprechpartner || kunde.email) && (
            <div className="mt-0.5 truncate text-xs text-muted-foreground">
              {[kunde.ansprechpartner, kunde.email].filter(Boolean).join(" · ")}
            </div>
          )}
        </div>
        {!readOnly && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="ghost" className="size-8 shrink-0" aria-label="Aktionen">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={onEdit}>
                <Pencil className="mr-2 size-4" /> Bearbeiten
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/app/berichte">
                  <FileText className="mr-2 size-4" /> Bericht erstellen
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onArchive} disabled={pending || kunde.status === "archiviert"}>
                <Archive className="mr-2 size-4" /> Archivieren
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
                Löschen
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <div className="mt-4 flex items-end justify-between gap-2">
        <div>
          <div className="font-display text-2xl font-semibold tabular-nums">{formatEur(kunde.kostenMonat)}</div>
          <div className="text-xs text-muted-foreground">
            {kunde.tools} {kunde.tools === 1 ? "Tool" : "Tools"} · pro Monat
          </div>
        </div>
        {kunde.weiterverrechnet ? (
          <span className="inline-flex items-center gap-1 rounded-full border border-success/20 bg-success/10 px-2.5 py-1 text-[11px] font-medium text-success">
            <Check className="size-3" /> weiterverrechnet +{proz} %
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
        {anteil.toFixed(0)} % Anteil an zugeordneten Kosten
      </div>

      {kunde.weiterverrechnet ? (
        <div className="mt-3 rounded-lg bg-success/5 px-3 py-2 text-xs text-foreground/80">
          Verrechnet <span className="font-medium tabular-nums">{formatEur(verrechnet)}</span>, Marge{" "}
          <span className="font-medium tabular-nums text-success">+{formatEur(margeWert)}</span>
        </div>
      ) : (
        <div className="mt-3 rounded-lg bg-warning/10 px-3 py-2 text-xs text-foreground/80">
          Diese Kosten trägst du selbst.
        </div>
      )}

      <div className="mt-4 flex items-center gap-2 border-t pt-4">
        <Button size="sm" variant="outline" className="flex-1" asChild>
          <Link href={`/app/kunden/${kunde.id}`}>Details</Link>
        </Button>
        <Button size="sm" className="flex-1" asChild>
          <Link href="/app/abos">Tools ansehen</Link>
        </Button>
      </div>
    </div>
  );
}

function InternCard({ kosten, tools }: { kosten: number; tools: number }) {
  return (
    <div className="flex flex-col rounded-2xl border border-dashed bg-muted/30 p-5">
      <div className="flex items-start gap-3">
        <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-muted font-display text-sm font-semibold text-muted-foreground">
          IN
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-base font-semibold leading-tight text-muted-foreground">
            Intern, nicht zugeordnet
          </h3>
          <div className="mt-0.5 text-xs text-muted-foreground">
            {tools} {tools === 1 ? "Tool ist" : "Tools sind"} keinem Kunden zugeordnet
          </div>
        </div>
      </div>
      <div className="mt-4">
        <div className="font-display text-2xl font-semibold tabular-nums text-foreground/80">{formatEur(kosten)}</div>
        <div className="text-xs text-muted-foreground">pro Monat, von dir getragen</div>
      </div>
      <div className="mt-auto flex flex-col gap-2 pt-4">
        <p className="text-xs text-muted-foreground">
          Ordne diese Abos einem Kunden zu, um die Kosten weiterzuverrechnen.
        </p>
        <Button size="sm" asChild>
          <Link href="/app/abos" className="gap-1.5">
            Jetzt zuordnen <ArrowRight className="size-3.5" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

/* -------------------------------- Tabelle --------------------------------- */

function KundenTabelle({
  kunden,
  gesamt,
  readOnly,
  onEdit,
  onArchive,
  onDelete,
}: {
  kunden: KundeMitStats[];
  gesamt: number;
  readOnly: boolean;
  onEdit: (k: KundeMitStats) => void;
  onArchive: (k: KundeMitStats) => void;
  onDelete: (k: KundeMitStats) => void;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/40 text-left text-xs text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Kunde</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Tools</th>
              <th className="px-4 py-3 text-right font-medium">Kosten / Monat</th>
              <th className="px-4 py-3 font-medium">Weiterverrechnung</th>
              <th className="px-4 py-3 text-right font-medium">Marge</th>
              <th className="px-4 py-3 text-right font-medium">Anteil</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {kunden.map((k) => {
              const anteil = gesamt > 0 ? (k.kostenMonat / gesamt) * 100 : 0;
              return (
                <tr key={k.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <Link href={`/app/kunden/${k.id}`} className="flex items-center gap-2.5">
                      <div
                        className="grid size-8 shrink-0 place-items-center rounded-lg text-xs font-semibold text-white"
                        style={{ background: k.farbe }}
                      >
                        {kundeInitial(k.name)}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate font-medium">{k.name}</div>
                        {k.ansprechpartner && (
                          <div className="truncate text-xs text-muted-foreground">{k.ansprechpartner}</div>
                        )}
                      </div>
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <StatusPill status={k.status} />
                  </td>
                  <td className="px-4 py-3 tabular-nums">{k.tools}</td>
                  <td className="px-4 py-3 text-right font-medium tabular-nums">{formatEur(k.kostenMonat)}</td>
                  <td className="px-4 py-3">
                    {k.weiterverrechnet ? (
                      <span className="text-success">+{aufschlag(k)} %</span>
                    ) : (
                      <span className="text-warning">selbst getragen</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {k.weiterverrechnet ? (
                      <span className="text-success">+{formatEur(margeVon(k))}</span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">{anteil.toFixed(0)} %</td>
                  <td className="px-4 py-3 text-right">
                    {!readOnly && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="icon" variant="ghost" className="size-8" aria-label="Aktionen">
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem asChild>
                            <Link href={`/app/kunden/${k.id}`}>Details ansehen</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onEdit(k)}>
                            <Pencil className="mr-2 size-4" /> Bearbeiten
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href="/app/abos">Tools ansehen</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href="/app/berichte">
                              <FileText className="mr-2 size-4" /> Bericht erstellen
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onArchive(k)} disabled={k.status === "archiviert"}>
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
                    )}
                  </td>
                </tr>
              );
            })}
            {kunden.length === 0 && (
              <tr>
                <td colSpan={8} className="py-10 text-center text-sm text-muted-foreground">
                  Kein Kunde passt zu deiner Suche.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ----------------------------- Leerer Zustand ----------------------------- */

function LeererZustand({ onAdd, readOnly }: { onAdd: () => void; readOnly: boolean }) {
  return (
    <div className="rounded-2xl border border-dashed bg-card/50 p-10 text-center">
      <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
        <Users className="size-6" />
      </span>
      <h3 className="mt-4 font-display text-lg font-semibold">Noch keine Kunden</h3>
      <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
        Leg deinen ersten Kunden an, um Toolkosten zuzuordnen und weiterzuverrechnen.
      </p>
      {!readOnly && (
        <Button onClick={onAdd} className="mt-4 gap-1.5">
          <Plus className="size-4" /> Kunde hinzufügen
        </Button>
      )}
    </div>
  );
}
