import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { FristenWaechter } from "@/components/app/fristen-waechter";
import { createClient } from "@/lib/supabase/server";
import { getActiveAccount } from "@/lib/active-account";
import { deriveFristen } from "@/lib/fristen";
import type { Abo } from "@/lib/abos";
import type { Zahlungskanal } from "@/lib/zahlungskanaele";

export const metadata: Metadata = { title: "Fristen" };

type Quittung = { quelle_id: string; art: string; datum: string };

export default async function FristenPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const account = await getActiveAccount(supabase, user.id);

  const [{ data: abos }, { data: kanaele }, { data: quittungen }] = await Promise.all([
    supabase.from("abos").select("*").eq("user_id", account),
    supabase.from("zahlungskanaele").select("*").eq("user_id", account),
    supabase.from("frist_quittungen").select("quelle_id, art, datum").eq("user_id", account),
  ]);

  const erledigt = new Set(
    ((quittungen as Quittung[]) ?? []).map((q) => `${q.quelle_id}:${q.art}:${q.datum}`),
  );

  const offen = deriveFristen(
    (abos as Abo[]) ?? [],
    (kanaele as Zahlungskanal[]) ?? [],
  ).filter((f) => !erledigt.has(f.key));

  return <FristenWaechter fristen={offen} />;
}
