import "server-only";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { fuehreLaufAus, erzeugeFinder } from "@/lib/verzeichnis-pipeline";
import { pruefeCollection } from "@/lib/verzeichnis-gate";

/**
 * AD-11: Der naechtliche Aufbau. Zehn Kategorien je Nacht, von 02:00 bis 08:00.
 *
 * ---------------------------------------------------------------------------
 * DIE LEITIDEE: Eine Nacht ist ein Zeitfenster, kein Auftrag, der fertig werden muss.
 *
 * Wer stur zehn Kategorien abarbeitet, laeuft irgendwann in den Morgen hinein, waehrend
 * Besucher auf der Seite sind, und belastet den 4-GB-Server genau dann, wenn es weh tut.
 * Deshalb wird VOR jeder Kategorie geprueft, ob die Zeit noch reicht. Was nicht mehr
 * passt, bleibt in der Warteschlange und kommt morgen dran. Eine Warteschlange, die
 * einen Tag laenger braucht, ist kein Problem. Ein Lauf, der um 9 Uhr noch crawlt,
 * schon.
 * ---------------------------------------------------------------------------
 *
 * Ein Fehlschlag bei einer Kategorie beendet die Nacht NICHT. Bei zehn Kategorien und
 * fremden Servern, die nun einmal manchmal nicht antworten, waere das die Garantie
 * dafuer, dass regelmaessig nach der zweiten Kategorie Schluss ist.
 */

/** Wie lange eine Kategorie hoechstens brauchen darf, bevor wir die naechste gar nicht
    mehr anfangen. Grosszuegig gerechnet: gemessen sind es etwa 20 Minuten. */
const RESERVE_MS = 35 * 60 * 1000;

/** Nach so vielen erfolglosen Anlaeufen ruht eine Kategorie. Ohne diese Grenze wuerde
    eine Kategorie, deren Anbieter es schlicht nicht gibt, jede Nacht Geld verbrennen. */
const MAX_VERSUCHE = 3;

export type NachtBericht = {
  gebaut: number;
  veroeffentlicht: number;
  durchgefallen: number;
  fehler: number;
  uebersprungen_zeit: number;
  dauer_sekunden: number;
  kategorien: { name: string; ergebnis: string; grund?: string }[];
};

/**
 * Warteschlange auffuellen.
 *
 * Bewusst nur mit Kategorien, die noch im Entwurf sind und noch keinen Text haben.
 * Was jemand von Hand angefasst hat, faengt sich der naechtliche Lauf nicht ein: sonst
 * ueberschreibt die Maschine irgendwann die Arbeit eines Menschen, und das merkt man
 * erst hinterher.
 */
async function fuelleWarteschlange(admin: ReturnType<typeof createAdminClient>): Promise<number> {
  const { data: offen } = await admin
    .from("dir_warteschlange")
    .select("collection_id", { count: "exact", head: true })
    .eq("zustand", "offen");
  void offen;

  const { count } = await admin
    .from("dir_warteschlange")
    .select("collection_id", { count: "exact", head: true })
    .eq("zustand", "offen");
  if ((count ?? 0) > 0) return 0;

  const { data: kandidaten } = await admin
    .from("dir_collection")
    .select("id")
    .eq("status", "entwurf")
    .is("content_md", null)
    .limit(500);

  if (!kandidaten || kandidaten.length === 0) return 0;

  const { data: schon } = await admin.from("dir_warteschlange").select("collection_id");
  const bekannt = new Set((schon ?? []).map((z) => z.collection_id as string));
  const neu = kandidaten.filter((k) => !bekannt.has(k.id as string));
  if (neu.length === 0) return 0;

  await admin.from("dir_warteschlange").insert(neu.map((k) => ({ collection_id: k.id as string })));
  return neu.length;
}

/** Einen Lauf-Datensatz anlegen. gestartet_von bleibt leer: es war kein Mensch. */
async function legeLaufAn(
  admin: ReturnType<typeof createAdminClient>,
  collectionId: string,
): Promise<string | null> {
  const { data } = await admin
    .from("dir_lauf")
    .insert({ collection_id: collectionId, status: "laeuft", phase: "Start", gestartet_von: null })
    .select("id")
    .single();
  return (data?.id as string) ?? null;
}

async function laufStatus(
  admin: ReturnType<typeof createAdminClient>,
  laufId: string,
): Promise<string> {
  const { data } = await admin.from("dir_lauf").select("status").eq("id", laufId).maybeSingle();
  return (data?.status as string) ?? "unbekannt";
}

/**
 * Eine Kategorie komplett bauen und ueber die Veroeffentlichung entscheiden.
 * Wirft nicht: der Aufrufer soll die Nacht weiterfuehren koennen.
 */
async function baueEine(
  admin: ReturnType<typeof createAdminClient>,
  collectionId: string,
  name: string,
): Promise<{ ergebnis: "veroeffentlicht" | "durchgefallen" | "fehler"; grund?: string }> {
  try {
    /* 1) Anbieter suchen, Preise holen, Text schreiben, Bild erzeugen. */
    const lauf1 = await legeLaufAn(admin, collectionId);
    if (!lauf1) return { ergebnis: "fehler", grund: "Lauf konnte nicht angelegt werden." };
    await fuehreLaufAus(lauf1, collectionId, { discovery: true, preise: true, content: true, bild: true });
    if ((await laufStatus(admin, lauf1)) !== "fertig") {
      return { ergebnis: "fehler", grund: "Aufbau fehlgeschlagen, siehe Protokoll des Laufs." };
    }

    /* 2) Auswahl-Assistent. Er braucht die Produkte aus Schritt 1, deshalb danach. */
    const lauf2 = await legeLaufAn(admin, collectionId);
    if (lauf2) {
      await erzeugeFinder(lauf2, collectionId, null);
      // Ein fehlgeschlagener Finder ist kein Abbruch: das Gate faellt ihn ohnehin durch,
      // und dann steht im Bericht, WORAN es lag, statt eines nackten "Fehler".
    }

    /* 3) Urteil. */
    const gate = await pruefeCollection(collectionId);

    await admin
      .from("dir_collection")
      .update({
        gate_bericht: { ...gate, geprueft_am: new Date().toISOString() },
        auto_gebaut_am: new Date().toISOString(),
      })
      .eq("id", collectionId);

    if (!gate.bestanden) {
      return { ergebnis: "durchgefallen", grund: gate.zusammenfassung };
    }

    /* 4) Veroeffentlichen. */
    return await veroeffentlicheAutomatisch(admin, collectionId, name);
  } catch (e) {
    return { ergebnis: "fehler", grund: e instanceof Error ? e.message : "Unbekannter Fehler" };
  }
}

/**
 * Freigeben und live schalten.
 *
 * content_status wird auf 'auto_freigegeben' gesetzt, NICHT auf 'geprueft'. 'geprueft'
 * heisst woertlich: ein Mensch hat das gelesen. Das waere hier gelogen, und zwar
 * dauerhaft und hinterher nicht mehr auffindbar.
 */
async function veroeffentlicheAutomatisch(
  admin: ReturnType<typeof createAdminClient>,
  collectionId: string,
  name: string,
): Promise<{ ergebnis: "veroeffentlicht" | "fehler"; grund?: string }> {
  const { data: coll } = await admin
    .from("dir_collection")
    .select("slug, cluster_id, dir_cluster(slug)")
    .eq("id", collectionId)
    .maybeSingle();

  /* DEN HUB MITNEHMEN. Eine veroeffentlichte Kategorie unter einem Cluster im Entwurf
     ist ein Widerspruch: die RLS blendet den Cluster fuer Besucher aus, und die Seite
     findet ihren eigenen Hub nicht mehr. Genau das ist schon einmal passiert. */
  if (coll?.cluster_id) {
    await admin
      .from("dir_cluster")
      .update({ status: "veroeffentlicht" })
      .eq("id", coll.cluster_id)
      .eq("status", "entwurf");
  }

  const { error } = await admin
    .from("dir_collection")
    .update({ status: "veroeffentlicht", content_status: "auto_freigegeben" })
    .eq("id", collectionId);

  if (error) return { ergebnis: "fehler", grund: `Veröffentlichen fehlgeschlagen: ${error.message}` };

  /* Den Cache GEZIELT verwerfen. Ein Hintergrundlauf geht an allen Server-Actions
     vorbei, es raeumt also niemand hinter ihm auf. Ohne das steht die frisch gebaute
     Seite bis zu zehn Minuten als 404 da. */
  const clusterSlug = (coll?.dir_cluster as unknown as { slug: string } | null)?.slug;
  if (clusterSlug && coll?.slug) {
    revalidatePath(`/verzeichnis/${clusterSlug}/${coll.slug}`);
    revalidatePath(`/verzeichnis/${clusterSlug}`);
  }
  revalidatePath("/verzeichnis", "layout");
  /* Und die Sitemap. Ohne das steht die neue Seite bis zu einer Stunde nicht drin,
     und genau dafuer ist sie da. */
  revalidatePath("/sitemap-collections.xml");
  revalidatePath("/sitemap.xml");

  void name;
  return { ergebnis: "veroeffentlicht" };
}

/**
 * Eine Nacht.
 *
 * @param anzahl   Wie viele Kategorien hoechstens gebaut werden sollen.
 * @param endeUm   Zeitpunkt, ab dem keine NEUE Kategorie mehr begonnen wird.
 */
export async function baueNacht(anzahl: number, endeUm: Date): Promise<NachtBericht> {
  const admin = createAdminClient();
  const start = Date.now();
  const bericht: NachtBericht = {
    gebaut: 0, veroeffentlicht: 0, durchgefallen: 0, fehler: 0,
    uebersprungen_zeit: 0, dauer_sekunden: 0, kategorien: [],
  };

  await fuelleWarteschlange(admin);

  const { data: naechste } = await admin
    .from("dir_warteschlange")
    .select("collection_id, versuche, dir_collection(name, slug)")
    .eq("zustand", "offen")
    .lt("versuche", MAX_VERSUCHE)
    .order("rang", { ascending: true })
    .order("erstellt_am", { ascending: true })
    .limit(anzahl);

  for (const eintrag of naechste ?? []) {
    const collectionId = eintrag.collection_id as string;
    const name = (eintrag.dir_collection as unknown as { name: string } | null)?.name ?? "Unbekannt";

    /* Reicht die Zeit noch? Lieber gar nicht anfangen als um neun Uhr morgens
       mittendrin stecken. */
    if (Date.now() + RESERVE_MS > endeUm.getTime()) {
      bericht.uebersprungen_zeit++;
      continue;
    }

    await admin
      .from("dir_warteschlange")
      .update({ zustand: "laeuft", zuletzt_am: new Date().toISOString() })
      .eq("collection_id", collectionId);

    const r = await baueEine(admin, collectionId, name);
    bericht.gebaut++;
    bericht.kategorien.push({ name, ergebnis: r.ergebnis, grund: r.grund });

    const zustand =
      r.ergebnis === "veroeffentlicht" ? "fertig"
      : r.ergebnis === "durchgefallen" ? "durchgefallen"
      : "fehler";

    if (r.ergebnis === "veroeffentlicht") bericht.veroeffentlicht++;
    else if (r.ergebnis === "durchgefallen") bericht.durchgefallen++;
    else bericht.fehler++;

    await admin
      .from("dir_warteschlange")
      .update({
        zustand,
        versuche: ((eintrag.versuche as number) ?? 0) + 1,
        letzter_fehler: r.grund ?? null,
        zuletzt_am: new Date().toISOString(),
      })
      .eq("collection_id", collectionId);
  }

  bericht.dauer_sekunden = Math.round((Date.now() - start) / 1000);
  return bericht;
}
