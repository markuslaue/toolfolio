import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email";
import { savingsEmailHTML, savingsSubject } from "@/lib/emails/savings";
import { berechneVorschlaege } from "@/lib/sparvorschlaege";
import { INTERVALL_LABEL, type Abo } from "@/lib/abos";
import { YEARLY_DISCOUNT } from "@/lib/constants";

export const dynamic = "force-dynamic";

/** Erst ab dieser Nutzungsdauer lohnt der "lange genutzt -> jaehrlich"-Anstoss. */
const MIN_MONATE = 3;

const MONAT_MS = 30 * 24 * 60 * 60 * 1000;

function eur(n: number): string {
  return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(n);
}

function monateSeit(iso: string | null): number {
  if (!iso) return 0;
  const t = new Date(iso).getTime();
  if (!isFinite(t)) return 0;
  return Math.floor((Date.now() - t) / MONAT_MS);
}

function dauerText(monate: number): string {
  if (monate >= 12) {
    const jahre = Math.floor(monate / 12);
    return jahre === 1 ? "über einem Jahr" : `über ${jahre} Jahren`;
  }
  return monate === 1 ? "einem Monat" : `${monate} Monaten`;
}

type AboRow = Abo & { user_id: string; created_at: string | null };

/**
 * E-07 Sparvorschlag-Mail: findet je Nutzer den staerksten "monatlich -> jaehrlich"-
 * Vorschlag fuer ein laenger genutztes Tool und schickt eine konkrete Anstoss-Mail.
 * Dedup pro Abo und Monat, respektiert das Opt-out (benachrichtigung_sparen).
 * Mit ?dry=1 nur Vorschau der Kandidaten, ohne Versand.
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

  const [{ data: abos }, { data: profile }, { data: spar }] = await Promise.all([
    supabase.from("abos").select("*"),
    supabase.from("profiles").select("id, first_name, benachrichtigung_sparen"),
    supabase.from("sparvorschlag_status").select("user_id, vorschlag_key"),
  ]);

  const abosByUser = new Map<string, AboRow[]>();
  for (const a of (abos ?? []) as AboRow[]) {
    if (!a.user_id) continue;
    abosByUser.set(a.user_id, [...(abosByUser.get(a.user_id) ?? []), a]);
  }
  const prefs = new Map(
    (profile ?? []).map((p) => [
      p.id as string,
      { first_name: (p.first_name as string | null) ?? null, sparen: (p.benachrichtigung_sparen as boolean | null) ?? true },
    ]),
  );
  const erledigtByUser = new Map<string, Set<string>>();
  for (const r of (spar ?? []) as { user_id: string; vorschlag_key: string }[]) {
    const set = erledigtByUser.get(r.user_id) ?? new Set<string>();
    set.add(r.vorschlag_key);
    erledigtByUser.set(r.user_id, set);
  }

  const userIds = [...abosByUser.keys()];
  if (userIds.length === 0) return NextResponse.json({ ok: true, processed: 0, sent: 0 });

  const { data: userList } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  const email = new Map((userList?.users ?? []).map((u) => [u.id, u.email ?? ""]));

  const prozent = `${Math.round(YEARLY_DISCOUNT * 100)} %`;
  let sent = 0;
  const kandidaten: { user_id: string; tool: string; ersparnis: number; monate: number; ref: string }[] = [];
  const eintraege: { ref: string; user_id: string }[] = [];

  for (const uid of userIds) {
    const pref = prefs.get(uid) ?? { first_name: null, sparen: true };
    if (!pref.sparen) continue;
    const adr = email.get(uid);
    if (!adr) continue;

    const userAbos = abosByUser.get(uid) ?? [];
    const erledigt = erledigtByUser.get(uid) ?? new Set<string>();
    const aboById = new Map(userAbos.map((a) => [a.id, a]));

    // Nur Intervall-Vorschlaege (monatlich -> jaehrlich), nicht bereits erledigte.
    const eligible = berechneVorschlaege(userAbos)
      .filter((v) => v.typ === "intervall" && !erledigt.has(v.key))
      .map((v) => {
        const aboId = v.key.replace("intervall:", "");
        const abo = aboById.get(aboId);
        return { v, abo, monate: monateSeit(abo?.created_at ?? null) };
      })
      .filter((x) => x.abo && x.monate >= MIN_MONATE)
      .sort((a, b) => b.v.ersparnisJahr - a.v.ersparnisJahr);

    const top = eligible[0];
    if (!top || !top.abo) continue;

    const ref = `savings:${top.abo.id}:${monatTag}`;
    kandidaten.push({ user_id: uid, tool: top.abo.tool, ersparnis: top.v.ersparnisJahr, monate: top.monate, ref });

    if (dry) continue;

    // Dedup: pro Abo nur einmal je Monat.
    const { data: vorhanden } = await supabase
      .from("notification_log")
      .select("id")
      .eq("user_id", uid)
      .eq("ref", ref)
      .maybeSingle();
    if (vorhanden) continue;

    const currentInterval = (INTERVALL_LABEL[top.abo.intervall] ?? "monatlich").toLowerCase();
    const props = {
      firstName: pref.first_name ?? undefined,
      toolName: top.abo.tool,
      yearlySaving: eur(top.v.ersparnisJahr),
      reason: "jahreszahlung" as const,
      usageDuration: dauerText(top.monate),
      currentInterval,
      recommendedInterval: "jährlich",
      savingsPercent: prozent,
      reasonText: `Konstante Nutzung seit ${dauerText(top.monate)}, die Jahreslizenz ist hier klar günstiger.`,
      detailUrl: `${appUrl}/app/sparen`,
      dismissUrl: `${appUrl}/app/sparen`,
      notificationSettingsUrl: `${appUrl}/app/einstellungen/benachrichtigungen`,
      imprintUrl: `${appUrl}/impressum`,
      privacyUrl: `${appUrl}/datenschutz`,
    };
    const res = await sendEmail({ to: adr, subject: savingsSubject(props), html: savingsEmailHTML(props) });
    if (res.ok) {
      sent++;
      eintraege.push({ ref, user_id: uid });
    }
  }

  if (eintraege.length > 0) await supabase.from("notification_log").insert(eintraege);
  return NextResponse.json({ ok: true, processed: userIds.length, sent, kandidaten: dry ? kandidaten : kandidaten.length });
}
