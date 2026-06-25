"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type AboResult = {
  ok?: boolean;
  id?: string;
  error?: string;
  fieldErrors?: Record<string, string>;
};

const leerZuNull = (v: unknown) =>
  typeof v === "string" && v.trim() === "" ? null : v;

const aboSchema = z.object({
  tool: z.string().trim().min(1, "Bitte einen Toolnamen angeben."),
  anbieter: z.preprocess(leerZuNull, z.string().trim().nullable().optional()),
  initial: z.preprocess(leerZuNull, z.string().trim().max(2).nullable().optional()),
  farbe: z.preprocess(leerZuNull, z.string().nullable().optional()),
  kategorie: z.string().trim().min(1, "Bitte eine Kategorie wählen."),
  mit_verzeichnis: z.boolean().default(false),

  kosten: z.number({ invalid_type_error: "Bitte einen Betrag angeben." })
    .positive("Bitte einen Betrag größer 0 angeben."),
  waehrung: z.enum(["EUR", "USD"]).default("EUR"),
  intervall: z.enum(["monatlich", "quartalsweise", "jaehrlich"], {
    errorMap: () => ({ message: "Bitte ein Intervall wählen." }),
  }),

  naechste_abbuchung: z.preprocess(leerZuNull, z.string().nullable().optional()),
  zahlungskanal: z.preprocess(leerZuNull, z.string().trim().nullable().optional()),

  kunde: z.preprocess(leerZuNull, z.string().trim().nullable().optional()),
  status: z
    .enum(["aktiv", "Trial", "pausiert", "gekuendigt", "archiviert"])
    .default("aktiv"),
  tags: z.array(z.string().trim().min(1)).default([]),

  weiterverrechnen: z.boolean().default(false),
  aufschlag_prozent: z.preprocess(leerZuNull, z.number().nonnegative().nullable().optional()),

  abo_seit: z.preprocess(leerZuNull, z.string().nullable().optional()),
  auto_verlaengerung: z.boolean().default(true),
  frist_wert: z.preprocess(leerZuNull, z.number().int().nonnegative().nullable().optional()),
  frist_einheit: z.preprocess(
    leerZuNull,
    z.enum(["Tage", "Wochen", "Monate"]).nullable().optional(),
  ),
  letzter_kuendigungstermin: z.preprocess(leerZuNull, z.string().nullable().optional()),
  erinnerung: z.boolean().default(false),
  trial_endet: z.preprocess(leerZuNull, z.string().nullable().optional()),

  notizen: z.preprocess(leerZuNull, z.string().nullable().optional()),
  konto_email: z.preprocess(leerZuNull, z.string().nullable().optional()),
  login_verweis: z.preprocess(leerZuNull, z.string().nullable().optional()),
});

export type AboInput = z.input<typeof aboSchema>;

function feldFehler(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "");
    if (key && !out[key]) out[key] = issue.message;
  }
  return out;
}

async function userOrError() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

export async function createAbo(input: AboInput): Promise<AboResult> {
  const parsed = aboSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Bitte prüfe deine Eingaben.", fieldErrors: feldFehler(parsed.error) };
  }

  const { supabase, user } = await userOrError();
  if (!user) return { error: "Bitte melde dich erneut an." };

  const { data, error } = await supabase
    .from("abos")
    .insert({ ...parsed.data, user_id: user.id })
    .select("id")
    .single();

  if (error) return { error: "Anlegen hat nicht geklappt. Bitte versuche es erneut." };
  revalidatePath("/app/abos");
  return { ok: true, id: data.id };
}

export async function updateAbo(id: string, input: AboInput): Promise<AboResult> {
  if (!id) return { error: "Unbekanntes Abo." };
  const parsed = aboSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Bitte prüfe deine Eingaben.", fieldErrors: feldFehler(parsed.error) };
  }

  const { supabase, user } = await userOrError();
  if (!user) return { error: "Bitte melde dich erneut an." };

  const { error } = await supabase
    .from("abos")
    .update(parsed.data)
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: "Speichern hat nicht geklappt. Bitte versuche es erneut." };
  revalidatePath("/app/abos");
  return { ok: true, id };
}

export async function deleteAbo(id: string): Promise<AboResult> {
  if (!id) return { error: "Unbekanntes Abo." };
  const { supabase, user } = await userOrError();
  if (!user) return { error: "Bitte melde dich erneut an." };

  const { error } = await supabase
    .from("abos")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: "Löschen hat nicht geklappt. Bitte versuche es erneut." };
  revalidatePath("/app/abos");
  return { ok: true };
}
