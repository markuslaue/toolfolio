import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ZahlungskanaeleClient } from "@/components/app/zahlungskanaele-client";
import { createClient } from "@/lib/supabase/server";
import { getActiveAccount } from "@/lib/active-account";
import type { Zahlungskanal } from "@/lib/zahlungskanaele";

export const metadata: Metadata = { title: "Zahlungskanäle" };

export default async function ZahlungskanaelePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const account = await getActiveAccount(supabase, user.id);

  const { data } = await supabase
    .from("zahlungskanaele")
    .select("*")
    .eq("user_id", account)
    .order("created_at", { ascending: false });

  return <ZahlungskanaeleClient kanaele={(data as Zahlungskanal[]) ?? []} />;
}
