# B-33: Verhandlungs-Assistent

## Status: Roadmap (Konzept steht, Entscheidungen getroffen)
**Bereich:** B (Tracker) · **Created:** 2026-07-14 · **Prio:** P2 · **Abhaengig von:** B-16 (Benchmark), B-32 (Fristen)

## Zusammenfassung
Toolfolio ENTWIRFT im Auftrag des Nutzers Mails an seine Software-Anbieter: ob am Preis noch
etwas geht, ob es gerade einen Rabatt gibt, ob sein Tarif noch der richtige ist. Der Nutzer
liest den Entwurf und schickt ihn mit einem Klick. Optional als Stapel ueber alle Tools.

Der Hebel, den nur Toolfolio hat: Es weiss, **was andere fuer dasselbe Tool zahlen**, wie lange
der Nutzer schon zahlt, und **dass sein Vertrag in 45 Tagen verlaengert**. Das ist der Moment
mit dem meisten Verhandlungsgewicht, und niemand sonst kennt ihn.

## Entscheidungen (Markus, 2026-07-14)
- **Der Mensch drueckt ab, nicht die Maschine.** Entwurf plus Freigabe. Kein Automatikversand
  in v1. Loest das Identitaetsproblem, den Spam-Ausbruch und den Kontrollverlust auf einmal.
- **Optional, im Backend aktivierbar und deaktivierbar.**
- **KEINE Passwoerter.** Nur die Kundennummer oder die E-Mail, unter der das Abo laeuft, damit
  der Anbieter den Kunden zuordnen kann. Das Wort "Login" darf im Produkt nicht vorkommen,
  sonst tippen Leute ihr Passwort ein (CLAUDE.md Leitplanke 4).
- **Absender ist Toolfolio**, "im Auftrag von <Name>, <Firma>", Antwortadresse beim Nutzer.
  Niemals von der Domain des Nutzers: das bricht SPF und DKIM und erzeugt einen Rechtsschein.
- **Dokumentierte Beauftragung** beim Aktivieren, mit Zeitpunkt und Wortlaut.
- **KEINE Prozentversprechen.** "Bis zu 10 % im Jahr" ist ohne Datengrundlage eine
  irrefuehrende Werbeaussage (UWG) und bricht die Ehrlichkeits-Leitplanke. Erst messen,
  dann die ECHTE Zahl nennen.
- **Anlaesse:** Verlaengerungstermin, Preiserhoehung, Preis ueber Median, lange Treue,
  Black Friday und andere Stichtage.

## Interessenkonflikt, offen benannt
Toolfolio nimmt von Anbietern Geld fuer Sichtbarkeit und verhandelt gleichzeitig gegen sie.
Haltung (Markus): **user-centric**. Ein gesponserter Anbieter wird beim Verhandeln um keinen
Millimeter geschont. Das muss im Produkt sichtbar stehen, wie die Goldene Regel.

## Betriebsrisiko
Wenn hundert Nutzer gleichzeitig automatisiert bei demselben Anbieter anfragen, landet
toolfolio.de auf Blocklisten, und dann kommen auch die Fristen-Mails nicht mehr an.
Deshalb: Drosselung je Anbieter, echter Inhalt statt Textbaustein, Opt-out fuer Anbieter.
