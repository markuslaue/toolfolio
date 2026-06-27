import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ArchivClient, type Dok, type AboRef, type DocTyp } from "@/components/app/archiv-client";
import { createClient } from "@/lib/supabase/server";
import { getActiveAccount } from "@/lib/active-account";

export const metadata: Metadata = { title: "Archiv" };

type DokRow = { id: string; abo_id: string | null; typ: DocTyp; titel: string; datum: string | null; jahr: number | null; betrag: number | null; storage_path: string | null };

export default async function Page() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const account = await getActiveAccount(supabase, user.id);

  const [{ data: docs }, { data: abos }] = await Promise.all([
    supabase.from("dokumente").select("id, abo_id, typ, titel, datum, jahr, betrag, storage_path").eq("user_id", account).order("datum", { ascending: false }),
    supabase.from("abos").select("id, tool, farbe, kategorie, initial").eq("user_id", account).order("tool"),
  ]);

  const dokumente: Dok[] = ((docs as DokRow[]) ?? []).map((d) => ({
    id: d.id, abo_id: d.abo_id, typ: d.typ, titel: d.titel, datum: d.datum, jahr: d.jahr, betrag: d.betrag != null ? Number(d.betrag) : null, hatDatei: !!d.storage_path,
  }));

  return <ArchivClient dokumente={dokumente} abos={(abos as AboRef[]) ?? []} />;
}
