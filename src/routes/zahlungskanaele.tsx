import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/toolfolio/app-shell";
import { Zahlungskanaele } from "@/components/toolfolio/zahlungskanaele";

export const Route = createFileRoute("/zahlungskanaele")({
  head: () => ({
    meta: [
      { title: "Zahlungskanäle – Toolfolio" },
      {
        name: "description",
        content:
          "Verwalte alle Zahlungswege deiner Software-Abos. Toolfolio speichert nur Referenzen, nie vollständige Daten.",
      },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <AppShell>
      <Zahlungskanaele />
    </AppShell>
  );
}
