import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { syncIntegration, type IntegrationRow } from "@/lib/integration-sync";

export const dynamic = "force-dynamic";

/**
 * B-24: Taeglicher Sync aller verbundenen Integrationen. Holt den Verbrauch
 * beim Anbieter (nur lesend) und schreibt den Zuwachs in ai_spend, sodass
 * AI-Credits, Budget und der Spike-Alarm automatisch aktuell sind.
 */
export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret") ?? new URL(req.url).searchParams.get("secret");
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("integration")
    .select("id, user_id, provider, ai_service_id, kumuliert_ausgegeben, kurs");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  let ok = 0;
  const fehler: string[] = [];
  for (const i of (data as IntegrationRow[]) ?? []) {
    const res = await syncIntegration(i);
    if (res.ok) ok++;
    else fehler.push(`${i.provider}: ${res.fehler}`);
  }

  return NextResponse.json({ ok: true, processed: (data ?? []).length, synced: ok, fehler });
}
