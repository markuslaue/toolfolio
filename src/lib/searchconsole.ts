import "server-only";
import { createSign } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * AD-14: Suchdaten aus der Google Search Console holen.
 *
 * Zugang ueber ein Dienstkonto, nicht ueber eine Browser-Anmeldung: Der Abruf laeuft
 * nachts ohne Menschen, und ein Dienstkonto hat keine ablaufende Sitzung. Es sieht
 * ausserdem nur die Properties, fuer die es in der Search Console freigeschaltet
 * wurde, sonst nichts vom Google-Konto.
 */

const PROPERTY = "sc-domain:toolfolio.de";
const SCOPE = "https://www.googleapis.com/auth/webmasters.readonly";

/**
 * Google liefert hoechstens 25.000 Zeilen je Anfrage. Bei 1.271 Kategorien und vielen
 * Suchanfragen je Seite reicht eine Anfrage irgendwann nicht mehr, deshalb blaettern.
 * Die Obergrenze ist ein Notnagel gegen eine Endlosschleife, nicht die Erwartung.
 */
const ZEILEN_JE_ANFRAGE = 25000;
const MAX_SEITEN = 20;

type Konto = { client_email: string; private_key: string };

function konto(): Konto {
  const roh = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!roh) throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON fehlt in der Server-Umgebung.");
  const k = JSON.parse(roh) as Konto;
  if (!k.client_email || !k.private_key) throw new Error("Der Dienstkonto-Schlüssel ist unvollständig.");
  return k;
}

function b64url(s: string | Buffer): string {
  return Buffer.from(s).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** Zugangstoken holen. Gilt eine Stunde, wird je Lauf einmal geholt. */
async function token(): Promise<string> {
  const k = konto();
  const jetzt = Math.floor(Date.now() / 1000);

  const kopf = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const anspruch = b64url(
    JSON.stringify({
      iss: k.client_email,
      scope: SCOPE,
      aud: "https://oauth2.googleapis.com/token",
      exp: jetzt + 3600,
      iat: jetzt,
    }),
  );

  const signatur = createSign("RSA-SHA256").update(`${kopf}.${anspruch}`).end().sign(k.private_key);
  const jwt = `${kopf}.${anspruch}.${b64url(signatur)}`;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });
  if (!res.ok) throw new Error(`Anmeldung bei Google fehlgeschlagen (${res.status}): ${(await res.text()).slice(0, 200)}`);
  return ((await res.json()) as { access_token: string }).access_token;
}

export type SuchZeile = {
  datum: string;
  seite: string;
  suchanfrage: string;
  impressionen: number;
  klicks: number;
  position: number;
};

/** Rohdaten fuer einen Zeitraum holen, ueber alle Seiten hinweg geblaettert. */
async function holeZeitraum(von: string, bis: string): Promise<SuchZeile[]> {
  const t = await token();
  const url = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(PROPERTY)}/searchAnalytics/query`;
  const alle: SuchZeile[] = [];

  for (let seite = 0; seite < MAX_SEITEN; seite++) {
    const res = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${t}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        startDate: von,
        endDate: bis,
        dimensions: ["date", "page", "query"],
        rowLimit: ZEILEN_JE_ANFRAGE,
        startRow: seite * ZEILEN_JE_ANFRAGE,
      }),
    });
    if (!res.ok) throw new Error(`Abruf fehlgeschlagen (${res.status}): ${(await res.text()).slice(0, 200)}`);

    const zeilen = ((await res.json()) as { rows?: { keys: string[]; impressions: number; clicks: number; position: number }[] }).rows ?? [];
    for (const z of zeilen) {
      let pfad = z.keys[1];
      try {
        pfad = new URL(z.keys[1]).pathname;
      } catch { /* schon ein Pfad */ }
      alle.push({
        datum: z.keys[0],
        seite: pfad,
        suchanfrage: z.keys[2],
        impressionen: Math.round(z.impressions),
        klicks: Math.round(z.clicks),
        position: Math.round(z.position * 100) / 100,
      });
    }
    if (zeilen.length < ZEILEN_JE_ANFRAGE) break;
  }

  return alle;
}

/**
 * Abrufen und speichern.
 *
 * @param tageZurueck Wie weit zurueck geholt wird. Standard 5, weil Google seine
 *   Zahlen bis zu drei Tage rueckwirkend korrigiert. Wer nur den Vortag holt, hat
 *   dauerhaft zu niedrige Werte und merkt es nicht, weil sie plausibel aussehen.
 */
export async function holeUndSpeichereSuchdaten(tageZurueck = 5): Promise<{ zeilen: number; von: string; bis: string }> {
  const admin = createAdminClient();
  const start = Date.now();

  /* Die letzten zwei Tage liefert Google noch gar nicht vollstaendig. Sie trotzdem
     abzufragen kostet nichts, liefert aber Luecken, die dann als "kein Traffic"
     gelesen werden. Deshalb endet das Fenster zwei Tage in der Vergangenheit. */
  const bisDate = new Date(Date.now() - 2 * 86_400_000);
  const vonDate = new Date(Date.now() - tageZurueck * 86_400_000);
  const bis = bisDate.toISOString().slice(0, 10);
  const von = vonDate.toISOString().slice(0, 10);

  try {
    const zeilen = await holeZeitraum(von, bis);

    /* Pfade den Kategorien zuordnen. Einmal alle Slugs holen und im Speicher
       zuordnen ist billiger als eine Abfrage je Zeile. */
    const { data: colls } = await admin.from("dir_collection").select("id, slug");
    const nachSlug = new Map((colls ?? []).map((c) => [c.slug as string, c.id as string]));

    const saetze = zeilen.map((z) => {
      const teile = z.seite.split("/").filter(Boolean);
      // /verzeichnis/<cluster>/<collection>
      const slug = teile[0] === "verzeichnis" && teile.length >= 3 ? teile[2] : null;
      return {
        datum: z.datum,
        seite: z.seite,
        suchanfrage: z.suchanfrage,
        collection_id: slug ? (nachSlug.get(slug) ?? null) : null,
        impressionen: z.impressionen,
        klicks: z.klicks,
        position: z.position,
        aktualisiert_am: new Date().toISOString(),
      };
    });

    // In Haeppchen schreiben. Ein upsert mit zehntausenden Zeilen laeuft in Grenzen,
    // die man erst bemerkt, wenn er stillschweigend die Haelfte schreibt.
    for (let i = 0; i < saetze.length; i += 500) {
      const { error } = await admin
        .from("dir_suchdaten")
        .upsert(saetze.slice(i, i + 500), { onConflict: "datum,seite,suchanfrage" });
      if (error) throw new Error(`Speichern fehlgeschlagen: ${error.message}`);
    }

    await admin.from("system_suchdaten_lauf").insert({
      von, bis, zeilen: saetze.length, ok: true,
      dauer_sekunden: Math.round((Date.now() - start) / 1000),
    });

    return { zeilen: saetze.length, von, bis };
  } catch (e) {
    const text = e instanceof Error ? e.message : "Unbekannter Fehler";
    await admin.from("system_suchdaten_lauf").insert({
      von, bis, zeilen: 0, ok: false, fehler: text.slice(0, 500),
      dauer_sekunden: Math.round((Date.now() - start) / 1000),
    });
    throw e;
  }
}
