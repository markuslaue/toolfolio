/**
 * Status-Konstanten des Verzeichnis-CMS.
 *
 * Bewusst eine eigene Datei OHNE `server-only`: die Kuratierungs-Oberflaeche ist
 * eine Client-Komponente und braucht die Labels. Die Wachen (Rollenpruefung,
 * Service-Role) liegen in redaktion.ts und bleiben serverseitig.
 */
export const PRODUKT_STATUS = ["entwurf", "ki_ungeprueft", "redaktionell_geprueft", "veroeffentlicht"] as const;
export type ProduktStatus = (typeof PRODUKT_STATUS)[number];

export const PRODUKT_STATUS_LABEL: Record<ProduktStatus, string> = {
  entwurf: "Entwurf",
  ki_ungeprueft: "KI, ungeprüft",
  redaktionell_geprueft: "Geprüft",
  veroeffentlicht: "Veröffentlicht",
};

export const PRODUKT_STATUS_STIL: Record<ProduktStatus, string> = {
  entwurf: "bg-muted text-muted-foreground",
  ki_ungeprueft: "bg-warning/15 text-warning",
  redaktionell_geprueft: "bg-primary/10 text-primary",
  veroeffentlicht: "bg-success/10 text-success",
};
