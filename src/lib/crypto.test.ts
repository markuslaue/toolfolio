import { describe, it, expect, beforeAll } from "vitest";
import { verschluessele, entschluessele } from "@/lib/crypto";

beforeAll(() => {
  // Test-Schluessel (32 Byte). Der echte Schluessel liegt nur in der Server-Env.
  process.env.INTEGRATION_ENC_KEY = Buffer.alloc(32, 7).toString("base64");
});

describe("Credential-Verschluesselung (B-24)", () => {
  it("verschluesselt und entschluesselt verlustfrei", () => {
    const geheim = JSON.stringify({ login: "name@agentur.de", passwort: "s3hr-geheim!" });
    const v = verschluessele(geheim);
    expect(v.ciphertext).not.toContain("geheim");
    expect(entschluessele(v)).toBe(geheim);
  });

  it("erzeugt bei gleichem Klartext unterschiedliche Chiffren (zufaelliger IV)", () => {
    const a = verschluessele("gleich");
    const b = verschluessele("gleich");
    expect(a.ciphertext).not.toBe(b.ciphertext);
    expect(entschluessele(a)).toBe("gleich");
    expect(entschluessele(b)).toBe("gleich");
  });

  it("erkennt Manipulation (GCM-Auth-Tag schlaegt an)", () => {
    const v = verschluessele("unveraendert");
    const manipuliert = { ...v, ciphertext: Buffer.from("boeswillig").toString("base64") };
    expect(() => entschluessele(manipuliert)).toThrow();
  });
});
