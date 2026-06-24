import { createFileRoute } from "@tanstack/react-router";
import { AnbieterDashboardPage } from "@/components/anbieter-portal/dashboard";

export const Route = createFileRoute("/anbieter-portal/")({
  head: () => ({
    meta: [
      { title: "Anbieter-Portal · Dashboard – Toolfolio" },
      {
        name: "description",
        content:
          "Cockpit für Software-Anbieter: Profil-Aufrufe, Klicks, Leads, Bewertung und Sichtbarkeit deines Listings im Toolfolio-Verzeichnis.",
      },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AnbieterDashboardPage,
});
