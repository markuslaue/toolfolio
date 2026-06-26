import { describe, it, expect } from "vitest";
import { berechneVorschlaege } from "./sparvorschlaege";
import type { Abo } from "./abos";

function abo(p: Partial<Abo> & { id: string; tool: string; kategorie: string; kosten: number }): Abo {
  return {
    anbieter: null, initial: null, farbe: null, mit_verzeichnis: false, waehrung: "EUR",
    intervall: "monatlich", naechste_abbuchung: null, zahlungskanal: null, kunde: null,
    status: "aktiv", tags: [], weiterverrechnen: false, aufschlag_prozent: null, abo_seit: null,
    auto_verlaengerung: true, frist_wert: null, frist_einheit: null, letzter_kuendigungstermin: null,
    erinnerung: false, trial_endet: null, notizen: null, konto_email: null, login_verweis: null,
    ...p,
  };
}

describe("berechneVorschlaege", () => {
  it("schlaegt jaehrliche Zahlung fuer monatliche Abos vor (geschaetzt)", () => {
    const v = berechneVorschlaege([abo({ id: "1", tool: "Figma", kategorie: "Design", kosten: 15, intervall: "monatlich" })]);
    const intervall = v.find((x) => x.typ === "intervall");
    expect(intervall).toBeTruthy();
    expect(intervall!.geschaetzt).toBe(true);
    // 15 * 12 * 0.2 = 36
    expect(intervall!.ersparnisJahr).toBeCloseTo(36, 2);
  });

  it("erkennt Redundanz bei mehreren aktiven Tools derselben Kategorie", () => {
    const v = berechneVorschlaege([
      abo({ id: "1", tool: "Notion", kategorie: "Wissen", kosten: 10 }),
      abo({ id: "2", tool: "Coda", kategorie: "Wissen", kosten: 8 }),
    ]);
    const red = v.find((x) => x.typ === "redundanz");
    expect(red).toBeTruthy();
    expect(red!.tools).toHaveLength(2);
    // guenstigstes (8) * 12 = 96
    expect(red!.ersparnisJahr).toBeCloseTo(96, 2);
  });

  it("meldet pausierte Abos als Zombie", () => {
    const v = berechneVorschlaege([abo({ id: "1", tool: "Loom", kategorie: "Video", kosten: 9, status: "pausiert" })]);
    expect(v.some((x) => x.typ === "zombie")).toBe(true);
  });

  it("erzeugt keine Vorschlaege fuer ein einzelnes jaehrliches Abo", () => {
    const v = berechneVorschlaege([abo({ id: "1", tool: "Linear", kategorie: "PM", kosten: 100, intervall: "jaehrlich" })]);
    expect(v).toHaveLength(0);
  });
});
