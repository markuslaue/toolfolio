import { createFileRoute } from "@tanstack/react-router";
import { EinstellungenProfil } from "@/components/toolfolio/einstellungen-profil";

export const Route = createFileRoute("/einstellungen/")({
  component: EinstellungenProfil,
});
