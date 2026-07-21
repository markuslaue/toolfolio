"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * AD-16: Selbstreferenzierendes Canonical auf JEDER oeffentlichen Seite.
 *
 * Die SEO-Kernseiten (Kategorien, Produkte, Hubs, Verzeichnis-Index) setzen ihr
 * Canonical schon serverseitig ueber die Metadaten. Fuer den langen Rest (Startseite,
 * Marketingseiten, dynamische Routen) waeren das ein Dutzend einzelner Aenderungen.
 * Diese Komponente schliesst die Luecke an einer Stelle: sie ergaenzt ein Canonical
 * auf sich selbst, ABER nur, wenn die Seite nicht ohnehin schon eines hat. So entsteht
 * nie ein doppeltes Canonical, und keine Seite bleibt ohne.
 *
 * Ausgenommen: eingeloggte und redaktionelle Bereiche. Die stehen per robots.txt auf
 * "disallow" und gehoeren nicht in den Index, ein Canonical waere dort sinnlos.
 */
const AUSGENOMMEN = ["/app", "/admin", "/auth", "/anbieter", "/einladung", "/login", "/verzeichnis/vorschau"];

const BASIS = "https://toolfolio.de";

export function SelfCanonical() {
  const pfad = usePathname();

  useEffect(() => {
    if (!pfad || AUSGENOMMEN.some((p) => pfad.startsWith(p))) return;
    // Hat die Seite schon ein serverseitiges Canonical? Dann Finger weg.
    if (document.querySelector('link[rel="canonical"]')) return;

    const link = document.createElement("link");
    link.rel = "canonical";
    link.href = BASIS + (pfad === "/" ? "/" : pfad);
    document.head.appendChild(link);

    return () => {
      link.remove();
    };
  }, [pfad]);

  return null;
}
