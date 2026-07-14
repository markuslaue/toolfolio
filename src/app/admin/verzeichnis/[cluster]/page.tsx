import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Check, AlertTriangle, Minus } from "lucide-react";
import { redaktionOderRaus } from "@/lib/redaktion";
import { FINDER_STATUS_LABEL, FINDER_STATUS_STIL } from "@/lib/finder";

export const metadata: Metadata = { title: "Redaktion", robots: { index: false, follow: false } };

type Coll = {
  id: string;
  name: string;
  slug: string;
  prio: number;
  status: string;
  content_status: string;
  finder_status: "todo" | "in_review" | "live";
  content_woerter: number | null;
};

export default async function ClusterRedaktion({
  params,
  searchParams,
}: {
  params: Promise<{ cluster: string }>;
  searchParams: Promise<{ finder?: string }>;
}) {
  const { cluster } = await params;
  const filter = (await searchParams)?.finder;
  const { admin } = await redaktionOderRaus(`/admin/verzeichnis/${cluster}`);

  const { data: c } = await admin.from("dir_cluster").select("id, name, slug").eq("slug", cluster).maybeSingle();
  if (!c) notFound();

  const { data: collections } = await admin
    .from("dir_collection")
    .select("id, name, slug, prio, status, content_status, content_woerter, finder_status")
    .eq("cluster_id", c.id)
    .order("prio")
    .order("name");

  const alle = (collections as Coll[]) ?? [];

  /* Filter nach Finder-Status. Als Link, nicht als Client-Komponente: die Redaktion
     soll einen gefilterten Stand verschicken und wiederfinden koennen, und dafuer
     muss er in der URL stehen. */
  const colls = filter && filter !== "alle" ? alle.filter((x) => x.finder_status === filter) : alle;
  const zaehler = {
    alle: alle.length,
    todo: alle.filter((x) => x.finder_status === "todo").length,
    in_review: alle.filter((x) => x.finder_status === "in_review").length,
    live: alle.filter((x) => x.finder_status === "live").length,
  };

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
      <p className="mt-1 text-sm text-muted-foreground">
        {zaehler.alle} Kategorien, nach Priorität sortiert · {zaehler.live} Finder live
      </p>

      <div className="mt-5 flex flex-wrap gap-1.5">
        {(
          [
            ["alle", `Alle (${zaehler.alle})`],
            ["todo", `Finder offen (${zaehler.todo})`],
            ["in_review", `In Prüfung (${zaehler.in_review})`],
            ["live", `Finder live (${zaehler.live})`],
          ] as const
        ).map(([wert, label]) => {
          const aktiv = (filter ?? "alle") === wert;
          return (
            <Link
              key={wert}
              href={wert === "alle" ? `/admin/verzeichnis/${cluster}` : `/admin/verzeichnis/${cluster}?finder=${wert}`}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                aktiv ? "bg-foreground text-background" : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </div>

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
                      <span className={`rounded-full px-1.5 py-0.5 font-medium ${FINDER_STATUS_STIL[x.finder_status]}`}>
                        Finder: {FINDER_STATUS_LABEL[x.finder_status]}
                      </span>
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
