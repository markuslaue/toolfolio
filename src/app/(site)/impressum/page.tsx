import type { Metadata } from "next";
import { RechtsLayout } from "@/components/marketing/rechts-layout";

export const metadata: Metadata = {
  title: "Impressum",
  description: "Anbieterkennzeichnung der OMMM GmbH gemäß § 5 DDG.",
};

export default function ImpressumPage() {
  return (
    <RechtsLayout titel="Impressum" stand="Juni 2026">
      <section>
        <h2>Angaben gemäß § 5 DDG</h2>
        <p>
          <strong>OMMM GmbH</strong>
          <br />
          [Straße und Hausnummer]
          <br />
          [PLZ] Leipzig
          <br />
          Deutschland
        </p>
      </section>

      <section>
        <h2>Vertreten durch</h2>
        <p>Geschäftsführung: [Name der Geschäftsführung]</p>
      </section>

      <section>
        <h2>Kontakt</h2>
        <p>
          E-Mail: hallo@toolfolio.de
          <br />
          Telefon: [Telefonnummer]
        </p>
      </section>

      <section>
        <h2>Registereintrag</h2>
        <p>
          Eintragung im Handelsregister
          <br />
          Registergericht: [Amtsgericht]
          <br />
          Registernummer: HRB [Nummer]
        </p>
      </section>

      <section>
        <h2>Umsatzsteuer-ID</h2>
        <p>
          Umsatzsteuer-Identifikationsnummer gemäß § 27 a UStG: [USt-IdNr.]
        </p>
      </section>

      <section>
        <h2>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</h2>
        <p>[Name], Anschrift wie oben.</p>
      </section>

      <section>
        <h2>Streitschlichtung</h2>
        <p>
          Wir sind nicht verpflichtet und nicht bereit, an Streitbeilegungsverfahren vor einer
          Verbraucherschlichtungsstelle teilzunehmen.
        </p>
      </section>
    </RechtsLayout>
  );
}
