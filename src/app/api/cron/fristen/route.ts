import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email";
import { fristenDigest, type MailFrist } from "@/lib/email-templates";

export const dynamic = "force-dynamic";

const MAX_VORLAUF = 60; // breitestes Fenster; pro Nutzer wird auf dessen Vorlaufzeit gefiltert

function tageBis(iso: string): number {
  const a = new Date(iso);
  a.setHours(0, 0, 0, 0);
  const h = new Date();
  h.setHours(0, 0, 0, 0);
  return Math.round((a.getTime() - h.getTime()) / 86_400_000);
}

type AboRow = {
  id: string;
  user_id: string;
  tool: string;
  status: string;
  auto_verlaengerung: boolean;
  letzter_kuendigungstermin: string | null;
  trial_endet: string | null;
};

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret") ?? new URL(req.url).searchParams.get("secret");
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const appUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://toolfolio.de";
  const supabase = createAdminClient();

  const heute = new Date();
  const grenze = new Date(heute);
  grenze.setDate(grenze.getDate() + MAX_VORLAUF);
  const heuteIso = heute.toISOString().slice(0, 10);
  const grenzeIso = grenze.toISOString().slice(0, 10);

  // Abos mit anstehender Kuendigungs- oder Trial-Frist im Fenster.
  const { data: abos, error } = await supabase
    .from("abos")
    .select("id, user_id, tool, status, auto_verlaengerung, letzter_kuendigungstermin, trial_endet")
    .not("status", "in", "(archiviert,gekuendigt)")
    .or(
      `and(letzter_kuendigungstermin.gte.${heuteIso},letzter_kuendigungstermin.lte.${grenzeIso}),and(trial_endet.gte.${heuteIso},trial_endet.lte.${grenzeIso})`,
    );
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Pro Nutzer die Frist-Eintraege bauen.
  const proNutzer = new Map<string, (MailFrist & { ref: string })[]>();
  for (const a of (abos as AboRow[]) ?? []) {
    const add = (datum: string | null, art: MailFrist["art"], konsequenz: string) => {
      if (!datum) return;
      const t = tageBis(datum);
      if (t < 0 || t > MAX_VORLAUF) return;
      const list = proNutzer.get(a.user_id) ?? [];
      list.push({ tool: a.tool, art, datum, tage: t, konsequenz, ref: `abo-${a.id}:${art}:${datum}` });
      proNutzer.set(a.user_id, list);
    };
    add(a.letzter_kuendigungstermin, "kuendigung", a.auto_verlaengerung ? "Sonst automatische Verlängerung." : "Letzter Kündigungstermin.");
    add(a.trial_endet, "trial", "Danach wird das Abo kostenpflichtig.");
  }

  if (proNutzer.size === 0) return NextResponse.json({ ok: true, processed: 0, sent: 0 });

  // Bereits versendete Refs laden (Dedupe).
  const userIds = [...proNutzer.keys()];
  const { data: logRows } = await supabase
    .from("notification_log")
    .select("user_id, ref")
    .in("user_id", userIds);
  const schonGesendet = new Set((logRows ?? []).map((r) => `${r.user_id}|${r.ref}`));

  // Profile inkl. Benachrichtigungs-Praeferenzen laden.
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, first_name, benachrichtigung_frist, benachrichtigung_trial, benachrichtigung_vorlauf")
    .in("id", userIds);
  type Pref = { first_name: string | null; frist: boolean; trial: boolean; vorlauf: number };
  const prefs = new Map<string, Pref>(
    (profile ?? []).map((p) => [
      p.id as string,
      {
        first_name: (p.first_name as string | null) ?? null,
        frist: (p.benachrichtigung_frist as boolean | null) ?? true,
        trial: (p.benachrichtigung_trial as boolean | null) ?? true,
        vorlauf: (p.benachrichtigung_vorlauf as number | null) ?? 14,
      },
    ]),
  );

  // E-Mail-Adressen ueber die Admin-API.
  const { data: userList } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  const email = new Map((userList?.users ?? []).map((u) => [u.id, u.email ?? ""]));

  let sent = 0;
  const eintraege: { ref: string; user_id: string }[] = [];

  for (const [uid, fristenAll] of proNutzer) {
    const pref = prefs.get(uid) ?? { first_name: null, frist: true, trial: true, vorlauf: 14 };
    // Pro Nutzer: Opt-out je Art und individuelle Vorlaufzeit beachten.
    const frische = fristenAll.filter((f) => {
      if (schonGesendet.has(`${uid}|${f.ref}`)) return false;
      if (f.tage > pref.vorlauf) return false;
      if (f.art === "kuendigung" && !pref.frist) return false;
      if (f.art === "trial" && !pref.trial) return false;
      return true;
    });
    if (frische.length === 0) continue;
    const adr = email.get(uid);
    if (!adr) continue;

    frische.sort((a, b) => a.tage - b.tage);
    const { subject, html } = fristenDigest(pref.first_name, frische, appUrl);
    const res = await sendEmail({ to: adr, subject, html });
    if (res.ok) {
      sent++;
      for (const f of frische) eintraege.push({ ref: f.ref, user_id: uid });
    }
  }

  if (eintraege.length > 0) {
    await supabase.from("notification_log").insert(eintraege);
  }

  return NextResponse.json({ ok: true, processed: proNutzer.size, sent, logged: eintraege.length });
}
