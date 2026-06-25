"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Users, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { formatEur } from "@/lib/constants";
import {
  KUNDE_STATUS_LABEL,
  kundeInitial,
  type KundeMitStats,
  type KundeStatus,
} from "@/lib/kunden";
import { deleteKunde } from "@/app/app/kunden/actions";

const STATUS_STYLE: Record<KundeStatus, string> = {
  aktiv: "bg-success/15 text-[#0B6B40]",
  inaktiv: "bg-muted text-muted-foreground",
  archiviert: "bg-muted text-muted-foreground",
};

export function KundenClient({ kunden }: { kunden: KundeMitStats[] }) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [aktiv, setAktiv] = useState<KundeMitStats | null>(null);
  const [loeschId, setLoeschId] = useState<string | null>(null);

  function neu() {
    setAktiv(null);
    setDialogOpen(true);
  }
  function bearbeiten(k: KundeMitStats) {
    setAktiv(k);
    setDialogOpen(true);
  }

  async function loeschen() {
    if (!loeschId) return;
    const res = await deleteKunde(loeschId);
    setLoeschId(null);
    if (res.error) return toast.error(res.error);
    toast.success("Kunde gelöscht");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Kunden</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Ordne Abos Kunden zu und behalte weiterverrechenbare Kosten im Blick.
          </p>
        </div>
        <Button onClick={neu} className="gap-1.5">
          <Plus className="size-4" /> Kunde hinzufügen
        </Button>
      </div>

      {kunden.length === 0 ? (
        <div className="rounded-[20px] border border-dashed bg-card p-12 text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
            <Users className="size-6" />
          </span>
          <h2 className="mt-4 font-display text-lg font-semibold">Noch keine Kunden</h2>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
            Lege einen Kunden an, um Abos zuzuordnen und Weiterverrechnung zu pflegen.
          </p>
          <Button onClick={neu} className="mt-5 gap-2">
            <Plus className="size-4" /> Kunde hinzufügen
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {kunden.map((k) => (
            <div key={k.id} className="rounded-2xl border bg-card p-4 shadow-soft transition-colors hover:border-primary/40">
              <div className="flex items-start justify-between">
                <button
                  type="button"
                  onClick={() => router.push(`/app/kunden/${k.id}`)}
                  className="flex min-w-0 items-center gap-3 text-left"
                >
                  <span
                    className="grid size-10 shrink-0 place-items-center rounded-xl font-display text-sm font-semibold text-white"
                    style={{ backgroundColor: k.farbe }}
                  >
                    {kundeInitial(k.name)}
                  </span>
                  <div className="min-w-0">
                    <div className="truncate font-medium">{k.name}</div>
                    {(k.ansprechpartner || k.email) && (
                      <div className="truncate text-xs text-muted-foreground">
                        {k.ansprechpartner ?? k.email}
                      </div>
                    )}
                  </div>
                </button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label="Aktionen" className="size-8">
                      <MoreHorizontal className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => bearbeiten(k)}>Bearbeiten</DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setLoeschId(k.id)}
                      className="text-destructive focus:text-destructive"
                    >
                      Löschen
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <button
                type="button"
                onClick={() => router.push(`/app/kunden/${k.id}`)}
                className="mt-3 block w-full text-left"
              >
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${STATUS_STYLE[k.status]}`}>
                    {KUNDE_STATUS_LABEL[k.status]}
                  </span>
                  {k.weiterverrechnet && (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                      Weiterverrechnung{k.aufschlag_prozent != null ? ` +${k.aufschlag_prozent}%` : ""}
                    </span>
                  )}
                </div>
                <div className="mt-3 flex items-end justify-between border-t pt-3">
                  <div className="text-xs text-muted-foreground">
                    {k.tools} {k.tools === 1 ? "Abo" : "Abos"}
                  </div>
                  <div className="text-right">
                    <div className="font-semibold tabular-nums">{formatEur(k.kostenMonat)}</div>
                    <div className="text-xs text-muted-foreground">pro Monat</div>
                  </div>
                </div>
              </button>
            </div>
          ))}
        </div>
      )}

      <KundeDialog
        key={aktiv?.id ?? "neu"}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        kunde={aktiv}
      />

      <AlertDialog open={!!loeschId} onOpenChange={(o) => !o && setLoeschId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Kunde löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Der Kunde wird entfernt. Zugeordnete Abos behalten ihren Text-Eintrag.
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
