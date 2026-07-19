"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redaktionOderFehler } from "@/lib/redaktion";
import { PRODUKT_STATUS } from "@/lib/redaktion-status";
import { erzeugeHero } from "@/lib/hero-bild";

export type RedaktionResult = { ok?: boolean; error?: string };


/**
 * Den oeffentlichen Cache einer Kategorie verwerfen.
 *
 * WARUM DAS NOETIG IST: Die Collection-Route ist ISR mit 600 Sekunden. Jede Aenderung an
 * Produkten, Zonen oder Status wirkt sich auf die oeffentliche Seite aus, aber ohne
 * diesen Aufruf sieht der Besucher (und die Redaktion) bis zu zehn Minuten lang den
 * alten Stand. Genau daran ist eine frisch gesetzte Anzeige unsichtbar geblieben.
 *
 * Der Aufruf ist billig, und die Alternative ist "warum sehe ich meine Aenderung nicht".
 * Also wird er ueberall gemacht, wo sich oeffentlich etwas aendert.
 */
async function verwerfeOeffentlich(collectionSlug: string): Promise<void> {
  const w = await redaktionOderFehler();
  if (!w.ok) return;

  const { data } = await w.admin
    .from("dir_collection")
    .select("slug, dir_cluster(slug)")
    .eq("slug", collectionSlug)
    .maybeSingle();

  const clusterSlug = (data?.dir_cluster as unknown as { slug: string } | null)?.slug;
  if (clusterSlug && data?.slug) {
    revalidatePath(`/verzeichnis/${clusterSlug}/${data.slug}`);
    revalidatePath(`/verzeichnis/${clusterSlug}`);
  }
}

/* ------------------------------- Produkte -------------------------------- */

/** Status eines Produkts setzen (Selektion und Deselektion). */
export async function setProduktStatus(produktId: string, status: string, collectionSlug: string): Promise<RedaktionResult> {
  const parsed = z.enum(PRODUKT_STATUS).safeParse(status);
  if (!parsed.success) return { error: "Unbekannter Status." };

  const w = await redaktionOderFehler();
  if (!w.ok) return { error: w.error };

  const { error } = await w.admin.from("dir_produkt").update({ status: parsed.data }).eq("id", produktId);
  if (error) return { error: "Status konnte nicht gesetzt werden." };

  await verwerfeOeffentlich(collectionSlug);
  revalidatePath(`/admin/verzeichnis/collection/${collectionSlug}`);
  return { ok: true };
}

/** Mehrere Produkte auf einmal. Der Alltag der Kuratierung ist Stapelarbeit. */
export async function setProduktStatusViele(
  produktIds: string[],
  status: string,
  collectionSlug: string,
): Promise<RedaktionResult> {
  const parsed = z.enum(PRODUKT_STATUS).safeParse(status);
  if (!parsed.success) return { error: "Unbekannter Status." };
  if (produktIds.length === 0) return { error: "Nichts ausgewählt." };

  const w = await redaktionOderFehler();
  if (!w.ok) return { error: w.error };

  const { error } = await w.admin.from("dir_produkt").update({ status: parsed.data }).in("id", produktIds);
  if (error) return { error: "Status konnte nicht gesetzt werden." };

  await verwerfeOeffentlich(collectionSlug);
  revalidatePath(`/admin/verzeichnis/collection/${collectionSlug}`);
  return { ok: true };
}

/** Produkt aus der Collection nehmen. Das Produkt selbst bleibt bestehen. */
export async function entferneAusCollection(
  produktId: string,
  collectionId: string,
  collectionSlug: string,
): Promise<RedaktionResult> {
  const w = await redaktionOderFehler();
  if (!w.ok) return { error: w.error };

  const { error } = await w.admin
    .from("dir_collection_produkt")
    .delete()
    .eq("produkt_id", produktId)
    .eq("collection_id", collectionId);
  if (error) return { error: "Zuordnung konnte nicht entfernt werden." };

  await verwerfeOeffentlich(collectionSlug);
  revalidatePath(`/admin/verzeichnis/collection/${collectionSlug}`);
  return { ok: true };
}

/** Name und Anbieter korrigieren. Der Slug bleibt, sobald etwas live ist. */
export async function korrigiereProdukt(
  produktId: string,
  name: string,
  anbieter: string,
  collectionSlug: string,
): Promise<RedaktionResult> {
  const parsed = z
    .object({ name: z.string().trim().min(1, "Der Name darf nicht leer sein.").max(120), anbieter: z.string().trim().max(120) })
    .safeParse({ name, anbieter });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Bitte prüfe die Eingabe." };

  const w = await redaktionOderFehler();
  if (!w.ok) return { error: w.error };

  const { error } = await w.admin
    .from("dir_produkt")
    .update({ name: parsed.data.name, anbieter: parsed.data.anbieter || null })
    .eq("id", produktId);
  if (error) return { error: "Konnte nicht gespeichert werden." };

  await verwerfeOeffentlich(collectionSlug);
  revalidatePath(`/admin/verzeichnis/collection/${collectionSlug}`);
  return { ok: true };
}

/**
 * Affiliate-Link eines Produkts setzen (A-07).
 *
 * Ist er gesetzt, verdient Toolfolio an einem Klick, und GENAU DANN wird der Link im
 * Frontend als Affiliate gekennzeichnet und mit rel="sponsored" ausgezeichnet.
 * Leer = wir sind nicht (mehr) im Programm, der Link zeigt wieder direkt zum Anbieter.
 *
 * DIE ZONE AENDERT SICH NICHT. Ein organisch platziertes Tool bleibt organisch, auch
 * wenn wir an ihm verdienen. Gekennzeichnet wird der Link, nicht der Rang (Goldene Regel).
 */
export async function setAffiliate(produktId: string, affiliateUrl: string, collectionSlug: string): Promise<RedaktionResult> {
  const roh = affiliateUrl.trim();
  if (roh) {
    try {
      const u = new URL(roh);
      if (u.protocol !== "https:" && u.protocol !== "http:") throw new Error();
    } catch {
      return { error: "Der Affiliate-Link ist keine gültige URL." };
    }
  }

  const w = await redaktionOderFehler();
  if (!w.ok) return { error: w.error };

  const { error } = await w.admin
    .from("dir_produkt")
    .update({
      affiliate_url: roh || null,
      affiliate_seit: roh ? new Date().toISOString() : null,
    })
    .eq("id", produktId);
  if (error) return { error: "Affiliate-Link konnte nicht gespeichert werden." };

  await verwerfeOeffentlich(collectionSlug);
  revalidatePath(`/admin/verzeichnis/collection/${collectionSlug}`);
  return { ok: true };
}

/** Zone eines Produkts in dieser Collection setzen (goldene Regel: gesponsert ist gekennzeichnet). */
export async function setZone(
  produktId: string,
  collectionId: string,
  zone: string,
  collectionSlug: string,
): Promise<RedaktionResult> {
  const parsed = z.enum(["gesponsert", "organisch", "community"]).safeParse(zone);
  if (!parsed.success) return { error: "Unbekannte Zone." };

  const w = await redaktionOderFehler();
  if (!w.ok) return { error: w.error };

  const { error } = await w.admin
    .from("dir_collection_produkt")
    .update({ zone: parsed.data })
    .eq("produkt_id", produktId)
    .eq("collection_id", collectionId);
  if (error) return { error: "Zone konnte nicht gesetzt werden." };

  await verwerfeOeffentlich(collectionSlug);
  revalidatePath(`/admin/verzeichnis/collection/${collectionSlug}`);
  return { ok: true };
}

/* ------------------------------ Collection ------------------------------- */

/** Den KI-Text freigeben. Erst danach laesst der DB-Trigger das Veroeffentlichen zu. */
export async function gibContentFrei(collectionId: string, collectionSlug: string): Promise<RedaktionResult> {
  const w = await redaktionOderFehler();
  if (!w.ok) return { error: w.error };

  const { error } = await w.admin
    .from("dir_collection")
    .update({ content_status: "geprueft" })
    .eq("id", collectionId);
  if (error) return { error: "Freigabe fehlgeschlagen." };

  revalidatePath(`/admin/verzeichnis/collection/${collectionSlug}`);
  return { ok: true };
}

/**
 * Collection veroeffentlichen. Kann fehlschlagen, und das ist Absicht:
 * ein Trigger in der Datenbank verhindert das Veroeffentlichen, solange der
 * KI-Text nicht freigegeben ist.
 */
export async function veroeffentliche(collectionId: string, collectionSlug: string): Promise<RedaktionResult> {
  const w = await redaktionOderFehler();
  if (!w.ok) return { error: w.error };

  /* DEN HUB MITNEHMEN.
     Eine veroeffentlichte Kategorie unter einem Cluster im Entwurf ist ein Widerspruch:
     die RLS blendet den Cluster fuer anonyme Besucher aus, die Seite findet ihren
     eigenen Hub nicht mehr und stuerzt ab. Genau das ist passiert. Wer eine Kategorie
     freigibt, gibt damit zwangslaeufig auch ihren Hub frei. */
  const { data: coll } = await w.admin
    .from("dir_collection")
    .select("cluster_id")
    .eq("id", collectionId)
    .maybeSingle();
  if (coll?.cluster_id) {
    await w.admin
      .from("dir_cluster")
      .update({ status: "veroeffentlicht" })
      .eq("id", coll.cluster_id)
      .eq("status", "entwurf");
  }

  const { error } = await w.admin
    .from("dir_collection")
    .update({ status: "veroeffentlicht" })
    .eq("id", collectionId);
  if (error) {
    return {
      error: error.message.includes("ungeprueft")
        ? "Der Text ist noch nicht freigegeben. Erst lesen und freigeben, dann veröffentlichen."
        : "Veröffentlichen fehlgeschlagen.",
    };
  }

  /* Den oeffentlichen Cache GEZIELT verwerfen.
     revalidatePath("/verzeichnis", "layout") sieht so aus, als raeume es alles auf,
     trifft die vorgerenderte Collection-Seite aber nicht zuverlaessig. Die Route ist
     ISR mit 600 Sekunden, und wenn der alte Stand ein 404 war (weil der Hub noch im
     Entwurf stand), bleibt die frisch freigegebene Seite bis zu zehn Minuten lang eine
     404. Genau das ist passiert. Deshalb hier der konkrete Pfad. */
  const { data: pfad } = await w.admin
    .from("dir_collection")
    .select("slug, dir_cluster(slug)")
    .eq("id", collectionId)
    .maybeSingle();
  const clusterSlug = (pfad?.dir_cluster as unknown as { slug: string } | null)?.slug;
  if (clusterSlug && pfad?.slug) {
    revalidatePath(`/verzeichnis/${clusterSlug}/${pfad.slug}`);
    revalidatePath(`/verzeichnis/${clusterSlug}`);
  }

  /* Die Warteschlange nachziehen.
     Wer eine durchgefallene Kategorie von Hand freischaltet, hat das Urteil des Gates
     ueberstimmt, und damit ist die Sache erledigt. Bleibt der Eintrag auf
     'durchgefallen', steht die Kategorie weiter in der Pruefliste und bittet um einen
     erneuten Versuch, den niemand mehr braucht. Eine Liste, die erledigte Dinge zeigt,
     wird nicht mehr gelesen. */
  await w.admin
    .from("dir_warteschlange")
    .update({ zustand: "fertig", letzter_fehler: null })
    .eq("collection_id", collectionId)
    .neq("zustand", "laeuft");

  revalidatePath("/admin/verzeichnis");
  revalidatePath(`/admin/verzeichnis/collection/${collectionSlug}`);
  revalidatePath("/verzeichnis", "layout");
  /* UND DIE SITEMAP. Sie hat revalidate = 3600, eine frisch freigegebene Kategorie stand
     also bis zu eine Stunde nicht drin. Bei den Produkt-Detailseiten war das schon
     richtig gemacht (setDetailseiteStatus), bei den Collections fehlte das Gegenstueck.
     Eine Sitemap, die den neuesten Stand nicht kennt, verfehlt ihren einzigen Zweck. */
  revalidatePath("/sitemap-collections.xml");
  revalidatePath("/sitemap.xml");
  return { ok: true };
}

/** Zurueck in den Entwurf. Nimmt die Collection sofort aus dem Verzeichnis. */
export async function zurueckInEntwurf(collectionId: string, collectionSlug: string): Promise<RedaktionResult> {
  const w = await redaktionOderFehler();
  if (!w.ok) return { error: w.error };

  const { error } = await w.admin.from("dir_collection").update({ status: "entwurf" }).eq("id", collectionId);
  if (error) return { error: "Konnte nicht zurückgenommen werden." };

  revalidatePath(`/admin/verzeichnis/collection/${collectionSlug}`);
  revalidatePath("/verzeichnis", "layout");
  return { ok: true };
}

/* --------------------------------- Hero ---------------------------------- */

/**
 * Hero-Bild neu per KI erzeugen (AD-05).
 *
 * Bewusst OHNE Bestaetigungsdialog, aber mit Zeitstempel im Dateinamen: das alte Bild
 * wird nicht ueberschrieben, sondern bleibt liegen. Wer sich vertut, hat nichts
 * zerstoert, und der CDN-Cache zeigt sofort das neue statt tagelang das alte.
 */
export async function erzeugeHeroBild(collectionId: string, collectionSlug: string): Promise<RedaktionResult> {
  const w = await redaktionOderFehler();
  if (!w.ok) return { error: w.error };

  const { data } = await w.admin
    .from("dir_collection")
    .select("id, name, slug, dir_cluster(name)")
    .eq("id", collectionId)
    .maybeSingle();
  if (!data) return { error: "Kategorie nicht gefunden." };

  const cluster = (data.dir_cluster as unknown as { name: string } | null)?.name ?? "Software";
  const res = await erzeugeHero(data.id as string, data.slug as string, data.name as string, cluster);
  if (!res.ok) return { error: res.fehler };

  revalidatePath(`/admin/verzeichnis/collection/${collectionSlug}`);
  revalidatePath(`/verzeichnis/vorschau/${collectionSlug}`);
  return { ok: true };
}

/* --------------------------- Lead-Formular (AD-07) ------------------------ */

/**
 * Das Lead-Formular freigeben.
 *
 * Erst ab hier bekommt der Nutzer den kategoriespezifischen Fragensatz zu sehen. Davor
 * faellt die Seite auf die generischen Basisfragen zurueck, es entsteht also nie eine
 * leere Stelle.
 *
 * Ein Formular, das Leads an ZAHLENDE Kunden verteilt, geht nicht ohne menschliche
 * Freigabe online. Deshalb wird protokolliert, WER es wann freigegeben hat.
 */
export async function gibFinderFrei(collectionId: string, collectionSlug: string): Promise<RedaktionResult> {
  const w = await redaktionOderFehler();
  if (!w.ok) return { error: w.error };

  const { data: coll } = await w.admin
    .from("dir_collection")
    .select("finder_config")
    .eq("id", collectionId)
    .maybeSingle();
  const config = coll?.finder_config as { categoryQuestions?: unknown[] } | null;
  if (!config?.categoryQuestions?.length) {
    return { error: "Es gibt noch keinen Fragensatz. Lass ihn erst erzeugen." };
  }

  const { error } = await w.admin
    .from("dir_collection")
    .update({
      finder_config: { ...config, status: "live" },
      finder_status: "live",
      finder_freigegeben_von: w.user.id,
      finder_freigegeben_am: new Date().toISOString(),
    })
    .eq("id", collectionId);
  if (error) return { error: "Freigabe fehlgeschlagen." };


  /* DEN OEFFENTLICHEN CACHE VERWERFEN.
     Ohne das steht das freigeschaltete Formular bis zu zehn Minuten lang nicht auf der
     Seite, obwohl die Datenbank es laengst kennt. Genau daran ist die erste Freigabe
     ins Leere gelaufen, und vorher schon die erste Anzeige. Jede Aktion, die etwas
     OEFFENTLICH veraendert, muss den oeffentlichen Pfad verwerfen. Das ist keine
     Optimierung, das ist die Definition von "veroeffentlicht". */
  await verwerfeOeffentlich(collectionSlug);
  revalidatePath(`/admin/verzeichnis/collection/${collectionSlug}`);
  return { ok: true };
}

/** Zurueck in die Pruefung. Der Fragensatz bleibt erhalten, er ist nur nicht mehr live. */
export async function finderZurueckziehen(collectionId: string, collectionSlug: string): Promise<RedaktionResult> {
  const w = await redaktionOderFehler();
  if (!w.ok) return { error: w.error };

  const { data: coll } = await w.admin
    .from("dir_collection")
    .select("finder_config")
    .eq("id", collectionId)
    .maybeSingle();
  const config = (coll?.finder_config as Record<string, unknown>) ?? {};

  const { error } = await w.admin
    .from("dir_collection")
    .update({ finder_config: { ...config, status: "in_review" }, finder_status: "in_review" })
    .eq("id", collectionId);
  if (error) return { error: "Zurückziehen fehlgeschlagen." };


  /* DEN OEFFENTLICHEN CACHE VERWERFEN.
     Ohne das steht das freigeschaltete Formular bis zu zehn Minuten lang nicht auf der
     Seite, obwohl die Datenbank es laengst kennt. Genau daran ist die erste Freigabe
     ins Leere gelaufen, und vorher schon die erste Anzeige. Jede Aktion, die etwas
     OEFFENTLICH veraendert, muss den oeffentlichen Pfad verwerfen. Das ist keine
     Optimierung, das ist die Definition von "veroeffentlicht". */
  await verwerfeOeffentlich(collectionSlug);
  revalidatePath(`/admin/verzeichnis/collection/${collectionSlug}`);
  return { ok: true };
}

/**
 * Die oeffentliche Seite neu aufbauen lassen.
 *
 * Braucht man immer dann, wenn sich Daten AUSSERHALB des Backends geaendert haben,
 * etwa durch ein Skript. Genau so ist die erste Anzeige unsichtbar geblieben: sie stand
 * in der Datenbank, aber die zwischengespeicherte Seite wusste nichts davon.
 */
export async function seiteNeuAufbauen(collectionSlug: string): Promise<RedaktionResult> {
  const w = await redaktionOderFehler();
  if (!w.ok) return { error: w.error };
  await verwerfeOeffentlich(collectionSlug);
  revalidatePath(`/admin/verzeichnis/collection/${collectionSlug}`);
  return { ok: true };
}

/* --------------------------- Detailseiten (AD-09) ------------------------- */

/**
 * Eine Anbieter-Detailseite veroeffentlichen oder zurueckziehen.
 *
 * Erst mit 'veroeffentlicht' existiert die Seite oeffentlich, ist indexierbar, steht in
 * der Sitemap und bekommt den "Details"-Link. Vorher fuehrt der einzige Weg direkt zum
 * Anbieter. Bewusst pro Produkt, damit schwache Seiten zurueckgehalten werden koennen.
 */
export async function setDetailseiteStatus(
  produktId: string,
  status: "entwurf" | "veroeffentlicht",
  collectionSlug: string,
): Promise<RedaktionResult> {
  const w = await redaktionOderFehler();
  if (!w.ok) return { error: w.error };

  if (status === "veroeffentlicht") {
    const { data: p } = await w.admin.from("dir_produkt").select("detail_md").eq("id", produktId).maybeSingle();
    if (!p?.detail_md) return { error: "Diese Detailseite hat noch keinen Text. Erst aufbereiten." };
  }

  const { error } = await w.admin
    .from("dir_produkt")
    .update({ detailseite_status: status, detail_freigegeben_am: status === "veroeffentlicht" ? new Date().toISOString() : null })
    .eq("id", produktId);
  if (error) return { error: "Konnte nicht gespeichert werden." };

  // Der oeffentliche Cache der Detailseite UND der Collection (Details-Link).
  const { data: prod } = await w.admin.from("dir_produkt").select("slug").eq("id", produktId).maybeSingle();
  if (prod?.slug) revalidatePath(`/software/${prod.slug}`);
  await verwerfeOeffentlich(collectionSlug);
  revalidatePath("/sitemap-produkte.xml");
  revalidatePath(`/admin/verzeichnis/collection/${collectionSlug}`);
  return { ok: true };
}

/**
 * AD-11: Eine durchgefallene Kategorie zurueck in die Warteschlange.
 *
 * WARUM ES DAS BRAUCHT: Der naechtliche Lauf holt sich nur, was auf 'offen' steht.
 * Was einmal durchgefallen ist, bleibt liegen, und zwar fuer immer. Das ist richtig,
 * solange der Grund an der Kategorie liegt (eine Nische ohne acht Anbieter soll nicht
 * jede Nacht Geld verbrennen). Es ist falsch herum, wenn der Grund bei UNS lag:
 * Gastronomie Software ist an einem ASCII-Umlaut gescheitert, den wir behoben haben,
 * und waere ohne diesen Knopf nie wieder angefasst worden.
 *
 * Der Versuchszaehler wird bewusst zurueckgesetzt: Es ist ein neuer Anlauf unter neuen
 * Bedingungen, kein weiterer Versuch unter den alten.
 */
export async function reiheWiederEin(collectionId: string): Promise<RedaktionResult> {
  const w = await redaktionOderFehler();
  if (!w.ok) return { error: w.error };

  const { error } = await w.admin
    .from("dir_warteschlange")
    .update({ zustand: "offen", versuche: 0, letzter_fehler: null })
    .eq("collection_id", collectionId)
    .in("zustand", ["durchgefallen", "fehler"]);

  if (error) return { error: "Konnte nicht wieder eingereiht werden." };
  revalidatePath("/admin/verzeichnis");
  return { ok: true };
}

/**
 * Alle durchgefallenen auf einmal. Der Fall dafuer ist immer derselbe: eine
 * Fehlerursache wurde behoben, und jetzt sollen alle Kategorien, die daran gescheitert
 * sind, einen zweiten Anlauf bekommen. Einzeln waere das bei zwanzig Stueck Klickarbeit,
 * die niemand macht, und dann bleiben sie eben liegen.
 */
export async function reiheAlleWiederEin(): Promise<RedaktionResult & { anzahl?: number }> {
  const w = await redaktionOderFehler();
  if (!w.ok) return { error: w.error };

  const { data, error } = await w.admin
    .from("dir_warteschlange")
    .update({ zustand: "offen", versuche: 0, letzter_fehler: null })
    .in("zustand", ["durchgefallen", "fehler"])
    .select("collection_id");

  if (error) return { error: "Konnte nicht wieder eingereiht werden." };
  revalidatePath("/admin/verzeichnis");
  return { ok: true, anzahl: data?.length ?? 0 };
}
