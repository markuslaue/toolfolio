import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SeatsClient, type ToolSeat, type SeatNutzer } from "@/components/app/seats-client";
import { createClient } from "@/lib/supabase/server";
import { getActiveAccount } from "@/lib/active-account";
import { monatlich, KATEGORIE_FARBEN, type Abo } from "@/lib/abos";

export const metadata: Metadata = { title: "Seats und Lizenzen" };

type AboRow = Abo & { lizenzen: number | null };
type ZugangRow = { id: string; abo_id: string; person_id: string };
type PersonRow = { id: string; name: string; rolle: string | null; email: string | null; status: string };

/** Zwei Initialen aus dem Toolnamen, wie in der Vorlage ("Sl", "Fi"). */
function initialen(name: string): string {
  const teile = name.trim().split(/\s+/).filter(Boolean);
  if (teile.length >= 2) return (teile[0][0] + teile[1][0]).toUpperCase();
  return (name.slice(0, 2) || "?").replace(/^./, (c) => c.toUpperCase());
}

export default async function Page() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const account = await getActiveAccount(supabase, user.id);

  const [{ data: abos }, { data: zugaenge }, { data: personen }] = await Promise.all([
    supabase
      .from("abos")
      .select("id, tool, farbe, kategorie, kosten, intervall, status, lizenzen")
      .eq("user_id", account)
      .order("tool"),
    supabase.from("tool_zugang").select("id, abo_id, person_id").eq("user_id", account),
    supabase.from("personen").select("id, name, rolle, email, status").eq("user_id", account),
  ]);

  const personById = new Map(((personen as PersonRow[]) ?? []).map((p) => [p.id, p]));

  const zugaengeJeAbo = new Map<string, ZugangRow[]>();
  for (const z of (zugaenge as ZugangRow[]) ?? []) {
    zugaengeJeAbo.set(z.abo_id, [...(zugaengeJeAbo.get(z.abo_id) ?? []), z]);
  }

  const tools: ToolSeat[] = ((abos as AboRow[]) ?? [])
    .filter((a) => a.status === "aktiv" || a.status === "Trial")
    .map((a) => {
      const mtl = Math.round(monatlich(a.kosten, a.intervall) * 100) / 100;
      const meine = zugaengeJeAbo.get(a.id) ?? [];
      const zugewiesen = meine.length;
      const gebucht = a.lizenzen;

      // Preis pro Platz: die gebuchten Plaetze teilen sich die Monatskosten.
      // Ohne hinterlegte Platzzahl behelfen wir uns mit den zugewiesenen.
      const basis = gebucht && gebucht > 0 ? gebucht : zugewiesen > 0 ? zugewiesen : 1;
      const preisProPlatz = Math.round((mtl / basis) * 100) / 100;
      const ungenutzt = gebucht != null ? Math.max(0, gebucht - zugewiesen) : null;

      const nutzer: SeatNutzer[] = meine
        .map((z) => {
          const p = personById.get(z.person_id);
          if (!p) return null;
          return {
            zugangId: z.id,
            name: p.name,
            rolle: p.rolle,
            email: p.email,
            inaktiv: p.status !== "aktiv",
          };
        })
        .filter((x): x is SeatNutzer => x !== null)
        .sort((x, y) => x.name.localeCompare(y.name, "de"));

      return {
        id: a.id,
        tool: a.tool,
        initialen: initialen(a.tool),
        farbe: a.farbe ?? KATEGORIE_FARBEN[a.kategorie] ?? "#6C5CE7",
        kategorie: a.kategorie,
        monatlich: mtl,
        gebucht,
        zugewiesen,
        preisProPlatz,
        ungenutzt,
        verschwendungMonat: ungenutzt != null ? Math.round(ungenutzt * preisProPlatz * 100) / 100 : 0,
        nutzer,
      };
    });

  return <SeatsClient tools={tools} />;
}
