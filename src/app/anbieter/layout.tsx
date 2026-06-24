import Link from "next/link";
import { ToolfolioLogo } from "@/components/brand";

/**
 * Huelle des Anbieter-Portals (A-Templates), eigene Nutzerrolle. Auth in der
 * Middleware erzwungen. Klar als Anbieterbereich erkennbar.
 */
export default function ProviderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-1 flex-col">
      <header className="flex h-16 items-center justify-between border-b bg-card px-6">
        <div className="flex items-center gap-3">
          <Link href="/anbieter">
            <ToolfolioLogo />
          </Link>
          <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold text-primary">
            Anbieter-Portal
          </span>
        </div>
      </header>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
