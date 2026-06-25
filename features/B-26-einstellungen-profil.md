# B-26: Einstellungen - Profil (etabliert Settings-Huelle)

## Status: Architected
**Created:** 2026-06-25
**Last Updated:** 2026-06-25
**Projekt:** PRJ-06 (Tracker-Kern / Einstellungen)

## Dependencies
- Requires: INFRA-1 (Supabase Auth + profiles), S-01 (Login/Session, MFA-Step-up), S-04 (E-Mail-Wechsel-Bestaetigung)
- Etabliert: Die Einstellungen-Huelle (Sub-Navigation), die B-27 bis B-31 wiederverwenden.

## User Stories
- Als eingeloggter Nutzer moechte ich meinen Namen und meine Konto-E-Mail pflegen, damit mein Profil aktuell ist.
- Als Nutzer moechte ich mein Passwort aendern und Zwei-Faktor aktivieren, damit mein Konto sicher ist.
- Als Nutzer moechte ich Sprache, Zeitzone, Format und Waehrung festlegen, damit Toolfolio zu mir passt.
- Als Nutzer moechte ich eine klare Sub-Navigation der Einstellungen sehen, damit ich die Bereiche finde.

## Out of Scope
- Unternehmen (B-27), Benachrichtigungen (B-28), Plan & Abrechnung (B-29), Team & Rollen (B-30), Daten & Datenschutz (B-31) - hier nur Platzhalter-Routen.
- Avatar-Upload (Supabase Storage) - Button bleibt sichtbar, Funktion folgt spaeter.
- Globale Dark-Mode-Anwendung - die Auswahl wird gespeichert, das Ausrollen der dunklen Tokens ist ein eigenes Thema (auch in der Lovable-Vorlage nur kosmetisch).
- Liste fremder aktiver Sitzungen - der Supabase-Client kann andere Geraete nicht auflisten; nur die aktuelle Sitzung + Abmelden.

## Acceptance Criteria
- [ ] Angenommen ein eingeloggter Nutzer, wenn er `/app/einstellungen` oeffnet, dann sieht er die Einstellungen-Huelle mit Sub-Navigation (Profil, Unternehmen, Benachrichtigungen, Plan & Abrechnung, Team & Rollen, Daten & Datenschutz) und der Profil-Bereich ist aktiv.
- [ ] Angenommen die Profil-Seite, wenn der Nutzer Vor-/Nachname aendert und speichert, dann wird das Profil aktualisiert und eine Bestaetigung erscheint.
- [ ] Angenommen die Profil-Seite, wenn der Nutzer die Konto-E-Mail aendert, dann wird ein Bestaetigungslink an die neue Adresse gesendet (Wechsel erst nach Klick wirksam).
- [ ] Angenommen die Rolle, wenn der Nutzer sie sieht, dann ist sie schreibgeschuetzt und zeigt seine echte Rolle.
- [ ] Angenommen die Sicherheits-Karte, wenn der Nutzer ueber den Dialog ein gueltiges aktuelles + neues Passwort eingibt, dann wird das Passwort geaendert; bei falschem aktuellem Passwort erscheint ein Fehler.
- [ ] Angenommen Zwei-Faktor aus, wenn der Nutzer den Schalter aktiviert, dann erscheint ein Dialog mit echtem QR-Code/Secret; nach Eingabe eines gueltigen Codes ist 2FA aktiv; ein falscher Code zeigt einen Fehler.
- [ ] Angenommen Zwei-Faktor aktiv, wenn der Nutzer es deaktiviert, dann wird der Faktor entfernt.
- [ ] Angenommen die aktive Sitzung, wenn der Nutzer "Von diesem Geraet abmelden" klickt, dann wird er abgemeldet und auf Login geleitet.
- [ ] Angenommen die Karte "Sprache & Darstellung", wenn der Nutzer Werte aendert und speichert, dann werden sie im Profil gespeichert und nach Reload erhalten.

## Edge Cases
- Konto-E-Mail = aktuelle E-Mail: neutrale Meldung, kein unnoetiger Versand.
- Neues Passwort zu schwach/zu kurz: Fehlermeldung, kein Wechsel.
- 2FA: bereits ein Faktor vorhanden -> kein Doppel-Enroll; abgebrochener Enroll wird verworfen (unenroll des unverifizierten Faktors).
- Speichern ohne Aenderung: idempotent, Bestaetigung trotzdem ok.

## Technical Requirements
- Einstellungen-Huelle als geteiltes Layout unter `/app/einstellungen` (Sub-Nav: mobil Pills, Desktop vertikale Liste), Platzhalter-Routen fuer B-27..B-31.
- Profil-Daten aus `profiles`; neue Praeferenz-Spalten (locale, timezone, theme, number_format, currency, avatar_url).
- Server Actions: Profil speichern, E-Mail wechseln, Passwort aendern (mit Verifikation), 2FA enroll/verify/disable, Abmelden.
- shadcn-Komponenten nachziehen: switch, select, dialog, sonner (Toast), avatar.

## Open Questions
- [x] Avatar-Upload jetzt? -> Nein, Button sichtbar, Storage-Anbindung spaeter.
- [x] Dark-Mode global anwenden? -> Nein, Auswahl speichern; Ausrollen separat (Lovable ebenso nur kosmetisch).
- [x] Fremde Sitzungen auflisten? -> Nicht ueber Client moeglich; nur aktuelle Sitzung + Abmelden.

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Settings-Huelle mit 6 Sub-Bereichen sofort anlegen | B-27..B-31 haengen daran; ein gemeinsames Geruest spart Doppelarbeit | 2026-06-25 |
| Avatar-Upload spaeter | Storage-Bucket + Bildverarbeitung sind ein eigenes Thema; Optik bleibt erhalten | 2026-06-25 |
| Theme-Auswahl speichern, nicht anwenden | Keine dunklen Tokens vorhanden; halbfertiges Dark-Mode waere schlechter als keins | 2026-06-25 |

### Technical Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Praeferenzen in profiles statt eigener settings-Tabelle | 1:1-Beziehung zum Nutzer, kein Mehrwert durch zweite Tabelle; RLS bereits vorhanden | 2026-06-25 |
| Passwort-Wechsel mit Re-Auth (signInWithPassword) vor updateUser | Verhindert Aendern durch uebernommene Session ohne Passwortkenntnis | 2026-06-25 |
| 2FA echt via supabase.auth.mfa (enroll/challenge/verify/unenroll) | Ergaenzt den MFA-Step-up aus S-01; kein Mock | 2026-06-25 |
| Nur aktuelle Sitzung + globaler signOut | Client-SDK kann fremde Sitzungen nicht auflisten | 2026-06-25 |

---

## Tech Design (Solution Architect)

### Komponentenstruktur
```
/app/einstellungen (Layout = Einstellungen-Huelle)
+-- Titel "Einstellungen" + Untertitel
+-- Sub-Navigation (mobil: Pills horizontal, Desktop: vertikale Liste, sticky)
+-- Inhalt (Outlet)
    +-- /einstellungen          -> Profil (B-26)
    +-- /einstellungen/unternehmen, .../benachrichtigungen,
        .../plan, .../team, .../daten  -> Platzhalter (B-27..B-31)

Profil-Seite
+-- Karte "Persoenliche Daten"  (Avatar-Initialen, Vorname, Nachname, Konto-E-Mail, Rolle) -> Speichern
+-- Karte "Sicherheit"          (Passwort aendern [Dialog], 2FA [Switch + Setup-Dialog], aktuelle Sitzung, Abmelden)
+-- Karte "Sprache & Darstellung" (Sprache, Zeitzone, Theme-Auswahl, Format, Waehrung) -> Speichern
```

### Datenmodell (Klartext)
`profiles` wird erweitert um:
- avatar_url (Text, optional) - fuer spaeteren Upload
- locale (Text, Default 'de'), timezone (Text, Default 'Europe/Berlin')
- theme (Text 'hell'|'dunkel'|'system', Default 'hell')
- number_format (Text 'de'|'int', Default 'de'), currency (Text, Default 'EUR')

Sicherheit/2FA laufen ueber Supabase Auth (kein eigenes Schema). RLS: bestehende Owner-only-Policies decken die neuen Spalten ab.

### Tech-Entscheidungen (warum)
- Praeferenzen am Profil: 1:1 zum Nutzer, RLS schon da.
- 2FA echt ueber Supabase MFA: konsistent mit dem Login-Step-up.
- E-Mail-Wechsel ueber denselben Bestaetigungsweg wie S-04: keine Adressuebernahme ohne Zugriff.

### Abhaengigkeiten (Pakete)
- shadcn/ui: switch, select, dialog, sonner, avatar (UI-Primitive)
- next-themes nur falls Theme spaeter angewendet wird - hier noch nicht noetig.

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
