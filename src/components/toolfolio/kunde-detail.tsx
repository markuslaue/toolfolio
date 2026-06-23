import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ChevronRight,
  FileText,
  Pencil,
  MoreHorizontal,
  Archive,
  Trash2,
  Plus,
  X,
  Mail,
  User as UserIcon,
  CheckCircle2,
  Clock,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
import { cn } from "@/lib/utils";
import { fmtEUR, fmtDate, type Kategorie } from "@/lib/toolfolio-data";

/* ------------ Mock-Datenmodell ------------ */

type Interval = "monatlich" | "jährlich";

interface KundeTool {
  id: string;
  tool: string;
  initial: string;
  farbe: string;
  kategorie: Kategorie;
  kostenMonat: number; // normalisiert pro Monat
  rohkosten: number; // angezeigter Wert für Intervall
  intervall: Interval;
  zahlungskanal: string;
  naechsteAbbuchung: string;
  weiterverrechnetOverride: boolean | null; // null = erbt vom Kunden
}

interface KundeDetailData {
  id: string;
  name: string;
  ansprechpartner: string;
  email: string;
  farbe: string;
  status: "aktiv" | "inaktiv" | "archiviert";
  weiterverrechnet: boolean;
  aufschlagProzent: number;
  notizen: string;
  tools: KundeTool[];
  verlauf: { monat: string; wert: number }[];
  aktivitaet: { ts: string; text: string }[];
}

const VITALPLANT_TOOLS: KundeTool[] = [
  {
    id: "v1",
    tool: "Figma",
    initial: "F",
    farbe: "#a259ff",
    kategorie: "Design",
    kostenMonat: 45,
    rohkosten: 45,
    intervall: "monatlich",
    zahlungskanal: "Visa •••• 4821",
    naechsteAbbuchung: "2026-07-08",
    weiterverrechnetOverride: null,
  },
  {
    id: "v2",
    tool: "OpenAI",
    initial: "O",
    farbe: "#10a37f",
    kategorie: "KI / API",
    kostenMonat: 184,
    rohkosten: 184,
    intervall: "monatlich",
    zahlungskanal: "Visa •••• 4821",
    naechsteAbbuchung: "2026-07-01",
    weiterverrechnetOverride: null,
  },
  {
    id: "v3",
    tool: "ElevenLabs",
    initial: "E",
    farbe: "#0F1419",
    kategorie: "KI / API",
    kostenMonat: 22,
    rohkosten: 22,
    intervall: "monatlich",
    zahlungskanal: "Mastercard •••• 7093",
    naechsteAbbuchung: "2026-07-03",
    weiterverrechnetOverride: null,
  },
  {
    id: "v4",
    tool: "Shopify",
    initial: "S",
    farbe: "#95bf47",
    kategorie: "eCommerce",
    kostenMonat: 105,
    rohkosten: 105,
    intervall: "monatlich",
    zahlungskanal: "SEPA-Lastschrift",
    naechsteAbbuchung: "2026-07-10",
    weiterverrechnetOverride: null,
  },
  {
    id: "v5",
    tool: "Canva Teams",
    initial: "C",
    farbe: "#00c4cc",
    kategorie: "Design",
    kostenMonat: 109 / 12,
    rohkosten: 109,
    intervall: "jährlich",
    zahlungskanal: "PayPal",
    naechsteAbbuchung: "2026-12-02",
    weiterverrechnetOverride: null,
  },
  {
    id: "v6",
    tool: "Linear",
    initial: "L",
    farbe: "#5e6ad2",
    kategorie: "Entwicklung",
    kostenMonat: 56,
    rohkosten: 56,
    intervall: "monatlich",
    zahlungskanal: "Mastercard •••• 7093",
    naechsteAbbuchung: "2026-07-09",
    weiterverrechnetOverride: false, // abweichend: nicht weiterverrechnet
  },
  {
    id: "v7",
    tool: "Loom",
    initial: "L",
    farbe: "#625df5",
    kategorie: "Kommunikation",
    kostenMonat: 15,
    rohkosten: 15,
    intervall: "monatlich",
    zahlungskanal: "PayPal",
    naechsteAbbuchung: "2026-07-07",
    weiterverrechnetOverride: false, // abweichend
  },
  {
    id: "v8",
    tool: "Notion",
    initial: "N",
    farbe: "#0F1419",
    kategorie: "Produktivität",
    kostenMonat: 264,
    rohkosten: 264,
    intervall: "monatlich",
    zahlungskanal: "Visa •••• 4821",
    naechsteAbbuchung: "2026-07-04",
    weiterverrechnetOverride: null,
  },
];

const KUNDEN_DETAILS: Record<string, KundeDetailData> = {
  k1: {
    id: "k1",
    name: "Nordwerk",
    ansprechpartner: "Lara Hoffmann",
    email: "lara@vitalplant.de",
    farbe: "#6C5CE7",
    status: "aktiv",
    weiterverrechnet: true,
    aufschlagProzent: 15,
    notizen:
      "Monatliche Abrechnung am Monatsanfang. Toolkosten werden als eigener Posten ausgewiesen.",
    tools: VITALPLANT_TOOLS,
    verlauf: [
      { monat: "Jul", wert: 420 },
      { monat: "Aug", wert: 440 },
      { monat: "Sep", wert: 480 },
      { monat: "Okt", wert: 520 },
      { monat: "Nov", wert: 560 },
      { monat: "Dez", wert: 600 },
      { monat: "Jan", wert: 640 },
      { monat: "Feb", wert: 680 },
      { monat: "Mär", wert: 710 },
      { monat: "Apr", wert: 740 },
      { monat: "Mai", wert: 770 },
      { monat: "Jun", wert: 800 },
    ],
    aktivitaet: [
      { ts: "vor 2 Tagen", text: "Aufschlag auf 15 % geändert" },
      { ts: "vor 1 Woche", text: "Shopify zugeordnet" },
      { ts: "vor 3 Wochen", text: "Bericht für Mai erstellt" },
      { ts: "vor 2 Monaten", text: "Kunde angelegt" },
    ],
  },
};

function fallbackKunde(id: string): KundeDetailData {
  return {
    id,
    name: "Unbekannter Kunde",
    ansprechpartner: "—",
    email: "—",
    farbe: "#6C5CE7",
    status: "aktiv",
    weiterverrechnet: false,
    aufschlagProzent: 0,
    notizen: "",
    tools: [],
    verlauf: [],
    aktivitaet: [],
  };
}

function initialen(name: string) {
  return name
    .split(/[\s&]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

/* ------------ Hauptkomponente ------------ */

export function KundeDetail({ kundeId }: { kundeId: string }) {
  const initial = KUNDEN_DETAILS[kundeId] ?? fallbackKunde(kundeId);
  const [kunde, setKunde] = useState<KundeDetailData>(initial);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const toolkostenMonat = useMemo(
    () => kunde.tools.reduce((s, t) => s + t.kostenMonat, 0),
    [kunde.tools],
  );

  const verrechnetSumme = useMemo(() => {
    return kunde.tools.reduce((s, t) => {
      const istVerrechnet =
        t.weiterverrechnetOverride ?? kunde.weiterverrechnet;
      if (!istVerrechnet) return s;
      return s + t.kostenMonat * (1 + kunde.aufschlagProzent / 100);
    }, 0);
  }, [kunde.tools, kunde.weiterverrechnet, kunde.aufschlagProzent]);

  const margeMonat = useMemo(() => {
    return kunde.tools.reduce((s, t) => {
      const istVerrechnet =
        t.weiterverrechnetOverride ?? kunde.weiterverrechnet;
      if (!istVerrechnet) return s;
      return s + (t.kostenMonat * kunde.aufschlagProzent) / 100;
    }, 0);
  }, [kunde.tools, kunde.weiterverrechnet, kunde.aufschlagProzent]);

  const verrechnetBasis = useMemo(() => {
    return kunde.tools.reduce((s, t) => {
      const istVerrechnet =
        t.weiterverrechnetOverride ?? kunde.weiterverrechnet;
      return istVerrechnet ? s + t.kostenMonat : s;
    }, 0);
  }, [kunde.tools, kunde.weiterverrechnet]);

  const setAufschlag = (v: number) =>
    setKunde((k) => ({ ...k, aufschlagProzent: Math.max(0, Math.min(100, v)) }));

  const setWeiterverrechnet = (v: boolean) =>
    setKunde((k) => ({ ...k, weiterverrechnet: v }));

  const toggleToolWeiter = (id: string) => {
    setKunde((k) => ({
      ...k,
      tools: k.tools.map((t) => {
        if (t.id !== id) return t;
        const aktuell = t.weiterverrechnetOverride ?? k.weiterverrechnet;
        const neu = !aktuell;
        // Wenn neu == kunde-Default → zurück auf null (geerbt)
        const override = neu === k.weiterverrechnet ? null : neu;
        return { ...t, weiterverrechnetOverride: override };
      }),
    }));
  };

  const entferneTool = (id: string) => {
    setKunde((k) => ({ ...k, tools: k.tools.filter((t) => t.id !== id) }));
    toast.success("Tool aus Kundenzuordnung entfernt");
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link to="/kunden" className="hover:text-foreground transition-colors">
          Kunden
        </Link>
        <ChevronRight className="size-3.5" />
        <span className="text-foreground">{kunde.name}</span>
      </nav>

      {/* Seitenkopf */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            className="grid size-16 shrink-0 place-items-center rounded-2xl text-xl font-display font-semibold text-white shadow-sm"
            style={{ background: kunde.farbe }}
          >
            {initialen(kunde.name)}
          </div>
          <div>
            <h1 className="font-display text-3xl font-semibold tracking-tight">
              {kunde.name}
            </h1>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-full border border-success/20 bg-success/10 px-2 py-0.5 text-[11px] font-medium text-success">
                {kunde.status}
              </span>
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <UserIcon className="size-3" /> {kunde.ansprechpartner}
              </span>
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Mail className="size-3" /> {kunde.email}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            className="gap-1.5"
            onClick={() => toast.success("Weiterverrechnungs-Report wird vorbereitet")}
          >
            <FileText className="size-4" /> Bericht erstellen
          </Button>
          <Button variant="outline" className="gap-1.5" onClick={() => setEditOpen(true)}>
            <Pencil className="size-4" /> Bearbeiten
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => toast.success("Kunde archiviert")}>
                <Archive className="mr-2 size-4" /> Archivieren
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => setConfirmDelete(true)}
              >
                <Trash2 className="mr-2 size-4" /> Löschen
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* KPI-Zeile */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Toolkosten / Monat"
          value={fmtEUR(toolkostenMonat)}
          hint={`${kunde.tools.length} zugeordnete Tools`}
        />
        <KpiCard
          label="Weiterverrechnet / Monat"
          value={fmtEUR(verrechnetSumme)}
          accent="success"
          hint={`inkl. ${kunde.aufschlagProzent} % Aufschlag`}
        />
        {kunde.weiterverrechnet || margeMonat > 0 ? (
          <KpiCard
            label="Marge / Monat"
            value={`+${fmtEUR(margeMonat)}`}
            accent="success"
            hint="Aufschlag-Überschuss"
          />
        ) : (
          <KpiCard
            label="Selbst getragen / Monat"
            value={fmtEUR(toolkostenMonat)}
            accent="warning"
            hint="diese Kosten trägst du selbst"
          />
        )}
        <KpiCard
          label="Hochrechnung Jahr"
          value={fmtEUR(toolkostenMonat * 12)}
          hint={`${kunde.tools.length} Tools`}
        />
      </div>

      {/* Zwei-Spalten */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Hauptspalte */}
        <div className="space-y-6 lg:col-span-2">
          <ToolsCard
            kunde={kunde}
            onToggleWeiter={toggleToolWeiter}
            onRemove={entferneTool}
          />
          <VerlaufCard verlauf={kunde.verlauf} />
          <KostenstrukturCard tools={kunde.tools} />
        </div>

        {/* Seitenspalte */}
        <div className="space-y-6">
          {/* Weiterverrechnung (zuerst auf Mobile, weil zentral) */}
          <div className="order-first">
            <WeiterverrechnungCard
              weiterverrechnet={kunde.weiterverrechnet}
              aufschlagProzent={kunde.aufschlagProzent}
              toolkosten={verrechnetBasis}
              verrechnet={verrechnetSumme}
              marge={margeMonat}
              onToggle={setWeiterverrechnet}
              onAufschlag={setAufschlag}
            />
          </div>
          <KontaktCard
            ansprechpartner={kunde.ansprechpartner}
            email={kunde.email}
            onEdit={() => setEditOpen(true)}
          />
          <NotizenCard
            wert={kunde.notizen}
            onChange={(v) => setKunde((k) => ({ ...k, notizen: v }))}
          />
          <AktivitaetCard items={kunde.aktivitaet} />
        </div>
      </div>

      {editOpen && (
        <EditPanel
          kunde={kunde}
          onClose={() => setEditOpen(false)}
          onSave={(patch) => {
            setKunde((k) => ({ ...k, ...patch }));
            setEditOpen(false);
            toast.success("Kunde aktualisiert");
          }}
        />
      )}

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{kunde.name} wirklich löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Die {kunde.tools.length} zugeordneten Tools stehen danach ohne Kunde da.
              Du kannst sie jederzeit neu zuordnen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => toast.success("Kunde gelöscht")}
            >
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/* ------------ KPI ------------ */

function KpiCard({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: string;
  hint?: string;
  accent?: "success" | "warning";
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="text-xs font-medium text-muted-foreground">{label}</div>
      <div
        className={cn(
          "mt-2 font-display text-2xl font-semibold tabular-nums",
          accent === "success" && "text-success",
          accent === "warning" && "text-warning",
        )}
      >
        {value}
      </div>
      {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}

/* ------------ Tools-Card ------------ */

function ToolsCard({
  kunde,
  onToggleWeiter,
  onRemove,
}: {
  kunde: KundeDetailData;
  onToggleWeiter: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  const summe = kunde.tools.reduce((s, t) => s + t.kostenMonat, 0);
  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b border-border p-5">
        <div>
          <h2 className="font-display text-lg font-semibold">Zugeordnete Tools</h2>
          <p className="text-xs text-muted-foreground">
            {kunde.tools.length} Tools, Pro-Tool-Weiterverrechnung möglich
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={() => toast.info("Auswahl bestehender Abos öffnet sich")}
        >
          <Plus className="size-4" /> Tool zuordnen
        </Button>
      </div>

      {kunde.tools.length === 0 ? (
        <div className="p-10 text-center">
          <p className="text-sm text-muted-foreground">
            Diesem Kunden ist noch kein Tool zugeordnet.
          </p>
          <Button
            className="mt-4 gap-1.5"
            onClick={() => toast.info("Auswahl bestehender Abos öffnet sich")}
          >
            <Plus className="size-4" /> Tool zuordnen
          </Button>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/30 text-left text-xs text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Tool</th>
                  <th className="px-4 py-3 font-medium text-right">Kosten</th>
                  <th className="px-4 py-3 font-medium">Intervall</th>
                  <th className="px-4 py-3 font-medium">Zahlungskanal</th>
                  <th className="px-4 py-3 font-medium">Nächste Abbuchung</th>
                  <th className="px-4 py-3 font-medium">Weiterverrechnet</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {kunde.tools.map((t) => {
                  const istVerrechnet =
                    t.weiterverrechnetOverride ?? kunde.weiterverrechnet;
                  const weichtAb = t.weiterverrechnetOverride !== null;
                  return (
                    <tr
                      key={t.id}
                      className="border-b border-border/60 last:border-0 hover:bg-muted/30"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="grid size-8 shrink-0 place-items-center rounded-lg text-xs font-semibold text-white"
                            style={{ background: t.farbe }}
                          >
                            {t.initial}
                          </div>
                          <div>
                            <div className="font-medium leading-tight">{t.tool}</div>
                            <div className="mt-0.5 inline-flex items-center rounded-full bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                              {t.kategorie}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums font-medium">
                        {fmtEUR(t.rohkosten)}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{t.intervall}</td>
                      <td className="px-4 py-3 text-muted-foreground">{t.zahlungskanal}</td>
                      <td className="px-4 py-3 text-muted-foreground tabular-nums">
                        {fmtDate(t.naechsteAbbuchung)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={istVerrechnet}
                            onCheckedChange={() => onToggleWeiter(t.id)}
                          />
                          {weichtAb && (
                            <span className="inline-flex items-center rounded-full bg-warning/10 px-1.5 py-0.5 text-[10px] font-medium text-warning">
                              abweichend
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-8 text-muted-foreground hover:text-destructive"
                          onClick={() => onRemove(t.id)}
                          aria-label="Aus Kundenzuordnung entfernen"
                        >
                          <X className="size-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-muted/30 font-medium">
                  <td className="px-4 py-3" colSpan={1}>
                    Summe
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {fmtEUR(summe)}{" "}
                    <span className="text-xs font-normal text-muted-foreground">/ Monat</span>
                  </td>
                  <td className="px-4 py-3" colSpan={5} />
                </tr>
              </tfoot>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

/* ------------ Verlauf-Card ------------ */

function VerlaufCard({ verlauf }: { verlauf: { monat: string; wert: number }[] }) {
  if (verlauf.length === 0) return null;
  const max = Math.max(...verlauf.map((v) => v.wert)) * 1.1;
  const min = Math.min(...verlauf.map((v) => v.wert)) * 0.85;
  const W = 600;
  const H = 180;
  const pad = 24;
  const x = (i: number) =>
    pad + (i * (W - pad * 2)) / Math.max(1, verlauf.length - 1);
  const y = (v: number) =>
    H - pad - ((v - min) / Math.max(1, max - min)) * (H - pad * 2);
  const path = verlauf
    .map((p, i) => `${i === 0 ? "M" : "L"} ${x(i).toFixed(1)} ${y(p.wert).toFixed(1)}`)
    .join(" ");
  const area = `${path} L ${x(verlauf.length - 1).toFixed(1)} ${H - pad} L ${pad} ${H - pad} Z`;

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-lg font-semibold">Kostenverlauf</h2>
          <p className="text-xs text-muted-foreground">
            Toolkosten dieses Kunden, letzte 12 Monate
          </p>
        </div>
        <div className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-[11px] font-medium text-success">
          <TrendingUp className="size-3" /> wächst
        </div>
      </div>
      <div className="mt-4 overflow-x-auto">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ minWidth: 480 }}>
          <defs>
            <linearGradient id="kdGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6C5CE7" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#6C5CE7" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={area} fill="url(#kdGrad)" />
          <path d={path} fill="none" stroke="#6C5CE7" strokeWidth="2.5" strokeLinejoin="round" />
          {verlauf.map((p, i) => (
            <g key={p.monat}>
              <circle cx={x(i)} cy={y(p.wert)} r="3" fill="#6C5CE7" />
              <text
                x={x(i)}
                y={H - 6}
                textAnchor="middle"
                className="fill-muted-foreground"
                style={{ fontSize: 10 }}
              >
                {p.monat}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}

/* ------------ Kostenstruktur (Donut) ------------ */

const KATEGORIE_FARBEN: Record<Kategorie, string> = {
  Design: "#a259ff",
  SEO: "#0e7ec6",
  Kommunikation: "#625df5",
  "KI / API": "#cc785c",
  Entwicklung: "#5e6ad2",
  Produktivität: "#12B76A",
  eCommerce: "#95bf47",
};

function KostenstrukturCard({ tools }: { tools: KundeTool[] }) {
  if (tools.length === 0) return null;
  const agg = new Map<Kategorie, number>();
  for (const t of tools) {
    agg.set(t.kategorie, (agg.get(t.kategorie) ?? 0) + t.kostenMonat);
  }
  const data = Array.from(agg.entries()).map(([k, v]) => ({
    kategorie: k,
    wert: v,
    farbe: KATEGORIE_FARBEN[k],
  }));
  const total = data.reduce((s, d) => s + d.wert, 0);

  // Donut SVG
  const R = 60;
  const r = 38;
  const C = 80;
  let acc = 0;
  const segs = data.map((d) => {
    const start = (acc / total) * Math.PI * 2 - Math.PI / 2;
    acc += d.wert;
    const end = (acc / total) * Math.PI * 2 - Math.PI / 2;
    const large = end - start > Math.PI ? 1 : 0;
    const x1 = C + R * Math.cos(start);
    const y1 = C + R * Math.sin(start);
    const x2 = C + R * Math.cos(end);
    const y2 = C + R * Math.sin(end);
    const xi1 = C + r * Math.cos(end);
    const yi1 = C + r * Math.sin(end);
    const xi2 = C + r * Math.cos(start);
    const yi2 = C + r * Math.sin(start);
    return {
      ...d,
      d: `M ${x1} ${y1} A ${R} ${R} 0 ${large} 1 ${x2} ${y2} L ${xi1} ${yi1} A ${r} ${r} 0 ${large} 0 ${xi2} ${yi2} Z`,
    };
  });

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <h2 className="font-display text-lg font-semibold">Kostenstruktur</h2>
      <p className="text-xs text-muted-foreground">
        Aufgeschlüsselt nach Kategorie
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-6">
        <svg width={160} height={160} viewBox="0 0 160 160">
          {segs.map((s) => (
            <path key={s.kategorie} d={s.d} fill={s.farbe} />
          ))}
          <text
            x={C}
            y={C - 2}
            textAnchor="middle"
            className="fill-foreground font-display"
            style={{ fontSize: 14, fontWeight: 600 }}
          >
            {tools.length}
          </text>
          <text
            x={C}
            y={C + 14}
            textAnchor="middle"
            className="fill-muted-foreground"
            style={{ fontSize: 9 }}
          >
            Tools
          </text>
        </svg>
        <ul className="flex-1 min-w-[200px] space-y-2">
          {data
            .sort((a, b) => b.wert - a.wert)
            .map((d) => (
              <li key={d.kategorie} className="flex items-center gap-2 text-sm">
                <span
                  className="inline-block size-2.5 shrink-0 rounded-full"
                  style={{ background: d.farbe }}
                />
                <span className="flex-1 truncate">{d.kategorie}</span>
                <span className="tabular-nums text-muted-foreground">
                  {fmtEUR(d.wert)}
                </span>
                <span className="w-10 text-right text-xs tabular-nums text-muted-foreground">
                  {((d.wert / total) * 100).toFixed(0)}%
                </span>
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
}

/* ------------ Weiterverrechnungs-Card ------------ */

function WeiterverrechnungCard({
  weiterverrechnet,
  aufschlagProzent,
  toolkosten,
  verrechnet,
  marge,
  onToggle,
  onAufschlag,
}: {
  weiterverrechnet: boolean;
  aufschlagProzent: number;
  toolkosten: number;
  verrechnet: number;
  marge: number;
  onToggle: (v: boolean) => void;
  onAufschlag: (v: number) => void;
}) {
  return (
    <div className="rounded-2xl border border-primary/20 bg-card p-5 shadow-md ring-1 ring-primary/5">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-display text-lg font-semibold">Weiterverrechnung</h2>
          <p className="text-xs text-muted-foreground">
            Wie viel davon geht auf die Kundenrechnung
          </p>
        </div>
        <Switch checked={weiterverrechnet} onCheckedChange={onToggle} />
      </div>

      <div className="mt-4 space-y-3">
        <div className="flex items-center gap-2">
          <Label className="text-xs text-muted-foreground" htmlFor="aufschlag">
            Aufschlag
          </Label>
          <div className="relative flex-1">
            <Input
              id="aufschlag"
              type="number"
              min={0}
              max={100}
              value={aufschlagProzent}
              onChange={(e) => onAufschlag(Number(e.target.value) || 0)}
              className="pr-8 tabular-nums"
              disabled={!weiterverrechnet}
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
              %
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-2 text-sm">
          <Row label="Toolkosten" value={fmtEUR(toolkosten)} />
          <Row
            label={`plus Aufschlag ${aufschlagProzent} %`}
            value={`+${fmtEUR(marge)}`}
            accent={weiterverrechnet ? "success" : undefined}
          />
          <div className="my-2 border-t border-border" />
          <Row
            label="Weiterverrechnet"
            value={fmtEUR(verrechnet)}
            strong
          />
          <Row
            label="Marge"
            value={`+${fmtEUR(marge)}`}
            strong
            accent="success"
          />
        </div>

        <Button
          className="w-full gap-1.5"
          onClick={() => toast.success("Weiterverrechnungs-Report wird vorbereitet")}
        >
          <FileText className="size-4" /> Report erstellen
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          fertig zum Anhängen an deine Rechnung
        </p>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  strong,
  accent,
}: {
  label: string;
  value: string;
  strong?: boolean;
  accent?: "success";
}) {
  return (
    <div className="flex items-center justify-between">
      <span className={cn("text-muted-foreground", strong && "text-foreground font-medium")}>
        {label}
      </span>
      <span
        className={cn(
          "tabular-nums",
          strong && "font-semibold",
          accent === "success" && "text-success",
        )}
      >
        {value}
      </span>
    </div>
  );
}

/* ------------ Kontakt + Notizen + Aktivität ------------ */

function KontaktCard({
  ansprechpartner,
  email,
  onEdit,
}: {
  ansprechpartner: string;
  email: string;
  onEdit: () => void;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-base font-semibold">Kontakt</h2>
        <Button variant="ghost" size="sm" onClick={onEdit} className="gap-1">
          <Pencil className="size-3.5" /> bearbeiten
        </Button>
      </div>
      <dl className="mt-3 space-y-2 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <UserIcon className="size-3.5" />
          <dt className="sr-only">Ansprechpartner</dt>
          <dd className="text-foreground">{ansprechpartner}</dd>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Mail className="size-3.5" />
          <dt className="sr-only">E-Mail</dt>
          <dd>
            <a href={`mailto:${email}`} className="text-foreground hover:underline">
              {email}
            </a>
          </dd>
        </div>
      </dl>
    </div>
  );
}

function NotizenCard({
  wert,
  onChange,
}: {
  wert: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <h2 className="font-display text-base font-semibold">Notizen</h2>
      <Textarea
        value={wert}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Notiere hier, was du nicht vergessen willst."
        className="mt-3 min-h-[110px] resize-y"
      />
    </div>
  );
}

function AktivitaetCard({ items }: { items: { ts: string; text: string }[] }) {
  if (items.length === 0) return null;
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <h2 className="font-display text-base font-semibold">Aktivität</h2>
      <ul className="mt-3 space-y-3">
        {items.map((a, i) => (
          <li key={i} className="flex items-start gap-2.5 text-sm">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary/70" />
            <div className="flex-1">
              <div className="text-foreground">{a.text}</div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="size-3" /> {a.ts}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ------------ Edit-Panel (Slide-over light) ------------ */

function EditPanel({
  kunde,
  onClose,
  onSave,
}: {
  kunde: KundeDetailData;
  onClose: () => void;
  onSave: (patch: Partial<KundeDetailData>) => void;
}) {
  const [name, setName] = useState(kunde.name);
  const [ansprechpartner, setAnsprechpartner] = useState(kunde.ansprechpartner);
  const [email, setEmail] = useState(kunde.email);
  const [weiter, setWeiter] = useState(kunde.weiterverrechnet);
  const [aufschlag, setAufschlag] = useState(kunde.aufschlagProzent);

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-foreground/30" onClick={onClose} />
      <div className="relative ml-auto h-full w-full max-w-md overflow-y-auto border-l border-border bg-background p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">Kunde bearbeiten</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="size-4" />
          </Button>
        </div>
        <div className="mt-6 space-y-4">
          <div>
            <Label htmlFor="ed-name">Name</Label>
            <Input id="ed-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="ed-ap">Ansprechpartner</Label>
            <Input
              id="ed-ap"
              value={ansprechpartner}
              onChange={(e) => setAnsprechpartner(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="ed-mail">E-Mail</Label>
            <Input
              id="ed-mail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="flex items-center justify-between rounded-xl border border-border bg-muted/30 p-3">
            <div>
              <div className="text-sm font-medium">Weiterverrechnen</div>
              <div className="text-xs text-muted-foreground">
                Toolkosten gehen auf die Kundenrechnung
              </div>
            </div>
            <Switch checked={weiter} onCheckedChange={setWeiter} />
          </div>
          <div>
            <Label htmlFor="ed-auf">Aufschlag in Prozent</Label>
            <Input
              id="ed-auf"
              type="number"
              min={0}
              max={100}
              value={aufschlag}
              onChange={(e) => setAufschlag(Number(e.target.value) || 0)}
              disabled={!weiter}
            />
          </div>
        </div>
        <div className="mt-6 flex items-center justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Abbrechen
          </Button>
          <Button
            onClick={() =>
              onSave({
                name,
                ansprechpartner,
                email,
                weiterverrechnet: weiter,
                aufschlagProzent: aufschlag,
              })
            }
          >
            Speichern
          </Button>
        </div>
      </div>
    </div>
  );
}
