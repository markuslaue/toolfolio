import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  spikeEmailHTML,
  spikeSubject,
} from "@/components/emails/spike-email";

export const Route = createFileRoute("/email-vorschau/spike-alarm")({
  head: () => ({
    meta: [
      { title: "Vorschau: Spike-Alarm – Toolfolio" },
      { name: "description", content: "Interne Vorschau des Spike-Alarms E-04." },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: SpikePreview,
});

function SpikePreview() {
  const [sparse, setSparse] = useState(false);
  const [showBars, setShowBars] = useState(true);

  const props = {
    firstName: "Max",
    toolName: "OpenAI API",
    currentSpend: "184,20 €",
    averageSpend: "92,00 €",
    deviationPercent: "+103 %",
    projectedMonth: "412,00 €",
    usualMonth: "205,00 €",
    clientName: "Kunde Nordwerk",
    showBars,
    currentBarPercent: 100,
    averageBarPercent: 48,
    sparseData: sparse,
    legalEntity: "Toolfolio GmbH, Musterstraße 12, 12345 Berlin, hallo@toolfolio.de",
  };

  const html = spikeEmailHTML(props);
  const subject = spikeSubject(props);

  return (
    <div className="min-h-screen bg-paper p-6">
      <div className="mx-auto max-w-3xl">
        <div className="mb-4 rounded-2xl border border-border bg-card p-4 shadow-soft">
          <div className="mb-3 text-sm text-muted-foreground">
            <strong className="text-foreground">Vorschau:</strong> Spike-Alarm (E-04) – Du-Form, analytisch.
          </div>
          <div className="mb-3 text-sm">
            <span className="text-muted-foreground">Betreff:</span>{" "}
            <span className="font-semibold text-foreground">{subject}</span>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                checked={showBars}
                onChange={(e) => setShowBars(e.target.checked)}
                className="h-4 w-4"
              />
              Balken-Visualisierung anzeigen
            </label>
            <label className="flex items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                checked={sparse}
                onChange={(e) => setSparse(e.target.checked)}
                className="h-4 w-4"
              />
              Datenbasis als dünn kennzeichnen
            </label>
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
