import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/toolfolio/app-shell";
import { Verzeichnis } from "@/components/toolfolio/verzeichnis";

export const Route = createFileRoute("/verzeichnis")({
  head: () => ({
    meta: [
      { title: "Verzeichnis – Toolfolio" },
      {
        name: "description",
        content:
          "Finde Tools und füge sie deinem Stack hinzu. Mit Marktvergleich, Alternativen und Deals.",
      },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <AppShell>
      <Verzeichnis />
    </AppShell>
  );
}
