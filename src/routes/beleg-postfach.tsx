import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/toolfolio/app-shell";
import { BelegPostfach } from "@/components/toolfolio/beleg-postfach";

export const Route = createFileRoute("/beleg-postfach")({
  head: () => ({
    meta: [
      { title: "Beleg-Postfach – Toolfolio" },
      {
        name: "description",
        content:
          "Eindeutige Inbox-Adresse für deine Rechnungen. Toolfolio ordnet sie automatisch zu, erkennt neue Abos und Preiserhöhungen.",
      },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <AppShell>
      <BelegPostfach />
    </AppShell>
  );
}
