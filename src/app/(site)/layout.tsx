import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { ConsentManager } from "@/components/consent/consent";
import { PlausibleScript } from "@/components/consent/plausible";

/** Huelle der oeffentlichen Welt: Marketing (M) und Verzeichnis (V). */
export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SiteNav />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <ConsentManager />
      <PlausibleScript />
    </>
  );
}
