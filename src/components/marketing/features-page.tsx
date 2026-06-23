import {
  ArrowRight,
  LayoutDashboard,
  FileSpreadsheet,
  CalendarClock,
  Hourglass,
  Bot,
  BarChart3,
  Sparkles,
  Users,
  Receipt,
  Archive,
  Search,
  Inbox,
  Bell,
  FileText,
  Calculator,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Nav,
  Footer,
  Reveal,
  ScreenshotFrame,
  PreviewDashboard,
  PreviewImport,
  PreviewFristen,
  PreviewAiCredits,
  PreviewBenchmark,
  PreviewSparvorschlaege,
  PreviewKunde,
  PreviewVerzeichnis,
} from "./marketing-home";

type Block = {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  eyebrow: string;
  painpoint: string;
  title: string;
  desc: string;
  shots: { slot: string; caption: string; Preview?: React.ComponentType }[];
};

const blocks: Block[] = [
  {
    id: "ueberblick",
    icon: LayoutDashboard,
    eyebrow: "Der vollständige Überblick",
    painpoint: "Du verlierst den Überblick, welche Tools laufen, was sie kosten und wann.",
    title: "Alle Abos, Kosten und Abrechnungszeiträume auf einen Blick.",
    desc:
      "Das Dashboard zeigt Gesamtkosten pro Monat und Jahr, Verteilung nach Kategorie, Zahlungskanal und Kunde sowie die nächsten Abbuchungen. Du erkennst sofort, wofür dein Geld läuft und wo es sich häuft.",
    shots: [
      { slot: "Dashboard mit KPI-Karten, Verlauf und Spar-Fortschritt.", caption: "dashboard", Preview: PreviewDashboard },
      { slot: "Anstehende Abbuchungen der nächsten 30 Tage.", caption: "abbuchungen" },
    ],
  },
  {
    id: "erfassen",
    icon: FileSpreadsheet,
    eyebrow: "Alles drin in Minuten",
    painpoint: "Du weißt nicht mal, was alles läuft. Abos verteilen sich auf Konten, Karten und PayPal.",
    title: "Drei-Wege-Erfassung. Auch das, was du vergessen hattest.",
    desc:
      "Importiere den Kontoauszug, leite Belege ans Toolfolio-Postfach weiter oder erfasse manuell. Der Import-Algorithmus findet auch die Abos, die du längst vergessen hast und ordnet sie automatisch ein.",
    shots: [
      { slot: "Import-Review mit erkannten Buchungen.", caption: "import", Preview: PreviewImport },
      { slot: "Onboarding-Wizard mit Kontoauszug-Upload.", caption: "onboarding" },
    ],
  },
  {
    id: "trials",
    icon: Hourglass,
    eyebrow: "Nie wieder ein vergessenes Trial",
    painpoint: "Du testest ein Tool, vergisst zu kündigen, und es zieht seit vier Monaten ungenutzt Geld ab.",
    title: "Trial- und Zombie-Erkennung warnt dich, bevor es teuer wird.",
    desc:
      "Toolfolio erkennt Trials automatisch und meldet sich rechtzeitig vor dem Übergang in den bezahlten Tarif. Abos ohne Nutzung markieren wir als Zombies und schlagen die Kündigung direkt vor.",
    shots: [
      { slot: "Fristen-Timeline mit Trial- und Zombie-Markern.", caption: "fristen", Preview: PreviewFristen },
      { slot: "Aktions-Center mit anstehenden Entscheidungen.", caption: "aktionen" },
    ],
  },
  {
    id: "fristen",
    icon: CalendarClock,
    eyebrow: "Keine stille Jahresverlängerung mehr",
    painpoint: "Ein Vertrag hat sich still um ein Jahr verlängert, weil du die Frist verpasst hast.",
    title: "Der Kündigungsfristen-Wächter, gemacht für deutsche Verträge.",
    desc:
      "Für jeden Vertrag siehst du Laufzeit, letzten Kündigungstermin und die Konsequenz einer verpassten Frist. Wir erinnern dich rechtzeitig per E-Mail und im Dashboard, damit Verlängerungen nur passieren, wenn du sie willst.",
    shots: [
      { slot: "Fristen-Detail mit Kündigungstermin und Konsequenz.", caption: "fristen-detail" },
    ],
  },
  {
    id: "ai",
    icon: Bot,
    eyebrow: "Auch die KI-Kosten im Griff",
    painpoint: "Deine KI-Credits laufen unbemerkt, und am Monatsende ist die Rechnung doppelt so hoch.",
    title: "AI-Credit-Tracker mit Verlauf, Spikes und Budgets.",
    desc:
      "OpenAI, Anthropic, ElevenLabs und Co. landen im selben Cockpit. Du siehst Verbrauchsverläufe, erkennst Spikes und Auto-Recharges früh und setzt harte Budgets, damit eine API-Schleife dich nicht überrascht.",
    shots: [
      { slot: "AI-Credit-Detail mit Spike-Erkennung und Budgets.", caption: "ai-credits", Preview: PreviewAiCredits },
    ],
  },
  {
    id: "benchmark",
    icon: BarChart3,
    eyebrow: "Sieh, ob du zu viel zahlst",
    painpoint: "Du zahlst für gleiche Leistung mehr als nötig, weißt es aber nicht.",
    title: "Benchmark aus echten, anonymisierten Abrechnungsdaten.",
    desc:
      "Wir vergleichen deine Preise mit dem Markt-Median vergleichbarer Agenturen und Freelancer. Du erkennst sofort, wo du fair zahlst und wo ein Gespräch mit dem Anbieter oder ein Wechsel sich lohnt.",
    shots: [
      { slot: "Benchmark-Ansicht Du gegen Markt-Median.", caption: "benchmark", Preview: PreviewBenchmark },
    ],
  },
  {
    id: "sparen",
    icon: Sparkles,
    eyebrow: "Sparen mit einem Klick",
    painpoint: "Du würdest sparen, wenn du wüsstest wie.",
    title: "Sparvorschläge, Intervallwechsel, Gutscheine und Deals.",
    desc:
      "Konkrete Maßnahmen statt abstrakter Berichte. Wechsle auf den Jahresplan, beseitige Redundanzen, nutze passende Gutscheine. Jeder Vorschlag zeigt die jährliche Ersparnis und ist mit einem Klick umsetzbar.",
    shots: [
      { slot: "Sparvorschläge mit Jahres-Ersparnis und Aktionen.", caption: "sparvorschlaege", Preview: PreviewSparvorschlaege },
    ],
  },
  {
    id: "kunden",
    icon: Users,
    eyebrow: "Toolkosten pro Kunde (für Agenturen)",
    painpoint: "Bei Agenturen verteilen sich Toolkosten ungeordnet, niemand weiß, was zu wem gehört.",
    title: "Zuordnen, weiterverrechnen, Marge sehen.",
    desc:
      "Jedes Tool kann einem Kunden zugeordnet werden, anteilig oder vollständig. Du siehst pro Kunde die Tool-Kosten, den weiterverrechneten Anteil und die Marge. Saubere Zahlen für Reporting und Kundengespräch.",
    shots: [
      { slot: "Kunden-Detail mit Tool-Kosten und Marge.", caption: "kunden", Preview: PreviewKunde },
      { slot: "Kosten nach Kunde im Dashboard.", caption: "kosten-kunde" },
    ],
  },
  {
    id: "weiterverrechnung",
    icon: Receipt,
    eyebrow: "Fertig für die Rechnung",
    painpoint: "Du willst weiterverrechnen, aber der saubere Beleg fehlt jeden Monat.",
    title: "Weiterverrechnungs-Report pro Kunde, pro Monat.",
    desc:
      "Toolfolio bündelt die zuordenbaren Tool-Kosten pro Kunde in einem klaren Report. Direkt in die Rechnung oder als PDF an dein Buchhaltungstool weitergeben.",
    shots: [
      { slot: "Report-Vorschau mit Positionen pro Kunde.", caption: "report" },
    ],
  },
  {
    id: "archiv",
    icon: Archive,
    eyebrow: "Schluss mit Belegchaos",
    painpoint: "Zur Steuer suchst du Rechnungen und Verträge mühsam zusammen.",
    title: "Rechnungs- und Vertragsarchiv plus Steuer- und DATEV-Export.",
    desc:
      "Alle Belege liegen am richtigen Abo, durchsuchbar, mit Vertrag und Kündigung verknüpft. Der Steuer-Export liefert Buchungssätze inklusive Reverse-Charge für EU-Anbieter und DATEV-kompatibles CSV.",
    shots: [
      { slot: "Archiv mit Belegen und Verträgen je Abo.", caption: "archiv" },
      { slot: "Steuer- und DATEV-Export mit Reverse-Charge.", caption: "steuer-export" },
    ],
  },
  {
    id: "verzeichnis",
    icon: Search,
    eyebrow: "Das Verzeichnis",
    painpoint: "Wechseln ist mühsam, weil du nicht weißt, was es Besseres oder Günstigeres gibt.",
    title: "Software finden, vergleichen, günstigere Alternative wählen.",
    desc:
      "Das DACH-Verzeichnis zeigt verifizierte Marktpreise statt Listenpreisen. Filter für DSGVO, Hosting in EU, Kategorie und Preisspanne. Direkter Alternativ-Vergleich mit Spar-Potenzial.",
    shots: [
      { slot: "Verzeichnis-Suche mit verifizierten Preisen.", caption: "verzeichnis", Preview: PreviewVerzeichnis },
    ],
  },
];

const idToSlug: Record<string, string> = {
  ueberblick: "dashboard",
  erfassen: "drei-wege-erfassung",
  trials: "fristen-waechter",
  fristen: "fristen-waechter",
  ai: "ai-credits",
  benchmark: "benchmark",
  sparen: "sparvorschlaege",
  kunden: "kosten-pro-kunde",
  weiterverrechnung: "weiterverrechnung",
};

function detailHrefFor(id: string): string {
  if (id === "verzeichnis") return "/verzeichnis";
  if (id === "archiv") return "/features";
  return `/features/${idToSlug[id] ?? id}`;
}

const rasterIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  abbuchungen: Bell,
  onboarding: Inbox,
  aktionen: Bell,
  "fristen-detail": CalendarClock,
  "kosten-kunde": Users,
  report: FileText,
  archiv: Archive,
  "steuer-export": Calculator,
};

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-32 -left-20 size-[480px] rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute top-40 -right-20 size-[420px] rounded-full bg-coral/15 blur-3xl" />
      </div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-10 sm:pt-16 pb-16 sm:pb-20">
        <div className="grid lg:grid-cols-[1fr_1.1fr] gap-12 items-center">
          <Reveal>
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground">
              <span className="size-1.5 rounded-full bg-coral" />
              Funktionen
            </div>
            <h1 className="mt-5 font-display text-4xl sm:text-5xl lg:text-6xl font-semibold leading-[1.05] tracking-tight">
              Jede Funktion löst ein <span className="text-primary">echtes Problem.</span>
            </h1>
            <p className="mt-5 text-lg text-muted-foreground max-w-xl">
              Toolfolio sammelt keine Features. Jede Funktion auf dieser Seite stellt einen
              konkreten Kostenschmerz ab. Stille Verlängerungen, vergessene Trials, KI-Spikes,
              ungeordnete Agentur-Weiterverrechnung. Genau diese Probleme.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href="/onboarding"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3.5 text-base font-semibold text-primary-foreground shadow-soft hover:bg-primary/90 hover:shadow-lift transition-all"
              >
                Kostenlos starten <ArrowRight className="size-4" />
              </a>
              <a
                href="#raster"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3.5 text-base font-semibold hover:bg-accent transition-colors"
              >
                Alle Funktionen ansehen
              </a>
            </div>
          </Reveal>
          <Reveal delay={150}>
            <ScreenshotFrame label="Dashboard mit KPI-Karten und Spar-Fortschritt." caption="dashboard">
              <PreviewDashboard />
            </ScreenshotFrame>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Raster() {
  return (
    <section id="raster" className="py-16 sm:py-20 bg-secondary/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <div className="max-w-2xl">
            <div className="text-xs font-semibold uppercase tracking-widest text-primary">
              Schnell-Überblick
            </div>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl font-semibold tracking-tight">
              Springe direkt zur Funktion, die dich interessiert.
            </h2>
          </div>
        </Reveal>
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {blocks.map((b, i) => (
            <Reveal key={b.id} delay={i * 40}>
              <a
                href={`#${b.id}`}
                className="group h-full flex items-start gap-3 rounded-2xl border border-border bg-card p-4 card-lift"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                  <b.icon className="size-5" />
                </span>
                <div className="min-w-0">
                  <div className="text-sm font-semibold leading-tight">{b.eyebrow}</div>
                  <div className="mt-1 text-xs text-muted-foreground line-clamp-2">
                    {b.title}
                  </div>
                </div>
                <ArrowRight className="ml-auto mt-1 size-4 text-muted-foreground shrink-0 transition-transform group-hover:translate-x-0.5" />
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function PlaceholderPreview({ caption }: { caption: string }) {
  const Icon = rasterIcons[caption] ?? LayoutDashboard;
  return (
    <div className="absolute inset-0 grid place-items-center p-6 text-center">
      <div>
        <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
          <Icon className="size-6" />
        </div>
        <div className="mt-3 font-display text-base font-semibold">Screenshot-Slot</div>
        <div className="mt-1 text-xs text-muted-foreground max-w-xs">
          Backend-Ansicht „{caption}" einsetzen.
        </div>
      </div>
    </div>
  );
}

function Blocks() {
  return (
    <section className="py-10 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 space-y-20 sm:space-y-28">
        {blocks.map((b, i) => {
          const reverse = i % 2 === 1;
          return (
            <div
              key={b.id}
              id={b.id}
              className="scroll-mt-24 grid lg:grid-cols-2 gap-10 lg:gap-14 items-center"
            >
              <Reveal className={cn(reverse && "lg:order-2")}>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-widest text-coral">
                    Das Problem
                  </div>
                  <p className="mt-2 text-base text-coral/90 font-medium leading-snug">
                    {b.painpoint}
                  </p>
                  <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                    <b.icon className="size-3.5" /> {b.eyebrow}
                  </div>
                  <h3 className="mt-3 font-display text-2xl sm:text-3xl font-semibold tracking-tight leading-tight">
                    {b.title}
                  </h3>
                  <p className="mt-4 text-base sm:text-lg text-muted-foreground">{b.desc}</p>
                  <a
                    href={detailHrefFor(b.id)}
                    className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
                  >
                    Mehr erfahren <ArrowRight className="size-4" />
                  </a>
                </div>
              </Reveal>
              <Reveal delay={120} className={cn(reverse && "lg:order-1")}>
                <div
                  className={cn(
                    "grid gap-5",
                    b.shots.length > 1 ? "sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2" : "",
                  )}
                >
                  {b.shots.map((s) => (
                    <ScreenshotFrame key={s.caption} label={s.slot} caption={s.caption}>
                      {s.Preview ? <s.Preview /> : <PlaceholderPreview caption={s.caption} />}
                    </ScreenshotFrame>
                  ))}
                </div>
              </Reveal>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <div className="relative overflow-hidden rounded-[32px] bg-foreground text-[color:var(--paper)] p-10 sm:p-16 text-center">
            <div className="absolute -top-20 -right-20 size-72 rounded-full bg-primary/40 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 size-72 rounded-full bg-coral/40 blur-3xl" />
            <div className="relative">
              <h2 className="font-display text-3xl sm:text-5xl font-semibold tracking-tight">
                Funktionen sind nur dann gut, wenn sie dir Geld sparen.
              </h2>
              <p className="mt-4 text-lg opacity-80 max-w-xl mx-auto">
                In zehn Minuten eingerichtet. Erste Sparvorschläge noch heute.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <a
                  href="/onboarding"
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-4 text-base font-semibold text-primary-foreground shadow-lift hover:bg-primary/90 transition-all"
                >
                  Kostenlos starten <ArrowRight className="size-4" />
                </a>
                <a
                  href="/preise"
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 px-7 py-4 text-base font-semibold text-[color:var(--paper)] hover:bg-white/10 transition-all"
                >
                  Preise ansehen
                </a>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function FeaturesPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />
      <Hero />
      <Raster />
      <Blocks />
      <FinalCTA />
      <Footer />
    </div>
  );
}

export default FeaturesPage;
