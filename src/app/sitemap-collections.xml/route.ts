import { createPublicClient } from "@/lib/supabase/public";
import { antwort, xml, type SitemapEintrag } from "@/lib/sitemap";

export const revalidate = 3600;

/**
 * Alle Software-Kategorien und ihre Hubs.
 *
 * Der ANONYME Client liest hier, nicht die Service-Role. Das ist Absicht und keine
 * Nachlaessigkeit: Damit sieht die Sitemap exakt das, was auch ein Besucher sieht.
 * Eine Sitemap, die mehr weiss als die Oeffentlichkeit, listet Seiten, die niemand
 * abrufen kann, und das meldet die Search Console als Fehler.
 *
 * Zusaetzlich der Filter auf geprueften Text: Kategorien mit ungepruftem KI-Text tragen
 * noindex. Google eine Seite anzubieten und sie gleichzeitig vom Index auszuschliessen,
 * ist ein Widerspruch.
 */
export async function GET() {
  const sb = createPublicClient();

  const [{ data: cluster }, { data: collections }] = await Promise.all([
    sb.from("dir_cluster").select("slug").eq("status", "veroeffentlicht"),
    sb
      .from("dir_collection")
      .select("slug, aktualisiert_am, dir_cluster(slug)")
      .eq("status", "veroeffentlicht")
      // Beide Freigabewege zaehlen: gelesen oder vom Gate durchgelassen.
      .in("content_status", ["geprueft", "auto_freigegeben"])
      .limit(50000),
  ]);

  const eintraege: SitemapEintrag[] = [];

  // Die Kategorien: das Geschaeft. Hoechste Prioritaet.
  for (const c of collections ?? []) {
    const clusterSlug = (c.dir_cluster as unknown as { slug: string } | null)?.slug;
    if (!clusterSlug) continue;
    eintraege.push({
      url: `/verzeichnis/${clusterSlug}/${c.slug as string}`,
      lastmod: c.aktualisiert_am as string,
      changefreq: "weekly",
      priority: 0.8,
    });
  }

  // Die Hubs: reine Verteilerseiten. Sie sollen gefunden werden, aber sie sind nicht
  // das Ziel. Priority 0.2, damit sie kein Crawl-Budget von den Kategorien abziehen.
  for (const c of cluster ?? []) {
    eintraege.push({
      url: `/verzeichnis/${c.slug as string}`,
      changefreq: "weekly",
      priority: 0.2,
    });
  }

  return antwort(xml(eintraege));
}
