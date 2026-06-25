import type { Metadata } from "next";
import { PricingPage } from "@/components/marketing/pricing-page";

export const metadata: Metadata = {
  title: "Preise: Toolfolio kostenlos starten",
  description:
    "Starte kostenlos ohne Kreditkarte. Free für den Überblick, Pro für unbegrenzte Abos und Benchmark, Agentur für Weiterverrechnung und Teams. 14 Tage voller Zugang zum Testen.",
};

export default function Page() {
  return <PricingPage />;
}
