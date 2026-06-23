import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/toolfolio/app-shell";
import { Freigaben } from "@/components/toolfolio/freigaben";

export const Route = createFileRoute("/freigaben")({
  component: () => (
    <AppShell>
      <Freigaben />
    </AppShell>
  ),
});
