import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AudienceBySlug, type AudienceSlug } from "@/components/marketing/audience-page";

// Slugs + Metadaten serverseitig (die Daten selbst liegen im "use client"-Modul
// und sind dort nur als Client-Referenzen importierbar).
const SLUGS = ["agenturen", "freelancer", "solopreneure"] as const;

const META: Record<AudienceSlug, { title: string; description: string }> = {
  agenturen: {
    title: "Toolfolio für Agenturen",
    description:
      "Toolkosten im Griff und sauber pro Kunde verrechnet: Zuordnung, Marge, Weiterverrechnungs-Report, Team und Offboarding. Der Agentur-Plan für DACH-Agenturen.",
  },
  freelancer: {
    title: "Toolfolio für Freelancer",
    description:
      "Alle Abos im Blick, Fristen sicher, Steuer-Export in einer Minute, AI-Credits an einem Ort. Toolfolio für Freelancer im DACH-Raum.",
  },
  solopreneure: {
    title: "Toolfolio für Solopreneure",
    description:
      "Einfach Überblick behalten, vergessene Trials stoppen und mit konkreten Sparvorschlägen Geld sparen. Kostenlos starten als Solopreneur.",
  },
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
  return META[slug as AudienceSlug] ?? { title: "Für wen" };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!SLUGS.includes(slug as AudienceSlug)) notFound();
  return <AudienceBySlug slug={slug as AudienceSlug} />;
}
