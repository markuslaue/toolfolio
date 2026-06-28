import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email";
import { spikeEmailHTML, spikeSubject } from "@/lib/emails/spike";
import { berechneAiCredits, type AiService, type AiSpendRow } from "@/lib/ai-credits";

export const dynamic = "force-dynamic";

function eur(n: number): string {
  return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(n);
}

/** Anteil des Monats, der bereits vergangen ist (fuer die Hochrechnung). */
function monatsAnteil(heute = new Date()): number {
  const tage = new Date(heute.getFullYear(), heute.getMonth() + 1, 0).getDate();
  return Math.min(1, Math.max(0.1, heute.getDate() / tage));
}

/**
 * E-04 Spike-Alarm: Mail, wenn der KI-Verbrauch eines Dienstes deutlich (>= 1,5x)
 * ueber dem Schnitt liegt. Eine Mail je Dienst und Monat (Dedup), Opt-out
 * benachrichtigung_spike. ?dry=1 nur Vorschau der Kandidaten.
 */
export async function POST(req: NextRequest) {
  const url = new URL(req.url);
  const secret = req.headers.get("x-cron-secret") ?? url.searchParams.get("secret");
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const dry = url.searchParams.get("dry") === "1";

  const appUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://toolfolio.de";
  const supabase = createAdminClient();

  const heute = new Date();
  const monatTag = `${heute.getFullYear()}-${String(heute.getMonth() + 1).padStart(2, "0")}`;
  const anteil = monatsAnteil(heute);

  const [{ data: services }, { data: spend }, { data: profile }] = await Promise.all([
    supabase.from("ai_services").select("id, name, farbe, budget_monat, user_id"),
    supabase.from("ai_spend").select("service_id, jahr, monat, betrag, user_id"),
    supabase.from("profiles").select("id, first_name, benachrichtigung_spike"),
  ]);

  const servByUser = new Map<string, (AiService & { user_id: string })[]>();
  for (const s of (services ?? []) as (AiService & { user_id: string })[]) {
    if (s.user_id) servByUser.set(s.user_id, [...(servByUser.get(s.user_id) ?? []), s]);
  }
  const spendByUser = new Map<string, (AiSpendRow & { user_id: string })[]>();
  for (const s of (spend ?? []) as (AiSpendRow & { user_id: string })[]) {
    if (s.user_id) spendByUser.set(s.user_id, [...(spendByUser.get(s.user_id) ?? []), s]);
  }
  const prefs = new Map(
    (profile ?? []).map((p) => [p.id as string, { first_name: (p.first_name as string | null) ?? null, spike: (p.benachrichtigung_spike as boolean | null) ?? true }]),
  );

  const userIds = [...servByUser.keys()];
  if (userIds.length === 0) return NextResponse.json({ ok: true, processed: 0, sent: 0 });

  const { data: userList } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  const email = new Map((userList?.users ?? []).map((u) => [u.id, u.email ?? ""]));

  let sent = 0;
  const kandidaten: { user_id: string; tool: string; faktor: number; ref: string }[] = [];
  const eintraege: { ref: string; user_id: string }[] = [];

  for (const uid of userIds) {
    const pref = prefs.get(uid) ?? { first_name: null, spike: true };
    if (!pref.spike) continue;
    const adr = email.get(uid);
    if (!adr) continue;

    const { daten } = berechneAiCredits(servByUser.get(uid) ?? [], spendByUser.get(uid) ?? [], heute);
    for (const d of daten) {
      if (!d.spikeFaktor || d.schnitt <= 0) continue;

      const ref = `spike:${d.id}:${monatTag}`;
      kandidaten.push({ user_id: uid, tool: d.name, faktor: d.spikeFaktor, ref });
      if (dry) continue;

      const { data: vorhanden } = await supabase
        .from("notification_log").select("id").eq("user_id", uid).eq("ref", ref).maybeSingle();
      if (vorhanden) continue;

      const abweichung = Math.round((d.monat / d.schnitt - 1) * 100);
      const hochrechnung = Math.round((d.monat / anteil) * 100) / 100;
      const props = {
        firstName: pref.first_name ?? undefined,
        toolName: d.name,
        currentSpend: eur(d.monat),
        averageSpend: eur(d.schnitt),
        deviationPercent: `+${abweichung} %`,
        projectedMonth: eur(hochrechnung),
        usualMonth: eur(d.schnitt),
        currentBarPercent: 100,
        averageBarPercent: Math.round((d.schnitt / d.monat) * 100),
        detailUrl: `${appUrl}/app/ai-credits`,
        thresholdUrl: `${appUrl}/app/einstellungen/benachrichtigungen`,
        acknowledgeUrl: `${appUrl}/app/ai-credits`,
        notificationSettingsUrl: `${appUrl}/app/einstellungen/benachrichtigungen`,
        imprintUrl: `${appUrl}/impressum`,
        privacyUrl: `${appUrl}/datenschutz`,
      };
      const res = await sendEmail({ to: adr, subject: spikeSubject(props), html: spikeEmailHTML(props) });
      if (res.ok) {
        sent++;
        eintraege.push({ ref, user_id: uid });
      }
    }
  }

  if (eintraege.length > 0) await supabase.from("notification_log").insert(eintraege);
  return NextResponse.json({ ok: true, processed: userIds.length, sent, kandidaten: dry ? kandidaten : kandidaten.length });
}
