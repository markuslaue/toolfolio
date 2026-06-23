import { createFileRoute } from "@tanstack/react-router";
import { EinstellungenPlaceholder } from "@/components/toolfolio/einstellungen-shell";

export const Route = createFileRoute("/einstellungen/benachrichtigungen")({
  component: () => <EinstellungenPlaceholder titel="Benachrichtigungen" />,
});
