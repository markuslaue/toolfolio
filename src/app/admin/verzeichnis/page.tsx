import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, FileText, Package, Search } from "lucide-react";
import { redaktionOderRaus } from "@/lib/redaktion";

export const metadata: Metadata = { title: "Redaktion", robots: { index: false, follow: false } };

/**
 * Eine Zeile der Sicht dir_cluster_stats.
 *
 * Diese Seite stellte frueher 183 Abfragen: je Cluster fuenf Zaehlungen, dann alle
 * Collection-IDs geladen und die Produkte mit einem Filter ueber bis zu 1000 UUIDs
 * gezaehlt. Das war nicht langsam, weil das Verzeichnis gross ist, sondern weil die
 * Arbeit im Anwendungscode statt in der Datenbank gemacht wurde. Jetzt: eine Abfrage.
 */
type ClusterStat = {
  id: string;
  name: string;
  slug: string;
  farbe: string;
  status: string;
  collections: number;
  live: number;
  mit_text: number;
  text_ungeprueft: number;
  finder_live: number;
  finder_pruef: number;
  produkte: number;
};

export default async function RedaktionPage() {
  const { admin } = await redaktionOderRaus("/admin/verzeichnis");

  const { data } = await admin.from("dir_cluster_stats").select("*").order("name");
  const zeilen = (data as ClusterStat[]) ?? [];

  const gesamt = {
    collections: zeilen.reduce((s, z) => s + Number(z.collections), 0),
    live: zeilen.reduce((s, z) => s + Number(z.live), 0),
    produkte: zeilen.reduce((s, z) => s + Number(z.produkte), 0),
    finderLive: zeilen.reduce((s, z) => s + Number(z.finder_live), 0),
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
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">{c.name}</span>
                    {c.status === "veroeffentlicht" && (
                      <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-800">
                        Hub live
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
                    <span>{c.collections} Kategorien</span>
                    <span className="inline-flex items-center gap-1">
                      <FileText className="size-3" /> {c.mit_text} mit Text
                      {Number(c.text_ungeprueft) > 0 && (
                        <span className="text-warning">({c.text_ungeprueft} ungeprüft)</span>
                      )}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Package className="size-3" /> {c.produkte} Produkte
                    </span>
                    {Number(c.live) > 0 && <span className="font-medium text-success">{c.live} live</span>}
                  </div>

                  {/* Finder-Fortschritt: die Steuerung des Rollouts. Jede Kategorie
                      braucht einen eigenen Fragensatz, und man sieht hier auf einen
                      Blick, wie weit dieser Cluster ist. */}
                  <div className="mt-2 flex items-center gap-2">
                    <div className="h-1 w-24 overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full bg-emerald-500"
                        style={{
                          width: `${Number(c.collections) ? (Number(c.finder_live) / Number(c.collections)) * 100 : 0}%`,
                        }}
                      />
                    </div>
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <Search className="size-3" />
                      {c.finder_live} von {c.collections} Findern live
                      {Number(c.finder_pruef) > 0 && ` · ${c.finder_pruef} in Prüfung`}
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
