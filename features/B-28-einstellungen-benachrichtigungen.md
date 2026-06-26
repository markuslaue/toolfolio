# B-28: Einstellungen - Benachrichtigungen

## Status: Approved & Deployed
**Projekt:** PRJ-06 (Einstellungen) · **Created:** 2026-06-26

## Dependencies
- Requires: B-26 (Huelle), E-02/E-03 (Frist-/Trial-Mails). Lovable nur Platzhalter -> Neuentwicklung.

## Acceptance Criteria
- [x] /app/einstellungen/benachrichtigungen: Schalter fuer Kuendigungsfristen-, Trial- und Produkt-Mails + Vorlaufzeit (3/7/14/30 Tage).
- [x] Wird in profiles gespeichert und nach Reload korrekt vorbefuellt.
- [x] Der Frist-Mail-Cron (E-02/E-03) respektiert die Einstellungen: Opt-out je Art und individuelle Vorlaufzeit pro Nutzer.

## Tech Design
profiles: benachrichtigung_frist/trial/produkt (bool), benachrichtigung_vorlauf (int 1..60). Action saveBenachrichtigungen. Cron /api/cron/fristen: laedt Prefs je Nutzer, Fenster bis 60 Tage, filtert pro Nutzer auf vorlauf + Art-Opt-out.

## QA (2026-06-26)
- Build gruen; Cron-Logik angepasst und typgeprueft. Migration angewandt.
- Datenschutz: granulares Opt-out vor breitem Mail-Rollout. PASS. **APPROVED**.
