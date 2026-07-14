import type { FaqEintrag } from "@/lib/schema";

/**
 * Die sichtbare FAQ.
 *
 * Sie speist zugleich das FAQPage-Markup, aus DERSELBEN Datenquelle. Das ist keine
 * Bequemlichkeit, sondern Pflicht: Google verlangt, dass markierter Inhalt auf der
 * Seite sichtbar ist. Zwei getrennte Quellen wuerden frueher oder spaeter
 * auseinanderlaufen, und dann waere das Markup ein Richtlinienverstoss.
 *
 * Deshalb bewusst KEIN Accordion, das die Antworten hinter JavaScript versteckt:
 * <details> ist nativ, funktioniert ohne JS, und der Text steht im HTML.
 */
export function Faq({ eintraege, thema }: { eintraege: FaqEintrag[]; thema: string }) {
  if (eintraege.length === 0) return null;

  return (
    <section className="mt-16" aria-labelledby="faq-titel">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Häufige Fragen</p>
      <h2 id="faq-titel" className="mt-2 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
        Was Betriebe uns zu {thema} am häufigsten fragen
      </h2>

      <div className="mt-6 divide-y divide-border rounded-2xl border border-border bg-card">
        {eintraege.map((f) => (
          <details key={f.frage} className="group px-5 py-4 [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer items-center justify-between gap-4 font-medium">
              <h3 className="text-base font-medium">{f.frage}</h3>
              <span className="shrink-0 text-muted-foreground transition-transform group-open:rotate-45" aria-hidden>
                +
              </span>
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{f.antwort}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
