"use server";

import { revalidatePath } from "next/cache";
import { redaktionOderFehler } from "@/lib/redaktion";
import { holeRanking } from "@/lib/ranking";

/**
 * AD-15: Das DataForSEO-Ranking einer Kategorie auf Anfrage holen.
 *
 * Auf Anfrage, weil jeder Abruf Geld kostet (ein SERP-Abruf je Land). Automatisch
 * taeglich ueber 1.271 Kategorien waere teuer und sinnlos, eine Position aendert sich
 * nicht ueber Nacht.
 */
export async function aktualisiereRanking(collectionId: string, slug: string): Promise<{ ok?: boolean; error?: string }> {
  const w = await redaktionOderFehler();
  if (!w.ok) return { error: w.error };

  try {
    await holeRanking(collectionId);
    revalidatePath(`/admin/statistik/collection/${slug}`);
    return { ok: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Ranking konnte nicht geholt werden." };
  }
}
