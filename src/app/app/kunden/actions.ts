"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getActiveAccount } from "@/lib/active-account";

export type KundeResult = { ok?: boolean; id?: string; error?: string };

const leerZuNull = (v: unknown) =>
  typeof v === "string" && v.trim() === "" ? null : v;

const schema = z.object({
  name: z.string().trim().min(1, "Bitte einen Namen angeben."),
  ansprechpartner: z.preprocess(leerZuNull, z.string().trim().nullable().optional()),
  email: z.preprocess(
    leerZuNull,
    z.string().email("Bitte eine gültige E-Mail-Adresse angeben.").nullable().optional(),
  ),
  farbe: z.string().default("#6C5CE7"),
  status: z.enum(["aktiv", "inaktiv", "archiviert"]).default("aktiv"),
  weiterverrechnet: z.boolean().default(false),
  aufschlag_prozent: z.preprocess(leerZuNull, z.number().nonnegative().nullable().optional()),
  notizen: z.preprocess(leerZuNull, z.string().nullable().optional()),
});

export type KundeInput = z.input<typeof schema>;

async function userOrError() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const account = user ? await getActiveAccount(supabase, user.id) : null;
  return { supabase, user, account };
}

export async function createKunde(input: KundeInput): Promise<KundeResult> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Bitte prüfe deine Eingaben." };
  }
  const { supabase, user, account } = await userOrError();
  if (!user || !account) return { error: "Bitte melde dich erneut an." };

  const { data, error } = await supabase
    .from("kunden")
    .insert({ ...parsed.data, user_id: account })
    .select("id")
    .single();
  if (error) return { error: "Anlegen hat nicht geklappt. Bitte versuche es erneut." };
  revalidatePath("/app/kunden");
  return { ok: true, id: data.id };
}

export async function updateKunde(id: string, input: KundeInput): Promise<KundeResult> {
  if (!id) return { error: "Unbekannter Kunde." };
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Bitte prüfe deine Eingaben." };
  }
  const { supabase, user, account } = await userOrError();
  if (!user || !account) return { error: "Bitte melde dich erneut an." };

  const { error } = await supabase
    .from("kunden")
    .update(parsed.data)
    .eq("id", id)
    .eq("user_id", account);
  if (error) return { error: "Speichern hat nicht geklappt. Bitte versuche es erneut." };
  revalidatePath("/app/kunden");
  return { ok: true, id };
}

/** Kunde archivieren: bleibt erhalten, faellt aber aus den aktiven Auswertungen. */
export async function archiveKunde(id: string): Promise<KundeResult> {
  if (!id) return { error: "Unbekannter Kunde." };
  const { supabase, user, account } = await userOrError();
  if (!user || !account) return { error: "Bitte melde dich erneut an." };

  const { error } = await supabase
    .from("kunden")
    .update({ status: "archiviert" })
    .eq("id", id)
    .eq("user_id", account);
  if (error) return { error: "Archivieren hat nicht geklappt. Bitte versuche es erneut." };
  revalidatePath("/app/kunden");
  return { ok: true, id };
}

export async function deleteKunde(id: string): Promise<KundeResult> {
  if (!id) return { error: "Unbekannter Kunde." };
  const { supabase, user, account } = await userOrError();
  if (!user || !account) return { error: "Bitte melde dich erneut an." };

  const { error } = await supabase
    .from("kunden")
    .delete()
    .eq("id", id)
    .eq("user_id", account);
  if (error) return { error: "Löschen hat nicht geklappt. Bitte versuche es erneut." };
  revalidatePath("/app/kunden");
  return { ok: true };
}

/* ------------------------- Aktionen der Detailseite ------------------------ */

/** Notizen am Kunden speichern (Detailseite, eigenes Feld). */
export async function updateKundeNotizen(id: string, notizen: string): Promise<KundeResult> {
  if (!id) return { error: "Unbekannter Kunde." };
  const { supabase, user, account } = await userOrError();
  if (!user || !account) return { error: "Bitte melde dich erneut an." };

  const wert = notizen.trim() === "" ? null : notizen.slice(0, 5000);
  const { error } = await supabase.from("kunden").update({ notizen: wert }).eq("id", id).eq("user_id", account);
  if (error) return { error: "Notiz konnte nicht gespeichert werden." };
  revalidatePath(`/app/kunden/${id}`);
  return { ok: true, id };
}

/**
 * Weiterverrechnung des Kunden umstellen (Schalter + Aufschlag auf der Detailseite).
 * Der Aufschlag ist der Standard fuer alle Abos dieses Kunden, die keinen eigenen
 * Aufschlag gesetzt haben.
 */
export async function setKundeWeiterverrechnung(
  id: string,
  weiterverrechnet: boolean,
  aufschlag: number | null,
): Promise<KundeResult> {
  if (!id) return { error: "Unbekannter Kunde." };
  const parsed = z
    .object({ weiterverrechnet: z.boolean(), aufschlag: z.number().min(0).max(200).nullable() })
    .safeParse({ weiterverrechnet, aufschlag });
  if (!parsed.success) return { error: "Der Aufschlag muss zwischen 0 und 200 Prozent liegen." };

  const { supabase, user, account } = await userOrError();
  if (!user || !account) return { error: "Bitte melde dich erneut an." };

  const { error } = await supabase
    .from("kunden")
    .update({
      weiterverrechnet: parsed.data.weiterverrechnet,
      aufschlag_prozent: parsed.data.weiterverrechnet ? parsed.data.aufschlag : null,
    })
    .eq("id", id)
    .eq("user_id", account);
  if (error) return { error: "Speichern hat nicht geklappt. Bitte versuche es erneut." };
  revalidatePath(`/app/kunden/${id}`);
  revalidatePath("/app/kunden");
  return { ok: true, id };
}

/** Einzelnes Abo abweichend vom Kunden-Standard weiterverrechnen (oder eben nicht). */
export async function setAboWeiterverrechnen(aboId: string, wert: boolean): Promise<KundeResult> {
  if (!aboId) return { error: "Unbekanntes Abo." };
  const { supabase, user, account } = await userOrError();
  if (!user || !account) return { error: "Bitte melde dich erneut an." };

  const { error } = await supabase
    .from("abos")
    .update({ weiterverrechnen: wert })
    .eq("id", aboId)
    .eq("user_id", account);
  if (error) return { error: "Änderung konnte nicht gespeichert werden." };
  revalidatePath("/app/kunden", "layout");
  return { ok: true, id: aboId };
}

/** Abo aus der Kundenzuordnung nehmen. Das Abo selbst bleibt bestehen. */
export async function entferneAboVonKunde(aboId: string): Promise<KundeResult> {
  if (!aboId) return { error: "Unbekanntes Abo." };
  const { supabase, user, account } = await userOrError();
  if (!user || !account) return { error: "Bitte melde dich erneut an." };

  const { error } = await supabase
    .from("abos")
    .update({ kunde: null })
    .eq("id", aboId)
    .eq("user_id", account);
  if (error) return { error: "Zuordnung konnte nicht entfernt werden." };
  revalidatePath("/app/kunden", "layout");
  return { ok: true, id: aboId };
}
