import { createFileRoute } from "@tanstack/react-router";
import { SecurityPage } from "@/components/marketing/security-page";

export const Route = createFileRoute("/sicherheit")({
  head: () => ({
    meta: [
      { title: "Sicherheit & Datenschutz – Toolfolio" },
      {
        name: "description",
        content:
          "Wie Toolfolio mit deinen Daten umgeht: keine Passwörter, keine vollständigen Kartennummern, nur Referenzen. Hosting in der EU, anonymer Benchmark, volle DSGVO-Rechte.",
      },
      { property: "og:title", content: "Sicherheit & Datenschutz – Toolfolio" },
      {
        property: "og:description",
        content:
          "Klartext zu Datenstandort, Verschlüsselung, Benchmark-Datenschutz und deinen Rechten.",
      },
      { property: "og:url", content: "https://toolfolio.lovable.app/sicherheit" },
    ],
    links: [{ rel: "canonical", href: "https://toolfolio.lovable.app/sicherheit" }],
  }),
  component: SecurityPage,
});
