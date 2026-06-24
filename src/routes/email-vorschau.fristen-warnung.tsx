import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  deadlineEmailHTML,
  deadlineSubject,
  type DeadlineStage,
} from "@/components/emails/deadline-email";

export const Route = createFileRoute("/email-vorschau/fristen-warnung")({
  head: () => ({
    meta: [
      { title: "Vorschau: Fristen-Warnung – Toolfolio" },
      { name: "description", content: "Interne Vorschau der Fristen-Warnung E-02." },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: DeadlinePreview,
});

const STAGES: { id: DeadlineStage; label: string }[] = [
  { id: "30", label: "30 Tage" },
  { id: "7", label: "7 Tage" },
  { id: "2", label: "2 Tage (kritisch)" },
];

function DeadlinePreview() {
  const [stage, setStage] = useState<DeadlineStage>("7");
  const [uncertain, setUncertain] = useState(false);

  const props = {
    firstName: "Max",
    stage,
    toolName: "Ahrefs",
    deadlineDate: "12. Juli 2026",
    renewalPeriod: "ein Jahr",
    annualValue: "1.428,00 €",
    clientName: "Kunde Nordwerk",
    uncertain,
    legalEntity: "Toolfolio GmbH, Musterstraße 12, 12345 Berlin, hallo@toolfolio.de",
  };

  const html = deadlineEmailHTML(props);
  const subject = deadlineSubject(props);

  return (
    <div className="min-h-screen bg-paper p-6">
      <div className="mx-auto max-w-3xl">
        <div className="mb-4 rounded-2xl border border-border bg-card p-4 shadow-soft">
          <div className="mb-3 text-sm text-muted-foreground">
            <strong className="text-foreground">Vorschau:</strong> Fristen-Warnung (E-02) – Du-Form, mehrstufig.
          </div>
          <div className="mb-3 text-sm">
            <span className="text-muted-foreground">Betreff:</span>{" "}
            <span className="font-semibold text-foreground">{subject}</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {STAGES.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setStage(s.id)}
                className={`rounded-full border px-3 py-1.5 text-sm transition ${
                  stage === s.id
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-foreground hover:bg-muted"
                }`}
              >
                {s.label}
              </button>
            ))}
            <label className="ml-2 flex items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                checked={uncertain}
                onChange={(e) => setUncertain(e.target.checked)}
                className="h-4 w-4"
              />
              Frist als unsicher kennzeichnen
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
