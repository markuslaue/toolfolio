import { createFileRoute } from "@tanstack/react-router";
import { BuilderDashboardPage } from "@/components/anbieter-portal/builder-dashboard";

export const Route = createFileRoute("/anbieter-portal/builder")({
  head: () => ({
    meta: [
      { title: "Builder-Cockpit – Toolfolio" },
      {
        name: "description",
        content:
          "Schlankes Cockpit für Indie-Builder: Listing-Status, Profil-Aufrufe, Klicks und vermittelte Anfragen als anonyme Zähler.",
      },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: BuilderDashboardPage,
});
