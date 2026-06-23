import { ArrowRight, ChevronRight, HelpCircle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Nav,
  Footer,
  Reveal,
  ScreenshotFrame,
} from "@/components/marketing/marketing-home";
import type { FeatureDetail, Shot } from "@/lib/feature-details";
import { cn } from "@/lib/utils";

function SlotPreview({ shot }: { shot: Shot }) {
  if (shot.Preview) {
    const Preview = shot.Preview;
    return <Preview />;
  }
  return (
    <div className="absolute inset-0 grid place-items-center p-6 text-center">
      <div>
        <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
          <HelpCircle className="size-6" />
        </div>
        <div className="mt-3 font-display text-base font-semibold">Screenshot-Slot</div>
        <div className="mt-1 text-xs text-muted-foreground max-w-xs">
          Backend-Ansicht „{shot.caption}" einsetzen.
        </div>
      </div>
    </div>
  );
}

function Breadcrumb({ text }: { text: string }) {
  const parts = text.split("/").map((s) => s.trim());
  return (
    <nav aria-label="Breadcrumb" className="mx-auto max-w-7xl px-4 sm:px-6 pt-6">
      <ol className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
        <li>
          <a href="/" className="hover:text-foreground transition-colors">
            Toolfolio
          </a>
        </li>
        {parts.map((p, i) => (
          <li key={i} className="flex items-center gap-1.5">
            <ChevronRight className="size-3" />
            <span className={cn(i === parts.length - 1 && "text-foreground font-medium")}>
              {p}
            </span>
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function FeatureDetailPage({ data }: { data: FeatureDetail }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />

      <Breadcrumb text={data.breadcrumb} />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute -top-32 -left-20 size-[480px] rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute top-40 -right-20 size-[420px] rounded-full bg-coral/15 blur-3xl" />
        </div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-10 sm:pt-14 pb-16 sm:pb-20">
          <div className="grid lg:grid-cols-[1.05fr_1.1fr] gap-12 items-center">
            <Reveal>
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground">
                <span className="size-1.5 rounded-full bg-coral" />
                {data.eyebrow}
              </div>
              <h1 className="mt-5 font-display text-4xl sm:text-5xl lg:text-6xl font-semibold leading-[1.05] tracking-tight">
                {data.h1}
              </h1>
              <p className="mt-5 text-lg text-muted-foreground max-w-xl">{data.subline}</p>
              <div className="mt-7 flex flex-wrap gap-3">
                <a
                  href="/onboarding"
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3.5 text-base font-semibold text-primary-foreground shadow-soft hover:bg-primary/90 hover:shadow-lift transition-all"
                >
                  Kostenlos starten <ArrowRight className="size-4" />
                </a>
                <a
                  href="/features"
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3.5 text-base font-semibold hover:bg-accent transition-colors"
                >
                  Alle Funktionen
                </a>
              </div>
            </Reveal>
            <Reveal delay={150}>
              <ScreenshotFrame label={data.hero.slot} caption={data.hero.caption}>
                <SlotPreview shot={data.hero} />
              </ScreenshotFrame>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Schmerz */}
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <Reveal>
            <div className="text-xs font-semibold uppercase tracking-widest text-coral">
              Das Problem
            </div>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl font-semibold tracking-tight">
              {data.schmerz.intro}
            </h2>
            <div className="mt-6 space-y-4 text-base sm:text-lg text-muted-foreground">
              {data.schmerz.paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
            {data.schmerz.beispiel && (
              <div className="mt-8 rounded-2xl border border-[color:var(--coral)]/30 bg-[color:var(--coral)]/8 p-6">
                <div className="text-xs font-semibold uppercase tracking-widest text-coral">
                  {data.schmerz.beispiel.titel}
                </div>
                <p className="mt-2 text-base sm:text-lg leading-relaxed">
                  {data.schmerz.beispiel.text}
                </p>
              </div>
            )}
          </Reveal>
        </div>
      </section>

      {/* So funktioniert es */}
      <section className="py-20 sm:py-24 bg-secondary/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Reveal>
            <div className="max-w-2xl">
              <div className="text-xs font-semibold uppercase tracking-widest text-primary">
                So funktioniert es
              </div>
              <h2 className="mt-3 font-display text-3xl sm:text-4xl font-semibold tracking-tight">
                In wenigen Schritten zum sicheren Ergebnis.
              </h2>
            </div>
          </Reveal>

          <div className="mt-14 space-y-20 sm:space-y-24">
            {data.schritte.map((s, i) => {
              const reverse = i % 2 === 1;
              return (
                <div
                  key={i}
                  className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center"
                >
                  <Reveal className={cn(reverse && "lg:order-2")}>
                    <div>
                      <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary tabular">
                        Schritt {String(i + 1).padStart(2, "0")}
                      </span>
                      <h3 className="mt-4 font-display text-2xl sm:text-3xl font-semibold tracking-tight leading-tight">
                        {s.titel}
                      </h3>
                      <p className="mt-4 text-base sm:text-lg text-muted-foreground">
                        {s.text}
                      </p>
                    </div>
                  </Reveal>
                  <Reveal delay={120} className={cn(reverse && "lg:order-1")}>
                    <ScreenshotFrame label={s.shot.slot} caption={s.shot.caption}>
                      <SlotPreview shot={s.shot} />
                    </ScreenshotFrame>
                  </Reveal>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Was es alles kann */}
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Reveal>
            <div className="max-w-2xl">
              <div className="text-xs font-semibold uppercase tracking-widest text-primary">
                Im Detail
              </div>
              <h2 className="mt-3 font-display text-3xl sm:text-4xl font-semibold tracking-tight">
                Was {data.eyebrow} alles kann.
              </h2>
            </div>
          </Reveal>
          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.detail.map((d, i) => (
              <Reveal key={d.titel} delay={i * 50}>
                <div className="h-full rounded-2xl border border-border bg-card p-6 card-lift">
                  <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                    <d.icon className="size-5" />
                  </span>
                  <h3 className="mt-4 font-semibold">{d.titel}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{d.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Outcome */}
      <section className="py-20 sm:py-24 bg-secondary/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <Reveal>
              <div className="text-xs font-semibold uppercase tracking-widest text-success">
                Was es dir bringt
              </div>
              <h2 className="mt-3 font-display text-3xl sm:text-4xl font-semibold tracking-tight">
                Klare Ergebnisse, nicht nur Komfort.
              </h2>
              <div className="mt-5 space-y-4 text-base sm:text-lg text-muted-foreground">
                {data.outcome.paragraphs.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </Reveal>
            {data.outcome.kpis && (
              <Reveal delay={120}>
                <div className="grid sm:grid-cols-3 gap-4">
                  {data.outcome.kpis.map((k) => (
                    <div
                      key={k.label}
                      className="rounded-2xl border border-border bg-card p-6 text-center"
                    >
                      <div className="font-display text-2xl sm:text-3xl font-semibold tabular text-primary">
                        {k.wert}
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">{k.label}</div>
                    </div>
                  ))}
                </div>
              </Reveal>
            )}
          </div>
        </div>
      </section>

      {/* Zielgruppe */}
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Reveal>
            <div className="max-w-2xl">
              <div className="text-xs font-semibold uppercase tracking-widest text-primary">
                Für wen
              </div>
              <h2 className="mt-3 font-display text-3xl sm:text-4xl font-semibold tracking-tight">
                Wer am meisten profitiert.
              </h2>
            </div>
          </Reveal>
          <div className="mt-10 grid md:grid-cols-3 gap-5">
            {data.zielgruppe.map((z, i) => (
              <Reveal key={z.titel} delay={i * 80}>
                <div className="h-full rounded-3xl border border-border bg-card p-7 card-lift">
                  <h3 className="font-display text-xl font-semibold">{z.titel}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{z.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Verwandte Funktionen */}
      <section className="py-20 sm:py-24 bg-secondary/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Reveal>
            <div className="max-w-2xl">
              <div className="text-xs font-semibold uppercase tracking-widest text-primary">
                Verwandte Funktionen
              </div>
              <h2 className="mt-3 font-display text-3xl sm:text-4xl font-semibold tracking-tight">
                Passt gut zusammen mit:
              </h2>
            </div>
          </Reveal>
          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {data.related.map((r, i) => {
              const href =
                r.slug === "verzeichnis" ? "/verzeichnis" : `/features/${r.slug}`;
              return (
                <Reveal key={r.slug} delay={i * 60}>
                  <a
                    href={href}
                    className="group h-full block rounded-2xl border border-border bg-card p-6 card-lift"
                  >
                    <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                      <r.icon className="size-5" />
                    </span>
                    <div className="mt-4 font-semibold">{r.title}</div>
                    <p className="mt-1 text-sm text-muted-foreground">{r.desc}</p>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                      Mehr erfahren
                      <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </a>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <Reveal>
            <div className="text-xs font-semibold uppercase tracking-widest text-primary">
              FAQ
            </div>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl font-semibold tracking-tight">
              Häufige Fragen zu {data.eyebrow}.
            </h2>
          </Reveal>
          <Reveal delay={100}>
            <Accordion type="single" collapsible className="mt-8 rounded-2xl border border-border bg-card divide-y divide-border">
              {data.faq.map((f, i) => (
                <AccordionItem key={i} value={`faq-${i}`} className="border-0 px-5">
                  <AccordionTrigger className="text-left font-semibold py-5">
                    {f.q}
                  </AccordionTrigger>
                  <AccordionContent className="pb-5 text-base text-muted-foreground leading-relaxed">
                    {f.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Reveal>
        </div>
      </section>

      {/* Final CTA */}
      <section className="pb-20 sm:pb-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Reveal>
            <div className="relative overflow-hidden rounded-[32px] bg-foreground text-[color:var(--paper)] p-10 sm:p-16 text-center">
              <div className="absolute -top-20 -right-20 size-72 rounded-full bg-primary/40 blur-3xl" />
              <div className="absolute -bottom-20 -left-20 size-72 rounded-full bg-coral/40 blur-3xl" />
              <div className="relative">
                <h2 className="font-display text-3xl sm:text-5xl font-semibold tracking-tight">
                  Probier {data.eyebrow} kostenlos aus.
                </h2>
                <p className="mt-4 text-lg opacity-80 max-w-xl mx-auto">
                  In zehn Minuten eingerichtet. Direkt im Free-Plan enthalten.
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                  <a
                    href="/onboarding"
                    className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-4 text-base font-semibold text-primary-foreground shadow-lift hover:bg-primary/90 transition-all"
                  >
                    Kostenlos starten <ArrowRight className="size-4" />
                  </a>
                  <a
                    href="/preise"
                    className="inline-flex items-center gap-2 rounded-full border border-white/20 px-7 py-4 text-base font-semibold text-[color:var(--paper)] hover:bg-white/10 transition-all"
                  >
                    Preise ansehen
                  </a>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default FeatureDetailPage;
