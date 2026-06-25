import { AlertTriangle } from "lucide-react";

/** Gemeinsame Huelle fuer Rechtsseiten (R). Entwurf-Hinweis inklusive. */
export function RechtsLayout({
  titel,
  stand,
  children,
}: {
  titel: string;
  stand: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
      <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">{titel}</h1>
      <p className="mt-2 text-sm text-muted-foreground">Stand: {stand}</p>

      <div className="mt-6 flex items-start gap-2.5 rounded-xl border border-warning/40 bg-warning/10 p-4 text-sm">
        <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" />
        <span className="text-muted-foreground">
          Entwurf. Diese Seite wird vor dem Livegang anwaltlich geprüft und vervollständigt. Mit
          [eckigen Klammern] markierte Angaben sind noch zu ergänzen.
        </span>
      </div>

      <div className="prose-toolfolio mt-8 space-y-6 text-sm leading-relaxed text-muted-foreground [&_h2]:font-display [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-foreground [&_strong]:text-foreground">
        {children}
      </div>
    </div>
  );
}
