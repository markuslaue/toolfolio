"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2, Loader2, Tag as TagIcon, X } from "lucide-react";
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
  tags: string[];
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
    mit_verzeichnis: false,
    betrag: "",
    waehrung: "EUR",
    intervall: "monatlich",
    naechste_abbuchung: "",
    zahlungskanal: "",
    kunde: "",
    status: "aktiv",
    tags: [],
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
    tags: a.tags ?? [],
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

export function AboFormPanel({
  open,
  onOpenChange,
  abo,
  onSaved,
  onDeleted,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  abo?: Abo | null;
  onSaved?: () => void;
  onDeleted?: () => void;
}) {
  const router = useRouter();
  const bearbeiten = !!abo;
  const [data, setData] = useState<FormData>(abo ? ausAbo(abo) : leer());
  const [dirty, setDirty] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [tagInput, setTagInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  function set<K extends keyof FormData>(key: K, value: FormData[K]) {
    setData((d) => ({ ...d, [key]: value }));
    setDirty(true);
  }

  function addTag(raw: string) {
    const v = raw.trim();
    if (!v || data.tags.includes(v)) return;
    set("tags", [...data.tags, v]);
    setTagInput("");
  }

  function reset(next: FormData) {
    setData(next);
    setErrors({});
    setTagInput("");
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
      tags: data.tags,
      weiterverrechnen: data.weiterverrechnen,
      aufschlag_prozent: data.aufschlag_prozent === "" ? null : Number(data.aufschlag_prozent),
      abo_seit: data.abo_seit,
      auto_verlaengerung: data.auto_verlaengerung,
      frist_wert: data.frist_wert === "" ? null : Number(data.frist_wert),
      frist_einheit: data.frist_einheit as AboInput["frist_einheit"],
      letzter_kuendigungstermin: data.letzter_kuendigungstermin,
      erinnerung: data.erinnerung,
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
            <div className="flex items-center justify-between rounded-xl border bg-background/60 px-4 py-3">
              <div className="text-sm">
                <div className="font-medium">Mit Verzeichnis verknüpfen</div>
                <div className="text-xs text-muted-foreground">
                  Verbindet das Abo später mit dem öffentlichen Tool-Verzeichnis.
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
                />
              </Field>
              <Field label="Kunde">
                <Input
                  value={data.kunde}
                  onChange={(e) => set("kunde", e.target.value)}
                  placeholder="Intern / nicht zugeordnet"
                />
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
            <Field label="Tags">
              <div className="flex flex-wrap items-center gap-2 rounded-md border border-input bg-transparent px-3 py-2">
                {data.tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground"
                  >
                    <TagIcon className="size-3" />
                    {t}
                    <button
                      type="button"
                      onClick={() => set("tags", data.tags.filter((x) => x !== t))}
                      aria-label={`${t} entfernen`}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="size-3" />
                    </button>
                  </span>
                ))}
                <input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag(tagInput);
                    } else if (e.key === "Backspace" && !tagInput && data.tags.length) {
                      set("tags", data.tags.slice(0, -1));
                    }
                  }}
                  placeholder={data.tags.length ? "" : "Tag eingeben und Enter drücken"}
                  className="min-w-[8rem] flex-1 bg-transparent text-sm outline-none"
                />
              </div>
            </Field>
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
              <Field label="Kündigungsfrist">
                <div className="flex gap-2">
                  <Input
                    value={data.frist_wert}
                    onChange={(e) => set("frist_wert", e.target.value.replace(/\D/g, ""))}
                    inputMode="numeric"
                    placeholder="14"
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
              </Field>
              <Field label="Letzter Kündigungstermin">
                <Input
                  type="date"
                  value={data.letzter_kuendigungstermin}
                  onChange={(e) => set("letzter_kuendigungstermin", e.target.value)}
                />
              </Field>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-sm">
                <div className="font-medium">Vor Frist erinnern</div>
                <div className="text-xs text-muted-foreground">
                  Grundlage für den Fristen-Wächter (folgt).
                </div>
              </div>
              <Switch
                checked={data.erinnerung}
                onCheckedChange={(v) => set("erinnerung", v)}
              />
            </div>
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
