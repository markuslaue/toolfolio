import type { Metadata } from "next";
import { RechtsLayout } from "@/components/marketing/rechts-layout";

export const metadata: Metadata = {
  title: "Allgemeine Geschäftsbedingungen",
  description: "Die AGB für die Nutzung von Toolfolio der OMMM GmbH.",
};

export default function AgbPage() {
  return (
    <RechtsLayout titel="Allgemeine Geschäftsbedingungen" stand="Juni 2026">
      <section>
        <h2>1. Geltungsbereich</h2>
        <p>
          Diese Bedingungen gelten für die Nutzung der Software-as-a-Service-Anwendung Toolfolio,
          betrieben von der <strong>OMMM GmbH</strong> (nachfolgend „wir“). Abweichende Bedingungen
          des Nutzers gelten nur bei ausdrücklicher Zustimmung.
        </p>
      </section>

      <section>
        <h2>2. Leistungsbeschreibung</h2>
        <p>
          Toolfolio ist ein Werkzeug zum Verwalten von Software-Abos und Kosten sowie ein
          öffentliches Verzeichnis. Wir sind Vermittler: Wir hosten keine fremde Software und
          wickeln keine fremden Zahlungen ab. Anfragen an Anbieter gehen direkt an diese; wir
          speichern dazu nur ein anonymes Attributions-Ereignis.
        </p>
      </section>

      <section>
        <h2>3. Verifizierte Preise und Sichtbarkeit</h2>
        <p>
          Verifizierte Preise beruhen auf anonymisierten Aggregaten und sind nicht käuflich. Kaufbar
          ist ausschließlich Sichtbarkeit, die stets als „gesponsert“ gekennzeichnet wird.
          Organischer Rang und Bewertungen bleiben davon unberührt.
        </p>
      </section>

      <section>
        <h2>4. Konto, Testphase und Vergütung</h2>
        <p>
          Die Registrierung ist kostenlos. Kostenpflichtige Pläne können vorab unverbindlich getestet
          werden. Preise und Planumfang ergeben sich aus der Preisseite. [Kündigungsfristen,
          Abrechnungsmodalitäten und Widerruf vor Livegang ergänzen.]
        </p>
      </section>

      <section>
        <h2>5. Pflichten des Nutzers</h2>
        <p>
          Du sicherst zu, nur Daten einzustellen, zu denen du berechtigt bist, und keine fremden
          Zugangsdaten zu hinterlegen, zu denen du nicht befugt bist.
        </p>
      </section>

      <section>
        <h2>6. Haftung</h2>
        <p>
          Wir haften nach den gesetzlichen Bestimmungen für Vorsatz und grobe Fahrlässigkeit. Hinweise,
          Benchmarks und Schätzungen sind Orientierung und ohne Gewähr. [Haftungsregelungen vor
          Livegang final fassen.]
        </p>
      </section>

      <section>
        <h2>7. Schlussbestimmungen</h2>
        <p>
          Es gilt deutsches Recht. Sollten einzelne Bestimmungen unwirksam sein, bleibt der übrige
          Vertrag wirksam.
        </p>
      </section>
    </RechtsLayout>
  );
}
