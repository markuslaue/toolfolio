import { createFileRoute } from "@tanstack/react-router";
import { EinstellungenPlaceholder } from "@/components/toolfolio/einstellungen-shell";

export const Route = createFileRoute("/einstellungen/plan")({
  component: () => <EinstellungenPlaceholder titel="Plan & Abrechnung" />,
});
