import { useMemo, useState } from "react";
import {
  Search,
  Plus,
  ChevronDown,
  Filter as FilterIcon,
  X,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
  Bell,
  Sparkles,
  Zap,
  TrendingUp,
  Ghost,
  LayoutGrid,
  List,
  Rows3,
  Rows2,
  AlertCircle,
  Download,
  Archive,
  Trash2,
  Pause,
  Tag,
  CreditCard as CardIcon,
  UserPlus,
  DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
import { fmtEUR, fmtDate, type Interval } from "@/lib/toolfolio-data";
import {
  alleAbos,
  kategorien,
  kunden,
  kanaele,
  intervalle,
  statusOptionen,
  kategorieFarben,
  statusFarben,
  monatlich,
  type AboListItem,
  type Hinweis,
  type ErweiterterStatus,
} from "@/lib/abos-data";

type SortKey =
  | "tool"
  | "kategorie"
  | "kosten"
  | "intervall"
  | "naechsteAbbuchung"
  | "zahlungskanal"
  | "kunde"
  | "status";

type GroupKey = "keine" | "kunde" | "kategorie" | "kanal" | "status";

const hinweisMeta: Record<Hinweis, { label: string; icon: typeof Bell; color: string; bg: string }> = {
  frist: { label: "Kündigungsfrist läuft bald ab", icon: Bell, color: "#8A5A0B", bg: "#FEF3DA" },
  spike: { label: "Verbrauchs-Spike erkannt", icon: Zap, color: "#8E2A1B", bg: "#FCE7E3" },
  sparvorschlag: { label: "Sparvorschlag verfügbar", icon: Sparkles, color: "#0B6B40", bg: "#E7F8EF" },
  preiserhoehung: { label: "Preiserhöhung erkannt", icon: TrendingUp, color: "#8E2A1B", bg: "#FCE7E3" },
  zombie: { label: "Zombie-Abo, keine Nutzung", icon: Ghost, color: "#3D3A4D", bg: "#F0EEF6" },
};

export function AbosListe() {
  const [items, setItems] = useState<AboListItem[]>(alleAbos);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sortKey, setSortKey] = useState<SortKey>("tool");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [group, setGroup] = useState<GroupKey>("keine");
  const [view, setView] = useState<"tabelle" | "karten">("tabelle");
  const [density, setDensity] = useState<"komfort" | "kompakt">("komfort");
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Filter state
  const [fKategorie, setFKategorie] = useState<Set<string>>(new Set());
  const [fKunde, setFKunde] = useState<Set<string>>(new Set());
  const [fKanal, setFKanal] = useState<Set<string>>(new Set());
  const [fStatus, setFStatus] = useState<Set<string>>(new Set());
  const [fIntervall, setFIntervall] = useState<Set<string>>(new Set());
  const [kostenRange, setKostenRange] = useState<[number, number]>([0, 500]);
  const [nurMitHinweisen, setNurMitHinweisen] = useState(false);

  const filtered = useMemo(() => {
    return items.filter((a) => {
      if (query) {
        const q = query.toLowerCase();
        if (
          !a.tool.toLowerCase().includes(q) &&
          !a.kategorie.toLowerCase().includes(q) &&
          !a.kunde.toLowerCase().includes(q)
        )
          return false;
      }
      if (fKategorie.size && !fKategorie.has(a.kategorie)) return false;
      if (fKunde.size && !fKunde.has(a.kunde)) return false;
      if (fKanal.size && !fKanal.has(a.zahlungskanal)) return false;
      if (fStatus.size && !fStatus.has(a.status)) return false;
      if (fIntervall.size && !fIntervall.has(a.intervall)) return false;
      const m = monatlich(a);
      if (m < kostenRange[0] || m > kostenRange[1]) return false;
      if (nurMitHinweisen && a.hinweise.length === 0) return false;
      return true;
    });
  }, [items, query, fKategorie, fKunde, fKanal, fStatus, fIntervall, kostenRange, nurMitHinweisen]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      let av: string | number = "";
      let bv: string | number = "";
      if (sortKey === "kosten") {
        av = monatlich(a);
        bv = monatlich(b);
      } else {
        av = (a[sortKey] as string) ?? "";
        bv = (b[sortKey] as string) ?? "";
      }
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return arr;
  }, [filtered, sortKey, sortDir]);

  const grouped = useMemo(() => {
    if (group === "keine") return [{ key: "Alle", items: sorted }];
    const map = new Map<string, AboListItem[]>();
    for (const a of sorted) {
      const k =
        group === "kunde"
          ? a.kunde
          : group === "kategorie"
            ? a.kategorie
            : group === "kanal"
              ? a.zahlungskanal
              : a.status;
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(a);
    }
    return Array.from(map.entries()).map(([key, items]) => ({ key, items }));
  }, [sorted, group]);

  const monatsBilanz = useMemo(
    () => filtered.reduce((sum, a) => sum + monatlich(a), 0),
    [filtered],
  );

  const toggleSort = (k: SortKey) => {
    if (sortKey === k) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else {
      setSortKey(k);
      setSortDir("asc");
    }
  };

  const toggleSet = (set: Set<string>, value: string, setter: (s: Set<string>) => void) => {
    const next = new Set(set);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    setter(next);
  };

  const resetFilter = () => {
    setFKategorie(new Set());
    setFKunde(new Set());
    setFKanal(new Set());
    setFStatus(new Set());
    setFIntervall(new Set());
    setKostenRange([0, 500]);
    setNurMitHinweisen(false);
    setQuery("");
  };

  const activeChips: { label: string; onRemove: () => void }[] = [];
  fKategorie.forEach((v) => activeChips.push({ label: `Kategorie: ${v}`, onRemove: () => toggleSet(fKategorie, v, setFKategorie) }));
  fKunde.forEach((v) => activeChips.push({ label: v, onRemove: () => toggleSet(fKunde, v, setFKunde) }));
  fKanal.forEach((v) => activeChips.push({ label: v, onRemove: () => toggleSet(fKanal, v, setFKanal) }));
  fStatus.forEach((v) => activeChips.push({ label: `Status: ${v}`, onRemove: () => toggleSet(fStatus, v, setFStatus) }));
  fIntervall.forEach((v) => activeChips.push({ label: v, onRemove: () => toggleSet(fIntervall, v, setFIntervall) }));
  if (nurMitHinweisen) activeChips.push({ label: "Nur mit Hinweisen", onRemove: () => setNurMitHinweisen(false) });
  if (kostenRange[0] > 0 || kostenRange[1] < 500)
    activeChips.push({
      label: `${fmtEUR(kostenRange[0])} – ${fmtEUR(kostenRange[1])}`,
      onRemove: () => setKostenRange([0, 500]),
    });

  const allVisibleIds = sorted.map((a) => a.id);
  const allSelected = allVisibleIds.length > 0 && allVisibleIds.every((id) => selected.has(id));
  const someSelected = allVisibleIds.some((id) => selected.has(id));

  const toggleAll = () => {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(allVisibleIds));
  };

  const toggleRow = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const handleDelete = () => {
    setItems((prev) => prev.filter((a) => !selected.has(a.id)));
    setSelected(new Set());
    setConfirmDelete(false);
  };

  const handleArchive = () => {
    setItems((prev) =>
      prev.map((a) => (selected.has(a.id) ? { ...a, status: "archiviert" as ErweiterterStatus } : a)),
    );
    setSelected(new Set());
  };

  return (
    <TooltipProvider delayDuration={200}>
      <div className="space-y-5 pb-32">
        {/* Seitenkopf */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight">Abos</h1>
            <p className="mt-1.5 text-sm text-muted-foreground tabular">
              <span className="font-medium text-foreground">{filtered.length}</span>{" "}
              {filtered.length === 1 ? "Abo" : "Abos"} ·{" "}
              <span className="font-medium text-foreground">{fmtEUR(monatsBilanz)}</span> pro Monat
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button className="gap-1.5 rounded-xl">
              <Plus className="size-4" /> Abo hinzufügen
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-1 rounded-xl px-2">
                  <ChevronDown className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem>Kontoauszug importieren</DropdownMenuItem>
                <DropdownMenuItem>Aus Verzeichnis hinzufügen</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Toolbar */}
        <div className="rounded-2xl bg-card shadow-soft p-3 sm:p-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Abo, Anbieter oder Kunde suchen"
                className="pl-9 rounded-xl bg-background"
              />
            </div>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-1.5 rounded-xl">
                  <FilterIcon className="size-4" /> Filter
                  {activeChips.length > 0 && (
                    <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-semibold text-primary-foreground">
                      {activeChips.length}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-[320px] p-0">
                <div className="max-h-[70vh] overflow-y-auto p-4 space-y-4">
                  <FilterGroup
                    title="Kategorie"
                    options={kategorien}
                    selected={fKategorie}
                    onToggle={(v) => toggleSet(fKategorie, v, setFKategorie)}
                  />
                  <FilterGroup
                    title="Kunde"
                    options={kunden}
                    selected={fKunde}
                    onToggle={(v) => toggleSet(fKunde, v, setFKunde)}
                  />
                  <FilterGroup
                    title="Zahlungskanal"
                    options={kanaele}
                    selected={fKanal}
                    onToggle={(v) => toggleSet(fKanal, v, setFKanal)}
                  />
                  <FilterGroup
                    title="Status"
                    options={statusOptionen}
                    selected={fStatus}
                    onToggle={(v) => toggleSet(fStatus, v, setFStatus)}
                  />
                  <FilterGroup
                    title="Intervall"
                    options={intervalle}
                    selected={fIntervall}
                    onToggle={(v) => toggleSet(fIntervall, v, setFIntervall)}
                  />
                  <div>
                    <div className="text-sm font-medium mb-2">
                      Kostenbereich (mtl.)
                    </div>
                    <Slider
                      min={0}
                      max={500}
                      step={5}
                      value={kostenRange}
                      onValueChange={(v) => setKostenRange([v[0], v[1]] as [number, number])}
                    />
                    <div className="mt-2 flex justify-between text-xs text-muted-foreground tabular">
                      <span>{fmtEUR(kostenRange[0])}</span>
                      <span>{fmtEUR(kostenRange[1])}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <div className="text-sm font-medium">Nur mit Hinweisen</div>
                      <div className="text-xs text-muted-foreground">
                        Frist, Spike oder Sparvorschlag
                      </div>
                    </div>
                    <Switch checked={nurMitHinweisen} onCheckedChange={setNurMitHinweisen} />
                  </div>
                </div>
                <div className="border-t border-border p-3 flex justify-end">
                  <Button size="sm" variant="ghost" onClick={resetFilter}>
                    Alle zurücksetzen
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-1.5 rounded-xl">
                  Gruppieren
                  <ChevronDown className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuLabel className="text-xs">Gruppierung</DropdownMenuLabel>
                {(
                  [
                    ["keine", "Keine"],
                    ["kunde", "Nach Kunde"],
                    ["kategorie", "Nach Kategorie"],
                    ["kanal", "Nach Zahlungskanal"],
                    ["status", "Nach Status"],
                  ] as [GroupKey, string][]
                ).map(([k, l]) => (
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
                {(
                  [
                    ["tool", "Tool"],
                    ["kosten", "Kosten"],
                    ["naechsteAbbuchung", "Nächste Abbuchung"],
                    ["kategorie", "Kategorie"],
                    ["kunde", "Kunde"],
                    ["status", "Status"],
                  ] as [SortKey, string][]
                ).map(([k, l]) => (
                  <DropdownMenuItem key={k} onClick={() => toggleSort(k)}>
                    {sortKey === k ? (sortDir === "asc" ? "↑ " : "↓ ") : ""}
                    {l}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="ml-auto flex items-center gap-2">
              <div className="inline-flex rounded-xl border border-border bg-background p-0.5">
                <button
                  onClick={() => setView("tabelle")}
                  className={cn(
                    "inline-flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-lg",
                    view === "tabelle" ? "bg-accent text-accent-foreground" : "text-muted-foreground",
                  )}
                  aria-label="Tabelle"
                >
                  <List className="size-3.5" />
                </button>
                <button
                  onClick={() => setView("karten")}
                  className={cn(
                    "inline-flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-lg",
                    view === "karten" ? "bg-accent text-accent-foreground" : "text-muted-foreground",
                  )}
                  aria-label="Karten"
                >
                  <LayoutGrid className="size-3.5" />
                </button>
              </div>
              <div className="inline-flex rounded-xl border border-border bg-background p-0.5">
                <button
                  onClick={() => setDensity("komfort")}
                  className={cn(
                    "inline-flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-lg",
                    density === "komfort" ? "bg-accent text-accent-foreground" : "text-muted-foreground",
                  )}
                  aria-label="Komfortabel"
                >
                  <Rows3 className="size-3.5" />
                </button>
                <button
                  onClick={() => setDensity("kompakt")}
                  className={cn(
                    "inline-flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-lg",
                    density === "kompakt" ? "bg-accent text-accent-foreground" : "text-muted-foreground",
                  )}
                  aria-label="Kompakt"
                >
                  <Rows2 className="size-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Aktive Filter-Chips */}
          {activeChips.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              {activeChips.map((c, i) => (
                <button
                  key={i}
                  onClick={c.onRemove}
                  className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground hover:bg-accent/80 transition-colors"
                >
                  {c.label}
                  <X className="size-3" />
                </button>
              ))}
              <button
                onClick={resetFilter}
                className="ml-1 rounded-full px-2.5 py-1 text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                Alle zurücksetzen
              </button>
            </div>
          )}
        </div>

        {/* Tabelle / Karten */}
        {sorted.length === 0 ? (
          <EmptyState onReset={resetFilter} hasFilter={activeChips.length > 0 || query.length > 0} />
        ) : view === "tabelle" ? (
          <div className="space-y-6">
            {grouped.map((g) => (
              <div key={g.key} className="rounded-2xl bg-card shadow-soft overflow-hidden">
                {group !== "keine" && (
                  <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-secondary/40">
                    <div className="font-display text-sm font-semibold">{g.key}</div>
                    <div className="text-xs text-muted-foreground tabular">
                      {g.items.length} Abos ·{" "}
                      {fmtEUR(g.items.reduce((s, a) => s + monatlich(a), 0))} pro Monat
                    </div>
                  </div>
                )}
                <AboTable
                  items={g.items}
                  density={density}
                  selected={selected}
                  onToggleRow={toggleRow}
                  onToggleAll={group === "keine" ? toggleAll : undefined}
                  allSelected={group === "keine" ? allSelected : undefined}
                  someSelected={group === "keine" ? someSelected : undefined}
                  sortKey={sortKey}
                  sortDir={sortDir}
                  onSort={toggleSort}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sorted.map((a) => (
              <AboCard key={a.id} a={a} selected={selected.has(a.id)} onToggle={() => toggleRow(a.id)} />
            ))}
          </div>
        )}

        {/* Bulk-Aktionsleiste */}
        {selected.size > 0 && (
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-3xl">
            <div className="rounded-2xl bg-foreground text-background shadow-lift px-4 py-3 flex flex-wrap items-center gap-2 animate-draw">
              <div className="text-sm font-medium pr-2">
                {selected.size} ausgewählt
              </div>
              <button
                onClick={() => setSelected(new Set())}
                className="text-xs text-background/70 hover:text-background"
              >
                Auswahl aufheben
              </button>
              <div className="ml-auto flex flex-wrap items-center gap-1.5">
                <BulkBtn icon={UserPlus} label="Kunde" />
                <BulkBtn icon={CardIcon} label="Kanal" />
                <BulkBtn icon={Tag} label="Kategorie" />
                <BulkBtn icon={Pause} label="Pausieren" />
                <BulkBtn icon={Download} label="Export" />
                <BulkBtn icon={Archive} label="Archivieren" onClick={handleArchive} />
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-destructive px-3 py-1.5 text-xs font-medium text-destructive-foreground hover:bg-destructive/90"
                >
                  <Trash2 className="size-3.5" /> Löschen
                </button>
              </div>
            </div>
          </div>
        )}

        <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
          <AlertDialogContent className="rounded-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="font-display">
                {selected.size} {selected.size === 1 ? "Abo" : "Abos"} wirklich löschen?
              </AlertDialogTitle>
              <AlertDialogDescription>
                Das lässt sich nicht rückgängig machen. Möchtest du sie stattdessen archivieren?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-xl">Abbrechen</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="rounded-xl bg-destructive hover:bg-destructive/90"
              >
                Endgültig löschen
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
}

function FilterGroup({
  title,
  options,
  selected,
  onToggle,
}: {
  title: string;
  options: readonly string[];
  selected: Set<string>;
  onToggle: (v: string) => void;
}) {
  return (
    <div>
      <div className="text-sm font-medium mb-2">{title}</div>
      <div className="space-y-1.5">
        {options.map((o) => (
          <label
            key={o}
            className="flex items-center gap-2 text-sm cursor-pointer hover:bg-secondary/50 rounded-md px-1.5 py-1"
          >
            <Checkbox checked={selected.has(o)} onCheckedChange={() => onToggle(o)} />
            <span>{o}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

function SortBtn({
  label,
  k,
  sortKey,
  sortDir,
  onSort,
  className,
}: {
  label: string;
  k: SortKey;
  sortKey: SortKey;
  sortDir: "asc" | "desc";
  onSort: (k: SortKey) => void;
  className?: string;
}) {
  const active = sortKey === k;
  return (
    <button
      onClick={() => onSort(k)}
      className={cn(
        "inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:text-foreground transition-colors",
        active && "text-foreground",
        className,
      )}
    >
      {label}
      {active ? (
        sortDir === "asc" ? (
          <ArrowUp className="size-3" />
        ) : (
          <ArrowDown className="size-3" />
        )
      ) : (
        <ArrowUpDown className="size-3 opacity-40" />
      )}
    </button>
  );
}

function AboTable({
  items,
  density,
  selected,
  onToggleRow,
  onToggleAll,
  allSelected,
  someSelected,
  sortKey,
  sortDir,
  onSort,
}: {
  items: AboListItem[];
  density: "komfort" | "kompakt";
  selected: Set<string>;
  onToggleRow: (id: string) => void;
  onToggleAll?: () => void;
  allSelected?: boolean;
  someSelected?: boolean;
  sortKey: SortKey;
  sortDir: "asc" | "desc";
  onSort: (k: SortKey) => void;
}) {
  const rowPad = density === "komfort" ? "py-3.5" : "py-2";

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-secondary/30">
            <th className="w-10 px-4 py-3 text-left">
              {onToggleAll && (
                <Checkbox
                  checked={allSelected ? true : someSelected ? "indeterminate" : false}
                  onCheckedChange={onToggleAll}
                />
              )}
            </th>
            <th className="px-2 py-3 text-left">
              <SortBtn label="Tool" k="tool" sortKey={sortKey} sortDir={sortDir} onSort={onSort} />
            </th>
            <th className="px-2 py-3 text-left hidden md:table-cell">
              <SortBtn label="Kategorie" k="kategorie" sortKey={sortKey} sortDir={sortDir} onSort={onSort} />
            </th>
            <th className="px-2 py-3 text-right">
              <SortBtn label="Kosten" k="kosten" sortKey={sortKey} sortDir={sortDir} onSort={onSort} className="justify-end w-full" />
            </th>
            <th className="px-2 py-3 text-left hidden lg:table-cell">
              <SortBtn label="Intervall" k="intervall" sortKey={sortKey} sortDir={sortDir} onSort={onSort} />
            </th>
            <th className="px-2 py-3 text-left hidden lg:table-cell">
              <SortBtn label="Nächste Abbuchung" k="naechsteAbbuchung" sortKey={sortKey} sortDir={sortDir} onSort={onSort} />
            </th>
            <th className="px-2 py-3 text-left hidden xl:table-cell">
              <SortBtn label="Kanal" k="zahlungskanal" sortKey={sortKey} sortDir={sortDir} onSort={onSort} />
            </th>
            <th className="px-2 py-3 text-left hidden xl:table-cell">
              <SortBtn label="Kunde" k="kunde" sortKey={sortKey} sortDir={sortDir} onSort={onSort} />
            </th>
            <th className="px-2 py-3 text-left">
              <SortBtn label="Status" k="status" sortKey={sortKey} sortDir={sortDir} onSort={onSort} />
            </th>
            <th className="px-2 py-3 text-left">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Signale
              </span>
            </th>
            <th className="w-10 px-2 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {items.map((a) => {
            const isSelected = selected.has(a.id);
            return (
              <tr
                key={a.id}
                className={cn(
                  "border-b border-border/60 last:border-0 group transition-colors cursor-pointer",
                  isSelected ? "bg-accent/40" : "hover:bg-secondary/40",
                )}
                onClick={(e) => {
                  const target = e.target as HTMLElement;
                  if (target.closest("button, input, [role=menuitem]")) return;
                  // Open details (placeholder)
                }}
              >
                <td className={cn("px-4", rowPad)} onClick={(e) => e.stopPropagation()}>
                  <Checkbox checked={isSelected} onCheckedChange={() => onToggleRow(a.id)} />
                </td>
                <td className={cn("px-2", rowPad)}>
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="size-8 shrink-0 rounded-lg grid place-items-center text-xs font-display font-bold text-white"
                      style={{ background: a.farbe }}
                    >
                      {a.initial}
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium truncate">{a.tool}</div>
                      <div className="text-xs text-muted-foreground md:hidden">{a.kategorie}</div>
                    </div>
                  </div>
                </td>
                <td className={cn("px-2 hidden md:table-cell", rowPad)}>
                  <KategoriePill k={a.kategorie} />
                </td>
                <td className={cn("px-2 text-right tabular font-medium whitespace-nowrap", rowPad)}>
                  {fmtEUR(a.kosten)}
                  {a.waehrung === "USD" && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <DollarSign className="ml-1 inline size-3 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        Wird in USD abgerechnet, Betrag in EUR umgerechnet.
                      </TooltipContent>
                    </Tooltip>
                  )}
                </td>
                <td className={cn("px-2 hidden lg:table-cell", rowPad)}>
                  <IntervalBadge i={a.intervall} />
                </td>
                <td className={cn("px-2 text-sm text-muted-foreground hidden lg:table-cell tabular", rowPad)}>
                  {fmtDate(a.naechsteAbbuchung)}
                </td>
                <td className={cn("px-2 text-sm text-muted-foreground hidden xl:table-cell", rowPad)}>
                  {a.zahlungskanal}
                </td>
                <td className={cn("px-2 text-sm hidden xl:table-cell", rowPad)}>
                  <span
                    className={cn(
                      a.kunde === "Intern / nicht zugeordnet"
                        ? "text-muted-foreground italic"
                        : "text-foreground",
                    )}
                  >
                    {a.kunde}
                  </span>
                </td>
                <td className={cn("px-2", rowPad)}>
                  <StatusPill s={a.status} />
                </td>
                <td className={cn("px-2", rowPad)}>
                  <div className="flex items-center gap-1">
                    {a.hinweise.map((h) => {
                      const m = hinweisMeta[h];
                      const Icon = m.icon;
                      return (
                        <Tooltip key={h}>
                          <TooltipTrigger asChild>
                            <span
                              className="inline-flex size-6 items-center justify-center rounded-full"
                              style={{ background: m.bg, color: m.color }}
                            >
                              <Icon className="size-3" />
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>{m.label}</TooltipContent>
                        </Tooltip>
                      );
                    })}
                  </div>
                </td>
                <td className={cn("px-2 text-right", rowPad)} onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground opacity-60 group-hover:opacity-100"
                        aria-label="Aktionen"
                      >
                        <MoreHorizontal className="size-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem>Details öffnen</DropdownMenuItem>
                      <DropdownMenuItem>Bearbeiten</DropdownMenuItem>
                      <DropdownMenuItem>Kunde zuordnen</DropdownMenuItem>
                      <DropdownMenuItem>Pausieren</DropdownMenuItem>
                      <DropdownMenuItem>Duplizieren</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>Archivieren</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive focus:text-destructive">
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
  );
}

function AboCard({
  a,
  selected,
  onToggle,
}: {
  a: AboListItem;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-card shadow-soft p-4 card-lift cursor-pointer relative",
        selected && "ring-2 ring-primary",
      )}
    >
      <div className="absolute top-3 right-3" onClick={(e) => e.stopPropagation()}>
        <Checkbox checked={selected} onCheckedChange={onToggle} />
      </div>
      <div className="flex items-center gap-3">
        <div
          className="size-11 shrink-0 rounded-xl grid place-items-center text-base font-display font-bold text-white"
          style={{ background: a.farbe }}
        >
          {a.initial}
        </div>
        <div className="min-w-0">
          <div className="font-display font-semibold truncate">{a.tool}</div>
          <KategoriePill k={a.kategorie} />
        </div>
      </div>
      <div className="mt-4 flex items-end justify-between">
        <div>
          <div className="text-xs text-muted-foreground">Kosten</div>
          <div className="font-display text-2xl font-semibold tabular">{fmtEUR(a.kosten)}</div>
          <div className="text-xs text-muted-foreground">{a.intervall}</div>
        </div>
        <StatusPill s={a.status} />
      </div>
      <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
        <span>{fmtDate(a.naechsteAbbuchung)}</span>
        <span className="truncate">{a.kunde}</span>
      </div>
      {a.hinweise.length > 0 && (
        <div className="mt-3 flex gap-1">
          {a.hinweise.map((h) => {
            const m = hinweisMeta[h];
            const Icon = m.icon;
            return (
              <span
                key={h}
                className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium"
                style={{ background: m.bg, color: m.color }}
              >
                <Icon className="size-3" />
                {m.label.split(",")[0]}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}

function KategoriePill({ k }: { k: keyof typeof kategorieFarben }) {
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold text-white"
      style={{ background: kategorieFarben[k] }}
    >
      {k}
    </span>
  );
}

function StatusPill({ s }: { s: ErweiterterStatus }) {
  const c = statusFarben[s];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
      style={{ background: c.bg, color: c.text }}
    >
      <span className="size-1.5 rounded-full" style={{ background: c.dot }} />
      {s}
    </span>
  );
}

function IntervalBadge({ i }: { i: Interval }) {
  return (
    <Badge variant="outline" className="rounded-full font-normal text-xs">
      {i}
    </Badge>
  );
}

function BulkBtn({
  icon: Icon,
  label,
  onClick,
}: {
  icon: typeof Bell;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-xl bg-background/10 hover:bg-background/20 px-3 py-1.5 text-xs font-medium text-background"
    >
      <Icon className="size-3.5" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

function EmptyState({ onReset, hasFilter }: { onReset: () => void; hasFilter: boolean }) {
  return (
    <div className="rounded-2xl bg-card shadow-soft p-12 text-center">
      <div className="mx-auto size-14 rounded-2xl bg-accent grid place-items-center text-accent-foreground">
        <AlertCircle className="size-6" />
      </div>
      <h3 className="mt-4 font-display text-xl font-semibold">
        {hasFilter ? "Keine Abos passen zu diesen Filtern" : "Noch keine Abos vorhanden"}
      </h3>
      <p className="mt-1 text-sm text-muted-foreground max-w-md mx-auto">
        {hasFilter
          ? "Lockere deine Filter oder setze sie zurück, um wieder alle Abos zu sehen."
          : "Füge dein erstes Abo hinzu oder importiere deinen Kontoauszug, damit Toolfolio loslegen kann."}
      </p>
      <div className="mt-5 flex justify-center gap-2">
        {hasFilter ? (
          <Button onClick={onReset} className="rounded-xl">
            Filter zurücksetzen
          </Button>
        ) : (
          <>
            <Button className="rounded-xl gap-1.5">
              <Plus className="size-4" /> Abo hinzufügen
            </Button>
            <Button variant="outline" className="rounded-xl">
              Kontoauszug importieren
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
