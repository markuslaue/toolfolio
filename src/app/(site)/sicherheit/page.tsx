import type { Metadata } from "next";
import { SecurityPage } from "@/components/marketing/security-page";

export const metadata: Metadata = {
  title: "Sicherheit & Datenschutz bei Toolfolio",
  description:
    "Toolfolio speichert bewusst so wenig wie möglich: keine Passwörter, keine vollständigen Kartennummern, nur Referenzen. EU-Hosting, anonymer Benchmark, deine DSGVO-Rechte.",
};

export default function Page() {
  return <SecurityPage />;
}
