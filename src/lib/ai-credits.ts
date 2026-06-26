export type AiService = { id: string; name: string; farbe: string; budget_monat: number | null };
export type AiSpendRow = { service_id: string; jahr: number; monat: number; betrag: number };

export type MonatPunkt = { jahr: number; monat: number; label: string; betrag: number };

export interface ServiceDaten {
  id: string;
  name: string;
  initials: string;
  color: string;
  budget: number | null;
  reihe: MonatPunkt[]; // letzte 12 Monate inkl. aktuell
  monat: number; // aktueller Monat
  vormonat: number;
  trendPct: number;
  schnitt: number; // Schnitt der Vormonate mit Wert
  spikeFaktor: number | null; // >= 1.5x Schnitt
  budgetPct: number | null;
}

const MONATE_KURZ = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];

export function initials(name: string): string {
  const teile = name.trim().split(/\s+/).filter(Boolean);
  return ((teile[0]?.[0] ?? "") + (teile.length > 1 ? teile[1][0] : "")).toUpperCase() || "?";
}

/** Die letzten 12 (jahr, monat)-Schluessel bis einschliesslich heute. */
function letzte12(heute: Date): { jahr: number; monat: number }[] {
  const out: { jahr: number; monat: number }[] = [];
  let j = heute.getFullYear();
  let m = heute.getMonth() + 1;
  for (let i = 0; i < 12; i++) {
    out.unshift({ jahr: j, monat: m });
    m -= 1;
    if (m === 0) { m = 12; j -= 1; }
  }
  return out;
}

export function berechneAiCredits(services: AiService[], spend: AiSpendRow[], heute = new Date()): { daten: ServiceDaten[]; gesamtMonat: number; gesamtVormonat: number } {
  const fenster = letzte12(heute);
  const byService = new Map<string, Map<string, number>>();
  for (const s of spend) {
    const key = `${s.jahr}-${s.monat}`;
    const m = byService.get(s.service_id) ?? new Map<string, number>();
    m.set(key, (m.get(key) ?? 0) + Number(s.betrag));
    byService.set(s.service_id, m);
  }

  const daten: ServiceDaten[] = services.map((s) => {
    const m = byService.get(s.id) ?? new Map<string, number>();
    const reihe: MonatPunkt[] = fenster.map((f) => ({
      jahr: f.jahr,
      monat: f.monat,
      label: MONATE_KURZ[f.monat - 1],
      betrag: m.get(`${f.jahr}-${f.monat}`) ?? 0,
    }));
    const monat = reihe[reihe.length - 1].betrag;
    const vormonat = reihe[reihe.length - 2]?.betrag ?? 0;
    const trendPct = vormonat > 0 ? Math.round(((monat - vormonat) / vormonat) * 100) : 0;
    const vorWerte = reihe.slice(0, -1).map((p) => p.betrag).filter((b) => b > 0);
    const schnitt = vorWerte.length ? Math.round((vorWerte.reduce((a, b) => a + b, 0) / vorWerte.length) * 100) / 100 : 0;
    const spikeFaktor = schnitt > 0 && monat >= schnitt * 1.5 ? Math.round((monat / schnitt) * 10) / 10 : null;
    const budgetPct = s.budget_monat && s.budget_monat > 0 ? Math.min(100, Math.round((monat / s.budget_monat) * 100)) : null;
    return {
      id: s.id, name: s.name, initials: initials(s.name), color: s.farbe, budget: s.budget_monat,
      reihe, monat, vormonat, trendPct, schnitt, spikeFaktor, budgetPct,
    };
  });

  const gesamtMonat = daten.reduce((a, d) => a + d.monat, 0);
  const gesamtVormonat = daten.reduce((a, d) => a + d.vormonat, 0);
  return { daten, gesamtMonat, gesamtVormonat };
}
