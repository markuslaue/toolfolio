import Image from "next/image";
import Link from "next/link";
import { Quote, Mail, Linkedin } from "lucide-react";
import type { Autor } from "@/lib/autoren";

/**
 * Statement des Fachautors zur Kategorie. Steht mitten im Content, damit klar
 * ist: hier spricht ein Mensch mit Erfahrung, nicht ein Textgenerator.
 */
export function ExpertenZitat({ autor, zitat, thema }: { autor: Autor; zitat: string; thema: string }) {
  return (
    <figure className="my-10 rounded-2xl border border-primary/20 bg-primary/5 p-6">
      <figcaption className="flex items-center gap-3">
        <Image
          src={autor.bildKlein}
          alt={autor.name}
          width={48}
          height={48}
          className="size-12 shrink-0 rounded-full object-cover"
        />
        <div className="min-w-0">
          <div className="text-sm font-semibold">Das sagt unser Experte zu {thema}</div>
          <div className="text-xs text-muted-foreground">
            {autor.freigegeben ? (
              <Link href={`/autor/${autor.slug}`} className="hover:text-foreground hover:underline">
                {autor.name}
              </Link>
            ) : (
              autor.name
            )}
            , {autor.rolle}
          </div>
        </div>
      </figcaption>

      <blockquote className="mt-4 flex gap-3">
        <Quote className="mt-1 size-5 shrink-0 text-primary/50" aria-hidden />
        <p className="leading-relaxed text-foreground">{zitat}</p>
      </blockquote>
    </figure>
  );
}

/**
 * Autorenbox unter dem Artikel. Beantwortet die Frage, die Google und Leser
 * gleichermaßen stellen: Wer sagt das, und warum kann der das beurteilen?
 */
export function AutorBox({ autor }: { autor: Autor }) {
  return (
    <aside className="mt-12 rounded-2xl border bg-card p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
        <Image
          src={autor.bild}
          alt={autor.name}
          width={96}
          height={96}
          className="size-24 shrink-0 rounded-2xl object-cover"
        />
        <div className="min-w-0 flex-1">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Über den Autor</div>
          <div className="mt-1 font-display text-lg font-semibold">
            {autor.freigegeben ? (
              <Link href={`/autor/${autor.slug}`} className="hover:underline">
                {autor.name}
              </Link>
            ) : (
              autor.name
            )}
          </div>
          <div className="text-sm text-muted-foreground">{autor.rolle}</div>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{autor.kurz}</p>

          {autor.expertise.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {autor.expertise.map((e) => (
                <span key={e} className="rounded-full bg-secondary px-2.5 py-1 text-xs text-secondary-foreground">
                  {e}
                </span>
              ))}
            </div>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
            {autor.freigegeben && (
              <Link href={`/autor/${autor.slug}`} className="font-medium text-primary hover:underline">
                Mehr über {autor.name.split(" ")[0]}
              </Link>
            )}
            {autor.email && (
              <a
                href={`mailto:${autor.email}`}
                className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
              >
                <Mail className="size-3.5" /> Schreib mir
              </a>
            )}
            {autor.linkedin && (
              <a
                href={autor.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
              >
                <Linkedin className="size-3.5" /> LinkedIn
              </a>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
