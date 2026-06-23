import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/toolfolio/app-shell";
import { EinstellungenShell } from "@/components/toolfolio/einstellungen-shell";

export const Route = createFileRoute("/einstellungen")({
  component: () => (
    <AppShell>
      <EinstellungenShell />
    </AppShell>
  ),
});
