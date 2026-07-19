/**
 * AD-13: Ausgehende Links auf Anbieter.
 *
 * BEWUSST OHNE "server-only": ausgangsLink() ist reine Zeichenkettenarbeit und wird
 * auch in Komponenten gebraucht, die im Client landen koennen. Was wirklich nur auf
 * den Server gehoert (Datenbank, User-Agent), steht in der Route, nicht hier.
 *
 * Jeder Klick laeuft ueber /go/<slug>, statt direkt zum Anbieter zu gehen. Das hat
 * genau zwei Gruende:
 *
 *   1. Zaehlen. Ohne Zwischenschritt wissen wir nicht, wie viel Reichweite wir
 *      liefern, und koennen es einem Anbieter auch nicht belegen.
 *   2. UTM anhaengen. Der Anbieter soll in SEINEM Analysewerkzeug sehen, dass der
 *      Besucher von uns kam. Ohne UTM taucht Toolfolio dort nur als "Referral"
 *      unter vielen auf, und niemand rechnet uns die Reichweite zu.
 *
 * WICHTIG ZUR REIHENFOLGE: Der Klick wird gezaehlt und DANN weitergeleitet, aber das
 * Zaehlen darf die Weiterleitung niemals aufhalten oder verhindern. Ein Besucher, der
 * wegen unserer Statistik ins Leere laeuft, ist ein verlorener Lead. Deshalb ist das
 * Schreiben in die Datenbank fehlertolerant, die Weiterleitung nicht.
 */

/** Feste Kennung in allen ausgehenden Links. */
export const UTM_SOURCE = "toolfolio";

/**
 * UTM an eine Zieladresse haengen.
 *
 * VORHANDENE PARAMETER WERDEN NICHT UEBERSCHRIEBEN. Affiliate-Links tragen oft schon
 * eigene Nachverfolgung in der Adresse, und wer die ueberschreibt, zerstoert die
 * Zuordnung der Provision. Genau daran haengt bei uns Geld.
 */
export function mitUtm(ziel: string, opts: { kampagne?: string | null; medium?: string }): string | null {
  try {
    const u = new URL(ziel);
    if (u.protocol !== "https:" && u.protocol !== "http:") return null;

    const setze = (name: string, wert: string) => {
      if (!u.searchParams.has(name)) u.searchParams.set(name, wert);
    };

    setze("utm_source", UTM_SOURCE);
    setze("utm_medium", opts.medium ?? "verzeichnis");
    if (opts.kampagne) setze("utm_campaign", opts.kampagne);

    return u.toString();
  } catch {
    // Kaputte Zieladresse. Lieber gar kein Link als ein Link ins Nichts.
    return null;
  }
}

/**
 * Der Weg nach draussen, wie er im Markup steht.
 *
 * `von` ist der Slug der Kategorieseite, von der aus geklickt wurde. Er kommt aus dem
 * Server, nicht aus dem Browser: der Referrer waere manipulierbar und bei manchen
 * Browsereinstellungen gar nicht da.
 */
export function ausgangsLink(produktSlug: string, von?: string | null, zone?: string | null): string {
  const p = new URLSearchParams();
  if (von) p.set("von", von);
  if (zone) p.set("zone", zone);
  const q = p.toString();
  return `/go/${produktSlug}${q ? `?${q}` : ""}`;
}

/**
 * Geraeteklasse aus dem User-Agent, und zwar NUR die Klasse.
 *
 * Der User-Agent selbst wird nicht gespeichert. Er ist zusammen mit Zeitstempel und
 * Seite ein brauchbarer Fingerabdruck, und dann waere der Datenbestand
 * personenbezogen. Uebrig bleibt "mobil" oder "desktop", und daraus laesst sich
 * niemand wiedererkennen.
 */
export function geraeteKlasse(userAgent: string | null): "mobil" | "desktop" {
  if (!userAgent) return "desktop";
  return /Mobi|Android|iPhone|iPad|iPod/i.test(userAgent) ? "mobil" : "desktop";
}
