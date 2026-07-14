import { NextResponse } from "next/server";
import { z } from "zod";
import { redaktionOderFehler } from "@/lib/redaktion";
import { anreichereProdukte } from "@/lib/verzeichnis-pipeline";

/**
 * AD-06: Anbieterdaten holen.
 *
 * Eigener Lauf, bewusst getrennt von der Discovery: er laedt pro Anbieter mehrere
 * Unterseiten (Preise, Funktionen) und dauert entsprechend. Wer nur den Text neu
 * schreiben will, soll nicht dreissig Websites crawlen muessen.
 */
const schema = z.object({
  collectionId: z.string().uuid(),
  /** Leer = alle Produkte der Kategorie. Sonst nur die markierten. */
  produktIds: z.array(z.string().uuid()).optional(),
});

export async function POST(req: Request) {
  const w = await redaktionOderFehler();
  if (!w.ok) return NextResponse.json({ error: w.error }, { status: 403 });

  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
  const { collectionId, produktIds } = parsed.data;

  const { data: laeuft } = await w.admin
    .from("dir_lauf")
    .select("id")
    .eq("collection_id", collectionId)
    .eq("status", "laeuft")
    .maybeSingle();
  if (laeuft) {
    return NextResponse.json({ error: "Für diese Kategorie läuft bereits ein Lauf.", laufId: laeuft.id }, { status: 409 });
  }

  const { data: lauf, error } = await w.admin
    .from("dir_lauf")
    .insert({ collection_id: collectionId, status: "laeuft", phase: "Anbieterdaten", gestartet_von: w.user.id })
    .select("id")
    .single();
  if (error || !lauf) return NextResponse.json({ error: "Lauf konnte nicht angelegt werden." }, { status: 500 });

  // Nicht awaiten: die Antwort geht sofort raus, der Lauf laeuft weiter.
  void anreichereProdukte(lauf.id as string, collectionId, produktIds ?? null).catch(() => {});

  return NextResponse.json({ laufId: lauf.id });
}
