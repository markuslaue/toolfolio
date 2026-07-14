"use server";

import { z } from "zod";
import { createHash, randomBytes } from "node:crypto";
import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { EINWILLIGUNG_VERSION, einwilligungText } from "@/lib/einwilligung";

/**
 * Anfrage aus dem Finder entgegennehmen.
 *
 * ZWEI RECHTSGRUNDLAGEN, ZWEI TABELLEN, NIEMALS VERMISCHT:
 *
 *   dir_anfrage        = die Anfrage selbst. Vertragsanbahnung (Art. 6 I b).
 *                        Keine Einwilligung noetig, keine gefragt.
 *
 *   launch_einwilligung = spaeterer Kontakt zu ANDEREN Angeboten. Werbung.
 *                        Braucht eine eigene, freiwillige, nicht vorangekreuzte
 *                        Einwilligung (Art. 6 I a, § 7 UWG) mit Double-Opt-in.
 *
 * Der springende Punkt: die Anfrage geht IMMER raus, auch ohne Haekchen. Waere sie
 * an die Einwilligung gekoppelt, waere die Einwilligung nach Art. 7 IV DSGVO nicht
 * freiwillig und damit UNWIRKSAM. Rueckwirkend, fuer die gesamte Liste. Deshalb
 * darf hier niemals ein `if (!launchEinwilligung) return error` stehen.
 */

const schema = z.object({
  collectionId: z.string().uuid(),
  name: z.string().trim().min(2, "Bitte gib deinen Namen an.").max(80),
  email: z.string().trim().toLowerCase().email("Bitte gib eine gültige E-Mail-Adresse an.").max(120),
  telefon: z.string().trim().max(40).optional().or(z.literal("")),
  firma: z.string().trim().max(100).optional().or(z.literal("")),
  nachricht: z.string().trim().max(1000).optional().or(z.literal("")),
  antworten: z.record(z.string(), z.array(z.string())),
  empfohlen: z.array(z.string().uuid()).max(10),
  launchEinwilligung: z.boolean(),
  kategorie: z.string().min(1).max(120),
});

export type AnfrageResult = { ok?: boolean; error?: string };

/** Die IP wird NIE im Klartext gespeichert, nur als Hash. Sie dient dem Nachweis, nicht dem Verfolgen. */
function ipHash(ip: string | null): string | null {
  if (!ip) return null;
  return createHash("sha256").update(ip + (process.env.INTEGRATION_ENC_KEY ?? "")).digest("hex").slice(0, 32);
}

export async function anfrageSenden(input: z.input<typeof schema>): Promise<AnfrageResult> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Bitte prüfe deine Eingaben." };
  }
  const d = parsed.data;

  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
  const userAgent = h.get("user-agent")?.slice(0, 300) ?? null;
  const quelle = h.get("referer")?.slice(0, 300) ?? null;
  const hash = ipHash(ip);

  const admin = createAdminClient();

  /* Die Antworten aus dem Finder gehoeren zur Anfrage: ohne sie kann der Anbieter
     kein sinnvolles Angebot machen, und der Nutzer muesste alles zweimal erzaehlen.
     Sie stehen als Klartext in der Nachricht, nicht als kryptische Tags. */
  const antwortText = Object.entries(d.antworten)
    .map(([frage, werte]) => `${frage}: ${werte.join(", ")}`)
    .join("\n");
  const nachricht = [d.nachricht, antwortText && `\n\nAngaben aus dem Finder:\n${antwortText}`]
    .filter(Boolean)
    .join("");

  const { error: aErr } = await admin.from("dir_anfrage").insert({
    collection_id: d.collectionId,
    art: "angebot",
    name: d.name,
    email: d.email,
    telefon: d.telefon || null,
    firma: d.firma || null,
    nachricht: nachricht || null,
    status: "neu",
    quelle_url: quelle,
    ip_hash: hash,
    user_agent: userAgent,
  });
  if (aErr) return { error: "Deine Anfrage konnte nicht gespeichert werden. Bitte versuche es erneut." };

  /* Die Einwilligung, und NUR wenn sie wirklich gesetzt wurde.
     Fehlschlagen darf sie die Anfrage nicht: die ist bereits gespeichert und
     rechtlich unabhaengig. Wer hier abbricht, wuerde die Anfrage wegen einer
     freiwilligen Zusatzoption verlieren, und genau das ist das Kopplungsverbot. */
  if (d.launchEinwilligung) {
    const token = randomBytes(24).toString("base64url");
    await admin.from("launch_einwilligung").insert({
      email: d.email,
      collection_id: d.collectionId,
      text_version: EINWILLIGUNG_VERSION,
      // Der exakte Satz, dem zugestimmt wurde. Nicht "true", sondern der Wortlaut:
      // im Streitfall muss belegbar sein, WELCHEM Satz zugestimmt wurde.
      text_wortlaut: einwilligungText(d.kategorie),
      quelle_url: quelle,
      ip_hash: hash,
      user_agent: userAgent,
      bestaetigungs_token: token,
      // bestaetigt_am bleibt LEER. Erst der Klick in der Mail setzt es. Bis dahin
      // wird nicht versendet: die View launch_verteiler filtert genau darauf.
    });
    // TODO(A-06): Bestaetigungsmail versenden. Bis dahin bleibt die Einwilligung
    // unbestaetigt liegen und wird von launch_verteiler korrekt ignoriert.
  }

  return { ok: true };
}
