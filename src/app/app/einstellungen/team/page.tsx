import type { Metadata } from "next";
import { SettingsPlaceholder } from "@/components/app/settings-placeholder";

export const metadata: Metadata = { title: "Team & Rollen" };

export default function Page() {
  return <SettingsPlaceholder titel="Team & Rollen" />;
}
