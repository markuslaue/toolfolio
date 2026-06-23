import { useMemo, useState } from "react";
import {
  Search,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  ChevronRight,
  FileSignature,
  PenTool,
  Brain,
  BellRing,
  FolderLock,
  Scale,
  Clock,
  Cpu,
  Globe2,
  Plug,
  Users,
  Tag,
  CheckCircle2,
  Layers,
} from "lucide-react";
import { Nav, Footer, Reveal } from "./marketing-home";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export type ClusterSubcategory = {
  slug: string;
  name: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  toolCount: number;
};

export type ClusterTool = {
  slug: string;
  name: string;
  desc: string;
  price: string; // e.g. "ab 19,00 € pro Nutzer"
  priceNote?: string; // e.g. "[verifizieren]"
  verified?: boolean;
  badge?: string; // e.g. "DACH-Fokus"
};

export type ClusterCriterion = {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  text: string;
};

export type ClusterCollection = {
  title: string;
  desc: string;
  tag: string;
  href: string;
};

export type ClusterFaq = { q: string; a: string };

export type ClusterData = {
  slug: string;
  name: string; // "Vertragsmanagement-Software"
  h1: string;
  subline: string;
  color: string; // hex
  introParagraphs: string[];
  subcategories: ClusterSubcategory[];
  tools: ClusterTool[];
  criteria: ClusterCriterion[];
  collections: ClusterCollection[];
  faqs: ClusterFaq[];
  trackerBridge: { headline: string; text: string };
};

export const vertragsmanagementCluster: ClusterData = {
  slug: "vertragsmanagement-software",
  name: "Vertragsmanagement-Software",
  h1: "Vertragsmanagement-Software im Vergleich",
  subline:
    "Finde die passende Lösung für Erstellung, Signatur, Fristen und Archivierung deiner Verträge. Neutral verglichen, mit Fokus auf DACH.",
  color: "#6C5CE7",
  introParagraphs: [
    "Vertragsmanagement-Software bündelt alle Schritte rund um deine Verträge an einem Ort. Statt verstreuter PDFs in Mail-Postfächern, geteilten Laufwerken und Excel-Tabellen verwaltest du Erstellung, Verhandlung, Signatur, Fristen und Archivierung in einem System. Damit verlierst du weder Überblick noch Geld an stillen Verlängerungen.",
    "Der häufigste Schmerz: verpasste Kündigungsfristen und automatische Verlängerungen, die Jahr für Jahr Budget binden. Eine gute Lösung erinnert dich rechtzeitig, zeigt offene Aufgaben transparent und macht Verantwortlichkeiten klar. So werden aus dem reinen Ablagesystem aktiv gesteuerte Verträge.",
    "Im Kern deckt Vertragsmanagement-Software den vollständigen Vertragslebenszyklus ab: Erstellung mit Vorlagen und Klauselbibliotheken, kollaborative Verhandlung, rechtssichere Signatur (zum Beispiel als QES nach eIDAS), zentrale Verwaltung mit Fristen- und Erinnerungsfunktion sowie revisionssichere Archivierung. Manche Tools ergänzen das um KI-gestützte Vertragsanalyse, um Risiken, Klauseln und Pflichten automatisch zu erkennen.",
  ],
  subcategories: [
    {
      slug: "vertragsmanagement",
      name: "Vertragsmanagement / CLM",
      desc: "Plattformen für den gesamten Contract Lifecycle: Vorlagen, Workflows, Fristen, Archiv.",
      icon: Layers,
      toolCount: 12,
    },
    {
      slug: "e-signatur",
      name: "E-Signatur (SES, AES, QES)",
      desc: "Dienste für rechtssichere elektronische Signaturen in allen drei eIDAS-Stufen.",
      icon: FileSignature,
      toolCount: 9,
    },
    {
      slug: "ki-vertragsanalyse",
      name: "KI-Vertragsanalyse",
      desc: "Klauseln, Risiken und Pflichten in Verträgen automatisch erkennen und auswerten.",
      icon: Brain,
      toolCount: 7,
    },
    {
      slug: "fristen-erinnerungen",
      name: "Fristen- und Erinnerungsmanagement",
      desc: "Wiedervorlagen, Kündigungsfristen und Verantwortlichkeiten zuverlässig im Blick.",
      icon: BellRing,
      toolCount: 6,
    },
    {
      slug: "dms",
      name: "Dokumentenmanagement (DMS)",
      desc: "Revisionssichere Ablage und Versionierung aller dokumentenbasierten Prozesse.",
      icon: FolderLock,
      toolCount: 11,
    },
    {
      slug: "legal-dms",
      name: "Legal Document Management",
      desc: "Branchen- und rechtsnahe Lösungen für Kanzleien und juristische Teams.",
      icon: Scale,
      toolCount: 5,
    },
  ],
  tools: [
    {
      slug: "fynk",
      name: "fynk",
      desc: "Moderne CLM-Plattform mit KI-Analyse, Vorlagen und Fristenmanagement, Fokus auf einfache Bedienung.",
      price: "ab 19,00 € pro Nutzer",
      priceNote: "[verifizieren]",
      verified: true,
    },
    {
      slug: "inhubber",
      name: "Inhubber",
      desc: "Vertragsmanagement mit KI-Auslesung, Fristen-Tracking und Berichten, mit klarem DACH-Fokus.",
      price: "ab 14,99 € pro Nutzer",
      priceNote: "[verifizieren]",
      verified: true,
      badge: "DACH-Fokus",
    },
    {
      slug: "contracthero",
      name: "ContractHero",
      desc: "CLM für Mittelstand und KMU mit Workflows, E-Signatur-Integration und Reporting.",
      price: "Preis auf Anfrage",
      priceNote: "[verifizieren]",
    },
    {
      slug: "paperless",
      name: "Paperless",
      desc: "Digitale Vertragsabwicklung mit E-Signatur und Vorlagen, Fokus auf schnelle Abschlüsse.",
      price: "ab 149,00 € pro Monat",
      priceNote: "[verifizieren]",
    },
    {
      slug: "skribble",
      name: "Skribble",
      desc: "Schweizer Signaturdienst mit SES, AES und QES nach eIDAS und ZertES.",
      price: "ab 9,00 € pro Nutzer",
      priceNote: "[verifizieren]",
      verified: true,
      badge: "QES",
    },
    {
      slug: "agorum-core",
      name: "agorum core",
      desc: "DMS- und ECM-Plattform aus Deutschland, ausbaubar zum vollwertigen Vertragsmanagement.",
      price: "ab 30,00 € pro Nutzer",
      priceNote: "[verifizieren]",
      badge: "Made in Germany",
    },
    {
      slug: "otris-software",
      name: "otris software",
      desc: "Enterprise-Lösung für Vertragsmanagement und Legal Operations mit Workflow-Modulen.",
      price: "Preis auf Anfrage",
      priceNote: "[verifizieren]",
    },
    {
      slug: "contractbook",
      name: "Contractbook",
      desc: "CLM mit Automationen, Vorlagen und Integrationen, internationaler Anbieter.",
      price: "Preis auf Anfrage",
      priceNote: "[verifizieren]",
    },
    {
      slug: "dilitrust-suite",
      name: "DiliTrust Suite",
      desc: "Modulare Legal-Tech-Suite für Vertrags-, Gesellschafts- und Compliance-Themen.",
      price: "Preis auf Anfrage",
      priceNote: "[verifizieren]",
    },
  ],
  criteria: [
    {
      icon: BellRing,
      title: "Fristen und Erinnerungen",
      text: "Automatische Wiedervorlagen für Kündigungsfristen und Verlängerungen, mit klaren Verantwortlichkeiten.",
    },
    {
      icon: FileSignature,
      title: "E-Signatur-Stufen",
      text: "SES, AES und QES sinnvoll unterscheiden. Für hohe Rechtssicherheit ist die QES nach eIDAS oft Pflicht.",
    },
    {
      icon: Brain,
      title: "KI-Vertragsanalyse",
      text: "Automatisches Auslesen von Klauseln, Laufzeiten und Pflichten spart bei großen Vertragsbeständen viel Zeit.",
    },
    {
      icon: Globe2,
      title: "DACH-Hosting und ISO 27001",
      text: "Hosting in der EU oder DACH und anerkannte Standards wie ISO 27001 sind für Datenschutz und Compliance entscheidend.",
    },
    {
      icon: Plug,
      title: "Integrationen",
      text: "Anbindung an ERP, DMS, CRM oder Buchhaltung verhindert Insellösungen und doppelte Datenpflege.",
    },
    {
      icon: Users,
      title: "Eignung nach Unternehmensgröße",
      text: "KMU brauchen schnelle Einführung und faire Preise, Konzerne komplexere Workflows und Rollen.",
    },
    {
      icon: Tag,
      title: "Preis und Testmöglichkeit",
      text: "Achte auf transparente Preise pro Nutzer oder Modul, kostenlose Tests und planbare Skalierung.",
    },
    {
      icon: ShieldCheck,
      title: "Sicherheit und Berechtigungen",
      text: "Feingranulare Rollen, Audit-Logs und Verschlüsselung schützen sensible Vertragsdaten zuverlässig.",
    },
  ],
  collections: [
    {
      title: "Vertragsmanagement für KMU",
      desc: "Schlanke Tools mit fairen Preisen und schneller Einführung, ideal für 10 bis 200 Mitarbeitende.",
      tag: "KMU",
      href: "/verzeichnis#collection-clm-kmu",
    },
    {
      title: "Tools mit QES",
      desc: "Lösungen, die qualifizierte elektronische Signaturen nach eIDAS unterstützen.",
      tag: "Rechtssicher",
      href: "/verzeichnis#collection-qes",
    },
    {
      title: "Günstige Einsteiger",
      desc: "Bezahlbare CLM- und Signaturlösungen für kleine Teams und Freelancer.",
      tag: "Spar-Tipp",
      href: "/verzeichnis#collection-clm-guenstig",
    },
    {
      title: "DACH-Hosting bevorzugt",
      desc: "Anbieter mit Hosting in Deutschland, Österreich oder der Schweiz.",
      tag: "DACH",
      href: "/verzeichnis#collection-dach",
    },
  ],
  faqs: [
    {
      q: "Was kostet Vertragsmanagement-Software?",
      a: "Die Preise reichen je nach Funktionsumfang von rund 10 € pro Nutzer und Monat bis weit in den dreistelligen Bereich für Enterprise-Suiten. Viele Anbieter rechnen pro Nutzer ab, andere paketieren nach Vertragsvolumen oder Modulen. Plane neben dem Lizenzpreis auch Aufwände für Einführung und Schulung ein.",
    },
    {
      q: "Welche Software eignet sich für kleine Unternehmen?",
      a: "Für kleine Teams sind Lösungen mit schneller Einrichtung, klarer Bedienung und nutzungsbasierten Preisen sinnvoll. Tools wie fynk, Inhubber oder ContractHero sind explizit auf KMU zugeschnitten, bieten Fristenmanagement und E-Signatur und lassen sich oft in wenigen Tagen produktiv nutzen.",
    },
    {
      q: "Was bedeutet QES?",
      a: "QES steht für qualifizierte elektronische Signatur nach eIDAS. Sie ist der handschriftlichen Unterschrift rechtlich gleichgestellt und immer dann sinnvoll, wenn das Schriftformerfordernis erfüllt werden muss, etwa bei bestimmten Arbeitsverträgen oder Bürgschaften. SES und AES sind einfachere Stufen mit geringerer Beweiskraft.",
    },
    {
      q: "Brauche ich DACH-Hosting?",
      a: "Wenn du personenbezogene oder sensible Vertragsdaten verarbeitest, ist Hosting in der EU oder im DACH-Raum für Datenschutz und Compliance ein deutlicher Vorteil. Achte zusätzlich auf Auftragsverarbeitungsverträge, anerkannte Zertifizierungen wie ISO 27001 und klare Aussagen zu Subunternehmern.",
    },
    {
      q: "Worin unterscheiden sich CLM und DMS?",
      a: "Ein Dokumentenmanagementsystem (DMS) verwaltet generell Dokumente: Ablage, Versionierung, Suche und Berechtigungen. Eine CLM-Lösung ist auf Verträge spezialisiert und deckt zusätzlich Vertragslebenszyklus, Fristen, Signatur, Klauselbibliotheken und oft KI-Analyse ab. CLM und DMS ergänzen sich häufig.",
    },
  ],
  trackerBridge: {
    headline: "Verträge im Griff? Behalte auch deine Software-Abos im Blick.",
    text: "Toolfolio bündelt Verträge, Abos, Kündigungsfristen und Kosten an einem Ort. Der Fristen-Wächter erinnert dich rechtzeitig vor stillen Verlängerungen.",
  },
};

export function ClusterHubPage({ cluster }: { cluster: ClusterData }) {
  const [query, setQuery] = useState("");

  const filteredTools = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return cluster.tools;
    return cluster.tools.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.desc.toLowerCase().includes(q) ||
        (t.badge?.toLowerCase().includes(q) ?? false),
    );
  }, [query, cluster.tools]);

  return (
    <div id="top" className="min-h-screen bg-[color:var(--paper)] text-foreground">
      <Nav />

      {/* Breadcrumb */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-6">
        <nav aria-label="Brotkrumen" className="text-sm text-foreground/60">
          <ol className="flex items-center gap-1.5 flex-wrap">
            <li>
              <a href="/verzeichnis" className="hover:text-foreground">Verzeichnis</a>
            </li>
            <li aria-hidden>
              <ChevronRight className="size-3.5" />
            </li>
            <li className="text-foreground font-medium">{cluster.name}</li>
          </ol>
        </nav>
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 -z-10 opacity-70"
          style={{
            background: `radial-gradient(55% 45% at 15% 10%, ${cluster.color}22, transparent 60%), radial-gradient(40% 35% at 85% 15%, rgba(255,122,102,0.14), transparent 60%)`,
          }}
        />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-10 pb-14 sm:pt-14 sm:pb-20">
          <Reveal>
            <span
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold uppercase tracking-wide shadow-soft"
              style={{ color: cluster.color }}
            >
              <Sparkles className="size-3.5" />
              Cluster im Verzeichnis
            </span>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="mt-5 font-display text-4xl sm:text-5xl md:text-6xl font-semibold leading-[1.05] tracking-tight max-w-4xl">
              {cluster.h1}
            </h1>
          </Reveal>
          <Reveal delay={140}>
            <p className="mt-5 max-w-2xl text-lg text-foreground/70">{cluster.subline}</p>
          </Reveal>
          <Reveal delay={180}>
            <div className="mt-5 flex flex-wrap gap-4 text-sm text-foreground/70">
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2 rounded-full" style={{ background: cluster.color }} aria-hidden />
                {cluster.tools.length} Tools gelistet
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-foreground/40" aria-hidden />
                {cluster.subcategories.length} Unterkategorien
              </span>
            </div>
          </Reveal>

          {/* Search within cluster */}
          <Reveal delay={220}>
            <div className="mt-8 max-w-2xl">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-foreground/50" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={`In ${cluster.name} suchen, z. B. QES, KI, KMU`}
                  className="w-full rounded-2xl border border-border bg-card pl-12 pr-4 py-4 text-base shadow-lift focus:outline-none focus:ring-2 focus:ring-primary/40"
                  aria-label={`In ${cluster.name} suchen`}
                />
              </div>
              {query && (
                <p className="mt-2 text-sm text-foreground/60">
                  {filteredTools.length} {filteredTools.length === 1 ? "Treffer" : "Treffer"} im Cluster.
                </p>
              )}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Intro */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-16 sm:pb-20">
        <Reveal>
          <div className="grid lg:grid-cols-[1fr_320px] gap-10">
            <div>
              <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight">
                Was ist {cluster.name}?
              </h2>
              <div className="mt-5 space-y-4 text-foreground/80 leading-relaxed max-w-3xl">
                {cluster.introParagraphs.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </div>
            <aside className="rounded-3xl border border-border bg-card p-6 shadow-soft h-fit">
              <div className="text-xs font-semibold uppercase tracking-wide text-foreground/60">
                Auf einen Blick
              </div>
              <ul className="mt-4 space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <Clock className="size-4 mt-0.5 shrink-0" style={{ color: cluster.color }} />
                  <span>Vollständiger Vertragslebenszyklus von Entwurf bis Archiv</span>
                </li>
                <li className="flex items-start gap-2">
                  <FileSignature className="size-4 mt-0.5 shrink-0" style={{ color: cluster.color }} />
                  <span>E-Signatur in den Stufen SES, AES und QES nach eIDAS</span>
                </li>
                <li className="flex items-start gap-2">
                  <Cpu className="size-4 mt-0.5 shrink-0" style={{ color: cluster.color }} />
                  <span>Optional KI-gestützte Vertragsanalyse</span>
                </li>
                <li className="flex items-start gap-2">
                  <Globe2 className="size-4 mt-0.5 shrink-0" style={{ color: cluster.color }} />
                  <span>DACH-Hosting und Compliance als Auswahlkriterium</span>
                </li>
              </ul>
            </aside>
          </div>
        </Reveal>
      </section>

      {/* Subcategories */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-16 sm:pb-20">
        <Reveal>
          <div className="flex items-end justify-between gap-6 flex-wrap">
            <div>
              <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight">
                Unterkategorien
              </h2>
              <p className="mt-2 text-foreground/70 max-w-2xl">
                Verzweige in die passende Kategorie. Jede Unterkategorie zeigt Tools, Filter und Vergleiche im Detail.
              </p>
            </div>
          </div>
        </Reveal>
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {cluster.subcategories.map((s, i) => {
            const Icon = s.icon;
            return (
              <Reveal key={s.slug} delay={i * 40}>
                <a
                  href={`/verzeichnis/${cluster.slug}/${s.slug}`}
                  className="group block rounded-3xl border border-border bg-card p-6 shadow-soft hover:shadow-lift hover:-translate-y-0.5 transition-all h-full"
                  style={{ borderTop: `4px solid ${cluster.color}` }}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="grid size-11 place-items-center rounded-2xl"
                      style={{ background: `${cluster.color}1A`, color: cluster.color }}
                    >
                      <Icon className="size-5" />
                    </span>
                    <div>
                      <div className="font-display text-lg font-semibold">{s.name}</div>
                      <div className="text-xs text-foreground/60">{s.toolCount} Tools</div>
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-foreground/70">{s.desc}</p>
                  <div className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    Kategorie öffnen <ArrowRight className="size-4" />
                  </div>
                </a>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* Top Tools */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-16 sm:pb-20">
        <Reveal>
          <div className="flex items-end justify-between gap-6 flex-wrap">
            <div>
              <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight">
                Top-Tools im Cluster
              </h2>
              <p className="mt-2 text-foreground/70 max-w-2xl">
                Eine neutrale Auswahl bekannter Lösungen. Reihenfolge ohne bezahlte Platzierung. Preise als Mock, vor Veröffentlichung verifizieren.
              </p>
            </div>
          </div>
        </Reveal>
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTools.map((t, i) => (
            <Reveal key={t.slug} delay={i * 30}>
              <a
                href={`/verzeichnis/${cluster.slug}/tool/${t.slug}`}
                className="group block rounded-3xl border border-border bg-card p-6 shadow-soft hover:shadow-lift hover:-translate-y-0.5 transition-all h-full"
              >
                <div className="flex items-start justify-between gap-3">
                  <span
                    className="grid size-12 place-items-center rounded-2xl font-display text-lg font-semibold shrink-0"
                    style={{ background: `${cluster.color}1A`, color: cluster.color }}
                    aria-hidden
                  >
                    {t.name.charAt(0)}
                  </span>
                  <div className="flex flex-wrap justify-end gap-1.5">
                    {t.verified && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[color:var(--success)]/15 text-[color:var(--success)] px-2 py-1 text-xs font-semibold">
                        <ShieldCheck className="size-3.5" />
                        Verifiziert
                      </span>
                    )}
                    {t.badge && (
                      <span className="inline-flex items-center rounded-full bg-muted text-foreground/80 px-2 py-1 text-xs font-semibold">
                        {t.badge}
                      </span>
                    )}
                  </div>
                </div>
                <div className="mt-4">
                  <div className="font-display text-lg font-semibold">{t.name}</div>
                </div>
                <p className="mt-2 text-sm text-foreground/70 line-clamp-3">{t.desc}</p>
                <div className="mt-5 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold tabular-nums truncate">{t.price}</div>
                    {t.priceNote && (
                      <div className="text-xs text-foreground/50">{t.priceNote}</div>
                    )}
                  </div>
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    Details <ArrowRight className="size-4" />
                  </span>
                </div>
              </a>
            </Reveal>
          ))}
          {filteredTools.length === 0 && (
            <div className="col-span-full rounded-3xl border border-dashed border-border bg-card p-8 text-center text-foreground/60">
              Keine Tools für deine Suche im Cluster. Probiere einen anderen Begriff.
            </div>
          )}
        </div>
      </section>

      {/* Buying criteria */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-16 sm:pb-20">
        <Reveal>
          <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight">
            Worauf du achten solltest
          </h2>
          <p className="mt-2 text-foreground/70 max-w-3xl">
            Die folgenden Kriterien helfen dir, die richtige Lösung für deinen Anwendungsfall zu finden. Nicht jedes Tool deckt alle Punkte ab, gewichte sie nach deinem Bedarf.
          </p>
        </Reveal>
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {cluster.criteria.map((c, i) => {
            const Icon = c.icon;
            return (
              <Reveal key={c.title} delay={i * 30}>
                <div className="rounded-3xl border border-border bg-card p-5 shadow-soft h-full">
                  <div
                    className="grid size-10 place-items-center rounded-xl"
                    style={{ background: `${cluster.color}1A`, color: cluster.color }}
                  >
                    <Icon className="size-5" />
                  </div>
                  <div className="mt-4 font-display text-base font-semibold">{c.title}</div>
                  <p className="mt-1 text-sm text-foreground/70">{c.text}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* Collections */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-16 sm:pb-20">
        <Reveal>
          <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight">
            Kuratierte Collections und Vergleiche
          </h2>
          <p className="mt-2 text-foreground/70 max-w-2xl">
            Handverlesene Listen für typische Situationen rund um Verträge und Signatur.
          </p>
        </Reveal>
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {cluster.collections.map((c, i) => (
            <Reveal key={c.title} delay={i * 40}>
              <a
                href={c.href}
                className="group block rounded-3xl p-6 shadow-soft hover:shadow-lift hover:-translate-y-0.5 transition-all h-full text-foreground"
                style={{ background: `${cluster.color}10`, border: `1px solid ${cluster.color}33` }}
              >
                <span
                  className="inline-block rounded-full px-2 py-0.5 text-xs font-semibold"
                  style={{ background: `${cluster.color}22`, color: cluster.color }}
                >
                  {c.tag}
                </span>
                <div className="mt-3 font-display text-lg font-semibold">{c.title}</div>
                <p className="mt-2 text-sm text-foreground/70">{c.desc}</p>
                <div className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold" style={{ color: cluster.color }}>
                  Liste öffnen <ArrowRight className="size-4" />
                </div>
              </a>
            </Reveal>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-16 sm:pb-20">
        <Reveal>
          <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight">
            Häufige Fragen
          </h2>
        </Reveal>
        <Reveal delay={80}>
          <div className="mt-6 rounded-3xl border border-border bg-card p-2 sm:p-4 shadow-soft">
            <Accordion type="single" collapsible className="w-full">
              {cluster.faqs.map((f, i) => (
                <AccordionItem key={i} value={`faq-${i}`} className="border-border">
                  <AccordionTrigger className="text-left font-display text-base font-semibold px-3 sm:px-4">
                    {f.q}
                  </AccordionTrigger>
                  <AccordionContent className="px-3 sm:px-4 text-foreground/80 leading-relaxed">
                    {f.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </Reveal>
      </section>

      {/* Tracker bridge */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-20">
        <Reveal>
          <div
            className="relative overflow-hidden rounded-3xl p-8 sm:p-12 text-primary-foreground"
            style={{
              background: `linear-gradient(135deg, ${cluster.color} 0%, #5849c4 60%, #FF7A66 130%)`,
            }}
          >
            <div className="relative z-10 max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur px-3 py-1 text-xs font-semibold uppercase tracking-wide">
                <BellRing className="size-3.5" />
                Fristen-Wächter
              </div>
              <h2 className="mt-4 font-display text-3xl sm:text-4xl font-semibold leading-tight">
                {cluster.trackerBridge.headline}
              </h2>
              <p className="mt-3 text-primary-foreground/85">{cluster.trackerBridge.text}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href="/preise"
                  className="inline-flex items-center gap-1.5 rounded-2xl bg-white text-foreground px-5 py-3 text-sm font-semibold hover:opacity-90"
                >
                  Kostenlos starten <ArrowRight className="size-4" />
                </a>
                <a
                  href="/features"
                  className="inline-flex items-center gap-1.5 rounded-2xl bg-white/10 border border-white/30 px-5 py-3 text-sm font-semibold hover:bg-white/20"
                >
                  So funktioniert Toolfolio
                </a>
              </div>
            </div>
            <div
              aria-hidden
              className="absolute -right-20 -bottom-20 size-80 rounded-full bg-white/10 blur-2xl"
            />
          </div>
        </Reveal>
      </section>

      {/* SEO Long-Form Content */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 pb-20">
        <Reveal>
          <div className="rounded-3xl border border-border bg-card/50 p-6 sm:p-10 shadow-soft">
            <h2 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight">
              {cluster.name}: Überblick, Auswahlkriterien und Einordnung für den DACH-Markt
            </h2>
            <div className="mt-6 space-y-5 text-foreground/80 leading-relaxed text-[15px]">
              <p>
                {cluster.name} ist heute weit mehr als reine Dokumentenablage. Du arbeitest mit Verträgen,
                die geschäftskritisch sind: Sie binden Budget, regeln Verantwortlichkeiten und tragen
                Fristen, die im Alltag schnell aus dem Blick geraten. Wer im DACH-Raum Software für diese
                Aufgaben sucht, braucht eine Übersicht, die nicht nur Funktionen aufzählt, sondern erklärt,
                wie die einzelnen Bausteine zusammenspielen. Genau dafür ist dieses Verzeichnis gedacht:
                Du findest hier die zentralen Kategorien, typische Anwendungsfälle und eine erste neutrale
                Orientierung, bevor du in einzelne Produkte einsteigst.
              </p>
              <p>
                Die wichtigsten Bausteine reichen vom klassischen Contract Lifecycle Management über die
                qualifizierte elektronische Signatur bis zur KI-gestützten Vertragsanalyse. Dazu kommen
                Module für Klauselbibliotheken, Verhandlung, Genehmigungs-Workflows und ein systematisches
                Fristen- und Renewal-Management. Je nach Unternehmensgröße und Reifegrad ergeben sich
                unterschiedliche Schwerpunkte. Kleinere Teams starten oft mit E-Signatur und einer
                strukturierten Ablage, während Mittelstand und Konzerne stärker auf durchgängige
                CLM-Plattformen mit Schnittstellen zu CRM, ERP und HR setzen.
              </p>
              <p>
                Für den deutschsprachigen Markt gelten zusätzliche Anforderungen, die du bei der Auswahl
                im Hinterkopf behalten solltest. Dazu zählen DSGVO-Konformität, ein nachvollziehbarer
                Auftragsverarbeitungsvertrag, idealerweise Hosting in der EU oder im DACH-Raum sowie
                klare Regelungen zu Sub-Auftragsverarbeitern. Wenn du mit qualifizierten elektronischen
                Signaturen arbeitest, brauchst du einen Anbieter, der eIDAS-konform ist und die passenden
                Vertrauensdienste integriert. Auch Themen wie Schriftform, Textform und branchenspezifische
                Aufbewahrungspflichten beeinflussen, welche Lösung wirklich zu deinem Unternehmen passt.
              </p>
              <p>
                Bei der konkreten Bewertung helfen wenige, dafür belastbare Kriterien: Wie schnell ist
                das Tool im Alltag wirklich nutzbar, ohne dass jede Abteilung eine Schulung braucht? Wie
                transparent ist das Preismodell und gibt es versteckte Kosten bei Nutzern, Vorlagen oder
                Signaturen? Wie gut greifen Workflows in bestehende Systeme ein, und wie verlässlich
                erinnert dich die Lösung an Verlängerungen und Sonderkündigungsrechte? Diese Fragen wiegen
                in der Praxis meist schwerer als einzelne Feature-Listen. In den verlinkten Kategorien
                findest du jeweils Auswahlkriterien, typische Stolperfallen und passende Tools.
              </p>
              <p>
                Toolfolio versteht sich dabei als neutraler Einstiegspunkt. Wir bewerten Anbieter anhand
                klar dokumentierter Kriterien, kennzeichnen bezahlte Platzierungen sichtbar und halten
                Preise so aktuell wie möglich. Wenn du anschließend Verträge, Abos und Fristen sauber im
                Griff behalten möchtest, kannst du sie direkt in den Fristen-Wächter übernehmen. So
                schließt sich der Kreis von der Recherche im Verzeichnis bis zum täglichen Betrieb deiner
                Software-Landschaft.
              </p>
            </div>
          </div>
        </Reveal>
      </section>

      <Footer />
    </div>
  );
}
