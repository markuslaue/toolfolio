import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/toolfolio/app-shell";
import { Benchmark } from "@/components/toolfolio/benchmark";

export const Route = createFileRoute("/benchmark")({
  head: () => ({
    meta: [
      { title: "Benchmark – Toolfolio" },
      {
        name: "description",
        content:
          "Vergleiche deinen Tool-Stack mit ähnlichen Agenturen. Anonym, aggregiert und transparent.",
      },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <AppShell>
      <Benchmark />
    </AppShell>
  );
}
