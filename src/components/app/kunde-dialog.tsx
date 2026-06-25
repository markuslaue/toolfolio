"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Check } from "lucide-react";
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
import { cn } from "@/lib/utils";
import {
  KUNDE_STATUS,
  KUNDE_STATUS_LABEL,
  KUNDE_FARBEN,
  type Kunde,
  type KundeStatus,
} from "@/lib/kunden";
import { createKunde, updateKunde, type KundeInput } from "@/app/app/kunden/actions";

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

function ausKunde(k: Kunde): FormState {
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

export function KundeDialog({
  open,
  onOpenChange,
  kunde,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  kunde?: Kunde | null;
  onSaved?: () => void;
}) {
  const router = useRouter();
  const [data, setData] = useState<FormState>(kunde ? ausKunde(kunde) : leer());
  const [busy, setBusy] = useState(false);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setData((d) => ({ ...d, [key]: value }));
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
    const res = kunde ? await updateKunde(kunde.id, input) : await createKunde(input);
    setBusy(false);
    if (res.error) return toast.error(res.error);
    toast.success(kunde ? "Kunde gespeichert" : "Kunde hinzugefügt");
    onOpenChange(false);
    onSaved?.();
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{kunde ? "Kunde bearbeiten" : "Kunde hinzufügen"}</DialogTitle>
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
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
            Abbrechen
          </Button>
          <Button onClick={speichern} disabled={busy}>
            {busy && <Loader2 className="size-4 animate-spin" />}
            {kunde ? "Speichern" : "Hinzufügen"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
