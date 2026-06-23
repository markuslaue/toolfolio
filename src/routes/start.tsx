import { createFileRoute } from "@tanstack/react-router";
import { MarketingHome } from "@/components/marketing/marketing-home";

export const Route = createFileRoute("/start")({
  head: () => ({
    meta: [
      { title: "Toolfolio – Alle deine Software-Abos im Griff" },
      {
        name: "description",
        content:
          "Toolfolio ist Tracker und Verzeichnis in einem. Behalte alle Software-Abos im Blick, vermeide stille Verlängerungen und finde günstigere Alternativen.",
      },
      { property: "og:title", content: "Toolfolio – Alle deine Software-Abos im Griff" },
      {
        property: "og:description",
        content:
          "Tracker und Verzeichnis in einem. Für Agenturen, Freelancer und Solopreneure im DACH-Raum.",
      },
    ],
  }),
  component: MarketingHome,
});
