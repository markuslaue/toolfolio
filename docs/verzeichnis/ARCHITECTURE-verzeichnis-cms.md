# Architektur: Verzeichnis + Redaktions-CMS (AD)

Status: **Planung** (Bau erfolgt mit der Verzeichnis-Phase, nicht jetzt). Diese Datei ist die technische Grundlage fuer die AD-Specs (`features/AD-*`) und die oeffentlichen V-Features (`features/V-*`).

Quellen: Master-Prompt `docs/blueprint/lovable-prompts/AD-01-verzeichnis-redaktion.md`, Taxonomie `docs/verzeichnis/software-kategorien.md`.

---

## 1. Leitidee und Abgrenzung

Toolfolio hat zwei strikt getrennte Welten:

- **Tracker (transaktional, B-IDs):** Abos, Fristen, KI-Kosten, Belege, Agentur-Layer. Personenbezogen, sensibel. **Wird vom Verzeichnis NICHT beruehrt.**
- **Verzeichnis (informationell, V-IDs oeffentlich + AD-IDs Redaktion):** rein redaktionell, oeffentlich, SEO-getrieben. Ziel: Entitaet, thematische Relevanz, organischer Traffic.

**Datentrennung (kritische Leitplanke):** Verzeichnis-Entitaeten liegen in eigenen Tabellen, ohne FK auf transaktionale Tabellen. Der einzige erlaubte Beruehrungspunkt ist die **anonyme Aggregat-Ebene** (verifizierte Preise/Benchmark aus dem Tracker, hohe Mindestschwelle, eigenes Feature F-G2/B-16). Kein Verzeichnis-Code liest abos/kunden/dokumente etc.

```
Tracker (B)            Aggregat-Ebene (anonym)        Verzeichnis (V/AD)
abos, kunden,    --->  verifizierte Preise,    --->   produkte, collections,
dokumente, ...         Benchmark (Schwelle)           reviews, claims, ...
  (personenbezogen)      (nur Aggregate)                (oeffentlich/redaktionell)
```

---

## 2. Hierarchie und Nomenklatur

Fuenf Ebenen (Beispielpfad):

1. **Verzeichnis** (Wurzel) `toolfolio.de/verzeichnis`
2. **Cluster** (Oberkategorie, reine Strukturierung) `Design & Kreativ`
3. **Hauptkategorie (L1)** `Grafik & Design`
4. **Unterkategorie (L2)** `3D`
5. **Collection (L3, der Ranking-Knoten)** `3D Rendering Software` -> enthaelt die Produkte

- Die **Collection** ist die rankende Seite, traegt einen **Prio-Tag (PRIO 1/2/3)** und die Produktzuordnung in drei Zonen.
- Cluster, L1 und L2 tragen je ein **nachgelagertes Content-Piece** (Hub-Text), inhaltlich spaeter.
- Arbeitsschwerpunkt: die Collection.

**Wichtig (Taxonomie-Luecke):** Die gelieferten 1315 Kategorien sind die **Collections** (L3) mit Prio-Tag. Die Ebenen Cluster/L1/L2 sind in der Quelle NICHT enthalten und muessen **redaktionell modelliert** werden (Zuordnung jeder Collection zu einem L2/L1/Cluster). Das ist Teil von AD-02 (Import + Strukturierung).

---

## 3. Datenmodell (Entitaeten)

Alle Tabellen im Schema `public`, Praefix `dir_` zur klaren Trennung vom Tracker. **RLS auf jeder Tabelle.** Lesen oeffentlich (anon) nur fuer veroeffentlichte Inhalte; Schreiben nur `admin` (bzw. Anbieter fuer Herkunft B nach Claim).

### 3.1 Struktur
- **dir_cluster** (id, name, slug, farbe, meta_title, meta_description, content_md, status[entwurf|veroeffentlicht], position, created_at)
- **dir_kategorie** (id, parent_id -> dir_kategorie|null, ebene[1|2], cluster_id, name, slug, meta_title, meta_description, content_md, status, position) — selbstreferenziell fuer L1/L2.
- **dir_collection** (id, kategorie_id -> dir_kategorie(L2), name, slug, h1, meta_title, meta_description, prio[1|2|3], fokus_keyword, neben_keywords[], content_md, content_score jsonb, status, position, quelle[omr|capterra|beide], created_at)

### 3.2 Produkte und Zuordnung
- **dir_produkt** (id, name, slug, anbieter, website_url, logo_url, kurzbeschreibung, langbeschreibung, features[], plattformen[], einsatzgebiet, pro[], contra[], preis_hinweis, preis_stand[date], preis_quelle_url, status[entwurf|ki_ungeprueft|redaktionell_geprueft], claim_status[unclaimed|eingeladen|claim_angefragt|claimed], herkunft jsonb (pro Feld: ki|redaktion|anbieter), created_at, updated_at)
- **dir_collection_produkt** (collection_id, produkt_id, zone[gesponsert|organisch|community], position, gesponsert_bis[date|null], unique(collection_id, produkt_id)) — n:m, ein Produkt in mehreren Collections.

### 3.3 Herkunft B (Anbieter, nach Claim)
- **dir_produkt_medien** (id, produkt_id, typ[screenshot|video|logo|sonstiges], url, alt, position) — nur durch Anbieter befuellbar (A-02), Admin read-only.
- **dir_produkt_team** (id, produkt_id, name, rolle, foto_url) — nur Anbieter.

### 3.4 Herkunft C (Bewertungen, zweistufig)
Entscheidung 2026-06-26: **zwei Stufen**, im Frontend klar getrennt dargestellt.
- **dir_review** (id, produkt_id, user_id[nullable], sterne[1..5], text, verifiziert[bool], verifiziert_methode[tracker|null], status[neu|freigegeben|abgelehnt], autor_name, autor_email[nullable, nur intern fuer Anti-Abuse], created_at).
- **Verifiziert** (`verifiziert = true`): Bewerter ist eingeloggter Toolfolio-Nutzer **und** das Tool taucht in seinen (anonymisierten) Tracker-Daten auf. Pruefung serverseitig, nur Ja/Nein, keine personenbezogenen Tracker-Daten ins Verzeichnis (Datentrennung gewahrt). Badge `verifizierte Bewertung`.
- **Nicht verifiziert** (`verifiziert = false`): offene Bewertung, **auch ohne Toolfolio-Account**, kein Nutzungsnachweis. Badge `nicht verifiziert`.
- **First-Party-Pflicht:** Bewertungen werden ausschliesslich direkt auf Toolfolio abgegeben. Weiterhin verboten: gecrawlte/Drittanbieter-Bewertungen aus dem Netz.
- **Moderation/Anti-Abuse (wegen offener Stufe):** Status-Workflow (neu -> freigegeben/abgelehnt), Rate-Limiting, optional E-Mail-Bestaetigung/Captcha fuer anonyme Bewertungen, Spam-/Doppel-Erkennung.
- **UWG/EU-Omnibus:** Verifizierungsstatus muss transparent ausgewiesen sein (genau das leistet die Zwei-Stufen-Kennzeichnung); Aggregat darf nicht irrefuehrend sein. Schnitt/Anzahl ggf. getrennt fuer verifiziert vs. gesamt ausweisen.

### 3.5 Claim und Outreach
- **dir_claim** (id, produkt_id, anbieter_user_id|null, status, verifiziert_am, methode[domain|email|dns]) — Claim-Lebenszyklus.
- **dir_outreach** (id, produkt_id, kontakt_name, kontakt_rolle, kontakt_email, kontakt_quelle, status[unclaimed|eingeladen|angefragt|claimed], letzte_aktion, verlauf jsonb)

### 3.6 KI-Jobs
- **dir_ki_job** (id, typ[recherche|produktanalyse|seo_content], scope_ref, status[queued|laeuft|fertig|fehlgeschlagen], input jsonb, output jsonb, model, kosten_tokens, created_at) — Audit-Trail aller KI-Laeufe.

---

## 4. Die drei Datenherkuenfte (zentrales Prinzip, UI-sichtbar)

Jedes Produktfeld traegt eine erkennbare Herkunft (`dir_produkt.herkunft`):

- **A, KI-recherchiert + redaktionell freigegeben** (faktisch, paraphrasiert): Kurz-/Langbeschreibung, Features, Plattformen/Einsatzgebiet/Kategorisierung, Preis-Hinweis, Pro/Contra. KI darf vorbefuellen; geht erst nach Freigabe live. Badge: `KI-recherchiert` -> `redaktionell geprueft`.
- **B, nur Anbieter (Claim):** Screenshots, Team, Logo, Medien. **KI befuellt NIE.** Platzhalter `vom Anbieter ergaenzbar` bis Claim. Befuellung im Anbieter-Modul (A-02).
- **C, Bewertungen (zweistufig, First-Party):** *verifiziert* (eingeloggter Nutzer + Tool im anonymisierten Tracker) mit Badge `verifizierte Bewertung`, plus *nicht verifiziert* (offen, auch ohne Account, ohne Nachweis) mit Badge `nicht verifiziert`. Im Frontend klar getrennt. Keine gecrawlten/Drittanbieter-Bewertungen. Moderation + Verifizierungs-Transparenz (UWG). Details §3.4.

**Preis-Sorgfalt (UWG, Pflicht):** Preis und veraenderliche Fakten tragen sichtbar **Stand (Datum) + Quelle + Link** auf die Anbieterseite. Pflichtkennzeichnung, nicht optional.

---

## 5. Goldene Regel (drei Zonen)

Auf jeder Collection sind Produkte in drei sichtbar getrennten Zonen: **Gesponsert (gekennzeichnet)**, **Organisch**, **Community**. Kaeuflich ist ausschliesslich die Sichtbarkeit in der gesponserten Zone (immer als "gesponsert" markiert, `gesponsert_bis`). **Organische Reihenfolge, Bewertungen und verifizierte Daten sind nie kaeuflich.** Das organische Ranking wird **serverseitig** berechnet (Signale: Vollstaendigkeit, verifizierte Bewertungen, Aktualitaet), unabhaengig von bezahlter Sichtbarkeit.

---

## 6. Zugriff, Rollen, Sicherheit

- **Admin-CMS (AD):** **globale Redaktions-/Superadmin-Rolle** `profiles.is_staff boolean` (seit 2026-06-27 vorhanden), **getrennt** von der Mandanten-Rolle `profiles.role` (owner/admin/member je Konto). Ein Konto-Admin ist NICHT automatisch Redakteur. `is_staff` ist **per Trigger geschuetzt** (protect_billing_columns), nur Service-Role/Migration darf es setzen, kein Nutzer selbst (Privilege-Escalation-Schutz, empirisch verifiziert: Selbst-Setzen -> 42501).
  - **Superadmin-Konto (Markus):** sein Konto (Profil-ID stabil; E-Mail aktuell test@toolfolio.de, Wechsel auf markus.laue@ommm.de ausstehend) ist bereits `is_staff = true` UND `role = owner`. Damit nutzt er Toolfolio **operativ ganz normal** (eigener Toolstack) und hat zusaetzlich Zugriff auf das spaetere CMS.
  - **CMS-Gate (AD-01):** Admin-Shell + alle AD-Routen + dir_*-Schreib-RLS pruefen `is_staff = true` (serverseitig, nie nur Frontend). Markus' Konto ist dann automatisch freigeschaltet. Weitere Redakteure: einfach deren Profil per Service-Role auf is_staff=true setzen.
- **Oeffentlich (V):** anon liest nur `status = veroeffentlicht`. SSG/SSR fuer SEO.
- **Anbieter (A):** schreibt nur Herkunft-B-Felder des **geclaimten** Produkts.
- **Keine Geheimnisse im Client:** Anthropic-Key serverseitig/verschluesselt, KI-Laeufe nur ueber Backend-Worker.
- RLS-Policies pro Tabelle: Lesen (anon: nur veroeffentlicht), Schreiben (admin global; Anbieter eingeschraenkt auf eigenes Produkt + Herkunft B).

---

## 7. KI-Workflows (server-side Jobs)

Drei Job-Typen, alle nach demselben Muster (Trigger -> queued/laeuft/fertig/fehlgeschlagen -> Ergebnis IMMER als ueberpruefbarer Vorschlag, nie automatisch live):

1. **Anbieter-Recherche:** Keyword/Region/Sprache -> Vorschlagsliste (Produktname, Anbieter, URL, Kurzbeschreibung, Quelle, Confidence). Uebernahme -> Produkt in Zone Organisch, Status `ki_ungeprueft`.
2. **Produktanalyse (faktenbeschraenkt):** erzeugt NUR Herkunft-A-Felder (Beschreibung, Features, Plattformen, Preis-Hinweis mit Stand/Quelle/Link, Pro/Contra). **Nie** Screenshots/Team/Logo. Review + Diff gegen Bestehendes vor Uebernahme; gepruefte/anbietergepflegte Daten werden nie ueberschrieben.
3. **SEO-Content:** Briefing (Fokus-Keyword, Intention, Wortzahl, Pflichtbegriffe, Gliederung) -> Markdown-Entwurf + indikativer Content-Score. Nur nach redaktioneller Freigabe live.

Reale Ausfuehrung: Backend-Worker, Anthropic-API (neuestes Claude-Modell), Key aus der Umgebung, `dir_ki_job` als Audit-Trail. Caching/Kostenkontrolle pro Job.

---

## 8. Taxonomie-Integration (1315 Kategorien)

- Quelle: `docs/verzeichnis/software-kategorien.md` (OMR + Capterra entdoppelt). Felder je Zeile: **Rubrik (Anzeigename)**, **Slug** (massgeblich, Umlaute ae/oe/ue/ss), **Quelle** (omr|capterra|beide), **Prio** (1/2/3).
- Diese 1315 Eintraege werden zu **dir_collection** (Slug = Verzeichnisname, Prio-Tag uebernommen).
- **Encoding-Hinweis:** Die Rubrik-Spalte der Quelle enthaelt Mojibake (z. B. `Ã¼`). **Massgeblich ist der Slug**; die deutschen Anzeigenamen werden beim Import aus dem Slug bzw. einer bereinigten Fassung regeneriert (Umlaute korrekt), nicht aus dem Mojibake uebernommen.
- **Fehlende Ebenen:** Cluster/L1/L2 sind nicht in der Quelle. AD-02 liefert ein Mapping (Heuristik + redaktionelle Zuordnung), das jede Collection einem L2 -> L1 -> Cluster zuordnet. Initial koennen Collections "unkategorisiert" geparkt und schrittweise einsortiert werden.
- **Priorisierung des Roll-outs:** PRIO 1 (724, Name enthaelt "Software") zuerst (klarste Suchintention), dann PRIO 2 (352), dann PRIO 3 (239).

---

## 9. SEO-Technik

- **Rendering:** SSG fuer stabile Collection-/Produktseiten (ISR-Revalidate bei Redaktionsaenderung), SSR wo dynamisch. Kein Client-Daten-Gotcha (siehe Memory `toolfolio-rsc-client-data-gotcha`): Slugs/Meta serverseitig, Aufloesung server.
- **Pro Ebene:** eigener Meta-Title/-Description, H1, Breadcrumb, interne Verlinkung (Cluster -> L1 -> L2 -> Collection -> Produkt), strukturierte Daten (ItemList, Product, AggregateRating nur bei verifizierten Reviews, BreadcrumbList).
- **Slugs** kommen aus der Taxonomie (stabil, nie aendern nach Live).

---

## 10. Bau-Phasen (Vorschlag, mit Verzeichnis-Phase)

1. **Fundament:** Datenmodell + RLS (dir_*-Tabellen), Admin-Rollen-Gate. (AD-01 Teil 1)
2. **Struktur-Baum + Kategorie-Editoren** (AD-01 Teil 2, AD-03-Kat).
3. **Taxonomie-Import + Strukturierung** (AD-02): 1315 Collections seeden, Ebenen zuordnen.
4. **Produkt-Datenbank** (AD-04) inkl. Herkunfts-Modell A/B/C.
5. **Collection-Editor** (AD-03): SEO-Meta, Produkt-Kuratierung (3 Zonen), SEO-Content.
6. **KI-Workflows** (AD-05): server-side Jobs (Recherche/Analyse/Content).
7. **Claim & Outreach** (AD-06).
8. Oeffentliche Ausspielung: **V-01..V-15** konsumieren dir_*.

---

## 11. Leitplanken (Kurzform)

- Datentrennung Tracker vs. Verzeichnis (kein FK, nur anonyme Aggregate).
- Drei Herkuenfte A/B/C, jedes Feld zeigt Herkunft. Keine fremden Inhalte (keine gecrawlten/Drittbewertungen, keine fremden Screenshots).
- Goldene Regel: nur gesponserte Sichtbarkeit kaeuflich + gekennzeichnet; organisches Ranking serverseitig, unabhaengig.
- KI-Output ist Entwurf; nichts ungeprueft live; Diff statt Ueberschreiben.
- Preis-Sorgfalt (UWG): Stand + Quelle + Link.
- Keine Secrets im Client; KI serverseitig.
- RLS auf jeder Tabelle; Admin-Gate serverseitig.

## Rechtlicher Hinweis
Die rechtlichen Einordnungen (Urheberrecht, Datenbankrecht, UWG, Marken, DSGVO) sind Risikoorientierung, keine Rechtsberatung. Vor Live-Gang anwaltlich pruefen (Max).
