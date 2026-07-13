"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Armchair,
  ArrowRight,
  AlertTriangle,
  Sparkles,
  Users,
  CircleDot,
  Info,
  Settings2,
  Eye,
  Undo2,
  PiggyBank,
  Plug,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { useReadOnly } from "@/components/app/read-only-context";
import { cn } from "@/lib/utils";
import { formatEur as euro } from "@/lib/constants";
import { setLizenzen } from "@/app/app/seats/actions";
import { unassignTool } from "@/app/app/zugaenge/actions";

export type SeatNutzer = {
  /** ID der Zuordnung (tool_zugang), nicht der Person. */
  zugangId: string;
  name: string;
  rolle: string | null;
  email: string | null;
  /** Person scheidet aus oder ist ausgeschieden. */
  inaktiv: boolean;
};

export type ToolSeat = {
  id: string;
  tool: string;
  initialen: string;
  farbe: string;
  kategorie: string;
  monatlich: number;
  /** Gebuchte Plaetze laut Vertrag. null = nicht hinterlegt. */
  gebucht: number | null;
  zugewiesen: number;
  preisProPlatz: number;
  ungenutzt: number | null;
  verschwendungMonat: number;
  nutzer: SeatNutzer[];
};

function Pill({
  tone = "muted",
  children,
}: {
  tone?: "amber" | "emerald" | "muted" | "violet";
  children: React.ReactNode;
}) {
  const cls = {
    amber: "bg-warning/15 text-warning border-warning/40",
    emerald: "bg-success/10 text-success border-success/40",
    muted: "bg-muted text-muted-foreground border-border",
    violet: "bg-primary/10 text-primary border-primary/30",
  }[tone];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${cls}`}>
      {children}
    </span>
  );
}

/* ------------------------------ Hauptansicht ------------------------------ */

export function SeatsClient({ tools }: { tools: ToolSeat[] }) {
  const readOnly = useReadOnly();
  const router = useRouter();
  const [drill, setDrill] = useState<ToolSeat | null>(null);
  const [pending, start] = useTransition();

  const kpi = useMemo(() => {
    let gebucht = 0;
    let genutzt = 0;
    let ungenutzt = 0;
    let verschwendung = 0;
    for (const t of tools) {
      genutzt += t.zugewiesen;
      if (t.gebucht != null) {
        gebucht += t.gebucht;
        ungenutzt += t.ungenutzt ?? 0;
        verschwendung += t.verschwendungMonat;
      }
    }
    return {
      gebucht,
      genutzt,
      ungenutzt,
      monat: Math.round(verschwendung * 100) / 100,
      jahr: Math.round(verschwendung * 12 * 100) / 100,
    };
  }, [tools]);

  /** Plaetze zurueckgeben: die gebuchte Anzahl sinkt, nie unter die zugewiesenen. */
  function zurueckgeben(t: ToolSeat, anzahl: number) {
    if (t.gebucht == null || anzahl <= 0) return;
    const neu = Math.max(t.zugewiesen, t.gebucht - anzahl);
    start(async () => {
      const res = await setLizenzen(t.id, neu);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success(
        `${anzahl} ${anzahl === 1 ? "Platz" : "Plätze"} zurückgegeben. Das spart ${euro(anzahl * t.preisProPlatz)} pro Monat.`,
      );
      setDrill(null);
      router.refresh();
    });
  }

  /** Zuweisung entziehen und den frei gewordenen Platz gleich mit zurueckgeben. */
  function entziehen(t: ToolSeat, zugangIds: string[]) {
    if (zugangIds.length === 0) return;
    start(async () => {
      for (const id of zugangIds) {
        const res = await unassignTool(id);
        if (res.error) {
          toast.error(res.error);
          return;
        }
      }
      if (t.gebucht != null) {
        await setLizenzen(t.id, Math.max(0, t.gebucht - zugangIds.length));
      }
      toast.success(
        `${zugangIds.length} ${zugangIds.length === 1 ? "Platz" : "Plätze"} entzogen und zurückgegeben. Das spart ${euro(zugangIds.length * t.preisProPlatz)} pro Monat.`,
      );
      setDrill(null);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">Seats und Lizenzen</h1>
        <p className="max-w-2xl text-muted-foreground">
          Bezahlte Plätze gegen genutzte. Hol dir ungenutzte zurück, das ist meistens der größte Sparhebel.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi icon={Armchair} label="Plätze gebucht" wert={String(kpi.gebucht)} hint="über alle Platz-Tools" />
        <Kpi icon={Users} label="Zugewiesen" wert={String(kpi.genutzt)} hint="einer Person zugeordnet" tone="emerald" />
        <Kpi
          icon={AlertTriangle}
          label="Ungenutzt"
          wert={String(kpi.ungenutzt)}
          hint="niemandem zugewiesen"
          tone={kpi.ungenutzt > 0 ? "amber" : undefined}
        />
        <Kpi
          icon={PiggyBank}
          label="Verschwendete Kosten"
          wert={`${euro(kpi.monat)} / Monat`}
          hint={`${euro(kpi.jahr)} pro Jahr`}
          tone={kpi.monat > 0 ? "amber" : undefined}
        />
      </div>

      {tools.length === 0 ? (
        <div className="rounded-[20px] border border-dashed bg-card p-12 text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
            <Armchair className="size-6" />
          </span>
          <h2 className="mt-4 font-display text-lg font-semibold">Keine laufenden Abos</h2>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
            Leg Abos an und ordne unter Team und Zugänge Personen zu. Dann siehst du hier gebuchte gegen genutzte
            Plätze.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {tools.map((t) => (
            <ToolKarte
              key={t.id}
              tool={t}
              readOnly={readOnly}
              pending={pending}
              onOpen={() => setDrill(t)}
              onZurueckgeben={(n) => zurueckgeben(t, n)}
            />
          ))}
        </div>
      )}

      {kpi.ungenutzt > 0 && (
        <div className="flex flex-wrap items-center gap-4 rounded-3xl border bg-card p-5 shadow-sm">
          <div className="grid size-12 place-items-center rounded-2xl bg-warning/15 text-warning">
            <AlertTriangle className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-display text-lg font-semibold">
              {kpi.ungenutzt} ungenutzte {kpi.ungenutzt === 1 ? "Platz" : "Plätze"} erkannt
            </div>
            <div className="text-sm text-muted-foreground">
              Das sind {euro(kpi.jahr)} pro Jahr. In den Sparvorschlägen planst du das Zurückgeben in einem Rutsch.
            </div>
          </div>
          <Button asChild className="gap-1.5 rounded-full">
            <Link href="/app/sparen">
              <Sparkles className="size-4" /> Zu den Sparvorschlägen <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      )}

      <Sheet open={!!drill} onOpenChange={(o) => !o && setDrill(null)}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-2xl">
          {drill && (
            <Drilldown
              tool={drill}
              readOnly={readOnly}
              pending={pending}
              onZurueckgeben={(n) => zurueckgeben(drill, n)}
              onEntziehen={(ids) => entziehen(drill, ids)}
            />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function Kpi({
  icon: Icon,
  label,
  wert,
  hint,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  wert: string;
  hint?: string;
  tone?: "amber" | "emerald";
}) {
  const cls = tone === "amber" ? "text-warning" : tone === "emerald" ? "text-success" : "text-foreground";
  return (
    <div className="rounded-3xl border bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className="size-3.5" /> {label}
      </div>
      <div className={cn("mt-1 font-display text-2xl font-semibold tabular-nums", cls)}>{wert}</div>
      {hint && <div className="mt-0.5 text-[11px] text-muted-foreground">{hint}</div>}
    </div>
  );
}

/* ------------------------------- Tool-Karte ------------------------------- */

function ToolKarte({
  tool,
  readOnly,
  pending,
  onOpen,
  onZurueckgeben,
}: {
  tool: ToolSeat;
  readOnly: boolean;
  pending: boolean;
  onOpen: () => void;
  onZurueckgeben: (n: number) => void;
}) {
  const router = useRouter();
  const [edit, setEdit] = useState(false);
  const [wert, setWert] = useState(tool.gebucht != null ? String(tool.gebucht) : "");
  const [busy, start] = useTransition();

  function speichern() {
    const n = wert.trim() === "" ? null : Math.round(Number(wert));
    start(async () => {
      const res = await setLizenzen(tool.id, n);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success("Plätze gespeichert.");
      setEdit(false);
      router.refresh();
    });
  }

  // Ohne hinterlegte Platzzahl gibt es nichts zu vergleichen. Dann fragen wir danach.
  if (tool.gebucht == null || edit) {
    return (
      <div className="rounded-3xl border bg-card p-5 shadow-sm">
        <div className="flex flex-wrap items-start gap-4">
          <div
            className="grid size-12 place-items-center rounded-2xl font-display font-bold text-white"
            style={{ background: tool.farbe }}
          >
            {tool.initialen}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <div className="font-display text-lg font-semibold">{tool.tool}</div>
              <Pill>{tool.kategorie}</Pill>
              {tool.gebucht == null && (
                <Pill tone="muted">
                  <Info className="size-3" /> Platzzahl fehlt
                </Pill>
              )}
            </div>
            <div className="mt-0.5 text-xs tabular-nums text-muted-foreground">
              {tool.zugewiesen} zugewiesen · {euro(tool.monatlich)} pro Monat
            </div>
          </div>
        </div>
        {readOnly ? (
          <p className="mt-4 text-sm text-muted-foreground">
            Für dieses Tool ist keine Platzzahl hinterlegt. Eintragen können sie nur Owner und Admins.
          </p>
        ) : (
          <div className="mt-4 flex flex-wrap items-end gap-2">
            <div className="flex-1">
              <label htmlFor={`seats-${tool.id}`} className="text-xs text-muted-foreground">
                Wie viele Plätze hast du gebucht?
              </label>
              <Input
                id={`seats-${tool.id}`}
                className="mt-1 h-9 max-w-40 tabular-nums"
                inputMode="numeric"
                value={wert}
                onChange={(e) => setWert(e.target.value)}
                placeholder="z. B. 10"
                onKeyDown={(e) => {
                  if (e.key === "Enter") speichern();
                }}
              />
            </div>
            <Button className="h-9 gap-1" disabled={busy} onClick={speichern}>
              {busy && <Loader2 className="size-4 animate-spin" />} Speichern
            </Button>
            {tool.gebucht != null && (
              <Button variant="ghost" className="h-9" onClick={() => setEdit(false)}>
                Abbrechen
              </Button>
            )}
          </div>
        )}
      </div>
    );
  }

  const gebucht = tool.gebucht;
  const nichtZugewiesen = Math.max(0, gebucht - tool.zugewiesen);
  const inaktivZugewiesen = tool.nutzer.filter((n) => n.inaktiv).length;
  const voll = nichtZugewiesen === 0;
  const zugewPct = gebucht > 0 ? Math.min(100, (tool.zugewiesen / gebucht) * 100) : 0;

  return (
    <div className="rounded-3xl border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex flex-wrap items-start gap-4">
        <div
          className="grid size-12 place-items-center rounded-2xl font-display font-bold text-white"
          style={{ background: tool.farbe }}
        >
          {tool.initialen}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <div className="font-display text-lg font-semibold">{tool.tool}</div>
            <Pill>{tool.kategorie}</Pill>
            {voll ? (
              <Pill tone="emerald">voll genutzt</Pill>
            ) : (
              <Pill tone="amber">
                <AlertTriangle className="size-3" /> {nichtZugewiesen} nicht zugewiesen
              </Pill>
            )}
            <Pill tone="muted">
              <Info className="size-3" /> Nutzungsdaten nötig
            </Pill>
          </div>
          <div className="mt-0.5 text-xs tabular-nums text-muted-foreground">
            {gebucht} gebucht · {tool.zugewiesen} zugewiesen · {euro(tool.preisProPlatz)} pro Platz
          </div>
        </div>
        <div className="text-right">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Verschwendet</div>
          <div
            className={cn(
              "font-display text-xl font-bold tabular-nums",
              tool.verschwendungMonat > 0 ? "text-warning" : "text-success",
            )}
          >
            {euro(tool.verschwendungMonat)}
          </div>
          <div className="text-[11px] text-muted-foreground">pro Monat</div>
        </div>
      </div>

      <div className="mt-4">
        <div className="relative h-3 w-full overflow-hidden rounded-full bg-warning/15">
          <div className="absolute inset-y-0 left-0 bg-primary" style={{ width: `${zugewPct}%` }} />
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-4 text-[11px] text-muted-foreground">
          <Legende farbe="#6C5CE7" label={`${tool.zugewiesen} zugewiesen`} />
          <Legende farbe="rgba(245,166,35,0.15)" rand label={`${nichtZugewiesen} ungenutzt`} />
        </div>
      </div>

      {(nichtZugewiesen > 0 || inaktivZugewiesen > 0) && (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {nichtZugewiesen > 0 && (
            <div className="rounded-2xl border border-warning/40 bg-warning/10 p-3">
              <div className="flex items-center gap-2">
                <CircleDot className="size-4 text-warning" />
                <div className="text-sm font-semibold">{nichtZugewiesen} gebucht, niemandem zugewiesen</div>
              </div>
              <div className="mt-0.5 text-xs text-muted-foreground">
                Reine Verschwendung. Lässt sich sofort zurückgeben.
              </div>
              {!readOnly && (
                <Button
                  size="sm"
                  className="mt-2 gap-1.5"
                  onClick={() => onZurueckgeben(nichtZugewiesen)}
                  disabled={pending}
                >
                  <Undo2 className="size-4" /> {nichtZugewiesen} {nichtZugewiesen === 1 ? "Platz" : "Plätze"}{" "}
                  zurückgeben
                </Button>
              )}
            </div>
          )}
          {inaktivZugewiesen > 0 && (
            <div className="rounded-2xl border bg-background/60 p-3">
              <div className="flex items-center gap-2">
                <Users className="size-4 text-muted-foreground" />
                <div className="text-sm font-semibold">{inaktivZugewiesen} an ausscheidende Personen vergeben</div>
              </div>
              <div className="mt-0.5 text-xs text-muted-foreground">
                Prüf die Personen, bevor du den Platz entziehst.
              </div>
              <Button size="sm" variant="outline" className="mt-2 gap-1.5" onClick={onOpen}>
                <Eye className="size-4" /> Personen ansehen
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Wir haben keine Aktivitaetsdaten. Das sagen wir, statt etwas zu erfinden. */}
      <div className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl border border-dashed bg-muted/30 p-3">
        <Plug className="size-4 text-primary" />
        <div className="min-w-48 flex-1 text-sm text-muted-foreground">
          Ob ein zugewiesener Platz wirklich genutzt wird, weiß nur der Anbieter. Verbinde {tool.tool} per Integration,
          bis dahin vergleichen wir gebucht gegen zugewiesen.
        </div>
        <Button asChild size="sm" variant="outline">
          <Link href="/app/einstellungen/integrationen">Integration verbinden</Link>
        </Button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button size="sm" variant="outline" className="gap-1.5" onClick={onOpen}>
          <Eye className="size-4" /> Plätze ansehen
        </Button>
        {!readOnly && (
          <Button size="sm" variant="ghost" className="gap-1.5" onClick={() => setEdit(true)}>
            <Settings2 className="size-4" /> Platzzahl anpassen
          </Button>
        )}
      </div>
    </div>
  );
}

function Legende({ farbe, label, rand }: { farbe: string; label: string; rand?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="inline-block size-2.5 rounded-sm"
        style={{ background: farbe, border: rand ? "1px solid var(--warning)" : undefined }}
      />
      {label}
    </span>
  );
}

/* -------------------------------- Drilldown ------------------------------- */

function Drilldown({
  tool,
  readOnly,
  pending,
  onZurueckgeben,
  onEntziehen,
}: {
  tool: ToolSeat;
  readOnly: boolean;
  pending: boolean;
  onZurueckgeben: (n: number) => void;
  onEntziehen: (zugangIds: string[]) => void;
}) {
  const [markiert, setMarkiert] = useState<Record<string, boolean>>({});
  const nichtZugewiesen = tool.gebucht != null ? Math.max(0, tool.gebucht - tool.zugewiesen) : 0;
  const markierteIds = Object.entries(markiert)
    .filter(([, v]) => v)
    .map(([k]) => k);
  const ersparnis = markierteIds.length * tool.preisProPlatz;

  return (
    <>
      <SheetHeader>
        <SheetTitle className="flex items-center gap-2 font-display text-2xl">
          <span
            className="grid size-9 place-items-center rounded-xl text-sm font-bold text-white"
            style={{ background: tool.farbe }}
          >
            {tool.initialen}
          </span>
          {tool.tool}
        </SheetTitle>
        <SheetDescription>
          {tool.gebucht ?? "?"} gebucht · {tool.zugewiesen} zugewiesen · {euro(tool.preisProPlatz)} pro Platz
        </SheetDescription>
      </SheetHeader>

      <div className="space-y-5 px-4 pb-6">
        {nichtZugewiesen > 0 && (
          <div className="rounded-2xl border border-warning/40 bg-warning/10 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="font-semibold text-warning">
                  {nichtZugewiesen} nicht zugewiesene {nichtZugewiesen === 1 ? "Platz" : "Plätze"}
                </div>
                <div className="mt-0.5 text-xs text-muted-foreground">Reine Verschwendung, sofort zurückgebbar.</div>
              </div>
              {!readOnly && (
                <Button
                  size="sm"
                  className="gap-1.5"
                  onClick={() => onZurueckgeben(nichtZugewiesen)}
                  disabled={pending}
                >
                  <Undo2 className="size-4" /> alle zurückgeben
                </Button>
              )}
            </div>
          </div>
        )}

        <div>
          <div className="mb-2 text-sm font-semibold">Zugewiesene Plätze ({tool.zugewiesen})</div>
          {tool.nutzer.length === 0 ? (
            <p className="rounded-2xl border p-4 text-sm text-muted-foreground">
              Noch niemand zugeordnet. Unter Team und Zugänge weist du Personen zu.
            </p>
          ) : (
            <div className="divide-y rounded-2xl border">
              {tool.nutzer.map((n) => (
                <label
                  key={n.zugangId}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors",
                    n.inaktiv ? "bg-warning/5" : "hover:bg-muted/30",
                  )}
                >
                  <Checkbox
                    checked={!!markiert[n.zugangId]}
                    onCheckedChange={(v) => setMarkiert((m) => ({ ...m, [n.zugangId]: v === true }))}
                    disabled={readOnly}
                    aria-label={`${n.name} markieren`}
                  />
                  <span className="grid size-9 place-items-center rounded-full bg-muted text-xs font-semibold">
                    {n.name
                      .split(/\s+/)
                      .map((s) => s[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">{n.name}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {[n.rolle, n.email].filter(Boolean).join(" · ") || "ohne Rolle"}
                    </span>
                  </span>
                  {n.inaktiv && (
                    <Pill tone="amber">
                      <AlertTriangle className="size-3" /> scheidet aus
                    </Pill>
                  )}
                </label>
              ))}
            </div>
          )}
        </div>

        {!readOnly && tool.nutzer.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
            <div>
              <div className="text-xs text-muted-foreground">
                {markierteIds.length} markiert
                {nichtZugewiesen > 0 && `, ${nichtZugewiesen} nicht zugewiesen`}
              </div>
              <div className="font-display text-lg font-bold tabular-nums text-success">
                spart {euro(ersparnis)} pro Monat
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/app/zugaenge"
                className="inline-flex items-center gap-1 px-2 text-sm font-medium text-primary hover:underline"
              >
                Wer nutzt was <ArrowRight className="size-3" />
              </Link>
              <Button
                className="gap-1.5"
                disabled={markierteIds.length === 0 || pending}
                onClick={() => {
                  onEntziehen(markierteIds);
                  setMarkiert({});
                }}
              >
                {pending ? <Loader2 className="size-4 animate-spin" /> : <Undo2 className="size-4" />} Markierte
                entziehen
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
