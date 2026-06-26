"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ToolRef } from "@/lib/sparvorschlaege";

export type SparSnapshot = {
  key: string;
  typ: string;
  titel: string;
  ersparnisJahr: number;
  begruendung?: string;
  tools: ToolRef[];
  geschaetzt?: boolean;
};

export type SparResult = { ok?: boolean; error?: string };

/** Vorschlag als umgesetzt oder ignoriert markieren (mit Snapshot). */
export async function setVorschlagStatus(snap: SparSnapshot, status: "umgesetzt" | "ignoriert"): Promise<SparResult> {
  if (status !== "umgesetzt" && status !== "ignoriert") return { error: "Ungültiger Status." };
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Bitte melde dich erneut an." };

  const { error } = await supabase.from("sparvorschlag_status").upsert(
    {
      user_id: user.id,
      vorschlag_key: snap.key,
      status,
      typ: snap.typ,
      titel: snap.titel,
      ersparnis_jahr: snap.ersparnisJahr,
      begruendung: snap.begruendung ?? null,
      tools: snap.tools,
      geschaetzt: snap.geschaetzt ?? false,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,vorschlag_key" },
  );
  if (error) return { error: "Konnte nicht gespeichert werden." };
  revalidatePath("/app/sparen");
  return { ok: true };
}

/** Vorschlag zuruck in den offenen Zustand (Eintrag loeschen). */
export async function resetVorschlag(key: string): Promise<SparResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Bitte melde dich erneut an." };
  const { error } = await supabase.from("sparvorschlag_status").delete().eq("user_id", user.id).eq("vorschlag_key", key);
  if (error) return { error: "Konnte nicht zurückgesetzt werden." };
  revalidatePath("/app/sparen");
  return { ok: true };
}
