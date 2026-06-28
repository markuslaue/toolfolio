import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email";
import { trialEmailHTML, trialSubject, type TrialStage } from "@/lib/emails/trial";
import { tageBis } from "@/lib/fristen";
import { type Abo, type Intervall } from "@/lib/abos";
import { formatEur } from "@/lib/constants";

export const dynamic = "force-dynamic";

const PERIODE: Record<Intervall, string> = { monatlich: "Monat", quartalsweise: "Quartal", jaehrlich: "Jahr" };

function langesDatum(iso: string): string {
  const d = new Date(iso);
  return new Intl.DateTimeFormat("de-DE", { day: "numeric", month: "long", year: "numeric" }).format(d);
}

/** Stufe aus den verbleibenden Tagen (7/3/1), sonst null. */
function stufe(tage: number): TrialStage | null {
  if (tage < 0) return null;
  if (tage <= 1) return "1";
  if (tage <= 3) return "3";
  if (tage <= 7) return "7";
  return null;
}

type AboRow = Abo & { user_id: string };

/**
 * E-03 Trial-Warnung: Mail, bevor der Test eines getrackten Tools kostenpflichtig wird.
 * Eine Mail je Stufe (7/3/1 Tage) und Trial, Dedup ueber notification_log, Opt-out
 * benachrichtigung_trial. ?dry=1 nur Vorschau der Kandidaten.
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

  const [{ data: abos }, { data: profile }] = await Promise.all([
    supabase.from("abos").select("*"),
    supabase.from("profiles").select("id, first_name, benachrichtigung_trial"),
  ]);

  const abosByUser = new Map<string, AboRow[]>();
  for (const a of (abos ?? []) as AboRow[]) {
    if (a.user_id) abosByUser.set(a.user_id, [...(abosByUser.get(a.user_id) ?? []), a]);
  }
  const prefs = new Map(
    (profile ?? []).map((p) => [p.id as string, { first_name: (p.first_name as string | null) ?? null, trial: (p.benachrichtigung_trial as boolean | null) ?? true }]),
  );

  const userIds = [...abosByUser.keys()];
  if (userIds.length === 0) return NextResponse.json({ ok: true, processed: 0, sent: 0 });

  const { data: userList } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  const email = new Map((userList?.users ?? []).map((u) => [u.id, u.email ?? ""]));

  let sent = 0;
  const kandidaten: { user_id: string; tool: string; tage: number; stufe: string; ref: string }[] = [];
  const eintraege: { ref: string; user_id: string }[] = [];

  for (const uid of userIds) {
    const pref = prefs.get(uid) ?? { first_name: null, trial: true };
    if (!pref.trial) continue;
    const adr = email.get(uid);
    if (!adr) continue;

    for (const a of abosByUser.get(uid) ?? []) {
      if (!a.trial_endet) continue;
      if (a.status === "archiviert" || a.status === "gekuendigt") continue;
      const tage = tageBis(a.trial_endet);
      const st = stufe(tage);
      if (!st) continue;

      const ref = `trial:${a.id}:${st}`;
      kandidaten.push({ user_id: uid, tool: a.tool, tage, stufe: st, ref });
      if (dry) continue;

      const { data: vorhanden } = await supabase
        .from("notification_log").select("id").eq("user_id", uid).eq("ref", ref).maybeSingle();
      if (vorhanden) continue;

      const props = {
        firstName: pref.first_name ?? undefined,
        stage: st,
        toolName: a.tool,
        trialEndDate: langesDatum(a.trial_endet),
        futureAmount: formatEur(a.kosten),
        interval: PERIODE[a.intervall as Intervall] ?? "Monat",
        detailUrl: `${appUrl}/app/fristen`,
        cancelUrl: `${appUrl}/app/fristen`,
        keepUrl: `${appUrl}/app/fristen`,
        notificationSettingsUrl: `${appUrl}/app/einstellungen/benachrichtigungen`,
        imprintUrl: `${appUrl}/impressum`,
        privacyUrl: `${appUrl}/datenschutz`,
      };
      const res = await sendEmail({ to: adr, subject: trialSubject(props), html: trialEmailHTML(props) });
      if (res.ok) {
        sent++;
        eintraege.push({ ref, user_id: uid });
      }
    }
  }

  if (eintraege.length > 0) await supabase.from("notification_log").insert(eintraege);
  return NextResponse.json({ ok: true, processed: userIds.length, sent, kandidaten: dry ? kandidaten : kandidaten.length });
}
