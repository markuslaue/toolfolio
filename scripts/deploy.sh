#!/usr/bin/env bash
#
# Deploy auf VPS B (toolfolio.de). Einziger zulaessiger Weg, den Code auf den
# Server zu bringen. Nicht aus dem Gedaechtnis nachtippen: rsync laeuft mit
# --delete, und ein vergessenes Exclude loescht auf dem Server echte Daten.
#
#   ./scripts/deploy.sh          # sync + rebuild
#   ./scripts/deploy.sh --sync   # nur sync, kein rebuild
#
set -euo pipefail

HOST="root@187.127.73.115"
ZIEL="/opt/toolfolio"
SSH="ssh -i $HOME/.ssh/flowee_vps -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no"
cd "$(dirname "$0")/.."

# Excludes MUESSEN verankert sein (fuehrender /), sonst schliesst z. B. "supabase"
# auch src/lib/supabase/ aus und der Build bricht mit module-not-found ab.
#
# /.env ist lebenswichtig: dort liegen die Laufzeit-Secrets des Servers, die es
# lokal nicht gibt. rsync loescht ausgeschlossene Dateien auf dem Ziel NICHT
# (solange kein --delete-excluded gesetzt ist), das Exclude schuetzt sie also.
EXCLUDES=(
  --exclude '/.git'
  --exclude '/node_modules'
  --exclude '/.next'
  --exclude '/.env'          # Server-Secrets, niemals anfassen
  --exclude '/.env.local'    # lokale Entwickler-Secrets, gehoeren nicht auf den Server
  --exclude '/.lovable-ref'
  --exclude '/coverage'
  --exclude '/docs'
  --exclude '/features'
  --exclude '/.claude'
  --exclude '/supabase'
  --exclude '/tsconfig.tsbuildinfo'
  --exclude '.DS_Store'
)

echo "==> Sync nach $HOST:$ZIEL"
rsync -az --delete -e "$SSH" "${EXCLUDES[@]}" ./ "$HOST:$ZIEL/"

# Kontrolle: ohne .env startet der Container nicht, und ein stiller Fehlschlag
# waere schlimmer als ein lauter Abbruch.
if ! $SSH "$HOST" "test -s $ZIEL/.env"; then
  echo "FEHLER: $ZIEL/.env fehlt oder ist leer. Kein Rebuild." >&2
  exit 1
fi

if [ "${1:-}" = "--sync" ]; then
  echo "==> Nur Sync, wie angefordert. Kein Rebuild."
  exit 0
fi

echo "==> Rebuild"
$SSH "$HOST" "cd $ZIEL && docker compose -p toolfolio up -d --build"
echo "==> Fertig: https://toolfolio.de"
