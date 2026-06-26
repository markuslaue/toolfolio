import type { Metadata } from "next";
import { DatenForm } from "@/components/app/daten-form";

export const metadata: Metadata = { title: "Daten & Datenschutz" };

export default function Page() {
  return <DatenForm />;
}
