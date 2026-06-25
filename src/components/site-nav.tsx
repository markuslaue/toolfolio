"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { ToolfolioLogo } from "@/components/brand";

const navLinks = [
  { href: "/produkt", label: "Produkt" },
  { href: "/preise", label: "Preise" },
  { href: "/ueber-uns", label: "Über uns" },
  { href: "/kontakt", label: "Kontakt" },
];

/** Oeffentliche Navigation (Marketing). */
export function SiteNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" aria-label="Zur Startseite" onClick={() => setOpen(false)}>
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

        <div className="hidden items-center gap-3 md:flex">
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

        <button
          type="button"
          className="grid size-9 place-items-center rounded-lg border md:hidden"
          aria-label="Menü"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t bg-background px-4 py-3 md:hidden">
          <nav className="flex flex-col">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-accent"
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-2 flex flex-col gap-2 border-t pt-3">
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="rounded-[14px] border px-4 py-2.5 text-center text-sm font-medium"
              >
                Anmelden
              </Link>
              <Link
                href="/registrieren"
                onClick={() => setOpen(false)}
                className="rounded-[14px] bg-primary px-4 py-2.5 text-center text-sm font-semibold text-primary-foreground"
              >
                Kostenlos starten
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
