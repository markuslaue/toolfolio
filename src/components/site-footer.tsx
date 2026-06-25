import { Globe2 } from "lucide-react";

const cols: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Produkt",
    links: [
      { label: "Funktionen", href: "/produkt" },
      { label: "Preise", href: "/preise" },
      { label: "Changelog", href: "/changelog" },
    ],
  },
  {
    title: "Für wen",
    links: [
      { label: "Agenturen", href: "/fuer/agenturen" },
      { label: "Freelancer", href: "/fuer/freelancer" },
      { label: "Solopreneure", href: "/fuer/solopreneure" },
    ],
  },
  {
    title: "Vergleiche",
    links: [
      { label: "vs. Excel", href: "/vergleich/excel" },
      { label: "vs. Sastrify / Deel IT", href: "/vergleich/sastrify" },
      { label: "vs. Cledara", href: "/vergleich/cledara" },
      { label: "vs. Spendesk", href: "/vergleich/spendesk" },
      { label: "vs. Pleo", href: "/vergleich/pleo" },
    ],
  },
  {
    title: "Anbieter",
    links: [
      { label: "Für Anbieter", href: "/fuer-anbieter" },
      { label: "Für Entwickler", href: "/entwickler" },
      { label: "Vertrauens-Badge", href: "/badge" },
      { label: "Partner", href: "/partner" },
    ],
  },
  {
    title: "Unternehmen",
    links: [
      { label: "Über uns", href: "/ueber-uns" },
      { label: "Kontakt", href: "/kontakt" },
      { label: "Demo buchen", href: "/demo" },
      { label: "Sicherheit", href: "/sicherheit" },
    ],
  },
  {
    title: "Recht",
    links: [
      { label: "Impressum", href: "/impressum" },
      { label: "Datenschutz", href: "/datenschutz" },
      { label: "AGB", href: "/agb" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer id="footer" className="mt-auto border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_repeat(6,1fr)]">
          <div>
            <div className="flex items-center gap-2">
              <span className="grid size-9 place-items-center rounded-xl bg-primary font-display text-lg font-bold text-primary-foreground">
                T
              </span>
              <span className="font-display text-xl font-semibold">Toolfolio</span>
            </div>
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              Dein Software-Cockpit. Für Agenturen, Freelancer und Solopreneure im DACH-Raum.
            </p>
            <div className="mt-5 flex items-center gap-2">
              {["X", "in", "YT", "Rs"].map((s) => (
                <a key={s} href="#" className="grid size-9 place-items-center rounded-full border border-border text-xs font-semibold hover:bg-accent">
                  {s}
                </a>
              ))}
            </div>
          </div>
          {cols.map((c) => (
            <div key={c.title}>
              <div className="text-sm font-semibold">{c.title}</div>
              <ul className="mt-4 space-y-2">
                {c.links.map((l) => (
                  <li key={l.label}>
                    <a href={l.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground">
          <div>OMMM GmbH, Leipzig. Alle Rechte vorbehalten.</div>
          <div className="flex items-center gap-4">
            <a href="/datenschutz" className="hover:text-foreground">
              Cookie-Einstellungen
            </a>
            <span className="flex items-center gap-2">
              <Globe2 className="size-4" /> Deutsch (DACH)
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
