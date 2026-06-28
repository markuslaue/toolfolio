import { trialEmailHTML } from "@/lib/emails/trial";
import { spikeEmailHTML } from "@/lib/emails/spike";
import { priceIncreaseEmailHTML } from "@/lib/emails/price-increase";
import { savingsEmailHTML } from "@/lib/emails/savings";

/**
 * Vorschau-Route fuer die transaktionalen Benachrichtigungs-Mails
 * (E-03 Trial, E-04 Spike, E-05 Preiserhoehung, E-07 Sparvorschlag).
 * Rein zur visuellen Abnahme mit Beispieldaten, kein Versand, noindex.
 */
const VORSCHAUEN: Record<string, () => string> = {
  trial: () =>
    trialEmailHTML({
      firstName: "Markus",
      stage: "3",
      toolName: "Framer",
      trialEndDate: "12. Juli 2026",
      futureAmount: "30,00 €",
      interval: "Monat",
      uncertain: true,
    }),
  spike: () =>
    spikeEmailHTML({
      firstName: "Markus",
      toolName: "Anthropic API",
      currentSpend: "184,20 €",
      averageSpend: "92,00 €",
      deviationPercent: "+103 %",
      projectedMonth: "412,00 €",
      usualMonth: "205,00 €",
      currentBarPercent: 100,
      averageBarPercent: 48,
    }),
  "preiserhoehung": () =>
    priceIncreaseEmailHTML({
      firstName: "Markus",
      toolName: "Notion",
      oldPrice: "8,00 €",
      newPrice: "10,00 €",
      interval: "Monat",
      difference: "2,00 €",
      differencePercent: "+25 %",
      yearlyExtra: "24,00 €",
      validFrom: "1. August 2026",
      source: "billing",
    }),
  "sparvorschlag": () =>
    savingsEmailHTML({
      firstName: "Markus",
      toolName: "Canva",
      yearlySaving: "30,00 €",
      reason: "jahreszahlung",
      usageDuration: "10 Monaten",
      currentInterval: "monatlich",
      recommendedInterval: "jährlich",
      savingsPercent: "20 %",
      reasonText: "Konstante Nutzung seit 10 Monaten, Jahreslizenz ist hier klar günstiger.",
    }),
};

export function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  return params.then(({ slug }) => {
    const render = VORSCHAUEN[slug];
    if (!render) {
      const liste = Object.keys(VORSCHAUEN)
        .map((s) => `<li><a href="/email-vorschau/${s}">${s}</a></li>`)
        .join("");
      return new Response(
        `<!doctype html><meta charset="utf-8"><body style="font-family:system-ui;padding:24px"><h1>E-Mail-Vorschau</h1><ul>${liste}</ul></body>`,
        { status: 404, headers: { "content-type": "text/html; charset=utf-8", "x-robots-tag": "noindex" } },
      );
    }
    return new Response(render(), {
      headers: { "content-type": "text/html; charset=utf-8", "x-robots-tag": "noindex" },
    });
  });
}
