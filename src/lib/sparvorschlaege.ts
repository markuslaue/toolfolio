import { monatlich, INTERVALL_LABEL, type Abo } from "@/lib/abos";
import { YEARLY_DISCOUNT } from "@/lib/constants";

export type Typ =
  | "intervall"
  | "marktpreis"
  | "redundanz"
  | "zombie"
  | "alternative"
  | "guthaben"
  | "gutschein"
  | "retention";
export type Status = "offen" | "umgesetzt" | "ignoriert";

export type ToolRef = { name: string; farbe: string };

export interface Vorschlag {
  key: string;
  typ: Typ;
  titel: string;
  ersparnisJahr: number;
  ersparnisMax?: number;
  geschaetzt?: boolean;
  weicherWert?: boolean;
  begruendung: string;
  tools: ToolRef[];
  aktion: string;
  status: Status;
  hausmarke?: boolean;
  code?: string;
  gueltig?: string;
  partner?: boolean;
  einloesenUrl?: string;
  konfidenz?: string;
}

const FARBE_FALLBACK = "#6C5CE7";
function toolRef(a: Abo): ToolRef {
  return { name: a.tool, farbe: a.farbe ?? FARBE_FALLBACK };
}
function eur(n: number) {
  return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(n);
}

/**
 * Ehrliche Sparvorschlaege aus den EIGENEN Abodaten (keine Scheingenauigkeit):
 * - intervall: monatlich/quartalsweise -> jaehrlich (geschaetzt mit Jahresrabatt)
 * - redundanz: mehrere aktive Tools in derselben Kategorie
 * - zombie: pausierte Abos, die weiter kosten
 * Marktpreis/Gutschein/Retention etc. folgen, sobald Benchmark-/Partnerdaten existieren.
 */
export function berechneVorschlaege(abos: Abo[]): Vorschlag[] {
  const out: Vorschlag[] = [];
  const aktiv = abos.filter((a) => a.status === "aktiv" || a.status === "Trial");

  // 1) Intervall: Wechsel auf jaehrlich
  for (const a of aktiv) {
    if (a.intervall === "jaehrlich") continue;
    const mtl = monatlich(a.kosten, a.intervall);
    const ersparnis = Math.round(mtl * 12 * YEARLY_DISCOUNT * 100) / 100;
    if (ersparnis < 1) continue;
    out.push({
      key: `intervall:${a.id}`,
      typ: "intervall",
      titel: `${a.tool} jährlich statt ${INTERVALL_LABEL[a.intervall]}`,
      ersparnisJahr: ersparnis,
      geschaetzt: true,
      begruendung: `Stell ${a.tool} auf jährliche Zahlung um. Erfahrungsgemäß sparst du rund ${Math.round(YEARLY_DISCOUNT * 100)} %, etwa ${eur(ersparnis)} pro Jahr.`,
      tools: [toolRef(a)],
      aktion: "Auf jährlich umstellen",
      status: "offen",
    });
  }

  // 2) Redundanz: mehrere aktive Tools je Kategorie
  const proKat = new Map<string, Abo[]>();
  for (const a of aktiv) {
    const list = proKat.get(a.kategorie) ?? [];
    list.push(a);
    proKat.set(a.kategorie, list);
  }
  for (const [kategorie, list] of proKat) {
    if (list.length < 2) continue;
    const sortiert = [...list].sort((x, y) => monatlich(x.kosten, x.intervall) - monatlich(y.kosten, y.intervall));
    const guenstigste = sortiert[0];
    const ersparnis = Math.round(monatlich(guenstigste.kosten, guenstigste.intervall) * 12 * 100) / 100;
    if (ersparnis < 1) continue;
    out.push({
      key: `redundanz:${kategorie}`,
      typ: "redundanz",
      titel: `${list.length} Tools in „${kategorie}“`,
      ersparnisJahr: ersparnis,
      geschaetzt: true,
      begruendung: `Du zahlst für ${list.length} Tools in der Kategorie „${kategorie}“. Prüfe, ob eins davon die anderen ersetzen kann, du könntest bis zu ${eur(ersparnis)} pro Jahr sparen.`,
      tools: list.map(toolRef),
      aktion: "Redundanz prüfen",
      status: "offen",
    });
  }

  // 3) Zombie: pausierte Abos, die weiterlaufen
  for (const a of abos.filter((x) => x.status === "pausiert")) {
    const ersparnis = Math.round(monatlich(a.kosten, a.intervall) * 12 * 100) / 100;
    if (ersparnis < 1) continue;
    out.push({
      key: `zombie:${a.id}`,
      typ: "zombie",
      titel: `${a.tool} läuft pausiert weiter`,
      ersparnisJahr: ersparnis,
      begruendung: `${a.tool} ist als pausiert markiert, kostet dich aber weiter. Wenn du es nicht mehr brauchst, kündige es und spar ${eur(ersparnis)} pro Jahr.`,
      tools: [toolRef(a)],
      aktion: "Kündigung prüfen",
      status: "offen",
    });
  }

  return out;
}
