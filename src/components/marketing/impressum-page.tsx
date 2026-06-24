import { Nav, Footer, Reveal } from "./marketing-home";

const Placeholder = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-block rounded-md bg-[color:var(--coral)]/15 px-2 py-0.5 text-[color:var(--coral)] font-medium">
    {children}
  </span>
);

const sections = [
  {
    id: "angaben",
    title: "Angaben gemäß § 5 DDG",
    content: (
      <>
        <p className="font-semibold">OMMM GmbH</p>
        <p className="mt-2 text-foreground/80">Kranichweg 5</p>
        <p className="text-foreground/80">04420 Markranstädt</p>
      </>
    ),
  },
  {
    id: "vertretung",
    title: "Vertreten durch",
    content: (
      <>
        <p className="text-foreground/80">Geschäftsführer: Markus Laue</p>
      </>
    ),
  },
  {
    id: "kontakt",
    title: "Kontakt",
    content: (
      <>
        <p className="text-foreground/80">
          Telefon: 034205-509752
        </p>
        <p className="mt-2 text-foreground/80">
          E-Mail: info@ommm.de
        </p>
        <p className="mt-2 text-foreground/80">
          Kontakt für Toolfolio: info@toolfolio.de
        </p>
      </>
    ),
  },
  {
    id: "handelsregister",
    title: "Registereintrag",
    content: (
      <>
        <p className="text-foreground/80">Eintragung im Handelsregister</p>
        <p className="mt-2 text-foreground/80">
          Registergericht: <Placeholder>[Amtsgericht, bitte ergänzen, vermutlich Leipzig, bestätigen]</Placeholder>
        </p>
        <p className="mt-2 text-foreground/80">
          Registernummer: <Placeholder>[HRB ..., bitte ergänzen]</Placeholder>
        </p>
      </>
    ),
  },
  {
    id: "ust-id",
    title: "Umsatzsteuer-ID",
    content: (
      <>
        <p className="text-foreground/80">
          Umsatzsteuer-Identifikationsnummer gemäß § 27 a UStG: DE318929831
        </p>
      </>
    ),
  },
  {
    id: "verantwortlich",
    title: "Redaktionell verantwortlich (§ 18 Abs. 2 MStV)",
    content: (
      <>
        <p className="text-foreground/80">
          <Placeholder>[Name und Anschrift der verantwortlichen Person, bitte ergänzen, üblicherweise ein Geschäftsführer]</Placeholder>
        </p>
      </>
    ),
  },
  {
    id: "streitbeilegung",
    title: "Verbraucherstreitbeilegung / Universalschlichtungsstelle",
    content: (
      <>
        <p className="text-foreground/80">
          Hinweis nach § 36 VSBG zur Teilnahme an einem Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle:{" "}
          <Placeholder>[bitte mit Max festlegen]</Placeholder>
        </p>
        <p className="mt-3 text-sm text-foreground/70">
          Übliche Formulierung: nicht verpflichtet und nicht bereit, sofern so gewünscht.
        </p>
      </>
    ),
  },
  {
    id: "eu-os",
    title: "EU-Streitschlichtung (Status prüfen)",
    content: (
      <>
        <p className="text-foreground/80">
          <Placeholder>[Status mit Max klären]</Placeholder>
        </p>
        <p className="mt-3 text-sm text-foreground/70">
          Früher war ein Link zur EU-Plattform für Online-Streitbeilegung üblich. Diese Plattform wurde 2025 eingestellt. Vor dem Livegang prüfen lassen, ob dieser Hinweis noch aufzunehmen ist oder entfällt.
        </p>
      </>
    ),
  },
  {
    id: "haftung-inhalte",
    title: "Haftung für Inhalte",
    content: (
      <>
        <p className="text-foreground/80 leading-relaxed">
          Die Inhalte unserer Seiten wurden mit Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte übernehmen wir jedoch keine Gewähr. Als Diensteanbieter sind wir gemäß § 7 Abs. 1 DDG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 DDG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen. Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen Gesetzen bleiben hiervon unberührt. Eine diesbezügliche Haftung ist jedoch erst ab dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung möglich. Bei Bekanntwerden von entsprechenden Rechtsverletzungen werden wir diese Inhalte umgehend entfernen.
        </p>
      </>
    ),
  },
  {
    id: "haftung-links",
    title: "Haftung für Links",
    content: (
      <>
        <p className="text-foreground/80 leading-relaxed">
          Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich. Die verlinkten Seiten wurden zum Zeitpunkt der Verlinkung auf mögliche Rechtsverstöße überprüft. Rechtswidrige Inhalte waren zum Zeitpunkt der Verlinkung nicht erkennbar. Eine permanente inhaltliche Kontrolle der verlinkten Seiten ist jedoch ohne konkrete Anhaltspunkte einer Rechtsverletzung nicht zumutbar. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Links umgehend entfernen.
        </p>
      </>
    ),
  },
  {
    id: "urheberrecht",
    title: "Urheberrecht",
    content: (
      <>
        <p className="text-foreground/80 leading-relaxed">
          Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers. Downloads und Kopien dieser Seite sind nur für den privaten, nicht kommerziellen Gebrauch gestattet. Soweit die Inhalte auf dieser Seite nicht vom Betreiber erstellt wurden, werden die Urheberrechte Dritter beachtet. Insbesondere werden Inhalte Dritter als solche gekennzeichnet. Sollten Sie trotzdem auf eine Urheberrechtsverletzung aufmerksam werden, bitten wir um einen entsprechenden Hinweis. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Inhalte umgehend entfernen.
        </p>
      </>
    ),
  },
];

export function ImpressumPage() {
  return (
    <div className="min-h-screen bg-[color:var(--paper)] text-foreground">
      <div id="top" />
      <Nav />

      <main className="mx-auto max-w-3xl px-4 sm:px-6 py-12 sm:py-20">
        <Reveal>
          <h1 className="font-display text-4xl sm:text-5xl font-semibold tracking-tight">
            Impressum
          </h1>
          <p className="mt-4 text-foreground/70 leading-relaxed">
            Rechtliche Angaben nach § 5 DDG. Platzhalter markieren Felder, die vor dem Livegang mit den echten Daten gefüllt und anwaltlich geprüft werden müssen.
          </p>
        </Reveal>

        <div className="mt-12 sm:mt-16 space-y-12 sm:space-y-16">
          {sections.map((section, i) => (
            <Reveal key={section.id} delay={i * 60}>
              <section id={section.id}>
                <h2 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight">
                  {section.title}
                </h2>
                <div className="mt-4 text-foreground/80 leading-relaxed">
                  {section.content}
                </div>
              </section>
            </Reveal>
          ))}
        </div>

        <Reveal delay={sections.length * 60}>
          <div className="mt-16 rounded-2xl border border-border bg-card p-5 text-sm text-foreground/70 leading-relaxed">
            Hinweis: Diese Seite ist keine Rechtsberatung. Alle unbekannten Rechtsdaten sind als Platzhalter gekennzeichnet und müssen vor dem Livegang von der OMMM GmbH anwaltlich prüfen und vervollständigen lassen.
          </div>
        </Reveal>
      </main>

      <Footer />
    </div>
  );
}
