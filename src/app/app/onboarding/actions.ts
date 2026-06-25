"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type OnboardingResult = { ok?: boolean; error?: string };

const schema = z.object({
  segment: z.enum(["solo", "freelancer", "agentur", "unternehmen"]).nullable().optional(),
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
      onboarded_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) return { error: "Das hat nicht geklappt. Bitte versuche es erneut." };
  revalidatePath("/app");
  return { ok: true };
}
