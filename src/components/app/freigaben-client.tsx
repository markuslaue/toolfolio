"use client";

import { useMemo, useState, useTransition, useActionState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  MessageCircle,
  AlertTriangle,
  Lightbulb,
  Gauge,
  Wallet,
  Plus,
  Search,
  Send,
  Trash2,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useReadOnly } from "@/components/app/read-only-context";
import { formatEur as euro } from "@/lib/constants";
import { INTERVALLE, INTERVALL_LABEL, type Intervall } from "@/lib/abos";
import { createAntrag, entscheiden, kommentieren, deleteAntrag } from "@/app/app/freigaben/actions";

/* -------------------------------- Typen ----------------------------------- */

export type Status = "ausstehend" | "genehmigt" | "abgelehnt";
export type KontextTyp = "redundanz" | "alternative" | "benchmark" | "budget";
export type Kontext = { typ: KontextTyp; text: string };
export type Kommentar = { id: string; autor: string; text: string };

export type Antrag = {
  id: string;
  tool: string;
  farbe: string;
  kategorie: string;
  kosten: number;
  intervall: Intervall;
  /** Auf den Monat normalisiert. */
  monatlich: number;
  antragsteller: string | null;
  begruendung: string | null;
  fuer: string;
  status: Status;
  grund_ablehnung: string | null;
  datum: string;
  kontext: Kontext[];
  kommentare: Kommentar[];
  /** Der eingeloggte Nutzer hat diesen Antrag selbst gestellt. */
  eigener: boolean;
};

export type Vorschlag = { name: string; kategorie: string; farbe: string };

const INTERVALL_KURZ: Record<Intervall, string> = {
  monatlich: "Monat",
  quartalsweise: "Quartal",
  jaehrlich: "Jahr",
};

/* ------------------------------ Hauptansicht ------------------------------ */

export function FreigabenClient({
  antraege,
  kategorien,
  kunden,
  vorschlaege,
  darfEntscheiden,
}: {
  antraege: Antrag[];
  kategorien: string[];
  kunden: string[];
  /** Tools aus dem Verzeichnis, fuer die Suche im Antrag. */
  vorschlaege: Vorschlag[];
  darfEntscheiden: boolean;
}) {
  const router = useRouter();
  const readOnly = useReadOnly();
  const [tab, setTab] = useState<"offen" | "meine" | "alle">("offen");
  const [neuOpen, setNeuOpen] = useState(false);
  const [ablehnen, setAblehnen] = useState<Antrag | null>(null);
  const [rueckfrage, setRueckfrage] = useState<Antrag | null>(null);
  const [genehmigt, setGenehmigt] = useState<Antrag | null>(null);
  const [pending, start] = useTransition();

  const offen = antraege.filter((a) => a.status === "ausstehend" && !a.eigener);
  const meine = antraege.filter((a) => a.eigener);
  const liste = tab === "offen" ? offen : tab === "meine" ? meine : antraege;

  const kpi = useMemo(() => {
    const g = antraege.filter((a) => a.status === "genehmigt");
    const ab = antraege.filter((a) => a.status === "abgelehnt");
    return {
      zuGenehmigen: antraege.filter((a) => a.status === "ausstehend").length,
      genehmigt: g.length,
      genehmigtKosten: g.reduce((s, a) => s + a.monatlich, 0),
      abgelehnt: ab.length,
      vermieden: ab.reduce((s, a) => s + a.monatlich, 0),
    };
  }, [antraege]);

  function genehmigen(a: Antrag) {
    start(async () => {
      const res = await entscheiden(a.id, "genehmigt");
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success(`${a.tool} genehmigt.`);
      setGenehmigt(a);
      router.refresh();
    });
  }

  function alsAboAnlegen(a: Antrag) {
    start(async () => {
      // Der Antrag ist bereits genehmigt, dieser Aufruf legt nur noch das Abo an.
      const res = await entscheiden(a.id, "genehmigt", undefined, true);
      setGenehmigt(null);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success(`${a.tool} als Abo angelegt.`);
      router.push("/app/abos");
    });
  }

  function ablehnenBestaetigen(a: Antrag, grund: string) {
    start(async () => {
      const res = await entscheiden(a.id, "abgelehnt", grund);
      setAblehnen(null);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success(`${a.tool} abgelehnt.`);
      router.refresh();
    });
  }

  function rueckfrageSenden(a: Antrag, text: string) {
    start(async () => {
      const res = await kommentieren(a.id, text);
      setRueckfrage(null);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success("Rückfrage gespeichert. Der Antrag bleibt offen.");
      router.refresh();
    });
  }

  function entfernen(a: Antrag) {
    start(async () => {
      const res = await deleteAntrag(a.id);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success("Antrag gelöscht.");
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      {/* Kopf */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">Freigaben</h1>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            Tools beantragen und freigeben, bevor sie Geld kosten.
          </p>
        </div>
        {!readOnly && (
          <Button className="gap-2" onClick={() => setNeuOpen(true)}>
            <Plus className="size-4" /> Tool beantragen
          </Button>
        )}
      </div>

      {/* KPI */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <KpiCard
          icon={<Clock className="size-4" />}
          label="Zu genehmigen"
          value={kpi.zuGenehmigen}
          hint={kpi.zuGenehmigen > 0 ? "offene Anträge warten" : "alles erledigt"}
          accent={kpi.zuGenehmigen > 0 ? "amber" : undefined}
        />
        <KpiCard
          icon={<CheckCircle2 className="size-4" />}
          label="Genehmigt"
          value={kpi.genehmigt}
          hint={
            kpi.genehmigt > 0 ? `+ ${euro(kpi.genehmigtKosten)} / Monat an neuen Kosten` : "noch nichts genehmigt"
          }
        />
        <KpiCard
          icon={<XCircle className="size-4" />}
          label="Abgelehnt"
          value={kpi.abgelehnt}
          hint={kpi.abgelehnt > 0 ? `${euro(kpi.vermieden)} / Monat vermieden` : "noch nichts abgelehnt"}
        />
      </div>

      {/* Tabs */}
      <div className="flex w-fit flex-wrap gap-1 rounded-full border bg-card p-1 text-sm">
        {(
          [
            { id: "offen", label: "Zu genehmigen", count: offen.length },
            { id: "meine", label: "Meine Anträge", count: meine.length },
            { id: "alle", label: "Alle Anträge", count: antraege.length },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 rounded-full px-4 py-1.5 font-medium transition ${
              tab === t.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
            <span
              className={`inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-semibold tabular-nums ${
                tab === t.id ? "bg-white/20" : "bg-muted text-foreground"
              }`}
            >
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* Liste */}
      {liste.length === 0 ? (
        <div className="rounded-[20px] border border-dashed bg-card/50 p-10 text-center">
          <ShieldCheck className="mx-auto size-8 text-primary" />
          <div className="mt-3 font-display text-lg font-semibold">
            {tab === "meine" ? "Du hast noch nichts beantragt" : "Aktuell keine offenen Anträge"}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {tab === "meine"
              ? "Beantrag ein Tool, dann siehst du hier den Stand."
              : "Sobald jemand ein Tool beantragt, taucht es hier auf."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {liste.map((a) => (
            <AntragsKarte
              key={a.id}
              antrag={a}
              zeigeAktionen={a.status === "ausstehend" && !a.eigener && darfEntscheiden && !readOnly}
              zeigeLoeschen={darfEntscheiden && !readOnly}
              pending={pending}
              onGenehmigen={() => genehmigen(a)}
              onAblehnen={() => setAblehnen(a)}
              onRueckfrage={() => setRueckfrage(a)}
              onLoeschen={() => entfernen(a)}
            />
          ))}
        </div>
      )}

      {/* Neuer Antrag */}
      <Sheet open={neuOpen} onOpenChange={setNeuOpen}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
          <NeuerAntrag
            kategorien={kategorien}
            kunden={kunden}
            vorschlaege={vorschlaege}
            bestand={antraege}
            onFertig={() => {
              setNeuOpen(false);
              setTab("meine");
              router.refresh();
            }}
          />
        </SheetContent>
      </Sheet>

      <AblehnenDialog
        antrag={ablehnen}
        onClose={() => setAblehnen(null)}
        onConfirm={ablehnenBestaetigen}
        pending={pending}
      />
      <RueckfrageDialog
        antrag={rueckfrage}
        onClose={() => setRueckfrage(null)}
        onConfirm={rueckfrageSenden}
        pending={pending}
      />

      {/* Nach der Genehmigung: direkt als Abo anlegen? */}
      <Dialog open={!!genehmigt} onOpenChange={(o) => !o && setGenehmigt(null)}>
        <DialogContent>
          {genehmigt && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display">{genehmigt.tool} ist genehmigt</DialogTitle>
                <DialogDescription>Möchtest du es direkt als Abo anlegen?</DialogDescription>
              </DialogHeader>
              <div className="space-y-1 rounded-xl bg-muted/40 p-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Kosten: </span>
                  <span className="font-semibold tabular-nums">
                    {euro(genehmigt.kosten)} / {INTERVALL_KURZ[genehmigt.intervall]}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Für: </span>
                  {genehmigt.fuer}
                </div>
                <div>
                  <span className="text-muted-foreground">Kategorie: </span>
                  {genehmigt.kategorie}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" className="flex-1" onClick={() => setGenehmigt(null)}>
                  Später
                </Button>
                <Button className="flex-1" onClick={() => alsAboAnlegen(genehmigt)} disabled={pending}>
                  {pending && <Loader2 className="size-4 animate-spin" />} Als Abo anlegen
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* -------------------------------- Karte ----------------------------------- */

function AntragsKarte({
  antrag,
  zeigeAktionen,
  zeigeLoeschen,
  pending,
  onGenehmigen,
  onAblehnen,
  onRueckfrage,
  onLoeschen,
}: {
  antrag: Antrag;
  zeigeAktionen: boolean;
  zeigeLoeschen: boolean;
  pending: boolean;
  onGenehmigen: () => void;
  onAblehnen: () => void;
  onRueckfrage: () => void;
  onLoeschen: () => void;
}) {
  return (
    <div className="rounded-[20px] border bg-card p-5 shadow-sm transition hover:-translate-y-px hover:shadow-md">
      <div className="flex flex-wrap items-start gap-4">
        <div
          className="grid size-12 shrink-0 place-items-center rounded-2xl font-display text-lg font-bold text-white"
          style={{ background: antrag.farbe }}
        >
          {antrag.tool[0]?.toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <div className="font-semibold">{antrag.tool}</div>
            <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              {antrag.kategorie}
            </span>
            <StatusPill status={antrag.status} />
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            {antrag.antragsteller && (
              <>
                <Avatar name={antrag.antragsteller} />
                <span>{antrag.antragsteller}</span>
                <span>·</span>
              </>
            )}
            <span>{antrag.datum}</span>
            <span>·</span>
            <span>{antrag.fuer}</span>
          </div>
          {antrag.begruendung && <p className="mt-2 text-sm text-foreground/90">{antrag.begruendung}</p>}
        </div>
        <div className="shrink-0 text-right">
          <div className="text-xs text-muted-foreground">Erwartete Kosten</div>
          <div className="font-display text-2xl font-semibold leading-none tabular-nums">{euro(antrag.kosten)}</div>
          <div className="mt-0.5 text-xs text-muted-foreground">/ {INTERVALL_KURZ[antrag.intervall]}</div>
        </div>
      </div>

      {antrag.kontext.length > 0 && (
        <div className="mt-4 space-y-2">
          {antrag.kontext.map((k, i) => (
            <KontextZeile key={i} k={k} />
          ))}
        </div>
      )}

      {antrag.grund_ablehnung && (
        <div className="mt-3 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
          <span className="font-semibold">Ablehnungsgrund: </span>
          {antrag.grund_ablehnung}
        </div>
      )}

      {antrag.kommentare.length > 0 && (
        <div className="mt-3 space-y-2">
          {antrag.kommentare.map((c) => (
            <div key={c.id} className="rounded-xl bg-muted/40 p-3 text-xs">
              <div className="mb-0.5 font-semibold">{c.autor}</div>
              <div className="text-muted-foreground">{c.text}</div>
            </div>
          ))}
        </div>
      )}

      {(zeigeAktionen || (zeigeLoeschen && antrag.status !== "ausstehend")) && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {zeigeAktionen && (
            <>
              <Button
                className="gap-2 bg-success text-success-foreground hover:bg-success/90"
                onClick={onGenehmigen}
                disabled={pending}
              >
                <CheckCircle2 className="size-4" /> Genehmigen
              </Button>
              <Button
                variant="outline"
                className="gap-2 border-destructive/40 text-destructive hover:bg-destructive/10"
                onClick={onAblehnen}
                disabled={pending}
              >
                <XCircle className="size-4" /> Ablehnen
              </Button>
              <Button variant="ghost" className="gap-2" onClick={onRueckfrage} disabled={pending}>
                <MessageCircle className="size-4" /> Rückfrage
              </Button>
            </>
          )}
          {zeigeLoeschen && antrag.status !== "ausstehend" && (
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto gap-1.5 text-muted-foreground hover:text-destructive"
              onClick={onLoeschen}
              disabled={pending}
            >
              <Trash2 className="size-4" /> Aus der Historie entfernen
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

const KONTEXT_META: Record<
  KontextTyp,
  { icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>; color: string; label: string }
> = {
  redundanz: { icon: AlertTriangle, color: "#F5A623", label: "Redundanz" },
  alternative: { icon: Lightbulb, color: "#F5A623", label: "Günstigere Alternative" },
  benchmark: { icon: Gauge, color: "#F5A623", label: "Benchmark" },
  budget: { icon: Wallet, color: "#F0533D", label: "Budgetwirkung" },
};

function KontextZeile({ k }: { k: Kontext }) {
  const meta = KONTEXT_META[k.typ];
  const Icon = meta.icon;
  return (
    <div
      className="flex items-start gap-2 rounded-xl border p-3 text-xs"
      style={{ background: `${meta.color}10`, borderColor: `${meta.color}40` }}
    >
      <Icon className="mt-0.5 size-4 shrink-0" style={{ color: meta.color }} />
      <div>
        <div className="font-semibold" style={{ color: meta.color }}>
          {meta.label}
        </div>
        <div className="mt-0.5 text-foreground/80">{k.text}</div>
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: Status }) {
  if (status === "genehmigt")
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
        <CheckCircle2 className="size-3" /> genehmigt
      </span>
    );
  if (status === "abgelehnt")
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
        <XCircle className="size-3" /> abgelehnt
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-warning/15 px-2 py-0.5 text-xs font-medium text-warning">
      <Clock className="size-3" /> ausstehend
    </span>
  );
}

function Avatar({ name }: { name: string }) {
  const initialen = name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <span className="grid size-5 place-items-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
      {initialen}
    </span>
  );
}

function KpiCard({
  icon,
  label,
  value,
  hint,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  hint?: string;
  accent?: "amber";
}) {
  return (
    <div
      className="rounded-[20px] border bg-card p-4 shadow-sm"
      style={accent === "amber" ? { borderColor: "#F5A62355" } : undefined}
    >
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {icon} {label}
      </div>
      <div
        className="mt-2 font-display text-3xl font-semibold leading-none tabular-nums"
        style={accent === "amber" ? { color: "#B07A1A" } : undefined}
      >
        {value}
      </div>
      {hint && <div className="mt-2 text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}

/* ----------------------------- Neuer Antrag ------------------------------- */

function NeuerAntrag({
  kategorien,
  kunden,
  vorschlaege,
  bestand,
  onFertig,
}: {
  kategorien: string[];
  kunden: string[];
  vorschlaege: Vorschlag[];
  bestand: Antrag[];
  onFertig: () => void;
}) {
  const [state, formAction, pending] = useActionState(createAntrag, {} as { ok?: boolean; error?: string });
  const [suche, setSuche] = useState("");
  const [tool, setTool] = useState("");
  const [kategorie, setKategorie] = useState("");
  const [kosten, setKosten] = useState("");
  const [intervall, setIntervall] = useState<Intervall>("monatlich");
  const [fuer, setFuer] = useState("intern");
  const [gewaehlt, setGewaehlt] = useState(false);

  if (state.ok) queueMicrotask(onFertig);

  const treffer = suche.trim()
    ? vorschlaege.filter((v) => v.name.toLowerCase().includes(suche.toLowerCase())).slice(0, 6)
    : [];

  // Vorab-Hinweis fuer den Antragsteller: gibt es in der Kategorie schon etwas?
  const vorabKontext: Kontext[] = useMemo(() => {
    if (!kategorie.trim()) return [];
    const gleiche = bestand.filter((a) => a.status === "genehmigt" && a.kategorie === kategorie).length;
    return gleiche > 0
      ? [
          {
            typ: "redundanz" as const,
            text: `In der Kategorie „${kategorie}“ wurde bereits etwas genehmigt. Die Genehmiger werden auf eine mögliche Doppelung hingewiesen.`,
          },
        ]
      : [];
  }, [kategorie, bestand]);

  const kannAbsenden = tool.trim() !== "" && kategorie.trim() !== "" && Number(kosten.replace(",", ".")) > 0;

  return (
    <form action={formAction}>
      <SheetHeader>
        <SheetTitle className="font-display">Tool beantragen</SheetTitle>
        <SheetDescription>Wähl ein Tool, beschreib den Zweck und nenn die erwarteten Kosten.</SheetDescription>
      </SheetHeader>

      <div className="space-y-5 px-4 pb-6">
        {vorschlaege.length > 0 && (
          <div className="space-y-2">
            <Label htmlFor="fg-suche">Tool im Verzeichnis suchen</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="fg-suche"
                className="pl-9"
                placeholder="z. B. Linear"
                value={suche}
                onChange={(e) => {
                  setSuche(e.target.value);
                  setGewaehlt(false);
                }}
              />
            </div>
            {suche && !gewaehlt && (
              <div className="max-h-48 overflow-y-auto rounded-xl border bg-card">
                {treffer.length === 0 ? (
                  <div className="p-3 text-xs text-muted-foreground">Nichts gefunden. Trag es unten manuell ein.</div>
                ) : (
                  treffer.map((v) => (
                    <button
                      key={v.name}
                      type="button"
                      className="flex w-full items-center gap-3 p-2 text-left hover:bg-accent"
                      onClick={() => {
                        setTool(v.name);
                        setKategorie(v.kategorie);
                        setSuche(v.name);
                        setGewaehlt(true);
                      }}
                    >
                      <span
                        className="grid size-8 place-items-center rounded-lg font-semibold text-white"
                        style={{ background: v.farbe }}
                      >
                        {v.name[0]}
                      </span>
                      <span className="flex-1">
                        <span className="block text-sm font-medium">{v.name}</span>
                        <span className="block text-xs text-muted-foreground">{v.kategorie}</span>
                      </span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="fg-tool">
              Tool <span className="text-destructive">*</span>
            </Label>
            <Input
              id="fg-tool"
              name="tool"
              value={tool}
              onChange={(e) => setTool(e.target.value)}
              placeholder="Tool-Name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fg-kat">
              Kategorie <span className="text-destructive">*</span>
            </Label>
            <Input
              id="fg-kat"
              name="kategorie"
              list="fg-kategorien"
              value={kategorie}
              onChange={(e) => setKategorie(e.target.value)}
              placeholder="z. B. Design"
              required
            />
            <datalist id="fg-kategorien">
              {kategorien.map((k) => (
                <option key={k} value={k} />
              ))}
            </datalist>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="fg-zweck">Zweck und Begründung</Label>
          <Textarea
            id="fg-zweck"
            name="begruendung"
            rows={3}
            placeholder="Wofür brauchst du das Tool und welches Problem löst es?"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="fg-kosten">
              Kosten in Euro <span className="text-destructive">*</span>
            </Label>
            <Input
              id="fg-kosten"
              name="kosten"
              inputMode="decimal"
              placeholder="0,00"
              value={kosten}
              onChange={(e) => setKosten(e.target.value)}
              className="tabular-nums"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fg-intervall">Intervall</Label>
            <Select value={intervall} onValueChange={(v) => setIntervall(v as Intervall)}>
              <SelectTrigger id="fg-intervall" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {INTERVALLE.map((i) => (
                  <SelectItem key={i} value={i}>
                    {INTERVALL_LABEL[i]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input type="hidden" name="intervall" value={intervall} />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="fg-fuer">Für wen</Label>
          <Select value={fuer} onValueChange={setFuer}>
            <SelectTrigger id="fg-fuer" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="intern">intern</SelectItem>
              {kunden.map((k) => (
                <SelectItem key={k} value={k}>
                  {k}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <input type="hidden" name="fuer" value={fuer} />
        </div>

        {vorabKontext.length > 0 && (
          <div className="space-y-2">
            <Label className="text-xs">Das sieht der Genehmiger</Label>
            {vorabKontext.map((k, i) => (
              <KontextZeile key={i} k={k} />
            ))}
          </div>
        )}

        {state.error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {state.error}
          </div>
        )}

        <Button type="submit" className="w-full gap-2" disabled={!kannAbsenden || pending}>
          {pending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />} Antrag senden
        </Button>
      </div>
    </form>
  );
}

/* --------------------------- Ablehnen, Rückfrage -------------------------- */

function AblehnenDialog({
  antrag,
  onClose,
  onConfirm,
  pending,
}: {
  antrag: Antrag | null;
  onClose: () => void;
  onConfirm: (a: Antrag, grund: string) => void;
  pending: boolean;
}) {
  const [grund, setGrund] = useState("");
  return (
    <Dialog
      open={!!antrag}
      onOpenChange={(o) => {
        if (!o) {
          setGrund("");
          onClose();
        }
      }}
    >
      <DialogContent>
        {antrag && (
          <>
            <DialogHeader>
              <DialogTitle className="font-display">{antrag.tool} ablehnen</DialogTitle>
              <DialogDescription>
                Begründe deine Entscheidung kurz, damit {antrag.antragsteller ?? "der Antragsteller"} sie nachvollziehen
                kann.
              </DialogDescription>
            </DialogHeader>
            <Textarea
              rows={4}
              placeholder="Zum Beispiel: Das bestehende Tool deckt den Anwendungsfall bereits ab."
              value={grund}
              onChange={(e) => setGrund(e.target.value)}
            />
            <DialogFooter>
              <Button
                className="w-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={!grund.trim() || pending}
                onClick={() => onConfirm(antrag, grund.trim())}
              >
                {pending && <Loader2 className="size-4 animate-spin" />} Ablehnen
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function RueckfrageDialog({
  antrag,
  onClose,
  onConfirm,
  pending,
}: {
  antrag: Antrag | null;
  onClose: () => void;
  onConfirm: (a: Antrag, text: string) => void;
  pending: boolean;
}) {
  const [text, setText] = useState("");
  return (
    <Dialog
      open={!!antrag}
      onOpenChange={(o) => {
        if (!o) {
          setText("");
          onClose();
        }
      }}
    >
      <DialogContent>
        {antrag && (
          <>
            <DialogHeader>
              <DialogTitle className="font-display">Rückfrage zu {antrag.tool}</DialogTitle>
              <DialogDescription>
                Der Antrag bleibt offen. {antrag.antragsteller ?? "Der Antragsteller"} sieht deinen Kommentar am Antrag.
              </DialogDescription>
            </DialogHeader>
            <Textarea
              rows={4}
              placeholder="Zum Beispiel: Reicht der bestehende Workspace nicht aus?"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <DialogFooter>
              <Button
                className="w-full gap-2"
                disabled={!text.trim() || pending}
                onClick={() => onConfirm(antrag, text.trim())}
              >
                {pending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />} Senden
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
