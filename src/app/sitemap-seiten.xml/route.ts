import { antwort, xml, type SitemapEintrag } from "@/lib/sitemap";

export const revalidate = 3600;

/**
 * Die eigenen Seiten.
 *
 * Rechtsseiten (Impressum, Datenschutz, AGB) stehen bewusst mit niedriger Prioritaet
 * drin: sie MUESSEN auffindbar sein, aber sie sollen nicht mit den Collections um
 * Crawl-Budget konkurrieren.
 *
 * NICHT drin: /verzeichnis/vorschau/* (noindex, nur Redaktion), /app/* (eingeloggt),
 * /admin/* (eingeloggt). Was Google nicht sehen darf, bietet man ihm auch nicht an.
 */
const SEITEN: SitemapEintrag[] = [
  { url: "/", changefreq: "weekly", priority: 0.8 },
  { url: "/verzeichnis", changefreq: "daily", priority: 0.8 },

  { url: "/preise", changefreq: "monthly", priority: 0.6 },
  { url: "/demo", changefreq: "monthly", priority: 0.5 },
  { url: "/fuer-anbieter", changefreq: "monthly", priority: 0.5 },
  { url: "/ueber-uns", changefreq: "monthly", priority: 0.4 },
  { url: "/kontakt", changefreq: "yearly", priority: 0.4 },
  { url: "/sicherheit", changefreq: "monthly", priority: 0.4 },
  { url: "/partner", changefreq: "monthly", priority: 0.3 },
  { url: "/entwickler", changefreq: "monthly", priority: 0.3 },
  { url: "/changelog", changefreq: "weekly", priority: 0.3 },

  { url: "/impressum", changefreq: "yearly", priority: 0.2 },
  { url: "/datenschutz", changefreq: "yearly", priority: 0.2 },
  { url: "/agb", changefreq: "yearly", priority: 0.2 },
];

export function GET() {
  return antwort(xml(SEITEN));
}
