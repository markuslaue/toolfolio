import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  type LucideIcon,
} from "lucide-react";

export type AudienceData = {
  slug: string;
  eyebrow: string;
  icon: LucideIcon;
  title: string;
  intro: string;
  pains: { title: string; body: string }[];
  features: { eyebrow: string; title: string; body: string }[];
  andere: { slug: string; label: string }[];
};

export function AudiencePage({ data }: { data: AudienceData }) {
  const Icon = data.icon;
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute -left-20 -top-32 size-[480px] rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -right-20 top-40 size-[420px] rounded-full bg-coral/15 blur-3xl" />
        </div>
        <div className="mx-auto max-w-7xl px-4 pb-12 pt-12 sm:px-6 sm:pb-16 sm:pt-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-primary">
            <Icon className="size-3.5" /> {data.eyebrow}
          </div>
          <h1 className="mt-5 max-w-3xl font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
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
          <div className="text-xs font-semibold uppercase tracking-widest text-coral">Der Alltag</div>
          <h2 className="mt-3 max-w-3xl font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            Das kennst du, wenn du so arbeitest wie wir.
          </h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.pains.map((p) => (
              <div key={p.title} className="card-lift h-full rounded-2xl border border-border bg-card p-6">
                <h3 className="font-semibold leading-snug">{p.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-secondary/50 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-xs font-semibold uppercase tracking-widest text-primary">Wie Toolfolio hilft</div>
          <h2 className="mt-3 max-w-3xl font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            Konkret gegen genau diese Probleme.
          </h2>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {data.features.map((f) => (
              <div key={f.title} className="rounded-3xl border border-border bg-card p-7">
                <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  {f.eyebrow}
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA + andere Zielgruppen */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="rounded-[28px] bg-foreground p-10 text-center text-[color:var(--paper)] sm:p-14">
            <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Bring deine Software-Kosten in Form.
            </h2>
            <p className="mx-auto mt-3 max-w-xl opacity-80">Kostenlos starten, ohne Kreditkarte.</p>
            <Link href="/registrieren" className="mt-7 inline-flex items-center gap-2 rounded-full bg-primary px-7 py-4 text-base font-semibold text-primary-foreground shadow-lift transition hover:bg-primary/90">
              Kostenlos starten <ArrowRight className="size-4" />
            </Link>
          </div>

          <div className="mt-10">
            <div className="text-sm font-semibold">Auch für dich dabei</div>
            <div className="mt-3 flex flex-wrap gap-3">
              {data.andere.map((a) => (
                <Link key={a.slug} href={`/fuer/${a.slug}`} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-accent">
                  <CheckCircle2 className="size-4 text-success" /> {a.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
