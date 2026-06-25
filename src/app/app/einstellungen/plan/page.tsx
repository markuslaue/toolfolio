import type { Metadata } from "next";
import { SettingsPlaceholder } from "@/components/app/settings-placeholder";

export const metadata: Metadata = { title: "Plan & Abrechnung" };

export default function Page() {
  return <SettingsPlaceholder titel="Plan & Abrechnung" />;
}
