import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ZugaengeClient, type Person, type Zugang, type ToolRef, type Offboarding } from "@/components/app/zugaenge-client";
import { createClient } from "@/lib/supabase/server";
import { getActiveAccount } from "@/lib/active-account";
import { monatlich, type Abo } from "@/lib/abos";

export const metadata: Metadata = { title: "Team & Zugänge" };

export default async function Page() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const account = await getActiveAccount(supabase, user.id);

  const [{ data: personen }, { data: zugaenge }, { data: abos }, { data: protokoll }] = await Promise.all([
    supabase.from("personen").select("id, name, rolle, email, status, austritt, farbe").eq("user_id", account).order("created_at"),
    supabase.from("tool_zugang").select("id, person_id, abo_id, platz_kosten, letzte_aktivitaet").eq("user_id", account),
    supabase.from("abos").select("id, tool, farbe, kategorie, kosten, intervall, status, owner_person_id").eq("user_id", account).order("tool"),
    supabase.from("offboarding").select("id, person_name, zugaenge_entzogen, plaetze_zurueck, ersparnis_monatlich, tools, erledigt_am").eq("user_id", account).order("erledigt_am", { ascending: false }).limit(5),
  ]);

  const tools: ToolRef[] = ((abos as (Abo & { owner_person_id: string | null })[]) ?? [])
    .filter((a) => a.status === "aktiv" || a.status === "Trial")
    .map((a) => ({
      id: a.id,
      tool: a.tool,
      farbe: a.farbe ?? "#6C5CE7",
      kategorie: a.kategorie,
      monatlich: Math.round(monatlich(a.kosten, a.intervall) * 100) / 100,
      ownerPersonId: a.owner_person_id ?? null,
    }));

  return (
    <ZugaengeClient
      personen={(personen as Person[]) ?? []}
      zugaenge={((zugaenge as (Zugang & { platz_kosten: number | null })[]) ?? []).map((z) => ({ ...z, platz_kosten: z.platz_kosten != null ? Number(z.platz_kosten) : null }))}
      tools={tools}
      protokoll={((protokoll as Offboarding[]) ?? []).map((o) => ({ ...o, ersparnis_monatlich: Number(o.ersparnis_monatlich) }))}
    />
  );
}
