import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Mail,
  Copy,
  Check,
  Shield,
  Forward,
  AtSign,
  FileText,
  Sparkles,
  TrendingUp,
  Inbox,
  ChevronDown,
  ChevronUp,
  X,
  Plus,
  RefreshCw,
  Eye,
  Lock,
  Undo2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

const INBOX = "belege-x7f3@inbox.toolfolio.de";

const eur = (n: number) =>
  n.toLocaleString("de-DE", { style: "currency", currency: "EUR" });

type Status = "auto" | "neuesAbo" | "preiserhoehung" | "unsicher" | "ignoriert";

interface Beleg {
  id: string;
  tool: string;
  initials: string;
  color: string;
  absender: string;
  betrag: number;
  intervall?: "monatlich" | "jährlich" | "einmalig";
  datum: string; // dd.mm.yyyy
  rechnungsnr?: string;
  status: Status;
  vorherigerBetrag?: number;
  aboId?: string;
}

const initialBelege: Beleg[] = [
  {
    id: "b1",
    tool: "Notion",
    initials: "N",
    color: "#1F1D2B",
    absender: "billing@notion.so",
    betrag: 96,
    intervall: "jährlich",
    datum: "22.07.2026",
    rechnungsnr: "INV-NTN-90213",
    status: "auto",
    aboId: "notion",
  },
  {
    id: "b2",
    tool: "Anthropic",
    initials: "A",
    color: "#D97757",
    absender: "receipts@anthropic.com",
    betrag: 312.4,
    intervall: "monatlich",
    datum: "20.07.2026",
    rechnungsnr: "ANT-2026-07-44",
    status: "auto",
    aboId: "anthropic-api",
  },
  {
    id: "b3",
    tool: "Superhuman",
    initials: "S",
    color: "#6C5CE7",
    absender: "billing@superhuman.com",
    betrag: 30,
    intervall: "monatlich",
    datum: "19.07.2026",
    rechnungsnr: "SH-118-2026",
    status: "neuesAbo",
  },
  {
    id: "b4",
    tool: "Figma",
    initials: "F",
    color: "#FF7A66",
    absender: "invoices@figma.com",
    betrag: 54,
    vorherigerBetrag: 45,
    intervall: "monatlich",
    datum: "18.07.2026",
    rechnungsnr: "FGM-2026-07-188",
    status: "preiserhoehung",
    aboId: "figma",
  },
  {
    id: "b5",
    tool: "Newsletter SaaS Weekly",
    initials: "W",
    color: "#6B7280",
    absender: "hello@saasweekly.com",
    betrag: 0,
    datum: "21.07.2026",
    status: "ignoriert",
  },
];

function Pill({
  tone,
  children,
}: {
  tone: "emerald" | "amber" | "rose" | "muted" | "primary";
  children: React.ReactNode;
}) {
  const map = {
    emerald: "bg-emerald-500/12 text-emerald-700",
    amber: "bg-amber-500/15 text-amber-700",
    rose: "bg-rose-500/12 text-rose-700",
    muted: "bg-muted text-muted-foreground",
    primary: "bg-primary/12 text-primary",
  } as const;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${map[tone]}`}>
      {children}
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

function Stat({ value, label, tone = "muted" }: { value: string; label: string; tone?: "muted" | "emerald" | "amber" | "primary" }) {
  const dot = {
    muted: "bg-muted-foreground/40",
    emerald: "bg-emerald-500",
    amber: "bg-amber-500",
    primary: "bg-primary",
  }[tone];
  return (
    <div className="rounded-2xl border border-border bg-card px-4 py-3 flex items-center gap-3">
      <span className={`size-2 rounded-full ${dot}`} />
      <div>
        <div className="font-display text-xl font-semibold tabular-nums leading-none">{value}</div>
        <div className="text-[11px] text-muted-foreground mt-1">{label}</div>
      </div>
    </div>
  );
}

function ConnectionCard() {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(INBOX);
      setCopied(true);
      toast.success("Adresse kopiert", { description: INBOX });
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Kopieren fehlgeschlagen");
    }
  };

  return (
    <div className="rounded-3xl border border-border bg-card p-5 sm:p-6 shadow-sm">
      <div className="flex flex-col lg:flex-row lg:items-start gap-6">
        {/* Inbox-Adresse */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Pill tone="emerald">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" /> Aktiv
            </Pill>
            <span className="text-xs text-muted-foreground">wartet auf Belege rund um die Uhr</span>
          </div>
          <div className="mt-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Deine eindeutige Adresse
          </div>
          <button
            onClick={copy}
            className="mt-2 group w-full text-left rounded-2xl border border-dashed border-primary/40 bg-primary/5 px-4 py-4 hover:bg-primary/10 transition flex items-center gap-3"
            aria-label="Adresse kopieren"
          >
            <AtSign className="size-5 text-primary shrink-0" />
            <span className="font-display text-base sm:text-xl font-semibold tracking-tight text-foreground truncate">
              {INBOX}
            </span>
            <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shrink-0 group-hover:shadow">
              {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
              {copied ? "Kopiert" : "Kopieren"}
            </span>
          </button>

          {/* Datenschutz */}
          <div className="mt-4 rounded-2xl bg-emerald-500/8 border border-emerald-500/20 px-4 py-3 flex items-start gap-3">
            <Shield className="size-4 text-emerald-600 mt-0.5 shrink-0" />
            <div className="text-xs text-emerald-900/80 leading-relaxed">
              <span className="font-semibold text-emerald-700">Datenschutz:</span> Wir sehen nur
              Mails, die an diese Adresse gehen, nicht dein restliches Postfach. Nicht-Rechnungen
              werden automatisch verworfen.
            </div>
          </div>

          {/* OAuth Ausblick */}
          <div className="mt-3 rounded-2xl border border-border bg-muted/30 px-4 py-3 flex items-center gap-3 opacity-70">
            <Lock className="size-4 text-muted-foreground shrink-0" />
            <div className="text-xs text-muted-foreground flex-1">
              Lieber das ganze Postfach automatisch verbinden? Per Google oder Outlook.
            </div>
            <span className="text-[10px] font-semibold rounded-full bg-foreground/8 px-2 py-1 text-foreground/70">
              Kommt bald
            </span>
          </div>
        </div>

        {/* Zwei Wege */}
        <div className="lg:w-[420px] shrink-0">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
            So bekommt Toolfolio deine Rechnungen
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-1 gap-3">
            <div className="rounded-2xl border border-border bg-background p-4">
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-lg bg-primary/10 grid place-items-center text-primary">
                  <Mail className="size-4" />
                </div>
                <div className="font-display font-semibold text-sm">Als Rechnungsempfänger hinterlegen</div>
              </div>
              <ol className="mt-3 space-y-1.5 text-xs text-muted-foreground list-decimal list-inside">
                <li>Beim Anbieter zu Rechnungs-Einstellungen gehen.</li>
                <li>Deine Toolfolio-Adresse als E-Mail eintragen.</li>
                <li>Nächste Rechnung kommt direkt bei dir an.</li>
              </ol>
            </div>
            <div className="rounded-2xl border border-border bg-background p-4">
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-lg bg-primary/10 grid place-items-center text-primary">
                  <Forward className="size-4" />
                </div>
                <div className="font-display font-semibold text-sm">Weiterleitungsregel einrichten</div>
              </div>
              <ol className="mt-3 space-y-1.5 text-xs text-muted-foreground list-decimal list-inside">
                <li>Im eigenen Postfach eine Regel anlegen.</li>
                <li>Mails mit "Rechnung" oder "Invoice" weiterleiten.</li>
                <li>Ziel: deine Toolfolio-Adresse.</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BelegCard({
  b,
  selected,
  onSelect,
  onAction,
}: {
  b: Beleg;
  selected: boolean;
  onSelect: (v: boolean) => void;
  onAction: (a: "zuordnen" | "anlegen" | "aktualisieren" | "ignorieren" | "wiederherstellen" | "vergleichen") => void;
}) {
  const [showAbsender, setShowAbsender] = useState(false);
  const isAuto = b.status === "auto";
  const isPrüf = b.status === "neuesAbo" || b.status === "preiserhoehung" || b.status === "unsicher";
  const isIgnoriert = b.status === "ignoriert";

  const accentBorder = isAuto
    ? "border-emerald-500/25"
    : isPrüf
    ? "border-amber-500/30"
    : "border-border";

  return (
    <div
      className={`rounded-2xl border ${accentBorder} bg-card p-4 sm:p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
        isIgnoriert ? "opacity-70" : ""
      }`}
    >
      <div className="flex items-start gap-3 sm:gap-4">
        {isPrüf && (
          <div className="pt-1">
            <Checkbox checked={selected} onCheckedChange={(v) => onSelect(!!v)} aria-label={`${b.tool} auswählen`} />
          </div>
        )}
        <ToolTile initials={b.initials} color={b.color} />

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <div className="font-display text-base font-semibold truncate">{b.tool}</div>
            {b.status === "auto" && (
              <Pill tone="emerald">
                <Check className="size-3" /> Sicher zugeordnet
              </Pill>
            )}
            {b.status === "neuesAbo" && (
              <Pill tone="amber">
                <Sparkles className="size-3" /> Neues Abo erkannt
              </Pill>
            )}
            {b.status === "preiserhoehung" && (
              <Pill tone="amber">
                <TrendingUp className="size-3" /> Preiserhöhung
              </Pill>
            )}
            {b.status === "unsicher" && <Pill tone="amber">Unsicherer Treffer</Pill>}
            {b.status === "ignoriert" && <Pill tone="muted">Verworfen</Pill>}
          </div>

          <div className="mt-1 text-xs text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="tabular-nums">{b.datum}</span>
            {b.rechnungsnr && <span>Rechnung {b.rechnungsnr}</span>}
            <button
              onClick={() => setShowAbsender((s) => !s)}
              className="inline-flex items-center gap-1 hover:text-foreground"
            >
              Absender {showAbsender ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
            </button>
            {showAbsender && (
              <span className="text-foreground/70 truncate max-w-full">{b.absender}</span>
            )}
          </div>

          <div className="mt-3 flex flex-wrap items-end gap-x-4 gap-y-1">
            {b.status !== "ignoriert" ? (
              <div className="font-display text-2xl font-semibold tabular-nums">
                {b.status === "preiserhoehung" && b.vorherigerBetrag ? (
                  <span className="inline-flex items-baseline gap-2">
                    {eur(b.betrag)}
                    <span className="text-xs font-medium text-muted-foreground line-through">
                      {eur(b.vorherigerBetrag)}
                    </span>
                    <span className="text-xs font-semibold text-amber-700">
                      +{eur(b.betrag - b.vorherigerBetrag)}
                    </span>
                  </span>
                ) : (
                  eur(b.betrag)
                )}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">Keine Rechnung erkannt</div>
            )}
            {b.intervall && (
              <span className="text-xs text-muted-foreground">/ {b.intervall}</span>
            )}
          </div>

          {b.status === "auto" && (
            <div className="mt-2 text-xs text-emerald-700">
              Dem Abo {b.tool} zugeordnet, ins Archiv gelegt.
            </div>
          )}
          {b.status === "neuesAbo" && (
            <div className="mt-2 text-xs text-amber-700">
              {b.tool} ist noch nicht in Toolfolio erfasst. Sollen wir es anlegen?
            </div>
          )}
          {b.status === "preiserhoehung" && b.vorherigerBetrag && (
            <div className="mt-2 text-xs text-amber-700">
              Figma jetzt {eur(b.betrag)} statt {eur(b.vorherigerBetrag)}, etwa{" "}
              {Math.round(((b.betrag - b.vorherigerBetrag) / b.vorherigerBetrag) * 100)} % mehr.
            </div>
          )}

          <div className="mt-3 flex flex-wrap gap-2">
            {b.status === "auto" && (
              <>
                <Button asChild variant="outline" size="sm">
                  <Link to="/abos/$aboId" params={{ aboId: b.aboId ?? "" }}>
                    <FileText className="size-3.5" /> PDF ansehen
                  </Link>
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onAction("ignorieren")}>
                  Falsch zugeordnet?
                </Button>
              </>
            )}
            {b.status === "neuesAbo" && (
              <>
                <Button size="sm" onClick={() => onAction("anlegen")} className="gap-1.5">
                  <Plus className="size-3.5" /> Als Abo anlegen
                </Button>
                <Button variant="outline" size="sm" onClick={() => onAction("ignorieren")}>
                  Ignorieren
                </Button>
              </>
            )}
            {b.status === "preiserhoehung" && (
              <>
                <Button size="sm" onClick={() => onAction("aktualisieren")} className="gap-1.5">
                  <RefreshCw className="size-3.5" /> Abo aktualisieren
                </Button>
                <Button variant="outline" size="sm" onClick={() => onAction("vergleichen")}>
                  Vergleichen
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onAction("ignorieren")}>
                  Ignorieren
                </Button>
              </>
            )}
            {b.status === "unsicher" && (
              <>
                <Button size="sm" onClick={() => onAction("zuordnen")}>
                  Zuordnen
                </Button>
                <Button variant="outline" size="sm" onClick={() => onAction("ignorieren")}>
                  Ignorieren
                </Button>
              </>
            )}
            {b.status === "ignoriert" && (
              <Button variant="outline" size="sm" onClick={() => onAction("wiederherstellen")}>
                <Undo2 className="size-3.5" /> Wiederherstellen
              </Button>
            )}
          </div>
        </div>

        <button
          className="hidden sm:inline-flex items-center justify-center size-8 rounded-md hover:bg-muted text-muted-foreground"
          aria-label="PDF ansehen"
        >
          <Eye className="size-4" />
        </button>
      </div>
    </div>
  );
}

function Section({
  title,
  count,
  tone,
  children,
  defaultOpen = true,
  description,
}: {
  title: string;
  count: number;
  tone: "emerald" | "amber" | "muted";
  children: React.ReactNode;
  defaultOpen?: boolean;
  description?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const dot = {
    emerald: "bg-emerald-500",
    amber: "bg-amber-500",
    muted: "bg-muted-foreground/40",
  }[tone];

  return (
    <section>
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 py-2 group"
      >
        <span className={`size-2.5 rounded-full ${dot}`} />
        <h3 className="font-display text-base font-semibold tracking-tight">{title}</h3>
        <span className="text-xs font-semibold text-muted-foreground tabular-nums">{count}</span>
        {description && <span className="text-xs text-muted-foreground hidden sm:inline">· {description}</span>}
        <span className="ml-auto text-muted-foreground group-hover:text-foreground">
          {open ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
        </span>
      </button>
      {open && <div className="mt-2 space-y-3">{children}</div>}
    </section>
  );}

export function BelegPostfach() {
  const [belege, setBelege] = useState<Beleg[]>(initialBelege);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const auto = belege.filter((b) => b.status === "auto");
  const pruef = belege.filter((b) => b.status === "neuesAbo" || b.status === "preiserhoehung" || b.status === "unsicher");
  const ignoriert = belege.filter((b) => b.status === "ignoriert");

  const setStatus = (id: string, status: Status) => {
    let prevStatus: Status | undefined;
    setBelege((prev) =>
      prev.map((b) => {
        if (b.id === id) {
          prevStatus = b.status;
          return { ...b, status };
        }
        return b;
      }),
    );
    return prevStatus;
  };

  const undo = (id: string, prev?: Status) => {
    if (!prev) return;
    setBelege((p) => p.map((b) => (b.id === id ? { ...b, status: prev } : b)));
  };

  const handleAction = (
    b: Beleg,
    action: "zuordnen" | "anlegen" | "aktualisieren" | "ignorieren" | "wiederherstellen" | "vergleichen",
  ) => {
    if (action === "vergleichen") {
      toast.message("Preisvergleich geöffnet", { description: `${b.tool}: ${eur(b.betrag)} statt ${eur(b.vorherigerBetrag ?? 0)}` });
      return;
    }
    if (action === "ignorieren") {
      const prev = setStatus(b.id, "ignoriert");
      toast.success("Beleg ignoriert", {
        description: b.tool,
        action: { label: "Rückgängig", onClick: () => undo(b.id, prev) },
      });
      return;
    }
    if (action === "wiederherstellen") {
      const prev = setStatus(b.id, "unsicher");
      toast.success("Beleg wiederhergestellt", {
        description: b.tool,
        action: { label: "Rückgängig", onClick: () => undo(b.id, prev) },
      });
      return;
    }
    if (action === "anlegen") {
      const prev = setStatus(b.id, "auto");
      toast.success(`${b.tool} als Abo angelegt`, {
        description: `${eur(b.betrag)} ${b.intervall ?? ""}, Beleg im Archiv.`,
        action: { label: "Rückgängig", onClick: () => undo(b.id, prev) },
      });
      return;
    }
    if (action === "aktualisieren") {
      const prev = setStatus(b.id, "auto");
      toast.success(`Abo aktualisiert`, {
        description: `${b.tool} neu ${eur(b.betrag)} statt ${eur(b.vorherigerBetrag ?? 0)}.`,
        action: { label: "Rückgängig", onClick: () => undo(b.id, prev) },
      });
      return;
    }
    if (action === "zuordnen") {
      const prev = setStatus(b.id, "auto");
      toast.success("Beleg zugeordnet", {
        description: b.tool,
        action: { label: "Rückgängig", onClick: () => undo(b.id, prev) },
      });
    }
  };

  const toggleSel = (id: string, v: boolean) => {
    setSelected((s) => {
      const n = new Set(s);
      if (v) n.add(id);
      else n.delete(id);
      return n;
    });
  };

  const bulkAnlegen = () => {
    const picks = belege.filter((b) => selected.has(b.id));
    picks.forEach((b) => setStatus(b.id, "auto"));
    setSelected(new Set());
    toast.success(`${picks.length} Belege verarbeitet`);
  };
  const bulkIgnore = () => {
    const picks = belege.filter((b) => selected.has(b.id));
    picks.forEach((b) => setStatus(b.id, "ignoriert"));
    setSelected(new Set());
    toast.success(`${picks.length} Belege ignoriert`);
  };

  const empfangen = 28;
  const zugeordnet = 24;
  const zuPruefen = pruef.length;
  const neueAbos = belege.filter((b) => b.status === "neuesAbo").length + 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight">
          Beleg-Postfach
        </h1>
        <p className="mt-1 text-sm text-muted-foreground max-w-xl">
          Rechnungen landen automatisch hier, du musst nichts mehr suchen.
        </p>
      </div>

      <ConnectionCard />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat value={`${empfangen}`} label="Belege empfangen" tone="primary" />
        <Stat value={`${zugeordnet}`} label="Automatisch zugeordnet" tone="emerald" />
        <Stat value={`${zuPruefen}`} label="Zu prüfen" tone="amber" />
        <Stat value={`${neueAbos}`} label="Neues Abo erkannt" tone="amber" />
      </div>

      {/* Feed-Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
        <div className="flex items-center gap-2 text-sm">
          <Inbox className="size-4 text-primary" />
          <span className="font-display font-semibold">Eingehende Belege</span>
          <span className="text-muted-foreground text-xs">
            {auto.length + pruef.length} neue Belege, {auto.length} zugeordnet, {pruef.length} zu prüfen
          </span>
        </div>
        {selected.size > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{selected.size} ausgewählt</span>
            <Button size="sm" variant="outline" onClick={bulkIgnore}>
              <X className="size-3.5" /> Ignorieren
            </Button>
            <Button size="sm" onClick={bulkAnlegen}>
              <Check className="size-3.5" /> Verarbeiten
            </Button>
          </div>
        )}
      </div>

      {belege.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border bg-card p-10 text-center">
          <div className="mx-auto size-12 rounded-full bg-primary/10 grid place-items-center text-primary mb-3">
            <Inbox className="size-5" />
          </div>
          <div className="font-display text-base font-semibold">Noch keine Belege</div>
          <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
            Sobald die erste Rechnung an deine Toolfolio-Adresse ankommt, siehst du sie hier.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {pruef.length > 0 && (
            <Section
              title="Bitte prüfen"
              count={pruef.length}
              tone="amber"
              description="neue Abos und Preisänderungen"
            >
              {pruef.map((b) => (
                <BelegCard
                  key={b.id}
                  b={b}
                  selected={selected.has(b.id)}
                  onSelect={(v) => toggleSel(b.id, v)}
                  onAction={(a) => handleAction(b, a)}
                />
              ))}
            </Section>
          )}

          {auto.length > 0 && (
            <Section
              title="Automatisch zugeordnet"
              count={auto.length}
              tone="emerald"
              description="ins Archiv gelegt"
            >
              {auto.map((b) => (
                <BelegCard
                  key={b.id}
                  b={b}
                  selected={selected.has(b.id)}
                  onSelect={(v) => toggleSel(b.id, v)}
                  onAction={(a) => handleAction(b, a)}
                />
              ))}
            </Section>
          )}

          <Section
            title="Ignoriert und Dubletten"
            count={ignoriert.length}
            tone="muted"
            defaultOpen={false}
            description="Nicht-Rechnungen und bereits Verarbeitetes"
          >
            {ignoriert.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-card p-6 text-center text-xs text-muted-foreground">
                Nichts ausgeblendet.
              </div>
            ) : (
              ignoriert.map((b) => (
                <BelegCard
                  key={b.id}
                  b={b}
                  selected={selected.has(b.id)}
                  onSelect={(v) => toggleSel(b.id, v)}
                  onAction={(a) => handleAction(b, a)}
                />
              ))
            )}
          </Section>
        </div>
      )}
    </div>
  );
}
