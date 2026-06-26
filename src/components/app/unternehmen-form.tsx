"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { Loader2, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { saveUnternehmen, type ProfileState } from "@/app/app/einstellungen/actions";

export type Unternehmen = {
  name: string | null;
  strasse: string | null;
  plz: string | null;
  ort: string | null;
  land: string | null;
  ust_id: string | null;
  steuernummer: string | null;
};

export function UnternehmenForm({ initial }: { initial: Unternehmen | null }) {
  const [state, action, pending] = useActionState(saveUnternehmen, {} as ProfileState);

  useEffect(() => {
    if (state.ok) toast.success("Gespeichert", { description: "Unternehmensdaten aktualisiert." });
    else if (state.error) toast.error(state.error);
  }, [state]);

  return (
    <form action={action} className="overflow-hidden rounded-[20px] border bg-card shadow-soft">
      <header className="flex items-center gap-2 border-b border-border/60 px-6 pb-4 pt-6">
        <Building2 className="size-5 text-primary" />
        <div>
          <h2 className="font-display text-lg font-semibold">Unternehmen</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">Für Rechnungen, Reports und den Weiterverrechnungs-Export.</p>
        </div>
      </header>

      <div className="space-y-5 p-6">
        <div className="space-y-1.5">
          <Label htmlFor="name">Firmenname</Label>
          <Input id="name" name="name" defaultValue={initial?.name ?? ""} placeholder="OMMM GmbH" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="strasse">Straße und Hausnummer</Label>
          <Input id="strasse" name="strasse" defaultValue={initial?.strasse ?? ""} />
        </div>
        <div className="grid gap-4 sm:grid-cols-[140px_1fr]">
          <div className="space-y-1.5">
            <Label htmlFor="plz">PLZ</Label>
            <Input id="plz" name="plz" defaultValue={initial?.plz ?? ""} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ort">Ort</Label>
            <Input id="ort" name="ort" defaultValue={initial?.ort ?? ""} />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="land">Land</Label>
          <Input id="land" name="land" defaultValue={initial?.land ?? "Deutschland"} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="ust_id">USt-IdNr.</Label>
            <Input id="ust_id" name="ust_id" defaultValue={initial?.ust_id ?? ""} placeholder="DE123456789" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="steuernummer">Steuernummer</Label>
            <Input id="steuernummer" name="steuernummer" defaultValue={initial?.steuernummer ?? ""} />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 border-t border-border/60 bg-muted/30 px-6 py-4">
        <Button type="submit" disabled={pending}>
          {pending && <Loader2 className="size-4 animate-spin" />}
          Speichern
        </Button>
      </div>
    </form>
  );
}
