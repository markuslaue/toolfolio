// Idempotentes Anlegen/Aktualisieren der Toolfolio-Produkte und -Preise in Stripe.
// Aufruf: STRIPE_SECRET_KEY=sk_test_... node scripts/stripe-setup.mjs
//         (fuer Live: sk_live_... ausfuehren und die ausgegebenen Live-Price-IDs eintragen)
//
// WICHTIG: Stripe-Preise sind UNVERAENDERLICH. Aendert sich ein Betrag, legt das
// Skript einen NEUEN Preis an, uebertraegt den lookup_key darauf und deaktiviert
// den alten Preis. Bestehende Abos laufen auf ihrem alten Preis weiter, bis der
// Kunde aktiv wechselt (Stripe aendert laufende Abos nie rueckwirkend).
// Nach dem Lauf die ausgegebenen STRIPE_PRICE_*-Zeilen in .env.local und die
// VPS-.env eintragen und neu deployen.
//
// Die Betraege MUESSEN zu src/lib/constants.ts (PLANS) passen:
//   month = monthlyEur * 100, year = yearlyMonthlyEur * 12 * 100.
import Stripe from "stripe";

const key = process.env.STRIPE_SECRET_KEY;
if (!key) {
  console.error("STRIPE_SECRET_KEY fehlt.");
  process.exit(1);
}
const stripe = new Stripe(key);

// Preise in Cent. Spiegelt src/lib/constants.ts: Pro 14/11, Agentur 69/55 (Monat/Jahr-pro-Monat).
const PLANS = [
  { id: "toolfolio_pro", name: "Toolfolio Pro", desc: "Fuer Solopreneure und Freelancer", month: 1400, year: 13200 },
  { id: "toolfolio_agentur", name: "Toolfolio Agentur", desc: "Fuer Agenturen und Teams", month: 6900, year: 66000 },
];

async function ensureProduct(p) {
  try {
    return await stripe.products.retrieve(p.id);
  } catch {
    return await stripe.products.create({ id: p.id, name: p.name, description: p.desc });
  }
}

async function ensurePrice(product, lookupKey, amount, interval) {
  const found = await stripe.prices.list({ lookup_keys: [lookupKey], active: true, limit: 1 });
  const bestehend = found.data[0];
  // Unveraendert: vorhandenen Preis weiterverwenden.
  if (bestehend && bestehend.unit_amount === amount && bestehend.recurring?.interval === interval) {
    return bestehend;
  }
  // Neu oder Betrag geaendert: neuen Preis anlegen, lookup_key uebertragen, alten deaktivieren.
  const neu = await stripe.prices.create({
    product: product.id,
    unit_amount: amount,
    currency: "eur",
    recurring: { interval },
    lookup_key: lookupKey,
    transfer_lookup_key: Boolean(bestehend),
    tax_behavior: "exclusive",
  });
  if (bestehend) {
    await stripe.prices.update(bestehend.id, { active: false });
    console.error(`# Preis ${lookupKey}: ${bestehend.unit_amount} -> ${amount} Cent (alter Preis ${bestehend.id} deaktiviert)`);
  }
  return neu;
}

const out = {};
for (const p of PLANS) {
  const product = await ensureProduct(p);
  const short = p.id.replace("toolfolio_", "").toUpperCase(); // PRO / AGENTUR
  const m = await ensurePrice(product, `${p.id}_month`, p.month, "month");
  const y = await ensurePrice(product, `${p.id}_year`, p.year, "year");
  out[`STRIPE_PRICE_${short}_MONTH`] = m.id;
  out[`STRIPE_PRICE_${short}_YEAR`] = y.id;
}

console.log("\n# In .env.local / VPS .env eintragen:");
for (const [k, v] of Object.entries(out)) console.log(`${k}=${v}`);
