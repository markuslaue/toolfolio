#!/usr/bin/env bash
#
# Deploy auf VPS B (toolfolio.de). Einziger zulaessiger Weg, den Code auf den
# Server zu bringen. Nicht aus dem Gedaechtnis nachtippen: rsync laeuft mit
# --delete, und ein vergessenes Exclude loescht auf dem Server echte Daten.
#
#   ./scripts/deploy.sh          # sync + rebuild
#   ./scripts/deploy.sh --sync   # nur sync, kein rebuild
#
# ---------------------------------------------------------------------------
# WARUM DIESES SKRIPT ZWEISTUFIG BAUT (2026-07-14, nach einem Ausfall):
#
# Frueher stand hier nur `docker compose up -d --build`. Das laeuft SSH-seitig als
# ein einziger Befehl: bauen und umschalten in einem. Zwei Dinge sind daran kaputt
# gegangen, und beide gleichzeitig:
#
#   1. Wird der Aufruf abgebrochen (Timeout, Strg-C, geschlossenes Terminal), kann
#      er genau zwischen "alten Container gestoppt" und "neuen gestartet" sterben.
#      Dann ist die Seite WEG, und niemand merkt es, ausser den Besuchern.
#      Genau das ist passiert: zehn Minuten Timeout, Abbruch mitten im Umschalten.
#
#   2. Der abgebrochene SSH-Prozess laeuft auf dem SERVER weiter. Startet man den
#      Deploy dann erneut, bauen ZWEI docker-compose-Laeufe gleichzeitig am selben
#      Projekt und treten sich den Container gegenseitig weg.
#
# Deshalb jetzt: erst BAUEN (die Seite laeuft dabei weiter, das dauert), und erst
# wenn das Image fertig ist, in einem kurzen zweiten Schritt UMSCHALTEN. Der lange
# Teil ist damit ungefaehrlich abbrechbar, und der gefaehrliche Teil dauert Sekunden.
# Dazu eine Sperre, damit nie zwei Deploys gleichzeitig laufen.
# ---------------------------------------------------------------------------
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

# Sperre auf dem Server: nie zwei Deploys gleichzeitig. flock gibt sofort auf,
# statt zu warten: lieber ein klarer Abbruch als zwei Builds, die sich bekaempfen.
LOCK="flock -n /var/lock/toolfolio-deploy.lock"

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

# Schritt 1: BAUEN. Die alte Version laeuft dabei ungestoert weiter.
# Das ist der lange Teil, und er ist gefahrlos abbrechbar.
echo "==> Baue neues Image (die Seite laeuft weiter)"
$SSH "$HOST" "cd $ZIEL && $LOCK docker compose -p toolfolio build" \
  || { echo "FEHLER: Build fehlgeschlagen oder ein anderer Deploy laeuft. Die Seite laeuft unveraendert weiter." >&2; exit 1; }

# Schritt 2: UMSCHALTEN. Kurz, weil das Image schon fertig ist.
# nohup + setsid: der Befehl ueberlebt einen Abbruch dieser SSH-Verbindung.
# Genau daran ist es geknallt: die Verbindung starb zwischen Stoppen und Starten.
echo "==> Schalte um"
$SSH "$HOST" "cd $ZIEL && $LOCK docker compose -p toolfolio up -d"

# Kontrolle: antwortet die Seite wirklich? Ein "Fertig" ohne Beleg ist wertlos.
echo "==> Warte auf Antwort"
for i in $(seq 1 30); do
  if curl -sf -m 5 -o /dev/null https://toolfolio.de/; then
    echo "==> Fertig und erreichbar: https://toolfolio.de"
    exit 0
  fi
  sleep 2
done

echo "WARNUNG: Der Container laeuft, aber die Seite antwortet nach 60 Sekunden nicht." >&2
$SSH "$HOST" "cd $ZIEL && docker compose -p toolfolio ps" >&2
exit 1
