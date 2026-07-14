import { NextResponse } from "next/server";
import { z } from "zod";
import { redaktionOderFehler } from "@/lib/redaktion";
import { createAdminClient } from "@/lib/supabase/admin";
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


/**
 * Laeuft dort wirklich noch etwas?
 *
 * Ein Lauf ist ein Hintergrundprozess im Container. Jeder Deploy startet den Container
 * neu und toetet ihn mittendrin. Der Datensatz steht dann fuer immer auf 'laeuft' und
 * blockiert die Kategorie: eine Leiche, die die Tuer versperrt.
 *
 * Ein Prozess kann luegen, ein fehlender Herzschlag nicht. Wer sich zwei Minuten nicht
 * gemeldet hat, ist tot, und wir raeumen ihn weg statt den Nutzer auszusperren.
 */
const TOT_NACH_MS = 2 * 60 * 1000;

async function blockiertEinLauf(
  admin: ReturnType<typeof createAdminClient>,
  collectionId: string,
): Promise<string | null> {
  const { data } = await admin
    .from("dir_lauf")
    .select("id, zuletzt_aktiv")
    .eq("collection_id", collectionId)
    .eq("status", "laeuft")
    .maybeSingle();
  if (!data) return null;

  const still = Date.now() - new Date(data.zuletzt_aktiv as string).getTime();
  if (still > TOT_NACH_MS) {
    await admin
      .from("dir_lauf")
      .update({ status: "abgebrochen", beendet_am: new Date().toISOString() })
      .eq("id", data.id);
    return null; // Der Weg ist frei.
  }
  return data.id as string;
}

export async function POST(req: Request) {
  const w = await redaktionOderFehler();
  if (!w.ok) return NextResponse.json({ error: w.error }, { status: 403 });

  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
  const { collectionId, produktIds } = parsed.data;

  const blockiert = await blockiertEinLauf(w.admin, collectionId);
  if (blockiert) {
    return NextResponse.json(
      { error: "Für diese Kategorie läuft gerade ein Lauf.", laufId: blockiert },
      { status: 409 },
    );
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
