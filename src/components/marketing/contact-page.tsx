"use client";

import { useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Mail,
  MessageSquare,
  Building2,
  MapPin,
  HelpCircle,
  Send,
} from "lucide-react";
import { Reveal } from "@/components/marketing/marketing-home";
import { cn } from "@/lib/utils";

const topics = [
  { value: "support", label: "Support" },
  { value: "vertrieb", label: "Vertrieb" },
  { value: "presse", label: "Presse" },
  { value: "sonstiges", label: "Sonstiges" },
];

const channels = [
  { id: "support", icon: MessageSquare, title: "Support", text: "Für Fragen zur Bedienung, Import oder Einrichtung.", cta: "[Support-E-Mail einsetzen]" },
  { id: "vertrieb", icon: Building2, title: "Vertrieb", text: "Für Angebote, Team-Pläne, Abrechnung und Auftragsdaten.", cta: "[Vertriebs-E-Mail einsetzen]" },
  { id: "presse", icon: Mail, title: "Presse", text: "Für Medienanfragen, Logos, Statements und Termine.", cta: "[Presse-E-Mail einsetzen]" },
];

function isValidEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

export function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", topic: "", message: "", consent: false });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = "Bitte gib deinen Namen an.";
    if (!form.email.trim()) next.email = "Bitte gib deine E-Mail an.";
    else if (!isValidEmail(form.email)) next.email = "Diese E-Mail sieht nicht gültig aus.";
    if (!form.topic) next.topic = "Bitte wähle ein Anliegen.";
    if (!form.message.trim()) next.message = "Bitte gib eine Nachricht ein.";
    if (!form.consent) next.consent = "Bitte bestätige die Einwilligung.";
    setErrors(next);
    if (Object.keys(next).length === 0) setSent(true);
  }

  const inputBase =
    "w-full rounded-2xl border border-border bg-[color:var(--paper)] px-4 py-3 text-sm text-foreground placeholder:text-foreground/40 transition-shadow focus:outline-none focus:ring-4 focus:ring-primary/15 focus:border-primary";

  return (
    <div className="bg-[color:var(--paper)] text-foreground">
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -left-20 -top-32 h-[520px] w-[520px] rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -top-10 right-0 h-[420px] w-[420px] rounded-full bg-coral/10 blur-3xl" />
        </div>
        <div className="mx-auto max-w-7xl px-4 pb-10 pt-12 sm:px-6 sm:pb-14 sm:pt-20">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-foreground/70">
              <Mail className="size-3.5 text-primary" /> Kontakt
            </span>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="mt-5 max-w-4xl font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl">
              Schreib <span className="text-primary">uns.</span>
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-foreground/70">
              Echte Menschen lesen deine Nachricht und melden sich in der Regel innerhalb eines Werktags bei dir. Kein Ticket-Wirrwarr, keine endlosen Warteschleifen.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 sm:pb-24">
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-5">
            <Reveal>
              <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">Wie du uns erreichst</h2>
              <p className="mt-2 text-sm text-foreground/65">Wähle den Kanal, der am besten zu deinem Anliegen passt.</p>
            </Reveal>
            <Reveal delay={60}>
              <ul className="space-y-3">
                {channels.map((c) => (
                  <li key={c.id} className="flex gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><c.icon className="size-5" /></span>
                    <div>
                      <div className="font-display text-base font-semibold leading-tight">{c.title}</div>
                      <p className="mt-1 text-sm leading-relaxed text-foreground/70">{c.text}</p>
                      <p className="mt-2 text-sm font-semibold text-primary">{c.cta}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal delay={120}>
              <div className="rounded-3xl border border-border bg-card p-5 shadow-soft">
                <div className="flex items-start gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-success/10 text-success"><Clock className="size-5" /></span>
                  <div>
                    <div className="font-display text-base font-semibold">Reaktionszeit</div>
                    <p className="mt-1 text-sm leading-relaxed text-foreground/70">Wir antworten in der Regel innerhalb eines Werktags. Bei komplexen Anfragen brauchen wir manchmal etwas länger, sagen dir aber Bescheid.</p>
                  </div>
                </div>
              </div>
            </Reveal>
            <Reveal delay={180}>
              <div className="rounded-3xl border border-border bg-card p-5 shadow-soft">
                <div className="flex items-start gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-coral/10 text-coral"><MapPin className="size-5" /></span>
                  <div>
                    <div className="font-display text-base font-semibold">Standort</div>
                    <p className="mt-1 text-sm leading-relaxed text-foreground/70">Leipzig<br /><span className="text-foreground/50">[vollständige Anschrift einsetzen]</span></p>
                  </div>
                </div>
                <div className="mt-4 grid aspect-[16/9] place-items-center rounded-2xl border border-dashed border-border bg-secondary/40">
                  <span className="text-xs font-medium uppercase tracking-wide text-foreground/40">Karten-Platzhalter</span>
                </div>
              </div>
            </Reveal>
            <Reveal delay={240}>
              <div>
                <div className="font-display text-sm font-semibold text-foreground/75">Social</div>
                <div className="mt-3 flex items-center gap-2">
                  {["X", "in", "YT", "Rs"].map((s) => (
                    <a key={s} href="#" className="grid size-10 place-items-center rounded-full border border-border bg-card text-xs font-semibold transition-colors hover:bg-accent">{s}</a>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>

          <div className="lg:col-span-7">
            <Reveal delay={80}>
              <div className="rounded-[28px] border border-border bg-card p-6 shadow-lift sm:p-8">
                {sent ? (
                  <div className="py-10 text-center">
                    <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-success/15 text-success"><CheckCircle2 className="size-8" /></div>
                    <h3 className="mt-5 font-display text-2xl font-semibold">Danke für deine Nachricht.</h3>
                    <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-foreground/70">
                      Wir haben sie als Mock erhalten und würden sie in der echten Umsetzung an {form.email || "deine Adresse"} bestätigen. Du bekommst bald eine Rückmeldung von uns.
                    </p>
                    <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                      <a href="/registrieren" className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft transition-all hover:bg-primary/90 hover:shadow-lift">Kostenlos starten <ArrowRight className="size-4" /></a>
                      <a href="/produkt" className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-accent">Produkt ansehen</a>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="mb-5">
                      <h3 className="font-display text-xl font-semibold">Schreib uns direkt</h3>
                      <p className="mt-1 text-sm text-foreground/65">Pflichtfelder sind nicht extra markiert. Wir brauchen nur das Nötigste, um dir gezielt antworten zu können.</p>
                    </div>
                    <form onSubmit={submit} noValidate className="space-y-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="mb-1.5 block text-xs font-semibold text-foreground/75">Dein Name</label>
                          <input type="text" value={form.name} maxLength={100} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Vor- und Nachname" className={inputBase} />
                          {errors.name && <p className="mt-1 text-xs text-[color:var(--destructive)]">{errors.name}</p>}
                        </div>
                        <div>
                          <label className="mb-1.5 block text-xs font-semibold text-foreground/75">E-Mail</label>
                          <input type="email" value={form.email} maxLength={255} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="name@firma.de" className={inputBase} />
                          {errors.email && <p className="mt-1 text-xs text-[color:var(--destructive)]">{errors.email}</p>}
                        </div>
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-foreground/75">Anliegen</label>
                        <select value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} className={cn(inputBase, "appearance-none pr-10")}>
                          <option value="">Bitte wählen</option>
                          {topics.map((t) => (<option key={t.value} value={t.value}>{t.label}</option>))}
                        </select>
                        {errors.topic && <p className="mt-1 text-xs text-[color:var(--destructive)]">{errors.topic}</p>}
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-foreground/75">Nachricht</label>
                        <textarea rows={5} value={form.message} maxLength={1000} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Beschreibe kurz, wobei wir dir helfen können." className={cn(inputBase, "resize-none")} />
                        {errors.message && <p className="mt-1 text-xs text-[color:var(--destructive)]">{errors.message}</p>}
                      </div>
                      <label className="flex items-start gap-3 rounded-2xl border border-border bg-[color:var(--paper)] p-4">
                        <input type="checkbox" checked={form.consent} onChange={(e) => setForm({ ...form, consent: e.target.checked })} className="mt-0.5 size-4 shrink-0 rounded border-border text-primary focus:ring-primary/20" />
                        <span className="text-xs leading-relaxed text-foreground/75">
                          Ich willige ein, dass Toolfolio meine Angaben zur Bearbeitung meiner Anfrage speichert und mich kontaktiert. Es findet keine Weitergabe an Dritte statt. Mehr in der{" "}
                          <a href="/datenschutz" className="font-semibold text-primary underline-offset-4 hover:underline">Datenschutzerklärung</a>.
                        </span>
                      </label>
                      {errors.consent && <p className="-mt-2 text-xs text-[color:var(--destructive)]">{errors.consent}</p>}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                        <p className="text-xs text-foreground/55">Keine echte Übermittlung im Demo-Modus.</p>
                        <button type="submit" className="inline-flex items-center gap-1.5 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-soft transition-all hover:bg-primary/90 hover:shadow-lift">
                          <Send className="size-4" /> Nachricht senden
                        </button>
                      </div>
                    </form>
                  </>
                )}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 sm:pb-24">
        <Reveal>
          <div className="flex flex-col gap-4 rounded-3xl border border-border bg-card p-6 shadow-soft sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div className="flex items-start gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><HelpCircle className="size-5" /></span>
              <div>
                <div className="font-display text-base font-semibold">Vielleicht hilft dir auch unsere Hilfe oder die FAQ.</div>
                <p className="mt-1 text-sm leading-relaxed text-foreground/70">Dort findest du Antworten zu Import, Verträgen, Datenschutz und Abrechnung.</p>
              </div>
            </div>
            <a href="/preise" className="inline-flex items-center justify-center gap-1.5 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-accent">FAQ ansehen <ArrowRight className="size-4" /></a>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
