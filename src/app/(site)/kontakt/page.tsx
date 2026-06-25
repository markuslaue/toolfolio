import type { Metadata } from "next";
import { ContactPage } from "@/components/marketing/contact-page";

export const metadata: Metadata = {
  title: "Kontakt: So erreichst du Toolfolio",
  description:
    "Schreib uns. Echte Menschen lesen deine Nachricht und melden sich in der Regel innerhalb eines Werktags. Toolfolio wird von der OMMM GmbH in Leipzig betrieben.",
};

export default function Page() {
  return <ContactPage />;
}
