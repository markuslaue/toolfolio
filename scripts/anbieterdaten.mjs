/**
 * Anbieterdaten-Lauf als lokales Skript (Test-Stopgap fuer AD-06/A-07).
 *
 * Macht dasselbe wie lib/verzeichnis-pipeline.ts -> anreichereProdukte(), aber
 * standalone: laedt pro Anbieter die Unterseiten UND die Partner-Seiten, wertet mit
 * Claude aus, schreibt Langbeschreibung, Staerken, Schwaechen, Preis (mit Quelle) und
 * den Partnerprogramm-Befund in die Datenbank.
 *
 * Der kanonische Weg ist der Backend-Knopf. Dieses Skript ist nur, weil ich fuer den
 * Test kein eingeloggtes Redaktionskonto habe. Prompt und Seitenliste sind bewusst
 * deckungsgleich mit der Pipeline.
 *
 * Aufruf:  node scripts/anbieterdaten.mjs bauplanungssoftware
 */

import { createClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";
import { readFileSync } from "node:fs";

for (const z of readFileSync(".env.local", "utf8").split("\n")) {
  const m = z.match(/^([A-Z_]+)=(.*)$/);
  if (m) process.env[m[1]] ??= m[2].replace(/^["']|["']$/g, "");
}

const slug = process.argv[2];
if (!slug) {
  console.error("Aufruf: node scripts/anbieterdaten.mjs <collection-slug>");
  process.exit(1);
}

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const ki = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const UNTERSEITEN = ["", "/preise", "/pricing", "/preis", "/funktionen", "/features", "/produkt", "/product"];
const PARTNER_SEITEN = ["/partner", "/partnerprogramm", "/affiliate", "/affiliates", "/partnerprogram", "/referral"];

async function holeSeite(url) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 12_000);
  try {
    const res = await fetch(url, { signal: ctrl.signal, redirect: "follow", headers: { "User-Agent": "ToolfolioBot/1.0 (+https://toolfolio.de)" } });
    if (!res.ok) return null;
    const html = await res.text();
    return html.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 4000);
  } catch { return null; } finally { clearTimeout(t); }
}

const { data: coll } = await sb.from("dir_collection").select("id, name").eq("slug", slug).single();
const { data: cp } = await sb.from("dir_collection_produkt")
  .select("produkt_id, dir_produkt(id, name, website_url)")
  .eq("collection_id", coll.id);
const produkte = cp.map((r) => r.dir_produkt).filter((p) => p && p.website_url);

console.log(`${coll.name}: ${produkte.length} Anbieter mit Website\n`);

let fertig = 0, leer = 0, partner = 0;
let n = 0;
for (const p of produkte) {
  n++;
  const basis = p.website_url.replace(/\/$/, "");
  const seiten = [];
  for (const pfad of UNTERSEITEN) {
    const text = await holeSeite(`${basis}${pfad}`);
    if (text && text.length > 300) seiten.push({ url: `${basis}${pfad}`, text });
    if (seiten.length >= 4) break;
  }
  let partnerSeite = null;
  for (const pfad of PARTNER_SEITEN) {
    const text = await holeSeite(`${basis}${pfad}`);
    if (text && text.length > 300) { partnerSeite = { url: `${basis}${pfad}`, text }; break; }
  }

  if (seiten.length === 0) { console.log(`[${n}/${produkte.length}] ${p.name}: keine Seite erreichbar`); leer++; continue; }

  try {
    const antwort = await ki.messages.create({
      model: "claude-opus-4-8", max_tokens: 2500,
      messages: [{ role: "user", content: `Du erstellst das Datenblatt fuer "${p.name}", eine Software der Kategorie "${coll.name}".

Alles, was du schreibst, muss auf den Seiten stehen.
SPRACHE: Deutsch, Du-Form, ECHTE UMLAUTE (ä ö ü ß), niemals ae/oe/ue/ss. Keine Gedankenstriche.
ERFINDE NICHTS. Was nicht dasteht, bleibt null oder leere Liste.
contra: nur belegbare Einschraenkungen, sonst leer.
PREIS: nur wenn eine konkrete Angabe dasteht, mit preis_quelle_url.

PARTNERPROGRAMM: ${partnerSeite ? `Diese Seite wurde gefunden (${partnerSeite.url}):\n${partnerSeite.text.slice(0, 2000)}` : "Keine Partner- oder Affiliate-Seite gefunden. Setz partnerprogramm auf 'unbekannt', NICHT auf 'nein'."}

SEITEN:
${seiten.map((s) => `--- ${s.url}\n${s.text.slice(0, 3000)}`).join("\n\n")}

Gib NUR ein JSON-Objekt zurueck, ohne Codefence:
{"langbeschreibung":"3 bis 5 Saetze","features":["bis 10"],"plattformen":["..."],"einsatzgebiet":"kurz","pro":["bis 5"],"contra":["nur belegbare"],"preis_hinweis":"woertlich oder 'Auf Anfrage' oder null","preis_quelle_url":"URL oder null","partnerprogramm":"ja nur wenn belegt, sonst unbekannt","partnerprogramm_url":"URL oder null"}` }],
    });
    const roh = antwort.content[0].text;
    const d = JSON.parse(roh.slice(roh.indexOf("{"), roh.lastIndexOf("}") + 1));

    await sb.from("dir_produkt").update({
      langbeschreibung: d.langbeschreibung ?? null,
      features: d.features ?? [],
      plattformen: d.plattformen ?? [],
      einsatzgebiet: d.einsatzgebiet ?? null,
      pro: d.pro ?? [],
      contra: d.contra ?? [],
      preis_hinweis: d.preis_hinweis ?? null,
      preis_quelle_url: d.preis_quelle_url ?? null,
      preis_stand: d.preis_hinweis ? new Date().toISOString().slice(0, 10) : null,
      ...(d.partnerprogramm === "ja" ? { partnerprogramm: "ja", partnerprogramm_url: d.partnerprogramm_url ?? partnerSeite?.url ?? null } : {}),
    }).eq("id", p.id);

    fertig++;
    const pp = d.partnerprogramm === "ja" ? "  ★ PARTNERPROGRAMM" : "";
    if (d.partnerprogramm === "ja") partner++;
    console.log(`[${n}/${produkte.length}] ${p.name}: ${(d.features ?? []).length} Funktionen, ${(d.contra ?? []).length} Einschraenkungen, ${d.preis_quelle_url ? "Preis+Quelle" : d.preis_hinweis ? "Preis" : "kein Preis"}${pp}`);
  } catch (e) {
    console.log(`[${n}/${produkte.length}] ${p.name}: Fehler (${e.message})`);
    leer++;
  }
}

console.log(`\nFertig. ${fertig} angereichert, ${leer} ohne Ergebnis, ${partner} mit Partnerprogramm.`);
console.log(`Backend: /admin/verzeichnis/collection/${slug}`);
