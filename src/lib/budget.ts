import { monatlich, type Abo } from "@/lib/abos";
import type { AiSpendRow } from "@/lib/ai-credits";

const MONATE_KURZ = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];

export type MonatDaten = {
  jahr: number;
  monat: number;
  label: string;
  ist: boolean;
  fix: number;
  variabel: number;
  kategorien: Record<string, number>;
};

export type BudgetDaten = {
  fixMonat: number;
  varProjektion: number;
  kategorienFix: Record<string, number>;
  monate: MonatDaten[]; // 12 Monate (5 zurueck, aktuell, 6 voraus)
  forecastJahr: number; // naechste 12 Monate vorwaerts
};

/** 12-Monats-Fenster: 5 zurueck bis 6 voraus, aktueller Monat eingeschlossen. */
function fenster(heute: Date): { jahr: number; monat: number; ist: boolean }[] {
  const out: { jahr: number; monat: number; ist: boolean }[] = [];
  const cy = heute.getFullYear();
  const cm = heute.getMonth() + 1;
  for (let off = -5; off <= 6; off++) {
    let m = cm + off;
    let j = cy;
    while (m <= 0) { m += 12; j -= 1; }
    while (m > 12) { m -= 12; j += 1; }
    out.push({ jahr: j, monat: m, ist: off <= 0 });
  }
  return out;
}

export function berechneBudget(abos: Abo[], spend: AiSpendRow[], heute = new Date()): BudgetDaten {
  const aktiv = abos.filter((a) => a.status === "aktiv" || a.status === "Trial");

  // Fixe Monatskosten je Kategorie (wiederkehrend, normalisiert).
  const kategorienFix: Record<string, number> = {};
  let fixMonat = 0;
  for (const a of aktiv) {
    const m = monatlich(a.kosten, a.intervall);
    fixMonat += m;
    kategorienFix[a.kategorie] = (kategorienFix[a.kategorie] ?? 0) + m;
  }
  fixMonat = Math.round(fixMonat * 100) / 100;

  // Variable AI-Kosten: Istwerte je Monat + Projektion (Schnitt der letzten Monate mit Wert).
  const aiByMonth = new Map<string, number>();
  for (const r of spend) aiByMonth.set(`${r.jahr}-${r.monat}`, (aiByMonth.get(`${r.jahr}-${r.monat}`) ?? 0) + Number(r.betrag));
  const werte = [...aiByMonth.values()].filter((v) => v > 0);
  const varProjektion = werte.length ? Math.round((werte.reduce((a, b) => a + b, 0) / werte.length) * 100) / 100 : 0;

  const monate: MonatDaten[] = fenster(heute).map((f) => {
    const aiIst = aiByMonth.get(`${f.jahr}-${f.monat}`) ?? 0;
    const variabel = f.ist ? aiIst : varProjektion;
    const kategorien: Record<string, number> = { ...kategorienFix };
    if (variabel > 0) kategorien["AI"] = (kategorien["AI"] ?? 0) + variabel;
    return { jahr: f.jahr, monat: f.monat, label: MONATE_KURZ[f.monat - 1], ist: f.ist, fix: fixMonat, variabel: Math.round(variabel * 100) / 100, kategorien };
  });

  const forecastJahr = Math.round((fixMonat + varProjektion) * 12 * 100) / 100;
  return { fixMonat, varProjektion, kategorienFix, monate, forecastJahr };
}
