import { createFileRoute, notFound } from "@tanstack/react-router";
import {
  ComparisonPage,
  comparisonData,
  type ComparisonSlug,
} from "@/components/marketing/comparison-page";

const SLUGS: ComparisonSlug[] = [
  "excel",
  "sastrify",
  "cledara",
  "spendesk",
  "pleo",
  "zluri",
  "torii",
];

export const Route = createFileRoute("/vergleich/$slug")({
  loader: ({ params }) => {
    if (!SLUGS.includes(params.slug as ComparisonSlug)) throw notFound();
    return { data: comparisonData[params.slug as ComparisonSlug] };
  },
  head: ({ params }) => {
    const data = comparisonData[params.slug as ComparisonSlug];
    if (!data) return { meta: [{ title: "Vergleich nicht gefunden — Toolfolio" }] };
    const title = `Toolfolio vs. ${data.alt} — fairer Vergleich`;
    const desc = data.subline;
    const url = `https://toolfolio.lovable.app/vergleich/${data.slug}`;
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
  component: ComparisonRoute,
  notFoundComponent: () => (
    <div className="grid min-h-screen place-items-center bg-[#FBF7F1] text-[#1F1D2B]">
      <div className="text-center">
        <div className="font-display text-3xl font-bold">Vergleich nicht gefunden</div>
        <a href="/" className="mt-4 inline-block text-[#6C5CE7] underline">
          Zurück zur Startseite
        </a>
      </div>
    </div>
  ),
});

function ComparisonRoute() {
  const { data } = Route.useLoaderData();
  return <ComparisonPage data={data} />;
}
