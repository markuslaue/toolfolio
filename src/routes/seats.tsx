import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/toolfolio/app-shell";
import { Seats } from "@/components/toolfolio/seats";

export const Route = createFileRoute("/seats")({
  component: () => (
    <AppShell>
      <Seats />
    </AppShell>
  ),
});
