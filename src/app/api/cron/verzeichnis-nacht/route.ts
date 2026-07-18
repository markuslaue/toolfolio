import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email";
import { baueNacht, type NachtBericht } from "@/lib/verzeichnis-nacht";

/**
 * AD-11: Der naechtliche Aufbau, angestossen per Cron.
 *
 * ---------------------------------------------------------------------------
 * WARUM DIE ANTWORT SOFORT KOMMT UND NICHT AM ENDE:
 *
 * Die Nacht dauert Stunden. Eine HTTP-Antwort so lange offen zu halten hiesse, dass
 * jeder Zwischenfall auf der Leitung (Zeitueberschreitung bei curl, ein Neustart des
 * Reverse-Proxys, ein Verbindungsabbruch) den ganzen Lauf mitreisst. Deshalb: Lauf
 * starten, sofort antworten, und am Ende eine Mail schicken.
 *
 * Der Nachteil ist ehrlich zu benennen: Der Cron weiss nicht, ob es geklappt hat. Der
 * Bericht kommt per Mail, und wenn er ausbleibt, ist genau DAS das Signal.
 * ---------------------------------------------------------------------------
 */

export const dynamic = "force-dynamic";

/** Ab hier wird keine NEUE Kategorie mehr begonnen. Der Cron startet um 02:00. */
const ENDE_STUNDE = 7;
const ENDE_MINUTE = 30;

const STANDARD_ANZAHL = 10;
/* Grenze nach oben. Sie ist bewusst da: ein Vertipper in der Adresse ("anzahl=1000")
   wuerde sonst eine Nacht starten, die tausend Kategorien baut und ueber tausend
   Dollar kostet. Ein ganzer Hub passt darunter (der groesste hat 143). */
const MAX_ANZAHL = 150;

const MAIL_AN = "markus.laue@ommm.de";

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret") ?? new URL(req.url).searchParams.get("secret");
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();

  /* Laeuft noch eine Nacht von gestern?
     Zwei parallele Naechte wuerden dieselben Kategorien greifen und sich gegenseitig
     die Produkte doppelt anlegen. Das ist kein theoretischer Fall: ein Deploy mitten
     im Lauf hinterlaesst genau so einen Zustand. */
  const { count: laufend } = await admin
    .from("dir_warteschlange")
    .select("collection_id", { count: "exact", head: true })
    .eq("zustand", "laeuft");
  if ((laufend ?? 0) > 0) {
    return NextResponse.json(
      { error: "Es läuft bereits ein Aufbau.", laufend },
      { status: 409 },
    );
  }

  const url = new URL(req.url);
  const anzahl = Math.min(
    MAX_ANZAHL,
    Math.max(1, Number(url.searchParams.get("anzahl") ?? STANDARD_ANZAHL) || STANDARD_ANZAHL),
  );

  const endeUm = new Date();
  endeUm.setHours(ENDE_STUNDE, ENDE_MINUTE, 0, 0);
  // Startet der Lauf nach dem Ende (Handstart am Nachmittag), gilt das Ende von morgen.
  if (endeUm.getTime() <= Date.now()) endeUm.setDate(endeUm.getDate() + 1);

  // Optional auf einen Hub begrenzen: ?cluster=bau-und-handwerk
  const clusterSlug = url.searchParams.get("cluster");

  /* Bewusst NICHT awaiten. Siehe Kopf der Datei. */
  void baueNacht(anzahl, endeUm, clusterSlug)
    .then((bericht) => meldeErgebnis(bericht))
    .catch((e) =>
      sendEmail({
        to: MAIL_AN,
        subject: "Verzeichnis-Aufbau abgebrochen",
        html: `<p>Der nächtliche Aufbau ist abgebrochen.</p><pre>${
          e instanceof Error ? e.message : "Unbekannter Fehler"
        }</pre>`,
      }).catch(() => {}),
    );

  return NextResponse.json({ gestartet: true, anzahl, cluster: clusterSlug ?? "alle", endeUm: endeUm.toISOString() });
}

/**
 * Der Bericht am Morgen.
 *
 * Er nennt AUCH das, was durchgefallen ist, und warum. Eine Mail, die nur Erfolge
 * meldet, erzieht dazu, sie nicht mehr zu lesen.
 */
async function meldeErgebnis(b: NachtBericht) {
  const zeilen = b.kategorien
    .map((k) => {
      const zeichen =
        k.ergebnis === "veroeffentlicht" ? "live"
        : k.ergebnis === "durchgefallen" ? "durchgefallen"
        : "Fehler";
      return `<tr><td style="padding:4px 10px 4px 0">${k.name}</td><td style="padding:4px 10px 4px 0"><b>${zeichen}</b></td><td style="padding:4px 0;color:#555">${k.grund ?? ""}</td></tr>`;
    })
    .join("");

  await sendEmail({
    to: MAIL_AN,
    subject: `Verzeichnis: ${b.veroeffentlicht} neue Kategorien live`,
    html: `
      <p>Der nächtliche Aufbau ist durch. Er hat ${Math.round(b.dauer_sekunden / 60)} Minuten gebraucht.</p>
      <ul>
        <li><b>${b.veroeffentlicht}</b> veröffentlicht</li>
        <li><b>${b.durchgefallen}</b> durchgefallen (bleiben Entwurf, warten auf dich)</li>
        <li><b>${b.fehler}</b> mit Fehler</li>
        ${b.uebersprungen_zeit > 0 ? `<li>${b.uebersprungen_zeit} nicht mehr begonnen, weil die Zeit nicht reichte</li>` : ""}
      </ul>
      <table style="border-collapse:collapse;font-size:14px">${zeilen}</table>
      <p style="color:#555;font-size:13px">Durchgefallene Kategorien findest du im Admin unter Verzeichnis. Dort steht je Bedingung, was gefehlt hat.</p>
    `,
  }).catch(() => {});
}
