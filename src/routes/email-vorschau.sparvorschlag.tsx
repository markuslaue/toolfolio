import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  savingsEmailHTML,
  savingsSubject,
  type SavingsReason,
} from "@/components/emails/savings-email";

export const Route = createFileRoute("/email-vorschau/sparvorschlag")({
  head: () => ({
    meta: [
      { title: "Vorschau: Sparvorschlag – Toolfolio" },
      { name: "description", content: "Interne Vorschau des Sparvorschlags E-07." },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: SavingsPreview,
});

const REASONS: { id: SavingsReason; label: string; tool: string; saving: string; reasonText: string; tradeoff?: string }[] = [
  {
    id: "ungenutzt",
    label: "Ungenutzt",
    tool: "Loom",
    saving: "180,00 €",
    reasonText: "Seit 6 Wochen keine Aktivität, letzter Login im April.",
    tradeoff: "Bei einer Kündigung gehen archivierte Videos nach 30 Tagen verloren.",
  },
  {
    id: "ueberdimensioniert",
    label: "Zu viele Plätze",
    tool: "Notion",
    saving: "288,00 €",
    reasonText: "Du zahlst 8 Plätze, aktiv genutzt werden nur 3.",
  },
  {
    id: "jahreszahlung",
    label: "Jahreszahlung",
    tool: "Figma",
    saving: "144,00 €",
    reasonText: "Jahreszahlung statt monatlich spart 25 % bei gleichem Tarif.",
  },
  {
    id: "redundant",
    label: "Redundant",
    tool: "Coda",
    saving: "360,00 €",
    reasonText: "Notion und Coda decken sich in den Hauptfunktionen.",
    tradeoff: "Datenbank-Formeln in Coda lassen sich nicht 1:1 in Notion übernehmen.",
  },
  {
    id: "alternative",
    label: "Alternative",
    tool: "Linear",
    saving: "120,00 €",
    reasonText: "Vergleichbare Tools liegen im Median 20 % unter deinem Tarif.",
    tradeoff: "Ein Wechsel bedeutet eine einmalige Migration deiner Issues.",
  },
];

function SavingsPreview() {
  const [reasonId, setReasonId] = useState<SavingsReason>("ungenutzt");
  const [withClient, setWithClient] = useState(false);
  const [withTradeoff, setWithTradeoff] = useState(true);

  const current = REASONS.find((r) => r.id === reasonId)!;

  const props = {
    firstName: "Max",
    toolName: current.tool,
    yearlySaving: current.saving,
    reason: current.id,
    reasonText: current.reasonText,
    tradeoffNote: withTradeoff ? current.tradeoff : undefined,
    clientName: withClient ? "Kunde Nordwerk" : undefined,
    showAlternatives: current.id === "alternative" || current.id === "redundant",
    legalEntity: "Toolfolio GmbH, Musterstraße 12, 12345 Berlin, hallo@toolfolio.de",
  };

  const html = savingsEmailHTML(props);
  const subject = savingsSubject(props);

  return (
    <div className="min-h-screen bg-paper p-6">
      <div className="mx-auto max-w-3xl">
        <div className="mb-4 rounded-2xl border border-border bg-card p-4 shadow-soft">
          <div className="mb-3 text-sm text-muted-foreground">
            <strong className="text-foreground">Vorschau:</strong> Sparvorschlag (E-07) – Du-Form, positiv.
          </div>
          <div className="mb-3 text-sm">
            <span className="text-muted-foreground">Betreff:</span>{" "}
            <span className="font-semibold text-foreground">{subject}</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {REASONS.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setReasonId(r.id)}
                className={`rounded-full border px-3 py-1.5 text-sm transition ${
                  reasonId === r.id
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-foreground hover:bg-muted"
                }`}
              >
                {r.label}
              </button>
            ))}
            <label className="ml-2 flex items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                checked={withClient}
                onChange={(e) => setWithClient(e.target.checked)}
                className="h-4 w-4"
              />
              Kunde anzeigen
            </label>
            <label className="flex items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                checked={withTradeoff}
                onChange={(e) => setWithTradeoff(e.target.checked)}
                className="h-4 w-4"
              />
              Kompromiss-Hinweis
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
