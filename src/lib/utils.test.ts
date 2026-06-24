import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";
import { formatEur } from "@/lib/constants";

describe("cn", () => {
  it("fuehrt Klassen zusammen und entfernt Konflikte", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
    expect(cn("text-foreground", false && "hidden", "font-bold")).toBe(
      "text-foreground font-bold",
    );
  });
});

describe("formatEur", () => {
  it("formatiert im deutschen Format", () => {
    const out = formatEur(1249);
    expect(out).toContain("1.249,00");
    expect(out).toContain("EUR".slice(0, 0) + "€");
  });
});
