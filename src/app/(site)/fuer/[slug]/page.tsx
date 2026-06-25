import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AudiencePage, audienceData, type AudienceSlug } from "@/components/marketing/audience-page";

export function generateStaticParams() {
  return Object.keys(audienceData).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const d = audienceData[slug as AudienceSlug];
  if (!d) return { title: "Für wen" };
  return { title: `Toolfolio für ${d.segmentLabel}`, description: d.subline };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const d = audienceData[slug as AudienceSlug];
  if (!d) notFound();
  return <AudiencePage data={d} />;
}
