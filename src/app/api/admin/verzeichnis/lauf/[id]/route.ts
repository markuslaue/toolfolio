import { NextResponse } from "next/server";
import { redaktionOderFehler } from "@/lib/redaktion";

/** Status und Protokoll eines Laufs. Die Oberflaeche fragt das im Sekundentakt ab. */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const w = await redaktionOderFehler();
  if (!w.ok) return NextResponse.json({ error: w.error }, { status: 403 });

  const { id } = await params;
  const { data } = await w.admin
    .from("dir_lauf")
    .select("id, status, phase, protokoll, ergebnis, gestartet_am, beendet_am")
    .eq("id", id)
    .maybeSingle();
  if (!data) return NextResponse.json({ error: "Lauf nicht gefunden." }, { status: 404 });

  return NextResponse.json(data);
}
