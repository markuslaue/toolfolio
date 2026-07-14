import { SITE } from "@/lib/schema";

/**
 * Sitemaps fuer die Google Search Console.
 *
 * AUFBAU: Eine Index-Sitemap (/sitemap.xml) verweist auf drei Teil-Sitemaps. Das ist
 * nicht Selbstzweck: Google deckelt eine Sitemap bei 50.000 URLs, und wir steuern auf
 * gut 1300 Kategorien plus mehrere tausend Produkte zu. Vor allem aber sieht man in der
 * Search Console dann PRO TYP, wie viele Seiten indexiert sind. Ein einziger Topf aus
 * allem beantwortet die Frage "sind meine Collections drin?" nie.
 *
 * PRIORITAETEN (mit Markus festgelegt):
 *   Startseite            0.8
 *   Collection-Seiten     0.8   das Geschaeft, dafuer bauen wir das Verzeichnis
 *   Produkt-Detailseiten  0.6
 *   Magazin-Artikel       0.5   (noch keine vorhanden)
 *   Cluster-Hubs          0.2   reine Verteilerseiten
 *
 * EHRLICHKEIT AUCH HIER: In die Sitemap kommt NUR, was oeffentlich erreichbar und
 * indexierbar ist. Eine Collection mit ungepruftem KI-Text traegt noindex, also hat sie
 * in der Sitemap nichts zu suchen. Google eine Seite anzubieten und sie gleichzeitig
 * vom Index auszuschliessen, ist ein Widerspruch, den die Search Console anmeckert und
 * zu Recht.
 */

export type SitemapEintrag = {
  url: string;
  lastmod?: string | null;
  changefreq: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority: number;
};

export function xml(eintraege: SitemapEintrag[]): string {
  const zeilen = eintraege.map(
    (e) => `  <url>
    <loc>${SITE}${e.url}</loc>${e.lastmod ? `\n    <lastmod>${new Date(e.lastmod).toISOString().slice(0, 10)}</lastmod>` : ""}
    <changefreq>${e.changefreq}</changefreq>
    <priority>${e.priority.toFixed(1)}</priority>
  </url>`,
  );
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${zeilen.join("\n")}
</urlset>`;
}

export function antwort(inhalt: string): Response {
  return new Response(inhalt, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      // Eine Stunde. Die Sitemap muss nicht sekundengenau sein, aber sie darf auch nicht
      // tagelang veraltet sein, wenn eine Kategorie live geht.
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
