import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/toolfolio/app-shell";
import { Dashboard } from "@/components/toolfolio/dashboard";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Übersicht – Toolfolio" },
      {
        name: "description",
        content:
          "Behalte alle Software-Abos und wiederkehrenden Kosten deiner Agentur an einem Ort im Blick.",
      },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  return (
    <AppShell>
      <Dashboard />
    </AppShell>
  );
}
