import { createFileRoute } from "@tanstack/react-router";
import { SuchePage } from "@/components/marketing/suche-page";

type SearchParams = { q?: string };

export const Route = createFileRoute("/verzeichnis/suche")({
  validateSearch: (search: Record<string, unknown>): SearchParams => ({
    q: typeof search.q === "string" ? search.q : undefined,
  }),
  head: () => {
    const title = "Suche im Verzeichnis – Toolfolio";
    const description =
      "Durchsuche das gesamte Toolfolio-Verzeichnis clusterübergreifend. Neutrale Reihung, verifizierte Daten, transparente Labels für gesponserte und Community-Tools.";
    const url = "https://toolfolio.lovable.app/verzeichnis/suche";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: url },
        { property: "og:type", content: "website" },
        { name: "robots", content: "noindex,follow" },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  component: Page,
});

function Page() {
  const { q } = Route.useSearch();
  return <SuchePage initialQuery={q} />;
}
