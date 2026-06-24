import { createFileRoute } from "@tanstack/react-router";
import { ImpressumPage } from "@/components/marketing/impressum-page";

export const Route = createFileRoute("/impressum")({
  head: () => ({
    meta: [
      { title: "Impressum – Toolfolio" },
      {
        name: "description",
        content:
          "Impressum der OMMM GmbH für Toolfolio. Rechtliche Angaben nach § 5 DDG.",
      },
      { property: "og:title", content: "Impressum – Toolfolio" },
      {
        property: "og:description",
        content:
          "Rechtliche Angaben der OMMM GmbH nach § 5 DDG.",
      },
      { property: "og:url", content: "https://toolfolio.lovable.app/impressum" },
    ],
    links: [{ rel: "canonical", href: "https://toolfolio.lovable.app/impressum" }],
  }),
  component: ImpressumPage,
});
