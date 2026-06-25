"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  Pencil,
  MoreHorizontal,
  Pause,
  Archive,
  Trash2,
  AlertTriangle,
  Bell,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { AboFormPanel } from "@/components/app/abo-form-panel";
import { formatEur } from "@/lib/constants";
import {
  INTERVALL_LABEL,
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
  deleteAbo,
  setErinnerung,
  bulkSetStatus,
} from "@/app/app/abos/actions";

function fmtDate(v: string | null): string {
  if (!v) return "–";
  const [y, m, d] = v.split("-");
  return d ? `${d}.${m}.${y}` : v;
}

function monateSeit(v: string | null): number | null {
  if (!v) return null;
  const start = new Date(v);
  const jetzt = new Date();
  return Math.max(
    0,
    (jetzt.getFullYear() - start.getFullYear()) * 12 + (jetzt.getMonth() - start.getMonth()),
  );
}

function preis(a: Abo): string {
  const wert = formatEur(a.kosten).replace("€", "").trim();
  return a.waehrung === "USD" ? `$${wert}` : `${wert} €`;
}

function Card({
  titel,
  children,
  klasse,
}: {
  titel: string;
  children: React.ReactNode;
  klasse?: string;
}) {
  return (
    <section className={`rounded-[20px] border bg-card p-6 shadow-soft ${klasse ?? ""}`}>
      <h2 className="mb-4 font-display text-base font-semibold">{titel}</h2>
      {children}
    </section>
  );
}

function Zeile({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium tabular-nums">{children}</span>
    </div>
  );
}

export function AboDetail({
  abo,
  kanalOptionen = [],
  kundenOptionen = [],
}: {
  abo: Abo;
  kanalOptionen?: string[];
  kundenOptionen?: string[];
}) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [erinnern, setErinnern] = useState(abo.erinnerung);
  const [busy, setBusy] = useState(false);

  const farbe = abo.farbe ?? KATEGORIE_FARBEN[abo.kategorie] ?? "#6C5CE7";
  const st = STATUS_FARBEN[abo.status as AboStatus] ?? STATUS_FARBEN.aktiv;
  const mtl = monatlich(abo.kosten, abo.intervall);
  const seitMonate = monateSeit(abo.abo_seit);

  const fristDatum = abo.letzter_kuendigungstermin ?? abo.trial_endet;
  const fristNah = (() => {
    if (!fristDatum) return false;
    const heute = new Date();
    heute.setHours(0, 0, 0, 0);
    const grenze = new Date(heute);
    grenze.setDate(grenze.getDate() + 30);
    const d = new Date(fristDatum);
    return d >= heute && d <= grenze;
  })();

  async function status(neu: "pausiert" | "archiviert") {
    setBusy(true);
    const res = await bulkSetStatus([abo.id], neu);
    setBusy(false);
    if (res.error) return toast.error(res.error);
    toast.success(neu === "pausiert" ? "Pausiert" : "Archiviert");
    router.refresh();
  }

  async function loeschen() {
    setBusy(true);
    const res = await deleteAbo(abo.id);
    setBusy(false);
    setDeleteOpen(false);
    if (res.error) return toast.error(res.error);
    toast.success("Abo gelöscht");
    router.push("/app/abos");
  }

  async function toggleErinnern(on: boolean) {
    setErinnern(on);
    const res = await setErinnerung(abo.id, on);
    if (res.error) {
      setErinnern(!on);
      toast.error(res.error);
    }
  }

  return (
    <div className="space-y-6">
      <Link
        href="/app/abos"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Zurück zu Abos
      </Link>

      {/* Header */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
        <div
          className="grid size-16 shrink-0 place-items-center rounded-2xl font-display text-2xl font-bold text-white shadow-sm sm:size-20 sm:text-3xl"
          style={{ background: farbe }}
          aria-hidden
        >
          {abo.initial ?? toolInitial(abo.tool)}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            {abo.tool}
          </h1>
          {abo.anbieter && (
            <div className="mt-1 text-sm text-muted-foreground">{abo.anbieter}</div>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span
              className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
              style={{ backgroundColor: `${farbe}1A`, color: farbe }}
            >
              {abo.kategorie}
            </span>
            <span
              className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold"
              style={{ backgroundColor: st.bg, color: st.text }}
            >
              <span className="size-1.5 rounded-full" style={{ backgroundColor: st.dot }} />
              {STATUS_LABEL[abo.status as AboStatus] ?? abo.status}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:self-start">
          <Button onClick={() => setEditOpen(true)} className="gap-1.5">
            <Pencil className="size-4" /> Bearbeiten
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" aria-label="Weitere Aktionen" disabled={busy}>
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuItem onClick={() => status("pausiert")}>
                <Pause className="size-4" /> Pausieren
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => status("archiviert")}>
                <Archive className="size-4" /> Archivieren
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setDeleteOpen(true)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="size-4" /> Löschen
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Frist-Banner */}
      {fristNah && (
        <div className="flex items-start gap-3 rounded-2xl border border-warning/40 bg-warning/10 p-3.5">
          <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-warning/20 text-warning">
            <AlertTriangle className="size-4" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold">Kündigungsfrist im Blick behalten</div>
            <div className="text-xs text-muted-foreground">
              Stichtag {fmtDate(fristDatum)}
              {abo.auto_verlaengerung ? ", sonst automatische Verlängerung." : "."}
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Hauptspalte */}
        <div className="space-y-6 lg:col-span-2">
          <Card titel="Kosten & Abrechnung">
            <div className="flex flex-wrap items-baseline gap-2">
              <div className="font-display text-3xl font-semibold tabular-nums sm:text-4xl">
                {preis(abo)}
              </div>
              <div className="text-sm text-muted-foreground">
                / {INTERVALL_LABEL[abo.intervall as Intervall]}
              </div>
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              Macht <span className="font-medium text-foreground tabular-nums">{formatEur(mtl)}</span> pro Monat,
              hochgerechnet{" "}
              <span className="font-medium text-foreground tabular-nums">{formatEur(mtl * 12)}</span> pro Jahr.
            </div>
            <div className="mt-4 border-t pt-2">
              <Zeile label="Nächste Abbuchung">{fmtDate(abo.naechste_abbuchung)}</Zeile>
              <Zeile label="Zahlungskanal">{abo.zahlungskanal ?? "–"}</Zeile>
              <Zeile label="Abo seit">
                {abo.abo_seit ? `${fmtDate(abo.abo_seit)}${seitMonate != null ? ` (${seitMonate} Mon.)` : ""}` : "–"}
              </Zeile>
              <Zeile label="Automatische Verlängerung">
                {abo.auto_verlaengerung ? "Ja" : "Nein"}
              </Zeile>
            </div>
          </Card>

          <Card titel="Kündigung & Frist" klasse={fristNah ? "border-warning/40" : undefined}>
            <Zeile label="Kündigungsfrist">
              {abo.frist_wert != null ? `${abo.frist_wert} ${abo.frist_einheit ?? "Tage"}` : "–"}
            </Zeile>
            <Zeile label="Letzter Kündigungstermin">
              {fmtDate(abo.letzter_kuendigungstermin)}
            </Zeile>
            <Zeile label="Trial endet am">{fmtDate(abo.trial_endet)}</Zeile>
            <div className="mt-3 flex items-center justify-between border-t pt-3">
              <span className="inline-flex items-center gap-2 text-sm">
                <Bell className="size-4 text-muted-foreground" /> Vor der Frist erinnern
              </span>
              <Switch checked={erinnern} onCheckedChange={toggleErinnern} />
            </div>
          </Card>

          {(abo.notizen || abo.konto_email || abo.login_verweis) && (
            <Card titel="Notizen & Zugang">
              {abo.notizen && (
                <p className="whitespace-pre-line text-sm text-foreground">{abo.notizen}</p>
              )}
              <div className="mt-3 border-t pt-2">
                <Zeile label="Konto-E-Mail">{abo.konto_email ?? "–"}</Zeile>
                <Zeile label="Login-Verweis">{abo.login_verweis ?? "–"}</Zeile>
              </div>
            </Card>
          )}
        </div>

        {/* Seitenspalte */}
        <div className="space-y-6">
          <Card titel="Zuordnung">
            <Zeile label="Kategorie">{abo.kategorie}</Zeile>
            <Zeile label="Kunde">{abo.kunde ?? "Nicht zugeordnet"}</Zeile>
            <Zeile label="Weiterverrechnung">
              {abo.weiterverrechnen
                ? `Ja${abo.aufschlag_prozent != null ? ` (+${abo.aufschlag_prozent} %)` : ""}`
                : "Nein"}
            </Zeile>
            {abo.tags.length > 0 && (
              <div className="mt-3 border-t pt-3">
                <div className="mb-2 text-xs text-muted-foreground">Tags</div>
                <div className="flex flex-wrap gap-1.5">
                  {abo.tags.map((t) => (
                    <span
                      key={t}
                      className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>

      <AboFormPanel
        open={editOpen}
        onOpenChange={setEditOpen}
        abo={abo}
        kanalOptionen={kanalOptionen}
        kundenOptionen={kundenOptionen}
        onSaved={() => router.refresh()}
        onDeleted={() => router.push("/app/abos")}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Abo löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              {abo.tool} wird dauerhaft entfernt. Diese Aktion kann nicht rückgängig
              gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={loeschen}
            >
              Endgültig löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
