import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/toolfolio/app-shell";
import { ImportFlow } from "@/components/toolfolio/import-flow";

export const Route = createFileRoute("/import")({
  component: ImportPage,
});

function ImportPage() {
  return (
    <AppShell>
      <ImportFlow />
    </AppShell>
  );
}
