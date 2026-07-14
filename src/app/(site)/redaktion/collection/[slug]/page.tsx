import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Kuratierung, type CmsProdukt, type CmsCollection } from "@/components/redaktion/kuratierung";
import { redaktionOderRaus } from "@/lib/redaktion";
import type { ProduktStatus } from "@/lib/redaktion-status";

export const metadata: Metadata = { title: "Kuratierung", robots: { index: false, follow: false } };

export default async function KuratierungsSeite({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { admin } = await redaktionOderRaus(`/redaktion/collection/${slug}`);

  const { data } = await admin
    .from("dir_collection")
    .select("id, name, slug, status, content_status, content_woerter, dir_cluster(name, slug)")
    .eq("slug", slug)
    .maybeSingle();
  if (!data) notFound();

  const { data: cp } = await admin
    .from("dir_collection_produkt")
    .select("zone, position, dir_produkt(id, name, slug, anbieter, website_url, kurzbeschreibung, preis_hinweis, status)")
    .eq("collection_id", data.id)
    .order("position");

  type Row = {
    zone: CmsProdukt["zone"];
    position: number;
    dir_produkt: {
      id: string;
      name: string;
      slug: string;
      anbieter: string | null;
      website_url: string | null;
      kurzbeschreibung: string | null;
      preis_hinweis: string | null;
      status: ProduktStatus;
    } | null;
  };

  const produkte: CmsProdukt[] = ((cp ?? []) as unknown as Row[])
    .filter((r) => r.dir_produkt)
    .map((r) => ({ ...r.dir_produkt!, zone: r.zone }));

  const collection: CmsCollection = {
    id: data.id,
    name: data.name,
    slug: data.slug,
    status: data.status as CmsCollection["status"],
    content_status: data.content_status as CmsCollection["content_status"],
    content_woerter: data.content_woerter,
    cluster: (data.dir_cluster as unknown as { name: string; slug: string }) ?? { name: "Verzeichnis", slug: "" },
  };

  return <Kuratierung collection={collection} produkte={produkte} />;
}
