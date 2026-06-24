import { Nav, Footer, Reveal } from "./marketing-home";

const Placeholder = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-block rounded-md bg-[color:var(--coral)]/15 px-2 py-0.5 text-[color:var(--coral)] font-medium">
    {children}
  </span>
);

const LegalNote = ({ children }: { children: React.ReactNode }) => (
  <div className="mt-4 rounded-xl border border-[color:var(--coral)]/30 bg-[color:var(--coral)]/10 px-4 py-3 text-sm text-foreground/80 leading-relaxed">
    <span className="font-semibold text-[color:var(--coral)]">Anwaltliche Prüfung:</span>{" "}
    {children}
  </div>
);

type Section = {
  id: string;
  title: string;
  content: React.ReactNode;
};

const sections: Section[] = [
  {
    id: "geltungsbereich",
    title: "§ 1 Geltungsbereich und Anbieter",
    content: (
      <>
        <p>
          Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für die Nutzung von Toolfolio, betrieben von der OMMM GmbH, Kranichweg 5, 04420 Markranstädt <Placeholder>vollständige Anschrift bitte ergänzen</Placeholder>.
        </p>
        <p className="mt-3">
          Angebot und Vertrag richten sich ausschließlich an Unternehmer im Sinne des § 14 BGB, nicht an Verbraucher. Abweichende Bedingungen des Nutzers gelten nur bei ausdrücklicher schriftlicher Zustimmung.
        </p>
      </>
    ),
  },
  {
    id: "vertragsgegenstand",
    title: "§ 2 Vertragsgegenstand und Leistungsbeschreibung",
    content: (
      <p>
        Toolfolio ist eine Software zur Verwaltung von Software-Abonnements (Tracker) sowie ein öffentliches, neutrales Software-Verzeichnis. Der Funktionsumfang richtet sich nach dem gewählten Tarif. Toolfolio schuldet die Bereitstellung der Software als Software-as-a-Service, nicht einen bestimmten wirtschaftlichen Erfolg (etwa konkrete Einsparungen).
      </p>
    ),
  },
  {
    id: "vermittler",
    title: "§ 3 Stellung als Vermittler (Klarstellung)",
    content: (
      <>
        <p>
          Im Verzeichnis und Marktplatz tritt Toolfolio ausschließlich als neutraler Vermittler und Informationsdienst auf.
        </p>
        <ul className="mt-4 space-y-3 list-disc pl-5">
          <li>Toolfolio wird nicht Vertragspartei etwaiger Verträge zwischen Nutzern und gelisteten Anbietern. Solche Verträge kommen ausschließlich zwischen Nutzer und Anbieter zustande.</li>
          <li>Toolfolio hostet keine fremde Software und wickelt keine Zahlungen für Dritte ab. Buchungen, Verträge und Zahlungen laufen unmittelbar über die jeweiligen Anbieter.</li>
          <li>Toolfolio übernimmt keine Gewähr für Verfügbarkeit, Eigenschaften, Qualität, Rechtmäßigkeit oder Preise der bei Dritten gelisteten Tools sowie für das Zustandekommen oder die Erfüllung von Verträgen mit Anbietern.</li>
          <li>Gesponserte Platzierungen sind als solche gekennzeichnet. Bewertungen, verifizierte Daten und die organische Reihung sind nicht käuflich.</li>
        </ul>
      </>
    ),
  },
  {
    id: "registrierung",
    title: "§ 4 Registrierung und Nutzerkonto",
    content: (
      <p>
        Für die Nutzung ist ein Konto erforderlich. Angaben müssen wahr und aktuell sein. Zugangsdaten sind vertraulich zu halten. Toolfolio kann Konten bei Verstößen sperren.
      </p>
    ),
  },
  {
    id: "tarife",
    title: "§ 5 Tarife, Testphase, Preise und Zahlung",
    content: (
      <>
        <p>
          Es bestehen die Tarife Free, Pro und Agentur <Placeholder>Leistungen je Tarif bitte final festlegen</Placeholder>. Preise: Pro ca. 12 bis 15 €/Monat, Agentur ca. 49 bis 79 €/Monat <Placeholder>Preise sind Platzhalter-Hypothesen</Placeholder>.
        </p>
        <p className="mt-3">
          Zum Start steht eine 14-tägige Testphase mit vollem Funktionsumfang ohne Kreditkarte zur Verfügung. Nach Ablauf wählt der Nutzer einen kostenpflichtigen Tarif oder nutzt den kostenlosen Tarif weiter. Es erfolgt kein automatischer Wechsel in einen zahlungspflichtigen Tarif ohne aktive Wahl.
        </p>
        <p className="mt-3">
          Zahlung über externe Zahlungsdienstleister (Stripe, PayPal). Es gelten die hier genannten Preise zzgl. etwaiger Umsatzsteuer. Bei ausländischen Anbietern kann das Reverse-Charge-Verfahren greifen.
        </p>
        <p className="mt-3">
          Bei Zahlungsverzug kann der Zugang eingeschränkt werden.
        </p>
        <LegalNote>Preise, Tarifleistungen und Zahlungsbedingungen vor Livegang final festlegen und anwaltlich prüfen.</LegalNote>
      </>
    ),
  },
  {
    id: "laufzeit",
    title: "§ 6 Laufzeit und Kündigung",
    content: (
      <>
        <p>
          Kostenpflichtige Tarife laufen je nach Wahl monatlich oder jährlich und sind zum Ende der jeweiligen Laufzeit kündbar <Placeholder>Kündigungsfristen bitte final festlegen</Placeholder>. Der kostenlose Tarif ist jederzeit kündbar. Kündigung in Textform oder über die im Konto vorgesehene Funktion. Das Recht zur außerordentlichen Kündigung bleibt unberührt.
        </p>
      </>
    ),
  },
  {
    id: "pflichten",
    title: "§ 7 Pflichten des Nutzers",
    content: (
      <p>
        Der Nutzer nutzt Toolfolio nur rechtmäßig, stellt nur Daten ein, zu denen er berechtigt ist, und unterlässt Missbrauch, Eingriffe in die Systeme sowie das Einstellen rechtswidriger Inhalte oder unzutreffender Bewertungen.
      </p>
    ),
  },
  {
    id: "verfuegbarkeit",
    title: "§ 8 Verfügbarkeit",
    content: (
      <p>
        Toolfolio wird mit angemessener Sorgfalt bereitgestellt, schuldet aber keine ununterbrochene Verfügbarkeit. Wartung, Störungen und höhere Gewalt können zu Einschränkungen führen. Eine bestimmte Verfügbarkeitsquote wird nur zugesagt, soweit ausdrücklich vereinbart.
      </p>
    ),
  },
  {
    id: "verzeichnis",
    title: "§ 9 Verzeichnis, Bewertungen und Neutralität",
    content: (
      <ul className="space-y-3 list-disc pl-5">
        <li>Inhalte zu Dritt-Tools werden mit Sorgfalt gepflegt, können aber unvollständig oder nicht aktuell sein. Eine Gewähr wird nicht übernommen.</li>
        <li>Bewertungen geben die Meinung der Verfasser wieder. Das Siegel „verifiziert durch Abrechnung“ bestätigt lediglich die belegte Nutzung, nicht die Richtigkeit der Bewertung.</li>
        <li>Gesponserte Plätze sind gekennzeichnet, die organische Reihung ist neutral und nicht käuflich.</li>
      </ul>
    ),
  },
  {
    id: "anbieter",
    title: "§ 10 Bedingungen für Anbieter und Indie-Listings",
    content: (
      <>
        <ul className="space-y-3 list-disc pl-5">
          <li>Anbieter können ihr Listing beanspruchen und pflegen. Angaben müssen zutreffend sein.</li>
          <li>Premium-Platzierungen werden gesondert vergütet und stets als gesponsert gekennzeichnet.</li>
          <li>Indie-Listings können kostenlos als Community-Tool oder, gegen einen einmaligen Beitrag von 49 € <Placeholder>Betrag bitte final festlegen</Placeholder>, als verifiziertes Listing mit Badge erfolgen. Der Badge ist keine Sicherheitsgarantie, sondern bestätigt extern prüfbare Punkte und die Selbstverpflichtung des Anbieters, und kann befristet sein oder entzogen werden.</li>
          <li>Bei vermittelten Anfragen und Rabattcodes dient der Code der Zuordnung der Vermittlung. Rabatte und Partnerschaften werden als Werbung gekennzeichnet.</li>
        </ul>
      </>
    ),
  },
  {
    id: "haftung",
    title: "§ 11 Haftung",
    content: (
      <>
        <p>
          Toolfolio haftet unbeschränkt bei Vorsatz und grober Fahrlässigkeit sowie bei Verletzung von Leben, Körper und Gesundheit.
        </p>
        <p className="mt-3">
          Bei einfacher Fahrlässigkeit haftet Toolfolio nur bei Verletzung wesentlicher Vertragspflichten (Kardinalpflichten) und begrenzt auf den vertragstypischen, vorhersehbaren Schaden.
        </p>
        <p className="mt-3 font-semibold text-foreground">Besondere Hinweise zu Hilfsfunktionen:</p>
        <p className="mt-2">
          Der Kündigungsfristen- und Trial-Wächter, der Benchmark und die Sparvorschläge sind Hilfsfunktionen auf Basis der vom Nutzer bereitgestellten Daten. Sie ersetzen keine eigene Prüfung. Toolfolio übernimmt keine Gewähr für die Richtigkeit, Vollständigkeit oder Rechtzeitigkeit dieser Hinweise und haftet nicht für verpasste Kündigungsfristen, fortlaufende Abbuchungen Dritter, ausgebliebene Einsparungen oder Entscheidungen, die der Nutzer auf Grundlage dieser Funktionen trifft. Die Verantwortung für Kündigungen und Vertragsentscheidungen verbleibt beim Nutzer.
        </p>
        <p className="mt-3">
          Die Funktionen stellen keine Rechts-, Steuer- oder Finanzberatung dar.
        </p>
        <LegalNote>Haftungsklauseln (insbesondere zu Hilfsfunktionen) sind das juristisch heikelste Element dieser AGB und vor dem Livegang vollständig anwaltlich zu prüfen.</LegalNote>
      </>
    ),
  },
  {
    id: "gewaehrleistung",
    title: "§ 12 Gewährleistung",
    content: (
      <p>
        Es gelten die gesetzlichen Vorschriften für die Bereitstellung von Software-as-a-Service, mit den Einschränkungen aus § 8 und § 11.
      </p>
    ),
  },
  {
    id: "datenschutz",
    title: "§ 13 Datenschutz",
    content: (
      <p>
        Informationen zur Verarbeitung personenbezogener Daten finden sich in der{" "}
        <a href="/datenschutz" className="text-[color:var(--violet)] hover:underline">
          Datenschutzerklärung
        </a>
        .
      </p>
    ),
  },
  {
    id: "aenderungen",
    title: "§ 14 Änderungen der AGB und der Leistungen",
    content: (
      <>
        <p>
          Toolfolio kann diese AGB und den Leistungsumfang aus sachlichem Grund mit angemessener Ankündigung ändern <Placeholder>Änderungsmechanismus und Widerspruchsrecht bitte anwaltlich ausgestalten</Placeholder>.
        </p>
        <LegalNote>Änderungsvorbehalt und Zustimmungsfiktion unterliegen strenger AGB-Kontrolle nach §§ 305 ff. BGB und müssen anwaltlich ausformuliert werden.</LegalNote>
      </>
    ),
  },
  {
    id: "schluss",
    title: "§ 15 Schlussbestimmungen",
    content: (
      <>
        <p>
          Es gilt deutsches Recht. Ausschließlicher Gerichtsstand ist, soweit zulässig, der Sitz der OMMM GmbH <Placeholder>Leipzig, bitte bestätigen</Placeholder>. Sollte eine Bestimmung unwirksam sein, bleibt der übrige Vertrag wirksam (salvatorische Klausel).
        </p>
        <p className="mt-3">
          Stand: <Placeholder>Datum bitte ergänzen</Placeholder>
        </p>
      </>
    ),
  },
];

export function AgbPage() {
  return (
    <div className="min-h-screen bg-[color:var(--paper)] text-foreground">
      <div id="top" />
      <Nav />

      <main className="mx-auto max-w-3xl px-4 sm:px-6 py-12 sm:py-20">
        <Reveal>
          <h1 className="font-display text-4xl sm:text-5xl font-semibold tracking-tight">
            Allgemeine Geschäftsbedingungen
          </h1>
          <p className="mt-4 text-foreground/70 leading-relaxed">
            AGB der OMMM GmbH für die Nutzung von Toolfolio. Angebot ausschließlich für Unternehmer (B2B). Dies ist ein Entwurf und keine Rechtsberatung. Diese Fassung muss vor dem Livegang vollständig anwaltlich geprüft werden. Mit <Placeholder>bitte ergänzen</Placeholder> markierte Felder werden vorab gefüllt.
          </p>
        </Reveal>

        <Reveal delay={60}>
          <nav
            aria-label="Inhaltsverzeichnis"
            className="mt-10 rounded-2xl border border-border bg-card p-5"
          >
            <p className="text-sm font-semibold text-foreground/80">Inhalt</p>
            <ol className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
              {sections.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className="text-[color:var(--violet)] hover:underline"
                  >
                    {s.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </Reveal>

        <div className="mt-12 sm:mt-16 space-y-12 sm:space-y-16">
          {sections.map((section, i) => (
            <Reveal key={section.id} delay={i * 40}>
              <section id={section.id} className="scroll-mt-24">
                <h2 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight">
                  {section.title}
                </h2>
                <div className="mt-4 text-foreground/80 leading-relaxed space-y-1">
                  {section.content}
                </div>
              </section>
            </Reveal>
          ))}
        </div>

        <Reveal delay={sections.length * 40}>
          <div className="mt-16 rounded-2xl border border-border bg-card p-5 text-sm text-foreground/70 leading-relaxed">
            Hinweis: Dies ist ein Entwurf und keine Rechtsberatung. AGB sind juristisch besonders heikel (Haftung, Kündigung, Vermittler-Rolle, AGB-Kontrolle nach §§ 305 ff. BGB). Diese Fassung muss vor dem Livegang vollständig anwaltlich geprüft werden. Alle als Platzhalter markierten Felder werden vor dem Livegang ergänzt.
          </div>
        </Reveal>
      </main>

      <Footer />
    </div>
  );
}
