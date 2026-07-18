import "server-only";
import type Anthropic from "@anthropic-ai/sdk";

/**
 * AD-10: Ein Weg fuer JEDEN KI-Aufruf der Verzeichnis-Pipeline.
 *
 * Er tut zwei Dinge, die vorher niemand tat:
 *
 * 1. WIEDERHOLEN. Bisher war jeder Aufruf ein einziger Versuch. Ein Rate-Limit von
 *    Anthropic, ein "overloaded" oder ein kurzer Netzhaenger hat den KOMPLETTEN Lauf
 *    beendet, nach Minuten Arbeit und mit halben Ergebnissen in der Datenbank. Bei
 *    einem Menschen am Knopf ist das aergerlich. Bei einem Cron um drei Uhr nachts,
 *    der zehn Kategorien bauen soll, ist es das Ende des Laufs.
 *
 * 2. MESSEN. Jede Antwort von Anthropic enthaelt, wie viele Token sie gekostet hat.
 *    Das nicht mitzuschreiben heisst, ueber die Kosten zu raten. Und ueber Kosten zu
 *    raten ist genau dann teuer, wenn man vorhat, den Vorgang taeglich zehnmal zu
 *    wiederholen.
 *
 * ---------------------------------------------------------------------------
 * WICHTIG ZUR UNTERSCHEIDUNG VON TATSACHE UND ANNAHME:
 * Die Token-ZAHLEN sind Tatsachen, sie kommen von Anthropic. Der daraus errechnete
 * EURO-Betrag ist eine Annahme, naemlich die Preistabelle unten. Aendert Anthropic
 * die Preise, stimmt die Zahl still nicht mehr. Deshalb werden IMMER auch die rohen
 * Token gespeichert: aus ihnen laesst sich jederzeit neu rechnen, aus einem Eurobetrag
 * nicht.
 * ---------------------------------------------------------------------------
 */

/** Fuer Urteilsarbeit: der eigentliche Ratgebertext, der Fragensatz des Finders. */
export const MODELL_GROSS = "claude-opus-4-8";

/**
 * Fuer Fleissarbeit: "ist diese Domain ueberhaupt eine Software?", Datenblaetter aus
 * einer bereits geladenen Seite, Einsortieren nach vorgegebenen Merkmalen. Das sind
 * Aufgaben mit klarer Vorgabe und knapper Antwort. Sie mit dem groessten Modell zu
 * erledigen kostet ein Vielfaches, ohne dass am sichtbaren Ergebnis etwas besser wird.
 */
export const MODELL_KLEIN = "claude-haiku-4-5-20251001";

/**
 * Preise in US-Dollar je 1 Million Token. ANNAHME, gegen die Preisliste zu pruefen.
 * Steht ein Modell hier nicht drin, wird nichts gerechnet, aber weiter gemessen:
 * lieber keine Kostenzahl als eine falsche.
 */
const PREIS_JE_MIO: Record<string, { ein: number; aus: number }> = {
  "claude-opus-4-8": { ein: 15, aus: 75 },
  "claude-haiku-4-5-20251001": { ein: 1, aus: 5 },
};

export type Posten = {
  zweck: string;
  modell: string;
  aufrufe: number;
  ein: number;
  aus: number;
  versuche: number;   // inkl. Wiederholungen, zeigt wie ruhig es lief
};

/** Sammelt den Verbrauch eines Laufs. Eine Instanz je Lauf. */
export class Verbrauch {
  private posten = new Map<string, Posten>();

  buche(zweck: string, modell: string, ein: number, aus: number, versuche: number) {
    const schluessel = `${zweck}|${modell}`;
    const p = this.posten.get(schluessel) ?? { zweck, modell, aufrufe: 0, ein: 0, aus: 0, versuche: 0 };
    p.aufrufe += 1;
    p.ein += ein;
    p.aus += aus;
    p.versuche += versuche;
    this.posten.set(schluessel, p);
  }

  liste(): Posten[] {
    return [...this.posten.values()].sort((a, b) => b.ein + b.aus - (a.ein + a.aus));
  }

  summe() {
    let ein = 0, aus = 0, aufrufe = 0, versuche = 0;
    for (const p of this.posten.values()) {
      ein += p.ein; aus += p.aus; aufrufe += p.aufrufe; versuche += p.versuche;
    }
    return { ein, aus, aufrufe, versuche };
  }

  /** US-Dollar, oder null wenn fuer ein benutztes Modell kein Preis hinterlegt ist. */
  kostenUsd(): number | null {
    let summe = 0;
    for (const p of this.posten.values()) {
      const preis = PREIS_JE_MIO[p.modell];
      if (!preis) return null;
      summe += (p.ein / 1_000_000) * preis.ein + (p.aus / 1_000_000) * preis.aus;
    }
    return Math.round(summe * 10_000) / 10_000;
  }

  /** Eine Zeile fuers Protokoll, damit man im Backend sieht, was der Lauf gekostet hat. */
  zeile(): string {
    const s = this.summe();
    const usd = this.kostenUsd();
    const teile = [
      `${s.aufrufe} KI-Aufrufe`,
      `${(s.ein / 1000).toFixed(0)}k ein`,
      `${(s.aus / 1000).toFixed(0)}k aus`,
    ];
    if (s.versuche > s.aufrufe) teile.push(`${s.versuche - s.aufrufe} Wiederholungen`);
    if (usd !== null) teile.push(`etwa ${usd.toFixed(2)} USD`);
    return teile.join(", ");
  }
}

/**
 * Wann sich ein erneuter Versuch lohnt.
 *
 * Bei 429 (zu viele Anfragen), 529 (ueberlastet) und 5xx ist der Fehler voruebergehend,
 * da hilft Warten. Bei 400/401/403 ist etwas an UNSERER Anfrage oder am Schluessel
 * falsch, da hilft Warten nie: dreimal denselben kaputten Aufruf zu schicken kostet nur
 * Zeit und verschleiert die Ursache.
 */
function lohntWiederholung(fehler: unknown): boolean {
  const f = fehler as { status?: number; message?: string };
  if (typeof f?.status === "number") {
    if (f.status === 429 || f.status === 529) return true;
    if (f.status >= 500) return true;
    return false;
  }
  // Kein Status: Netzfehler, Zeitueberschreitung, abgebrochene Verbindung.
  const t = String(f?.message ?? "").toLowerCase();
  return /timeout|econnreset|socket|network|fetch failed|aborted|overloaded/.test(t);
}

/** Wartezeiten. Bewusst grosszuegig: ein Rate-Limit ist nach 2 Sekunden noch da. */
const WARTEN_MS = [5_000, 15_000, 45_000];

function schlaf(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export type KiAufruf = {
  ki: Anthropic;
  modell: string;
  maxTokens: number;
  system?: string;
  /** Unveraendert die Form des SDK, damit bestehende Prompt-Bloecke nicht angefasst werden muessen. */
  messages: Anthropic.MessageParam[];
  /** Kurzer Name fuer die Abrechnung, z. B. "discovery" oder "content". */
  zweck: string;
  verbrauch?: Verbrauch;
  /** Wird bei jeder Wiederholung gerufen, damit der Nutzer im Backend sieht, dass gewartet wird. */
  melde?: (text: string) => Promise<void> | void;
};

/**
 * Ein KI-Aufruf mit Wiederholung und Messung. Gibt den Text der Antwort zurueck.
 *
 * Wirft erst, wenn alle Versuche verbraucht sind oder der Fehler dauerhaft ist. Der
 * Aufrufer sieht also entweder ein Ergebnis oder einen echten, endgueltigen Fehler,
 * und muss sich um voruebergehende Stoerungen nicht kuemmern.
 */
export async function frageKi(o: KiAufruf): Promise<string> {
  let versuche = 0;
  let letzterFehler: unknown;

  for (let i = 0; i <= WARTEN_MS.length; i++) {
    versuche++;
    try {
      const antwort = await o.ki.messages.create({
        model: o.modell,
        max_tokens: o.maxTokens,
        ...(o.system ? { system: o.system } : {}),
        messages: o.messages,
      });

      o.verbrauch?.buche(
        o.zweck,
        o.modell,
        antwort.usage?.input_tokens ?? 0,
        antwort.usage?.output_tokens ?? 0,
        versuche,
      );

      const teil = antwort.content.find((c) => c.type === "text");
      return teil && teil.type === "text" ? teil.text : "";
    } catch (fehler) {
      letzterFehler = fehler;
      if (!lohntWiederholung(fehler) || i === WARTEN_MS.length) break;

      const wartezeit = WARTEN_MS[i];
      const grund = (fehler as { status?: number })?.status ?? "Netzfehler";
      await o.melde?.(
        `KI antwortet gerade nicht (${grund}). Warte ${wartezeit / 1000} Sekunden und versuche es erneut (${i + 1} von ${WARTEN_MS.length}).`,
      );
      await schlaf(wartezeit);
    }
  }

  throw letzterFehler;
}
