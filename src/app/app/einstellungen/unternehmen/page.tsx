import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { UnternehmenForm, type Unternehmen } from "@/components/app/unternehmen-form";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Unternehmen" };

export default async function UnternehmenPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data } = await supabase
    .from("unternehmen")
    .select("name, strasse, plz, ort, land, ust_id, steuernummer")
    .eq("user_id", user.id)
    .maybeSingle();

  return <UnternehmenForm initial={(data as Unternehmen) ?? null} />;
}
