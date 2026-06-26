# B-29: Plan & Abrechnung (Stripe)

## Status: In Review
**Projekt:** PRJ (Einstellungen/Billing) · **Created:** 2026-06-26

## User Stories
- Als Nutzer sehe ich meinen aktuellen Plan, Status und Verlaengerungsdatum.
- Als Nutzer buche ich Pro oder Agentur (monatlich/jaehrlich) ueber eine sichere Stripe-Checkout-Seite.
- Als Abonnent verwalte ich Zahlung, Planwechsel und Kuendigung im Stripe-Kundenportal.

## Acceptance Criteria
- [x] /app/einstellungen/plan: aktueller Plan, Status (Aktiv/Testphase/Zahlung ausstehend/Gekuendigt), Intervall, Verlaengerungs- bzw. Enddatum.
- [x] Tarifkarten Free/Pro/Agentur mit Monats/Jahres-Toggle (Jahresrabatt 20 %), Feature-Listen, "Beliebt"-Markierung.
- [x] Pro/Agentur starten -> Stripe Checkout (mode subscription), Erfolg/Abbruch zurueck auf die Seite mit Toast.
- [x] Abonnent: "Abrechnung verwalten" und "Plan wechseln/kuendigen" -> Stripe-Kundenportal.
- [x] Webhook /api/stripe/webhook aktualisiert Plan-Status am Profil (checkout.completed, subscription.created/updated/deleted), signaturgeprueft.
- [x] Nur Referenzen am Profil (customer/subscription-id, status), NIE Kartendaten.
- [x] Plan-Spalten sind NICHT vom Nutzer beschreibbar (Spalten-Privileg entzogen), nur Service-Role (Webhook) setzt sie.

## Out of Scope
- PayPal (spaeter). Rechnungs-PDF-Archiv im Tracker (Stripe-Portal liefert Rechnungen). Mengen-/Seat-Abrechnung = B-30. Trial-ohne-Karte-Automatik (separat).

## Tech Design
- Stripe SDK serverseitig (src/lib/stripe.ts), Price-IDs aus Env (scripts/stripe-setup.mjs legt Produkte/Preise idempotent an).
- Server-Actions createCheckout/openPortal (Customer lazy anlegen, ID am Profil via Service-Role).
- Webhook (nodejs runtime, raw body, constructEvent) -> applySubscription/clearSubscription via Admin-Client.
- Migration 20260626110000_profiles_billing: plan, stripe_customer_id, stripe_subscription_id, subscription_status, plan_intervall, current_period_end, cancel_at_period_end; column-level REVOKE UPDATE.

## Decision Log
| Decision | Rationale | Date |
| Checkout-Redirect statt Stripe.js | Kein Publishable-Key im Client-Bundle noetig, weniger Angriffsflaeche | 2026-06-26 |
| Plan-Spalten per Spalten-REVOKE schuetzen | Goldene Regel: Nutzer darf eigenen Plan nicht setzen, nur Webhook (Service-Role) | 2026-06-26 |
| Preise/Produkte per Skript (lookup_key) | Idempotent, reproduzierbar, kein manuelles Klicken im Dashboard | 2026-06-26 |

## QA Test Results (2026-06-26)
- Build gruen (tsc/ESLint/next build). Routen /app/einstellungen/plan (gated) + /api/stripe/webhook.
- Webhook: unsignierter POST -> 400 (Secret geladen). Signierte Subscription-Events aktualisieren Profil (Smoke-Test).
- Security: Plan-Spalten fuer authenticated/anon nicht beschreibbar; Secret nur serverseitig. PASS.
