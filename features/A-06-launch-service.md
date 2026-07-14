# A-06: Launch-Service

## Status: Fundament gebaut (Speicherung + Einwilligung), Versand offen
**Bereich:** A (Anbieter-Portal) · **Created:** 2026-07-14 · **Prio:** P2 · **Abhaengig von:** V-04, A-01

## Zusammenfassung
Ein Anbieter, der eine neue Software lanciert, bucht bei Toolfolio den Launch-Service:
Toolfolio schreibt alle Menschen an, die eingewilligt haben, ueber Angebote in GENAU dieser
Kategorie informiert zu werden. Der Anbieter sieht den Verteiler nie, Toolfolio versendet.

## Warum das eine Leitplanke geaendert hat
`CLAUDE.md` Leitplanke 2 verbot bisher jeden Lead-Posteingang. Dieses Feature braucht ihn.
Bewusst geaendert am 2026-07-14 durch Markus, mit zwei strikt getrennten Rechtsgrundlagen.

## Rechtsgrundlagen (nie vermischen)
| | Anfrage weiterleiten | Launch-Service |
|---|---|---|
| Grundlage | Art. 6 I b (Vertragsanbahnung) | Art. 6 I a (Einwilligung) + § 7 UWG |
| Checkbox | keine, nur Hinweis | eigene, LEER, FREIWILLIG |
| ohne Haekchen | Anfrage geht trotzdem raus | kein Kontakt, nie |
| Nachweis | die Anfrage selbst | Double-Opt-in, Wortlaut + Zeitpunkt protokolliert |

**Verboten, weil es die Einwilligung rueckwirkend unwirksam macht:**
- an die Datenschutzerklaerung koppeln
- zur Bedingung fuer die Anfrage machen (Art. 7 IV DSGVO)
- vorankreuzen (EuGH *Planet49*)
- unbestimmt formulieren ("Werbung allgemein"). Es MUSS die Kategorie nennen.

## Acceptance Criteria
- [x] Angenommen jemand fuellt eine Anfrage aus, wenn er das Haekchen NICHT setzt, dann wird
      die Anfrage trotzdem gespeichert und zugestellt.
- [x] Angenommen jemand setzt das Haekchen, wenn er absendet, dann wird die Einwilligung mit
      Wortlaut, Version, Zeitpunkt, Quelle und gehashter IP protokolliert.
- [ ] Angenommen eine Einwilligung ist nicht per Double-Opt-in bestaetigt, wenn ein Launch
      versendet wird, dann wird diese Adresse NICHT angeschrieben.
- [ ] Angenommen jemand widerruft, wenn danach ein Launch laeuft, dann wird er nicht angeschrieben.
- [ ] Angenommen ein Anbieter bucht einen Launch, wenn er das Ergebnis sieht, dann sieht er
      Zahlen (zugestellt, geoeffnet, geklickt), aber NIEMALS eine Adresse.

## Gebaut (2026-07-14)
- `dir_anfrage`: Anfragen. RLS: anon darf INSERT, aber es gibt KEINE Lesepolicy fuer anon.
  Nur Redaktion liest.
- `launch_einwilligung`: der Nachweis. Wortlaut versioniert, Double-Opt-in-Token, Widerruf.
- View `launch_verteiler`: die EINZIGE zulaessige Quelle fuer einen Versand (bestaetigt und
  nicht widerrufen). Wer daran vorbei aus `dir_anfrage` versendet, verschickt unerlaubte Werbung.
- `src/lib/einwilligung.ts`: der versionierte Wortlaut.
- Datenschutzerklaerung: Abschnitte 5 und 6 neu.

## Offen
- Anfrageformular (Markus liefert die Anforderungen nach)
- Zustellung der Anfrage an den Anbieter (E-Mail/Webhook)
- Double-Opt-in-Mail und Bestaetigungsseite
- Widerrufs-Link und -Seite
- Buchung und Versand des Launches im Anbieter-Portal
- Vor Livegang anwaltlich pruefen lassen
