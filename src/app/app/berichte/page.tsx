import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { BerichteClient, type KundenReport } from "@/components/app/berichte-client";
import { createClient } from "@/lib/supabase/server";
import { getActiveAccount } from "@/lib/active-account";
import { monatlich, type Abo } from "@/lib/abos";
import type { Kunde } from "@/lib/kunden";

export const metadata: Metadata = { title: "Berichte" };

type Unternehmen = { name: string | null; strasse: string | null; plz: string | null; ort: string | null; ust_id: string | null };

export default async function BerichtePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const account = await getActiveAccount(supabase, user.id);

  const [{ data: unternehmen }, { data: kunden }, { data: abos }] = await Promise.all([
    supabase.from("unternehmen").select("name, strasse, plz, ort, ust_id").eq("user_id", account).maybeSingle(),
    supabase.from("kunden").select("*").eq("user_id", account),
    supabase.from("abos").select("*").eq("user_id", account),
  ]);

  const kundeByName = new Map(((kunden as Kunde[]) ?? []).map((k) => [k.name, k]));

  // Pro Kunde die weiterverrechenbaren Abos sammeln.
  const map = new Map<string, KundenReport>();
  for (const a of (abos as Abo[]) ?? []) {
    if (!a.weiterverrechnen || !a.kunde) continue;
    const k = kundeByName.get(a.kunde);
    const aufschlag = a.aufschlag_prozent ?? k?.aufschlag_prozent ?? 0;
    const mtl = monatlich(a.kosten, a.intervall);
    const weiter = Math.round(mtl * (1 + aufschlag / 100) * 100) / 100;
    const marge = Math.round((mtl * aufschlag) / 100 * 100) / 100;

    const eintrag = map.get(a.kunde) ?? {
      kunde: a.kunde,
      farbe: k?.farbe ?? "#6C5CE7",
      positionen: [],
      summeKosten: 0,
      summeWeiter: 0,
      summeMarge: 0,
    };
    eintrag.positionen.push({ tool: a.tool, kategorie: a.kategorie, kosten: Math.round(mtl * 100) / 100, aufschlag, weiter, marge });
    eintrag.summeKosten = Math.round((eintrag.summeKosten + mtl) * 100) / 100;
    eintrag.summeWeiter = Math.round((eintrag.summeWeiter + weiter) * 100) / 100;
    eintrag.summeMarge = Math.round((eintrag.summeMarge + marge) * 100) / 100;
    map.set(a.kunde, eintrag);
  }

  const reports = Array.from(map.values()).sort((a, b) => b.summeWeiter - a.summeWeiter);

  return (
    <BerichteClient
      reports={reports}
      unternehmen={(unternehmen as Unternehmen) ?? null}
      stand={new Date().toISOString().slice(0, 10)}
    />
  );
}
