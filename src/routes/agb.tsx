import { createFileRoute } from "@tanstack/react-router";
import { AgbPage } from "@/components/marketing/agb-page";

export const Route = createFileRoute("/agb")({
  head: () => ({
    meta: [
      { title: "AGB – Toolfolio" },
      {
        name: "description",
        content:
          "Allgemeine Geschäftsbedingungen von Toolfolio (OMMM GmbH). B2B-Nutzung, Tarife, Vermittler-Rolle, Haftung und Kündigung.",
      },
      { property: "og:title", content: "AGB – Toolfolio" },
      {
        property: "og:description",
        content:
          "AGB von Toolfolio. Anbieter: OMMM GmbH. Angebot ausschließlich für Unternehmer.",
      },
      { property: "og:url", content: "https://toolfolio.lovable.app/agb" },
    ],
    links: [{ rel: "canonical", href: "https://toolfolio.lovable.app/agb" }],
  }),
  component: AgbPage,
});
