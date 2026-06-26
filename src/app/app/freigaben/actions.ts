"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type FreigabeResult = { ok?: boolean; error?: string };

async function uc() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

/** Neuen Freigabe-Antrag stellen. */
export async function createAntrag(_prev: FreigabeResult, formData: FormData): Promise<FreigabeResult> {
  const parsed = z
    .object({
      tool: z.string().trim().min(1, "Bitte gib das Tool an.").max(80),
      kategorie: z.string().trim().min(1, "Bitte gib eine Kategorie an.").max(60),
      kosten: z.string(),
      intervall: z.enum(["monatlich", "quartalsweise", "jaehrlich"]),
      antragsteller: z.string().trim().max(80).optional().or(z.literal("")),
      begruendung: z.string().trim().max(1000).optional().or(z.literal("")),
    })
    .safeParse({
      tool: formData.get("tool"), kategorie: formData.get("kategorie"), kosten: formData.get("kosten"),
      intervall: formData.get("intervall"), antragsteller: formData.get("antragsteller") ?? "", begruendung: formData.get("begruendung") ?? "",
    });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Bitte prüfe deine Eingabe." };

  const kosten = Number(parsed.data.kosten.replace(",", "."));
  if (Number.isNaN(kosten) || kosten < 0) return { error: "Bitte gib gültige Kosten ein." };

  const { supabase, user } = await uc();
  if (!user) return { error: "Bitte melde dich erneut an." };
  const { error } = await supabase.from("freigabe_antrag").insert({
    user_id: user.id, tool: parsed.data.tool, kategorie: parsed.data.kategorie, kosten,
    intervall: parsed.data.intervall, antragsteller: parsed.data.antragsteller || null, begruendung: parsed.data.begruendung || null,
  });
  if (error) return { error: "Antrag konnte nicht angelegt werden." };
  revalidatePath("/app/freigaben");
  return { ok: true };
}

/** Antrag genehmigen oder ablehnen. Bei Genehmigung optional direkt als Abo anlegen. */
export async function entscheiden(id: string, status: "genehmigt" | "abgelehnt", grund?: string, alsAbo?: boolean): Promise<FreigabeResult> {
  if (status !== "genehmigt" && status !== "abgelehnt") return { error: "Ungültige Entscheidung." };
  const { supabase, user } = await uc();
  if (!user) return { error: "Bitte melde dich erneut an." };

  const { data: antrag } = await supabase.from("freigabe_antrag").select("tool, kategorie, kosten, intervall").eq("id", id).eq("user_id", user.id).maybeSingle();
  if (!antrag) return { error: "Antrag nicht gefunden." };

  const { error } = await supabase
    .from("freigabe_antrag")
    .update({ status, grund_ablehnung: status === "abgelehnt" ? (grund || null) : null, entschieden_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) return { error: "Entscheidung konnte nicht gespeichert werden." };

  if (status === "genehmigt" && alsAbo) {
    const { error: aboErr } = await supabase.from("abos").insert({
      user_id: user.id, tool: antrag.tool, kategorie: antrag.kategorie, kosten: antrag.kosten, intervall: antrag.intervall, status: "aktiv",
    });
    if (aboErr) return { error: "Genehmigt, aber das Abo konnte nicht angelegt werden." };
  }
  revalidatePath("/app/freigaben");
  return { ok: true };
}

export async function deleteAntrag(id: string): Promise<FreigabeResult> {
  const { supabase, user } = await uc();
  if (!user) return { error: "Bitte melde dich erneut an." };
  const { error } = await supabase.from("freigabe_antrag").delete().eq("id", id).eq("user_id", user.id);
  if (error) return { error: "Antrag konnte nicht gelöscht werden." };
  revalidatePath("/app/freigaben");
  return { ok: true };
}
