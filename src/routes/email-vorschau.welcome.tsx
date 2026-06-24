import { createFileRoute } from "@tanstack/react-router";
import { welcomeEmailHTML } from "@/components/emails/welcome-email";

export const Route = createFileRoute("/email-vorschau/welcome")({
  head: () => ({
    meta: [
      { title: "Vorschau: Willkommen-E-Mail – Toolfolio" },
      { name: "description", content: "Interne Vorschau der Willkommens-E-Mail E-01." },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: WelcomeEmailPreview,
});

function WelcomeEmailPreview() {
  const html = welcomeEmailHTML({
    firstName: "Max",
    onboardingUrl: "https://toolfolio.lovable.app/onboarding",
    imprintUrl: "https://toolfolio.lovable.app/impressum",
    privacyUrl: "https://toolfolio.lovable.app/datenschutz",
    helpUrl: "https://toolfolio.lovable.app/hilfe",
    legalEntity: "Toolfolio GmbH, Musterstraße 12, 12345 Berlin, hallo@toolfolio.de",
  });

  return (
    <div className="min-h-screen bg-paper p-6">
      <div className="mx-auto max-w-3xl">
        <div className="mb-4 rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground shadow-soft">
          <strong className="text-foreground">Vorschau:</strong> Willkommen-E-Mail (E-01) – Variante mit Vorname. Der Footer enthält Platzhalterdaten.
        </div>
        <div
          className="overflow-hidden rounded-3xl border border-border bg-card shadow-lift"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </div>
  );
}
