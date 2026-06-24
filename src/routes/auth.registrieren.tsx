import { createFileRoute } from "@tanstack/react-router";
import { RegisterPage } from "@/components/auth/register-page";

export const Route = createFileRoute("/auth/registrieren")({
  head: () => ({
    meta: [
      { title: "Kostenlos starten – Toolfolio" },
      { name: "description", content: "Starte deinen 14-Tage-Trial bei Toolfolio. Voller Agentur-Zugang, keine Kreditkarte nötig." },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: RegisterPage,
});
