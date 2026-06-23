import {
  ShieldCheck,
  Lock,
  KeyRound,
  EyeOff,
  Server,
  Database,
  BarChart3,
  Plug,
  UserCog,
  Building2,
  FileText,
  Mail,
  ArrowRight,
  CheckCircle2,
  MapPin,
  Sparkles,
} from "lucide-react";
import { Nav, Footer, Reveal } from "./marketing-home";

const Confirm = () => (
  <span className="ml-2 inline-flex items-center rounded-full bg-[color:var(--coral)]/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[color:var(--coral)]">
    wahrheitsgemäß befüllen
  </span>
);

const promises = [
  {
    icon: KeyRound,
    title: "Keine Passwörter, keine vollständigen Kartennummern",
    body: "Toolfolio speichert nur Referenzen, zum Beispiel die letzten vier Ziffern oder einen Verweis wie „liegt in 1Password“. Was nicht gespeichert wird, kann auch nicht gestohlen werden.",
  },
  {
    icon: EyeOff,
    title: "Nur lesender Zugriff",
    body: "Integrationen sind read-only und greifen mit minimalen Berechtigungen auf das zu, was du freigibst. Schreibrechte fordert Toolfolio bewusst nicht an.",
  },
  {
    icon: MapPin,
    title: "DSGVO-konform, Hosting in der EU",
    body: "Deine Daten liegen bei einem Anbieter in der Europäischen Union [wahrheitsgemäß befüllen: Anbieter, Region]. Verarbeitung nach Maßgabe der DSGVO.",
  },
  {
    icon: BarChart3,
    title: "Anonym im Benchmark",
    body: "Niemand sieht deine Einzeldaten. In den Benchmark fließen ausschließlich anonymisierte und aggregierte Werte ein.",
  },
];

const notStored = [
  "Passwörter zu deinen Software-Konten",
  "Vollständige Kreditkartennummern oder CVC-Codes",
  "IBAN deiner Geschäftskunden",
  "Zugangsdaten zu fremden Tools",
  "Inhalte aus deinen verbundenen Tools, die wir nicht für die Funktion brauchen",
];

const rights = [
  { title: "Auskunft", body: "Erhalte eine Übersicht der zu dir gespeicherten Daten." },
  { title: "Datenexport", body: "Exportiere deine Daten jederzeit als strukturierte Datei aus den Konto-Einstellungen." },
  { title: "Berichtigung", body: "Korrigiere falsche Angaben direkt im Konto oder über den Support." },
  { title: "Löschung", body: "Lösche dein Konto und die zugehörigen Daten in den Einstellungen oder per Mail an uns." },
];

export function SecurityPage() {
  return (
    <div className="min-h-screen bg-[color:var(--paper)] text-foreground">
      <div id="top" />
      <Nav />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-32 -left-20 h-[520px] w-[520px] rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -top-10 right-0 h-[420px] w-[420px] rounded-full bg-[color:var(--success)]/10 blur-3xl" />
        </div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-12 pb-16 sm:pt-20 sm:pb-24">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-foreground/70">
              <ShieldCheck className="size-3.5 text-primary" />
              Sicherheit & Datenschutz
            </span>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="mt-5 max-w-4xl font-display text-4xl sm:text-5xl md:text-6xl font-semibold leading-[1.05] tracking-tight">
              Deine Daten gehören dir. <span className="text-primary">Punkt.</span>
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <p className="mt-6 max-w-2xl text-lg text-foreground/70 leading-relaxed">
              Toolfolio speichert bewusst so wenig wie möglich und alles bleibt in der EU. Diese Seite erklärt in Klartext, wie wir mit deinen Daten umgehen. Die juristische Datenschutzerklärung findest du{" "}
              <a href="/datenschutz" className="underline decoration-primary/40 underline-offset-4 hover:text-primary">
                hier
              </a>
              .
            </p>
          </Reveal>
        </div>
      </section>

      {/* KERNVERSPRECHEN */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-16 sm:pb-24">
        <div className="grid gap-6 md:grid-cols-2">
          {promises.map((p, i) => (
            <Reveal key={p.title} delay={i * 80}>
              <article className="h-full rounded-3xl border border-border bg-card p-6 shadow-soft transition-all hover:-translate-y-1 hover:shadow-lift">
                <div className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
                  <p.icon className="size-6" />
                </div>
                <h3 className="mt-4 font-display text-xl font-semibold leading-tight">
                  {p.title}
                </h3>
                <p className="mt-2 text-sm text-foreground/75 leading-relaxed">{p.body}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* HOSTING */}
      <section className="bg-card/60 border-y border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-24">
          <div className="grid gap-10 md:grid-cols-12">
            <div className="md:col-span-5">
              <Reveal>
                <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight">
                  Wo deine Daten liegen
                </h2>
                <p className="mt-3 text-foreground/70">
                  Klartext, keine Marketing-Floskeln. Wir nennen den Anbieter und die Region.
                </p>
              </Reveal>
            </div>
            <div className="md:col-span-7 grid gap-4 sm:grid-cols-2">
              {[
                {
                  icon: Server,
                  title: "Hosting-Anbieter",
                  body: "Betrieb bei [Anbieter, Region in der EU]",
                  confirm: true,
                },
                {
                  icon: MapPin,
                  title: "Standort",
                  body: "Rechenzentrum in der Europäischen Union [Land/Region]",
                  confirm: true,
                },
                {
                  icon: Lock,
                  title: "Verschlüsselung",
                  body: "Transport per TLS, Speicherung verschlüsselt [Verfahren konkret nennen]",
                  confirm: true,
                },
                {
                  icon: Database,
                  title: "Backups",
                  body: "Regelmäßige Backups mit definierter Aufbewahrung [Frequenz, Retention]",
                  confirm: true,
                },
              ].map((f, i) => (
                <Reveal key={f.title} delay={i * 60}>
                  <div className="h-full rounded-3xl border border-border bg-[color:var(--paper)] p-5 shadow-soft">
                    <div className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                      <f.icon className="size-5" />
                    </div>
                    <h3 className="mt-3 font-display text-base font-semibold">
                      {f.title} {f.confirm && <Confirm />}
                    </h3>
                    <p className="mt-1.5 text-sm text-foreground/70 leading-relaxed">{f.body}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* NICHT GESPEICHERT */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-24">
        <div className="grid gap-10 md:grid-cols-12 items-start">
          <div className="md:col-span-5">
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full bg-[color:var(--success)]/15 px-3 py-1 text-xs font-semibold text-[color:var(--success)]">
                <CheckCircle2 className="size-3.5" /> Das stärkste Versprechen
              </span>
              <h2 className="mt-4 font-display text-3xl sm:text-4xl font-semibold tracking-tight">
                Was wir bewusst <span className="text-primary">nicht</span> speichern
              </h2>
              <p className="mt-3 text-foreground/70 leading-relaxed">
                Toolfolio merkt sich, <em>wo</em> ein Login liegt, nicht den Login selbst. Wir nennen das das Referenz-Prinzip: ein Verweis statt der echten Daten. Was nicht gespeichert wird, kann nicht gestohlen werden.
              </p>
            </Reveal>
          </div>
          <div className="md:col-span-7">
            <Reveal delay={100}>
              <ul className="grid gap-3 rounded-3xl border border-border bg-card p-6 shadow-soft">
                {notStored.map((n) => (
                  <li key={n} className="flex items-start gap-3 text-sm text-foreground/80">
                    <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-[color:var(--destructive)]/10 text-[color:var(--destructive)]">
                      <EyeOff className="size-3.5" />
                    </span>
                    <span>{n}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 rounded-3xl border border-border bg-[color:var(--paper)] p-5 text-sm text-foreground/75 leading-relaxed">
                Beispiel: Statt deines Adobe-Passworts speichern wir nur den Hinweis „liegt in 1Password, Vault Agentur“. Statt deiner Kartennummer nur die letzten vier Ziffern, damit du sie in der Liste wiedererkennst.
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* BENCHMARK */}
      <section className="bg-card/60 border-y border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-24">
          <Reveal>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight">
              Wie der Benchmark mit Daten umgeht
            </h2>
            <p className="mt-3 max-w-2xl text-foreground/70 leading-relaxed">
              Der Benchmark zeigt dir, wo du im Vergleich zu ähnlichen Teams stehst. Damit das fair und sicher bleibt, gilt:
            </p>
          </Reveal>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              {
                t: "Anonym und aggregiert",
                b: "Beiträge fließen ohne Personen- oder Firmenbezug in den Vergleich. Es werden nur Bandbreiten und Mediane gezeigt.",
              },
              {
                t: "Mindestgröße pro Gruppe",
                b: "Es werden nur Werte ausgewiesen, wenn genug Teilnehmer in einer Gruppe sind, sodass keine Rückschlüsse möglich sind.",
              },
                {
                t: "Du entscheidest",
                b: "Teilnahme erfolgt per Opt-in/Opt-out in den Einstellungen [wahrheitsgemäß befüllen]. Du kannst deinen Beitrag jederzeit beenden.",
              },
            ].map((c, i) => (
              <Reveal key={c.t} delay={i * 80}>
                <div className="h-full rounded-3xl border border-border bg-[color:var(--paper)] p-6 shadow-soft">
                  <div className="grid size-12 place-items-center rounded-2xl bg-[color:var(--success)]/15 text-[color:var(--success)]">
                    <BarChart3 className="size-6" />
                  </div>
                  <h3 className="mt-4 font-display text-lg font-semibold">{c.t}</h3>
                  <p className="mt-2 text-sm text-foreground/75 leading-relaxed">{c.b}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* INTEGRATIONEN */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-24">
        <div className="grid gap-10 md:grid-cols-12 items-start">
          <div className="md:col-span-5">
            <Reveal>
              <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight">
                Integrationen & Zugriffe
              </h2>
              <p className="mt-3 text-foreground/70 leading-relaxed">
                Du verbindest selbst, du kannst jederzeit trennen. Bei jeder Verbindung ist sichtbar, was Toolfolio liest.
              </p>
            </Reveal>
          </div>
          <div className="md:col-span-7 grid gap-4 sm:grid-cols-2">
            {[
              { icon: EyeOff, t: "Read-only", b: "Toolfolio fordert ausschließlich Lesezugriff an. Es wird nichts in deinen verbundenen Tools verändert." },
              { icon: Plug, t: "Minimale Scopes", b: "Es wird nur das gelesen, was für die Funktion nötig ist, nichts darüber hinaus." },
              { icon: UserCog, t: "Volle Kontrolle", b: "Verbindungen lassen sich jederzeit in den Einstellungen trennen, mit sofortigem Effekt." },
              { icon: ShieldCheck, t: "Transparente Anzeige", b: "Vor und nach dem Verbinden siehst du genau, welche Daten Toolfolio liest." },
            ].map((f, i) => (
              <Reveal key={f.t} delay={i * 60}>
                <div className="h-full rounded-3xl border border-border bg-card p-5 shadow-soft">
                  <div className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                    <f.icon className="size-5" />
                  </div>
                  <h3 className="mt-3 font-display text-base font-semibold">{f.t}</h3>
                  <p className="mt-1.5 text-sm text-foreground/70 leading-relaxed">{f.b}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* DEINE RECHTE */}
      <section className="bg-card/60 border-y border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-24">
          <Reveal>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight">
              Deine Kontrolle und deine Rechte
            </h2>
            <p className="mt-3 max-w-2xl text-foreground/70 leading-relaxed">
              Die DSGVO gibt dir konkrete Rechte. In Toolfolio nimmst du sie direkt in den{" "}
              <a href="/einstellungen" className="underline decoration-primary/40 underline-offset-4 hover:text-primary">
                Konto-Einstellungen
              </a>{" "}
              wahr oder schreibst uns eine Mail.
            </p>
          </Reveal>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {rights.map((r, i) => (
              <Reveal key={r.title} delay={i * 60}>
                <div className="h-full rounded-3xl border border-border bg-[color:var(--paper)] p-5 shadow-soft">
                  <h3 className="font-display text-lg font-semibold">{r.title}</h3>
                  <p className="mt-2 text-sm text-foreground/70 leading-relaxed">{r.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* GESCHÄFTSKUNDEN */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-24">
        <div className="grid gap-10 md:grid-cols-12 items-start">
          <div className="md:col-span-5">
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-foreground/70">
                <Building2 className="size-3.5 text-primary" />
                Für Agenturen & Teams
              </span>
              <h2 className="mt-4 font-display text-3xl sm:text-4xl font-semibold tracking-tight">
                Für Geschäftskunden
              </h2>
              <p className="mt-3 text-foreground/70 leading-relaxed">
                Wenn du in Toolfolio personenbezogene Daten deiner Kunden verarbeitest, bieten wir einen Auftragsverarbeitungsvertrag (AVV) und eine aktuelle Liste der Subdienstleister.
              </p>
            </Reveal>
          </div>
          <div className="md:col-span-7 grid gap-4 sm:grid-cols-2">
            <Reveal delay={80}>
              <div className="h-full rounded-3xl border border-border bg-card p-6 shadow-soft">
                <div className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
                  <FileText className="size-6" />
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold">
                  AVV auf Anfrage <Confirm />
                </h3>
                <p className="mt-2 text-sm text-foreground/75 leading-relaxed">
                  Schreib uns kurz, wir senden dir den AVV als unterzeichnungsfähiges PDF.
                </p>
                <a
                  href="mailto:datenschutz@toolfolio.de"
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
                >
                  AVV anfordern <ArrowRight className="size-4" />
                </a>
              </div>
            </Reveal>
            <Reveal delay={140}>
              <div className="h-full rounded-3xl border border-border bg-card p-6 shadow-soft">
                <div className="grid size-12 place-items-center rounded-2xl bg-[color:var(--coral)]/15 text-[color:var(--coral)]">
                  <Database className="size-6" />
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold">
                  Subdienstleister <Confirm />
                </h3>
                <p className="mt-2 text-sm text-foreground/75 leading-relaxed">
                  Aktuelle Liste der eingesetzten Subdienstleister mit Zweck und Standort [Liste pflegen].
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* DOKUMENTE & KONTAKT */}
      <section className="bg-card/60 border-y border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-24">
          <Reveal>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight">
              Dokumente & Kontakt
            </h2>
            <p className="mt-3 max-w-2xl text-foreground/70">
              Alle rechtlichen Dokumente an einer Stelle, plus eine direkte Adresse für Sicherheitsfragen.
            </p>
          </Reveal>
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              { t: "Datenschutzerklärung", href: "/datenschutz", icon: ShieldCheck },
              { t: "AGB", href: "/agb", icon: FileText },
              { t: "Impressum", href: "/impressum", icon: Building2 },
              { t: "Sicherheits-Kontakt", href: "mailto:security@toolfolio.de", icon: Mail, confirm: true },
            ].map((d, i) => (
              <Reveal key={d.t} delay={i * 60}>
                <a
                  href={d.href}
                  className="group flex h-full items-center gap-3 rounded-3xl border border-border bg-[color:var(--paper)] p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-lift"
                >
                  <span className="grid size-11 place-items-center rounded-2xl bg-primary/10 text-primary">
                    <d.icon className="size-5" />
                  </span>
                  <span className="flex-1 font-display text-base font-semibold">
                    {d.t}
                    {d.confirm && <Confirm />}
                  </span>
                  <ArrowRight className="size-4 text-foreground/40 transition-transform group-hover:translate-x-0.5" />
                </a>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-24">
        <Reveal>
          <div className="relative overflow-hidden rounded-[28px] border border-border bg-card p-8 sm:p-14 shadow-lift">
            <div className="pointer-events-none absolute -top-20 -right-20 h-[360px] w-[360px] rounded-full bg-primary/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -left-10 h-[320px] w-[320px] rounded-full bg-[color:var(--coral)]/10 blur-3xl" />
            <div className="relative grid gap-6 md:grid-cols-12 items-center">
              <div className="md:col-span-8">
                <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  <Sparkles className="size-3.5" /> Bereit, loszulegen?
                </span>
                <h2 className="mt-4 font-display text-3xl sm:text-4xl font-semibold tracking-tight">
                  Klare Sicht auf deine Tools, ohne Risiko für deine Daten.
                </h2>
                <p className="mt-3 text-foreground/70 max-w-xl">
                  Starte kostenlos. Keine Kreditkarte nötig, deine Daten bleiben in der EU.
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

      <Footer />
    </div>
  );
}
