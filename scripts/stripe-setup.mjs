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
// Pricing v2 (Slider): je Stufe ein Basis-, ein Pro-Nutzer- (Seat) und ein
// Pro-Tool-Block-Preis, jeweils Monat/Jahr. Mengen kommen beim Checkout als
// quantity. Die Betraege MUESSEN zu src/lib/constants.ts (PLANS) passen:
//   month = <eur>.monat * 100,  year = <eur>.jahr * 12 * 100  (Jahr = Jahrespreis-Total).
import Stripe from "stripe";

const key = process.env.STRIPE_SECRET_KEY;
if (!key) {
  console.error("STRIPE_SECRET_KEY fehlt.");
  process.exit(1);
}
const stripe = new Stripe(key);

// Betraege in Cent. Spiegelt src/lib/constants.ts:
//   Pro     basis 14/11  · seat 9/7   · toolblock 4/3
//   Agentur basis 69/55  · seat 12/10 · toolblock 6/5
//   Unternehmen basis 199/159 · seat 9/7 · (keine Tool-Bloecke, Tools unbegrenzt)
const PLANS = [
  {
    id: "toolfolio_pro", name: "Toolfolio Pro", desc: "Fuer Solopreneure und Freelancer",
    base: { month: 1400, year: 13200 },
    seat: { month: 900, year: 8400 },
    toolblock: { month: 400, year: 3600 },
  },
  {
    id: "toolfolio_agentur", name: "Toolfolio Agentur", desc: "Fuer Agenturen und Teams",
    base: { month: 6900, year: 66000 },
    seat: { month: 1200, year: 12000 },
    toolblock: { month: 600, year: 6000 },
  },
  {
    id: "toolfolio_unternehmen", name: "Toolfolio Unternehmen", desc: "Fuer grosse Teams und Konzerne",
    base: { month: 19900, year: 190800 },
    seat: { month: 900, year: 8400 },
    toolblock: null, // Tools unbegrenzt
  },
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
  const short = p.id.replace("toolfolio_", "").toUpperCase(); // PRO / AGENTUR / UNTERNEHMEN

  const baseM = await ensurePrice(product, `${p.id}_month`, p.base.month, "month");
  const baseY = await ensurePrice(product, `${p.id}_year`, p.base.year, "year");
  out[`STRIPE_PRICE_${short}_MONTH`] = baseM.id;
  out[`STRIPE_PRICE_${short}_YEAR`] = baseY.id;

  const seatM = await ensurePrice(product, `${p.id}_seat_month`, p.seat.month, "month");
  const seatY = await ensurePrice(product, `${p.id}_seat_year`, p.seat.year, "year");
  out[`STRIPE_PRICE_${short}_SEAT_MONTH`] = seatM.id;
  out[`STRIPE_PRICE_${short}_SEAT_YEAR`] = seatY.id;

  if (p.toolblock) {
    const tbM = await ensurePrice(product, `${p.id}_toolblock_month`, p.toolblock.month, "month");
    const tbY = await ensurePrice(product, `${p.id}_toolblock_year`, p.toolblock.year, "year");
    out[`STRIPE_PRICE_${short}_TOOLBLOCK_MONTH`] = tbM.id;
    out[`STRIPE_PRICE_${short}_TOOLBLOCK_YEAR`] = tbY.id;
  }
}

console.log("\n# In .env.local / VPS .env eintragen:");
for (const [k, v] of Object.entries(out)) console.log(`${k}=${v}`);
