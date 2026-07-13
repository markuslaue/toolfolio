/**
 * Fachautoren des Verzeichnisses (E-E-A-T).
 *
 * Bewusst eine Konstante und keine Tabelle: es gibt eine Handvoll Autoren, sie
 * aendern sich selten, und so steht die Biografie im Code-Review statt in einem
 * Formular. Wird es mehr, ziehen wir eine Tabelle ein.
 *
 * WICHTIG: Hier steht nichts, was nicht belegbar ist. Eine Autorenseite existiert,
 * um Google und Lesern zu zeigen, WARUM diese Person das beurteilen kann. Eine
 * erfundene Vita kehrt genau diese Wirkung ins Gegenteil um.
 */

export type Autor = {
  slug: string;
  name: string;
  /** Kurze Rollenbezeichnung, erscheint unter dem Namen. */
  rolle: string;
  /** Ein Satz fuer die Autorenbox unter dem Artikel. */
  kurz: string;
  /** Die Langfassung fuer die Autorenseite, mehrere Absaetze. */
  bio: string[];
  /** Womit er sich auskennt. Erscheint als Liste auf der Autorenseite. */
  expertise: string[];
  bild: string;
  bildKlein: string;
  email?: string;
  linkedin?: string;
  /** Solange false, ist die Autorenseite nicht oeffentlich (noindex, 404). */
  freigegeben: boolean;
};

export const AUTOREN: Record<string, Autor> = {
  "markus-laue": {
    slug: "markus-laue",
    name: "Markus Laue",
    rolle: "Gründer von Toolfolio",
    kurz: "Gründer von Toolfolio und Geschäftsführer der OMMM GmbH in Leipzig.",
    bio: [
      // LUECKE: Diese Absaetze sind Platzhalter. Solange `freigegeben: false` ist,
      // geht die Seite nicht live. Was hier fehlt und von Markus kommen muss:
      //   - beruflicher Werdegang, seit wann, in welchen Rollen
      //   - warum er Software beurteilen kann (Agenturalltag? wie viele Tools im Einsatz?)
      //   - Belege: LinkedIn, Vortraege, Veroeffentlichungen, Zertifikate
      //   - was ihn zu Toolfolio gebracht hat (die Geschichte hinter dem Produkt)
      "Markus Laue ist Gründer von Toolfolio und Geschäftsführer der OMMM GmbH in Leipzig.",
    ],
    expertise: [
      "Software-Kostenmanagement",
      "SaaS-Abonnements und Lizenzmodelle",
      "Toolauswahl für Agenturen und Freelancer",
    ],
    bild: "/autoren/markus-laue.jpg",
    bildKlein: "/autoren/markus-laue-klein.jpg",
    email: "markus.laue@ommm.de",
    // Solange die Biografie ein Platzhalter ist, bleibt die Seite zu.
    freigegeben: false,
  },
};

export function getAutor(slug: string | null | undefined): Autor | null {
  if (!slug) return null;
  return AUTOREN[slug] ?? null;
}

/** Der Standard-Fachautor des Verzeichnisses. */
export const STANDARD_AUTOR = "markus-laue";
