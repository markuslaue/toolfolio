import type { Metadata } from "next";
import { EntwicklerPage } from "@/components/marketing/entwickler-page";

export const metadata: Metadata = {
  title: "Für Entwickler: Indie-SaaS fair listen",
  description:
    "Bring dein Tool vor Agenturen, Freelancer und Solopreneure mit konkreter Tool-Suche. Grund-Listung kostenlos, geprüfter Badge einmalig 49 €, keine laufenden Kosten.",
};

export default function Page() {
  return <EntwicklerPage />;
}
