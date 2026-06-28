"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import {
  Layers, FileText, FileSignature, ScrollText, File as FileIcon, Sparkles, Search,
  Download, Trash2, Plus, Loader2, ChevronDown, ChevronUp, Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { WennSchreibbar } from "@/components/app/read-only-context";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { formatEur as euro } from "@/lib/constants";
import { uploadDokument, getDownloadUrl, deleteDokument } from "@/app/app/archiv/actions";

export type DocTyp = "rechnung" | "vertrag" | "agb" | "sonstiges";
export type Dok = { id: string; abo_id: string | null; typ: DocTyp; titel: string; datum: string | null; jahr: number | null; betrag: number | null; hatDatei: boolean };
export type AboRef = { id: string; tool: string; farbe: string | null; kategorie: string; initial: string | null };

const TYP_ICON: Record<DocTyp, typeof FileText> = { rechnung: FileText, vertrag: FileSignature, agb: ScrollText, sonstiges: FileIcon };
function typLabel(t: DocTyp) { return t === "rechnung" ? "Rechnung" : t === "vertrag" ? "Vertrag" : t === "agb" ? "AGB-Snapshot" : "Sonstiges"; }
function typTone(t: DocTyp) { return t === "rechnung" ? "bg-primary/10 text-primary" : t === "vertrag" ? "bg-emerald-100 text-emerald-700" : t === "agb" ? "bg-amber-100 text-amber-700" : "bg-muted text-muted-foreground"; }
function fmtDate(iso: string | null) { if (!iso) return ""; const [y, m, d] = iso.split("-"); return d ? `${d}.${m}.${y}` : iso; }

export function ArchivClient({ dokumente, abos }: { dokumente: Dok[]; abos: AboRef[] }) {
  const [ansicht, setAnsicht] = useState<"abo" | "alle">("abo");
  const [suche, setSuche] = useState("");
  const [typFilter, setTypFilter] = useState<"alle" | DocTyp>("alle");
  const [aboFilter, setAboFilter] = useState("alle");
  const [jahrFilter, setJahrFilter] = useState("alle");
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [busy, startT] = useTransition();

  const aboById = useMemo(() => new Map(abos.map((a) => [a.id, a])), [abos]);
  const jahre = useMemo(() => [...new Set(dokumente.map((d) => d.jahr).filter(Boolean) as number[])].sort((a, b) => b - a), [dokumente]);
  const aktJahr = new Date().getFullYear();

  const stats = useMemo(() => ({
    gesamt: dokumente.length,
    rechnungenJahr: dokumente.filter((d) => d.typ === "rechnung" && d.jahr === aktJahr).length,
    ausgaben: dokumente.filter((d) => d.typ === "rechnung").reduce((s, d) => s + (d.betrag ?? 0), 0),
    vertraege: dokumente.filter((d) => d.typ === "vertrag").length,
  }), [dokumente, aktJahr]);

  const matches = (d: Dok) => {
    if (typFilter !== "alle" && d.typ !== typFilter) return false;
    if (aboFilter !== "alle" && (d.abo_id ?? "none") !== aboFilter) return false;
    if (jahrFilter !== "alle" && String(d.jahr) !== jahrFilter) return false;
    if (suche) {
      const q = suche.toLowerCase();
      const tool = d.abo_id ? aboById.get(d.abo_id)?.tool ?? "" : "";
      if (!d.titel.toLowerCase().includes(q) && !tool.toLowerCase().includes(q)) return false;
    }
    return true;
  };

  const flach = useMemo(() => dokumente.filter(matches).sort((a, b) => (a.datum ?? "") < (b.datum ?? "") ? 1 : -1), [dokumente, typFilter, aboFilter, jahrFilter, suche]); // eslint-disable-line react-hooks/exhaustive-deps

  const gruppen = useMemo(() => {
    const map = new Map<string, Dok[]>();
    for (const d of flach) {
      const key = d.abo_id ?? "none";
      map.set(key, [...(map.get(key) ?? []), d]);
    }
    return [...map.entries()];
  }, [flach]);

  function download(id: string) {
    startT(async () => {
      const r = await getDownloadUrl(id);
      if (r.error || !r.url) toast.error(r.error ?? "Kein Download verfügbar.");
      else window.open(r.url, "_blank");
    });
  }
  function entfernen(id: string) {
    startT(async () => {
      const r = await deleteDokument(id);
      if (r.error) toast.error(r.error); else toast.success("Dokument gelöscht");
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight">Archiv</h1>
          <p className="text-muted-foreground max-w-2xl mt-1">Rechnungen, Verträge und AGB-Snapshots zentral und sicher abgelegt.</p>
        </div>
        <UploadDialog abos={abos} />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={Layers} label="Dokumente gesamt" wert={String(stats.gesamt)} />
        <Stat icon={FileText} label={`Rechnungen ${aktJahr}`} wert={String(stats.rechnungenJahr)} />
        <Stat icon={Sparkles} label="Dokumentierte Ausgaben" wert={euro(stats.ausgaben)} tone="emerald" />
        <Stat icon={FileSignature} label="Verträge" wert={String(stats.vertraege)} />
      </div>

      <div className="rounded-3xl border border-border bg-card p-4 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex rounded-full bg-muted p-0.5 text-xs font-medium">
            {(["abo", "alle"] as const).map((v) => (
              <button key={v} onClick={() => setAnsicht(v)} className={cn("rounded-full px-3 py-1.5 transition-colors", ansicht === v ? "bg-card shadow text-foreground" : "text-muted-foreground")}>{v === "abo" ? "Nach Abo" : "Alle Dokumente"}</button>
            ))}
          </div>
          <div className="relative flex-1 min-w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input value={suche} onChange={(e) => setSuche(e.target.value)} placeholder="Dokument oder Tool suchen" className="pl-9" />
          </div>
        </div>
        <div className="grid gap-2 sm:grid-cols-3">
          <Select value={aboFilter} onValueChange={setAboFilter}>
            <SelectTrigger><SelectValue placeholder="Abo" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="alle">Alle Abos</SelectItem>
              <SelectItem value="none">Ohne Zuordnung</SelectItem>
              {abos.map((a) => <SelectItem key={a.id} value={a.id}>{a.tool}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={typFilter} onValueChange={(v) => setTypFilter(v as typeof typFilter)}>
            <SelectTrigger><SelectValue placeholder="Typ" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="alle">Alle Typen</SelectItem>
              <SelectItem value="rechnung">Rechnung</SelectItem>
              <SelectItem value="vertrag">Vertrag</SelectItem>
              <SelectItem value="agb">AGB-Snapshot</SelectItem>
              <SelectItem value="sonstiges">Sonstiges</SelectItem>
            </SelectContent>
          </Select>
          <Select value={jahrFilter} onValueChange={setJahrFilter}>
            <SelectTrigger><SelectValue placeholder="Jahr" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="alle">Alle Jahre</SelectItem>
              {jahre.map((j) => <SelectItem key={j} value={String(j)}>{j}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {dokumente.length === 0 ? (
        <div className="rounded-3xl border border-dashed bg-card p-12 text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary"><Upload className="size-6" /></span>
          <h2 className="mt-4 font-display text-lg font-semibold">Noch keine Dokumente</h2>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">Lade Rechnungen, Verträge oder AGB-Snapshots hoch und ordne sie deinen Abos zu.</p>
          <div className="mt-5 flex justify-center"><UploadDialog abos={abos} /></div>
        </div>
      ) : flach.length === 0 ? (
        <div className="rounded-3xl border bg-card p-10 text-center text-sm text-muted-foreground">Keine Dokumente für diese Filter.</div>
      ) : ansicht === "alle" ? (
        <div className="rounded-3xl border border-border bg-card divide-y shadow-sm">
          {flach.map((d) => <Zeile key={d.id} d={d} abo={d.abo_id ? aboById.get(d.abo_id) : undefined} busy={busy} onDownload={() => download(d.id)} onDelete={() => entfernen(d.id)} />)}
        </div>
      ) : (
        <div className="space-y-4">
          {gruppen.map(([key, docs]) => {
            const abo = key !== "none" ? aboById.get(key) : undefined;
            const isOpen = open[key] ?? true;
            const summe = docs.filter((d) => d.typ === "rechnung").reduce((s, d) => s + (d.betrag ?? 0), 0);
            return (
              <div key={key} className="rounded-3xl bg-card border border-border shadow-sm">
                <button onClick={() => setOpen((o) => ({ ...o, [key]: !isOpen }))} className="w-full text-left px-5 py-4 flex items-center gap-4">
                  <div className="size-11 rounded-2xl grid place-items-center text-white font-display font-bold" style={{ background: abo?.farbe ?? "#6C5CE7" }}>{abo?.initial ?? (abo?.tool?.[0] ?? "?")}</div>
                  <div className="min-w-0 flex-1">
                    <div className="font-display text-lg font-semibold">{abo?.tool ?? "Ohne Zuordnung"}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{docs.length} Dokumente · Rechnungen gesamt <span className="tabular-nums font-semibold text-foreground">{euro(summe)}</span></div>
                  </div>
                  {isOpen ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                </button>
                {isOpen && <div className="border-t divide-y">{docs.map((d) => <Zeile key={d.id} d={d} busy={busy} onDownload={() => download(d.id)} onDelete={() => entfernen(d.id)} />)}</div>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Zeile({ d, abo, busy, onDownload, onDelete }: { d: Dok; abo?: AboRef; busy: boolean; onDownload: () => void; onDelete: () => void }) {
  const Icon = TYP_ICON[d.typ];
  return (
    <div className="flex items-center gap-3 px-5 py-3">
      <span className={cn("grid size-9 shrink-0 place-items-center rounded-xl", typTone(d.typ))}><Icon className="size-4" /></span>
      <div className="min-w-0 flex-1">
        <div className="truncate font-medium">{d.titel}</div>
        <div className="text-xs text-muted-foreground">
          {typLabel(d.typ)}{abo ? ` · ${abo.tool}` : ""}{d.datum ? ` · ${fmtDate(d.datum)}` : ""}{d.betrag != null ? ` · ${euro(d.betrag)}` : ""}
        </div>
      </div>
      {d.hatDatei && <Button variant="ghost" size="icon" disabled={busy} onClick={onDownload} aria-label="Herunterladen"><Download className="size-4" /></Button>}
      <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" disabled={busy} onClick={onDelete} aria-label="Löschen"><Trash2 className="size-4" /></Button>
    </div>
  );
}

function Stat({ icon: Icon, label, wert, tone }: { icon: typeof Layers; label: string; wert: string; tone?: "emerald" }) {
  return (
    <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between text-xs font-medium text-muted-foreground"><span>{label}</span><Icon className="size-4" /></div>
      <div className={cn("mt-2 font-display text-2xl font-semibold tracking-tight tabular-nums", tone === "emerald" && "text-emerald-700")}>{wert}</div>
    </div>
  );
}

function UploadDialog({ abos }: { abos: AboRef[] }) {
  const [open, setOpen] = useState(false);
  const [typ, setTyp] = useState<DocTyp>("rechnung");
  const [aboId, setAboId] = useState("none");
  const [pending, startT] = useTransition();

  function submit(fd: FormData) {
    fd.set("typ", typ);
    fd.set("abo_id", aboId === "none" ? "" : aboId);
    startT(async () => {
      const r = await uploadDokument({}, fd);
      if (r.error) toast.error(r.error);
      else { toast.success("Dokument gespeichert"); setOpen(false); }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <WennSchreibbar><DialogTrigger asChild><Button className="gap-2"><Plus className="size-4" /> Dokument hinzufügen</Button></DialogTrigger></WennSchreibbar>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Dokument hinzufügen</DialogTitle>
          <DialogDescription>Rechnung, Vertrag oder AGB-Snapshot ablegen (PDF, PNG, JPG, WebP, max. 10 MB).</DialogDescription>
        </DialogHeader>
        <form action={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Typ</Label>
              <Select value={typ} onValueChange={(v) => setTyp(v as DocTyp)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="rechnung">Rechnung</SelectItem>
                  <SelectItem value="vertrag">Vertrag</SelectItem>
                  <SelectItem value="agb">AGB-Snapshot</SelectItem>
                  <SelectItem value="sonstiges">Sonstiges</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Abo</Label>
              <Select value={aboId} onValueChange={setAboId}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Ohne Zuordnung</SelectItem>
                  {abos.map((a) => <SelectItem key={a.id} value={a.id}>{a.tool}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5"><Label htmlFor="titel">Titel</Label><Input id="titel" name="titel" required placeholder="Rechnung Juni 2026" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5"><Label htmlFor="datum">Datum</Label><Input id="datum" name="datum" type="date" /></div>
            <div className="space-y-1.5"><Label htmlFor="betrag">Betrag (EUR, optional)</Label><Input id="betrag" name="betrag" inputMode="decimal" placeholder="32,00" /></div>
          </div>
          <div className="space-y-1.5"><Label htmlFor="datei">Datei (optional)</Label><Input id="datei" name="datei" type="file" accept=".pdf,.png,.jpg,.jpeg,.webp" /></div>
          <DialogFooter>
            <Button type="submit" disabled={pending} className="gap-2">{pending && <Loader2 className="size-4 animate-spin" />} Speichern</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
