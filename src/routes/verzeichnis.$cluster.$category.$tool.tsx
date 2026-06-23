import { createFileRoute, notFound } from "@tanstack/react-router";
import {
  SoftwareDetailPage,
  toolfolioDetail,
  type SoftwareDetailData,
} from "@/components/marketing/software-detail-page";

const tools: Record<string, SoftwareDetailData> = {
  [`${toolfolioDetail.clusterSlug}/${toolfolioDetail.categorySlug}/${toolfolioDetail.name.toLowerCase()}`]:
    toolfolioDetail,
};

export const Route = createFileRoute("/verzeichnis/$cluster/$category/$tool")({
  beforeLoad: ({ params }) => {
    const key = `${params.cluster}/${params.category}/${params.tool}`;
    if (!tools[key]) throw notFound();
  },
  head: ({ params }) => {
    const d = tools[`${params.cluster}/${params.category}/${params.tool}`];
    if (!d) return { meta: [{ title: "Tool nicht gefunden – Toolfolio" }] };
    const url = `https://toolfolio.lovable.app/verzeichnis/${d.clusterSlug}/${d.categorySlug}/${d.name.toLowerCase()}`;
    const description = `${d.name}: ${d.tagline} Preise, Funktionen, Bewertungen und faire Alternativen in der Kategorie ${d.categoryName}.`;
    return {
      meta: [
        { title: `${d.name} – ${d.categoryName} | Toolfolio Verzeichnis` },
        { name: "description", content: description },
        { property: "og:title", content: `${d.name} – ${d.categoryName}` },
        { property: "og:description", content: description },
        { property: "og:url", content: url },
        { property: "og:type", content: "product" },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: d.name,
            applicationCategory: d.categoryName,
            operatingSystem: "Web",
            offers: d.prices.map((p) => ({
              "@type": "Offer",
              name: p.name,
              price: p.price,
              priceCurrency: "EUR",
              description: p.description,
            })),
            aggregateRating:
              d.reviewCount > 0
                ? {
                    "@type": "AggregateRating",
                    ratingValue: d.rating,
                    reviewCount: d.reviewCount,
                  }
                : undefined,
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Verzeichnis", item: "https://toolfolio.lovable.app/verzeichnis" },
              { "@type": "ListItem", position: 2, name: d.clusterName, item: `https://toolfolio.lovable.app/verzeichnis/${d.clusterSlug}` },
              { "@type": "ListItem", position: 3, name: d.categoryName, item: `https://toolfolio.lovable.app/verzeichnis/${d.clusterSlug}/${d.categorySlug}` },
              { "@type": "ListItem", position: 4, name: d.name, item: url },
            ],
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: d.faqs.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          }),
        },
      ],
    };
  },
  component: Page,
  notFoundComponent: () => (
    <div className="mx-auto max-w-3xl px-6 py-24 text-center">
      <h1 className="font-display text-3xl font-semibold">Tool nicht gefunden</h1>
      <p className="mt-3 text-foreground/70">
        Dieses Tool gibt es im Verzeichnis nicht. Zurück zum{" "}
        <a href="/verzeichnis" className="text-primary underline">Verzeichnis</a>.
      </p>
    </div>
  ),
});

function Page() {
  const { cluster, category, tool } = Route.useParams();
  const data = tools[`${cluster}/${category}/${tool}`];
  if (!data) return null;
  return <SoftwareDetailPage data={data} />;
}
