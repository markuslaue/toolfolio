import { createFileRoute } from "@tanstack/react-router";
import { AnbieterPage } from "@/components/marketing/anbieter-page";

export const Route = createFileRoute("/anbieter")({
  head: () => ({
    meta: [
      { title: "Für Anbieter – Toolfolio" },
      {
        name: "description",
        content:
          "Erreiche DACH-Agenturen, Freelancer und Solopreneure mit konkreter Wechselabsicht. Premium-Platzierung, erweitertes Profil und qualifizierte Leads. Bewertungen und Benchmark bleiben unabhängig.",
      },
      { property: "og:title", content: "Für Anbieter – Toolfolio" },
      {
        property: "og:description",
        content:
          "Premium-Platzierung und qualifizierte Leads aus dem neutralen Verzeichnis. Sichtbarkeit ist käuflich, Bewertungen niemals.",
      },
      { property: "og:url", content: "https://toolfolio.lovable.app/anbieter" },
    ],
    links: [{ rel: "canonical", href: "https://toolfolio.lovable.app/anbieter" }],
  }),
  component: AnbieterPage,
});
