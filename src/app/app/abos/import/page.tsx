import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ImportFlow } from "@/components/app/import-flow";
import { createClient } from "@/lib/supabase/server";
import { ladeAboOptionen } from "@/lib/abo-optionen";

export const metadata: Metadata = { title: "Kontoauszug importieren" };

export default async function ImportPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ kanalOptionen }, { data: abos }] = await Promise.all([
    ladeAboOptionen(),
    supabase.from("abos").select("tool"),
  ]);

  const existingTools = ((abos as { tool: string }[]) ?? []).map((a) => a.tool);

  return <ImportFlow kanalOptionen={kanalOptionen} existingTools={existingTools} />;
}
