"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Users, MoreHorizontal, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { cn } from "@/lib/utils";
import { formatEur } from "@/lib/constants";
import {
  KUNDE_STATUS,
  KUNDE_STATUS_LABEL,
  KUNDE_FARBEN,
  kundeInitial,
  type KundeMitStats,
  type KundeStatus,
} from "@/lib/kunden";
import {
  createKunde,
  updateKunde,
  deleteKunde,
  type KundeInput,
} from "@/app/app/kunden/actions";

type FormState = {
  name: string;
  ansprechpartner: string;
  email: string;
  farbe: string;
  status: KundeStatus;
  weiterverrechnet: boolean;
  aufschlag_prozent: string;
  notizen: string;
};

function leer(): FormState {
  return {
    name: "",
    ansprechpartner: "",
    email: "",
    farbe: KUNDE_FARBEN[0],
    status: "aktiv",
    weiterverrechnet: false,
    aufschlag_prozent: "",
    notizen: "",
  };
}

function ausKunde(k: KundeMitStats): FormState {
  return {
    name: k.name,
    ansprechpartner: k.ansprechpartner ?? "",
    email: k.email ?? "",
    farbe: k.farbe,
    status: k.status,
    weiterverrechnet: k.weiterverrechnet,
    aufschlag_prozent: k.aufschlag_prozent?.toString() ?? "",
    notizen: k.notizen ?? "",
  };
}

const STATUS_STYLE: Record<KundeStatus, string> = {
  aktiv: "bg-success/15 text-[#0B6B40]",
  inaktiv: "bg-muted text-muted-foreground",
  archiviert: "bg-muted text-muted-foreground",
};

export function KundenClient({ kunden }: { kunden: KundeMitStats[] }) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [aktiv, setAktiv] = useState<KundeMitStats | null>(null);
  const [data, setData] = useState<FormState>(leer());
  const [busy, setBusy] = useState(false);
  const [loeschId, setLoeschId] = useState<string | null>(null);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setData((d) => ({ ...d, [key]: value }));
  }
  function neu() {
    setAktiv(null);
    setData(leer());
    setDialogOpen(true);
  }
  function bearbeiten(k: KundeMitStats) {
    setAktiv(k);
    setData(ausKunde(k));
    setDialogOpen(true);
  }

  async function speichern() {
    setBusy(true);
    const input: KundeInput = {
      name: data.name,
      ansprechpartner: data.ansprechpartner,
      email: data.email,
      farbe: data.farbe,
      status: data.status,
      weiterverrechnet: data.weiterverrechnet,
      aufschlag_prozent: data.aufschlag_prozent === "" ? null : Number(data.aufschlag_prozent),
      notizen: data.notizen,
    };
    const res = aktiv ? await updateKunde(aktiv.id, input) : await createKunde(input);
    setBusy(false);
    if (res.error) return toast.error(res.error);
    toast.success(aktiv ? "Kunde gespeichert" : "Kunde hinzugefügt");
    setDialogOpen(false);
    router.refresh();
  }

  async function loeschen() {
    if (!loeschId) return;
    setBusy(true);
    const res = await deleteKunde(loeschId);
    setBusy(false);
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
            <div key={k.id} className="rounded-2xl border bg-card p-4 shadow-soft">
              <div className="flex items-start justify-between">
                <div className="flex min-w-0 items-center gap-3">
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
                </div>
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

              <div className="mt-3 flex items-center gap-2">
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
            </div>
          ))}
        </div>
      )}

      {/* Anlegen/Bearbeiten */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{aktiv ? "Kunde bearbeiten" : "Kunde hinzufügen"}</DialogTitle>
            <DialogDescription>Stammdaten und Weiterverrechnung pflegen.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={data.name} onChange={(e) => set("name", e.target.value)} placeholder="z. B. Kunde Nordwerk" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="ap">Ansprechpartner</Label>
                <Input id="ap" value={data.ansprechpartner} onChange={(e) => set("ansprechpartner", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="mail">E-Mail</Label>
                <Input id="mail" type="email" value={data.email} onChange={(e) => set("email", e.target.value)} placeholder="kontakt@kunde.de" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Farbe</Label>
              <div className="flex flex-wrap gap-2">
                {KUNDE_FARBEN.map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => set("farbe", f)}
                    aria-label={`Farbe ${f}`}
                    className={cn(
                      "grid size-8 place-items-center rounded-full transition",
                      data.farbe === f ? "ring-2 ring-foreground ring-offset-2" : "",
                    )}
                    style={{ backgroundColor: f }}
                  >
                    {data.farbe === f && <Check className="size-4 text-white" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={data.status} onValueChange={(v) => set("status", v as KundeStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {KUNDE_STATUS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {KUNDE_STATUS_LABEL[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between rounded-xl border bg-background/60 px-4 py-3">
              <span className="text-sm font-medium">Kosten weiterverrechnen</span>
              <Switch checked={data.weiterverrechnet} onCheckedChange={(v) => set("weiterverrechnet", v)} />
            </div>
            {data.weiterverrechnet && (
              <div className="space-y-1.5">
                <Label htmlFor="auf">Standard-Aufschlag in Prozent</Label>
                <Input
                  id="auf"
                  value={data.aufschlag_prozent}
                  onChange={(e) => set("aufschlag_prozent", e.target.value)}
                  inputMode="decimal"
                  placeholder="z. B. 15"
                  className="max-w-[160px] tabular-nums"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="notiz">Notiz</Label>
              <Textarea id="notiz" rows={3} value={data.notizen} onChange={(e) => set("notizen", e.target.value)} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={busy}>
              Abbrechen
            </Button>
            <Button onClick={speichern} disabled={busy}>
              {busy && <Loader2 className="size-4 animate-spin" />}
              {aktiv ? "Speichern" : "Hinzufügen"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
