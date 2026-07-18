#!/usr/bin/env bash
#
# INFRA-3, Einrichtung der Zweitablage: verschluesselte Sicherungskopie nach Google Drive.
#
# Laeuft VOM ARBEITSRECHNER aus und richtet den Server ein. Zweistufig, weil genau ein
# Schritt nicht automatisierbar ist: die Anmeldung bei Google braucht einen Browser mit
# deinem Konto. Alles davor und danach macht dieses Skript.
#
#   bash scripts/backup-offsite-einrichten.sh vorbereiten   # rclone + Passwort anlegen
#   bash scripts/backup-offsite-einrichten.sh verbinden     # Google-Token eintragen
#   bash scripts/backup-offsite-einrichten.sh testen        # kompletter Probelauf
#
# ---------------------------------------------------------------------------
# DAS PASSWORT: wird in Schritt 1 erzeugt und EINMAL angezeigt. Es liegt danach in der
# .env auf dem Server. Es gehoert zusaetzlich in deinen Passwortmanager, und zwar sofort.
# Stirbt der Server und existiert das Passwort nur dort, sind alle Kopien bei Google
# unlesbarer Datenmuell. Das ist der haeufigste Weg, wie verschluesselte Sicherungen
# wertlos werden.
# ---------------------------------------------------------------------------

set -euo pipefail

HOST="root@187.127.73.115"
SSH="ssh -i $HOME/.ssh/flowee_vps -o StrictHostKeyChecking=no"
ZIEL="/opt/toolfolio"
DRIVE_ORDNER="Toolfolio-Sicherungen"

schritt="${1:-}"

case "$schritt" in

vorbereiten)
  echo "==> Installiere rclone auf dem Server"
  $SSH "$HOST" 'command -v rclone >/dev/null 2>&1 || (curl -fsSL https://rclone.org/install.sh | bash >/dev/null 2>&1); rclone version | head -1'

  echo "==> Lege Verschluesselungspasswort an (nur, falls noch keines existiert)"
  # Wird auf dem Server erzeugt, damit es nie ueber einen zweiten Weg wandert.
  # 32 Byte aus dem Zufallsgenerator des Systems, base64 kodiert.
  PASS=$($SSH "$HOST" "
    if grep -q '^BACKUP_PASSPHRASE=' $ZIEL/.env 2>/dev/null; then
      grep '^BACKUP_PASSPHRASE=' $ZIEL/.env | head -1 | cut -d= -f2-
    else
      P=\$(openssl rand -base64 32 | tr -d '\n')
      printf 'BACKUP_PASSPHRASE=%s\n' \"\$P\" >> $ZIEL/.env
      printf 'BACKUP_RCLONE_ZIEL=gdrive:$DRIVE_ORDNER\n' >> $ZIEL/.env
      echo \"\$P\"
    fi")

  cat <<ENDE

  ------------------------------------------------------------------
  DAS VERSCHLUESSELUNGSPASSWORT. Jetzt in den Passwortmanager, unter
  einem Namen wie "Toolfolio Datenbanksicherung":

      $PASS

  Ohne dieses Passwort ist keine einzige Kopie bei Google wiederher-
  stellbar. Auch nicht von mir, auch nicht von Google.
  ------------------------------------------------------------------

  Naechster Schritt, und den musst du machen, weil Google deinen
  Browser und dein Konto sehen will:

  1. rclone auf diesem Mac installieren, falls noch nicht da:
         brew install rclone

  2. Anmeldung starten:
         rclone authorize "drive"

     Es oeffnet sich ein Browserfenster. Melde dich mit dem Google-
     Konto an, in dessen Drive die Sicherungen liegen sollen, und
     bestaetige den Zugriff.

  3. rclone gibt danach im Terminal einen langen Block aus, der mit
     {"access_token": ... beginnt. Diesen Block vollstaendig kopieren
     und einsetzen in:

         bash scripts/backup-offsite-einrichten.sh verbinden '<block>'

ENDE
  ;;

verbinden)
  TOKEN="${2:-}"
  if [ -z "$TOKEN" ]; then
    echo "Es fehlt der Token-Block aus 'rclone authorize \"drive\"'." >&2
    exit 1
  fi

  echo "==> Trage Google-Drive-Zugang auf dem Server ein"
  # Die Konfiguration liegt nur auf dem Server, mit Rechten 600. Sie ist ein Zugang zu
  # deinem Drive, also wird sie behandelt wie ein Schluessel: nicht ins Git, nicht ins Log.
  $SSH "$HOST" "
    mkdir -p /root/.config/rclone
    cat > /root/.config/rclone/rclone.conf <<'KONF'
[gdrive]
type = drive
scope = drive.file
token = $TOKEN
KONF
    chmod 600 /root/.config/rclone/rclone.conf
    rclone mkdir gdrive:$DRIVE_ORDNER && echo 'Ordner $DRIVE_ORDNER in Drive angelegt.'
  "
  echo
  echo "Verbunden. Hinweis zum Zugriffsumfang: rclone bekommt 'drive.file', das heisst"
  echo "es sieht ausschliesslich Dateien, die es selbst angelegt hat. Auf den Rest"
  echo "deines Drive hat es keinen Zugriff."
  echo
  echo "Jetzt pruefen: bash scripts/backup-offsite-einrichten.sh testen"
  ;;

testen)
  echo "==> Kompletter Probelauf auf dem Server (Sicherung, Verschluesselung, Upload)"
  $SSH "$HOST" "bash $ZIEL/backup-db.sh"
  echo
  echo "==> Was jetzt wirklich in Google Drive liegt:"
  $SSH "$HOST" "rclone ls gdrive:$DRIVE_ORDNER --config /root/.config/rclone/rclone.conf"
  echo
  echo "==> Und lokal auf dem Server:"
  $SSH "$HOST" "ls -lh $ZIEL/backups/"
  ;;

*)
  echo "Aufruf: $0 vorbereiten | verbinden '<token>' | testen" >&2
  exit 1
  ;;
esac
