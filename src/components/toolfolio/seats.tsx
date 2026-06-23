import { useMemo, useState } from "react";
import {
  Armchair,
  ArrowRight,
  AlertTriangle,
  Sparkles,
  Users,
  CircleDot,
  Info,
  Settings2,
  Eye,
  Undo2,
  PiggyBank,
  Plug,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";

type Person = {
  id: string;
  name: string;
  email: string;
  rolle: string;
  letzteAktivitaet: string; // Text
  inaktiv: boolean;
};

type Tool = {
  id: string;
  name: string;
  initials: string;
  farbe: string;
  kategorie: string;
  gebucht: number;
  zugewiesen: number;
  aktiv: number | null; // null = keine Daten
  preisProPlatz: number;
  personen: Person[];
};

const initialTools: Tool[] = [
  {
    id: "slack",
    name: "Slack Business+",
    initials: "Sl",
    farbe: "#6C5CE7",
    kategorie: "Kommunikation",
    gebucht: 12,
    zugewiesen: 9,
    aktiv: 7,
    preisProPlatz: 12.5,
    personen: [
      p("Markus Hahn", "markus@agentur.de", "Owner", "heute aktiv", false),
      p("Lena Brandt", "lena@agentur.de", "Designerin", "gestern aktiv", false),
      p("Tobi Krause", "tobi@agentur.de", "Developer", "vor 2 Tagen", false),
      p("Yara Sommer", "yara@agentur.de", "PM", "vor 5 Tagen", false),
      p("Nils Berger", "nils@agentur.de", "Texter", "heute aktiv", false),
      p("Mira Hoff", "mira@agentur.de", "Designerin", "vor 1 Woche", false),
      p("Jonas Lehmann", "jonas@agentur.de", "Developer", "vor 10 Tagen", false),
      p("Tim Walter", "tim@agentur.de", "Werkstudent", "vor 2 Monaten", true),
      p("Anika Roth", "anika@agentur.de", "Praktikantin", "vor 3 Monaten", true),
    ],
  },
  {
    id: "figma",
    name: "Figma Organization",
    initials: "Fi",
    farbe: "#FF7A66",
    kategorie: "Design",
    gebucht: 8,
    zugewiesen: 8,
    aktiv: 6,
    preisProPlatz: 22.5,
    personen: [
      p("Lena Brandt", "lena@agentur.de", "Designerin", "heute aktiv", false),
      p("Mira Hoff", "mira@agentur.de", "Designerin", "gestern aktiv", false),
      p("Markus Hahn", "markus@agentur.de", "Owner", "vor 3 Tagen", false),
      p("Yara Sommer", "yara@agentur.de", "PM", "vor 1 Woche", false),
      p("Tobi Krause", "tobi@agentur.de", "Developer", "vor 2 Wochen", false),
      p("Nils Berger", "nils@agentur.de", "Texter", "vor 4 Wochen", false),
      p("Anika Roth", "anika@agentur.de", "Praktikantin", "vor 2 Monaten", true),
      p("Paul Maier", "paul@agentur.de", "ex-Freelancer", "vor 5 Monaten", true),
    ],
  },
  {
    id: "adobe",
    name: "Adobe Creative Cloud Teams",
    initials: "Ad",
    farbe: "#0EA5E9",
    kategorie: "Design",
    gebucht: 5,
    zugewiesen: 3,
    aktiv: 3,
    preisProPlatz: 69.99,
    personen: [
      p("Lena Brandt", "lena@agentur.de", "Designerin", "heute aktiv", false),
      p("Mira Hoff", "mira@agentur.de", "Designerin", "gestern aktiv", false),
      p("Nils Berger", "nils@agentur.de", "Texter", "vor 4 Tagen", false),
    ],
  },
  {
    id: "gws",
    name: "Google Workspace Business",
    initials: "GW",
    farbe: "#12B76A",
    kategorie: "Office",
    gebucht: 10,
    zugewiesen: 10,
    aktiv: 10,
    preisProPlatz: 12,
    personen: [
      p("Markus Hahn", "markus@agentur.de", "Owner", "heute aktiv", false),
      p("Lena Brandt", "lena@agentur.de", "Designerin", "heute aktiv", false),
      p("Tobi Krause", "tobi@agentur.de", "Developer", "heute aktiv", false),
      p("Yara Sommer", "yara@agentur.de", "PM", "heute aktiv", false),
      p("Nils Berger", "nils@agentur.de", "Texter", "heute aktiv", false),
      p("Mira Hoff", "mira@agentur.de", "Designerin", "heute aktiv", false),
      p("Jonas Lehmann", "jonas@agentur.de", "Developer", "gestern aktiv", false),
      p("Tim Walter", "tim@agentur.de", "Werkstudent", "heute aktiv", false),
      p("Anika Roth", "anika@agentur.de", "Praktikantin", "gestern aktiv", false),
      p("Paul Maier", "paul@agentur.de", "Freelancer", "vor 2 Tagen", false),
    ],
  },
  {
    id: "notion",
    name: "Notion Plus",
    initials: "No",
    farbe: "#F5A623",
    kategorie: "Wissen",
    gebucht: 11,
    zugewiesen: 9,
    aktiv: null,
    preisProPlatz: 9.5,
    personen: [
      p("Markus Hahn", "markus@agentur.de", "Owner", "—", false),
      p("Lena Brandt", "lena@agentur.de", "Designerin", "—", false),
      p("Tobi Krause", "tobi@agentur.de", "Developer", "—", false),
      p("Yara Sommer", "yara@agentur.de", "PM", "—", false),
      p("Nils Berger", "nils@agentur.de", "Texter", "—", false),
      p("Mira Hoff", "mira@agentur.de", "Designerin", "—", false),
      p("Jonas Lehmann", "jonas@agentur.de", "Developer", "—", false),
      p("Tim Walter", "tim@agentur.de", "Werkstudent", "—", false),
      p("Anika Roth", "anika@agentur.de", "Praktikantin", "—", false),
    ],
  },
];

function p(name: string, email: string, rolle: string, akt: string, inaktiv: boolean): Person {
  return { id: `${name}-${email}`, name, email, rolle, letzteAktivitaet: akt, inaktiv };
}

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

export function Seats() {
  const [tools, setTools] = useState<Tool[]>(initialTools);
  const [drilldown, setDrilldown] = useState<Tool | null>(null);

  const kpis = useMemo(() => {
    let gebucht = 0;
    let genutzt = 0;
    let ungenutzt = 0;
    let monatVerschwendung = 0;
    tools.forEach((t) => {
      gebucht += t.gebucht;
      const u = t.aktiv ?? t.zugewiesen;
      genutzt += u;
      const un = t.gebucht - u;
      ungenutzt += un;
      monatVerschwendung += un * t.preisProPlatz;
    });
    return { gebucht, genutzt, ungenutzt, monatVerschwendung, jahrVerschwendung: monatVerschwendung * 12 };
  }, [tools]);

  const reduce = (toolId: string, anzahl: number) => {
    setTools((ts) =>
      ts.map((t) =>
        t.id === toolId
          ? {
              ...t,
              gebucht: Math.max(t.zugewiesen, t.gebucht - anzahl),
            }
          : t
      )
    );
    toast.success(
      `${anzahl} Platz${anzahl === 1 ? "" : "es"} zurückgegeben (Demo) · spart ${euro(
        anzahl * (tools.find((t) => t.id === toolId)?.preisProPlatz ?? 0)
      )} pro Monat`
    );
  };

  return (
    <div className="space-y-6">
      {/* Kopf */}
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight">
          Seats & Lizenzen
        </h1>
        <p className="text-muted-foreground max-w-2xl">
          Bezahlte Plätze gegen genutzte. Hol dir ungenutzte zurück, das ist
          meistens der größte Sparhebel.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi icon={Armchair} label="Plätze gebucht" wert={String(kpis.gebucht)} hint="über alle Platz-Tools" />
        <Kpi icon={Users} label="Genutzt" wert={String(kpis.genutzt)} hint="zugewiesen bzw. aktiv" tone="emerald" />
        <Kpi
          icon={AlertTriangle}
          label="Ungenutzt"
          wert={String(kpis.ungenutzt)}
          hint="reine Verschwendung"
          tone="amber"
        />
        <Kpi
          icon={PiggyBank}
          label="Verschwendete Kosten"
          wert={`${euro(kpis.monatVerschwendung)} / Monat`}
          hint={`${euro(kpis.jahrVerschwendung)} pro Jahr`}
          tone="amber"
        />
      </div>

      {/* Tool-Liste */}
      <div className="space-y-4">
        {tools.map((t) => (
          <ToolKarte key={t.id} tool={t} onOpen={() => setDrilldown(t)} onReduce={reduce} />
        ))}
      </div>

      {/* Verschwendungs-Zusammenfassung */}
      <div className="rounded-3xl bg-card border border-border shadow-sm p-5 flex items-center gap-4 flex-wrap">
        <div className="size-12 rounded-2xl bg-[#FFF6E5] text-[#B45309] grid place-items-center">
          <AlertTriangle className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-display text-lg font-semibold">
            {kpis.ungenutzt} ungenutzte Plätze erkannt
          </div>
          <div className="text-sm text-muted-foreground">
            Schick die Verschwendung an die Sparvorschläge und plane das
            Zurückgeben in einem Rutsch.
          </div>
        </div>
        <Link
          to={"/sparvorschlaege" as "/"}
          className="inline-flex items-center gap-1.5 rounded-full bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90"
          onClick={() => toast.success("An Sparvorschläge gesendet (Demo)")}
        >
          <Sparkles className="size-4" /> An Sparvorschläge senden
          <ArrowRight className="size-4" />
        </Link>
      </div>

      {/* Drilldown */}
      <Sheet open={!!drilldown} onOpenChange={(v) => !v && setDrilldown(null)}>
        <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
          {drilldown && (
            <Drilldown
              tool={drilldown}
              onReduce={(n) => {
                reduce(drilldown.id, n);
                setDrilldown((d) =>
                  d ? { ...d, gebucht: Math.max(d.zugewiesen, d.gebucht - n) } : d
                );
              }}
            />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function Kpi({
  icon: Icon,
  label,
  wert,
  hint,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  wert: string;
  hint?: string;
  tone?: "amber" | "emerald";
}) {
  const toneClass =
    tone === "amber" ? "text-[#B45309]" : tone === "emerald" ? "text-[#067647]" : "text-foreground";
  return (
    <div className="rounded-3xl bg-card border border-border shadow-sm p-4 hover:-translate-y-0.5 hover:shadow-md transition-all">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className="size-3.5" /> {label}
      </div>
      <div className={`mt-1 font-display text-2xl font-semibold tabular-nums ${toneClass}`}>
        {wert}
      </div>
      {hint && <div className="text-[11px] text-muted-foreground mt-0.5">{hint}</div>}
    </div>
  );
}

function ToolKarte({
  tool,
  onOpen,
  onReduce,
}: {
  tool: Tool;
  onOpen: () => void;
  onReduce: (toolId: string, anzahl: number) => void;
}) {
  const nutzungsdatenFehlen = tool.aktiv === null;
  const genutzt = tool.aktiv ?? tool.zugewiesen;
  const ungenutzt = tool.gebucht - genutzt;
  const reinUngenutzt = tool.gebucht - tool.zugewiesen;
  const inaktivZug = tool.zugewiesen - (tool.aktiv ?? tool.zugewiesen);
  const verschwendet = ungenutzt * tool.preisProPlatz;
  const voll = ungenutzt === 0;

  const aktivPct = (genutzt / tool.gebucht) * 100;
  const zugewPct = (tool.zugewiesen / tool.gebucht) * 100;

  return (
    <div className="rounded-3xl bg-card border border-border shadow-sm p-5 hover:-translate-y-0.5 hover:shadow-md transition-all">
      <div className="flex items-start gap-4 flex-wrap">
        <div
          className="size-12 rounded-2xl grid place-items-center text-white font-display font-bold"
          style={{ background: tool.farbe }}
        >
          {tool.initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="font-display text-lg font-semibold">{tool.name}</div>
            <Pill>{tool.kategorie}</Pill>
            {voll ? (
              <Pill tone="emerald">voll genutzt</Pill>
            ) : reinUngenutzt > 0 ? (
              <Pill tone="amber">
                <AlertTriangle className="size-3" /> {reinUngenutzt} nicht zugewiesen
              </Pill>
            ) : null}
            {nutzungsdatenFehlen && (
              <Pill tone="muted">
                <Info className="size-3" /> Nutzungsdaten nötig
              </Pill>
            )}
          </div>
          <div className="text-xs text-muted-foreground mt-0.5 tabular-nums">
            {tool.gebucht} gebucht · {tool.zugewiesen} zugewiesen ·{" "}
            {nutzungsdatenFehlen ? (
              <span className="text-muted-foreground/70">aktiv unbekannt</span>
            ) : (
              <>{tool.aktiv} aktiv</>
            )}{" "}
            · {euro(tool.preisProPlatz)} pro Platz
          </div>
        </div>
        <div className="text-right">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
            Verschwendet
          </div>
          <div
            className={`font-display text-xl font-bold tabular-nums ${
              verschwendet > 0 ? "text-[#B45309]" : "text-[#067647]"
            }`}
          >
            {euro(verschwendet)}
          </div>
          <div className="text-[11px] text-muted-foreground">pro Monat</div>
        </div>
      </div>

      {/* Balken */}
      <div className="mt-4">
        <div className="relative h-3 w-full rounded-full bg-[#FFF6E5] overflow-hidden">
          {/* zugewiesen */}
          <div
            className="absolute inset-y-0 left-0 bg-primary/35"
            style={{ width: `${zugewPct}%` }}
          />
          {/* aktiv */}
          {!nutzungsdatenFehlen && (
            <div
              className="absolute inset-y-0 left-0 bg-primary"
              style={{ width: `${aktivPct}%` }}
            />
          )}
        </div>
        <div className="mt-2 flex items-center gap-4 text-[11px] text-muted-foreground flex-wrap">
          <Legend color="#6C5CE7" label={`${tool.aktiv ?? "—"} aktiv`} />
          <Legend color="rgba(108,92,231,0.35)" label={`${tool.zugewiesen} zugewiesen`} />
          <Legend color="#FFF6E5" border label={`${ungenutzt} ungenutzt`} />
        </div>
      </div>

      {/* Verschwendungs-Typen */}
      {(reinUngenutzt > 0 || inaktivZug > 0) && (
        <div className="mt-4 grid sm:grid-cols-2 gap-3">
          {reinUngenutzt > 0 && (
            <div className="rounded-2xl border border-[#F5A623]/40 bg-[#FFF6E5] p-3">
              <div className="flex items-center gap-2">
                <CircleDot className="size-4 text-[#B45309]" />
                <div className="text-sm font-semibold">
                  {reinUngenutzt} gebucht, niemandem zugewiesen
                </div>
              </div>
              <div className="text-xs text-[#B45309]/90 mt-0.5">
                Reine Verschwendung. Lässt sich sofort zurückgeben.
              </div>
              <Button
                size="sm"
                className="mt-2 gap-1.5"
                onClick={() => onReduce(tool.id, reinUngenutzt)}
              >
                <Undo2 className="size-4" /> {reinUngenutzt} Plätze zurückgeben
              </Button>
            </div>
          )}
          {inaktivZug > 0 && !nutzungsdatenFehlen && (
            <div className="rounded-2xl border border-border bg-background/60 p-3">
              <div className="flex items-center gap-2">
                <Users className="size-4 text-muted-foreground" />
                <div className="text-sm font-semibold">
                  {inaktivZug} zugewiesen, aber inaktiv
                </div>
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                Personen prüfen, bevor du den Platz entziehst.
              </div>
              <Button size="sm" variant="outline" className="mt-2 gap-1.5" onClick={onOpen}>
                <Eye className="size-4" /> Personen ansehen
              </Button>
            </div>
          )}
        </div>
      )}

      {nutzungsdatenFehlen && (
        <div className="mt-4 rounded-2xl border border-dashed border-border bg-muted/30 p-3 flex items-center gap-3 flex-wrap">
          <Plug className="size-4 text-primary" />
          <div className="text-sm text-muted-foreground flex-1 min-w-48">
            Für eine echte Aktivitäts-Messung verbinde {tool.name} per Integration.
            Bis dahin zeigen wir nur gebucht gegen zugewiesen.
          </div>
          <Button size="sm" variant="outline">
            Integration verbinden
          </Button>
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <Button size="sm" variant="outline" className="gap-1.5" onClick={onOpen}>
          <Eye className="size-4" /> Plätze ansehen
        </Button>
        <Button size="sm" variant="ghost" className="gap-1.5" onClick={onOpen}>
          <Settings2 className="size-4" /> Seats anpassen
        </Button>
      </div>
    </div>
  );
}

function Legend({ color, label, border }: { color: string; label: string; border?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="inline-block size-2.5 rounded-sm"
        style={{
          background: color,
          border: border ? "1px solid #F5A623" : undefined,
        }}
      />
      {label}
    </span>
  );
}

function Drilldown({
  tool,
  onReduce,
}: {
  tool: Tool;
  onReduce: (n: number) => void;
}) {
  const [markiert, setMarkiert] = useState<Record<string, boolean>>({});
  const reinUngenutzt = tool.gebucht - tool.zugewiesen;
  const anzahlMarkiert = Object.values(markiert).filter(Boolean).length;
  const ersparnis = (anzahlMarkiert + reinUngenutzt) * tool.preisProPlatz;

  return (
    <>
      <SheetHeader>
        <SheetTitle className="font-display text-2xl flex items-center gap-2">
          <span
            className="size-9 rounded-xl grid place-items-center text-white font-bold text-sm"
            style={{ background: tool.farbe }}
          >
            {tool.initials}
          </span>
          {tool.name}
        </SheetTitle>
        <SheetDescription>
          {tool.gebucht} gebucht · {tool.zugewiesen} zugewiesen ·{" "}
          {tool.aktiv === null ? "aktive Nutzung unbekannt" : `${tool.aktiv} aktiv`} ·{" "}
          {euro(tool.preisProPlatz)} pro Platz
        </SheetDescription>
      </SheetHeader>

      {/* Nicht zugewiesen */}
      {reinUngenutzt > 0 && (
        <div className="mt-5 rounded-2xl border border-[#F5A623]/40 bg-[#FFF6E5] p-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <div className="font-semibold text-[#B45309]">
                {reinUngenutzt} nicht zugewiesene Plätze
              </div>
              <div className="text-xs text-[#B45309]/90 mt-0.5">
                Reine Verschwendung. Sofort zurückgebbar.
              </div>
            </div>
            <Button size="sm" onClick={() => onReduce(reinUngenutzt)} className="gap-1.5">
              <Undo2 className="size-4" /> alle zurückgeben
            </Button>
          </div>
        </div>
      )}

      {/* Personenliste */}
      <div className="mt-5">
        <div className="text-sm font-semibold mb-2">
          Zugewiesene Plätze ({tool.zugewiesen})
        </div>
        <div className="divide-y divide-border rounded-2xl border border-border">
          {tool.personen.map((p) => (
            <label
              key={p.id}
              className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
                p.inaktiv ? "bg-[#FFF6E5]/40" : "hover:bg-muted/30"
              }`}
            >
              <input
                type="checkbox"
                checked={!!markiert[p.id]}
                onChange={(e) =>
                  setMarkiert((m) => ({ ...m, [p.id]: e.target.checked }))
                }
                className="size-4 accent-[#6C5CE7]"
              />
              <div className="size-9 rounded-full bg-muted grid place-items-center text-xs font-semibold">
                {p.name.split(" ").map((s) => s[0]).join("").slice(0, 2)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold truncate">{p.name}</div>
                <div className="text-xs text-muted-foreground truncate">
                  {p.rolle} · {p.email}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-muted-foreground">{p.letzteAktivitaet}</div>
                {p.inaktiv && (
                  <Pill tone="amber">
                    <AlertTriangle className="size-3" /> inaktiv
                  </Pill>
                )}
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Aktion */}
      <div className="mt-5 sticky bottom-0 -mx-6 px-6 py-4 bg-card border-t border-border">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <div className="text-xs text-muted-foreground">
              {anzahlMarkiert} markiert
              {reinUngenutzt > 0 && ` · ${reinUngenutzt} nicht zugewiesen`}
            </div>
            <div className="font-display text-lg font-bold tabular-nums text-[#067647]">
              spart {euro(ersparnis)} pro Monat
            </div>
          </div>
          <div className="flex gap-2">
            <Link
              to={"/team" as "/"}
              className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline px-2"
            >
              Wer-nutzt-was <ArrowRight className="size-3" />
            </Link>
            <Button
              onClick={() => {
                if (anzahlMarkiert + reinUngenutzt === 0) {
                  toast.info("Markiere Plätze oder gib nicht zugewiesene zurück.");
                  return;
                }
                onReduce(anzahlMarkiert + reinUngenutzt);
                setMarkiert({});
              }}
              className="gap-1.5"
            >
              <Undo2 className="size-4" /> Markierte zurückgeben
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
