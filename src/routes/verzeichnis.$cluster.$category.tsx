import { createFileRoute, notFound } from "@tanstack/react-router";
import {
  KategoriePage,
  vertragsmanagementCategory,
  type CategoryData,
} from "@/components/marketing/kategorie-page";

const categories: Record<string, CategoryData> = {
  [`${vertragsmanagementCategory.clusterSlug}/${vertragsmanagementCategory.slug}`]:
    vertragsmanagementCategory,
};

export const Route = createFileRoute("/verzeichnis/$cluster/$category")({
  loader: ({ params }) => {
    const key = `${params.cluster}/${params.category}`;
    const data = categories[key];
    if (!data) throw notFound();
    return { data };
  },
  head: ({ loaderData }) => {
    const d = loaderData?.data;
    if (!d) return { meta: [{ title: "Kategorie nicht gefunden – Toolfolio" }] };
    const url = `https://toolfolio.lovable.app/verzeichnis/${d.clusterSlug}/${d.slug}`;
    return {
      meta: [
        { title: `${d.name} im Vergleich – Toolfolio Verzeichnis` },
        {
          name: "description",
          content: `Neutrale Übersicht über ${d.name}-Lösungen mit Filtern, Bewertungen und verifizierten Daten. Klar getrennt: gesponsert, organisches Ranking, Community-Tools.`,
        },
        { property: "og:title", content: `${d.name} im Vergleich – Toolfolio` },
        {
          property: "og:description",
          content: `${d.name}: gefiltert und neutral verglichen. Mit klar markierten gesponserten Plätzen und abgesetztem Community-Bereich.`,
        },
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
      <h1 className="font-display text-3xl font-semibold">Kategorie nicht gefunden</h1>
      <p className="mt-3 text-foreground/70">
        Diese Kategorie gibt es im Verzeichnis nicht. Zurück zum{" "}
        <a href="/verzeichnis" className="text-primary underline">Verzeichnis</a>.
      </p>
    </div>
  ),
});

function Page() {
  const { data } = Route.useLoaderData();
  return <KategoriePage data={data} />;
}
