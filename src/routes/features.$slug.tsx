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
});

function FeatureDetailRoute() {
  const { data } = Route.useLoaderData();
  return <FeatureDetailPage data={data} />;
}
