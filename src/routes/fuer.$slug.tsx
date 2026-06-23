import { createFileRoute, notFound } from "@tanstack/react-router";
import { AudiencePage, audienceData, type AudienceSlug } from "@/components/marketing/audience-page";

const SLUGS: AudienceSlug[] = ["agenturen", "freelancer", "solopreneure"];

export const Route = createFileRoute("/fuer/$slug")({
  loader: ({ params }) => {
    if (!SLUGS.includes(params.slug as AudienceSlug)) throw notFound();
    return { data: audienceData[params.slug as AudienceSlug] };
  },
  head: ({ params }) => {
    const data = audienceData[params.slug as AudienceSlug];
    if (!data) return { meta: [{ title: "Zielgruppe nicht gefunden — Toolfolio" }] };
    const title = `Toolfolio für ${data.segmentLabel} — Software-Verwaltung`;
    const desc = data.subline;
    const url = `https://toolfolio.lovable.app/fuer/${data.slug}`;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:url", content: url },
        { property: "og:type", content: "website" },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: data.faqs.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          }),
        },
      ],
    };
  },
  component: AudienceRoute,
  notFoundComponent: () => (
    <div className="grid min-h-screen place-items-center bg-[#FBF7F1] text-[#1F1D2B]">
      <div className="text-center">
        <div className="font-display text-3xl font-bold">Zielgruppe nicht gefunden</div>
        <a href="/" className="mt-4 inline-block text-[#6C5CE7] underline">Zurück zur Startseite</a>
      </div>
    </div>
  ),
});

function AudienceRoute() {
  const { data } = Route.useLoaderData();
  return <AudiencePage data={data} />;
}
