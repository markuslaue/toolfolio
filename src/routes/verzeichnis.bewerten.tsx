import { createFileRoute } from "@tanstack/react-router";
import { BewertenPage } from "@/components/marketing/bewerten-page";

type SearchParams = { tool?: string; name?: string };

export const Route = createFileRoute("/verzeichnis/bewerten")({
  validateSearch: (search: Record<string, unknown>): SearchParams => ({
    tool: typeof search.tool === "string" ? search.tool : undefined,
    name: typeof search.name === "string" ? search.name : undefined,
  }),
  head: () => {
    const title = "Bewertung abgeben – Toolfolio";
    const description =
      "Bewerte ein Tool im Toolfolio-Verzeichnis ehrlich. Verifiziert durch Abrechnung, niemals käuflich, vor Veröffentlichung moderiert.";
    const url = "https://toolfolio.lovable.app/verzeichnis/bewerten";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: url },
        { name: "robots", content: "noindex,follow" },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  component: Page,
});

function Page() {
  const { tool, name } = Route.useSearch();
  const slug = tool || "notion";
  const displayName =
    name || slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, " ");
  return <BewertenPage toolSlug={slug} toolName={displayName} />;
}
