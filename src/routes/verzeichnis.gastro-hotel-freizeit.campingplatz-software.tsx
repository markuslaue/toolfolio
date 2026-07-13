import { createFileRoute } from "@tanstack/react-router";
import { CampingplatzSoftwarePage } from "@/components/marketing/campingplatz-software-page";

export const Route = createFileRoute("/verzeichnis/gastro-hotel-freizeit/campingplatz-software")({
  head: () => ({
    meta: [
      { title: "Campingplatz Software: Funktionen, Preise, Auswahl" },
      {
        name: "description",
        content:
          "8 Campingplatz-Softwares im neutralen Vergleich. Belegungsplan, Online-Buchung, Gästemeldung, Kasse und Dauercamper. Mit Preismodellen und DACH-Rechtslage.",
      },
      { property: "og:title", content: "Campingplatz Software: Funktionen, Preise, Auswahl" },
      {
        property: "og:description",
        content:
          "8 Campingplatz-Softwares im neutralen Vergleich. Belegungsplan, Online-Buchung, Gästemeldung, Kasse und Dauercamper. Mit Preismodellen und DACH-Rechtslage.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CampingplatzSoftwarePage,
});
