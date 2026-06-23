import { ArrowRight, MapPin, Mail, ShieldCheck, Lock, Scale, Sparkles, BookOpen, Award, Linkedin, ExternalLink, CheckCircle2 } from "lucide-react";
import { Nav, Footer, Reveal } from "./marketing-home";
import markusAsset from "@/assets/markus.png.asset.json";

type Founder = {
  name: string;
  role: string;
  bio: string;
  linkedin?: string;
  photo?: string;
  confirm?: boolean;
};

const founders: Founder[] = [
  {
    name: "Markus Laue",
    role: "Geschäftsführer & Mitgründer",
    bio: "Seit über zehn Jahren in eCommerce-SEO unterwegs, Gründer der OMMM GmbH in Leipzig. Markus hat täglich erlebt, wie sich Software-Abos in einer Agentur stapeln, bis niemand mehr weiß, wer was wofür bezahlt. Toolfolio ist die Antwort auf diesen Alltag.",
    linkedin: "#",
    photo: markusAsset.url,
    confirm: true,
  },
  {
    name: "Dominik Reeg",
    role: "Mitgründer & Produkt",
    bio: "Bringt die Verbindung aus Tech, Daten und Wirtschaft ins Team. Verantwortet Produkt und Datenmodell von Toolfolio, mit besonderem Blick auf die saubere Abbildung von Verträgen, Fristen und Kostenstellen.",
    linkedin: "#",
    confirm: true,
  },
];

const authors = [
  {
    name: "Redaktion Toolfolio",
    field: "Verzeichnis & Tool-Profile",
    qual: "Recherchiert Preise, Tarife und Funktionen direkt bei den Anbietern. Jedes Profil wird vor Veröffentlichung gegengeprüft und mit Stand-Datum versehen.",
    confirm: true,
  },
  {
    name: "Redaktion Magazin",
    field: "Ratgeber & Vergleiche",
    qual: "Schreibt aus der gelebten Agenturpraxis: Software-Auswahl, Kostenkontrolle und Workflows für kleine Teams. Quellen werden offengelegt, Vergleiche bleiben neutral.",
    confirm: true,
  },
  {
    name: "Fachbeirat eCommerce-SEO",
    field: "Fachliche Tiefe",
    qual: "Unterstützt bei Themen rund um Shop-Systeme, SEO-Tools und Performance-Marketing. Inhalte mit fachlicher Tiefe werden zusätzlich gegengelesen.",
    confirm: true,
  },
];

const values = [
  {
    icon: Scale,
    title: "Neutralität",
    body: "Empfehlungen und verifizierte Daten sind nicht käuflich. Bezahlte Platzierungen werden klar gekennzeichnet.",
  },
  {
    icon: Lock,
    title: "Datenschutz zuerst",
    body: "Keine Passwörter, keine vollständigen Kartennummern. Wir speichern nur, was wir wirklich brauchen.",
  },
  {
    icon: ShieldCheck,
    title: "Ehrlichkeit",
    body: "Wir versprechen nur, was wir halten können. Quellen, Daten und Annahmen machen wir transparent.",
  },
];

const Confirm = () => (
  <span className="ml-2 inline-flex items-center rounded-full bg-[color:var(--coral)]/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[color:var(--coral)]">
    bitte bestätigen
  </span>
);

export function AboutPage() {
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
        <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-12 pb-16 sm:pt-20 sm:pb-24">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-foreground/70">
              <Sparkles className="size-3.5 text-primary" />
              Über uns
            </span>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="mt-5 max-w-4xl font-display text-4xl sm:text-5xl md:text-6xl font-semibold leading-[1.05] tracking-tight">
              Wir haben Toolfolio gebaut, weil wir es{" "}
              <span className="text-primary">selbst gebraucht</span> haben.
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <p className="mt-6 max-w-2xl text-lg text-foreground/70 leading-relaxed">
              Eine eCommerce-SEO-Agentur aus Leipzig, die täglich mit Dutzenden Software-Tools arbeitet, hat irgendwann den Überblick verloren und sich gesagt: Das muss einfacher gehen. Daraus ist Toolfolio geworden.
            </p>
          </Reveal>
        </div>
      </section>

      {/* STORY / MISSION */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-16 sm:pb-24">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <Reveal>
              <h2 className="font-display text-3xl sm:text-4xl font-semibold leading-tight tracking-tight">
                Aus eigenem Schmerz entstanden.
              </h2>
            </Reveal>
          </div>
          <div className="md:col-span-7 space-y-5 text-foreground/80 leading-relaxed">
            <Reveal delay={80}>
              <p>
                Wir betreiben seit Jahren eine Agentur für eCommerce-SEO. Wie jedes kleine Team haben wir uns über die Zeit ein Werkzeug nach dem anderen zugelegt: SEO-Suiten, Crawler, Keyword-Tools, KI-Helfer, Projektmanagement, Buchhaltung. Schnell waren es 30, 40, 50 Abos.
              </p>
            </Reveal>
            <Reveal delay={140}>
              <p>
                Irgendwann wusste niemand mehr genau, was wir monatlich zahlen, welche Verträge sich automatisch verlängern und welche Tools wir auf welchen Kunden umlegen. Wir haben für Vergessenes gezahlt, Fristen verpasst und Toolkosten ungeordnet auf Kunden verteilt.
              </p>
            </Reveal>
            <Reveal delay={200}>
              <p className="rounded-2xl border border-border bg-card p-5 shadow-soft">
                <strong>Unsere Mission:</strong> Software-Kosten für kleine Teams transparent und beherrschbar machen, damit du bei gleicher Leistung weniger zahlst und schneller siehst, wo du sparen kannst.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* UNTERNEHMEN */}
      <section className="bg-card/60 border-y border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-24">
          <Reveal>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight">
              Das Unternehmen dahinter
            </h2>
          </Reveal>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <Reveal delay={60}>
              <div className="rounded-3xl border border-border bg-[color:var(--paper)] p-6 shadow-soft h-full">
                <div className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
                  <BookOpen className="size-6" />
                </div>
                <h3 className="mt-4 font-display text-xl font-semibold">
                  OMMM GmbH <Confirm />
                </h3>
                <p className="mt-2 text-sm text-foreground/70 leading-relaxed">
                  Spezialisierte eCommerce-SEO-Agentur mit Sitz in Leipzig. Toolfolio ist ein Produkt aus diesem Team.
                </p>
              </div>
            </Reveal>
            <Reveal delay={120}>
              <div className="rounded-3xl border border-border bg-[color:var(--paper)] p-6 shadow-soft h-full">
                <div className="grid size-12 place-items-center rounded-2xl bg-[color:var(--coral)]/15 text-[color:var(--coral)]">
                  <Award className="size-6" />
                </div>
                <h3 className="mt-4 font-display text-xl font-semibold">
                  11+ Jahre Erfahrung <Confirm />
                </h3>
                <p className="mt-2 text-sm text-foreground/70 leading-relaxed">
                  Seit über einer Dekade fokussiert auf Online-Shops, technisches SEO und Performance. Wir kennen den Werkzeugkasten kleiner Teams aus erster Hand.
                </p>
              </div>
            </Reveal>
            <Reveal delay={180}>
              <div className="rounded-3xl border border-border bg-[color:var(--paper)] p-6 shadow-soft h-full">
                <div className="grid size-12 place-items-center rounded-2xl bg-[color:var(--emerald,#12B76A)]/15 text-[color:var(--emerald,#12B76A)]">
                  <MapPin className="size-6" />
                </div>
                <h3 className="mt-4 font-display text-xl font-semibold">
                  Made in Leipzig
                </h3>
                <p className="mt-2 text-sm text-foreground/70 leading-relaxed">
                  Entwicklung, Redaktion und Support sitzen in Deutschland. Erwähnungen z. B. im OMR-Podcast <Confirm />.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* TEAM / GRÜNDER */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-24">
        <Reveal>
          <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight">
            Die Gründer
          </h2>
          <p className="mt-3 max-w-2xl text-foreground/70">
            Echte Menschen mit Klarnamen und überprüfbaren Profilen. Wir stehen mit unseren Gesichtern hinter dem, was wir bauen und schreiben.
          </p>
        </Reveal>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {founders.map((f, i) => (
            <Reveal key={f.name} delay={i * 80}>
              <article className="group rounded-3xl border border-border bg-card p-6 shadow-soft transition-all hover:-translate-y-1 hover:shadow-lift">
                <div className="flex gap-5">
                  <div className="shrink-0">
                    {f.photo ? (
                      <img
                        src={f.photo}
                        alt={f.name}
                        className="size-24 sm:size-28 rounded-2xl object-cover border border-border"
                      />
                    ) : (
                      <div className="size-24 sm:size-28 rounded-2xl bg-gradient-to-br from-primary/20 to-[color:var(--coral)]/20 border border-border grid place-items-center font-display text-2xl font-semibold text-foreground/40">
                        {f.name
                          .split(" ")
                          .map((p) => p[0])
                          .join("")}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-display text-xl font-semibold leading-tight">
                      {f.name}
                      {f.confirm && <Confirm />}
                    </h3>
                    <p className="mt-0.5 text-sm font-medium text-primary">
                      {f.role}
                    </p>
                    <p className="mt-3 text-sm text-foreground/75 leading-relaxed">
                      {f.bio}
                    </p>
                    {f.linkedin && (
                      <a
                        href={f.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-foreground/70 hover:text-primary"
                      >
                        <Linkedin className="size-4" /> LinkedIn
                        <ExternalLink className="size-3 opacity-60" />
                      </a>
                    )}
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
        <Reveal delay={200}>
          <p className="mt-6 text-sm text-foreground/60">
            Fachliche Tiefe: Promotion zum ökonomischen Wert von Daten <Confirm />.
          </p>
        </Reveal>
      </section>

      {/* EXPERTISE */}
      <section className="bg-card/60 border-y border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-24">
          <Reveal>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight">
              Expertise & Autorität
            </h2>
          </Reveal>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { k: "11+ Jahre", v: "eCommerce-SEO in der Praxis", confirm: true },
              { k: "Leipzig / DE", v: "Team und Daten in Deutschland" },
              { k: "Eigene Agentur", v: "Tägliche Arbeit mit 30+ Tools" },
              { k: "Fachbeiträge", v: "Vorträge & Publikationen", confirm: true },
            ].map((s, i) => (
              <Reveal key={s.k} delay={i * 60}>
                <div className="rounded-2xl border border-border bg-[color:var(--paper)] p-5 shadow-soft">
                  <div className="font-display text-2xl font-semibold text-primary">
                    {s.k}
                  </div>
                  <div className="mt-1 text-sm text-foreground/70">
                    {s.v} {s.confirm && <Confirm />}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* AUTOREN */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-24">
        <Reveal>
          <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight">
            Unsere Autoren
          </h2>
          <p className="mt-3 max-w-2xl text-foreground/70">
            Hinter Verzeichnis und Magazin stehen Menschen mit Fachhintergrund. So entstehen unsere Inhalte und so prüfen wir Preise und Daten.
          </p>
        </Reveal>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {authors.map((a, i) => (
            <Reveal key={a.name} delay={i * 80}>
              <article className="rounded-3xl border border-border bg-card p-6 shadow-soft transition-all hover:-translate-y-1 hover:shadow-lift h-full">
                <div className="size-16 rounded-2xl bg-gradient-to-br from-primary/15 to-[color:var(--coral)]/15 border border-border grid place-items-center font-display text-lg font-semibold text-foreground/50">
                  {a.name
                    .split(" ")
                    .slice(0, 2)
                    .map((p) => p[0])
                    .join("")}
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold">
                  {a.name} {a.confirm && <Confirm />}
                </h3>
                <p className="mt-0.5 text-xs font-medium uppercase tracking-wide text-primary">
                  {a.field}
                </p>
                <p className="mt-3 text-sm text-foreground/75 leading-relaxed">
                  {a.qual}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
        <Reveal delay={200}>
          <div className="mt-8 rounded-3xl border border-border bg-card p-6 shadow-soft">
            <h3 className="font-display text-lg font-semibold">
              Redaktionelle Standards
            </h3>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2 text-sm text-foreground/75">
              {[
                "Preise und Tarife werden bei den Anbietern verifiziert und mit Stand-Datum versehen.",
                "Vergleiche bleiben neutral, bezahlte Platzierungen werden gekennzeichnet.",
                "Quellen und Annahmen werden offengelegt.",
                "Fachliche Inhalte werden zusätzlich gegengelesen.",
              ].map((s) => (
                <li key={s} className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[color:var(--emerald,#12B76A)]" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </section>

      {/* WERTE */}
      <section className="bg-card/60 border-y border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-24">
          <Reveal>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight">
              Wie wir arbeiten
            </h2>
            <p className="mt-3 max-w-2xl text-foreground/70">
              Drei Prinzipien, an denen du uns messen kannst.
            </p>
          </Reveal>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {values.map((v, i) => (
              <Reveal key={v.title} delay={i * 80}>
                <div className="rounded-3xl border border-border bg-[color:var(--paper)] p-6 shadow-soft h-full">
                  <div className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
                    <v.icon className="size-6" />
                  </div>
                  <h3 className="mt-4 font-display text-xl font-semibold">
                    {v.title}
                  </h3>
                  <p className="mt-2 text-sm text-foreground/70 leading-relaxed">
                    {v.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* VERTRAUEN & KONTAKT */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-24">
        <div className="grid gap-10 md:grid-cols-12 items-start">
          <div className="md:col-span-5">
            <Reveal>
              <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight">
                Vertrauen & Kontakt
              </h2>
              <p className="mt-3 text-foreground/70">
                Klare Ansprechpartner, kurze Wege, deutsche Datenschutz-Standards.
              </p>
            </Reveal>
          </div>
          <div className="md:col-span-7 grid gap-4 sm:grid-cols-2">
            <Reveal delay={80}>
              <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <MapPin className="size-4 text-primary" /> Sitz
                </div>
                <p className="mt-2 text-sm text-foreground/75">
                  OMMM GmbH <Confirm />
                  <br />
                  Leipzig, Deutschland
                </p>
              </div>
            </Reveal>
            <Reveal delay={140}>
              <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <ShieldCheck className="size-4 text-primary" /> DSGVO
                </div>
                <p className="mt-2 text-sm text-foreground/75">
                  Daten werden in Deutschland verarbeitet. Keine Passwörter, keine vollständigen Kartennummern.
                </p>
              </div>
            </Reveal>
            <Reveal delay={200}>
              <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Mail className="size-4 text-primary" /> Kontakt
                </div>
                <p className="mt-2 text-sm text-foreground/75">
                  hallo@toolfolio.de <Confirm />
                </p>
              </div>
            </Reveal>
            <Reveal delay={260}>
              <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <BookOpen className="size-4 text-primary" /> Rechtliches
                </div>
                <p className="mt-2 text-sm text-foreground/75">
                  <a href="/impressum" className="underline hover:text-primary">
                    Impressum
                  </a>{" "}
                  ·{" "}
                  <a href="/datenschutz" className="underline hover:text-primary">
                    Datenschutz
                  </a>
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-20">
        <div className="relative overflow-hidden rounded-[2rem] border border-border bg-gradient-to-br from-primary to-[color:var(--coral)] p-10 sm:p-14 text-primary-foreground shadow-lift">
          <div className="max-w-2xl">
            <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight">
              Lerne Toolfolio kennen.
            </h2>
            <p className="mt-3 text-primary-foreground/85">
              In 5 Minuten siehst du, was du wirklich für Software ausgibst und wo du heute sparen kannst.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="/onboarding"
                className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--paper)] px-5 py-3 text-sm font-semibold text-foreground shadow-soft hover:shadow-lift transition-all"
              >
                Kostenlos starten <ArrowRight className="size-4" />
              </a>
              <a
                href="/preise"
                className="inline-flex items-center gap-1.5 rounded-full border border-primary-foreground/30 px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary-foreground/10 transition-all"
              >
                Preise ansehen
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
