"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { ToolfolioIcon } from "@/components/brand";

const links: Array<{
  label: string;
  href: string;
  children?: Array<{ label: string; href: string }>;
}> = [
  { label: "Produkt", href: "/produkt" },
  { label: "Verzeichnis", href: "/verzeichnis" },
  {
    label: "Für wen",
    href: "/fuer/agenturen",
    children: [
      { label: "Agenturen", href: "/fuer/agenturen" },
      { label: "Freelancer", href: "/fuer/freelancer" },
      { label: "Solopreneure", href: "/fuer/solopreneure" },
    ],
  },
  {
    label: "Vergleich",
    href: "/vergleich/excel",
    children: [
      { label: "vs. Excel", href: "/vergleich/excel" },
      { label: "vs. Sastrify / Deel IT", href: "/vergleich/sastrify" },
      { label: "vs. Cledara", href: "/vergleich/cledara" },
      { label: "vs. Spendesk", href: "/vergleich/spendesk" },
      { label: "vs. Pleo", href: "/vergleich/pleo" },
      { label: "vs. Zluri", href: "/vergleich/zluri" },
      { label: "vs. Torii", href: "/vergleich/torii" },
    ],
  },
  { label: "Preise", href: "/preise" },
  { label: "Über uns", href: "/ueber-uns" },
  { label: "Kontakt", href: "/kontakt" },
];

export function SiteNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all",
        scrolled
          ? "border-b border-border bg-[color:var(--paper)]/85 shadow-soft backdrop-blur"
          : "bg-transparent",
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className={cn("flex items-center justify-between transition-all", scrolled ? "h-14" : "h-20")}>
          <Link href="/" className="flex items-center gap-2">
            <ToolfolioIcon className="size-9" />
            <span className="font-display text-xl font-semibold tracking-tight">Toolfolio</span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {links.map((l) =>
              l.children ? (
                <div key={l.href} className="group relative">
                  <Link
                    href={l.href}
                    className="inline-flex items-center gap-1 rounded-full px-4 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-accent hover:text-foreground"
                  >
                    {l.label}
                    <svg className="size-3 opacity-60" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 4.5 6 7.5 9 4.5" />
                    </svg>
                  </Link>
                  <div className="invisible absolute left-0 top-full z-50 pt-2 opacity-0 transition-opacity group-hover:visible group-hover:opacity-100">
                    <div className="min-w-[220px] rounded-2xl border border-border bg-card p-2 shadow-lift">
                      {l.children.map((c) => (
                        <Link key={c.href} href={c.href} className="block rounded-xl px-3 py-2 text-sm font-medium text-foreground/80 hover:bg-accent hover:text-foreground">
                          {c.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <Link key={l.href} href={l.href} className="rounded-full px-4 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-accent hover:text-foreground">
                  {l.label}
                </Link>
              ),
            )}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            <Link href="/login" className="rounded-full px-4 py-2 text-sm font-medium text-foreground/80 transition-colors hover:text-foreground">
              Anmelden
            </Link>
            <Link href="/registrieren" className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft transition-all hover:bg-primary/90 hover:shadow-lift">
              Kostenlos starten <ArrowRight className="size-4" />
            </Link>
          </div>

          <button className="grid size-10 place-items-center rounded-xl border border-border bg-card md:hidden" onClick={() => setOpen((o) => !o)} aria-label="Menü">
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>

        {open && (
          <div className="space-y-1 pb-4 md:hidden">
            {links.map((l) => (
              <div key={l.href}>
                <Link href={l.href} onClick={() => setOpen(false)} className="block rounded-xl px-4 py-3 text-sm font-semibold hover:bg-accent">
                  {l.label}
                </Link>
                {l.children && (
                  <div className="ml-3 space-y-0.5 border-l border-border pl-3">
                    {l.children.map((c) => (
                      <Link key={c.href} href={c.href} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2 text-sm text-foreground/70 hover:bg-accent hover:text-foreground">
                        {c.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div className="flex gap-2 pt-2">
              <Link href="/login" onClick={() => setOpen(false)} className="flex-1 rounded-full border border-border px-4 py-2.5 text-center text-sm font-medium">
                Anmelden
              </Link>
              <Link href="/registrieren" onClick={() => setOpen(false)} className="flex-1 rounded-full bg-primary px-4 py-2.5 text-center text-sm font-semibold text-primary-foreground">
                Kostenlos starten
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
