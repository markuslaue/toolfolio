"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Check, Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { KUNDE_STATUS, KUNDE_STATUS_LABEL, KUNDE_FARBEN, type Kunde, type KundeStatus } from "@/lib/kunden";
import { createKunde, updateKunde, archiveKunde, type KundeInput } from "@/app/app/kunden/actions";

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
    weiterverrechnet: true,
    aufschlag_prozent: "15",
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
  const [fehler, setFehler] = useState<string | null>(null);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setData((d) => ({ ...d, [key]: value }));
  }

  async function speichern() {
    if (!data.name.trim()) return setFehler("Bitte gib einen Namen ein.");
    setFehler(null);
    setBusy(true);
    const input: KundeInput = {
      name: data.name,
      ansprechpartner: data.ansprechpartner,
      email: data.email,
      farbe: data.farbe,
      status: data.status,
      weiterverrechnet: data.weiterverrechnet,
      // Ohne Weiterverrechnung ergibt ein Aufschlag keinen Sinn.
      aufschlag_prozent: !data.weiterverrechnet || data.aufschlag_prozent === "" ? null : Number(data.aufschlag_prozent),
      notizen: data.notizen,
    };
    const res = kunde ? await updateKunde(kunde.id, input) : await createKunde(input);
    setBusy(false);
    if (res.error) return setFehler(res.error);
    toast.success(kunde ? "Kunde gespeichert." : "Kunde hinzugefügt.");
    onOpenChange(false);
    onSaved?.();
    router.refresh();
  }

  async function archivieren() {
    if (!kunde) return;
    setBusy(true);
    const res = await archiveKunde(kunde.id);
    setBusy(false);
    if (res.error) return setFehler(res.error);
    toast.success(`${kunde.name} archiviert.`);
    onOpenChange(false);
    router.refresh();
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-xl">
        <div className="sticky top-0 z-10 border-b bg-background/95 px-6 py-4 backdrop-blur">
          <SheetTitle className="font-display text-xl font-semibold">
            {kunde ? "Kunde bearbeiten" : "Kunde hinzufügen"}
          </SheetTitle>
          <SheetDescription className="mt-0.5 text-xs">
            Leg fest, wie Toolkosten diesem Kunden zugeordnet und weiterverrechnet werden.
          </SheetDescription>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
          <div className="space-y-1.5">
            <Label htmlFor="k-name">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="k-name"
              value={data.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="z. B. Kunde Nordwerk"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="k-ap">Ansprechpartner</Label>
              <Input
                id="k-ap"
                value={data.ansprechpartner}
                onChange={(e) => set("ansprechpartner", e.target.value)}
                placeholder="optional"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="k-mail">Kontakt-E-Mail</Label>
              <Input
                id="k-mail"
                type="email"
                value={data.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="optional"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Farbe des Kürzels</Label>
            <div className="flex flex-wrap gap-2">
              {KUNDE_FARBEN.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => set("farbe", f)}
                  aria-label={`Farbe ${f}`}
                  className={cn(
                    "grid size-8 place-items-center rounded-full ring-offset-2 ring-offset-background transition-all",
                    data.farbe === f && "ring-2 ring-foreground",
                  )}
                  style={{ background: f }}
                >
                  {data.farbe === f && <Check className="size-4 text-white" />}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border bg-muted/30 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-medium">Weiterverrechnung</div>
                <div className="text-xs text-muted-foreground">Standard für neue Tools dieses Kunden</div>
              </div>
              <Switch
                checked={data.weiterverrechnet}
                onCheckedChange={(v) => set("weiterverrechnet", v)}
                aria-label="Weiterverrechnung"
              />
            </div>
            {data.weiterverrechnet && (
              <div className="mt-3 space-y-1.5">
                <Label htmlFor="k-auf">Aufschlag in Prozent</Label>
                <div className="relative max-w-[160px]">
                  <Input
                    id="k-auf"
                    type="number"
                    min={0}
                    max={200}
                    value={data.aufschlag_prozent}
                    onChange={(e) => set("aufschlag_prozent", e.target.value)}
                    className="pr-8 tabular-nums"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">%</span>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select value={data.status} onValueChange={(v) => set("status", v as KundeStatus)}>
              <SelectTrigger className="w-full">
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

          <div className="space-y-1.5">
            <Label htmlFor="k-notiz">Notizen</Label>
            <Textarea
              id="k-notiz"
              rows={3}
              value={data.notizen}
              onChange={(e) => set("notizen", e.target.value)}
              placeholder="z. B. Abrechnungsrhythmus, Sonderkonditionen"
            />
          </div>

          {fehler && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {fehler}
            </div>
          )}

          {kunde && kunde.status !== "archiviert" && (
            <div className="border-t pt-4">
              <Button variant="outline" className="w-full text-warning" onClick={archivieren} disabled={busy}>
                <Archive className="mr-2 size-4" /> Archivieren
              </Button>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 z-10 flex items-center justify-end gap-2 border-t bg-background/95 px-6 py-3 backdrop-blur">
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={busy}>
            Abbrechen
          </Button>
          <Button onClick={speichern} disabled={busy}>
            {busy && <Loader2 className="size-4 animate-spin" />}
            Speichern
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
