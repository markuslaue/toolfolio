import { NextResponse } from "next/server";
import { redaktionOderFehler } from "@/lib/redaktion";

/** Status und Protokoll eines Laufs. Die Oberflaeche fragt das im Sekundentakt ab. */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const w = await redaktionOderFehler();
  if (!w.ok) return NextResponse.json({ error: w.error }, { status: 403 });

  const { id } = await params;
  const { data } = await w.admin
    .from("dir_lauf")
    .select("id, status, phase, fortschritt, protokoll, ergebnis, gestartet_am, beendet_am, zuletzt_aktiv")
    .eq("id", id)
    .maybeSingle();
  if (!data) return NextResponse.json({ error: "Lauf nicht gefunden." }, { status: 404 });

  /* Zombie-Erkennung.
     Ein Lauf lebt in einem Hintergrundprozess. Startet der Container neu (jeder Deploy)
     oder stuerzt er ab, ist der Prozess weg, aber der Datensatz sagt weiter "laeuft".
     Die Oberflaeche wuerde dann ewig einen Spinner drehen. Ein Prozess kann luegen,
     ein fehlender Herzschlag nicht. */
  const still = Date.now() - new Date(data.zuletzt_aktiv as string).getTime();
  if (data.status === "laeuft" && still > 2 * 60 * 1000) {
    await w.admin
      .from("dir_lauf")
      .update({ status: "abgebrochen", beendet_am: new Date().toISOString() })
      .eq("id", id);
    return NextResponse.json({
      ...data,
      status: "abgebrochen",
      protokoll: [
        ...(data.protokoll as unknown[]),
        {
          zeit: new Date().toISOString(),
          art: "fehler",
          text: "Der Lauf hat sich seit zwei Minuten nicht gemeldet. Vermutlich wurde der Server zwischendurch neu gestartet. Du kannst ihn neu starten.",
        },
      ],
    });
  }

  return NextResponse.json(data);
}
