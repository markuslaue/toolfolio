import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ComparisonBySlug, type ComparisonSlug } from "@/components/marketing/comparison-page";

const SLUGS = ["excel", "sastrify", "cledara", "spendesk", "pleo", "zluri", "torii"] as const;

const META: Record<ComparisonSlug, { title: string; description: string }> = {
  excel: { title: "Toolfolio vs. Excel", description: "Wann sich der Umstieg von der Abo-Tabelle lohnt: Fristen-Wächter, Benchmark und automatische Erfassung statt veralteter Excel-Liste." },
  sastrify: { title: "Toolfolio als Alternative zu Sastrify (Deel IT)", description: "Die schlanke, bezahlbare DACH-Alternative zu Enterprise-SaaS-Management für kleine Agenturen, Freelancer und Solopreneure." },
  cledara: { title: "Toolfolio als Alternative zu Cledara", description: "Software-Verwaltung ohne virtuelle Kreditkarten und ohne Mid-Market-Preise, DACH-spezifisch und schlank." },
  spendesk: { title: "Toolfolio als Alternative zu Spendesk", description: "Spezialisiert auf Software-Abos statt breitem Spend-Management: Fristen, Benchmark und Weiterverrechnung pro Kunde." },
  pleo: { title: "Toolfolio als Alternative zu Pleo", description: "Pleo macht Karten und Spesen, Toolfolio den Abo-Lifecycle: Fristen, Benchmark und Marge pro Kunde." },
  zluri: { title: "Toolfolio als Alternative zu Zluri", description: "Die schlanke DACH-Alternative zu Enterprise-SaaS-Management mit SSO-Discovery, für kleine Teams." },
  torii: { title: "Toolfolio als Alternative zu Torii", description: "Schlankes, DACH-spezifisches SaaS-Kostenmanagement statt Enterprise-Plattform für IT-Teams." },
};

export function generateStaticParams() {
  return SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return META[slug as ComparisonSlug] ?? { title: "Vergleich" };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!SLUGS.includes(slug as ComparisonSlug)) notFound();
  return <ComparisonBySlug slug={slug as ComparisonSlug} />;
}
