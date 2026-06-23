import { useMemo, useState } from "react";
import {
  FileText,
  BarChart3,
  PieChart,
  Receipt,
  Download,
  FileDown,
  Save,
  Building2,
  CalendarDays,
  Check,
  Sparkles,
  ArrowRight,
  Printer,
} from "lucide-react";
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
import { toast } from "sonner";
import { Link } from "@tanstack/react-router";

type ReportTyp = "weiterverrechnung" | "ausgaben" | "verteilung" | "datev";

type Tool = {
  name: string;
  kategorie: string;
  kosten: number;
  weiterverrechnet: boolean;
};

type Kunde = {
  id: string;
  name: string;
  aufschlagProzent: number;
  tools: Tool[];
};

const kunden: Kunde[] = [
  {
    id: "vitalplant",
    name: "Vitalplant",
    aufschlagProzent: 15,
    tools: [
      { name: "Figma", kategorie: "Design", kosten: 180, weiterverrechnet: true },
      { name: "OpenAI", kategorie: "AI", kosten: 220, weiterverrechnet: true },
      { name: "Shopify", kategorie: "Commerce", kosten: 180, weiterverrechnet: true },
      { name: "Canva", kategorie: "Design", kosten: 60, weiterverrechnet: true },
      { name: "Linear", kategorie: "Projekt", kosten: 80, weiterverrechnet: true },
      { name: "Loom", kategorie: "Video", kosten: 80, weiterverrechnet: true },
      { name: "Slack", kategorie: "Kommunikation", kosten: 45, weiterverrechnet: false },
      { name: "Notion", kategorie: "Wissen", kosten: 32, weiterverrechnet: false },
    ],
  },
  {
    id: "fulex",
    name: "FULEX",
    aufschlagProzent: 20,
    tools: [
      { name: "Webflow", kategorie: "Web", kosten: 290, weiterverrechnet: true },
      { name: "Ahrefs", kategorie: "SEO", kosten: 199, weiterverrechnet: true },
      { name: "Mailchimp", kategorie: "E-Mail", kosten: 89, weiterverrechnet: true },
      { name: "Adobe CC", kategorie: "Design", kosten: 240, weiterverrechnet: true },
    ],
  },
  {
    id: "nordpunkt",
    name: "Nordpunkt",
    aufschlagProzent: 10,
    tools: [
      { name: "Notion", kategorie: "Wissen", kosten: 32, weiterverrechnet: true },
      { name: "Calendly", kategorie: "Termine", kosten: 24, weiterverrechnet: true },
    ],
  },
  {
    id: "kustkraft",
    name: "Küstkraft",
    aufschlagProzent: 0,
    tools: [
      { name: "Slack", kategorie: "Kommunikation", kosten: 45, weiterverrechnet: false },
    ],
  },
];

type Zeitraum = "monat" | "quartal" | "jahr" | "frei";
const zeitraumLabel: Record<Zeitraum, string> = {
  monat: "Juni 2026",
  quartal: "Q2 2026",
  jahr: "Jahr 2026",
  frei: "01.06.2026 bis 30.06.2026",
};

type Verlauf = {
  id: string;
  typ: ReportTyp;
  titel: string;
  kunde?: string;
  zeitraum: string;
  datum: string;
  betrag?: number;
};

const initialVerlauf: Verlauf[] = [
  {
    id: "h1",
    typ: "weiterverrechnung",
    titel: "Weiterverrechnung Software-Tools",
    kunde: "FULEX",
    zeitraum: "Mai 2026",
    datum: "02.06.2026",
    betrag: 980.4,
  },
  {
    id: "h2",
    typ: "ausgaben",
    titel: "Ausgaben-Report",
    zeitraum: "Q1 2026",
    datum: "05.04.2026",
    betrag: 7245.0,
  },
  {
    id: "h3",
    typ: "weiterverrechnung",
    titel: "Weiterverrechnung Software-Tools",
    kunde: "Vitalplant",
    zeitraum: "Mai 2026",
    datum: "01.06.2026",
    betrag: 920.0,
  },
];

const euro = (n: number) =>
  n.toLocaleString("de-DE", { style: "currency", currency: "EUR" });

function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-3xl bg-card border border-border shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

function TypCard({
  active,
  icon: Icon,
  titel,
  text,
  badge,
  onClick,
}: {
  active: boolean;
  icon: React.ComponentType<{ className?: string }>;
  titel: string;
  text: string;
  badge?: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`text-left rounded-3xl border p-5 transition-all hover:-translate-y-0.5 hover:shadow-md ${
        active
          ? "border-primary bg-primary/5 ring-1 ring-primary"
          : "border-border bg-card"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className={`size-10 rounded-2xl grid place-items-center ${
            active ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
          }`}
        >
          <Icon className="size-5" />
        </div>
        {badge && (
          <span className="rounded-full bg-accent px-2.5 py-0.5 text-[11px] font-semibold text-accent-foreground">
            {badge}
          </span>
        )}
      </div>
      <div className="mt-4 font-display text-base font-semibold leading-tight">
        {titel}
      </div>
      <div className="mt-1 text-sm text-muted-foreground">{text}</div>
    </button>
  );
}

export function Berichte() {
  const [typ, setTyp] = useState<ReportTyp>("weiterverrechnung");
  const [kundeId, setKundeId] = useState("vitalplant");
  const [zeitraum, setZeitraum] = useState<Zeitraum>("monat");
  const [nurWeiter, setNurWeiter] = useState(true);
  const [aufschlagAusweisen, setAufschlagAusweisen] = useState(true);
  const [logoAnzeigen, setLogoAnzeigen] = useState(true);
  const [format, setFormat] = useState<"pdf" | "csv">("pdf");
  const [verlauf, setVerlauf] = useState<Verlauf[]>(initialVerlauf);

  const kunde = kunden.find((k) => k.id === kundeId)!;

  const sichtbareTools = useMemo(
    () => (nurWeiter ? kunde.tools.filter((t) => t.weiterverrechnet) : kunde.tools),
    [kunde, nurWeiter]
  );

  const summen = useMemo(() => {
    const kosten = sichtbareTools
      .filter((t) => t.weiterverrechnet || !nurWeiter)
      .filter((t) => (nurWeiter ? t.weiterverrechnet : true))
      .reduce((s, t) => s + (t.weiterverrechnet ? t.kosten : 0), 0);
    const aufschlag = kosten * (kunde.aufschlagProzent / 100);
    return { kosten, aufschlag, gesamt: kosten + aufschlag };
  }, [sichtbareTools, kunde.aufschlagProzent, nurWeiter]);

  const speichern = () => {
    const titel =
      typ === "weiterverrechnung"
        ? "Weiterverrechnung Software-Tools"
        : typ === "ausgaben"
        ? "Ausgaben-Report"
        : "Verteilungs-Report";
    const neu: Verlauf = {
      id: `h${Date.now()}`,
      typ,
      titel,
      kunde: typ === "weiterverrechnung" ? kunde.name : undefined,
      zeitraum: zeitraumLabel[zeitraum],
      datum: new Date().toLocaleDateString("de-DE"),
      betrag: typ === "weiterverrechnung" ? summen.gesamt : undefined,
    };
    setVerlauf((v) => [neu, ...v]);
    toast.success("Bericht im Verlauf gespeichert");
  };

  const exportieren = (f: "pdf" | "csv") => {
    toast.success(
      f === "pdf" ? "PDF wird vorbereitet (Demo)" : "CSV wird vorbereitet (Demo)"
    );
  };

  return (
    <div className="space-y-6">
      {/* Kopf */}
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight">
          Berichte
        </h1>
        <p className="text-muted-foreground max-w-2xl">
          Auswertungen und fertige Dokumente für deine Kunden. Wähle einen
          Bericht, passe die Parameter an und exportiere ihn als PDF oder CSV.
        </p>
      </div>

      {/* Typ-Auswahl */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <TypCard
          active={typ === "weiterverrechnung"}
          onClick={() => setTyp("weiterverrechnung")}
          icon={Receipt}
          titel="Weiterverrechnungs-Report"
          text="Pro Kunde: Toolkosten, Aufschlag und Endbetrag für die Rechnung."
          badge="Standard"
        />
        <TypCard
          active={typ === "ausgaben"}
          onClick={() => setTyp("ausgaben")}
          icon={BarChart3}
          titel="Ausgaben-Report"
          text="Gesamtkosten über einen Zeitraum, mit Monatsverlauf und Vergleich."
        />
        <TypCard
          active={typ === "verteilung"}
          onClick={() => setTyp("verteilung")}
          icon={PieChart}
          titel="Kosten nach Kunde, Kategorie oder Kanal"
          text="Verteilungs-Auswertung als Tabelle und Diagramm."
        />
        <TypCard
          active={typ === "datev"}
          onClick={() => setTyp("datev")}
          icon={FileText}
          titel="Steuer-Export (DATEV)"
          text="Eigener Export für die Buchhaltung."
          badge="DATEV"
        />
      </div>

      {/* Builder + Vorschau */}
      <div className="grid gap-6 lg:grid-cols-[340px,1fr]">
        {/* Builder */}
        <Card className="p-5 h-fit">
          <div className="font-display text-lg font-semibold">Parameter</div>
          <div className="text-sm text-muted-foreground">
            Änderungen aktualisieren die Vorschau sofort.
          </div>

          {typ === "weiterverrechnung" && (
            <div className="mt-5 space-y-4">
              <div>
                <Label className="text-xs font-medium text-muted-foreground">
                  Kunde
                </Label>
                <Select value={kundeId} onValueChange={setKundeId}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {kunden.map((k) => (
                      <SelectItem key={k.id} value={k.id}>
                        {k.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <div className="mt-4">
            <Label className="text-xs font-medium text-muted-foreground">
              Zeitraum
            </Label>
            <Select value={zeitraum} onValueChange={(v) => setZeitraum(v as Zeitraum)}>
              <SelectTrigger className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monat">Monat (Juni 2026)</SelectItem>
                <SelectItem value="quartal">Quartal (Q2 2026)</SelectItem>
                <SelectItem value="jahr">Jahr (2026)</SelectItem>
                <SelectItem value="frei">Frei wählbar</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {typ === "weiterverrechnung" && (
            <div className="mt-5 space-y-3 rounded-2xl border border-border bg-background/60 p-4">
              <div className="flex items-center justify-between gap-3">
                <Label htmlFor="nurWeiter" className="text-sm font-medium">
                  Nur weiterverrechnete Tools
                </Label>
                <Switch id="nurWeiter" checked={nurWeiter} onCheckedChange={setNurWeiter} />
              </div>
              <div className="flex items-center justify-between gap-3">
                <Label htmlFor="aufschlag" className="text-sm font-medium">
                  Aufschlag und Marge ausweisen
                </Label>
                <Switch
                  id="aufschlag"
                  checked={aufschlagAusweisen}
                  onCheckedChange={setAufschlagAusweisen}
                />
              </div>
              <div className="flex items-center justify-between gap-3">
                <Label htmlFor="logo" className="text-sm font-medium">
                  Agentur-Logo anzeigen
                </Label>
                <Switch id="logo" checked={logoAnzeigen} onCheckedChange={setLogoAnzeigen} />
              </div>
            </div>
          )}

          <div className="mt-4">
            <Label className="text-xs font-medium text-muted-foreground">Format</Label>
            <div className="mt-1.5 grid grid-cols-2 gap-2">
              {(["pdf", "csv"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFormat(f)}
                  className={`h-9 rounded-md border text-sm font-medium uppercase tracking-wide transition-colors ${
                    format === f
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card hover:bg-accent"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-2">
            <Button onClick={() => exportieren(format)} className="gap-2">
              <Download className="size-4" /> Als {format.toUpperCase()} exportieren
            </Button>
            <Button variant="outline" onClick={speichern} className="gap-2">
              <Save className="size-4" /> In Verlauf speichern
            </Button>
            {typ === "datev" && (
              <Link
                to={"/einstellungen" as "/"}
                className="text-xs text-primary hover:underline mt-1"
              >
                Zum Steuer-Export einrichten
              </Link>
            )}
          </div>
        </Card>

        {/* Vorschau */}
        <div className="space-y-4">
          {typ === "weiterverrechnung" && (
            <WeiterverrechnungsVorschau
              kunde={kunde}
              zeitraum={zeitraumLabel[zeitraum]}
              tools={sichtbareTools}
              aufschlagAusweisen={aufschlagAusweisen}
              logoAnzeigen={logoAnzeigen}
              summen={summen}
            />
          )}
          {typ === "ausgaben" && <AusgabenVorschau zeitraum={zeitraumLabel[zeitraum]} />}
          {typ === "verteilung" && <VerteilungsVorschau zeitraum={zeitraumLabel[zeitraum]} />}
          {typ === "datev" && <DatevVorschau />}
        </div>
      </div>

      {/* Verlauf */}
      <Card className="p-5">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <div className="font-display text-lg font-semibold">Verlauf</div>
            <div className="text-sm text-muted-foreground">
              Zuletzt erstellte Berichte. Lade sie erneut herunter.
            </div>
          </div>
          <span className="text-xs text-muted-foreground">{verlauf.length} Einträge</span>
        </div>

        <div className="mt-4 divide-y divide-border">
          {verlauf.map((v) => (
            <div
              key={v.id}
              className="flex items-center gap-4 py-3 first:pt-0 last:pb-0 flex-wrap"
            >
              <div className="size-9 rounded-xl bg-muted grid place-items-center shrink-0">
                {v.typ === "weiterverrechnung" ? (
                  <Receipt className="size-4" />
                ) : v.typ === "ausgaben" ? (
                  <BarChart3 className="size-4" />
                ) : (
                  <PieChart className="size-4" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold truncate">
                  {v.titel}
                  {v.kunde && <span className="text-muted-foreground"> · {v.kunde}</span>}
                </div>
                <div className="text-xs text-muted-foreground">
                  {v.zeitraum} · erstellt am {v.datum}
                </div>
              </div>
              {v.betrag !== undefined && (
                <div className="text-sm font-semibold tabular-nums">{euro(v.betrag)}</div>
              )}
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5"
                onClick={() => exportieren("pdf")}
              >
                <FileDown className="size-4" /> PDF
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* ------------------ Vorschauen ------------------ */

function DocSheet({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-3xl bg-white border border-border shadow-md overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/40 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <FileText className="size-3.5" /> Vorschau · Dokument
        </div>
        <button
          onClick={() => toast.message("Druckvorschau (Demo)")}
          className="inline-flex items-center gap-1 hover:text-foreground"
        >
          <Printer className="size-3.5" /> Drucken
        </button>
      </div>
      <div className="p-6 sm:p-10 text-[#1F1D2B]">{children}</div>
    </div>
  );
}

function WeiterverrechnungsVorschau({
  kunde,
  zeitraum,
  tools,
  aufschlagAusweisen,
  logoAnzeigen,
  summen,
}: {
  kunde: Kunde;
  zeitraum: string;
  tools: Tool[];
  aufschlagAusweisen: boolean;
  logoAnzeigen: boolean;
  summen: { kosten: number; aufschlag: number; gesamt: number };
}) {
  const heute = new Date().toLocaleDateString("de-DE");
  const weiter = tools.filter((t) => t.weiterverrechnet);

  if (weiter.length === 0) {
    return (
      <DocSheet>
        <div className="flex flex-col items-center text-center py-10">
          <div className="size-12 rounded-2xl bg-muted grid place-items-center mb-3">
            <Sparkles className="size-5 text-muted-foreground" />
          </div>
          <div className="font-display text-lg font-semibold">
            Nichts zu verrechnen
          </div>
          <div className="text-sm text-muted-foreground max-w-md mt-1">
            Für {kunde.name} sind in diesem Zeitraum keine Tools als
            weiterverrechenbar markiert. Markiere zugeordnete Tools in der
            Kunden-Detailseite, um sie hier einzubeziehen.
          </div>
        </div>
      </DocSheet>
    );
  }

  return (
    <DocSheet>
      {/* Kopf */}
      <div className="flex items-start justify-between gap-6 flex-wrap pb-6 border-b border-border">
        <div className="flex items-center gap-3">
          {logoAnzeigen && (
            <div className="size-12 rounded-xl bg-[#6C5CE7] text-white grid place-items-center font-display font-bold text-lg">
              A
            </div>
          )}
          <div>
            <div className="font-display text-base font-semibold">Deine Agentur GmbH</div>
            <div className="text-xs text-muted-foreground">
              Musterweg 12 · 20095 Hamburg
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">
            Erstellt am
          </div>
          <div className="text-sm font-semibold tabular-nums">{heute}</div>
        </div>
      </div>

      <div className="mt-6">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">
          Bericht
        </div>
        <h2 className="font-display text-2xl font-semibold mt-1">
          Weiterverrechnung Software-Tools
        </h2>
        <div className="mt-4 grid sm:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Building2 className="size-4 text-muted-foreground" />
            <span className="text-muted-foreground">Kunde:</span>
            <span className="font-semibold">{kunde.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <CalendarDays className="size-4 text-muted-foreground" />
            <span className="text-muted-foreground">Zeitraum:</span>
            <span className="font-semibold">{zeitraum}</span>
          </div>
        </div>
      </div>

      {/* Tabelle */}
      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
              <th className="py-2 pr-4 font-medium">Tool</th>
              <th className="py-2 pr-4 font-medium">Kategorie</th>
              <th className="py-2 pr-4 font-medium text-right">Kosten</th>
              {aufschlagAusweisen && (
                <th className="py-2 pr-4 font-medium text-right">Aufschlag</th>
              )}
              <th className="py-2 pl-4 font-medium text-right">Weiterverrechnet</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {weiter.map((t) => {
              const aufschlag = t.kosten * (kunde.aufschlagProzent / 100);
              return (
                <tr key={t.name}>
                  <td className="py-2.5 pr-4 font-medium">{t.name}</td>
                  <td className="py-2.5 pr-4 text-muted-foreground">{t.kategorie}</td>
                  <td className="py-2.5 pr-4 text-right tabular-nums">
                    {euro(t.kosten)}
                  </td>
                  {aufschlagAusweisen && (
                    <td className="py-2.5 pr-4 text-right tabular-nums text-muted-foreground">
                      {euro(aufschlag)}
                    </td>
                  )}
                  <td className="py-2.5 pl-4 text-right tabular-nums font-semibold">
                    {euro(t.kosten + aufschlag)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Summen */}
      <div className="mt-6 ml-auto max-w-sm rounded-2xl bg-[#FBF7F1] border border-border p-4 space-y-1.5">
        {aufschlagAusweisen && (
          <>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Toolkosten gesamt</span>
              <span className="tabular-nums">{euro(summen.kosten)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Aufschlag {kunde.aufschlagProzent}%
              </span>
              <span className="tabular-nums">{euro(summen.aufschlag)}</span>
            </div>
            <div className="h-px bg-border my-1.5" />
          </>
        )}
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold">
            {aufschlagAusweisen ? "Weiterverrechnet gesamt" : "Endbetrag"}
          </span>
          <span className="font-display text-2xl font-bold tabular-nums text-[#12B76A]">
            {euro(summen.gesamt)}
          </span>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-border text-xs text-muted-foreground">
        Hinweis: Beträge in Euro, ohne Mehrwertsteuer. Stichtag entspricht dem
        Erstellungsdatum. Notiz: Tools nach Zuordnung im jeweiligen Zeitraum,
        anteilig bei unterjährigem Beginn oder Ende.
      </div>
    </DocSheet>
  );
}

function AusgabenVorschau({ zeitraum }: { zeitraum: string }) {
  const monate = [
    { m: "Apr 2026", betrag: 2380 },
    { m: "Mai 2026", betrag: 2415 },
    { m: "Jun 2026", betrag: 2480 },
  ];
  const gesamt = monate.reduce((s, x) => s + x.betrag, 0);
  const vorzeitraum = 6980;
  const diff = gesamt - vorzeitraum;
  const max = Math.max(...monate.map((m) => m.betrag));

  return (
    <DocSheet>
      <div className="text-xs uppercase tracking-wider text-muted-foreground">
        Bericht
      </div>
      <h2 className="font-display text-2xl font-semibold mt-1">Ausgaben-Report</h2>
      <div className="mt-1 text-sm text-muted-foreground">Zeitraum: {zeitraum}</div>

      <div className="mt-5 grid sm:grid-cols-3 gap-3">
        <div className="rounded-2xl bg-[#FBF7F1] border border-border p-4">
          <div className="text-xs text-muted-foreground">Gesamt</div>
          <div className="font-display text-2xl font-bold tabular-nums mt-1">
            {euro(gesamt)}
          </div>
        </div>
        <div className="rounded-2xl bg-[#FBF7F1] border border-border p-4">
          <div className="text-xs text-muted-foreground">Vorzeitraum</div>
          <div className="font-display text-2xl font-bold tabular-nums mt-1">
            {euro(vorzeitraum)}
          </div>
        </div>
        <div
          className={`rounded-2xl border p-4 ${
            diff > 0
              ? "bg-[#FFF1EE] border-[#FF7A66]/40"
              : "bg-[#ECFDF3] border-[#12B76A]/40"
          }`}
        >
          <div className="text-xs text-muted-foreground">Veränderung</div>
          <div
            className={`font-display text-2xl font-bold tabular-nums mt-1 ${
              diff > 0 ? "text-[#FF7A66]" : "text-[#12B76A]"
            }`}
          >
            {diff > 0 ? "+" : ""}
            {euro(diff)}
          </div>
        </div>
      </div>

      <div className="mt-6">
        <div className="text-sm font-semibold mb-3">Monatsverlauf</div>
        <div className="space-y-2">
          {monate.map((m) => (
            <div key={m.m} className="flex items-center gap-3 text-sm">
              <div className="w-24 text-muted-foreground">{m.m}</div>
              <div className="flex-1 h-2.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-[#6C5CE7]"
                  style={{ width: `${(m.betrag / max) * 100}%` }}
                />
              </div>
              <div className="w-20 text-right tabular-nums font-semibold">
                {euro(m.betrag)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </DocSheet>
  );
}

function VerteilungsVorschau({ zeitraum }: { zeitraum: string }) {
  const [dim, setDim] = useState<"kunde" | "kategorie" | "kanal">("kunde");
  const daten: Record<typeof dim, { name: string; betrag: number; farbe: string }[]> = {
    kunde: [
      { name: "Vitalplant", betrag: 800, farbe: "#6C5CE7" },
      { name: "FULEX", betrag: 818, farbe: "#FF7A66" },
      { name: "Nordpunkt", betrag: 56, farbe: "#12B76A" },
      { name: "Küstkraft", betrag: 45, farbe: "#F59E0B" },
    ],
    kategorie: [
      { name: "Design", betrag: 480, farbe: "#6C5CE7" },
      { name: "AI", betrag: 320, farbe: "#FF7A66" },
      { name: "Web", betrag: 290, farbe: "#12B76A" },
      { name: "SEO", betrag: 199, farbe: "#F59E0B" },
      { name: "Kommunikation", betrag: 90, farbe: "#0EA5E9" },
    ],
    kanal: [
      { name: "Firmenkreditkarte", betrag: 1240, farbe: "#6C5CE7" },
      { name: "SEPA-Lastschrift", betrag: 380, farbe: "#FF7A66" },
      { name: "PayPal", betrag: 99, farbe: "#12B76A" },
    ],
  };
  const liste = daten[dim];
  const gesamt = liste.reduce((s, x) => s + x.betrag, 0);

  return (
    <DocSheet>
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">
            Bericht
          </div>
          <h2 className="font-display text-2xl font-semibold mt-1">
            Kosten nach{" "}
            {dim === "kunde" ? "Kunde" : dim === "kategorie" ? "Kategorie" : "Kanal"}
          </h2>
          <div className="mt-1 text-sm text-muted-foreground">Zeitraum: {zeitraum}</div>
        </div>
        <div className="flex gap-1.5">
          {(["kunde", "kategorie", "kanal"] as const).map((d) => (
            <button
              key={d}
              onClick={() => setDim(d)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                dim === d
                  ? "bg-[#1F1D2B] text-white"
                  : "bg-muted text-foreground hover:bg-accent"
              }`}
            >
              {d === "kunde" ? "Kunde" : d === "kategorie" ? "Kategorie" : "Kanal"}
            </button>
          ))}
        </div>
      </div>

      {/* Stapelbalken */}
      <div className="mt-5 h-3 w-full rounded-full overflow-hidden flex">
        {liste.map((x) => (
          <div
            key={x.name}
            style={{ width: `${(x.betrag / gesamt) * 100}%`, background: x.farbe }}
            title={x.name}
          />
        ))}
      </div>

      <table className="mt-5 w-full text-sm">
        <thead>
          <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
            <th className="py-2 pr-4 font-medium">Name</th>
            <th className="py-2 pr-4 font-medium text-right">Betrag</th>
            <th className="py-2 pl-4 font-medium text-right">Anteil</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {liste.map((x) => (
            <tr key={x.name}>
              <td className="py-2.5 pr-4">
                <span className="inline-flex items-center gap-2">
                  <span
                    className="size-2.5 rounded-full"
                    style={{ background: x.farbe }}
                  />
                  {x.name}
                </span>
              </td>
              <td className="py-2.5 pr-4 text-right tabular-nums font-semibold">
                {euro(x.betrag)}
              </td>
              <td className="py-2.5 pl-4 text-right tabular-nums text-muted-foreground">
                {((x.betrag / gesamt) * 100).toFixed(1)}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </DocSheet>
  );
}

function DatevVorschau() {
  return (
    <DocSheet>
      <div className="text-xs uppercase tracking-wider text-muted-foreground">
        Bericht
      </div>
      <h2 className="font-display text-2xl font-semibold mt-1">
        Steuer-Export (DATEV)
      </h2>
      <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
        Der DATEV-Export erstellt ein eigenes CSV mit Konten, Steuerschlüsseln
        und Belegverweisen. Die Konfiguration findest du im eigenen Bereich.
      </p>
      <div className="mt-5 rounded-2xl bg-[#FBF7F1] border border-border p-4 flex items-center gap-3">
        <div className="size-10 rounded-xl bg-[#6C5CE7] text-white grid place-items-center">
          <Check className="size-5" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-semibold">DATEV-Export einrichten</div>
          <div className="text-xs text-muted-foreground">
            Konten, Steuerschlüssel und Buchungskreis konfigurieren.
          </div>
        </div>
        <Link
          to={"/einstellungen" as "/"}
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          Öffnen <ArrowRight className="size-4" />
        </Link>
      </div>
    </DocSheet>
  );
}
