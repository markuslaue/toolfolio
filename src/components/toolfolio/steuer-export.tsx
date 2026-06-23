import { useMemo, useState } from "react";
import {
  Info,
  FileDown,
  Download,
  Save,
  Calculator,
  Globe2,
  Building2,
  CreditCard,
  Sparkles,
  AlertTriangle,
  ShieldCheck,
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

type Zeitraum = "monat" | "quartal" | "jahr" | "frei";
const zeitraumLabel: Record<Zeitraum, string> = {
  monat: "Juni 2026",
  quartal: "Q2 2026",
  jahr: "Jahr 2026",
  frei: "01.04.2026 bis 30.06.2026",
};

type Format = "datev" | "csv" | "pdf";

type Kategorie =
  | "Software"
  | "AI"
  | "Design"
  | "Hosting"
  | "Kommunikation"
  | "Marketing";

type Posten = {
  id: string;
  datum: string;
  tool: string;
  anbieterLand: string;
  reverseCharge: boolean;
  kategorie: Kategorie;
  netto: number;
  ustSatz: number;
  waehrung?: { code: string; betrag: number };
  kanal: string;
  kunde?: string;
};

const initialPosten: Posten[] = [
  {
    id: "p1",
    datum: "03.04.2026",
    tool: "Notion",
    anbieterLand: "USA",
    reverseCharge: true,
    kategorie: "Software",
    netto: 32,
    ustSatz: 19,
    waehrung: { code: "USD", betrag: 35 },
    kanal: "Firmenkreditkarte",
  },
  {
    id: "p2",
    datum: "08.04.2026",
    tool: "Figma",
    anbieterLand: "USA",
    reverseCharge: true,
    kategorie: "Design",
    netto: 180,
    ustSatz: 19,
    waehrung: { code: "USD", betrag: 195 },
    kanal: "Firmenkreditkarte",
    kunde: "Nordwerk",
  },
  {
    id: "p3",
    datum: "15.04.2026",
    tool: "Adobe Creative Cloud",
    anbieterLand: "Irland",
    reverseCharge: true,
    kategorie: "Design",
    netto: 240,
    ustSatz: 19,
    kanal: "SEPA-Lastschrift",
    kunde: "Kessler",
  },
  {
    id: "p4",
    datum: "22.04.2026",
    tool: "Anthropic API",
    anbieterLand: "USA",
    reverseCharge: true,
    kategorie: "AI",
    netto: 318.7,
    ustSatz: 19,
    waehrung: { code: "USD", betrag: 345.5 },
    kanal: "Firmenkreditkarte",
  },
  {
    id: "p5",
    datum: "02.05.2026",
    tool: "Sevdesk",
    anbieterLand: "Deutschland",
    reverseCharge: false,
    kategorie: "Software",
    netto: 16.8,
    ustSatz: 19,
    kanal: "SEPA-Lastschrift",
  },
  {
    id: "p6",
    datum: "10.05.2026",
    tool: "Hetzner Cloud",
    anbieterLand: "Deutschland",
    reverseCharge: false,
    kategorie: "Hosting",
    netto: 48.5,
    ustSatz: 19,
    kanal: "SEPA-Lastschrift",
  },
  {
    id: "p7",
    datum: "18.05.2026",
    tool: "OpenAI",
    anbieterLand: "USA",
    reverseCharge: true,
    kategorie: "AI",
    netto: 220,
    ustSatz: 19,
    waehrung: { code: "USD", betrag: 239 },
    kanal: "Firmenkreditkarte",
    kunde: "Nordwerk",
  },
  {
    id: "p8",
    datum: "01.06.2026",
    tool: "Mailchimp",
    anbieterLand: "USA",
    reverseCharge: true,
    kategorie: "Marketing",
    netto: 89,
    ustSatz: 19,
    waehrung: { code: "USD", betrag: 96 },
    kanal: "Firmenkreditkarte",
    kunde: "Kessler",
  },
];

const skr04Defaults: Record<Kategorie, string> = {
  Software: "6837",
  AI: "6837",
  Design: "6837",
  Hosting: "6835",
  Kommunikation: "6805",
  Marketing: "6600",
};
const skr03Defaults: Record<Kategorie, string> = {
  Software: "4940",
  AI: "4940",
  Design: "4940",
  Hosting: "4806",
  Kommunikation: "4920",
  Marketing: "4610",
};

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
      className={`rounded-3xl bg-card border border-border shadow-sm transition-all ${className}`}
    >
      {children}
    </div>
  );
}

function Pill({
  tone = "muted",
  children,
}: {
  tone?: "amber" | "emerald" | "muted" | "violet";
  children: React.ReactNode;
}) {
  const toneClass = {
    amber: "bg-[#FFF6E5] text-[#B45309] border-[#F5A623]/40",
    emerald: "bg-[#ECFDF3] text-[#067647] border-[#12B76A]/40",
    muted: "bg-muted text-muted-foreground border-border",
    violet: "bg-primary/10 text-primary border-primary/30",
  }[tone];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${toneClass}`}
    >
      {children}
    </span>
  );
}

export function SteuerExport() {
  const [zeitraum, setZeitraum] = useState<Zeitraum>("quartal");
  const [format, setFormat] = useState<Format>("datev");
  const [kontenrahmen, setKontenrahmen] = useState<"SKR04" | "SKR03">("SKR04");
  const [mitKundenzuordnung, setMitKundenzuordnung] = useState(true);
  const [nurReverse, setNurReverse] = useState(false);

  const [mapping, setMapping] = useState<Record<Kategorie, string>>(skr04Defaults);
  const [ustMapping, setUstMapping] = useState<Record<Kategorie, number>>({
    Software: 19,
    AI: 19,
    Design: 19,
    Hosting: 19,
    Kommunikation: 19,
    Marketing: 19,
  });

  const [overrides, setOverrides] = useState<Record<string, boolean>>({});

  const wechseleRahmen = (r: "SKR04" | "SKR03") => {
    setKontenrahmen(r);
    setMapping(r === "SKR04" ? skr04Defaults : skr03Defaults);
  };

  const posten = useMemo(() => {
    return initialPosten
      .map((p) => ({
        ...p,
        reverseCharge:
          overrides[p.id] !== undefined ? overrides[p.id] : p.reverseCharge,
        konto: mapping[p.kategorie],
        ustSatz: ustMapping[p.kategorie],
      }))
      .filter((p) => (nurReverse ? p.reverseCharge : true));
  }, [overrides, mapping, ustMapping, nurReverse]);

  const bilanz = useMemo(() => {
    const netto = posten.reduce((s, p) => s + p.netto, 0);
    const reverse = posten
      .filter((p) => p.reverseCharge)
      .reduce((s, p) => s + p.netto, 0);
    const brutto = posten.reduce(
      (s, p) => s + (p.reverseCharge ? p.netto : p.netto * (1 + p.ustSatz / 100)),
      0
    );
    return { anzahl: posten.length, netto, reverse, brutto };
  }, [posten]);

  const reverseAnbieter = useMemo(() => {
    const seen = new Set<string>();
    return initialPosten
      .filter((p) => {
        const aktiv =
          overrides[p.id] !== undefined ? overrides[p.id] : p.reverseCharge;
        if (!aktiv && overrides[p.id] === undefined && !p.reverseCharge) return false;
        if (seen.has(p.tool)) return false;
        seen.add(p.tool);
        return p.reverseCharge || overrides[p.id];
      })
      .map((p) => ({
        id: p.id,
        tool: p.tool,
        land: p.anbieterLand,
        aktiv:
          overrides[p.id] !== undefined ? overrides[p.id] : p.reverseCharge,
      }));
  }, [overrides]);

  const [verlauf, setVerlauf] = useState<
    { id: string; titel: string; zeitraum: string; datum: string; format: Format }[]
  >([
    { id: "h1", titel: "Steuer-Export Q1 2026", zeitraum: "Q1 2026", datum: "05.04.2026", format: "datev" },
    { id: "h2", titel: "Steuer-Export März 2026", zeitraum: "März 2026", datum: "02.04.2026", format: "csv" },
  ]);

  const exportieren = (f: Format) => {
    const labels: Record<Format, string> = {
      datev: "DATEV-CSV",
      csv: "CSV",
      pdf: "PDF",
    };
    toast.success(`${labels[f]} wird vorbereitet (Demo)`);
  };

  const speichern = () => {
    const labels: Record<Format, string> = { datev: "DATEV", csv: "CSV", pdf: "PDF" };
    setVerlauf((v) => [
      {
        id: `h${Date.now()}`,
        titel: `Steuer-Export ${zeitraumLabel[zeitraum]}`,
        zeitraum: zeitraumLabel[zeitraum],
        datum: new Date().toLocaleDateString("de-DE"),
        format,
      },
      ...v,
    ]);
    toast.success(`Im Verlauf gespeichert (${labels[format]})`);
  };

  return (
    <div className="space-y-6">
      {/* Kopf */}
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight">
          Steuer-Export
        </h1>
        <p className="text-muted-foreground max-w-2xl">
          Softwarekosten kategorisiert für deinen Steuerberater, inklusive
          Reverse-Charge-Kennzeichnung.
        </p>
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-3 rounded-2xl border border-border bg-card/60 px-4 py-3 text-sm">
        <Info className="size-4 text-primary mt-0.5 shrink-0" />
        <p className="text-muted-foreground">
          Toolfolio bereitet Daten auf und ersetzt keine Steuerberatung. Das
          Reverse-Charge-Flag ist ein Hinweis auf Basis des Anbietersitzes, kein
          verbindliches Urteil. Bitte mit deinem Steuerberater prüfen.
        </p>
      </div>

      {/* Builder */}
      <Card className="p-5">
        <div className="grid gap-4 md:grid-cols-4">
          <div>
            <Label className="text-xs font-medium text-muted-foreground">Zeitraum</Label>
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
          <div>
            <Label className="text-xs font-medium text-muted-foreground">Format</Label>
            <Select value={format} onValueChange={(v) => setFormat(v as Format)}>
              <SelectTrigger className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="datev">DATEV-kompatible CSV</SelectItem>
                <SelectItem value="csv">Einfache CSV</SelectItem>
                <SelectItem value="pdf">PDF-Zusammenfassung</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs font-medium text-muted-foreground">Kontenrahmen</Label>
            <Select value={kontenrahmen} onValueChange={(v) => wechseleRahmen(v as "SKR04" | "SKR03")}>
              <SelectTrigger className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SKR04">SKR04 (Standard)</SelectItem>
                <SelectItem value="SKR03">SKR03</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground">Optionen</Label>
            <div className="flex items-center justify-between gap-3 rounded-md border border-border bg-background/60 px-3 py-1.5">
              <span className="text-sm">Kundenzuordnung</span>
              <Switch checked={mitKundenzuordnung} onCheckedChange={setMitKundenzuordnung} />
            </div>
            <div className="flex items-center justify-between gap-3 rounded-md border border-border bg-background/60 px-3 py-1.5">
              <span className="text-sm">Nur Reverse-Charge</span>
              <Switch checked={nurReverse} onCheckedChange={setNurReverse} />
            </div>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button onClick={() => exportieren(format)} className="gap-2">
            <Download className="size-4" /> Jetzt exportieren
          </Button>
          <Button variant="outline" onClick={speichern} className="gap-2">
            <Save className="size-4" /> In Verlauf speichern
          </Button>
        </div>
      </Card>

      {/* Mapping + Reverse-Charge */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-5 hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="size-9 rounded-xl bg-primary/10 text-primary grid place-items-center">
                <Calculator className="size-4" />
              </div>
              <div>
                <div className="font-display text-lg font-semibold">Konten-Mapping</div>
                <div className="text-xs text-muted-foreground">
                  Kontenrahmen {kontenrahmen} · einmal einrichten, dann
                  wiederverwenden.
                </div>
              </div>
            </div>
            <Pill tone="violet">
              <ShieldCheck className="size-3" /> aktiv
            </Pill>
          </div>

          <div className="mt-4 divide-y divide-border">
            {(Object.keys(mapping) as Kategorie[]).map((kat) => (
              <div
                key={kat}
                className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0 flex-wrap"
              >
                <div className="min-w-32 flex-1 text-sm font-medium">{kat}</div>
                <input
                  value={mapping[kat]}
                  onChange={(e) =>
                    setMapping((m) => ({ ...m, [kat]: e.target.value }))
                  }
                  className="w-24 h-8 rounded-md border border-border bg-background px-2 text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <Select
                  value={String(ustMapping[kat])}
                  onValueChange={(v) =>
                    setUstMapping((m) => ({ ...m, [kat]: Number(v) }))
                  }
                >
                  <SelectTrigger className="w-24 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="19">19 %</SelectItem>
                    <SelectItem value="7">7 %</SelectItem>
                    <SelectItem value="0">0 %</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5 hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="size-9 rounded-xl bg-[#FFF6E5] text-[#B45309] grid place-items-center">
                <Globe2 className="size-4" />
              </div>
              <div>
                <div className="font-display text-lg font-semibold">
                  Reverse-Charge erkannt
                </div>
                <div className="text-xs text-muted-foreground">
                  Bei Software aus dem Ausland schuldet dein Unternehmen die
                  Umsatzsteuer selbst. Wir kennzeichnen das, dein Steuerberater
                  prüft.
                </div>
              </div>
            </div>
            <Pill tone="amber">
              <AlertTriangle className="size-3" /> Hinweis
            </Pill>
          </div>

          <div className="mt-4 divide-y divide-border">
            {reverseAnbieter.map((a) => (
              <div
                key={a.id}
                className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0"
              >
                <div className="size-8 rounded-lg bg-muted grid place-items-center text-xs font-semibold">
                  {a.tool.slice(0, 2)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold truncate">{a.tool}</div>
                  <div className="text-xs text-muted-foreground">
                    Anbietersitz: {a.land}
                  </div>
                </div>
                <Pill tone={a.aktiv ? "amber" : "muted"}>
                  {a.aktiv ? "Reverse-Charge" : "manuell deaktiviert"}
                </Pill>
                <Switch
                  checked={a.aktiv}
                  onCheckedChange={(v) =>
                    setOverrides((o) => ({ ...o, [a.id]: v }))
                  }
                />
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Vorschau */}
      <Card className="p-5">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <div className="font-display text-lg font-semibold">
              Export-Vorschau · {zeitraumLabel[zeitraum]}
            </div>
            <div className="text-sm text-muted-foreground">
              Eine Zeile pro Posten. Änderungen im Mapping wirken sofort.
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <Bilanz label="Posten" wert={String(bilanz.anzahl)} />
            <Bilanz label="Netto gesamt" wert={euro(bilanz.netto)} />
            <Bilanz
              label="davon Reverse-Charge"
              wert={euro(bilanz.reverse)}
              tone="amber"
            />
            <Bilanz label="Brutto gesamt" wert={euro(bilanz.brutto)} tone="emerald" />
          </div>
        </div>

        {posten.length === 0 ? (
          <div className="mt-8 flex flex-col items-center text-center py-10 rounded-2xl border border-dashed border-border">
            <div className="size-12 rounded-2xl bg-muted grid place-items-center mb-3">
              <Sparkles className="size-5 text-muted-foreground" />
            </div>
            <div className="font-display text-lg font-semibold">Keine Posten</div>
            <div className="text-sm text-muted-foreground max-w-md mt-1">
              In diesem Zeitraum gibt es nichts zu exportieren. Passe Zeitraum
              oder Filter an.
            </div>
          </div>
        ) : (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full text-sm min-w-[900px]">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                  <th className="py-2 pr-3 font-medium">Datum</th>
                  <th className="py-2 pr-3 font-medium">Tool / Anbieter</th>
                  <th className="py-2 pr-3 font-medium">Sitz</th>
                  <th className="py-2 pr-3 font-medium text-right">Netto</th>
                  <th className="py-2 pr-3 font-medium text-right">USt / Hinweis</th>
                  <th className="py-2 pr-3 font-medium text-right">Brutto</th>
                  <th className="py-2 pr-3 font-medium">Konto</th>
                  <th className="py-2 pr-3 font-medium">Kanal</th>
                  {mitKundenzuordnung && (
                    <th className="py-2 pl-3 font-medium">Kunde</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {posten.map((p) => {
                  const brutto = p.reverseCharge
                    ? p.netto
                    : p.netto * (1 + p.ustSatz / 100);
                  return (
                    <tr key={p.id}>
                      <td className="py-2.5 pr-3 tabular-nums whitespace-nowrap">
                        {p.datum}
                      </td>
                      <td className="py-2.5 pr-3">
                        <div className="font-medium">{p.tool}</div>
                        {p.waehrung && (
                          <div className="text-xs text-muted-foreground tabular-nums">
                            {p.waehrung.betrag.toLocaleString("de-DE", {
                              minimumFractionDigits: 2,
                            })}{" "}
                            {p.waehrung.code}
                          </div>
                        )}
                      </td>
                      <td className="py-2.5 pr-3">
                        <span className="inline-flex items-center gap-1.5 text-xs">
                          <Building2 className="size-3 text-muted-foreground" />
                          {p.anbieterLand}
                        </span>
                      </td>
                      <td className="py-2.5 pr-3 text-right tabular-nums">
                        {euro(p.netto)}
                      </td>
                      <td className="py-2.5 pr-3 text-right">
                        {p.reverseCharge ? (
                          <Pill tone="amber">Reverse-Charge</Pill>
                        ) : (
                          <span className="tabular-nums">{p.ustSatz} %</span>
                        )}
                      </td>
                      <td className="py-2.5 pr-3 text-right tabular-nums font-semibold">
                        {euro(brutto)}
                      </td>
                      <td className="py-2.5 pr-3 tabular-nums">{p.konto}</td>
                      <td className="py-2.5 pr-3">
                        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                          <CreditCard className="size-3" />
                          {p.kanal}
                        </span>
                      </td>
                      {mitKundenzuordnung && (
                        <td className="py-2.5 pl-3 text-muted-foreground">
                          {p.kunde ?? "—"}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Verlauf */}
      <Card className="p-5">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <div className="font-display text-lg font-semibold">Verlauf</div>
            <div className="text-sm text-muted-foreground">
              Zuletzt erstellte Steuer-Exporte.
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
                <Calculator className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold truncate">{v.titel}</div>
                <div className="text-xs text-muted-foreground">
                  {v.zeitraum} · erstellt am {v.datum} ·{" "}
                  {v.format === "datev"
                    ? "DATEV-CSV"
                    : v.format === "csv"
                    ? "CSV"
                    : "PDF"}
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5"
                onClick={() => exportieren(v.format)}
              >
                <FileDown className="size-4" /> erneut laden
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function Bilanz({
  label,
  wert,
  tone,
}: {
  label: string;
  wert: string;
  tone?: "amber" | "emerald";
}) {
  const toneClass =
    tone === "amber"
      ? "text-[#B45309]"
      : tone === "emerald"
      ? "text-[#067647]"
      : "text-foreground";
  return (
    <div className="rounded-xl border border-border bg-background/60 px-3 py-2 min-w-32">
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className={`font-display text-base font-semibold tabular-nums ${toneClass}`}>
        {wert}
      </div>
    </div>
  );
}
