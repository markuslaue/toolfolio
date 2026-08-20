import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";
import { holeBilderNach } from "@/lib/verzeichnis-nacht";

/**
 * AD-17: Fehlende Bilder nachholen und die betroffenen Kategorien veroeffentlichen.
 *
 * Fuer den Fall, dass Kategorien ALLEIN am Bild durchgefallen sind (leeres OpenAI-
 * Guthaben). Sie sind fertig gebaut, es fehlt nur das Bild. Diese Route holt es nach,
 * statt den teuren Aufbau zu wiederholen.
 *
 * Fire-and-forget mit Mail: 27 Bilder dauern einige Minuten, zu lang fuer eine offene
 * HTTP-Antwort. Das Ergebnis kommt per Mail, genau wie beim naechtlichen Aufbau.
 */
export const dynamic = "force-dynamic";

const MAIL_AN = "markus.laue@ommm.de";

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret") ?? new URL(req.url).searchParams.get("secret");
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  void holeBilderNach()
    .then(async (b) => {
      const zeilen = b.kategorien
        .map((k) => `<tr><td style="padding:4px 10px 4px 0">${k.name}</td><td style="padding:4px 0"><b>${k.ergebnis}</b> ${k.grund ?? ""}</td></tr>`)
        .join("");
      await sendEmail({
        to: MAIL_AN,
        subject: `Bilder nachgeholt: ${b.live} Kategorien live`,
        html: `<p>Fehlende Bilder nachgeholt.</p><ul><li><b>${b.live}</b> jetzt live</li><li><b>${b.fehlgeschlagen}</b> weiterhin offen</li><li>${b.versucht} versucht</li></ul><table style="font-size:14px;border-collapse:collapse">${zeilen}</table>`,
      }).catch(() => {});
    })
    .catch((e) =>
      sendEmail({
        to: MAIL_AN,
        subject: "Bilder-Nachholen abgebrochen",
        html: `<pre>${e instanceof Error ? e.message : "Unbekannter Fehler"}</pre>`,
      }).catch(() => {}),
    );

  return NextResponse.json({ gestartet: true });
}
