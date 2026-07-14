"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getActiveAccount } from "@/lib/active-account";
import { monatlich, type Abo } from "@/lib/abos";
import { berechneVorschlaege } from "@/lib/sparvorschlaege";

export type OnboardingResult = { ok?: boolean; error?: string };

const schema = z.object({
  segment: z.enum(["solo", "freelancer", "agentur", "unternehmen"]).nullable().optional(),
  tool_menge: z.enum(["unter_10", "10_bis_30", "30_bis_60", "ueber_60"]).nullable().optional(),
});

/** Segment speichern und Onboarding als abgeschlossen markieren. */
export async function finishOnboarding(
  input: z.input<typeof schema>,
): Promise<OnboardingResult> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { error: "Ungültige Eingabe." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Bitte melde dich erneut an." };

  const { error } = await supabase
    .from("profiles")
    .update({
      segment: parsed.data.segment ?? null,
      tool_menge: parsed.data.tool_menge ?? null,
      onboarded_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) return { error: "Das hat nicht geklappt. Bitte versuche es erneut." };
  revalidatePath("/app");
  return { ok: true };
}

export type Bilanz = { abos: number; monatlich: number; sparpotenzial: number | null };

/**
 * Die Abschluss-Bilanz des Onboardings.
 *
 * Bewusst SERVERSEITIG aus dem echten Bestand gerechnet. Die Vorlage zeigt hier
 * eine erfundene Zahl (1.284 EUR Sparpotenzial). Wir zeigen, was da ist, und wenn
 * nichts da ist, geben wir null zurueck und die Oberflaeche sagt es.
 */
export async function onboardingBilanz(): Promise<Bilanz> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { abos: 0, monatlich: 0, sparpotenzial: null };
  const account = await getActiveAccount(supabase, user.id);

  const { data } = await supabase.from("abos").select("*").eq("user_id", account);

  const abos = ((data as Abo[]) ?? []).filter((a) => a.status === "aktiv" || a.status === "Trial");
  const summe = abos.reduce((s, a) => s + monatlich(Number(a.kosten), a.intervall), 0);

  const vorschlaege = berechneVorschlaege(abos);
  const potenzial = vorschlaege.reduce((s, v) => s + (v.ersparnisJahr ?? 0), 0);

  return {
    abos: abos.length,
    monatlich: Math.round(summe * 100) / 100,
    sparpotenzial: potenzial > 0 ? Math.round(potenzial * 100) / 100 : null,
  };
}
