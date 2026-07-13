import { redirect } from "next/navigation";
import {
  Dashboard,
  type Aktion,
  type AboZeile,
  type Anstehend,
  type SparKarte,
} from "@/components/app/dashboard";
import { createClient } from "@/lib/supabase/server";
import { getActiveAccount } from "@/lib/active-account";
import { monatlich, toolInitial, KATEGORIE_FARBEN, type Abo, type AboStatus, type Intervall } from "@/lib/abos";
import { berechneAiCredits, type AiService, type AiSpendRow } from "@/lib/ai-credits";
import { berechneVerlauf, vormonatProzent } from "@/lib/kostenverlauf";
import { berechneVorschlaege } from "@/lib/sparvorschlaege";
import { deriveFristen, tageBis } from "@/lib/fristen";
import { formatEur } from "@/lib/constants";
import type { Zahlungskanal } from "@/lib/zahlungskanaele";

const MONATE = [
  "Januar", "Februar", "März", "April", "Mai", "Juni",
  "Juli", "August", "September", "Oktober", "November", "Dezember",
];

type StatusRow = { vorschlag_key: string; status: string; ersparnis_jahr: number | null };
type PreisRow = {
  abo_id: string;
  alt_kosten: number;
  neu_kosten: number;
  alt_intervall: Intervall;
  neu_intervall: Intervall;
  erfasst_am: string;
};

function runde(n: number): number {
  return Math.round(n * 100) / 100;
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Neue Nutzer einmalig ins Onboarding leiten (kein globaler Gate, nur Dashboard).
  const { data: profile } = await supabase.from("profiles").select("onboarded_at").eq("id", user.id).single();
  if (!profile?.onboarded_at) redirect("/app/onboarding");

  const account = await getActiveAccount(supabase, user.id);
  const cutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();

  const [aboRes, kanalRes, serviceRes, spendRes, statusRes, preisRes, integrationRes] = await Promise.all([
    supabase.from("abos").select("*").eq("user_id", account),
    supabase.from("zahlungskanaele").select("*").eq("user_id", account),
    supabase.from("ai_services").select("id, name, farbe, budget_monat").eq("user_id", account).order("created_at"),
    supabase.from("ai_spend").select("service_id, jahr, monat, betrag").eq("user_id", account),
    supabase.from("sparvorschlag_status").select("vorschlag_key, status, ersparnis_jahr").eq("user_id", user.id),
    supabase
      .from("abo_preis_historie")
      .select("abo_id, alt_kosten, neu_kosten, alt_intervall, neu_intervall, erfasst_am")
      .eq("user_id", account)
      .gte("erfasst_am", cutoff)
      .order("erfasst_am", { ascending: false }),
    supabase.from("integration").select("ai_service_id").eq("user_id", account),
  ]);

  const abos = (aboRes.data as Abo[]) ?? [];
  const kanaele = (kanalRes.data as Zahlungskanal[]) ?? [];
  const services = (serviceRes.data as AiService[]) ?? [];
  const spend = (spendRes.data as AiSpendRow[]) ?? [];
  const statusRows = (statusRes.data as StatusRow[]) ?? [];
  const preisRows = (preisRes.data as PreisRow[]) ?? [];
  // Dienste, deren Verbrauch live aus einer Anbieter-API kommt (nicht geschaetzt).
  const liveServices = new Set(
    ((integrationRes.data as { ai_service_id: string | null }[]) ?? [])
      .map((i) => i.ai_service_id)
      .filter((x): x is string => Boolean(x)),
  );

  const heute = new Date();
  const heuteIso = heute.toISOString().slice(0, 10);
  const lebend = abos.filter((a) => a.status !== "archiviert" && a.status !== "gekuendigt");
  const zaehler = (st: AboStatus) => abos.filter((a) => a.status === st).length;

  /* --- Kosten -------------------------------------------------------------- */

  const monatsKosten = runde(lebend.reduce((s, a) => s + monatlich(a.kosten, a.intervall), 0));
  const verlauf = berechneVerlauf(abos, spend, heute);
  const beendet = abos.some((a) => a.status === "archiviert" || a.status === "gekuendigt");

  /* --- Sparvorschlaege ----------------------------------------------------- */

  const erledigt = new Map(statusRows.map((r) => [r.vorschlag_key, r]));
  const alle = berechneVorschlaege(abos);
  const offen = alle.filter((v) => !erledigt.has(v.key));
  const sparpotenzial = runde(offen.reduce((s, v) => s + v.ersparnisJahr, 0));
  const realisiert = runde(
    statusRows.filter((r) => r.status === "umgesetzt").reduce((s, r) => s + Number(r.ersparnis_jahr ?? 0), 0),
  );

  const sparkarten: SparKarte[] = offen
    .slice()
    .sort((a, b) => b.ersparnisJahr - a.ersparnisJahr)
    .slice(0, 3)
    .map((v) => ({
      key: v.key,
      typ: v.typ,
      titel: v.titel,
      ersparnisJahr: v.ersparnisJahr,
      begruendung: v.begruendung,
      tools: v.tools,
      geschaetzt: v.geschaetzt,
      aktion: v.aktion,
    }));

  /* --- AI-Credits ---------------------------------------------------------- */

  const { daten: aiDaten, gesamtMonat } = berechneAiCredits(services, spend, heute);

  /* --- Aktions-Center ------------------------------------------------------ */

  const aktionen: Aktion[] = [];

  // Spikes zuerst: das ist Geld, das gerade JETZT abfliesst.
  for (const s of aiDaten) {
    if (s.spikeFaktor === null) continue;
    const live = liveServices.has(s.id);
    aktionen.push({
      key: `spike:${s.id}`,
      typ: "spike",
      live,
      titel: `${s.name}-Verbrauch diesen Monat ${s.trendPct > 0 ? "+" : ""}${s.trendPct} %`,
      beschreibung: live
        ? `Live aus der Anbieter-API gelesen. ${formatEur(s.monat)} in diesem Monat, das ${s.spikeFaktor.toString().replace(".", ",")}-fache deines Schnitts.`
        : `${formatEur(s.monat)} in diesem Monat, das ${s.spikeFaktor.toString().replace(".", ",")}-fache deines bisherigen Schnitts von ${formatEur(s.schnitt)}.`,
      button: "Verlauf ansehen",
      href: "/app/ai-credits",
    });
  }

  // Fristen und Trials aus der zentralen Ableitung (B-12/B-32).
  for (const f of deriveFristen(abos, kanaele)) {
    if (f.art === "karte") continue;
    const tage = tageBis(f.datum, heute);
    if (tage < 0 || tage > 45) continue;
    aktionen.push({
      key: f.key,
      typ: f.art === "trial" ? "trial" : "frist",
      titel:
        f.art === "trial"
          ? `${f.titel}: Trial endet in ${tage} ${tage === 1 ? "Tag" : "Tagen"}`
          : `${f.titel}: Kündigungsfrist in ${tage} ${tage === 1 ? "Tag" : "Tagen"}`,
      beschreibung: f.konsequenz,
      button: "Ansehen",
      href: f.quelle === "abo" ? `/app/abos/${f.quelle_id}` : "/app/zahlungskanaele",
    });
  }

  // Preiserhoehungen der letzten 90 Tage (aus der Preishistorie, ein Eintrag je Abo).
  // Verglichen wird der auf den Monat normalisierte Preis, sonst wuerde ein Wechsel
  // von monatlich auf jaehrlich faelschlich als Erhoehung gelten.
  const gesehen = new Set<string>();
  for (const p of preisRows) {
    if (gesehen.has(p.abo_id)) continue;
    const alt = monatlich(Number(p.alt_kosten), p.alt_intervall);
    const neu = monatlich(Number(p.neu_kosten), p.neu_intervall);
    if (alt <= 0 || neu <= alt) continue;
    gesehen.add(p.abo_id);
    const abo = abos.find((a) => a.id === p.abo_id);
    if (!abo || abo.status === "archiviert" || abo.status === "gekuendigt") continue;
    const pct = Math.round(((neu - alt) / alt) * 100);
    if (pct < 1) continue;
    aktionen.push({
      key: `preis:${p.abo_id}`,
      typ: "preis",
      titel: `${abo.tool} ist um ${pct} % teurer geworden`,
      beschreibung: `Von ${formatEur(alt)} auf ${formatEur(neu)} pro Monat. Prüf, ob der Plan noch passt.`,
      button: "Prüfen",
      href: `/app/abos/${p.abo_id}`,
    });
  }

  // Zombies: pausierte Abos, die weiter kosten.
  for (const a of abos.filter((x) => x.status === "pausiert")) {
    aktionen.push({
      key: `zombie:${a.id}`,
      typ: "zombie",
      titel: `${a.tool} läuft pausiert weiter`,
      beschreibung: `Pausiert, kostet dich aber weiter ${formatEur(monatlich(a.kosten, a.intervall))} pro Monat.`,
      button: "Kündigung prüfen",
      href: `/app/abos/${a.id}`,
    });
  }

  /* --- Kosten nach Kunde / Kanal ------------------------------------------- */

  const kundeMap = new Map<string, number>();
  let nichtZugeordnet = 0;
  for (const a of lebend) {
    const m = monatlich(a.kosten, a.intervall);
    if (a.kunde) kundeMap.set(a.kunde, (kundeMap.get(a.kunde) ?? 0) + m);
    else nichtZugeordnet += m;
  }
  const kostenNachKunde = [...kundeMap.entries()]
    .map(([name, wert]) => ({ name, wert: runde(wert) }))
    .sort((a, b) => b.wert - a.wert)
    .slice(0, 6);

  const kanalMap = new Map<string, number>();
  for (const a of lebend) {
    if (!a.zahlungskanal) continue;
    kanalMap.set(a.zahlungskanal, (kanalMap.get(a.zahlungskanal) ?? 0) + monatlich(a.kosten, a.intervall));
  }
  const kostenNachKanal = [...kanalMap.entries()]
    .map(([name, wert]) => ({ name, wert: runde(wert) }))
    .sort((a, b) => b.wert - a.wert);

  /* --- Anstehende Abbuchungen ---------------------------------------------- */

  const anstehend: Anstehend[] = lebend
    .filter((a) => a.naechste_abbuchung && a.naechste_abbuchung >= heuteIso)
    .sort((a, b) => (a.naechste_abbuchung! < b.naechste_abbuchung! ? -1 : 1))
    .slice(0, 8)
    .map((a) => ({
      id: a.id,
      tool: a.tool,
      kanal: a.zahlungskanal ?? "Kein Zahlungskanal hinterlegt",
      datum: a.naechste_abbuchung!,
      betrag: a.kosten,
      waehrung: a.waehrung,
    }));

  /* --- Tabelle ------------------------------------------------------------- */

  const zeilen: AboZeile[] = abos
    .filter((a) => a.status !== "archiviert")
    .sort((a, b) => a.tool.localeCompare(b.tool, "de"))
    .map((a) => ({
      id: a.id,
      tool: a.tool,
      initial: a.initial ?? toolInitial(a.tool),
      farbe: a.farbe ?? KATEGORIE_FARBEN[a.kategorie] ?? "#6C5CE7",
      kategorie: a.kategorie,
      kosten: a.kosten,
      waehrung: a.waehrung,
      intervall: a.intervall,
      naechsteAbbuchung: a.naechste_abbuchung,
      zahlungskanal: a.zahlungskanal,
      kunde: a.kunde,
      status: a.status,
    }));

  return (
    <Dashboard
      spar={{ realisiert, ziel: runde(realisiert + sparpotenzial), offen: offen.length }}
      kpis={{
        monatlich: monatsKosten,
        jaehrlich: runde(monatsKosten * 12),
        aktiveAbos: zaehler("aktiv"),
        trials: zaehler("Trial"),
        pausiert: zaehler("pausiert"),
        sparpotenzialJahr: sparpotenzial,
        vorschlaege: offen.length,
        vormonatProzent: vormonatProzent(verlauf),
      }}
      aktionen={aktionen}
      verlauf={verlauf}
      verlaufUnvollstaendig={beendet}
      kostenNachKunde={kostenNachKunde}
      nichtZugeordnet={runde(nichtZugeordnet)}
      kostenNachKanal={kostenNachKanal}
      aiCredits={aiDaten}
      aiMonatSumme={runde(gesamtMonat)}
      aiMonatLabel={MONATE[heute.getMonth()]}
      anstehend={anstehend}
      sparkarten={sparkarten}
      abos={zeilen}
    />
  );
}
