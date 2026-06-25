"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Plus,
  Search,
  Filter as FilterIcon,
  ChevronDown,
  ArrowUpDown,
  List,
  LayoutGrid,
  Rows3,
  Rows2,
  X,
  Trash2,
  Archive,
  Pause,
  Download,
  Bell,
  CalendarClock,
  Receipt,
  FileUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import { cn } from "@/lib/utils";
import { formatEur } from "@/lib/constants";
import { AboFormPanel } from "@/components/app/abo-form-panel";
import {
  KATEGORIEN,
  INTERVALLE,
  INTERVALL_LABEL,
  STATUS_OPTIONEN,
  STATUS_LABEL,
  STATUS_FARBEN,
  KATEGORIE_FARBEN,
  monatlich,
  toolInitial,
  type Abo,
  type Intervall,
  type AboStatus,
} from "@/lib/abos";
import {
  bulkDeleteAbos,
  bulkSetStatus,
} from "@/app/app/abos/actions";

type SortKey = "tool" | "kategorie" | "kosten" | "naechste_abbuchung" | "kunde" | "status";
type GroupKey = "keine" | "kunde" | "kategorie" | "zahlungskanal" | "status";

function fmtDate(v: string | null): string {
  if (!v) return "–";
  const [y, m, d] = v.split("-");
  return d ? `${d}.${m}.${y}` : v;
}

/** Frist laeuft bald ab (Kuendigungstermin oder Trial-Ende <= 30 Tage). */
function fristBald(a: Abo): boolean {
  const heute = new Date();
  heute.setHours(0, 0, 0, 0);
  const grenze = new Date(heute);
  grenze.setDate(grenze.getDate() + 30);
  for (const v of [a.letzter_kuendigungstermin, a.trial_endet]) {
    if (!v) continue;
    const d = new Date(v);
    if (d >= heute && d <= grenze) return true;
  }
  return false;
}

function toggleSet(set: Set<string>, value: string, apply: (s: Set<string>) => void) {
  const next = new Set(set);
  if (next.has(value)) next.delete(value);
  else next.add(value);
  apply(next);
}

function FilterGroup({
  title,
  options,
  selected,
  onToggle,
  label,
}: {
  title: string;
  options: readonly string[];
  selected: Set<string>;
  onToggle: (v: string) => void;
  label?: (v: string) => string;
}) {
  return (
    <div>
      <div className="mb-2 text-sm font-medium">{title}</div>
      <div className="space-y-1.5">
        {options.map((o) => (
          <label key={o} className="flex cursor-pointer items-center gap-2 text-sm">
            <Checkbox checked={selected.has(o)} onCheckedChange={() => onToggle(o)} />
            <span>{label ? label(o) : o}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const st = STATUS_FARBEN[status as AboStatus] ?? STATUS_FARBEN.aktiv;
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold"
      style={{ backgroundColor: st.bg, color: st.text }}
    >
      <span className="size-1.5 rounded-full" style={{ backgroundColor: st.dot }} />
      {STATUS_LABEL[status as AboStatus] ?? status}
    </span>
  );
}

function ToolZelle({ a }: { a: Abo }) {
  const farbe = a.farbe ?? KATEGORIE_FARBEN[a.kategorie] ?? "#6C5CE7";
  return (
    <div className="flex min-w-0 items-center gap-3">
      <span
        className="grid size-8 shrink-0 place-items-center rounded-lg text-sm font-semibold text-white"
        style={{ backgroundColor: farbe }}
      >
        {a.initial ?? toolInitial(a.tool)}
      </span>
      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="truncate font-medium">{a.tool}</span>
          {fristBald(a) && (
            <span
              title="Kündigungsfrist läuft bald ab"
              className="inline-flex items-center gap-0.5 rounded-full bg-warning/15 px-1.5 py-0.5 text-[10px] font-semibold text-warning"
            >
              <Bell className="size-2.5" /> Frist bald
            </span>
          )}
        </div>
        {a.anbieter && (
          <div className="truncate text-xs text-muted-foreground">{a.anbieter}</div>
        )}
      </div>
    </div>
  );
}

function preis(a: Abo): string {
  const wert = formatEur(a.kosten).replace("€", "").trim();
  return a.waehrung === "USD" ? `$${wert}` : `${wert} €`;
}

export function AbosListe({
  abos,
  kanalOptionen = [],
  kundenOptionen = [],
}: {
  abos: Abo[];
  kanalOptionen?: string[];
  kundenOptionen?: string[];
}) {
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sortKey, setSortKey] = useState<SortKey>("naechste_abbuchung");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [group, setGroup] = useState<GroupKey>("keine");
  const [view, setView] = useState<"tabelle" | "karten">("tabelle");
  const [density, setDensity] = useState<"komfort" | "kompakt">("komfort");

  const [fKategorie, setFKategorie] = useState<Set<string>>(new Set());
  const [fKunde, setFKunde] = useState<Set<string>>(new Set());
  const [fKanal, setFKanal] = useState<Set<string>>(new Set());
  const [fStatus, setFStatus] = useState<Set<string>>(new Set());
  const [fIntervall, setFIntervall] = useState<Set<string>>(new Set());
  const [kostenRange, setKostenRange] = useState<[number, number]>([0, 500]);
  const [nurFrist, setNurFrist] = useState(false);

  const [panelOpen, setPanelOpen] = useState(false);
  const [aktiv, setAktiv] = useState<Abo | null>(null);
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);
  const [busy, setBusy] = useState(false);

  const kundenOpt = useMemo(
    () => Array.from(new Set(abos.map((a) => a.kunde).filter(Boolean) as string[])).sort(),
    [abos],
  );
  const kanalOpt = useMemo(
    () => Array.from(new Set(abos.map((a) => a.zahlungskanal).filter(Boolean) as string[])).sort(),
    [abos],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return abos.filter((a) => {
      if (q) {
        const hay = `${a.tool} ${a.anbieter ?? ""} ${a.kunde ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (fKategorie.size && !fKategorie.has(a.kategorie)) return false;
      if (fKunde.size && !(a.kunde && fKunde.has(a.kunde))) return false;
      if (fKanal.size && !(a.zahlungskanal && fKanal.has(a.zahlungskanal))) return false;
      if (fStatus.size && !fStatus.has(a.status)) return false;
      if (fIntervall.size && !fIntervall.has(a.intervall)) return false;
      const m = monatlich(a.kosten, a.intervall);
      if (m < kostenRange[0] || m > kostenRange[1]) return false;
      if (nurFrist && !fristBald(a)) return false;
      return true;
    });
  }, [abos, query, fKategorie, fKunde, fKanal, fStatus, fIntervall, kostenRange, nurFrist]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      let av: string | number = "";
      let bv: string | number = "";
      if (sortKey === "kosten") {
        av = monatlich(a.kosten, a.intervall);
        bv = monatlich(b.kosten, b.intervall);
      } else {
        av = (a[sortKey] as string | null) ?? "";
        bv = (b[sortKey] as string | null) ?? "";
      }
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return arr;
  }, [filtered, sortKey, sortDir]);

  const grouped = useMemo(() => {
    if (group === "keine") return [{ key: "", items: sorted }];
    const map = new Map<string, Abo[]>();
    for (const a of sorted) {
      const k = (a[group] as string | null) || "Nicht zugeordnet";
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(a);
    }
    return Array.from(map.entries())
      .sort((x, y) => x[0].localeCompare(y[0]))
      .map(([key, items]) => ({ key, items }));
  }, [sorted, group]);

  const monatsBilanz = useMemo(
    () => filtered.reduce((s, a) => s + monatlich(a.kosten, a.intervall), 0),
    [filtered],
  );

  const allVisibleIds = sorted.map((a) => a.id);
  const allSelected = allVisibleIds.length > 0 && allVisibleIds.every((id) => selected.has(id));

  function toggleSort(k: SortKey) {
    if (sortKey === k) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(k);
      setSortDir("asc");
    }
  }
  function toggleRow(id: string) {
    toggleSet(selected, id, setSelected);
  }
  function toggleAll() {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(allVisibleIds));
  }
  function resetFilter() {
    setFKategorie(new Set());
    setFKunde(new Set());
    setFKanal(new Set());
    setFStatus(new Set());
    setFIntervall(new Set());
    setKostenRange([0, 500]);
    setNurFrist(false);
    setQuery("");
  }

  const chips: { label: string; onRemove: () => void }[] = [];
  fKategorie.forEach((v) => chips.push({ label: v, onRemove: () => toggleSet(fKategorie, v, setFKategorie) }));
  fKunde.forEach((v) => chips.push({ label: v, onRemove: () => toggleSet(fKunde, v, setFKunde) }));
  fKanal.forEach((v) => chips.push({ label: v, onRemove: () => toggleSet(fKanal, v, setFKanal) }));
  fStatus.forEach((v) => chips.push({ label: STATUS_LABEL[v as AboStatus] ?? v, onRemove: () => toggleSet(fStatus, v, setFStatus) }));
  fIntervall.forEach((v) => chips.push({ label: INTERVALL_LABEL[v as Intervall] ?? v, onRemove: () => toggleSet(fIntervall, v, setFIntervall) }));
  if (nurFrist) chips.push({ label: "Frist bald", onRemove: () => setNurFrist(false) });

  function neu() {
    setAktiv(null);
    setPanelOpen(true);
  }
  function oeffnen(a: Abo) {
    router.push(`/app/abos/${a.id}`);
  }

  async function bulk(fn: () => Promise<{ error?: string }>, erfolg: string) {
    setBusy(true);
    const res = await fn();
    setBusy(false);
    if (res.error) {
      toast.error(res.error);
      return;
    }
    toast.success(erfolg);
    setSelected(new Set());
    router.refresh();
  }

  const auswahl = () => Array.from(selected);

  function exportCsv() {
    const rows = sorted.filter((a) => selected.has(a.id));
    const ziel = rows.length ? rows : sorted;
    const kopf = ["Tool", "Anbieter", "Kategorie", "Kosten", "Währung", "Intervall", "Nächste Abbuchung", "Zahlungskanal", "Kunde", "Status"];
    const escape = (s: string) => `"${s.replace(/"/g, '""')}"`;
    const lines = ziel.map((a) =>
      [a.tool, a.anbieter ?? "", a.kategorie, a.kosten.toString().replace(".", ","), a.waehrung, a.intervall, a.naechste_abbuchung ?? "", a.zahlungskanal ?? "", a.kunde ?? "", a.status]
        .map((c) => escape(String(c)))
        .join(";"),
    );
    const csv = [kopf.map(escape).join(";"), ...lines].join("\r\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "abos.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  const padY = density === "kompakt" ? "py-2" : "py-3";

  return (
    <div className="space-y-5 pb-28">
      {/* Kopf + KPI */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Abos</h1>
          <p className="mt-1 text-sm text-muted-foreground tabular-nums">
            <span className="font-medium text-foreground">{filtered.length}</span>{" "}
            {filtered.length === 1 ? "Abo" : "Abos"} ·{" "}
            <span className="font-medium text-foreground">{formatEur(monatsBilanz)}</span> pro Monat
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" className="gap-1.5">
            <Link href="/app/abos/import">
              <FileUp className="size-4" /> Importieren
            </Link>
          </Button>
          <Button onClick={neu} className="gap-1.5">
            <Plus className="size-4" /> Abo hinzufügen
          </Button>
        </div>
      </div>

      {abos.length === 0 ? (
        <div className="rounded-[20px] border border-dashed bg-card p-12 text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
            <Receipt className="size-6" />
          </span>
          <h2 className="mt-4 font-display text-lg font-semibold">Noch keine Abos</h2>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
            Lege dein erstes Abo an, um Kosten, Fristen und Abbuchungen im Blick zu behalten.
          </p>
          <Button onClick={neu} className="mt-5 gap-2">
            <Plus className="size-4" /> Abo hinzufügen
          </Button>
        </div>
      ) : (
        <>
          {/* Toolbar */}
          <div className="rounded-2xl bg-card p-3 shadow-soft sm:p-4">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative min-w-[200px] flex-1">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Abo, Anbieter oder Kunde suchen"
                  className="rounded-xl bg-background pl-9"
                />
              </div>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="gap-1.5 rounded-xl">
                    <FilterIcon className="size-4" /> Filter
                    {chips.length > 0 && (
                      <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-semibold text-primary-foreground">
                        {chips.length}
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-[320px] p-0">
                  <div className="max-h-[70vh] space-y-4 overflow-y-auto p-4">
                    <FilterGroup title="Kategorie" options={KATEGORIEN} selected={fKategorie} onToggle={(v) => toggleSet(fKategorie, v, setFKategorie)} />
                    {kundenOpt.length > 0 && (
                      <FilterGroup title="Kunde" options={kundenOpt} selected={fKunde} onToggle={(v) => toggleSet(fKunde, v, setFKunde)} />
                    )}
                    {kanalOpt.length > 0 && (
                      <FilterGroup title="Zahlungskanal" options={kanalOpt} selected={fKanal} onToggle={(v) => toggleSet(fKanal, v, setFKanal)} />
                    )}
                    <FilterGroup title="Status" options={STATUS_OPTIONEN} selected={fStatus} onToggle={(v) => toggleSet(fStatus, v, setFStatus)} label={(v) => STATUS_LABEL[v as AboStatus] ?? v} />
                    <FilterGroup title="Intervall" options={INTERVALLE} selected={fIntervall} onToggle={(v) => toggleSet(fIntervall, v, setFIntervall)} label={(v) => INTERVALL_LABEL[v as Intervall] ?? v} />
                    <div>
                      <div className="mb-2 text-sm font-medium">Kostenbereich (mtl.)</div>
                      <Slider min={0} max={500} step={5} value={kostenRange} onValueChange={(v) => setKostenRange([v[0], v[1]] as [number, number])} />
                      <div className="mt-2 flex justify-between text-xs text-muted-foreground tabular-nums">
                        <span>{formatEur(kostenRange[0])}</span>
                        <span>{formatEur(kostenRange[1])}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <div className="text-sm font-medium">Nur mit Frist bald</div>
                      <Switch checked={nurFrist} onCheckedChange={setNurFrist} />
                    </div>
                  </div>
                  <div className="flex justify-end border-t p-3">
                    <Button size="sm" variant="ghost" onClick={resetFilter}>
                      Alle zurücksetzen
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-1.5 rounded-xl">
                    Gruppieren <ChevronDown className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuLabel className="text-xs">Gruppierung</DropdownMenuLabel>
                  {([
                    ["keine", "Keine"],
                    ["kunde", "Nach Kunde"],
                    ["kategorie", "Nach Kategorie"],
                    ["zahlungskanal", "Nach Zahlungskanal"],
                    ["status", "Nach Status"],
                  ] as [GroupKey, string][]).map(([k, l]) => (
                    <DropdownMenuItem key={k} onClick={() => setGroup(k)}>
                      {group === k ? "✓ " : ""}
                      {l}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-1.5 rounded-xl">
                    <ArrowUpDown className="size-4" /> Sortieren
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {([
                    ["tool", "Tool"],
                    ["kosten", "Kosten"],
                    ["naechste_abbuchung", "Nächste Abbuchung"],
                    ["kategorie", "Kategorie"],
                    ["kunde", "Kunde"],
                    ["status", "Status"],
                  ] as [SortKey, string][]).map(([k, l]) => (
                    <DropdownMenuItem key={k} onClick={() => toggleSort(k)}>
                      {sortKey === k ? (sortDir === "asc" ? "↑ " : "↓ ") : ""}
                      {l}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <div className="ml-auto flex items-center gap-2">
                <div className="inline-flex rounded-xl border bg-background p-0.5">
                  <button onClick={() => setView("tabelle")} aria-label="Tabelle" className={cn("inline-flex items-center rounded-lg px-2.5 py-1.5", view === "tabelle" ? "bg-accent text-accent-foreground" : "text-muted-foreground")}>
                    <List className="size-3.5" />
                  </button>
                  <button onClick={() => setView("karten")} aria-label="Karten" className={cn("inline-flex items-center rounded-lg px-2.5 py-1.5", view === "karten" ? "bg-accent text-accent-foreground" : "text-muted-foreground")}>
                    <LayoutGrid className="size-3.5" />
                  </button>
                </div>
                <div className="inline-flex rounded-xl border bg-background p-0.5">
                  <button onClick={() => setDensity("komfort")} aria-label="Komfortabel" className={cn("inline-flex items-center rounded-lg px-2.5 py-1.5", density === "komfort" ? "bg-accent text-accent-foreground" : "text-muted-foreground")}>
                    <Rows3 className="size-3.5" />
                  </button>
                  <button onClick={() => setDensity("kompakt")} aria-label="Kompakt" className={cn("inline-flex items-center rounded-lg px-2.5 py-1.5", density === "kompakt" ? "bg-accent text-accent-foreground" : "text-muted-foreground")}>
                    <Rows2 className="size-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {chips.length > 0 && (
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                {chips.map((c, i) => (
                  <button key={i} onClick={c.onRemove} className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground hover:bg-accent/80">
                    {c.label}
                    <X className="size-3" />
                  </button>
                ))}
                <button onClick={resetFilter} className="ml-1 rounded-full px-2.5 py-1 text-xs font-medium text-muted-foreground hover:text-foreground">
                  Alle zurücksetzen
                </button>
              </div>
            )}
          </div>

          {/* Inhalt */}
          {sorted.length === 0 ? (
            <div className="rounded-2xl border border-dashed bg-card p-12 text-center">
              <p className="text-sm text-muted-foreground">Keine Abos passen zu den Filtern.</p>
              <Button variant="ghost" className="mt-3" onClick={resetFilter}>
                Filter zurücksetzen
              </Button>
            </div>
          ) : view === "tabelle" ? (
            <div className="space-y-6">
              {grouped.map((g) => (
                <div key={g.key || "alle"} className="overflow-hidden rounded-2xl bg-card shadow-soft">
                  {group !== "keine" && (
                    <div className="flex items-center justify-between border-b bg-secondary/40 px-5 py-3">
                      <div className="font-display text-sm font-semibold">{g.key}</div>
                      <div className="text-xs text-muted-foreground tabular-nums">
                        {g.items.length} Abos · {formatEur(g.items.reduce((s, a) => s + monatlich(a.kosten, a.intervall), 0))} pro Monat
                      </div>
                    </div>
                  )}
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b text-left text-xs text-muted-foreground">
                          <th className="w-10 px-4 py-2.5">
                            {group === "keine" && (
                              <Checkbox checked={allSelected} onCheckedChange={toggleAll} aria-label="Alle auswählen" />
                            )}
                          </th>
                          <th className="px-2 py-2.5 font-medium">Tool</th>
                          <th className="px-2 py-2.5 font-medium">Kategorie</th>
                          <th className="px-2 py-2.5 text-right font-medium">Kosten</th>
                          <th className="px-2 py-2.5 font-medium">Nächste Abbuchung</th>
                          <th className="px-2 py-2.5 font-medium">Kunde</th>
                          <th className="px-2 py-2.5 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {g.items.map((a) => (
                          <tr
                            key={a.id}
                            onClick={() => oeffnen(a)}
                            className="cursor-pointer border-b last:border-0 hover:bg-muted/40"
                          >
                            <td className={cn("px-4", padY)} onClick={(e) => e.stopPropagation()}>
                              <Checkbox checked={selected.has(a.id)} onCheckedChange={() => toggleRow(a.id)} aria-label={`${a.tool} auswählen`} />
                            </td>
                            <td className={cn("px-2", padY)}>
                              <ToolZelle a={a} />
                            </td>
                            <td className={cn("px-2 text-muted-foreground", padY)}>{a.kategorie}</td>
                            <td className={cn("px-2 text-right tabular-nums", padY)}>
                              <div className="font-medium">{preis(a)}</div>
                              <div className="text-xs text-muted-foreground">{INTERVALL_LABEL[a.intervall as Intervall]}</div>
                            </td>
                            <td className={cn("px-2 tabular-nums", padY)}>{fmtDate(a.naechste_abbuchung)}</td>
                            <td className={cn("px-2 text-muted-foreground", padY)}>{a.kunde ?? "–"}</td>
                            <td className={cn("px-2", padY)}>
                              <StatusBadge status={a.status} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {sorted.map((a) => (
                <div key={a.id} className="rounded-2xl border bg-card p-4 shadow-soft">
                  <div className="flex items-start justify-between gap-2">
                    <ToolZelle a={a} />
                    <Checkbox checked={selected.has(a.id)} onCheckedChange={() => toggleRow(a.id)} aria-label={`${a.tool} auswählen`} />
                  </div>
                  <button onClick={() => oeffnen(a)} className="mt-3 w-full text-left">
                    <div className="flex items-end justify-between">
                      <div>
                        <div className="text-lg font-semibold tabular-nums">{preis(a)}</div>
                        <div className="text-xs text-muted-foreground">{INTERVALL_LABEL[a.intervall as Intervall]}</div>
                      </div>
                      <StatusBadge status={a.status} />
                    </div>
                    <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                      <CalendarClock className="size-3.5" /> {fmtDate(a.naechste_abbuchung)}
                      {a.kunde && <span>· {a.kunde}</span>}
                    </div>
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Bulk-Leiste */}
      {selected.size > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-card/95 px-4 py-3 backdrop-blur md:left-60">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-2">
            <span className="text-sm font-medium">{selected.size} ausgewählt</span>
            <div className="ml-auto flex flex-wrap gap-2">
              <Button size="sm" variant="outline" className="gap-1.5" disabled={busy} onClick={() => bulk(() => bulkSetStatus(auswahl(), "pausiert"), "Pausiert")}>
                <Pause className="size-4" /> Pausieren
              </Button>
              <Button size="sm" variant="outline" className="gap-1.5" disabled={busy} onClick={() => bulk(() => bulkSetStatus(auswahl(), "archiviert"), "Archiviert")}>
                <Archive className="size-4" /> Archivieren
              </Button>
              <Button size="sm" variant="outline" className="gap-1.5" onClick={exportCsv}>
                <Download className="size-4" /> CSV
              </Button>
              <Button size="sm" variant="outline" className="gap-1.5 text-destructive hover:text-destructive" disabled={busy} onClick={() => setConfirmBulkDelete(true)}>
                <Trash2 className="size-4" /> Löschen
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setSelected(new Set())}>
                Abwählen
              </Button>
            </div>
          </div>
        </div>
      )}

      <AboFormPanel
        key={aktiv?.id ?? "neu"}
        open={panelOpen}
        onOpenChange={setPanelOpen}
        abo={aktiv}
        kanalOptionen={kanalOptionen}
        kundenOptionen={kundenOptionen}
      />

      <AlertDialog open={confirmBulkDelete} onOpenChange={setConfirmBulkDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{selected.size} Abos löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Die ausgewählten Abos werden dauerhaft entfernt. Diese Aktion kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={() => {
                setConfirmBulkDelete(false);
                bulk(() => bulkDeleteAbos(auswahl()), "Abos gelöscht");
              }}
            >
              Endgültig löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
