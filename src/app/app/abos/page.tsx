import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AbosClient } from "@/components/app/abos-client";
import { createClient } from "@/lib/supabase/server";
import type { Abo } from "@/lib/abos";

export const metadata: Metadata = { title: "Abos" };

export default async function AbosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data } = await supabase
    .from("abos")
    .select("*")
    .order("naechste_abbuchung", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });

  return <AbosClient abos={(data as Abo[]) ?? []} />;
}
