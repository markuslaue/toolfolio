import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ImportFlow } from "@/components/app/import-flow";
import { createClient } from "@/lib/supabase/server";
import { getActiveAccount } from "@/lib/active-account";
import { ladeAboOptionen } from "@/lib/abo-optionen";

export const metadata: Metadata = { title: "Kontoauszug importieren" };

export default async function ImportPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const account = await getActiveAccount(supabase, user.id);

  const [{ kanalOptionen }, { data: abos }] = await Promise.all([
    ladeAboOptionen(),
    supabase.from("abos").select("tool").eq("user_id", account),
  ]);

  const existingTools = ((abos as { tool: string }[]) ?? []).map((a) => a.tool);

  return <ImportFlow kanalOptionen={kanalOptionen} existingTools={existingTools} />;
}
