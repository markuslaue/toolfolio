"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2, Loader2, BellRing, BellOff } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  KATEGORIEN,
  KATEGORIE_FARBEN,
  INTERVALLE,
  INTERVALL_LABEL,
  STATUS_OPTIONEN,
  STATUS_LABEL,
  FRIST_EINHEITEN,
  WAEHRUNGEN,
  toolInitial,
  type Abo,
} from "@/lib/abos";
import { createAbo, updateAbo, deleteAbo, type AboInput } from "@/app/app/abos/actions";
import { minusFrist } from "@/lib/fristen";
import type { FristEinheit } from "@/lib/abos";

/** B-32: uebliche Kuendigungsfristen als Schnellauswahl. */
const FRIST_PRESETS: { label: string; wert: number; einheit: FristEinheit }[] = [
  { label: "14 Tage", wert: 14, einheit: "Tage" },
  { label: "1 Monat", wert: 1, einheit: "Monate" },
  { label: "3 Monate", wert: 3, einheit: "Monate" },
  { label: "6 Monate", wert: 6, einheit: "Monate" },
];

/** YYYY-MM-DD -> DD.MM.YYYY */
function deutschesDatum(iso: string): string {
  const [y, m, d] = iso.split("-");
  return d ? `${d}.${m}.${y}` : iso;
}

type FormData = {
  tool: string;
  anbieter: string;
  kategorie: string;
  mit_verzeichnis: boolean;
  betrag: string;
  waehrung: string;
  intervall: string;
  naechste_abbuchung: string;
  zahlungskanal: string;
  kunde: string;
  status: string;
  weiterverrechnen: boolean;
  aufschlag_prozent: string;
  abo_seit: string;
  auto_verlaengerung: boolean;
  frist_wert: string;
  frist_einheit: string;
  letzter_kuendigungstermin: string;
  erinnerung: boolean;
  trial_endet: string;
  notizen: string;
  konto_email: string;
  login_verweis: string;
};

function leer(): FormData {
  return {
    tool: "",
    anbieter: "",
    kategorie: "",
    mit_verzeichnis: true, // Standard an: siehe Erklaerung an der Checkbox.
    betrag: "",
    waehrung: "EUR",
    intervall: "monatlich",
    naechste_abbuchung: "",
    zahlungskanal: "",
    kunde: "",
    status: "aktiv",
    weiterverrechnen: false,
    aufschlag_prozent: "",
    abo_seit: "",
    auto_verlaengerung: true,
    frist_wert: "",
    frist_einheit: "Tage",
    letzter_kuendigungstermin: "",
    erinnerung: false,
    trial_endet: "",
    notizen: "",
    konto_email: "",
    login_verweis: "",
  };
}

function ausAbo(a: Abo): FormData {
  return {
    tool: a.tool,
    anbieter: a.anbieter ?? "",
    kategorie: a.kategorie,
    mit_verzeichnis: a.mit_verzeichnis,
    betrag: a.kosten.toString().replace(".", ","),
    waehrung: a.waehrung,
    intervall: a.intervall,
    naechste_abbuchung: a.naechste_abbuchung ?? "",
    zahlungskanal: a.zahlungskanal ?? "",
    kunde: a.kunde ?? "",
    status: a.status,
    weiterverrechnen: a.weiterverrechnen,
    aufschlag_prozent: a.aufschlag_prozent?.toString() ?? "",
    abo_seit: a.abo_seit ?? "",
    auto_verlaengerung: a.auto_verlaengerung,
    frist_wert: a.frist_wert?.toString() ?? "",
    frist_einheit: a.frist_einheit ?? "Tage",
    letzter_kuendigungstermin: a.letzter_kuendigungstermin ?? "",
    erinnerung: a.erinnerung,
    trial_endet: a.trial_endet ?? "",
    notizen: a.notizen ?? "",
    konto_email: a.konto_email ?? "",
    login_verweis: a.login_verweis ?? "",
  };
}

/** Deutsches Betragsformat in eine Dezimalzahl wandeln. */
function parseBetrag(s: string): number {
  const t = s.trim();
  if (!t) return NaN;
  // Mit Komma: deutsches Format (Punkte = Tausender, Komma = Dezimal).
  const norm = t.includes(",") ? t.replace(/\./g, "").replace(",", ".") : t;
  return Number(norm);
}

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

function Section({
  titel,
  children,
}: {
  titel: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4 rounded-[16px] border bg-card p-5">
      <h3 className="font-display text-sm font-semibold text-foreground">{titel}</h3>
      {children}
    </section>
  );
}

/** Vorbelegung fuer ein NEUES Abo, z. B. aus dem Verzeichnis heraus. */
export type AboVorbelegung = Partial<
  Pick<FormData, "tool" | "anbieter" | "kategorie" | "betrag" | "intervall" | "waehrung" | "mit_verzeichnis" | "notizen">
>;

export function AboFormPanel({
  open,
  onOpenChange,
  abo,
  vorbelegung,
  onSaved,
  onDeleted,
  kanalOptionen = [],
  kundenOptionen = [],
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  abo?: Abo | null;
  /** Startwerte fuer ein neues Abo. Wird ignoriert, wenn `abo` gesetzt ist. */
  vorbelegung?: AboVorbelegung;
  onSaved?: () => void;
  onDeleted?: () => void;
  kanalOptionen?: string[];
  kundenOptionen?: string[];
}) {
  const router = useRouter();
  const bearbeiten = !!abo;
  const [data, setData] = useState<FormData>(abo ? ausAbo(abo) : { ...leer(), ...vorbelegung });
  const [dirty, setDirty] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // B-32: Kuendigungsdeadline live vorschauen. Stichtag hat Vorrang, sonst
  // Verlaengerungstermin (naechste Abbuchung) minus Kuendigungsfrist.
  const deadlineVorschau: { deadline: string; verlaengerung: string | null } | null = (() => {
    if (data.letzter_kuendigungstermin) return { deadline: data.letzter_kuendigungstermin, verlaengerung: null };
    const wert = Number(data.frist_wert);
    if (!data.frist_wert || !isFinite(wert) || !data.naechste_abbuchung) return null;
    return {
      deadline: minusFrist(data.naechste_abbuchung, wert, data.frist_einheit as FristEinheit),
      verlaengerung: data.naechste_abbuchung,
    };
  })();

  function set<K extends keyof FormData>(key: K, value: FormData[K]) {
    setData((d) => ({ ...d, [key]: value }));
    setDirty(true);
  }

  function reset(next: FormData) {
    setData(next);
    setErrors({});
    setDirty(false);
  }

  function tryClose() {
    if (dirty) setConfirmClose(true);
    else onOpenChange(false);
  }

  function buildInput(): AboInput {
    return {
      tool: data.tool,
      anbieter: data.anbieter,
      initial: data.tool ? toolInitial(data.tool) : "",
      farbe: KATEGORIE_FARBEN[data.kategorie] ?? null,
      kategorie: data.kategorie,
      mit_verzeichnis: data.mit_verzeichnis,
      kosten: parseBetrag(data.betrag),
      waehrung: data.waehrung as AboInput["waehrung"],
      intervall: data.intervall as AboInput["intervall"],
      naechste_abbuchung: data.naechste_abbuchung,
      zahlungskanal: data.zahlungskanal,
      kunde: data.kunde,
      status: data.status as AboInput["status"],
      /* TAGS ENTFERNT (mit Markus, 2026-07-14).
         Sie wurden erfasst und angezeigt, sonst nichts: kein Filter, keine Auswertung,
         kein Bericht. Ein Feld, das nichts tut, kostet den Nutzer bei jedem Anlegen eine
         Entscheidung und gibt nichts zurueck. Bestehende Tags bleiben in der Datenbank
         unangetastet, sie werden nur nicht mehr abgefragt. */
      tags: [],
      weiterverrechnen: data.weiterverrechnen,
      aufschlag_prozent: data.aufschlag_prozent === "" ? null : Number(data.aufschlag_prozent),
      abo_seit: data.abo_seit,
      auto_verlaengerung: data.auto_verlaengerung,
      frist_wert: data.frist_wert === "" ? null : Number(data.frist_wert),
      frist_einheit: data.frist_einheit as AboInput["frist_einheit"],
      letzter_kuendigungstermin: data.letzter_kuendigungstermin,
      // Abgeleitet, nicht gefragt: eine eingetragene Frist IST der Wunsch, erinnert zu werden.
      erinnerung: data.frist_wert.trim() !== "",
      trial_endet: data.trial_endet,
      notizen: data.notizen,
      konto_email: data.konto_email,
      login_verweis: data.login_verweis,
    };
  }

  async function speichern() {
    setBusy(true);
    setErrors({});
    const input = buildInput();
    const res = bearbeiten ? await updateAbo(abo!.id, input) : await createAbo(input);
    setBusy(false);
    if (res.fieldErrors) setErrors(res.fieldErrors);
    if (res.error) {
      toast.error(res.error);
      return;
    }
    toast.success(bearbeiten ? "Abo gespeichert" : "Abo hinzugefügt");
    setDirty(false);
    onOpenChange(false);
    onSaved?.();
    router.refresh();
  }

  async function loeschen() {
    setBusy(true);
    const res = await deleteAbo(abo!.id);
    setBusy(false);
    setConfirmDelete(false);
    if (res.error) {
      toast.error(res.error);
      return;
    }
    toast.success("Abo gelöscht");
    setDirty(false);
    onOpenChange(false);
    if (onDeleted) onDeleted();
    else {
      onSaved?.();
      router.refresh();
    }
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(o) => {
        if (!o) tryClose();
        else onOpenChange(true);
      }}
    >
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 overflow-y-auto p-0 sm:max-w-xl"
        onPointerDownOutside={(e) => {
          if (dirty) e.preventDefault();
        }}
      >
        <SheetHeader className="border-b px-6 py-5">
          <SheetTitle className="font-display text-xl">
            {bearbeiten ? "Abo bearbeiten" : "Abo hinzufügen"}
          </SheetTitle>
          <SheetDescription>
            Erfasse Kosten, Intervall und Vertragsdetails. Pflichtfelder sind
            markiert.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-5 px-6 py-5">
          {/* Tool & Kategorie */}
          <Section titel="Tool">
            <Field label="Toolname" required error={errors.tool}>
              <Input
                value={data.tool}
                onChange={(e) => set("tool", e.target.value)}
                placeholder="z. B. Figma"
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Anbieter">
                <Input
                  value={data.anbieter}
                  onChange={(e) => set("anbieter", e.target.value)}
                  placeholder="z. B. Figma Inc."
                />
              </Field>
              <Field label="Kategorie" required error={errors.kategorie}>
                <Select value={data.kategorie} onValueChange={(v) => set("kategorie", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {KATEGORIEN.map((k) => (
                      <SelectItem key={k} value={k}>
                        {k}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>
            {/* Standardmaessig AN, aber abschaltbar.
                Was es wirklich tut, stand vorher nicht da ("verbindet das Abo spaeter mit
                dem Verzeichnis" erklaert nichts). Es geht um eine ANONYME Zaehlung: wie
                viele Toolfolio-Konten setzen dieses Tool ein. Erst ab fuenf Konten wird
                ueberhaupt eine Zahl gezeigt (NUTZER_SCHWELLE), darunter steht "zu wenig
                Daten". Der Toolname verlaesst dabei niemals die Aggregat-Ebene, und
                nichts davon ist einer Person zuzuordnen (Leitplanke 3).

                An zu sein ist richtig, weil genau diese Zahl den Wert des Verzeichnisses
                ausmacht. Abschaltbar zu sein ist Pflicht, weil es die Daten des Nutzers
                sind und nicht unsere. */}
            <div className="flex items-center justify-between rounded-xl border bg-background/60 px-4 py-3">
              <div className="text-sm">
                <div className="font-medium">Anonym zur Verbreitung beitragen</div>
                <div className="text-xs text-muted-foreground">
                  Zählt mit, wie viele Toolfolio-Konten dieses Tool einsetzen. Die Zahl erscheint im Verzeichnis erst
                  ab fünf Konten, und sie ist niemandem zuzuordnen. Dein Name, dein Preis und dein Kunde bleiben
                  privat.
                </div>
              </div>
              <Switch
                checked={data.mit_verzeichnis}
                onCheckedChange={(v) => set("mit_verzeichnis", v)}
              />
            </div>
          </Section>

          {/* Kosten */}
          <Section titel="Kosten">
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Betrag" required error={errors.kosten}>
                <Input
                  value={data.betrag}
                  onChange={(e) => set("betrag", e.target.value)}
                  inputMode="decimal"
                  placeholder="0,00"
                  className="tabular-nums"
                />
              </Field>
              <Field label="Währung">
                <Select value={data.waehrung} onValueChange={(v) => set("waehrung", v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {WAEHRUNGEN.map((w) => (
                      <SelectItem key={w} value={w}>
                        {w}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Intervall" required error={errors.intervall}>
                <Select value={data.intervall} onValueChange={(v) => set("intervall", v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {INTERVALLE.map((i) => (
                      <SelectItem key={i} value={i}>
                        {INTERVALL_LABEL[i]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>
          </Section>

          {/* Abbuchung & Zuordnung */}
          <Section titel="Abbuchung & Zuordnung">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nächste Abbuchung">
                <Input
                  type="date"
                  value={data.naechste_abbuchung}
                  onChange={(e) => set("naechste_abbuchung", e.target.value)}
                />
              </Field>
              <Field label="Zahlungskanal">
                <Input
                  value={data.zahlungskanal}
                  onChange={(e) => set("zahlungskanal", e.target.value)}
                  placeholder="z. B. Visa •••• 4821"
                  list="kanal-optionen"
                />
                <datalist id="kanal-optionen">
                  {kanalOptionen.map((k) => (
                    <option key={k} value={k} />
                  ))}
                </datalist>
              </Field>
              <Field label="Kunde">
                <Input
                  value={data.kunde}
                  onChange={(e) => set("kunde", e.target.value)}
                  placeholder="Intern / nicht zugeordnet"
                  list="kunde-optionen"
                />
                <datalist id="kunde-optionen">
                  {kundenOptionen.map((k) => (
                    <option key={k} value={k} />
                  ))}
                </datalist>
              </Field>
              <Field label="Status">
                <Select value={data.status} onValueChange={(v) => set("status", v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONEN.map((s) => (
                      <SelectItem key={s} value={s}>
                        {STATUS_LABEL[s]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>
          </Section>

          {/* Weiterverrechnung */}
          <Section titel="Weiterverrechnung">
            <div className="flex items-center justify-between">
              <div className="text-sm">
                <div className="font-medium">An Kunde weiterverrechnen</div>
                <div className="text-xs text-muted-foreground">
                  Optionaler Aufschlag auf die Kosten.
                </div>
              </div>
              <Switch
                checked={data.weiterverrechnen}
                onCheckedChange={(v) => set("weiterverrechnen", v)}
              />
            </div>
            {data.weiterverrechnen && (
              <Field label="Aufschlag in Prozent">
                <Input
                  value={data.aufschlag_prozent}
                  onChange={(e) => set("aufschlag_prozent", e.target.value)}
                  inputMode="decimal"
                  placeholder="z. B. 15"
                  className="max-w-[160px] tabular-nums"
                />
              </Field>
            )}
          </Section>

          {/* Vertrag & Frist */}
          <Section titel="Vertrag & Frist">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Abo seit">
                <Input
                  type="date"
                  value={data.abo_seit}
                  onChange={(e) => set("abo_seit", e.target.value)}
                />
              </Field>
              <Field label="Trial endet am">
                <Input
                  type="date"
                  value={data.trial_endet}
                  onChange={(e) => set("trial_endet", e.target.value)}
                />
              </Field>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">Verlängert sich automatisch</div>
              <Switch
                checked={data.auto_verlaengerung}
                onCheckedChange={(v) => set("auto_verlaengerung", v)}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Kündigungsfrist (vor Verlängerung)">
                <div className="flex gap-2">
                  <Input
                    value={data.frist_wert}
                    onChange={(e) => set("frist_wert", e.target.value.replace(/\D/g, ""))}
                    inputMode="numeric"
                    placeholder="3"
                    className="w-20 tabular-nums"
                  />
                  <Select
                    value={data.frist_einheit}
                    onValueChange={(v) => set("frist_einheit", v)}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FRIST_EINHEITEN.map((e) => (
                        <SelectItem key={e} value={e}>
                          {e}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {FRIST_PRESETS.map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => { set("frist_wert", String(p.wert)); set("frist_einheit", p.einheit); }}
                      className="rounded-full border border-border bg-background px-2.5 py-1 text-xs font-medium hover:bg-accent"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="Abweichender Stichtag (optional)">
                <Input
                  type="date"
                  value={data.letzter_kuendigungstermin}
                  onChange={(e) => set("letzter_kuendigungstermin", e.target.value)}
                />
                <div className="mt-1 text-xs text-muted-foreground">
                  Nur nötig, wenn der Vertrag einen festen Termin vorgibt. Er hat dann Vorrang vor der Frist.
                </div>
              </Field>
            </div>

            {deadlineVorschau && (
              <div className="rounded-xl border border-primary/25 bg-primary/5 p-3 text-sm">
                <div className="font-medium">
                  Kündigen bis <span className="tabular-nums">{deutschesDatum(deadlineVorschau.deadline)}</span>
                </div>
                {deadlineVorschau.verlaengerung && (
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    {data.auto_verlaengerung ? "Verlängert sich automatisch am" : "Nächste Periode beginnt am"}{" "}
                    <span className="tabular-nums">{deutschesDatum(deadlineVorschau.verlaengerung)}</span>. Wir erinnern dich rechtzeitig vorher per E-Mail.
                  </div>
                )}
              </div>
            )}
            {/* FRUEHER STAND HIER EIN SCHALTER "Vor Frist erinnern".
                Das war Unsinn: Wer oben eine Kuendigungsfrist eintraegt, will offensichtlich
                daran erinnert werden. Sonst haette er sie nicht eingetragen. Ein zweites
                Haekchen dafuer ist eine Falle, die genau einmal zuschnappt, naemlich dann,
                wenn die Frist verstreicht.

                Der Fristen-Waechter folgt jetzt der Frist: Frist gesetzt = Waechter an. */}
            {data.frist_wert.trim() !== "" ? (
              <div className="flex items-start gap-2 rounded-xl bg-success/10 p-3 text-sm">
                <BellRing className="mt-0.5 size-4 shrink-0 text-success" />
                <div>
                  <div className="font-medium">Der Fristen-Wächter ist für dieses Abo aktiv.</div>
                  <div className="text-xs text-muted-foreground">
                    Du bekommst rechtzeitig vor dem letzten Kündigungstermin eine E-Mail. Wenn du die Frist oben
                    leerst, hört er auf.
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-2 rounded-xl bg-muted/50 p-3 text-sm text-muted-foreground">
                <BellOff className="mt-0.5 size-4 shrink-0" />
                <div>
                  Ohne Kündigungsfrist kann der Fristen-Wächter nichts überwachen. Trag oben eine Frist ein, dann
                  meldet er sich rechtzeitig.
                </div>
              </div>
            )}
          </Section>

          {/* Notizen */}
          <Section titel="Notizen & Zugang">
            <Field label="Notiz">
              <Textarea
                value={data.notizen}
                onChange={(e) => set("notizen", e.target.value)}
                rows={3}
                placeholder="Interner Hinweis zu diesem Abo"
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Konto-E-Mail">
                <Input
                  value={data.konto_email}
                  onChange={(e) => set("konto_email", e.target.value)}
                  placeholder="rechnung@agentur.de"
                />
              </Field>
              <Field label="Login-Verweis">
                <Input
                  value={data.login_verweis}
                  onChange={(e) => set("login_verweis", e.target.value)}
                  placeholder="z. B. Passwortmanager-Eintrag"
                />
              </Field>
            </div>
          </Section>
        </div>

        {/* Aktionen */}
        <div className="sticky bottom-0 flex items-center justify-between gap-2 border-t bg-card px-6 py-4">
          {bearbeiten ? (
            <Button
              type="button"
              variant="outline"
              className="gap-2 text-destructive hover:text-destructive"
              onClick={() => setConfirmDelete(true)}
              disabled={busy}
            >
              <Trash2 className="size-4" /> Löschen
            </Button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={tryClose} disabled={busy}>
              Abbrechen
            </Button>
            <Button type="button" onClick={speichern} disabled={busy}>
              {busy && <Loader2 className="size-4 animate-spin" />}
              {bearbeiten ? "Speichern" : "Abo hinzufügen"}
            </Button>
          </div>
        </div>
      </SheetContent>

      {/* Schliessen mit ungespeicherten Aenderungen */}
      <AlertDialog open={confirmClose} onOpenChange={setConfirmClose}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Änderungen verwerfen?</AlertDialogTitle>
            <AlertDialogDescription>
              Du hast ungespeicherte Änderungen. Möchtest du das Formular wirklich
              schließen?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Weiter bearbeiten</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                reset(abo ? ausAbo(abo) : leer());
                onOpenChange(false);
              }}
            >
              Verwerfen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Loeschen bestaetigen */}
      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Abo löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Das Abo wird dauerhaft entfernt. Diese Aktion kann nicht rückgängig
              gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={loeschen}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Endgültig löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Sheet>
  );
}
