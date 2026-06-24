import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/toolfolio/app-shell";
import { Integrationen } from "@/components/toolfolio/integrationen";

export const Route = createFileRoute("/integrationen")({
  head: () => ({
    meta: [
      { title: "Integrationen – Toolfolio" },
      {
        name: "description",
        content:
          "Verbinde Bank, Beleg-Postfach und AI-Services per API-Key fuer Live-Verbrauch und Live-Kosten.",
      },
    ],
  }),
  component: () => (
    <AppShell>
      <Integrationen />
    </AppShell>
  ),
});
