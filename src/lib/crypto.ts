import "server-only";
import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

/**
 * Verschluesselung fuer hinterlegte API-Zugangsdaten (B-24).
 * AES-256-GCM, Schluessel ausschliesslich aus der Server-Umgebung.
 * Klartext verlaesst NIE den Server und wird nie geloggt.
 */
const ALGO = "aes-256-gcm";

function key(): Buffer {
  const raw = process.env.INTEGRATION_ENC_KEY;
  if (!raw) throw new Error("INTEGRATION_ENC_KEY ist nicht gesetzt.");
  const k = Buffer.from(raw, "base64");
  if (k.length !== 32) throw new Error("INTEGRATION_ENC_KEY muss 32 Byte (base64) sein.");
  return k;
}

export type Verschluesselt = { ciphertext: string; iv: string; tag: string };

export function verschluessele(klartext: string): Verschluesselt {
  const iv = randomBytes(12);
  const c = createCipheriv(ALGO, key(), iv);
  const enc = Buffer.concat([c.update(klartext, "utf8"), c.final()]);
  return {
    ciphertext: enc.toString("base64"),
    iv: iv.toString("base64"),
    tag: c.getAuthTag().toString("base64"),
  };
}

export function entschluessele(v: Verschluesselt): string {
  const d = createDecipheriv(ALGO, key(), Buffer.from(v.iv, "base64"));
  d.setAuthTag(Buffer.from(v.tag, "base64"));
  return Buffer.concat([d.update(Buffer.from(v.ciphertext, "base64")), d.final()]).toString("utf8");
}
