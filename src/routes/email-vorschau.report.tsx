import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  reportEmailHTML,
  reportSubject,
  type ReportPeriod,
} from "@/components/emails/report-email";

export const Route = createFileRoute("/email-vorschau/report")({
  head: () => ({
    meta: [
      { title: "Vorschau: Wochen- / Monatsreport – Toolfolio" },
      { name: "description", content: "Interne Vorschau des Reports E-06." },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: ReportPreview,
});

const PERIODS: { id: ReportPeriod; label: string }[] = [
  { id: "monat", label: "Monatsreport" },
  { id: "woche", label: "Wochenreport" },
];

function ReportPreview() {
  const [period, setPeriod] = useState<ReportPeriod>("monat");
  const [sparse, setSparse] = useState(false);
  const [showBars, setShowBars] = useState(true);
  const [withHighlights, setWithHighlights] = useState(true);

  const props = {
    firstName: "Max",
    period,
    periodLabel: period === "monat" ? "Juni 2026" : "17.–23. Juni 2026",
    monthLabel: "Juni 2026",
    totalCost: period === "monat" ? "2.480,00 €" : "612,40 €",
    changePercent: period === "monat" ? "+4,2 %" : "-1,8 %",
    changeDirection: (period === "monat" ? "up" : "down") as "up" | "down",
    activeSubs: "17",
    aiCost: period === "monat" ? "496,60 €" : "118,20 €",
    breakdownTitle: "nach Kategorie",
    totalSaving: "420,00 €",
    opportunitiesCount: 3,
    showBars,
    sparseData: sparse,
    highlights: withHighlights
      ? [
          { text: "Anthropic API: KI-Spend 3,1x über Schnitt erkannt." },
          { text: "Notion: Preiserhöhung um 18 % erkannt." },
        ]
      : [],
    legalEntity: "Toolfolio GmbH, Musterstraße 12, 12345 Berlin, hallo@toolfolio.de",
  };

  const html = reportEmailHTML(props);
  const subject = reportSubject(props);

  return (
    <div className="min-h-screen bg-paper p-6">
      <div className="mx-auto max-w-3xl">
        <div className="mb-4 rounded-2xl border border-border bg-card p-4 shadow-soft">
          <div className="mb-3 text-sm text-muted-foreground">
            <strong className="text-foreground">Vorschau:</strong> Wochen- / Monatsreport (E-06) – Du-Form, ruhiger Digest.
          </div>
          <div className="mb-3 text-sm">
            <span className="text-muted-foreground">Betreff:</span>{" "}
            <span className="font-semibold text-foreground">{subject}</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {PERIODS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPeriod(p.id)}
                className={`rounded-full border px-3 py-1.5 text-sm transition ${
                  period === p.id
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-foreground hover:bg-muted"
                }`}
              >
                {p.label}
              </button>
            ))}
            <label className="ml-2 flex items-center gap-2 text-sm text-foreground">
              <input type="checkbox" checked={showBars} onChange={(e) => setShowBars(e.target.checked)} className="h-4 w-4" />
              Balken in Aufschlüsselung
            </label>
            <label className="flex items-center gap-2 text-sm text-foreground">
              <input type="checkbox" checked={withHighlights} onChange={(e) => setWithHighlights(e.target.checked)} className="h-4 w-4" />
              Rückblick anzeigen
            </label>
            <label className="flex items-center gap-2 text-sm text-foreground">
              <input type="checkbox" checked={sparse} onChange={(e) => setSparse(e.target.checked)} className="h-4 w-4" />
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
