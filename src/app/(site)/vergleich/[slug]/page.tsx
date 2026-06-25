import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  ComparisonPage,
  type ComparisonData,
  type Zelle,
} from "@/components/marketing/comparison-page";

const ALT: Record<string, string> = {
  excel: "Excel / Tabellen",
  sastrify: "Sastrify / Deel IT",
  cledara: "Cledara",
  spendesk: "Spendesk",
  pleo: "Pleo",
  zluri: "Zluri",
  torii: "Torii",
};

const switchSteps = [
  { title: "Erfassen", body: "Abos importieren oder in Minuten manuell anlegen." },
  { title: "Zuordnen", body: "Kunden, Kanäle und Fristen hinterlegen." },
  { title: "Sparen", body: "Benchmark und Sparvorschläge nutzen und weniger zahlen." },
];

function tabelle(alt: Record<string, Zelle>): ComparisonData["tabelle"] {
  return [
    { kriterium: "DACH-Fokus, Deutsch, EU-Hosting", toolfolio: true, alt: alt.dach ?? false },
    { kriterium: "Verifizierte Marktpreise & Benchmark", toolfolio: true, alt: alt.benchmark ?? false },
    { kriterium: "Kündigungsfristen-Wächter", toolfolio: true, alt: alt.fristen ?? false },
    { kriterium: "Weiterverrechnung & Marge je Kunde", toolfolio: true, alt: alt.marge ?? false },
    { kriterium: "Ohne Bankkonto-Anbindung nutzbar", toolfolio: true, alt: alt.ohneBank ?? false },
    { kriterium: "Kostenlos starten", toolfolio: true, alt: alt.free ?? false },
    { kriterium: "Einstieg", toolfolio: "0 € / 14 Tage Pro testen", alt: alt.preis ?? "auf Anfrage" },
  ];
}

const DATEN: Record<string, ComparisonData & { metaDesc: string }> = {
  excel: {
    slug: "excel",
    alt: ALT.excel,
    title: "Software-Abos verwalten ohne Tabellen-Friemelei.",
    intro:
      "Excel kann viel, aber es erinnert dich nicht an Fristen, kennt keine Marktpreise und veraltet, sobald du es schließt. Toolfolio ist dafür gebaut.",
    metaDesc: "Toolfolio vs. Excel: Fristen-Wächter, verifizierte Preise und Weiterverrechnung statt manueller Tabellen.",
    painBullets: [
      { title: "Keine Erinnerungen", body: "Tabellen warnen nicht vor Kündigungsfristen oder Trial-Enden." },
      { title: "Schnell veraltet", body: "Jede Änderung ist Handarbeit, Fehler inklusive." },
      { title: "Kein Vergleich", body: "Ob du fair zahlst, sagt dir eine Zelle nicht." },
    ],
    tabelle: tabelle({ dach: true, free: true, preis: "kostenlos, aber manuell" }),
    switchSteps,
    andere: [],
  },
  sastrify: {
    slug: "sastrify",
    alt: ALT.sastrify,
    title: "SaaS-Management, das auch kleine DACH-Teams bezahlen können.",
    intro:
      "Enterprise-Tools wie Sastrify sind mächtig, aber schwer und teuer für Agenturen und Solopreneure. Toolfolio gibt dir das Wesentliche, sofort und fair.",
    metaDesc: "Toolfolio vs. Sastrify / Deel IT: leichtgewichtiges SaaS-Management mit DACH-Fokus, ohne Enterprise-Ballast.",
    painBullets: [
      { title: "Auf Enterprise zugeschnitten", body: "Onboarding und Preise zielen auf große IT-Abteilungen." },
      { title: "Wenig DACH-Spezifika", body: "Deutsche Vertrags- und Fristenlogik ist nicht der Fokus." },
      { title: "Overhead", body: "Mehr Prozess, als kleine Teams brauchen." },
    ],
    tabelle: tabelle({ benchmark: true, marge: false, ohneBank: true, preis: "Enterprise" }),
    switchSteps,
    andere: [],
  },
  cledara: {
    slug: "cledara",
    alt: ALT.cledara,
    title: "Kostenüberblick ohne Karten-Zwang.",
    intro:
      "Cledara koppelt Software-Management an eigene Karten. Toolfolio ist Vermittler: kein Karten-Zwang, nur Referenzen, und der volle Überblick über alle Kanäle.",
    metaDesc: "Toolfolio vs. Cledara: Software-Kostenüberblick ohne Karten-Zwang, mit verifizierten Preisen.",
    painBullets: [
      { title: "An Karten gebunden", body: "Voller Nutzen erst mit deren Zahlungskarten." },
      { title: "Kein offenes Verzeichnis", body: "Verifizierte Marktpreise fehlen." },
      { title: "Weniger DACH-Fokus", body: "Deutsche Fristenlogik ist nicht im Zentrum." },
    ],
    tabelle: tabelle({ benchmark: true, fristen: true, ohneBank: true, preis: "ab Mittelstand" }),
    switchSteps,
    andere: [],
  },
  spendesk: {
    slug: "spendesk",
    alt: ALT.spendesk,
    title: "Software-Kosten verstehen, nicht nur ausgeben.",
    intro:
      "Spendesk ist ein Ausgaben- und Karten-Tool. Toolfolio fokussiert auf Software-Abos: Fristen, Benchmark und Weiterverrechnung, ohne Spesen-Overhead.",
    metaDesc: "Toolfolio vs. Spendesk: spezialisiert auf Software-Abos, Fristen und Benchmark statt allgemeiner Spesen.",
    painBullets: [
      { title: "Spesen-Fokus", body: "Software-Abos sind nur ein Nebenschauplatz." },
      { title: "Kein Benchmark", body: "Ob ein Tool zu teuer ist, bleibt offen." },
      { title: "Karten im Zentrum", body: "Der Nutzen hängt an deren Zahlungsprodukten." },
    ],
    tabelle: tabelle({ benchmark: true, fristen: true, ohneBank: true, preis: "ab Team-Plan" }),
    switchSteps,
    andere: [],
  },
  pleo: {
    slug: "pleo",
    alt: ALT.pleo,
    title: "Für Software-Abos gemacht, nicht für Firmenkarten.",
    intro:
      "Pleo ist stark bei Firmenausgaben und Karten. Wenn es dir um Software-Kosten, Fristen und faire Preise geht, ist Toolfolio die spezialisierte Wahl.",
    metaDesc: "Toolfolio vs. Pleo: spezialisiert auf Software-Abos mit Fristen-Wächter und verifizierten Preisen.",
    painBullets: [
      { title: "Karten- und Spesen-Tool", body: "Abo-Lebenszyklus und Fristen sind nicht der Kern." },
      { title: "Kein Marktpreis-Vergleich", body: "Faire Preise sind kein Feature." },
      { title: "Kein DACH-Verzeichnis", body: "Alternativen findest du woanders." },
    ],
    tabelle: tabelle({ fristen: true, ohneBank: true, preis: "ab Team-Plan" }),
    switchSteps,
    andere: [],
  },
  zluri: {
    slug: "zluri",
    alt: ALT.zluri,
    title: "SaaS-Überblick ohne IT-Abteilung.",
    intro:
      "Zluri zielt auf IT-Governance großer Organisationen. Toolfolio bringt Agenturen und Selbstständigen den Kostennutzen, ohne komplexe Integrationen.",
    metaDesc: "Toolfolio vs. Zluri: SaaS-Kostenüberblick für kleine DACH-Teams statt Enterprise-IT-Governance.",
    painBullets: [
      { title: "Enterprise-IT im Fokus", body: "Discovery und Governance für große Teams." },
      { title: "Integrations-lastig", body: "Voller Nutzen erst mit vielen Anbindungen." },
      { title: "Kein DACH-Preisbenchmark", body: "Verifizierte Marktpreise fehlen." },
    ],
    tabelle: tabelle({ benchmark: true, ohneBank: true, preis: "Enterprise" }),
    switchSteps,
    andere: [],
  },
  torii: {
    slug: "torii",
    alt: ALT.torii,
    title: "Leichtgewichtig statt Enterprise-SaaS-Plattform.",
    intro:
      "Torii ist eine SaaS-Management-Plattform für große IT-Teams. Toolfolio gibt dir den Kostennutzen schlank, fair bepreist und mit DACH-Fokus.",
    metaDesc: "Toolfolio vs. Torii: leichtgewichtiges, faires SaaS-Kostenmanagement mit DACH-Fokus.",
    painBullets: [
      { title: "Für große IT-Teams", body: "Plattform-Umfang, den kleine Teams nicht brauchen." },
      { title: "Aufwändiges Setup", body: "Integrationen und Prozesse stehen im Weg." },
      { title: "Kein offenes Verzeichnis", body: "Marktpreis-Transparenz fehlt." },
    ],
    tabelle: tabelle({ benchmark: true, ohneBank: true, preis: "Enterprise" }),
    switchSteps,
    andere: [],
  },
};

// Querverweise auf bis zu vier andere Vergleiche.
for (const slug of Object.keys(DATEN)) {
  DATEN[slug].andere = Object.keys(DATEN)
    .filter((s) => s !== slug)
    .slice(0, 4)
    .map((s) => ({ slug: s, alt: ALT[s] }));
}

export function generateStaticParams() {
  return Object.keys(DATEN).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const d = DATEN[slug];
  if (!d) return { title: "Vergleich" };
  return { title: `Toolfolio vs. ${d.alt}`, description: d.metaDesc };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const d = DATEN[slug];
  if (!d) notFound();
  return <ComparisonPage data={d} />;
}
