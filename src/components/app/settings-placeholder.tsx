export function SettingsPlaceholder({ titel }: { titel: string }) {
  return (
    <div className="rounded-[20px] border bg-card p-10 text-center shadow-soft">
      <h2 className="font-display text-2xl font-semibold">{titel}</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Dieser Bereich folgt in Kürze. Wir arbeiten daran.
      </p>
    </div>
  );
}
