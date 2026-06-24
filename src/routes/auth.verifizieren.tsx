import { createFileRoute } from "@tanstack/react-router";
import { EmailVerifyPage } from "@/components/auth/email-verify-page";

export const Route = createFileRoute("/auth/verifizieren")({
  head: () => ({
    meta: [
      { title: "E-Mail bestätigen – Toolfolio" },
      { name: "description", content: "Bestätige deine E-Mail-Adresse, um dein Toolfolio-Konto freizuschalten." },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: EmailVerifyPage,
});
