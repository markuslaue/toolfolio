import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email";
import { priceIncreaseEmailHTML, priceIncreaseSubject } from "@/lib/emails/price-increase";
import { monatlich, type Intervall } from "@/lib/abos";
import { formatEur } from "@/lib/constants";

export const dynamic = "force-dynamic";

const PERIODE: Record<string, string> = { monatlich: "Monat", quartalsweise: "Quartal", jaehrlich: "Jahr" };
const FENSTER_TAGE = 45; // nur kuerzlich erfasste Erhoehungen melden

function langesDatum(iso: string): string {
  return new Intl.DateTimeFormat("de-DE", { day: "numeric", month: "long", year: "numeric" }).format(new Date(iso));
}

type HistRow = {
  id: string;
  user_id: string;
  abo_id: string;
  alt_kosten: number;
  neu_kosten: number;
  alt_intervall: string;
  neu_intervall: string;
  erfasst_am: string;
};

/**
 * E-05 Preiserhoehung: Mail, wenn der Preis eines getrackten Tools gestiegen ist
 * (aus der Preis-Historie, gleiches Intervall, neu > alt). Eine Mail je Aenderung
 * (Dedup ref priceup:<historyId>), Opt-out benachrichtigung_preis. ?dry=1 = Vorschau.
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

  const cutoff = new Date(Date.now() - FENSTER_TAGE * 24 * 60 * 60 * 1000).toISOString();
  const [{ data: hist }, { data: abos }, { data: profile }] = await Promise.all([
    supabase.from("abo_preis_historie").select("*").gte("erfasst_am", cutoff).order("erfasst_am", { ascending: false }),
    supabase.from("abos").select("id, tool"),
    supabase.from("profiles").select("id, first_name, benachrichtigung_preis"),
  ]);

  // Nur echte Erhoehungen bei gleichem Intervall.
  const erhoehungen = ((hist ?? []) as HistRow[]).filter(
    (h) => h.alt_intervall === h.neu_intervall && Number(h.neu_kosten) > Number(h.alt_kosten),
  );
  if (erhoehungen.length === 0) return NextResponse.json({ ok: true, processed: 0, sent: 0 });

  const toolById = new Map((abos ?? []).map((a) => [a.id as string, a.tool as string]));
  const prefs = new Map(
    (profile ?? []).map((p) => [p.id as string, { first_name: (p.first_name as string | null) ?? null, preis: (p.benachrichtigung_preis as boolean | null) ?? true }]),
  );

  const { data: userList } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  const email = new Map((userList?.users ?? []).map((u) => [u.id, u.email ?? ""]));

  let sent = 0;
  const kandidaten: { user_id: string; tool: string; alt: number; neu: number; ref: string }[] = [];
  const eintraege: { ref: string; user_id: string }[] = [];

  for (const h of erhoehungen) {
    const pref = prefs.get(h.user_id) ?? { first_name: null, preis: true };
    if (!pref.preis) continue;
    const adr = email.get(h.user_id);
    if (!adr) continue;

    const tool = toolById.get(h.abo_id);
    if (!tool) continue; // Abo geloescht

    const ref = `priceup:${h.id}`;
    kandidaten.push({ user_id: h.user_id, tool, alt: Number(h.alt_kosten), neu: Number(h.neu_kosten), ref });
    if (dry) continue;

    const { data: vorhanden } = await supabase
      .from("notification_log").select("id").eq("user_id", h.user_id).eq("ref", ref).maybeSingle();
    if (vorhanden) continue;

    const intervall = h.neu_intervall as Intervall;
    const alt = Number(h.alt_kosten);
    const neu = Number(h.neu_kosten);
    const jahrMehr = Math.round((monatlich(neu, intervall) - monatlich(alt, intervall)) * 12 * 100) / 100;
    const prozent = Math.round((neu / alt - 1) * 100);

    const props = {
      firstName: pref.first_name ?? undefined,
      toolName: tool,
      oldPrice: formatEur(alt),
      newPrice: formatEur(neu),
      interval: PERIODE[intervall] ?? "Monat",
      difference: formatEur(Math.round((neu - alt) * 100) / 100),
      differencePercent: `+${prozent} %`,
      yearlyExtra: formatEur(jahrMehr),
      validFrom: langesDatum(h.erfasst_am),
      source: "billing" as const,
      detailUrl: `${appUrl}/app/abos`,
      alternativesUrl: `${appUrl}/app/sparen`,
      acknowledgeUrl: `${appUrl}/app/abos`,
      notificationSettingsUrl: `${appUrl}/app/einstellungen/benachrichtigungen`,
      imprintUrl: `${appUrl}/impressum`,
      privacyUrl: `${appUrl}/datenschutz`,
    };
    const res = await sendEmail({ to: adr, subject: priceIncreaseSubject(props), html: priceIncreaseEmailHTML(props) });
    if (res.ok) {
      sent++;
      eintraege.push({ ref, user_id: h.user_id });
    }
  }

  if (eintraege.length > 0) await supabase.from("notification_log").insert(eintraege);
  return NextResponse.json({ ok: true, processed: erhoehungen.length, sent, kandidaten: dry ? kandidaten : kandidaten.length });
}
