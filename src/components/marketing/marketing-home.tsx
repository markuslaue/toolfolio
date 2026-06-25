import Link from "next/link";
import {
  ArrowRight,
  Search,
  ShieldCheck,
  Lock,
  Globe2,
  Eye,
  Hourglass,
  CalendarClock,
  Bot,
  Users,
  Receipt,
  BellRing,
  FileUp,
  BarChart3,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  Building2,
  User,
  Rocket,
} from "lucide-react";
import { TRIAL_DAYS, PLANS, formatEur } from "@/lib/constants";

function Eyebrow({ color = "primary", children }: { color?: "primary" | "coral" | "success"; children: React.ReactNode }) {
  const cls =
    color === "coral" ? "text-coral" : color === "success" ? "text-success" : "text-primary";
  return <div className={`text-xs font-semibold uppercase tracking-widest ${cls}`}>{children}</div>;
}

/* Leichtes, statisches Dashboard-Mockup fuer den Hero. */
function PreviewDashboard() {
  const rows = [
    { n: "Figma", k: "Design", b: "15,00 €", w: false },
    { n: "Ahrefs", k: "SEO", b: "199,00 €", w: true },
    { n: "Notion", k: "Produktivität", b: "9,50 €", w: false },
    { n: "Slack", k: "Kommunikation", b: "7,25 €", w: false },
  ];
  return (
    <div className="rounded-2xl border border-border bg-background p-4 text-left">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs text-muted-foreground">Kosten pro Monat</div>
          <div className="font-display text-2xl font-bold tabular-nums">1.248,00 €</div>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-xs font-semibold text-success">
          <TrendingUp className="size-3" /> 12 % unter Benchmark
        </span>
      </div>
      <div className="mt-4 space-y-1.5">
        {rows.map((r) => (
          <div key={r.n} className="flex items-center justify-between rounded-lg bg-secondary/40 px-2.5 py-1.5 text-xs">
            <span className="font-medium">{r.n}</span>
            <span className="text-muted-foreground">{r.k}</span>
            <span className="flex items-center gap-1.5 tabular-nums">
              {r.w && (
                <span className="rounded-full bg-warning/15 px-1.5 py-0.5 text-[9px] font-semibold text-warning">
                  Frist bald
                </span>
              )}
              {r.b}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute -left-20 -top-32 size-[480px] rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -right-20 top-40 size-[420px] rounded-full bg-coral/15 blur-3xl" />
      </div>
      <div className="mx-auto max-w-7xl px-4 pb-16 pt-12 sm:px-6 sm:pb-24 sm:pt-16">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_1.1fr] lg:gap-14">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground">
              <span className="size-1.5 rounded-full bg-coral" />
              Für Agenturen, Freelancer und Solopreneure im DACH-Raum
            </div>
            <h1 className="mt-5 font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              Behalte den Überblick über jede Software, die dein Geld abbucht.{" "}
              <span className="text-primary">Und zahl weniger dafür.</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted-foreground">
              Toolfolio zeigt dir, was wirklich läuft, warnt dich vor stillen Verlängerungen
              und macht günstigere Alternativen sichtbar. Belegt durch echte Marktpreise.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/registrieren"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3.5 text-base font-semibold text-primary-foreground shadow-soft transition-all hover:bg-primary/90 hover:shadow-lift"
              >
                Kostenlos starten <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/preise"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3.5 text-base font-semibold transition-colors hover:bg-accent"
              >
                <Search className="size-4" /> Preise ansehen
              </Link>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="size-4 text-success" /> DSGVO-konform
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Lock className="size-4 text-success" /> Keine Passwörter gespeichert
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Globe2 className="size-4 text-success" /> Made for DACH
              </span>
            </div>
          </div>

          <div className="rounded-[24px] border border-border bg-card p-3 shadow-lift">
            <div className="flex items-center gap-2 border-b border-border px-3 py-2.5">
              <span className="size-2.5 rounded-full bg-destructive/40" />
              <span className="size-2.5 rounded-full bg-warning/50" />
              <span className="size-2.5 rounded-full bg-success/50" />
              <span className="ml-3 rounded-full border border-border bg-background px-3 py-1 text-[11px] text-muted-foreground">
                toolfolio.de/app
              </span>
            </div>
            <div className="p-3">
              <PreviewDashboard />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Schmerz() {
  const items = [
    { icon: Eye, title: "Du weißt gar nicht mehr, welche Tools überhaupt noch laufen.", desc: "Abos verteilen sich auf drei Konten, zwei Karten und das PayPal vom Praktikanten." },
    { icon: Hourglass, title: "Trial vergessen zu kündigen, vier Monate ungenutzt im Abo.", desc: "Die kostenlose Version ist abgelaufen, das Geld wurde trotzdem jeden Monat abgebucht." },
    { icon: CalendarClock, title: "Vertrag hat sich still um ein Jahr verlängert.", desc: "Die Kündigungsfrist war vor zwei Wochen. Niemand hat dran gedacht." },
    { icon: Bot, title: "KI-Credits laufen unbemerkt aus dem Ruder.", desc: "Am Monatsende ist die Rechnung doppelt so hoch wie geplant." },
    { icon: Users, title: "Keiner weiß, welche Toolkosten zu welchem Kunden gehören.", desc: "Beim Reporting wird geschätzt. Marge bleibt unklar, Weiterverrechnung lückenhaft." },
  ];
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="max-w-2xl">
          <Eyebrow color="coral">Kennst du das?</Eyebrow>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Software-Abos sind der blinde Fleck in deiner Kalkulation.
          </h2>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it) => (
            <div key={it.title} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
              <span className="grid size-10 place-items-center rounded-xl bg-coral/10 text-coral">
                <it.icon className="size-5" />
              </span>
              <h3 className="mt-4 font-semibold leading-snug">{it.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{it.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Features() {
  const items = [
    { icon: Receipt, title: "Alle Abos an einem Ort", desc: "Kosten, Intervall, Zahlungskanal und Kunde je Tool, sauber strukturiert statt im Tabellen-Chaos." },
    { icon: BellRing, title: "Fristen-Wächter", desc: "Kündigungsfristen und Trial-Enden im Blick, sortiert nach Dringlichkeit. Keine stille Verlängerung mehr." },
    { icon: FileUp, title: "Kontoauszug-Import", desc: "Abbuchungen einlesen, wiederkehrende Abos automatisch erkennen und mit einem Klick übernehmen." },
    { icon: BarChart3, title: "Verifizierte Preise & Benchmark", desc: "Sieh, ob du fair zahlst, belegt durch echte, anonymisierte Marktdaten statt Listenpreis-Versprechen." },
    { icon: Sparkles, title: "Sparvorschläge", desc: "Günstigere Tarife und Alternativen bei gleicher Leistung, konkret beziffert pro Jahr." },
    { icon: Users, title: "Weiterverrechnung & Marge", desc: "Ordne Toolkosten Kunden zu, hinterlege Aufschläge und sieh deine Marge pro Kunde." },
  ];
  return (
    <section id="funktionen" className="border-y border-border bg-secondary/30 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="max-w-2xl">
          <Eyebrow>Was Toolfolio kann</Eyebrow>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Werkzeuge gegen echte Probleme.
          </h2>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it) => (
            <div key={it.title} className="rounded-2xl border border-border bg-card p-6 shadow-soft">
              <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
                <it.icon className="size-5" />
              </span>
              <h3 className="mt-4 font-display text-lg font-semibold">{it.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{it.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Benchmark() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2">
        <div>
          <Eyebrow color="coral">Die goldene Regel</Eyebrow>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Das DACH-Verzeichnis mit Preisen, die echt sind.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Verifizierte Preise entstehen aus echten, anonymisierten Abrechnungsdaten, niemals aus
            bezahlter Platzierung. Kaufbar ist nur Sichtbarkeit, immer als gesponsert
            gekennzeichnet. Rang, Bewertungen und verifizierte Daten bleiben unbestechlich.
          </p>
          <ul className="mt-6 space-y-3">
            {[
              "Verifiziert, zu wenig Daten oder Listenpreis, immer transparent gekennzeichnet",
              "Hohe Mindestschwelle, bevor ein Preis als verifiziert gilt",
              "Personenbezogene Daten strikt getrennt von der Auswertung",
            ].map((t) => (
              <li key={t} className="flex items-start gap-2.5 text-sm">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <div className="text-sm font-medium">Beispiel: Projektmanagement-Tool</div>
          <div className="mt-4 space-y-2.5">
            {[
              { n: "Dein Preis", b: "24,00 €", tag: "+ 6,00 € über Benchmark", warn: true },
              { n: "Verifizierter Marktpreis", b: "18,00 €", tag: "Median aus echten Daten", warn: false },
            ].map((r) => (
              <div key={r.n} className="flex items-center justify-between rounded-xl bg-secondary/40 px-4 py-3">
                <div>
                  <div className="text-sm font-medium">{r.n}</div>
                  <div className="text-xs text-muted-foreground">{r.tag}</div>
                </div>
                <div className={`tabular-nums text-lg font-semibold ${r.warn ? "text-destructive" : "text-success"}`}>
                  {r.b}
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Beispielhafte Darstellung. Verifizierte Preise erscheinen nur bei ausreichender Datenbasis.
          </p>
        </div>
      </div>
    </section>
  );
}

function Zielgruppen() {
  const items = [
    { icon: Building2, title: "Agenturen", desc: "Toolkosten je Kunde, Weiterverrechnung und Marge auf einen Blick. Sauberes Reporting statt Schätzen." },
    { icon: User, title: "Freelancer", desc: "Ein Ort für alle Abos, Fristen im Griff und Belege fürs Finanzamt geordnet." },
    { icon: Rocket, title: "Solopreneure", desc: "Schlank starten, KI-Kosten im Blick behalten und bei gleicher Leistung weniger zahlen." },
  ];
  return (
    <section className="border-y border-border bg-secondary/30 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="max-w-2xl">
          <Eyebrow>Für wen</Eyebrow>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Gebaut für die, die schnell und schlank arbeiten.
          </h2>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {items.map((it) => (
            <div key={it.title} className="rounded-2xl border border-border bg-card p-6 shadow-soft">
              <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
                <it.icon className="size-5" />
              </span>
              <h3 className="mt-4 font-display text-xl font-semibold">{it.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{it.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Sicherheit() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
        <Eyebrow color="success">Sicherheit</Eyebrow>
        <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          Sicher genug für deine Buchhaltung.
        </h2>
        <p className="mt-4 text-muted-foreground">
          Wir speichern niemals vollständige Kartennummern, Prüfziffern oder IBAN, nur Referenzen.
          Keine Passwörter fremder Tools. Hosting in der EU, DSGVO-konform.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3 text-sm">
          {["EU-Hosting", "DSGVO-konform", "Nur Referenzen, keine Geheimnisse", "Cookielose Statistik"].map((t) => (
            <span key={t} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-1.5">
              <ShieldCheck className="size-4 text-success" /> {t}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function PreisTeaser() {
  return (
    <section className="border-t border-border bg-secondary/30 py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
        <Eyebrow>Preise</Eyebrow>
        <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          Faire Preise. {TRIAL_DAYS} Tage kostenlos testen.
        </h2>
        <p className="mt-4 text-muted-foreground">
          Starte kostenlos, ohne Kreditkarte. Pro ab {formatEur(PLANS.pro.monthlyEur)} pro Monat,
          Agentur ab {formatEur(PLANS.agentur.monthlyEur)} pro Monat.
        </p>
        <Link
          href="/preise"
          className="mt-7 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3.5 text-base font-semibold text-primary-foreground shadow-soft transition-all hover:bg-primary/90 hover:shadow-lift"
        >
          Preise im Detail <ArrowRight className="size-4" />
        </Link>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="overflow-hidden rounded-[28px] bg-primary px-6 py-14 text-center text-primary-foreground sm:px-12">
          <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-5xl">
            Schluss mit stillen Verlängerungen.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-primary-foreground/80">
            Bring deine Software-Kosten an einen Ort, behalte Fristen im Griff und zahl bei gleicher
            Leistung weniger.
          </p>
          <Link
            href="/registrieren"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-card px-6 py-3.5 text-base font-semibold text-foreground shadow-lift transition hover:opacity-90"
          >
            Kostenlos starten <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

export function MarketingHome() {
  return (
    <>
      <Hero />
      <Schmerz />
      <Features />
      <Benchmark />
      <Zielgruppen />
      <Sicherheit />
      <PreisTeaser />
      <FinalCta />
    </>
  );
}
