import Image from "next/image";

export type HeroBild = {
  url: string;
  autor: string | null;
  autorUrl: string | null;
  quelle: string | null;
  quelleUrl: string | null;
};

/**
 * Hintergrund im Seitenkopf einer Collection.
 *
 * Mit Bild: das Foto liegt weit hinten, unscharf und stark abgedunkelt, darueber
 * ein Verlauf, der nach unten in die Seitenfarbe laeuft. Der Text muss lesbar
 * bleiben, das Bild soll Stimmung machen, nicht konkurrieren.
 *
 * Ohne Bild: ein farbiger Verlauf plus feines Raster. Das ist kein Notbehelf,
 * sondern der Normalzustand, solange keine LIZENZIERTE Bildquelle angebunden ist.
 * Ein Foto ohne Nachweis auf hunderten oeffentlichen Seiten ist ein Abmahnrisiko.
 */
export function HeroHintergrund({ bild, akzent }: { bild: HeroBild | null; akzent: string }) {
  if (!bild) {
    return (
      <>
        <div
          aria-hidden
          className="absolute inset-0 -z-10"
          style={{
            background: `radial-gradient(58% 55% at 12% 10%, ${akzent}22, transparent 65%), radial-gradient(45% 45% at 95% 5%, #6C5CE714, transparent 60%)`,
          }}
        />
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 -z-10 h-full opacity-[0.14]"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(31,29,43,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(31,29,43,0.08) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
            maskImage: "linear-gradient(to bottom, black 30%, transparent 100%)",
          }}
        />
      </>
    );
  }

  return (
    <>
      <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden">
        <Image
          src={bild.url}
          alt=""
          fill
          priority
          sizes="100vw"
          className="scale-110 object-cover blur-[3px]"
        />

        {/* Erste Lage: das Bild grundsaetzlich beruhigen. */}
        <div className="absolute inset-0 bg-background/55" />

        {/* Zweite Lage: Farbstich des Clusters, damit die Seite zusammengehoert. */}
        <div
          className="absolute inset-0 mix-blend-multiply"
          style={{ background: `linear-gradient(120deg, ${akzent}26, transparent 60%)` }}
        />

        {/* Dritte Lage: nach unten in die Seitenfarbe auslaufen, sonst bricht die
            Kante zwischen Kopf und Inhalt hart ab. */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/70 to-background" />
      </div>

      {/* KI-Bild: kein fremder Urheber, also kein Bildnachweis. Aber es MUSS als
          KI-erzeugt gekennzeichnet sein. Ein fotorealistisches Bild, das kein Foto ist,
          unkommentiert auf eine Seite zu stellen, die von Ehrlichkeit lebt, waere ein
          kleiner Betrug an genau der Stelle, an der wir es uns am wenigsten leisten
          koennen. Der KI-Hinweis steht deshalb VOR dem Bildnachweis-Fall. */}
      {bild.quelle === "ki" && (
        <div className="pointer-events-none absolute bottom-2 right-3 z-10 text-[10px] text-foreground/40">
          Bild: KI-erzeugt
        </div>
      )}

      {/* Bildnachweis fuer fremde Fotos. Klein, aber vorhanden. Ohne ihn darf das Bild nicht raus. */}
      {bild.quelle !== "ki" && (bild.autor || bild.quelle) && (
        <div className="pointer-events-none absolute bottom-2 right-3 z-10 text-[10px] text-foreground/40">
          <span className="pointer-events-auto">
            Foto:{" "}
            {bild.autorUrl ? (
              <a href={bild.autorUrl} target="_blank" rel="noopener noreferrer nofollow" className="hover:underline">
                {bild.autor}
              </a>
            ) : (
              bild.autor
            )}
            {bild.quelle && (
              <>
                {" · "}
                {bild.quelleUrl ? (
                  <a
                    href={bild.quelleUrl}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="hover:underline"
                  >
                    {bild.quelle}
                  </a>
                ) : (
                  bild.quelle
                )}
              </>
            )}
          </span>
        </div>
      )}
    </>
  );
}
