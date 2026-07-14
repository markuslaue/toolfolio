import { SITE } from "@/lib/schema";
import { antwort } from "@/lib/sitemap";

export const revalidate = 3600;

/**
 * Die Index-Sitemap. Genau diese URL traegt man in die Google Search Console ein,
 * dann findet Google die drei Teil-Sitemaps von allein.
 */
const TEILE = ["sitemap-seiten.xml", "sitemap-collections.xml", "sitemap-produkte.xml"];

export function GET() {
  const heute = new Date().toISOString().slice(0, 10);
  return antwort(`<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${TEILE.map(
  (t) => `  <sitemap>
    <loc>${SITE}/${t}</loc>
    <lastmod>${heute}</lastmod>
  </sitemap>`,
).join("\n")}
</sitemapindex>`);
}
