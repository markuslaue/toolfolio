import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/toolfolio/app-shell";
import { KundeDetail } from "@/components/toolfolio/kunde-detail";

export const Route = createFileRoute("/kunden/$kundeId")({
  head: () => ({
    meta: [
      { title: "Kunde – Toolfolio" },
      {
        name: "description",
        content:
          "Detailansicht eines Kunden: zugeordnete Tools, Weiterverrechnung, Aufschlag und Marge.",
      },
    ],
  }),
  component: Page,
});

function Page() {
  const { kundeId } = Route.useParams();
  return (
    <AppShell>
      <KundeDetail kundeId={kundeId} />
    </AppShell>
  );
}
