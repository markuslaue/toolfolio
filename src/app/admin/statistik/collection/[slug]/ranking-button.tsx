"use client";

import { useState, useTransition } from "react";
import { TrendingUp, Loader2 } from "lucide-react";
import { aktualisiereRanking } from "../../actions";

/**
 * AD-15: Der Ranking-Knopf, mit Rueckmeldung.
 *
 * Die DataForSEO-Abfrage dauert 10 bis 30 Sekunden (drei Laender nacheinander). Ohne
 * sichtbaren Zustand sieht ein Klick aus, als passiere nichts, und ein Fehler bliebe
 * voellig stumm. Deshalb: Ladeanzeige waehrend der Abfrage, und im Fehlerfall der
 * konkrete Grund statt Schweigen.
 */
export function RankingButton({ collectionId, slug, schonDa }: { collectionId: string; slug: string; schonDa: boolean }) {
  const [laeuft, start] = useTransition();
  const [fehler, setFehler] = useState<string | null>(null);

  function abfragen() {
    setFehler(null);
    start(async () => {
      const r = await aktualisiereRanking(collectionId, slug);
      if (r?.error) setFehler(r.error);
      // Bei Erfolg sorgt revalidatePath in der Action dafuer, dass die Seite die neuen
      // Zahlen zeigt. Kein manuelles Neuladen noetig.
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={abfragen}
        disabled={laeuft}
        className="inline-flex items-center gap-1.5 rounded-lg border bg-card px-3 py-1.5 text-xs font-semibold hover:bg-accent disabled:opacity-60"
      >
        {laeuft ? <Loader2 className="size-3.5 animate-spin" /> : <TrendingUp className="size-3.5" />}
        {laeuft ? "Frage Google ab …" : schonDa ? "Aktualisieren" : "Jetzt abfragen"}
      </button>
      {fehler && <span className="max-w-xs text-right text-xs text-destructive">{fehler}</span>}
    </div>
  );
}
