"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getActiveAccount } from "@/lib/active-account";

export type FristResult = { ok?: boolean; error?: string };

const schema = z.object({
  quelle: z.enum(["abo", "kanal"]),
  quelle_id: z.string().uuid(),
  art: z.enum(["trial", "kuendigung", "karte"]),
  datum: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  status: z.enum(["erledigt", "ignoriert"]).default("erledigt"),
});

async function userOrError() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const account = user ? await getActiveAccount(supabase, user.id) : null;
  return { supabase, user, account };
}

/** Eine Frist als erledigt/ignoriert quittieren (idempotent ueber Unique-Key). */
export async function quittiereFrist(input: z.input<typeof schema>): Promise<FristResult> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { error: "Ungültige Frist." };

  const { supabase, user, account } = await userOrError();
  if (!user || !account) return { error: "Bitte melde dich erneut an." };

  const { error } = await supabase.from("frist_quittungen").upsert(
    { ...parsed.data, user_id: account },
    { onConflict: "user_id,quelle_id,art,datum" },
  );
  if (error) return { error: "Das hat nicht geklappt. Bitte versuche es erneut." };
  revalidatePath("/app/fristen");
  revalidatePath("/app");
  return { ok: true };
}

/** Quittung zuruecknehmen (Frist wieder anzeigen). */
export async function widerrufeFrist(input: {
  quelle_id: string;
  art: string;
  datum: string;
}): Promise<FristResult> {
  const { supabase, user, account } = await userOrError();
  if (!user || !account) return { error: "Bitte melde dich erneut an." };

  const { error } = await supabase
    .from("frist_quittungen")
    .delete()
    .eq("user_id", account)
    .eq("quelle_id", input.quelle_id)
    .eq("art", input.art)
    .eq("datum", input.datum);
  if (error) return { error: "Das hat nicht geklappt. Bitte versuche es erneut." };
  revalidatePath("/app/fristen");
  revalidatePath("/app");
  return { ok: true };
}
