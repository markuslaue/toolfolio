import { createPublicClient } from "@/lib/supabase/public";

import type { FinderConfig, FinderStatus } from "@/lib/finder";
import type { FaqEintrag } from "@/lib/schema";

export type Zone = "gesponsert" | "organisch" | "community";

/** Ein aus echten Bewertungen destilliertes Thema. Leer, bis es Bewertungen gibt. */
export type ReviewThema = { art: "lob" | "kritik"; thema: string; beleg: number };

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

/**
 * Freigabezustand des Textes.
 *
 * 'geprueft'         Ein Mensch hat gelesen und freigegeben.
 * 'auto_freigegeben' Das naechtliche Qualitaets-Gate hat freigegeben, kein Mensch.
 *
 * Die beiden werden bewusst UNTERSCHIEDEN, aber gleich BEHANDELT: beide sind
 * freigegeben, nur die Herkunft ist eine andere. Wer nachtraeglich wissen will,
 * welche Seiten nie ein Mensch gesehen hat, kann das an genau diesem Feld ablesen.
 */
export type ContentStatus = "fehlt" | "ki_ungeprueft" | "geprueft" | "auto_freigegeben";

/**
 * Darf dieser Text indexierbar ausgeliefert und ausgezeichnet werden?
 *
 * AN EINER STELLE, und das hat einen Grund: Als 'auto_freigegeben' dazukam, pruefte
 * der Code an fuenf Stellen verstreut auf === "geprueft". Die ersten automatisch
 * gebauten Seiten gingen daraufhin live, aber mit noindex, ohne Markup und ohne
 * Eintrag in der Sitemap. Sie waren fuer Google unsichtbar, und niemand haette es
 * gemerkt. Ein verstreuter Vergleich ist eine Frage, die irgendwann jemand vergisst
 * mitzupflegen.
 */
export function istFreigegeben(status: ContentStatus | string | null | undefined): boolean {
  return status === "geprueft" || status === "auto_freigegeben";
}

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
  content_status: ContentStatus;
  content_woerter: number | null;
  experten_zitat: string | null;
  autor_slug: string | null;
  /** Kategoriespezifischer Fragensatz des Finders. Null = noch keiner geschrieben. */
  finder_config: FinderConfig | null;
  finder_status: FinderStatus;
  faq: FaqEintrag[];
  /** Echtes Aktualisierungsdatum. Speist dateModified im JSON-LD. */
  aktualisiert_am: string;
  hero_url: string | null;
  hero_autor: string | null;
  hero_autor_url: string | null;
  /** 'ki' bei selbst erzeugten Bildern, sonst die Bildquelle. */
  hero_quelle: string | null;
  hero_quelle_url: string | null;
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
  affiliate_url: string | null;
  detailseite_status: "keine" | "entwurf" | "veroeffentlicht";
  detail_md: string | null;
  detail_meta_title: string | null;
  detail_meta_description: string | null;
  review_themen: ReviewThema[] | null;
  status: "entwurf" | "ki_ungeprueft" | "redaktionell_geprueft" | "veroeffentlicht";
};

export type ProduktInZone = Produkt & { zone: Zone; position: number; gesponsert_bis: string | null; tags: string[]; rabatt: number | null };
// detailseite_status ist ueber Produkt bereits enthalten.

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
/** Wie viele Kategorien der Hub je Cluster anreisst, bevor er auf den Cluster verweist. */
export const HUB_VORSCHAU = 8;

export type HubCluster = { cluster: Cluster; collections: Collection[]; gesamt: number };

/**
 * Der Hub: alle Cluster mit einer Vorschau ihrer Kategorien.
 *
 * WICHTIG: hier wird NICHT die ganze Tabelle geladen. Supabase deckelt ein
 * select ohne Grenze still bei 1000 Zeilen, und das Verzeichnis hat 1292
 * Kategorien. Ein "select *" haette also stillschweigend Kategorien
 * verschluckt, ohne dass irgendwo ein Fehler auftaucht.
 *
 * Deshalb: Zaehlung per count(), Inhalt nur als Ausschnitt.
 */
export async function getHub(): Promise<HubCluster[]> {
  const sb = createPublicClient();
  const { data: cluster } = await sb.from("dir_cluster").select("*").order("position").order("name");

  return await Promise.all(
    ((cluster ?? []) as Cluster[]).map(async (c) => {
      const [{ data: coll }, { count }] = await Promise.all([
        sb
          .from("dir_collection")
          .select("*")
          .eq("cluster_id", c.id)
          .order("prio")
          .order("name")
          .limit(HUB_VORSCHAU),
        sb.from("dir_collection").select("*", { count: "exact", head: true }).eq("cluster_id", c.id),
      ]);
      return { cluster: c, collections: (coll ?? []) as Collection[], gesamt: count ?? 0 };
    }),
  );
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
  // Bewusst nach Prioritaet und Name, nicht nach position: die Kategorien kommen
  // aus dem Taxonomie-Import, ihre position ist die Importreihenfolge, nicht Redaktion.
  const { data: collections } = await sb
    .from("dir_collection")
    .select("*")
    .eq("cluster_id", (cluster as Cluster).id)
    .order("prio")
    .order("name")
    .limit(500);
  return { cluster: cluster as Cluster, collections: (collections ?? []) as Collection[] };
}

export async function alleCollectionPfade(): Promise<{ cluster: string; collection: string }[]> {
  const sb = createPublicClient();
  const { data } = await sb.from("dir_collection").select("slug, dir_cluster(slug)");
  return (data ?? [])
    .map((d) => {
      const dc = (d as unknown as { slug: string; dir_cluster: { slug: string } | { slug: string }[] }).dir_cluster;
      const cluster = Array.isArray(dc) ? dc[0]?.slug : dc?.slug;
      return { cluster, collection: (d as { slug: string }).slug };
    })
    /* OHNE HUB KEINE ADRESSE.
       Eine veroeffentlichte Kategorie, deren Hub im Entwurf steht, liefert hier
       undefined, und Next bricht den GESAMTEN Build ab: "A required parameter
       (cluster) was not provided". Eine einzige widerspruechliche Zeile in der
       Datenbank legt damit das ganze Deployment lahm.

       Das ist zu zerbrechlich. Die Zeile wird uebersprungen: die Seite ist dann
       ohnehin nicht erreichbar (die RLS blendet den Hub aus), aber alle anderen
       1.270 Seiten bauen sich. Der Widerspruch selbst gehoert behoben, nicht
       verschwiegen, deshalb steht er im Build-Log. */
    .filter((p): p is { cluster: string; collection: string } => {
      if (!p.cluster) {
        console.warn(`[Verzeichnis] "${p.collection}" ist veroeffentlicht, aber ihr Hub nicht. Seite wird nicht gebaut.`);
        return false;
      }
      return true;
    });
}

export async function getCollection(slug: string): Promise<{ collection: Collection; cluster: Cluster; produkte: ProduktInZone[] } | null> {
  const sb = createPublicClient();
  const { data: collection } = await sb.from("dir_collection").select("*").eq("slug", slug).maybeSingle();
  if (!collection) return null;
  const co = collection as Collection;
  const [{ data: cluster }, { data: cp }] = await Promise.all([
    sb.from("dir_cluster").select("*").eq("id", co.cluster_id).maybeSingle(),
    sb.from("dir_collection_produkt").select("zone, position, gesponsert_bis, tags, rabatt_prozent, dir_produkt(*)").eq("collection_id", co.id),
  ]);
  const produkte: ProduktInZone[] = ((cp ?? []) as unknown as { zone: Zone; position: number; gesponsert_bis: string | null; tags: string[] | null; rabatt_prozent: number | null; dir_produkt: Produkt }[])
    .filter((r) => r.dir_produkt)
    .map((r) => ({
      ...r.dir_produkt,
      zone: r.zone,
      position: r.position,
      gesponsert_bis: r.gesponsert_bis,
      tags: r.tags ?? [],
      // Nur wenn wirklich vereinbart. Kein Standardwert: siehe Migration 20260714270000.
      rabatt: r.rabatt_prozent != null ? Number(r.rabatt_prozent) : null,
    }));
  /* Kein Cluster? Dann steht er im Entwurf und die RLS blendet ihn fuer anonyme
     Besucher aus. Frueher lief das in einen Absturz (cluster.slug auf null). Eine
     Kategorie ohne sichtbaren Hub ist unvollstaendig, also gibt es sie fuer den
     Besucher gar nicht: notFound statt 500. */
  if (!cluster) return null;

  return { collection: co, cluster: cluster as Cluster, produkte };
}

export async function alleProduktSlugs(): Promise<string[]> {
  const sb = createPublicClient();
  // NUR Produkte mit veroeffentlichter Detailseite. Alles andere hat keine Seite (404),
  // wird also nicht vorgerendert und steht nicht in der Sitemap.
  const { data } = await sb.from("dir_produkt").select("slug").eq("detailseite_status", "veroeffentlicht");
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
