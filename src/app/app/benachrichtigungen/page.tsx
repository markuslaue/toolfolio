import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { BenachrichtigungenClient } from "@/components/app/benachrichtigungen-client";
import { createClient } from "@/lib/supabase/server";
import { deriveFristen } from "@/lib/fristen";
import { berechneVorschlaege } from "@/lib/sparvorschlaege";
import { buildAktionen, zeitgruppe, type Aktion, type AktivitaetsEintrag, type BenachrStatus } from "@/lib/benachrichtigungen";
import type { Abo } from "@/lib/abos";
import type { Zahlungskanal } from "@/lib/zahlungskanaele";

export const metadata: Metadata = { title: "Benachrichtigungen" };

function eur(n: number) {
  return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(n);
}

export default async function Page() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: abos }, { data: kanaele }, { data: kunden }, { data: spar }, { data: benachr }] = await Promise.all([
    supabase.from("abos").select("*").eq("user_id", user.id),
    supabase.from("zahlungskanaele").select("*").eq("user_id", user.id),
    supabase.from("kunden").select("name, created_at").eq("user_id", user.id),
    supabase.from("sparvorschlag_status").select("vorschlag_key, status, titel, ersparnis_jahr, updated_at").eq("user_id", user.id),
    supabase.from("benachrichtigung_status").select("key, status").eq("user_id", user.id),
  ]);

  const aboList = (abos as Abo[]) ?? [];
  const kanalList = (kanaele as Zahlungskanal[]) ?? [];

  // Aktionen aus Fristen + offenen Sparvorschlaegen
  const fristen = deriveFristen(aboList, kanalList);
  const sparRows = (spar as { vorschlag_key: string; status: string; titel: string; ersparnis_jahr: number; updated_at: string }[]) ?? [];
  const erledigteSpar = new Set(sparRows.map((r) => r.vorschlag_key));
  const offeneVorschlaege = berechneVorschlaege(aboList).filter((v) => !erledigteSpar.has(v.key));
  const statusMap = new Map<string, BenachrStatus>(
    ((benachr as { key: string; status: BenachrStatus }[]) ?? []).map((r) => [r.key, r.status]),
  );
  const aktionen: Aktion[] = buildAktionen(fristen, offeneVorschlaege, statusMap);

  // Aktivitaet aus echten Ereignissen
  const roh: { typ: AktivitaetsEintrag["typ"]; text: string; ts: number }[] = [];
  for (const a of (abos as ({ tool: string; created_at: string } & Abo)[]) ?? []) {
    if (a.created_at) roh.push({ typ: "abo-add", text: `Abo ${a.tool} hinzugefügt.`, ts: new Date(a.created_at).getTime() });
  }
  for (const k of (kunden as { name: string; created_at: string }[]) ?? []) {
    if (k.created_at) roh.push({ typ: "kunde-zuordnen", text: `Kunde ${k.name} angelegt.`, ts: new Date(k.created_at).getTime() });
  }
  for (const k of (kanaele as ({ bezeichnung: string; created_at: string } & Zahlungskanal)[]) ?? []) {
    if (k.created_at) roh.push({ typ: "zahlungskanal", text: `Zahlungskanal ${k.bezeichnung} hinzugefügt.`, ts: new Date(k.created_at).getTime() });
  }
  for (const r of sparRows) {
    if (r.status === "umgesetzt") roh.push({ typ: "vorschlag-umgesetzt", text: `Sparvorschlag ${r.titel} umgesetzt, ${eur(Number(r.ersparnis_jahr))} pro Jahr geholt.`, ts: new Date(r.updated_at).getTime() });
  }

  const aktivitaet: AktivitaetsEintrag[] = roh
    .sort((a, b) => b.ts - a.ts)
    .slice(0, 40)
    .map((r, i) => {
      const { gruppe, zeit } = zeitgruppe(r.ts);
      return { id: `act-${i}`, typ: r.typ, text: r.text, zeit, gruppe, ts: r.ts };
    });

  return <BenachrichtigungenClient aktionen={aktionen} aktivitaet={aktivitaet} />;
}
