import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { KundeDetail } from "@/components/app/kunde-detail";
import { createClient } from "@/lib/supabase/server";
import { getActiveAccount } from "@/lib/active-account";
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
  const account = await getActiveAccount(supabase, user.id);

  const { data: kunde } = await supabase
    .from("kunden")
    .select("*")
    .eq("id", id)
    .eq("user_id", account)
    .single();
  if (!kunde) notFound();

  // Abos dieses Kunden (Match ueber den Namen).
  const { data: abos } = await supabase
    .from("abos")
    .select("*")
    .eq("kunde", (kunde as Kunde).name)
    .eq("user_id", account)
    .order("naechste_abbuchung", { ascending: true, nullsFirst: false });

  return <KundeDetail kunde={kunde as Kunde} abos={(abos as Abo[]) ?? []} />;
}
