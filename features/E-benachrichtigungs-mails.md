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

## E-07 Trigger + Versand (deployed 2026-06-28)
- Migration `profiles.benachrichtigung_sparen` (Opt-out, Default an) + Toggle in den Benachrichtigungs-Einstellungen (B-28, „Sparvorschlaege").
- Cron-Route `POST /api/cron/sparvorschlag` (CRON_SECRET): findet je Nutzer den staerksten „monatlich -> jaehrlich"-Vorschlag (`berechneVorschlaege`, typ `intervall`) fuer ein **>= 3 Monate** genutztes Tool (`MIN_MONATE`), Nutzungsdauer aus `abos.created_at`, fuellt die konkrete Sparvorschlag-Mail (usageDuration/currentInterval/savingsPercent/yearlySaving). **Dedup** pro Abo+Monat via `notification_log` (`ref=savings:<aboId>:<YYYY-MM>`), respektiert Opt-out und bereits erledigte Vorschlaege (`sparvorschlag_status`). `?dry=1` liefert nur die Kandidaten ohne Versand.
- **Versand passiert nur bei Aufruf mit dem Secret; bewusst KEIN VPS-Cron eingerichtet** (Aktivierung bleibt Markus' Go, wie bei den anderen Versand-Wegen). Dry-Run in Prod verifiziert (auth + valides JSON).

## E-03 / E-04 Trigger + Versand (deployed 2026-06-28)
- **E-03 Trial:** `POST /api/cron/trial`. Findet Trials (`abos.trial_endet`), Stufe nach Resttagen (<=7 / <=3 / <=1), fuellt die Trial-Mail (langes Datum, Folgebetrag `formatEur(kosten)`, Intervall-Nomen). Dedup je Abo+Stufe (`ref=trial:<aboId>:<stufe>`), Opt-out `benachrichtigung_trial`. So bekommt ein Trial genau eine 7-, eine 3- und eine 1-Tages-Mail.
- **E-04 Spike:** `POST /api/cron/spike`. `berechneAiCredits` liefert `spikeFaktor` (>= 1,5x Schnitt); Mail mit Abweichung %, Monats-Hochrechnung (anteilig aus dem bisherigen Monat) und Balken. Dedup je Dienst+Monat (`ref=spike:<serviceId>:<YYYY-MM>`). Neues Opt-out `benachrichtigung_spike` (Migration + Toggle in B-28 „AI-Spike-Alarm").
- Beide `?dry=1` = Vorschau ohne Versand; Versand nur mit `CRON_SECRET`, **kein VPS-Cron** (Aktivierung = Go). Dry-Run in Prod ok.

## E-05 Preiserhoehung Trigger + Versand (deployed 2026-06-28)
- **Preis-Historie:** neue Tabelle `abo_preis_historie` (user_id, abo_id, alt/neu_kosten, alt/neu_intervall, erfasst_am) + AFTER-UPDATE-Trigger `log_abo_preisaenderung` auf `abos` (SECURITY DEFINER), der jede Kosten-/Intervall-Aenderung mitschreibt. RLS-Lesen ueber `has_account_access`, Schreiben nur Trigger/Service-Role.
- **E-05:** `POST /api/cron/preiserhoehung`. Echte Erhoehungen (gleiches Intervall, neu > alt) der letzten 45 Tage, fuellt die Preiserhoehungs-Mail (alt/neu, Differenz, Prozent, Jahres-Mehrkosten, „gueltig ab", source=billing). Dedup je Aenderung (`ref=priceup:<historyId>`), Opt-out `benachrichtigung_preis` (Migration + Toggle B-28 „Preiserhoehungen"). `?dry=1`, Versand nur mit CRON_SECRET, **kein VPS-Cron**. Dry-Run Prod ok.

**Damit ist die Benachrichtigungs-Mail-Familie E-02..E-07 vollstaendig** (Vorlage + Ausloesung). Versand-Crons fuer E-03/E-04/E-05/E-07 bereit, aber bewusst nicht scharf.

## Offen (Folge-Inkrement)
- Bei Go die vier Versand-Crons (sparvorschlag/trial/spike/preiserhoehung) auf dem VPS einplanen; Schwellen (`MIN_MONATE`, Spike-Faktor 1,5x, Trial-Stufen, 45-Tage-Fenster) ggf. justieren.
- E-08 Lead-an-Anbieter haengt am Verzeichnis (V-04) und kommt spaeter.

## QA
- 2026-06-28: tsc 0 Fehler, `next build` gruen, Vorschau-Route rendert alle vier Mails. ESLint sauber fuer die neuen Dateien (die 3 bestehenden Marketing-`<a>`-Warnungen sind unabhaengig).
