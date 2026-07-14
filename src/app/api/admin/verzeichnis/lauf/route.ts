import { NextResponse } from "next/server";
import { z } from "zod";
import { redaktionOderFehler } from "@/lib/redaktion";
import { fuehreLaufAus } from "@/lib/verzeichnis-pipeline";

/**
 * AD-06: Einen Kategorie-Lauf starten.
 *
 * WARUM EINE ROUTE UND KEIN SERVER-ACTION: Der Lauf dauert Minuten. Ein Server-Action
 * muesste so lange antworten, und der Browser wuerde vorher aufgeben. Diese Route legt
 * den Lauf an, STARTET ihn und antwortet SOFORT mit der Lauf-ID. Der Lauf schreibt
 * seinen Fortschritt in die Datenbank, die Oberflaeche liest mit.
 *
 * Das ist bewusst kein Job-Queue-System: es gibt einen Server, die Laeufe sind selten
 * und die Redaktion sitzt daneben und schaut zu. Eine Queue waere Architektur fuer ein
 * Problem, das wir nicht haben.
 */

const schema = z.object({
  collectionId: z.string().uuid(),
  discovery: z.boolean().default(true),
  content: z.boolean().default(true),
  bild: z.boolean().default(true),
});

export async function POST(req: Request) {
  const w = await redaktionOderFehler();
  if (!w.ok) return NextResponse.json({ error: w.error }, { status: 403 });

  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
  const { collectionId, discovery, content, bild } = parsed.data;

  if (!discovery && !content && !bild) {
    return NextResponse.json({ error: "Wähle mindestens einen Schritt." }, { status: 400 });
  }

  /* Kein zweiter Lauf, solange einer laeuft. Zwei parallele Discoveries auf dieselbe
     Kategorie wuerden dieselben Produkte doppelt anlegen und sich gegenseitig die
     Texte ueberschreiben. */
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
    .insert({ collection_id: collectionId, status: "laeuft", phase: "Start", gestartet_von: w.user.id })
    .select("id")
    .single();
  if (error || !lauf) return NextResponse.json({ error: "Lauf konnte nicht angelegt werden." }, { status: 500 });

  /* Bewusst NICHT awaiten: die Antwort geht sofort raus, der Lauf laeuft weiter.
     Ein unbehandelter Fehler hier wuerde den Prozess killen, deshalb der catch. */
  void fuehreLaufAus(lauf.id as string, collectionId, { discovery, content, bild }).catch(() => {
    // fuehreLaufAus schreibt Fehler selbst ins Protokoll. Hier nur das Netz darunter.
  });

  return NextResponse.json({ laufId: lauf.id });
}
