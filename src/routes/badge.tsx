import { createFileRoute } from "@tanstack/react-router";
import { BadgePage } from "@/components/marketing/badge-page";

export const Route = createFileRoute("/badge")({
  head: () => ({
    meta: [
      { title: "Vertrauens-Badge & Listing-Standard – Toolfolio" },
      {
        name: "description",
        content:
          "Was der Toolfolio Vertrauens-Badge bedeutet und was nicht. Geprüfte externe Punkte plus verbindliche Selbstauskunft des Anbieters. Keine Sicherheitsgarantie, keine Zertifizierung. Befristete Gültigkeit, erneute Prüfung, Entzug bei Verstoß.",
      },
      {
        property: "og:title",
        content: "Vertrauens-Badge & Listing-Standard – Toolfolio",
      },
      {
        property: "og:description",
        content:
          "Transparente Erklärung des Toolfolio Vertrauens-Badge: Scope, Prüfstandard, Methodik, Gültigkeit. Sichtbarkeit ist erhältlich, der Badge ist es nicht.",
      },
      { property: "og:url", content: "https://toolfolio.lovable.app/badge" },
    ],
    links: [{ rel: "canonical", href: "https://toolfolio.lovable.app/badge" }],
  }),
  component: BadgePage,
});
