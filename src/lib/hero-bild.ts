import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * AD-05: Hero-Bilder fuer Verzeichnis-Kategorien per KI erzeugen.
 *
 * WARUM UEBERHAUPT KI: Ein lizenziertes Stockfoto auf 1300 oeffentlichen Seiten heisst
 * 1300 Lizenznachweise fuehren und bei jedem Anbieterwechsel neu pruefen. Ein selbst
 * erzeugtes Bild hat keinen fremden Urheber. Das Problem verschwindet, statt verwaltet
 * zu werden.
 *
 * WAS DAS BILD SEIN SOLL: Stimmung, nicht Information. Es liegt unscharf und
 * abgedunkelt hinter der Ueberschrift. Deshalb ist der Prompt bewusst auf Atmosphaere
 * gebaut und NICHT auf Details: Text im Bild, Logos, Bildschirme und Menschen mit
 * erkennbaren Gesichtern sind ausdruecklich ausgeschlossen. Sie wuerden im Blur zu
 * Matsch, und erkennbare Gesichter waeren nebenbei ein datenschutzrechtliches Thema,
 * das wir uns nicht ohne Not einhandeln.
 *
 * OHNE SCHLUESSEL passiert nichts, und das ist kein Fehler: der Hero faellt dann auf
 * den Farbverlauf zurueck, und die Seite ist trotzdem vollstaendig.
 */

export const HERO_MODELL = "gpt-image-1";

/** 3:2, gross genug fuer Retina, aber der Blur frisst Schaerfe ohnehin. */
const GROESSE = "1536x1024";

export type HeroErgebnis =
  | { ok: true; url: string; prompt: string }
  | { ok: false; fehler: string };

/**
 * Der Schluessel.
 *
 * Beide Schreibweisen sind zugelassen. Nicht aus Bequemlichkeit: in der Server-Env
 * steht OPEN_AI_API_KEY, und ein Deploy, der an einem Unterstrich scheitert, ist die
 * duemmste Art, eine Nacht zu verlieren.
 */
function bildKey(): string | undefined {
  return process.env.OPENAI_API_KEY ?? process.env.OPEN_AI_API_KEY;
}

export function bildApiVerfuegbar(): boolean {
  return Boolean(bildKey());
}

/**
 * Der Prompt.
 *
 * Er bekommt den Kategorienamen und den Cluster, damit "Campingplatz Software" zu
 * einem Campingplatz wird und nicht zu einem Bildschirm mit Software darauf. Genau
 * das ist der Fehler, den ein naiver Prompt macht: er bebildert das Wort "Software"
 * statt das Thema.
 */
export function heroPrompt(collectionName: string, clusterName: string): string {
  // "Campingplatz Software" -> "Campingplatz". Das Thema ist der Betrieb, nicht das Werkzeug.
  const thema = collectionName
    .replace(/\b(Software|Tools?|Systeme?|Programme?|Loesungen?|Lösungen?|Apps?)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();

  return [
    `A calm, atmospheric wide photograph evoking the world of ${thema || collectionName}`,
    `(context: ${clusterName}).`,
    "Natural light, soft depth of field, muted and slightly desaturated colours, editorial photography style.",
    "The scene is quiet and empty of people.",
    "STRICTLY NO text, NO letters, NO numbers, NO logos, NO signage, NO screens, NO user interfaces,",
    "NO watermarks, NO recognisable faces, NO brand marks of any kind.",
    "Composition leaves the upper left area calm and uncluttered.",
    "Photorealistic, not an illustration, not a 3D render.",
  ].join(" ");
}

/**
 * Bild erzeugen, in den Speicher legen, oeffentliche URL zurueckgeben.
 *
 * Das Bild wird NICHT von der fremden URL aus eingebunden: OpenAI liefert eine
 * kurzlebige URL, und ein Verzeichnis, dessen Bilder nach ein paar Stunden tot sind,
 * waere schlimmer als eines ganz ohne Bilder. Wir laden es herunter und legen es in
 * unseren eigenen Speicher.
 */
export async function erzeugeHero(
  collectionId: string,
  collectionSlug: string,
  collectionName: string,
  clusterName: string,
): Promise<HeroErgebnis> {
  const key = bildKey();
  if (!key) {
    return {
      ok: false,
      fehler: "Kein OpenAI-Schlüssel in der Server-Umgebung. Ohne ihn können wir keine Bilder erzeugen.",
    };
  }

  const prompt = heroPrompt(collectionName, clusterName);

  let base64: string;
  try {
    const res = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: HERO_MODELL,
        prompt,
        size: GROESSE,
        quality: "medium", // "high" kostet das Vierfache und verschwindet im Blur.
        n: 1,
      }),
      cache: "no-store",
    });

    if (res.status === 401) return { ok: false, fehler: "OpenAI hat den Schlüssel abgelehnt." };
    if (!res.ok) {
      const text = await res.text();
      return { ok: false, fehler: `OpenAI antwortete mit Status ${res.status}: ${text.slice(0, 200)}` };
    }

    const json = (await res.json()) as { data?: { b64_json?: string; url?: string }[] };
    const eintrag = json.data?.[0];

    if (eintrag?.b64_json) {
      base64 = eintrag.b64_json;
    } else if (eintrag?.url) {
      // Manche Modelle liefern eine URL statt base64. Auch die laden wir herunter,
      // statt sie zu verlinken: fremde URLs verfallen.
      const bild = await fetch(eintrag.url);
      const puffer = Buffer.from(await bild.arrayBuffer());
      base64 = puffer.toString("base64");
    } else {
      return { ok: false, fehler: "OpenAI lieferte kein Bild zurück." };
    }
  } catch (e) {
    return { ok: false, fehler: e instanceof Error ? e.message : "Die Bilderzeugung ist fehlgeschlagen." };
  }

  const admin = createAdminClient();
  const daten = Buffer.from(base64, "base64");
  // Der Zeitstempel im Dateinamen: ein neu erzeugtes Bild bekommt eine neue URL,
  // sonst zeigt der CDN-Cache noch tagelang das alte.
  const pfad = `${collectionSlug}-${Date.now()}.png`;

  const { error } = await admin.storage.from("verzeichnis-hero").upload(pfad, daten, {
    contentType: "image/png",
    upsert: true,
  });
  if (error) return { ok: false, fehler: `Speichern fehlgeschlagen: ${error.message}` };

  const { data: pub } = admin.storage.from("verzeichnis-hero").getPublicUrl(pfad);
  const url = pub.publicUrl;

  await admin
    .from("dir_collection")
    .update({
      hero_url: url,
      hero_quelle: "ki",
      // Kein fremder Autor, also auch keine Zuschreibung. Wir erfinden hier nichts.
      hero_autor: null,
      hero_autor_url: null,
      hero_quelle_url: null,
      hero_prompt: prompt,
      hero_modell: HERO_MODELL,
      hero_erzeugt_am: new Date().toISOString(),
    })
    .eq("id", collectionId);

  return { ok: true, url, prompt };
}
