import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * AD-11: Was eine Kategorie erfuellen muss, um ohne Menschen live zu gehen.
 *
 * ---------------------------------------------------------------------------
 * DER ZWECK IST NICHT, MOEGLICHST VIELE SEITEN DURCHZULASSEN.
 *
 * Bei zehn Seiten pro Nacht und 1.400 insgesamt entscheidet dieses Gate darueber, ob
 * am Ende ein Verzeichnis steht oder 1.400 duenne Seiten. Google fasst das zweite unter
 * "Scaled Content Abuse", und die Strafe trifft dann nicht die schlechte Seite, sondern
 * die ganze Domain. Eine Seite weniger zu veroeffentlichen kostet nichts. Eine duenne
 * Seite zu veroeffentlichen kann alle anderen mitreissen.
 *
 * Deshalb ist jede Bedingung hier eine ABLEHNUNG im Zweifel, nicht eine Zustimmung.
 * ---------------------------------------------------------------------------
 *
 * Was durchfaellt, ist nicht verloren: es bleibt Entwurf, taucht im Backend in der
 * Prueflliste auf und sagt selbst, woran es lag.
 */

/* Die Schwellen an EINER Stelle, benannt und begruendet. Verstreute Zahlen im Code
   werden irgendwann von jemandem "kurz angepasst", der ihren Grund nicht kennt. */
export const SCHWELLEN = {
  /** Unter 8 Anbietern ist es kein Vergleich, sondern eine Liste. Dafuer braucht
      niemand eine eigene Seite, und Google auch nicht. */
  MIN_ANBIETER: 8,

  /** Anbieter, ueber die wir NICHTS wissen ausser dem Namen, sind Fuellmaterial.
      Mindestens so viele muessen eine Beschreibung UND Funktionen haben. */
  MIN_ANBIETER_MIT_DATEN: 6,

  /** Der Ratgebertext. Die Erzeugung fordert 1800, unter 1200 ist etwas schiefgegangen. */
  MIN_WOERTER: 1200,

  /** Ohne FAQ fehlt der Seite der Teil, der am haeufigsten in den Suchergebnissen
      erscheint, und dem Markup die FAQPage. */
  MIN_FAQ: 5,

  /** Der Finder ist der eigentliche Grund, warum jemand bei uns statt bei einem
      Vergleichsportal landet. Ohne ihn ist die Seite austauschbar. */
  MIN_FINDER_FRAGEN: 3,
} as const;

export type Pruefung = {
  name: string;
  soll: string;
  ist: string;
  bestanden: boolean;
};

export type GateErgebnis = {
  bestanden: boolean;
  pruefungen: Pruefung[];
  /** Kurzfassung fuers Protokoll und die Prueflliste. */
  zusammenfassung: string;
};

function pruef(name: string, soll: string, ist: string, bestanden: boolean): Pruefung {
  return { name, soll, ist, bestanden };
}

/**
 * Zaehlt Woerter so, wie ein Mensch sie zaehlen wuerde: Markdown-Auszeichnung raus.
 * Sonst zaehlen ## und ** und Linkziele mit und der Text wirkt laenger als er ist.
 */
function woerter(md: string | null): number {
  if (!md) return 0;
  return md
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[#*_>`|-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1).length;
}

/**
 * Prueft eine Kategorie und gibt das Protokoll zurueck. Veroeffentlicht NICHTS,
 * entscheidet nur. Das Trennen von Urteil und Wirkung macht es pruefbar.
 */
export async function pruefeCollection(collectionId: string): Promise<GateErgebnis> {
  const admin = createAdminClient();

  const { data: coll } = await admin
    .from("dir_collection")
    .select("id, name, slug, intro_md, content_md, faq, hero_url, meta_title, meta_description, finder_config, content_status")
    .eq("id", collectionId)
    .maybeSingle();

  if (!coll) {
    return {
      bestanden: false,
      pruefungen: [pruef("Kategorie", "existiert", "nicht gefunden", false)],
      zusammenfassung: "Kategorie nicht gefunden.",
    };
  }

  const { data: zuordnungen } = await admin
    .from("dir_collection_produkt")
    .select("zone, dir_produkt(id, name, kurzbeschreibung, features, website_url)")
    .eq("collection_id", collectionId);

  const produkte = (zuordnungen ?? [])
    .map((z) => z.dir_produkt as unknown as { id: string; name: string; kurzbeschreibung: string | null; features: string[] | null; website_url: string | null })
    .filter(Boolean);

  const mitDaten = produkte.filter(
    (p) => p.kurzbeschreibung && p.kurzbeschreibung.length > 40 && (p.features?.length ?? 0) > 0,
  );

  const faq = Array.isArray(coll.faq) ? (coll.faq as unknown[]) : [];
  const fragen = ((coll.finder_config as { categoryQuestions?: unknown[] } | null)?.categoryQuestions ?? []) as unknown[];
  const anzahlWoerter = woerter(coll.content_md as string | null) + woerter(coll.intro_md as string | null);

  const pruefungen: Pruefung[] = [
    pruef("Anbieter", `mindestens ${SCHWELLEN.MIN_ANBIETER}`, String(produkte.length),
      produkte.length >= SCHWELLEN.MIN_ANBIETER),

    pruef("Anbieter mit Beschreibung und Funktionen", `mindestens ${SCHWELLEN.MIN_ANBIETER_MIT_DATEN}`, String(mitDaten.length),
      mitDaten.length >= SCHWELLEN.MIN_ANBIETER_MIT_DATEN),

    pruef("Ratgebertext", `mindestens ${SCHWELLEN.MIN_WOERTER} Wörter`, `${anzahlWoerter} Wörter`,
      anzahlWoerter >= SCHWELLEN.MIN_WOERTER),

    pruef("FAQ", `mindestens ${SCHWELLEN.MIN_FAQ} Fragen`, String(faq.length),
      faq.length >= SCHWELLEN.MIN_FAQ),

    pruef("Auswahl-Assistent", `mindestens ${SCHWELLEN.MIN_FINDER_FRAGEN} Fragen`, String(fragen.length),
      fragen.length >= SCHWELLEN.MIN_FINDER_FRAGEN),

    pruef("Hintergrundbild", "vorhanden", coll.hero_url ? "vorhanden" : "fehlt",
      Boolean(coll.hero_url)),

    pruef("Meta-Titel", "vorhanden", coll.meta_title ? "vorhanden" : "fehlt",
      Boolean(coll.meta_title)),

    pruef("Meta-Beschreibung", "vorhanden", coll.meta_description ? "vorhanden" : "fehlt",
      Boolean(coll.meta_description)),
  ];

  const durchgefallen = pruefungen.filter((p) => !p.bestanden);

  return {
    bestanden: durchgefallen.length === 0,
    pruefungen,
    zusammenfassung:
      durchgefallen.length === 0
        ? `Alle ${pruefungen.length} Bedingungen erfüllt.`
        : durchgefallen.map((p) => `${p.name}: ${p.ist} statt ${p.soll}`).join("; "),
  };
}
