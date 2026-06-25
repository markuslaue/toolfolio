import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ZahlungskanaeleClient } from "@/components/app/zahlungskanaele-client";
import { createClient } from "@/lib/supabase/server";
import type { Zahlungskanal } from "@/lib/zahlungskanaele";

export const metadata: Metadata = { title: "Zahlungskanäle" };

export default async function ZahlungskanaelePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data } = await supabase
    .from("zahlungskanaele")
    .select("*")
    .order("created_at", { ascending: false });

  return <ZahlungskanaeleClient kanaele={(data as Zahlungskanal[]) ?? []} />;
}
