/**
 * Platzhalter fuer das Dashboard (B-01). Wird per Skill-Pipeline gebaut
 * (/write-spec B-01 -> /architecture -> /frontend -> /backend -> /qa).
 */
export default function DashboardPage() {
  return (
    <div className="rounded-[20px] border bg-card p-8 shadow-sm">
      <h1 className="font-display text-2xl font-bold text-foreground">
        Dashboard
      </h1>
      <p className="mt-2 text-muted-foreground">
        Die vollwertige Übersicht (Feature B-01) folgt. Hier laufen Gesamtkosten,
        Fristen, KI-Kosten und der Spar-Fortschritt zusammen.
      </p>
    </div>
  );
}
