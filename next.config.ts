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

const nextConfig: NextConfig = {
  // Schlankes, eigenstaendiges Server-Bundle fuer das Docker-Deployment.
  output: "standalone",
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
