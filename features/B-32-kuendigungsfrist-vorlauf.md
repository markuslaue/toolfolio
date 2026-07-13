# B-32: Kündigungsfrist als Vorlauf (statt Stichtag) mit früher Erinnerung

## Status: Approved & Deployed
**Created:** 2026-06-30 · **Projekt:** PRJ (Tracker) · **Bereich:** B · **Prio:** P1

## Dependencies
- Requires: B-05 (Abo anlegen/bearbeiten), B-12 (Fristen-Wächter), E-02 (Frist-Mail-Cron, live).

## Problem (aus dem operativen Betrieb)
Bei wiederkehrenden Abos ist ein **Stichtag** („letzter Kündigungstermin") die falsche Eingabe: Verträge verlängern sich zyklisch, der Stichtag verschiebt sich also jede Periode. Sinnvoll ist die **Kündigungsfrist als Vorlauf** (z. B. 1, 3 oder 6 Monate vor Verlängerung).

**Kernbefund:** Die Felder `frist_wert` + `frist_einheit` existieren bereits in DB, Zod-Schema und Formular, werden aber von `deriveFristen()` **nie ausgewertet**. Eine Kündigungs-Frist entsteht heute ausschliesslich aus `letzter_kuendigungstermin`. Wer die Frist als Vorlauf pflegt, bekommt **keine Erinnerung** — das Feld ist faktisch wirkungslos.

## User Stories
- Als Nutzer möchte ich bei einem Abo nur die **Kündigungsfrist** (z. B. „3 Monate") pflegen, damit ich keinen Stichtag pro Periode nachtragen muss.
- Als Nutzer möchte ich sehen, **bis wann ich konkret kündigen muss** und **wann sich das Abo verlängert**, direkt im Formular.
- Als Nutzer möchte ich **rechtzeitig vor der Kündigungsfrist** eine E-Mail bekommen („verlängert sich am X, kündbar bis Y, brauchst du das noch?"), damit ich handeln kann, bevor die Frist verstreicht.
- Als Nutzer möchte ich ausnahmsweise einen **abweichenden Stichtag** setzen können, wenn der Vertrag das so vorsieht.
- Als Nutzer möchte ich, dass die Frist sich **automatisch für die nächste Periode** neu berechnet, ohne dass ich etwas tue.

## Fachliche Regel
- **Verlängerungstermin** = `naechste_abbuchung` (bei auto-verlängernden Abos der Beginn der nächsten Periode).
- **Kündigungsdeadline** = Verlängerungstermin **minus** Kündigungsfrist (`frist_wert` × `frist_einheit`).
- **Vorrang:** Ist `letzter_kuendigungstermin` explizit gesetzt, gilt dieser (manueller Override).
- **Erinnerung:** Der bestehende Frist-Cron (E-02) meldet Fristen `benachrichtigung_vorlauf` Tage im Voraus (Default 14). Beispiel: Frist 30 Tage + Vorlauf 14 → erste Mail **44 Tage vor der Verlängerung**, also deutlich vor Fristablauf.

## Acceptance Criteria
- [ ] Angenommen ein Abo hat Kündigungsfrist „3 Monate" und nächste Abbuchung am 01.10.2026, wenn der Fristen-Wächter berechnet wird, dann erscheint eine Kündigungs-Frist zum 01.07.2026.
- [ ] Angenommen ein Abo hat eine Kündigungsfrist, aber keine nächste Abbuchung, wenn der Fristen-Wächter berechnet wird, dann entsteht keine Kündigungs-Frist (keine Scheingenauigkeit).
- [ ] Angenommen ein Abo hat sowohl eine Kündigungsfrist als auch einen expliziten letzten Kündigungstermin, wenn die Frist berechnet wird, dann gewinnt der explizite Stichtag.
- [ ] Angenommen ein Nutzer trägt im Abo-Formular eine Kündigungsfrist ein, wenn nächste Abbuchung gesetzt ist, dann wird ihm sofort „Kündigen bis <Datum>" und „Verlängert sich am <Datum>" angezeigt.
- [ ] Angenommen die Kündigungsdeadline liegt innerhalb der Vorlaufzeit, wenn der Frist-Cron läuft, dann erhält der Nutzer eine E-Mail, die Verlängerungstermin, Kündigungsdeadline und Kosten nennt.
- [ ] Angenommen ein Abo ist gekündigt oder archiviert, wenn die Fristen berechnet werden, dann entsteht keine Kündigungs-Frist.
- [ ] Angenommen die Kündigungsdeadline liegt bereits in der Vergangenheit (Frist verpasst), wenn der Fristen-Wächter berechnet wird, dann wird sie als überfällig ausgewiesen.

## Edge Cases
- Frist grösser als der Abrechnungszyklus (z. B. 6 Monate Frist bei monatlicher Zahlung) → Deadline liegt in der Vergangenheit; als überfällig/„Frist bereits abgelaufen" ausweisen, nicht verstecken.
- `frist_wert = 0` → Deadline = Verlängerungstermin (Kündigung bis zuletzt möglich).
- Keine `auto_verlaengerung` → Deadline trotzdem berechnen (der Nutzer will den Termin wissen), Konsequenztext aber ohne „verlängert sich automatisch".
- Monats-Arithmetik am Monatsende (31.03. minus 1 Monat) → auf den letzten gültigen Tag des Zielmonats klemmen.
- Abo ohne Frist und ohne Stichtag → wie bisher keine Kündigungs-Frist.

## Out of Scope (bewusst später)
- Eigene, separate „Vorwarn"-Stufe zusätzlich zum bestehenden `benachrichtigung_vorlauf` (E-02 deckt das ab).
- Automatisches Kündigen / Kündigungsschreiben-Generator.
- Vertragslaufzeit-Modell mit Mindestlaufzeit und Verlängerungsdauer als eigene Felder (heute reicht `naechste_abbuchung` als Verlängerungstermin).
- Per-Abo abweichende Vorlaufzeit (globale Einstellung B-28 genügt).

## Product Decisions
| Entscheidung | Begründung | Datum |
|---|---|---|
| Verlängerungstermin = `naechste_abbuchung` | Kein neues Feld nötig; bei auto-verlängernden Abos ist die nächste Abbuchung genau der Periodenbeginn | 2026-06-30 |
| Expliziter Stichtag schlägt berechnete Frist | Sonderverträge müssen abbildbar bleiben | 2026-06-30 |
| Keine Frist ohne Verlängerungstermin | Ehrlichkeit der Daten: lieber keine Frist als eine erfundene | 2026-06-30 |
| Erinnerung über bestehenden Vorlauf (E-02) | Nutzer stellt den Vorlauf zentral ein; Frist 30 T + Vorlauf 14 T = Mail 44 T vor Verlängerung | 2026-06-30 |

## Open Questions
- [ ] Soll bei sehr langen Fristen (6/12 Monate) zusätzlich eine zweite, spätere Erinnerung kurz vor Fristablauf sinnvoll sein? (Erst nach Praxisfeedback entscheiden.)

---

## Tech Design
```
src/lib/fristen.ts
+-- minusFrist(iso, wert, einheit)      Frist abziehen, Monatsende geklemmt
+-- kuendigungsDeadline(abo)            Stichtag ODER naechste_abbuchung - Frist, sonst null
+-- deriveFristen()                     nutzt jetzt kuendigungsDeadline statt nur den Stichtag

src/components/app/abo-form-panel.tsx
+-- Kuendigungsfrist mit Schnellauswahl (14 Tage / 1 / 3 / 6 Monate)
+-- Live-Vorschau: "Kuendigen bis TT.MM.JJJJ" + "Verlaengert sich am TT.MM.JJJJ"
+-- Stichtag als "Abweichender Stichtag (optional)" mit Vorrang-Hinweis

src/app/api/cron/fristen/route.ts (E-02)
+-- WICHTIG: filterte bisher per SQL auf letzter_kuendigungstermin und haette die
    berechneten Deadlines NIE gemeldet. Laedt jetzt alle lebenden Abos und leitet
    die Deadline via kuendigungsDeadline() ab. Konsequenztext nennt den
    Verlaengerungstermin ("Verlaengert sich am X automatisch. Brauchst du es noch?").
```
Kein Schema-Change noetig: `frist_wert`, `frist_einheit`, `naechste_abbuchung`, `letzter_kuendigungstermin` existieren bereits.

**Erinnerungs-Zeitpunkt:** Der Frist-Cron meldet Fristen `benachrichtigung_vorlauf` Tage im Voraus (Default 14, einstellbar 3/7/14/30 in B-28). Beispiel Frist 30 Tage: Deadline = Verlaengerung - 30 T, Mail = Deadline - 14 T -> **44 Tage vor der Verlaengerung**.

## QA Test Results (2026-06-30)
- 10 neue Vitest-Faelle (`src/lib/fristen.test.ts`): Monats-/Wochen-/Tages-Abzug, Monatsende-Klemmung (31.03. - 1 Monat -> 28.02.), Deadline aus Frist + Verlaengerung, keine Deadline ohne Verlaengerungstermin, Stichtag-Vorrang, Frist 0, deriveFristen erzeugt Kuendigungs-Frist mit Verlaengerungstermin im Text, keine Frist fuer gekuendigt/archiviert.
- Gesamt **49 Tests gruen**, tsc 0 Fehler, ESLint sauber, `next build` gruen.
- **Kritischer Bug im Zuge des Features gefunden und behoben:** der Frist-Mail-Cron ignorierte die Frist-Felder komplett (SQL-Filter nur auf Stichtag). Ohne diesen Fix waere das Feature in der Mail wirkungslos geblieben.
- **APPROVED** - keine Critical/High offen.

## Deployment
Via rsync + docker compose Rebuild auf VPS B. Kein Migrationsbedarf.
