import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  TrendingUp,
  Search,
  Layers,
  Sparkles,
  Check,
  Info,
  ShieldCheck,
  Eye,
  Pause,
  X,
  CalendarDays,
  Receipt,
  ArrowRight,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

type Art = "kategorie" | "suche" | "alternativen";

const PREISE: Record<Art, number> = {
  kategorie: 79,
  suche: 99,
  alternativen: 59,
};

const KATEGORIEN = [
  "Vertragsmanagement",
  "Buchhaltung",
  "Projektmanagement",
  "CRM",
  "Personal & HR",
  "Marketing-Automation",
];

const ARTEN: {
  id: Art;
  title: string;
  icon: typeof TrendingUp;
  desc: string;
  beispiel: string;
}[] = [
  {
    id: "kategorie",
    title: "Top der Kategorie",
    icon: Layers,
    desc: "Hervorgehobener gesponserter Platz oben in einer Kategorie deiner Wahl.",
    beispiel: "Position 0 in der Kategorie-Liste",
  },
  {
    id: "suche",
    title: "Top der Suche",
    icon: Search,
    desc: "Gesponserter Treffer zu passenden Suchbegriffen im Verzeichnis.",
    beispiel: "Erster Treffer in den Suchergebnissen",
  },
  {
    id: "alternativen",
    title: "Verwandte Tools / Alternativen",
    icon: Sparkles,
    desc: "Gesponserte Einblendung auf den Detailseiten ähnlicher Tools.",
    beispiel: "Block „Alternativen" auf Wettbewerber-Seiten",
  },
];

const fmt = (n: number) =>
  new Intl.NumberFormat("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n) +
  " €";

function naechsterMonat(start: string): string {
  const d = start ? new Date(start) : new Date();
  d.setMonth(d.getMonth() + 1);
  return d.toLocaleDateString("de-DE", { day: "2-digit", month: "long", year: "numeric" });
}

export function PlatzierungPage() {
  const [active, setActive] = useState<null | { art: Art; kategorie: string }>(null);
  const [art, setArt] = useState<Art>("kategorie");
  const [kategorie, setKategorie] = useState<string>("Vertragsmanagement");
  const [suchbegriffe, setSuchbegriffe] = useState<string>("vertragsmanagement, vertragssoftware");
  const [start, setStart] = useState<string>(() => {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  });
  const [booked, setBooked] = useState<boolean>(false);

  const preis = PREISE[art];
  const nextDate = useMemo(() => naechsterMonat(start), [start]);

  function buchen() {
    setActive({ art, kategorie });
    setBooked(true);
    toast.success("Platzierung gebucht (Demo)", {
      description: "Diese Buchung ist nur ein Mock und löst keine Zahlung aus.",
    });
  }

  function pausieren() {
    toast("Platzierung pausiert (Demo)");
  }
  function beenden() {
    setActive(null);
    setBooked(false);
    toast("Platzierung beendet (Demo)");
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 text-primary px-2.5 py-1 text-[11px] font-semibold">
          <TrendingUp className="size-3" /> Platzierung
        </div>
        <h1 className="mt-3 font-display text-3xl sm:text-4xl font-semibold tracking-tight">
          Premium-Platzierung buchen
        </h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
          Erhöhe deine Sichtbarkeit, transparent und jederzeit kündbar. Du buchst Sichtbarkeit, nichts
          weiter. Organischer Rang, Bewertungen und verifizierte Preisdaten bleiben unabhängig.
        </p>
      </div>

      {/* Neutralitäts-Hinweis */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="size-9 rounded-xl bg-emerald/10 text-emerald grid place-items-center shrink-0">
            <ShieldCheck className="size-4" />
          </div>
          <div className="text-sm">
            <div className="font-semibold text-foreground">
              Goldene Regel: Käuflich ist nur Sichtbarkeit.
            </div>
            <p className="mt-1 text-muted-foreground leading-relaxed">
              Niemals käuflich sind organischer Rang, Bewertungen und verifizierte Preisdaten.
              Gesponserte Platzierungen werden im Verzeichnis immer klar als solche markiert. Genau
              diese Neutralität macht das Verzeichnis glaubwürdig und deine Platzierung wertvoll.{" "}
              <Link to="/badge" className="text-primary font-medium hover:underline">
                Mehr zu unseren Regeln
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Aktive Platzierung */}
      {active ? (
        <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="text-[11px] uppercase tracking-wider font-semibold text-primary">
                Aktive Platzierung
              </div>
              <div className="mt-1 font-display text-xl font-semibold tracking-tight">
                {ARTEN.find((a) => a.id === active.art)?.title} · {active.kategorie}
              </div>
              <div className="mt-1 text-sm text-muted-foreground">
                Monatliche Gebühr {fmt(PREISE[active.art])} · nächste Abbuchung am {nextDate}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={pausieren}>
                <Pause className="size-4" /> Pausieren
              </Button>
              <Button variant="outline" size="sm" onClick={beenden}>
                <X className="size-4" /> Beenden
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Platzierungsarten */}
      <section>
        <h2 className="font-display text-lg font-semibold tracking-tight">
          1. Platzierungsart wählen
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Drei Wege zu mehr Sichtbarkeit, alle transparent als „gesponsert" markiert.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {ARTEN.map((a) => {
            const Icon = a.icon;
            const isActive = art === a.id;
            return (
              <button
                key={a.id}
                onClick={() => setArt(a.id)}
                className={cn(
                  "text-left rounded-2xl border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md",
                  isActive ? "border-primary ring-2 ring-primary/30" : "border-border",
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div
                    className={cn(
                      "size-10 rounded-xl grid place-items-center",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "bg-primary/10 text-primary",
                    )}
                  >
                    <Icon className="size-5" />
                  </div>
                  {isActive ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary">
                      <Check className="size-3" /> Ausgewählt
                    </span>
                  ) : null}
                </div>
                <div className="mt-3 font-display text-lg font-semibold tracking-tight">
                  {a.title}
                </div>
                <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{a.desc}</p>
                <div className="mt-3 text-[11px] text-muted-foreground inline-flex items-center gap-1">
                  <Eye className="size-3" /> Beispiel: {a.beispiel}
                </div>
                <div className="mt-4 flex items-baseline gap-1">
                  <span
                    className="font-display text-2xl font-semibold tracking-tight"
                    style={{ fontVariantNumeric: "tabular-nums" }}
                  >
                    {fmt(PREISE[a.id])}
                  </span>
                  <span className="text-xs text-muted-foreground">pro Monat</span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Konfiguration + Vorschau + Summary */}
      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Konfiguration */}
        <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-sm">
          <h2 className="font-display text-lg font-semibold tracking-tight">
            2. Konfiguration
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Lege fest, wo und wann deine Platzierung erscheint.
          </p>

          <div className="mt-5 space-y-5">
            {art !== "suche" ? (
              <div>
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Kategorie
                </Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {KATEGORIEN.map((k) => (
                    <button
                      key={k}
                      onClick={() => setKategorie(k)}
                      className={cn(
                        "rounded-full px-3 py-1.5 text-xs font-medium border transition-colors",
                        kategorie === k
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background border-border text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {k}
                    </button>
                  ))}
                </div>
                <div className="mt-2 inline-flex items-center gap-1.5 text-[11px] text-emerald font-medium">
                  <span className="size-1.5 rounded-full bg-emerald" /> 2 von 3 Plätzen frei in
                  „{kategorie}"
                </div>
              </div>
            ) : (
              <div>
                <Label
                  htmlFor="suchbegriffe"
                  className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  Suchbegriffe (kommagetrennt)
                </Label>
                <Input
                  id="suchbegriffe"
                  className="mt-2"
                  value={suchbegriffe}
                  onChange={(e) => setSuchbegriffe(e.target.value)}
                  placeholder="z. B. vertragsmanagement, vertragssoftware"
                />
                <p className="mt-2 text-[11px] text-muted-foreground">
                  Die Verfügbarkeit pro Suchbegriff prüfen wir vor Veröffentlichung. Begrenzte
                  Plätze pro Begriff.
                </p>
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Laufzeit
                </Label>
                <div className="mt-2 rounded-xl border border-border bg-background px-3 py-2.5 text-sm flex items-center justify-between">
                  <span className="font-medium">Monatlich</span>
                  <span className="text-[11px] text-muted-foreground">jederzeit kündbar</span>
                </div>
              </div>
              <div>
                <Label
                  htmlFor="start"
                  className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  Start
                </Label>
                <Input
                  id="start"
                  type="date"
                  className="mt-2"
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Live-Vorschau + Zusammenfassung */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold tracking-tight">
                Live-Vorschau
              </h2>
              <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                so erscheint dein Platz
              </span>
            </div>
            <div className="mt-3 rounded-xl border border-border bg-background overflow-hidden">
              {/* Browser-Frame */}
              <div className="flex items-center gap-1.5 border-b border-border bg-muted/60 px-3 py-2">
                <span className="size-2 rounded-full bg-[#FF7A66]" />
                <span className="size-2 rounded-full bg-[#F5A623]" />
                <span className="size-2 rounded-full bg-[#12B76A]" />
                <span className="ml-2 text-[10px] text-muted-foreground truncate">
                  toolfolio.de/verzeichnis/
                  {art === "alternativen" ? "konkurrent · Alternativen" : kategorie.toLowerCase()}
                </span>
              </div>
              <div className="p-4 space-y-3">
                {/* Sponsored slot */}
                <PreviewCard sponsored />
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground px-1">
                  Organische Treffer (unabhängig)
                </div>
                <PreviewCard />
                <PreviewCard />
              </div>
            </div>
            <p className="mt-3 text-[11px] text-muted-foreground inline-flex items-start gap-1">
              <Info className="size-3 mt-0.5 shrink-0" />
              Gesponserte Plätze sind klar markiert und vom organischen Ranking abgesetzt.{" "}
              <Link to="/badge" className="text-primary hover:underline">
                Was bedeutet das?
              </Link>
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h2 className="font-display text-lg font-semibold tracking-tight">
              3. Zusammenfassung
            </h2>
            <dl className="mt-4 space-y-2.5 text-sm">
              <Row k="Art" v={ARTEN.find((a) => a.id === art)?.title ?? ""} />
              <Row
                k={art === "suche" ? "Suchbegriffe" : "Kategorie"}
                v={art === "suche" ? suchbegriffe || "—" : kategorie}
              />
              <Row k="Laufzeit" v="Monatlich, jederzeit kündbar" />
              <Row
                k="Nächste Abbuchung"
                v={
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="size-3.5 text-muted-foreground" /> {nextDate}
                  </span>
                }
              />
            </dl>
            <div className="mt-4 flex items-end justify-between border-t border-border pt-4">
              <div className="text-xs text-muted-foreground">Monatliche Gebühr</div>
              <div
                className="font-display text-3xl font-semibold tracking-tight"
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                {fmt(preis)}
              </div>
            </div>
            <Button onClick={buchen} className="mt-4 w-full" size="lg">
              Kostenpflichtig buchen
            </Button>
            <p className="mt-2 text-[11px] text-muted-foreground text-center">
              Demo: es erfolgt keine echte Zahlung. Die Abrechnung läuft über{" "}
              <Link to="/anbieter-portal/abrechnung" className="text-primary hover:underline">
                Abrechnung
              </Link>
              .
            </p>

            {booked ? (
              <div className="mt-4 rounded-xl border border-emerald/30 bg-emerald/5 p-3 text-sm">
                <div className="flex items-start gap-2">
                  <Check className="size-4 text-emerald mt-0.5" />
                  <div>
                    <div className="font-semibold text-foreground">
                      Buchung bestätigt (Demo)
                    </div>
                    <p className="mt-0.5 text-muted-foreground">
                      Deine Platzierung wird in Kürze sichtbar. Details siehst du in der{" "}
                      <Link
                        to="/anbieter-portal/abrechnung"
                        className="text-primary hover:underline inline-flex items-center gap-0.5"
                      >
                        Abrechnung <ArrowRight className="size-3" />
                      </Link>
                    </p>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <div className="rounded-xl border border-border bg-background p-3 text-[11px] text-muted-foreground inline-flex items-start gap-1.5">
            <Receipt className="size-3.5 mt-0.5 shrink-0 text-muted-foreground" />
            <span>
              Rechnungen, Zahlungsmethode und Historie verwaltest du unter{" "}
              <Link to="/anbieter-portal/abrechnung" className="text-primary hover:underline">
                Abrechnung
              </Link>
              .
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-muted-foreground">{k}</dt>
      <dd className="font-medium text-foreground text-right">{v}</dd>
    </div>
  );
}

function PreviewCard({ sponsored = false }: { sponsored?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-xl border p-3 flex items-center gap-3",
        sponsored
          ? "border-amber-300/70 bg-amber-50/60 dark:bg-amber-500/5"
          : "border-border bg-card",
      )}
    >
      <div
        className={cn(
          "size-10 rounded-lg grid place-items-center font-display font-bold",
          sponsored ? "bg-primary text-primary-foreground" : "bg-muted text-foreground",
        )}
      >
        {sponsored ? "f" : "A"}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <div className="font-semibold text-sm truncate">
            {sponsored ? "fynk" : "Beispiel-Tool"}
          </div>
          {sponsored ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-900 dark:bg-amber-500/15 dark:text-amber-200 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
              Gesponsert
            </span>
          ) : null}
        </div>
        <div className="text-[11px] text-muted-foreground truncate">
          Vertragsmanagement, KI-gestützte Prüfung, Fristen und Workflows.
        </div>
      </div>
      <div className="hidden sm:flex items-center gap-1 text-[11px] text-muted-foreground">
        <Star className="size-3 fill-amber-400 text-amber-400" /> 4,6
      </div>
    </div>
  );
}
