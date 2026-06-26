import Script from "next/script";

/**
 * Cookielose Reichweitenmessung mit Plausible. Laedt nur, wenn die Domain in der
 * Umgebung gesetzt ist. Cookielos und ohne personenbezogene Profile -> kein Consent noetig.
 */
export function PlausibleScript() {
  const domain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
  if (!domain) return null;
  return <Script defer data-domain={domain} src="https://plausible.io/js/script.js" strategy="afterInteractive" />;
}
