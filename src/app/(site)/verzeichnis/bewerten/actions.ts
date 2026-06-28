"use server";

import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type BewertenResult = { ok?: boolean; error?: string };

const schema = z.object({
  tool: z.string().min(1),
  sterne: z.coerce.number().int().min(1).max(5),
  titel: z.string().trim().max(120).optional().or(z.literal("")),
  text: z.string().trim().min(10, "Bitte schreib ein paar Saetze.").max(2000),
  autor_name: z.string().trim().max(80).optional().or(z.literal("")),
  autor_email: z.string().trim().email().optional().or(z.literal("")),
});

/**
 * V-12 (minimal): First-Party-Bewertung einreichen. Geht als Status "neu" in die
 * Moderation und erscheint erst nach redaktioneller Freigabe. Verifiziert wird
 * eine Bewertung nur, wenn der eingeloggte Nutzer das Tool nachweislich nutzt
 * (Tracker) -- diese Pruefung folgt; v1 markiert alles als nicht verifiziert.
 */
export async function bewertungEinreichen(_prev: BewertenResult, formData: FormData): Promise<BewertenResult> {
  const parsed = schema.safeParse({
    tool: formData.get("tool"),
    sterne: formData.get("sterne"),
    titel: formData.get("titel") ?? "",
    text: formData.get("text"),
    autor_name: formData.get("autor_name") ?? "",
    autor_email: formData.get("autor_email") ?? "",
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Bitte pruefe deine Eingaben." };

  const admin = createAdminClient();
  const { data: produkt } = await admin.from("dir_produkt").select("id").eq("slug", parsed.data.tool).maybeSingle();
  if (!produkt) return { error: "Tool nicht gefunden." };

  // Eingeloggten Nutzer (falls vorhanden) zuordnen, ohne Tracker-Daten zu lesen.
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { error } = await admin.from("dir_review").insert({
    produkt_id: produkt.id,
    user_id: user?.id ?? null,
    sterne: parsed.data.sterne,
    titel: parsed.data.titel || null,
    text: parsed.data.text,
    verifiziert: false,
    status: "neu",
    autor_name: parsed.data.autor_name || null,
    autor_email: parsed.data.autor_email || null,
  });
  if (error) return { error: "Das hat nicht geklappt. Bitte versuche es spaeter erneut." };
  return { ok: true };
}
