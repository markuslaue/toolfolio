import { useMemo, useState } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  MessageCircle,
  AlertTriangle,
  Lightbulb,
  Gauge,
  Wallet,
  Plus,
  Search,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

// ---------- Typen ----------
type Status = "ausstehend" | "genehmigt" | "abgelehnt";

type KontextTyp = "redundanz" | "alternative" | "benchmark" | "budget";
type Kontext = { typ: KontextTyp; text: string };

type Antrag = {
  id: string;
  toolName: string;
  toolFarbe: string;
  kategorie: string;
  antragstellerName: string;
  antragstellerFarbe: string;
  datum: string;
  status: Status;
  zweck: string;
  kosten: number;
  intervall: "monatlich" | "jährlich";
  fuer: string; // intern / Kunde
  kontext: Kontext[];
  begruendungAblehnung?: string;
  kommentare?: { autor: string; text: string }[];
  ausEigenerSicht?: boolean; // "Meine Anträge"
};

// ---------- Mock ----------
const initial: Antrag[] = [
  {
    id: "a1",
    toolName: "Linear",
    toolFarbe: "#6C5CE7",
    kategorie: "Projektmanagement",
    antragstellerName: "Tom K.",
    antragstellerFarbe: "#12B76A",
    datum: "vor 2 Stunden",
    status: "ausstehend",
    zweck: "Schnellere Issue-Verfolgung im Entwicklungsteam, bessere Sprint-Sicht.",
    kosten: 56,
    intervall: "monatlich",
    fuer: "intern",
    kontext: [
      {
        typ: "redundanz",
        text: "Ihr nutzt bereits Asana für Projektmanagement, mögliche Doppelung.",
      },
    ],
  },
  {
    id: "a2",
    toolName: "Loom",
    toolFarbe: "#FF7A66",
    kategorie: "Video",
    antragstellerName: "Sara B.",
    antragstellerFarbe: "#F5A623",
    datum: "gestern",
    status: "ausstehend",
    zweck: "Async-Video-Updates für Kundenfreigaben statt 30-Minuten-Meetings.",
    kosten: 15,
    intervall: "monatlich",
    fuer: "Kunde Nordwerk",
    kontext: [
      {
        typ: "alternative",
        text: "Im Verzeichnis gibt es eine günstigere Option (Tella, 8,00 € / Mon.).",
      },
    ],
  },
  {
    id: "a3",
    toolName: "Procreate Pro",
    toolFarbe: "#F0533D",
    kategorie: "Design",
    antragstellerName: "Lena M.",
    antragstellerFarbe: "#FF7A66",
    datum: "vor 3 Tagen",
    status: "ausstehend",
    zweck: "Illustrationen und Iconwork für Kundenprojekte.",
    kosten: 49,
    intervall: "monatlich",
    fuer: "intern",
    kontext: [
      {
        typ: "budget",
        text: "Das würde das Kategorie-Budget Design dieses Jahr um 120,00 € überschreiten.",
      },
      {
        typ: "benchmark",
        text: "Der beantragte Preis liegt 18 % über dem Median vergleichbarer Agenturen.",
      },
    ],
  },
  // Historie
  {
    id: "a4",
    toolName: "Notion",
    toolFarbe: "#1F1D2B",
    kategorie: "Wissen",
    antragstellerName: "Tom K.",
    antragstellerFarbe: "#12B76A",
    datum: "vor 1 Woche",
    status: "genehmigt",
    zweck: "Zentrale Wissensbasis für Onboarding.",
    kosten: 32,
    intervall: "monatlich",
    fuer: "intern",
    kontext: [],
  },
  {
    id: "a5",
    toolName: "Webflow Site Plan",
    toolFarbe: "#6C5CE7",
    kategorie: "Web",
    antragstellerName: "Sara B.",
    antragstellerFarbe: "#F5A623",
    datum: "vor 2 Wochen",
    status: "abgelehnt",
    zweck: "Landingpage für Kampagne.",
    kosten: 39,
    intervall: "monatlich",
    fuer: "Kunde Mertens",
    kontext: [
      {
        typ: "redundanz",
        text: "Framer ist bereits im Stack, gleiche Funktion.",
      },
    ],
    begruendungAblehnung:
      "Framer deckt den Anwendungsfall ab. Bitte dort eine Subdomain anlegen.",
  },
  // Eigene Anträge (Demo-Sicht)
  {
    id: "a6",
    toolName: "Raycast Pro",
    toolFarbe: "#FF7A66",
    kategorie: "Produktivität",
    antragstellerName: "Markus L.",
    antragstellerFarbe: "#6C5CE7",
    datum: "vor 4 Tagen",
    status: "ausstehend",
    zweck: "KI-Quick-Actions im Alltag.",
    kosten: 10,
    intervall: "monatlich",
    fuer: "intern",
    kontext: [],
    ausEigenerSicht: true,
  },
];

const euro = (n: number) =>
  n.toLocaleString("de-DE", { style: "currency", currency: "EUR" });

const verzeichnisVorschlaege = [
  { name: "Linear", kategorie: "Projektmanagement", preis: 8, farbe: "#6C5CE7" },
  { name: "Asana", kategorie: "Projektmanagement", preis: 12, farbe: "#F0533D" },
  { name: "Loom", kategorie: "Video", preis: 15, farbe: "#FF7A66" },
  { name: "Tella", kategorie: "Video", preis: 8, farbe: "#12B76A" },
  { name: "Figma", kategorie: "Design", preis: 15, farbe: "#FF7A66" },
  { name: "Notion", kategorie: "Wissen", preis: 10, farbe: "#1F1D2B" },
];

// ---------- Komponente ----------
export function Freigaben() {
  const [antraege, setAntraege] = useState<Antrag[]>(initial);
  const [tab, setTab] = useState<"offen" | "meine" | "alle">("offen");
  const [neuerAntragOpen, setNeuerAntragOpen] = useState(false);
  const [ablehnenFor, setAblehnenFor] = useState<Antrag | null>(null);
  const [rueckfrageFor, setRueckfrageFor] = useState<Antrag | null>(null);
  const [genehmigtFor, setGenehmigtFor] = useState<Antrag | null>(null);

  const offen = antraege.filter((a) => a.status === "ausstehend" && !a.ausEigenerSicht);
  const meine = antraege.filter((a) => a.ausEigenerSicht);
  const alle = antraege;

  const kpi = useMemo(() => {
    const zuGenehmigen = offen.length;
    const genehmigtDiesenMonat = antraege.filter((a) => a.status === "genehmigt").length + 4;
    const genehmigtKosten =
      antraege
        .filter((a) => a.status === "genehmigt")
        .reduce((s, a) => s + (a.intervall === "monatlich" ? a.kosten : a.kosten / 12), 0) +
      78;
    const abgelehnt = antraege.filter((a) => a.status === "abgelehnt").length + 1;
    const vermieden =
      antraege
        .filter((a) => a.status === "abgelehnt")
        .reduce((s, a) => s + (a.intervall === "monatlich" ? a.kosten : a.kosten / 12), 0) +
      42;
    return { zuGenehmigen, genehmigtDiesenMonat, genehmigtKosten, abgelehnt, vermieden };
  }, [antraege, offen.length]);

  const liste = tab === "offen" ? offen : tab === "meine" ? meine : alle;

  const genehmigen = (a: Antrag) => {
    setAntraege((prev) =>
      prev.map((x) => (x.id === a.id ? { ...x, status: "genehmigt" as const } : x))
    );
    setGenehmigtFor(a);
    toast.success(`${a.toolName} genehmigt`);
  };

  return (
    <div className="space-y-6">
      {/* Kopf */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            Freigaben
          </h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-xl">
            Tools beantragen und freigeben, bevor sie Geld kosten.
          </p>
        </div>
        <Button className="gap-2" onClick={() => setNeuerAntragOpen(true)}>
          <Plus className="size-4" /> Tool beantragen
        </Button>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <KpiCard
          icon={<Clock className="size-4" />}
          label="Zu genehmigen"
          value={kpi.zuGenehmigen}
          hint={kpi.zuGenehmigen > 0 ? "offene Anträge warten" : "alles erledigt"}
          accent={kpi.zuGenehmigen > 0 ? "amber" : undefined}
        />
        <KpiCard
          icon={<CheckCircle2 className="size-4" />}
          label="Diesen Monat genehmigt"
          value={kpi.genehmigtDiesenMonat}
          hint={`+ ${euro(kpi.genehmigtKosten)} / Mon. neue Kosten`}
        />
        <KpiCard
          icon={<XCircle className="size-4" />}
          label="Abgelehnt"
          value={kpi.abgelehnt}
          hint={`${euro(kpi.vermieden)} / Mon. vermieden`}
        />
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 rounded-full bg-card border border-border p-1 w-fit text-sm">
        {[
          { id: "offen" as const, label: "Zu genehmigen", count: offen.length },
          { id: "meine" as const, label: "Meine Anträge", count: meine.length },
          { id: "alle" as const, label: "Alle Anträge", count: alle.length },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-1.5 rounded-full font-medium transition flex items-center gap-2 ${
              tab === t.id
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
            <span
              className={`inline-flex items-center justify-center min-w-5 h-5 rounded-full px-1.5 text-[10px] font-semibold ${
                tab === t.id ? "bg-white/20" : "bg-muted text-foreground"
              }`}
            >
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* Liste */}
      {liste.length === 0 ? (
        <div className="rounded-[20px] border border-dashed border-border bg-card/50 p-10 text-center">
          <ShieldCheck className="size-8 mx-auto text-primary" />
          <div className="mt-3 font-display text-lg font-semibold">
            Aktuell keine offenen Anträge
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Sobald jemand ein Tool beantragt, taucht es hier auf.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {liste.map((a) => (
            <AntragsKarte
              key={a.id}
              antrag={a}
              showActions={tab === "offen" && a.status === "ausstehend"}
              onGenehmigen={() => genehmigen(a)}
              onAblehnen={() => setAblehnenFor(a)}
              onRueckfrage={() => setRueckfrageFor(a)}
            />
          ))}
        </div>
      )}

      {/* Neuer Antrag */}
      <Sheet open={neuerAntragOpen} onOpenChange={setNeuerAntragOpen}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          <NeuerAntrag
            onSubmit={(antrag) => {
              setAntraege((prev) => [{ ...antrag, ausEigenerSicht: true }, ...prev]);
              toast.success("Antrag versendet. Genehmiger wurde benachrichtigt.");
              setNeuerAntragOpen(false);
              setTab("meine");
            }}
          />
        </SheetContent>
      </Sheet>

      {/* Ablehnen */}
      {ablehnenFor && (
        <DialogShell onClose={() => setAblehnenFor(null)}>
          <AblehnenForm
            antrag={ablehnenFor}
            onConfirm={(grund) => {
              setAntraege((prev) =>
                prev.map((x) =>
                  x.id === ablehnenFor.id
                    ? { ...x, status: "abgelehnt" as const, begruendungAblehnung: grund }
                    : x
                )
              );
              toast.success(`${ablehnenFor.toolName} abgelehnt`);
              setAblehnenFor(null);
            }}
          />
        </DialogShell>
      )}

      {/* Rückfrage */}
      {rueckfrageFor && (
        <DialogShell onClose={() => setRueckfrageFor(null)}>
          <RueckfrageForm
            antrag={rueckfrageFor}
            onConfirm={(text) => {
              setAntraege((prev) =>
                prev.map((x) =>
                  x.id === rueckfrageFor.id
                    ? {
                        ...x,
                        kommentare: [
                          ...(x.kommentare ?? []),
                          { autor: "Markus L. (Genehmiger)", text },
                        ],
                      }
                    : x
                )
              );
              toast.success("Rückfrage an Antragsteller gesendet");
              setRueckfrageFor(null);
            }}
          />
        </DialogShell>
      )}

      {/* Nach Genehmigung: Abo anlegen? */}
      {genehmigtFor && (
        <DialogShell onClose={() => setGenehmigtFor(null)}>
          <div className="p-1">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-emerald-100 grid place-items-center">
                <CheckCircle2 className="size-5 text-emerald-600" />
              </div>
              <div>
                <div className="font-display text-lg font-semibold">
                  {genehmigtFor.toolName} ist genehmigt
                </div>
                <p className="text-xs text-muted-foreground">
                  Möchtest du es direkt als Abo anlegen?
                </p>
              </div>
            </div>
            <div className="mt-4 rounded-xl bg-muted/40 p-3 text-sm space-y-1">
              <div>
                <span className="text-muted-foreground">Kosten: </span>
                <span className="font-semibold tabular-nums">
                  {euro(genehmigtFor.kosten)} / {genehmigtFor.intervall === "monatlich" ? "Mon." : "Jahr"}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Für: </span>
                {genehmigtFor.fuer}
              </div>
              <div>
                <span className="text-muted-foreground">Kategorie: </span>
                {genehmigtFor.kategorie}
              </div>
            </div>
            <div className="mt-5 flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setGenehmigtFor(null)}>
                Später
              </Button>
              <Button
                className="flex-1 gap-2"
                onClick={() => {
                  toast.success("Abo-Formular geöffnet (vorbefüllt)");
                  setGenehmigtFor(null);
                }}
              >
                Als Abo anlegen
              </Button>
            </div>
          </div>
        </DialogShell>
      )}
    </div>
  );
}

// ---------- Karte ----------
function AntragsKarte({
  antrag,
  showActions,
  onGenehmigen,
  onAblehnen,
  onRueckfrage,
}: {
  antrag: Antrag;
  showActions: boolean;
  onGenehmigen: () => void;
  onAblehnen: () => void;
  onRueckfrage: () => void;
}) {
  return (
    <div className="rounded-[20px] bg-card border border-border p-5 shadow-sm hover:shadow-md hover:-translate-y-px transition">
      <div className="flex flex-wrap items-start gap-4">
        <div
          className="size-12 rounded-2xl grid place-items-center text-white font-display font-bold text-lg shrink-0"
          style={{ background: antrag.toolFarbe }}
        >
          {antrag.toolName[0]}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <div className="font-semibold">{antrag.toolName}</div>
            <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              {antrag.kategorie}
            </span>
            <StatusPill status={antrag.status} />
          </div>
          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
            <Avatar name={antrag.antragstellerName} color={antrag.antragstellerFarbe} />
            <span>{antrag.antragstellerName}</span>
            <span>·</span>
            <span>{antrag.datum}</span>
            <span>·</span>
            <span>{antrag.fuer}</span>
          </div>
          <p className="mt-2 text-sm text-foreground/90">{antrag.zweck}</p>
        </div>
        <div className="text-right shrink-0">
          <div className="text-xs text-muted-foreground">Erwartete Kosten</div>
          <div className="font-display text-2xl font-semibold tabular-nums leading-none">
            {euro(antrag.kosten)}
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">
            / {antrag.intervall === "monatlich" ? "Monat" : "Jahr"}
          </div>
        </div>
      </div>

      {antrag.kontext.length > 0 && (
        <div className="mt-4 space-y-2">
          {antrag.kontext.map((k, i) => (
            <KontextZeile key={i} k={k} />
          ))}
        </div>
      )}

      {antrag.begruendungAblehnung && (
        <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-800">
          <span className="font-semibold">Ablehnungsgrund: </span>
          {antrag.begruendungAblehnung}
        </div>
      )}

      {antrag.kommentare && antrag.kommentare.length > 0 && (
        <div className="mt-3 space-y-2">
          {antrag.kommentare.map((c, i) => (
            <div key={i} className="rounded-xl bg-muted/40 p-3 text-xs">
              <div className="font-semibold mb-0.5">{c.autor}</div>
              <div className="text-muted-foreground">{c.text}</div>
            </div>
          ))}
        </div>
      )}

      {showActions && (
        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            className="gap-2 bg-[#12B76A] hover:bg-[#0fa15c] text-white"
            onClick={onGenehmigen}
          >
            <CheckCircle2 className="size-4" /> Genehmigen
          </Button>
          <Button
            variant="outline"
            className="gap-2 text-[#F0533D] border-[#F0533D]/40 hover:bg-[#F0533D]/10"
            onClick={onAblehnen}
          >
            <XCircle className="size-4" /> Ablehnen
          </Button>
          <Button variant="ghost" className="gap-2" onClick={onRueckfrage}>
            <MessageCircle className="size-4" /> Rückfrage
          </Button>
        </div>
      )}
    </div>
  );
}

function KontextZeile({ k }: { k: Kontext }) {
  const meta = {
    redundanz: { icon: AlertTriangle, color: "#F5A623", label: "Redundanz" },
    alternative: { icon: Lightbulb, color: "#F5A623", label: "Günstigere Alternative" },
    benchmark: { icon: Gauge, color: "#F5A623", label: "Benchmark" },
    budget: { icon: Wallet, color: "#F0533D", label: "Budgetwirkung" },
  }[k.typ];
  const Icon = meta.icon;
  return (
    <div
      className="flex items-start gap-2 rounded-xl border p-3 text-xs"
      style={{
        background: `${meta.color}10`,
        borderColor: `${meta.color}40`,
      }}
    >
      <Icon className="size-4 shrink-0 mt-0.5" style={{ color: meta.color }} />
      <div>
        <div className="font-semibold" style={{ color: meta.color }}>
          {meta.label}
        </div>
        <div className="text-foreground/80 mt-0.5">{k.text}</div>
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: Status }) {
  if (status === "genehmigt")
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 px-2 py-0.5 text-xs font-medium">
        <CheckCircle2 className="size-3" /> genehmigt
      </span>
    );
  if (status === "abgelehnt")
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-50 text-red-700 px-2 py-0.5 text-xs font-medium">
        <XCircle className="size-3" /> abgelehnt
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 text-amber-700 px-2 py-0.5 text-xs font-medium">
      <Clock className="size-3" /> ausstehend
    </span>
  );
}

function Avatar({ name, color }: { name: string; color: string }) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2);
  return (
    <div
      className="size-5 rounded-full grid place-items-center text-white text-[10px] font-semibold"
      style={{ background: color }}
    >
      {initials}
    </div>
  );
}

// ---------- KPI ----------
function KpiCard({
  icon,
  label,
  value,
  hint,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  hint?: string;
  accent?: "amber";
}) {
  return (
    <div
      className="rounded-[20px] bg-card border border-border p-4 shadow-sm"
      style={accent === "amber" ? { borderColor: "#F5A62355" } : undefined}
    >
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {icon} {label}
      </div>
      <div
        className="mt-2 font-display text-3xl font-semibold tabular-nums leading-none"
        style={accent === "amber" ? { color: "#B07A1A" } : undefined}
      >
        {value}
      </div>
      {hint && <div className="mt-2 text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}

// ---------- Neuer Antrag ----------
function NeuerAntrag({ onSubmit }: { onSubmit: (a: Antrag) => void }) {
  const [suche, setSuche] = useState("");
  const [gewaehlt, setGewaehlt] = useState<(typeof verzeichnisVorschlaege)[number] | null>(null);
  const [manuellName, setManuellName] = useState("");
  const [manuellKategorie, setManuellKategorie] = useState("");
  const [zweck, setZweck] = useState("");
  const [kosten, setKosten] = useState<string>("");
  const [intervall, setIntervall] = useState<"monatlich" | "jährlich">("monatlich");
  const [fuer, setFuer] = useState("intern");

  const treffer = verzeichnisVorschlaege.filter((v) =>
    v.name.toLowerCase().includes(suche.toLowerCase())
  );

  const aktuellName = gewaehlt?.name || manuellName;
  const aktuellKategorie = gewaehlt?.kategorie || manuellKategorie;
  const aktuellKosten = Number(kosten) || gewaehlt?.preis || 0;

  // Vorab-Kontext für den Antragsteller (Demo-Heuristik)
  const vorabKontext: Kontext[] = useMemo(() => {
    const k: Kontext[] = [];
    if (aktuellKategorie === "Projektmanagement")
      k.push({
        typ: "redundanz",
        text: "Asana ist bereits im Stack. Genehmiger werden auf eine mögliche Doppelung hingewiesen.",
      });
    const alternative = verzeichnisVorschlaege
      .filter((v) => v.kategorie === aktuellKategorie && v.preis < aktuellKosten)
      .sort((a, b) => a.preis - b.preis)[0];
    if (alternative && aktuellName && alternative.name !== aktuellName)
      k.push({
        typ: "alternative",
        text: `Günstigere Option im Verzeichnis: ${alternative.name} (${euro(alternative.preis)} / Mon.).`,
      });
    return k;
  }, [aktuellKategorie, aktuellKosten, aktuellName]);

  const kannAbsenden = aktuellName && zweck && aktuellKosten > 0;

  return (
    <>
      <SheetHeader>
        <SheetTitle className="font-display">Tool beantragen</SheetTitle>
        <SheetDescription>
          Wähle ein Tool, beschreibe den Zweck und nenne die erwarteten Kosten.
        </SheetDescription>
      </SheetHeader>

      <div className="mt-5 space-y-5">
        {/* Verzeichnis-Suche */}
        <div className="space-y-2">
          <Label>Tool aus Verzeichnis</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Tool suchen, z. B. Linear"
              value={suche}
              onChange={(e) => {
                setSuche(e.target.value);
                setGewaehlt(null);
              }}
            />
          </div>
          {suche && !gewaehlt && (
            <div className="rounded-xl border border-border bg-card max-h-48 overflow-y-auto">
              {treffer.length === 0 ? (
                <div className="p-3 text-xs text-muted-foreground">
                  Nichts gefunden. Unten manuell eintragen.
                </div>
              ) : (
                treffer.map((v) => (
                  <button
                    key={v.name}
                    className="w-full flex items-center gap-3 p-2 hover:bg-accent text-left"
                    onClick={() => {
                      setGewaehlt(v);
                      setSuche(v.name);
                      setKosten(String(v.preis));
                    }}
                  >
                    <div
                      className="size-8 rounded-lg grid place-items-center text-white font-semibold"
                      style={{ background: v.farbe }}
                    >
                      {v.name[0]}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{v.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {v.kategorie} · Richtpreis {euro(v.preis)} / Mon.
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
          <div className="text-xs text-muted-foreground">
            Nicht im Verzeichnis? Trag Name und Kategorie manuell ein:
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Input
              placeholder="Tool-Name"
              value={manuellName}
              onChange={(e) => {
                setManuellName(e.target.value);
                setGewaehlt(null);
              }}
            />
            <Input
              placeholder="Kategorie"
              value={manuellKategorie}
              onChange={(e) => setManuellKategorie(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Zweck / Begründung</Label>
          <Textarea
            rows={3}
            placeholder="Wofür brauchst du das Tool und welches Problem löst es?"
            value={zweck}
            onChange={(e) => setZweck(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-2">
            <Label>Kosten (€)</Label>
            <Input
              type="number"
              placeholder="0,00"
              value={kosten}
              onChange={(e) => setKosten(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Intervall</Label>
            <select
              value={intervall}
              onChange={(e) => setIntervall(e.target.value as "monatlich" | "jährlich")}
              className="w-full h-9 rounded-md border border-border bg-background px-3 text-sm"
            >
              <option value="monatlich">monatlich</option>
              <option value="jährlich">jährlich</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Für wen</Label>
          <select
            value={fuer}
            onChange={(e) => setFuer(e.target.value)}
            className="w-full h-9 rounded-md border border-border bg-background px-3 text-sm"
          >
            <option value="intern">intern</option>
            <option value="Kunde Nordwerk">Kunde Nordwerk</option>
            <option value="Kunde Mertens">Kunde Mertens</option>
            <option value="Kunde Brauwerk">Kunde Brauwerk</option>
          </select>
        </div>

        {vorabKontext.length > 0 && (
          <div className="space-y-2">
            <Label className="text-xs">Das wird der Genehmiger sehen</Label>
            {vorabKontext.map((k, i) => (
              <KontextZeile key={i} k={k} />
            ))}
          </div>
        )}

        <Button
          className="w-full gap-2"
          disabled={!kannAbsenden}
          onClick={() =>
            onSubmit({
              id: `n${Date.now()}`,
              toolName: aktuellName,
              toolFarbe: gewaehlt?.farbe || "#6C5CE7",
              kategorie: aktuellKategorie || "Sonstiges",
              antragstellerName: "Markus L.",
              antragstellerFarbe: "#6C5CE7",
              datum: "gerade eben",
              status: "ausstehend",
              zweck,
              kosten: aktuellKosten,
              intervall,
              fuer,
              kontext: vorabKontext,
            })
          }
        >
          <Send className="size-4" /> Antrag senden
        </Button>
      </div>
    </>
  );
}

// ---------- Ablehnen / Rückfrage ----------
function DialogShell({
  onClose,
  children,
}: {
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-foreground/30 p-4"
      onClick={onClose}
    >
      <div
        className="bg-card rounded-2xl border border-border w-full max-w-md p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

function AblehnenForm({
  antrag,
  onConfirm,
}: {
  antrag: Antrag;
  onConfirm: (grund: string) => void;
}) {
  const [grund, setGrund] = useState("");
  return (
    <div>
      <div className="font-display text-lg font-semibold">
        {antrag.toolName} ablehnen
      </div>
      <p className="text-xs text-muted-foreground mt-1">
        Begründe deine Entscheidung kurz, damit {antrag.antragstellerName} sie nachvollziehen kann.
      </p>
      <Textarea
        rows={4}
        className="mt-3"
        placeholder="Z. B. Asana deckt diesen Anwendungsfall bereits ab."
        value={grund}
        onChange={(e) => setGrund(e.target.value)}
      />
      <div className="mt-4 flex gap-2">
        <Button
          className="flex-1 bg-[#F0533D] hover:bg-[#d8442e] text-white"
          disabled={!grund.trim()}
          onClick={() => onConfirm(grund.trim())}
        >
          Ablehnen
        </Button>
      </div>
    </div>
  );
}

function RueckfrageForm({
  antrag,
  onConfirm,
}: {
  antrag: Antrag;
  onConfirm: (text: string) => void;
}) {
  const [text, setText] = useState("");
  return (
    <div>
      <div className="font-display text-lg font-semibold">
        Rückfrage zu {antrag.toolName}
      </div>
      <p className="text-xs text-muted-foreground mt-1">
        Der Antrag bleibt offen. {antrag.antragstellerName} erhält deinen Kommentar.
      </p>
      <Textarea
        rows={4}
        className="mt-3"
        placeholder="Z. B. Reicht der bestehende Slack-Workspace nicht aus?"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <div className="mt-4 flex gap-2">
        <Button
          className="flex-1 gap-2"
          disabled={!text.trim()}
          onClick={() => onConfirm(text.trim())}
        >
          <Send className="size-4" /> Senden
        </Button>
      </div>
    </div>
  );
}
