"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getActiveAccount } from "@/lib/active-account";

export type FreigabeResult = { ok?: boolean; error?: string };

async function uc() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const account = user ? await getActiveAccount(supabase, user.id) : null;
  return { supabase, user, account };
}

/** Anzeigename des angemeldeten Nutzers, fuer Antragsteller und Kommentare. */
async function anzeigeName(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  email: string | undefined,
): Promise<string> {
  const { data } = await supabase.from("profiles").select("first_name, last_name").eq("id", userId).maybeSingle();
  return [data?.first_name, data?.last_name].filter(Boolean).join(" ") || email || "Unbekannt";
}

/** Neuen Freigabe-Antrag stellen. Jedes Kontomitglied darf das (RLS: has_account_access). */
export async function createAntrag(_prev: FreigabeResult, formData: FormData): Promise<FreigabeResult> {
  const parsed = z
    .object({
      tool: z.string().trim().min(1, "Bitte gib das Tool an.").max(80),
      kategorie: z.string().trim().min(1, "Bitte gib eine Kategorie an.").max(60),
      kosten: z.string(),
      intervall: z.enum(["monatlich", "quartalsweise", "jaehrlich"]),
      antragsteller: z.string().trim().max(80).optional().or(z.literal("")),
      begruendung: z.string().trim().max(1000).optional().or(z.literal("")),
      fuer: z.string().trim().max(120).optional().or(z.literal("")),
    })
    .safeParse({
      tool: formData.get("tool"),
      kategorie: formData.get("kategorie"),
      kosten: formData.get("kosten"),
      intervall: formData.get("intervall"),
      antragsteller: formData.get("antragsteller") ?? "",
      begruendung: formData.get("begruendung") ?? "",
      fuer: formData.get("fuer") ?? "",
    });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Bitte prüfe deine Eingabe." };

  const kosten = Number(parsed.data.kosten.replace(",", "."));
  if (Number.isNaN(kosten) || kosten < 0) return { error: "Bitte gib gültige Kosten ein." };

  const { supabase, user, account } = await uc();
  if (!user || !account) return { error: "Bitte melde dich erneut an." };

  const name = parsed.data.antragsteller || (await anzeigeName(supabase, user.id, user.email));

  const { error } = await supabase.from("freigabe_antrag").insert({
    user_id: account,
    erstellt_von: user.id,
    tool: parsed.data.tool,
    kategorie: parsed.data.kategorie,
    kosten,
    intervall: parsed.data.intervall,
    antragsteller: name,
    begruendung: parsed.data.begruendung || null,
    fuer: parsed.data.fuer || "intern",
  });
  if (error) return { error: "Antrag konnte nicht angelegt werden." };

  revalidatePath("/app/freigaben");
  return { ok: true };
}

/**
 * Antrag genehmigen oder ablehnen. Nur Owner/Admin (RLS: has_admin_access).
 * Bei Genehmigung optional direkt als Abo anlegen, inklusive Kundenzuordnung.
 */
export async function entscheiden(
  id: string,
  status: "genehmigt" | "abgelehnt",
  grund?: string,
  alsAbo?: boolean,
): Promise<FreigabeResult> {
  if (status !== "genehmigt" && status !== "abgelehnt") return { error: "Ungültige Entscheidung." };
  const { supabase, user, account } = await uc();
  if (!user || !account) return { error: "Bitte melde dich erneut an." };

  const { data: antrag } = await supabase
    .from("freigabe_antrag")
    .select("tool, kategorie, kosten, intervall, fuer")
    .eq("id", id)
    .eq("user_id", account)
    .maybeSingle();
  if (!antrag) return { error: "Antrag nicht gefunden." };

  const { error } = await supabase
    .from("freigabe_antrag")
    .update({
      status,
      grund_ablehnung: status === "abgelehnt" ? grund || null : null,
      entschieden_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", account);
  if (error) return { error: "Du darfst in diesem Konto nicht über Anträge entscheiden." };

  if (status === "genehmigt" && alsAbo) {
    // "intern" ist kein Kunde, sondern die Abwesenheit eines Kunden.
    const kunde = antrag.fuer && antrag.fuer !== "intern" ? antrag.fuer : null;
    const { error: aboErr } = await supabase.from("abos").insert({
      user_id: account,
      tool: antrag.tool,
      kategorie: antrag.kategorie,
      kosten: antrag.kosten,
      intervall: antrag.intervall,
      status: "aktiv",
      kunde,
      abo_seit: new Date().toISOString().slice(0, 10),
    });
    if (aboErr) return { error: "Genehmigt, aber das Abo konnte nicht angelegt werden." };
  }

  revalidatePath("/app/freigaben");
  revalidatePath("/app/abos");
  return { ok: true };
}

/** Rueckfrage oder Kommentar zu einem Antrag. Der Antrag bleibt offen. */
export async function kommentieren(antragId: string, text: string): Promise<FreigabeResult> {
  const parsed = z.string().trim().min(1, "Bitte schreib etwas.").max(1000).safeParse(text);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Bitte prüfe deine Eingabe." };

  const { supabase, user, account } = await uc();
  if (!user || !account) return { error: "Bitte melde dich erneut an." };

  const { error } = await supabase.from("freigabe_kommentar").insert({
    antrag_id: antragId,
    user_id: account,
    autor: user.id,
    autor_name: await anzeigeName(supabase, user.id, user.email),
    text: parsed.data,
  });
  if (error) return { error: "Die Rückfrage konnte nicht gespeichert werden." };

  revalidatePath("/app/freigaben");
  return { ok: true };
}

export async function deleteAntrag(id: string): Promise<FreigabeResult> {
  const { supabase, user, account } = await uc();
  if (!user || !account) return { error: "Bitte melde dich erneut an." };
  const { error } = await supabase.from("freigabe_antrag").delete().eq("id", id).eq("user_id", account);
  if (error) return { error: "Antrag konnte nicht gelöscht werden." };
  revalidatePath("/app/freigaben");
  return { ok: true };
}
