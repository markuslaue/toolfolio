"use client";

import { Eye } from "lucide-react";
import { useReadOnly } from "@/components/app/read-only-context";

/**
 * Deutlicher Hinweis, dass das aktive Konto fuer den Nutzer nur lesbar ist
 * (Mitglied ohne Schreibrechte, B-25). Setzt die Erwartung, bevor ein
 * Schreibversuch serverseitig blockiert wird.
 */
export function ReadOnlyBanner() {
  const readOnly = useReadOnly();
  if (!readOnly) return null;
  return (
    <div className="flex items-center gap-2 border-b border-amber-200 bg-amber-50 px-6 py-2 text-sm text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200">
      <Eye className="size-4 shrink-0" />
      <span>
        <strong className="font-semibold">Nur-Ansicht.</strong> Du bist Mitglied in diesem Konto und kannst alle Daten ansehen, aber nicht ändern.
      </span>
    </div>
  );
}
