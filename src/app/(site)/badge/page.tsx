import type { Metadata } from "next";
import { BadgePage } from "@/components/marketing/badge-page";

export const metadata: Metadata = {
  title: "Vertrauens-Badge: Was er bedeutet und was nicht",
  description:
    "Der Toolfolio-Vertrauens-Badge ist ein transparentes Vertrauenssignal, kein Sicherheitssiegel. Was wir prüfen, was die Selbstauskunft abdeckt, Gültigkeit und Entzug.",
};

export default function Page() {
  return <BadgePage />;
}
