"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { Plus, UsersRound, ShieldAlert, KeyRound, UserMinus, ChevronRight, Loader2, Trash2, Crown, CircleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WennSchreibbar } from "@/components/app/read-only-context";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { formatEur as euro } from "@/lib/constants";
import { addPerson, removePerson, setPersonStatus, assignTool, unassignTool, setOwner } from "@/app/app/zugaenge/actions";

export type PersonStatus = "aktiv" | "scheidet_aus" | "ausgeschieden";
export type Person = { id: string; name: string; rolle: string | null; email: string | null; status: PersonStatus; austritt: string | null };
export type Zugang = { id: string; person_id: string; abo_id: string; platz_kosten: number | null; ist_owner: boolean };
export type ToolRef = { id: string; tool: string; farbe: string; kategorie: string; monatlich: number };

const STATUS_LABEL: Record<PersonStatus, string> = { aktiv: "Aktiv", scheidet_aus: "Scheidet aus", ausgeschieden: "Ausgeschieden" };

function initials(name: string) {
  const t = name.trim().split(/\s+/).filter(Boolean);
  return ((t[0]?.[0] ?? "") + (t[1]?.[0] ?? "")).toUpperCase() || name.slice(0, 2).toUpperCase();
}
function StatusPill({ status }: { status: PersonStatus }) {
  const cls = status === "aktiv" ? "bg-emerald-100 text-emerald-700" : status === "scheidet_aus" ? "bg-amber-100 text-amber-700" : "bg-muted text-muted-foreground";
  return <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", cls)}>{STATUS_LABEL[status]}</span>;
}

export function ZugaengeClient({ personen, zugaenge, tools }: { personen: Person[]; zugaenge: Zugang[]; tools: ToolRef[] }) {
  const [pivot, setPivot] = useState<"person" | "tool">("person");
  const [selected, setSelected] = useState<Person | null>(null);
  const toolById = useMemo(() => new Map(tools.map((t) => [t.id, t])), [tools]);
  const personById = useMemo(() => new Map(personen.map((p) => [p.id, p])), [personen]);

  const kpi = useMemo(() => {
    const aboMitOwner = new Set(zugaenge.filter((z) => z.ist_owner).map((z) => z.abo_id));
    const aktiveTools = tools.length;
    return {
      personen: personen.filter((p) => p.status !== "ausgeschieden").length,
      mitOwner: aboMitOwner.size,
      ohneOwner: aktiveTools - aboMitOwner.size,
      zugaenge: zugaenge.length,
      inOff: personen.filter((p) => p.status === "scheidet_aus").length,
    };
  }, [personen, zugaenge, tools]);

  const proPerson = useMemo(() => {
    return personen.map((p) => {
      const meine = zugaenge.filter((z) => z.person_id === p.id);
      const fuss = meine.reduce((s, z) => s + (z.platz_kosten ?? 0), 0);
      const risiko = p.status === "ausgeschieden" && meine.length > 0;
      return { p, anzahl: meine.length, fuss, risiko };
    });
  }, [personen, zugaenge]);

  const proTool = useMemo(() => {
    return tools.map((t) => {
      const zg = zugaenge.filter((z) => z.abo_id === t.id);
      const owner = zg.find((z) => z.ist_owner);
      return { t, nutzer: zg.map((z) => personById.get(z.person_id)).filter(Boolean) as Person[], ownerPerson: owner ? personById.get(owner.person_id) : null };
    });
  }, [tools, zugaenge, personById]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">Team & Zugänge</h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-xl">Wer nutzt was, wer ist verantwortlich, und was beim Austritt zu tun ist.</p>
        </div>
        <AddPersonDialog />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Kpi icon={<UsersRound className="size-4" />} label="Personen" value={String(kpi.personen)} />
        <Kpi icon={<ShieldAlert className="size-4" />} label="Tools mit / ohne Owner" value={`${kpi.mitOwner} / ${kpi.ohneOwner}`} accent={kpi.ohneOwner > 0 ? "amber" : undefined} hint={kpi.ohneOwner > 0 ? `${kpi.ohneOwner} ohne Owner` : "alle zugewiesen"} />
        <Kpi icon={<KeyRound className="size-4" />} label="Zugänge gesamt" value={String(kpi.zugaenge)} />
        <Kpi icon={<UserMinus className="size-4" />} label="In Offboarding" value={String(kpi.inOff)} accent={kpi.inOff > 0 ? "amber" : undefined} />
      </div>

      <div className="inline-flex rounded-full border border-border bg-card p-1 text-sm">
        {(["person", "tool"] as const).map((v) => (
          <button key={v} onClick={() => setPivot(v)} className={cn("px-4 py-1.5 rounded-full font-medium transition", pivot === v ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>
            {v === "person" ? "nach Person" : "nach Tool"}
          </button>
        ))}
      </div>

      {personen.length === 0 ? (
        <div className="rounded-[20px] border border-dashed bg-card p-12 text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary"><UsersRound className="size-6" /></span>
          <h2 className="mt-4 font-display text-lg font-semibold">Noch keine Personen</h2>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">Lege Personen an und ordne ihnen Tools zu. So siehst du, wer was nutzt, und hast beim Austritt eine Offboarding-Checkliste.</p>
          <div className="mt-5 flex justify-center"><AddPersonDialog /></div>
        </div>
      ) : pivot === "person" ? (
        <div className="grid md:grid-cols-2 gap-3">
          {proPerson.map(({ p, anzahl, fuss, risiko }) => (
            <div key={p.id} className="rounded-[20px] bg-card border border-border p-5 shadow-sm hover:shadow-md transition">
              <div className="flex items-start gap-3">
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-primary/10 text-primary font-display font-semibold">{initials(p.name)}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="font-semibold truncate">{p.name}</div>
                    <StatusPill status={p.status} />
                    {risiko && <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 text-rose-700 px-2 py-0.5 text-xs font-medium"><CircleAlert className="size-3" /> Risiko: aktive Zugänge</span>}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">{p.rolle || "ohne Rolle"}{p.austritt && ` · Austritt ${fmtDate(p.austritt)}`}</div>
                </div>
              </div>
              <div className="mt-4 flex items-end justify-between">
                <div><div className="text-xs text-muted-foreground">Zugänge</div><div className="font-display text-2xl font-semibold tabular-nums">{anzahl}</div></div>
                <div className="text-right"><div className="text-xs text-muted-foreground">Kostenfußabdruck</div><div className="font-display text-2xl font-semibold tabular-nums">{euro(fuss)}<span className="text-sm text-muted-foreground font-normal"> / Mon.</span></div></div>
              </div>
              <div className="mt-4 flex gap-2">
                <Button variant="outline" size="sm" className="gap-1" onClick={() => setSelected(p)}>Zugänge verwalten <ChevronRight className="size-4" /></Button>
                {(p.status === "scheidet_aus" || risiko) && <Button size="sm" className="gap-1 bg-amber-500 hover:bg-amber-600 text-white" onClick={() => setSelected(p)}><UserMinus className="size-4" /> Offboarding</Button>}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-3">
          {proTool.map(({ t, nutzer, ownerPerson }) => (
            <div key={t.id} className="rounded-[20px] bg-card border border-border p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <span className="size-10 rounded-xl grid place-items-center text-white font-display font-bold" style={{ background: t.farbe }}>{t.tool[0]}</span>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold truncate">{t.tool}</div>
                  <div className="text-xs text-muted-foreground">{t.kategorie} · {euro(t.monatlich)} / Mon.</div>
                </div>
              </div>
              <div className="mt-4">
                <div className="text-xs text-muted-foreground">Nutzer ({nutzer.length})</div>
                {nutzer.length === 0 ? (
                  <div className="mt-1 text-sm text-muted-foreground">Noch niemand zugeordnet.</div>
                ) : (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {nutzer.map((n) => <span key={n.id} className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-medium"><span className="grid size-4 place-items-center rounded-full bg-primary/15 text-[9px] font-bold text-primary">{initials(n.name)}</span>{n.name}</span>)}
                  </div>
                )}
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm">
                <Crown className={cn("size-4", ownerPerson ? "text-primary" : "text-muted-foreground")} />
                <span className="text-muted-foreground">Owner:</span>
                <OwnerSelect tool={t} zugaenge={zugaenge.filter((z) => z.abo_id === t.id)} personById={personById} />
              </div>
            </div>
          ))}
        </div>
      )}

      {selected && <PersonDialog key={selected.id} person={selected} zugaenge={zugaenge.filter((z) => z.person_id === selected.id)} tools={tools} toolById={toolById} onClose={() => setSelected(null)} />}
    </div>
  );
}

function fmtDate(iso: string) { const [y, m, d] = iso.split("-"); return d ? `${d}.${m}.${y}` : iso; }

function Kpi({ icon, label, value, hint, accent }: { icon: React.ReactNode; label: string; value: string; hint?: string; accent?: "amber" }) {
  return (
    <div className="rounded-[20px] border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between text-xs font-medium text-muted-foreground"><span>{label}</span>{icon}</div>
      <div className={cn("mt-2 font-display text-2xl font-semibold tabular-nums", accent === "amber" && "text-amber-600")}>{value}</div>
      {hint && <div className="mt-0.5 text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}

function AddPersonDialog() {
  const [open, setOpen] = useState(false);
  const [pending, startT] = useTransition();
  function submit(fd: FormData) {
    startT(async () => {
      const r = await addPerson({}, fd);
      if (r.error) toast.error(r.error);
      else { toast.success("Person angelegt"); setOpen(false); }
    });
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <WennSchreibbar><DialogTrigger asChild><Button className="gap-2"><Plus className="size-4" /> Person hinzufügen</Button></DialogTrigger></WennSchreibbar>
      <DialogContent>
        <DialogHeader><DialogTitle>Person hinzufügen</DialogTitle><DialogDescription>Teammitglied oder externe Person, die Tools nutzt.</DialogDescription></DialogHeader>
        <form action={submit} className="space-y-4">
          <div className="space-y-1.5"><Label htmlFor="name">Name</Label><Input id="name" name="name" required placeholder="Max Mustermann" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5"><Label htmlFor="rolle">Rolle (optional)</Label><Input id="rolle" name="rolle" placeholder="Designer" /></div>
            <div className="space-y-1.5"><Label htmlFor="email">E-Mail (optional)</Label><Input id="email" name="email" type="email" placeholder="max@agentur.de" /></div>
          </div>
          <DialogFooter><Button type="submit" disabled={pending} className="gap-2">{pending && <Loader2 className="size-4 animate-spin" />} Anlegen</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function OwnerSelect({ tool, zugaenge, personById }: { tool: ToolRef; zugaenge: Zugang[]; personById: Map<string, Person> }) {
  const [busy, startT] = useTransition();
  const current = zugaenge.find((z) => z.ist_owner);
  return (
    <Select value={current?.id ?? "none"} onValueChange={(v) => startT(async () => { const r = await setOwner(tool.id, v === "none" ? null : v); if (r.error) toast.error(r.error); })}>
      <SelectTrigger className="h-8 w-44" disabled={busy || zugaenge.length === 0}><SelectValue placeholder={zugaenge.length ? "wählen" : "keine Nutzer"} /></SelectTrigger>
      <SelectContent>
        <SelectItem value="none">Niemand</SelectItem>
        {zugaenge.map((z) => { const p = personById.get(z.person_id); return p ? <SelectItem key={z.id} value={z.id}>{p.name}</SelectItem> : null; })}
      </SelectContent>
    </Select>
  );
}

function PersonDialog({ person, zugaenge, tools, toolById, onClose }: { person: Person; zugaenge: Zugang[]; tools: ToolRef[]; toolById: Map<string, ToolRef>; onClose: () => void }) {
  const [busy, startT] = useTransition();
  const [addAbo, setAddAbo] = useState("");
  const [addKosten, setAddKosten] = useState("");
  const zugewiesen = new Set(zugaenge.map((z) => z.abo_id));
  const verfuegbar = tools.filter((t) => !zugewiesen.has(t.id));

  const run = (p: Promise<{ error?: string }>, ok?: string) => startT(async () => { const r = await p; if (r.error) toast.error(r.error); else if (ok) toast.success(ok); });

  function setStatus(status: PersonStatus) {
    const austritt = status === "scheidet_aus" || status === "ausgeschieden" ? new Date().toISOString().slice(0, 10) : null;
    run(setPersonStatus(person.id, status, austritt), "Status aktualisiert");
  }
  function hinzufuegen() {
    if (!addAbo) return;
    const k = addKosten.trim() ? Number(addKosten.replace(",", ".")) : (toolById.get(addAbo)?.monatlich ?? null);
    run(assignTool(person.id, addAbo, k && k >= 0 ? k : null), "Tool zugeordnet");
    setAddAbo(""); setAddKosten("");
  }

  const offboarding = person.status !== "aktiv";

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="grid size-7 place-items-center rounded-full bg-primary/10 text-primary text-xs font-bold">{initials(person.name)}</span>
            {person.name}
          </DialogTitle>
          <DialogDescription>{person.rolle || "ohne Rolle"}{person.email ? ` · ${person.email}` : ""}</DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-1 rounded-full bg-muted p-0.5 text-xs font-medium">
          {(["aktiv", "scheidet_aus", "ausgeschieden"] as PersonStatus[]).map((s) => (
            <button key={s} onClick={() => setStatus(s)} disabled={busy} className={cn("flex-1 rounded-full px-3 py-1.5 transition", person.status === s ? "bg-card shadow text-foreground" : "text-muted-foreground")}>{STATUS_LABEL[s]}</button>
          ))}
        </div>

        {offboarding && zugaenge.length > 0 && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
            Offboarding-Checkliste: Entferne jeden Zugang, sobald er beim Anbieter entzogen oder übertragen wurde. Verbleibende Zugänge sind ein Risiko.
          </div>
        )}

        <div className="space-y-1.5">
          <div className="text-xs font-medium text-muted-foreground">Zugeordnete Tools ({zugaenge.length})</div>
          <div className="max-h-56 space-y-1 overflow-y-auto pr-1">
            {zugaenge.length === 0 && <div className="text-sm text-muted-foreground">Noch keine Tools zugeordnet.</div>}
            {zugaenge.map((z) => {
              const t = toolById.get(z.abo_id);
              return (
                <div key={z.id} className="flex items-center gap-2 rounded-lg border px-3 py-2">
                  <span className="size-6 shrink-0 rounded-md grid place-items-center text-white text-[10px] font-bold" style={{ background: t?.farbe ?? "#6C5CE7" }}>{t?.tool[0] ?? "?"}</span>
                  <div className="min-w-0 flex-1"><div className="truncate text-sm font-medium">{t?.tool ?? "Tool"}</div></div>
                  <span className="text-xs tabular-nums text-muted-foreground">{z.platz_kosten != null ? `${euro(z.platz_kosten)} / Mon.` : "—"}</span>
                  <Button variant="ghost" size="icon" className="size-7 text-muted-foreground hover:text-destructive" disabled={busy} onClick={() => run(unassignTool(z.id), "Zugang entfernt")}><Trash2 className="size-3.5" /></Button>
                </div>
              );
            })}
          </div>
        </div>

        {verfuegbar.length > 0 && (
          <div className="flex items-end gap-2 border-t pt-3">
            <div className="flex-1 space-y-1"><Label className="text-xs">Tool zuordnen</Label>
              <Select value={addAbo} onValueChange={setAddAbo}>
                <SelectTrigger className="h-9"><SelectValue placeholder="Tool wählen" /></SelectTrigger>
                <SelectContent>{verfuegbar.map((t) => <SelectItem key={t.id} value={t.id}>{t.tool}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="w-28 space-y-1"><Label className="text-xs">Platz-Kosten</Label><Input className="h-9" inputMode="decimal" value={addKosten} onChange={(e) => setAddKosten(e.target.value)} placeholder={addAbo ? String(toolById.get(addAbo)?.monatlich ?? "").replace(".", ",") : "0,00"} /></div>
            <Button className="h-9" disabled={!addAbo || busy} onClick={hinzufuegen}>Hinzufügen</Button>
          </div>
        )}

        <DialogFooter className="sm:justify-between">
          <Button variant="ghost" className="gap-2 text-destructive hover:text-destructive" disabled={busy} onClick={() => run(removePerson(person.id).then((r) => { if (!r.error) onClose(); return r; }), "Person entfernt")}><Trash2 className="size-4" /> Person löschen</Button>
          <Button onClick={onClose}>Fertig</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
