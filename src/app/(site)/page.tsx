import type { Metadata } from "next";
import { MarketingHome } from "@/components/marketing/marketing-home";

// Statisch, aber alle 10 Minuten neu generieren, damit Preis-/Inhaltsaenderungen
// zeitnah durchschlagen (statt 1 Jahr s-maxage durch die SSG-Default-Cacheregel).
export const revalidate = 600;

export const metadata: Metadata = {
  title: "Toolfolio: Software-Kosten im Griff, faire Preise belegt",
  description:
    "Toolfolio bringt alle deine Software-Abos an einen Ort, warnt vor Kündigungsfristen und zeigt mit verifizierten Marktpreisen, wo du weniger zahlst. Für Agenturen, Freelancer und Solopreneure im DACH-Raum.",
};

export default function HomePage() {
  return <MarketingHome />;
}
