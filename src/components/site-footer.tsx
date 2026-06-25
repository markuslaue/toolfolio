import Link from "next/link";
import { ToolfolioLogo } from "@/components/brand";

const groups = [
  {
    title: "Produkt",
    links: [
      { href: "/produkt", label: "Funktionen" },
      { href: "/preise", label: "Preise" },
      { href: "/registrieren", label: "Kostenlos starten" },
    ],
  },
  {
    title: "Unternehmen",
    links: [
      { href: "/ueber-uns", label: "Über uns" },
      { href: "/kontakt", label: "Kontakt" },
      { href: "/sicherheit", label: "Sicherheit & Datenschutz" },
    ],
  },
  {
    title: "Recht",
    links: [
      { href: "/impressum", label: "Impressum" },
      { href: "/datenschutz", label: "Datenschutz" },
      { href: "/agb", label: "AGB" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t bg-card">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 md:grid-cols-4">
        <div>
          <ToolfolioLogo />
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            Software-Kosten im Griff. Made for DACH, DSGVO-konform.
          </p>
        </div>
        {groups.map((group) => (
          <div key={group.title}>
            <h3 className="font-display text-sm font-bold text-foreground">
              {group.title}
            </h3>
            <ul className="mt-3 space-y-2">
              {group.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t">
        <p className="mx-auto max-w-6xl px-4 py-5 text-xs text-muted-foreground">
          OMMM GmbH, Leipzig. Copyright Toolfolio.
        </p>
      </div>
    </footer>
  );
}
