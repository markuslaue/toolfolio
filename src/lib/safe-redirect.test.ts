import { describe, it, expect } from "vitest";
import { safeRedirect } from "@/lib/safe-redirect";

describe("safeRedirect", () => {
  it("erlaubt interne, relative Pfade", () => {
    expect(safeRedirect("/app")).toBe("/app");
    expect(safeRedirect("/app/abos?x=1")).toBe("/app/abos?x=1");
  });

  it("weist externe und manipulierte Ziele ab", () => {
    expect(safeRedirect("https://evil.com")).toBe("/app");
    expect(safeRedirect("//evil.com")).toBe("/app");
    expect(safeRedirect("/\\evil.com")).toBe("/app");
    expect(safeRedirect("javascript:alert(1)")).toBe("/app");
    expect(safeRedirect(null)).toBe("/app");
    expect(safeRedirect(undefined)).toBe("/app");
    expect(safeRedirect("")).toBe("/app");
  });

  it("respektiert den Fallback-Parameter", () => {
    expect(safeRedirect(null, "")).toBe("");
    expect(safeRedirect("https://evil.com", "/login")).toBe("/login");
  });
});
