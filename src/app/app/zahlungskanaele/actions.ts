"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type KanalResult = { ok?: boolean; id?: string; error?: string };

const leerZuNull = (v: unknown) =>
  typeof v === "string" && v.trim() === "" ? null : v;

const vier = z
  .preprocess(leerZuNull, z.string().regex(/^[0-9]{4}$/, "Bitte genau vier Ziffern.").nullable().optional());

const schema = z.object({
  typ: z.enum(["kreditkarte", "sepa", "paypal", "stripe", "paysafe", "anderes"]),
  bezeichnung: z.string().trim().min(1, "Bitte eine Bezeichnung angeben."),
  anbieter: z.preprocess(leerZuNull, z.string().trim().nullable().optional()),
  last4: vier,
  iban_last4: vier,
  ablauf_monat: z.preprocess(leerZuNull, z.number().int().min(1).max(12).nullable().optional()),
  ablauf_jahr: z.preprocess(leerZuNull, z.number().int().min(2000).max(2100).nullable().optional()),
  inhaber: z.preprocess(leerZuNull, z.string().trim().nullable().optional()),
  aktiv: z.boolean().default(true),
});

export type KanalInput = z.input<typeof schema>;

async function userOrError() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

export async function createKanal(input: KanalInput): Promise<KanalResult> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Bitte prüfe deine Eingaben." };
  }
  const { supabase, user } = await userOrError();
  if (!user) return { error: "Bitte melde dich erneut an." };

  const { data, error } = await supabase
    .from("zahlungskanaele")
    .insert({ ...parsed.data, user_id: user.id })
    .select("id")
    .single();
  if (error) return { error: "Anlegen hat nicht geklappt. Bitte versuche es erneut." };
  revalidatePath("/app/zahlungskanaele");
  return { ok: true, id: data.id };
}

export async function updateKanal(id: string, input: KanalInput): Promise<KanalResult> {
  if (!id) return { error: "Unbekannter Kanal." };
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Bitte prüfe deine Eingaben." };
  }
  const { supabase, user } = await userOrError();
  if (!user) return { error: "Bitte melde dich erneut an." };

  const { error } = await supabase
    .from("zahlungskanaele")
    .update(parsed.data)
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) return { error: "Speichern hat nicht geklappt. Bitte versuche es erneut." };
  revalidatePath("/app/zahlungskanaele");
  return { ok: true, id };
}

export async function deleteKanal(id: string): Promise<KanalResult> {
  if (!id) return { error: "Unbekannter Kanal." };
  const { supabase, user } = await userOrError();
  if (!user) return { error: "Bitte melde dich erneut an." };

  const { error } = await supabase
    .from("zahlungskanaele")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) return { error: "Löschen hat nicht geklappt. Bitte versuche es erneut." };
  revalidatePath("/app/zahlungskanaele");
  return { ok: true };
}
