import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/toolfolio/app-shell";
import { BudgetForecast } from "@/components/toolfolio/budget-forecast";

export const Route = createFileRoute("/budget")({
  component: () => (
    <AppShell>
      <BudgetForecast />
    </AppShell>
  ),
});
