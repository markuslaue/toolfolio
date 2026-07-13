/**
 * Rendert das SEO-Content-Piece einer Collection oder eines Clusters.
 *
 * Bewusst ein eigener, winziger Renderer statt einer Abhaengigkeit: Der Text
 * kommt aus unserem eigenen Generator und nutzt nur H2, H3, Absaetze, Listen
 * und Fettung. Alles andere wird als Text ausgegeben, nicht als HTML, deshalb
 * gibt es hier auch kein dangerouslySetInnerHTML.
 */

type Block =
  | { typ: "h2"; text: string; id: string }
  | { typ: "h3"; text: string; id: string }
  | { typ: "p"; text: string }
  | { typ: "ul"; punkte: string[] };

/** Ueberschriften-Anker, damit ein Inhaltsverzeichnis darauf springen kann. */
function anker(text: string): string {
  return text
    .toLowerCase()
    .replaceAll("ä", "ae").replaceAll("ö", "oe").replaceAll("ü", "ue").replaceAll("ß", "ss")
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

export function ContentPiece({ md, titel }: { md: string; titel?: string }) {
  const blocks = parse(md);
  const h2 = blocks.filter((b): b is Extract<Block, { typ: "h2" }> => b.typ === "h2");

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
        {blocks.map((b, i) => {
          if (b.typ === "h2")
            return (
              <h2
                key={i}
                id={b.id}
                className="mt-10 scroll-mt-24 font-display text-2xl font-semibold tracking-tight first:mt-0"
              >
                {b.text}
              </h2>
            );
          if (b.typ === "h3")
            return (
              <h3 key={i} id={b.id} className="mt-6 scroll-mt-24 font-display text-lg font-semibold">
                {b.text}
              </h3>
            );
          if (b.typ === "ul")
            return (
              <ul key={i} className="mt-3 list-disc space-y-1.5 pl-5 text-muted-foreground">
                {b.punkte.map((p, j) => (
                  <li key={j}>{fett(p)}</li>
                ))}
              </ul>
            );
          return (
            <p key={i} className="mt-4 leading-relaxed text-muted-foreground">
              {fett(b.text)}
            </p>
          );
        })}
      </div>
    </section>
  );
}
