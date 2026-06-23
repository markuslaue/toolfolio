import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/toolfolio/app-shell";
import { AiCredits } from "@/components/toolfolio/ai-credits";

export const Route = createFileRoute("/ai-credits")({
  head: () => ({
    meta: [
      { title: "AI-Credits & variable Kosten – Toolfolio" },
      {
        name: "description",
        content:
          "Verbrauchsbasierte Kosten im Blick. Spikes, Auto-Recharges, verfallendes Guthaben und Budgets für KI-APIs und Credit-Tools.",
      },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <AppShell>
      <AiCredits />
    </AppShell>
  );
}
