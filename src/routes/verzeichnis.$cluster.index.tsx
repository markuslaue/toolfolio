import type * as React from "react";
import { createFileRoute, notFound } from "@tanstack/react-router";
import {
  ClusterHubPage,
  vertragsmanagementCluster,
  type ClusterData,
} from "@/components/marketing/cluster-hub-page";
import {
  SoftwareDetailPage,
  toolfolioDetail,
  type SoftwareDetailData,
} from "@/components/marketing/software-detail-page";
import { Immoware24DetailPage } from "@/components/marketing/immoware24-detail-page";

const clusters: Record<string, ClusterData> = {
  [vertragsmanagementCluster.slug]: vertragsmanagementCluster,
};

const tools: Record<string, SoftwareDetailData> = {
  toolfolio: toolfolioDetail,
};

const customToolPages: Record<string, () => React.ReactElement> = {
  immoware24: () => <Immoware24DetailPage />,
};

const customToolMeta: Record<string, { name: string; categoryName: string; clusterName: string; clusterSlug: string; categorySlug: string; tagline: string }> = {
  immoware24: {
    name: "Immoware24",
    tagline: "Cloudbasierte All-in-One-Lösung für Miet-, WEG- und Sondereigentumsverwaltung mit Banking, GoBD-Buchhaltung und KI-Funktionen.",
    clusterName: "Branchen- & Fachsoftware",
    clusterSlug: "branchen-fachsoftware",
    categoryName: "Immobilienverwaltung",
    categorySlug: "immobilienverwaltung",
  },
};

const ERFAHRUNG_SUFFIX = "-erfahrung";

function resolveToolSlug(slug: string): string | null {
  if (!slug.endsWith(ERFAHRUNG_SUFFIX)) return null;
  return slug.slice(0, -ERFAHRUNG_SUFFIX.length);
}

export const Route = createFileRoute("/verzeichnis/$cluster/")({
  beforeLoad: ({ params }) => {
    const toolSlug = resolveToolSlug(params.cluster);
    if (toolSlug) {
      if (!tools[toolSlug]) throw notFound();
      return;
    }
    if (!clusters[params.cluster]) throw notFound();
  },
  head: ({ params }) => {
    const toolSlug = resolveToolSlug(params.cluster);
    if (toolSlug) {
      const d = tools[toolSlug];
      if (!d) return { meta: [{ title: "Tool nicht gefunden – Toolfolio" }] };
      const url = `https://toolfolio.lovable.app/verzeichnis/${toolSlug}${ERFAHRUNG_SUFFIX}`;
      const description = `${d.name}: ${d.tagline} Preise, Funktionen, Bewertungen und faire Alternativen in der Kategorie ${d.categoryName}.`;
      return {
        meta: [
          { title: `${d.name} Erfahrungen – ${d.categoryName} | Toolfolio` },
          { name: "description", content: description },
          { property: "og:title", content: `${d.name} Erfahrungen – ${d.categoryName}` },
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
    }

    const c = clusters[params.cluster];
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
      <h1 className="font-display text-3xl font-semibold">Seite nicht gefunden</h1>
      <p className="mt-3 text-foreground/70">
        Diesen Eintrag gibt es im Verzeichnis nicht. Schau zurück zum{" "}
        <a href="/verzeichnis" className="text-primary underline">
          Verzeichnis
        </a>
        .
      </p>
    </div>
  ),
});

function Page() {
  const { cluster: slug } = Route.useParams();
  const toolSlug = resolveToolSlug(slug);
  if (toolSlug) {
    const data = tools[toolSlug];
    if (!data) return null;
    return <SoftwareDetailPage data={data} />;
  }
  const cluster = clusters[slug];
  if (!cluster) return null;
  return <ClusterHubPage cluster={cluster} />;
}
