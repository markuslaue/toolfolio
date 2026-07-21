import Link from "next/link";
import type { ReactNode } from "react";

/**
 * AD-16: Automatische interne Verlinkung im Fliesstext.
 *
 * ---------------------------------------------------------------------------
 * DIE REGELN, und sie sind bewusst streng, weil interne Links sonst mehr schaden
 * als nutzen (Google straft ueberoptimierte, sich wiederholende Ankertexte ab):
 *
 *   - Jeder Begriff verlinkt HOECHSTENS EINMAL pro Seite auf sein Ziel. Der zweite,
 *     dritte Treffer bleibt normaler Text.
 *   - NUR im Fliesstext (Absaetze, Listen). Niemals in Ueberschriften, niemals in
 *     Navigation, Header oder Footer. Diese Funktion wird ausschliesslich vom
 *     Body-Renderer aufgerufen, die anderen Bereiche sehen sie nie.
 *   - Eine Seite verlinkt NIE auf sich selbst. Steht das Ziel eines Begriffs auf der
 *     Seite, auf der wir gerade sind, bleibt der Begriff normaler Text.
 * ---------------------------------------------------------------------------
 */

export type InternerLink = { begriff: string; url: string };

/**
 * Die Zuordnung Begriff -> Ziel-URL. Eine Stelle, hier gepflegt.
 *
 * WICHTIG: Nur auf Ziele verlinken, die es WIRKLICH gibt. Ein interner Link auf eine
 * 404-Seite ist schlechter als kein Link. Deshalb steht hier nur, was existiert.
 */
export const INTERNE_LINKS: InternerLink[] = [
  // Sobald ein Ziel eine LIVE-Seite ist, hier die Zeile einkommentieren, dann verlinkt
  // der Begriff automatisch. Aktuell existiert keines der drei Ziele als erreichbare Seite:
  //
  //   - "Fitnessstudio Software" ist noch ein Entwurf (404, bis der Aufbau sie live setzt).
  //   - /hyrox und /crossfit gibt es noch gar nicht.
  //
  // { begriff: "Fitnessstudio", url: "/verzeichnis/gastro-hotel-und-freizeit/fitnessstudio-software" },
  // { begriff: "Hyrox", url: "/hyrox" },
  // { begriff: "Crossfit", url: "/crossfit" },
];

// Nach Laenge absteigend: laengere Begriffe zuerst, damit "Fitnessstudio Software"
// nicht vorschnell an "Fitnessstudio" verloren geht.
const SORTIERT = [...INTERNE_LINKS].sort((a, b) => b.begriff.length - a.begriff.length);

/** Kontext fuer eine Seite: welcher Pfad ist das hier, und welche Begriffe sind schon vergeben. */
export type LinkKontext = { aktuellerPfad: string; benutzt: Set<string> };

export function neuerLinkKontext(aktuellerPfad: string): LinkKontext {
  return { aktuellerPfad, benutzt: new Set() };
}

function maskiere(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Verlinkt in einem Stueck Fliesstext den JEWEILS ERSTEN, noch nicht vergebenen Begriff.
 *
 * Bekommt bereits fertige ReactNodes (z. B. aus der Fett-Auszeichnung) und ersetzt nur
 * innerhalb der reinen Text-Teile. Fett-, Kursiv- oder sonstige Knoten bleiben unberuehrt:
 * ein Link soll nicht mitten in eine andere Auszeichnung hineinbrechen.
 */
export function verlinke(teile: ReactNode[], ctx: LinkKontext): ReactNode[] {
  let aktuell = teile;

  for (const { begriff, url } of SORTIERT) {
    if (ctx.benutzt.has(begriff)) continue;
    // Kein Selbstlink: zeigt der Begriff auf die Seite, auf der wir sind, ueberspringen.
    if (url === ctx.aktuellerPfad) continue;

    const re = new RegExp(`(^|[^\\p{L}])(${maskiere(begriff)})(?=$|[^\\p{L}])`, "iu");
    const naechste: ReactNode[] = [];
    let vergeben = false;

    for (const teil of aktuell) {
      if (vergeben || typeof teil !== "string") {
        naechste.push(teil);
        continue;
      }
      const m = teil.match(re);
      if (!m || m.index === undefined) {
        naechste.push(teil);
        continue;
      }
      const vor = teil.slice(0, m.index) + m[1]; // Vorzeichen (Leerzeichen o. Satzanfang) behalten
      const treffer = m[2];
      const nach = teil.slice(m.index + m[0].length);
      if (vor) naechste.push(vor);
      naechste.push(
        <Link key={`il-${begriff}`} href={url} className="text-primary underline decoration-primary/30 underline-offset-2 hover:decoration-primary">
          {treffer}
        </Link>,
      );
      if (nach) naechste.push(nach);
      ctx.benutzt.add(begriff);
      vergeben = true;
    }
    aktuell = naechste;
  }

  return aktuell;
}
