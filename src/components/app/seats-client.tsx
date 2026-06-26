"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { Armchair, Users, AlertTriangle, Sparkles, Settings2, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { formatEur as euro } from "@/lib/constants";
import { setLizenzen } from "@/app/app/seats/actions";

export type ToolSeat = {
  id: string; tool: string; farbe: string; kategorie: string; monatlich: number;
  gebucht: number | null; zugewiesen: number; preisProPlatz: number; ungenutzt: number | null; verschwendungMonat: number;
  nutzer: { name: string; rolle: string | null }[];
};

export function SeatsClient({ tools }: { tools: ToolSeat[] }) {
  const [drill, setDrill] = useState<ToolSeat | null>(null);

  const kpi = useMemo(() => {
    let gebucht = 0, genutzt = 0, ungenutzt = 0, verschwMonat = 0;
    for (const t of tools) {
      genutzt += t.zugewiesen;
      if (t.gebucht != null) { gebucht += t.gebucht; ungenutzt += t.ungenutzt ?? 0; verschwMonat += t.verschwendungMonat; }
    }
    return { gebucht, genutzt, ungenutzt, verschwMonat: Math.round(verschwMonat * 100) / 100, verschwJahr: Math.round(verschwMonat * 12 * 100) / 100 };
  }, [tools]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Seats & Lizenzen</h1>
        <p className="text-sm text-muted-foreground mt-1 max-w-xl">Bezahlte Plätze gegen tatsächlich zugewiesene. Hol dir ungenutzte zurück, das ist meist reine Ersparnis.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Kpi icon={<Armchair className="size-4" />} label="Gebucht" value={String(kpi.gebucht)} />
        <Kpi icon={<Users className="size-4" />} label="Zugewiesen" value={String(kpi.genutzt)} tone="emerald" />
        <Kpi icon={<AlertTriangle className="size-4" />} label="Ungenutzt" value={String(kpi.ungenutzt)} tone={kpi.ungenutzt > 0 ? "amber" : undefined} />
        <Kpi icon={<Sparkles className="size-4" />} label="Verschwendung" value={`${euro(kpi.verschwMonat)} / Mon.`} hint={`${euro(kpi.verschwJahr)} / Jahr`} tone={kpi.verschwMonat > 0 ? "coral" : undefined} />
      </div>

      {kpi.ungenutzt > 0 && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <AlertTriangle className="size-5 shrink-0 text-amber-600" />
          <div className="text-sm text-amber-900">
            <span className="font-semibold">{kpi.ungenutzt} ungenutzte Plätze erkannt.</span> Reduziere die gebuchten Lizenzen oder weise die Plätze zu, um bis zu <span className="font-semibold tabular-nums">{euro(kpi.verschwJahr)}</span> pro Jahr zu sparen.
          </div>
        </div>
      )}

      {tools.length === 0 ? (
        <div className="rounded-[20px] border border-dashed bg-card p-12 text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary"><Armchair className="size-6" /></span>
          <h2 className="mt-4 font-display text-lg font-semibold">Keine aktiven Abos</h2>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">Lege Abos an und ordne unter Team &amp; Zugänge Nutzer zu. Dann siehst du hier gebuchte gegen genutzte Plätze.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-3">
          {tools.map((t) => <SeatCard key={t.id} t={t} onDrill={() => setDrill(t)} />)}
        </div>
      )}

      {drill && (
        <Dialog open onOpenChange={(o) => !o && setDrill(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2"><span className="size-7 rounded-lg grid place-items-center text-white text-xs font-bold" style={{ background: drill.farbe }}>{drill.tool[0]}</span>{drill.tool}</DialogTitle>
              <DialogDescription>{drill.zugewiesen} zugewiesen{drill.gebucht != null ? ` von ${drill.gebucht} gebuchten Plätzen` : ""}. Letzte Nutzung benötigt eine Integration (folgt).</DialogDescription>
            </DialogHeader>
            <div className="max-h-72 space-y-1 overflow-y-auto pr-1">
              {drill.nutzer.length === 0 && <div className="text-sm text-muted-foreground">Noch niemand zugeordnet. Weise unter Team &amp; Zugänge Personen zu.</div>}
              {drill.nutzer.map((n, i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg border px-3 py-2">
                  <span className="grid size-7 place-items-center rounded-full bg-primary/10 text-primary text-[10px] font-bold">{(n.name.split(/\s+/).map((w) => w[0]).join("").slice(0, 2) || "?").toUpperCase()}</span>
                  <div className="min-w-0 flex-1"><div className="truncate text-sm font-medium">{n.name}</div><div className="text-xs text-muted-foreground">{n.rolle || "ohne Rolle"}</div></div>
                  <span className="text-xs text-muted-foreground">Nutzungsdaten nötig</span>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function SeatCard({ t, onDrill }: { t: ToolSeat; onDrill: () => void }) {
  const [busy, startT] = useTransition();
  const [edit, setEdit] = useState(t.gebucht == null);
  const [val, setVal] = useState(t.gebucht != null ? String(t.gebucht) : "");

  function save() {
    const n = val.trim() === "" ? null : Math.round(Number(val));
    startT(async () => {
      const r = await setLizenzen(t.id, n);
      if (r.error) toast.error(r.error);
      else { toast.success("Plätze gespeichert"); setEdit(false); }
    });
  }

  const pct = t.gebucht && t.gebucht > 0 ? Math.min(100, (t.zugewiesen / t.gebucht) * 100) : 0;
  const ueber = t.gebucht != null && t.zugewiesen > t.gebucht;

  return (
    <div className="rounded-[20px] bg-card border border-border p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="size-10 rounded-xl grid place-items-center text-white font-display font-bold" style={{ background: t.farbe }}>{t.tool[0]}</span>
        <div className="min-w-0 flex-1">
          <div className="font-semibold truncate">{t.tool}</div>
          <div className="text-xs text-muted-foreground">{t.kategorie} · {euro(t.monatlich)} / Mon.</div>
        </div>
        {t.ungenutzt != null && t.ungenutzt > 0 && <span className="inline-flex items-center rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700">{t.ungenutzt} ungenutzt</span>}
      </div>

      <div className="mt-4">
        {t.gebucht != null && !edit ? (
          <>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Plätze</span>
              <span className="font-medium tabular-nums">{t.zugewiesen} / {t.gebucht} zugewiesen</span>
            </div>
            <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-muted">
              <div className={cn("h-full rounded-full", ueber ? "bg-rose-500" : pct >= 100 ? "bg-emerald-500" : "bg-primary")} style={{ width: `${pct}%` }} />
            </div>
            {t.verschwendungMonat > 0 && <div className="mt-2 text-xs text-muted-foreground">Verschwendung: <span className="font-semibold tabular-nums text-foreground">{euro(t.verschwendungMonat)} / Mon.</span> ({euro(t.preisProPlatz)} / Platz)</div>}
          </>
        ) : (
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <label className="text-xs text-muted-foreground">Gebuchte Plätze</label>
              <Input className="mt-1 h-9" inputMode="numeric" value={val} onChange={(e) => setVal(e.target.value)} placeholder="z. B. 10" onKeyDown={(e) => { if (e.key === "Enter") save(); }} />
            </div>
            <Button className="h-9 gap-1" disabled={busy} onClick={save}>{busy && <Loader2 className="size-4 animate-spin" />} Speichern</Button>
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center gap-2">
        {t.gebucht != null && !edit && <Button variant="outline" size="sm" className="gap-1" onClick={() => setEdit(true)}><Settings2 className="size-4" /> Plätze anpassen</Button>}
        <Button variant="ghost" size="sm" className="gap-1" onClick={onDrill}>Nutzer ansehen <ChevronRight className="size-4" /></Button>
      </div>
    </div>
  );
}

function Kpi({ icon, label, value, hint, tone }: { icon: React.ReactNode; label: string; value: string; hint?: string; tone?: "emerald" | "amber" | "coral" }) {
  const toneCls = tone === "emerald" ? "text-emerald-700" : tone === "amber" ? "text-amber-600" : tone === "coral" ? "text-coral" : "";
  return (
    <div className="rounded-[20px] border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between text-xs font-medium text-muted-foreground"><span>{label}</span>{icon}</div>
      <div className={cn("mt-2 font-display text-2xl font-semibold tabular-nums", toneCls)}>{value}</div>
      {hint && <div className="mt-0.5 text-xs text-muted-foreground tabular-nums">{hint}</div>}
    </div>
  );
}
