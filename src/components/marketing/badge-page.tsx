import { useState } from "react";
import {
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Lock,
  Eye,
  BadgeCheck,
  Code2,
  FileCheck2,
  RefreshCw,
  AlertTriangle,
  Scale,
  HelpCircle,
  Send,
  Users,
  Sparkles,
  Megaphone,
  Tag,
} from "lucide-react";
import { Nav, Footer, Reveal } from "./marketing-home";
import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const meansList = [
  {
    icon: Lock,
    title: "Gültiges TLS",
    text: "Wir haben geprüft, dass das Tool durchgehend über HTTPS mit gültigem Zertifikat erreichbar ist.",
  },
  {
    icon: CheckCircle2,
    title: "Live-Funktion",
    text: "Wir haben geprüft, dass das Tool tatsächlich erreichbar und funktionsfähig ist.",
  },
  {
    icon: FileCheck2,
    title: "Datenschutz und Impressum",
    text: "Datenschutzerklärung und Impressum sind vorhanden und auffindbar.",
  },
  {
    icon: ShieldCheck,
    title: "Grundlegende Sicherheits-Header",
    text: "Wir haben grundlegende HTTP-Sicherheits-Header geprüft.",
  },
  {
    icon: BadgeCheck,
    title: "Verbindliche Selbstauskunft",
    text: "Der Anbieter hat per Selbstauskunft verbindlich zugesichert, nach aktuellen Sicherheitsstandards zu arbeiten.",
  },
];

const meansNotList = [
  "Keine vollständige Sicherheitsprüfung des Codes oder der Infrastruktur.",
  "Kein Penetrationstest, kein Audit.",
  "Keine Zertifizierung nach ISO, SOC 2, BSI oder Vergleichbarem.",
  "Keine Garantie, dass das Tool fehler- oder lückenfrei ist.",
  "Kein Qualitäts- oder Eignungsurteil über die Software.",
  "Eigene Sorgfalt bei sensiblen Entscheidungen bleibt nötig.",
];

const generalReqs = [
  "Echtes, erreichbares und funktionierendes Tool mit Live-URL",
  "Öffentlich einsehbare Preise",
  "Kontakt- bzw. Betreiberangabe",
  "Thematische Relevanz, korrekte Kategorie, ehrliche Beschreibung",
  "Kein Scam, keine Schadsoftware",
];

const securityReqs = [
  {
    icon: Lock,
    title: "HTTPS und Verschlüsselung",
    text: "Durchgehend HTTPS mit gültigem Zertifikat. Verschlüsselung bei Übertragung und Speicherung.",
  },
  {
    icon: ShieldCheck,
    title: "Sichere Authentifizierung",
    text: "Gehashte Passwörter, keine Klartext-Geheimnisse, 2FA möglich.",
  },
  {
    icon: FileCheck2,
    title: "DSGVO-Konformität",
    text: "Datenschutzerklärung, AVV-Möglichkeit, offengelegtes Hosting und Subdienstleister.",
  },
  {
    icon: Eye,
    title: "Nutzerkontrolle",
    text: "Datenexport und Löschung auf Anfrage, klarer Prozess für Sicherheitsvorfälle.",
  },
  {
    icon: Code2,
    title: "Gepflegte Technik",
    text: "Regelmäßige Backups, gepflegte Abhängigkeiten ohne bekannte kritische Lücken.",
  },
];

const methodSteps = [
  {
    icon: ShieldCheck,
    title: "Externe Prüfung durch Toolfolio",
    text: "Automatisierte Checks und manuelle Sichtprüfung von außen: TLS-Zertifikat, Erreichbarkeit, Datenschutzerklärung und Impressum, grundlegende Sicherheits-Header, Plausibilität des Listings.",
  },
  {
    icon: FileCheck2,
    title: "Selbstauskunft des Anbieters",
    text: "Verbindliche Checkliste zu den Punkten, die wir nicht von außen prüfen können: Hashing, 2FA, Hosting, Subdienstleister, Backups, Vorfalls-Prozess, Datenexport und Löschung.",
  },
  {
    icon: Scale,
    title: "Plausibilitätsabgleich",
    text: "Wir prüfen, ob extern beobachtbare Signale (z. B. Datenschutzerklärung, Login-Verhalten, Header) mit der Selbstauskunft zusammenpassen. Widersprüche führen zur Nachfrage oder Ablehnung.",
  },
];

const lifecycle = [
  {
    icon: RefreshCw,
    title: "Befristete Gültigkeit",
    text: "Der Badge gilt befristet, in der Regel zwölf Monate. Danach wird erneut geprüft und neu bestätigt. Ein Badge, der nie überprüft wird, wäre wertlos.",
  },
  {
    icon: BadgeCheck,
    title: "Erneute Prüfung",
    text: "Vor Ablauf melden wir uns beim Anbieter und durchlaufen den Prüfprozess erneut. Änderungen am Tool und an der Selbstauskunft werden aktualisiert.",
  },
  {
    icon: AlertTriangle,
    title: "Entzug bei Verstoß",
    text: "Wenn ein Tool die Standards nicht mehr erfüllt oder die Selbstauskunft falsch war, wird der Badge entzogen und im Verzeichnis sichtbar entfernt.",
  },
];

const faqs = [
  {
    q: "Garantiert der Badge, dass ein Tool sicher ist?",
    a: "Nein. Der Badge bestätigt extern prüfbare Punkte und die verbindliche Selbstauskunft des Anbieters. Er ist ausdrücklich keine vollständige Sicherheitsprüfung, kein Penetrationstest und keine Zertifizierung. Bei sensiblen Entscheidungen bleibt eigene Sorgfalt nötig. [Formulierung anwaltlich zu prüfen.]",
  },
  {
    q: "Wie lange gilt der Badge?",
    a: "In der Regel zwölf Monate. Danach wird erneut geprüft und neu bestätigt.",
  },
  {
    q: "Kann ein Badge entzogen werden?",
    a: "Ja. Wenn ein Tool die Standards nicht mehr erfüllt oder die Selbstauskunft falsch war, entziehen wir den Badge und kennzeichnen das im Verzeichnis.",
  },
  {
    q: "Ist 'gesponsert' dasselbe wie 'verifiziert'?",
    a: "Nein. Sichtbarkeit ist erhältlich, der Badge nicht. Gesponserte Platzierungen sind klar gekennzeichnet und sagen nichts über Prüfung oder Qualität aus.",
  },
  {
    q: "Wie bekomme ich den Badge?",
    a: "Indie-Builder finden den Weg unter 'Für Entwickler'. Etablierte Anbieter starten unter 'Für Anbieter'. In beiden Fällen folgt eine Selbstauskunft, eine externe Prüfung und der Plausibilitätsabgleich.",
  },
  {
    q: "Beeinflusst der Badge das Ranking oder die Bewertungen?",
    a: "Nein. Bewertungen, neutrale Ranglisten und verifizierte Preisdaten sind nicht käuflich. Der Badge sagt 'geprüft', nicht 'besser'.",
  },
];

export function BadgePage() {
  const [report, setReport] = useState({ tool: "", url: "", reason: "" });
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!report.tool.trim()) next.tool = "Bitte Tool-Namen angeben.";
    if (!report.url.trim() || !/^https?:\/\//i.test(report.url))
      next.url = "Bitte vollständige URL angeben.";
    if (!report.reason.trim() || report.reason.trim().length < 20)
      next.reason = "Bitte kurz beschreiben (mind. 20 Zeichen).";
    if (!consent) next.consent = "Pflicht für die Bearbeitung.";
    setErrors(next);
    if (Object.keys(next).length === 0) setSent(true);
  }

  return (
    <div className="min-h-screen bg-paper text-foreground">
      <Nav />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(60% 50% at 80% 0%, rgba(108,92,231,0.10), transparent), radial-gradient(40% 40% at 10% 20%, rgba(18,183,106,0.10), transparent)",
          }}
        />
        <div className="mx-auto max-w-6xl px-6 pt-16 pb-12 lg:pt-24 lg:pb-16">
          <div className="grid items-center gap-10 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <Reveal>
                <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs text-muted-foreground shadow-soft">
                  <Sparkles className="size-3.5 text-primary" />
                  Toolfolio Vertrauens-Badge
                </div>
              </Reveal>
              <Reveal delay={80}>
                <h1 className="font-display mt-4 text-4xl leading-[1.05] tracking-tight md:text-6xl">
                  Was der{" "}
                  <span className="text-primary">Vertrauens-Badge</span>{" "}
                  bedeutet.
                </h1>
              </Reveal>
              <Reveal delay={140}>
                <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
                  Wir legen transparent offen, was wir prüfen und was nicht.
                  Der Badge ist ein Vertrauenssignal, kein Sicherheitssiegel.
                  Diese Seite ist die kanonische Definition, auf die der Badge
                  im Verzeichnis verlinkt.
                </p>
              </Reveal>
              <Reveal delay={200}>
                <div className="mt-7 flex flex-wrap items-center gap-3">
                  <a
                    href="#scope"
                    className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground shadow-soft hover:bg-primary/90"
                  >
                    Scope ansehen <ArrowRight className="size-4" />
                  </a>
                  <a
                    href="#methode"
                    className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-5 py-3 text-sm font-medium hover:bg-accent"
                  >
                    Methodik
                  </a>
                </div>
              </Reveal>
            </div>

            <div className="lg:col-span-5">
              <Reveal delay={120}>
                <div className="card-lift mx-auto flex max-w-sm flex-col items-center rounded-[2rem] border border-border bg-surface p-8 text-center shadow-lift">
                  <BadgeVisual size="lg" />
                  <div className="mt-5 font-display text-xl">
                    Verifiziert durch Toolfolio
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    Geprüfte externe Punkte + verbindliche Selbstauskunft des
                    Anbieters. Keine Sicherheitsgarantie.
                  </div>
                  <div className="mt-5 flex items-center gap-2 rounded-full bg-success/10 px-3 py-1 text-xs text-success">
                    <RefreshCw className="size-3.5" />
                    Gültigkeit: 12 Monate, dann erneute Prüfung
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* Bedeutet / bedeutet nicht */}
      <section id="scope" className="mx-auto max-w-6xl px-6 py-16">
        <Reveal>
          <h2 className="font-display text-3xl md:text-4xl tracking-tight">
            Das bedeutet der Badge. Und das nicht.
          </h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Klar getrennt, weil Ehrlichkeit hier mehr wert ist als ein starkes
            Versprechen.
          </p>
        </Reveal>

        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          <Reveal>
            <div className="h-full rounded-3xl border-2 border-success/30 bg-success/5 p-7">
              <div className="flex items-center gap-2 text-xs text-success">
                <CheckCircle2 className="size-3.5" /> Das bedeutet er
              </div>
              <h3 className="font-display mt-3 text-xl">
                Toolfolio hat geprüft und der Anbieter hat zugesichert
              </h3>
              <ul className="mt-5 space-y-3">
                {meansList.map((m) => (
                  <li
                    key={m.title}
                    className="flex items-start gap-3 rounded-2xl border border-border bg-surface p-4"
                  >
                    <m.icon className="mt-0.5 size-4 text-success shrink-0" />
                    <div>
                      <div className="text-sm font-medium">{m.title}</div>
                      <div className="mt-0.5 text-sm text-muted-foreground">
                        {m.text}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <div className="h-full rounded-3xl border-2 border-destructive/30 bg-destructive/5 p-7">
              <div className="flex items-center gap-2 text-xs text-destructive">
                <XCircle className="size-3.5" /> Das bedeutet er nicht
              </div>
              <h3 className="font-display mt-3 text-xl">
                Keine Garantie, keine Zertifizierung
              </h3>
              <ul className="mt-5 space-y-2 text-sm">
                {meansNotList.map((m) => (
                  <li key={m} className="flex items-start gap-2">
                    <XCircle className="mt-0.5 size-4 text-destructive shrink-0" />
                    <span>{m}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-5 rounded-2xl border border-warning/30 bg-warning/10 p-4 text-xs text-foreground/80">
                Diese Ehrlichkeit ist Absicht und stärkt das Vertrauen. Die
                genaue Badge-Aussage ist anwaltlich zu prüfen.
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Prüfstandard */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <Reveal>
          <h2 className="font-display text-3xl md:text-4xl tracking-tight">
            Der Prüfstandard
          </h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Zwei Blöcke, konsistent für alle Anbieter im Verzeichnis.
          </p>
        </Reveal>

        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          <Reveal>
            <div className="rounded-3xl border border-border bg-surface p-7 shadow-soft">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Scale className="size-3.5 text-primary" /> Allgemein
              </div>
              <h3 className="font-display mt-3 text-xl">
                Allgemeine Anforderungen
              </h3>
              <ul className="mt-5 space-y-3 text-sm">
                {generalReqs.map((s) => (
                  <li key={s} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 size-4 text-success shrink-0" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <div className="rounded-3xl border-2 border-primary/20 bg-accent/40 p-7">
              <div className="flex items-center gap-2 text-xs text-primary">
                <ShieldCheck className="size-3.5" /> Schwerpunkt
              </div>
              <h3 className="font-display mt-3 text-xl">
                Sicherheits- und Technologie-Anforderungen
              </h3>
              <div className="mt-5 grid gap-3">
                {securityReqs.map((s) => (
                  <div
                    key={s.title}
                    className="flex items-start gap-3 rounded-2xl border border-border bg-surface p-4"
                  >
                    <s.icon className="mt-0.5 size-4 text-primary shrink-0" />
                    <div>
                      <div className="text-sm font-medium">{s.title}</div>
                      <div className="mt-0.5 text-sm text-muted-foreground">
                        {s.text}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Methodik */}
      <section id="methode" className="mx-auto max-w-6xl px-6 py-16">
        <Reveal>
          <h2 className="font-display text-3xl md:text-4xl tracking-tight">
            Wie wir prüfen
          </h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Drei Schritte, klar getrennt, damit du nachvollziehen kannst, was
            hinter dem Badge steckt.
          </p>
        </Reveal>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {methodSteps.map((m, i) => (
            <Reveal key={m.title} delay={i * 80}>
              <div className="card-lift h-full rounded-3xl border border-border bg-surface p-6 shadow-soft">
                <div className="inline-flex size-9 items-center justify-center rounded-2xl bg-accent text-primary">
                  <m.icon className="size-4" />
                </div>
                <h3 className="font-display mt-4 text-lg">{m.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{m.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Gültigkeit */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <Reveal>
          <h2 className="font-display text-3xl md:text-4xl tracking-tight">
            Gültigkeit, erneute Prüfung, Entzug
          </h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Ein Badge muss leben, sonst ist er wertlos.
          </p>
        </Reveal>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {lifecycle.map((l, i) => (
            <Reveal key={l.title} delay={i * 80}>
              <div className="card-lift h-full rounded-3xl border border-border bg-surface p-6 shadow-soft">
                <l.icon className="size-5 text-primary" />
                <h3 className="font-display mt-4 text-lg">{l.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{l.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Kennzeichnung im Verzeichnis */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <Reveal>
          <h2 className="font-display text-3xl md:text-4xl tracking-tight">
            Kennzeichnung im Verzeichnis
          </h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Drei Zustände, klar unterschieden. Sichtbarkeit ist erhältlich, der
            Badge und neutrale Ranglisten sind es nicht.
          </p>
        </Reveal>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          <Reveal>
            <ListingExample
              tone="verified"
              label="Verifiziert"
              title="Beispiel-Tool"
              category="Projektmanagement"
              description="Hat die Toolfolio-Prüfung durchlaufen und die Selbstauskunft abgegeben."
              note="Heißt: geprüft. Heißt nicht: garantiert sicher oder besser."
            />
          </Reveal>
          <Reveal delay={80}>
            <ListingExample
              tone="community"
              label="Community-Tool"
              title="Beispiel-Tool"
              category="Design"
              description="Im Verzeichnis gelistet, aber ohne Prüfung."
              note="Erfüllt die allgemeinen Standards, hat aber keinen Badge."
            />
          </Reveal>
          <Reveal delay={160}>
            <ListingExample
              tone="sponsored"
              label="Gesponsert"
              title="Beispiel-Tool"
              category="Kommunikation"
              description="Bezahlte Platzierung, klar gekennzeichnet."
              note="Heißt: sichtbarer. Heißt nicht: geprüft oder besser."
            />
          </Reveal>
        </div>
      </section>

      {/* Für Nutzer / Für Anbieter */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-5 lg:grid-cols-2">
          <Reveal>
            <div className="card-lift h-full rounded-3xl border border-border bg-surface p-7 shadow-soft">
              <div className="inline-flex size-10 items-center justify-center rounded-2xl bg-accent text-primary">
                <Users className="size-5" />
              </div>
              <h3 className="font-display mt-4 text-xl">Für Nutzer</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Der Badge ist ein Vertrauenssignal: extern geprüfte Punkte und
                eine verbindliche Selbstauskunft. Bei sensiblen Entscheidungen,
                etwa wenn personenbezogene Daten oder Kundendaten verarbeitet
                werden, ersetzt er nicht deine eigene Prüfung.
              </p>
              <a
                href="/verzeichnis"
                className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary"
              >
                Zum Verzeichnis <ArrowRight className="size-4" />
              </a>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <div className="card-lift h-full rounded-3xl border border-border bg-surface p-7 shadow-soft">
              <div className="inline-flex size-10 items-center justify-center rounded-2xl bg-accent text-primary">
                <BadgeCheck className="size-5" />
              </div>
              <h3 className="font-display mt-4 text-xl">Für Anbieter</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Du willst den Badge für dein Tool? Wir haben zwei passende
                Einstiege, je nachdem, wo du stehst.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <a
                  href="/entwickler"
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-paper px-4 py-2 text-sm hover:bg-accent"
                >
                  Für Indie-Builder <ArrowRight className="size-4" />
                </a>
                <a
                  href="/anbieter"
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90"
                >
                  Für etablierte Anbieter <ArrowRight className="size-4" />
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Verstoß melden */}
      <section className="mx-auto max-w-3xl px-6 py-16">
        <Reveal>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <AlertTriangle className="size-3.5 text-coral" /> Hält den Badge
            ehrlich
          </div>
          <h2 className="font-display mt-2 text-3xl md:text-4xl tracking-tight">
            Verstoß melden
          </h2>
          <p className="mt-3 text-muted-foreground">
            Du kennst ein verifiziertes Tool, das die Standards nicht erfüllt?
            Sag uns Bescheid. Wir prüfen jeden Hinweis und entziehen den Badge
            bei Bedarf.
          </p>
        </Reveal>

        <Reveal delay={80}>
          <div className="mt-6 rounded-3xl border border-border bg-surface p-7 shadow-soft">
            {sent ? (
              <div className="flex flex-col items-start gap-3">
                <div className="inline-flex size-10 items-center justify-center rounded-2xl bg-success/15 text-success">
                  <CheckCircle2 className="size-5" />
                </div>
                <h3 className="font-display text-2xl">Danke für den Hinweis.</h3>
                <p className="text-sm text-muted-foreground">
                  Wir prüfen die Meldung und melden uns bei Rückfragen. (Mock,
                  keine echte Übermittlung.)
                </p>
              </div>
            ) : (
              <form onSubmit={submit} noValidate className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Field
                    label="Tool-Name"
                    value={report.tool}
                    onChange={(v) => setReport({ ...report, tool: v })}
                    error={errors.tool}
                    placeholder="z. B. Beispiel-Tool"
                  />
                  <Field
                    label="URL"
                    value={report.url}
                    onChange={(v) => setReport({ ...report, url: v })}
                    error={errors.url}
                    placeholder="https://"
                  />
                </div>
                <Field
                  label="Was beobachtest du?"
                  value={report.reason}
                  onChange={(v) => setReport({ ...report, reason: v })}
                  error={errors.reason}
                  placeholder="Beschreibe kurz, welcher Standard nicht erfüllt scheint."
                  textarea
                />
                <label className="flex items-start gap-3 text-sm">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="mt-0.5 size-4 rounded border-border accent-primary"
                  />
                  <span>
                    Ich willige in die Verarbeitung meiner Meldung ein. Details
                    in der{" "}
                    <a
                      href="/datenschutz"
                      className="underline underline-offset-2"
                    >
                      Datenschutzerklärung
                    </a>
                    .
                  </span>
                </label>
                {errors.consent && (
                  <p className="text-xs text-destructive">{errors.consent}</p>
                )}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground shadow-soft hover:bg-primary/90"
                  >
                    Meldung senden <Send className="size-4" />
                  </button>
                  <span className="text-xs text-muted-foreground">
                    Mock-Versand. Keine echte Übermittlung.
                  </span>
                </div>
              </form>
            )}
          </div>
        </Reveal>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-6 py-16">
        <Reveal>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <HelpCircle className="size-3.5 text-primary" /> Häufige Fragen
          </div>
          <h2 className="font-display mt-2 text-3xl md:text-4xl tracking-tight">
            Fragen zum Badge
          </h2>
        </Reveal>
        <Reveal delay={80}>
          <div className="mt-8 rounded-3xl border border-border bg-surface px-2 shadow-soft">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((f, i) => (
                <AccordionItem
                  key={f.q}
                  value={`f-${i}`}
                  className={cn("px-4", i === faqs.length - 1 && "border-b-0")}
                >
                  <AccordionTrigger className="text-left text-base font-medium">
                    {f.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground">
                    {f.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </Reveal>
      </section>

      <Footer />
    </div>
  );
}

function BadgeVisual({ size = "md" }: { size?: "md" | "lg" }) {
  const wrapper =
    size === "lg" ? "size-28" : "size-16";
  const inner = size === "lg" ? "size-20" : "size-12";
  return (
    <div
      className={cn(
        "relative flex items-center justify-center rounded-full",
        wrapper,
      )}
      style={{
        background:
          "conic-gradient(from 220deg, #12B76A, #6C5CE7, #12B76A)",
        boxShadow: "0 10px 30px -10px rgba(18,183,106,0.45)",
      }}
    >
      <div
        className={cn(
          "flex items-center justify-center rounded-full bg-surface",
          inner,
        )}
      >
        <BadgeCheck
          className={cn(
            "text-success",
            size === "lg" ? "size-10" : "size-7",
          )}
        />
      </div>
    </div>
  );
}

function ListingExample({
  tone,
  label,
  title,
  category,
  description,
  note,
}: {
  tone: "verified" | "community" | "sponsored";
  label: string;
  title: string;
  category: string;
  description: string;
  note: string;
}) {
  const chip =
    tone === "verified"
      ? "bg-success/15 text-success"
      : tone === "community"
        ? "bg-muted text-muted-foreground"
        : "bg-warning/15 text-warning-foreground";
  const Icon =
    tone === "verified" ? BadgeCheck : tone === "community" ? Tag : Megaphone;

  return (
    <div className="card-lift h-full rounded-3xl border border-border bg-surface p-6 shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <div className="inline-flex size-10 items-center justify-center rounded-2xl bg-accent text-primary font-display">
          {title.charAt(0)}
        </div>
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
            chip,
          )}
        >
          <Icon className="size-3.5" /> {label}
        </span>
      </div>
      <div className="mt-4 font-display text-lg">{title}</div>
      <div className="text-xs text-muted-foreground">{category}</div>
      <p className="mt-3 text-sm text-muted-foreground">{description}</p>
      <div className="mt-4 rounded-2xl border border-border bg-paper p-3 text-xs text-foreground/80">
        {note}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  error,
  placeholder,
  textarea,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  placeholder?: string;
  textarea?: boolean;
}) {
  const cls = cn(
    "mt-1.5 w-full rounded-xl border bg-surface px-3.5 py-2.5 text-sm shadow-soft outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20",
    error ? "border-destructive" : "border-border",
  );
  return (
    <label className="block text-sm">
      <span className="font-medium">{label}</span>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={4}
          className={cls}
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cls}
        />
      )}
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </label>
  );
}
