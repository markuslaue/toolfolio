import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/toolfolio/app-shell";
import { Kunden } from "@/components/toolfolio/kunden";

export const Route = createFileRoute("/kunden/")({
  head: () => ({
    meta: [
      { title: "Kunden – Toolfolio" },
      {
        name: "description",
        content:
          "Verwalte deine Kunden und sieh, welche Toolkosten du weiterverrechnest und welche du selbst trägst.",
      },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <AppShell>
      <Kunden />
    </AppShell>
  );
}
