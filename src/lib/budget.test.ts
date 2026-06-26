import { describe, it, expect } from "vitest";
import { berechneBudget } from "./budget";
import type { Abo } from "./abos";
import type { AiSpendRow } from "./ai-credits";

const heute = new Date("2026-06-15T12:00:00Z");
function abo(p: Partial<Abo> & { id: string; tool: string; kategorie: string; kosten: number }): Abo {
  return {
    anbieter: null, initial: null, farbe: null, mit_verzeichnis: false, waehrung: "EUR", intervall: "monatlich",
    naechste_abbuchung: null, zahlungskanal: null, kunde: null, status: "aktiv", tags: [], weiterverrechnen: false,
    aufschlag_prozent: null, abo_seit: null, auto_verlaengerung: true, frist_wert: null, frist_einheit: null,
    letzter_kuendigungstermin: null, erinnerung: false, trial_endet: null, notizen: null, konto_email: null, login_verweis: null,
    ...p,
  };
}

describe("berechneBudget", () => {
  it("rechnet fixe Monatskosten, AI-Projektion und 12-Monats-Forecast", () => {
    const abos = [
      abo({ id: "1", tool: "Figma", kategorie: "Design", kosten: 100 }),
      abo({ id: "2", tool: "Slack", kategorie: "Kommunikation", kosten: 50 }),
    ];
    const spend: AiSpendRow[] = [
      { service_id: "s", jahr: 2026, monat: 4, betrag: 40 },
      { service_id: "s", jahr: 2026, monat: 5, betrag: 60 },
    ];
    const r = berechneBudget(abos, spend, heute);
    expect(r.fixMonat).toBe(150);
    expect(r.varProjektion).toBe(50); // (40+60)/2
    expect(r.forecastJahr).toBe((150 + 50) * 12);
    expect(r.monate).toHaveLength(12);
    expect(r.kategorienFix).toEqual({ Design: 100, Kommunikation: 50 });
    // aktueller Monat (Offset 0) ist Ist
    expect(r.monate[5].ist).toBe(true);
    expect(r.monate[6].ist).toBe(false);
  });
});
