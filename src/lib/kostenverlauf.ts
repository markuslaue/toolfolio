/**
 * Echter 12-Monats-Rueckblick fuer das Dashboard.
 *
 * Ehrlichkeit der Daten (CLAUDE.md, Leitplanke 5): wir erfinden keine Historie.
 * - fix: aus den laufenden Abos rekonstruiert. Ein Abo zaehlt ab seinem Startdatum
 *   (`abo_seit`) in jeden Monat hinein, davor nicht. Ohne Startdatum zaehlt es ueber
 *   das ganze Fenster (wir wissen es nicht besser).
 * - variabel: echte Istwerte aus `ai_spend`.
 *
 * Bewusste Untergrenze: gekuendigte/archivierte Abos fliessen nicht ein, weil ihr
 * Endzeitpunkt nirgends erfasst ist. Die Fixkurve zeigt also, was von den HEUTE
 * laufenden Abos damals schon lief. Das UI weist darauf hin.
 */

import { monatlich, type Abo } from "@/lib/abos";
import type { AiSpendRow } from "@/lib/ai-credits";

const MONATE_KURZ = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];

export type VerlaufPunkt = {
  jahr: number;
  monat: number;
  label: string;
  fix: number;
  variabel: number;
  /** Fixkosten aufgeteilt nach Kategorie. */
  kategorien: Record<string, number>;
  /** Fixkosten aufgeteilt nach Zahlungskanal (unzugeordnet = "Ohne Kanal"). */
  kanaele: Record<string, number>;
};

const OHNE_KANAL = "Ohne Kanal";

/** Letzter Tag eines Monats als ISO-Datum. */
function monatsEnde(jahr: number, monat: number): string {
  const d = new Date(Date.UTC(jahr, monat, 0));
  return d.toISOString().slice(0, 10);
}

/** Die letzten 12 (jahr, monat)-Schluessel bis einschliesslich heute. */
function letzte12(heute: Date): { jahr: number; monat: number }[] {
  const out: { jahr: number; monat: number }[] = [];
  let j = heute.getFullYear();
  let m = heute.getMonth() + 1;
  for (let i = 0; i < 12; i++) {
    out.unshift({ jahr: j, monat: m });
    m -= 1;
    if (m === 0) {
      m = 12;
      j -= 1;
    }
  }
  return out;
}

function runde(n: number): number {
  return Math.round(n * 100) / 100;
}

export function berechneVerlauf(abos: Abo[], spend: AiSpendRow[], heute = new Date()): VerlaufPunkt[] {
  const lebend = abos.filter((a) => a.status !== "archiviert" && a.status !== "gekuendigt");

  const aiProMonat = new Map<string, number>();
  for (const r of spend) {
    const key = `${r.jahr}-${r.monat}`;
    aiProMonat.set(key, (aiProMonat.get(key) ?? 0) + Number(r.betrag));
  }

  return letzte12(heute).map(({ jahr, monat }) => {
    const stichtag = monatsEnde(jahr, monat);
    const kategorien: Record<string, number> = {};
    const kanaele: Record<string, number> = {};
    let fix = 0;

    for (const a of lebend) {
      // Abo lief in diesem Monat noch nicht -> zaehlt nicht.
      if (a.abo_seit && a.abo_seit > stichtag) continue;
      const m = monatlich(a.kosten, a.intervall);
      fix += m;
      kategorien[a.kategorie] = (kategorien[a.kategorie] ?? 0) + m;
      const kanal = a.zahlungskanal || OHNE_KANAL;
      kanaele[kanal] = (kanaele[kanal] ?? 0) + m;
    }

    for (const k of Object.keys(kategorien)) kategorien[k] = runde(kategorien[k]);
    for (const k of Object.keys(kanaele)) kanaele[k] = runde(kanaele[k]);

    return {
      jahr,
      monat,
      label: MONATE_KURZ[monat - 1],
      fix: runde(fix),
      variabel: runde(aiProMonat.get(`${jahr}-${monat}`) ?? 0),
      kategorien,
      kanaele,
    };
  });
}

/** Veraenderung des Gesamtwerts vom Vormonat zum aktuellen Monat, in Prozent. */
export function vormonatProzent(verlauf: VerlaufPunkt[]): number | null {
  if (verlauf.length < 2) return null;
  const jetzt = verlauf[verlauf.length - 1];
  const vor = verlauf[verlauf.length - 2];
  const summeVor = vor.fix + vor.variabel;
  if (summeVor <= 0) return null;
  const summeJetzt = jetzt.fix + jetzt.variabel;
  return Math.round(((summeJetzt - summeVor) / summeVor) * 1000) / 10;
}
