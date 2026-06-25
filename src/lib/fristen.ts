/** B-12: Fristen werden aus Abos und Zahlungskanaelen abgeleitet. */

import { formatEur } from "@/lib/constants";
import { monatlich, INTERVALL_LABEL, type Abo, type Intervall } from "@/lib/abos";
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
    if (a.letzter_kuendigungstermin) {
      out.push({
        key: `${a.id}:kuendigung:${a.letzter_kuendigungstermin}`,
        quelle: "abo",
        quelle_id: a.id,
        art: "kuendigung",
        datum: a.letzter_kuendigungstermin,
        titel: a.tool,
        konsequenz: a.auto_verlaengerung
          ? `Kündbar bis hier, sonst automatische Verlängerung (${mtl} pro Monat).`
          : `Letzter Kündigungstermin (${mtl} pro Monat).`,
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
