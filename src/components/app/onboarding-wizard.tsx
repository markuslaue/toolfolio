"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  User as UserIcon,
  Briefcase,
  Building2,
  Users,
  CreditCard,
  FileUp,
  Plus,
  Check,
  ArrowRight,
  ArrowLeft,
  Loader2,
  PartyPopper,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { KANAL_TYPEN, KANAL_TYP_LABEL, type KanalTyp } from "@/lib/zahlungskanaele";
import { KUNDE_FARBEN } from "@/lib/kunden";
import { createKanal } from "@/app/app/zahlungskanaele/actions";
import { createKunde } from "@/app/app/kunden/actions";
import { finishOnboarding } from "@/app/app/onboarding/actions";

type Segment = "solo" | "freelancer" | "agentur" | "unternehmen";

const SEGMENTE: { id: Segment; label: string; desc: string; icon: typeof UserIcon }[] = [
  { id: "solo", label: "Solo / Solopreneur", desc: "Du baust dein Business alleine auf.", icon: UserIcon },
  { id: "freelancer", label: "Freelancer", desc: "Du arbeitest selbstständig für Kunden.", icon: Briefcase },
  { id: "agentur", label: "Agentur", desc: "Ihr betreut mehrere Kunden im Team.", icon: Building2 },
  { id: "unternehmen", label: "Unternehmen / Team", desc: "Ihr arbeitet als Team mit mehreren Mandanten.", icon: Users },
];

export function OnboardingWizard({ vorname }: { vorname?: string }) {
  const router = useRouter();
  const [segment, setSegment] = useState<Segment | null>(null);
  const [step, setStep] = useState(1);
  const [busy, setBusy] = useState(false);

  // Kanaele
  const [kTyp, setKTyp] = useState<KanalTyp>("kreditkarte");
  const [kBez, setKBez] = useState("");
  const [kLast4, setKLast4] = useState("");
  const [kanaele, setKanaele] = useState<string[]>([]);

  // Kunden
  const [kundeInput, setKundeInput] = useState("");
  const [kunden, setKunden] = useState<string[]>([]);

  const zeigtKunden = segment === "agentur" || segment === "unternehmen";
  const schritte = ["Profil", "Zahlung", "Bestand", ...(zeigtKunden ? ["Kunden"] : []), "Fertig"];
  const total = schritte.length;

  async function beenden(ziel: string) {
    setBusy(true);
    await finishOnboarding({ segment });
    setBusy(false);
    router.push(ziel);
    router.refresh();
  }

  async function kanalHinzufuegen() {
    if (!kBez.trim()) return;
    setBusy(true);
    const res = await createKanal({
      typ: kTyp,
      bezeichnung: kBez.trim(),
      last4: kTyp === "kreditkarte" ? kLast4 : "",
      iban_last4: kTyp === "sepa" ? kLast4 : "",
      aktiv: true,
    });
    setBusy(false);
    if (res.error) return toast.error(res.error);
    setKanaele((k) => [...k, kBez.trim()]);
    setKBez("");
    setKLast4("");
  }

  async function kundeHinzufuegen() {
    const name = kundeInput.trim();
    if (!name) return;
    setBusy(true);
    const res = await createKunde({ name, farbe: KUNDE_FARBEN[kunden.length % KUNDE_FARBEN.length] });
    setBusy(false);
    if (res.error) return toast.error(res.error);
    setKunden((k) => [...k, name]);
    setKundeInput("");
  }

  function weiter() {
    setStep((s) => s + 1);
  }
  function zurueck() {
    setStep((s) => Math.max(1, s - 1));
  }

  // Sichtbare Schritt-Nummer (Kunden-Schritt ist Index 4 nur bei Agentur/Unternehmen)
  const sichtbar = step <= 3 ? step : zeigtKunden ? step : step + 1;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Schritt {Math.min(sichtbar, total)} von {total}
        </div>
        <button onClick={() => beenden("/app")} disabled={busy} className="text-sm text-muted-foreground hover:text-foreground">
          Überspringen
        </button>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${(Math.min(sichtbar, total) / total) * 100}%` }} />
      </div>

      {/* Schritt 1: Profil */}
      {step === 1 && (
        <div className="rounded-[20px] border bg-card p-6 shadow-soft sm:p-8">
          <h1 className="font-display text-2xl font-bold tracking-tight">
            Willkommen{vorname ? `, ${vorname}` : ""}.
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">In zwei Minuten ist dein Konto startklar. Was beschreibt dich am besten?</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {SEGMENTE.map((s) => {
              const aktiv = segment === s.id;
              return (
                <button key={s.id} onClick={() => setSegment(s.id)} className={cn("flex items-start gap-3 rounded-2xl border p-4 text-left transition-colors", aktiv ? "border-primary bg-primary/5" : "border-border hover:bg-accent")}>
                  <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl", aktiv ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary")}><s.icon className="size-5" /></span>
                  <span>
                    <span className="block font-medium">{s.label}</span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">{s.desc}</span>
                  </span>
                </button>
              );
            })}
          </div>
          <div className="mt-6 flex justify-end">
            <Button onClick={weiter} disabled={!segment} className="gap-2">Weiter <ArrowRight className="size-4" /></Button>
          </div>
        </div>
      )}

      {/* Schritt 2: Zahlungskanäle */}
      {step === 2 && (
        <div className="rounded-[20px] border bg-card p-6 shadow-soft sm:p-8">
          <div className="flex items-center gap-2">
            <CreditCard className="size-5 text-primary" />
            <h1 className="font-display text-2xl font-bold tracking-tight">Zahlungskanäle</h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">Lege deine Zahlungsmittel als Referenz an, ohne sensible Daten. Optional.</p>

          {kanaele.length > 0 && (
            <ul className="mt-4 space-y-2">
              {kanaele.map((k, i) => (
                <li key={i} className="flex items-center gap-2 rounded-xl border bg-background/60 px-3 py-2 text-sm">
                  <Check className="size-4 text-success" /> {k}
                </li>
              ))}
            </ul>
          )}

          <div className="mt-4 grid gap-3 rounded-2xl border bg-background/60 p-4 sm:grid-cols-[1fr_1.4fr_auto]">
            <div className="space-y-1.5">
              <Label className="text-xs">Typ</Label>
              <Select value={kTyp} onValueChange={(v) => setKTyp(v as KanalTyp)}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>{KANAL_TYPEN.map((t) => (<SelectItem key={t} value={t}>{KANAL_TYP_LABEL[t]}</SelectItem>))}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Bezeichnung</Label>
              <Input value={kBez} onChange={(e) => setKBez(e.target.value)} placeholder="z. B. Firmenkarte Visa" className="h-9" />
            </div>
            {(kTyp === "kreditkarte" || kTyp === "sepa") ? (
              <div className="space-y-1.5">
                <Label className="text-xs">Letzte 4</Label>
                <Input value={kLast4} onChange={(e) => setKLast4(e.target.value.replace(/\D/g, "").slice(0, 4))} inputMode="numeric" placeholder="4821" className="h-9 w-20 tabular-nums" />
              </div>
            ) : <div />}
          </div>
          <Button variant="outline" size="sm" className="mt-3 gap-1.5" onClick={kanalHinzufuegen} disabled={busy || !kBez.trim()}>
            {busy ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />} Kanal hinzufügen
          </Button>

          <div className="mt-6 flex items-center justify-between">
            <Button variant="ghost" onClick={zurueck} className="gap-2"><ArrowLeft className="size-4" /> Zurück</Button>
            <Button onClick={weiter} className="gap-2">Weiter <ArrowRight className="size-4" /></Button>
          </div>
        </div>
      )}

      {/* Schritt 3: Bestand */}
      {step === 3 && (
        <div className="rounded-[20px] border bg-card p-6 shadow-soft sm:p-8">
          <h1 className="font-display text-2xl font-bold tracking-tight">Deine Abos erfassen</h1>
          <p className="mt-1 text-sm text-muted-foreground">Am schnellsten geht es über den Kontoauszug. Du kannst auch später manuell anlegen.</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <button onClick={() => beenden("/app/abos/import")} disabled={busy} className="rounded-2xl border border-primary bg-primary/5 p-5 text-left transition hover:bg-primary/10">
              <span className="grid size-11 place-items-center rounded-xl bg-primary text-primary-foreground"><FileUp className="size-5" /></span>
              <div className="mt-3 font-display text-lg font-semibold">Kontoauszug importieren</div>
              <div className="mt-1 text-sm text-muted-foreground">CSV hochladen, wir erkennen die Abos automatisch.</div>
            </button>
            <button onClick={weiter} className="rounded-2xl border p-5 text-left transition hover:bg-accent">
              <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary"><Plus className="size-5" /></span>
              <div className="mt-3 font-display text-lg font-semibold">Später manuell</div>
              <div className="mt-1 text-sm text-muted-foreground">Überspringen und Abos einzeln im Tracker anlegen.</div>
            </button>
          </div>
          <div className="mt-6 flex items-center justify-between">
            <Button variant="ghost" onClick={zurueck} className="gap-2"><ArrowLeft className="size-4" /> Zurück</Button>
            <Button variant="ghost" onClick={weiter}>Weiter ohne Import</Button>
          </div>
        </div>
      )}

      {/* Schritt 4: Kunden (nur Agentur/Unternehmen) */}
      {step === 4 && zeigtKunden && (
        <div className="rounded-[20px] border bg-card p-6 shadow-soft sm:p-8">
          <div className="flex items-center gap-2">
            <Users className="size-5 text-primary" />
            <h1 className="font-display text-2xl font-bold tracking-tight">Deine Kunden</h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">Lege ein paar Kunden an, um Toolkosten später zuzuordnen. Optional.</p>

          {kunden.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {kunden.map((k, i) => (
                <span key={i} className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-sm font-medium text-secondary-foreground"><Check className="size-3.5 text-success" /> {k}</span>
              ))}
            </div>
          )}
          <div className="mt-4 flex gap-2">
            <Input value={kundeInput} onChange={(e) => setKundeInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); kundeHinzufuegen(); } }} placeholder="Kundenname" className="h-9" />
            <Button variant="outline" className="gap-1.5" onClick={kundeHinzufuegen} disabled={busy || !kundeInput.trim()}>
              {busy ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />} Hinzufügen
            </Button>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <Button variant="ghost" onClick={zurueck} className="gap-2"><ArrowLeft className="size-4" /> Zurück</Button>
            <Button onClick={weiter} className="gap-2">Weiter <ArrowRight className="size-4" /></Button>
          </div>
        </div>
      )}

      {/* Letzter Schritt: Fertig */}
      {((step === 4 && !zeigtKunden) || step === 5) && (
        <div className="rounded-[20px] border border-dashed bg-card p-10 text-center shadow-soft">
          <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary"><PartyPopper className="size-7" /></span>
          <h1 className="mt-4 font-display text-2xl font-bold tracking-tight">Alles startklar.</h1>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">Dein Konto ist eingerichtet. Auf dem Dashboard laufen Kosten, Fristen und Sparpotenzial zusammen.</p>
          <Button onClick={() => beenden("/app")} disabled={busy} className="mt-6 gap-2">
            {busy && <Loader2 className="size-4 animate-spin" />} Los geht&apos;s <ArrowRight className="size-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
