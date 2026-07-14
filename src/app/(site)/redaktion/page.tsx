import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, FileText, Package } from "lucide-react";
import { redaktionOderRaus } from "@/lib/redaktion";

export const metadata: Metadata = { title: "Redaktion", robots: { index: false, follow: false } };

type ClusterRow = { id: string; name: string; slug: string; farbe: string; status: string };

export default async function RedaktionPage() {
  const { admin } = await redaktionOderRaus("/redaktion");

  const [{ data: cluster }, { data: collections }, { data: zuordnungen }] = await Promise.all([
    admin.from("dir_cluster").select("id, name, slug, farbe, status").order("name"),
    admin.from("dir_collection").select("id, cluster_id, status, content_status"),
    admin.from("dir_collection_produkt").select("collection_id"),
  ]);

  type Coll = { id: string; cluster_id: string; status: string; content_status: string };
  const colls = (collections as Coll[]) ?? [];
  const produkteJeCollection = new Map<string, number>();
  for (const z of ((zuordnungen as { collection_id: string }[]) ?? [])) {
    produkteJeCollection.set(z.collection_id, (produkteJeCollection.get(z.collection_id) ?? 0) + 1);
  }

  const zeilen = ((cluster as ClusterRow[]) ?? []).map((c) => {
    const meine = colls.filter((x) => x.cluster_id === c.id);
    return {
      ...c,
      collections: meine.length,
      live: meine.filter((x) => x.status === "veroeffentlicht").length,
      mitText: meine.filter((x) => x.content_status !== "fehlt").length,
      produkte: meine.reduce((s, x) => s + (produkteJeCollection.get(x.id) ?? 0), 0),
    };
  });

  const gesamt = {
    collections: colls.length,
    live: colls.filter((c) => c.status === "veroeffentlicht").length,
    produkte: [...produkteJeCollection.values()].reduce((s, n) => s + n, 0),
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl font-semibold tracking-tight">Redaktion</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {gesamt.collections} Kategorien in {zeilen.length} Clustern · {gesamt.live} live · {gesamt.produkte} Produkte
        zugeordnet
      </p>

      <div className="mt-8 overflow-hidden rounded-2xl border bg-card">
        <ul className="divide-y">
          {zeilen.map((c) => (
            <li key={c.id}>
              <Link
                href={`/redaktion/${c.slug}`}
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
