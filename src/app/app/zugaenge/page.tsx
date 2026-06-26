import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ZugaengeClient, type Person, type Zugang, type ToolRef } from "@/components/app/zugaenge-client";
import { createClient } from "@/lib/supabase/server";
import { monatlich, type Abo } from "@/lib/abos";

export const metadata: Metadata = { title: "Team & Zugänge" };

export default async function Page() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: personen }, { data: zugaenge }, { data: abos }] = await Promise.all([
    supabase.from("personen").select("id, name, rolle, email, status, austritt").eq("user_id", user.id).order("created_at"),
    supabase.from("tool_zugang").select("id, person_id, abo_id, platz_kosten, ist_owner").eq("user_id", user.id),
    supabase.from("abos").select("id, tool, farbe, kategorie, kosten, intervall, status").eq("user_id", user.id).order("tool"),
  ]);

  const tools: ToolRef[] = ((abos as Abo[]) ?? [])
    .filter((a) => a.status === "aktiv" || a.status === "Trial")
    .map((a) => ({ id: a.id, tool: a.tool, farbe: a.farbe ?? "#6C5CE7", kategorie: a.kategorie, monatlich: Math.round(monatlich(a.kosten, a.intervall) * 100) / 100 }));

  return (
    <ZugaengeClient
      personen={(personen as Person[]) ?? []}
      zugaenge={((zugaenge as (Zugang & { platz_kosten: number | null })[]) ?? []).map((z) => ({ ...z, platz_kosten: z.platz_kosten != null ? Number(z.platz_kosten) : null }))}
      tools={tools}
    />
  );
}
