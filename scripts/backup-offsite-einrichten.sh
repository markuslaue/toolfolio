#!/usr/bin/env bash
#
# INFRA-3, Einrichtung der Zweitablage: verschluesselte Sicherungskopie nach Google Drive.
#
# Laeuft VOM ARBEITSRECHNER aus und richtet den Server ein. Zweistufig, weil genau ein
# Schritt nicht automatisierbar ist: die Anmeldung bei Google braucht einen Browser mit
# deinem Konto. Alles davor und danach macht dieses Skript.
#
#   bash scripts/backup-offsite-einrichten.sh vorbereiten      # rclone auf dem Server
#   bash scripts/backup-offsite-einrichten.sh passwort-setzen  # Passwort blind eingeben
#   bash scripts/backup-offsite-einrichten.sh verbinden        # Google-Token eintragen
#   bash scripts/backup-offsite-einrichten.sh testen           # kompletter Probelauf
#
# ---------------------------------------------------------------------------
# DAS PASSWORT wird NIE angezeigt, weder beim Setzen noch spaeter. Es wird im Passwort-
# manager erzeugt und hier blind eingetippt. Die erste Fassung dieses Skripts hat es
# erzeugt und ausgedruckt, und prompt lag es in einem Terminal-Protokoll und in einem
# Chatfenster. Was auf dem Bildschirm steht, ist nicht mehr geheim.
#
# Es liegt danach in der .env auf dem Server UND gehoert in den Passwortmanager. Stirbt
# der Server und existiert es nur dort, sind alle Kopien bei Google unlesbarer Datenmuell.
# Das ist der haeufigste Weg, wie verschluesselte Sicherungen wertlos werden.
# ---------------------------------------------------------------------------

set -euo pipefail

HOST="root@187.127.73.115"
SSH="ssh -i $HOME/.ssh/flowee_vps -o StrictHostKeyChecking=no"
ZIEL="/opt/toolfolio"
DRIVE_ORDNER="Toolfolio-Sicherungen"

schritt="${1:-}"

case "$schritt" in

passwort-setzen)
  # Passwort selbst festlegen, ohne dass es je auf dem Bildschirm steht.
  #
  # WARUM ES DIESEN WEG GIBT: "vorbereiten" erzeugt das Passwort und DRUCKT es. Das ist
  # bequem, aber alles, was auf dem Bildschirm steht, landet frueher oder spaeter in einem
  # Screenshot, einem Chat oder einem Terminal-Protokoll. Wer sein Passwort ohnehin im
  # Passwortmanager erzeugt, soll es dort erzeugen und hier nur noch blind eintippen.
  #
  # read -s: keine Ausgabe beim Tippen. Uebergabe an den Server per stdin, nicht als
  # Argument, sonst stuende es drueben in der Prozessliste.
  echo "Erzeuge das Passwort in deinem Passwortmanager (mindestens 24 Zeichen)."
  echo "Bitte OHNE die Zeichen \$ \" ' und ohne Leerzeichen, damit nichts falsch gelesen wird."
  echo
  read -r -s -p "Passwort:                   " P1; echo
  read -r -s -p "Zur Sicherheit noch einmal: " P2; echo

  if [ "$P1" != "$P2" ]; then
    # Beim Blindtippen ist "nicht gleich" eine nutzlose Auskunft. Die Laengen zu nennen
    # verraet das Passwort nicht, sagt aber sofort, WAS passiert ist: gleiche Laenge heisst
    # Vertipper, unterschiedliche Laenge heisst meist ein abgeschnittener oder doppelter
    # Einfuegevorgang. Haeufigster Fall: die Zwischenablage enthaelt einen Zeilenumbruch,
    # dann beendet der schon die erste Eingabe und der Rest landet in der zweiten.
    echo >&2
    echo "Die beiden Eingaben sind nicht gleich. Nichts geaendert." >&2
    echo "  erste Eingabe:  ${#P1} Zeichen" >&2
    echo "  zweite Eingabe: ${#P2} Zeichen" >&2
    if [ ${#P1} -eq ${#P2} ]; then
      echo "  Gleiche Laenge, also vermutlich ein Vertipper. Einfach noch einmal." >&2
    else
      echo "  Unterschiedliche Laenge. Falls du eingefuegt hast: kopiere das Passwort" >&2
      echo "  noch einmal OHNE den Zeilenumbruch am Ende (im Passwortmanager die Funktion" >&2
      echo "  \"Passwort kopieren\" nutzen, nicht im Textfeld markieren)." >&2
    fi
    unset P1 P2
    exit 1
  fi

  if [ ${#P1} -lt 24 ]; then
    echo "Zu kurz (${#P1} Zeichen, mindestens 24). Nichts geaendert." >&2
    unset P1 P2
    exit 1
  fi

  printf '%s' "$P1" | $SSH "$HOST" "
    cat > /tmp/.p
    # Alte Zeile raus, neue rein. Ohne das haette die .env zwei Zeilen und
    # backup-db.sh naehme die erste, also die alte.
    sed -i '/^BACKUP_PASSPHRASE=/d' $ZIEL/.env
    printf 'BACKUP_PASSPHRASE=%s\n' \"\$(cat /tmp/.p)\" >> $ZIEL/.env
    grep -q '^BACKUP_RCLONE_ZIEL=' $ZIEL/.env || printf 'BACKUP_RCLONE_ZIEL=gdrive:$DRIVE_ORDNER\n' >> $ZIEL/.env
    shred -u /tmp/.p 2>/dev/null || rm -f /tmp/.p
    L=\$(grep -c '^BACKUP_PASSPHRASE=' $ZIEL/.env)
    N=\$(grep '^BACKUP_PASSPHRASE=' $ZIEL/.env | head -1 | cut -d= -f2- | wc -c)
    echo \"Gesetzt: \$L Eintrag, \$((N-1)) Zeichen angekommen.\"
  "
  unset P1 P2
  echo
  echo "Vergleiche die Zeichenzahl oben mit deinem Passwortmanager. Stimmt sie, ist es"
  echo "unveraendert angekommen. Der Wert selbst wurde absichtlich nirgends ausgegeben."
  ;;

vorbereiten)
  echo "==> Installiere rclone auf dem Server"
  $SSH "$HOST" 'command -v rclone >/dev/null 2>&1 || (curl -fsSL https://rclone.org/install.sh | bash >/dev/null 2>&1); rclone version | head -1'

  # HIER STAND EINMAL: Passwort auf dem Server erzeugen und ausdrucken. Das war bequem
  # und falsch. Ein Passwort, das ueber den Bildschirm geht, liegt danach im Terminal-
  # Protokoll, im Screenshot und im Zweifel in einem Chatfenster. Genau so ist es beim
  # ersten Lauf auch passiert. Das Passwort wird jetzt in "passwort-setzen" blind
  # eingegeben und nirgends ausgegeben.
  echo "==> Trage das Sicherungsziel ein"
  $SSH "$HOST" "grep -q '^BACKUP_RCLONE_ZIEL=' $ZIEL/.env || printf 'BACKUP_RCLONE_ZIEL=gdrive:$DRIVE_ORDNER\n' >> $ZIEL/.env; echo ok"

  cat <<ENDE

  ------------------------------------------------------------------
  NAECHSTER SCHRITT: das Verschluesselungspasswort festlegen.

  Erzeuge es in deinem Passwortmanager (mindestens 24 Zeichen, ohne
  \$ " ' und ohne Leerzeichen), lege es dort unter einem Namen wie
  "Toolfolio Datenbanksicherung" ab, und trage es dann hier ein:

      bash scripts/backup-offsite-einrichten.sh passwort-setzen

  Es wird beim Tippen nicht angezeigt und nirgends ausgegeben.

  Ohne dieses Passwort ist keine einzige Kopie bei Google wiederher-
  stellbar. Auch nicht von mir, auch nicht von Google.
  ------------------------------------------------------------------

  Und danach die Google-Anmeldung, die musst du machen, weil Google deinen
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
  echo "Aufruf: $0 vorbereiten | passwort-setzen | verbinden '<token>' | testen" >&2
  exit 1
  ;;
esac
