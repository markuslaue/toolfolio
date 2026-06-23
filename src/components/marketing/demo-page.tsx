import { useState } from "react";
import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  Clock,
  Users,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Building2,
  Mail,
  User as UserIcon,
  Rocket,
  Quote,
} from "lucide-react";
import { Nav, Footer, Reveal, ScreenshotFrame, PreviewDashboard } from "./marketing-home";
import { cn } from "@/lib/utils";

const weekdays = ["Mo 02.", "Di 03.", "Mi 04.", "Do 05.", "Fr 06."];
const slots = ["09:30", "11:00", "13:30", "15:00", "16:30"];

const teamSizes = [
  "Solo (nur ich)",
  "2 bis 5",
  "6 bis 15",
  "16 bis 50",
  "Mehr als 50",
];

const expectations = [
  {
    icon: Sparkles,
    t: "Persönlicher Rundgang",
    b: "Wir zeigen dir genau die Funktionen, die für deinen Anwendungsfall zählen.",
  },
  {
    icon: MessageSquare,
    t: "Deine Fragen direkt beantwortet",
    b: "Vertragslogik, Datenschutz, Workflow im Team. Frag alles, was du wissen willst.",
  },
  {
    icon: Users,
    t: "Fokus Agentur",
    b: "Kosten pro Kunde, Weiterverrechnung, Seats, Freigaben, Mehrmandant.",
  },
  {
    icon: ShieldCheck,
    t: "Keine Verpflichtung",
    b: "Kein Verkaufsdruck, keine Vertragsfrage. Du entscheidest danach in Ruhe.",
  },
];

function isValidEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

export function DemoPage() {
  const [picked, setPicked] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    team: "",
    note: "",
    consent: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = "Bitte gib deinen Namen an.";
    if (!form.email.trim()) next.email = "Bitte gib deine geschäftliche E-Mail an.";
    else if (!isValidEmail(form.email)) next.email = "Diese E-Mail sieht nicht gültig aus.";
    if (!form.company.trim()) next.company = "Bitte gib dein Unternehmen an.";
    if (!form.team) next.team = "Bitte wähle eine Teamgröße.";
    if (!form.consent) next.consent = "Bitte bestätige die Einwilligung.";
    setErrors(next);
    if (Object.keys(next).length === 0) setSent(true);
  }

  const inputBase =
    "w-full rounded-2xl border border-border bg-[color:var(--paper)] px-4 py-3 text-sm text-foreground placeholder:text-foreground/40 transition-shadow focus:outline-none focus:ring-4 focus:ring-primary/15 focus:border-primary";

  return (
    <div className="min-h-screen bg-[color:var(--paper)] text-foreground">
      <div id="top" />
      <Nav />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-32 -left-20 h-[520px] w-[520px] rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -top-10 right-0 h-[420px] w-[420px] rounded-full bg-[color:var(--coral)]/10 blur-3xl" />
        </div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-12 pb-10 sm:pt-20 sm:pb-14">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-foreground/70">
              <CalendarClock className="size-3.5 text-primary" />
              Demo buchen
            </span>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="mt-5 max-w-4xl font-display text-4xl sm:text-5xl md:text-6xl font-semibold leading-[1.05] tracking-tight">
              Lass dir Toolfolio <span className="text-primary">zeigen.</span>
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <p className="mt-6 max-w-2xl text-lg text-foreground/70 leading-relaxed">
              Eine kurze, persönliche Demo, besonders sinnvoll für Teams, die den Agentur-Plan erwägen. Wir zeigen dir, was für deinen Alltag zählt, und beantworten deine Fragen.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ZWEI SPALTEN */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-16 sm:pb-24">
        <div className="grid gap-8 lg:grid-cols-12">
          {/* LINKS */}
          <div className="lg:col-span-5 space-y-6">
            <Reveal>
              <h2 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight">
                Was dich erwartet
              </h2>
            </Reveal>
            <Reveal delay={60}>
              <ul className="space-y-3">
                {expectations.map((e) => (
                  <li
                    key={e.t}
                    className="flex gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft"
                  >
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                      <e.icon className="size-5" />
                    </span>
                    <div>
                      <div className="font-display text-base font-semibold leading-tight">
                        {e.t}
                      </div>
                      <p className="mt-1 text-sm text-foreground/70 leading-relaxed">
                        {e.b}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal delay={120}>
              <div className="rounded-3xl border border-border bg-card p-5 shadow-soft">
                <div className="flex flex-wrap gap-4 text-sm">
                  <span className="inline-flex items-center gap-1.5 text-foreground/75">
                    <Clock className="size-4 text-primary" /> ca. 30 Minuten
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-foreground/75">
                    <UserIcon className="size-4 text-primary" /> mit{" "}
                    <span className="font-semibold">[Ansprechpartner:in]</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-foreground/75">
                    <ShieldCheck className="size-4 text-primary" /> unverbindlich
                  </span>
                </div>
              </div>
            </Reveal>

            <Reveal delay={180}>
              <ScreenshotFrame
                label="Vorschau des Dashboards"
                caption="dashboard"
              >
                <PreviewDashboard />
              </ScreenshotFrame>
            </Reveal>
          </div>

          {/* RECHTS */}
          <div className="lg:col-span-7">
            <Reveal delay={80}>
              <div className="rounded-[28px] border border-border bg-card p-6 sm:p-8 shadow-lift">
                {sent ? (
                  <div className="py-10 text-center">
                    <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-[color:var(--success)]/15 text-[color:var(--success)]">
                      <CheckCircle2 className="size-8" />
                    </div>
                    <h3 className="mt-5 font-display text-2xl font-semibold">
                      Danke, wir melden uns.
                    </h3>
                    <p className="mt-2 max-w-md mx-auto text-sm text-foreground/70 leading-relaxed">
                      Wir bestätigen deinen Wunschtermin{picked ? ` (${picked})` : ""} per Mail an{" "}
                      <span className="font-semibold">{form.email || "deine Adresse"}</span> und schicken dir vorab einen kurzen Überblick.
                    </p>
                    <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                      <a
                        href="/onboarding"
                        className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft hover:bg-primary/90 hover:shadow-lift transition-all"
                      >
                        Kostenlos starten <ArrowRight className="size-4" />
                      </a>
                      <a
                        href="/features"
                        className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold hover:bg-accent transition-colors"
                      >
                        Produkt ansehen
                      </a>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Termin-Picker */}
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-display text-xl font-semibold">
                          Wunschtermin wählen
                        </h3>
                        <span className="text-xs text-foreground/55">
                          KW 23, Berlin Zeit
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-foreground/65">
                        Wähle einen passenden Slot. Du bekommst danach eine Bestätigung per Mail.
                      </p>

                      <div className="mt-5 overflow-x-auto">
                        <div className="grid grid-cols-5 gap-2 min-w-[460px]">
                          {weekdays.map((d) => (
                            <div
                              key={d}
                              className="rounded-xl bg-secondary/60 px-2 py-2 text-center text-xs font-semibold text-foreground/70"
                            >
                              {d}
                            </div>
                          ))}
                          {weekdays.map((d) =>
                            slots.map((s) => {
                              const value = `${d} ${s}`;
                              const active = picked === value;
                              const disabled = (d === "Mi 04." && s === "09:30") || (d === "Fr 06." && s === "15:00");
                              return (
                                <button
                                  type="button"
                                  key={value}
                                  disabled={disabled}
                                  onClick={() => setPicked(value)}
                                  className={cn(
                                    "rounded-xl border px-2 py-2 text-xs font-semibold tabular transition-all",
                                    disabled
                                      ? "border-dashed border-border bg-secondary/40 text-foreground/30 cursor-not-allowed"
                                      : active
                                        ? "border-primary bg-primary text-primary-foreground shadow-soft"
                                        : "border-border bg-[color:var(--paper)] text-foreground/80 hover:border-primary/40 hover:bg-accent",
                                  )}
                                >
                                  {s}
                                </button>
                              );
                            }),
                          )}
                        </div>
                      </div>
                      {picked && (
                        <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-[color:var(--success)]/12 px-3 py-1.5 text-xs font-semibold text-[color:var(--success)]">
                          <CheckCircle2 className="size-3.5" /> Gewählt: {picked}
                        </div>
                      )}
                    </div>

                    <div className="my-7 flex items-center gap-3">
                      <div className="h-px flex-1 bg-border" />
                      <span className="text-xs uppercase tracking-wide text-foreground/50">
                        oder Anfrage senden
                      </span>
                      <div className="h-px flex-1 bg-border" />
                    </div>

                    {/* FORMULAR */}
                    <form onSubmit={submit} noValidate className="space-y-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="mb-1.5 block text-xs font-semibold text-foreground/75">
                            Dein Name
                          </label>
                          <input
                            type="text"
                            value={form.name}
                            maxLength={100}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            placeholder="Vor- und Nachname"
                            className={inputBase}
                          />
                          {errors.name && (
                            <p className="mt-1 text-xs text-[color:var(--destructive)]">{errors.name}</p>
                          )}
                        </div>
                        <div>
                          <label className="mb-1.5 block text-xs font-semibold text-foreground/75">
                            Geschäftliche E-Mail
                          </label>
                          <input
                            type="email"
                            value={form.email}
                            maxLength={255}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            placeholder="name@firma.de"
                            className={inputBase}
                          />
                          {errors.email && (
                            <p className="mt-1 text-xs text-[color:var(--destructive)]">{errors.email}</p>
                          )}
                        </div>
                        <div>
                          <label className="mb-1.5 block text-xs font-semibold text-foreground/75">
                            Unternehmen
                          </label>
                          <input
                            type="text"
                            value={form.company}
                            maxLength={120}
                            onChange={(e) => setForm({ ...form, company: e.target.value })}
                            placeholder="z. B. OMMM GmbH"
                            className={inputBase}
                          />
                          {errors.company && (
                            <p className="mt-1 text-xs text-[color:var(--destructive)]">{errors.company}</p>
                          )}
                        </div>
                        <div>
                          <label className="mb-1.5 block text-xs font-semibold text-foreground/75">
                            Teamgröße
                          </label>
                          <select
                            value={form.team}
                            onChange={(e) => setForm({ ...form, team: e.target.value })}
                            className={cn(inputBase, "appearance-none pr-10")}
                          >
                            <option value="">Bitte wählen</option>
                            {teamSizes.map((t) => (
                              <option key={t} value={t}>
                                {t}
                              </option>
                            ))}
                          </select>
                          {errors.team && (
                            <p className="mt-1 text-xs text-[color:var(--destructive)]">{errors.team}</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-foreground/75">
                          Was möchtest du sehen? <span className="font-normal text-foreground/50">(optional)</span>
                        </label>
                        <textarea
                          rows={3}
                          value={form.note}
                          maxLength={1000}
                          onChange={(e) => setForm({ ...form, note: e.target.value })}
                          placeholder="Kurz dein Anliegen, z. B. Weiterverrechnung an Kunden, Import aus Excel, Team-Freigaben."
                          className={cn(inputBase, "resize-none")}
                        />
                      </div>

                      <label className="flex items-start gap-3 rounded-2xl border border-border bg-[color:var(--paper)] p-4">
                        <input
                          type="checkbox"
                          checked={form.consent}
                          onChange={(e) => setForm({ ...form, consent: e.target.checked })}
                          className="mt-0.5 size-4 shrink-0 rounded border-border text-primary focus:ring-primary/20"
                        />
                        <span className="text-xs text-foreground/75 leading-relaxed">
                          Ich willige ein, dass Toolfolio meine Angaben zur Kontaktaufnahme zur vereinbarten Demo verwendet. Es findet keine Weitergabe statt. Mehr in der{" "}
                          <a href="/datenschutz" className="font-semibold text-primary underline-offset-4 hover:underline">
                            Datenschutzerklärung
                          </a>
                          .
                        </span>
                      </label>
                      {errors.consent && (
                        <p className="-mt-2 text-xs text-[color:var(--destructive)]">{errors.consent}</p>
                      )}

                      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                        <p className="text-xs text-foreground/55">
                          Antwort meist innerhalb eines Werktags.
                        </p>
                        <button
                          type="submit"
                          className="inline-flex items-center gap-1.5 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-soft hover:bg-primary/90 hover:shadow-lift transition-all"
                        >
                          Demo anfragen <ArrowRight className="size-4" />
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

      {/* SELF-SERVICE */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-16 sm:pb-24">
        <Reveal>
          <div className="relative overflow-hidden rounded-[28px] border border-border bg-card p-8 sm:p-12 shadow-soft">
            <div className="pointer-events-none absolute -top-20 -right-10 h-[320px] w-[320px] rounded-full bg-[color:var(--coral)]/10 blur-3xl" />
            <div className="relative grid items-center gap-6 md:grid-cols-12">
              <div className="md:col-span-8">
                <span className="inline-flex items-center gap-2 rounded-full bg-[color:var(--coral)]/15 px-3 py-1 text-xs font-semibold text-[color:var(--coral)]">
                  <Rocket className="size-3.5" /> Du willst nicht warten?
                </span>
                <h2 className="mt-4 font-display text-2xl sm:text-3xl font-semibold tracking-tight">
                  Starte sofort kostenlos.
                </h2>
                <p className="mt-2 max-w-xl text-foreground/70">
                  Self-Service in unter fünf Minuten eingerichtet. Du kannst die Demo jederzeit später nachholen.
                </p>
              </div>
              <div className="md:col-span-4 md:text-right">
                <a
                  href="/onboarding"
                  className="inline-flex items-center gap-1.5 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-soft hover:bg-primary/90 hover:shadow-lift transition-all"
                >
                  Kostenlos starten <ArrowRight className="size-4" />
                </a>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* VERTRAUEN */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-16 sm:pb-24">
        <Reveal>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              {
                q: "Die Demo war angenehm kurz und direkt auf unsere Agentur zugeschnitten. Danach wussten wir, woran wir sind.",
                a: "[Platzhalter-Stimme]",
              },
              {
                q: "Wir konnten alle unsere Fragen zu Weiterverrechnung und Team-Seats klären, ohne uns durch ein Verkaufsgespräch zu kämpfen.",
                a: "[Platzhalter-Stimme]",
              },
            ].map((s) => (
              <div
                key={s.q}
                className="rounded-3xl border border-border bg-card p-6 shadow-soft"
              >
                <Quote className="size-5 text-primary/60" />
                <p className="mt-3 text-sm text-foreground/80 leading-relaxed">
                  {s.q}
                </p>
                <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-foreground/55">
                  {s.a}
                </p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      <Footer />
    </div>
  );
}
