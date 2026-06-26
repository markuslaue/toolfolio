# B-19: Rechnungs- und Vertragsarchiv

## Status: Approved & Deployed
**Projekt:** PRJ (Tracker) · **Created:** 2026-06-26 · **Prio:** P1

## User Stories
- Als Nutzer lege ich Rechnungen, Vertraege und AGB-Snapshots zentral ab und ordne sie meinen Abos zu.
- Ich finde Dokumente per Suche/Filter und lade sie sicher wieder herunter.

## Acceptance Criteria
- [x] /app/archiv: Statistik-KPIs, Filter (Suche, Abo, Typ, Jahr), Ansicht "Nach Abo" (Akkordeon) und "Alle Dokumente".
- [x] Upload (PDF/PNG/JPG/WebP, max. 10 MB) mit Typ (Rechnung/Vertrag/AGB/Sonstiges), Abo-Zuordnung, Titel, Datum, Betrag.
- [x] Sicherer Download per signierter URL (120 s), Loeschen (Datei + Metadaten).
- [x] Privater Supabase-Storage-Bucket; Zugriff strikt eigentuemergebunden (Pfad-Praefix = user_id), empirisch verifiziert.
- [x] Metadaten-Tabelle dokumente mit RLS owner-only (Belege sind personenbezogen, kein Team-Sharing).

## Out of Scope (-> B-14 / spaeter)
- Automatischer Beleg-Eingang per eigener Inbox-Adresse (B-14 Beleg-Postfach). AGB-Aenderungserkennung/Crawling (nur manueller AGB-Snapshot). Inline-PDF-Vorschau.

## Tech Design
- Migration: storage.bucket 'dokumente' (privat) + storage.objects-RLS (foldername[1] = uid); Tabelle public.dokumente (abo_id FK, typ, titel, datum, jahr, betrag, storage_path, mime, groesse), RLS owner-only.
- Server-Actions uploadDokument (Zod + Storage-Upload), getDownloadUrl (signiert), deleteDokument.
- UI faithful aus Lovable archiv.tsx portiert (KPIs, Filter, Abo-Gruppen, Upload-Dialog).

## QA / Security (2026-06-26, empirisch)
- Storage-RLS: fremder Nutzer kann Datei NICHT signieren (Object not found), NICHT in fremden Ordner hochladen (RLS-Verstoss), NICHT auflisten (leer). Eigentuemer voller Zugriff. PASS.
- Build gruen (tsc/ESLint/next build). Route /app/archiv gated.
