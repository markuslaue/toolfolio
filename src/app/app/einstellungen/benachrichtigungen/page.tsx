import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { BenachrichtigungenForm, type Prefs } from "@/components/app/benachrichtigungen-form";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Benachrichtigungen" };

export default async function BenachrichtigungenPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data } = await supabase
    .from("profiles")
    .select("benachrichtigung_frist, benachrichtigung_trial, benachrichtigung_produkt, benachrichtigung_vorlauf")
    .eq("id", user.id)
    .single();

  const initial: Prefs = {
    benachrichtigung_frist: data?.benachrichtigung_frist ?? true,
    benachrichtigung_trial: data?.benachrichtigung_trial ?? true,
    benachrichtigung_produkt: data?.benachrichtigung_produkt ?? true,
    benachrichtigung_vorlauf: data?.benachrichtigung_vorlauf ?? 14,
  };

  return <BenachrichtigungenForm initial={initial} />;
}
