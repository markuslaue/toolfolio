import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/toolfolio/app-shell";
import { AboDetail } from "@/components/toolfolio/abo-detail";

export const Route = createFileRoute("/abos/$aboId")({
  head: () => ({
    meta: [
      { title: "Abo Detail – Toolfolio" },
      {
        name: "description",
        content:
          "Alle Details zu einem Abo: Kosten, Sparpotenzial, Kündigungsfrist, Zuordnung und Belege.",
      },
    ],
  }),
  component: AboDetailPage,
});

function AboDetailPage() {
  const { aboId } = Route.useParams();
  return (
    <AppShell>
      <AboDetail aboId={aboId} />
    </AppShell>
  );
}
