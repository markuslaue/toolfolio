import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/toolfolio/app-shell";
import { Berichte } from "@/components/toolfolio/berichte";

export const Route = createFileRoute("/berichte")({
  component: () => (
    <AppShell>
      <Berichte />
    </AppShell>
  ),
});
