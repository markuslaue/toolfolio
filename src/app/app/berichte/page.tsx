import type { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  BerichteClient,
  type ReportKunde,
  type MonatsWert,
  type VerteilungsWert,
  type VerlaufEintrag,
  type Firma,
} from "@/components/app/berichte-client";
import { createClient } from "@/lib/supabase/server";
import { getActiveAccount } from "@/lib/active-account";
import { monatlich, KATEGORIE_FARBEN, type Abo } from "@/lib/abos";
import { berechneVerlauf } from "@/lib/kostenverlauf";
import type { AiSpendRow } from "@/lib/ai-credits";
import type { Kunde } from "@/lib/kunden";

export const metadata: Metadata = { title: "Berichte" };

const KANAL_FARBEN = ["#6C5CE7", "#FF7A66", "#12B76A", "#F5A623", "#3B82F6", "#0FB5BA", "#E84393", "#9CA3AF"];

type VerlaufRow = {
  id: string;
  typ: VerlaufEintrag["typ"];
  titel: string;
  kunde: string | null;
  zeitraum: string;
  betrag: number | null;
  created_at: string;
};

function runde(n: number): number {
  return Math.round(n * 100) / 100;
}

export default async function BerichtePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const account = await getActiveAccount(supabase, user.id);

  const [firmaRes, kundenRes, aboRes, spendRes, verlaufRes] = await Promise.all([
    supabase.from("unternehmen").select("name, strasse, plz, ort, ust_id").eq("user_id", account).maybeSingle(),
    supabase.from("kunden").select("*").eq("user_id", account),
    supabase.from("abos").select("*").eq("user_id", account),
    supabase.from("ai_spend").select("service_id, jahr, monat, betrag").eq("user_id", account),
    supabase
      .from("bericht_verlauf")
      .select("id, typ, titel, kunde, zeitraum, betrag, created_at")
      .eq("user_id", account)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  const kundenRows = (kundenRes.data as Kunde[]) ?? [];
  const abos = (aboRes.data as Abo[]) ?? [];
  const spend = (spendRes.data as AiSpendRow[]) ?? [];
  const lebend = abos.filter((a) => a.status !== "archiviert" && a.status !== "gekuendigt");

  /* Kunden mit ihren Tools. Auch Kunden ohne Abos erscheinen, damit die Auswahl
     zeigt, dass sie existieren (die Vorschau erklaert dann, was fehlt). */
  const kunden: ReportKunde[] = kundenRows.map((k) => ({
    id: k.id,
    name: k.name,
    farbe: k.farbe ?? "#6C5CE7",
    tools: lebend
      .filter((a) => a.kunde === k.name)
      .map((a) => ({
        name: a.tool,
        kategorie: a.kategorie,
        kosten: runde(monatlich(a.kosten, a.intervall)),
        weiterverrechnet: a.weiterverrechnen,
        // Aufschlag am Abo schlaegt den Standardaufschlag des Kunden.
        aufschlagProzent: a.aufschlag_prozent ?? k.aufschlag_prozent ?? 0,
      })),
  }));

  /* Ausgaben: echte Monatswerte (Fix rekonstruiert + variable Istwerte). */
  const verlauf12M: MonatsWert[] = berechneVerlauf(abos, spend).map((p) => ({
    jahr: p.jahr,
    monat: p.monat,
    label: p.label,
    betrag: runde(p.fix + p.variabel),
  }));

  /* Verteilung nach Kategorie und Zahlungskanal, jeweils Monatswerte. */
  const katMap = new Map<string, number>();
  const kanalMap = new Map<string, number>();
  for (const a of lebend) {
    const m = monatlich(a.kosten, a.intervall);
    katMap.set(a.kategorie, (katMap.get(a.kategorie) ?? 0) + m);
    if (a.zahlungskanal) kanalMap.set(a.zahlungskanal, (kanalMap.get(a.zahlungskanal) ?? 0) + m);
  }
  const nachKategorie: VerteilungsWert[] = [...katMap.entries()]
    .map(([name, betrag]) => ({ name, betrag: runde(betrag), farbe: KATEGORIE_FARBEN[name] ?? "#6C5CE7" }))
    .sort((a, b) => b.betrag - a.betrag);
  const nachKanal: VerteilungsWert[] = [...kanalMap.entries()]
    .map(([name, betrag], i) => ({ name, betrag: runde(betrag), farbe: KANAL_FARBEN[i % KANAL_FARBEN.length] }))
    .sort((a, b) => b.betrag - a.betrag);

  const verlauf: VerlaufEintrag[] = ((verlaufRes.data as VerlaufRow[]) ?? []).map((v) => ({
    id: v.id,
    typ: v.typ,
    titel: v.titel,
    kunde: v.kunde,
    zeitraum: v.zeitraum,
    betrag: v.betrag === null ? null : Number(v.betrag),
    datum: new Date(v.created_at).toLocaleDateString("de-DE"),
  }));

  return (
    <BerichteClient
      kunden={kunden}
      verlauf12M={verlauf12M}
      nachKategorie={nachKategorie}
      nachKanal={nachKanal}
      firma={(firmaRes.data as Firma) ?? null}
      verlauf={verlauf}
    />
  );
}
