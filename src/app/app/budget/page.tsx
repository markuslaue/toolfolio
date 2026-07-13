import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { BudgetClient, type Treiber } from "@/components/app/budget-client";
import { createClient } from "@/lib/supabase/server";
import { getActiveAccount } from "@/lib/active-account";
import { berechneBudget } from "@/lib/budget";
import { berechneVorschlaege } from "@/lib/sparvorschlaege";
import { berechneAiCredits, type AiService, type AiSpendRow } from "@/lib/ai-credits";
import { monatlich, type Abo } from "@/lib/abos";
import { formatEur } from "@/lib/constants";

export const metadata: Metadata = { title: "Budget und Forecast" };

const MONATE = [
  "Januar", "Februar", "März", "April", "Mai", "Juni",
  "Juli", "August", "September", "Oktober", "November", "Dezember",
];

type KatBudgetRow = { kategorie: string; betrag_jahr: number };

function monatsName(iso: string): string {
  const [j, m] = iso.split("-");
  return `${MONATE[Number(m) - 1]} ${j}`;
}

export default async function Page() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const account = await getActiveAccount(supabase, user.id);

  const [aboRes, spendRes, profilRes, sparRes, katBudgetRes, serviceRes] = await Promise.all([
    supabase.from("abos").select("*").eq("user_id", account),
    supabase.from("ai_spend").select("service_id, jahr, monat, betrag").eq("user_id", account),
    // Das Budget haengt am KONTO, nicht an der einzelnen Person.
    supabase.from("profiles").select("budget_jahr").eq("id", account).maybeSingle(),
    supabase.from("sparvorschlag_status").select("vorschlag_key").eq("user_id", user.id),
    supabase.from("kategorie_budget").select("kategorie, betrag_jahr").eq("user_id", account),
    supabase.from("ai_services").select("id, name, farbe, budget_monat").eq("user_id", account),
  ]);

  const abos = (aboRes.data as Abo[]) ?? [];
  const spend = (spendRes.data as AiSpendRow[]) ?? [];
  const { monate, kategorienFix, kundenFix, forecastJahr } = berechneBudget(abos, spend);

  const erledigt = new Set(((sparRes.data as { vorschlag_key: string }[]) ?? []).map((r) => r.vorschlag_key));
  const ersparnisOffen = berechneVorschlaege(abos)
    .filter((v) => !erledigt.has(v.key))
    .reduce((s, v) => s + v.ersparnisJahr, 0);

  const kategorieBudgets: Record<string, number> = {};
  for (const r of (katBudgetRes.data as KatBudgetRow[]) ?? []) {
    kategorieBudgets[r.kategorie] = Number(r.betrag_jahr);
  }

  /* --- Forecast-Treiber: nur echte Ereignisse aus den Daten ---------------- */

  const heute = new Date();
  const heuteIso = heute.toISOString().slice(0, 10);
  const grenze = new Date(heute);
  grenze.setMonth(grenze.getMonth() + 12);
  const grenzeIso = grenze.toISOString().slice(0, 10);

  const treiber: Treiber[] = [];

  // Trials, die auslaufen: ab dann kostet das Tool wirklich Geld.
  for (const a of abos) {
    if (a.status !== "Trial" || !a.trial_endet) continue;
    if (a.trial_endet < heuteIso || a.trial_endet > grenzeIso) continue;
    treiber.push({
      monat: monatsName(a.trial_endet),
      typ: "trial",
      titel: `${a.tool}: Trial läuft aus`,
      text: `Danach ${formatEur(monatlich(a.kosten, a.intervall))} pro Monat, wenn du nichts änderst.`,
      href: `/app/abos/${a.id}`,
      linkLabel: "Trial ansehen",
    });
  }

  // Jahresvertraege, die sich im Fenster verlaengern: echte Liquiditaetsspitze.
  for (const a of abos) {
    if (a.intervall !== "jaehrlich" || !a.naechste_abbuchung) continue;
    if (a.status === "archiviert" || a.status === "gekuendigt") continue;
    if (a.naechste_abbuchung < heuteIso || a.naechste_abbuchung > grenzeIso) continue;
    treiber.push({
      monat: monatsName(a.naechste_abbuchung),
      typ: "verlaengerung",
      titel: `${a.tool}: Jahresverlängerung`,
      text: `Einmalig ${formatEur(a.kosten)} auf einen Schlag. Im Forecast steckt der Betrag anteilig schon drin, auf dem Konto noch nicht.`,
      href: "/app/fristen",
      linkLabel: "im Fristen-Wächter",
    });
  }

  // Variable KI-Kosten: Trend aus echten Istwerten, keine Behauptung.
  const { daten: aiDaten, gesamtMonat, gesamtVormonat } = berechneAiCredits(
    (serviceRes.data as AiService[]) ?? [],
    spend,
    heute,
  );
  if (aiDaten.length > 0 && (gesamtMonat > 0 || gesamtVormonat > 0)) {
    const richtung =
      gesamtVormonat === 0
        ? "neu hinzugekommen"
        : gesamtMonat > gesamtVormonat * 1.1
          ? "steigend"
          : gesamtMonat < gesamtVormonat * 0.9
            ? "fallend"
            : "stabil";
    treiber.push({
      monat: "laufend",
      typ: "variabel",
      titel: `Variable KI-Kosten ${richtung}`,
      text: `${formatEur(gesamtMonat)} in diesem Monat, ${formatEur(gesamtVormonat)} im Vormonat. Der Forecast rechnet mit dem Schnitt der Monate mit Verbrauch.`,
      href: "/app/ai-credits",
      linkLabel: "AI-Kosten ansehen",
    });
  }

  // Chronologisch, "laufend" ganz unten.
  treiber.sort((a, b) => (a.monat === "laufend" ? 1 : b.monat === "laufend" ? -1 : 0));

  return (
    <BudgetClient
      monate={monate}
      kategorienFix={kategorienFix}
      kundenFix={kundenFix}
      forecastJahr={forecastJahr}
      budgetJahr={profilRes.data?.budget_jahr ? Number(profilRes.data.budget_jahr) : null}
      kategorieBudgets={kategorieBudgets}
      ersparnisOffen={Math.round(ersparnisOffen * 100) / 100}
      treiber={treiber}
    />
  );
}
