import type { Metadata } from "next";
import { DemoPage } from "@/components/marketing/demo-page";

export const metadata: Metadata = {
  title: "Demo buchen: Toolfolio persönlich kennenlernen",
  description:
    "Eine kurze, persönliche Demo, besonders für Teams mit Agentur-Plan. Wunschtermin wählen oder Anfrage senden, unverbindlich und ohne Verkaufsdruck.",
};

export default function Page() {
  return <DemoPage />;
}
