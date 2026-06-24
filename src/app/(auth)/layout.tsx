import Link from "next/link";
import { ToolfolioLogo } from "@/components/brand";

/** Auth-Huelle (S-Templates): Split-Layout, Markenpanel plus Formularkarte. */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-1">
      <div className="hidden w-1/2 flex-col justify-between bg-secondary p-12 lg:flex">
        <Link href="/">
          <ToolfolioLogo />
        </Link>
        <p className="max-w-sm font-display text-2xl font-bold text-foreground">
          Alle deine Software-Abos im Griff. Und du zahlst weniger.
        </p>
        <span className="text-sm text-muted-foreground">
          14 Tage voller Zugang, keine Kreditkarte.
        </span>
      </div>
      <div className="flex w-full items-center justify-center p-6 lg:w-1/2">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
