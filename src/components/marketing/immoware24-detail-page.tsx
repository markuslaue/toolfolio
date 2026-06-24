import { useState, useEffect, type FormEvent } from "react";
import immoware24Kontakt from "@/assets/immoware24-kontakt.webp.asset.json";
import immoware24Buchungen from "@/assets/immoware24-buchungen.png.asset.json";
import immoware24Zaehler from "@/assets/immoware24-ve-zaehler.png.asset.json";
import {
  ArrowRight,
  ChevronRight,
  Star,
  Info,
  ShieldCheck,
  Globe2,
  Building2,
  CheckCircle2,
  Banknote,
  Receipt,
  FileText,
  Mail,
  Sparkles,
  PhoneCall,
  Video,
  Scale,
  Lock,
  Server,
  ExternalLink,
  Tag,
  AlertTriangle,
  CalendarClock,
  X,
  Play,
  ImageIcon,
  Users,
  Wrench,
} from "lucide-react";
import { Nav, Footer, Reveal } from "./marketing-home";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const LABEL = "#3B82A8"; // ruhiges Blau für Immobilien
const EMERALD = "#12B76A";
const AMBER = "#F5A623";

const featureGroups: { group: string; icon: React.ComponentType<{ className?: string }>; items: { title: string; text: string }[] }[] = [
  {
    group: "Buchhaltung & Banking",
    icon: Banknote,
    items: [
      {
        title: "Online-Banking integriert",
        text: "SEPA-Zahlungsverkehr, EBICS-Anbindung und automatischer Kontoauszugsimport, direkt im Tool.",
      },
      {
        title: "GoBD-konforme Buchhaltung",
        text: "Sauber dokumentiert, prüfungsfest und revisionssicher abgelegt.",
      },
    ],
  },
  {
    group: "Abrechnungen",
    icon: Receipt,
    items: [
      {
        title: "Betriebskosten- und Heizkostenabrechnung",
        text: "Erstellung nach gesetzlichen Vorgaben, inklusive Verteilerschlüssel und Einzelnachweisen.",
      },
      {
        title: "Anwaltlich geprüfte Vorlagen",
        text: "Vorlagen für Schriftverkehr und Verträge, juristisch abgesichert.",
      },
    ],
  },
  {
    group: "Dokumente & Kommunikation",
    icon: FileText,
    items: [
      {
        title: "KI-gestütztes Dokumentenmanagement",
        text: "Dokumente werden automatisch erkannt, sortiert und den richtigen Objekten zugeordnet.",
      },
      {
        title: "Integrierter E-Mail-Client",
        text: "Schriftverkehr direkt aus der Software, ohne Wechsel ins Mailprogramm.",
      },
    ],
  },
  {
    group: "Portale & KI-Services",
    icon: Sparkles,
    items: [
      {
        title: "Portal24 für Mieter und Eigentümer",
        text: "Eigene Online-Bereiche für Mieter, Eigentümer und Beiräte mit Belegen, Nachrichten und Abrechnungen.",
      },
      {
        title: "KI-Anrufbeantworter",
        text: "Nimmt Anrufe entgegen, transkribiert Anliegen und legt Vorgänge automatisch an.",
      },
    ],
  },
  {
    group: "WEG & Versammlungen",
    icon: Video,
    items: [
      {
        title: "Online-Eigentümerversammlung",
        text: "Versammlungen digital durchführen, mit Abstimmungen, Protokoll und Teilnahme aus der Ferne.",
      },
      {
        title: "Beirat- und Eigentümer-Tools",
        text: "Dokumente und Beschlüsse strukturiert ablegen, Beirat einbinden, transparente Kommunikation.",
      },
    ],
  },
  {
    group: "Recht & Vorlagen",
    icon: Scale,
    items: [
      {
        title: "Juristische Vorlagen",
        text: "Geprüfte Muster für Mietverhältnisse, WEG-Beschlüsse und Eigentümerkorrespondenz.",
      },
      {
        title: "Fristen und Wiedervorlagen",
        text: "Wichtige Stichtage im Blick, mit Erinnerungen und Wiedervorlagen je Vorgang.",
      },
    ],
  },
];

const securityItems = [
  {
    icon: ShieldCheck,
    title: "ISO 27001 zertifiziert",
    text: "Deutsche Rechenzentren, zertifiziertes Informationssicherheits-Managementsystem.",
  },
  {
    icon: Server,
    title: "Georedundantes Hosting",
    text: "Cloudbasiert, ohne lokale Installation. Daten gespiegelt in deutschen Rechenzentren.",
  },
  {
    icon: Lock,
    title: "DSGVO-konform",
    text: "Mit Auftragsverarbeitungsvertrag, klarer Datenminimierung und dokumentierter Rechtsgrundlage.",
  },
];

const alternatives = [
  { name: "Domus 1000/4000", desc: "Etablierte Hausverwaltungssoftware mit langer Markthistorie.", origin: "DE" },
  { name: "Karthago 2000", desc: "Modulare Lösung für Miet- und WEG-Verwaltung.", origin: "DE" },
  { name: "Hausperfekt", desc: "Schlankere Lösung für kleinere Verwaltungen.", origin: "DE" },
  { name: "etg24", desc: "Online-Portal mit Fokus auf Eigentümer- und Mieterkommunikation.", origin: "DE" },
  { name: "Casavi", desc: "Digitale Plattform für Hausverwaltungen und Eigentümer.", origin: "DE" },
  { name: "Facilioo", desc: "Cloud-Hausverwaltung mit Fokus auf Prozesse.", origin: "DE" },
];

const faqs = [
  {
    q: "Was kostet Immoware24?",
    a: "Der Preis ist auf Anfrage und richtet sich nach Anzahl der Verwaltungseinheiten und gewünschten Modulen. Über das Anfrageformular oben holst du ein individuelles Angebot ein.",
  },
  {
    q: "Gibt es eine Testphase?",
    a: "Ja, du kannst Immoware24 30 Tage lang kostenlos testen.",
  },
  {
    q: "Für wen ist Immoware24 geeignet?",
    a: "Für professionelle Verwalter von Mietobjekten, WEG-Einheiten und Sondereigentum, vom kleinen Büro bis zur größeren Verwaltung.",
  },
  {
    q: "Wie sicher sind die Daten?",
    a: "Immoware24 ist ISO 27001 zertifiziert und hostet in deutschen Rechenzentren, georedundant und DSGVO-konform.",
  },
  {
    q: "Gibt es einen Rabatt über Toolfolio?",
    a: "In diesem Demo ist beispielhaft ein Code TF-IMMO10 mit 10 % hinterlegt. Echte Partnerschaften kennzeichnen wir transparent als Werbung. Aktuell handelt es sich nur um eine Veranschaulichung des Layouts.",
  },
];

const TRACKED_HREF = "/go/immoware24?utm_source=toolfolio&utm_medium=directory&utm_campaign=detail&partner=tf";

export function Immoware24DetailPage() {
  const [sent, setSent] = useState(false);
  const [units, setUnits] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [firma, setFirma] = useState("");
  const [anliegen, setAnliegen] = useState("");
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !firma.trim() || !units.trim() || !consent) {
      setError("Bitte fülle alle Pflichtfelder aus und bestätige die Datenschutz-Einwilligung.");
      return;
    }
    setError(null);
    setSent(true);
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mx-auto max-w-7xl px-4 sm:px-6 pt-6 text-sm text-foreground/70">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li><a href="/verzeichnis" className="hover:text-foreground">Verzeichnis</a></li>
          <li aria-hidden><ChevronRight className="size-3.5 opacity-50" /></li>
          <li><a href="/verzeichnis/branchen-fachsoftware" className="hover:text-foreground">Branchen- &amp; Fachsoftware</a></li>
          <li aria-hidden><ChevronRight className="size-3.5 opacity-50" /></li>
          <li><a href="/verzeichnis/branchen-fachsoftware/immobilienverwaltung" className="hover:text-foreground">Immobilienverwaltung</a></li>
          <li aria-hidden><ChevronRight className="size-3.5 opacity-50" /></li>
          <li aria-current="page" className="text-foreground font-medium">Immoware24</li>
        </ol>
      </nav>

      {/* Hero */}
      <header className="mx-auto max-w-7xl px-4 sm:px-6 pt-8 pb-12 sm:pt-12 sm:pb-16">
        <Reveal>
          <div className="rounded-3xl border border-border bg-card p-6 sm:p-10 shadow-soft">
            <div className="flex flex-col md:flex-row md:items-start gap-6 md:gap-8">
              <div
                className="flex size-20 sm:size-24 shrink-0 items-center justify-center rounded-2xl text-3xl sm:text-4xl font-display font-semibold text-primary-foreground"
                style={{ background: `linear-gradient(135deg, ${LABEL}, #2d6986)` }}
                aria-hidden
              >
                I
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
                    style={{ background: `${EMERALD}1A`, color: EMERALD }}
                  >
                    <ShieldCheck className="size-3.5" /> Etabliertes Tool
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/60 px-3 py-1 text-xs font-semibold text-foreground/70">
                    <Info className="size-3.5" /> Beispiel-Listing
                  </span>
                  <a href="/badge" className="text-xs text-foreground/60 underline underline-offset-2 hover:text-foreground">Was bedeutet das?</a>
                </div>

                <h1 className="mt-3 font-display text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight">
                  Immoware24, Software für die Immobilienverwaltung
                </h1>
                <p className="mt-3 max-w-2xl text-foreground/75 leading-relaxed">
                  Digitale All-in-One-Lösung für Miet-, WEG- und Sondereigentumsverwaltung. Cloudbasiert, mit integriertem Banking, GoBD-konformer Buchhaltung und KI-gestütztem Dokumentenmanagement.
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
                  <div className="flex items-center gap-1" aria-label="Bewertung 4,5 von 5 (Demo)">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`size-4 ${i < 4 ? "fill-[#F5A623] text-[#F5A623]" : "text-foreground/20"}`} />
                    ))}
                  </div>
                  <span className="tabular-nums font-medium">4,5</span>
                  <span className="text-foreground/60">(Demo-Platzhalter, keine echten Bewertungen)</span>
                </div>

                <dl className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  <div className="rounded-2xl border border-border bg-background/60 p-4">
                    <dt className="text-foreground/60 text-xs uppercase tracking-wide">Anbieter</dt>
                    <dd className="mt-1 font-medium">Immoware24 GmbH</dd>
                  </div>
                  <div className="rounded-2xl border border-border bg-background/60 p-4">
                    <dt className="text-foreground/60 text-xs uppercase tracking-wide">Sitz</dt>
                    <dd className="mt-1 font-medium inline-flex items-center gap-1.5">
                      <Globe2 className="size-4 text-foreground/60" /> Halle (Saale), Deutschland
                    </dd>
                  </div>
                  <div className="rounded-2xl border border-border bg-background/60 p-4">
                    <dt className="text-foreground/60 text-xs uppercase tracking-wide">Ab-Preis</dt>
                    <dd className="mt-1 font-display text-xl font-semibold tabular-nums">auf Anfrage</dd>
                  </div>
                </dl>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <a
                    href="#anfrage"
                    className="inline-flex items-center gap-1.5 rounded-2xl bg-primary text-primary-foreground px-5 py-3 text-sm font-semibold hover:opacity-90"
                  >
                    Angebot anfragen <ArrowRight className="size-4" />
                  </a>
                  <a
                    href={TRACKED_HREF}
                    rel="sponsored nofollow"
                    className="inline-flex items-center gap-1.5 rounded-2xl border border-border bg-card px-5 py-3 text-sm font-semibold hover:bg-muted"
                  >
                    Zum Anbieter <ExternalLink className="size-4" />
                  </a>
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold"
                    style={{ background: `${EMERALD}1A`, color: EMERALD }}
                  >
                    <Tag className="size-3.5" /> Exklusiv über Toolfolio: 10 % (Beispiel)
                  </span>
                </div>
                <p className="mt-2 text-xs text-foreground/55">
                  Hinweis: Klicks auf &quot;Zum Anbieter&quot; und Anfragen laufen über einen getrackten Redirect (UTM + Partner-ID). Demo-Andeutung, keine echte Tracking-Pipeline.
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </header>

      {/* USP – verifiziert durch echte Abrechnungsdaten */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-12">
        <Reveal>
          <div className="rounded-3xl border border-dashed border-border bg-muted/40 p-6 sm:p-8">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-1 size-5 shrink-0" style={{ color: AMBER }} />
              <div>
                <h2 className="font-display text-xl sm:text-2xl font-semibold">
                  Verifiziert durch echte Abrechnungsdaten
                </h2>
                <p className="mt-3 text-foreground/80 leading-relaxed">
                  Toolfolio verifiziert Preise und Nutzungsdaten, wo möglich, aus echten Abrechnungsdaten anonymisierter Kunden. Für Immoware24 ist das aktuell nicht möglich, weil der Anbieter individuelle Angebote macht und keine öffentlichen Preise ausweist.
                </p>
                <p className="mt-2 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold" style={{ background: `${AMBER}1A`, color: "#8a5b00" }}>
                  Datenzustand: Preis auf Anfrage, nicht verifiziert
                </p>
                <div className="mt-3">
                  <a href="/badge" className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
                    Methodik &amp; verifiziert-Badge <ArrowRight className="size-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Beschreibung */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 pb-16">
        <Reveal>
          <h2 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight">Was Immoware24 macht</h2>
        </Reveal>
        <div className="mt-5 space-y-4 text-foreground/80 leading-relaxed text-[15px]">
          <Reveal><p>Immoware24 ist eine cloudbasierte Komplettlösung für professionelle Immobilienverwalter. Das Tool folgt dem Prinzip &quot;Alles aus einer Hand&quot; und deckt Miet-, WEG- und Sondereigentumsverwaltung in einer Oberfläche ab.</p></Reveal>
          <Reveal delay={40}><p>Im Kern stehen integriertes Online-Banking mit SEPA und EBICS, GoBD-konforme Buchhaltung sowie Betriebs- und Heizkostenabrechnungen. Ergänzt wird das durch ein KI-gestütztes Dokumentenmanagement, einen integrierten E-Mail-Client und das Portal24 für Mieter, Eigentümer und Beiräte.</p></Reveal>
          <Reveal delay={80}><p>Da Immoware24 vollständig in der Cloud läuft, ist keine lokale Installation nötig. Daten werden in deutschen, ISO 27001 zertifizierten Rechenzentren gespeichert. Neu hinzugekommen sind KI-Funktionen wie der KI-Anrufbeantworter und Tools für die Online-Eigentümerversammlung.</p></Reveal>
        </div>
      </section>

      {/* Preise – auf Anfrage */}
      <section id="preise" className="mx-auto max-w-7xl px-4 sm:px-6 pb-16">
        <Reveal>
          <h2 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight">Preise</h2>
          <p className="mt-2 text-sm text-foreground/60">Offizielle Anbieterangabe: individuell nach Verwaltungseinheiten. Aktuell nicht aus Abrechnungsdaten verifiziert.</p>
        </Reveal>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-5">
          <Reveal>
            <div className="rounded-3xl border border-border bg-card p-6 sm:p-7 shadow-soft">
              <div className="font-display text-lg font-semibold">Preis auf Anfrage</div>
              <div className="mt-3 flex items-baseline gap-1.5">
                <span className="font-display text-3xl font-semibold tabular-nums">individuell</span>
                <span className="text-sm text-foreground/60">nach Einheiten</span>
              </div>
              <p className="mt-3 text-sm text-foreground/70 leading-relaxed">
                Immoware24 erstellt individuelle Angebote abhängig von Anzahl der Verwaltungseinheiten, gewünschten Modulen und Teamgröße. Wir veröffentlichen keine erfundenen Preise.
              </p>
              <ul className="mt-4 space-y-2 text-sm">
                <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 size-4 shrink-0" style={{ color: EMERALD }} /><span className="text-foreground/85">30 Tage kostenlos testen</span></li>
                <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 size-4 shrink-0" style={{ color: EMERALD }} /><span className="text-foreground/85">Skalierung mit Verwaltungseinheiten</span></li>
                <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 size-4 shrink-0" style={{ color: EMERALD }} /><span className="text-foreground/85">Module zubuchbar</span></li>
              </ul>
            </div>
          </Reveal>
          <Reveal delay={60}>
            <div className="rounded-3xl border p-6 sm:p-7 shadow-soft" style={{ borderColor: EMERALD, background: `${EMERALD}0D` }}>
              <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold" style={{ background: `${EMERALD}1A`, color: EMERALD }}>
                <Tag className="size-3.5" /> Beispiel-Partnerschaft
              </span>
              <h3 className="mt-3 font-display text-xl font-semibold">Angebot mit Toolfolio-Bonus einholen</h3>
              <p className="mt-2 text-sm text-foreground/75 leading-relaxed">
                Über das Anfrageformular unten kannst du dir ein individuelles Angebot bei Immoware24 abholen. In diesem Demo erhältst du beispielhaft den Code TF-IMMO10 für 10 % Rabatt eingeblendet. Echte Partnerschaften kennzeichnen wir transparent als Werbung.
              </p>
              <a href="#anfrage" className="mt-4 inline-flex items-center gap-1.5 rounded-2xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90">
                Zum Anfrageformular <ArrowRight className="size-4" />
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Anfrageformular + Rabatt */}
      <section id="anfrage" className="mx-auto max-w-7xl px-4 sm:px-6 pb-16">
        <Reveal>
          <div className="rounded-3xl border border-border bg-card p-6 sm:p-10 shadow-soft">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold" style={{ background: `${EMERALD}1A`, color: EMERALD }}>
                <Tag className="size-3.5" /> Werbung &middot; Beispiel-Partnerschaft
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/60 px-3 py-1 text-xs font-semibold text-foreground/70">
                <Info className="size-3.5" /> Demo-Code, keine echte Buchung
              </span>
            </div>
            <h2 className="mt-4 font-display text-2xl sm:text-3xl font-semibold tracking-tight">
              Angebot anfragen &amp; exklusiver Rabatt
            </h2>
            <p className="mt-2 max-w-2xl text-foreground/70">
              Da Immoware24 individuell anbietet, ist die Anfrage der schnellste Weg zu einem konkreten Preis. Mit Absenden erhältst du den Beispiel-Code TF-IMMO10. Die Anfrage geht im Demo an den Anbieter (A-03).
            </p>

            {sent ? (
              <div className="mt-8 rounded-3xl border p-6 sm:p-8" style={{ borderColor: EMERALD, background: `${EMERALD}0D` }}>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-1 size-6 shrink-0" style={{ color: EMERALD }} />
                  <div>
                    <h3 className="font-display text-xl font-semibold">Danke für deine Anfrage</h3>
                    <p className="mt-2 text-foreground/80 leading-relaxed">
                      Im Demo geht die Anfrage an Immoware24. Du würdest dort ein individuelles Angebot bekommen.
                    </p>
                    <div className="mt-4 rounded-2xl border border-dashed border-border bg-background p-4">
                      <div className="text-xs font-semibold uppercase tracking-wide text-foreground/55">Dein Beispiel-Code (Demo)</div>
                      <div className="mt-1 flex items-baseline gap-3">
                        <code className="font-display text-2xl font-semibold tracking-wide" style={{ color: EMERALD }}>TF-IMMO10</code>
                        <span className="text-sm text-foreground/70">10 % &middot; nur zur Veranschaulichung</span>
                      </div>
                    </div>
                    <p className="mt-3 text-xs text-foreground/55">
                      Hinweis: In echt würde Toolfolio Anfragen über einen getrackten Redirect (UTM + Partner-ID) abwickeln. Provision kann anteilig in den Rabatt fließen.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={submit} className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex flex-col gap-1.5 text-sm">
                  <span className="font-medium">Name <span className="text-foreground/40">*</span></span>
                  <input value={name} onChange={(e) => setName(e.target.value)} className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" placeholder="Vor- und Nachname" />
                </label>
                <label className="flex flex-col gap-1.5 text-sm">
                  <span className="font-medium">Geschäftliche E-Mail <span className="text-foreground/40">*</span></span>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" placeholder="name@firma.de" />
                </label>
                <label className="flex flex-col gap-1.5 text-sm">
                  <span className="font-medium">Firma <span className="text-foreground/40">*</span></span>
                  <input value={firma} onChange={(e) => setFirma(e.target.value)} className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" placeholder="Verwaltungsname GmbH" />
                </label>
                <label className="flex flex-col gap-1.5 text-sm">
                  <span className="font-medium inline-flex items-center gap-1.5">
                    <Building2 className="size-4 text-foreground/60" /> Anzahl Verwaltungseinheiten <span className="text-foreground/40">*</span>
                  </span>
                  <select value={units} onChange={(e) => setUnits(e.target.value)} className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40">
                    <option value="">Bitte wählen</option>
                    <option value="bis-100">bis 100</option>
                    <option value="100-500">100 bis 500</option>
                    <option value="500-1500">500 bis 1.500</option>
                    <option value="1500-5000">1.500 bis 5.000</option>
                    <option value="ueber-5000">über 5.000</option>
                  </select>
                </label>
                <label className="md:col-span-2 flex flex-col gap-1.5 text-sm">
                  <span className="font-medium">Anliegen</span>
                  <textarea value={anliegen} onChange={(e) => setAnliegen(e.target.value)} rows={4} className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" placeholder="Was möchtest du im Angebot berücksichtigt sehen? (Module, Migration, Schulung, ...)" />
                </label>
                <label className="md:col-span-2 flex items-start gap-2.5 text-sm text-foreground/80">
                  <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1 size-4" />
                  <span>
                    Ich willige ein, dass meine Angaben an Immoware24 (eigener Verantwortlicher) zur Bearbeitung meiner Anfrage übermittelt werden. Mehr dazu in der <a href="/datenschutz" className="text-primary underline">Datenschutz-Information (R-02)</a>. <span className="text-foreground/40">*</span>
                  </span>
                </label>
                {error && (
                  <div className="md:col-span-2 rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">{error}</div>
                )}
                <div className="md:col-span-2 flex flex-wrap items-center gap-3">
                  <button type="submit" className="inline-flex items-center gap-1.5 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90">
                    Anfrage absenden <ArrowRight className="size-4" />
                  </button>
                  <span className="text-xs text-foreground/55 inline-flex items-center gap-1.5">
                    <Mail className="size-3.5" /> Mock-Übermittlung, kein echter Versand
                  </span>
                </div>
              </form>
            )}
          </div>
        </Reveal>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl px-4 sm:px-6 pb-16">
        <Reveal>
          <h2 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight">Funktionen</h2>
          <p className="mt-2 max-w-2xl text-foreground/70">Gruppiert nach Nutzen, mit den Fakten aus der öffentlichen Anbieter-Information.</p>
        </Reveal>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-5">
          {featureGroups.map((g, i) => {
            const Icon = g.icon;
            return (
              <Reveal key={g.group} delay={i * 50}>
                <div className="h-full rounded-3xl border border-border bg-card p-6 sm:p-7 shadow-soft">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-xl" style={{ background: `${LABEL}1A`, color: LABEL }}>
                      <Icon className="size-5" />
                    </div>
                    <h3 className="font-display text-lg font-semibold">{g.group}</h3>
                  </div>
                  <ul className="mt-5 space-y-4">
                    {g.items.map((it) => (
                      <li key={it.title}>
                        <div className="font-medium">{it.title}</div>
                        <p className="mt-1 text-sm text-foreground/70 leading-relaxed">{it.text}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            );
          })}
        </div>
        <div className="mt-4 text-xs text-foreground/55 inline-flex items-center gap-1.5">
          <PhoneCall className="size-3.5" /> Zusätzliche KI-Funktionen wie der KI-Anrufbeantworter werden vom Anbieter laufend erweitert.
        </div>
      </section>

      {/* Bewertungen */}
      <section id="bewertungen" className="mx-auto max-w-7xl px-4 sm:px-6 pb-16">
        <Reveal>
          <h2 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight">Bewertungen</h2>
          <p className="mt-2 max-w-2xl text-foreground/70">
            Demo-Platzhalter, keine echten namentlichen Kundenstimmen der Marke. Bewertungen sind nicht käuflich, das verifiziert-Siegel-Konzept erklären wir in der Bewertungs-Vorlage.
          </p>
        </Reveal>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <Reveal key={i} delay={i * 60}>
              <div className="h-full rounded-3xl border border-dashed border-border bg-card p-6 shadow-soft">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, k) => (
                    <Star key={k} className={`size-4 ${k < 4 ? "fill-[#F5A623] text-[#F5A623]" : "text-foreground/20"}`} />
                  ))}
                </div>
                <p className="mt-3 text-sm text-foreground/80 leading-relaxed">
                  Platzhalter-Bewertung Nr. {i}. Hier erscheinen echte Erfahrungen, sobald sie freigegeben sind. Keine erfundenen Personen, keine gekauften Sterne.
                </p>
                <div className="mt-4 text-xs text-foreground/55">Platzhalter &middot; Beispiel-Rolle</div>
              </div>
            </Reveal>
          ))}
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <a href="/verzeichnis/bewerten?tool=immoware24&name=Immoware24" className="inline-flex items-center gap-1.5 rounded-2xl border border-border bg-card px-4 py-2.5 text-sm font-semibold hover:bg-muted">
            Bewertung abgeben <ArrowRight className="size-4" />
          </a>
          <span className="text-xs text-foreground/55">Bewertungen sind nicht käuflich. Verifiziert-Siegel über echte Abrechnungsdaten.</span>
        </div>
      </section>

      {/* Sicherheit & Vertragsdaten */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-16">
        <Reveal>
          <h2 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight">Sicherheit &amp; Vertragsdaten</h2>
        </Reveal>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-5">
          {securityItems.map((s, i) => {
            const Icon = s.icon;
            return (
              <Reveal key={s.title} delay={i * 60}>
                <div className="h-full rounded-3xl border border-border bg-card p-6 shadow-soft">
                  <div className="flex size-11 items-center justify-center rounded-2xl" style={{ background: `${LABEL}1A`, color: LABEL }}>
                    <Icon className="size-5" />
                  </div>
                  <h3 className="mt-4 font-display text-lg font-semibold">{s.title}</h3>
                  <p className="mt-2 text-sm text-foreground/70 leading-relaxed">{s.text}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
        <Reveal delay={120}>
          <div className="mt-6 rounded-3xl border border-border bg-card p-6 shadow-soft">
            <div className="flex items-start gap-3">
              <CalendarClock className="mt-1 size-5 shrink-0 text-foreground/70" />
              <div>
                <h3 className="font-display text-lg font-semibold">Vertrag &amp; Test</h3>
                <p className="mt-2 text-sm text-foreground/75 leading-relaxed">
                  30 Tage kostenlos testen, danach Vertrag nach Vereinbarung. Mit dem Fristen-Wächter in Toolfolio behältst du Kündigungsfristen und Verlängerungen automatisch im Blick.
                </p>
                <a href="/fristen" className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
                  Im Tracker beobachten <ArrowRight className="size-3.5" />
                </a>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Alternativen */}
      <section id="alternativen" className="mx-auto max-w-7xl px-4 sm:px-6 pb-16">
        <Reveal>
          <h2 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight">Alternativen</h2>
          <p className="mt-2 max-w-2xl text-foreground/70">Auswahl bekannter Lösungen in der Kategorie Immobilienverwaltung, inklusive schlankerer und günstigerer Optionen.</p>
        </Reveal>
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {alternatives.map((a, i) => (
            <Reveal key={a.name} delay={i * 50}>
              <a
                href={`/verzeichnis/${a.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-erfahrung`}
                className="block h-full rounded-3xl border border-border bg-card p-6 shadow-soft hover:-translate-y-0.5 transition"
              >
                <div className="flex items-center justify-between">
                  <div className="font-display text-lg font-semibold">{a.name}</div>
                  <span className="text-xs text-foreground/55 rounded-full border border-border px-2 py-0.5">{a.origin}</span>
                </div>
                <p className="mt-2 text-sm text-foreground/70 leading-relaxed">{a.desc}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary">Profil ansehen <ArrowRight className="size-3.5" /></span>
              </a>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Schwungrad-Brücke */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-16">
        <Reveal>
          <div className="rounded-3xl border border-border bg-card p-8 sm:p-12 shadow-soft" style={{ background: `linear-gradient(135deg, ${LABEL}14, transparent 60%)` }}>
            <h2 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight max-w-2xl">
              Du verwaltest Immobilien mit Immoware24? Behalte mit Toolfolio Kosten und Kündigungsfrist im Blick.
            </h2>
            <p className="mt-3 max-w-2xl text-foreground/75">Alle Software-Abos deiner Verwaltung an einem Ort, Fristen-Wächter inklusive. Kostenlos starten.</p>
            <a href="/preise" className="mt-5 inline-flex items-center gap-1.5 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90">
              Kostenlos starten <ArrowRight className="size-4" />
            </a>
          </div>
        </Reveal>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-4xl px-4 sm:px-6 pb-20">
        <Reveal>
          <h2 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight">FAQ</h2>
        </Reveal>
        <Reveal delay={60}>
          <Accordion type="single" collapsible className="mt-6 rounded-3xl border border-border bg-card px-6 shadow-soft">
            {faqs.map((f, i) => (
              <AccordionItem key={f.q} value={`f-${i}`}>
                <AccordionTrigger className="font-medium">{f.q}</AccordionTrigger>
                <AccordionContent className="text-foreground/75 leading-relaxed">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </section>

      <Footer />
    </div>
  );
}
