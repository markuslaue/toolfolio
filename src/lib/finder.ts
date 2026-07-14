/**
 * Der Anfrage-Finder: eine generische Engine, eine Datenschicht pro Kategorie.
 *
 * WARUM GENERISCH: Es gibt rund 1300 Kategorien. Ein Finder pro Kategorie zu bauen
 * waere 1300 mal derselbe Code mit anderen Fragen. Deshalb ist hier die Mechanik,
 * und die Fragen kommen aus `dir_collection.finder_config`. Der Rollout ist dann
 * Datenpflege, kein Neubau.
 *
 * REIHENFOLGE, und die ist nicht verhandelbar: erst Wert liefern, dann fragen.
 * Der Nutzer beantwortet Fachfragen, bekommt eine begruendete Empfehlung, und ERST
 * DANN wird nach seiner E-Mail gefragt. Umgekehrt waere es ein Lead-Formular mit
 * Beratungs-Deko, und das merkt jeder.
 */

export type FrageTyp = "single" | "multi" | "boolean";

export type FinderOption = {
  value: string;
  label: string;
  /** Tags, die diese Antwort verlangt. Ein Tool ohne diese Tags passt schlechter. */
  tags: string[];
  /** Erklaerung, warum diese Antwort etwas aendert. Erscheint als Hilfetext. */
  hinweis?: string;
};

export type FinderFrage = {
  id: string;
  label: string;
  /** Ein Satz, warum wir das fragen. Der Nutzer soll nie raten, wozu eine Frage dient. */
  warum?: string;
  type: FrageTyp;
  options?: FinderOption[];
  /** Ein K.-o.-Kriterium: Tools ohne das geforderte Tag fliegen RAUS, statt nur schlechter zu ranken. */
  ausschluss?: boolean;
};

export type FinderConfig = {
  status: FinderStatus;
  introHeadline: string;
  ctaLabel: string;
  categoryQuestions: FinderFrage[];
  /** Tags je Produkt IN DIESER Kategorie. */
  productTags?: { productId: string; tags: string[] }[];
};

export type FinderStatus = "todo" | "in_review" | "live";

export const FINDER_STATUS_LABEL: Record<FinderStatus, string> = {
  todo: "Offen",
  in_review: "In Prüfung",
  live: "Live",
};

export const FINDER_STATUS_STIL: Record<FinderStatus, string> = {
  todo: "bg-secondary text-muted-foreground",
  in_review: "bg-amber-100 text-amber-800",
  live: "bg-emerald-100 text-emerald-800",
};

/* --------------------------------------------------------------------------
 * Generische Qualifizierung
 *
 * Diese Fragen gelten in JEDER Kategorie. Sie kommen NACH den Fachfragen: wer
 * gerade wissen will, welche Software zu seinem Platz passt, will nicht zuerst
 * seine Firmengroesse angeben.
 *
 * Sie sind zugleich der Basis-Finder fuer Kategorien, deren Fragensatz noch nicht
 * geschrieben ist (finder_status = todo). So entsteht nie eine leere Stelle, und
 * der Unterschied ist nie "Formular oder kein Formular", sondern nur
 * "individuell oder generisch".
 * ----------------------------------------------------------------------- */

export const BASIS_FRAGEN: FinderFrage[] = [
  {
    id: "groesse",
    label: "Wie groß ist der Betrieb?",
    warum: "Manche Systeme lohnen sich erst ab einer gewissen Größe, andere ersticken daran.",
    type: "single",
    options: [
      { value: "solo", label: "Ich alleine", tags: ["klein"] },
      { value: "2_10", label: "2 bis 10 Personen", tags: ["klein", "mittel"] },
      { value: "11_50", label: "11 bis 50 Personen", tags: ["mittel"] },
      { value: "ueber_50", label: "Mehr als 50", tags: ["gross", "enterprise"] },
    ],
  },
  {
    id: "zeitrahmen",
    label: "Wann willst du wechseln oder einführen?",
    warum: "Damit die Anbieter wissen, ob sie dich beraten oder ein Angebot machen sollen.",
    type: "single",
    options: [
      { value: "sofort", label: "So schnell wie möglich", tags: [] },
      { value: "quartal", label: "In den nächsten drei Monaten", tags: [] },
      { value: "jahr", label: "Dieses Jahr noch", tags: [] },
      { value: "orientierung", label: "Ich orientiere mich erst", tags: [] },
    ],
  },
  {
    id: "bestand",
    label: "Nutzt du schon eine Lösung?",
    warum: "Ein Wechsel bedeutet Datenmigration. Das ist bei der Auswahl oft der teuerste Punkt.",
    type: "single",
    options: [
      { value: "nein", label: "Nein, das wäre die erste", tags: [] },
      { value: "ja_wechsel", label: "Ja, ich will wechseln", tags: ["migration"] },
      { value: "ja_ergaenzen", label: "Ja, ich will ergänzen", tags: [] },
      { value: "excel", label: "Bisher Excel oder Papier", tags: [] },
    ],
  },
];

/* --------------------------------------------------------------------------
 * Das Matching
 * ----------------------------------------------------------------------- */

export type Kandidat = {
  id: string;
  name: string;
  slug: string;
  farbe: string;
  kurzbeschreibung: string | null;
  tags: string[];
};

export type Treffer = {
  kandidat: Kandidat;
  /** 0 bis 1. Nur zur Sortierung, wird dem Nutzer NICHT als Prozentzahl gezeigt. */
  score: number;
  /** Was gepasst hat, im Klartext. */
  passt: string[];
  /** Was dieses Tool NICHT kann, obwohl andere in der Kategorie es koennen. */
  passtNicht: string[];
  /**
   * Wonach wir gefragt haben, worueber wir aber bei KEINEM Tool der Kategorie eine
   * Angabe haben. Das ist eine Luecke in UNSEREN Daten, kein Mangel des Tools, und
   * es waere unfair, es dem Tool anzulasten.
   */
  unbekannt: string[];
};

/**
 * Regelbasiertes Matching.
 *
 * Bewusst simpel und nachvollziehbar, nicht klug. Der Nutzer bekommt eine
 * Begruendung zu sehen, und die muss stimmen. Ein Score, den niemand erklaeren
 * kann, ist auf einer Seite, die Vertrauen verkauft, wertlos.
 *
 * DIE GOLDENE REGEL: Die Zone (gesponsert / organisch / community) fliesst hier
 * NICHT ein und darf es nie. Wer bezahlt, wird sichtbarer, nicht passender.
 * Deshalb nimmt diese Funktion die Zone gar nicht erst entgegen.
 *
 * @param antworten  Was der Nutzer gewaehlt hat: Frage-ID -> gewaehlte Werte
 * @param fragen     Der Fragensatz (Kategoriefragen, ohne die Basisfragen)
 * @param kandidaten Alle Produkte der Kategorie mit ihren Tags
 */
export function finde(
  antworten: Record<string, string[]>,
  fragen: FinderFrage[],
  kandidaten: Kandidat[],
): Treffer[] {
  // 1) Alle Tags einsammeln, die der Nutzer durch seine Antworten verlangt.
  const gefordert: { tag: string; frage: string; antwort: string; ausschluss: boolean }[] = [];
  for (const frage of fragen) {
    const gewaehlt = antworten[frage.id] ?? [];
    for (const wert of gewaehlt) {
      const option = frage.options?.find((o) => o.value === wert);
      if (!option) continue;
      for (const tag of option.tags) {
        gefordert.push({ tag, frage: frage.label, antwort: option.label, ausschluss: frage.ausschluss === true });
      }
    }
  }

  // Nichts gefordert: dann kann das Matching nichts leisten und tut auch nicht so.
  if (gefordert.length === 0) return [];

  /* WELCHE KRITERIEN UNTERSCHEIDEN UEBERHAUPT?
     Ein Tag, das KEIN einziges Tool der Kategorie hat, sagt nichts aus. Es zieht
     allen gleich viele Punkte ab und macht das Ergebnis nur pauschal schlechter.
     Der Grund ist fast immer, dass die Angabe auf keiner Herstellerseite steht,
     also eine Luecke in UNSEREN Daten, kein Mangel der Tools.

     Solche Kriterien fliegen aus der Bewertung raus. Sie werden dem Nutzer aber
     TROTZDEM gezeigt, unter "dazu wissen wir nichts": er soll erfahren, wo unsere
     Daten enden, statt sich zu wundern, warum seine Antwort nichts bewirkt hat. */
  const irgendwerHat = (tag: string) => kandidaten.some((k) => k.tags.includes(tag));
  const wertend = gefordert.filter((g) => irgendwerHat(g.tag));
  const ungeklaert = gefordert.filter((g) => !irgendwerHat(g.tag));

  const treffer: Treffer[] = [];

  for (const k of kandidaten) {
    const hat = new Set(k.tags);
    const passt: string[] = [];
    const passtNicht: string[] = [];
    let raus = false;

    for (const g of wertend) {
      if (hat.has(g.tag)) {
        const text = `${g.antwort}: kann das Tool`;
        if (!passt.includes(text)) passt.push(text);
      } else {
        // K.-o.-Kriterium: fliegt raus, statt nur schlechter platziert zu werden.
        // Aber nur, wenn andere Tools es koennen: sonst waere es kein Kriterium,
        // sondern eine Datenluecke, und die darf niemanden ausschliessen.
        if (g.ausschluss) raus = true;
        const text = `${g.antwort}: nicht belegt`;
        if (!passtNicht.includes(text)) passtNicht.push(text);
      }
    }

    if (raus) continue;

    const unbekannt = [...new Set(ungeklaert.map((g) => g.antwort))];
    const getroffen = wertend.filter((g) => hat.has(g.tag)).length;

    treffer.push({
      kandidat: k,
      // Nur die unterscheidenden Kriterien zaehlen. Gibt es keine, ist der Score 1:
      // dann hat der Nutzer nichts gefragt, was wir beantworten koennen, und wir tun
      // nicht so, als haetten alle Tools versagt.
      score: wertend.length === 0 ? 1 : getroffen / wertend.length,
      passt,
      passtNicht,
      unbekannt,
    });
  }

  return treffer
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      // Gleichstand: alphabetisch. Bewusst NICHT nach Zone, nicht nach Position,
      // nicht nach irgendetwas, das man kaufen koennte.
      return a.kandidat.name.localeCompare(b.kandidat.name, "de");
    })
    .slice(0, 3);
}

/**
 * Wie belastbar ist das Ergebnis?
 *
 * Erfuellt das beste Tool nicht einmal die Haelfte der Kriterien, die wir wirklich
 * pruefen konnten, sagen wir das. Den besten von drei schlechten als "Empfehlung"
 * zu verkaufen, waere genau die Sorte Vergleichsseite, die wir nicht sein wollen.
 */
export function ergebnisGuete(treffer: Treffer[]): "gut" | "duenn" | "keins" {
  if (treffer.length === 0) return "keins";
  if (treffer[0].score < 0.5) return "duenn";
  return "gut";
}
