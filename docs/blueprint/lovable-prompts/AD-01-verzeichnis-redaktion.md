# Toolfolio Lovable-Prompt: AD-01 Verzeichnis-Redaktion (Admin-CMS), v2

> Kanonischer Design-/Build-Vertrag fuer das Verzeichnis-CMS. Optik-/Funktions-Referenz fuer die AD-Specs. Bau spaeter mit der Verzeichnis-Phase. Technische Umsetzung nach `docs/verzeichnis/ARCHITECTURE-verzeichnis-cms.md` (echtes Supabase-Backend + RLS), nicht als Mock.

Masterprompt fuer Lovable. Gebaut wird die interne Redaktions- und Content-Management-Oberflaeche, mit der ausschliesslich der Admin (Hauptnutzer von Toolfolio) das oeffentliche Verzeichnis pflegt. Prototyp mit Mock-Daten, ohne echtes Backend, ohne echtes Auth, ohne localStorage oder sessionStorage.

Aenderungen gegenueber v1: Die KI-Analyse ist auf rein faktische, paraphrasierte Felder geschaerft. Screenshots und Team kommen nicht mehr aus der KI, sondern ausschliesslich vom Anbieter ueber den Claim. Drittanbieter-Bewertungen aus dem Netz sind komplett entfallen. Bewertungen stammen ausschliesslich aus verifizierten Eigenbewertungen. Neu sind ein Claim-and-Upload-Bezug und ein schlanker Outreach-Flow im Admin.

## 1. Kontext und Abgrenzung
Zwei getrennte Welten: Tracker (transaktional, sensibel, NICHT beruehrt) und Verzeichnis (oeffentlich, redaktionell). Dieses Modul ist das Redaktions-Backend des informationellen Bereichs, schreibt/liest ausschliesslich Verzeichnis-Entitaeten (Cluster, Kategorien, Collections, Software-Produkte, Content-Pieces, Claim-/Outreach-Status). Kein Zugriff auf transaktionale Daten. Trennung in der Architektur sauber halten.

## 2. Nomenklatur der Hierarchie
Verzeichnis (Wurzel) -> Cluster (Oberkategorie) -> Hauptkategorie (L1) -> Unterkategorie (L2) -> Collection (L3, Ranking-Knoten, traegt Prio-Tag + Produkte). Cluster/L1/L2 tragen je ein nachgelagertes Content-Piece. Schwerpunkt: Collection.

## 3. Rollen und Zugriff
Nur Rolle `admin`. Prototyp: gemocktes `currentUser.role === "admin"`. Ohne admin: "Kein Zugriff"-Karte. Real spaeter: Supabase-Rollen + RLS, serverseitig erzwungen.

## 4. Designsystem (verbindlich)
Farben: Hintergrund Creme #FBF7F1, Text #1F1D2B, Sekundaer #6B7280, Primary Violett #6C5CE7, Akzent Koralle #FF7A66, Positiv/verifiziert Emerald #12B76A, Warnung Amber #F5A623, Risiko Rot #F0533D. Cluster-Badges: Design Magenta #E84393, Kommunikation Blau #3B82F6, Entwicklung Tuerkis #0FB5BA, eCommerce Orange #FB923C. Typo: Bricolage Grotesque (Headlines/Zahlen), Plus Jakarta Sans (Body), tabular-nums, Geld `1.249,00 EUR`. Deutsch, Du-Form, korrekte Umlaute, keine Gedankenstriche.

## 5. Technischer Rahmen (Prototyp)
React, TS, Tailwind, shadcn/ui, lucide-react, Recharts bei Bedarf. Vollstaendig Mock, kein API/Auth/Storage. KI-Funktionen als gemockte async Jobs. Real spaeter: Anthropic-Key serverseitig/verschluesselt, Backend-Worker.

## 6. Drei Datenherkuenfte der Produkt-Detailseite (zentrales Modell)
- **A, KI-recherchiert + redaktionell freigegeben** (faktisch, paraphrasiert): Kurz-/Langbeschreibung, Features, Einsatzgebiet/Plattformen/Kategorisierung, Preis-Hinweis, Pro/Contra. KI darf vorbefuellen, erst nach Freigabe live. Badge `KI-recherchiert` -> `redaktionell geprueft`.
- **B, nur Anbieter (Claim):** Screenshots, Team, Logo, Produktvideos/Medien. KI befuellt NIE. Platzhalter `vom Anbieter ergaenzbar` bis Claim. Befuellung im Anbieter-Modul.
- **C, nur verifizierte Eigen-Nutzer:** Bewertungen/Sterne ausschliesslich von verifizierten Nutzern, die das Tool einsetzen. Keine Drittanbieter-/gecrawlten Bewertungen. Badge `verifizierte Bewertung`.
- **Sorgfaltsregel Preis/Fakten (UWG):** veraenderliche Fakten mit sichtbarem Stand (Datum) + Quelle + Link auf Anbieterseite. Pflicht.

## 7. Aufbau des Moduls
Linke Navigation + Inhalt. Hauptansichten: (1) Struktur-Baum, (2) Editor Cluster/L1/L2, (3) Collection-Editor (Kern), (4) Produkt-Datenbank, (5) Claim & Outreach.

### 7.1 Struktur-Baum
Aufklappbar ueber vier Ebenen. Je Knoten: Name, Slug-Label (monospace), Statusbadges (Veroeffentlicht/Entwurf/Kein Content; bei Collections Prio-Tag + Produktanzahl). Aktionen: Bearbeiten, Neue Unterebene, Loeschen (Bestaetigung). Sortierung per Drag-and-drop bzw. Hoch/Runter. Such-/Filterleiste (Freitext, Status, Prio). Button: Neuen Cluster anlegen. Kennzahlenleiste: Anzahl je Ebene + Anteil Collections mit veroeffentlichtem Content (Fortschrittsbalken).

### 7.2 Editor Cluster/L1/L2
Name (Pflicht), Slug (vorbefuellt, editierbar, ae/oe/ue/ss), Meta-Title, Meta-Description, Content-Piece (Markdown, nachgelagert). Bei Cluster: Farbe. Status Entwurf/Veroeffentlicht. Breadcrumb. Buttons: Speichern, Vorschau, Zurueck.

### 7.3 Collection-Editor (Kern)
Breadcrumb. Abschnitte:
- **a) Stammdaten/SEO-Meta:** Title (Zaehler 50-60), Description (140-160), H1, Slug, Prio-Tag, Status, Fokus-Keyword + Neben-Keywords (Chips), Google-Snippet-Vorschau.
- **b) Produkt-Kuratierung:** Tabelle (Logo, Name, Status, Zone, Position). Zone je Produkt: Gesponsert (gekennzeichnet) / Organisch / Community. Hinweis (goldene Regel): nur gesponserte Sichtbarkeit kaeuflich + gekennzeichnet; organische Reihenfolge/Bewertungen/verifizierte Daten nie. Produkte verknuepfen via Suche + "Neues Produkt". Sortieren/Entfernen per DnD innerhalb der Zone (Entfernen loescht nur Verknuepfung).
- **c) KI-Anbieter-Recherche (gemockt):** Keyword/Region(DACH)/Sprache -> "Markt recherchieren". Job-Status. Ergebnis: Produktname, Anbieter, URL, Kurzbeschreibung, Quelle, Confidence. Auswahl -> uebernehmen -> Produkt-DB + Collection Zone Organisch, Status `KI-recherchiert, ungeprueft`. Nichts ungeprueft live.
- **d) KI-Produktanalyse (gemockt, faktenbeschraenkt):** je Produktzeile + Sammelaktion. Erzeugt NUR Herkunft-A-Felder (Kurz-/Langbeschreibung paraphrasiert, Feature-Liste, Plattformen/Einsatz/Kategorisierung, Preis-Hinweis mit Stand/Quelle/Link, Pro/Contra). Ausdruecklich AUSGENOMMEN: Screenshots, Team, Logo, Medien (Hinweisblock `vom Anbieter per Claim`). Review + Diff (bestehend vs. Vorschlag), nie ueberschreiben. Status `ki_ungeprueft` -> `redaktionell geprueft`.
- **e) SEO-Content-Editor:** Briefing (Fokus-Keyword, Intention[informational], Ziel-Wortzahl, Pflichtbegriffe/Entitaeten als Chips, Gliederung H2/H3). "Entwurf erzeugen" -> gemockter Markdown-Entwurf (Einleitung, Abschnitte, Vergleichslogik, FAQ). Markdown/Rich-Editor + Live-Vorschau. Content-Score (gemockt): Keyword-Abdeckung, Lesbarkeit, Wortzahl, Pflichtbegriffe. Nur nach Freigabe live. Buttons: Entwurf speichern, Zur Freigabe, Veroeffentlichen.
- **f) Vorschau:** oeffentliche Collection-Seite (drei Zonen, SEO-Content), read-only. Bewertungen nur bei verifizierten Eigenbewertungen.

### 7.4 Produkt-Datenbank (Stammdaten)
Tabelle (Suche/Filter): Name, Anbieter, Status, Claim-Status, Anzahl Collections, letzte Aenderung. Detail-Editor nach drei Herkuenften: A (faktisch, editierbar), B (Anbieter, read-only mit Platzhalter), C (verifizierte Nutzer, read-only, Badge). Statusfeld + Claim-Status. Mehrfachzuordnung zu Collections einsehbar.

### 7.5 Claim und Outreach
Beanspruchen kostenlos, nur Premium-Positionierung kostenpflichtig. Claim-Status je Produkt: Unclaimed (grau), Eingeladen (Amber), Claim angefragt (Blau), Claimed (Emerald). Outreach (schlanker Admin-CRM): Liste unclaimed Produkte mit Kontaktstatus, Felder fuer Anbieter-Kontakt (Name/Rolle/E-Mail/Quelle, manuell). "Einladung vorbereiten" -> personalisierter Einladungstext aus Vorlage (Platzhalter Produkt/Collection/Vorschau-Link), nur Erzeugung + kopierbar (Versand spaeter ueber Transaktionsmail, mit Einwilligung/B2B-Rahmen). Statuswechsel manuell + Verlauf (Zeitleiste). Kennzahlen: unclaimed/eingeladen/angefragt/claimed + Claim-Quote (Fortschritt). Claim-Verifizierung (Domain/E-Mail/DNS) nicht Teil des Prototyps.

## 8. KI-Workflows als Jobs
Recherche, faktenbeschraenkte Produktanalyse, SEO-Content: gleiches Muster (Trigger -> queued/laeuft/fertig/fehlgeschlagen -> Ergebnis als ueberpruefbarer Vorschlag, nie automatisch live). Prototyp gemockt; real serverseitig, Key verschluesselt.

## 9. Mock-Daten
Cluster `Design & Kreativ` (Magenta) -> `Grafik & Design` -> `3D` -> Collections `3D Rendering Software` (PRIO 1, befuellt), `3D-CAD-Software` (PRIO 1, Entwurf), `3D Architektur Software` (PRIO 1, kein Content). Zweiter Cluster `Marketing & Vertrieb` (Blau). Fuer `3D Rendering Software`: 6-8 Mock-Produkte mit gemischten Stati/Claim-Stati (mind. 1 Claimed mit Herkunft-B-Feldern, mind. 1 Unclaimed mit Platzhaltern), mind. 1 Produkt mit verifizierten Eigenbewertungen und eines ohne. Hinterlegte Mock-Antworten fuer KI-Jobs.

## 10. Akzeptanzkriterien
1. Admin-only Shell mit Rollen-Gate. 2. Struktur-Baum 4 Ebenen (Status, Prio, Suche, Filter, CRUD). 3. Schlanke Cluster/L1/L2-Editoren mit Slug-Vorbefuellung. 4. Collection-Editor (Stammdaten/SEO-Meta, Kuratierung mit 3 Zonen + goldene Regel sichtbar, KI-Recherche, faktenbeschraenkte Analyse ohne Screenshots/Team, SEO-Content, Vorschau). 5. Produkt-DB mit Herkuenften A/B/C + Badges + Preis-Stand/Quelle/Link. 6. Claim/Outreach (Status, Kontaktpflege, Einladungsgenerator, Verlauf, Kennzahlen). 7. KI-Funktionen als Jobs mit Review-vor-Uebernahme. 8. Designsystem, Deutsch, Du-Form, Umlaute, keine Gedankenstriche.

## 11. Leitplanken
Datentrennung (nur Verzeichnis-Entitaeten); drei Herkuenfte A/B/C (jedes Feld zeigt Herkunft); keine fremden Inhalte; goldene Regel (nur gesponserte Sichtbarkeit kaeuflich + gekennzeichnet); KI-Output ist Entwurf (Diff statt Ueberschreiben, nichts ungeprueft live); Preis-Sorgfalt UWG (Stand/Quelle/Link); keine Secrets im Client; im Prototyp kein localStorage/sessionStorage/echtes Auth.

## 12. Bewusst NICHT Teil (spaeter)
Echte Anthropic-/Web-Recherche; echte DB/Auth/RLS via Supabase; Anbieter-Upload fuer Herkunft B (eigenes Modul); echte Claim-Verifizierung; realer Outreach-Versand; Content-Pieces-Inhalte auf Cluster/L1/L2.

## Rechtlicher Hinweis
Rechtliche Einordnungen sind Risikoorientierung, keine Rechtsberatung. Vor Live-Gang anwaltlich pruefen.
