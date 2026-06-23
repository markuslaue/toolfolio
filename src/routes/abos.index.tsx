import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/toolfolio/app-shell";
import { AbosListe } from "@/components/toolfolio/abos-liste";

export const Route = createFileRoute("/abos/")({
  head: () => ({
    meta: [
      { title: "Abos – Toolfolio" },
      {
        name: "description",
        content:
          "Verwalte all deine Software-Abos an einem Ort: filtern, sortieren, gruppieren und Aktionen in Bulk ausführen.",
      },
    ],
  }),
  component: AbosPage,
});

function AbosPage() {
  return (
    <AppShell>
      <AbosListe />
    </AppShell>
  );
}
