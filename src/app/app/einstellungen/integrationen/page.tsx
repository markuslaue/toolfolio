import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getActiveAccount } from "@/lib/active-account";
import { IntegrationenClient, type IntegrationInfo } from "@/components/app/integrationen-client";

export const metadata: Metadata = { title: "Integrationen" };

export default async function Page() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const account = await getActiveAccount(supabase, user.id);

  // Nur Metadaten. Das Geheimnis liegt in einer Tabelle ohne Lese-Policy und
  // ist hier bewusst nicht abrufbar.
  const { data } = await supabase
    .from("integration")
    .select("provider, label, guthaben, last_sync_at, last_status")
    .eq("user_id", account);

  return <IntegrationenClient verbunden={(data as IntegrationInfo[]) ?? []} />;
}
