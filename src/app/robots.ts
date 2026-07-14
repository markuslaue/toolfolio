import type { MetadataRoute } from "next";
import { SITE } from "@/lib/schema";

/**
 * robots.txt.
 *
 * Was eingeloggt ist, hat im Index nichts verloren, und was die Redaktion sieht, erst
 * recht nicht. Die Vorschau-Routen tragen zwar bereits noindex, aber ein Disallow spart
 * Google den Abruf und uns die Frage, warum eine Entwurfsseite gecrawlt wurde.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/app/", "/admin/", "/api/", "/verzeichnis/vorschau/", "/auth/", "/einladung/"],
      },
    ],
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  };
}
