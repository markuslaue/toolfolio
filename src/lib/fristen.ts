/** B-12: Fristen werden aus Abos und Zahlungskanaelen abgeleitet. */

import { formatEur } from "@/lib/constants";
import { monatlich, INTERVALL_LABEL, type Abo, type Intervall, type FristEinheit } from "@/lib/abos";
import { kanalLabel, type Zahlungskanal } from "@/lib/zahlungskanaele";

export type FristArt = "trial" | "kuendigung" | "karte";
export type Dringlichkeit = "ueberfaellig" | "sehrbald" | "bald" | "weiter";

export interface Frist {
  key: string;
  quelle: "abo" | "kanal";
  quelle_id: string;
  art: FristArt;
  datum: string; // YYYY-MM-DD
  titel: string;
  konsequenz: string;
}

export const ART_LABEL: Record<FristArt, string> = {
  trial: "Trial-Ende",
  kuendigung: "Kündigungsfrist",
  karte: "Karte läuft ab",
};

export function tageBis(iso: string, heute = new Date()): number {
  const a = new Date(iso);
  a.setHours(0, 0, 0, 0);
  const h = new Date(heute);
  h.setHours(0, 0, 0, 0);
  return Math.round((a.getTime() - h.getTime()) / 86_400_000);
}

export function dringlichkeit(iso: string, heute = new Date()): Dringlichkeit {
  const d = tageBis(iso, heute);
  if (d < 0) return "ueberfaellig";
  if (d <= 7) return "sehrbald";
  if (d <= 30) return "bald";
  return "weiter";
}

export const DRINGLICHKEIT_LABEL: Record<Dringlichkeit, string> = {
  ueberfaellig: "Überfällig",
  sehrbald: "Nächste 7 Tage",
  bald: "Nächste 30 Tage",
  weiter: "Später",
};

/** YYYY-MM-DD -> DD.MM.YYYY */
function deutsch(iso: string): string {
  const [y, m, d] = iso.split("-");
  return d ? `${d}.${m}.${y}` : iso;
}

function isoVon(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const tag = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${tag}`;
}

/**
 * Zieht eine Kuendigungsfrist von einem Datum ab. Bei Monaten wird auf den
 * letzten gueltigen Tag des Zielmonats geklemmt (31.03. minus 1 Monat -> 28./29.02.).
 */
export function minusFrist(iso: string, wert: number, einheit: FristEinheit): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  if (einheit === "Monate") {
    const zielTag = d.getDate();
    d.setDate(1);
    d.setMonth(d.getMonth() - wert);
    const letzterTag = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
    d.setDate(Math.min(zielTag, letzterTag));
  } else {
    const tage = einheit === "Wochen" ? wert * 7 : wert;
    d.setDate(d.getDate() - tage);
  }
  return isoVon(d);
}

/**
 * B-32: Der Termin, bis zu dem gekuendigt werden muss.
 * Vorrang hat ein explizit gepflegter Stichtag. Sonst wird er aus der
 * Kuendigungsfrist (Vorlauf) und dem Verlaengerungstermin (= naechste
 * Abbuchung) berechnet. Ohne Verlaengerungstermin gibt es keine Deadline
 * (Ehrlichkeit der Daten, keine Scheingenauigkeit).
 */
export function kuendigungsDeadline(a: Abo): string | null {
  if (a.letzter_kuendigungstermin) return a.letzter_kuendigungstermin;
  if (a.frist_wert == null || !a.frist_einheit) return null;
  if (!a.naechste_abbuchung) return null;
  return minusFrist(a.naechste_abbuchung, a.frist_wert, a.frist_einheit);
}

/** Letzter gueltiger Tag des Ablaufmonats einer Karte als ISO-Datum. */
function kartenDatum(jahr: number, monat: number): string {
  const d = new Date(jahr, monat, 0); // Tag 0 des Folgemonats = letzter Tag
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const tag = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${tag}`;
}

export function deriveFristen(abos: Abo[], kanaele: Zahlungskanal[]): Frist[] {
  const out: Frist[] = [];

  for (const a of abos) {
    if (a.status === "archiviert" || a.status === "gekuendigt") continue;
    const mtl = formatEur(monatlich(a.kosten, a.intervall));
    const proIntervall = `${formatEur(a.kosten)} / ${INTERVALL_LABEL[a.intervall as Intervall] ?? a.intervall}`;

    if (a.trial_endet) {
      out.push({
        key: `${a.id}:trial:${a.trial_endet}`,
        quelle: "abo",
        quelle_id: a.id,
        art: "trial",
        datum: a.trial_endet,
        titel: a.tool,
        konsequenz: `Trial endet, danach kostenpflichtig (${proIntervall}, ${mtl} pro Monat).`,
      });
    }
    // B-32: Deadline entweder explizit (Stichtag) oder aus Kuendigungsfrist +
    // Verlaengerungstermin (naechste Abbuchung) berechnet.
    const deadline = kuendigungsDeadline(a);
    if (deadline) {
      const verlaengerung = a.naechste_abbuchung && !a.letzter_kuendigungstermin ? deutsch(a.naechste_abbuchung) : null;
      const konsequenz = a.auto_verlaengerung
        ? verlaengerung
          ? `Verlängert sich am ${verlaengerung} automatisch (${proIntervall}, ${mtl} pro Monat). Bis hier kündbar.`
          : `Kündbar bis hier, sonst automatische Verlängerung (${mtl} pro Monat).`
        : verlaengerung
          ? `Nächste Periode ab ${verlaengerung} (${proIntervall}, ${mtl} pro Monat). Letzter Kündigungstermin.`
          : `Letzter Kündigungstermin (${mtl} pro Monat).`;
      out.push({
        key: `${a.id}:kuendigung:${deadline}`,
        quelle: "abo",
        quelle_id: a.id,
        art: "kuendigung",
        datum: deadline,
        titel: a.tool,
        konsequenz,
      });
    }
  }

  for (const k of kanaele) {
    if (!k.aktiv) continue;
    if (k.typ === "kreditkarte" && k.ablauf_monat && k.ablauf_jahr) {
      const datum = kartenDatum(k.ablauf_jahr, k.ablauf_monat);
      out.push({
        key: `${k.id}:karte:${datum}`,
        quelle: "kanal",
        quelle_id: k.id,
        art: "karte",
        datum,
        titel: kanalLabel(k),
        konsequenz: "Zahlungsmittel läuft ab, Abbuchungen könnten fehlschlagen.",
      });
    }
  }

  return out.sort((x, y) => (x.datum < y.datum ? -1 : x.datum > y.datum ? 1 : 0));
}
