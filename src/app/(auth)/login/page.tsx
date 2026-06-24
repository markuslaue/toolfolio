import Link from "next/link";

/** Platzhalter fuer den Login (S-01). Echte Anmeldung folgt per Skill-Pipeline. */
export default function LoginPage() {
  return (
    <div className="rounded-[20px] border bg-card p-8 shadow-sm">
      <h1 className="font-display text-2xl font-bold text-foreground">
        Willkommen zurueck
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Die echte Anmeldung (Feature S-01, mit Supabase-Auth und Google-SSO)
        folgt als naechstes.
      </p>
      <Link
        href="/"
        className="mt-6 inline-block text-sm font-medium text-primary hover:underline"
      >
        Zurueck zur Startseite
      </Link>
    </div>
  );
}
