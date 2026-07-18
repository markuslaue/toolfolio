#!/usr/bin/env bash
#
# Deploy auf VPS B (toolfolio.de).
#
#   ./scripts/deploy.sh            # Image aus der Registry ziehen und umschalten
#   ./scripts/deploy.sh --lokal    # NOTAUSGANG: auf dem Server bauen (langsam, belastend)
#
# ---------------------------------------------------------------------------
# WARUM HIER NICHT MEHR GEBAUT WIRD (2026-07-15, nach zwei Ausfaellen):
#
# Der VPS hat 4 GB RAM und wenige Kerne. Ein Next.js-Build braucht davon fast alles.
# Solange er laeuft, ist der Server so beschaeftigt, dass er KEINE Anfrage mehr
# beantwortet: Load 44 statt 2, 59 MB freier Speicher, SSH antwortet nicht.
#
# Die Seite war damit bei JEDEM Deploy minutenlang nicht erreichbar, obwohl der
# Webcontainer die ganze Zeit lief. Ich habe das zweimal fuer ein Container-Problem
# gehalten und mit besseren Skripten zu loesen versucht. Es war keins: der Server
# erstickte schlicht am eigenen Build.
#
# Jetzt baut GitHub Actions (.github/workflows/deploy.yml) das Image bei jedem Push
# nach main und legt es in die GitHub-Registry. Dieses Skript zieht es und schaltet um.
# Das dauert Sekunden und kostet den Server fast nichts.
#
# Deployen soll langweilig sein.
# ---------------------------------------------------------------------------
set -euo pipefail

HOST="root@187.127.73.115"
ZIEL="/opt/toolfolio"
SSH="ssh -i $HOME/.ssh/flowee_vps -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no"
cd "$(dirname "$0")/.."

# Sperre auf dem Server: nie zwei Deploys gleichzeitig. flock gibt SOFORT auf, statt zu
# warten: lieber ein klarer Abbruch als zwei Laeufe, die sich den Container wegtreten.
LOCK="flock -n /var/lock/toolfolio-deploy.lock"

# Die Konfigurationsdateien muessen trotzdem auf den Server: docker-compose.yml sagt,
# welches Image gezogen wird und wie es laeuft. Der Quellcode nicht mehr, der steckt
# jetzt im Image.
echo "==> Konfiguration nach $HOST:$ZIEL"
rsync -az -e "$SSH" docker-compose.yml "$HOST:$ZIEL/docker-compose.yml"
# Das Sicherungsskript gehoert versioniert ins Repo, laeuft aber auf dem Server.
rsync -az -e "$SSH" scripts/backup-db.sh "$HOST:$ZIEL/backup-db.sh"
$SSH "$HOST" "chmod +x $ZIEL/backup-db.sh"

# Ohne .env startet der Container nicht. Ein stiller Fehlschlag waere schlimmer als
# ein lauter Abbruch.
if ! $SSH "$HOST" "test -s $ZIEL/.env"; then
  echo "FEHLER: $ZIEL/.env fehlt oder ist leer. Kein Deploy." >&2
  exit 1
fi

if [ "${1:-}" = "--lokal" ]; then
  # NOTAUSGANG. Nur wenn GitHub nicht verfuegbar ist. Nimmt die Seite fuer Minuten
  # vom Netz, deshalb nice + ionice: der Build bekommt die niedrigste Prioritaet.
  echo "==> NOTAUSGANG: Build auf dem Server. Die Seite wird waehrenddessen sehr langsam."
  rsync -az --delete -e "$SSH" \
    --exclude '/.git' --exclude '/node_modules' --exclude '/.next' \
    --exclude '/.env' --exclude '/.env.local' --exclude '/.lovable-ref' \
    --exclude '/coverage' --exclude '/docs' --exclude '/features' \
    --exclude '/.claude' --exclude '/supabase' --exclude '/tsconfig.tsbuildinfo' \
    --exclude '.DS_Store' \
    ./ "$HOST:$ZIEL/"
  $SSH "$HOST" "cd $ZIEL && $LOCK nice -n 19 ionice -c3 docker compose -p toolfolio -f docker-compose.build.yml build" \
    || { echo "FEHLER: Build fehlgeschlagen oder ein anderer Deploy laeuft." >&2; exit 1; }
else
  # Der Normalfall: fertiges Image ziehen. Sekunden, kaum Last.
  #
  # Das Paket ist PRIVAT (schuetzt unseren kompilierten Code). Der Server meldet sich
  # deshalb vorher mit einem Read-only-Token an. Token und Nutzer stehen in der
  # geschuetzten /opt/toolfolio/.env (GHCR_USER, GHCR_TOKEN), genau wie die anderen
  # Geheimnisse. Sie verlassen den Server nie und stehen NICHT im Image.
  echo "==> An der GitHub-Registry anmelden und Image ziehen"
  # Die .env wird NICHT gesourct: sie ist eine Docker-Compose-env-Datei, kein
  # Shell-Skript. Werte wie "EMAIL_FROM=Toolfolio <fristen@...>" enthalten < und >,
  # die die Shell als Umleitung deutet und abbricht. Deshalb die zwei Werte gezielt
  # herausschneiden, alles andere ignorieren.
  $SSH "$HOST" "cd $ZIEL && $LOCK bash -c '
    U=\$(grep -E \"^GHCR_USER=\" .env | head -1 | cut -d= -f2-)
    T=\$(grep -E \"^GHCR_TOKEN=\" .env | head -1 | cut -d= -f2-)
    if [ -n \"\$T\" ]; then
      echo \"\$T\" | docker login ghcr.io -u \"\${U:-markuslaue}\" --password-stdin >/dev/null
    fi
    docker compose -p toolfolio pull
  '" \
    || { echo "FEHLER: Image konnte nicht geladen werden. Ist GHCR_TOKEN in der Server-.env gesetzt und das Paket erreichbar? Die Seite laeuft unveraendert weiter." >&2; exit 1; }
fi

echo "==> Umschalten"
$SSH "$HOST" "cd $ZIEL && $LOCK docker compose -p toolfolio up -d"

# Kontrolle: antwortet die Seite wirklich? Ein "Fertig" ohne Beleg ist wertlos, und
# genau das hat mir waehrend eines Ausfalls die Wahrheit verschleiert.
echo "==> Warte auf Antwort"
for _ in $(seq 1 30); do
  if curl -sf -m 5 -o /dev/null https://toolfolio.de/; then
    echo "==> Fertig und erreichbar: https://toolfolio.de"
    exit 0
  fi
  sleep 2
done

echo "WARNUNG: Der Container laeuft, aber die Seite antwortet nach 60 Sekunden nicht." >&2
$SSH "$HOST" "cd $ZIEL && docker compose -p toolfolio ps" >&2
exit 1
