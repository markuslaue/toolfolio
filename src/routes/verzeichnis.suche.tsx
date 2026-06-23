import { createFileRoute } from "@tanstack/react-router";
import { SuchePage } from "@/components/marketing/suche-page";

type SearchParams = { q?: string };

export const Route = createFileRoute("/verzeichnis/suche")({
  validateSearch: (search: Record<string, unknown>): SearchParams => ({
    q: typeof search.q === "string" ? search.q : undefined,
  }),
  head: ({ search }) => {
    const q = (search as SearchParams).q;
    const title = q
      ? `Suche: ${q} – Toolfolio Verzeichnis`
      : "Suche im Verzeichnis – Toolfolio";
    const description = q
      ? `Suchergebnisse für „${q}" im Toolfolio-Verzeichnis. Clusterübergreifend, neutral sortiert, mit klar markierten gesponserten Treffern.`
      : "Durchsuche das gesamte Toolfolio-Verzeichnis clusterübergreifend. Neutrale Reihung, verifizierte Daten, transparente Labels.";
    const url = q
      ? `https://toolfolio.lovable.app/verzeichnis/suche?q=${encodeURIComponent(q)}`
      : "https://toolfolio.lovable.app/verzeichnis/suche";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: url },
        { property: "og:type", content: "website" },
        // Suche soll nicht endlos im Index landen
        { name: "robots", content: "noindex,follow" },
      ],
      links: [{ rel: "canonical", href: "https://toolfolio.lovable.app/verzeichnis/suche" }],
    };
  },
  component: Page,
});

function Page() {
  const { q } = Route.useSearch();
  return <SuchePage initialQuery={q} />;
}
