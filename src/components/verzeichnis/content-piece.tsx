/**
 * Rendert das SEO-Content-Piece einer Collection oder eines Clusters.
 *
 * Bewusst ein eigener, winziger Renderer statt einer Abhaengigkeit: Der Text
 * kommt aus unserem eigenen Generator und nutzt nur H2, H3, Absaetze, Listen
 * und Fettung. Alles andere wird als Text ausgegeben, nicht als HTML, deshalb
 * gibt es hier auch kein dangerouslySetInnerHTML.
 */
import { ExpertenZitat } from "@/components/verzeichnis/experte";
import type { Autor } from "@/lib/autoren";

type Block =
  | { typ: "h2"; text: string; id: string }
  | { typ: "h3"; text: string; id: string }
  | { typ: "p"; text: string }
  | { typ: "ul"; punkte: string[] };

/** Ueberschriften-Anker, damit ein Inhaltsverzeichnis darauf springen kann. */
function anker(text: string): string {
  return text
    .toLowerCase()
    .replaceAll("ä", "ae")
    .replaceAll("ö", "oe")
    .replaceAll("ü", "ue")
    .replaceAll("ß", "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function parse(md: string): Block[] {
  const blocks: Block[] = [];
  let liste: string[] = [];

  const listeSchliessen = () => {
    if (liste.length > 0) {
      blocks.push({ typ: "ul", punkte: liste });
      liste = [];
    }
  };

  for (const zeile of md.split("\n")) {
    const z = zeile.trim();
    if (z === "") {
      listeSchliessen();
      continue;
    }
    if (z.startsWith("### ")) {
      listeSchliessen();
      const text = z.slice(4);
      blocks.push({ typ: "h3", text, id: anker(text) });
    } else if (z.startsWith("## ")) {
      listeSchliessen();
      const text = z.slice(3);
      blocks.push({ typ: "h2", text, id: anker(text) });
    } else if (z.startsWith("- ") || z.startsWith("* ")) {
      liste.push(z.slice(2));
    } else {
      listeSchliessen();
      blocks.push({ typ: "p", text: z });
    }
  }
  listeSchliessen();
  return blocks;
}

/** **Fettung** als React-Knoten, ohne HTML zu injizieren. */
function fett(text: string): React.ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((teil, i) =>
    teil.startsWith("**") && teil.endsWith("**") ? (
      <strong key={i} className="font-semibold text-foreground">
        {teil.slice(2, -2)}
      </strong>
    ) : (
      <span key={i}>{teil}</span>
    ),
  );
}

function Absatz({ b }: { b: Block }) {
  if (b.typ === "h2")
    return (
      <h2 id={b.id} className="mt-10 scroll-mt-24 font-display text-2xl font-semibold tracking-tight first:mt-0">
        {b.text}
      </h2>
    );
  if (b.typ === "h3")
    return (
      <h3 id={b.id} className="mt-6 scroll-mt-24 font-display text-lg font-semibold">
        {b.text}
      </h3>
    );
  if (b.typ === "ul")
    return (
      <ul className="mt-3 list-disc space-y-1.5 pl-5 text-muted-foreground">
        {b.punkte.map((p, j) => (
          <li key={j}>{fett(p)}</li>
        ))}
      </ul>
    );
  return <p className="mt-4 leading-relaxed text-muted-foreground">{fett(b.text)}</p>;
}

export function ContentPiece({
  md,
  titel,
  experte,
}: {
  md: string;
  titel?: string;
  /** Statement des Fachautors, wird mitten in den Text gesetzt. */
  experte?: { autor: Autor; zitat: string; thema: string };
}) {
  const blocks = parse(md);
  const h2 = blocks.filter((b): b is Extract<Block, { typ: "h2" }> => b.typ === "h2");

  /* Das Zitat kommt vor die DRITTE H2: Der Leser hat dann genug Kontext, um es
     einzuordnen, ist aber noch lange nicht am Ende. Gibt es weniger als drei
     Abschnitte, haengt es hinten dran. */
  let gesehen = 0;
  let zitatVor = -1;
  for (const [i, b] of blocks.entries()) {
    if (b.typ !== "h2") continue;
    gesehen += 1;
    if (gesehen === 3) {
      zitatVor = i;
      break;
    }
  }

  const zitat = experte ? (
    <ExpertenZitat autor={experte.autor} zitat={experte.zitat} thema={experte.thema} />
  ) : null;

  return (
    <section className="mt-16 border-t pt-10">
      {titel && <h2 className="sr-only">{titel}</h2>}

      {/* Inhaltsverzeichnis: hilft Lesern und gibt Google Sprungmarken. */}
      {h2.length >= 3 && (
        <nav aria-label="Inhalt" className="mb-10 rounded-2xl border bg-secondary/30 p-5">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Inhalt</div>
          <ul className="mt-3 space-y-1.5 text-sm">
            {h2.map((b) => (
              <li key={b.id}>
                <a href={`#${b.id}`} className="text-primary hover:underline">
                  {b.text}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}

      <div className="max-w-3xl">
        {blocks.map((b, i) => (
          <div key={i} className="contents">
            {i === zitatVor && zitat}
            <Absatz b={b} />
          </div>
        ))}
        {zitatVor === -1 && zitat}
      </div>
    </section>
  );
}
