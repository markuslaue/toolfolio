# B-34: KI-Anbieter live anschliessen

**Status:** In Progress (gebaut 2026-07-14, noch nicht gegen einen echten Admin-Key getestet)
**Bereich:** Tracker (B)
**Haengt ab von:** B-24 (Integrationen, verschluesselte Zugangsdaten), B-13 (AI-Credits)

---

## Problem

Der Verbrauch von KI-Diensten war bisher nur so genau wie die Rechnung, die einmal im
Monat kommt. Wer wissen will, ob er gerade in ein teures Monatsende laeuft, erfaehrt es
zu spaet. Der Onboarding-Wizard (B-02) bot deshalb einen Schritt "AI-Services verbinden"
an, hinter dem nichts stand.

## Loesung

OpenAI und Anthropic liefern beide einen **Kostenbericht pro Tag** ueber einen lesenden
Admin-Endpunkt. Den lesen wir und schreiben daraus **exakte Monatssummen** in `ai_spend`.

### Warum ein Admin-Key und kein normaler API-Key

Beide Anbieter geben die Kosten-Endpunkte nur fuer Admin-Keys frei. Das ist fuer uns
sogar die bessere Nachricht: ein Admin-Key kann **keine Modelle aufrufen**. Er kann also
keinen Verbrauch erzeugen. Waere er ein normaler API-Key, koennte ein Leck bei uns
teuer werden. So kann es das nicht.

Bedingungen (aus CLAUDE.md, Leitplanke 4, unveraendert):
- verschluesselt at rest (AES-256-GCM, Schluessel nur in der Server-Env)
- Ablage in `integration_secret`, einer Tabelle **ohne jede Lese-Policy** (nur Service-Role)
- nie an den Client ausgeliefert, nie geloggt
- **ausschliesslich lesende Endpunkte**
- jederzeit trennbar und rotierbar
- niemals an die KI-/Aggregat-Ebene

### Der eigentliche Gewinn: exakte Monatswerte

Das bestehende Sync-Modell (B-24) bucht **den Zuwachs seit dem letzten Abgleich in den
laufenden Monat**. Fuer DataForSEO ist das richtig, denn der kennt nur einen Gesamtstand.

Fuer OpenAI und Anthropic waere es **falsch**, und zwar nicht nur ungenau: Laeuft der
naechtliche Abgleich am 1. um 3 Uhr, faellt der Verbrauch der letzten Junitage in den
Juli. Der Juni bleibt zu niedrig, der Juli zu hoch, und niemand merkt es.

Deshalb bekommt `Verbrauch` ein optionales Feld `monate`. Liefert ein Anbieter datierte
Werte, schreiben wir sie **exakt** und ueberschreiben unseren Stand: der Anbieter ist die
Wahrheit ueber seine eigenen Kosten, nicht unsere letzte Rechnung.

## Akzeptanzkriterien

- [x] Angenommen ein Nutzer hat einen OpenAI-Admin-Key, wenn er ihn in den Integrationen
      hinterlegt, dann werden die Kosten der letzten zwoelf Monate sofort uebernommen und
      erscheinen in den AI-Credits.
- [x] Angenommen der Nutzer gibt einen normalen API-Key statt eines Admin-Keys ein, wenn
      er verbindet, dann erscheint eine Meldung, die genau das sagt, statt eines
      technischen Fehlers.
- [x] Angenommen ein Anbieter liefert datierte Tageswerte, wenn der Abgleich laeuft, dann
      werden exakte Monatssummen geschrieben, nicht ein Zuwachs in den laufenden Monat.
- [x] Angenommen der Anbieter meldet fuer zwoelf Monate keine Kosten, wenn der Nutzer
      verbindet, dann sagt die Oberflaeche genau das, statt eine leere Kurve zu zeigen.
- [ ] **Offen:** gegen einen echten Admin-Key getestet. Ohne Key nicht pruefbar.

## Bewusst nicht im Umfang

- **Google Gemini, Perplexity, xAI.** Gemini braucht Cloud Billing, das ist ein eigener
  Anschluss. Die anderen bieten keinen brauchbaren Kosten-Endpunkt. Sie stehen im
  Onboarding als "in Vorbereitung", nicht als Knopf, der nichts tut.
- **Verbrauch pro Modell oder pro Projekt.** Die APIs koennen es, aber der Tracker
  fuehrt Kosten pro Dienst, nicht pro Modell. Spaeter, wenn es jemand braucht.
- **Restguthaben.** Beide rechnen nachtraeglich ab, es gibt keins. `guthaben` bleibt null,
  und die Oberflaeche zeigt es nicht an, statt eine Null zu erfinden.

## Entscheidungen

| Entscheidung | Begruendung | Datum |
| --- | --- | --- |
| Admin-Key statt normalem API-Key | Nur der darf die Kosten lesen, und er kann keine Modelle aufrufen: ein Leck erzeugt keinen Verbrauch | 2026-07-14 |
| Exakte Monatswerte statt Zuwachs | Der Zuwachs faellt am Monatsersten in den falschen Monat. Wer datierte Werte liefert, bekommt exakte Zahlen | 2026-07-14 |
| Kosten beim Verbinden sofort schreiben | Sonst sieht der Nutzer bis zum naechsten naechtlichen Abgleich eine leere Kurve und haelt die Verbindung fuer kaputt | 2026-07-14 |
| Fenster: zwoelf Monate | Genau das Fenster, das der Tracker anzeigt. Mehr zu holen waere Datensammeln ohne Zweck | 2026-07-14 |

## Offene Punkte

- [ ] Gegen einen echten OpenAI-Admin-Key testen (Markus).
- [ ] Gegen einen echten Anthropic-Admin-Key testen (Markus).
- [ ] Der Umrechnungskurs USD/EUR wird beim Verbinden **manuell** eingegeben und liegt
      danach fest. Ein automatischer Kurs waere ehrlicher, braucht aber eine Kursquelle.
      Bis dahin steht in der Oberflaeche, dass der Kurs vom Nutzer stammt.
