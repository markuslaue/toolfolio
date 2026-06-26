import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email";
import { monatsReport, type MailReport } from "@/lib/email-templates";
import { berechneBudget } from "@/lib/budget";
import { berechneVorschlaege } from "@/lib/sparvorschlaege";
import { berechneAiCredits, type AiService, type AiSpendRow } from "@/lib/ai-credits";
import { deriveFristen, tageBis } from "@/lib/fristen";
import type { Abo } from "@/lib/abos";
import type { Zahlungskanal } from "@/lib/zahlungskanaele";

export const dynamic = "force-dynamic";

const MONATE = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];

function gruppiere<T extends { user_id?: string }>(rows: T[] | null, key: keyof T = "user_id"): Map<string, T[]> {
  const m = new Map<string, T[]>();
  for (const r of rows ?? []) {
    const k = r[key] as unknown as string;
    if (!k) continue;
    m.set(k, [...(m.get(k) ?? []), r]);
  }
  return m;
}

/** E-06 Monatsreport: monatlicher Cron (1. des Monats), berichtet den eben beendeten Monat. */
export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret") ?? new URL(req.url).searchParams.get("secret");
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const appUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://toolfolio.de";
  const supabase = createAdminClient();

  // Berichtsmonat = der eben beendete Monat (Cron laeuft am 1.).
  const heute = new Date();
  const ende = new Date(heute.getFullYear(), heute.getMonth(), 0); // letzter Tag des Vormonats
  const rJahr = ende.getFullYear();
  const rMonat = ende.getMonth() + 1;
  const monatLabel = `${MONATE[rMonat - 1]} ${rJahr}`;
  const ref = `report:${rJahr}-${String(rMonat).padStart(2, "0")}`;

  const [{ data: abos }, { data: services }, { data: spend }, { data: kanaele }, { data: spar }, { data: profile }] = await Promise.all([
    supabase.from("abos").select("*"),
    supabase.from("ai_services").select("id, name, farbe, budget_monat, user_id"),
    supabase.from("ai_spend").select("service_id, jahr, monat, betrag, user_id"),
    supabase.from("zahlungskanaele").select("*"),
    supabase.from("sparvorschlag_status").select("user_id, vorschlag_key"),
    supabase.from("profiles").select("id, first_name, benachrichtigung_report"),
  ]);

  const abosByUser = gruppiere(abos as (Abo & { user_id: string })[]);
  const servByUser = gruppiere(services as (AiService & { user_id: string })[]);
  const spendByUser = gruppiere(spend as (AiSpendRow & { user_id: string })[]);
  const kanByUser = gruppiere(kanaele as (Zahlungskanal & { user_id: string })[]);
  const sparByUser = gruppiere(spar as { user_id: string; vorschlag_key: string }[]);
  const prefs = new Map((profile ?? []).map((p) => [p.id as string, { first_name: (p.first_name as string | null) ?? null, report: (p.benachrichtigung_report as boolean | null) ?? true }]));

  const userIds = [...abosByUser.keys()];
  if (userIds.length === 0) return NextResponse.json({ ok: true, processed: 0, sent: 0 });

  const { data: logRows } = await supabase.from("notification_log").select("user_id, ref").eq("ref", ref).in("user_id", userIds);
  const schonGesendet = new Set((logRows ?? []).map((r) => r.user_id as string));

  const { data: userList } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  const email = new Map((userList?.users ?? []).map((u) => [u.id, u.email ?? ""]));

  let sent = 0;
  const eintraege: { ref: string; user_id: string }[] = [];

  for (const uid of userIds) {
    const pref = prefs.get(uid) ?? { first_name: null, report: true };
    if (!pref.report || schonGesendet.has(uid)) continue;
    const adr = email.get(uid);
    if (!adr) continue;

    const userAbos = abosByUser.get(uid) ?? [];
    const userSpend = spendByUser.get(uid) ?? [];
    const userServices = servByUser.get(uid) ?? [];
    const userKanaele = kanByUser.get(uid) ?? [];
    const erledigt = new Set((sparByUser.get(uid) ?? []).map((r) => r.vorschlag_key));

    const { fixMonat, kategorienFix } = berechneBudget(userAbos, userSpend);
    const varMonat = userSpend.filter((s) => s.jahr === rJahr && s.monat === rMonat).reduce((a, s) => a + Number(s.betrag), 0);
    const gesamtMonat = Math.round((fixMonat + varMonat) * 100) / 100;

    const topKategorien = Object.entries(kategorienFix).map(([name, betrag]) => ({ name, betrag }));
    if (varMonat > 0) topKategorien.push({ name: "AI / variabel", betrag: Math.round(varMonat * 100) / 100 });
    topKategorien.sort((a, b) => b.betrag - a.betrag);

    const offene = berechneVorschlaege(userAbos).filter((v) => !erledigt.has(v.key));
    const sparPotenzial = Math.round(offene.reduce((s, v) => s + v.ersparnisJahr, 0) * 100) / 100;

    const { daten: aiDaten } = berechneAiCredits(userServices, userSpend);
    const spikes = aiDaten.filter((d) => d.spikeFaktor).map((d) => ({ name: d.name, faktor: d.spikeFaktor as number }));

    const fristenAnzahl = deriveFristen(userAbos, userKanaele).filter((f) => {
      const t = tageBis(f.datum);
      return t >= 0 && t <= 45;
    }).length;

    if (gesamtMonat <= 0 && offene.length === 0 && spikes.length === 0 && fristenAnzahl === 0) continue;

    const report: MailReport = {
      monatLabel, gesamtMonat, fixMonat: Math.round(fixMonat * 100) / 100, varMonat: Math.round(varMonat * 100) / 100,
      topKategorien: topKategorien.slice(0, 4), sparAnzahl: offene.length, sparPotenzial, spikes, fristenAnzahl,
    };
    const { subject, html } = monatsReport(pref.first_name, report, appUrl);
    const res = await sendEmail({ to: adr, subject, html });
    if (res.ok) {
      sent++;
      eintraege.push({ ref, user_id: uid });
    }
  }

  if (eintraege.length > 0) await supabase.from("notification_log").insert(eintraege);
  return NextResponse.json({ ok: true, processed: userIds.length, sent, monat: monatLabel });
}
