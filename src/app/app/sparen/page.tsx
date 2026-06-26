import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SparvorschlaegeClient } from "@/components/app/sparvorschlaege-client";
import { createClient } from "@/lib/supabase/server";
import { berechneVorschlaege, type Vorschlag, type Typ, type Status, type ToolRef } from "@/lib/sparvorschlaege";
import type { Abo } from "@/lib/abos";

export const metadata: Metadata = { title: "Sparvorschläge" };

type StatusRow = {
  vorschlag_key: string;
  status: "umgesetzt" | "ignoriert";
  typ: string;
  titel: string;
  ersparnis_jahr: number;
  begruendung: string | null;
  tools: ToolRef[];
  geschaetzt: boolean;
};

export default async function Page() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: abos }, { data: status }] = await Promise.all([
    supabase.from("abos").select("*").eq("user_id", user.id),
    supabase.from("sparvorschlag_status").select("*").eq("user_id", user.id),
  ]);

  const computed = berechneVorschlaege((abos as Abo[]) ?? []);
  const storedMap = new Map<string, StatusRow>(((status as StatusRow[]) ?? []).map((r) => [r.vorschlag_key, r]));

  // Berechnete Vorschlaege mit gespeichertem Status ueberschreiben.
  const items: Vorschlag[] = computed.map((v) => ({ ...v, status: storedMap.get(v.key)?.status ?? "offen" }));

  // Gespeicherte umgesetzte/ignorierte, die nicht mehr berechnet werden, aus Snapshot rekonstruieren.
  const computedKeys = new Set(computed.map((v) => v.key));
  for (const r of storedMap.values()) {
    if (computedKeys.has(r.vorschlag_key)) continue;
    items.push({
      key: r.vorschlag_key,
      typ: r.typ as Typ,
      titel: r.titel,
      ersparnisJahr: Number(r.ersparnis_jahr),
      begruendung: r.begruendung ?? "",
      tools: r.tools ?? [],
      aktion: "Ansehen",
      geschaetzt: r.geschaetzt,
      status: r.status as Status,
    });
  }

  return <SparvorschlaegeClient initial={items} />;
}
