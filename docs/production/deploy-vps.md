# Deployment auf VPS B (Hostinger, Docker + Traefik)

Konkrete, erprobte Schritte fuer das Toolfolio-Deployment. Erstmals erfolgreich am 2026-06-24, https://toolfolio.de live mit Let's-Encrypt-Zertifikat.

## Ziel
- **VPS B:** `187.127.73.115` (Hostinger VM 1648023), Ubuntu 24.04 + Docker + Traefik.
- **SSH:** key-basiert als `root` mit `~/.ssh/flowee_vps`. Nach jedem VM-Recreate aendert sich der Host-Key -> `ssh-keygen -R 187.127.73.115` bzw. `-o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no`.
- **Traefik:** `/docker/traefik/`, host-Netz, Certresolver `letsencrypt`, ACME-Email in `/docker/traefik/.env` (`ACME_EMAIL`). `exposedbydefault=false` -> Container meldet sich per Labels.
- **App-Verzeichnis:** `/opt/toolfolio`.

## Vorbereitung im Repo (einmalig, schon erledigt)
- `next.config.ts`: `output: "standalone"`.
- `Dockerfile` (multi-stage, node:22-alpine), `.dockerignore`.
- `docker-compose.yml` mit Traefik-Labels (Host `toolfolio.de`/`www`, certresolver `letsencrypt`, www->apex Redirect, `traefik.docker.network=toolfolio_default`).
- `.env.production.example` als Vorlage.

## Deploy-Schritte

### 1. Quellcode synchronisieren (vom Mac)
WICHTIG: Excludes **verankern** (fuehrender `/`), sonst schliesst z. B. `supabase` auch `src/lib/supabase/` aus und der Build bricht mit "module-not-found" ab.

```bash
cd /Users/Karolin/toolfolio
rsync -az --delete \
  -e "ssh -i $HOME/.ssh/flowee_vps -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no" \
  --exclude '/.git' --exclude '/node_modules' --exclude '/.next' \
  --exclude '/.env' --exclude '/.env.local' --exclude '/coverage' \
  --exclude '.DS_Store' --exclude '/docs' --exclude '/features' \
  --exclude '/.claude' --exclude '/supabase' --exclude '/tsconfig.tsbuildinfo' \
  ./ root@187.127.73.115:/opt/toolfolio/
```

### 2. Server-.env (einmalig bzw. bei Key-Aenderung)
`/opt/toolfolio/.env` (chmod 600), NICHT im Repo. Enthaelt:
```
NEXT_PUBLIC_SUPABASE_URL=https://xuhuytpuhplfiqtzdpnj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
NEXT_PUBLIC_SITE_URL=https://toolfolio.de
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...
```
Compose nutzt die `NEXT_PUBLIC_*` als Build-Args (Interpolation aus `.env`) und alle Werte als Laufzeit-Env (`env_file: .env`).

### 3. Bauen und starten (auf dem Server)
```bash
ssh ... root@187.127.73.115 'cd /opt/toolfolio && docker compose -p toolfolio up -d --build'
```
Build dauert auf 1 vCPU einige Minuten -> per Hintergrund-Job laufen lassen.

### 4. Verifizieren
```bash
curl -sI https://toolfolio.de                  # 200, Toolfolio-Startseite
curl -so/dev/null -w '%{http_code}' http://toolfolio.de   # 301 -> https
echo | openssl s_client -servername toolfolio.de -connect toolfolio.de:443 2>/dev/null | openssl x509 -noout -issuer -subject -dates
```
Hinweis: `curl 127.0.0.1:3000` auf dem Server schlaegt fehl (Port nur `expose`, nicht `ports`) - das ist korrekt, Traefik routet ueber das Docker-Netz.

## Rollback
Vorheriges Image behalten / `docker compose -p toolfolio up -d` auf vorherigen Stand, oder Git-Stand zuruecksetzen, rsync, rebuild.

## Offen / spaeter
- Deployment automatisieren (Skript oder GitHub Actions, sobald Repo-Push steht).
- ACME-Email steht auf markus.laue@ommm.de.
- Beim Hinzufuegen echter Features: Migrations vorher per `supabase db push --db-url ...` einspielen.
