import { NextRequest, NextResponse } from "next/server";
import { holeUndSpeichereSuchdaten } from "@/lib/searchconsole";

/**
 * AD-14: Taeglicher Abruf der Search-Console-Daten.
 *
 * Anders als der Verzeichnis-Aufbau wird hier GEWARTET, bis der Abruf durch ist: Er
 * dauert Sekunden bis wenige Minuten, nicht Stunden. Die Antwort sagt damit direkt,
 * ob es geklappt hat, statt auf eine Mail zu verweisen.
 */

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret") ?? new URL(req.url).searchParams.get("secret");
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  /* Beim ersten Lauf mehr holen als sonst: dann liegt sofort Historie vor statt
     einer Woche Warten. Google gibt maximal 16 Monate zurueck. */
  const tage = Math.min(480, Math.max(3, Number(new URL(req.url).searchParams.get("tage") ?? 5) || 5));

  try {
    const r = await holeUndSpeichereSuchdaten(tage);
    return NextResponse.json({ ok: true, ...r });
  } catch (e) {
    return NextResponse.json(
      { ok: false, fehler: e instanceof Error ? e.message : "Unbekannter Fehler" },
      { status: 500 },
    );
  }
}
