/**
 * AD-05: Hero-Bilder fuer Kategorien erzeugen, die noch keines haben.
 *
 * Das ist die "automatische" Erzeugung: Kategorien entstehen per Taxonomie-Import,
 * nicht einzeln von Hand. Dieses Skript zieht alles nach, was noch kein Bild hat,
 * und ist idempotent: was schon ein Bild hat, wird nicht angefasst.
 *
 * Aufruf:
 *   node scripts/verzeichnis-hero.mjs gastro-hotel-und-freizeit     (ein Cluster)
 *   node scripts/verzeichnis-hero.mjs --slug campingplatz-software  (eine Kategorie)
 *   node scripts/verzeichnis-hero.mjs --alle --limit 20             (querbeet, gedeckelt)
 *
 * DIE DECKELUNG IST WICHTIG. Bei rund 1300 Kategorien kostet ein unbedachter Lauf
 * ueber alles echtes Geld. Ohne --limit macht dieses Skript hoechstens 25 Bilder und
 * sagt danach, wie viele noch offen sind. Ein Skript, das still 1300 Bilder kauft,
 * ist kein Werkzeug, sondern eine Falle.
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

for (const zeile of readFileSync(".env.local", "utf8").split("\n")) {
  const m = zeile.match(/^([A-Z_]+)=(.*)$/);
  if (m) process.env[m[1]] ??= m[2].replace(/^["']|["']$/g, "");
}

const MODELL = "gpt-image-1";
const GROESSE = "1536x1024";
const STANDARD_LIMIT = 25;

// Beide Schreibweisen: in der Server-Env steht OPEN_AI_API_KEY.
const key = process.env.OPENAI_API_KEY ?? process.env.OPEN_AI_API_KEY;
if (!key) {
  console.error("Kein OpenAI-Schluessel gefunden (OPENAI_API_KEY oder OPEN_AI_API_KEY).");
  console.error("Ohne Bild-Schluessel kann nichts erzeugt werden. Der Hero faellt dann auf den");
  console.error("Farbverlauf zurueck, die Seiten funktionieren also trotzdem.");
  process.exit(1);
}

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const args = process.argv.slice(2);
const einzelSlug = args.includes("--slug") ? args[args.indexOf("--slug") + 1] : null;
const alle = args.includes("--alle");
const limit = args.includes("--limit") ? Number(args[args.indexOf("--limit") + 1]) : STANDARD_LIMIT;
const clusterSlug = args.find((a) => !a.startsWith("--") && a !== einzelSlug && a !== String(limit));

/** Denselben Prompt wie die App verwenden. Zwei Quellen wuerden auseinanderlaufen. */
function heroPrompt(collectionName, clusterName) {
  const thema = collectionName
    .replace(/\b(Software|Tools?|Systeme?|Programme?|Lösungen?|Apps?)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
  return [
    `A calm, atmospheric wide photograph evoking the world of ${thema || collectionName}`,
    `(context: ${clusterName}).`,
    "Natural light, soft depth of field, muted and slightly desaturated colours, editorial photography style.",
    "The scene is quiet and empty of people.",
    "STRICTLY NO text, NO letters, NO numbers, NO logos, NO signage, NO screens, NO user interfaces,",
    "NO watermarks, NO recognisable faces, NO brand marks of any kind.",
    "Composition leaves the upper left area calm and uncluttered.",
    "Photorealistic, not an illustration, not a 3D render.",
  ].join(" ");
}

/* ------------------------------------------------------------- Auswahl */

let query = sb
  .from("dir_collection")
  .select("id, name, slug, hero_url, dir_cluster(name, slug)")
  .is("hero_url", null);

if (einzelSlug) {
  query = sb.from("dir_collection").select("id, name, slug, hero_url, dir_cluster(name, slug)").eq("slug", einzelSlug);
} else if (clusterSlug) {
  const { data: c } = await sb.from("dir_cluster").select("id").eq("slug", clusterSlug).maybeSingle();
  if (!c) {
    console.error(`Cluster ${clusterSlug} nicht gefunden.`);
    process.exit(1);
  }
  query = query.eq("cluster_id", c.id);
} else if (!alle) {
  console.error("Sag mir, was ich bebildern soll: ein Cluster-Slug, --slug <kategorie> oder --alle.");
  process.exit(1);
}

const { data: offen, error } = await query;
if (error) {
  console.error("Abfrage fehlgeschlagen:", error.message);
  process.exit(1);
}

const zuTun = offen.slice(0, limit);
const rest = offen.length - zuTun.length;

console.log(`Ohne Bild: ${offen.length}`);
console.log(`Dieser Lauf: ${zuTun.length} (Deckel: ${limit})`);
console.log(`Geschaetzte Kosten: rund ${(zuTun.length * 0.04).toFixed(2)} USD\n`);

/* ------------------------------------------------------------ Erzeugen */

let erfolg = 0;
const fehler = [];

for (const [i, c] of zuTun.entries()) {
  const cluster = c.dir_cluster?.name ?? "Software";
  const prompt = heroPrompt(c.name, cluster);
  process.stdout.write(`[${i + 1}/${zuTun.length}] ${c.name} ... `);

  try {
    const res = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: MODELL, prompt, size: GROESSE, quality: "medium", n: 1 }),
    });

    if (!res.ok) {
      const text = await res.text();
      fehler.push(`${c.name}: HTTP ${res.status} ${text.slice(0, 120)}`);
      console.log("Fehler");
      continue;
    }

    const json = await res.json();
    const eintrag = json.data?.[0];
    let daten;
    if (eintrag?.b64_json) {
      daten = Buffer.from(eintrag.b64_json, "base64");
    } else if (eintrag?.url) {
      // Fremde URLs verfallen. Wir laden das Bild herunter, statt darauf zu zeigen.
      daten = Buffer.from(await (await fetch(eintrag.url)).arrayBuffer());
    } else {
      fehler.push(`${c.name}: kein Bild in der Antwort`);
      console.log("Fehler");
      continue;
    }

    const pfad = `${c.slug}-${Date.now()}.png`;
    const { error: upErr } = await sb.storage
      .from("verzeichnis-hero")
      .upload(pfad, daten, { contentType: "image/png", upsert: true });
    if (upErr) {
      fehler.push(`${c.name}: Speichern fehlgeschlagen (${upErr.message})`);
      console.log("Fehler");
      continue;
    }

    const { data: pub } = sb.storage.from("verzeichnis-hero").getPublicUrl(pfad);

    await sb
      .from("dir_collection")
      .update({
        hero_url: pub.publicUrl,
        hero_quelle: "ki",
        hero_autor: null,
        hero_autor_url: null,
        hero_quelle_url: null,
        hero_prompt: prompt,
        hero_modell: MODELL,
        hero_erzeugt_am: new Date().toISOString(),
      })
      .eq("id", c.id);

    erfolg++;
    console.log("ok");
  } catch (e) {
    fehler.push(`${c.name}: ${e.message}`);
    console.log("Fehler");
  }
}

console.log(`\nFertig. ${erfolg} Bilder erzeugt.`);
if (fehler.length) {
  console.log(`\n${fehler.length} Fehler:`);
  for (const f of fehler) console.log("  -", f);
}
if (rest > 0) {
  console.log(`\nNoch offen: ${rest} Kategorien ohne Bild.`);
  console.log(`Erneut laufen lassen, oder mit --limit ${rest} alles auf einmal (rund ${(rest * 0.04).toFixed(2)} USD).`);
}
