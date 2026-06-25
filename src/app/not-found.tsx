import Link from "next/link";
import { Compass, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <span className="grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">
        <Compass className="size-7" />
      </span>
      <p className="mt-6 font-display text-5xl font-bold tracking-tight">404</p>
      <h1 className="mt-2 font-display text-2xl font-semibold">Seite nicht gefunden</h1>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
        Diese Seite gibt es nicht (mehr). Vielleicht hat sie sich still verlängert und wurde dann
        doch gekündigt.
      </p>
      <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-soft transition hover:bg-primary/90"
        >
          <ArrowLeft className="size-4" /> Zur Startseite
        </Link>
        <Link
          href="/produkt"
          className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-3 text-sm font-semibold transition hover:bg-accent"
        >
          Produkt ansehen
        </Link>
      </div>
    </div>
  );
}
