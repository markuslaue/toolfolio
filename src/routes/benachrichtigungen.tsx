import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/toolfolio/app-shell";
import { Benachrichtigungen } from "@/components/toolfolio/benachrichtigungen";

export const Route = createFileRoute("/benachrichtigungen")({
  head: () => ({
    meta: [
      { title: "Benachrichtigungen – Toolfolio" },
      {
        name: "description",
        content:
          "Aktionen und Aktivitäten zu deinem Tool-Stack auf einen Blick. Fristen, Trials, Spikes und Verlauf.",
      },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <AppShell>
      <Benachrichtigungen />
    </AppShell>
  );
}
