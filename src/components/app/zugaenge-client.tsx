"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import {
  Plus, UsersRound, ShieldAlert, KeyRound, UserMinus, ChevronRight, Loader2, Trash2,
  CircleAlert, AlertTriangle, Info, Check, X, Armchair, Mail, History,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { WennSchreibbar } from "@/components/app/read-only-context";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { formatEur as euro } from "@/lib/constants";
import {
  addPerson, removePerson, setPersonStatus, assignTool, unassignTool, setOwner,
  setAktivitaet, offboardingAbschliessen,
} from "@/app/app/zugaenge/actions";

export type PersonStatus = "aktiv" | "scheidet_aus" | "ausgeschieden";
export type Person = { id: string; name: string; rolle: string | null; email: string | null; status: PersonStatus; austritt: string | null; farbe: string | null };
export type Zugang = { id: string; person_id: string; abo_id: string; platz_kosten: number | null; letzte_aktivitaet: string | null };
export type ToolRef = { id: string; tool: string; farbe: string; kategorie: string; monatlich: number; ownerPersonId: string | null };
export type Offboarding = { id: string; person_name: string; zugaenge_entzogen: number; plaetze_zurueck: number; ersparnis_monatlich: number; tools: string[]; erledigt_am: string };

/* Farbpalette fuer Personen. Wer keine eigene Farbe hat, bekommt eine stabile
   aus dem Namen abgeleitet: gleiche Person, gleiche Farbe, ueber jeden Reload. */
const PALETTE = ["#6C5CE7", "#FF7A66", "#12B76A", "#F5A623", "#F0533D", "#1F1D2B", "#0EA5E9", "#D946EF"];
function farbeVon(p: Person): string {
  if (p.farbe) return p.farbe;
  let h = 0;
  for (let i = 0; i < p.name.length; i++) h = (h * 31 + p.name.charCodeAt(i)) >>> 0;
  return PALETTE[h % PALETTE.length];
}

function initials(name: string) {
  const t = name.trim().split(/\s+/).filter(Boolean);
  return ((t[0]?.[0] ?? "") + (t[1]?.[0] ?? "")).toUpperCase() || name.slice(0, 2).toUpperCase();
}

function fmtDate(iso: string) {
  const [y, m, d] = iso.split("-");
  return d ? `${d}.${m}.${y}` : iso;
}

/** Wie lange ist der Zugang her. Bewusst grob: Tagesgenauigkeit taeuscht Praezision vor. */
function aktivitaetText(iso: string): string {
  const tage = Math.floor((Date.now() - new Date(iso + "T12:00:00").getTime()) / 86_400_000);
  if (tage <= 0) return "heute";
  if (tage === 1) return "gestern";
  if (tage < 7) return `vor ${tage} Tagen`;
  if (tage < 14) return "vor 1 Woche";
  if (tage < 31) return `vor ${Math.floor(tage / 7)} Wochen`;
  if (tage < 62) return "vor 1 Monat";
  return `vor ${Math.floor(tage / 30)} Monaten`;
}

function Avatar({ person, size = 36 }: { person: Person; size?: number }) {
  return (
    <div
      className="grid shrink-0 place-items-center rounded-full font-semibold text-white"
      style={{ background: farbeVon(person), width: size, height: size, fontSize: size * 0.4 }}
    >
      {initials(person.name)}
    </div>
  );
}

function StatusPill({ status }: { status: PersonStatus }) {
  if (status === "aktiv")
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
        <span className="size-1.5 rounded-full bg-emerald-500" /> aktiv
      </span>
    );
  if (status === "scheidet_aus")
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
        <AlertTriangle className="size-3" /> scheidet aus
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-700">
      <X className="size-3" /> ausgeschieden
    </span>
  );
}

export function ZugaengeClient({
  personen, zugaenge, tools, protokoll,
}: {
  personen: Person[];
  zugaenge: Zugang[];
  tools: ToolRef[];
  protokoll: Offboarding[];
}) {
  const [pivot, setPivot] = useState<"person" | "tool">("person");
  const [detail, setDetail] = useState<Person | null>(null);
  const [offboarding, setOffboarding] = useState<Person | null>(null);
  const [ownerDialog, setOwnerDialog] = useState<ToolRef | null>(null);

  const toolById = useMemo(() => new Map(tools.map((t) => [t.id, t])), [tools]);
  const personById = useMemo(() => new Map(personen.map((p) => [p.id, p])), [personen]);

  const kpi = useMemo(() => {
    const mitOwner = tools.filter((t) => t.ownerPersonId).length;
    return {
      personen: personen.filter((p) => p.status !== "ausgeschieden").length,
      mitOwner,
      ohneOwner: tools.length - mitOwner,
      zugaenge: zugaenge.length,
      // In Offboarding ist auch, wer schon ausgeschieden ist und noch Zugaenge hat.
      // Genau das ist das Risiko, das dieser Screen sichtbar machen soll.
      inOff: personen.filter(
        (p) => p.status === "scheidet_aus" || (p.status === "ausgeschieden" && zugaenge.some((z) => z.person_id === p.id)),
      ).length,
    };
  }, [personen, zugaenge, tools]);

  const proPerson = useMemo(
    () =>
      personen.map((p) => {
        const meine = zugaenge.filter((z) => z.person_id === p.id);
        return {
          p,
          anzahl: meine.length,
          fuss: meine.reduce((s, z) => s + (z.platz_kosten ?? 0), 0),
          risiko: p.status === "ausgeschieden" && meine.length > 0,
        };
      }),
    [personen, zugaenge],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">Team &amp; Zugänge</h1>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            Wer nutzt was, wer ist verantwortlich, und was beim Austritt zu tun ist.
          </p>
        </div>
        <AddPersonDialog />
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard icon={<UsersRound className="size-4" />} label="Teammitglieder" value={kpi.personen} />
        <KpiCard
          icon={<ShieldAlert className="size-4" />}
          label="Tools mit / ohne Owner"
          value={
            <span>
              {kpi.mitOwner} <span className="text-base text-muted-foreground">/</span>{" "}
              <span className={kpi.ohneOwner > 0 ? "text-amber-600" : undefined}>{kpi.ohneOwner}</span>
            </span>
          }
          hint={kpi.ohneOwner > 0 ? `${kpi.ohneOwner} ohne Owner` : "alle zugewiesen"}
          accent={kpi.ohneOwner > 0 ? "amber" : undefined}
        />
        <KpiCard icon={<KeyRound className="size-4" />} label="Zugänge gesamt" value={kpi.zugaenge} />
        <KpiCard icon={<UserMinus className="size-4" />} label="In Offboarding" value={kpi.inOff} accent={kpi.inOff > 0 ? "amber" : undefined} />
      </div>

      <div className="inline-flex rounded-full border border-border bg-card p-1 text-sm">
        {(["person", "tool"] as const).map((v) => (
          <button
            key={v}
            onClick={() => setPivot(v)}
            className={cn(
              "rounded-full px-4 py-1.5 font-medium transition",
              pivot === v ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {v === "person" ? "nach Person" : "nach Tool"}
          </button>
        ))}
      </div>

      {personen.length === 0 ? (
        <div className="rounded-[20px] border border-dashed bg-card p-12 text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
            <UsersRound className="size-6" />
          </span>
          <h2 className="mt-4 font-display text-lg font-semibold">Noch keine Personen</h2>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
            Lege Personen an und ordne ihnen Tools zu. So siehst du, wer was nutzt, und hast beim Austritt eine
            Offboarding-Checkliste statt einer Zettelwirtschaft.
          </p>
          <div className="mt-5 flex justify-center">
            <AddPersonDialog />
          </div>
        </div>
      ) : pivot === "person" ? (
        <div className="grid gap-3 md:grid-cols-2">
          {proPerson.map(({ p, anzahl, fuss, risiko }) => (
            <div key={p.id} className="rounded-[20px] border border-border bg-card p-5 shadow-sm transition hover:shadow-md">
              <div className="flex items-start gap-3">
                <Avatar person={p} size={44} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="truncate font-semibold">{p.name}</div>
                    <StatusPill status={p.status} />
                    {risiko && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-700">
                        <CircleAlert className="size-3" /> Risiko: aktive Zugänge
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    {p.rolle || "ohne Rolle"}
                    {p.austritt && ` · Austritt ${fmtDate(p.austritt)}`}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-end justify-between">
                <div>
                  <div className="text-xs text-muted-foreground">Zugänge</div>
                  <div className="font-display text-2xl font-semibold tabular-nums">{anzahl}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">Kostenfußabdruck</div>
                  <div className="font-display text-2xl font-semibold tabular-nums">
                    {euro(fuss)}
                    <span className="text-sm font-normal text-muted-foreground"> / Mon.</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <Button variant="outline" size="sm" className="gap-1" onClick={() => setDetail(p)}>
                  Zugänge ansehen <ChevronRight className="size-4" />
                </Button>
                {(p.status === "scheidet_aus" || risiko) && anzahl > 0 && (
                  <WennSchreibbar>
                    <Button size="sm" className="gap-1 bg-amber-500 text-white hover:bg-amber-600" onClick={() => setOffboarding(p)}>
                      <UserMinus className="size-4" /> Offboarding starten
                    </Button>
                  </WennSchreibbar>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {tools.map((t) => {
            const nutzer = zugaenge
              .filter((z) => z.abo_id === t.id)
              .map((z) => personById.get(z.person_id))
              .filter((p): p is Person => Boolean(p));
            const owner = t.ownerPersonId ? personById.get(t.ownerPersonId) : null;
            return (
              <div key={t.id} className="rounded-[20px] border border-border bg-card p-5 shadow-sm transition hover:shadow-md">
                <div className="flex items-start gap-3">
                  <div
                    className="grid size-10 place-items-center rounded-xl font-display font-bold text-white"
                    style={{ background: t.farbe }}
                  >
                    {t.tool[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-semibold">{t.tool}</div>
                    <div className="text-xs text-muted-foreground">
                      {t.kategorie} · {euro(t.monatlich)} / Mon.
                    </div>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Owner</span>
                    {owner ? (
                      <div className="flex items-center gap-2">
                        <Avatar person={owner} size={22} />
                        <span className="text-sm font-medium">{owner.name}</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => setOwnerDialog(t)}
                        className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 hover:bg-amber-100"
                      >
                        <AlertTriangle className="size-3" /> kein Owner · zuweisen
                      </button>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Nutzer</span>
                    {nutzer.length === 0 ? (
                      <span className="text-sm text-muted-foreground">niemand zugeordnet</span>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-2">
                          {nutzer.slice(0, 5).map((n) => (
                            <div key={n.id} title={n.name} className="rounded-full ring-2 ring-card">
                              <Avatar person={n} size={24} />
                            </div>
                          ))}
                        </div>
                        <span className="text-sm font-medium tabular-nums">{nutzer.length}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <WennSchreibbar>
                    <Button variant={owner ? "ghost" : "default"} size="sm" onClick={() => setOwnerDialog(t)}>
                      {owner ? "Owner ändern" : "Owner zuweisen"}
                    </Button>
                  </WennSchreibbar>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex gap-2 rounded-xl border border-border bg-card/60 p-4 text-xs text-muted-foreground">
        <Info className="mt-0.5 size-4 shrink-0 text-primary" />
        <span>
          Zuordnungen kommen aus verbundenen Integrationen oder aus deiner Pflege. Wo keine Aktivitätsdaten vorliegen,
          steht &bdquo;Nutzungsdaten nötig&ldquo;, statt dass wir raten. Das Entziehen selbst passiert beim jeweiligen
          Anbieter, Toolfolio liefert dir die vollständige Checkliste und hält fest, was erledigt wurde.
        </span>
      </div>

      {protokoll.length > 0 && (
        <div className="rounded-[20px] border border-border bg-card p-5">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <History className="size-4 text-muted-foreground" /> Abgeschlossene Offboardings
          </div>
          <div className="mt-3 space-y-2">
            {protokoll.map((o) => (
              <div key={o.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border px-3 py-2 text-sm">
                <div>
                  <span className="font-medium">{o.person_name}</span>
                  <span className="text-muted-foreground">
                    {" "}
                    · {o.zugaenge_entzogen} {o.zugaenge_entzogen === 1 ? "Zugang" : "Zugänge"} entzogen
                    {o.tools.length > 0 && ` (${o.tools.join(", ")})`}
                  </span>
                </div>
                <div className="text-right text-xs text-muted-foreground">
                  {o.plaetze_zurueck > 0 && (
                    <span className="font-medium text-emerald-600 tabular-nums">
                      {euro(o.ersparnis_monatlich)} / Mon. gespart ·{" "}
                    </span>
                  )}
                  {new Date(o.erledigt_am).toLocaleDateString("de-DE")}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Sheet open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
          {detail && (
            <PersonDetail
              key={detail.id}
              person={detail}
              zugaenge={zugaenge.filter((z) => z.person_id === detail.id)}
              tools={tools}
              toolById={toolById}
              personById={personById}
              onOffboard={() => {
                setDetail(null);
                setOffboarding(detail);
              }}
              onClose={() => setDetail(null)}
            />
          )}
        </SheetContent>
      </Sheet>

      <Sheet open={!!offboarding} onOpenChange={(o) => !o && setOffboarding(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
          {offboarding && (
            <OffboardingFlow
              key={offboarding.id}
              person={offboarding}
              zugaenge={zugaenge.filter((z) => z.person_id === offboarding.id)}
              toolById={toolById}
              personById={personById}
              onDone={() => setOffboarding(null)}
            />
          )}
        </SheetContent>
      </Sheet>

      {ownerDialog && (
        <OwnerDialog
          tool={ownerDialog}
          personen={personen}
          onClose={() => setOwnerDialog(null)}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ KPI */

function KpiCard({
  icon, label, value, hint, accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  hint?: string;
  accent?: "amber";
}) {
  return (
    <div className={cn("rounded-[20px] border border-border bg-card p-4 shadow-sm", accent === "amber" && "border-amber-300/50")}>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {icon} {label}
      </div>
      <div className="mt-2 font-display text-3xl font-semibold leading-none tabular-nums">{value}</div>
      {hint && <div className={cn("mt-2 text-xs", accent === "amber" ? "text-amber-700" : "text-muted-foreground")}>{hint}</div>}
    </div>
  );
}

/* --------------------------------------------------------- Person anlegen */

function AddPersonDialog() {
  const [open, setOpen] = useState(false);
  const [pending, startT] = useTransition();
  function submit(fd: FormData) {
    startT(async () => {
      const r = await addPerson({}, fd);
      if (r.error) toast.error(r.error);
      else {
        toast.success("Person angelegt");
        setOpen(false);
      }
    });
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <WennSchreibbar>
        <DialogTrigger asChild>
          <Button className="gap-2">
            <Plus className="size-4" /> Mitglied hinzufügen
          </Button>
        </DialogTrigger>
      </WennSchreibbar>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Mitglied hinzufügen</DialogTitle>
          <DialogDescription>Teammitglied oder externe Person, die Tools nutzt.</DialogDescription>
        </DialogHeader>
        <form action={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" required placeholder="Max Mustermann" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="rolle">Rolle (optional)</Label>
              <Input id="rolle" name="rolle" placeholder="Designer" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">E-Mail (optional)</Label>
              <Input id="email" name="email" type="email" placeholder="max@agentur.de" />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={pending} className="gap-2">
              {pending && <Loader2 className="size-4 animate-spin" />} Anlegen
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ---------------------------------------------------------- Owner zuweisen */

function OwnerDialog({ tool, personen, onClose }: { tool: ToolRef; personen: Person[]; onClose: () => void }) {
  const [busy, startT] = useTransition();
  const waehlbar = personen.filter((p) => p.status !== "ausgeschieden");

  const setzen = (personId: string | null) =>
    startT(async () => {
      const r = await setOwner(tool.id, personId);
      if (r.error) toast.error(r.error);
      else {
        toast.success(personId ? `Owner für ${tool.tool} gesetzt` : `Owner von ${tool.tool} gelöst`);
        onClose();
      }
    });

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Owner für {tool.tool} zuweisen</DialogTitle>
          <DialogDescription>Der Owner ist verantwortlich für Verlängerungen, Nutzer und Kosten.</DialogDescription>
        </DialogHeader>

        {waehlbar.length === 0 ? (
          <p className="text-sm text-muted-foreground">Lege zuerst eine Person an.</p>
        ) : (
          <div className="max-h-72 space-y-1 overflow-y-auto">
            {waehlbar.map((p) => (
              <button
                key={p.id}
                disabled={busy}
                onClick={() => setzen(p.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg p-2 text-left transition hover:bg-accent",
                  tool.ownerPersonId === p.id && "bg-accent",
                )}
              >
                <Avatar person={p} size={32} />
                <div className="flex-1">
                  <div className="text-sm font-medium">{p.name}</div>
                  <div className="text-xs text-muted-foreground">{p.rolle || "ohne Rolle"}</div>
                </div>
                {tool.ownerPersonId === p.id && <Check className="size-4 text-primary" />}
              </button>
            ))}
          </div>
        )}

        {tool.ownerPersonId && (
          <DialogFooter>
            <Button variant="ghost" size="sm" disabled={busy} onClick={() => setzen(null)} className="text-muted-foreground">
              Owner entfernen
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

/* --------------------------------------------------------- Personen-Detail */

function PersonDetail({
  person, zugaenge, tools, toolById, personById, onOffboard, onClose,
}: {
  person: Person;
  zugaenge: Zugang[];
  tools: ToolRef[];
  toolById: Map<string, ToolRef>;
  personById: Map<string, Person>;
  onOffboard: () => void;
  onClose: () => void;
}) {
  const [busy, startT] = useTransition();
  const [addAbo, setAddAbo] = useState("");
  const [addKosten, setAddKosten] = useState("");

  const summe = zugaenge.reduce((s, z) => s + (z.platz_kosten ?? 0), 0);
  const zugewiesen = new Set(zugaenge.map((z) => z.abo_id));
  const verfuegbar = tools.filter((t) => !zugewiesen.has(t.id));
  const heute = new Date().toISOString().slice(0, 10);

  const run = (p: Promise<{ error?: string }>, ok?: string) =>
    startT(async () => {
      const r = await p;
      if (r.error) toast.error(r.error);
      else if (ok) toast.success(ok);
    });

  function hinzufuegen() {
    if (!addAbo) return;
    const roh = addKosten.trim();
    const k = roh ? Number(roh.replace(",", ".")) : (toolById.get(addAbo)?.monatlich ?? null);
    run(assignTool(person.id, addAbo, k != null && Number.isFinite(k) && k >= 0 ? k : null), "Tool zugeordnet");
    setAddAbo("");
    setAddKosten("");
  }

  return (
    <>
      <SheetHeader>
        <div className="flex items-center gap-3">
          <Avatar person={person} size={48} />
          <div>
            <SheetTitle className="font-display">{person.name}</SheetTitle>
            <SheetDescription className="flex flex-wrap items-center gap-1.5">
              {person.rolle || "ohne Rolle"}
              {person.email && ` · ${person.email}`} <StatusPill status={person.status} />
            </SheetDescription>
          </div>
        </div>
      </SheetHeader>

      <div className="space-y-5 px-4 pb-6">
        <div className="rounded-xl bg-muted/40 p-3 text-sm">
          <span className="font-semibold tabular-nums">{zugaenge.length}</span>{" "}
          {zugaenge.length === 1 ? "Zugang" : "Zugänge"} · Kosten:{" "}
          <span className="font-semibold tabular-nums">{euro(summe)}</span> / Monat
        </div>

        <WennSchreibbar>
          <div className="flex items-center gap-1 rounded-full bg-muted p-0.5 text-xs font-medium">
            {(
              [
                ["aktiv", "Aktiv"],
                ["scheidet_aus", "Scheidet aus"],
                ["ausgeschieden", "Ausgeschieden"],
              ] as [PersonStatus, string][]
            ).map(([s, label]) => (
              <button
                key={s}
                disabled={busy}
                onClick={() => run(setPersonStatus(person.id, s, s === "aktiv" ? null : (person.austritt ?? heute)), "Status aktualisiert")}
                className={cn(
                  "flex-1 rounded-full px-3 py-1.5 transition",
                  person.status === s ? "bg-card text-foreground shadow" : "text-muted-foreground",
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </WennSchreibbar>

        <div className="space-y-2">
          {zugaenge.length === 0 && (
            <p className="text-sm text-muted-foreground">Noch keine Tools zugeordnet.</p>
          )}
          {zugaenge.map((z) => {
            const t = toolById.get(z.abo_id);
            const owner = t?.ownerPersonId ? personById.get(t.ownerPersonId) : null;
            const risiko = person.status === "ausgeschieden";
            return (
              <div key={z.id} className="flex items-center gap-3 rounded-xl border border-border p-3">
                <div
                  className="grid size-9 shrink-0 place-items-center rounded-lg font-semibold text-white"
                  style={{ background: t?.farbe ?? "#6C5CE7" }}
                >
                  {t?.tool[0] ?? "?"}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{t?.tool ?? "Tool"}</div>
                  <div className="text-xs text-muted-foreground">
                    {z.letzte_aktivitaet ? (
                      <>letzte Aktivität: {aktivitaetText(z.letzte_aktivitaet)}</>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-amber-700">
                        <Info className="size-3" /> Nutzungsdaten nötig
                      </span>
                    )}
                    {owner && <> · Owner: {owner.name}</>}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold tabular-nums">
                    {z.platz_kosten != null ? euro(z.platz_kosten) : "—"}
                  </div>
                  {risiko && <div className="text-[10px] font-medium text-rose-600">Risiko</div>}
                </div>
                <WennSchreibbar>
                  <div className="flex shrink-0 gap-0.5">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 text-muted-foreground"
                      title="Heute als letzte Aktivität setzen"
                      disabled={busy}
                      onClick={() => run(setAktivitaet(z.id, heute), "Aktivität aktualisiert")}
                    >
                      <Check className="size-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 text-muted-foreground hover:text-destructive"
                      title="Zugang entfernen"
                      disabled={busy}
                      onClick={() => run(unassignTool(z.id), "Zugang entfernt")}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </WennSchreibbar>
              </div>
            );
          })}
        </div>

        <WennSchreibbar>
          {verfuegbar.length > 0 && (
            <div className="flex items-end gap-2 border-t pt-4">
              <div className="flex-1 space-y-1">
                <Label className="text-xs">Tool zuordnen</Label>
                <Select value={addAbo} onValueChange={setAddAbo}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Tool wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {verfuegbar.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.tool}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-28 space-y-1">
                <Label className="text-xs">Platz-Kosten</Label>
                <Input
                  className="h-9"
                  inputMode="decimal"
                  value={addKosten}
                  onChange={(e) => setAddKosten(e.target.value)}
                  placeholder={addAbo ? String(toolById.get(addAbo)?.monatlich ?? "").replace(".", ",") : "0,00"}
                />
              </div>
              <Button className="h-9" disabled={!addAbo || busy} onClick={hinzufuegen}>
                Hinzufügen
              </Button>
            </div>
          )}
        </WennSchreibbar>

        {(person.status === "scheidet_aus" || person.status === "ausgeschieden") && zugaenge.length > 0 && (
          <WennSchreibbar>
            <Button className="w-full gap-2 bg-amber-500 text-white hover:bg-amber-600" onClick={onOffboard}>
              <UserMinus className="size-4" /> Offboarding starten
            </Button>
          </WennSchreibbar>
        )}

        {person.status === "aktiv" && (
          <div className="flex gap-2">
            {person.email ? (
              <a href={`mailto:${person.email}`} className="flex-1">
                <Button variant="outline" className="w-full gap-2">
                  <Mail className="size-4" /> Nachricht
                </Button>
              </a>
            ) : (
              <Button variant="outline" className="flex-1 gap-2" disabled title="Keine E-Mail hinterlegt">
                <Mail className="size-4" /> Nachricht
              </Button>
            )}
            <Link href="/app/seats" className="flex-1">
              <Button variant="outline" className="w-full gap-2">
                <Armchair className="size-4" /> Seats
              </Button>
            </Link>
          </div>
        )}

        <WennSchreibbar>
          <div className="border-t pt-4">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-destructive hover:text-destructive"
              disabled={busy}
              onClick={() =>
                run(
                  removePerson(person.id).then((r) => {
                    if (!r.error) onClose();
                    return r;
                  }),
                  "Person entfernt",
                )
              }
            >
              <Trash2 className="size-4" /> Person löschen
            </Button>
          </div>
        </WennSchreibbar>
      </div>
    </>
  );
}

/* ------------------------------------------------------------- Offboarding */

function OffboardingFlow({
  person, zugaenge, toolById, personById, onDone,
}: {
  person: Person;
  zugaenge: Zugang[];
  toolById: Map<string, ToolRef>;
  personById: Map<string, Person>;
  onDone: () => void;
}) {
  const [entzogen, setEntzogen] = useState<Set<string>>(new Set());
  const [zurueck, setZurueck] = useState<Set<string>>(new Set());
  const [busy, startT] = useTransition();

  const toggle = (set: Set<string>, id: string, fn: (s: Set<string>) => void) => {
    const n = new Set(set);
    if (n.has(id)) n.delete(id);
    else n.add(id);
    fn(n);
  };

  const plaetze = zugaenge.filter((z) => zurueck.has(z.id));
  const ersparnis = plaetze.reduce((s, z) => s + (z.platz_kosten ?? 0), 0);

  function abschliessen() {
    startT(async () => {
      const r = await offboardingAbschliessen(person.id, [...entzogen], [...zurueck]);
      if (r.error) {
        toast.error(r.error);
        return;
      }
      toast.success(
        `Offboarding ${person.name} abgeschlossen · ${plaetze.length} ${plaetze.length === 1 ? "Platz" : "Plätze"} frei · ${euro(ersparnis)} / Monat gespart`,
      );
      onDone();
    });
  }

  return (
    <>
      <SheetHeader>
        <SheetTitle className="flex items-center gap-2 font-display">
          <UserMinus className="size-5 text-amber-500" />
          Offboarding · {person.name}
        </SheetTitle>
        <SheetDescription>
          {person.austritt ? `Austritt am ${fmtDate(person.austritt)}. ` : ""}
          Hake jeden Zugang ab und gib ungenutzte Plätze zurück.
        </SheetDescription>
      </SheetHeader>

      <div className="space-y-4 px-4 pb-6">
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
          Das tatsächliche Entziehen passiert beim jeweiligen Anbieter. Toolfolio liefert dir die vollständige Liste,
          damit nichts vergessen wird, und hält fest, was du erledigt hast.
        </div>

        <div className="space-y-2">
          {zugaenge.map((z) => {
            const t = toolById.get(z.abo_id);
            const owner = t?.ownerPersonId ? personById.get(t.ownerPersonId) : null;
            const istEntzogen = entzogen.has(z.id);
            const istZurueck = zurueck.has(z.id);
            return (
              <div
                key={z.id}
                className={cn(
                  "rounded-xl border p-3 transition",
                  istEntzogen ? "border-emerald-200 bg-emerald-50/40" : "border-border",
                )}
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggle(entzogen, z.id, setEntzogen)}
                    aria-label={`Zugang zu ${t?.tool ?? "Tool"} entzogen`}
                    aria-pressed={istEntzogen}
                    className={cn(
                      "grid size-6 shrink-0 place-items-center rounded-md border transition",
                      istEntzogen ? "border-emerald-500 bg-emerald-500 text-white" : "border-border bg-card",
                    )}
                  >
                    {istEntzogen && <Check className="size-4" />}
                  </button>
                  <div
                    className="grid size-9 shrink-0 place-items-center rounded-lg font-semibold text-white"
                    style={{ background: t?.farbe ?? "#6C5CE7" }}
                  >
                    {t?.tool[0] ?? "?"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium">{t?.tool ?? "Tool"}</div>
                    <div className="text-xs text-muted-foreground">
                      Platz: {z.platz_kosten != null ? `${euro(z.platz_kosten)} / Mon.` : "Kosten nicht hinterlegt"}
                      {owner && <> · Owner: {owner.name}</>}
                    </div>
                  </div>
                </div>
                <label className="ml-9 mt-2 flex cursor-pointer select-none items-center gap-2 text-xs text-muted-foreground">
                  <input
                    type="checkbox"
                    className="accent-primary"
                    checked={istZurueck}
                    onChange={() => toggle(zurueck, z.id, setZurueck)}
                  />
                  Platz zurückgeben (spart {z.platz_kosten != null ? `${euro(z.platz_kosten)} / Mon.` : "unbekannt viel"})
                </label>
              </div>
            );
          })}
        </div>

        <div className="rounded-2xl bg-foreground p-4 text-background">
          <div className="text-xs opacity-70">Bilanz</div>
          <div className="mt-1 font-display text-xl font-semibold leading-snug">
            {entzogen.size} von {zugaenge.length} {zugaenge.length === 1 ? "Zugang" : "Zugängen"} markiert ·{" "}
            {plaetze.length} {plaetze.length === 1 ? "Platz wird" : "Plätze werden"} frei ·{" "}
            <span className="text-emerald-300">{euro(ersparnis)} / Monat</span> gespart
          </div>
        </div>

        <div className="flex gap-2">
          <Button className="flex-1 gap-2" disabled={entzogen.size === 0 || busy} onClick={abschliessen}>
            {busy ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />} Offboarding abschließen
          </Button>
          <Link href="/app/seats">
            <Button variant="outline" className="gap-2">
              <Armchair className="size-4" /> Seats
            </Button>
          </Link>
        </div>

        {entzogen.size > 0 && entzogen.size < zugaenge.length && (
          <p className="text-xs text-muted-foreground">
            {zugaenge.length - entzogen.size} {zugaenge.length - entzogen.size === 1 ? "Zugang bleibt" : "Zugänge bleiben"}{" "}
            bestehen. Sie erscheinen weiter als Risiko, bis du sie abhakst.
          </p>
        )}
      </div>
    </>
  );
}
