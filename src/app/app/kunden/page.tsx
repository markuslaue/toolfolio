import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { KundenClient } from "@/components/app/kunden-client";
import { createClient } from "@/lib/supabase/server";
import { monatlich, type Abo } from "@/lib/abos";
import type { Kunde, KundeMitStats } from "@/lib/kunden";

export const metadata: Metadata = { title: "Kunden" };

export default async function KundenPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: kunden }, { data: abos }] = await Promise.all([
    supabase.from("kunden").select("*").order("name"),
    supabase.from("abos").select("kunde, kosten, intervall"),
  ]);

  // Kennzahlen je Kunde aus den Abos ableiten (Match ueber den Namen).
  const stats = new Map<string, { tools: number; kostenMonat: number }>();
  for (const a of (abos as Pick<Abo, "kunde" | "kosten" | "intervall">[]) ?? []) {
    if (!a.kunde) continue;
    const cur = stats.get(a.kunde) ?? { tools: 0, kostenMonat: 0 };
    cur.tools += 1;
    cur.kostenMonat += monatlich(a.kosten, a.intervall);
    stats.set(a.kunde, cur);
  }

  const angereichert: KundeMitStats[] = ((kunden as Kunde[]) ?? []).map((k) => ({
    ...k,
    tools: stats.get(k.name)?.tools ?? 0,
    kostenMonat: stats.get(k.name)?.kostenMonat ?? 0,
  }));

  return <KundenClient kunden={angereichert} />;
}
