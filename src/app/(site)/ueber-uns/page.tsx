import type { Metadata } from "next";
import { AboutPage } from "@/components/marketing/about-page";

export const metadata: Metadata = {
  title: "Über uns: Die Idee hinter Toolfolio",
  description:
    "Toolfolio entsteht bei der OMMM GmbH in Leipzig, aus der täglichen Praxis einer eCommerce-SEO-Agentur. Unser Anspruch: Neutralität, Datenschutz und Ehrlichkeit.",
};

export default function Page() {
  return <AboutPage />;
}
