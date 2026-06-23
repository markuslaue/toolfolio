import { createFileRoute } from "@tanstack/react-router";
import { EntwicklerPage } from "@/components/marketing/entwickler-page";

export const Route = createFileRoute("/entwickler")({
  head: () => ({
    meta: [
      { title: "Für Entwickler – Indie-SaaS listen – Toolfolio" },
      {
        name: "description",
        content:
          "Listet euer Indie-Tool bei Toolfolio. Grund-Listung kostenlos, verifiziertes Listing einmalig 49,00 €. Keine laufenden Kosten, kein CPC, keine Beteiligung an Verkäufen. Klare Sicherheitsstandards und ehrlicher Badge.",
      },
      {
        property: "og:title",
        content: "Für Entwickler – Indie-SaaS listen – Toolfolio",
      },
      {
        property: "og:description",
        content:
          "Grund-Listung kostenlos, geprüfter Badge einmalig 49,00 €. Keine Abos, keine Sale-Beteiligung. Transparenz und Sicherheit als Kern.",
      },
      {
        property: "og:url",
        content: "https://toolfolio.lovable.app/entwickler",
      },
    ],
    links: [
      { rel: "canonical", href: "https://toolfolio.lovable.app/entwickler" },
    ],
  }),
  component: EntwicklerPage,
});
