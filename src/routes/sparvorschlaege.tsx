import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/toolfolio/app-shell";
import { Sparvorschlaege } from "@/components/toolfolio/sparvorschlaege";

export const Route = createFileRoute("/sparvorschlaege")({
  head: () => ({
    meta: [
      { title: "Sparvorschläge – Toolfolio" },
      {
        name: "description",
        content:
          "Alle Sparvorschläge für deinen Tool-Stack auf einen Blick. Setz sie um und fülle deinen Spar-Fortschritt.",
      },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <AppShell>
      <Sparvorschlaege />
    </AppShell>
  );
}
