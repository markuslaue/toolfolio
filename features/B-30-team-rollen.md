# B-30: Einstellungen - Team & Rollen

## Status: In Review
**Projekt:** PRJ (Einstellungen) · **Created:** 2026-06-26

## User Stories
- Als Konto-Owner lade ich Kolleginnen per E-Mail ein und vergebe Rollen (Administrator/Mitglied).
- Als Mitglied trete ich ueber den Einladungslink bei und sehe die Abos, Kosten und Fristen des Kontos.
- Als Owner aendere ich Rollen und entferne Mitglieder.

## Acceptance Criteria
- [x] /app/einstellungen/team: Mitglied einladen (E-Mail + Rolle), Mitgliederliste (inkl. Owner), Rolle aendern, entfernen, offene Einladungen zuruckziehen.
- [x] Einladungs-E-Mail (Resend) mit Token-Link /einladung/<token>.
- [x] /einladung/<token>: eingeloggter Nutzer nimmt an; E-Mail-Gleichheit + Frist (7 Tage) + Einmaligkeit serverseitig geprueft.
- [x] Mitglieder erhalten geteilten LESE-Zugriff auf Konto-Daten (abos, kunden, zahlungskanaele, unternehmen, frist_quittungen) via RLS.
- [x] Rollen: owner (voll), admin (Mitglieder verwalten + Ansicht), member (nur Ansicht). RLS-Helfer has_account_access / has_admin_access.

## Out of Scope (-> B-25 / spaeter)
- Schreibendes Mitarbeiten von Mitgliedern (braucht tenant_id auf allen Tabellen = B-25).
- Mehrere Gesellschaften/Mandanten (B-25). Plan-Gating (Team nur ab Agentur) als Folge-Schritt. Seats/Lizenzen = B-21.

## Tech Design
- Tabellen team_members (account_owner, member, role, member_email/name) + team_invites (email, role, token, expires_at, accepted_at), RLS owner/admin.
- SECURITY-DEFINER-Helfer has_account_access(owner) / has_admin_access(owner) -> in Policies, keine Rekursion.
- SELECT-Policies der Konto-Daten auf has_account_access(user_id) erweitert; Schreib-Policies unveraendert eigentuemergebunden.
- Server-Actions inviteMember/changeRole/removeMember/revokeInvite (User-Client, RLS) + acceptInvite (Admin-Client, da Eingeladener die Einladung nicht lesen darf).

## Decision Log
| Decision | Rationale | Date |
| Nur Lese-Sharing in B-30 | Voll-Multi-Tenancy (tenant_id) ist B-25, hier additiv & risikoarm | 2026-06-26 |
| Helfer SECURITY DEFINER | Policy-Check auf team_members ohne RLS-Rekursion | 2026-06-26 |
| acceptInvite via Service-Role | Eingeladener darf Einladung nicht per RLS lesen; Token serverseitig validiert | 2026-06-26 |

## QA / Security (2026-06-26, empirisch getestet)
- RLS: Mitglied liest Owner-Abos = sichtbar; Aussenstehender = leer (kein Leak); Mitglied aendert/legt an = blockiert (42501); Team-Liste nur fuer Mitglieder; Selbst-Eintragen Aussenstehender = 42501. Alle PASS.
- Build gruen (tsc/ESLint/next build). Routen /app/einstellungen/team + /einladung/[token].
