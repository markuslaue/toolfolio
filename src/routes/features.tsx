import { createFileRoute } from "@tanstack/react-router";
import { FeaturesPage } from "@/components/marketing/features-page";

export const Route = createFileRoute("/features")({
  head: () => ({
    meta: [
      { title: "Funktionen – Toolfolio" },
      {
        name: "description",
        content:
          "Jede Funktion löst ein echtes Problem: stille Verlängerungen, vergessene Trials, KI-Spikes, Agentur-Weiterverrechnung. Mit echten Backend-Screenshots.",
      },
      { property: "og:title", content: "Funktionen – Toolfolio" },
      {
        property: "og:description",
        content:
          "Dashboard, Fristen-Wächter, AI-Credit-Tracker, Benchmark, Sparvorschläge, Kosten pro Kunde, Steuer-Export und Verzeichnis.",
      },
    ],
  }),
  component: FeaturesPage,
});
