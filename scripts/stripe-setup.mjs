// Einmaliges (idempotentes) Anlegen der Toolfolio-Produkte und -Preise in Stripe.
// Aufruf: STRIPE_SECRET_KEY=sk_test_... node scripts/stripe-setup.mjs
// Gibt die Price-IDs als .env-Zeilen aus. Bei erneutem Lauf werden vorhandene
// Produkte/Preise (per lookup_key) wiederverwendet, keine Duplikate.
import Stripe from "stripe";

const key = process.env.STRIPE_SECRET_KEY;
if (!key) {
  console.error("STRIPE_SECRET_KEY fehlt.");
  process.exit(1);
}
const stripe = new Stripe(key);

// Preise in Cent. Jahrespreis = 12 Monate, 20 Prozent Rabatt (YEARLY_DISCOUNT).
const PLANS = [
  { id: "toolfolio_pro", name: "Toolfolio Pro", desc: "Fuer Solopreneure und Freelancer", month: 1400, year: 13440 },
  { id: "toolfolio_agentur", name: "Toolfolio Agentur", desc: "Fuer Agenturen und Teams", month: 7900, year: 75840 },
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
  if (found.data[0]) return found.data[0];
  return await stripe.prices.create({
    product: product.id,
    unit_amount: amount,
    currency: "eur",
    recurring: { interval },
    lookup_key: lookupKey,
    tax_behavior: "exclusive",
  });
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
