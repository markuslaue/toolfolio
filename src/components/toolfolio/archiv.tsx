import { useMemo, useState } from "react";
import {
  FileText,
  FileSignature,
  ScrollText,
  File,
  Upload,
  Eye,
  Download,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  AlertTriangle,
  Camera,
  Search,
  Inbox,
  RefreshCw,
  Sparkles,
  CalendarDays,
  Link2,
  Layers,
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

type DocTyp = "rechnung" | "vertrag" | "agb" | "sonstiges";
type Quelle = "postfach" | "manuell";

type Dokument = {
  id: string;
  typ: DocTyp;
  titel: string;
  datum: string;
  jahr: number;
  betrag?: number;
  quelle: Quelle;
  kunde?: string;
};

type Tool = {
  id: string;
  name: string;
  initials: string;
  farbe: string;
  kategorie: string;
  toolUrl?: string;
  agbUrl?: string;
  buchungsdatum?: string;
  agbStand?: string;
  agbGeaendert?: boolean;
  dokumente: Dokument[];
};

const farben: Record<string, string> = {
  v: "#6C5CE7",
  k: "#FF7A66",
  e: "#12B76A",
  a: "#F5A623",
  b: "#0EA5E9",
};

const initialTools: Tool[] = [
  {
    id: "notion",
    name: "Notion",
    initials: "No",
    farbe: farben.v,
    kategorie: "Wissen",
    toolUrl: "https://www.notion.so",
    agbUrl: "https://www.notion.so/Terms",
    buchungsdatum: "14.10.2024",
    agbStand: "14.10.2024",
    agbGeaendert: true,
    dokumente: [
      { id: "n1", typ: "rechnung", titel: "Rechnung Juni 2026", datum: "01.06.2026", jahr: 2026, betrag: 32, quelle: "postfach" },
      { id: "n2", typ: "rechnung", titel: "Rechnung Mai 2026", datum: "01.05.2026", jahr: 2026, betrag: 32, quelle: "postfach" },
      { id: "n3", typ: "rechnung", titel: "Rechnung April 2026", datum: "01.04.2026", jahr: 2026, betrag: 32, quelle: "postfach" },
      { id: "n4", typ: "agb", titel: "AGB-Snapshot 14.10.2024", datum: "14.10.2024", jahr: 2024, quelle: "manuell" },
    ],
  },
  {
    id: "adobe",
    name: "Adobe Creative Cloud",
    initials: "Ad",
    farbe: farben.k,
    kategorie: "Design",
    toolUrl: "https://www.adobe.com",
    agbUrl: "https://www.adobe.com/legal/terms.html",
    buchungsdatum: "20.01.2025",
    agbStand: "20.01.2025",
    agbGeaendert: false,
    dokumente: [
      { id: "a1", typ: "rechnung", titel: "Jahresrechnung 2025/26", datum: "20.01.2025", jahr: 2025, betrag: 720, quelle: "postfach", kunde: "Kessler" },
      { id: "a2", typ: "vertrag", titel: "Rahmenvertrag Teams", datum: "20.01.2025", jahr: 2025, quelle: "manuell", kunde: "Kessler" },
      { id: "a3", typ: "agb", titel: "AGB-Snapshot 20.01.2025", datum: "20.01.2025", jahr: 2025, quelle: "manuell" },
    ],
  },
  {
    id: "anthropic",
    name: "Anthropic API",
    initials: "An",
    farbe: farben.e,
    kategorie: "AI",
    toolUrl: "https://www.anthropic.com",
    agbUrl: "https://www.anthropic.com/legal/commercial-terms",
    buchungsdatum: "05.03.2025",
    agbStand: "05.03.2025",
    agbGeaendert: false,
    dokumente: [
      { id: "ap1", typ: "rechnung", titel: "Rechnung Juni 2026", datum: "02.06.2026", jahr: 2026, betrag: 318.7, quelle: "postfach" },
      { id: "ap2", typ: "rechnung", titel: "Rechnung Mai 2026", datum: "02.05.2026", jahr: 2026, betrag: 245.2, quelle: "postfach" },
      { id: "ap3", typ: "rechnung", titel: "Rechnung April 2026", datum: "02.04.2026", jahr: 2026, betrag: 198.4, quelle: "postfach" },
      { id: "ap4", typ: "agb", titel: "AGB-Snapshot 05.03.2025", datum: "05.03.2025", jahr: 2025, quelle: "manuell" },
    ],
  },
  {
    id: "figma",
    name: "Figma",
    initials: "Fi",
    farbe: farben.v,
    kategorie: "Design",
    toolUrl: "https://www.figma.com",
    agbUrl: "https://www.figma.com/legal/tos",
    buchungsdatum: "12.06.2024",
    agbStand: "12.06.2024",
    agbGeaendert: false,
    dokumente: [
      { id: "f1", typ: "rechnung", titel: "Rechnung Juni 2026", datum: "12.06.2026", jahr: 2026, betrag: 180, quelle: "postfach", kunde: "Nordwerk" },
      { id: "f2", typ: "rechnung", titel: "Rechnung Mai 2026", datum: "12.05.2026", jahr: 2026, betrag: 180, quelle: "postfach", kunde: "Nordwerk" },
      { id: "f3", typ: "agb", titel: "AGB-Snapshot 12.06.2024", datum: "12.06.2024", jahr: 2024, quelle: "manuell" },
    ],
  },
  {
    id: "loom",
    name: "Loom",
    initials: "Lo",
    farbe: farben.b,
    kategorie: "Video",
    dokumente: [
      { id: "l1", typ: "rechnung", titel: "Rechnung April 2026", datum: "10.04.2026", jahr: 2026, betrag: 80, quelle: "postfach" },
    ],
  },
];

const euro = (n: number) =>
  n.toLocaleString("de-DE", { style: "currency", currency: "EUR" });

function Pill({
  tone = "muted",
  children,
}: {
  tone?: "amber" | "emerald" | "muted" | "violet" | "koralle";
  children: React.ReactNode;
}) {
  const toneClass = {
    amber: "bg-[#FFF6E5] text-[#B45309] border-[#F5A623]/40",
    emerald: "bg-[#ECFDF3] text-[#067647] border-[#12B76A]/40",
    muted: "bg-muted text-muted-foreground border-border",
    violet: "bg-primary/10 text-primary border-primary/30",
    koralle: "bg-[#FFF1EE] text-[#C2410C] border-[#FF7A66]/40",
  }[tone];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${toneClass}`}
    >
      {children}
    </span>
  );
}

function typIcon(t: DocTyp) {
  if (t === "rechnung") return FileText;
  if (t === "vertrag") return FileSignature;
  if (t === "agb") return ScrollText;
  return File;
}
function typLabel(t: DocTyp) {
  return t === "rechnung" ? "Rechnung" : t === "vertrag" ? "Vertrag" : t === "agb" ? "AGB-Snapshot" : "Sonstiges";
}
function typTone(t: DocTyp): "violet" | "emerald" | "amber" | "muted" {
  return t === "rechnung" ? "violet" : t === "vertrag" ? "emerald" : t === "agb" ? "amber" : "muted";
}

export function Archiv() {
  const [tools, setTools] = useState<Tool[]>(initialTools);
  const [ansicht, setAnsicht] = useState<"tool" | "alle">("tool");
  const [suche, setSuche] = useState("");
  const [typFilter, setTypFilter] = useState<"alle" | DocTyp>("alle");
  const [toolFilter, setToolFilter] = useState<string>("alle");
  const [kundeFilter, setKundeFilter] = useState<string>("alle");
  const [jahrFilter, setJahrFilter] = useState<string>("alle");
  const [open, setOpen] = useState<Record<string, boolean>>({ notion: true, adobe: true });
  const [editTool, setEditTool] = useState<Tool | null>(null);
  const [vergleichTool, setVergleichTool] = useState<Tool | null>(null);
  const [snapshotTool, setSnapshotTool] = useState<Tool | null>(null);
  const [uploadTool, setUploadTool] = useState<Tool | null>(null);

  const stats = useMemo(() => {
    const alle = tools.flatMap((t) => t.dokumente);
    return {
      gesamt: alle.length,
      rechnungen2026: alle.filter((d) => d.typ === "rechnung" && d.jahr === 2026).length,
      ausgaben: alle.filter((d) => d.typ === "rechnung").reduce((s, d) => s + (d.betrag ?? 0), 0),
      agbAenderungen: tools.filter((t) => t.agbGeaendert).length,
    };
  }, [tools]);

  const kunden = useMemo(() => {
    const k = new Set<string>();
    tools.flatMap((t) => t.dokumente).forEach((d) => d.kunde && k.add(d.kunde));
    return Array.from(k);
  }, [tools]);

  const jahre = useMemo(() => {
    const j = new Set<number>();
    tools.flatMap((t) => t.dokumente).forEach((d) => j.add(d.jahr));
    return Array.from(j).sort((a, b) => b - a);
  }, [tools]);

  const matches = (d: Dokument, t: Tool) => {
    if (typFilter !== "alle" && d.typ !== typFilter) return false;
    if (toolFilter !== "alle" && t.id !== toolFilter) return false;
    if (kundeFilter !== "alle" && d.kunde !== kundeFilter) return false;
    if (jahrFilter !== "alle" && String(d.jahr) !== jahrFilter) return false;
    if (suche) {
      const q = suche.toLowerCase();
      if (
        !d.titel.toLowerCase().includes(q) &&
        !t.name.toLowerCase().includes(q) &&
        !(d.kunde ?? "").toLowerCase().includes(q)
      )
        return false;
    }
    return true;
  };

  const flach = useMemo(
    () =>
      tools
        .flatMap((t) => t.dokumente.map((d) => ({ d, t })))
        .filter(({ d, t }) => matches(d, t))
        .sort((a, b) => (a.d.datum < b.d.datum ? 1 : -1)),
    [tools, typFilter, toolFilter, kundeFilter, jahrFilter, suche]
  );

  const ansehen = (titel: string) => toast.message(`Vorschau (Demo): ${titel}`);
  const laden = (titel: string) => toast.success(`Heruntergeladen (Demo): ${titel}`);

  const speichernUrls = (data: { toolUrl: string; agbUrl: string }) => {
    if (!editTool) return;
    setTools((ts) =>
      ts.map((t) =>
        t.id === editTool.id
          ? {
              ...t,
              toolUrl: data.toolUrl || undefined,
              agbUrl: data.agbUrl || undefined,
              buchungsdatum: t.buchungsdatum ?? new Date().toLocaleDateString("de-DE"),
              agbStand: t.agbStand ?? new Date().toLocaleDateString("de-DE"),
            }
          : t
      )
    );
    setEditTool(null);
    toast.success("URLs und Snapshot aktualisiert");
  };

  return (
    <div className="space-y-6">
      {/* Kopf */}
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight">
          Archiv
        </h1>
        <p className="text-muted-foreground max-w-2xl">
          Rechnungen, Verträge und AGB zentral, plus was bei der Buchung galt.
        </p>
      </div>

      {/* Statistik */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={Layers} label="Dokumente gesamt" wert={String(stats.gesamt)} />
        <Stat icon={FileText} label="Rechnungen 2026" wert={String(stats.rechnungen2026)} />
        <Stat icon={Sparkles} label="Dokumentierte Ausgaben" wert={euro(stats.ausgaben)} tone="emerald" />
        <Stat
          icon={AlertTriangle}
          label="AGB-Änderungen erkannt"
          wert={String(stats.agbAenderungen)}
          tone="amber"
        />
      </div>

      {/* Filter-Leiste */}
      <div className="rounded-3xl border border-border bg-card p-4 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex rounded-full bg-muted p-0.5 text-xs font-medium">
            <button
              onClick={() => setAnsicht("tool")}
              className={`rounded-full px-3 py-1.5 transition-colors ${
                ansicht === "tool" ? "bg-card shadow text-foreground" : "text-muted-foreground"
              }`}
            >
              Nach Tool
            </button>
            <button
              onClick={() => setAnsicht("alle")}
              className={`rounded-full px-3 py-1.5 transition-colors ${
                ansicht === "alle" ? "bg-card shadow text-foreground" : "text-muted-foreground"
              }`}
            >
              Alle Dokumente
            </button>
          </div>

          <div className="relative flex-1 min-w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              value={suche}
              onChange={(e) => setSuche(e.target.value)}
              placeholder="Rechnung, Tool oder Kunde suchen"
              className="pl-9"
            />
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <Select value={toolFilter} onValueChange={setToolFilter}>
            <SelectTrigger><SelectValue placeholder="Tool" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="alle">Alle Tools</SelectItem>
              {tools.map((t) => (
                <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={typFilter} onValueChange={(v) => setTypFilter(v as typeof typFilter)}>
            <SelectTrigger><SelectValue placeholder="Typ" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="alle">Alle Typen</SelectItem>
              <SelectItem value="rechnung">Rechnung</SelectItem>
              <SelectItem value="vertrag">Vertrag</SelectItem>
              <SelectItem value="agb">AGB-Snapshot</SelectItem>
              <SelectItem value="sonstiges">Sonstiges</SelectItem>
            </SelectContent>
          </Select>
          <Select value={kundeFilter} onValueChange={setKundeFilter}>
            <SelectTrigger><SelectValue placeholder="Kunde" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="alle">Alle Kunden</SelectItem>
              {kunden.map((k) => (
                <SelectItem key={k} value={k}>{k}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={jahrFilter} onValueChange={setJahrFilter}>
            <SelectTrigger><SelectValue placeholder="Jahr" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="alle">Alle Jahre</SelectItem>
              {jahre.map((j) => (
                <SelectItem key={j} value={String(j)}>{j}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Inhalt */}
      {ansicht === "tool" ? (
        <div className="space-y-4">
          {tools
            .filter((t) => toolFilter === "alle" || t.id === toolFilter)
            .map((t) => {
              const sichtbar = t.dokumente.filter((d) => matches(d, t));
              if (sichtbar.length === 0 && (suche || typFilter !== "alle" || kundeFilter !== "alle" || jahrFilter !== "alle"))
                return null;
              const summe = t.dokumente
                .filter((d) => d.typ === "rechnung")
                .reduce((s, d) => s + (d.betrag ?? 0), 0);
              const isOpen = open[t.id] ?? false;
              return (
                <div
                  key={t.id}
                  className="rounded-3xl bg-card border border-border shadow-sm transition-all hover:shadow-md"
                >
                  <button
                    onClick={() => setOpen((o) => ({ ...o, [t.id]: !isOpen }))}
                    className="w-full text-left px-5 py-4 flex items-center gap-4 flex-wrap"
                  >
                    <div
                      className="size-11 rounded-2xl grid place-items-center text-white font-display font-bold"
                      style={{ background: t.farbe }}
                    >
                      {t.initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="font-display text-lg font-semibold">{t.name}</div>
                        <Pill>{t.kategorie}</Pill>
                        {t.agbGeaendert && (
                          <Pill tone="amber">
                            <AlertTriangle className="size-3" /> AGB geändert
                          </Pill>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {t.dokumente.length} Dokumente · Rechnungen gesamt{" "}
                        <span className="tabular-nums font-semibold text-foreground">{euro(summe)}</span>
                      </div>
                    </div>
                    {isOpen ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 space-y-4">
                      {/* Konditionen */}
                      <KonditionsBlock
                        tool={t}
                        onEdit={() => setEditTool(t)}
                        onSnapshot={() => setSnapshotTool(t)}
                        onVergleich={() => setVergleichTool(t)}
                      />

                      {/* Dokumente */}
                      <div>
                        <div className="flex items-center justify-between gap-3 mb-2 flex-wrap">
                          <div className="text-sm font-semibold">Dokumente</div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1.5"
                              onClick={() => setUploadTool(t)}
                            >
                              <Upload className="size-4" /> Dokument hochladen
                            </Button>
                          </div>
                        </div>

                        {sichtbar.length === 0 ? (
                          <EmptyState />
                        ) : (
                          <div className="divide-y divide-border rounded-2xl border border-border">
                            {sichtbar.map((d) => (
                              <DokRow key={d.id} d={d} onView={() => ansehen(d.titel)} onDownload={() => laden(d.titel)} />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      ) : (
        <div className="rounded-3xl bg-card border border-border shadow-sm overflow-hidden">
          {flach.length === 0 ? (
            <div className="p-6"><EmptyState /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[900px]">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground bg-muted/40">
                    <th className="py-3 px-4 font-medium">Datum</th>
                    <th className="py-3 px-4 font-medium">Tool</th>
                    <th className="py-3 px-4 font-medium">Typ</th>
                    <th className="py-3 px-4 font-medium text-right">Betrag</th>
                    <th className="py-3 px-4 font-medium">Kunde</th>
                    <th className="py-3 px-4 font-medium">Quelle</th>
                    <th className="py-3 px-4 font-medium text-right">Aktionen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {flach.map(({ d, t }) => (
                    <tr key={d.id} className="hover:bg-muted/30">
                      <td className="py-2.5 px-4 tabular-nums whitespace-nowrap">{d.datum}</td>
                      <td className="py-2.5 px-4">
                        <span className="inline-flex items-center gap-2">
                          <span
                            className="size-6 rounded-md grid place-items-center text-[10px] font-bold text-white"
                            style={{ background: t.farbe }}
                          >
                            {t.initials}
                          </span>
                          {t.name}
                        </span>
                      </td>
                      <td className="py-2.5 px-4"><Pill tone={typTone(d.typ)}>{typLabel(d.typ)}</Pill></td>
                      <td className="py-2.5 px-4 text-right tabular-nums">
                        {d.betrag !== undefined ? euro(d.betrag) : "—"}
                      </td>
                      <td className="py-2.5 px-4 text-muted-foreground">{d.kunde ?? "—"}</td>
                      <td className="py-2.5 px-4">
                        <Pill tone={d.quelle === "postfach" ? "violet" : "muted"}>
                          {d.quelle === "postfach" ? (
                            <><Inbox className="size-3" /> Beleg-Postfach</>
                          ) : (
                            <>manuell</>
                          )}
                        </Pill>
                      </td>
                      <td className="py-2.5 px-4">
                        <div className="flex justify-end gap-1.5">
                          <Button size="sm" variant="ghost" onClick={() => ansehen(d.titel)} className="gap-1">
                            <Eye className="size-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => laden(d.titel)} className="gap-1">
                            <Download className="size-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* URLs nachtragen Dialog */}
      <UrlDialog tool={editTool} onClose={() => setEditTool(null)} onSave={speichernUrls} />

      {/* Snapshot Viewer */}
      <Dialog open={!!snapshotTool} onOpenChange={(v) => !v && setSnapshotTool(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>AGB-Snapshot · {snapshotTool?.name}</DialogTitle>
            <DialogDescription>
              Datiertes Abbild der AGB vom {snapshotTool?.agbStand ?? "—"}. So lässt sich
              später beweisen, was bei der Buchung galt.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-2xl bg-muted/40 border border-dashed border-border p-6 text-sm text-muted-foreground">
            Snapshot-Vorschau (Demo) · gespeichert als datiertes PDF.
            <div className="mt-3 h-40 rounded-xl bg-background/60 grid place-items-center text-xs">
              Inhalt nicht dargestellt
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSnapshotTool(null)}>Schließen</Button>
            <Button onClick={() => { toast.success("Snapshot heruntergeladen (Demo)"); setSnapshotTool(null); }}>
              <Download className="size-4 mr-1" /> Snapshot laden
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Vergleich */}
      <Dialog open={!!vergleichTool} onOpenChange={(v) => !v && setVergleichTool(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>AGB vergleichen · {vergleichTool?.name}</DialogTitle>
            <DialogDescription>
              Snapshot vom {vergleichTool?.agbStand ?? "—"} gegenüber der aktuellen
              Online-Version. Geänderte Absätze sind farblich markiert.
            </DialogDescription>
          </DialogHeader>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="rounded-2xl bg-muted/40 border border-border p-4 text-xs">
              <div className="font-semibold mb-2">Bei Buchung</div>
              <div className="space-y-1.5 text-muted-foreground">
                <p>§ 3 Vertragslaufzeit beträgt 12 Monate.</p>
                <p>§ 7 Kündigungsfrist: 30 Tage zum Laufzeitende.</p>
                <p>§ 12 Datenexport jederzeit möglich.</p>
              </div>
            </div>
            <div className="rounded-2xl bg-[#FFF6E5] border border-[#F5A623]/40 p-4 text-xs">
              <div className="font-semibold mb-2 text-[#B45309]">Heute</div>
              <div className="space-y-1.5 text-muted-foreground">
                <p>§ 3 Vertragslaufzeit beträgt 12 Monate.</p>
                <p className="text-[#B45309] font-medium">§ 7 Kündigungsfrist: 60 Tage zum Laufzeitende.</p>
                <p>§ 12 Datenexport jederzeit möglich.</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setVergleichTool(null)}>Schließen</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload */}
      <Dialog open={!!uploadTool} onOpenChange={(v) => !v && setUploadTool(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dokument hochladen · {uploadTool?.name}</DialogTitle>
            <DialogDescription>
              Vertrag, Rechnung oder Sonstiges. Im Demo ohne echten Upload.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-2xl border-2 border-dashed border-border bg-muted/30 p-8 text-center">
            <Upload className="size-6 mx-auto text-muted-foreground" />
            <div className="mt-2 text-sm font-medium">Datei hier ablegen oder klicken</div>
            <div className="text-xs text-muted-foreground">PDF, PNG oder JPG bis 20 MB</div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadTool(null)}>Abbrechen</Button>
            <Button onClick={() => { toast.success("Dokument hinzugefügt (Demo)"); setUploadTool(null); }}>
              Hinzufügen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  wert,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  wert: string;
  tone?: "amber" | "emerald";
}) {
  const toneClass =
    tone === "amber" ? "text-[#B45309]" : tone === "emerald" ? "text-[#067647]" : "text-foreground";
  return (
    <div className="rounded-3xl bg-card border border-border p-4 shadow-sm">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className="size-3.5" /> {label}
      </div>
      <div className={`mt-1 font-display text-2xl font-semibold tabular-nums ${toneClass}`}>
        {wert}
      </div>
    </div>
  );
}

function KonditionsBlock({
  tool,
  onEdit,
  onSnapshot,
  onVergleich,
}: {
  tool: Tool;
  onEdit: () => void;
  onSnapshot: () => void;
  onVergleich: () => void;
}) {
  const fehlt = !tool.toolUrl || !tool.agbUrl;
  return (
    <div
      className={`rounded-2xl border p-4 ${
        tool.agbGeaendert
          ? "border-[#F5A623]/40 bg-[#FFF6E5]"
          : fehlt
          ? "border-dashed border-border bg-muted/30"
          : "border-border bg-background/60"
      }`}
    >
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <ScrollText className="size-4 text-primary" />
          <div className="font-display text-sm font-semibold">
            Konditionen zum Buchungszeitpunkt
          </div>
        </div>
        {tool.agbGeaendert && (
          <Pill tone="amber">
            <AlertTriangle className="size-3" /> AGB haben sich seit deiner Buchung geändert
          </Pill>
        )}
      </div>

      {fehlt ? (
        <div className="mt-3 flex items-center justify-between gap-3 flex-wrap">
          <div className="text-sm text-muted-foreground">
            Tool-URL und AGB-URL sind noch nicht hinterlegt. Trag sie nach, damit
            wir einen datierten Snapshot anlegen können.
          </div>
          <Button size="sm" onClick={onEdit} className="gap-1.5">
            <Link2 className="size-4" /> URL und AGB nachtragen
          </Button>
        </div>
      ) : (
        <>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <Feld label="Tool-URL bei Buchung" value={tool.toolUrl!} extern />
            <Feld label="AGB-URL bei Buchung" value={tool.agbUrl!} extern />
            <Feld
              label="Buchungsdatum"
              icon={CalendarDays}
              value={tool.buchungsdatum ?? "—"}
            />
            <Feld
              label="Stand des AGB-Snapshots"
              icon={Camera}
              value={tool.agbStand ?? "—"}
            />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button size="sm" variant="outline" className="gap-1.5" onClick={onSnapshot}>
              <Eye className="size-4" /> Snapshot ansehen
            </Button>
            {tool.agbGeaendert && (
              <Button size="sm" variant="outline" className="gap-1.5" onClick={onVergleich}>
                <Layers className="size-4" /> Aktuelle Version vergleichen
              </Button>
            )}
            <Button size="sm" variant="ghost" className="gap-1.5" onClick={onEdit}>
              <Link2 className="size-4" /> URLs bearbeiten
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="gap-1.5"
              onClick={() => toast.success("Neuer AGB-Snapshot angestoßen (Demo)")}
            >
              <RefreshCw className="size-4" /> Erneuten Snapshot anstoßen
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

function Feld({
  label,
  value,
  extern,
  icon: Icon,
}: {
  label: string;
  value: string;
  extern?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      {extern ? (
        <a
          href={value}
          target="_blank"
          rel="noreferrer"
          className="mt-0.5 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline break-all"
        >
          {value} <ExternalLink className="size-3" />
        </a>
      ) : (
        <div className="mt-0.5 inline-flex items-center gap-1.5 text-sm font-medium tabular-nums">
          {Icon && <Icon className="size-3.5 text-muted-foreground" />} {value}
        </div>
      )}
    </div>
  );
}

function DokRow({
  d,
  onView,
  onDownload,
}: {
  d: Dokument;
  onView: () => void;
  onDownload: () => void;
}) {
  const Icon = typIcon(d.typ);
  return (
    <div className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/30 flex-wrap">
      <div className="size-9 rounded-xl bg-muted grid place-items-center shrink-0">
        <Icon className="size-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold truncate">{d.titel}</div>
        <div className="text-xs text-muted-foreground flex items-center gap-2 flex-wrap">
          <span className="tabular-nums">{d.datum}</span>
          <span>·</span>
          <Pill tone={typTone(d.typ)}>{typLabel(d.typ)}</Pill>
          <Pill tone={d.quelle === "postfach" ? "violet" : "muted"}>
            {d.quelle === "postfach" ? (
              <><Inbox className="size-3" /> Beleg-Postfach</>
            ) : (
              <>manuell</>
            )}
          </Pill>
          {d.kunde && <span>· Kunde {d.kunde}</span>}
        </div>
      </div>
      {d.betrag !== undefined && (
        <div className="text-sm font-semibold tabular-nums">{euro(d.betrag)}</div>
      )}
      <div className="flex gap-1.5">
        <Button size="sm" variant="ghost" onClick={onView} className="gap-1">
          <Eye className="size-4" /> Ansehen
        </Button>
        <Button size="sm" variant="ghost" onClick={onDownload} className="gap-1">
          <Download className="size-4" />
        </Button>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-8 text-center">
      <div className="size-12 rounded-2xl bg-muted grid place-items-center mx-auto mb-3">
        <Inbox className="size-5 text-muted-foreground" />
      </div>
      <div className="font-display text-base font-semibold">Noch keine Dokumente</div>
      <div className="text-sm text-muted-foreground max-w-md mx-auto mt-1">
        Belege landen automatisch über das Beleg-Postfach hier. Verträge und
        Sonstiges kannst du jederzeit manuell hochladen.
      </div>
    </div>
  );
}

function UrlDialog({
  tool,
  onClose,
  onSave,
}: {
  tool: Tool | null;
  onClose: () => void;
  onSave: (data: { toolUrl: string; agbUrl: string }) => void;
}) {
  const [toolUrl, setToolUrl] = useState("");
  const [agbUrl, setAgbUrl] = useState("");

  // initialize when dialog opens
  useMemo(() => {
    if (tool) {
      setToolUrl(tool.toolUrl ?? "");
      setAgbUrl(tool.agbUrl ?? "");
    }
  }, [tool?.id]);

  return (
    <Dialog open={!!tool} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>URL und AGB nachtragen · {tool?.name}</DialogTitle>
          <DialogDescription>
            Wir leiten die AGB-URL aus der Domain ab und legen einen datierten
            Snapshot an. So weißt du später, was bei der Buchung galt.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label className="text-xs">Tool-URL</Label>
            <Input
              value={toolUrl}
              onChange={(e) => setToolUrl(e.target.value)}
              placeholder="https://"
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-xs">AGB-URL</Label>
            <Input
              value={agbUrl}
              onChange={(e) => setAgbUrl(e.target.value)}
              placeholder="https://"
              className="mt-1"
            />
            <button
              type="button"
              onClick={() => {
                try {
                  const u = new URL(toolUrl);
                  setAgbUrl(`${u.origin}/terms`);
                } catch {
                  toast.error("Bitte zuerst eine gültige Tool-URL eingeben");
                }
              }}
              className="mt-1 text-xs text-primary hover:underline"
            >
              Aus Tool-URL ableiten
            </button>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Abbrechen</Button>
          <Button onClick={() => onSave({ toolUrl, agbUrl })} className="gap-1.5">
            <Camera className="size-4" /> Speichern und Snapshot anlegen
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
