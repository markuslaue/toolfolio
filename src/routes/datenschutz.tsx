import { createFileRoute } from "@tanstack/react-router";
import { DatenschutzPage } from "@/components/marketing/datenschutz-page";

export const Route = createFileRoute("/datenschutz")({
  head: () => ({
    meta: [
      { title: "Datenschutzerklärung – Toolfolio" },
      {
        name: "description",
        content:
          "Datenschutzerklärung von Toolfolio (OMMM GmbH). Informationen zu Verarbeitung, Rechtsgrundlagen, Diensten und deinen Rechten nach DSGVO.",
      },
      { property: "og:title", content: "Datenschutzerklärung – Toolfolio" },
      {
        property: "og:description",
        content:
          "Wie Toolfolio personenbezogene Daten verarbeitet. Verantwortlicher: OMMM GmbH.",
      },
      { property: "og:url", content: "https://toolfolio.lovable.app/datenschutz" },
    ],
    links: [{ rel: "canonical", href: "https://toolfolio.lovable.app/datenschutz" }],
  }),
  component: DatenschutzPage,
});
