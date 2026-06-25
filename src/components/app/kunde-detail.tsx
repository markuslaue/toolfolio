"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Mail,
  User,
  Receipt,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { formatEur } from "@/lib/constants";
import {
  monatlich,
  INTERVALL_LABEL,
  KATEGORIE_FARBEN,
  toolInitial,
  type Abo,
  type Intervall,
} from "@/lib/abos";
import {
  KUNDE_STATUS_LABEL,
  kundeInitial,
  type Kunde,
} from "@/lib/kunden";
import { deleteKunde } from "@/app/app/kunden/actions";

function preis(a: Abo): string {
  const wert = formatEur(a.kosten).replace("€", "").trim();
  return a.waehrung === "USD" ? `$${wert}` : `${wert} €`;
}

function KpiCard({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: string;
  hint?: string;
  icon: typeof Receipt;
}) {
  return (
    <div className="rounded-[20px] border bg-card p-5 shadow-soft">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-4" />
        </span>
      </div>
      <div className="mt-3 font-display text-2xl font-bold tabular-nums">{value}</div>
      {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}

export function KundeDetail({ kunde, abos }: { kunde: Kunde; abos: Abo[] }) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const aufschlag = kunde.aufschlag_prozent ?? 0;
  const kostenMonat = abos.reduce((s, a) => s + monatlich(a.kosten, a.intervall), 0);
  const weiterverrechnet = kunde.weiterverrechnet ? kostenMonat * (1 + aufschlag / 100) : 0;
  const margeMonat = kunde.weiterverrechnet ? (kostenMonat * aufschlag) / 100 : 0;

  async function loeschen() {
    const res = await deleteKunde(kunde.id);
    setDeleteOpen(false);
    if (res.error) return toast.error(res.error);
    toast.success("Kunde gelöscht");
    router.push("/app/kunden");
  }

  return (
    <div className="space-y-6">
      <Link
        href="/app/kunden"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Zurück zu Kunden
      </Link>

      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
        <div
          className="grid size-16 shrink-0 place-items-center rounded-2xl font-display text-2xl font-bold text-white shadow-sm sm:size-20"
          style={{ background: kunde.farbe }}
          aria-hidden
        >
          {kundeInitial(kunde.name)}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            {kunde.name}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            {kunde.ansprechpartner && (
              <span className="inline-flex items-center gap-1.5">
                <User className="size-3.5" /> {kunde.ansprechpartner}
              </span>
            )}
            {kunde.email && (
              <a href={`mailto:${kunde.email}`} className="inline-flex items-center gap-1.5 hover:text-foreground">
                <Mail className="size-3.5" /> {kunde.email}
              </a>
            )}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground">
              {KUNDE_STATUS_LABEL[kunde.status]}
            </span>
            {kunde.weiterverrechnet && (
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                Weiterverrechnung +{aufschlag}%
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 sm:self-start">
          <Button onClick={() => setEditOpen(true)} className="gap-1.5">
            <Pencil className="size-4" /> Bearbeiten
          </Button>
          <Button
            variant="outline"
            size="icon"
            aria-label="Löschen"
            className="text-destructive hover:text-destructive"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </header>

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard label="Zugeordnete Abos" value={String(abos.length)} icon={Receipt} />
        <KpiCard label="Kosten pro Monat" value={formatEur(kostenMonat)} hint="ohne Aufschlag" icon={Receipt} />
        {kunde.weiterverrechnet ? (
          <KpiCard
            label="Marge pro Monat"
            value={formatEur(margeMonat)}
            hint={`Weiterverrechnet ${formatEur(weiterverrechnet)}`}
            icon={TrendingUp}
          />
        ) : (
          <KpiCard label="Weiterverrechnung" value="Aus" hint="Kein Aufschlag" icon={TrendingUp} />
        )}
      </div>

      {/* Abos */}
      <div className="rounded-[20px] border bg-card p-5 shadow-soft">
        <h2 className="font-display text-base font-semibold">Zugeordnete Abos</h2>
        {abos.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Diesem Kunden sind noch keine Abos zugeordnet. Setze im Abo das Feld Kunde auf{" "}
            {kunde.name}.
          </p>
        ) : (
          <ul className="mt-3 divide-y">
            {abos.map((a) => {
              const farbe = a.farbe ?? KATEGORIE_FARBEN[a.kategorie] ?? "#6C5CE7";
              return (
                <li key={a.id}>
                  <Link href={`/app/abos/${a.id}`} className="flex items-center gap-3 py-2.5 hover:opacity-80">
                    <span
                      className="grid size-9 shrink-0 place-items-center rounded-lg text-sm font-semibold text-white"
                      style={{ backgroundColor: farbe }}
                    >
                      {a.initial ?? toolInitial(a.tool)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">{a.tool}</div>
                      <div className="text-xs text-muted-foreground">{a.kategorie}</div>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="text-sm font-semibold tabular-nums">{preis(a)}</div>
                      <div className="text-xs text-muted-foreground">
                        {INTERVALL_LABEL[a.intervall as Intervall] ?? a.intervall}
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <KundeDialog open={editOpen} onOpenChange={setEditOpen} kunde={kunde} onSaved={() => router.refresh()} />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Kunde löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              {kunde.name} wird entfernt. Zugeordnete Abos behalten ihren Text-Eintrag.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-white hover:bg-destructive/90" onClick={loeschen}>
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
