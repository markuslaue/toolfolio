import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/toolfolio/app-shell";
import { Team } from "@/components/toolfolio/team";

export const Route = createFileRoute("/team")({
  component: () => (
    <AppShell>
      <Team />
    </AppShell>
  ),
});
