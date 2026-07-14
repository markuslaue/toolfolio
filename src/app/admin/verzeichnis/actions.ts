"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redaktionOderFehler } from "@/lib/redaktion";
import { PRODUKT_STATUS } from "@/lib/redaktion-status";
import { erzeugeHero } from "@/lib/hero-bild";

export type RedaktionResult = { ok?: boolean; error?: string };

/* ------------------------------- Produkte -------------------------------- */

/** Status eines Produkts setzen (Selektion und Deselektion). */
export async function setProduktStatus(produktId: string, status: string, collectionSlug: string): Promise<RedaktionResult> {
  const parsed = z.enum(PRODUKT_STATUS).safeParse(status);
  if (!parsed.success) return { error: "Unbekannter Status." };

  const w = await redaktionOderFehler();
  if (!w.ok) return { error: w.error };

  const { error } = await w.admin.from("dir_produkt").update({ status: parsed.data }).eq("id", produktId);
  if (error) return { error: "Status konnte nicht gesetzt werden." };

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

  revalidatePath(`/admin/verzeichnis/collection/${collectionSlug}`);
  revalidatePath("/verzeichnis", "layout");
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
