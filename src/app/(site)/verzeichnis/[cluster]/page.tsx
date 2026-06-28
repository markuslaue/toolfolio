import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Layers } from "lucide-react";
import { Breadcrumb } from "@/components/verzeichnis/breadcrumb";
import { getCluster, alleClusterSlugs } from "@/lib/verzeichnis";

export const revalidate = 600;

export async function generateStaticParams() {
  return (await alleClusterSlugs()).map((cluster) => ({ cluster }));
}

export async function generateMetadata({ params }: { params: Promise<{ cluster: string }> }): Promise<Metadata> {
  const { cluster } = await params;
  const data = await getCluster(cluster);
  if (!data) return { title: "Nicht gefunden" };
  return {
    title: data.cluster.meta_title ?? data.cluster.name,
    description: data.cluster.meta_description ?? undefined,
  };
}

export default async function ClusterSeite({ params }: { params: Promise<{ cluster: string }> }) {
  const { cluster } = await params;
  const data = await getCluster(cluster);
  if (!data) notFound();

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <Breadcrumb items={[{ name: "Verzeichnis", href: "/verzeichnis" }, { name: data.cluster.name }]} />

      <div className="mt-6 flex items-center gap-3">
        <span className="grid size-12 place-items-center rounded-2xl text-white" style={{ backgroundColor: data.cluster.farbe }}>
          <Layers className="size-6" />
        </span>
        <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">{data.cluster.name}</h1>
      </div>
      {data.cluster.content_md && <p className="mt-3 max-w-2xl text-muted-foreground">{data.cluster.content_md}</p>}

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data.collections.map((co) => (
          <Link
            key={co.id}
            href={`/verzeichnis/${data.cluster.slug}/${co.slug}`}
            className="group flex flex-col rounded-2xl border border-border bg-card p-5 shadow-soft transition-colors hover:border-primary/40"
          >
            <div className="font-display text-lg font-semibold group-hover:text-primary">{co.name}</div>
            {co.meta_description && <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{co.meta_description}</p>}
            <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
              Vergleich ansehen <ArrowRight className="size-4" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
