# E-03 / E-04 / E-05 / E-07: Transaktionale Benachrichtigungs-Mails

## Status: Vorlagen deployed (Versand/Trigger offen)
**Created:** 2026-06-28 · **Bereich:** E (Resend-Transaktionsmails)

## Ziel
Die ereignisbezogenen Benachrichtigungs-Mails, die an bereits gebaute Tracker-Features andocken:
- **E-03 Trial-Warnung** (zu B-12 Fristen): Test eines getrackten Tools wird kostenpflichtig (Stufen 7/3/1 Tage).
- **E-04 Spike-Alarm** (zu B-13 AI-Credits): KI-Verbrauch liegt deutlich ueber dem Schnitt, mit Hochrechnung und Balken.
- **E-05 Preiserhoehung erkannt** (zu B-19 Archiv): Preis eines Tools ist gestiegen, mit Differenz, Prozent und Jahres-Mehrkosten.
- **E-07 Sparvorschlag** (zu B-10 Sparvorschlaege): konkrete Spar-Chance (ungenutzt, ueberdimensioniert, Jahreszahlung, redundant, Alternative).

## Umsetzung
- Designs **1:1 aus den Lovable-Vorlagen** portiert (`.lovable-ref/src/components/emails/`), als reine HTML-String-Generatoren ohne JSX. Liegen unter `src/lib/emails/{trial,spike,price-increase,savings}.ts`. Jede Datei exportiert `*Subject`, `*Preheader` und `*EmailHTML(props)`.
- Faithful, kein Downgrade: responsive Tabellen-HTML, Preheader, Fakten-Box, MSO-Fallbacks, Service-/Transaktions-Footer mit Impressum + Datenschutz + "Benachrichtigungen verwalten". Echte Umlaute, Du-Form, keine Gedankenstriche.
- Adaptiert: lovable.app-Host -> toolfolio.de, Absenderkennzeichnung -> OMMM GmbH, Leipzig. Alle Links sind ueber Props ueberschreibbar (Default toolfolio.de).
- **Vorschau-Route** `src/app/email-vorschau/[slug]/route.ts` (noindex) rendert jede Mail mit Beispieldaten zur visuellen Abnahme: `/email-vorschau/{trial,spike,preiserhoehung,sparvorschlag}`.

## Offen (Folge-Inkrement)
- **Trigger + Versand verdrahten**: Erkennung (Trial-Ende aus Abo-Daten, Spike aus ai_spend, Preisanstieg aus Abo-/Archiv-Historie, Sparvorschlaege aus B-10) an Cron/Events haengen und ueber Resend versenden, gedrosselt und respektierend der Benachrichtigungs-Einstellungen (B-28). Versand bleibt bis zum Go bewusst aus (vgl. Frist-Mail-Cron).
- Ableitung der `props` aus echten Nutzerdaten (Betraege im de-Format, Datumstexte).
- E-08 Lead-an-Anbieter haengt am Verzeichnis (V-04) und kommt spaeter.

## QA
- 2026-06-28: tsc 0 Fehler, `next build` gruen, Vorschau-Route rendert alle vier Mails. ESLint sauber fuer die neuen Dateien (die 3 bestehenden Marketing-`<a>`-Warnungen sind unabhaengig).
