"use server";

import { randomUUID } from "node:crypto";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ArchivResult = { ok?: boolean; error?: string };

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB
const ERLAUBT = ["application/pdf", "image/png", "image/jpeg", "image/webp"];

async function userClient() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

/** Dokument anlegen, optional mit Datei-Upload in den privaten Bucket. */
export async function uploadDokument(_prev: ArchivResult, formData: FormData): Promise<ArchivResult> {
  const parsed = z
    .object({
      typ: z.enum(["rechnung", "vertrag", "agb", "sonstiges"]),
      titel: z.string().trim().min(1, "Bitte gib einen Titel ein.").max(120),
      abo_id: z.string().uuid().optional().or(z.literal("")),
      datum: z.string().optional().or(z.literal("")),
      betrag: z.string().optional().or(z.literal("")),
    })
    .safeParse({
      typ: formData.get("typ"),
      titel: formData.get("titel"),
      abo_id: formData.get("abo_id") ?? "",
      datum: formData.get("datum") ?? "",
      betrag: formData.get("betrag") ?? "",
    });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Bitte prüfe deine Eingabe." };

  const { supabase, user } = await userClient();
  if (!user) return { error: "Bitte melde dich erneut an." };

  const datei = formData.get("datei");
  let storage_path: string | null = null;
  let mime: string | null = null;
  let groesse: number | null = null;

  if (datei instanceof File && datei.size > 0) {
    if (datei.size > MAX_BYTES) return { error: "Datei zu groß (max. 10 MB)." };
    if (!ERLAUBT.includes(datei.type)) return { error: "Nur PDF, PNG, JPG oder WebP erlaubt." };
    const ext = datei.name.includes(".") ? datei.name.split(".").pop()!.toLowerCase().slice(0, 8) : "bin";
    const path = `${user.id}/${randomUUID()}.${ext}`;
    const { error: upErr } = await supabase.storage.from("dokumente").upload(path, datei, { contentType: datei.type, upsert: false });
    if (upErr) return { error: "Datei konnte nicht hochgeladen werden." };
    storage_path = path;
    mime = datei.type;
    groesse = datei.size;
  }

  const datum = parsed.data.datum || null;
  const jahr = datum ? new Date(datum).getFullYear() : new Date().getFullYear();
  const betrag = parsed.data.betrag ? Number(parsed.data.betrag.replace(",", ".")) : null;

  const { error } = await supabase.from("dokumente").insert({
    user_id: user.id,
    abo_id: parsed.data.abo_id || null,
    typ: parsed.data.typ,
    titel: parsed.data.titel,
    datum,
    jahr,
    betrag: betrag !== null && !Number.isNaN(betrag) ? betrag : null,
    storage_path,
    mime,
    groesse,
  });
  if (error) {
    if (storage_path) await supabase.storage.from("dokumente").remove([storage_path]);
    return { error: "Dokument konnte nicht gespeichert werden." };
  }
  revalidatePath("/app/archiv");
  return { ok: true };
}

/** Signierte Download-URL fuer ein eigenes Dokument erzeugen. */
export async function getDownloadUrl(id: string): Promise<{ url?: string; error?: string }> {
  const { supabase, user } = await userClient();
  if (!user) return { error: "Bitte melde dich erneut an." };
  const { data: doc } = await supabase.from("dokumente").select("storage_path").eq("id", id).eq("user_id", user.id).maybeSingle();
  if (!doc?.storage_path) return { error: "Zu diesem Eintrag ist keine Datei hinterlegt." };
  const { data, error } = await supabase.storage.from("dokumente").createSignedUrl(doc.storage_path, 120);
  if (error || !data) return { error: "Download-Link konnte nicht erstellt werden." };
  return { url: data.signedUrl };
}

/** Dokument loeschen (Datei + Metadaten). */
export async function deleteDokument(id: string): Promise<ArchivResult> {
  const { supabase, user } = await userClient();
  if (!user) return { error: "Bitte melde dich erneut an." };
  const { data: doc } = await supabase.from("dokumente").select("storage_path").eq("id", id).eq("user_id", user.id).maybeSingle();
  if (doc?.storage_path) await supabase.storage.from("dokumente").remove([doc.storage_path]);
  const { error } = await supabase.from("dokumente").delete().eq("id", id).eq("user_id", user.id);
  if (error) return { error: "Dokument konnte nicht gelöscht werden." };
  revalidatePath("/app/archiv");
  return { ok: true };
}
