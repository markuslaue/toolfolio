import type { Metadata } from "next";
import { AnbieterPage } from "@/components/marketing/anbieter-page";

export const metadata: Metadata = {
  title: "Für Anbieter: Software im DACH-Verzeichnis listen",
  description:
    "Erreiche Agenturen genau dann, wenn sie nach Software suchen. Premium-Platzierung und qualifizierte Leads, bei voller Neutralität: Rang und Bewertungen sind niemals käuflich.",
};

export default function Page() {
  return <AnbieterPage />;
}
