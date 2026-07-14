import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Kuratierung, type CmsProdukt, type CmsCollection } from "@/components/redaktion/kuratierung";
import { LaufKarte } from "@/components/redaktion/lauf-karte";
import { redaktionOderRaus } from "@/lib/redaktion";
import type { ProduktStatus } from "@/lib/redaktion-status";

export const metadata: Metadata = { title: "Kuratierung", robots: { index: false, follow: false } };

export default async function KuratierungsSeite({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { admin } = await redaktionOderRaus(`/admin/verzeichnis/collection/${slug}`);

  const { data } = await admin
    .from("dir_collection")
    .select("id, name, slug, status, content_status, content_woerter, hero_url, dir_cluster(name, slug)")
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
    hero_url: (data.hero_url as string | null) ?? null,
    content_woerter: data.content_woerter,
    cluster: (data.dir_cluster as unknown as { name: string; slug: string }) ?? { name: "Verzeichnis", slug: "" },
  };

  /* Der letzte Lauf dieser Kategorie. Laeuft er noch, nimmt die Karte den Faden auf
     und liest weiter mit: ein Reload darf einen laufenden Lauf nicht "verlieren". */
  const { data: lauf } = await admin
    .from("dir_lauf")
    .select("id, status, phase, fortschritt, protokoll, ergebnis, beendet_am")
    .eq("collection_id", data.id)
    .order("gestartet_am", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (
    <>
      <div className="mx-auto max-w-6xl px-4 pt-10 sm:px-6">
        <LaufKarte
          collectionId={collection.id}
          collectionName={collection.name}
          produkteVorhanden={produkte.length}
          letzterLauf={(lauf as never) ?? null}
        />
      </div>
      <Kuratierung collection={collection} produkte={produkte} />
    </>
  );
}
