import { createPublicClient } from "@/lib/supabase/public";
import { antwort, xml, type SitemapEintrag } from "@/lib/sitemap";

export const revalidate = 3600;

/**
 * Die Produkt-Detailseiten.
 *
 * ACHTUNG, der Pfad lautet /software/<slug>, NICHT /verzeichnis/produkt/<slug>.
 * Genau diesen Fehler hatte ich im JSON-LD gemacht: dort standen URLs, die es gar nicht
 * gibt. Eine Sitemap mit toten URLs ist schlimmer als keine.
 */
export async function GET() {
  const sb = createPublicClient();

  const { data } = await sb
    .from("dir_produkt")
    .select("slug")
    .eq("status", "veroeffentlicht")
    .limit(50000);

  const eintraege: SitemapEintrag[] = (data ?? []).map((p) => ({
    url: `/software/${p.slug as string}`,
    changefreq: "weekly",
    priority: 0.6,
  }));

  return antwort(xml(eintraege));
}
