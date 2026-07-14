import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, FileText, Package, Search } from "lucide-react";
import { redaktionOderRaus } from "@/lib/redaktion";

export const metadata: Metadata = { title: "Redaktion", robots: { index: false, follow: false } };

type ClusterRow = { id: string; name: string; slug: string; farbe: string; status: string };

export default async function RedaktionPage() {
  const { admin } = await redaktionOderRaus("/admin/verzeichnis");

  const { data: cluster } = await admin.from("dir_cluster").select("id, name, slug, farbe, status").order("name");

  /* Achtung: Supabase deckelt ein select ohne Grenze STILL bei 1000 Zeilen, und das
     Verzeichnis hat 1292 Kategorien. Deshalb je Cluster zaehlen statt alles laden.
     Ein "select id, cluster_id" haette hier 292 Kategorien verschluckt, ohne Fehler. */
  const zeilen = await Promise.all(
    ((cluster as ClusterRow[]) ?? []).map(async (c) => {
      const [gesamtZ, liveZ, ohneTextZ, finderLiveZ, finderPruefZ, collIds] = await Promise.all([
        admin.from("dir_collection").select("*", { count: "exact", head: true }).eq("cluster_id", c.id),
        admin
          .from("dir_collection")
          .select("*", { count: "exact", head: true })
          .eq("cluster_id", c.id)
          .eq("status", "veroeffentlicht"),
        admin
          .from("dir_collection")
          .select("*", { count: "exact", head: true })
          .eq("cluster_id", c.id)
          .eq("content_status", "fehlt"),
        // Der Finder-Fortschritt ist die eigentliche Steuerung des Rollouts:
        // jede Kategorie braucht einen eigenen Fragensatz, und wir arbeiten Hub fuer Hub.
        admin
          .from("dir_collection")
          .select("*", { count: "exact", head: true })
          .eq("cluster_id", c.id)
          .eq("finder_status", "live"),
        admin
          .from("dir_collection")
          .select("*", { count: "exact", head: true })
          .eq("cluster_id", c.id)
          .eq("finder_status", "in_review"),
        admin.from("dir_collection").select("id").eq("cluster_id", c.id).limit(1000),
      ]);

      const ids = ((collIds.data as { id: string }[]) ?? []).map((x) => x.id);
      const { count: produkte } = ids.length
        ? await admin
            .from("dir_collection_produkt")
            .select("*", { count: "exact", head: true })
            .in("collection_id", ids)
        : { count: 0 };

      const anzahl = gesamtZ.count ?? 0;
      return {
        ...c,
        collections: anzahl,
        live: liveZ.count ?? 0,
        mitText: anzahl - (ohneTextZ.count ?? 0),
        produkte: produkte ?? 0,
        finderLive: finderLiveZ.count ?? 0,
        finderPruef: finderPruefZ.count ?? 0,
      };
    }),
  );

  const gesamt = {
    collections: zeilen.reduce((s, z) => s + z.collections, 0),
    live: zeilen.reduce((s, z) => s + z.live, 0),
    produkte: zeilen.reduce((s, z) => s + z.produkte, 0),
    finderLive: zeilen.reduce((s, z) => s + z.finderLive, 0),
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl font-semibold tracking-tight">Redaktion</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {gesamt.collections} Kategorien in {zeilen.length} Clustern · {gesamt.live} live · {gesamt.produkte} Produkte
        zugeordnet · {gesamt.finderLive} Finder live
      </p>

      <div className="mt-8 overflow-hidden rounded-2xl border bg-card">
        <ul className="divide-y">
          {zeilen.map((c) => (
            <li key={c.id}>
              <Link
                href={`/admin/verzeichnis/${c.slug}`}
                className="flex items-center gap-4 px-4 py-3.5 transition-colors hover:bg-muted/40"
              >
                <span className="size-3 shrink-0 rounded-full" style={{ background: c.farbe }} />
                <div className="min-w-0 flex-1">
                  <div className="font-medium">{c.name}</div>
                  <div className="mt-0.5 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
                    <span>{c.collections} Kategorien</span>
                    <span className="inline-flex items-center gap-1">
                      <FileText className="size-3" /> {c.mitText} mit Text
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Package className="size-3" /> {c.produkte} Produkte
                    </span>
                    {c.live > 0 && <span className="font-medium text-success">{c.live} live</span>}
                  </div>

                  {/* Finder-Fortschritt: die Steuerung des Rollouts. Jede Kategorie
                      braucht einen eigenen Fragensatz, und man sieht hier auf einen
                      Blick, wie weit dieser Cluster ist. */}
                  <div className="mt-2 flex items-center gap-2">
                    <div className="h-1 w-24 overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full bg-emerald-500"
                        style={{ width: `${c.collections ? (c.finderLive / c.collections) * 100 : 0}%` }}
                      />
                    </div>
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <Search className="size-3" />
                      {c.finderLive} von {c.collections} Findern live
                      {c.finderPruef > 0 && ` · ${c.finderPruef} in Prüfung`}
                    </span>
                  </div>
                </div>
                <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
