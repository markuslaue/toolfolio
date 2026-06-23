import { createFileRoute } from "@tanstack/react-router";
import { OnboardingWizard } from "@/components/toolfolio/onboarding-wizard";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Toolfolio – Einrichtung" },
      {
        name: "description",
        content:
          "Richte dein Toolfolio in wenigen Minuten ein und behalte alle Software-Abos im Blick.",
      },
    ],
  }),
  component: OnboardingPage,
});

function OnboardingPage() {
  return <OnboardingWizard />;
}
