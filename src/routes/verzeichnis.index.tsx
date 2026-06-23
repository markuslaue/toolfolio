import { createFileRoute } from "@tanstack/react-router";
import { VerzeichnisHubPage } from "@/components/marketing/verzeichnis-hub-page";

export const Route = createFileRoute("/verzeichnis/")({
  head: () => ({
    meta: [
      { title: "Verzeichnis – Software für DACH-Agenturen, Freelancer und Solopreneure | Toolfolio" },
      {
        name: "description",
        content:
          "Das öffentliche Software-Verzeichnis für DACH. Stöbere nach Cluster und Kategorie, vergleiche Tools mit verifizierten Preisen aus echten Abrechnungen und finde Alternativen.",
      },
      { property: "og:title", content: "Toolfolio Verzeichnis – verifizierte Preise, neutrale Auswahl, DACH-Fokus" },
      {
        property: "og:description",
        content:
          "Finde, vergleiche und wechsle deine Software. Cluster, Kategorien und beliebte Tools auf einen Blick.",
      },
    ],
  }),
  component: VerzeichnisHubPage,
});
