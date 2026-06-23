import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/toolfolio/app-shell";
import { Archiv } from "@/components/toolfolio/archiv";

export const Route = createFileRoute("/archiv")({
  component: () => (
    <AppShell>
      <Archiv />
    </AppShell>
  ),
});
