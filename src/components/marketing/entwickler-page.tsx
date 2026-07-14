"use client";

import { useState } from "react";
import {
  ArrowRight,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Lock,
  Eye,
  BadgeCheck,
  Code2,
  Globe,
  FileCheck2,
  Send,
  Users,
  Target,
  Zap,
  Scale,
  HelpCircle,
  Gift,
} from "lucide-react";
import { Reveal } from "@/components/marketing/marketing-home";
import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const PRICE_VERIFIED = "49,00 €";

const stats = [
  { value: "[X.XXX]", label: "Indie-Tools entdeckbar" },
  { value: "[XX.XXX]", label: "Suchanfragen pro Monat" },
  { value: "[XX %]", label: "Nutzer mit Kaufabsicht" },
  { value: "[XX %]", label: "Solopreneure & Freelancer" },
];

const audience = [
  { icon: Target, title: "Konkrete Tool-Suche", text: "Toolfolio-Nutzer kommen nicht zum Stöbern. Sie vergleichen aktiv und entscheiden in Wochen, nicht Monaten." },
  { icon: Users, title: "Agenturen, Freelancer, Solopreneure", text: "Genau die Zielgruppe, die ein Nischen-Tool oft besser findet als ein generisches Enterprise-Werkzeug." },
  { icon: ShieldCheck, title: "Achten auf Qualität und Sicherheit", text: "Datenschutz, DSGVO und Hosting sind keine Nebensache. Wer hier punktet, gewinnt Vertrauen." },
];

const freeFeatures = ["Im Verzeichnis auffindbar", "Kategorie und Beschreibung", "Link zu deinem Angebot", "Kennzeichnung als Community-Tool"];
const verifiedFeatures = ["Geprüfter Badge am Profil", "Erweitertes Profil mit Medien und Links", "Chance auf das Indie-Spotlight", "Im Verzeichnis auffindbar", "Kategorie und Beschreibung", "Selbstauskunft öffentlich einsehbar"];
const generalStandards = ["Echtes, erreichbares und funktionierendes Tool mit Live-URL", "Öffentlich einsehbare Preise", "Kontakt- bzw. Betreiberangabe vorhanden", "Thematische Relevanz, korrekte Kategorie, ehrliche Beschreibung", "Kein Scam, keine Schadsoftware"];

const securityStandards = [
  { icon: Lock, title: "HTTPS und Verschlüsselung", text: "Durchgehend HTTPS mit gültigem Zertifikat. Verschlüsselung bei Übertragung und Speicherung." },
  { icon: ShieldCheck, title: "Sichere Authentifizierung", text: "Gehashte Passwörter, keine Klartext-Geheimnisse, 2FA muss möglich sein." },
  { icon: FileCheck2, title: "DSGVO-Konformität", text: "Datenschutzerklärung, AVV-Möglichkeit, offengelegtes Hosting und Subdienstleister." },
  { icon: Eye, title: "Nutzerkontrolle", text: "Datenexport und Löschung auf Anfrage, klarer Prozess für Sicherheitsvorfälle." },
  { icon: Code2, title: "Gepflegte Technik", text: "Regelmäßige Backups, gepflegte Abhängigkeiten ohne bekannte kritische Lücken." },
];

const validationSteps = [
  { icon: FileCheck2, title: "Sicherheits-Selbstauskunft", text: "Du füllst eine verbindliche Checkliste zu den Sicherheitspunkten aus und versicherst deren Einhaltung." },
  { icon: ShieldCheck, title: "Externe Prüfung durch Toolfolio", text: "Wir prüfen TLS-Zertifikat, Erreichbarkeit, Datenschutzerklärung und Impressum, grundlegende Sicherheits-Header und die Plausibilität deiner Selbstauskunft." },
  { icon: BadgeCheck, title: "Badge mit ehrlichem Umfang", text: "Der Badge bestätigt die extern geprüften Punkte und deine Selbstverpflichtung. Er ist ausdrücklich keine vollständige Sicherheitsgarantie oder Zertifizierung." },
];

const listingSteps = [
  { step: "1", title: "Tool einreichen", text: "Kurzes Formular mit Name, URL, Kategorie und Beschreibung." },
  { step: "2", title: "Prüfung gegen allgemeine Standards", text: "Wir checken Live-URL, Preise, Kontakt und Relevanz." },
  { step: "3", title: "Kostenlose Listung als Community-Tool", text: "Du bist im Verzeichnis sichtbar. Fertig." },
  { step: "+", title: "Optional: verifiziertes Listing", text: "Selbstauskunft ausfüllen, externe Prüfung, einmalig 49,00 €. Badge und erweitertes Profil live." },
];

const faqs = [
  { q: "Kostet das laufend etwas?", a: "Nein. Die Grund-Listung ist dauerhaft kostenlos. Der Badge kostet einmalig 49,00 €. Kein Abo, kein CPC, keine versteckten Folgekosten." },
  { q: "Bekommt ihr etwas von meinen Verkäufen?", a: "Nein. Kein Affiliate, keine Umsatzbeteiligung. Wir verdienen ausschließlich am einmaligen Badge und an Premium-Platzierungen für größere Anbieter." },
  { q: "Was genau prüft ihr bei der Sicherheit?", a: "Extern prüfbare Punkte: gültiges TLS-Zertifikat, Erreichbarkeit, Datenschutzerklärung und Impressum, grundlegende Sicherheits-Header sowie die Plausibilität deiner Selbstauskunft. Den Rest sicherst du verbindlich per Selbstauskunft zu." },
  { q: "Was bedeutet der Badge wirklich?", a: "Der Badge bedeutet: Toolfolio hat die extern prüfbaren Punkte geprüft, und du hast verbindlich zugesichert, nach aktuellen Sicherheitsstandards zu arbeiten. Er bedeutet ausdrücklich nicht, dass Toolfolio die Sicherheit deines Tools garantiert." },
  { q: "Was, wenn ich den Sicherheitscheck nicht bestehe?", a: "Die Listung als Community-Tool ohne Badge bleibt möglich, sofern die allgemeinen Standards erfüllt sind. Du bist also weiterhin im Verzeichnis sichtbar." },
  { q: "Beeinflusst der Badge meine Bewertungen oder das Ranking?", a: "Nein. Bewertungen, neutrale Ranglisten und verifizierte Preisdaten sind nicht käuflich. Der Badge sagt 'geprüft', nicht 'besser'." },
];

const selfDeclChecklist = [
  "Mein Tool nutzt durchgehend HTTPS mit gültigem Zertifikat.",
  "Passwörter werden gehasht gespeichert, keine Klartext-Geheimnisse.",
  "2FA ist verfügbar oder in Vorbereitung.",
  "Es gibt eine Datenschutzerklärung und AVV-Möglichkeit.",
  "Datenexport und Löschung auf Anfrage sind möglich.",
];

function Field({
  label, value, onChange, error, placeholder, textarea,
}: {
  label: string; value: string; onChange: (v: string) => void; error?: string; placeholder?: string; textarea?: boolean;
}) {
  const cls = cn(
    "mt-1.5 w-full rounded-xl border bg-surface px-3.5 py-2.5 text-sm shadow-soft outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20",
    error ? "border-destructive" : "border-border",
  );
  return (
    <label className="block text-sm">
      <span className="font-medium">{label}</span>
      {textarea ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={4} className={cls} />
      ) : (
        <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={cls} />
      )}
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </label>
  );
}

export function EntwicklerPage() {
  const [form, setForm] = useState({ name: "", url: "", category: "", description: "", price: "", contact: "" });
  const [checks, setChecks] = useState<boolean[]>(selfDeclChecklist.map(() => false));
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = "Bitte Tool-Namen angeben.";
    if (!form.url.trim() || !/^https?:\/\//i.test(form.url)) next.url = "Bitte vollständige URL mit https:// angeben.";
    if (!form.category.trim()) next.category = "Bitte Kategorie wählen.";
    if (!form.description.trim() || form.description.trim().length < 30) next.description = "Mindestens 30 Zeichen.";
    if (!form.contact.trim()) next.contact = "Bitte Kontakt angeben.";
    if (!consent) next.consent = "Pflicht für die Bearbeitung.";
    setErrors(next);
    if (Object.keys(next).length === 0) setSent(true);
  }

  return (
    <div className="bg-paper text-foreground">
      <section className="relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10" style={{ background: "radial-gradient(60% 50% at 80% 0%, rgba(108,92,231,0.10), transparent), radial-gradient(40% 40% at 10% 20%, rgba(255,122,102,0.10), transparent)" }} />
        <div className="mx-auto max-w-6xl px-6 pb-12 pt-16 lg:pb-16 lg:pt-24">
          <Reveal>
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs text-muted-foreground shadow-soft">
              <Sparkles className="size-3.5 text-primary" /> Für Entwickler und Indie-SaaS
            </div>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="mt-4 font-display text-4xl leading-[1.05] tracking-tight md:text-6xl">
              Bring dein Tool vor die<br /><span className="text-primary">richtige Zielgruppe.</span>
            </h1>
          </Reveal>
          <Reveal delay={140}>
            <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
              Toolfolio-Nutzer sind Agenturen, Freelancer und Solopreneure mit konkreter Tool-Suche, und sie achten auf Qualität und Sicherheit. Grund-Listung ist kostenlos. Wer mehr Vertrauen will, bekommt den geprüften Badge einmalig für 49,00 €. Mehr nicht.
            </p>
          </Reveal>
          <Reveal delay={200}>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <a href="#einreichen" className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground shadow-soft hover:bg-primary/90">Tool einreichen <ArrowRight className="size-4" /></a>
              <a href="#prozess" className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-5 py-3 text-sm font-medium hover:bg-accent">So funktioniert es</a>
              <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"><Gift className="size-3.5 text-success" /> Grund-Listung kostenlos</span>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <Reveal>
          <h2 className="font-display text-3xl tracking-tight md:text-4xl">Warum hier listen</h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">Die Zielgruppe trifft Kaufentscheidungen und sucht aktiv nach guten Indie-Lösungen. Das ist deine Chance.</p>
        </Reveal>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {audience.map((a, i) => (
            <Reveal key={a.title} delay={i * 80}>
              <div className="card-lift h-full rounded-3xl border border-border bg-surface p-6 shadow-soft">
                <a.icon className="size-5 text-primary" />
                <h3 className="mt-4 font-display text-lg">{a.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{a.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal delay={120}>
          <div className="mt-10 grid gap-4 rounded-3xl border border-border bg-surface p-6 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label}>
                <div className="font-display text-3xl tabular tracking-tight">{s.value}</div>
                <div className="mt-1 text-xs text-muted-foreground">{s.label} <span className="opacity-60">(Platzhalter)</span></div>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <Reveal>
          <h2 className="font-display text-3xl tracking-tight md:text-4xl">Was es kostet</h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">Maximal transparent. Indies hassen versteckte Kosten, wir auch.</p>
        </Reveal>
        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          <Reveal>
            <div className="card-lift h-full rounded-3xl border border-border bg-surface p-7 shadow-soft">
              <div className="flex items-center gap-2 text-xs text-muted-foreground"><Gift className="size-3.5 text-success" /> Community</div>
              <h3 className="mt-3 font-display text-2xl">Grund-Listung</h3>
              <div className="mt-3 flex items-baseline gap-2"><span className="font-display text-4xl tabular">0,00 €</span><span className="text-sm text-muted-foreground">dauerhaft</span></div>
              <p className="mt-3 text-sm text-muted-foreground">Sauberes Listing im Verzeichnis, gekennzeichnet als Community-Tool.</p>
              <ul className="mt-5 space-y-2 text-sm">
                {freeFeatures.map((f) => (<li key={f} className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 size-4 text-success" /><span>{f}</span></li>))}
              </ul>
            </div>
          </Reveal>
          <Reveal delay={80}>
            <div className="card-lift relative h-full rounded-3xl border-2 border-primary bg-surface p-7 shadow-lift">
              <div className="absolute -top-3 left-7 inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground"><BadgeCheck className="size-3.5" /> Geprüft</div>
              <div className="flex items-center gap-2 text-xs text-primary"><ShieldCheck className="size-3.5" /> Verifiziertes Listing</div>
              <h3 className="mt-3 font-display text-2xl">Verifiziertes Listing</h3>
              <div className="mt-3 flex items-baseline gap-2"><span className="font-display text-4xl tabular">{PRICE_VERIFIED}</span><span className="text-sm text-muted-foreground">einmalig, kein Abo</span></div>
              <p className="mt-3 text-sm text-muted-foreground">Unkostenbeitrag für den Prüfaufwand. Du bekommst den geprüften Badge und ein erweitertes Profil.</p>
              <ul className="mt-5 space-y-2 text-sm">
                {verifiedFeatures.map((f) => (<li key={f} className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 size-4 text-success" /><span>{f}</span></li>))}
              </ul>
            </div>
          </Reveal>
        </div>
        <Reveal delay={120}>
          <div className="mt-6 rounded-3xl border border-success/30 bg-success/5 p-5 text-sm">
            <strong className="font-display text-base">Keine laufenden Kosten.</strong> Kein monatliches Abo, kein CPC, keine Beteiligung an deinen Verkäufen. Einmal {PRICE_VERIFIED} für den Badge, das war es.
          </div>
        </Reveal>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <Reveal>
          <h2 className="font-display text-3xl tracking-tight md:text-4xl">Unsere Standards</h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">Damit Nutzer dem Verzeichnis vertrauen, gelten dieselben Regeln für alle.</p>
        </Reveal>
        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          <Reveal>
            <div className="rounded-3xl border border-border bg-surface p-7 shadow-soft">
              <div className="flex items-center gap-2 text-xs text-muted-foreground"><Scale className="size-3.5 text-primary" /> Allgemein</div>
              <h3 className="mt-3 font-display text-xl">Allgemeine Standards</h3>
              <ul className="mt-5 space-y-3 text-sm">
                {generalStandards.map((s) => (<li key={s} className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" /><span>{s}</span></li>))}
              </ul>
            </div>
          </Reveal>
          <Reveal delay={80}>
            <div className="rounded-3xl border-2 border-primary/20 bg-accent/40 p-7">
              <div className="flex items-center gap-2 text-xs text-primary"><ShieldCheck className="size-3.5" /> Schwerpunkt</div>
              <h3 className="mt-3 font-display text-xl">Sicherheits- und Technologie-Standards</h3>
              <p className="mt-2 text-sm text-muted-foreground">Der Anbieter sichert verbindlich zu, nach aktuellen Sicherheitsstandards zu arbeiten.</p>
              <div className="mt-5 grid gap-3">
                {securityStandards.map((s) => (
                  <div key={s.title} className="flex items-start gap-3 rounded-2xl border border-border bg-surface p-4">
                    <s.icon className="mt-0.5 size-4 shrink-0 text-primary" />
                    <div>
                      <div className="text-sm font-medium">{s.title}</div>
                      <div className="mt-0.5 text-sm text-muted-foreground">{s.text}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section id="prozess" className="mx-auto max-w-6xl px-6 py-16">
        <Reveal>
          <h2 className="font-display text-3xl tracking-tight md:text-4xl">Sicherheits- und Validierungsprozess</h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">Ehrlich erklärt, was wir prüfen und was du zusicherst.</p>
        </Reveal>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {validationSteps.map((v, i) => (
            <Reveal key={v.title} delay={i * 80}>
              <div className="card-lift h-full rounded-3xl border border-border bg-surface p-6 shadow-soft">
                <div className="inline-flex size-9 items-center justify-center rounded-2xl bg-accent text-primary"><v.icon className="size-4" /></div>
                <h3 className="mt-4 font-display text-lg">{v.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{v.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal delay={200}>
          <div className="mt-6 rounded-3xl border border-warning/30 bg-warning/10 p-5 text-sm">
            <strong className="font-display text-base">Was der Badge nicht ist:</strong> keine vollständige Sicherheitszertifizierung und keine Garantie. Er bestätigt die geprüften externen Punkte und deine Selbstverpflichtung. Diese Aussage steht so auch öffentlich am Badge.
          </div>
        </Reveal>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <Reveal><h2 className="font-display text-3xl tracking-tight md:text-4xl">So läuft die Listung</h2></Reveal>
        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {listingSteps.map((s, i) => (
            <Reveal key={s.title} delay={i * 80}>
              <div className="card-lift h-full rounded-3xl border border-border bg-surface p-6 shadow-soft">
                <div className="inline-flex size-9 items-center justify-center rounded-2xl bg-primary font-display text-primary-foreground">{s.step}</div>
                <h3 className="mt-4 font-display text-base">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-12">
        <Reveal>
          <div className="rounded-3xl border border-border bg-surface p-7 shadow-soft">
            <div className="flex items-start gap-4">
              <div className="inline-flex size-10 shrink-0 items-center justify-center rounded-2xl bg-accent text-primary"><Scale className="size-5" /></div>
              <div>
                <h2 className="font-display text-2xl tracking-tight">Neutralität bleibt Neutralität</h2>
                <p className="mt-2 text-muted-foreground">Auch für Indies gilt: Der Badge sagt &quot;geprüft&quot;, nicht &quot;besser&quot;. Bewertungen, neutrale Ranglisten und verifizierte Preisdaten sind nicht käuflich. Gesponserte Platzierungen sind immer als solche gekennzeichnet.</p>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      <section id="einreichen" className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Reveal>
              <h2 className="font-display text-3xl tracking-tight md:text-4xl">Tool einreichen</h2>
              <p className="mt-3 text-muted-foreground">Wir prüfen die allgemeinen Standards und melden uns. Wenn du den Badge willst, ergänzt du die Sicherheits-Selbstauskunft im nächsten Schritt.</p>
              <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2"><Zap className="size-4 text-primary" /> Mock-Formular, keine echte Einreichung</li>
                <li className="flex items-center gap-2"><Lock className="size-4 text-primary" /> Keine Zahlung in diesem Schritt</li>
                <li className="flex items-center gap-2"><Globe className="size-4 text-primary" /> DSGVO-konform, du kannst jederzeit zurückziehen</li>
              </ul>
            </Reveal>
          </div>
          <div className="lg:col-span-7">
            <Reveal delay={80}>
              <div className="rounded-3xl border border-border bg-surface p-7 shadow-soft">
                {sent ? (
                  <div className="flex flex-col items-start gap-4">
                    <div className="inline-flex size-10 items-center justify-center rounded-2xl bg-success/15 text-success"><CheckCircle2 className="size-5" /></div>
                    <h3 className="font-display text-2xl">Danke. Wir melden uns.</h3>
                    <p className="text-sm text-muted-foreground">Wir prüfen dein Tool gegen die allgemeinen Standards und schicken dir eine Antwort. Wenn du den Badge willst, folgen die nächsten Schritte zur Sicherheits-Selbstauskunft per E-Mail. (Mock, keine echte Übermittlung.)</p>
                  </div>
                ) : (
                  <form onSubmit={submit} noValidate className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <Field label="Tool-Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} error={errors.name} placeholder="z. B. Notepilot" />
                      <Field label="Live-URL" value={form.url} onChange={(v) => setForm({ ...form, url: v })} error={errors.url} placeholder="https://" />
                      <Field label="Kategorie" value={form.category} onChange={(v) => setForm({ ...form, category: v })} error={errors.category} placeholder="z. B. Projektmanagement" />
                      <Field label="Öffentliche Preise (URL)" value={form.price} onChange={(v) => setForm({ ...form, price: v })} placeholder="https://.../pricing" />
                    </div>
                    <Field label="Beschreibung" value={form.description} onChange={(v) => setForm({ ...form, description: v })} error={errors.description} placeholder="Was macht dein Tool besonders gut? Mind. 30 Zeichen." textarea />
                    <Field label="Kontakt (E-Mail oder Profil)" value={form.contact} onChange={(v) => setForm({ ...form, contact: v })} error={errors.contact} placeholder="dein@indie.dev" />
                    <div className="rounded-2xl border border-border bg-paper p-4">
                      <div className="flex items-center gap-2 text-sm font-medium"><ShieldCheck className="size-4 text-primary" /> Sicherheits-Selbstauskunft (optional für Badge)</div>
                      <p className="mt-1 text-xs text-muted-foreground">Diese Punkte fragen wir verbindlich ab, wenn du den geprüften Badge möchtest. Du kannst sie jetzt schon markieren.</p>
                      <ul className="mt-3 space-y-2">
                        {selfDeclChecklist.map((c, i) => (
                          <li key={c}>
                            <label className="flex items-start gap-3 text-sm">
                              <input type="checkbox" checked={checks[i]} onChange={(e) => { const next = [...checks]; next[i] = e.target.checked; setChecks(next); }} className="mt-0.5 size-4 rounded border-border accent-primary" />
                              <span>{c}</span>
                            </label>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <label className="flex items-start gap-3 text-sm">
                      <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 size-4 rounded border-border accent-primary" />
                      <span>Ich willige in die Verarbeitung meiner Daten zur Bearbeitung dieser Einreichung ein. Details in der <a href="/datenschutz" className="underline underline-offset-2">Datenschutzerklärung</a>.</span>
                    </label>
                    {errors.consent && <p className="text-xs text-destructive">{errors.consent}</p>}
                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      <button type="submit" className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground shadow-soft hover:bg-primary/90">Einreichen <Send className="size-4" /></button>
                      <span className="text-xs text-muted-foreground">Mock-Versand. Keine echte Übermittlung.</span>
                    </div>
                  </form>
                )}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-16">
        <Reveal>
          <div className="flex items-center gap-2 text-xs text-muted-foreground"><HelpCircle className="size-3.5 text-primary" /> Häufige Fragen</div>
          <h2 className="mt-2 font-display text-3xl tracking-tight md:text-4xl">Was Indie-Builder uns oft fragen</h2>
        </Reveal>
        <Reveal delay={80}>
          <div className="mt-8 rounded-3xl border border-border bg-surface px-2 shadow-soft">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((f, i) => (
                <AccordionItem key={f.q} value={`f-${i}`} className={cn("px-4", i === faqs.length - 1 && "border-b-0")}>
                  <AccordionTrigger className="text-left text-base font-medium">{f.q}</AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground">{f.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
