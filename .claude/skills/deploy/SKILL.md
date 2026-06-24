---
name: deploy
description: Deploy to Hostinger (EU) with production-ready checks, error tracking, and security headers setup.
argument-hint: "feature-spec-path or 'to Hostinger'"
user-invocable: true
---

# DevOps Engineer

## Role
You are an experienced DevOps Engineer handling deployment to **Hostinger (EU)**, environment setup, and production readiness for a Next.js + Supabase app.

> **Ziel-Plattform: Hostinger (EU-Region).** Nicht Vercel. Toolfolio hostet auf Hostinger (DPA/AVV vorhanden, EU). Supabase (EU) bleibt Datenbank/Auth. Diese Skill nutzt, wo verfuegbar, die **Hostinger-MCP-Tools** (z. B. `hosting_createNodeJSBuildFromArchiveV1`, `hosting_deployJsApplication`, `hosting_listJsDeployments`, `hosting_getNodeJSBuildLogsV1`) zur Automatisierung. Lade ihre Schemata bei Bedarf via ToolSearch.

## Before Starting
1. Read `features/INDEX.md` to know what is being deployed
2. Check QA status in the feature spec
3. Verify no Critical/High bugs exist in QA results
4. If QA has not been done, tell the user: "Run `/qa` first before deploying."

## Workflow

### 1. Pre-Deployment Checks
- [ ] `npm run build` succeeds locally (Next.js production build)
- [ ] `npm run lint` passes
- [ ] `npm test` passes (Vitest)
- [ ] QA Engineer has approved the feature (check feature spec)
- [ ] No Critical/High bugs in test report
- [ ] All environment variables documented in `.env.local.example`
- [ ] No secrets committed to git (Supabase service key, Stripe/Resend keys, KI-API-Keys)
- [ ] All Supabase migrations applied (and **RLS aktiv auf jeder Tabelle**)
- [ ] All code committed and pushed to remote

### 2. Hostinger Setup (first deployment only)

> **Voraussetzung (manuell):** Ein Hostinger-Konto mit Node.js-faehigem Plan (Business/Cloud Hosting mit Node.js-App-Unterstuetzung **oder** VPS). Account-Anlage und Login sind Browser-Schritte. Die EU-Region waehlen (Datenstandort). Domain/Subdomain bereithalten.

Zwei Wege, je nach Plan:

**A) Node.js App Hosting (Shared/Cloud, einfacher):**
- [ ] In hPanel eine Node.js-Anwendung anlegen, Node-Version passend zu `.nvmrc`/`package.json` `engines`
- [ ] Application Root, Build Command (`npm run build`) und Start Command (`npm start`) setzen
- [ ] Alle Env-Variablen aus `.env.local.example` in hPanel hinterlegen (Client-seitige brauchen `NEXT_PUBLIC_`-Praefix)
- [ ] Domain/Subdomain zuordnen, SSL (Let's Encrypt) aktivieren
- [ ] Optional: Build per MCP automatisieren (`hosting_createNodeJSBuildFromArchiveV1`, Logs via `hosting_getNodeJSBuildLogsV1`)

**B) VPS (volle Kontrolle, fuer Skalierung):**
- [ ] Node + Prozessmanager (pm2) + Reverse Proxy (nginx) einrichten
- [ ] `npm ci && npm run build && pm2 start npm --name toolfolio -- start`
- [ ] nginx als Reverse Proxy auf den Next.js-Port, SSL via certbot
- [ ] Env-Variablen serverseitig (nicht in git), Firewall-Regeln setzen

### 3. Deploy
- Code committen und pushen
- Node.js App Hosting: Build in hPanel anstossen (oder MCP `hosting_createNodeJSBuildFromArchiveV1`)
- VPS: `git pull && npm ci && npm run build && pm2 reload toolfolio`
- Build/Logs ueberwachen (hPanel bzw. `hosting_getNodeJSBuildLogsV1` / `pm2 logs`)

### 4. Post-Deployment Verification
- [ ] Produktions-URL laedt korrekt (oeffentliche Marketing-/Verzeichnis-Seiten **und** eingeloggte App)
- [ ] Deployed feature funktioniert wie erwartet
- [ ] Supabase-Verbindung funktioniert, RLS greift (Fremdzugriff scheitert)
- [ ] Auth-Flows funktionieren (Login, SSO, Recovery)
- [ ] Stripe-Webhook erreicht das Backend (Test-Event)
- [ ] Keine Fehler in der Browser-Konsole, keine Fehler in den Server-Logs

### 5. Production-Ready Essentials

Beim ersten Deployment durch diese Setups fuehren (Guides unter `docs/production/`):

**Error Tracking (5 min):** [error-tracking.md](../../../docs/production/error-tracking.md)
**Security Headers (next.config):** [security-headers.md](../../../docs/production/security-headers.md)
**Performance Check (Lighthouse):** [performance.md](../../../docs/production/performance.md)
**Database Optimization:** [database-optimization.md](../../../docs/production/database-optimization.md)
**Rate Limiting (optional):** [rate-limiting.md](../../../docs/production/rate-limiting.md)

Zusaetzlich Toolfolio-spezifisch:
- Consent vor nicht notwendigen Einbettungen (YouTube), Plausible cookielos einbinden.
- Drittland-Garantien (Resend/Google/Stripe/PayPal) sind in der DSE referenziert.

### 6. Post-Deployment Bookkeeping
- Feature-Spec aktualisieren: Deployment-Abschnitt mit Produktions-URL und Datum
- `features/INDEX.md`: Status auf **Deployed** setzen
- Git-Tag erstellen: `git tag -a v1.X.0-<ID> -m "Deploy <ID>: [Feature Name]"`
- Tag pushen: `git push origin v1.X.0-<ID>`

## Common Issues

### Build faellt auf Hostinger, laeuft lokal
- Node-Version pruefen (muss zu `engines`/`.nvmrc` passen)
- Alle Laufzeit-Abhaengigkeiten in `dependencies` (nicht nur `devDependencies`)
- Build-Logs in hPanel bzw. via MCP pruefen

### Env-Variablen nicht verfuegbar
- In hPanel (bzw. VPS-Env) gesetzt? Client-seitige brauchen `NEXT_PUBLIC_`
- Nach dem Aendern neu deployen (gelten nicht rueckwirkend)

### Datenbank-Verbindungsfehler
- Supabase-URL und Keys in den Hostinger-Env-Vars pruefen
- RLS-Policies erlauben die Operation? Service-Key nur serverseitig
- Supabase-Projekt nicht pausiert (Free-Tier)

## Rollback Instructions
Wenn die Produktion gebrochen ist:
1. **Sofort:** vorheriges funktionierendes Build erneut deployen (hPanel-Build-Historie / `pm2 reload` auf vorheriges Release / vorherigen Git-Tag auschecken und bauen)
2. **Fix lokal:** Bug beheben, `npm run build`, commit, push
3. Erneut deployen

## Full Deployment Checklist
- [ ] Pre-deployment checks all pass
- [ ] Hostinger build successful
- [ ] Produktions-URL laedt und funktioniert (oeffentlich + eingeloggt)
- [ ] Feature in Produktion getestet
- [ ] Keine Konsolen-/Server-Log-Fehler
- [ ] Error Tracking eingerichtet
- [ ] Security Headers in next.config konfiguriert
- [ ] Lighthouse geprueft (Ziel > 90, besonders fuer SEO-Verzeichnis)
- [ ] RLS auf allen Tabellen aktiv verifiziert
- [ ] Feature-Spec aktualisiert
- [ ] `features/INDEX.md` auf Deployed
- [ ] Git-Tag erstellt und gepusht
- [ ] User hat die Produktion verifiziert

## Git Commit
```
deploy(<ID>): Deploy [feature name] to production (Hostinger)

- Production URL: https://...
- Deployed: YYYY-MM-DD
```
