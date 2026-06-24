import { createFileRoute } from "@tanstack/react-router";
import { LoginPage } from "@/components/auth/login-page";

export const Route = createFileRoute("/auth/login")({
  head: () => ({
    meta: [
      { title: "Anmelden – Toolfolio" },
      { name: "description", content: "Melde dich in deinem Toolfolio-Konto an und behalte alle Software-Abos im Griff." },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: LoginPage,
});
