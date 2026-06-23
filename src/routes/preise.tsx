import { createFileRoute } from "@tanstack/react-router";
import { PricingPage } from "@/components/marketing/pricing-page";

export const Route = createFileRoute("/preise")({
  head: () => ({
    meta: [
      { title: "Preise – Toolfolio" },
      {
        name: "description",
        content:
          "Free für den Überblick, Pro für Solopreneure, Agentur für Teams. 14 Tage kostenlos testen, keine Kreditkarte nötig.",
      },
      { property: "og:title", content: "Preise – Toolfolio" },
      {
        property: "og:description",
        content:
          "Zahl weniger, als du sparst. Drei Pläne für Solo, Freelancer und Agenturen.",
      },
    ],
  }),
  component: PricingPage,
});
