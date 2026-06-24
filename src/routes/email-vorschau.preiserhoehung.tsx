import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  priceIncreaseEmailHTML,
  priceIncreaseSubject,
  type PriceSource,
} from "@/components/emails/price-increase-email";

export const Route = createFileRoute("/email-vorschau/preiserhoehung")({
  head: () => ({
    meta: [
      { title: "Vorschau: Preiserhöhung erkannt – Toolfolio" },
      { name: "description", content: "Interne Vorschau der Preiserhöhungs-Mail E-05." },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: PriceIncreasePreview,
});

const SOURCES: { id: PriceSource; label: string }[] = [
  { id: "billing", label: "Aus Abrechnung (verifiziert)" },
  { id: "listprice", label: "Listenpreis (laut Anbieter)" },
];

function PriceIncreasePreview() {
  const [source, setSource] = useState<PriceSource>("billing");

  const props = {
    firstName: "Max",
    toolName: "Figma",
    oldPrice: "15,00 €",
    newPrice: "20,00 €",
    interval: "Monat",
    difference: "5,00 €",
    differencePercent: "+33 %",
    yearlyExtra: "60,00 €",
    validFrom: "1. August 2026",
    source,
    clientName: "Kunde Nordwerk",
    legalEntity: "Toolfolio GmbH, Musterstraße 12, 12345 Berlin, hallo@toolfolio.de",
  };

  const html = priceIncreaseEmailHTML(props);
  const subject = priceIncreaseSubject(props);

  return (
    <div className="min-h-screen bg-paper p-6">
      <div className="mx-auto max-w-3xl">
        <div className="mb-4 rounded-2xl border border-border bg-card p-4 shadow-soft">
          <div className="mb-3 text-sm text-muted-foreground">
            <strong className="text-foreground">Vorschau:</strong> Preiserhöhung erkannt (E-05) – Du-Form, informativ.
          </div>
          <div className="mb-3 text-sm">
            <span className="text-muted-foreground">Betreff:</span>{" "}
            <span className="font-semibold text-foreground">{subject}</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {SOURCES.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSource(s.id)}
                className={`rounded-full border px-3 py-1.5 text-sm transition ${
                  source === s.id
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-foreground hover:bg-muted"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
        <div
          className="overflow-hidden rounded-3xl border border-border bg-card shadow-lift"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </div>
  );
}
