import { createFileRoute, notFound } from "@tanstack/react-router";
import {
  ClusterHubPage,
  vertragsmanagementCluster,
  type ClusterData,
} from "@/components/marketing/cluster-hub-page";

const clusters: Record<string, ClusterData> = {
  [vertragsmanagementCluster.slug]: vertragsmanagementCluster,
};

export const Route = createFileRoute("/verzeichnis/$cluster/")({
  loader: ({ params }) => {
    const data = clusters[params.cluster];
    if (!data) throw notFound();
    return { cluster: data };
  },
  head: ({ loaderData }) => {
    const c = loaderData?.cluster;
    if (!c) return { meta: [{ title: "Cluster nicht gefunden – Toolfolio" }] };
    const url = `https://toolfolio.lovable.app/verzeichnis/${c.slug}`;
    return {
      meta: [
        { title: `${c.name} im Vergleich – Toolfolio Verzeichnis` },
        {
          name: "description",
          content: `${c.name}: Unterkategorien, Top-Tools, Kaufkriterien und FAQ. Neutral verglichen, mit Fokus auf DACH und verifizierten Preisen.`,
        },
        { property: "og:title", content: `${c.name} im Vergleich – Toolfolio` },
        {
          property: "og:description",
          content: `Finde die passende Lösung im Bereich ${c.name}. Unterkategorien, Tools, Kriterien und FAQ auf einen Blick.`,
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
            mainEntity: c.faqs.map((f) => ({
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
      <h1 className="font-display text-3xl font-semibold">Cluster nicht gefunden</h1>
      <p className="mt-3 text-foreground/70">
        Diesen Bereich gibt es im Verzeichnis nicht. Schau zurück zum{" "}
        <a href="/verzeichnis" className="text-primary underline">
          Verzeichnis
        </a>
        .
      </p>
    </div>
  ),
});

function Page() {
  const { cluster } = Route.useLoaderData();
  return <ClusterHubPage cluster={cluster} />;
}
