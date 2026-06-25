"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

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
  return { supabase, user };
}

export async function createKunde(input: KundeInput): Promise<KundeResult> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Bitte prüfe deine Eingaben." };
  }
  const { supabase, user } = await userOrError();
  if (!user) return { error: "Bitte melde dich erneut an." };

  const { data, error } = await supabase
    .from("kunden")
    .insert({ ...parsed.data, user_id: user.id })
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
  const { supabase, user } = await userOrError();
  if (!user) return { error: "Bitte melde dich erneut an." };

  const { error } = await supabase
    .from("kunden")
    .update(parsed.data)
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) return { error: "Speichern hat nicht geklappt. Bitte versuche es erneut." };
  revalidatePath("/app/kunden");
  return { ok: true, id };
}

export async function deleteKunde(id: string): Promise<KundeResult> {
  if (!id) return { error: "Unbekannter Kunde." };
  const { supabase, user } = await userOrError();
  if (!user) return { error: "Bitte melde dich erneut an." };

  const { error } = await supabase
    .from("kunden")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) return { error: "Löschen hat nicht geklappt. Bitte versuche es erneut." };
  revalidatePath("/app/kunden");
  return { ok: true };
}
