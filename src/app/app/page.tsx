import { redirect } from "next/navigation";
import { Dashboard } from "@/components/app/dashboard";
import { createClient } from "@/lib/supabase/server";
import {
  monatlich,
  KATEGORIE_FARBEN,
  type Abo,
  type AboStatus,
} from "@/lib/abos";

function fristBald(a: Abo, tage = 30): { typ: "frist" | "trial"; datum: string } | null {
  const heute = new Date();
  heute.setHours(0, 0, 0, 0);
  const grenze = new Date(heute);
  grenze.setDate(grenze.getDate() + tage);
  const kandidaten: [string | null, "frist" | "trial"][] = [
    [a.letzter_kuendigungstermin, "frist"],
    [a.trial_endet, "trial"],
  ];
  for (const [v, typ] of kandidaten) {
    if (!v) continue;
    const d = new Date(v);
    if (d >= heute && d <= grenze) return { typ, datum: v };
  }
  return null;
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data } = await supabase.from("abos").select("*");
  const abos = (data as Abo[]) ?? [];

  const lebend = abos.filter((a) => a.status !== "archiviert" && a.status !== "gekuendigt");
  const monatsKosten = lebend.reduce((s, a) => s + monatlich(a.kosten, a.intervall), 0);

  const zaehler = (st: AboStatus) => abos.filter((a) => a.status === st).length;

  // Kosten je Kategorie (monatlich, lebende Abos)
  const katMap = new Map<string, number>();
  for (const a of lebend) {
    katMap.set(a.kategorie, (katMap.get(a.kategorie) ?? 0) + monatlich(a.kosten, a.intervall));
  }
  const kategorien = Array.from(katMap.entries())
    .map(([kategorie, wert]) => ({
      kategorie,
      wert: Math.round(wert * 100) / 100,
      farbe: KATEGORIE_FARBEN[kategorie] ?? "#6C5CE7",
    }))
    .sort((a, b) => b.wert - a.wert);

  // Naechste Abbuchungen
  const heuteIso = new Date().toISOString().slice(0, 10);
  const naechste = abos
    .filter((a) => a.naechste_abbuchung && a.naechste_abbuchung >= heuteIso)
    .sort((a, b) => (a.naechste_abbuchung! < b.naechste_abbuchung! ? -1 : 1))
    .slice(0, 6)
    .map((a) => ({
      id: a.id,
      tool: a.tool,
      initial: a.initial,
      farbe: a.farbe ?? KATEGORIE_FARBEN[a.kategorie] ?? "#6C5CE7",
      datum: a.naechste_abbuchung!,
      kosten: a.kosten,
      waehrung: a.waehrung,
      intervall: a.intervall,
    }));

  // Aktions-Center: Fristen/Trials, die bald auslaufen
  const aktionen = abos
    .map((a) => {
      const f = fristBald(a);
      return f ? { id: a.id, tool: a.tool, typ: f.typ, datum: f.datum } : null;
    })
    .filter((x): x is { id: string; tool: string; typ: "frist" | "trial"; datum: string } => x !== null)
    .sort((x, y) => (x.datum < y.datum ? -1 : 1));

  return (
    <Dashboard
      kpis={{
        monatsKosten,
        jahresKosten: monatsKosten * 12,
        aktiv: zaehler("aktiv"),
        trials: zaehler("Trial"),
        pausiert: zaehler("pausiert"),
        gesamt: abos.length,
      }}
      kategorien={kategorien}
      naechste={naechste}
      aktionen={aktionen}
    />
  );
}
