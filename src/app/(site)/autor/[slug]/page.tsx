import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Mail, Linkedin, ArrowRight } from "lucide-react";
import { AUTOREN, getAutor } from "@/lib/autoren";

export const revalidate = 3600;

/** Nur freigegebene Autoren bekommen eine Seite. Eine Vita mit Platzhaltern geht nicht live. */
export function generateStaticParams() {
  return Object.values(AUTOREN)
    .filter((a) => a.freigegeben)
    .map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const autor = getAutor(slug);
  if (!autor || !autor.freigegeben) return { title: "Nicht gefunden", robots: { index: false } };
  return {
    title: `${autor.name}: ${autor.rolle}`,
    description: autor.kurz,
    openGraph: { images: [autor.bild], type: "profile" },
  };
}

export default async function AutorSeite({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const autor = getAutor(slug);
  // Nicht freigegeben heisst: existiert oeffentlich nicht.
  if (!autor || !autor.freigegeben) notFound();

  const person = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: autor.name,
    jobTitle: autor.rolle,
    description: autor.kurz,
    image: `https://toolfolio.de${autor.bild}`,
    url: `https://toolfolio.de/autor/${autor.slug}`,
    knowsAbout: autor.expertise,
    ...(autor.email ? { email: autor.email } : {}),
    ...(autor.linkedin ? { sameAs: [autor.linkedin] } : {}),
    worksFor: { "@type": "Organization", name: "OMMM GmbH", url: "https://toolfolio.de" },
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(person) }} />

      <header className="flex flex-col gap-6 sm:flex-row sm:items-center">
        <Image
          src={autor.bild}
          alt={autor.name}
          width={140}
          height={140}
          priority
          className="size-32 shrink-0 rounded-3xl object-cover sm:size-36"
        />
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">{autor.name}</h1>
          <p className="mt-1 text-muted-foreground">{autor.rolle}</p>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
            {autor.email && (
              <a
                href={`mailto:${autor.email}`}
                className="inline-flex items-center gap-1.5 text-primary hover:underline"
              >
                <Mail className="size-4" /> {autor.email}
              </a>
            )}
            {autor.linkedin && (
              <a
                href={autor.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-primary hover:underline"
              >
                <Linkedin className="size-4" /> LinkedIn
              </a>
            )}
          </div>
        </div>
      </header>

      <div className="mt-10 max-w-2xl">
        {autor.bio.map((absatz, i) => (
          <p key={i} className="mt-4 leading-relaxed text-muted-foreground first:mt-0">
            {absatz}
          </p>
        ))}
      </div>

      <section className="mt-10">
        <h2 className="font-display text-lg font-semibold">Schwerpunkte</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {autor.expertise.map((e) => (
            <span key={e} className="rounded-full bg-secondary px-3 py-1.5 text-sm text-secondary-foreground">
              {e}
            </span>
          ))}
        </div>
      </section>

      <section className="mt-10 rounded-2xl border bg-secondary/30 p-6">
        <h2 className="font-display text-lg font-semibold">Wofür {autor.name.split(" ")[0]} schreibt</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Im Toolfolio-Verzeichnis ordnet er Software-Kategorien ein: welche Funktionen wirklich zählen, welche
          Preismodelle üblich sind und wo die teuren Fehler lauern. Die Einschätzungen stützen sich auf echte
          Abrechnungsdaten, nicht auf Herstellerangaben.
        </p>
        <Link
          href="/verzeichnis"
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
        >
          Zum Verzeichnis <ArrowRight className="size-4" />
        </Link>
      </section>
    </div>
  );
}
