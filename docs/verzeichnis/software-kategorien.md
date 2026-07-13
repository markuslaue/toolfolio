# Software-Kategorien (Taxonomie-Quelle fuer das Verzeichnis)

Referenz und Verarbeitungsregeln fuer die Verzeichnis-Taxonomie. Die vollstaendige Liste (**1315 eindeutige Kategorien**) stammt aus der Zusammenfuehrung von **OMR + Capterra**, entdoppelt ueber den deutschen Rubriknamen.

> **Status der Daten:** Die vollstaendige 1315-Zeilen-Tabelle liegt als hochgeladene Quelle vor (Markdown). Sie wird beim Bau von **AD-02 (Taxonomie-Import)** als bereinigtes Datenasset committet (`docs/verzeichnis/software-kategorien.csv` bzw. ein Seed-Skript), NICHT haendisch hier dupliziert. Diese Datei haelt die Regeln fest, damit der Import deterministisch ist.

---

## 1. Felder je Zeile

| Feld | Bedeutung |
|------|-----------|
| **Rubrik** | Deutscher Anzeigename = Verzeichnisname der Collection |
| **Slug** | Massgeblich; aus der Rubrik abgeleitet, Umlaute als ae/oe/ue/ss |
| **Quelle** | `omr`, `capterra` oder `beide` (in beiden Verzeichnissen) |
| **Prio** | 1 / 2 / 3 (siehe unten) |

## 2. Prioritaeten und Verteilung

- **PRIO 1 (724):** Name enthaelt "Software". Klarste Suchintention -> Roll-out zuerst.
- **PRIO 2 (352):** klarer Tool-/System-/Plattform-/Programm-Bezug (auch in Komposita) oder Software-Akronym.
- **PRIO 3 (239):** kein klarer Software-Bezug im Namen mehr.

Summe = 1315.

## 3. Slug-Konvention (massgeblich)

- Slug ist der **Verzeichnisname** (URL-Pfad-Segment), stabil, nach Live nie aendern.
- Kleinbuchstaben, Bindestriche, Umlaute als `ae/oe/ue/ss`, `&` entfaellt, Klammern-Inhalte als Suffix (z. B. `imaging-software-datensicherung`).
- Beispiele: `3d-rendering-software`, `crm-systeme`, `ki-bild-generatoren`, `voip-software`.

## 4. Encoding-Hinweis (wichtig)

Die **Rubrik-Spalte der Quelle ist mojibake-behaftet** (UTF-8 doppelt kodiert, z. B. `Ã¼` statt `ue`, `fÃ¼r` statt `fuer`). Daraus folgt:

- **Massgeblich ist der Slug** (sauber). Anzeigenamen werden beim Import aus dem Slug bzw. einer bereinigten Rubrik regeneriert, mit **korrekten Umlauten** (ue -> ü etc.) gemaess Sprachregel (UI-Texte mit echten Umlauten).
- Mojibake niemals live anzeigen. Eine Bereinigungs-/Mapping-Tabelle (Mojibake -> korrekt) ist Teil des AD-02-Imports.

## 5. Mapping auf die Hierarchie

- Jede der 1315 Zeilen wird eine **Collection (L3)** in `dir_collection` (Slug, Name, Prio, Quelle).
- **Cluster / Hauptkategorie (L1) / Unterkategorie (L2) fehlen in der Quelle** und werden redaktionell modelliert (AD-02 + AD-01). Heuristik fuer einen Erstvorschlag moeglich (Keyword-Cluster), finale Zuordnung redaktionell.
- Bis zur Zuordnung koennen Collections "unkategorisiert" geparkt werden.

## 6. Roll-out-Reihenfolge

1. **PRIO 1** (724) zuerst, hoechste kommerzielle/Such-Relevanz.
2. **PRIO 2** (352).
3. **PRIO 3** (239), zuletzt bzw. selektiv (viele Agentur-/Service-Begriffe ohne Tool-Charakter).

## 7. Repraesentative Beispiele (Auszug, nicht vollstaendig)

| Rubrik | Slug | Quelle | Prio |
|--------|------|--------|------|
| 3D-Rendering-Software | `3d-rendering-software` | Capterra | 1 |
| Buchhaltungssoftware | `buchhaltungssoftware` | beide | 1 |
| CRM Software fuer Kleinunternehmen | `crm-software-fuer-kleinunternehmen` | Capterra | 1 |
| E-Mail Marketing Software | `e-mail-marketing-software` | beide | 1 |
| Projektmanagement Tools | `projektmanagement-tools` | beide | 2 |
| KI-Bild-Generatoren | `ki-bild-generatoren` | beide | 2 |
| ERP Systeme | `erp-systeme` | Capterra | 2 |
| SEO Tools | `seo-tools` | beide | 2 |
| Webhosting | `webhosting` | OMR | 3 |
| Passwortmanagement | `passwortmanagement` | OMR | 3 |

(Vollstaendige Liste = hochgeladene Quelle; beim AD-02-Bau als CSV/Seed committen.)

## 8. To-do beim Bau (AD-02)

- [ ] Quelle als CSV bereinigen (Slug, korrekter Anzeigename, Quelle, Prio).
- [ ] Mojibake-Mapping anwenden, echte Umlaute herstellen.
- [ ] Dubletten/Slug-Kollisionen pruefen (sollten 0 sein, Slug ist eindeutig).
- [ ] In `dir_collection` seeden (Status `entwurf`).
- [ ] Cluster/L1/L2-Geruest anlegen und Collections zuordnen (redaktionell, schrittweise).

---

## 9. Datenassets im Repo (Stand 2026-07-13)

| Datei | Inhalt | Status |
|-------|--------|--------|
| `omr-kategorien.csv` | **436 Rubriken aus dem OMR-Crawl** (slug, rubrik_quelle, typ) | **committet, vollstaendig** |
| `software-kategorien-1315.md` | Die zusammengefuehrte Liste OMR + Capterra (1315) | **FEHLT NOCH** |

**Warum die 1315 fehlen:** Sie wurden per Chat geschickt und dabei am Zeichenlimit abgeschnitten
(Abbruch mitten in PRIO 1). PRIO 2 und PRIO 3 sind nie angekommen. Ein Import aus diesem
Fragment haette rund 700 Kategorien still verschluckt. Die Liste muss als **Datei** ins Repo,
nicht ueber den Chat.

### Spalte `typ` in `omr-kategorien.csv`

Toolfolio ist ein **Software**-Verzeichnis. Nicht jede OMR-Rubrik ist Software:

- `software` (377): echte Tool-Kategorien, werden Collections.
- `dienstleister` (24): Agenturen, Beratungen, Steuerberater. **Keine Software**, gehoeren
  nicht ins Verzeichnis (man abonniert sie nicht, man trackt ihre Kosten nicht als Abo).
- `breit` (35): sehr breite Sammelbegriffe (AI, SEO, Design, Payment ...). Taugen als
  **Cluster oder Hauptkategorie (L1/L2)**, nicht als Collection (L3) mit Suchintention.

Die Klassifikation ist eine Spalte, keine stille Loeschung: sie bleibt pruefbar und
korrigierbar. Grenzfaelle bewusst als `breit` markiert (z. B. `zahlungsdienstleister`).

### Offene Entscheidung: Anzeigenamen

356 der 377 OMR-Software-Rubriken tragen **englische** Anzeigenamen (aus dem Slug abgeleitet).
Toolfolio ist deutschsprachig (Leitplanke 3). Die Anzeigenamen muessen also uebersetzt werden.
Der **Slug bleibt unveraendert** (SEO-Intent, nach Live nie aendern).
