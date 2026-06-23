import { createFileRoute, notFound } from "@tanstack/react-router";
import { FeatureDetailPage } from "@/components/marketing/feature-detail-page";
import { getFeatureDetail } from "@/lib/feature-details";

export const Route = createFileRoute("/features/$slug")({
  loader: ({ params }) => {
    const data = getFeatureDetail(params.slug);
    if (!data) throw notFound();
    return { data };
  },
  head: ({ loaderData }) => {
    const data = loaderData?.data;
    if (!data) return { meta: [{ title: "Funktion – Toolfolio" }] };
    const url = `https://toolfolio.lovable.app/features/${data.slug}`;
    return {
      meta: [
        { title: `${data.eyebrow} – Toolfolio` },
        { name: "description", content: data.subline },
        { property: "og:title", content: `${data.eyebrow} – Toolfolio` },
        { property: "og:description", content: data.subline },
        { property: "og:url", content: url },
        { property: "og:type", content: "article" },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: data.faq.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          }),
        },
      ],
    };
  },
  component: FeatureDetailRoute,
  notFoundComponent: () => (
    <div className="grid min-h-screen place-items-center bg-[#FBF7F1] text-[#1F1D2B]">
      <div className="text-center">
        <div className="font-display text-3xl font-bold">Funktion nicht gefunden</div>
        <a href="/features" className="mt-4 inline-block text-[#6C5CE7] underline">
          Zurück zur Funktionsübersicht
        </a>
      </div>
    </div>
  ),
});

function FeatureDetailRoute() {
  const { data } = Route.useLoaderData();
  return <FeatureDetailPage data={data} />;
}
