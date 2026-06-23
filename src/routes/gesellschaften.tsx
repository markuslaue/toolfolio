import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/toolfolio/app-shell";
import { Gesellschaften } from "@/components/toolfolio/gesellschaften";

export const Route = createFileRoute("/gesellschaften")({
  component: () => (
    <AppShell>
      <Gesellschaften />
    </AppShell>
  ),
});
