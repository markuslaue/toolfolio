import Link from "next/link";
import { ArrowRight, Check, Minus } from "lucide-react";

export type Zelle = boolean | string;
export type ComparisonData = {
  slug: string;
  alt: string;
  title: string;
  intro: string;
  painBullets: { title: string; body: string }[];
  tabelle: { kriterium: string; toolfolio: Zelle; alt: Zelle }[];
  switchSteps: { title: string; body: string }[];
  andere: { slug: string; alt: string }[];
};

function Cell({ value, gut }: { value: Zelle; gut?: boolean }) {
  if (value === true)
    return (
      <span className={`inline-flex items-center gap-1.5 font-medium ${gut ? "text-success" : ""}`}>
        <Check className="size-4 text-success" /> Ja
      </span>
    );
  if (value === false)
    return (
      <span className="inline-flex items-center gap-1.5 text-muted-foreground">
        <Minus className="size-4" /> Nein
      </span>
    );
  return <span className="text-sm">{value}</span>;
}

export function ComparisonPage({ data }: { data: ComparisonData }) {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute -left-20 -top-32 size-[480px] rounded-full bg-primary/10 blur-3xl" />
        </div>
        <div className="mx-auto max-w-7xl px-4 pb-12 pt-12 sm:px-6 sm:pb-16 sm:pt-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold">
            <span className="text-primary">Toolfolio</span>
            <span className="text-muted-foreground">vs. {data.alt}</span>
          </div>
          <h1 className="mt-5 max-w-4xl font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
            {data.title}
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-muted-foreground">{data.intro}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/registrieren" className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3.5 text-base font-semibold text-primary-foreground shadow-soft transition-all hover:bg-primary/90 hover:shadow-lift">
              Kostenlos starten <ArrowRight className="size-4" />
            </Link>
            <Link href="/preise" className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3.5 text-base font-semibold transition-colors hover:bg-accent">
              Preise ansehen
            </Link>
          </div>
        </div>
      </section>

      {/* Pains */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-xs font-semibold uppercase tracking-widest text-coral">Warum wechseln</div>
          <h2 className="mt-3 max-w-3xl font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            Wo {data.alt} an Grenzen stößt.
          </h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.painBullets.map((p) => (
              <div key={p.title} className="rounded-2xl border border-border bg-card p-6">
                <div className="font-display text-lg font-semibold">{p.title}</div>
                <p className="mt-2 text-sm text-muted-foreground">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tabelle */}
      <section className="bg-secondary/50 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-xs font-semibold uppercase tracking-widest text-primary">Direkter Vergleich</div>
          <h2 className="mt-3 max-w-3xl font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            Toolfolio gegen {data.alt}, Zeile für Zeile.
          </h2>
          <div className="mt-8 overflow-x-auto rounded-2xl border border-border bg-card">
            <table className="w-full min-w-[640px] border-separate border-spacing-0 text-left text-sm">
              <thead>
                <tr className="bg-secondary/40">
                  <th className="px-5 py-3 font-semibold">Kriterium</th>
                  <th className="px-5 py-3 font-semibold text-primary">Toolfolio</th>
                  <th className="px-5 py-3 font-semibold">{data.alt}</th>
                </tr>
              </thead>
              <tbody>
                {data.tabelle.map((r) => (
                  <tr key={r.kriterium} className="border-t border-border">
                    <td className="border-t border-border px-5 py-3 font-medium">{r.kriterium}</td>
                    <td className="border-t border-border px-5 py-3"><Cell value={r.toolfolio} gut /></td>
                    <td className="border-t border-border px-5 py-3"><Cell value={r.alt} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Wechsel-Schritte */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-xs font-semibold uppercase tracking-widest text-primary">In Minuten gewechselt</div>
          <h2 className="mt-3 font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            So einfach kommst du zu Toolfolio.
          </h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {data.switchSteps.map((s, i) => (
              <div key={s.title} className="rounded-2xl border border-border bg-card p-6 shadow-soft">
                <span className="grid size-8 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">{i + 1}</span>
                <div className="mt-4 font-display text-lg font-semibold">{s.title}</div>
                <p className="mt-2 text-sm text-muted-foreground">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA + weitere Vergleiche */}
      <section className="pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="rounded-[28px] bg-foreground p-10 text-center text-[color:var(--paper)] sm:p-14">
            <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Bereit für den Wechsel?
            </h2>
            <p className="mx-auto mt-3 max-w-xl opacity-80">Kostenlos starten, ohne Kreditkarte.</p>
            <Link href="/registrieren" className="mt-7 inline-flex items-center gap-2 rounded-full bg-primary px-7 py-4 text-base font-semibold text-primary-foreground shadow-lift transition hover:bg-primary/90">
              Kostenlos starten <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="mt-10">
            <div className="font-display text-xl font-semibold">Weitere Vergleiche</div>
            <div className="mt-3 flex flex-wrap gap-3">
              {data.andere.map((c) => (
                <Link key={c.slug} href={`/vergleich/${c.slug}`} className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-accent">
                  vs. {c.alt}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
