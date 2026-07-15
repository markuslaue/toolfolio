import { NextResponse } from "next/server";
import { z } from "zod";
import { redaktionOderFehler } from "@/lib/redaktion";
import { erzeugeDetailseiten } from "@/lib/verzeichnis-pipeline";

/** AD-09: Detailtexte fuer alle Anbieter einer Kategorie aufbereiten. */
const schema = z.object({ collectionId: z.string().uuid() });
const TOT_NACH_MS = 2 * 60 * 1000;

export async function POST(req: Request) {
  const w = await redaktionOderFehler();
  if (!w.ok) return NextResponse.json({ error: w.error }, { status: 403 });

  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
  const { collectionId } = parsed.data;

  const { data: laeuft } = await w.admin
    .from("dir_lauf").select("id, zuletzt_aktiv")
    .eq("collection_id", collectionId).eq("status", "laeuft").maybeSingle();
  if (laeuft) {
    const still = Date.now() - new Date(laeuft.zuletzt_aktiv as string).getTime();
    if (still <= TOT_NACH_MS) return NextResponse.json({ error: "Für diese Kategorie läuft gerade ein Lauf.", laufId: laeuft.id }, { status: 409 });
    await w.admin.from("dir_lauf").update({ status: "abgebrochen", beendet_am: new Date().toISOString() }).eq("id", laeuft.id);
  }

  const { data: lauf, error } = await w.admin
    .from("dir_lauf").insert({ collection_id: collectionId, status: "laeuft", phase: "Detailseiten", gestartet_von: w.user.id })
    .select("id").single();
  if (error || !lauf) return NextResponse.json({ error: "Lauf konnte nicht angelegt werden." }, { status: 500 });

  void erzeugeDetailseiten(lauf.id as string, collectionId).catch(() => {});
  return NextResponse.json({ laufId: lauf.id });
}
