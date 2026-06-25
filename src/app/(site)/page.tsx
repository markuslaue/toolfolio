import Link from "next/link";

/**
 * Platzhalter-Startseite. Die vollwertige Marketing-Startseite ist Feature M-01
 * (siehe docs/blueprint/lovable-prompts/...-marketing-startseite-v2.md).
 */
export default function HomePage() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-24 text-center">
      <span className="inline-flex items-center rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-primary">
        Fundament steht (INFRA-1)
      </span>
      <h1 className="mt-6 font-display text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
        Behalte den Überblick über jede Software, die dein Geld abbucht.
        <br />
        Und zahl weniger dafür.
      </h1>
      <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
        Toolfolio bringt alle deine Software-Abos an einen Ort, warnt vor Kosten
        und Kündigungsfristen und zeigt dir, wo du bei gleicher Leistung weniger
        zahlst. Für Agenturen, Freelancer und Solopreneure im DACH-Raum.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/registrieren"
          className="rounded-[14px] bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90"
        >
          Kostenlos starten
        </Link>
        <Link
          href="/verzeichnis"
          className="rounded-[14px] border bg-card px-6 py-3 text-sm font-semibold text-foreground transition hover:bg-muted"
        >
          Verzeichnis erkunden
        </Link>
      </div>
      <p className="mt-6 text-sm text-muted-foreground">
        DSGVO-konform, keine Passwörter gespeichert, made for DACH.
      </p>
    </section>
  );
}
