import type { NextConfig } from "next";

// Basis-Security-Header. Eine vollstaendige CSP folgt beim ersten Deploy
// (siehe docs/production/security-headers.md).
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

/* Die Hero-Bilder des Verzeichnisses liegen im Supabase-Storage. Ohne diesen Eintrag
   weigert sich next/image, sie zu laden, und der Seitenkopf bliebe leer. Bewusst nur
   der eine Host und nur unser Bucket: eine offene Bild-Domain waere ein offener Proxy,
   ueber den Fremde unsere Bandbreite verbrauchen koennten. */
const supabaseHost = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").hostname;
  } catch {
    return undefined;
  }
})();

const nextConfig: NextConfig = {
  // Schlankes, eigenstaendiges Server-Bundle fuer das Docker-Deployment.
  output: "standalone",
  images: supabaseHost
    ? {
        remotePatterns: [
          {
            protocol: "https",
            hostname: supabaseHost,
            pathname: "/storage/v1/object/public/**",
          },
        ],
      }
    : undefined,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
