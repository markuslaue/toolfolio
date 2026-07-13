import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { KundeDetail, type VerlaufPunkt, type Aktivitaet } from "@/components/app/kunde-detail";
import { createClient } from "@/lib/supabase/server";
import { getActiveAccount } from "@/lib/active-account";
import { berechneVerlauf } from "@/lib/kostenverlauf";
import type { Abo } from "@/lib/abos";
import type { Kunde } from "@/lib/kunden";

export const metadata: Metadata = { title: "Kunde" };

type AboMitZeit = Abo & { created_at: string };
type BerichtRow = { titel: string; zeitraum: string; created_at: string };

/** "vor 3 Tagen", "vor 2 Monaten", ohne Bibliothek. */
function relativ(iso: string, jetzt = Date.now()): string {
  const tage = Math.floor((jetzt - new Date(iso).getTime()) / 86_400_000);
  if (tage <= 0) return "heute";
  if (tage === 1) return "gestern";
  if (tage < 7) return `vor ${tage} Tagen`;
  const wochen = Math.floor(tage / 7);
  if (wochen < 5) return `vor ${wochen} ${wochen === 1 ? "Woche" : "Wochen"}`;
  const monate = Math.floor(tage / 30);
  if (monate < 12) return `vor ${monate} ${monate === 1 ? "Monat" : "Monaten"}`;
  const jahre = Math.floor(tage / 365);
  return `vor ${jahre} ${jahre === 1 ? "Jahr" : "Jahren"}`;
}

export default async function KundeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const account = await getActiveAccount(supabase, user.id);

  const { data: kundeRow } = await supabase
    .from("kunden")
    .select("*, created_at")
    .eq("id", id)
    .eq("user_id", account)
    .single();
  if (!kundeRow) notFound();
  const kunde = kundeRow as Kunde & { created_at: string };

  // Abos dieses Kunden (Zuordnung laeuft ueber den Namen).
  const [aboRes, berichtRes] = await Promise.all([
    supabase
      .from("abos")
      .select("*")
      .eq("kunde", kunde.name)
      .eq("user_id", account)
      .order("naechste_abbuchung", { ascending: true, nullsFirst: false }),
    supabase
      .from("bericht_verlauf")
      .select("titel, zeitraum, created_at")
      .eq("user_id", account)
      .eq("kunde", kunde.name)
      .order("created_at", { ascending: false })
      .limit(3),
  ]);

  const abos = ((aboRes.data as AboMitZeit[]) ?? []).filter(
    (a) => a.status !== "archiviert" && a.status !== "gekuendigt",
  );

  // Kostenverlauf aus den Abos DIESES Kunden. Variable Kosten haengen an
  // AI-Diensten, nicht an Kunden, deshalb hier nur die Fixkosten.
  const verlauf: VerlaufPunkt[] = berechneVerlauf(abos, []).map((p) => ({
    label: p.label,
    wert: Math.round(p.fix * 100) / 100,
  }));

  /* Aktivitaet aus echten Ereignissen: angelegte Zuordnungen, erstellte Berichte,
     Anlage des Kunden. Kein erfundener Verlauf. */
  const roh: { ts: string; text: string }[] = [
    ...abos.map((a) => ({ ts: a.created_at, text: `${a.tool} zugeordnet` })),
    ...(((berichtRes.data as BerichtRow[]) ?? []).map((b) => ({
      ts: b.created_at,
      text: `Bericht für ${b.zeitraum} erstellt`,
    })) ?? []),
    { ts: kunde.created_at, text: "Kunde angelegt" },
  ];

  const aktivitaet: Aktivitaet[] = roh
    .sort((a, b) => (a.ts < b.ts ? 1 : -1))
    .slice(0, 6)
    .map((e) => ({ text: e.text, ts: relativ(e.ts) }));

  return <KundeDetail kunde={kunde} abos={abos} verlauf={verlauf} aktivitaet={aktivitaet} />;
}
