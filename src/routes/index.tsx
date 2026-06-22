import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/toolfolio/app-shell";
import { Dashboard } from "@/components/toolfolio/dashboard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Toolfolio – Dein Software-Cockpit" },
      {
        name: "description",
        content:
          "Behalte alle Software-Abos und wiederkehrenden Kosten deiner Agentur an einem Ort im Blick.",
      },
      { property: "og:title", content: "Toolfolio – Dein Software-Cockpit" },
      {
        property: "og:description",
        content:
          "Behalte alle Software-Abos und wiederkehrenden Kosten deiner Agentur an einem Ort im Blick.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <AppShell>
      <Dashboard />
    </AppShell>
  );
}
