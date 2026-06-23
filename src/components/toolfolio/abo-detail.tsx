import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ChevronRight,
  MoreHorizontal,
  Pencil,
  Pause,
  Copy,
  BookOpen,
  Archive,
  Trash2,
  Sparkles,
  AlertTriangle,
  DollarSign,
  TrendingDown,
  TrendingUp,
  Check,
  Download,
  FileText,
  Bell,
  ShieldCheck,
  Tag as TagIcon,
  X,
  Zap,
  Plus,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { fmtEUR, fmtDate } from "@/lib/toolfolio-data";
import { alleAbos, kategorieFarben, statusFarben } from "@/lib/abos-data";

type Variant = "fix" | "verbrauch";

interface DetailAbo {
  id: string;
  tool: string;
  anbieter: string;
  initial: string;
  farbe: string;
  kategorie: string;
  status: "aktiv" | "Trial" | "pausiert";
  kosten: number;
  waehrung: "EUR" | "USD";
  intervall: "monatlich" | "jährlich" | "quartalsweise";
  naechsteAbbuchung: string;
  zahlungskanal: string;
  aboSeitMonate: number;
  autoVerlaengerung: boolean;
  kuendigungsfristTage: number;
  kuendbarBis: string;
  vertragsende: string;
  kunde: string;
  weiterverrechnet: boolean;
  aufschlagProzent: number;
  tags: string[];
  kontoEmail: string;
  loginIn: string;
  variant: Variant;
}

const calendly: DetailAbo = {
  id: "22",
  tool: "Calendly",
  anbieter: "Calendly LLC",
  initial: "C",
  farbe: "#006BFF",
  kategorie: "Produktivität",
  status: "aktiv",
  kosten: 16,
  waehrung: "USD",
  intervall: "monatlich",
  naechsteAbbuchung: "2026-07-18",
  zahlungskanal: "Visa •••• 4821",
  aboSeitMonate: 8,
  autoVerlaengerung: true,
  kuendigungsfristTage: 52,
  kuendbarBis: "2026-08-14",
  vertragsende: "2026-09-14",
  kunde: "Kunde FULEX",
  weiterverrechnet: true,
  aufschlagProzent: 15,
  tags: ["Kundentermine", "extern sichtbar"],
  kontoEmail: "termine@toolfolio-studio.de",
  loginIn: "1Password",
  variant: "fix",
};

const anthropic: DetailAbo = {
  id: "8",
  tool: "Anthropic API",
  anbieter: "Anthropic PBC",
  initial: "C",
  farbe: "#cc785c",
  kategorie: "KI / API",
  status: "aktiv",
  kosten: 312.4,
  waehrung: "USD",
  intervall: "monatlich",
  naechsteAbbuchung: "2026-07-01",
  zahlungskanal: "Mastercard •••• 7093",
  aboSeitMonate: 11,
  autoVerlaengerung: true,
  kuendigungsfristTage: 0,
  kuendbarBis: "2026-07-31",
  vertragsende: "2026-07-31",
  kunde: "Kunde ZAQQ",
  weiterverrechnet: true,
  aufschlagProzent: 20,
  tags: ["Produktion", "Claude 3.5"],
  kontoEmail: "ai@toolfolio-studio.de",
  loginIn: "1Password",
  variant: "verbrauch",
};

function resolveAbo(id?: string): DetailAbo {
  if (!id) return calendly;
  if (id === "8") return anthropic;
  // Try map from list, otherwise fall back to Calendly
  const fromList = alleAbos.find((a) => a.id === id);
  if (!fromList) return calendly;
  return {
    ...calendly,
    id: fromList.id,
    tool: fromList.tool,
    anbieter: fromList.tool,
    initial: fromList.initial,
    farbe: fromList.farbe,
    kategorie: fromList.kategorie,
    status: fromList.status === "gekündigt" || fromList.status === "archiviert" ? "aktiv" : fromList.status,
    kosten: fromList.kosten,
    intervall: fromList.intervall,
    naechsteAbbuchung: fromList.naechsteAbbuchung,
    zahlungskanal: fromList.zahlungskanal,
    kunde: fromList.kunde,
    waehrung: fromList.waehrung ?? "EUR",
    variant: fromList.kategorie === "KI / API" ? "verbrauch" : "fix",
  };
}

export function AboDetail({ aboId }: { aboId?: string }) {
  const abo = useMemo(() => resolveAbo(aboId), [aboId]);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [erinnern, setErinnern] = useState(true);
  const [verrechnet, setVerrechnet] = useState(abo.weiterverrechnet);

  const monatsBetrag = abo.intervall === "monatlich" ? abo.kosten : abo.intervall === "jährlich" ? abo.kosten / 12 : abo.kosten / 3;
  const jahresBetrag = monatsBetrag * 12;
  const jahresPaket = 144;
  const ersparnis = jahresBetrag - jahresPaket;

  const katFarbe = (kategorieFarben as Record<string, string>)[abo.kategorie] ?? "#6C5CE7";
  const statusF = statusFarben[abo.status];

  return (
    <TooltipProvider delayDuration={200}>
      <div className="space-y-6 pb-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Link to="/abos" className="hover:text-foreground">Abos</Link>
          <ChevronRight className="size-3.5" />
          <span className="text-foreground font-medium">{abo.tool}</span>
        </nav>

        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6">
          <div
            className="size-16 sm:size-20 shrink-0 rounded-2xl grid place-items-center text-2xl sm:text-3xl font-display font-bold text-white shadow-sm"
            style={{ background: abo.farbe }}
            aria-hidden
          >
            {abo.initial}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight truncate">
              {abo.tool}
            </h1>
            <div className="mt-1 text-sm text-muted-foreground">{abo.anbieter}</div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Pill bg={`${katFarbe}1A`} text={katFarbe}>{abo.kategorie}</Pill>
              <Pill bg={statusF.bg} text={statusF.text}>
                <span
                  className="size-1.5 rounded-full"
                  style={{ background: statusF.dot }}
                />
                {abo.status}
              </Pill>
              <a href="#" className="text-xs text-primary hover:underline ml-1">
                Im Toolfolio-Verzeichnis ansehen
              </a>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:self-start">
            <Button onClick={() => setEditOpen(true)} className="gap-1.5">
              <Pencil className="size-4" /> Bearbeiten
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" aria-label="Weitere Aktionen">
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem><Pause className="size-4" /> Pausieren</DropdownMenuItem>
                <DropdownMenuItem><Copy className="size-4" /> Duplizieren</DropdownMenuItem>
                <DropdownMenuItem><BookOpen className="size-4" /> Im Verzeichnis ansehen</DropdownMenuItem>
                <DropdownMenuItem><Archive className="size-4" /> Archivieren</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setDeleteOpen(true)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="size-4" /> Löschen
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Hinweis-Banner */}
        <div className="grid sm:grid-cols-2 gap-3">
          <a
            href="#sparen"
            className="flex items-start gap-3 rounded-2xl border border-emerald-200/70 bg-emerald-50/70 p-3.5 hover:bg-emerald-50 transition"
          >
            <div className="size-9 rounded-xl bg-emerald-100 grid place-items-center text-emerald-700 shrink-0">
              <Sparkles className="size-4" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-emerald-900">Du kannst hier sparen</div>
              <div className="text-xs text-emerald-800/80">
                Stell auf jährlich um und spar 48,00 € pro Jahr.
              </div>
            </div>
          </a>
          <a
            href="#frist"
            className="flex items-start gap-3 rounded-2xl border border-amber-200/70 bg-amber-50/70 p-3.5 hover:bg-amber-50 transition"
          >
            <div className="size-9 rounded-xl bg-amber-100 grid place-items-center text-amber-700 shrink-0">
              <AlertTriangle className="size-4" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-amber-900">Kündigungsfrist im Blick behalten</div>
              <div className="text-xs text-amber-800/80">
                Kündbar bis {fmtDate(abo.kuendbarBis)}, sonst Verlängerung um 12 Monate.
              </div>
            </div>
          </a>
        </div>

        {/* Two-column layout */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main column */}
          <div className="lg:col-span-2 space-y-6 order-2 lg:order-1">
            {/* Kosten */}
            <Card>
              <CardHead title="Kosten & Abrechnung" />
              <div className="flex flex-wrap items-baseline gap-2">
                <div className="font-display text-4xl font-semibold tabular">
                  {fmtEUR(abo.kosten)}
                </div>
                <div className="text-sm text-muted-foreground">/ {abo.intervall}</div>
                {abo.waehrung === "USD" && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="inline-flex items-center gap-1 ml-1 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground cursor-help">
                        <DollarSign className="size-3" /> USD
                      </span>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      Wird in USD abgerechnet, auf dem Konto in Euro plus mögliche Fremdwährungsgebühr.
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                Macht <span className="text-foreground font-medium tabular">{fmtEUR(monatsBetrag)}</span> pro Monat,
                hochgerechnet <span className="text-foreground font-medium tabular">{fmtEUR(jahresBetrag)}</span> pro Jahr.
              </div>
              <Divider />
              <DL>
                <DT>Nächste Abbuchung</DT>
                <DD>{fmtDate(abo.naechsteAbbuchung)}</DD>
                <DT>Zahlungskanal</DT>
                <DD>{abo.zahlungskanal}</DD>
                <DT>Abo seit</DT>
                <DD>seit {abo.aboSeitMonate} Monaten</DD>
                <DT>Automatische Verlängerung</DT>
                <DD>{abo.autoVerlaengerung ? "Ja" : "Nein"}</DD>
              </DL>
            </Card>

            {/* Sparpotenzial */}
            <Card id="sparen">
              <CardHead title="Sparpotenzial & Tarif-Alternativen" />

              {/* Intervall-Umstellung */}
              <div className="rounded-2xl border border-emerald-200/70 bg-emerald-50/50 p-4 sm:p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="size-8 rounded-xl bg-emerald-100 grid place-items-center text-emerald-700">
                    <TrendingDown className="size-4" />
                  </div>
                  <div className="font-display font-semibold text-emerald-900">
                    Auf jährlich umstellen
                  </div>
                </div>
                <div className="text-sm text-emerald-900/90">
                  Monatlich <span className="tabular font-medium">16,00 €</span> × 12
                  = <span className="tabular font-medium">192,00 €</span>{" "}
                  gegen jährlich <span className="tabular font-medium">{fmtEUR(jahresPaket)}</span>.
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <div className="font-display text-2xl font-semibold tabular text-emerald-900">
                    Du sparst {fmtEUR(ersparnis)} pro Jahr
                  </div>
                  <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white ml-auto gap-1.5">
                    Umstellen <ArrowRight className="size-4" />
                  </Button>
                </div>

                <div className="mt-4 grid sm:grid-cols-2 gap-3">
                  <PlanCard name="Monatlich" preis="16,00 €" sub="je Monat" current />
                  <PlanCard name="Jährlich" preis="12,00 €" sub="je Monat (jährlich abgerechnet)" highlight />
                </div>
              </div>

              {/* Benchmark */}
              <div className="mt-4 rounded-2xl border border-border bg-secondary/40 p-4 sm:p-5">
                <div className="flex items-center gap-2 mb-2">
                  <div className="size-8 rounded-xl bg-background grid place-items-center text-primary">
                    <TrendingUp className="size-4" />
                  </div>
                  <div className="font-display font-semibold">Benchmark</div>
                  <Badge variant="secondary" className="ml-auto text-[10px]">Phase 2</Badge>
                </div>
                <div className="text-sm">
                  Du zahlst <span className="tabular font-medium">16,00 €</span>.
                  Vergleichbare Agenturen zahlen im Median{" "}
                  <span className="tabular font-medium">12,00 €</span>.
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Basiert auf echten Abrechnungsdaten.
                </div>
              </div>

              {/* Alternativen */}
              <div className="mt-4">
                <div className="text-sm font-medium mb-3">Alternativen aus dem Verzeichnis</div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <AlternativeCard
                    name="Cal.com"
                    farbe="#1F2937"
                    initial="C"
                    preis="12,00 €"
                    beschreibung="Open-Source-Alternative zu Calendly, ähnlicher Funktionsumfang."
                  />
                  <AlternativeCard
                    name="Toolfolio Termine"
                    farbe="#6C5CE7"
                    initial="T"
                    preis="im Plan enthalten"
                    beschreibung="Ersetzt Calendly. Direkt mit deinem Kalender und deinen Kunden verbunden."
                    hausmarke
                  />
                </div>
              </div>
            </Card>

            {/* Kostenverlauf */}
            <Card>
              <CardHead
                title="Kostenverlauf"
                hint={abo.variant === "fix" ? "Letzte 12 Monate" : "Letzte 12 Monate, verbrauchsbasiert"}
              />
              {abo.variant === "fix" ? <FixChart /> : <UsageChart />}
              {abo.variant === "verbrauch" && (
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                  <Pill bg="#F0F6FF" text="#1D4ED8"><Zap className="size-3" /> Auto-Recharge lädt bei 0 nach</Pill>
                  <Pill bg="#FEF3DA" text="#8A5A0B"><AlertTriangle className="size-3" /> 28 € Guthaben verfällt am Monatsende</Pill>
                </div>
              )}
              {abo.variant === "fix" && (
                <div className="mt-3 text-xs text-muted-foreground">
                  Hinweis: keine Preiserhöhung in den letzten 12 Monaten erkannt.
                </div>
              )}
            </Card>

            {/* Rechnungen */}
            <Card>
              <CardHead title="Rechnungen & Belege" />
              <ul className="divide-y divide-border rounded-xl border border-border bg-background/60">
                {[
                  { datum: "2026-06-18", betrag: 16 },
                  { datum: "2026-05-18", betrag: 16 },
                  { datum: "2026-04-18", betrag: 16 },
                  { datum: "2026-03-18", betrag: 16 },
                ].map((r) => (
                  <li key={r.datum} className="flex items-center gap-3 px-4 py-2.5 text-sm">
                    <FileText className="size-4 text-muted-foreground shrink-0" />
                    <span className="flex-1 truncate">Rechnung {fmtDate(r.datum)}</span>
                    <span className="tabular font-medium">{fmtEUR(r.betrag)}</span>
                    <button className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                      <Download className="size-3.5" /> PDF
                    </button>
                  </li>
                ))}
              </ul>
              <Divider />
              <div className="text-sm font-medium mb-2">Vertrag & Dokumente</div>
              <ul className="space-y-1.5">
                <li className="flex items-center gap-2 text-sm">
                  <FileText className="size-4 text-muted-foreground" />
                  <span className="flex-1 truncate">Calendly-AGB-2026.pdf</span>
                  <button className="text-xs text-primary hover:underline">Herunterladen</button>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <FileText className="size-4 text-muted-foreground" />
                  <span className="flex-1 truncate">Auftragsverarbeitung-Calendly.pdf</span>
                  <button className="text-xs text-primary hover:underline">Herunterladen</button>
                </li>
              </ul>
              <div className="mt-3 text-xs text-muted-foreground">
                Belege landen automatisch über das verbundene Beleg-Postfach.
              </div>
            </Card>
          </div>

          {/* Side column */}
          <div className="space-y-6 order-1 lg:order-2">
            {/* Kündigung */}
            <Card id="frist" className="border-amber-200/80 bg-amber-50/40">
              <CardHead title="Kündigung & Frist" />
              <div className="rounded-xl border border-amber-300/70 bg-white px-3.5 py-3 text-sm font-medium text-amber-900">
                Kündbar bis {fmtDate(abo.kuendbarBis)}, sonst Verlängerung um 12 Monate.
              </div>
              <DL className="mt-4">
                <DT>Kündigungsfrist</DT>
                <DD>4 Wochen</DD>
                <DT>Vertragsende</DT>
                <DD>{fmtDate(abo.vertragsende)}</DD>
                <DT>Automatische Verlängerung</DT>
                <DD>{abo.autoVerlaengerung ? "Ja" : "Nein"}</DD>
              </DL>
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-muted-foreground">Frist</span>
                  <span className="tabular font-medium text-amber-900">noch {abo.kuendigungsfristTage} Tage</span>
                </div>
                <div className="h-2 rounded-full bg-amber-100 overflow-hidden">
                  <div
                    className="h-full bg-amber-500"
                    style={{ width: `${Math.max(8, 100 - (abo.kuendigungsfristTage / 90) * 100)}%` }}
                  />
                </div>
              </div>
              <Button className="mt-4 w-full bg-amber-600 hover:bg-amber-700 text-white gap-1.5">
                <Bell className="size-4" /> Kündigung vorbereiten
              </Button>
              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Vor der Frist erinnern</span>
                <Switch checked={erinnern} onCheckedChange={setErinnern} />
              </div>
            </Card>

            {/* Zuordnung */}
            <Card>
              <CardHead title="Zuordnung" />
              <DL>
                <DT>Kunde</DT>
                <DD>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium">
                    {abo.kunde}
                    <button aria-label="Kunde entfernen" className="text-muted-foreground hover:text-foreground">
                      <X className="size-3" />
                    </button>
                  </span>
                </DD>
                <DT>Weiterverrechnung</DT>
                <DD>
                  <div className="flex items-center gap-2">
                    <Switch checked={verrechnet} onCheckedChange={setVerrechnet} />
                    {verrechnet && (
                      <div className="flex items-center gap-1 text-xs">
                        <Input
                          defaultValue={abo.aufschlagProzent}
                          className="h-7 w-14 text-xs tabular"
                        />
                        <span className="text-muted-foreground">% Aufschlag</span>
                      </div>
                    )}
                  </div>
                </DD>
                <DT>Kategorie</DT>
                <DD>
                  <Pill bg={`${katFarbe}1A`} text={katFarbe}>{abo.kategorie}</Pill>
                </DD>
                <DT>Tags</DT>
                <DD>
                  <div className="flex flex-wrap gap-1.5">
                    {abo.tags.map((t) => (
                      <span key={t} className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs">
                        <TagIcon className="size-3 text-muted-foreground" />
                        {t}
                      </span>
                    ))}
                    <button className="inline-flex items-center gap-1 rounded-full border border-dashed border-border px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground hover:border-foreground/40">
                      <Plus className="size-3" /> Tag
                    </button>
                  </div>
                </DD>
              </DL>
              <Divider />
              <div className="text-xs text-muted-foreground space-y-1">
                <div className="flex items-center justify-between">
                  <span>Owner im Team</span>
                  <span className="italic">bald verfügbar</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Seats gebucht / genutzt</span>
                  <span className="italic">bald verfügbar</span>
                </div>
              </div>
            </Card>

            {/* Notizen & Zugang */}
            <Card>
              <CardHead title="Notizen & Zugang" />
              <Textarea
                placeholder="Notizen zu diesem Abo"
                defaultValue="Wird für Kundentermine bei FULEX genutzt, Buchungsseite eingebettet."
                className="min-h-24 rounded-xl"
              />
              <div className="mt-4 space-y-3 text-sm">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Konto-E-Mail</div>
                  <div className="rounded-lg bg-secondary/60 px-3 py-2 font-medium truncate">
                    {abo.kontoEmail}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Login</div>
                  <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
                    <ShieldCheck className="size-4 text-emerald-600 shrink-0" />
                    <span className="text-sm">
                      Login liegt in: <span className="font-medium">{abo.loginIn}</span>
                    </span>
                  </div>
                  <div className="mt-1.5 text-[11px] text-muted-foreground">
                    Toolfolio speichert keine Passwörter, nur einen Verweis.
                  </div>
                </div>
              </div>
            </Card>

            {/* Aktivität */}
            <Card>
              <CardHead title="Aktivität" />
              <ul className="space-y-3">
                {[
                  { d: "2026-06-18", t: "Rechnung eingegangen", k: "16,00 €" },
                  { d: "2026-05-04", t: "Erinnerung an Frist gesetzt" },
                  { d: "2026-03-12", t: "Kunde FULEX zugeordnet" },
                  { d: "2025-10-22", t: "Abo angelegt" },
                ].map((e, i) => (
                  <li key={i} className="flex gap-3">
                    <div className="mt-1.5 size-2 rounded-full bg-primary shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm">{e.t}{e.k && <span className="text-muted-foreground"> · {e.k}</span>}</div>
                      <div className="text-xs text-muted-foreground">{fmtDate(e.d)}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>

        {/* Bearbeiten-Modal */}
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-display">Abo bearbeiten</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <Field label="Toolname"><Input defaultValue={abo.tool} /></Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Kosten"><Input defaultValue={String(abo.kosten)} /></Field>
                <Field label="Intervall"><Input defaultValue={abo.intervall} /></Field>
              </div>
              <Field label="Zahlungskanal"><Input defaultValue={abo.zahlungskanal} /></Field>
              <Field label="Kunde"><Input defaultValue={abo.kunde} /></Field>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditOpen(false)}>Abbrechen</Button>
              <Button onClick={() => setEditOpen(false)} className="gap-1.5">
                <Check className="size-4" /> Speichern
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Löschen-Confirm */}
        <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Abo wirklich löschen?</AlertDialogTitle>
              <AlertDialogDescription>
                {abo.tool} wird mit allen Zuordnungen und Notizen entfernt.
                Rechnungen und Belege bleiben in deinem Postfach.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Abbrechen</AlertDialogCancel>
              <AlertDialogAction className="bg-destructive hover:bg-destructive/90">
                Endgültig löschen
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
}

/* ----------------- Subcomponents ----------------- */

function Card({
  children,
  className,
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section
      id={id}
      className={cn(
        "rounded-[20px] border border-border/60 bg-card p-5 sm:p-6 shadow-[0_1px_2px_rgba(15,20,38,0.04),0_8px_24px_-12px_rgba(15,20,38,0.08)] transition-shadow hover:shadow-[0_2px_4px_rgba(15,20,38,0.05),0_12px_30px_-14px_rgba(15,20,38,0.1)]",
        className,
      )}
    >
      {children}
    </section>
  );
}

function CardHead({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="mb-4 flex items-baseline justify-between gap-3">
      <h2 className="font-display text-lg sm:text-xl font-semibold tracking-tight">{title}</h2>
      {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
    </div>
  );
}

function Divider() {
  return <div className="my-4 h-px bg-border/70" />;
}

function DL({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <dl className={cn("grid grid-cols-[auto_1fr] gap-x-4 gap-y-2.5 text-sm", className)}>
      {children}
    </dl>
  );
}
function DT({ children }: { children: React.ReactNode }) {
  return <dt className="text-muted-foreground">{children}</dt>;
}
function DD({ children }: { children: React.ReactNode }) {
  return <dd className="text-foreground font-medium text-right sm:text-left">{children}</dd>;
}

function Pill({
  children,
  bg,
  text,
}: {
  children: React.ReactNode;
  bg: string;
  text: string;
}) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
      style={{ background: bg, color: text }}
    >
      {children}
    </span>
  );
}

function PlanCard({
  name,
  preis,
  sub,
  current,
  highlight,
}: {
  name: string;
  preis: string;
  sub: string;
  current?: boolean;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-white px-3.5 py-3",
        highlight ? "border-emerald-400 ring-1 ring-emerald-400/40" : "border-border",
      )}
    >
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium">{name}</div>
        {current && <Badge variant="secondary" className="text-[10px]">aktuell</Badge>}
        {highlight && <Badge className="bg-emerald-600 hover:bg-emerald-600 text-[10px]">Empfohlen</Badge>}
      </div>
      <div className="mt-1 font-display text-xl font-semibold tabular">{preis}</div>
      <div className="text-[11px] text-muted-foreground">{sub}</div>
    </div>
  );
}

function AlternativeCard({
  name,
  initial,
  farbe,
  preis,
  beschreibung,
  hausmarke,
}: {
  name: string;
  initial: string;
  farbe: string;
  preis: string;
  beschreibung: string;
  hausmarke?: boolean;
}) {
  return (
    <div
      className={cn(
        "group rounded-2xl border bg-background p-4 transition hover:-translate-y-0.5 hover:shadow-md",
        hausmarke ? "border-primary/40 bg-primary/5" : "border-border",
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className="size-10 shrink-0 rounded-xl grid place-items-center text-sm font-display font-bold text-white"
          style={{ background: farbe }}
        >
          {initial}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <div className="font-display font-semibold truncate">{name}</div>
            {hausmarke && (
              <span className="rounded-full bg-primary text-primary-foreground px-1.5 py-0.5 text-[10px] font-semibold">
                Toolfolio Studio
              </span>
            )}
          </div>
          <div className="text-xs text-muted-foreground tabular">{preis}</div>
        </div>
      </div>
      <div className="mt-2.5 text-xs text-muted-foreground line-clamp-2">{beschreibung}</div>
      <div className="mt-3 flex items-center gap-2">
        <Button size="sm" variant={hausmarke ? "default" : "outline"} className="gap-1.5 ml-auto">
          Vergleichen <ArrowRight className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-muted-foreground mb-1 block">{label}</span>
      {children}
    </label>
  );
}

/* ----------------- Charts ----------------- */

function FixChart() {
  const values = [16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16];
  return <SparkArea values={values} highlight={null} />;
}

function UsageChart() {
  const values = [120, 145, 180, 210, 175, 260, 320, 290, 410, 365, 312, 480];
  return <SparkArea values={values} highlight={8} />;
}

function SparkArea({ values, highlight }: { values: number[]; highlight: number | null }) {
  const w = 600;
  const h = 140;
  const pad = 8;
  const max = Math.max(...values) * 1.1;
  const min = Math.min(...values) * 0.9;
  const step = (w - pad * 2) / (values.length - 1);
  const pts = values.map((v, i) => {
    const x = pad + i * step;
    const y = pad + (h - pad * 2) * (1 - (v - min) / Math.max(1, max - min));
    return { x, y, v };
  });
  const path = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const area = `${path} L${pts[pts.length - 1].x},${h - pad} L${pts[0].x},${h - pad} Z`;
  const months = ["Jul", "Aug", "Sep", "Okt", "Nov", "Dez", "Jan", "Feb", "Mär", "Apr", "Mai", "Jun"];
  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${w} ${h + 18}`} className="w-full h-auto">
        <defs>
          <linearGradient id="gradFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6C5CE7" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#6C5CE7" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#gradFill)" />
        <path d={path} fill="none" stroke="#6C5CE7" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
        {pts.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={highlight === i ? 4 : 2.5}
            fill={highlight === i ? "#F0533D" : "#6C5CE7"}
          />
        ))}
        {months.map((m, i) => (
          <text
            key={m}
            x={pad + i * step}
            y={h + 14}
            fontSize="10"
            textAnchor="middle"
            fill="#6B7280"
          >
            {m}
          </text>
        ))}
      </svg>
    </div>
  );
}
