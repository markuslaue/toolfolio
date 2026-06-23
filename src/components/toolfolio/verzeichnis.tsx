import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Search,
  Sparkles,
  Plus,
  ExternalLink,
  Tag,
  TrendingDown,
  TrendingUp,
  Check,
  Users,
  Filter,
  ArrowRight,
  Heart,
  Palette,
  LineChart,
  Cpu,
  MessageSquare,
  Code2,
  Zap,
  ShoppingBag,
  CalendarDays,
  ClipboardList,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AboFormPanel,
  type AboFormInitial,
} from "./abo-form-panel";
import { toast } from "sonner";

const eur = (n: number) =>
  n.toLocaleString("de-DE", { style: "currency", currency: "EUR" });

// ---------- categories ----------
const kategorien = [
  { id: "design", label: "Design", icon: Palette, color: "#FF7A66", anzahl: 38 },
  { id: "seo", label: "SEO", icon: LineChart, color: "#12B76A", anzahl: 22 },
  { id: "ai", label: "KI / API", icon: Cpu, color: "#6C5CE7", anzahl: 41 },
  { id: "kommunikation", label: "Kommunikation", icon: MessageSquare, color: "#F5A623", anzahl: 19 },
  { id: "entwicklung", label: "Entwicklung", icon: Code2, color: "#1F1D2B", anzahl: 56 },
  { id: "produktivitaet", label: "Produktivität", icon: Zap, color: "#6C5CE7", anzahl: 47 },
  { id: "ecommerce", label: "eCommerce", icon: ShoppingBag, color: "#FF7A66", anzahl: 24 },
  { id: "termine", label: "Termine", icon: CalendarDays, color: "#12B76A", anzahl: 12 },
  { id: "formulare", label: "Formulare", icon: ClipboardList, color: "#F5A623", anzahl: 9 },
  { id: "weitere", label: "Weitere", icon: Layers, color: "#6B7280", anzahl: 64 },
];

// ---------- tools ----------
interface Tarif { name: string; preis: number; intervall: "monatlich" | "jährlich"; }
interface Alternative { name: string; preis: number; community?: boolean; hausmarke?: boolean; }
interface Deal { typ: "gutschein" | "partner-deal"; rabatt: string; partner: boolean; }

interface Tool {
  id: string;
  name: string;
  initials: string;
  color: string;
  kategorie: string;
  einZeiler: string;
  abPreis: number;
  median?: number;
  beliebtheit: number;
  community?: boolean;
  imStack?: boolean;
  meinPreis?: number;
  aboId?: string;
  deal?: Deal;
  tarife: Tarif[];
  alternativen?: Alternative[];
}

const tools: Tool[] = [
  {
    id: "notion",
    name: "Notion",
    initials: "N",
    color: "#1F1D2B",
    kategorie: "produktivitaet",
    einZeiler: "Workspace für Notizen, Wikis und Projekte.",
    abPreis: 8,
    median: 10,
    beliebtheit: 98,
    imStack: true,
    meinPreis: 8,
    aboId: "notion",
    tarife: [
      { name: "Plus", preis: 8, intervall: "monatlich" },
      { name: "Plus jährlich", preis: 96, intervall: "jährlich" },
    ],
    alternativen: [
      { name: "Coda", preis: 10 },
      { name: "Logseq", preis: 0, community: true },
    ],
  },
  {
    id: "figma",
    name: "Figma",
    initials: "F",
    color: "#FF7A66",
    kategorie: "design",
    einZeiler: "Kollaboratives Interface- und Produktdesign.",
    abPreis: 12,
    median: 15,
    beliebtheit: 95,
    imStack: true,
    meinPreis: 54,
    aboId: "figma",
    tarife: [
      { name: "Professional", preis: 12, intervall: "monatlich" },
      { name: "Organization", preis: 45, intervall: "monatlich" },
    ],
    alternativen: [
      { name: "Penpot", preis: 0, community: true },
      { name: "Sketch", preis: 9 },
    ],
  },
  {
    id: "calendly",
    name: "Calendly",
    initials: "C",
    color: "#12B76A",
    kategorie: "termine",
    einZeiler: "Termine buchen ohne Hin-und-Her.",
    abPreis: 10,
    median: 8,
    beliebtheit: 88,
    imStack: true,
    meinPreis: 16,
    aboId: "calendly",
    deal: { typ: "partner-deal", rabatt: "3 Monate −30 %", partner: true },
    tarife: [
      { name: "Standard", preis: 10, intervall: "monatlich" },
      { name: "Teams", preis: 16, intervall: "monatlich" },
    ],
    alternativen: [
      { name: "Cal.com", preis: 0, community: true, hausmarke: false },
      { name: "TidyCal", preis: 2 },
    ],
  },
  {
    id: "ahrefs",
    name: "Ahrefs",
    initials: "A",
    color: "#0F4C81",
    kategorie: "seo",
    einZeiler: "SEO-Toolset: Backlinks, Keywords, Audits.",
    abPreis: 99,
    median: 89,
    beliebtheit: 86,
    imStack: true,
    meinPreis: 99,
    aboId: "ahrefs",
    deal: { typ: "gutschein", rabatt: "20 % auf das erste Jahr", partner: true },
    tarife: [
      { name: "Lite", preis: 99, intervall: "monatlich" },
      { name: "Standard", preis: 199, intervall: "monatlich" },
    ],
    alternativen: [
      { name: "Mangools", preis: 29 },
      { name: "SE Ranking", preis: 39 },
    ],
  },
  {
    id: "slack",
    name: "Slack",
    initials: "S",
    color: "#4A154B",
    kategorie: "kommunikation",
    einZeiler: "Team-Chat, Channels und Integrationen.",
    abPreis: 7.25,
    median: 7,
    beliebtheit: 92,
    imStack: true,
    meinPreis: 8.75,
    aboId: "slack",
    tarife: [
      { name: "Pro", preis: 7.25, intervall: "monatlich" },
      { name: "Business+", preis: 12.5, intervall: "monatlich" },
    ],
    alternativen: [
      { name: "Discord", preis: 0, community: true },
      { name: "Mattermost", preis: 10, community: true },
    ],
  },
  {
    id: "superhuman",
    name: "Superhuman",
    initials: "S",
    color: "#6C5CE7",
    kategorie: "produktivitaet",
    einZeiler: "Schneller E-Mail-Client mit KI-Hilfen.",
    abPreis: 30,
    median: 18,
    beliebtheit: 64,
    tarife: [
      { name: "Starter", preis: 30, intervall: "monatlich" },
      { name: "Business", preis: 40, intervall: "monatlich" },
    ],
    alternativen: [
      { name: "Spark", preis: 0, community: true },
      { name: "HEY", preis: 8 },
    ],
  },
  {
    id: "calcom",
    name: "Cal.com",
    initials: "C",
    color: "#1F1D2B",
    kategorie: "termine",
    einZeiler: "Open-Source-Alternative für Terminbuchung.",
    abPreis: 0,
    median: 8,
    beliebtheit: 72,
    community: true,
    tarife: [
      { name: "Free", preis: 0, intervall: "monatlich" },
      { name: "Teams", preis: 12, intervall: "monatlich" },
    ],
    alternativen: [
      { name: "Calendly", preis: 10 },
      { name: "TidyCal", preis: 2 },
    ],
  },
  {
    id: "typeform",
    name: "Typeform",
    initials: "T",
    color: "#1F1D2B",
    kategorie: "formulare",
    einZeiler: "Formulare und Umfragen mit Charakter.",
    abPreis: 25,
    median: 18,
    beliebtheit: 78,
    tarife: [
      { name: "Basic", preis: 25, intervall: "monatlich" },
      { name: "Plus", preis: 50, intervall: "monatlich" },
    ],
    alternativen: [
      { name: "Tally", preis: 0, community: true },
      { name: "Fillout", preis: 12 },
    ],
  },
  {
    id: "hubspot",
    name: "HubSpot",
    initials: "H",
    color: "#FF7A66",
    kategorie: "kommunikation",
    einZeiler: "Marketing, Sales und CRM in einem.",
    abPreis: 18,
    median: 35,
    beliebtheit: 84,
    tarife: [
      { name: "Starter", preis: 18, intervall: "monatlich" },
      { name: "Professional", preis: 800, intervall: "monatlich" },
    ],
    alternativen: [
      { name: "Pipedrive", preis: 14 },
      { name: "Attio", preis: 29 },
    ],
  },
  {
    id: "cloudflare",
    name: "Cloudflare",
    initials: "C",
    color: "#F5A623",
    kategorie: "entwicklung",
    einZeiler: "CDN, DNS, Workers und Edge-Hosting.",
    abPreis: 0,
    median: 20,
    beliebtheit: 90,
    tarife: [
      { name: "Free", preis: 0, intervall: "monatlich" },
      { name: "Pro", preis: 20, intervall: "monatlich" },
    ],
    alternativen: [
      { name: "Fastly", preis: 50 },
      { name: "Bunny.net", preis: 1 },
    ],
  },
  {
    id: "anthropic-api",
    name: "Anthropic API",
    initials: "A",
    color: "#D97757",
    kategorie: "ai",
    einZeiler: "Claude-Modelle per API, verbrauchsbasiert.",
    abPreis: 0,
    median: 120,
    beliebtheit: 88,
    imStack: true,
    meinPreis: 312.4,
    aboId: "anthropic-api",
    tarife: [
      { name: "Pay-as-you-go", preis: 0, intervall: "monatlich" },
    ],
    alternativen: [
      { name: "OpenAI", preis: 0 },
      { name: "Mistral", preis: 0, community: true },
    ],
  },
  {
    id: "tally",
    name: "Tally",
    initials: "T",
    color: "#12B76A",
    kategorie: "formulare",
    einZeiler: "Einfache Formulare ohne Grenzen, Freemium.",
    abPreis: 0,
    median: 18,
    beliebtheit: 70,
    community: true,
    tarife: [
      { name: "Free", preis: 0, intervall: "monatlich" },
      { name: "Pro", preis: 24, intervall: "monatlich" },
    ],
    alternativen: [
      { name: "Typeform", preis: 25 },
      { name: "Fillout", preis: 12 },
    ],
  },
];

// ---------- helpers ----------
function getKategorie(id: string) {
  return kategorien.find((k) => k.id === id) ?? kategorien[kategorien.length - 1];
}

function Pill({
  tone,
  children,
  className = "",
}: {
  tone: "emerald" | "amber" | "rose" | "muted" | "primary" | "coral";
  children: React.ReactNode;
  className?: string;
}) {
  const map = {
    emerald: "bg-emerald-500/12 text-emerald-700",
    amber: "bg-amber-500/15 text-amber-700",
    rose: "bg-rose-500/12 text-rose-700",
    muted: "bg-muted text-muted-foreground",
    primary: "bg-primary/12 text-primary",
    coral: "bg-[#FF7A66]/15 text-[#c5503e]",
  } as const;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${map[tone]} ${className}`}>
      {children}
    </span>
  );
}

function KategoriePille({ id }: { id: string }) {
  const k = getKategorie(id);
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
      style={{ background: `${k.color}1f`, color: k.color }}
    >
      {k.label}
    </span>
  );
}

function ToolTile({ initials, color, size = 40 }: { initials: string; color: string; size?: number }) {
  return (
    <div
      className="rounded-xl grid place-items-center font-display font-bold text-white shrink-0"
      style={{ background: color, width: size, height: size, fontSize: size * 0.42 }}
    >
      {initials}
    </div>
  );
}

// ---------- Tool Card ----------
function ToolCard({
  t,
  onAdd,
  onDetails,
  onOpenAbo,
}: {
  t: Tool;
  onAdd: () => void;
  onDetails: () => void;
  onOpenAbo: () => void;
}) {
  const ueber = t.imStack && t.median && t.meinPreis ? t.meinPreis > t.median : false;
  const unter = t.imStack && t.median && t.meinPreis ? t.meinPreis < t.median : false;

  return (
    <div className="rounded-3xl border border-border bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md flex flex-col">
      <div className="flex items-start gap-3">
        <ToolTile initials={t.initials} color={t.color} size={44} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="font-display text-base font-semibold truncate">{t.name}</div>
            {t.community && (
              <Pill tone="primary" className="bg-[#1F1D2B]/8 text-[#1F1D2B]">
                <Heart className="size-2.5" /> Community
              </Pill>
            )}
          </div>
          <div className="mt-1">
            <KategoriePille id={t.kategorie} />
          </div>
        </div>
        {t.imStack && (
          <Pill tone="primary">
            <Check className="size-3" /> Im Stack
          </Pill>
        )}
      </div>

      <p className="mt-3 text-sm text-muted-foreground line-clamp-2">{t.einZeiler}</p>

      <div className="mt-4 rounded-2xl bg-muted/40 px-3 py-2.5 flex items-center justify-between text-xs">
        <div className="text-muted-foreground">
          {t.median !== undefined && t.median > 0 ? (
            <>Median <span className="font-semibold tabular-nums text-foreground">{eur(t.median)}</span>/Monat</>
          ) : t.abPreis === 0 ? (
            <>Pay-as-you-go</>
          ) : (
            <>ab <span className="font-semibold tabular-nums text-foreground">{eur(t.abPreis)}</span>/Monat</>
          )}
        </div>
        {t.imStack && t.meinPreis !== undefined && (
          <div className="text-right">
            <div className="text-[10px] text-muted-foreground">du zahlst</div>
            <div className="font-display text-sm font-semibold tabular-nums">{eur(t.meinPreis)}</div>
          </div>
        )}
      </div>

      {t.imStack && (ueber || unter) && (
        <div className={`mt-2 inline-flex items-center gap-1.5 text-xs font-medium ${ueber ? "text-amber-700" : "text-emerald-700"}`}>
          {ueber ? <TrendingUp className="size-3.5" /> : <TrendingDown className="size-3.5" />}
          {ueber ? "über dem Median" : "unter dem Median"}
        </div>
      )}

      {t.deal && (
        <div className="mt-3 rounded-xl bg-emerald-500/8 border border-emerald-500/20 px-3 py-2 flex items-center gap-2">
          <Tag className="size-3.5 text-emerald-600 shrink-0" />
          <div className="text-xs text-emerald-900/80 flex-1 truncate">
            <span className="font-semibold text-emerald-700">Deal:</span> {t.deal.rabatt}
          </div>
          {t.deal.partner && (
            <span className="text-[10px] font-semibold rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-emerald-700">
              Partner
            </span>
          )}
        </div>
      )}

      <div className="mt-auto pt-4 flex gap-2">
        {t.imStack ? (
          <Button size="sm" variant="outline" className="flex-1" onClick={onOpenAbo}>
            Abo öffnen
          </Button>
        ) : (
          <Button size="sm" className="flex-1 gap-1.5" onClick={onAdd}>
            <Plus className="size-3.5" /> Als Abo hinzufügen
          </Button>
        )}
        <Button size="sm" variant="ghost" onClick={onDetails}>
          Details
        </Button>
      </div>
    </div>
  );
}

// ---------- Quickview ----------
function Quickview({
  tool,
  open,
  onClose,
  onAdd,
}: {
  tool: Tool | null;
  open: boolean;
  onClose: () => void;
  onAdd: () => void;
}) {
  if (!tool) return null;
  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center gap-3">
            <ToolTile initials={tool.initials} color={tool.color} size={44} />
            <div className="min-w-0">
              <SheetTitle className="font-display text-xl flex items-center gap-2">
                {tool.name}
                {tool.community && (
                  <Pill tone="primary" className="bg-[#1F1D2B]/8 text-[#1F1D2B]">
                    Community
                  </Pill>
                )}
              </SheetTitle>
              <SheetDescription className="flex items-center gap-2">
                <KategoriePille id={tool.kategorie} />
                <span>{tool.einZeiler}</span>
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-5">
          {/* Tarife */}
          <div>
            <h3 className="font-display text-sm font-semibold mb-2">Tarife des Anbieters</h3>
            <div className="rounded-2xl border border-border bg-card divide-y divide-border">
              {tool.tarife.map((t, i) => (
                <div key={i} className="p-3 flex items-center justify-between text-sm">
                  <span>{t.name}</span>
                  <span className="font-semibold tabular-nums">
                    {t.preis === 0 ? "0,00 €" : eur(t.preis)} <span className="text-xs font-normal text-muted-foreground">/ {t.intervall}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Benchmark */}
          {tool.median !== undefined && tool.median > 0 && (
            <div className="rounded-2xl border border-border bg-primary/5 p-4">
              <h3 className="font-display text-sm font-semibold flex items-center gap-2">
                <Users className="size-4 text-primary" /> Marktvergleich
              </h3>
              <p className="text-sm mt-1.5">
                Vergleichbare Agenturen zahlen im Median{" "}
                <span className="font-display text-base font-semibold tabular-nums">{eur(tool.median)}</span> pro Monat.
              </p>
              {tool.imStack && tool.meinPreis !== undefined && (
                <p className="text-xs mt-2 text-muted-foreground">
                  Du zahlst aktuell <span className="font-semibold tabular-nums text-foreground">{eur(tool.meinPreis)}</span>
                  {tool.meinPreis > tool.median ? (
                    <span className="text-amber-700"> · {Math.round(((tool.meinPreis - tool.median) / tool.median) * 100)} % über Median</span>
                  ) : tool.meinPreis < tool.median ? (
                    <span className="text-emerald-700"> · unter dem Median</span>
                  ) : null}
                </p>
              )}
              <p className="text-[10px] text-muted-foreground mt-2">
                Basiert auf echten Abrechnungsdaten anonymisierter Toolfolio-Nutzer.
              </p>
            </div>
          )}

          {/* Alternativen */}
          {tool.alternativen && tool.alternativen.length > 0 && (
            <div>
              <h3 className="font-display text-sm font-semibold mb-2">Günstigere oder gleichwertige Alternativen</h3>
              <div className="flex flex-wrap gap-2">
                {tool.alternativen.map((a, i) => (
                  <div key={i} className="rounded-full border border-border bg-card px-3 py-1.5 text-xs inline-flex items-center gap-1.5">
                    <span className="font-medium">{a.name}</span>
                    <span className="text-muted-foreground tabular-nums">
                      {a.preis === 0 ? "kostenlos" : `ab ${eur(a.preis)}`}
                    </span>
                    {a.community && (
                      <span className="text-[10px] font-semibold rounded-full bg-[#1F1D2B]/8 text-[#1F1D2B] px-1.5 py-0.5">
                        Community
                      </span>
                    )}
                    {a.hausmarke && (
                      <span className="text-[10px] font-semibold rounded-full bg-primary/12 text-primary px-1.5 py-0.5">
                        Hausmarke
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Deal */}
          {tool.deal && (
            <div className="rounded-2xl bg-emerald-500/8 border border-emerald-500/20 p-4">
              <div className="flex items-center gap-2">
                <Tag className="size-4 text-emerald-600" />
                <h3 className="font-display text-sm font-semibold text-emerald-800">
                  {tool.deal.typ === "partner-deal" ? "Partner-Deal" : "Gutschein"}
                </h3>
                {tool.deal.partner && (
                  <span className="text-[10px] font-semibold rounded-full bg-emerald-500/15 px-2 py-0.5 text-emerald-700">
                    Partner
                  </span>
                )}
              </div>
              <p className="text-sm mt-1.5 text-emerald-900/80">{tool.deal.rabatt}</p>
              {tool.deal.partner && (
                <p className="text-[10px] text-muted-foreground mt-2">
                  Transparenz: Toolfolio erhält für diesen Deal eine Provision.
                </p>
              )}
            </div>
          )}

          {/* Aktionen */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2">
            {tool.imStack && tool.aboId ? (
              <Button asChild className="flex-1">
                <Link to="/abos/$aboId" params={{ aboId: tool.aboId }}>
                  Abo öffnen
                </Link>
              </Button>
            ) : (
              <Button className="flex-1 gap-1.5" onClick={onAdd}>
                <Plus className="size-4" /> Als Abo hinzufügen
              </Button>
            )}
            <a
              href={`https://toolfolio.lovable.app/verzeichnis/${tool.id}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              Ausführlich im Verzeichnis ansehen <ExternalLink className="size-3" />
            </a>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ---------- Personalisiert ----------
function FuerDichStreifen({
  onAdd,
}: {
  onAdd: (alt: { name: string; einZeiler: string; preis: number; ersetzt: string; ersparnis: number; color: string; initials: string; kategorie: string }) => void;
}) {
  const items = [
    {
      name: "Cal.com",
      initials: "C",
      color: "#1F1D2B",
      einZeiler: "Open-Source-Alternative zu Calendly",
      preis: 0,
      ersetzt: "Calendly",
      ersparnis: 16,
      kategorie: "termine",
    },
    {
      name: "Tally",
      initials: "T",
      color: "#12B76A",
      einZeiler: "Freemium-Formulare statt Typeform",
      preis: 0,
      ersetzt: "Typeform",
      ersparnis: 25,
      kategorie: "formulare",
    },
    {
      name: "Mangools",
      initials: "M",
      color: "#FF7A66",
      einZeiler: "Schlankes SEO-Toolset statt Ahrefs",
      preis: 29,
      ersetzt: "Ahrefs",
      ersparnis: 70,
      kategorie: "seo",
    },
    {
      name: "Discord",
      initials: "D",
      color: "#5865F2",
      einZeiler: "Beliebt bei Agenturen wie deiner",
      preis: 0,
      ersetzt: "Slack",
      ersparnis: 8.75,
      kategorie: "kommunikation",
    },
  ];

  return (
    <section>
      <div className="flex items-end justify-between mb-3">
        <div>
          <h2 className="font-display text-lg font-semibold tracking-tight inline-flex items-center gap-2">
            <Sparkles className="size-4 text-primary" /> Für dich
          </h2>
          <p className="text-xs text-muted-foreground">
            Günstigere Alternativen zu deinen teuersten Tools
          </p>
        </div>
      </div>
      <div className="-mx-1 overflow-x-auto pb-2">
        <div className="flex gap-3 px-1 min-w-min">
          {items.map((i) => (
            <div
              key={i.name}
              className="w-[260px] shrink-0 rounded-2xl border border-border bg-card p-4 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition"
            >
              <div className="flex items-center gap-2">
                <ToolTile initials={i.initials} color={i.color} size={36} />
                <div className="min-w-0">
                  <div className="font-display font-semibold text-sm truncate">{i.name}</div>
                  <KategoriePille id={i.kategorie} />
                </div>
              </div>
              <p className="mt-2 text-xs text-muted-foreground line-clamp-2">{i.einZeiler}</p>
              <div className="mt-3 rounded-xl bg-emerald-500/8 border border-emerald-500/15 px-3 py-2">
                <div className="text-[11px] text-emerald-800">
                  statt <span className="font-semibold">{i.ersetzt}</span>
                </div>
                <div className="font-display text-sm font-semibold text-emerald-700 tabular-nums">
                  bis {eur(i.ersparnis)}/Monat sparen
                </div>
              </div>
              <Button size="sm" variant="outline" className="w-full mt-3" onClick={() => onAdd(i)}>
                Als Abo hinzufügen
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------- Main ----------
export function Verzeichnis() {
  const [q, setQ] = useState("");
  const [kat, setKat] = useState<string | null>(null);
  const [filter, setFilter] = useState<"alle" | "stack" | "deal">("alle");
  const [sort, setSort] = useState<"beliebtheit" | "preis" | "markt">("beliebtheit");
  const [openTool, setOpenTool] = useState<Tool | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formInitial, setFormInitial] = useState<AboFormInitial | undefined>(undefined);

  const aktiv = q.trim().length > 0 || kat !== null || filter !== "alle";

  const ergebnisse = useMemo(() => {
    let list = tools.slice();
    if (q.trim()) {
      const needle = q.toLowerCase();
      list = list.filter(
        (t) =>
          t.name.toLowerCase().includes(needle) ||
          t.einZeiler.toLowerCase().includes(needle) ||
          getKategorie(t.kategorie).label.toLowerCase().includes(needle),
      );
    }
    if (kat) list = list.filter((t) => t.kategorie === kat);
    if (filter === "stack") list = list.filter((t) => t.imStack);
    if (filter === "deal") list = list.filter((t) => !!t.deal);

    list.sort((a, b) => {
      if (sort === "beliebtheit") return b.beliebtheit - a.beliebtheit;
      if (sort === "preis") return a.abPreis - b.abPreis;
      // markt: ueber Median zuerst (sortiert nach Differenz, dann unter Median)
      const diff = (t: Tool) =>
        t.median && t.meinPreis ? t.meinPreis - t.median : -Infinity;
      return diff(b) - diff(a);
    });
    return list;
  }, [q, kat, filter, sort]);

  const openAdd = (t: Tool) => {
    setFormInitial({
      tool: t.name,
      initial: t.initials,
      farbe: t.color,
      kategorie: getKategorie(t.kategorie).label,
      kosten: t.abPreis || 0,
      waehrung: "EUR",
      intervall: "monatlich",
      zahlungskanal: "Geschäfts-Karte",
      kunde: "Intern",
      mitVerzeichnis: true,
    });
    setFormOpen(true);
  };
  const openAddAlt = (i: { name: string; preis: number; color: string; initials: string; kategorie: string }) => {
    setFormInitial({
      tool: i.name,
      initial: i.initials,
      farbe: i.color,
      kategorie: getKategorie(i.kategorie).label,
      kosten: i.preis,
      waehrung: "EUR",
      intervall: "monatlich",
      zahlungskanal: "Geschäfts-Karte",
      kunde: "Intern",
      mitVerzeichnis: true,
    });
    setFormOpen(true);
  };
  const openAddManuell = () => {
    setFormInitial(undefined);
    setFormOpen(true);
    toast.message("Tool nicht gefunden", { description: "Du kannst es manuell anlegen." });
  };

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm">
        <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight">
          Verzeichnis
        </h1>
        <p className="mt-1 text-sm text-muted-foreground max-w-xl">
          Finde Tools und füge sie deinem Stack hinzu.
        </p>
        <div className="mt-5 relative max-w-2xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Tool, Kategorie oder Anbieter suchen"
            className="w-full h-14 pl-12 pr-4 rounded-2xl border border-border bg-background text-base focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Für dich */}
      {!aktiv && <FuerDichStreifen onAdd={openAddAlt} />}

      {/* Kategorien */}
      {!aktiv && (
        <section>
          <h2 className="font-display text-lg font-semibold tracking-tight mb-3">Kategorien</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {kategorien.map((k) => {
              const Icon = k.icon;
              return (
                <button
                  key={k.id}
                  onClick={() => setKat(k.id)}
                  className="group rounded-2xl border border-border bg-card p-4 text-left shadow-sm hover:-translate-y-0.5 hover:shadow-md transition"
                >
                  <div
                    className="size-10 rounded-xl grid place-items-center text-white"
                    style={{ background: k.color }}
                  >
                    <Icon className="size-5" />
                  </div>
                  <div className="mt-3 font-display text-sm font-semibold">{k.label}</div>
                  <div className="text-[11px] text-muted-foreground">{k.anzahl} Tools</div>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* Ergebnisse */}
      <section>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="font-display text-lg font-semibold tracking-tight">
              {aktiv ? `${ergebnisse.length} Ergebnisse` : "Alle Tools"}
            </h2>
            {kat && (
              <button
                onClick={() => setKat(null)}
                className="rounded-full bg-primary/10 text-primary text-xs font-semibold px-2.5 py-1 inline-flex items-center gap-1"
              >
                {getKategorie(kat).label} ×
              </button>
            )}
            {filter !== "alle" && (
              <button
                onClick={() => setFilter("alle")}
                className="rounded-full bg-primary/10 text-primary text-xs font-semibold px-2.5 py-1 inline-flex items-center gap-1"
              >
                {filter === "stack" ? "In meinem Stack" : "Mit Deal"} ×
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:inline-flex rounded-full border border-border bg-card p-1 shadow-sm">
              {(
                [
                  { v: "alle", l: "Alle" },
                  { v: "stack", l: "Im Stack" },
                  { v: "deal", l: "Mit Deal" },
                ] as const
              ).map((o) => (
                <button
                  key={o.v}
                  onClick={() => setFilter(o.v)}
                  className={`px-3 h-8 rounded-full text-xs font-medium transition ${
                    filter === o.v
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {o.l}
                </button>
              ))}
            </div>
            <Select value={sort} onValueChange={(v) => setSort(v as typeof sort)}>
              <SelectTrigger className="h-9 w-[170px]">
                <Filter className="size-3.5 mr-1" />
                <SelectValue placeholder="Sortieren" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beliebtheit">Nach Beliebtheit</SelectItem>
                <SelectItem value="preis">Nach Preis</SelectItem>
                <SelectItem value="markt">Nach Marktvergleich</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {ergebnisse.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-card p-10 text-center">
            <div className="mx-auto size-12 rounded-full bg-primary/10 grid place-items-center text-primary mb-3">
              <Search className="size-5" />
            </div>
            <div className="font-display text-base font-semibold">Keine Treffer</div>
            <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
              Wir konnten dein Tool im Verzeichnis nicht finden. Du kannst es trotzdem manuell anlegen.
            </p>
            <Button className="mt-4 gap-1.5" onClick={openAddManuell}>
              <Plus className="size-4" /> Tool manuell anlegen
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {ergebnisse.map((t) => (
              <ToolCard
                key={t.id}
                t={t}
                onAdd={() => openAdd(t)}
                onDetails={() => setOpenTool(t)}
                onOpenAbo={() => {
                  if (t.aboId) {
                    window.location.href = `/abos/${t.aboId}`;
                  }
                }}
              />
            ))}
          </div>
        )}
      </section>

      <Quickview
        tool={openTool}
        open={!!openTool}
        onClose={() => setOpenTool(null)}
        onAdd={() => {
          if (openTool) openAdd(openTool);
          setOpenTool(null);
        }}
      />

      <AboFormPanel
        open={formOpen}
        onOpenChange={setFormOpen}
        mode="anlegen"
        initial={formInitial}
      />
    </div>
  );
}
