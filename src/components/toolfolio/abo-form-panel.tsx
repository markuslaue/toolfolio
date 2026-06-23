import { useEffect, useMemo, useState } from "react";
import {
  X,
  Search,
  Check,
  Plus,
  Sparkles,
  CreditCard as CardIcon,
  Tag as TagIcon,
  Archive,
  Trash2,
  ShieldCheck,
  AlertCircle,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { cn } from "@/lib/utils";
import { fmtEUR } from "@/lib/toolfolio-data";
import {
  kategorien,
  kunden,
  kanaele,
  intervalle,
  kategorieFarben,
} from "@/lib/abos-data";

/* ------------------- Mock-Verzeichnis ------------------- */

interface KatalogTool {
  name: string;
  anbieter: string;
  initial: string;
  farbe: string;
  kategorie: string;
  tarife?: { label: string; betrag: number; intervall: "monatlich" | "jährlich"; spar?: string }[];
}

const katalog: KatalogTool[] = [
  { name: "Notion", anbieter: "Notion Labs", initial: "N", farbe: "#0F1419", kategorie: "Produktivität", tarife: [{ label: "Plus monatlich", betrag: 9.5, intervall: "monatlich" }, { label: "Plus jährlich", betrag: 96, intervall: "jährlich", spar: "spart 16%" }] },
  { name: "Slack", anbieter: "Slack Technologies", initial: "S", farbe: "#611f69", kategorie: "Kommunikation", tarife: [{ label: "Pro monatlich", betrag: 7.25, intervall: "monatlich" }, { label: "Pro jährlich", betrag: 78, intervall: "jährlich", spar: "spart 10%" }] },
  { name: "Figma", anbieter: "Figma Inc.", initial: "F", farbe: "#a259ff", kategorie: "Design", tarife: [{ label: "Professional monatlich", betrag: 15, intervall: "monatlich" }, { label: "Professional jährlich", betrag: 144, intervall: "jährlich", spar: "spart 20%" }] },
  { name: "Adobe Creative Cloud", anbieter: "Adobe", initial: "A", farbe: "#d83b01", kategorie: "Design" },
  { name: "Ahrefs", anbieter: "Ahrefs Pte.", initial: "A", farbe: "#0e7ec6", kategorie: "SEO" },
  { name: "Screaming Frog", anbieter: "Screaming Frog Ltd.", initial: "S", farbe: "#0EA371", kategorie: "SEO" },
  { name: "Lovable", anbieter: "Lovable", initial: "L", farbe: "#3A57E8", kategorie: "Entwicklung" },
  { name: "Anthropic API", anbieter: "Anthropic", initial: "C", farbe: "#cc785c", kategorie: "KI / API" },
  { name: "OpenAI", anbieter: "OpenAI", initial: "O", farbe: "#10a37f", kategorie: "KI / API" },
  { name: "Shopify", anbieter: "Shopify", initial: "S", farbe: "#95bf47", kategorie: "eCommerce" },
  { name: "Make", anbieter: "Celonis", initial: "M", farbe: "#6d00cc", kategorie: "Produktivität" },
  { name: "ElevenLabs", anbieter: "ElevenLabs", initial: "E", farbe: "#0F1419", kategorie: "KI / API" },
  { name: "Framer", anbieter: "Framer B.V.", initial: "F", farbe: "#0099ff", kategorie: "Design" },
  { name: "Loom", anbieter: "Atlassian", initial: "L", farbe: "#625df5", kategorie: "Kommunikation" },
  { name: "Google Workspace", anbieter: "Google", initial: "G", farbe: "#4285f4", kategorie: "Produktivität" },
  { name: "Linear", anbieter: "Linear", initial: "L", farbe: "#5e6ad2", kategorie: "Entwicklung" },
  { name: "Vercel", anbieter: "Vercel", initial: "V", farbe: "#0F1419", kategorie: "Entwicklung" },
  { name: "Canva", anbieter: "Canva", initial: "C", farbe: "#00c4cc", kategorie: "Design" },
  {
    name: "Calendly",
    anbieter: "Calendly LLC",
    initial: "C",
    farbe: "#006BFF",
    kategorie: "Produktivität",
    tarife: [
      { label: "Standard monatlich", betrag: 16, intervall: "monatlich" },
      { label: "Standard jährlich", betrag: 144, intervall: "jährlich", spar: "spart 25%" },
    ],
  },
  { name: "Cal.com", anbieter: "Cal.com Inc.", initial: "C", farbe: "#111111", kategorie: "Produktivität" },
];

/* ------------------- Typen ------------------- */

export type FormMode = "anlegen" | "bearbeiten";

export interface AboFormInitial {
  tool: string;
  anbieter?: string;
  initial?: string;
  farbe?: string;
  kategorie: string;
  kosten: number;
  waehrung?: "EUR" | "USD";
  intervall: "monatlich" | "quartalsweise" | "jährlich";
  naechsteAbbuchung?: string;
  zahlungskanal: string;
  kunde: string;
  status?: "aktiv" | "Trial" | "pausiert";
  weiterverrechnen?: boolean;
  aufschlagProzent?: number;
  trialEndet?: string;
  tags?: string[];
  aboSeit?: string;
  autoVerlaengerung?: boolean;
  fristWert?: number;
  fristEinheit?: "Tage" | "Wochen" | "Monate";
  letzterKuendigungstermin?: string;
  erinnerung?: boolean;
  notizen?: string;
  kontoEmail?: string;
  loginVerweis?: string;
  mitVerzeichnis?: boolean;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: FormMode;
  initial?: AboFormInitial;
}

const beispielCalendly: AboFormInitial = {
  tool: "Calendly",
  anbieter: "Calendly LLC",
  initial: "C",
  farbe: "#006BFF",
  kategorie: "Produktivität",
  kosten: 16,
  waehrung: "USD",
  intervall: "monatlich",
  naechsteAbbuchung: "2026-07-18",
  zahlungskanal: "Visa •••• 4821",
  kunde: "Kunde Kessler",
  status: "aktiv",
  weiterverrechnen: true,
  aufschlagProzent: 15,
  tags: ["Kundentermine", "extern sichtbar"],
  aboSeit: "2024-08-14",
  autoVerlaengerung: true,
  fristWert: 14,
  fristEinheit: "Tage",
  letzterKuendigungstermin: "2026-08-14",
  erinnerung: true,
  notizen: "Wird für Erstgespräche mit Kessler-Leads genutzt.",
  kontoEmail: "termine@toolfolio.de",
  loginVerweis: "liegt in 1Password",
  mitVerzeichnis: true,
};

const leer: AboFormInitial = {
  tool: "",
  kategorie: "",
  kosten: 0,
  waehrung: "EUR",
  intervall: "monatlich",
  zahlungskanal: "",
  kunde: "Intern / nicht zugeordnet",
  status: "aktiv",
  weiterverrechnen: false,
  aufschlagProzent: 10,
  tags: [],
  autoVerlaengerung: true,
  fristEinheit: "Tage",
  fristWert: 14,
  erinnerung: true,
  mitVerzeichnis: false,
};

/* ------------------- Komponente ------------------- */

export function AboFormPanel({ open, onOpenChange, mode, initial }: Props) {
  const startwerte = useMemo<AboFormInitial>(() => {
    if (initial) return initial;
    return mode === "bearbeiten" ? beispielCalendly : leer;
  }, [initial, mode]);

  const [data, setData] = useState<AboFormInitial>(startwerte);
  const [dirty, setDirty] = useState(false);
  const [search, setSearch] = useState("");
  const [showSuggest, setShowSuggest] = useState(false);
  const [manualOpen, setManualOpen] = useState(false);
  const [neuerKanal, setNeuerKanal] = useState<{ open: boolean; bez: string; last4: string }>({ open: false, bez: "Visa", last4: "" });
  const [tagInput, setTagInput] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmClose, setConfirmClose] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [zusatzKanaele, setZusatzKanaele] = useState<string[]>([]);

  // Reset on open / mode change
  useEffect(() => {
    if (open) {
      setData(startwerte);
      setDirty(false);
      setSearch("");
      setShowSuggest(false);
      setManualOpen(false);
      setTagInput("");
      setErrors({});
    }
  }, [open, startwerte]);

  const set = <K extends keyof AboFormInitial>(key: K, value: AboFormInitial[K]) => {
    setData((d) => ({ ...d, [key]: value }));
    setDirty(true);
  };

  const allKanaele = [...kanaele, ...zusatzKanaele];

  const treffer = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.toLowerCase();
    return katalog.filter((t) => t.name.toLowerCase().includes(q) || t.kategorie.toLowerCase().includes(q)).slice(0, 6);
  }, [search]);

  const aktuellesKatalogTool = useMemo(
    () => (data.mitVerzeichnis ? katalog.find((t) => t.name === data.tool) : undefined),
    [data.mitVerzeichnis, data.tool],
  );

  const waehleTool = (t: KatalogTool) => {
    setData((d) => ({
      ...d,
      tool: t.name,
      anbieter: t.anbieter,
      initial: t.initial,
      farbe: t.farbe,
      kategorie: t.kategorie,
      mitVerzeichnis: true,
    }));
    setDirty(true);
    setSearch("");
    setShowSuggest(false);
    setManualOpen(false);
  };

  const entferneTool = () => {
    setData((d) => ({ ...d, tool: "", anbieter: undefined, initial: undefined, farbe: undefined, mitVerzeichnis: false }));
    setDirty(true);
  };

  const uebernimmTarif = (t: NonNullable<KatalogTool["tarife"]>[number]) => {
    setData((d) => ({ ...d, kosten: t.betrag, intervall: t.intervall, waehrung: "EUR" }));
    setDirty(true);
  };

  const addTag = () => {
    const v = tagInput.trim();
    if (!v) return;
    if ((data.tags ?? []).includes(v)) {
      setTagInput("");
      return;
    }
    set("tags", [...(data.tags ?? []), v]);
    setTagInput("");
  };

  const removeTag = (t: string) => set("tags", (data.tags ?? []).filter((x) => x !== t));

  // letzter Kündigungstermin (berechnete Vorschau)
  const letzterTermin = useMemo(() => {
    if (data.letzterKuendigungstermin) return data.letzterKuendigungstermin;
    if (!data.naechsteAbbuchung || !data.fristWert) return undefined;
    const base = new Date(data.naechsteAbbuchung);
    if (Number.isNaN(base.getTime())) return undefined;
    const d = new Date(base);
    if (data.fristEinheit === "Tage") d.setDate(d.getDate() - data.fristWert);
    if (data.fristEinheit === "Wochen") d.setDate(d.getDate() - data.fristWert * 7);
    if (data.fristEinheit === "Monate") d.setMonth(d.getMonth() - data.fristWert);
    return d.toISOString().slice(0, 10);
  }, [data.naechsteAbbuchung, data.fristWert, data.fristEinheit, data.letzterKuendigungstermin]);

  const fmtDateDe = (iso?: string) => {
    if (!iso) return "—";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  const tryClose = () => {
    if (dirty) setConfirmClose(true);
    else onOpenChange(false);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!data.tool.trim()) e.tool = "Bitte ein Tool auswählen oder manuell anlegen.";
    if (!data.kosten || data.kosten <= 0) e.kosten = "Bitte einen Betrag größer 0 angeben.";
    if (!data.intervall) e.intervall = "Bitte ein Intervall wählen.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const speichern = (weiteres = false) => {
    if (!validate()) return;
    toast.success(mode === "bearbeiten" ? "Abo gespeichert" : "Abo hinzugefügt", {
      description: `${data.tool} · ${fmtEUR(data.kosten)} ${data.intervall}`,
    });
    if (weiteres) {
      setData(leer);
      setDirty(false);
      setSearch("");
    } else {
      onOpenChange(false);
    }
  };

  return (
    <>
      <Sheet
        open={open}
        onOpenChange={(o) => {
          if (!o) tryClose();
          else onOpenChange(true);
        }}
      >
        <SheetContent
          side="right"
          className={cn(
            "p-0 flex flex-col gap-0 w-full sm:max-w-[560px] sm:rounded-l-3xl border-l border-border/60",
            "data-[state=open]:duration-300 data-[state=closed]:duration-200",
          )}
          onInteractOutside={(e) => {
            if (dirty) {
              e.preventDefault();
              setConfirmClose(true);
            }
          }}
          onEscapeKeyDown={(e) => {
            if (dirty) {
              e.preventDefault();
              setConfirmClose(true);
            }
          }}
        >
          <VisuallyHidden>
            <SheetTitle>{mode === "bearbeiten" ? "Abo bearbeiten" : "Abo hinzufügen"}</SheetTitle>
            <SheetDescription>Formular zum Anlegen und Bearbeiten eines Abos.</SheetDescription>
          </VisuallyHidden>

          {/* Sticky Kopf */}
          <header className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-border/60 bg-card/95 backdrop-blur px-5 sm:px-6 py-4">
            <div>
              <h2 className="font-display text-xl sm:text-2xl font-semibold tracking-tight">
                {mode === "bearbeiten" ? "Abo bearbeiten" : "Abo hinzufügen"}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {mode === "bearbeiten" ? "Änderungen werden direkt übernommen." : "Suche dein Tool im Verzeichnis oder lege es manuell an."}
              </p>
            </div>
            <button
              onClick={tryClose}
              className="inline-flex size-9 items-center justify-center rounded-xl text-muted-foreground hover:bg-secondary hover:text-foreground transition"
              aria-label="Schließen"
            >
              <X className="size-5" />
            </button>
          </header>

          {/* Scrollbarer Körper */}
          <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-5 space-y-6">
            {/* 1: Tool wählen */}
            <Section title="Tool wählen" hint="Aus dem Verzeichnis oder manuell">
              {!data.tool && !manualOpen && (
                <div className="relative">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      autoFocus={mode === "anlegen"}
                      value={search}
                      onChange={(e) => {
                        setSearch(e.target.value);
                        setShowSuggest(true);
                      }}
                      onFocus={() => setShowSuggest(true)}
                      placeholder="Tool suchen, z. B. Calendly"
                      className="pl-9 rounded-xl h-11 bg-background"
                    />
                  </div>
                  {showSuggest && treffer.length > 0 && (
                    <div className="absolute z-20 mt-1 w-full rounded-xl border border-border/70 bg-popover shadow-lg overflow-hidden">
                      {treffer.map((t) => (
                        <button
                          key={t.name}
                          onClick={() => waehleTool(t)}
                          className="flex items-center gap-3 w-full px-3 py-2.5 text-left hover:bg-secondary/70 transition"
                        >
                          <span
                            className="inline-flex size-8 items-center justify-center rounded-lg text-white text-sm font-semibold"
                            style={{ background: t.farbe }}
                          >
                            {t.initial}
                          </span>
                          <span className="flex-1">
                            <span className="block text-sm font-medium">{t.name}</span>
                            <span className="block text-xs text-muted-foreground">{t.anbieter} · {t.kategorie}</span>
                          </span>
                          <span
                            className="text-[10px] px-2 py-0.5 rounded-full"
                            style={{ background: kategorieFarben[t.kategorie as keyof typeof kategorieFarben] + "22", color: kategorieFarben[t.kategorie as keyof typeof kategorieFarben] }}
                          >
                            {t.kategorie}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                  {errors.tool && (
                    <p className="mt-1.5 text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="size-3" /> {errors.tool}
                    </p>
                  )}
                </div>
              )}

              {data.tool && !manualOpen && (
                <div className="flex items-start gap-3 rounded-2xl border border-border/60 bg-secondary/40 p-3.5">
                  <span
                    className="inline-flex size-11 items-center justify-center rounded-xl text-white text-base font-semibold"
                    style={{ background: data.farbe ?? "#6C5CE7" }}
                  >
                    {data.initial ?? data.tool.charAt(0).toUpperCase()}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">{data.tool}</div>
                    <div className="text-xs text-muted-foreground">{data.anbieter ?? "Manuell angelegt"}</div>
                    <div className="mt-2 flex items-center gap-2 flex-wrap">
                      <span
                        className="text-[11px] px-2 py-0.5 rounded-full font-medium"
                        style={{
                          background: (kategorieFarben[data.kategorie as keyof typeof kategorieFarben] ?? "#6C5CE7") + "22",
                          color: kategorieFarben[data.kategorie as keyof typeof kategorieFarben] ?? "#6C5CE7",
                        }}
                      >
                        {data.kategorie || "Ohne Kategorie"}
                      </span>
                      {data.mitVerzeichnis ? (
                        <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                          <ShieldCheck className="size-3" /> mit Verzeichnis verknüpft
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
                          ohne Verknüpfung
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 text-xs">
                    <button
                      onClick={() => {
                        entferneTool();
                        setManualOpen(false);
                        setShowSuggest(true);
                      }}
                      className="text-primary hover:underline"
                    >
                      ändern
                    </button>
                    <button onClick={entferneTool} className="text-muted-foreground hover:text-destructive">
                      entfernen
                    </button>
                  </div>
                </div>
              )}

              {!data.tool && !manualOpen && (
                <button
                  onClick={() => {
                    setManualOpen(true);
                    setShowSuggest(false);
                  }}
                  className="mt-2 text-xs text-primary hover:underline"
                >
                  Tool nicht gefunden? Manuell anlegen.
                </button>
              )}

              {manualOpen && (
                <div className="space-y-3 rounded-2xl border border-dashed border-border/70 bg-background p-4">
                  <div className="grid sm:grid-cols-2 gap-3">
                    <Field label="Toolname" required>
                      <Input
                        value={data.tool}
                        onChange={(e) => set("tool", e.target.value)}
                        placeholder="z. B. Mein Tool"
                        className="rounded-xl"
                      />
                    </Field>
                    <Field label="Anbieter">
                      <Input
                        value={data.anbieter ?? ""}
                        onChange={(e) => set("anbieter", e.target.value)}
                        placeholder="optional"
                        className="rounded-xl"
                      />
                    </Field>
                  </div>
                  <Field label="Kategorie" required>
                    <Select value={data.kategorie} onValueChange={(v) => set("kategorie", v)}>
                      <SelectTrigger className="rounded-xl"><SelectValue placeholder="Kategorie wählen" /></SelectTrigger>
                      <SelectContent>
                        {kategorien.map((k) => (
                          <SelectItem key={k} value={k}>{k}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Info className="size-3.5" />
                    Ohne Verknüpfung stehen Benchmark und Alternativen später nicht zur Verfügung.
                  </div>
                  <div className="flex justify-between">
                    <button
                      onClick={() => {
                        setManualOpen(false);
                      }}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      Zurück zur Suche
                    </button>
                  </div>
                </div>
              )}
            </Section>

            {/* 2: Kosten & Abrechnung */}
            <Section title="Kosten & Abrechnung">
              <div className="grid grid-cols-[1fr_110px] gap-3">
                <Field label="Betrag" required error={errors.kosten}>
                  <Input
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    value={data.kosten || ""}
                    onChange={(e) => set("kosten", parseFloat(e.target.value) || 0)}
                    placeholder="0,00"
                    className="rounded-xl tabular"
                  />
                </Field>
                <Field label="Währung">
                  <Select value={data.waehrung ?? "EUR"} onValueChange={(v) => set("waehrung", v as "EUR" | "USD")}>
                    <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                      <SelectItem value="CHF">CHF</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </div>

              <Field label="Intervall" required>
                <div className="inline-flex rounded-xl border border-border bg-background p-1 w-full">
                  {intervalle.map((i) => (
                    <button
                      key={i}
                      onClick={() => set("intervall", i)}
                      className={cn(
                        "flex-1 px-3 py-1.5 rounded-lg text-sm font-medium transition capitalize",
                        data.intervall === i ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {i}
                    </button>
                  ))}
                </div>
              </Field>

              {aktuellesKatalogTool?.tarife && aktuellesKatalogTool.tarife.length > 0 && (
                <div className="rounded-2xl border border-border/60 bg-secondary/30 p-3">
                  <div className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                    <Sparkles className="size-3.5 text-primary" /> Bekannte Tarife für {aktuellesKatalogTool.name}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {aktuellesKatalogTool.tarife.map((t) => (
                      <button
                        key={t.label}
                        onClick={() => uebernimmTarif(t)}
                        className="group inline-flex items-center gap-2 rounded-xl border border-border/60 bg-card px-3 py-1.5 text-xs hover:border-primary/40 hover:bg-primary/5 transition"
                      >
                        <span className="font-medium">{t.label}</span>
                        <span className="tabular text-muted-foreground">{fmtEUR(t.betrag)}</span>
                        {t.spar && <span className="text-[10px] text-emerald-600 font-medium">{t.spar}</span>}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <Field label="Nächste Abbuchung">
                <Input
                  type="date"
                  value={data.naechsteAbbuchung ?? ""}
                  onChange={(e) => set("naechsteAbbuchung", e.target.value)}
                  className="rounded-xl"
                />
              </Field>

              <Field label="Zahlungskanal">
                <div className="space-y-2">
                  <Select value={data.zahlungskanal} onValueChange={(v) => set("zahlungskanal", v)}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Kanal wählen" />
                    </SelectTrigger>
                    <SelectContent>
                      {allKanaele.map((k) => (
                        <SelectItem key={k} value={k}>
                          <span className="inline-flex items-center gap-2"><CardIcon className="size-3.5 text-muted-foreground" />{k}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {!neuerKanal.open ? (
                    <button
                      onClick={() => setNeuerKanal({ ...neuerKanal, open: true })}
                      className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                    >
                      <Plus className="size-3" /> Neuen Kanal hinzufügen
                    </button>
                  ) : (
                    <div className="rounded-xl border border-dashed border-border/70 p-3 space-y-2">
                      <div className="grid grid-cols-[1fr_120px] gap-2">
                        <Input
                          value={neuerKanal.bez}
                          onChange={(e) => setNeuerKanal({ ...neuerKanal, bez: e.target.value })}
                          placeholder="Bezeichnung, z. B. Visa"
                          className="rounded-lg"
                        />
                        <Input
                          value={neuerKanal.last4}
                          onChange={(e) => setNeuerKanal({ ...neuerKanal, last4: e.target.value.replace(/\D/g, "").slice(0, 4) })}
                          placeholder="••••"
                          maxLength={4}
                          className="rounded-lg tabular"
                        />
                      </div>
                      <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <ShieldCheck className="size-3" /> Toolfolio speichert nur die letzten vier Ziffern, niemals die vollständige Nummer.
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="ghost" onClick={() => setNeuerKanal({ open: false, bez: "Visa", last4: "" })}>Abbrechen</Button>
                        <Button
                          size="sm"
                          onClick={() => {
                            const label = `${neuerKanal.bez || "Karte"} •••• ${neuerKanal.last4 || "0000"}`;
                            setZusatzKanaele((z) => [...z, label]);
                            set("zahlungskanal", label);
                            setNeuerKanal({ open: false, bez: "Visa", last4: "" });
                          }}
                        >
                          Hinzufügen
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </Field>
            </Section>

            {/* 3: Zuordnung */}
            <Section title="Zuordnung">
              <Field label="Kunde">
                <Select value={data.kunde} onValueChange={(v) => set("kunde", v)}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {kunden.map((k) => (
                      <SelectItem key={k} value={k}>{k}</SelectItem>
                    ))}
                    <SelectItem value="__neu">+ neuen Kunden anlegen</SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              <div className="flex items-start justify-between gap-3 rounded-2xl border border-border/60 bg-secondary/30 p-3">
                <div>
                  <div className="text-sm font-medium">Weiterverrechnung</div>
                  <div className="text-xs text-muted-foreground">An den Kunden weiterberechnen, optional mit Aufschlag.</div>
                </div>
                <Switch checked={!!data.weiterverrechnen} onCheckedChange={(v) => set("weiterverrechnen", v)} />
              </div>
              {data.weiterverrechnen && (
                <Field label="Aufschlag in Prozent">
                  <div className="relative">
                    <Input
                      type="number"
                      value={data.aufschlagProzent ?? 0}
                      onChange={(e) => set("aufschlagProzent", parseFloat(e.target.value) || 0)}
                      className="rounded-xl tabular pr-8"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">%</span>
                  </div>
                </Field>
              )}

              <Field label="Kategorie">
                <Select value={data.kategorie} onValueChange={(v) => set("kategorie", v)}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Kategorie wählen">
                      {data.kategorie && (
                        <span className="inline-flex items-center gap-2">
                          <span
                            className="inline-block size-2.5 rounded-full"
                            style={{ background: kategorieFarben[data.kategorie as keyof typeof kategorieFarben] ?? "#999" }}
                          />
                          {data.kategorie}
                        </span>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {kategorien.map((k) => (
                      <SelectItem key={k} value={k}>
                        <span className="inline-flex items-center gap-2">
                          <span className="inline-block size-2.5 rounded-full" style={{ background: kategorieFarben[k] }} />
                          {k}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field label="Status">
                <div className="inline-flex rounded-xl border border-border bg-background p-1 w-full">
                  {(["aktiv", "Trial", "pausiert"] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => set("status", s)}
                      className={cn(
                        "flex-1 px-3 py-1.5 rounded-lg text-sm font-medium transition",
                        data.status === s ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </Field>
              {data.status === "Trial" && (
                <Field label="Trial endet am">
                  <Input
                    type="date"
                    value={data.trialEndet ?? ""}
                    onChange={(e) => set("trialEndet", e.target.value)}
                    className="rounded-xl"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">Toolfolio erinnert dich rechtzeitig vor Ablauf.</p>
                </Field>
              )}

              <Field label="Tags">
                <div className="rounded-xl border border-input bg-background p-2 flex flex-wrap gap-1.5 focus-within:ring-1 focus-within:ring-ring">
                  {(data.tags ?? []).map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1 rounded-full bg-secondary text-secondary-foreground px-2.5 py-1 text-xs font-medium"
                    >
                      <TagIcon className="size-3 text-muted-foreground" />
                      {t}
                      <button onClick={() => removeTag(t)} aria-label={`${t} entfernen`} className="text-muted-foreground hover:text-destructive">
                        <X className="size-3" />
                      </button>
                    </span>
                  ))}
                  <input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === ",") {
                        e.preventDefault();
                        addTag();
                      } else if (e.key === "Backspace" && !tagInput && (data.tags ?? []).length) {
                        removeTag((data.tags ?? [])[(data.tags ?? []).length - 1]);
                      }
                    }}
                    placeholder={(data.tags ?? []).length ? "" : "Tag eingeben und Enter drücken"}
                    className="flex-1 min-w-[120px] bg-transparent text-sm outline-none px-1"
                  />
                </div>
              </Field>
            </Section>

            {/* 4: Vertrag & Kündigung */}
            <Section title="Vertrag & Kündigung">
              <div className="grid sm:grid-cols-2 gap-3">
                <Field label="Abo seit">
                  <Input
                    type="date"
                    value={data.aboSeit ?? ""}
                    onChange={(e) => set("aboSeit", e.target.value)}
                    className="rounded-xl"
                  />
                </Field>
                <div className="flex items-end">
                  <div className="flex items-start justify-between gap-3 rounded-2xl border border-border/60 bg-secondary/30 p-3 w-full">
                    <div>
                      <div className="text-sm font-medium">Automatische Verlängerung</div>
                      <div className="text-xs text-muted-foreground">Vertrag verlängert sich selbst.</div>
                    </div>
                    <Switch checked={!!data.autoVerlaengerung} onCheckedChange={(v) => set("autoVerlaengerung", v)} />
                  </div>
                </div>
              </div>

              <Field label="Kündigungsfrist zum Laufzeitende">
                <div className="grid grid-cols-[1fr_140px] gap-2">
                  <Input
                    type="number"
                    min={0}
                    value={data.fristWert ?? ""}
                    onChange={(e) => set("fristWert", parseInt(e.target.value) || 0)}
                    placeholder="z. B. 14"
                    className="rounded-xl tabular"
                  />
                  <Select value={data.fristEinheit ?? "Tage"} onValueChange={(v) => set("fristEinheit", v as "Tage" | "Wochen" | "Monate")}>
                    <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Tage">Tage</SelectItem>
                      <SelectItem value="Wochen">Wochen</SelectItem>
                      <SelectItem value="Monate">Monate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <p className="mt-2 text-xs text-muted-foreground tabular">
                  letzter Kündigungstermin: <span className="font-medium text-foreground">{fmtDateDe(letzterTermin)}</span>
                </p>
              </Field>

              <div className="flex items-start justify-between gap-3 rounded-2xl border border-border/60 bg-secondary/30 p-3">
                <div>
                  <div className="text-sm font-medium">Vor der Frist erinnern</div>
                  <div className="text-xs text-muted-foreground">Toolfolio meldet sich rechtzeitig.</div>
                </div>
                <Switch checked={!!data.erinnerung} onCheckedChange={(v) => set("erinnerung", v)} />
              </div>
            </Section>

            {/* 5: Notizen & Zugang */}
            <Section title="Notizen & Zugang">
              <Field label="Notizen">
                <Textarea
                  value={data.notizen ?? ""}
                  onChange={(e) => set("notizen", e.target.value)}
                  rows={3}
                  placeholder="Was solltest du zu diesem Abo wissen?"
                  className="rounded-xl"
                />
              </Field>
              <Field label="Konto-E-Mail">
                <Input
                  type="email"
                  value={data.kontoEmail ?? ""}
                  onChange={(e) => set("kontoEmail", e.target.value)}
                  placeholder="welcher Account nutzt dieses Abo?"
                  className="rounded-xl"
                />
              </Field>
              <Field label="Login-Verweis">
                <Input
                  value={data.loginVerweis ?? ""}
                  onChange={(e) => set("loginVerweis", e.target.value)}
                  placeholder="z. B. liegt in 1Password"
                  className="rounded-xl"
                />
                <p className="mt-1.5 text-xs text-muted-foreground inline-flex items-center gap-1">
                  <ShieldCheck className="size-3" /> Toolfolio speichert keine Passwörter, nur einen Verweis darauf.
                </p>
              </Field>
            </Section>

            {/* Gefahrenzone, nur im Bearbeiten-Modus */}
            {mode === "bearbeiten" && (
              <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-4 space-y-3">
                <div>
                  <div className="text-sm font-medium">Erweiterte Aktionen</div>
                  <div className="text-xs text-muted-foreground">Archiviere oder lösche dieses Abo, wenn es nicht mehr aktiv ist.</div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl gap-1.5"
                    onClick={() => {
                      toast("Abo archiviert", { description: `${data.tool} wurde ins Archiv verschoben.` });
                      onOpenChange(false);
                    }}
                  >
                    <Archive className="size-4" /> Archivieren
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl gap-1.5 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => setConfirmDelete(true)}
                  >
                    <Trash2 className="size-4" /> Löschen
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Sticky Fuß */}
          <footer className="sticky bottom-0 z-10 border-t border-border/60 bg-card/95 backdrop-blur px-5 sm:px-6 py-3.5 flex items-center justify-between gap-3">
            <Button variant="ghost" onClick={tryClose} className="rounded-xl">Abbrechen</Button>
            <div className="flex items-center gap-2">
              {mode === "anlegen" && (
                <button
                  onClick={() => speichern(true)}
                  className="text-xs text-primary hover:underline hidden sm:inline"
                >
                  Speichern und weiteres hinzufügen
                </button>
              )}
              <Button onClick={() => speichern(false)} className="rounded-xl gap-1.5">
                <Check className="size-4" />
                {mode === "bearbeiten" ? "Speichern" : "Abo hinzufügen"}
              </Button>
            </div>
          </footer>
        </SheetContent>
      </Sheet>

      {/* Rückfrage beim Schließen */}
      <AlertDialog open={confirmClose} onOpenChange={setConfirmClose}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Änderungen verwerfen?</AlertDialogTitle>
            <AlertDialogDescription>
              Du hast ungespeicherte Änderungen. Wenn du jetzt schließt, gehen sie verloren.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Weiter bearbeiten</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={() => {
                setConfirmClose(false);
                setDirty(false);
                onOpenChange(false);
              }}
            >
              Verwerfen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bestätigung beim Löschen */}
      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Abo wirklich löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              {data.tool || "Dieses Abo"} wird mit allen Zuordnungen und Notizen entfernt. Rechnungen und Belege bleiben in deinem Postfach.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={() => {
                setConfirmDelete(false);
                toast("Abo gelöscht", { description: `${data.tool} wurde entfernt.` });
                onOpenChange(false);
              }}
            >
              Endgültig löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

/* ------------------- Subkomponenten ------------------- */

function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-baseline justify-between">
        <h3 className="font-display text-base font-semibold tracking-tight">{title}</h3>
        {hint && <span className="text-[11px] text-muted-foreground">{hint}</span>}
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
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
      <Label className="text-xs font-medium text-muted-foreground">
        {label}
        {required && <span className="text-primary ml-0.5">*</span>}
      </Label>
      {children}
      {error && (
        <p className="text-xs text-destructive flex items-center gap-1">
          <AlertCircle className="size-3" /> {error}
        </p>
      )}
    </div>
  );
}
