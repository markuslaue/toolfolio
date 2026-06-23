import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/toolfolio/app-shell";
import { Fristen } from "@/components/toolfolio/fristen";

export const Route = createFileRoute("/fristen")({
  head: () => ({
    meta: [
      { title: "Fristen-Wächter – Toolfolio" },
      {
        name: "description",
        content:
          "Alle Kündigungs- und Vertragsfristen auf einen Blick. Damit sich kein Vertrag still verlängert.",
      },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <AppShell>
      <Fristen />
    </AppShell>
  );
}
