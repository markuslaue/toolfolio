import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { FreigabenClient, type Antrag, type Kontext } from "@/components/app/freigaben-client";
import { createClient } from "@/lib/supabase/server";
import { monatlich, type Abo } from "@/lib/abos";

export const metadata: Metadata = { title: "Freigaben" };

type AntragRow = { id: string; tool: string; kategorie: string; kosten: number; intervall: Abo["intervall"]; antragsteller: string | null; begruendung: string | null; status: "ausstehend" | "genehmigt" | "abgelehnt"; grund_ablehnung: string | null };

export default async function Page() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: antraege }, { data: abos }, { data: profil }, { data: personen }] = await Promise.all([
    supabase.from("freigabe_antrag").select("id, tool, kategorie, kosten, intervall, antragsteller, begruendung, status, grund_ablehnung").eq("user_id", user.id).order("created_at", { ascending: false }),
    supabase.from("abos").select("kategorie, kosten, intervall, status").eq("user_id", user.id),
    supabase.from("profiles").select("budget_jahr").eq("id", user.id).maybeSingle(),
    supabase.from("personen").select("name").eq("user_id", user.id).order("name"),
  ]);

  const aktiveAbos = ((abos as Abo[]) ?? []).filter((a) => a.status === "aktiv" || a.status === "Trial");
  const aktuellMonat = aktiveAbos.reduce((s, a) => s + monatlich(a.kosten, a.intervall), 0);
  const katCount = new Map<string, number>();
  for (const a of aktiveAbos) katCount.set(a.kategorie, (katCount.get(a.kategorie) ?? 0) + 1);
  const budgetJahr = profil?.budget_jahr ? Number(profil.budget_jahr) : null;

  const liste: Antrag[] = ((antraege as AntragRow[]) ?? []).map((a) => {
    const mtl = Math.round(monatlich(Number(a.kosten), a.intervall) * 100) / 100;
    const kontext: Kontext[] = [];
    if (a.status === "ausstehend") {
      const gleiche = katCount.get(a.kategorie) ?? 0;
      if (gleiche > 0) kontext.push({ typ: "redundanz", text: `Es gibt bereits ${gleiche} aktive${gleiche === 1 ? "s" : ""} Tool${gleiche === 1 ? "" : "s"} in der Kategorie „${a.kategorie}". Prüfe auf Überschneidung.` });
      if (budgetJahr && (aktuellMonat + mtl) * 12 > budgetJahr) kontext.push({ typ: "budget", text: "Diese Anschaffung würde dein Jahresbudget überschreiten." });
    }
    return { id: a.id, tool: a.tool, kategorie: a.kategorie, kosten: Number(a.kosten), intervall: a.intervall, antragsteller: a.antragsteller, begruendung: a.begruendung, status: a.status, grund_ablehnung: a.grund_ablehnung, monatlich: mtl, kontext };
  });

  const personenNamen = ((personen as { name: string }[]) ?? []).map((p) => p.name);
  const kategorien = [...katCount.keys()].sort();

  return <FreigabenClient antraege={liste} personen={personenNamen} kategorien={kategorien} />;
}
