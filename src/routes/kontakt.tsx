import { createFileRoute } from "@tanstack/react-router";
import { ContactPage } from "@/components/marketing/contact-page";

export const Route = createFileRoute("/kontakt")({
  head: () => ({
    meta: [
      { title: "Kontakt – Toolfolio" },
      {
        name: "description",
        content:
          "Schreib uns. Echte Menschen antworten in der Regel innerhalb eines Werktags. Support, Vertrieb, Presse und alle anderen Anliegen willkommen.",
      },
      { property: "og:title", content: "Kontakt – Toolfolio" },
      {
        property: "og:description",
        content:
          "Schreib uns. Echte Menschen antworten in der Regel innerhalb eines Werktags. Support, Vertrieb, Presse und alle anderen Anliegen willkommen.",
      },
      { property: "og:url", content: "https://toolfolio.lovable.app/kontakt" },
    ],
    links: [{ rel: "canonical", href: "https://toolfolio.lovable.app/kontakt" }],
  }),
  component: ContactPage,
});
