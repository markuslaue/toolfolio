import type { Metadata } from "next";
import { RechtsLayout } from "@/components/marketing/rechts-layout";

export const metadata: Metadata = {
  title: "Datenschutzerklärung",
  description: "Wie die OMMM GmbH personenbezogene Daten bei Toolfolio verarbeitet.",
};

export default function DatenschutzPage() {
  return (
    <RechtsLayout titel="Datenschutzerklärung" stand="Juni 2026">
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
        <h2>5. Rechtsgrundlagen</h2>
        <p>
          Vertragserfüllung (Art. 6 Abs. 1 lit. b DSGVO) für den Betrieb deines Kontos, Einwilligung
          (lit. a) für nicht notwendige Einbettungen und Marketing, berechtigtes Interesse (lit. f)
          für Sicherheit und Reichweitenmessung.
        </p>
      </section>

      <section>
        <h2>6. Cookies und Reichweitenmessung</h2>
        <p>
          Wir setzen cookielose, datensparsame Statistik (Plausible) ein. Nicht notwendige
          Einbettungen (z. B. eingebettete Videos) laden erst nach deiner Einwilligung
          (Click-to-load).
        </p>
      </section>

      <section>
        <h2>7. Deine Rechte</h2>
        <p>
          Du hast das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung, Datenübertragbarkeit
          und Widerspruch sowie ein Beschwerderecht bei einer Aufsichtsbehörde. Erteilte
          Einwilligungen kannst du jederzeit mit Wirkung für die Zukunft widerrufen.
        </p>
      </section>

      <section>
        <h2>8. Kontakt</h2>
        <p>Für Datenschutzanfragen: hallo@toolfolio.de. [Datenschutzbeauftragte, falls benannt.]</p>
      </section>
    </RechtsLayout>
  );
}
