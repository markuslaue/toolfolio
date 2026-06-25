"use client";

import { useState } from "react";
import {
  ArrowRight,
  Sparkles,
  Star,
  Search,
  CheckCircle2,
  ShieldCheck,
  Lock,
  BarChart3,
  Megaphone,
  Image as ImageIcon,
  Target,
  ClipboardCheck,
  Crown,
  Zap,
  Send,
  HelpCircle,
} from "lucide-react";
import { Reveal } from "@/components/marketing/marketing-home";
import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const stats = [
  { value: "[X.XXX]", label: "aktive Nutzer in DACH" },
  { value: "[XX.XXX]", label: "Vergleiche pro Monat" },
  { value: "[XX %]", label: "wechseln innerhalb von 90 Tagen" },
  { value: "[XX %]", label: "Agenturen & Freelancer" },
];

const offers = [
  { icon: Crown, title: "Premium-Platzierung", text: "Hervorgehobene Sichtbarkeit in deiner Kategorie. Immer klar als gesponsert gekennzeichnet, nie versteckt." },
  { icon: ImageIcon, title: "Erweitertes Profil", text: "Reichhaltiges Listing mit Medien, Beschreibung, Funktionen und Link zu deinem Angebot." },
  { icon: Target, title: "Qualifizierte Leads", text: "Direkter Kontakt zu Agenturen, die aktiv vergleichen oder ihren Stack neu sortieren." },
  { icon: BarChart3, title: "Einblicke", text: "Sieh, wie oft dein Profil aufgerufen, verglichen und geklickt wurde. [Reporting-Beispiel]" },
];

const PRICES = { basis: "0 €", premium: "[ab 199 € / Monat]", firstAccess: "[ab 499 € / Monat]" };

const plans = [
  { name: "Basis-Listing", price: PRICES.basis, note: "Profil beanspruchen und pflegen", points: ["Profil beanspruchen", "Logo, Beschreibung, Link", "Erscheint im Verzeichnis", "Keine Hervorhebung"], cta: "Profil beanspruchen", highlight: false },
  { name: "Premium-Platzierung", price: PRICES.premium, note: "Sichtbar in der richtigen Kategorie", points: ["Hervorgehobene Platzierung", "Erweitertes Profil mit Medien", "Sichtbarkeits-Statistiken", "Immer als gesponsert markiert"], cta: "Platzierung anfragen", highlight: true },
  { name: "First Access", price: PRICES.firstAccess, note: "Früher Zugriff auf passende Leads", points: ["Alles aus Premium", "Früher Lead-Zugriff", "Persönliche Beratung", "Quartals-Reporting"], cta: "Anfragen", highlight: false },
];

const steps = [
  { icon: ClipboardCheck, title: "Profil beanspruchen", text: "Dein Tool ist vermutlich schon im Verzeichnis. Beanspruche dein Profil kostenlos." },
  { icon: Crown, title: "Paket wählen", text: "Bleib auf Basis oder wähle Premium-Platzierung bzw. First Access." },
  { icon: ImageIcon, title: "Profil pflegen", text: "Beschreibung, Medien, Funktionen, Links. Aktualisiere alles, was Käufer wissen sollten." },
  { icon: Target, title: "Leads & Einblicke", text: "Erhalte qualifizierte Kontakte und sieh in den Statistiken, was funktioniert." },
];

const faqs = [
  { q: "Kann ich meine Bewertungen oder meinen Benchmark-Rang beeinflussen?", a: "Nein. Bewertungen und verifizierte Preisdaten sind nicht käuflich. Auch der Benchmark-Rang ergibt sich aus echten, anonymisierten Nutzerdaten und lässt sich nicht erkaufen. Käuflich ist ausschliesslich Sichtbarkeit, und gesponsertes ist immer als solches gekennzeichnet." },
  { q: "Wie werden Leads generiert?", a: "Toolfolio-Nutzer vergleichen aktiv Tools und sehen in ihrem Tracker, wo sie zu viel zahlen oder eine bessere Alternative existiert. Wenn ein Nutzer Interesse an deinem Tool zeigt, kannst du als Anbieter im Premium- oder First-Access-Paket eine Anfrage erhalten. Nutzer entscheiden selbst, wann ein Kontakt entsteht." },
  { q: "Was kostet eine Platzierung?", a: "Die Preise auf dieser Seite sind Platzhalter. Final richten sich Pakete nach Kategorie, Zeitraum und gewünschtem Lead-Volumen. Frag uns einfach an, wir machen dir ein konkretes Angebot." },
  { q: "Wie wird Gesponsertes gekennzeichnet?", a: "Jede Premium-Platzierung trägt eine klar sichtbare Markierung als gesponsert. Sie steht direkt am Listing, nicht im Kleingedruckten, und ist niemals als organisches Ergebnis getarnt." },
  { q: "Wie beanspruche ich mein Profil?", a: "Schreib uns kurz über das Anfrage-Formular oder die Kontaktseite. Wir prüfen die Berechtigung und schalten dir die Profilverwaltung frei. Das Beanspruchen selbst ist kostenlos." },
];

function isValidEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

export function AnbieterPage() {
  const [form, setForm] = useState({ name: "", email: "", company: "", tool: "", interest: "premium", message: "", consent: false });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = "Bitte gib deinen Namen an.";
    if (!form.email.trim()) next.email = "Bitte gib deine E-Mail an.";
    else if (!isValidEmail(form.email)) next.email = "Diese E-Mail sieht nicht gültig aus.";
    if (!form.company.trim()) next.company = "Bitte gib das Unternehmen an.";
    if (!form.tool.trim()) next.tool = "Bitte nenne dein Tool.";
    if (!form.consent) next.consent = "Bitte bestätige die Einwilligung.";
    setErrors(next);
    if (Object.keys(next).length === 0) setSent(true);
  }

  const inputBase =
    "w-full rounded-2xl border border-border bg-[color:var(--paper)] px-4 py-3 text-sm text-foreground placeholder:text-foreground/40 transition-shadow focus:outline-none focus:ring-4 focus:ring-primary/15 focus:border-primary";

  return (
    <div className="bg-[color:var(--paper)] text-foreground">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -left-20 -top-32 h-[520px] w-[520px] rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -top-10 right-0 h-[420px] w-[420px] rounded-full bg-coral/10 blur-3xl" />
        </div>
        <div className="mx-auto max-w-7xl px-4 pb-10 pt-12 sm:px-6 sm:pb-16 sm:pt-20">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-foreground/70">
              <Megaphone className="size-3.5 text-primary" /> Für Software-Anbieter
            </span>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="mt-5 max-w-4xl font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl">
              Erreiche Agenturen <span className="text-primary">genau dann</span>, wenn sie nach Software suchen.
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-foreground/70">
              Toolfolio-Nutzer vergleichen aktiv, kennen ihre Kosten und wechseln, wenn sich etwas Besseres lohnt. Genau hier zeigst du dich, mit Premium-Platzierung und qualifizierten Leads.
            </p>
          </Reveal>
          <Reveal delay={220}>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a href="#anfragen" className="inline-flex items-center gap-1.5 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-soft transition-all hover:bg-primary/90 hover:shadow-lift">Platzierung anfragen <ArrowRight className="size-4" /></a>
              <a href="#so-funktionierts" className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-6 py-3 text-sm font-semibold transition-colors hover:bg-accent">So funktioniert es</a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ZIELGRUPPE */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
        <Reveal><h2 className="max-w-3xl font-display text-3xl font-semibold tracking-tight sm:text-4xl">Wer hier sucht, will <span className="text-primary">wechseln</span>.</h2></Reveal>
        <Reveal delay={80}><p className="mt-4 max-w-2xl text-base leading-relaxed text-foreground/70">DACH-Agenturen, Freelancer und Solopreneure. Sie sehen in ihrem Tracker, was sie monatlich für Software zahlen, wo sie zu viel zahlen und welche Alternativen besser passen. Das sind keine zufälligen Besucher, sondern Käufer mit konkreter Wechselabsicht.</p></Reveal>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s, i) => (
            <Reveal key={s.label} delay={60 + i * 40}>
              <div className="card-lift rounded-3xl border border-border bg-card p-6 shadow-soft">
                <div className="font-display text-3xl font-semibold tabular text-primary">{s.value}</div>
                <p className="mt-2 text-sm leading-relaxed text-foreground/70">{s.label}</p>
                <p className="mt-3 text-[10px] uppercase tracking-wide text-foreground/45">Platzhalter</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* SCHON GELISTET */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 sm:pb-20">
        <Reveal>
          <div className="rounded-[28px] border border-border bg-card p-6 shadow-soft sm:p-10">
            <div className="grid items-center gap-8 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <span className="inline-flex items-center gap-2 rounded-full bg-success/10 px-3 py-1 text-xs font-semibold text-success"><CheckCircle2 className="size-3.5" /> Wahrscheinlich schon dabei</span>
                <h2 className="mt-4 font-display text-2xl font-semibold tracking-tight sm:text-3xl">Dein Tool ist vermutlich bereits im Verzeichnis.</h2>
                <p className="mt-3 text-base leading-relaxed text-foreground/70">Toolfolios Verzeichnis ist umfassend. Du kannst dein Profil <strong>kostenlos beanspruchen</strong> und pflegen, oder mit einer Premium-Platzierung deutlich mehr daraus machen.</p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <a href="#anfragen" className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft transition-all hover:bg-primary/90 hover:shadow-lift">Profil beanspruchen <ArrowRight className="size-4" /></a>
                  <a href="/verzeichnis" className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-accent"><Search className="size-4" /> Verzeichnis ansehen</a>
                </div>
              </div>
              <div className="lg:col-span-5">
                <div className="rounded-2xl border border-dashed border-border bg-[color:var(--paper)] p-5">
                  <div className="text-xs font-semibold uppercase tracking-wide text-foreground/50">Beispiel-Listing</div>
                  <div className="mt-3 flex items-center gap-3">
                    <div className="grid size-12 place-items-center rounded-xl bg-primary/10 font-display font-semibold text-primary">[Logo]</div>
                    <div>
                      <div className="font-display font-semibold">[Dein Tool]</div>
                      <div className="text-xs text-foreground/60">Kategorie: [z. B. SEO]</div>
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-foreground/70">[Kurzbeschreibung, was dein Tool macht und für wen es ideal ist.]</p>
                  <div className="mt-3 flex items-center gap-2 text-xs text-foreground/60">
                    <Star className="size-3.5 text-[color:var(--warning)]" />
                    <span className="tabular">[4,X]</span>
                    <span className="text-foreground/40">·</span>
                    <span>[XX] Bewertungen</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* WAS DU BEKOMMST */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 sm:pb-20">
        <Reveal>
          <h2 className="max-w-3xl font-display text-3xl font-semibold tracking-tight sm:text-4xl">Was du bekommst.</h2>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-foreground/70">Sichtbarkeit, ein Profil, das Käufer überzeugt, und Leads von Menschen, die wirklich kaufen wollen.</p>
        </Reveal>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {offers.map((o, i) => (
            <Reveal key={o.title} delay={60 + i * 50}>
              <div className="card-lift h-full rounded-3xl border border-border bg-card p-6 shadow-soft">
                <span className="grid size-11 place-items-center rounded-2xl bg-primary/10 text-primary"><o.icon className="size-5" /></span>
                <div className="mt-4 font-display text-lg font-semibold">{o.title}</div>
                <p className="mt-2 text-sm leading-relaxed text-foreground/70">{o.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* NEUTRALITÄT */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 sm:pb-20">
        <Reveal>
          <div className="rounded-[28px] border border-border bg-gradient-to-br from-primary/5 via-card to-coral/5 p-6 shadow-soft sm:p-10">
            <div className="flex items-start gap-3">
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary"><ShieldCheck className="size-6" /></span>
              <div>
                <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">Warum unsere Neutralität dein <span className="text-primary">Vorteil</span> ist.</h2>
                <p className="mt-3 max-w-3xl text-base leading-relaxed text-foreground/75">Genau weil sich niemand nach oben kaufen kann, vertrauen Käufer dem Verzeichnis. Und genau deshalb sind die Leads, die du hier bekommst, echtes Geld wert.</p>
              </div>
            </div>
            <div className="mt-8 grid gap-4 lg:grid-cols-2">
              <div className="rounded-2xl border border-border bg-card p-6">
                <div className="flex items-center gap-2 font-display text-base font-semibold"><CheckCircle2 className="size-5 text-success" /> Käuflich</div>
                <ul className="mt-3 space-y-2 text-sm text-foreground/75">
                  <li>Premium-Platzierung in deiner Kategorie</li>
                  <li>Erweitertes Profil mit Medien und Inhalten</li>
                  <li>Sichtbarkeit in passenden Kontexten</li>
                </ul>
                <p className="mt-3 text-xs text-foreground/55">Alles Gesponserte ist immer klar als solches gekennzeichnet.</p>
              </div>
              <div className="rounded-2xl border border-border bg-card p-6">
                <div className="flex items-center gap-2 font-display text-base font-semibold"><Lock className="size-5 text-coral" /> Niemals käuflich</div>
                <ul className="mt-3 space-y-2 text-sm text-foreground/75">
                  <li>Nutzerbewertungen</li>
                  <li>Verifizierte Preisdaten</li>
                  <li>Benchmark-Rang aus echten, anonymen Nutzungsdaten</li>
                </ul>
                <p className="mt-3 text-xs text-foreground/55">Kein Paket, keine Verhandlung, keine Ausnahme.</p>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* SO FUNKTIONIERT ES */}
      <section id="so-funktionierts" className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 sm:pb-20">
        <Reveal><h2 className="max-w-3xl font-display text-3xl font-semibold tracking-tight sm:text-4xl">So funktioniert es.</h2></Reveal>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <Reveal key={s.title} delay={60 + i * 50}>
              <div className="card-lift h-full rounded-3xl border border-border bg-card p-6 shadow-soft">
                <div className="flex items-center gap-3">
                  <span className="grid size-9 place-items-center rounded-xl bg-accent font-display font-semibold text-primary">{i + 1}</span>
                  <s.icon className="size-5 text-primary" />
                </div>
                <div className="mt-4 font-display text-lg font-semibold">{s.title}</div>
                <p className="mt-2 text-sm leading-relaxed text-foreground/70">{s.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* PAKETE */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 sm:pb-20">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">Pakete.</h2>
              <p className="mt-2 max-w-2xl text-base leading-relaxed text-foreground/70">Drei Stufen, drei klare Versprechen. Preise sind aktuell <strong>Platzhalter</strong> und werden bei Anfrage konkretisiert.</p>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full border border-dashed border-border bg-card px-3 py-1 text-xs font-semibold text-foreground/60">Preise = Hypothese</span>
          </div>
        </Reveal>
        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {plans.map((p, i) => (
            <Reveal key={p.name} delay={60 + i * 60}>
              <div className={cn("card-lift relative h-full rounded-3xl border bg-card p-6 shadow-soft sm:p-7", p.highlight ? "border-primary shadow-lift" : "border-border")}>
                {p.highlight && <span className="absolute -top-3 left-6 inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-[11px] font-semibold text-primary-foreground"><Sparkles className="size-3" /> Empfohlen</span>}
                <div className="font-display text-xl font-semibold">{p.name}</div>
                <div className="mt-2 font-display text-3xl font-semibold tabular">{p.price}</div>
                <p className="text-xs text-foreground/55">{p.note}</p>
                <ul className="mt-5 space-y-2 text-sm text-foreground/75">
                  {p.points.map((pt) => (<li key={pt} className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" /><span>{pt}</span></li>))}
                </ul>
                <a href="#anfragen" className={cn("mt-6 inline-flex w-full items-center justify-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-semibold transition-all", p.highlight ? "bg-primary text-primary-foreground shadow-soft hover:bg-primary/90 hover:shadow-lift" : "border border-border bg-card hover:bg-accent")}>{p.cta} <ArrowRight className="size-4" /></a>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 sm:pb-20">
        <Reveal>
          <div className="rounded-[28px] border border-border bg-card p-6 shadow-soft sm:p-10">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">Anbieter, die wir hier zeigen werden.</h2>
              <span className="text-[10px] uppercase tracking-wide text-foreground/45">Alle Logos & Stimmen Platzhalter</span>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="grid aspect-[3/1] place-items-center rounded-2xl border border-dashed border-border bg-[color:var(--paper)] text-xs font-medium text-foreground/40">[Logo {i + 1}]</div>
              ))}
            </div>
            <div className="mt-8 grid gap-4 lg:grid-cols-2">
              {[1, 2].map((i) => (
                <div key={i} className="rounded-2xl border border-border bg-[color:var(--paper)] p-6">
                  <p className="text-sm leading-relaxed text-foreground/75">[Platzhalter-Zitat eines Anbieters, das beschreibt, wie qualifiziert die Leads aus Toolfolio sind.]</p>
                  <div className="mt-4 flex items-center gap-3">
                    <div className="grid size-9 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-primary">[X]</div>
                    <div className="text-xs">
                      <div className="font-semibold">[Name, Rolle]</div>
                      <div className="text-foreground/55">[Anbieter]</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* ANFRAGE */}
      <section id="anfragen" className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 sm:pb-24">
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Reveal><span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-foreground/70"><Zap className="size-3.5 text-primary" /> Platzierung anfragen</span></Reveal>
            <Reveal delay={60}><h2 className="mt-4 font-display text-3xl font-semibold tracking-tight sm:text-4xl">Lass uns kurz sprechen.</h2></Reveal>
            <Reveal delay={120}><p className="mt-3 text-base leading-relaxed text-foreground/70">Erzähl uns, welches Tool du anbietest und was du erreichen willst. Wir melden uns in der Regel innerhalb eines Werktags mit einem konkreten Vorschlag.</p></Reveal>
            <Reveal delay={180}>
              <ul className="mt-6 space-y-3 text-sm text-foreground/75">
                <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 size-4 text-success" /> Kostenloses, unverbindliches Erstgespräch</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 size-4 text-success" /> Profil-Check und Sichtbarkeitspotenzial</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 size-4 text-success" /> Transparente Konditionen, keine Lock-ins</li>
              </ul>
            </Reveal>
          </div>
          <div className="lg:col-span-7">
            <Reveal delay={80}>
              <div className="rounded-[28px] border border-border bg-card p-6 shadow-lift sm:p-8">
                {sent ? (
                  <div className="py-10 text-center">
                    <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-success/15 text-success"><CheckCircle2 className="size-8" /></div>
                    <h3 className="mt-5 font-display text-2xl font-semibold">Danke für deine Anfrage.</h3>
                    <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-foreground/70">Wir haben sie als Mock erhalten und melden uns in der echten Umsetzung bei {form.email || "deiner Adresse"} mit einem konkreten Vorschlag.</p>
                  </div>
                ) : (
                  <>
                    <div className="mb-5">
                      <h3 className="font-display text-xl font-semibold">Kurze Anfrage als Anbieter</h3>
                      <p className="mt-1 text-sm text-foreground/65">Keine echte Übermittlung im Demo-Modus.</p>
                    </div>
                    <form onSubmit={submit} noValidate className="space-y-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="mb-1.5 block text-xs font-semibold text-foreground/75">Dein Name</label>
                          <input type="text" value={form.name} maxLength={100} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Vor- und Nachname" className={inputBase} />
                          {errors.name && <p className="mt-1 text-xs text-[color:var(--destructive)]">{errors.name}</p>}
                        </div>
                        <div>
                          <label className="mb-1.5 block text-xs font-semibold text-foreground/75">Geschäftliche E-Mail</label>
                          <input type="email" value={form.email} maxLength={255} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="name@firma.de" className={inputBase} />
                          {errors.email && <p className="mt-1 text-xs text-[color:var(--destructive)]">{errors.email}</p>}
                        </div>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="mb-1.5 block text-xs font-semibold text-foreground/75">Unternehmen</label>
                          <input type="text" value={form.company} maxLength={120} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Firmenname" className={inputBase} />
                          {errors.company && <p className="mt-1 text-xs text-[color:var(--destructive)]">{errors.company}</p>}
                        </div>
                        <div>
                          <label className="mb-1.5 block text-xs font-semibold text-foreground/75">Dein Tool</label>
                          <input type="text" value={form.tool} maxLength={120} onChange={(e) => setForm({ ...form, tool: e.target.value })} placeholder="Toolname oder URL" className={inputBase} />
                          {errors.tool && <p className="mt-1 text-xs text-[color:var(--destructive)]">{errors.tool}</p>}
                        </div>
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-foreground/75">Interesse</label>
                        <select value={form.interest} onChange={(e) => setForm({ ...form, interest: e.target.value })} className={cn(inputBase, "appearance-none pr-10")}>
                          <option value="basis">Profil beanspruchen (Basis, kostenlos)</option>
                          <option value="premium">Premium-Platzierung</option>
                          <option value="first">First Access</option>
                          <option value="unklar">Noch unklar, bitte beraten</option>
                        </select>
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-foreground/75">Nachricht (optional)</label>
                        <textarea rows={4} value={form.message} maxLength={1000} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Kategorie, Zielgruppe, gewünschter Zeitraum." className={cn(inputBase, "resize-none")} />
                      </div>
                      <label className="flex items-start gap-3 rounded-2xl border border-border bg-[color:var(--paper)] p-4">
                        <input type="checkbox" checked={form.consent} onChange={(e) => setForm({ ...form, consent: e.target.checked })} className="mt-0.5 size-4 shrink-0 rounded border-border text-primary focus:ring-primary/20" />
                        <span className="text-xs leading-relaxed text-foreground/75">Ich willige ein, dass Toolfolio meine Angaben zur Bearbeitung meiner Anfrage speichert und mich kontaktiert. Mehr in der <a href="/datenschutz" className="font-semibold text-primary underline-offset-4 hover:underline">Datenschutzerklärung</a>.</span>
                      </label>
                      {errors.consent && <p className="-mt-2 text-xs text-[color:var(--destructive)]">{errors.consent}</p>}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                        <a href="/kontakt" className="text-xs font-semibold text-primary hover:underline">Oder lieber direkt zur Kontaktseite</a>
                        <button type="submit" className="inline-flex items-center gap-1.5 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-soft transition-all hover:bg-primary/90 hover:shadow-lift"><Send className="size-4" /> Anfrage senden</button>
                      </div>
                    </form>
                  </>
                )}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-4xl px-4 pb-16 sm:px-6 sm:pb-24">
        <Reveal>
          <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">Häufige Fragen von Anbietern.</h2>
          <p className="mt-3 text-base leading-relaxed text-foreground/70">Was du wissen solltest, bevor du anfragst.</p>
        </Reveal>
        <Reveal delay={80}>
          <div className="mt-8 rounded-3xl border border-border bg-card p-2 shadow-soft sm:p-4">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((f, i) => (
                <AccordionItem key={i} value={`f-${i}`} className="border-border">
                  <AccordionTrigger className="px-4 text-left font-display text-base font-semibold">
                    <span className="flex items-center gap-2"><HelpCircle className="size-4 text-primary" />{f.q}</span>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 text-sm leading-relaxed text-foreground/75">{f.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
