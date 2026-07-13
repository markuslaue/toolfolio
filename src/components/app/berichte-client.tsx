"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
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
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatEur } from "@/lib/constants";
import { useReadOnly } from "@/components/app/read-only-context";
import { speichereBericht, loescheBericht } from "@/app/app/berichte/actions";

/* -------------------------------- Typen ---------------------------------- */

export type ReportTyp = "weiterverrechnung" | "ausgaben" | "verteilung" | "datev";

export type ReportTool = {
  name: string;
  kategorie: string;
  /** Kosten pro Monat, normalisiert. */
  kosten: number;
  weiterverrechnet: boolean;
  aufschlagProzent: number;
};

export type ReportKunde = {
  id: string;
  name: string;
  farbe: string;
  tools: ReportTool[];
};

export type MonatsWert = { jahr: number; monat: number; label: string; betrag: number };

export type VerteilungsWert = { name: string; betrag: number; farbe: string };

export type VerlaufEintrag = {
  id: string;
  typ: ReportTyp;
  titel: string;
  kunde: string | null;
  zeitraum: string;
  betrag: number | null;
  datum: string;
};

export type Firma = {
  name: string | null;
  strasse: string | null;
  plz: string | null;
  ort: string | null;
  ust_id: string | null;
};

type Zeitraum = "monat" | "quartal" | "jahr" | "frei";

const MONATE = [
  "Januar", "Februar", "März", "April", "Mai", "Juni",
  "Juli", "August", "September", "Oktober", "November", "Dezember",
];

const TITEL: Record<ReportTyp, string> = {
  weiterverrechnung: "Weiterverrechnung Software-Tools",
  ausgaben: "Ausgaben-Report",
  verteilung: "Verteilungs-Report",
  datev: "Steuer-Export (DATEV)",
};

const euro = formatEur;

function heuteDe(): string {
  return new Date().toLocaleDateString("de-DE");
}

function isoHeute(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Anzahl angefangener Monate zwischen zwei ISO-Daten, mindestens 1. */
function monateZwischen(vonIso: string, bisIso: string): number {
  const [vj, vm] = vonIso.split("-").map(Number);
  const [bj, bm] = bisIso.split("-").map(Number);
  return Math.max(1, (bj - vj) * 12 + (bm - vm) + 1);
}

/* ------------------------------- Bausteine -------------------------------- */

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-3xl border bg-card shadow-sm ${className}`}>{children}</div>;
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
      className={`rounded-3xl border p-5 text-left transition-all hover:-translate-y-0.5 hover:shadow-md ${
        active ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border bg-card"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className={`grid size-10 place-items-center rounded-2xl ${
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
      <div className="mt-4 font-display text-base font-semibold leading-tight">{titel}</div>
      <div className="mt-1 text-sm text-muted-foreground">{text}</div>
    </button>
  );
}

function DocSheet({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-3xl border bg-card shadow-md print:rounded-none print:border-0 print:shadow-none">
      <div className="flex items-center justify-between border-b bg-muted/40 px-4 py-2 text-xs text-muted-foreground print:hidden">
        <div className="flex items-center gap-2">
          <FileText className="size-3.5" /> Vorschau, Dokument
        </div>
        <button onClick={() => window.print()} className="inline-flex items-center gap-1 hover:text-foreground">
          <Printer className="size-3.5" /> Drucken
        </button>
      </div>
      <div className="p-6 sm:p-10">{children}</div>
    </div>
  );
}

/* ------------------------------ Hauptansicht ------------------------------ */

export function BerichteClient({
  kunden,
  verlauf12M,
  nachKategorie,
  nachKanal,
  firma,
  verlauf,
}: {
  kunden: ReportKunde[];
  verlauf12M: MonatsWert[];
  nachKategorie: VerteilungsWert[];
  nachKanal: VerteilungsWert[];
  firma: Firma | null;
  verlauf: VerlaufEintrag[];
}) {
  const readOnly = useReadOnly();
  const [typ, setTyp] = useState<ReportTyp>("weiterverrechnung");
  const [kundeId, setKundeId] = useState(kunden[0]?.id ?? "");
  const [zeitraum, setZeitraum] = useState<Zeitraum>("monat");
  const [von, setVon] = useState(isoHeute().slice(0, 8) + "01");
  const [bis, setBis] = useState(isoHeute());
  const [nurWeiter, setNurWeiter] = useState(true);
  const [aufschlagAusweisen, setAufschlagAusweisen] = useState(true);
  const [logoAnzeigen, setLogoAnzeigen] = useState(true);
  const [format, setFormat] = useState<"pdf" | "csv">("pdf");
  const [pending, start] = useTransition();

  // Einmal fixieren: sonst waere "heute" bei jedem Render ein neues Objekt und
  // saemtliche abgeleiteten Berechnungen liefen bei jeder Eingabe neu.
  const jetzt = useMemo(() => new Date(), []);
  const kunde = kunden.find((k) => k.id === kundeId) ?? kunden[0] ?? null;

  /* Zeitraum in Label, Monatsfaktor und Monatsfenster uebersetzen. */
  const zr = useMemo(() => {
    const j = jetzt.getFullYear();
    const m = jetzt.getMonth() + 1;
    if (zeitraum === "monat") {
      return { label: `${MONATE[m - 1]} ${j}`, faktor: 1, jahr: j, monate: [m] };
    }
    if (zeitraum === "quartal") {
      const q = Math.floor((m - 1) / 3);
      const monate = [q * 3 + 1, q * 3 + 2, q * 3 + 3].filter((x) => x <= m);
      return { label: `Q${q + 1} ${j}`, faktor: monate.length, jahr: j, monate };
    }
    if (zeitraum === "jahr") {
      return { label: `Jahr ${j}`, faktor: m, jahr: j, monate: Array.from({ length: m }, (_, i) => i + 1) };
    }
    const faktor = monateZwischen(von, bis);
    const [vj, vm] = von.split("-").map(Number);
    const monate: number[] = [];
    for (let i = 0; i < faktor; i++) {
      const mm = vm + i;
      if (vj + Math.floor((mm - 1) / 12) === j) monate.push(((mm - 1) % 12) + 1);
    }
    return {
      label: `${von.split("-").reverse().join(".")} bis ${bis.split("-").reverse().join(".")}`,
      faktor,
      jahr: j,
      monate,
    };
  }, [zeitraum, von, bis, jetzt]);

  /* --- Weiterverrechnung ------------------------------------------------- */

  const sichtbareTools = useMemo(() => {
    if (!kunde) return [];
    return nurWeiter ? kunde.tools.filter((t) => t.weiterverrechnet) : kunde.tools;
  }, [kunde, nurWeiter]);

  const summen = useMemo(() => {
    const abrechenbar = sichtbareTools.filter((t) => t.weiterverrechnet);
    const kosten = abrechenbar.reduce((s, t) => s + t.kosten * zr.faktor, 0);
    const aufschlag = abrechenbar.reduce((s, t) => s + t.kosten * zr.faktor * (t.aufschlagProzent / 100), 0);
    return { kosten, aufschlag, gesamt: kosten + aufschlag };
  }, [sichtbareTools, zr.faktor]);

  /* --- Ausgaben ----------------------------------------------------------- */

  const ausgaben = useMemo(() => {
    // Nur Monate im Fenster, die wir wirklich kennen (die letzten 12).
    const idx = verlauf12M.map((p, i) => ({ p, i }));
    const drin = idx.filter(({ p }) => p.jahr === zr.jahr && zr.monate.includes(p.monat));
    const gesamt = drin.reduce((s, { p }) => s + p.betrag, 0);
    const laenge = drin.length;
    const ersterIdx = drin[0]?.i ?? 0;
    const vorFenster = verlauf12M.slice(Math.max(0, ersterIdx - laenge), ersterIdx);
    const vorzeitraum = vorFenster.reduce((s, p) => s + p.betrag, 0);
    return {
      monate: drin.map(({ p }) => p),
      gesamt,
      vorzeitraum,
      vorLaenge: vorFenster.length,
      diff: gesamt - vorzeitraum,
    };
  }, [verlauf12M, zr]);

  /* --- Verteilung --------------------------------------------------------- */

  const nachKunde: VerteilungsWert[] = useMemo(
    () =>
      kunden
        .map((k) => ({
          name: k.name,
          betrag: k.tools.reduce((s, t) => s + t.kosten, 0) * zr.faktor,
          farbe: k.farbe,
        }))
        .filter((x) => x.betrag > 0)
        .sort((a, b) => b.betrag - a.betrag),
    [kunden, zr.faktor],
  );

  /* --- Aktionen ----------------------------------------------------------- */

  const betragFuerVerlauf =
    typ === "weiterverrechnung" ? summen.gesamt : typ === "ausgaben" ? ausgaben.gesamt : null;

  function speichern() {
    start(async () => {
      const res = await speichereBericht({
        typ,
        titel: TITEL[typ],
        kunde: typ === "weiterverrechnung" ? (kunde?.name ?? null) : null,
        zeitraum: zr.label,
        betrag: betragFuerVerlauf,
      });
      if (res.error) toast.error(res.error);
      else toast.success("Bericht im Verlauf gespeichert.");
    });
  }

  function entfernen(id: string) {
    start(async () => {
      const res = await loescheBericht(id);
      if (res.error) toast.error(res.error);
      else toast.success("Eintrag entfernt.");
    });
  }

  /** CSV aus den echten Daten des aktuell gewählten Berichts. */
  function csv() {
    const esc = (s: unknown) => `"${String(s).replace(/"/g, '""')}"`;
    const zahl = (n: number) => n.toFixed(2).replace(".", ",");
    let zeilen: string[][] = [];
    let name = "bericht";

    if (typ === "weiterverrechnung" && kunde) {
      name = `weiterverrechnung-${kunde.name.toLowerCase().replace(/\W+/g, "-")}`;
      zeilen = [
        ["Kunde", "Zeitraum", "Tool", "Kategorie", "Kosten", "Aufschlag %", "Weiterverrechnet"],
        ...sichtbareTools
          .filter((t) => t.weiterverrechnet)
          .map((t) => {
            const k = t.kosten * zr.faktor;
            const a = k * (t.aufschlagProzent / 100);
            return [kunde.name, zr.label, t.name, t.kategorie, zahl(k), String(t.aufschlagProzent), zahl(k + a)];
          }),
        [],
        ["", "", "", "Summe", zahl(summen.kosten), "", zahl(summen.gesamt)],
      ];
    } else if (typ === "ausgaben") {
      name = "ausgaben";
      zeilen = [
        ["Monat", "Jahr", "Betrag"],
        ...ausgaben.monate.map((m) => [m.label, String(m.jahr), zahl(m.betrag)]),
        [],
        ["Gesamt", "", zahl(ausgaben.gesamt)],
      ];
    } else if (typ === "verteilung") {
      name = "verteilung";
      zeilen = [
        ["Dimension", "Name", "Betrag"],
        ...nachKunde.map((x) => ["Kunde", x.name, zahl(x.betrag)]),
        ...nachKategorie.map((x) => ["Kategorie", x.name, zahl(x.betrag * zr.faktor)]),
        ...nachKanal.map((x) => ["Zahlungskanal", x.name, zahl(x.betrag * zr.faktor)]),
      ];
    } else {
      toast.message("Der DATEV-Export läuft über den eigenen Bereich Steuer-Export.");
      return;
    }

    const inhalt = "﻿" + zeilen.map((z) => z.map(esc).join(";")).join("\r\n");
    const url = URL.createObjectURL(new Blob([inhalt], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `${name}-${isoHeute()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV heruntergeladen.");
  }

  function exportieren() {
    if (format === "csv") csv();
    else window.print(); // Der Druckdialog bietet „Als PDF sichern“.
  }

  return (
    <div className="space-y-6">
      {/* Kopf */}
      <div className="flex flex-col gap-2 print:hidden">
        <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">Berichte</h1>
        <p className="max-w-2xl text-muted-foreground">
          Auswertungen und fertige Dokumente für deine Kunden. Wähle einen Bericht, passe die Parameter an und
          exportiere ihn als PDF oder CSV.
        </p>
      </div>

      {/* Typ-Auswahl */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 print:hidden">
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

      {/* Builder und Vorschau */}
      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        <Card className="h-fit p-5 print:hidden">
          <div className="font-display text-lg font-semibold">Parameter</div>
          <div className="text-sm text-muted-foreground">Änderungen aktualisieren die Vorschau sofort.</div>

          {typ === "weiterverrechnung" && kunden.length > 0 && (
            <div className="mt-5">
              <Label className="text-xs font-medium text-muted-foreground">Kunde</Label>
              <Select value={kundeId} onValueChange={setKundeId}>
                <SelectTrigger className="mt-1.5 w-full">
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
          )}

          <div className="mt-4">
            <Label className="text-xs font-medium text-muted-foreground">Zeitraum</Label>
            <Select value={zeitraum} onValueChange={(v) => setZeitraum(v as Zeitraum)}>
              <SelectTrigger className="mt-1.5 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monat">Monat ({MONATE[jetzt.getMonth()]} {jetzt.getFullYear()})</SelectItem>
                <SelectItem value="quartal">Quartal (Q{Math.floor(jetzt.getMonth() / 3) + 1} {jetzt.getFullYear()})</SelectItem>
                <SelectItem value="jahr">Jahr ({jetzt.getFullYear()})</SelectItem>
                <SelectItem value="frei">Frei wählbar</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {zeitraum === "frei" && (
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="von" className="text-xs font-medium text-muted-foreground">Von</Label>
                <Input id="von" type="date" value={von} max={bis} onChange={(e) => setVon(e.target.value)} className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="bis" className="text-xs font-medium text-muted-foreground">Bis</Label>
                <Input id="bis" type="date" value={bis} min={von} onChange={(e) => setBis(e.target.value)} className="mt-1.5" />
              </div>
            </div>
          )}

          {typ === "weiterverrechnung" && (
            <div className="mt-5 space-y-3 rounded-2xl border bg-background/60 p-4">
              <div className="flex items-center justify-between gap-3">
                <Label htmlFor="nurWeiter" className="text-sm font-medium">Nur weiterverrechnete Tools</Label>
                <Switch id="nurWeiter" checked={nurWeiter} onCheckedChange={setNurWeiter} />
              </div>
              <div className="flex items-center justify-between gap-3">
                <Label htmlFor="aufschlag" className="text-sm font-medium">Aufschlag und Marge ausweisen</Label>
                <Switch id="aufschlag" checked={aufschlagAusweisen} onCheckedChange={setAufschlagAusweisen} />
              </div>
              <div className="flex items-center justify-between gap-3">
                <Label htmlFor="logo" className="text-sm font-medium">Logo anzeigen</Label>
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
            <Button onClick={exportieren} className="gap-2">
              <Download className="size-4" /> Als {format.toUpperCase()} exportieren
            </Button>
            {!readOnly && (
              <Button variant="outline" onClick={speichern} disabled={pending} className="gap-2">
                <Save className="size-4" /> In Verlauf speichern
              </Button>
            )}
            {typ === "datev" && (
              <Link href="/app/steuer" className="mt-1 text-xs text-primary hover:underline">
                Zum Steuer-Export einrichten
              </Link>
            )}
            {format === "pdf" && (
              <p className="mt-1 text-[11px] text-muted-foreground">
                PDF öffnet den Druckdialog. Dort „Als PDF sichern“ wählen.
              </p>
            )}
          </div>
        </Card>

        {/* Vorschau */}
        <div className="space-y-4">
          {typ === "weiterverrechnung" && (
            <WeiterverrechnungsVorschau
              kunde={kunde}
              firma={firma}
              zeitraum={zr.label}
              faktor={zr.faktor}
              tools={sichtbareTools}
              aufschlagAusweisen={aufschlagAusweisen}
              logoAnzeigen={logoAnzeigen}
              summen={summen}
            />
          )}
          {typ === "ausgaben" && <AusgabenVorschau zeitraum={zr.label} daten={ausgaben} />}
          {typ === "verteilung" && (
            <VerteilungsVorschau
              zeitraum={zr.label}
              faktor={zr.faktor}
              nachKunde={nachKunde}
              nachKategorie={nachKategorie}
              nachKanal={nachKanal}
            />
          )}
          {typ === "datev" && <DatevVorschau />}
        </div>
      </div>

      {/* Verlauf */}
      <Card className="p-5 print:hidden">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="font-display text-lg font-semibold">Verlauf</div>
            <div className="text-sm text-muted-foreground">
              Zuletzt erstellte Berichte. Ein Klick erzeugt sie aus den aktuellen Daten neu.
            </div>
          </div>
          <span className="text-xs text-muted-foreground">
            {verlauf.length} {verlauf.length === 1 ? "Eintrag" : "Einträge"}
          </span>
        </div>

        {verlauf.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Noch kein Bericht gespeichert. Stell oben die Parameter ein und leg ihn im Verlauf ab.
          </p>
        ) : (
          <div className="mt-4 divide-y">
            {verlauf.map((v) => (
              <div key={v.id} className="flex flex-wrap items-center gap-4 py-3 first:pt-0 last:pb-0">
                <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-muted">
                  {v.typ === "weiterverrechnung" ? (
                    <Receipt className="size-4" />
                  ) : v.typ === "ausgaben" ? (
                    <BarChart3 className="size-4" />
                  ) : v.typ === "datev" ? (
                    <FileText className="size-4" />
                  ) : (
                    <PieChart className="size-4" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold">
                    {v.titel}
                    {v.kunde && <span className="text-muted-foreground"> · {v.kunde}</span>}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {v.zeitraum} · erstellt am {v.datum}
                  </div>
                </div>
                {v.betrag !== null && (
                  <div className="text-sm font-semibold tabular-nums">{euro(v.betrag)}</div>
                )}
                <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setTyp(v.typ)}>
                  <FileDown className="size-4" /> Öffnen
                </Button>
                {!readOnly && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => entfernen(v.id)}
                    disabled={pending}
                    aria-label={`${v.titel} aus dem Verlauf entfernen`}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

/* ------------------------------- Vorschauen ------------------------------- */

function WeiterverrechnungsVorschau({
  kunde,
  firma,
  zeitraum,
  faktor,
  tools,
  aufschlagAusweisen,
  logoAnzeigen,
  summen,
}: {
  kunde: ReportKunde | null;
  firma: Firma | null;
  zeitraum: string;
  faktor: number;
  tools: ReportTool[];
  aufschlagAusweisen: boolean;
  logoAnzeigen: boolean;
  summen: { kosten: number; aufschlag: number; gesamt: number };
}) {
  const weiter = tools.filter((t) => t.weiterverrechnet);

  if (!kunde || weiter.length === 0) {
    return (
      <DocSheet>
        <div className="flex flex-col items-center py-10 text-center">
          <div className="mb-3 grid size-12 place-items-center rounded-2xl bg-muted">
            <Sparkles className="size-5 text-muted-foreground" />
          </div>
          <div className="font-display text-lg font-semibold">Nichts zu verrechnen</div>
          <div className="mt-1 max-w-md text-sm text-muted-foreground">
            {kunde
              ? `Für ${kunde.name} ist in diesem Zeitraum kein Tool als weiterverrechenbar markiert. Setz den Haken „weiterverrechnen“ am jeweiligen Abo, dann erscheint es hier.`
              : "Leg zuerst einen Kunden an und ordne ihm Abos zu, dann kannst du hier weiterverrechnen."}
          </div>
          <Button asChild size="sm" variant="outline" className="mt-4">
            <Link href={kunde ? "/app/abos" : "/app/kunden"}>{kunde ? "Zu den Abos" : "Kunden anlegen"}</Link>
          </Button>
        </div>
      </DocSheet>
    );
  }

  const einheitlich = new Set(weiter.map((t) => t.aufschlagProzent));
  const aufschlagLabel = einheitlich.size === 1 ? `Aufschlag ${[...einheitlich][0]} %` : "Aufschlag";

  return (
    <DocSheet>
      {/* Kopf */}
      <div className="flex flex-wrap items-start justify-between gap-6 border-b pb-6">
        <div className="flex items-center gap-3">
          {logoAnzeigen && (
            <div className="grid size-12 place-items-center rounded-xl bg-primary font-display text-lg font-bold text-primary-foreground">
              {(firma?.name ?? "T").trim()[0]?.toUpperCase()}
            </div>
          )}
          <div>
            <div className="font-display text-base font-semibold">{firma?.name ?? "Dein Unternehmen"}</div>
            <div className="text-xs text-muted-foreground">
              {[firma?.strasse, [firma?.plz, firma?.ort].filter(Boolean).join(" ")].filter(Boolean).join(" · ") ||
                "Adresse in den Einstellungen hinterlegen"}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Erstellt am</div>
          <div className="text-sm font-semibold tabular-nums">{heuteDe()}</div>
        </div>
      </div>

      <div className="mt-6">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">Bericht</div>
        <h2 className="mt-1 font-display text-2xl font-semibold">Weiterverrechnung Software-Tools</h2>
        <div className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
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
            <tr className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th className="py-2 pr-4 font-medium">Tool</th>
              <th className="py-2 pr-4 font-medium">Kategorie</th>
              <th className="py-2 pr-4 text-right font-medium">Kosten</th>
              {aufschlagAusweisen && <th className="py-2 pr-4 text-right font-medium">Aufschlag</th>}
              <th className="py-2 pl-4 text-right font-medium">Weiterverrechnet</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {weiter.map((t) => {
              const kosten = t.kosten * faktor;
              const aufschlag = kosten * (t.aufschlagProzent / 100);
              return (
                <tr key={t.name}>
                  <td className="py-2.5 pr-4 font-medium">{t.name}</td>
                  <td className="py-2.5 pr-4 text-muted-foreground">{t.kategorie}</td>
                  <td className="py-2.5 pr-4 text-right tabular-nums">{euro(kosten)}</td>
                  {aufschlagAusweisen && (
                    <td className="py-2.5 pr-4 text-right tabular-nums text-muted-foreground">{euro(aufschlag)}</td>
                  )}
                  <td className="py-2.5 pl-4 text-right font-semibold tabular-nums">{euro(kosten + aufschlag)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Summen */}
      <div className="ml-auto mt-6 max-w-sm space-y-1.5 rounded-2xl border bg-muted/40 p-4">
        {aufschlagAusweisen && (
          <>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Toolkosten gesamt</span>
              <span className="tabular-nums">{euro(summen.kosten)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{aufschlagLabel}</span>
              <span className="tabular-nums">{euro(summen.aufschlag)}</span>
            </div>
            <div className="my-1.5 h-px bg-border" />
          </>
        )}
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold">
            {aufschlagAusweisen ? "Weiterverrechnet gesamt" : "Endbetrag"}
          </span>
          <span className="font-display text-2xl font-bold tabular-nums text-success">{euro(summen.gesamt)}</span>
        </div>
      </div>

      <div className="mt-6 border-t pt-4 text-xs text-muted-foreground">
        Hinweis: Beträge in Euro, ohne Mehrwertsteuer. Wiederkehrende Kosten sind auf den Monat normalisiert
        {faktor > 1 ? ` und mit ${faktor} Monaten multipliziert` : ""}. Anteilige Berechnung bei unterjährigem Beginn
        oder Ende ist nicht enthalten.
      </div>
    </DocSheet>
  );
}

function AusgabenVorschau({
  zeitraum,
  daten,
}: {
  zeitraum: string;
  daten: { monate: MonatsWert[]; gesamt: number; vorzeitraum: number; vorLaenge: number; diff: number };
}) {
  const max = Math.max(1, ...daten.monate.map((m) => m.betrag));
  const vergleichbar = daten.vorLaenge === daten.monate.length && daten.vorzeitraum > 0;

  return (
    <DocSheet>
      <div className="text-xs uppercase tracking-wider text-muted-foreground">Bericht</div>
      <h2 className="mt-1 font-display text-2xl font-semibold">Ausgaben-Report</h2>
      <div className="mt-1 text-sm text-muted-foreground">Zeitraum: {zeitraum}</div>

      {daten.monate.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">
          Für diesen Zeitraum liegen keine Daten vor. Wir werten die letzten zwölf Monate aus.
        </p>
      ) : (
        <>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border bg-muted/40 p-4">
              <div className="text-xs text-muted-foreground">Gesamt</div>
              <div className="mt-1 font-display text-2xl font-bold tabular-nums">{euro(daten.gesamt)}</div>
            </div>
            <div className="rounded-2xl border bg-muted/40 p-4">
              <div className="text-xs text-muted-foreground">Vorzeitraum</div>
              <div className="mt-1 font-display text-2xl font-bold tabular-nums">
                {vergleichbar ? euro(daten.vorzeitraum) : "keine Daten"}
              </div>
            </div>
            <div
              className={`rounded-2xl border p-4 ${
                !vergleichbar
                  ? "bg-muted/40"
                  : daten.diff > 0
                    ? "border-coral/40 bg-coral/10"
                    : "border-success/40 bg-success/10"
              }`}
            >
              <div className="text-xs text-muted-foreground">Veränderung</div>
              <div
                className={`mt-1 font-display text-2xl font-bold tabular-nums ${
                  !vergleichbar ? "text-muted-foreground" : daten.diff > 0 ? "text-coral" : "text-success"
                }`}
              >
                {vergleichbar ? `${daten.diff > 0 ? "+" : ""}${euro(daten.diff)}` : "—"}
              </div>
            </div>
          </div>

          <div className="mt-6">
            <div className="mb-3 text-sm font-semibold">Monatsverlauf</div>
            <div className="space-y-2">
              {daten.monate.map((m) => (
                <div key={`${m.jahr}-${m.monat}`} className="flex items-center gap-3 text-sm">
                  <div className="w-24 text-muted-foreground">
                    {m.label} {m.jahr}
                  </div>
                  <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
                    <div className="h-full bg-primary" style={{ width: `${(m.betrag / max) * 100}%` }} />
                  </div>
                  <div className="w-24 text-right font-semibold tabular-nums">{euro(m.betrag)}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 border-t pt-4 text-xs text-muted-foreground">
            Fixkosten sind aus dem Startdatum deiner laufenden Abos rekonstruiert, variable Kosten sind Istwerte.
            Bereits beendete Abos fehlen in den Vormonaten.
          </div>
        </>
      )}
    </DocSheet>
  );
}

function VerteilungsVorschau({
  zeitraum,
  faktor,
  nachKunde,
  nachKategorie,
  nachKanal,
}: {
  zeitraum: string;
  faktor: number;
  nachKunde: VerteilungsWert[];
  nachKategorie: VerteilungsWert[];
  nachKanal: VerteilungsWert[];
}) {
  const [dim, setDim] = useState<"kunde" | "kategorie" | "kanal">("kunde");
  const roh = dim === "kunde" ? nachKunde : dim === "kategorie" ? nachKategorie : nachKanal;
  // Kunde ist bereits mit dem Faktor gerechnet, die anderen beiden liefern Monatswerte.
  const liste = dim === "kunde" ? roh : roh.map((x) => ({ ...x, betrag: x.betrag * faktor }));
  const gesamt = liste.reduce((s, x) => s + x.betrag, 0);
  const label = dim === "kunde" ? "Kunde" : dim === "kategorie" ? "Kategorie" : "Zahlungskanal";

  return (
    <DocSheet>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Bericht</div>
          <h2 className="mt-1 font-display text-2xl font-semibold">Kosten nach {label}</h2>
          <div className="mt-1 text-sm text-muted-foreground">Zeitraum: {zeitraum}</div>
        </div>
        <div className="flex gap-1.5 print:hidden">
          {(["kunde", "kategorie", "kanal"] as const).map((d) => (
            <button
              key={d}
              onClick={() => setDim(d)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                dim === d ? "bg-foreground text-background" : "bg-muted text-foreground hover:bg-accent"
              }`}
            >
              {d === "kunde" ? "Kunde" : d === "kategorie" ? "Kategorie" : "Kanal"}
            </button>
          ))}
        </div>
      </div>

      {gesamt === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">
          Für diese Dimension ist noch nichts zugeordnet.
        </p>
      ) : (
        <>
          <div className="mt-5 flex h-3 w-full overflow-hidden rounded-full">
            {liste.map((x) => (
              <div key={x.name} style={{ width: `${(x.betrag / gesamt) * 100}%`, background: x.farbe }} title={x.name} />
            ))}
          </div>

          <table className="mt-5 w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="py-2 pr-4 font-medium">Name</th>
                <th className="py-2 pr-4 text-right font-medium">Betrag</th>
                <th className="py-2 pl-4 text-right font-medium">Anteil</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {liste.map((x) => (
                <tr key={x.name}>
                  <td className="py-2.5 pr-4">
                    <span className="inline-flex items-center gap-2">
                      <span className="size-2.5 rounded-full" style={{ background: x.farbe }} />
                      {x.name}
                    </span>
                  </td>
                  <td className="py-2.5 pr-4 text-right font-semibold tabular-nums">{euro(x.betrag)}</td>
                  <td className="py-2.5 pl-4 text-right tabular-nums text-muted-foreground">
                    {((x.betrag / gesamt) * 100).toFixed(1).replace(".", ",")} %
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </DocSheet>
  );
}

function DatevVorschau() {
  return (
    <DocSheet>
      <div className="text-xs uppercase tracking-wider text-muted-foreground">Bericht</div>
      <h2 className="mt-1 font-display text-2xl font-semibold">Steuer-Export (DATEV)</h2>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Der DATEV-Export erstellt ein eigenes CSV mit Konten, Steuerschlüsseln und Belegverweisen. Die Konfiguration und
        der Download liegen im eigenen Bereich Steuer-Export.
      </p>
      <div className="mt-5 flex items-center gap-3 rounded-2xl border bg-muted/40 p-4">
        <div className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground">
          <Check className="size-5" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-semibold">DATEV-Export einrichten</div>
          <div className="text-xs text-muted-foreground">Konten, Steuerschlüssel und Buchungskreis konfigurieren.</div>
        </div>
        <Link
          href="/app/steuer"
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          Öffnen <ArrowRight className="size-4" />
        </Link>
      </div>
    </DocSheet>
  );
}
