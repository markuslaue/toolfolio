import { createFileRoute } from "@tanstack/react-router";
import { DemoPage } from "@/components/marketing/demo-page";

export const Route = createFileRoute("/demo")({
  head: () => ({
    meta: [
      { title: "Demo buchen – Toolfolio" },
      {
        name: "description",
        content:
          "30 Minuten persönliche Demo, besonders für Agentur-Teams. Wähle deinen Wunschtermin oder schick uns eine kurze Anfrage. Unverbindlich.",
      },
      { property: "og:title", content: "Demo buchen – Toolfolio" },
      {
        property: "og:description",
        content:
          "Persönlicher Rundgang durch Toolfolio, Fokus auf Agentur-Funktionen. Termin wählen oder Anfrage senden.",
      },
      { property: "og:url", content: "https://toolfolio.lovable.app/demo" },
    ],
    links: [{ rel: "canonical", href: "https://toolfolio.lovable.app/demo" }],
  }),
  component: DemoPage,
});
