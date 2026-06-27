import type { Metadata } from "next";
import { PricingPage } from "@/components/marketing/pricing-page";

// Alle 10 Minuten neu generieren, damit Preisaenderungen zeitnah live sind.
export const revalidate = 600;

export const metadata: Metadata = {
  title: "Preise: Toolfolio kostenlos starten",
  description:
    "Starte kostenlos ohne Kreditkarte. Free für den Überblick, Pro für unbegrenzte Abos und Benchmark, Agentur für Weiterverrechnung und Teams. 14 Tage voller Zugang zum Testen.",
};

export default function Page() {
  return <PricingPage />;
}
