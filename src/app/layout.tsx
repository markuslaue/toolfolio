import type { Metadata } from "next";
import { Bricolage_Grotesque, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  // Basis fuer alle relativen URLs in Metadaten (Canonical, Open Graph).
  metadataBase: new URL("https://toolfolio.de"),
  title: {
    default: "Toolfolio - Software-Kosten im Griff",
    template: "%s | Toolfolio",
  },
  description:
    "Toolfolio bringt alle deine Software-Abos an einen Ort, warnt vor Kosten und Kündigungsfristen und zeigt, wo du bei gleicher Leistung weniger zahlst.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="de"
      className={`${bricolage.variable} ${jakarta.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
