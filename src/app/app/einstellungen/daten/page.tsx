import type { Metadata } from "next";
import { SettingsPlaceholder } from "@/components/app/settings-placeholder";

export const metadata: Metadata = { title: "Daten & Datenschutz" };

export default function Page() {
  return <SettingsPlaceholder titel="Daten & Datenschutz" />;
}
