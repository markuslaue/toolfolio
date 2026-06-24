import Link from "next/link";
import { ToolfolioLogo } from "@/components/brand";

const navLinks = [
  { href: "/produkt", label: "Produkt" },
  { href: "/verzeichnis", label: "Verzeichnis" },
  { href: "/preise", label: "Preise" },
  { href: "/ueber-uns", label: "Ueber uns" },
];

/** Oeffentliche Navigation (Marketing und Verzeichnis). Platzhalter bis M-01. */
export function SiteNav() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" aria-label="Zur Startseite">
          <ToolfolioLogo />
        </Link>
        <nav className="hidden items-center gap-7 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Anmelden
          </Link>
          <Link
            href="/registrieren"
            className="rounded-[14px] bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90"
          >
            Kostenlos starten
          </Link>
        </div>
      </div>
    </header>
  );
}
