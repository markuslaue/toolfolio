import { createPublicClient } from "@/lib/supabase/public";

export type Zone = "gesponsert" | "organisch" | "community";

export const ZONE_LABEL: Record<Zone, string> = {
  gesponsert: "Gesponsert",
  organisch: "Organisch",
  community: "Community",
};

export type Cluster = {
  id: string;
  name: string;
  slug: string;
  farbe: string;
  meta_title: string | null;
  meta_description: string | null;
  content_md: string | null;
};

export type Kategorie = {
  id: string;
  cluster_id: string;
  parent_id: string | null;
  ebene: number;
  name: string;
  slug: string;
};

export type Collection = {
  id: string;
  cluster_id: string;
  kategorie_id: string | null;
  name: string;
  slug: string;
  h1: string | null;
  meta_title: string | null;
  meta_description: string | null;
  prio: number;
  fokus_keyword: string | null;
  intro_md: string | null;
  content_md: string | null;
  content_status: "fehlt" | "ki_ungeprueft" | "geprueft";
  content_woerter: number | null;
};

export type Produkt = {
  id: string;
  name: string;
  slug: string;
  anbieter: string | null;
  website_url: string | null;
  logo_url: string | null;
  farbe: string;
  kurzbeschreibung: string | null;
  langbeschreibung: string | null;
  features: string[];
  plattformen: string[];
  einsatzgebiet: string | null;
  pro: string[];
  contra: string[];
  preis_hinweis: string | null;
  preis_stand: string | null;
  preis_quelle_url: string | null;
};

export type ProduktInZone = Produkt & { zone: Zone; position: number; gesponsert_bis: string | null };

export type Review = {
  id: string;
  sterne: number;
  titel: string | null;
  text: string | null;
  verifiziert: boolean;
  autor_name: string | null;
  created_at: string;
};

export type Bewertung = { schnitt: number; anzahl: number; verifiziert: number };

function initialen(name: string): string {
  return name.trim().slice(0, 2).toUpperCase();
}
export { initialen as produktInitialen };

/** Hub: veroeffentlichte Cluster inkl. ihrer Collections (fuer die Startseite). */
export async function getHub(): Promise<{ cluster: Cluster; collections: Collection[] }[]> {
  const sb = createPublicClient();
  const [{ data: cluster }, { data: collections }] = await Promise.all([
    sb.from("dir_cluster").select("*").order("position"),
    sb.from("dir_collection").select("*").order("position"),
  ]);
  return (cluster ?? []).map((c) => ({
    cluster: c as Cluster,
    collections: ((collections ?? []) as Collection[]).filter((co) => co.cluster_id === (c as Cluster).id),
  }));
}

export async function alleClusterSlugs(): Promise<string[]> {
  const sb = createPublicClient();
  const { data } = await sb.from("dir_cluster").select("slug");
  return (data ?? []).map((d) => d.slug as string);
}

export async function getCluster(slug: string): Promise<{ cluster: Cluster; collections: Collection[] } | null> {
  const sb = createPublicClient();
  const { data: cluster } = await sb.from("dir_cluster").select("*").eq("slug", slug).maybeSingle();
  if (!cluster) return null;
  const { data: collections } = await sb.from("dir_collection").select("*").eq("cluster_id", (cluster as Cluster).id).order("position");
  return { cluster: cluster as Cluster, collections: (collections ?? []) as Collection[] };
}

export async function alleCollectionPfade(): Promise<{ cluster: string; collection: string }[]> {
  const sb = createPublicClient();
  const { data } = await sb.from("dir_collection").select("slug, dir_cluster(slug)");
  return (data ?? []).map((d) => {
    const dc = (d as unknown as { slug: string; dir_cluster: { slug: string } | { slug: string }[] }).dir_cluster;
    const cluster = Array.isArray(dc) ? dc[0]?.slug : dc?.slug;
    return { cluster: cluster as string, collection: (d as { slug: string }).slug };
  });
}

export async function getCollection(slug: string): Promise<{ collection: Collection; cluster: Cluster; produkte: ProduktInZone[] } | null> {
  const sb = createPublicClient();
  const { data: collection } = await sb.from("dir_collection").select("*").eq("slug", slug).maybeSingle();
  if (!collection) return null;
  const co = collection as Collection;
  const [{ data: cluster }, { data: cp }] = await Promise.all([
    sb.from("dir_cluster").select("*").eq("id", co.cluster_id).maybeSingle(),
    sb.from("dir_collection_produkt").select("zone, position, gesponsert_bis, dir_produkt(*)").eq("collection_id", co.id),
  ]);
  const produkte: ProduktInZone[] = ((cp ?? []) as unknown as { zone: Zone; position: number; gesponsert_bis: string | null; dir_produkt: Produkt }[])
    .filter((r) => r.dir_produkt)
    .map((r) => ({ ...r.dir_produkt, zone: r.zone, position: r.position, gesponsert_bis: r.gesponsert_bis }));
  return { collection: co, cluster: cluster as Cluster, produkte };
}

export async function alleProduktSlugs(): Promise<string[]> {
  const sb = createPublicClient();
  const { data } = await sb.from("dir_produkt").select("slug").eq("status", "veroeffentlicht");
  return (data ?? []).map((d) => d.slug as string);
}

export async function getProdukt(slug: string): Promise<{ produkt: Produkt; bewertung: Bewertung; reviews: Review[]; collections: { name: string; slug: string; cluster_slug: string }[] } | null> {
  const sb = createPublicClient();
  const { data: produkt } = await sb.from("dir_produkt").select("*").eq("slug", slug).maybeSingle();
  if (!produkt) return null;
  const p = produkt as Produkt;
  const [{ data: reviews }, { data: inCollections }] = await Promise.all([
    sb.from("dir_review").select("id, sterne, titel, text, verifiziert, autor_name, created_at").eq("produkt_id", p.id).eq("status", "freigegeben").order("created_at", { ascending: false }),
    sb.from("dir_collection_produkt").select("dir_collection(name, slug, dir_cluster(slug))").eq("produkt_id", p.id),
  ]);
  const revs = (reviews ?? []) as Review[];
  const anzahl = revs.length;
  const schnitt = anzahl ? Math.round((revs.reduce((s, r) => s + r.sterne, 0) / anzahl) * 10) / 10 : 0;
  const verifiziert = revs.filter((r) => r.verifiziert).length;
  const collections = ((inCollections ?? []) as unknown as { dir_collection: { name: string; slug: string; dir_cluster: { slug: string } } }[])
    .filter((r) => r.dir_collection)
    .map((r) => ({ name: r.dir_collection.name, slug: r.dir_collection.slug, cluster_slug: r.dir_collection.dir_cluster.slug }));
  return { produkt: p, bewertung: { schnitt, anzahl, verifiziert }, reviews: revs, collections };
}

/** Bewertungs-Aggregate fuer eine Menge Produkte (schnitt, anzahl, verifiziert). */
export async function bewertungenFuer(produktIds: string[]): Promise<Map<string, Bewertung>> {
  const out = new Map<string, Bewertung>();
  if (produktIds.length === 0) return out;
  const sb = createPublicClient();
  const { data } = await sb.from("dir_review").select("produkt_id, sterne, verifiziert").eq("status", "freigegeben").in("produkt_id", produktIds);
  const grp = new Map<string, { sterne: number; verifiziert: boolean }[]>();
  for (const r of (data ?? []) as { produkt_id: string; sterne: number; verifiziert: boolean }[]) {
    grp.set(r.produkt_id, [...(grp.get(r.produkt_id) ?? []), r]);
  }
  for (const [id, revs] of grp) {
    const anzahl = revs.length;
    const schnitt = Math.round((revs.reduce((s, r) => s + r.sterne, 0) / anzahl) * 10) / 10;
    out.set(id, { schnitt, anzahl, verifiziert: revs.filter((r) => r.verifiziert).length });
  }
  return out;
}

/**
 * Organischer Rang-Score (serverseitig, UNABHAENGIG von bezahlter Sichtbarkeit):
 * verifizierte Bewertungen zaehlen am staerksten, dann Schnitt, dann Vollstaendigkeit.
 */
export function organischerScore(p: Produkt, b?: Bewertung): number {
  const reviews = b ? b.verifiziert * 3 + (b.anzahl - b.verifiziert) + b.schnitt : 0;
  const voll = (p.features.length + p.pro.length + p.plattformen.length) / 10 + (p.langbeschreibung ? 1 : 0);
  return reviews + voll;
}

/** Einfache Volltextsuche ueber Produktnamen/Anbieter und Collections. */
export async function sucheVerzeichnis(q: string): Promise<{ produkte: Produkt[]; collections: Collection[] }> {
  const sb = createPublicClient();
  const like = `%${q}%`;
  const [{ data: produkte }, { data: collections }] = await Promise.all([
    sb.from("dir_produkt").select("*").eq("status", "veroeffentlicht").or(`name.ilike.${like},anbieter.ilike.${like},kurzbeschreibung.ilike.${like}`).limit(30),
    sb.from("dir_collection").select("*").ilike("name", like).limit(20),
  ]);
  return { produkte: (produkte ?? []) as Produkt[], collections: (collections ?? []) as Collection[] };
}
