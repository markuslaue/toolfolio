"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export type NewPwState = { error?: string };

const schema = z.object({
  password: z.string().min(8),
  password2: z.string(),
});

export async function setNewPassword(
  _prev: NewPwState,
  formData: FormData,
): Promise<NewPwState> {
  const parsed = schema.safeParse({
    password: formData.get("password"),
    password2: formData.get("password2"),
  });
  if (!parsed.success) {
    return { error: "Das Passwort muss mindestens 8 Zeichen haben." };
  }
  if (parsed.data.password !== parsed.data.password2) {
    return { error: "Die Passwörter stimmen nicht überein." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });
  if (error) {
    return {
      error:
        "Das hat nicht geklappt. Der Link ist eventuell abgelaufen, fordere einen neuen an.",
    };
  }

  redirect("/login?reset=ok");
}
