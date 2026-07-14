# A-07: Affiliate- und Partnerprogramme

## Status: Roadmap
**Bereich:** A · **Created:** 2026-07-14 · **Prio:** P2 · **Abhaengig von:** AD-01 (Discovery)

## Zusammenfassung
Beim Erfassen eines Produkts prueft der Discovery-Agent zusaetzlich: Gibt es ein Affiliate-,
Partner- oder Empfehlungsprogramm? Wo ist die Kontaktadresse dafuer? Toolfolio tritt in
Kontakt und handelt eine Provision aus.

## Der eigentliche Clou (Markus, 2026-07-14)
Statt die Provision voll einzustreichen, wird sie **geteilt**: Bei 10 % Lifetime-Provision
laesst Toolfolio den Anbieter einen **5-Prozent-Gutschein fuer den Kunden** erstellen und
behaelt 5 %. Der Kunde zahlt weniger, Toolfolio verdient trotzdem, der Anbieter bekommt einen
Kunden. Das ist der einzige Weg, auf dem Provision und "user-centric" keinen Widerspruch bilden.

## Nicht verhandelbar
- **Provision beeinflusst den organischen Rang NICHT.** Goldene Regel, Leitplanke 1.
  Sortierung bleibt serverseitig unabhaengig.
- **Kennzeichnungspflicht.** Provisionslinks muessen als solche erkennbar sein (UWG).
  "Toolfolio erhaelt fuer diesen Deal eine Provision" gehoert sichtbar an den Deal, nicht ins
  Impressum.

## Zu bauen
- Discovery erweitern: Affiliate-Programm erkennen, Kontaktadresse extrahieren
- `dir_produkt`: Felder fuer Programm, Kontakt, Status der Verhandlung, Konditionen
- Gutschein-Verwaltung (Code, Rabatt, Gueltigkeit, Einloesungen)
- Attribution: welcher Klick fuehrte zu welchem Abschluss
