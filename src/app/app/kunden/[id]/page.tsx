import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { KundeDetail } from "@/components/app/kunde-detail";
import { createClient } from "@/lib/supabase/server";
import type { Abo } from "@/lib/abos";
import type { Kunde } from "@/lib/kunden";

export const metadata: Metadata = { title: "Kunde" };

export default async function KundeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: kunde } = await supabase
    .from("kunden")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();
  if (!kunde) notFound();

  // Abos dieses Kunden (Match ueber den Namen).
  const { data: abos } = await supabase
    .from("abos")
    .select("*")
    .eq("kunde", (kunde as Kunde).name)
    .order("naechste_abbuchung", { ascending: true, nullsFirst: false });

  return <KundeDetail kunde={kunde as Kunde} abos={(abos as Abo[]) ?? []} />;
}
