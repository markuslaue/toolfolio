import type { Metadata } from "next";
import { FeaturesPage } from "@/components/marketing/features-page";

export const metadata: Metadata = {
  title: "Produkt: Jede Funktion löst ein echtes Problem",
  description:
    "Vom Abo-Überblick über Trial- und Fristen-Wächter, AI-Credit-Tracker und Benchmark bis zu Weiterverrechnung und Steuer-Export. Alle Funktionen von Toolfolio.",
};

export default function Page() {
  return <FeaturesPage />;
}
