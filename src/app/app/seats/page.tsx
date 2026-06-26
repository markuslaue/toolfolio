import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SeatsClient, type ToolSeat } from "@/components/app/seats-client";
import { createClient } from "@/lib/supabase/server";
import { monatlich, type Abo } from "@/lib/abos";

export const metadata: Metadata = { title: "Seats & Lizenzen" };

type AboRow = Abo & { lizenzen: number | null };

export default async function Page() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: abos }, { data: zugaenge }, { data: personen }] = await Promise.all([
    supabase.from("abos").select("id, tool, farbe, kategorie, kosten, intervall, status, lizenzen").eq("user_id", user.id).order("tool"),
    supabase.from("tool_zugang").select("abo_id, person_id").eq("user_id", user.id),
    supabase.from("personen").select("id, name, rolle").eq("user_id", user.id),
  ]);

  const personById = new Map(((personen as { id: string; name: string; rolle: string | null }[]) ?? []).map((p) => [p.id, p]));
  const zugByAbo = new Map<string, string[]>();
  for (const z of ((zugaenge as { abo_id: string; person_id: string }[]) ?? [])) {
    zugByAbo.set(z.abo_id, [...(zugByAbo.get(z.abo_id) ?? []), z.person_id]);
  }

  const tools: ToolSeat[] = ((abos as AboRow[]) ?? [])
    .filter((a) => a.status === "aktiv" || a.status === "Trial")
    .map((a) => {
      const mtl = Math.round(monatlich(a.kosten, a.intervall) * 100) / 100;
      const personIds = zugByAbo.get(a.id) ?? [];
      const zugewiesen = personIds.length;
      const gebucht = a.lizenzen;
      const basis = gebucht && gebucht > 0 ? gebucht : zugewiesen > 0 ? zugewiesen : 1;
      const preisProPlatz = Math.round((mtl / basis) * 100) / 100;
      const ungenutzt = gebucht != null ? Math.max(0, gebucht - zugewiesen) : null;
      const verschwendungMonat = ungenutzt != null ? Math.round(ungenutzt * preisProPlatz * 100) / 100 : 0;
      const nutzer = personIds.map((id) => personById.get(id)).filter(Boolean).map((p) => ({ name: p!.name, rolle: p!.rolle ?? null }));
      return { id: a.id, tool: a.tool, farbe: a.farbe ?? "#6C5CE7", kategorie: a.kategorie, monatlich: mtl, gebucht, zugewiesen, preisProPlatz, ungenutzt, verschwendungMonat, nutzer };
    });

  return <SeatsClient tools={tools} />;
}
