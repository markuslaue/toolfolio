import { SettingsNav } from "@/components/app/settings-nav";

/** Einstellungen-Huelle (B-26). Sub-Navigation fuer Profil + B-27..B-31. */
export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          Einstellungen
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Verwalte dein Profil, dein Unternehmen und deinen Plan.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[240px_1fr]">
        <SettingsNav />
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
