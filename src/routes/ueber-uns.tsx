import { createFileRoute } from "@tanstack/react-router";
import { AboutPage } from "@/components/marketing/about-page";

export const Route = createFileRoute("/ueber-uns")({
  head: () => ({
    meta: [
      { title: "Über uns – Toolfolio" },
      {
        name: "description",
        content:
          "Toolfolio kommt aus einer eCommerce-SEO-Agentur in Leipzig, die selbst den Überblick über ihre Software-Abos verloren hat. Lerne Team, Mission und unsere redaktionellen Standards kennen.",
      },
      { property: "og:title", content: "Über uns – Toolfolio" },
      {
        property: "og:description",
        content:
          "Echte Gründer, echte Agentur-Erfahrung aus Leipzig. So entstand Toolfolio und so arbeiten wir.",
      },
      { property: "og:url", content: "https://toolfolio.lovable.app/ueber-uns" },
    ],
    links: [{ rel: "canonical", href: "https://toolfolio.lovable.app/ueber-uns" }],
  }),
  component: AboutPage,
});
