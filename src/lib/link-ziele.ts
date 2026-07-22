import "server-only";
import { unstable_cache } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import type { InternerLink } from "@/lib/interne-links";

/**
 * AD-16: Die Linkziele fuer die interne Verlinkung.
 *
 * Jede VEROEFFENTLICHTE Kollektion ist ein Ziel unter ihrem Namen. Nur veroeffentlichte:
 * ein Link auf einen Entwurf waere ein 404, und das ist schlechter als kein Link.
 *
 * Gecacht, weil dieselbe Liste auf jeder Kollektionsseite gebraucht wird und sich nur
 * aendert, wenn eine Kollektion live geht. Er frischt alle 10 Minuten nach; der Tag bleibt fuer spaeteres gezieltes
 * Veroeffentlichen gezielt zu verwerfen; ansonsten frischt er alle 10 Minuten nach.
 */
export const ladeLinkZiele = unstable_cache(
  async (): Promise<InternerLink[]> => {
    const sb = createPublicClient();
    const { data } = await sb
      .from("dir_collection")
      .select("name, slug, dir_cluster!inner(slug, status)")
      .eq("status", "veroeffentlicht")
      .in("content_status", ["geprueft", "auto_freigegeben"])
      .limit(5000);

    return (data ?? [])
      .map((c) => {
        const hub = c.dir_cluster as unknown as { slug: string; status: string } | null;
        if (!hub || hub.status !== "veroeffentlicht") return null;
        return { begriff: c.name as string, url: `/verzeichnis/${hub.slug}/${c.slug as string}` };
      })
      .filter((x): x is InternerLink => x !== null);
  },
  ["interne-link-ziele"],
  { revalidate: 600, tags: ["link-ziele"] },
);
