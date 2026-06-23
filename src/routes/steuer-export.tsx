import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/toolfolio/app-shell";
import { SteuerExport } from "@/components/toolfolio/steuer-export";

export const Route = createFileRoute("/steuer-export")({
  component: () => (
    <AppShell>
      <SteuerExport />
    </AppShell>
  ),
});
