import type { Metadata } from "next";
import { RechtsLayout } from "@/components/marketing/rechts-layout";

export const metadata: Metadata = {
  title: "Datenschutzerklärung",
  description: "Wie die OMMM GmbH personenbezogene Daten bei Toolfolio verarbeitet.",
};

export default function DatenschutzPage() {
  return (
    <RechtsLayout titel="Datenschutzerklärung" stand="Juli 2026">
      <section>
        <h2>1. Verantwortlicher</h2>
        <p>
          Verantwortlich für die Datenverarbeitung ist die <strong>OMMM GmbH</strong>, [Anschrift],
          Leipzig, E-Mail: hallo@toolfolio.de.
        </p>
      </section>

      <section>
        <h2>2. Hosting und Speicherort</h2>
        <p>
          Anwendung und Datenbank werden in der Europäischen Union betrieben (Supabase, EU-Region;
          Hosting bei Hostinger, EU). Mit allen Dienstleistern bestehen Auftragsverarbeitungsverträge
          nach Art. 28 DSGVO.
        </p>
      </section>

      <section>
        <h2>3. Welche Daten wir verarbeiten</h2>
        <p>
          <strong>Konto- und Nutzungsdaten:</strong> Name, E-Mail, Einwilligungen sowie die von dir
          erfassten Abo-, Kosten-, Kunden- und Zahlungskanaldaten. Von Zahlungsmitteln speichern wir
          nur Referenzen (z. B. die letzten vier Ziffern), niemals vollständige Kartennummern,
          Prüfziffern oder IBAN.
        </p>
        <p>
          <strong>Anonyme Aggregate:</strong> Für verifizierte Preise und Benchmarks nutzen wir
          ausschließlich anonymisierte Aggregate mit hoher Mindestschwelle. Personenbezogene Inhalte
          fließen niemals in diese Auswertung oder an die KI-Ebene.
        </p>
      </section>

      <section>
        <h2>4. Eingesetzte Dienste (Auftragsverarbeiter)</h2>
        <p>
          Supabase (Datenbank, Auth, Speicher), Hostinger (Hosting), Resend (Transaktionsmails),
          Stripe und PayPal (Zahlung und Rechnung), Google (Anmeldung per SSO), Plausible (cookielose
          Statistik), Anthropic (KI-Auswertung auf anonymen Aggregaten). Bei Drittlandbezug bestehen
          geeignete Garantien (z. B. Standardvertragsklauseln, DPF). [Liste vor Livegang
          vervollständigen.]
        </p>
      </section>

      <section>
        <h2>5. Anfragen an Software-Anbieter</h2>
        <p>
          Wenn du im Verzeichnis eine Demo, eine Beratung oder ein Angebot anfragst, verarbeiten wir
          die Daten, die du im Formular angibst (Name, E-Mail, optional Telefon, Firma und deine
          Nachricht). Wir leiten sie an den Anbieter weiter, den du angefragt hast, oder bei einer
          allgemeinen Anfrage an die passenden Anbieter der Kategorie.
        </p>
        <p>
          Rechtsgrundlage ist die Anbahnung eines Vertrags mit dem Anbieter (Art. 6 Abs. 1 lit. b
          DSGVO). Wir speichern die Anfrage, um sie zustellen und belegen zu können, dass wir es
          getan haben. Eine Einwilligung brauchen wir dafür nicht, denn ohne diese Verarbeitung
          könnten wir deine Anfrage gar nicht bearbeiten.
        </p>
      </section>

      <section>
        <h2>6. Angebote zu einer Kategorie (freiwillig)</h2>
        <p>
          Zusätzlich kannst du im Anfrageformular ein <strong>eigenes, freiwilliges Häkchen</strong>{" "}
          setzen: Wir dürfen dich dann per E-Mail informieren, wenn es zu genau der Kategorie, für die
          du dich interessiert hast, neue oder besonders interessante Angebote von Anbietern gibt.
        </p>
        <p>
          Wichtig, und wir meinen das genau so: <strong>Dieses Häkchen ist freiwillig.</strong> Deine
          Anfrage geht auch ohne es raus, ohne jeden Nachteil. Es ist nicht vorangekreuzt, und es ist
          nicht Teil der Zustimmung zu dieser Datenschutzerklärung.
        </p>
        <p>
          <strong>Wir geben deine Adresse nicht an Anbieter weiter.</strong> Diese E-Mails verschickt
          Toolfolio, nicht der jeweilige Anbieter. Der Anbieter sieht deine Daten nur, wenn du ihn
          selbst angefragt hast.
        </p>
        <p>
          Rechtsgrundlage ist deine Einwilligung (Art. 6 Abs. 1 lit. a DSGVO, § 7 UWG). Wir bestätigen
          sie per E-Mail (Double-Opt-in): Erst wenn du den Link darin anklickst, schreiben wir dich an.
          Wir protokollieren, wann du zugestimmt hast und welchem Satz genau. Du kannst jederzeit mit
          einem Klick widerrufen, ohne Begründung und ohne Nachteil, entweder über den Link in jeder
          E-Mail oder formlos an hallo@toolfolio.de.
        </p>
      </section>

      <section>
        <h2>7. Rechtsgrundlagen</h2>
        <p>
          Vertragserfüllung (Art. 6 Abs. 1 lit. b DSGVO) für den Betrieb deines Kontos und für die
          Bearbeitung von Anfragen an Anbieter, Einwilligung (lit. a) für nicht notwendige
          Einbettungen und für die Angebots-E-Mails nach Abschnitt 6, berechtigtes Interesse (lit. f)
          für Sicherheit und Reichweitenmessung.
        </p>
      </section>

      <section>
        <h2>8. Cookies und Reichweitenmessung</h2>
        <p>
          Wir setzen cookielose, datensparsame Statistik (Plausible) ein. Nicht notwendige
          Einbettungen (z. B. eingebettete Videos) laden erst nach deiner Einwilligung
          (Click-to-load).
        </p>
      </section>

      <section>
        <h2>9. Deine Rechte</h2>
        <p>
          Du hast das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung, Datenübertragbarkeit
          und Widerspruch sowie ein Beschwerderecht bei einer Aufsichtsbehörde. Erteilte
          Einwilligungen kannst du jederzeit mit Wirkung für die Zukunft widerrufen.
        </p>
      </section>

      <section>
        <h2>10. Kontakt</h2>
        <p>Für Datenschutzanfragen: hallo@toolfolio.de. [Datenschutzbeauftragte, falls benannt.]</p>
      </section>
    </RechtsLayout>
  );
}
