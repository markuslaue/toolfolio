import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AbosListe } from "@/components/app/abos-liste";
import { createClient } from "@/lib/supabase/server";
import { getActiveAccount } from "@/lib/active-account";
import { ladeAboOptionen } from "@/lib/abo-optionen";
import type { Abo } from "@/lib/abos";

export const metadata: Metadata = { title: "Abos" };

export default async function AbosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const account = await getActiveAccount(supabase, user.id);

  const { data } = await supabase
    .from("abos")
    .select("*")
    .eq("user_id", account)
    // Standard: alphabetisch nach Tool. Wer ein bestimmtes Abo sucht, sucht es
    // beim Namen, nicht beim Abbuchungsdatum. Fristen stehen im Fristen-Waechter.
    .order("tool", { ascending: true })
    .order("created_at", { ascending: false });

  const { kanalOptionen, kundenOptionen } = await ladeAboOptionen();

  return (
    <AbosListe
      abos={(data as Abo[]) ?? []}
      kanalOptionen={kanalOptionen}
      kundenOptionen={kundenOptionen}
    />
  );
}
