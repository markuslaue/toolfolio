import type { Metadata } from "next";
import { Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Changelog: Was bei Toolfolio neu ist",
  description:
    "Alle Verbesserungen an Toolfolio auf einen Blick. Vom Abo-Tracker über den Fristen-Wächter bis zum Dashboard.",
};

const EINTRAEGE = [
  {
    datum: "Juni 2026",
    version: "0.1",
    titel: "Tracker-Kern und Fristen-Wächter",
    punkte: [
      "Abos anlegen, bearbeiten, filtern, gruppieren und als CSV exportieren",
      "Abo-Detailseite mit Kosten, Frist und Zuordnung",
      "Fristen-Wächter: Kündigungsfristen, Trial-Enden und Kartenabläufe an einem Ort",
      "Kunden mit Weiterverrechnung und Marge, Zahlungskanäle als sichere Referenz",
      "Dashboard mit echten Kennzahlen und Kostenverteilung nach Kategorie",
      "Konto: Anmeldung, Registrierung, Passwort-Reset, E-Mail-Bestätigung, Zwei-Faktor",
    ],
  },
];

export default function ChangelogPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
      <div className="text-xs font-semibold uppercase tracking-widest text-primary">Changelog</div>
      <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
        Was neu ist.
      </h1>
      <p className="mt-4 text-muted-foreground">
        Wir bauen Toolfolio Schritt für Schritt und transparent. Hier siehst du, was zuletzt
        dazugekommen ist.
      </p>

      <div className="mt-10 space-y-8">
        {EINTRAEGE.map((e) => (
          <article key={e.version} className="rounded-[20px] border border-border bg-card p-6 shadow-soft">
            <div className="flex items-center gap-3">
              <span className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary">
                <Sparkles className="size-4" />
              </span>
              <div>
                <h2 className="font-display text-lg font-semibold">{e.titel}</h2>
                <div className="text-xs text-muted-foreground">
                  {e.datum} · Version {e.version}
                </div>
              </div>
            </div>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              {e.punkte.map((p) => (
                <li key={p} className="flex items-start gap-2">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </div>
  );
}
