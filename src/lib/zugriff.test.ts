import { describe, it, expect } from "vitest";
import { hatMindestens, kontoLabel } from "@/lib/constants";

describe("Zugriffspruefung mit Inhaber-/Superadmin-Konto", () => {
  it("gibt Superadmin-Konten vollen Umfang, unabhaengig vom Tarif", () => {
    expect(hatMindestens("free", true, "agentur")).toBe(true);
    expect(hatMindestens("free", true, "unternehmen")).toBe(true);
    expect(hatMindestens("free", true, "pro")).toBe(true);
  });

  it("sperrt Free-Konten ohne Superadmin aus den Agentur-Funktionen aus", () => {
    expect(hatMindestens("free", false, "agentur")).toBe(false);
    expect(hatMindestens("pro", false, "agentur")).toBe(false);
  });

  it("respektiert die Tarif-Rangfolge", () => {
    expect(hatMindestens("agentur", false, "agentur")).toBe(true);
    expect(hatMindestens("unternehmen", false, "agentur")).toBe(true);
    expect(hatMindestens("agentur", false, "unternehmen")).toBe(false);
    expect(hatMindestens("pro", false, "free")).toBe(true);
  });

  it("kennzeichnet Inhaber-Konten im Label", () => {
    expect(kontoLabel("free", true)).toBe("Superadmin (Inhaber)");
    expect(kontoLabel("agentur", false)).toBe("Agentur");
  });
});
