"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ChevronRight,
  FileText,
  Pencil,
  MoreHorizontal,
  Archive,
  Trash2,
  Plus,
  X,
  Mail,
  User as UserIcon,
  CheckCircle2,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
import { useReadOnly } from "@/components/app/read-only-context";
import { cn } from "@/lib/utils";
import { formatEur } from "@/lib/constants";
import { monatlich, INTERVALL_LABEL, KATEGORIE_FARBEN, toolInitial, type Abo, type Intervall } from "@/lib/abos";
import { KUNDE_STATUS_LABEL, kundeInitial, type Kunde } from "@/lib/kunden";
import {
  deleteKunde,
  archiveKunde,
  updateKundeNotizen,
  setKundeWeiterverrechnung,
  setAboWeiterverrechnen,
  entferneAboVonKunde,
} from "@/app/app/kunden/actions";

export type VerlaufPunkt = { label: string; wert: number };
export type Aktivitaet = { text: string; ts: string };

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  return d ? `${d}.${m}.${y}` : iso;
}
function preis(a: Abo): string {
  const wert = formatEur(a.kosten).replace("€", "").trim();
  return a.waehrung === "USD" ? `$${wert}` : `${wert} €`;
}
function aboFarbe(a: Abo): string {
  return a.farbe ?? KATEGORIE_FARBEN[a.kategorie] ?? "#6C5CE7";
}

/* ------------------------------ Hauptansicht ------------------------------ */

export function KundeDetail({
  kunde,
  abos,
  verlauf,
  aktivitaet,
}: {
  kunde: Kunde;
  abos: Abo[];
  verlauf: VerlaufPunkt[];
  aktivitaet: Aktivitaet[];
}) {
  const router = useRouter();
  const readOnly = useReadOnly();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [pending, start] = useTransition();

  // Aufschlag und Schalter sind sofort bedienbar, der Server zieht nach.
  const [weiter, setWeiter] = useState(kunde.weiterverrechnet);
  const [aufschlag, setAufschlag] = useState<number>(kunde.aufschlag_prozent ?? 0);

  /** Gilt dieses Abo als weiterverrechnet? Das Abo entscheidet, der Kunde ist nur die Vorgabe. */
  const istVerrechnet = (a: Abo) => a.weiterverrechnen;
  /** Aufschlag des Abos, sonst der Standard des Kunden. */
  const aufschlagVon = (a: Abo) => a.aufschlag_prozent ?? aufschlag;

  const toolkostenMonat = useMemo(() => abos.reduce((s, a) => s + monatlich(a.kosten, a.intervall), 0), [abos]);

  const { verrechnetBasis, verrechnetSumme, margeMonat } = useMemo(() => {
    let basis = 0;
    let summe = 0;
    let marge = 0;
    for (const a of abos) {
      if (!istVerrechnet(a)) continue;
      const m = monatlich(a.kosten, a.intervall);
      const auf = (m * aufschlagVon(a)) / 100;
      basis += m;
      summe += m + auf;
      marge += auf;
    }
    return { verrechnetBasis: basis, verrechnetSumme: summe, margeMonat: marge };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abos, aufschlag]);

  const selbstGetragen = toolkostenMonat - verrechnetBasis;

  function speichereVerrechnung(neuWeiter: boolean, neuAufschlag: number) {
    setWeiter(neuWeiter);
    setAufschlag(neuAufschlag);
    start(async () => {
      const res = await setKundeWeiterverrechnung(kunde.id, neuWeiter, neuWeiter ? neuAufschlag : null);
      if (res.error) {
        toast.error(res.error);
        setWeiter(kunde.weiterverrechnet);
        setAufschlag(kunde.aufschlag_prozent ?? 0);
      } else {
        router.refresh();
      }
    });
  }

  function toggleTool(a: Abo) {
    start(async () => {
      const res = await setAboWeiterverrechnen(a.id, !a.weiterverrechnen);
      if (res.error) toast.error(res.error);
      else router.refresh();
    });
  }

  function entferne(a: Abo) {
    start(async () => {
      const res = await entferneAboVonKunde(a.id);
      if (res.error) toast.error(res.error);
      else {
        toast.success(`${a.tool} ist jetzt keinem Kunden mehr zugeordnet.`);
        router.refresh();
      }
    });
  }

  function archivieren() {
    start(async () => {
      const res = await archiveKunde(kunde.id);
      if (res.error) toast.error(res.error);
      else {
        toast.success(`${kunde.name} archiviert.`);
        router.refresh();
      }
    });
  }

  function loeschen() {
    setDeleteOpen(false);
    start(async () => {
      const res = await deleteKunde(kunde.id);
      if (res.error) toast.error(res.error);
      else {
        toast.success("Kunde gelöscht.");
        router.push("/app/kunden");
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* Brotkrumen */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/app/kunden" className="transition-colors hover:text-foreground">
          Kunden
        </Link>
        <ChevronRight className="size-3.5" />
        <span className="text-foreground">{kunde.name}</span>
      </nav>

      {/* Seitenkopf */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            className="grid size-16 shrink-0 place-items-center rounded-2xl font-display text-xl font-semibold text-white shadow-sm"
            style={{ background: kunde.farbe }}
          >
            {kundeInitial(kunde.name)}
          </div>
          <div>
            <h1 className="font-display text-3xl font-semibold tracking-tight">{kunde.name}</h1>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium",
                  kunde.status === "aktiv"
                    ? "border-success/20 bg-success/10 text-success"
                    : "border-border bg-muted text-muted-foreground",
                )}
              >
                {KUNDE_STATUS_LABEL[kunde.status]}
              </span>
              {kunde.ansprechpartner && (
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <UserIcon className="size-3" /> {kunde.ansprechpartner}
                </span>
              )}
              {kunde.email && (
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <Mail className="size-3" /> {kunde.email}
                </span>
              )}
            </div>
          </div>
        </div>
        {!readOnly && (
          <div className="flex items-center gap-2">
            <Button asChild className="gap-1.5">
              <Link href="/app/berichte">
                <FileText className="size-4" /> Bericht erstellen
              </Link>
            </Button>
            <Button variant="outline" className="gap-1.5" onClick={() => setEditOpen(true)}>
              <Pencil className="size-4" /> Bearbeiten
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" aria-label="Weitere Aktionen">
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={archivieren} disabled={pending || kunde.status === "archiviert"}>
                  <Archive className="mr-2 size-4" /> Archivieren
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => setDeleteOpen(true)}
                >
                  <Trash2 className="mr-2 size-4" /> Löschen
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      {/* KPI-Zeile */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Toolkosten / Monat"
          value={formatEur(toolkostenMonat)}
          hint={`${abos.length} ${abos.length === 1 ? "zugeordnetes Tool" : "zugeordnete Tools"}`}
        />
        <KpiCard
          label="Weiterverrechnet / Monat"
          value={formatEur(verrechnetSumme)}
          accent="success"
          hint={weiter ? `inklusive ${aufschlag} % Aufschlag` : "kein Aufschlag hinterlegt"}
        />
        {margeMonat > 0 ? (
          <KpiCard
            label="Marge / Monat"
            value={`+${formatEur(margeMonat)}`}
            accent="success"
            hint="Überschuss aus dem Aufschlag"
          />
        ) : (
          <KpiCard
            label="Selbst getragen / Monat"
            value={formatEur(selbstGetragen)}
            accent="warning"
            hint="diese Kosten trägst du selbst"
          />
        )}
        <KpiCard
          label="Hochrechnung Jahr"
          value={formatEur(toolkostenMonat * 12)}
          hint="linear auf zwölf Monate"
        />
      </div>

      {/* Zwei Spalten */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <ToolsCard
            kunde={kunde}
            abos={abos}
            readOnly={readOnly}
            pending={pending}
            aufschlagVon={aufschlagVon}
            kundeWeiter={weiter}
            onToggle={toggleTool}
            onRemove={entferne}
          />
          <VerlaufCard verlauf={verlauf} />
          <KostenstrukturCard abos={abos} />
        </div>

        <div className="space-y-6">
          <WeiterverrechnungCard
            weiterverrechnet={weiter}
            aufschlagProzent={aufschlag}
            toolkosten={verrechnetBasis}
            verrechnet={verrechnetSumme}
            marge={margeMonat}
            readOnly={readOnly}
            pending={pending}
            onToggle={(v) => speichereVerrechnung(v, aufschlag)}
            onAufschlag={(v) => speichereVerrechnung(weiter, v)}
          />
          <KontaktCard kunde={kunde} readOnly={readOnly} onEdit={() => setEditOpen(true)} />
          <NotizenCard kundeId={kunde.id} wert={kunde.notizen ?? ""} readOnly={readOnly} />
          <AktivitaetCard items={aktivitaet} />
        </div>
      </div>

      <KundeDialog open={editOpen} onOpenChange={setEditOpen} kunde={kunde} onSaved={() => router.refresh()} />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{kunde.name} wirklich löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              {abos.length > 0
                ? `Die ${abos.length} zugeordneten ${abos.length === 1 ? "Tool steht" : "Tools stehen"} danach ohne Kunde da. Du kannst sie jederzeit neu zuordnen.`
                : "Diese Aktion lässt sich nicht rückgängig machen."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={loeschen}
            >
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/* ---------------------------------- KPI ----------------------------------- */

function KpiCard({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: string;
  hint?: string;
  accent?: "success" | "warning";
}) {
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
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
    </div>
  );
}

/* ------------------------------- Tools-Karte ------------------------------ */

function ToolsCard({
  kunde,
  abos,
  readOnly,
  pending,
  kundeWeiter,
  aufschlagVon,
  onToggle,
  onRemove,
}: {
  kunde: Kunde;
  abos: Abo[];
  readOnly: boolean;
  pending: boolean;
  kundeWeiter: boolean;
  aufschlagVon: (a: Abo) => number;
  onToggle: (a: Abo) => void;
  onRemove: (a: Abo) => void;
}) {
  const summe = abos.reduce((s, a) => s + monatlich(a.kosten, a.intervall), 0);

  return (
    <div className="rounded-2xl border bg-card shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b p-5">
        <div>
          <h2 className="font-display text-lg font-semibold">Zugeordnete Tools</h2>
          <p className="text-xs text-muted-foreground">
            {abos.length} {abos.length === 1 ? "Tool" : "Tools"}, je Tool einzeln steuerbar
          </p>
        </div>
        {!readOnly && (
          <Button asChild variant="outline" size="sm" className="gap-1.5">
            <Link href="/app/abos">
              <Plus className="size-4" /> Tool zuordnen
            </Link>
          </Button>
        )}
      </div>

      {abos.length === 0 ? (
        <div className="p-10 text-center">
          <p className="text-sm text-muted-foreground">
            Diesem Kunden ist noch kein Tool zugeordnet. Setz im Abo das Feld Kunde auf {kunde.name}.
          </p>
          {!readOnly && (
            <Button asChild className="mt-4 gap-1.5">
              <Link href="/app/abos">
                <Plus className="size-4" /> Tool zuordnen
              </Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/30 text-left text-xs text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Tool</th>
                <th className="px-4 py-3 text-right font-medium">Kosten</th>
                <th className="px-4 py-3 font-medium">Intervall</th>
                <th className="px-4 py-3 font-medium">Zahlungskanal</th>
                <th className="px-4 py-3 font-medium">Nächste Abbuchung</th>
                <th className="px-4 py-3 font-medium">Weiterverrechnet</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {abos.map((a) => {
                // "Abweichend" heisst: das Abo folgt nicht der Vorgabe des Kunden.
                const weichtAb = a.weiterverrechnen !== kundeWeiter;
                const eigenerAufschlag = a.aufschlag_prozent != null;
                return (
                  <tr key={a.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <Link href={`/app/abos/${a.id}`} className="flex items-center gap-2.5">
                        <div
                          className="grid size-8 shrink-0 place-items-center rounded-lg text-xs font-semibold text-white"
                          style={{ background: aboFarbe(a) }}
                        >
                          {a.initial ?? toolInitial(a.tool)}
                        </div>
                        <div>
                          <div className="font-medium leading-tight">{a.tool}</div>
                          <div className="mt-0.5 inline-flex items-center rounded-full bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                            {a.kategorie}
                          </div>
                        </div>
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-right font-medium tabular-nums">{preis(a)}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {INTERVALL_LABEL[a.intervall as Intervall] ?? a.intervall}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{a.zahlungskanal ?? "—"}</td>
                    <td className="px-4 py-3 tabular-nums text-muted-foreground">{fmtDate(a.naechste_abbuchung)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={a.weiterverrechnen}
                          onCheckedChange={() => onToggle(a)}
                          disabled={readOnly || pending}
                          aria-label={`${a.tool} weiterverrechnen`}
                        />
                        {weichtAb && (
                          <span className="inline-flex items-center rounded-full bg-warning/10 px-1.5 py-0.5 text-[10px] font-medium text-warning">
                            abweichend
                          </span>
                        )}
                        {a.weiterverrechnen && eigenerAufschlag && (
                          <span className="inline-flex items-center rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                            +{aufschlagVon(a)} %
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {!readOnly && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-8 text-muted-foreground hover:text-destructive"
                          onClick={() => onRemove(a)}
                          disabled={pending}
                          aria-label={`${a.tool} aus der Kundenzuordnung entfernen`}
                        >
                          <X className="size-4" />
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-muted/30 font-medium">
                <td className="px-4 py-3">Summe</td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {formatEur(summe)} <span className="text-xs font-normal text-muted-foreground">/ Monat</span>
                </td>
                <td className="px-4 py-3" colSpan={5} />
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}

/* ------------------------------ Verlaufs-Karte ---------------------------- */

function VerlaufCard({ verlauf }: { verlauf: VerlaufPunkt[] }) {
  if (verlauf.length < 2) return null;

  const werte = verlauf.map((v) => v.wert);
  const max = Math.max(...werte) * 1.1 || 1;
  const min = Math.min(...werte) * 0.85;
  const W = 600;
  const H = 180;
  const pad = 24;
  const x = (i: number) => pad + (i * (W - pad * 2)) / Math.max(1, verlauf.length - 1);
  const y = (v: number) => H - pad - ((v - min) / Math.max(1, max - min)) * (H - pad * 2);
  const path = verlauf.map((p, i) => `${i === 0 ? "M" : "L"} ${x(i).toFixed(1)} ${y(p.wert).toFixed(1)}`).join(" ");
  const area = `${path} L ${x(verlauf.length - 1).toFixed(1)} ${H - pad} L ${pad} ${H - pad} Z`;

  const erster = werte[0];
  const letzter = werte[werte.length - 1];
  const trend = letzter > erster * 1.02 ? "waechst" : letzter < erster * 0.98 ? "sinkt" : "stabil";
  const TrendIcon = trend === "waechst" ? TrendingUp : trend === "sinkt" ? TrendingDown : Minus;
  const trendClass =
    trend === "waechst"
      ? "bg-coral/10 text-coral"
      : trend === "sinkt"
        ? "bg-success/10 text-success"
        : "bg-muted text-muted-foreground";

  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold">Kostenverlauf</h2>
          <p className="text-xs text-muted-foreground">Toolkosten dieses Kunden, letzte zwölf Monate</p>
        </div>
        <div
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
            trendClass,
          )}
        >
          <TrendIcon className="size-3" /> {trend}
        </div>
      </div>
      <div className="mt-4 overflow-x-auto">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ minWidth: 480 }} role="img" aria-label="Kostenverlauf">
          <defs>
            <linearGradient id="kdGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6C5CE7" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#6C5CE7" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={area} fill="url(#kdGrad)" />
          <path d={path} fill="none" stroke="#6C5CE7" strokeWidth="2.5" strokeLinejoin="round" />
          {verlauf.map((p, i) => (
            <g key={`${p.label}-${i}`}>
              <circle cx={x(i)} cy={y(p.wert)} r="3" fill="#6C5CE7" />
              <text x={x(i)} y={H - 6} textAnchor="middle" className="fill-muted-foreground" style={{ fontSize: 10 }}>
                {p.label}
              </text>
            </g>
          ))}
        </svg>
      </div>
      <p className="mt-2 text-[11px] text-muted-foreground">
        Aus dem Startdatum der zugeordneten Abos rekonstruiert. Bereits beendete Abos fehlen darin.
      </p>
    </div>
  );
}

/* --------------------------- Kostenstruktur (Donut) ----------------------- */

function KostenstrukturCard({ abos }: { abos: Abo[] }) {
  if (abos.length === 0) return null;

  const agg = new Map<string, number>();
  for (const a of abos) {
    agg.set(a.kategorie, (agg.get(a.kategorie) ?? 0) + monatlich(a.kosten, a.intervall));
  }
  const data = [...agg.entries()]
    .map(([kategorie, wert]) => ({ kategorie, wert, farbe: KATEGORIE_FARBEN[kategorie] ?? "#6C5CE7" }))
    .sort((a, b) => b.wert - a.wert);
  const total = data.reduce((s, d) => s + d.wert, 0);
  if (total <= 0) return null;

  const R = 60;
  const r = 38;
  const C = 80;
  // Kumulierte Anteile vorab, damit im Render nichts mehr fortgeschrieben wird.
  const grenzen = data.reduce<number[]>((acc, d) => [...acc, (acc[acc.length - 1] ?? 0) + d.wert], []);
  const segs = data.map((d, i) => {
    const vorher = grenzen[i] - d.wert;
    const start = (vorher / total) * Math.PI * 2 - Math.PI / 2;
    const end = (grenzen[i] / total) * Math.PI * 2 - Math.PI / 2;
    const large = end - start > Math.PI ? 1 : 0;
    const x1 = C + R * Math.cos(start);
    const y1 = C + R * Math.sin(start);
    const x2 = C + R * Math.cos(end);
    const y2 = C + R * Math.sin(end);
    const xi1 = C + r * Math.cos(end);
    const yi1 = C + r * Math.sin(end);
    const xi2 = C + r * Math.cos(start);
    const yi2 = C + r * Math.sin(start);
    // Ein einzelner Posten waere als Pfad ein entarteter Kreis, deshalb der Sonderfall.
    const d2 =
      data.length === 1
        ? `M ${C} ${C - R} A ${R} ${R} 0 1 1 ${C - 0.01} ${C - R} Z M ${C} ${C - r} A ${r} ${r} 0 1 0 ${C - 0.01} ${C - r} Z`
        : `M ${x1} ${y1} A ${R} ${R} 0 ${large} 1 ${x2} ${y2} L ${xi1} ${yi1} A ${r} ${r} 0 ${large} 0 ${xi2} ${yi2} Z`;
    return { ...d, d: d2 };
  });

  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm">
      <h2 className="font-display text-lg font-semibold">Kostenstruktur</h2>
      <p className="text-xs text-muted-foreground">Aufgeschlüsselt nach Kategorie</p>
      <div className="mt-4 flex flex-wrap items-center gap-6">
        <svg width={160} height={160} viewBox="0 0 160 160" role="img" aria-label="Kosten nach Kategorie">
          {segs.map((s) => (
            <path key={s.kategorie} d={s.d} fill={s.farbe} fillRule="evenodd" />
          ))}
          <text
            x={C}
            y={C - 2}
            textAnchor="middle"
            className="fill-foreground font-display"
            style={{ fontSize: 14, fontWeight: 600 }}
          >
            {abos.length}
          </text>
          <text x={C} y={C + 14} textAnchor="middle" className="fill-muted-foreground" style={{ fontSize: 9 }}>
            {abos.length === 1 ? "Tool" : "Tools"}
          </text>
        </svg>
        <ul className="min-w-[200px] flex-1 space-y-2">
          {data.map((d) => (
            <li key={d.kategorie} className="flex items-center gap-2 text-sm">
              <span className="inline-block size-2.5 shrink-0 rounded-full" style={{ background: d.farbe }} />
              <span className="flex-1 truncate">{d.kategorie}</span>
              <span className="tabular-nums text-muted-foreground">{formatEur(d.wert)}</span>
              <span className="w-12 text-right text-xs tabular-nums text-muted-foreground">
                {((d.wert / total) * 100).toFixed(0)} %
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ------------------------- Weiterverrechnungs-Karte ----------------------- */

function WeiterverrechnungCard({
  weiterverrechnet,
  aufschlagProzent,
  toolkosten,
  verrechnet,
  marge,
  readOnly,
  pending,
  onToggle,
  onAufschlag,
}: {
  weiterverrechnet: boolean;
  aufschlagProzent: number;
  toolkosten: number;
  verrechnet: number;
  marge: number;
  readOnly: boolean;
  pending: boolean;
  onToggle: (v: boolean) => void;
  onAufschlag: (v: number) => void;
}) {
  const [entwurf, setEntwurf] = useState(String(aufschlagProzent));

  return (
    <div className="rounded-2xl border border-primary/20 bg-card p-5 shadow-md ring-1 ring-primary/5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold">Weiterverrechnung</h2>
          <p className="text-xs text-muted-foreground">Wie viel davon auf die Kundenrechnung geht</p>
        </div>
        <div className="flex items-center gap-2">
          {pending && <Loader2 className="size-3.5 animate-spin text-muted-foreground" />}
          <Switch
            checked={weiterverrechnet}
            onCheckedChange={onToggle}
            disabled={readOnly || pending}
            aria-label="Weiterverrechnung"
          />
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <div className="flex items-center gap-2">
          <Label className="text-xs text-muted-foreground" htmlFor="aufschlag">
            Aufschlag
          </Label>
          <div className="relative flex-1">
            <Input
              id="aufschlag"
              type="number"
              min={0}
              max={200}
              value={entwurf}
              onChange={(e) => setEntwurf(e.target.value)}
              onBlur={() => onAufschlag(Math.max(0, Math.min(200, Number(entwurf) || 0)))}
              className="pr-8 tabular-nums"
              disabled={!weiterverrechnet || readOnly || pending}
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
              %
            </span>
          </div>
        </div>

        <div className="space-y-2 rounded-xl border bg-muted/30 p-4 text-sm">
          <Row label="Toolkosten" value={formatEur(toolkosten)} />
          <Row
            label={`plus Aufschlag ${aufschlagProzent} %`}
            value={`+${formatEur(marge)}`}
            accent={weiterverrechnet ? "success" : undefined}
          />
          <div className="my-2 border-t" />
          <Row label="Weiterverrechnet" value={formatEur(verrechnet)} strong />
          <Row label="Marge" value={`+${formatEur(marge)}`} strong accent="success" />
        </div>

        <Button asChild className="w-full gap-1.5">
          <Link href="/app/berichte">
            <FileText className="size-4" /> Report erstellen
          </Link>
        </Button>
        <p className="text-center text-xs text-muted-foreground">fertig zum Anhängen an deine Rechnung</p>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  strong,
  accent,
}: {
  label: string;
  value: string;
  strong?: boolean;
  accent?: "success";
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className={cn("text-muted-foreground", strong && "font-medium text-foreground")}>{label}</span>
      <span className={cn("tabular-nums", strong && "font-semibold", accent === "success" && "text-success")}>
        {value}
      </span>
    </div>
  );
}

/* ---------------------- Kontakt, Notizen, Aktivität ----------------------- */

function KontaktCard({ kunde, readOnly, onEdit }: { kunde: Kunde; readOnly: boolean; onEdit: () => void }) {
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-base font-semibold">Kontakt</h2>
        {!readOnly && (
          <Button variant="ghost" size="sm" onClick={onEdit} className="gap-1">
            <Pencil className="size-3.5" /> bearbeiten
          </Button>
        )}
      </div>
      {!kunde.ansprechpartner && !kunde.email ? (
        <p className="mt-3 text-sm text-muted-foreground">Noch kein Ansprechpartner hinterlegt.</p>
      ) : (
        <dl className="mt-3 space-y-2 text-sm">
          {kunde.ansprechpartner && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <UserIcon className="size-3.5" />
              <dt className="sr-only">Ansprechpartner</dt>
              <dd className="text-foreground">{kunde.ansprechpartner}</dd>
            </div>
          )}
          {kunde.email && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="size-3.5" />
              <dt className="sr-only">E-Mail</dt>
              <dd>
                <a href={`mailto:${kunde.email}`} className="text-foreground hover:underline">
                  {kunde.email}
                </a>
              </dd>
            </div>
          )}
        </dl>
      )}
    </div>
  );
}

function NotizenCard({ kundeId, wert, readOnly }: { kundeId: string; wert: string; readOnly: boolean }) {
  const [text, setText] = useState(wert);
  const [pending, start] = useTransition();
  const geaendert = text !== wert;

  function speichern() {
    start(async () => {
      const res = await updateKundeNotizen(kundeId, text);
      if (res.error) toast.error(res.error);
      else toast.success("Notiz gespeichert.");
    });
  }

  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm">
      <h2 className="font-display text-base font-semibold">Notizen</h2>
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Notier hier, was du nicht vergessen willst."
        className="mt-3 min-h-[110px] resize-y"
        disabled={readOnly}
      />
      {!readOnly && geaendert && (
        <Button size="sm" className="mt-3 w-full" onClick={speichern} disabled={pending}>
          {pending && <Loader2 className="size-4 animate-spin" />} Notiz speichern
        </Button>
      )}
    </div>
  );
}

function AktivitaetCard({ items }: { items: Aktivitaet[] }) {
  if (items.length === 0) return null;
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm">
      <h2 className="font-display text-base font-semibold">Aktivität</h2>
      <ul className="mt-3 space-y-3">
        {items.map((a, i) => (
          <li key={i} className="flex items-start gap-2.5 text-sm">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary/70" />
            <div className="flex-1">
              <div className="text-foreground">{a.text}</div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="size-3" /> {a.ts}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
