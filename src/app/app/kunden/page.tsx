import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { KundenClient } from "@/components/app/kunden-client";
import { createClient } from "@/lib/supabase/server";
import { getActiveAccount } from "@/lib/active-account";
import { monatlich, type Abo } from "@/lib/abos";
import type { Kunde, KundeMitStats } from "@/lib/kunden";

export const metadata: Metadata = { title: "Kunden" };

export default async function KundenPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const account = await getActiveAccount(supabase, user.id);

  const [{ data: kunden }, { data: abos }] = await Promise.all([
    supabase.from("kunden").select("*").eq("user_id", account).order("name"),
    supabase.from("abos").select("kunde, kosten, intervall, status").eq("user_id", account),
  ]);

  type AboZeile = Pick<Abo, "kunde" | "kosten" | "intervall" | "status">;
  // Beendete Abos kosten nichts mehr, sie verzerren die Zuordnung nur.
  const lebend = ((abos as AboZeile[]) ?? []).filter(
    (a) => a.status !== "archiviert" && a.status !== "gekuendigt",
  );

  // Kennzahlen je Kunde aus den Abos ableiten (Match ueber den Namen).
  const stats = new Map<string, { tools: number; kostenMonat: number }>();
  let internKosten = 0;
  let internTools = 0;
  for (const a of lebend) {
    const mtl = monatlich(a.kosten, a.intervall);
    if (!a.kunde) {
      internKosten += mtl;
      internTools += 1;
      continue;
    }
    const cur = stats.get(a.kunde) ?? { tools: 0, kostenMonat: 0 };
    cur.tools += 1;
    cur.kostenMonat += mtl;
    stats.set(a.kunde, cur);
  }

  const runde = (n: number) => Math.round(n * 100) / 100;

  const angereichert: KundeMitStats[] = ((kunden as Kunde[]) ?? []).map((k) => ({
    ...k,
    tools: stats.get(k.name)?.tools ?? 0,
    kostenMonat: runde(stats.get(k.name)?.kostenMonat ?? 0),
  }));

  return (
    <KundenClient kunden={angereichert} internKosten={runde(internKosten)} internTools={internTools} />
  );
}
