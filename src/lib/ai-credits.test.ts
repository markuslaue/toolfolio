import { describe, it, expect } from "vitest";
import { berechneAiCredits, type AiService, type AiSpendRow } from "./ai-credits";

const heute = new Date("2026-06-15T12:00:00Z");
const svc: AiService = { id: "s1", name: "OpenAI", farbe: "#000", budget_monat: 500 };

describe("berechneAiCredits", () => {
  it("berechnet aktuellen Monat, Trend, Schnitt, Spike und Budget", () => {
    const spend: AiSpendRow[] = [
      { service_id: "s1", jahr: 2026, monat: 1, betrag: 100 },
      { service_id: "s1", jahr: 2026, monat: 2, betrag: 100 },
      { service_id: "s1", jahr: 2026, monat: 3, betrag: 100 },
      { service_id: "s1", jahr: 2026, monat: 4, betrag: 100 },
      { service_id: "s1", jahr: 2026, monat: 5, betrag: 100 },
      { service_id: "s1", jahr: 2026, monat: 6, betrag: 300 },
    ];
    const { daten, gesamtMonat } = berechneAiCredits([svc], spend, heute);
    const d = daten[0];
    expect(d.monat).toBe(300);
    expect(d.vormonat).toBe(100);
    expect(d.trendPct).toBe(200);
    expect(d.schnitt).toBe(100);
    expect(d.spikeFaktor).toBe(3);
    expect(d.budgetPct).toBe(60);
    expect(gesamtMonat).toBe(300);
    expect(d.reihe).toHaveLength(12);
  });

  it("kein Spike bei gleichmaessigem Verbrauch", () => {
    const spend: AiSpendRow[] = [
      { service_id: "s1", jahr: 2026, monat: 5, betrag: 100 },
      { service_id: "s1", jahr: 2026, monat: 6, betrag: 110 },
    ];
    expect(berechneAiCredits([svc], spend, heute).daten[0].spikeFaktor).toBeNull();
  });
});
