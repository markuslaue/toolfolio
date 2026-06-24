import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { leadEmailHTML, leadSubject } from "@/components/emails/lead-email";

export const Route = createFileRoute("/email-vorschau/lead")({
  head: () => ({
    meta: [
      { title: "Vorschau: Lead an Anbieter – Toolfolio" },
      { name: "description", content: "Interne Vorschau der Lead-Zustellung E-08." },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: LeadPreview,
});

function LeadPreview() {
  const [withMessage, setWithMessage] = useState(true);
  const [withTeam, setWithTeam] = useState(true);

  const props = {
    vendorContact: "Anna Schmidt",
    toolName: "Linear",
    leadName: "Max Mustermann",
    leadCompany: "Nordwerk GmbH",
    leadEmail: "max.mustermann@nordwerk.de",
    leadTeamSize: withTeam ? "12 Plätze" : undefined,
    leadMessage: withMessage
      ? "Hallo, wir evaluieren gerade Issue-Tracker für unser 12-köpfiges Produktteam und würden gern einen Demo-Termin in den nächsten zwei Wochen vereinbaren. Wichtig sind uns vor allem Roadmap-Views und eine GitHub-Anbindung."
      : undefined,
    receivedAt: "24. Juni 2026, 14:32 Uhr",
    discountCode: "TF-NORDWERK-15",
    legalEntity: "Toolfolio GmbH, Musterstraße 12, 12345 Berlin, hallo@toolfolio.de",
  };

  const html = leadEmailHTML(props);
  const subject = leadSubject(props);

  return (
    <div className="min-h-screen bg-paper p-6">
      <div className="mx-auto max-w-3xl">
        <div className="mb-4 rounded-2xl border border-border bg-card p-4 shadow-soft">
          <div className="mb-3 text-sm text-muted-foreground">
            <strong className="text-foreground">Vorschau:</strong> Lead an Anbieter (E-08) – professionell, Du-Form.
          </div>
          <div className="mb-3 text-sm">
            <span className="text-muted-foreground">Betreff:</span>{" "}
            <span className="font-semibold text-foreground">{subject}</span>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                checked={withMessage}
                onChange={(e) => setWithMessage(e.target.checked)}
                className="h-4 w-4"
              />
              Freitext-Nachricht anzeigen
            </label>
            <label className="flex items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                checked={withTeam}
                onChange={(e) => setWithTeam(e.target.checked)}
                className="h-4 w-4"
              />
              Teamgröße anzeigen
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
