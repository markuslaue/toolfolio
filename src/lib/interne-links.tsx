import Link from "next/link";
import type { ReactNode } from "react";

/**
 * AD-16: Automatische interne Verlinkung im Fliesstext.
 *
 * DIE LOGIK: Jede veroeffentlichte Kollektion ist ein Linkziel unter ihrem Namen.
 * Taucht "Bibliothekssoftware" im Text irgendeiner ANDEREN Seite auf, wird die erste
 * Fundstelle zum Link auf die Bibliothekssoftware-Seite. Das gilt fuer alle Kollektionen,
 * ohne Handpflege: die Zielliste kommt aus der Datenbank.
 *
 * ---------------------------------------------------------------------------
 * DIE REGELN, streng, weil interne Links sonst mehr schaden als nutzen:
 *   - Jeder Begriff verlinkt HOECHSTENS EINMAL pro Seite. Danach normaler Text.
 *   - NUR im Fliesstext (Absaetze, Listen). Nie in Ueberschriften, Header, Footer,
 *     Navigation. Der Linker wird ausschliesslich vom Body-Renderer aufgerufen.
 *   - Eine Seite verlinkt NIE auf sich selbst.
 *   - Nur auf VEROEFFENTLICHTE Ziele. Ein Link auf einen Entwurf waere ein 404.
 *   - Hoechstens MAX_PRO_SEITE Links je Seite, damit aus einem Ratgeber keine
 *     Linkwueste wird (Google straft ueberoptimierte interne Verlinkung ab).
 * ---------------------------------------------------------------------------
 */

export type InternerLink = { begriff: string; url: string };

/** So viele interne Links pro Seite hoechstens. Bewusst konservativ. */
export const MAX_PRO_SEITE = 12;

type Ziel = { begriff: string; url: string; re: RegExp };

export type LinkKontext = {
  aktuellerPfad: string;
  ziele: Ziel[];
  benutzt: Set<string>;
  uebrig: number;
};

function maskiere(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Kontext fuer eine Seite. `ziele` sind die moeglichen Linkbegriffe (Kollektionsnamen).
 * Laengere Begriffe zuerst, damit "CRM Software" nicht vorschnell an "CRM" verloren geht.
 */
export function neuerLinkKontext(aktuellerPfad: string, ziele: InternerLink[]): LinkKontext {
  const sortiert: Ziel[] = [...ziele]
    // Sehr kurze Namen (1-2 Zeichen) waeren zu aggressiv und treffen Abkuerzungen im Text.
    .filter((z) => z.begriff.trim().length >= 3)
    .sort((a, b) => b.begriff.length - a.begriff.length)
    .map((z) => ({
      ...z,
      re: new RegExp(`(^|[^\\p{L}])(${maskiere(z.begriff)})(?=$|[^\\p{L}])`, "iu"),
    }));
  return { aktuellerPfad, ziele: sortiert, benutzt: new Set(), uebrig: MAX_PRO_SEITE };
}

/**
 * Verlinkt in einem Stueck Fliesstext die jeweils ersten, noch nicht vergebenen Begriffe.
 * Bekommt fertige ReactNodes (z. B. aus der Fett-Auszeichnung) und ersetzt nur innerhalb
 * der reinen Text-Teile. Bereits ausgezeichnete Knoten (fett) bleiben unberuehrt.
 */
export function verlinke(teile: ReactNode[], ctx: LinkKontext): ReactNode[] {
  if (ctx.uebrig <= 0 || ctx.ziele.length === 0) return teile;
  let aktuell = teile;

  for (const { begriff, url, re } of ctx.ziele) {
    if (ctx.uebrig <= 0) break;
    if (ctx.benutzt.has(begriff)) continue;
    if (url === ctx.aktuellerPfad) continue; // kein Selbstlink

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
      const vor = teil.slice(0, m.index) + m[1]; // Vorzeichen (Leerzeichen/Satzanfang) behalten
      const treffer = m[2];
      const nach = teil.slice(m.index + m[0].length);
      if (vor) naechste.push(vor);
      naechste.push(
        <Link
          key={`il-${begriff}`}
          href={url}
          className="text-primary underline decoration-primary/30 underline-offset-2 hover:decoration-primary"
        >
          {treffer}
        </Link>,
      );
      if (nach) naechste.push(nach);
      ctx.benutzt.add(begriff);
      ctx.uebrig -= 1;
      vergeben = true;
    }
    aktuell = naechste;
  }

  return aktuell;
}
