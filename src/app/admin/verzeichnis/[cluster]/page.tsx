import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Check, AlertTriangle, Minus } from "lucide-react";
import { redaktionOderRaus } from "@/lib/redaktion";

export const metadata: Metadata = { title: "Redaktion", robots: { index: false, follow: false } };

type Coll = {
  id: string;
  name: string;
  slug: string;
  prio: number;
  status: string;
  content_status: string;
  content_woerter: number | null;
};

export default async function ClusterRedaktion({ params }: { params: Promise<{ cluster: string }> }) {
  const { cluster } = await params;
  const { admin } = await redaktionOderRaus(`/admin/verzeichnis/${cluster}`);

  const { data: c } = await admin.from("dir_cluster").select("id, name, slug").eq("slug", cluster).maybeSingle();
  if (!c) notFound();

  const { data: collections } = await admin
    .from("dir_collection")
    .select("id, name, slug, prio, status, content_status, content_woerter")
    .eq("cluster_id", c.id)
    .order("prio")
    .order("name");

  const colls = (collections as Coll[]) ?? [];
  const ids = colls.map((x) => x.id);
  const { data: zuordnungen } = ids.length
    ? await admin.from("dir_collection_produkt").select("collection_id").in("collection_id", ids)
    : { data: [] };

  const produkte = new Map<string, number>();
  for (const z of ((zuordnungen as { collection_id: string }[]) ?? [])) {
    produkte.set(z.collection_id, (produkte.get(z.collection_id) ?? 0) + 1);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <nav className="text-sm text-muted-foreground">
        <Link href="/admin/verzeichnis" className="hover:text-foreground">
          Redaktion
        </Link>
      </nav>
      <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight">{c.name}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{colls.length} Kategorien, nach Priorität sortiert</p>

      <div className="mt-8 overflow-hidden rounded-2xl border bg-card">
        <ul className="divide-y">
          {colls.map((x) => {
            const n = produkte.get(x.id) ?? 0;
            return (
              <li key={x.id}>
                <Link
                  href={`/admin/verzeichnis/collection/${x.slug}`}
                  className="flex items-center gap-4 px-4 py-3 transition-colors hover:bg-muted/40"
                >
                  <span className="w-8 shrink-0 text-xs font-mono text-muted-foreground">P{x.prio}</span>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium">{x.name}</div>
                    <div className="mt-0.5 flex flex-wrap gap-x-3 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        {x.content_status === "geprueft" ? (
                          <Check className="size-3 text-success" />
                        ) : x.content_status === "ki_ungeprueft" ? (
                          <AlertTriangle className="size-3 text-warning" />
                        ) : (
                          <Minus className="size-3" />
                        )}
                        {x.content_status === "fehlt" ? "kein Text" : `${x.content_woerter ?? 0} Wörter`}
                      </span>
                      <span>{n} Produkte</span>
                      {x.status === "veroeffentlicht" && <span className="font-medium text-success">live</span>}
                    </div>
                  </div>
                  <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
