"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, CreditCard, Landmark, Wallet, MoreHorizontal, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
import {
  KANAL_TYPEN,
  KANAL_TYP_LABEL,
  KANAL_STATUS_LABEL,
  kanalLabel,
  kanalStatus,
  type Zahlungskanal,
  type KanalTyp,
} from "@/lib/zahlungskanaele";
import {
  createKanal,
  updateKanal,
  deleteKanal,
  type KanalInput,
} from "@/app/app/zahlungskanaele/actions";

function TypIcon({ typ }: { typ: KanalTyp }) {
  if (typ === "sepa") return <Landmark className="size-4" />;
  if (typ === "paypal" || typ === "stripe" || typ === "paysafe") return <Wallet className="size-4" />;
  return <CreditCard className="size-4" />;
}

const STATUS_STYLE: Record<string, string> = {
  aktiv: "bg-success/15 text-[#0B6B40]",
  "laeuft-ab": "bg-warning/15 text-[#8A5A0B]",
  abgelaufen: "bg-destructive/15 text-[#8E2A1B]",
  inaktiv: "bg-muted text-muted-foreground",
};

type FormState = {
  typ: KanalTyp;
  bezeichnung: string;
  anbieter: string;
  last4: string;
  iban_last4: string;
  ablauf_monat: string;
  ablauf_jahr: string;
  inhaber: string;
  aktiv: boolean;
};

function leer(): FormState {
  return {
    typ: "kreditkarte",
    bezeichnung: "",
    anbieter: "",
    last4: "",
    iban_last4: "",
    ablauf_monat: "",
    ablauf_jahr: "",
    inhaber: "",
    aktiv: true,
  };
}

function ausKanal(k: Zahlungskanal): FormState {
  return {
    typ: k.typ,
    bezeichnung: k.bezeichnung,
    anbieter: k.anbieter ?? "",
    last4: k.last4 ?? "",
    iban_last4: k.iban_last4 ?? "",
    ablauf_monat: k.ablauf_monat?.toString() ?? "",
    ablauf_jahr: k.ablauf_jahr?.toString() ?? "",
    inhaber: k.inhaber ?? "",
    aktiv: k.aktiv,
  };
}

export function ZahlungskanaeleClient({ kanaele }: { kanaele: Zahlungskanal[] }) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [aktiv, setAktiv] = useState<Zahlungskanal | null>(null);
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
  function bearbeiten(k: Zahlungskanal) {
    setAktiv(k);
    setData(ausKanal(k));
    setDialogOpen(true);
  }

  async function speichern() {
    setBusy(true);
    const input: KanalInput = {
      typ: data.typ,
      bezeichnung: data.bezeichnung,
      anbieter: data.anbieter,
      last4: data.typ === "kreditkarte" ? data.last4 : "",
      iban_last4: data.typ === "sepa" ? data.iban_last4 : "",
      ablauf_monat: data.typ === "kreditkarte" && data.ablauf_monat ? Number(data.ablauf_monat) : null,
      ablauf_jahr: data.typ === "kreditkarte" && data.ablauf_jahr ? Number(data.ablauf_jahr) : null,
      inhaber: data.inhaber,
      aktiv: data.aktiv,
    };
    const res = aktiv ? await updateKanal(aktiv.id, input) : await createKanal(input);
    setBusy(false);
    if (res.error) return toast.error(res.error);
    toast.success(aktiv ? "Kanal gespeichert" : "Kanal hinzugefügt");
    setDialogOpen(false);
    router.refresh();
  }

  async function loeschen() {
    if (!loeschId) return;
    setBusy(true);
    const res = await deleteKanal(loeschId);
    setBusy(false);
    setLoeschId(null);
    if (res.error) return toast.error(res.error);
    toast.success("Kanal gelöscht");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
            Zahlungskanäle
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Verwalte deine Zahlungsmittel als Referenz, ohne sensible Daten zu hinterlegen.
          </p>
        </div>
        <Button onClick={neu} className="gap-1.5">
          <Plus className="size-4" /> Kanal hinzufügen
        </Button>
      </div>

      <div className="flex items-start gap-2 rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs text-muted-foreground">
        <CreditCard className="mt-0.5 size-3.5 shrink-0 text-primary" />
        Aus Sicherheitsgründen speichern wir niemals vollständige Kartennummern, Prüfziffern
        oder IBAN, nur die letzten vier Ziffern als Wiedererkennung.
      </div>

      {kanaele.length === 0 ? (
        <div className="rounded-[20px] border border-dashed bg-card p-12 text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
            <CreditCard className="size-6" />
          </span>
          <h2 className="mt-4 font-display text-lg font-semibold">Noch kein Zahlungskanal</h2>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
            Lege einen Kanal an, um Abos einer Zahlungsquelle zuzuordnen.
          </p>
          <Button onClick={neu} className="mt-5 gap-2">
            <Plus className="size-4" /> Kanal hinzufügen
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {kanaele.map((k) => {
            const status = kanalStatus(k);
            return (
              <div key={k.id} className="rounded-2xl border bg-card p-4 shadow-soft">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                      <TypIcon typ={k.typ} />
                    </span>
                    <div>
                      <div className="font-medium">{kanalLabel(k)}</div>
                      <div className="text-xs text-muted-foreground">{KANAL_TYP_LABEL[k.typ]}</div>
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
                <div className="mt-3 flex items-center justify-between">
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${STATUS_STYLE[status]}`}>
                    {KANAL_STATUS_LABEL[status]}
                  </span>
                  {k.typ === "kreditkarte" && k.ablauf_monat && k.ablauf_jahr && (
                    <span className="text-xs text-muted-foreground tabular-nums">
                      gültig bis {String(k.ablauf_monat).padStart(2, "0")}/{k.ablauf_jahr}
                    </span>
                  )}
                </div>
                {k.inhaber && (
                  <div className="mt-2 text-xs text-muted-foreground">Inhaber: {k.inhaber}</div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Anlegen/Bearbeiten */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{aktiv ? "Kanal bearbeiten" : "Kanal hinzufügen"}</DialogTitle>
            <DialogDescription>
              Nur Referenzdaten. Keine vollständigen Nummern, keine Prüfziffern.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Typ</Label>
                <Select value={data.typ} onValueChange={(v) => set("typ", v as KanalTyp)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {KANAL_TYPEN.map((t) => (
                      <SelectItem key={t} value={t}>
                        {KANAL_TYP_LABEL[t]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="bez">Bezeichnung</Label>
                <Input
                  id="bez"
                  value={data.bezeichnung}
                  onChange={(e) => set("bezeichnung", e.target.value)}
                  placeholder="z. B. Firmenkarte Visa"
                />
              </div>
            </div>

            {data.typ === "kreditkarte" && (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="anbieter">Anbieter</Label>
                    <Input
                      id="anbieter"
                      value={data.anbieter}
                      onChange={(e) => set("anbieter", e.target.value)}
                      placeholder="Visa, Mastercard"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="last4">Letzte vier Ziffern</Label>
                    <Input
                      id="last4"
                      value={data.last4}
                      onChange={(e) => set("last4", e.target.value.replace(/\D/g, "").slice(0, 4))}
                      inputMode="numeric"
                      placeholder="4821"
                      className="tabular-nums"
                    />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="mon">Ablauf-Monat</Label>
                    <Input
                      id="mon"
                      value={data.ablauf_monat}
                      onChange={(e) => set("ablauf_monat", e.target.value.replace(/\D/g, "").slice(0, 2))}
                      inputMode="numeric"
                      placeholder="04"
                      className="tabular-nums"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="jahr">Ablauf-Jahr</Label>
                    <Input
                      id="jahr"
                      value={data.ablauf_jahr}
                      onChange={(e) => set("ablauf_jahr", e.target.value.replace(/\D/g, "").slice(0, 4))}
                      inputMode="numeric"
                      placeholder="2027"
                      className="tabular-nums"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="inhaber">Inhaber</Label>
                    <Input
                      id="inhaber"
                      value={data.inhaber}
                      onChange={(e) => set("inhaber", e.target.value)}
                      placeholder="Name"
                    />
                  </div>
                </div>
              </>
            )}

            {data.typ === "sepa" && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="iban4">IBAN, letzte vier Ziffern</Label>
                  <Input
                    id="iban4"
                    value={data.iban_last4}
                    onChange={(e) => set("iban_last4", e.target.value.replace(/\D/g, "").slice(0, 4))}
                    inputMode="numeric"
                    placeholder="9921"
                    className="tabular-nums"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="inhaber2">Kontoinhaber</Label>
                  <Input
                    id="inhaber2"
                    value={data.inhaber}
                    onChange={(e) => set("inhaber", e.target.value)}
                    placeholder="Name"
                  />
                </div>
              </div>
            )}

            <div className="flex items-center justify-between rounded-xl border bg-background/60 px-4 py-3">
              <span className="text-sm font-medium">Aktiv</span>
              <Switch checked={data.aktiv} onCheckedChange={(v) => set("aktiv", v)} />
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
            <AlertDialogTitle>Kanal löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Der Zahlungskanal wird entfernt. Zugeordnete Abos behalten ihren Text-Eintrag.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
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
