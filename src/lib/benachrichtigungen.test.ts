import { describe, it, expect } from "vitest";
import { buildAktionen, zeitgruppe, type BenachrStatus } from "./benachrichtigungen";
import type { Frist } from "./fristen";
import type { Vorschlag } from "./sparvorschlaege";

const heute = new Date("2026-06-26T12:00:00Z");

const frist: Frist = {
  key: "abo1:kuendigung:2026-07-05", quelle: "abo", quelle_id: "abo1", art: "kuendigung",
  datum: "2026-07-05", titel: "Adobe CC", farbe: "#6C5CE7",
  kunde: null,
  jahreswert: 0,
  erinnerung: true,
  konsequenz: "Sonst Verlängerung.",
};
const vorschlag: Vorschlag = {
  key: "intervall:abo2", typ: "intervall", titel: "Figma jährlich statt monatlich", ersparnisJahr: 36,
  begruendung: "Spare ~20 %.", tools: [{ name: "Figma", farbe: "#000" }], aktion: "Umstellen", status: "offen", geschaetzt: true,
};

describe("buildAktionen", () => {
  it("leitet Aktionen aus Fristen und Vorschlaegen ab, alle ungelesen", () => {
    const a = buildAktionen([frist], [vorschlag], new Map(), heute);
    expect(a).toHaveLength(2);
    expect(a.every((x) => x.ungelesen)).toBe(true);
    expect(a.find((x) => x.typ === "frist")?.zeit).toBe("in 9 Tagen fällig");
  });

  it("blendet erledigte/ignorierte aus und markiert gelesene", () => {
    const map = new Map<string, BenachrStatus>([
      ["frist:abo1:kuendigung:2026-07-05", "erledigt"],
      ["spar:intervall:abo2", "gelesen"],
    ]);
    const a = buildAktionen([frist], [vorschlag], map, heute);
    expect(a).toHaveLength(1);
    expect(a[0].typ).toBe("sparvorschlag");
    expect(a[0].ungelesen).toBe(false);
  });

  it("ignoriert Fristen ausserhalb des Fensters", () => {
    const fern: Frist = { ...frist, key: "x", datum: "2026-12-31" };
    expect(buildAktionen([fern], [], new Map(), heute)).toHaveLength(0);
  });
});

describe("zeitgruppe", () => {
  it("gruppiert heute korrekt", () => {
    const { gruppe } = zeitgruppe(heute.getTime() - 2 * 60 * 60 * 1000, heute);
    expect(gruppe).toBe("Heute");
  });
  it("gruppiert aelteres als Diese Woche / Älter", () => {
    expect(zeitgruppe(heute.getTime() - 3 * 86400000, heute).gruppe).toBe("Diese Woche");
    expect(zeitgruppe(heute.getTime() - 30 * 86400000, heute).gruppe).toBe("Älter");
  });
});
