"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { Plus, ClipboardCheck, CheckCircle2, XCircle, Layers, TrendingDown, Loader2, Check, X, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { formatEur as euro } from "@/lib/constants";
import { INTERVALL_LABEL } from "@/lib/abos";
import { createAntrag, entscheiden, deleteAntrag } from "@/app/app/freigaben/actions";

export type Status = "ausstehend" | "genehmigt" | "abgelehnt";
export type Kontext = { typ: "redundanz" | "budget"; text: string };
export type Antrag = {
  id: string; tool: string; kategorie: string; kosten: number; intervall: "monatlich" | "quartalsweise" | "jaehrlich";
  antragsteller: string | null; begruendung: string | null; status: Status; grund_ablehnung: string | null; monatlich: number; kontext: Kontext[];
};

const INTERVALL: Record<Antrag["intervall"], string> = { monatlich: "Mon.", quartalsweise: "Quartal", jaehrlich: "Jahr" };

export function FreigabenClient({ antraege, personen, kategorien }: { antraege: Antrag[]; personen: string[]; kategorien: string[] }) {
  const [tab, setTab] = useState<Status>("ausstehend");

  const kpi = useMemo(() => {
    const genehmigt = antraege.filter((a) => a.status === "genehmigt");
    const abgelehnt = antraege.filter((a) => a.status === "abgelehnt");
    return {
      offen: antraege.filter((a) => a.status === "ausstehend").length,
      genehmigt: genehmigt.length,
      genehmigtKosten: Math.round(genehmigt.reduce((s, a) => s + a.monatlich, 0) * 100) / 100,
      abgelehnt: abgelehnt.length,
      vermiedenJahr: Math.round(abgelehnt.reduce((s, a) => s + a.monatlich * 12, 0) * 100) / 100,
    };
  }, [antraege]);

  const sichtbar = antraege.filter((a) => a.status === tab);
  const counts = { ausstehend: kpi.offen, genehmigt: kpi.genehmigt, abgelehnt: kpi.abgelehnt };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">Freigaben</h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-xl">Anträge für neue Tools, mit Kontext zu Redundanz und Budget. Genehmige bewusst, statt nebenbei.</p>
        </div>
        <AntragDialog personen={personen} kategorien={kategorien} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <Kpi icon={<ClipboardCheck className="size-4" />} label="Zu genehmigen" value={String(kpi.offen)} tone={kpi.offen > 0 ? "amber" : undefined} />
        <Kpi icon={<CheckCircle2 className="size-4" />} label="Genehmigt" value={String(kpi.genehmigt)} hint={`+ ${euro(kpi.genehmigtKosten)} / Mon.`} tone="emerald" />
        <Kpi icon={<XCircle className="size-4" />} label="Abgelehnt" value={String(kpi.abgelehnt)} hint={kpi.vermiedenJahr > 0 ? `${euro(kpi.vermiedenJahr)} / Jahr vermieden` : undefined} />
      </div>

      <div className="inline-flex rounded-full border border-border bg-card p-1 text-sm">
        {([["ausstehend", "Zu genehmigen"], ["genehmigt", "Genehmigt"], ["abgelehnt", "Abgelehnt"]] as [Status, string][]).map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} className={cn("inline-flex items-center gap-2 rounded-full px-4 py-1.5 font-medium transition", tab === id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>
            {label}<span className={cn("inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] tabular-nums", tab === id ? "bg-white/20" : "bg-foreground/10")}>{counts[id]}</span>
          </button>
        ))}
      </div>

      {sichtbar.length === 0 ? (
        <div className="rounded-[20px] border border-dashed bg-card p-12 text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary"><ClipboardCheck className="size-6" /></span>
          <h2 className="mt-4 font-display text-lg font-semibold">{tab === "ausstehend" ? "Nichts zu genehmigen" : tab === "genehmigt" ? "Noch nichts genehmigt" : "Nichts abgelehnt"}</h2>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">Stelle einen Antrag, wenn ein neues Tool angeschafft werden soll. So bleibt jede Anschaffung bewusst entschieden.</p>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {sichtbar.map((a) => <AntragKarte key={a.id} a={a} />)}
        </div>
      )}
    </div>
  );
}

function AntragKarte({ a }: { a: Antrag }) {
  const [busy, startT] = useTransition();
  const [ablehnen, setAblehnen] = useState(false);
  const [genehmigen, setGenehmigen] = useState(false);
  const [grund, setGrund] = useState("");
  const [alsAbo, setAlsAbo] = useState(true);

  const run = (p: Promise<{ error?: string }>, ok?: string) => startT(async () => { const r = await p; if (r.error) toast.error(r.error); else if (ok) toast.success(ok); });

  return (
    <div className="rounded-[20px] bg-card border border-border p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="size-10 rounded-xl grid place-items-center bg-primary/10 text-primary font-display font-bold">{a.tool[0]?.toUpperCase()}</span>
        <div className="min-w-0 flex-1">
          <div className="font-semibold truncate">{a.tool}</div>
          <div className="text-xs text-muted-foreground">{a.kategorie}{a.antragsteller ? ` · beantragt von ${a.antragsteller}` : ""}</div>
        </div>
        <div className="text-right">
          <div className="font-display font-semibold tabular-nums">{euro(a.kosten)}</div>
          <div className="text-xs text-muted-foreground">/ {INTERVALL[a.intervall]}</div>
        </div>
      </div>

      {a.begruendung && <p className="mt-3 text-sm text-muted-foreground">{a.begruendung}</p>}

      {a.kontext.map((k, i) => (
        <div key={i} className={cn("mt-2 flex items-start gap-2 rounded-xl px-3 py-2 text-xs", k.typ === "redundanz" ? "bg-amber-50 text-amber-800" : "bg-[#FFF1EE] text-[#C2410C]")}>
          {k.typ === "redundanz" ? <Layers className="size-3.5 mt-0.5 shrink-0" /> : <TrendingDown className="size-3.5 mt-0.5 shrink-0" />}
          <span>{k.text}</span>
        </div>
      ))}

      {a.status === "abgelehnt" && a.grund_ablehnung && (
        <div className="mt-2 rounded-xl bg-muted/60 px-3 py-2 text-xs text-muted-foreground"><span className="font-medium">Ablehnung:</span> {a.grund_ablehnung}</div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {a.status === "ausstehend" ? (
          <>
            <Button size="sm" className="gap-1 bg-emerald-600 hover:bg-emerald-700" disabled={busy} onClick={() => setGenehmigen(true)}><Check className="size-4" /> Genehmigen</Button>
            <Button size="sm" variant="outline" className="gap-1" disabled={busy} onClick={() => setAblehnen(true)}><X className="size-4" /> Ablehnen</Button>
          </>
        ) : (
          <span className={cn("inline-flex items-center gap-1 text-xs font-medium", a.status === "genehmigt" ? "text-emerald-700" : "text-muted-foreground")}>
            {a.status === "genehmigt" ? <><CheckCircle2 className="size-3.5" /> Genehmigt</> : <><XCircle className="size-3.5" /> Abgelehnt</>}
          </span>
        )}
        <Button size="sm" variant="ghost" className="ml-auto text-muted-foreground hover:text-destructive" disabled={busy} onClick={() => run(deleteAntrag(a.id), "Antrag gelöscht")}><Trash2 className="size-4" /></Button>
      </div>

      <Dialog open={genehmigen} onOpenChange={setGenehmigen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{a.tool} genehmigen</DialogTitle><DialogDescription>{euro(a.kosten)} / {INTERVALL[a.intervall]} in „{a.kategorie}“.</DialogDescription></DialogHeader>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={alsAbo} onChange={(e) => setAlsAbo(e.target.checked)} className="size-4" /> Direkt als Abo im Tracker anlegen</label>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGenehmigen(false)}>Abbrechen</Button>
            <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700" disabled={busy} onClick={() => { run(entscheiden(a.id, "genehmigt", undefined, alsAbo), "Genehmigt"); setGenehmigen(false); }}>{busy && <Loader2 className="size-4 animate-spin" />} Genehmigen</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={ablehnen} onOpenChange={setAblehnen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{a.tool} ablehnen</DialogTitle><DialogDescription>Eine kurze Begründung hilft dem Antragsteller.</DialogDescription></DialogHeader>
          <Textarea rows={3} value={grund} onChange={(e) => setGrund(e.target.value)} placeholder="z. B. Es gibt bereits ein gleichwertiges Tool." />
          <DialogFooter>
            <Button variant="outline" onClick={() => setAblehnen(false)}>Abbrechen</Button>
            <Button variant="destructive" disabled={busy} onClick={() => { run(entscheiden(a.id, "abgelehnt", grund), "Abgelehnt"); setAblehnen(false); }}>Ablehnen</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AntragDialog({ personen, kategorien }: { personen: string[]; kategorien: string[] }) {
  const [open, setOpen] = useState(false);
  const [intervall, setIntervall] = useState<Antrag["intervall"]>("monatlich");
  const [pending, startT] = useTransition();

  function submit(fd: FormData) {
    fd.set("intervall", intervall);
    startT(async () => {
      const r = await createAntrag({}, fd);
      if (r.error) toast.error(r.error);
      else { toast.success("Antrag gestellt"); setOpen(false); }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button className="gap-2"><Plus className="size-4" /> Antrag stellen</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Anschaffung beantragen</DialogTitle><DialogDescription>Neues Tool zur Freigabe vorschlagen.</DialogDescription></DialogHeader>
        <form action={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5"><Label htmlFor="tool">Tool</Label><Input id="tool" name="tool" required placeholder="Linear" /></div>
            <div className="space-y-1.5"><Label htmlFor="kategorie">Kategorie</Label><Input id="kategorie" name="kategorie" required placeholder="Projektmanagement" list="kat-list" /><datalist id="kat-list">{kategorien.map((k) => <option key={k} value={k} />)}</datalist></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5"><Label htmlFor="kosten">Kosten (EUR)</Label><Input id="kosten" name="kosten" inputMode="decimal" required placeholder="12,00" /></div>
            <div className="space-y-1.5"><Label>Intervall</Label>
              <Select value={intervall} onValueChange={(v) => setIntervall(v as Antrag["intervall"])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{(["monatlich", "quartalsweise", "jaehrlich"] as const).map((iv) => <SelectItem key={iv} value={iv}>{INTERVALL_LABEL[iv]}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5"><Label htmlFor="antragsteller">Antragsteller (optional)</Label><Input id="antragsteller" name="antragsteller" placeholder="Name" list="pers-list" /><datalist id="pers-list">{personen.map((p) => <option key={p} value={p} />)}</datalist></div>
          <div className="space-y-1.5"><Label htmlFor="begruendung">Begründung (optional)</Label><Textarea id="begruendung" name="begruendung" rows={2} placeholder="Wofür wird das Tool gebraucht?" /></div>
          <DialogFooter><Button type="submit" disabled={pending} className="gap-2">{pending && <Loader2 className="size-4 animate-spin" />} Antrag stellen</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Kpi({ icon, label, value, hint, tone }: { icon: React.ReactNode; label: string; value: string; hint?: string; tone?: "emerald" | "amber" }) {
  return (
    <div className="rounded-[20px] border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between text-xs font-medium text-muted-foreground"><span>{label}</span>{icon}</div>
      <div className={cn("mt-2 font-display text-2xl font-semibold tabular-nums", tone === "emerald" && "text-emerald-700", tone === "amber" && "text-amber-600")}>{value}</div>
      {hint && <div className="mt-0.5 text-xs text-muted-foreground tabular-nums">{hint}</div>}
    </div>
  );
}
