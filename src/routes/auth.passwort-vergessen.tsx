import { createFileRoute } from "@tanstack/react-router";
import { PasswordRecoveryPage } from "@/components/auth/password-recovery-page";

export const Route = createFileRoute("/auth/passwort-vergessen")({
  head: () => ({
    meta: [
      { title: "Passwort zurücksetzen – Toolfolio" },
      { name: "description", content: "Setze dein Toolfolio-Passwort sicher zurück." },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: PasswordRecoveryPage,
});
