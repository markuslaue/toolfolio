"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, BellRing, Bell, TimerReset, Megaphone, FileBarChart, PiggyBank, Cpu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  saveBenachrichtigungen,
  type ProfileState,
} from "@/app/app/einstellungen/actions";

export type Prefs = {
  benachrichtigung_frist: boolean;
  benachrichtigung_trial: boolean;
  benachrichtigung_produkt: boolean;
  benachrichtigung_report: boolean;
  benachrichtigung_sparen: boolean;
  benachrichtigung_spike: boolean;
  benachrichtigung_vorlauf: number;
};

const VORLAUF = [3, 7, 14, 30];

function Zeile({
  icon: Icon,
  titel,
  desc,
  checked,
  onCheckedChange,
}: {
  icon: typeof Bell;
  titel: string;
  desc: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border/60 py-4 last:border-0">
      <div className="flex items-start gap-3">
        <span className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-4" />
        </span>
        <div>
          <div className="text-sm font-medium">{titel}</div>
          <div className="max-w-md text-xs text-muted-foreground">{desc}</div>
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

export function BenachrichtigungenForm({ initial }: { initial: Prefs }) {
  const [frist, setFrist] = useState(initial.benachrichtigung_frist);
  const [trial, setTrial] = useState(initial.benachrichtigung_trial);
  const [produkt, setProdukt] = useState(initial.benachrichtigung_produkt);
  const [report, setReport] = useState(initial.benachrichtigung_report);
  const [sparen, setSparen] = useState(initial.benachrichtigung_sparen);
  const [spike, setSpike] = useState(initial.benachrichtigung_spike);
  const [vorlauf, setVorlauf] = useState(String(initial.benachrichtigung_vorlauf));

  const [state, action, pending] = useActionState(saveBenachrichtigungen, {} as ProfileState);
  useEffect(() => {
    if (state.ok) toast.success("Gespeichert", { description: "Benachrichtigungen aktualisiert." });
    else if (state.error) toast.error(state.error);
  }, [state]);

  return (
    <form action={action} className="overflow-hidden rounded-[20px] border bg-card shadow-soft">
      <header className="flex items-center gap-2 border-b border-border/60 px-6 pb-4 pt-6">
        <BellRing className="size-5 text-primary" />
        <div>
          <h2 className="font-display text-lg font-semibold">Benachrichtigungen</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">Lege fest, worüber und wie früh wir dich per E-Mail erinnern.</p>
        </div>
      </header>

      <input type="hidden" name="frist" value={frist ? "true" : "false"} />
      <input type="hidden" name="trial" value={trial ? "true" : "false"} />
      <input type="hidden" name="produkt" value={produkt ? "true" : "false"} />
      <input type="hidden" name="report" value={report ? "true" : "false"} />
      <input type="hidden" name="sparen" value={sparen ? "true" : "false"} />
      <input type="hidden" name="spike" value={spike ? "true" : "false"} />
      <input type="hidden" name="vorlauf" value={vorlauf} />

      <div className="px-6">
        <Zeile icon={Bell} titel="Kündigungsfristen" desc="E-Mail, bevor sich ein Abo still verlängert." checked={frist} onCheckedChange={setFrist} />
        <Zeile icon={TimerReset} titel="Trial-Enden" desc="E-Mail, bevor ein Trial kostenpflichtig wird." checked={trial} onCheckedChange={setTrial} />
        <Zeile icon={Cpu} titel="AI-Spike-Alarm" desc="E-Mail, wenn dein KI-Verbrauch deutlich über dem Schnitt liegt." checked={spike} onCheckedChange={setSpike} />
        <Zeile icon={PiggyBank} titel="Sparvorschläge" desc="E-Mail, wenn wir eine konkrete Spar-Chance finden, etwa Wechsel auf eine Jahreslizenz." checked={sparen} onCheckedChange={setSparen} />
        <Zeile icon={FileBarChart} titel="Monatsreport" desc="Monatliche Zusammenfassung deiner Softwarekosten, Sparvorschläge und Fristen." checked={report} onCheckedChange={setReport} />
        <Zeile icon={Megaphone} titel="Produkt-News" desc="Gelegentliche Hinweise zu neuen Funktionen. Kein Spam." checked={produkt} onCheckedChange={setProdukt} />
      </div>

      <div className="border-t border-border/60 p-6">
        <Label>Vorlaufzeit für Frist-Erinnerungen</Label>
        <p className="mt-0.5 text-xs text-muted-foreground">Wie viele Tage vorher wir dich erinnern.</p>
        <Select value={vorlauf} onValueChange={setVorlauf}>
          <SelectTrigger className="mt-2 w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            {VORLAUF.map((t) => (<SelectItem key={t} value={String(t)}>{t} Tage vorher</SelectItem>))}
          </SelectContent>
        </Select>
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
