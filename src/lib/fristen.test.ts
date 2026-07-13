import { describe, it, expect } from "vitest";
import { minusFrist, kuendigungsDeadline, deriveFristen } from "@/lib/fristen";
import type { Abo } from "@/lib/abos";

function abo(p: Partial<Abo>): Abo {
  return {
    id: "a1",
    user_id: "u1",
    tool: "Testtool",
    anbieter: null,
    initial: null,
    farbe: null,
    kategorie: "Produktivität",
    mit_verzeichnis: false,
    kosten: 100,
    waehrung: "EUR",
    intervall: "jaehrlich",
    naechste_abbuchung: null,
    zahlungskanal: null,
    kunde: null,
    status: "aktiv",
    tags: [],
    weiterverrechnen: false,
    aufschlag_prozent: null,
    abo_seit: null,
    auto_verlaengerung: true,
    frist_wert: null,
    frist_einheit: null,
    letzter_kuendigungstermin: null,
    erinnerung: true,
    trial_endet: null,
    notizen: null,
    konto_email: null,
    login_verweis: null,
    ...p,
  } as Abo;
}

describe("minusFrist", () => {
  it("zieht Monate ab", () => {
    expect(minusFrist("2026-10-01", 3, "Monate")).toBe("2026-07-01");
  });

  it("klemmt auf den letzten gueltigen Tag des Zielmonats", () => {
    // 31.03. minus 1 Monat -> Februar hat keinen 31.
    expect(minusFrist("2026-03-31", 1, "Monate")).toBe("2026-02-28");
  });

  it("zieht Wochen und Tage ab", () => {
    expect(minusFrist("2026-10-15", 2, "Wochen")).toBe("2026-10-01");
    expect(minusFrist("2026-10-15", 30, "Tage")).toBe("2026-09-15");
  });
});

describe("kuendigungsDeadline (B-32)", () => {
  it("berechnet die Deadline aus Frist und Verlaengerungstermin", () => {
    const a = abo({ naechste_abbuchung: "2026-10-01", frist_wert: 3, frist_einheit: "Monate" });
    expect(kuendigungsDeadline(a)).toBe("2026-07-01");
  });

  it("gibt ohne Verlaengerungstermin keine Deadline zurueck (keine Scheingenauigkeit)", () => {
    const a = abo({ naechste_abbuchung: null, frist_wert: 3, frist_einheit: "Monate" });
    expect(kuendigungsDeadline(a)).toBeNull();
  });

  it("laesst den expliziten Stichtag gewinnen", () => {
    const a = abo({
      naechste_abbuchung: "2026-10-01",
      frist_wert: 3,
      frist_einheit: "Monate",
      letzter_kuendigungstermin: "2026-08-15",
    });
    expect(kuendigungsDeadline(a)).toBe("2026-08-15");
  });

  it("ohne Frist und ohne Stichtag gibt es keine Deadline", () => {
    expect(kuendigungsDeadline(abo({ naechste_abbuchung: "2026-10-01" }))).toBeNull();
  });

  it("Frist 0 bedeutet: kuendbar bis zur Verlaengerung", () => {
    const a = abo({ naechste_abbuchung: "2026-10-01", frist_wert: 0, frist_einheit: "Monate" });
    expect(kuendigungsDeadline(a)).toBe("2026-10-01");
  });
});

describe("deriveFristen mit Kuendigungsfrist", () => {
  it("erzeugt eine Kuendigungs-Frist aus der Vorlauf-Frist", () => {
    const a = abo({ naechste_abbuchung: "2026-10-01", frist_wert: 3, frist_einheit: "Monate", tool: "Ahrefs" });
    const fristen = deriveFristen([a], []);
    const k = fristen.find((f) => f.art === "kuendigung");
    expect(k).toBeTruthy();
    expect(k!.datum).toBe("2026-07-01");
    expect(k!.titel).toBe("Ahrefs");
    // Konsequenz nennt den Verlaengerungstermin
    expect(k!.konsequenz).toContain("01.10.2026");
  });

  it("erzeugt keine Kuendigungs-Frist fuer gekuendigte oder archivierte Abos", () => {
    const a = abo({ naechste_abbuchung: "2026-10-01", frist_wert: 3, frist_einheit: "Monate", status: "gekuendigt" });
    expect(deriveFristen([a], []).filter((f) => f.art === "kuendigung")).toHaveLength(0);
  });
});
