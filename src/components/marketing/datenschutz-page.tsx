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
    id: "verantwortlicher",
    title: "1. Verantwortlicher",
    content: (
      <>
        <p>
          OMMM GmbH, Kranichweg 5, 04420 Markranstädt. E-Mail: info@ommm.de, Kontakt für Toolfolio: info@toolfolio.de. Telefon: 034205-509752.
        </p>
        <p className="mt-3">
          Geschäftsführer: Markus Laue. Ein Datenschutzbeauftragter ist nicht bestellt, da gesetzlich nicht erforderlich.
        </p>
      </>
    ),
  },
  {
    id: "allgemeines",
    title: "2. Allgemeines",
    content: (
      <p>
        Wir verarbeiten personenbezogene Daten nur im erforderlichen Umfang und nach den Vorgaben der DSGVO. Toolfolio richtet sich an Unternehmen (B2B). Auch in diesem Rahmen sind die handelnden natürlichen Personen geschützt. Diese Erklärung informiert über Art, Umfang und Zweck der Verarbeitung sowie über die Rechtsgrundlagen.
      </p>
    ),
  },
  {
    id: "rechte",
    title: "3. Deine Rechte",
    content: (
      <p>
        Auskunft (Art. 15), Berichtigung (Art. 16), Löschung (Art. 17), Einschränkung (Art. 18), Datenübertragbarkeit (Art. 20), Widerspruch (Art. 21) sowie Widerruf erteilter Einwilligungen mit Wirkung für die Zukunft (Art. 7 Abs. 3). Zudem besteht ein Beschwerderecht bei einer Datenschutz-Aufsichtsbehörde (Art. 77). Kontakt für Betroffenenanfragen: info@toolfolio.de.
      </p>
    ),
  },
  {
    id: "logfiles",
    title: "4. Bereitstellung der Website und Server-Logfiles",
    content: (
      <p>
        Beim Aufruf werden technisch notwendige Daten verarbeitet (z. B. IP-Adresse, Zeitpunkt, abgerufene Ressource, Browser), um die Auslieferung und Sicherheit zu gewährleisten. Rechtsgrundlage ist unser berechtigtes Interesse (Art. 6 Abs. 1 lit. f) an einem sicheren, stabilen Betrieb. Speicherung der Logs nur für eine kurze, definierte Dauer.
      </p>
    ),
  },
  {
    id: "hosting",
    title: "5. Hosting (Hostinger)",
    content: (
      <p>
        Das Hosting erfolgt über die Hostinger International Ltd. Die Server stehen in der EU. Mit Hostinger besteht ein Auftragsverarbeitungsvertrag (Data Processing Addendum). Hostinger verarbeitet die Daten ausschließlich weisungsgebunden in unserem Auftrag. Rechtsgrundlage Art. 6 Abs. 1 lit. f.
      </p>
    ),
  },
  {
    id: "cookies",
    title: "6. Cookies und Einwilligung",
    content: (
      <p>
        Wir setzen technisch notwendige Cookies (z. B. zur Login-Session). Diese sind nach § 25 Abs. 2 TDDDG einwilligungsfrei, Rechtsgrundlage Art. 6 Abs. 1 lit. f bzw. lit. b. Für nicht notwendige Verarbeitungen, insbesondere eingebettete Inhalte (siehe YouTube), holen wir vorab deine Einwilligung über ein Consent-Banner ein (§ 25 Abs. 1 TDDDG, Art. 6 Abs. 1 lit. a). Die Einwilligung ist jederzeit widerrufbar.
      </p>
    ),
  },
  {
    id: "plausible",
    title: "7. Reichweitenmessung (Plausible)",
    content: (
      <>
        <p>
          Zur Reichweitenmessung nutzen wir Plausible Analytics, eine datenschutzfreundliche, cookielose Lösung mit EU-Hosting, die keine personenbezogenen Profile bildet und keine geräteübergreifende Wiedererkennung vornimmt. Rechtsgrundlage ist unser berechtigtes Interesse an einer datensparsamen Statistik (Art. 6 Abs. 1 lit. f).
        </p>
        <p className="mt-3">
          <Placeholder>[Falls Plausible-Konfiguration bestätigt, bitte prüfen, ob ohne Einwilligung zulässig, was bei der Standard-Konfiguration regelmäßig der Fall ist.]</Placeholder>
        </p>
      </>
    ),
  },
  {
    id: "supabase",
    title: "8. Nutzerkonto und Authentifizierung (Supabase, Google-Login)",
    content: (
      <>
        <p>
          Für Registrierung, Login und Betrieb der Anwendung nutzen wir Supabase (Datenbank und Authentifizierung, Projekt in der EU-Region), das unseren gesamten Anwendungsdatenbestand weisungsgebunden in unserem Auftrag verarbeitet. Es besteht ein Auftragsverarbeitungsvertrag. Rechtsgrundlage für das Konto ist die Vertragserfüllung (Art. 6 Abs. 1 lit. b).
        </p>
        <p className="mt-3">
          Optional kannst du dich per Google anmelden (Single Sign-on). Dabei wird Google als Empfänger eingebunden, eine Übermittlung in die USA ist möglich, abgesichert über geeignete Garantien (Standardvertragsklauseln bzw. EU-US Data Privacy Framework). Rechtsgrundlage ist deine Einwilligung bzw. die Vertragsanbahnung. <Placeholder>[Anbieterangaben Google bitte ergänzen.]</Placeholder>
        </p>
      </>
    ),
  },
  {
    id: "abos",
    title: "9. Verwaltung deiner Abos und Belege (Kernfunktion)",
    content: (
      <p>
        Zur Nutzung des Trackers verarbeiten wir die von dir bereitgestellten Daten zu deinen Software-Abos sowie die von dir manuell hochgeladenen oder an dein Beleg-Postfach weitergeleiteten Belege und Kontoauszüge. Eine automatische Bankanbindung findet nicht statt, du entscheidest selbst, welche Daten du bereitstellst. Diese Daten können Finanzinformationen enthalten und werden mit besonderer Sorgfalt und geeigneten technischen und organisatorischen Maßnahmen geschützt. Rechtsgrundlage ist die Vertragserfüllung (Art. 6 Abs. 1 lit. b). Sie dienen ausschließlich deinem eigenen Überblick.
      </p>
    ),
  },
  {
    id: "benchmark",
    title: "10. Verifizierter Benchmark (Aggregat-Anonymisierung)",
    content: (
      <>
        <p>
          Für unsere Benchmark-Funktion bilden wir ausschließlich anonymisierte, aggregierte Kennzahlen über eine Vielzahl von Nutzern hinweg (z. B. durchschnittlich gezahlte Preise je Tool). Ein Benchmark-Wert wird erst gebildet und angezeigt, wenn eine ausreichend hohe Mindestzahl voneinander unabhängiger Beiträge vorliegt <Placeholder>[interne Mindestschwelle, hoch ansetzen, mit Max festlegen]</Placeholder>, sodass kein Rückschluss auf einzelne Nutzer, Unternehmen oder Kunden möglich ist. In die Aggregate fließen keine identifizierenden Merkmale ein. Da das Ergebnis anonym ist, unterliegt es nicht mehr der DSGVO. Der vorgelagerte Aggregations- und Anonymisierungsschritt stützt sich auf unser berechtigtes Interesse (Art. 6 Abs. 1 lit. f) an einem neutralen Preisvergleich.
        </p>
        <LegalNote>
          Das konkrete Anonymisierungsverfahren (Mindestschwelle, k-Anonymität, Schutz vor Reidentifizierung) ist vor dem Livegang anwaltlich zu prüfen.
        </LegalNote>
      </>
    ),
  },
  {
    id: "zahlung",
    title: "11. Zahlungsabwicklung (Stripe, PayPal)",
    content: (
      <p>
        Für kostenpflichtige Leistungen nutzen wir Stripe. Die Zahlungsdaten werden direkt von Stripe verarbeitet, das insoweit als eigener Verantwortlicher nach seinen eigenen Datenschutzbestimmungen handelt. Wir selbst speichern keine vollständigen Zahlungsdaten, sondern nur Referenzen (z. B. die letzten vier Ziffern). Als Zahlungsart kann auch PayPal genutzt werden, wobei PayPal als eigener Empfänger die Zahlung abwickelt. Eine Übermittlung in die USA ist möglich, abgesichert über geeignete Garantien. Rechtsgrundlage ist die Vertragserfüllung (Art. 6 Abs. 1 lit. b). <Placeholder>[Anbieterangaben Stripe und PayPal bitte ergänzen.]</Placeholder>
      </p>
    ),
  },
  {
    id: "resend",
    title: "12. Transaktions-E-Mails (Resend)",
    content: (
      <p>
        Für den Versand von Service- und Transaktionsnachrichten (z. B. Bestätigungen, Fristen- und Trial-Hinweise) nutzen wir Resend. Resend verarbeitet die E-Mail-Adresse und die Mailinhalte weisungsgebunden in unserem Auftrag, es besteht ein Auftragsverarbeitungsvertrag. Resend ist ein US-Anbieter, die Übermittlung in die USA wird über geeignete Garantien abgesichert (Standardvertragsklauseln bzw. EU-US Data Privacy Framework). Rechtsgrundlage ist die Vertragserfüllung bzw. unser berechtigtes Interesse (Art. 6 Abs. 1 lit. b bzw. lit. f). <Placeholder>[Resend-Garantien bitte bestätigen.]</Placeholder>
      </p>
    ),
  },
  {
    id: "leads",
    title: "13. Anfragen an Anbieter (Lead-Weitergabe)",
    content: (
      <p>
        Wenn du im Verzeichnis das Anfrageformular eines Anbieters nutzt, übermitteln wir die von dir eingegebenen Daten auf Grundlage deiner ausdrücklichen Einwilligung (Art. 6 Abs. 1 lit. a) an den jeweiligen Anbieter. Dieser verarbeitet sie anschließend als eigener Verantwortlicher zur Bearbeitung deiner Anfrage. Die Einwilligung erfolgt durch aktives Bestätigen beim Absenden und ist jederzeit mit Wirkung für die Zukunft widerrufbar.
      </p>
    ),
  },
  {
    id: "youtube",
    title: "14. Eingebettete Inhalte (YouTube)",
    content: (
      <>
        <p>
          Auf einzelnen Seiten betten wir Videos von YouTube (Google) ein. Diese werden erst geladen, nachdem du eingewilligt hast (Click-to-load). Beim Laden können Daten an Google übermittelt werden, auch in die USA, abgesichert über geeignete Garantien. Wir nutzen den erweiterten Datenschutzmodus (youtube-nocookie). Rechtsgrundlage ist deine Einwilligung (Art. 6 Abs. 1 lit. a).
        </p>
        <LegalNote>
          Die konkrete Einwilligungslösung für YouTube-Embeds (Click-to-load, Banner-Logik, Dokumentation der Einwilligung) ist vor dem Livegang anwaltlich zu prüfen.
        </LegalNote>
      </>
    ),
  },
  {
    id: "ki",
    title: "15. KI-gestützte Auswertungen",
    content: (
      <p>
        Für bestimmte Auswertungen nutzen wir eine KI-Schnittstelle (Anthropic, Claude). Dabei werden ausschließlich anonymisierte, aggregierte Daten ohne Personenbezug verarbeitet. Personenbezogene Inhalte wie Belegtexte oder Kundennamen werden nicht an die Schnittstelle übermittelt. Eine Verarbeitung personenbezogener Daten findet hier daher nicht statt.
      </p>
    ),
  },
  {
    id: "speicherdauer",
    title: "16. Speicherdauer und Löschung",
    content: (
      <p>
        Wir speichern personenbezogene Daten nur so lange, wie es für die genannten Zwecke erforderlich ist oder gesetzliche Aufbewahrungsfristen es verlangen (z. B. handels- und steuerrechtliche Fristen für Rechnungsdaten). Danach werden die Daten gelöscht oder anonymisiert.
      </p>
    ),
  },
  {
    id: "sicherheit",
    title: "17. Datensicherheit",
    content: (
      <p>
        Wir setzen geeignete technische und organisatorische Maßnahmen ein, darunter Transportverschlüsselung (TLS) und Zugriffsbeschränkungen, um deine Daten zu schützen.
      </p>
    ),
  },
  {
    id: "drittlaender",
    title: "18. Übermittlung in Drittländer",
    content: (
      <p>
        Soweit einzelne Dienste Daten in die USA übermitteln (siehe oben), erfolgt dies auf Grundlage geeigneter Garantien nach Art. 44 ff. DSGVO, insbesondere Standardvertragsklauseln und, soweit zertifiziert, des EU-US Data Privacy Framework.
      </p>
    ),
  },
  {
    id: "aenderungen",
    title: "19. Änderungen dieser Datenschutzerklärung",
    content: (
      <p>
        Wir passen diese Erklärung an, wenn sich die Verarbeitung oder die Rechtslage ändert. Es gilt die jeweils hier veröffentlichte Fassung.
      </p>
    ),
  },
  {
    id: "stand",
    title: "20. Stand",
    content: (
      <p>
        Stand: <Placeholder>[Datum bitte ergänzen]</Placeholder>.
      </p>
    ),
  },
];

export function DatenschutzPage() {
  return (
    <div className="min-h-screen bg-[color:var(--paper)] text-foreground">
      <div id="top" />
      <Nav />

      <main className="mx-auto max-w-3xl px-4 sm:px-6 py-12 sm:py-20">
        <Reveal>
          <h1 className="font-display text-4xl sm:text-5xl font-semibold tracking-tight">
            Datenschutzerklärung
          </h1>
          <p className="mt-4 text-foreground/70 leading-relaxed">
            Informationen zur Verarbeitung personenbezogener Daten bei Toolfolio. Verantwortlicher ist die OMMM GmbH. Diese Seite ist keine Rechtsberatung. Platzhalter werden vor dem Livegang gefüllt, zwei Punkte (Benchmark-Anonymisierung und YouTube-Einwilligung) werden zusätzlich anwaltlich geprüft.
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
            Hinweis: Diese Seite ist keine Rechtsberatung. Die Inhalte beruhen auf den vom Betreiber gemachten Angaben. Alle als Platzhalter markierten Felder werden vor dem Livegang ergänzt. Die Anonymisierung des Benchmarks sowie die Einwilligungslösung für YouTube-Embeds werden vor dem Livegang anwaltlich geprüft.
          </div>
        </Reveal>
      </main>

      <Footer />
    </div>
  );
}
