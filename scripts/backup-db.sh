#!/usr/bin/env bash
#
# INFRA-3: Naechtliche Sicherung der Supabase-Datenbank, 7 Tage rollierend.
#
# Laeuft AUF DEM SERVER per Cron. Sieben Dateien, benannt nach dem Wochentag:
# der Montag dieser Woche ueberschreibt den Montag der Vorwoche. Damit liegen immer
# genau sieben Tage vor, ohne dass jemand aufraeumen muss.
#
#   /opt/toolfolio/backups/1-montag.sql.gz ... 7-sonntag.sql.gz
#
# ---------------------------------------------------------------------------
# DIE WICHTIGSTE REGEL, und sie steckt in der Reihenfolge:
# Es wird IMMER erst in eine .tmp-Datei geschrieben und diese GEPRUEFT. Erst wenn sie
# heil ist, ersetzt sie die Datei des Wochentags. Ohne das wuerde eine abgebrochene
# oder leere Sicherung die letzte GUTE Sicherung desselben Wochentags ueberschreiben,
# und das faellt genau dann auf, wenn man sie braucht.
# ---------------------------------------------------------------------------
#
# Geprueft wird viererlei: Exit-Code von pg_dump, Unversehrtheit des gzip, eine
# Mindestgroesse und ob wirklich Tabellen drinstehen. Ein Dump, der 200 Byte gross ist
# und "permission denied" enthaelt, hat auch einen Exit-Code 0.
#
# Das Ergebnis landet in public.system_backup (im Admin-Backend sichtbar). Schlaegt
# etwas fehl, geht zusaetzlich eine Mail raus.
#
# ---------------------------------------------------------------------------
# ZWEITE STUFE: verschluesselte Kopie an einen zweiten Ort (Google Drive).
#
# Sicherungen, die nur auf dem VPS liegen, sterben mit dem VPS. Deshalb wandert nach
# jeder GEPRUEFTEN Sicherung eine Kopie zu einem zweiten Anbieter, mit denselben sieben
# Wochentags-Namen, also derselben Rotation.
#
# Sie wird VORHER verschluesselt, und zwar hier auf dem Server. Der Dump enthaelt
# auth.users mit allen E-Mail-Adressen, Abos mit Kosten und die Anfragen mit Namen und
# Kontaktdaten. Das ist der personenbezogenste Datensatz, den es bei uns gibt. Beim
# Anbieter darf davon nichts lesbar ankommen.
#
# WICHTIG, und das ist keine Nebensache: Das Passwort steht in der .env auf DIESEM
# Server. Stirbt der Server und existiert das Passwort nur hier, sind alle Zweitkopien
# unlesbar. Es gehoert zusaetzlich in einen Passwortmanager. Ohne das ist diese ganze
# Stufe wertlos.
#
# Wiederherstellen einer Zweitkopie (auf irgendeinem Rechner mit rclone und openssl):
#   rclone copy gdrive:Toolfolio-Sicherungen/3-mittwoch.sql.gz.enc .
#   openssl enc -d -aes-256-cbc -pbkdf2 -iter 600000 -salt \
#     -in 3-mittwoch.sql.gz.enc -out 3-mittwoch.sql.gz -pass pass:DASPASSWORT
#   gunzip -c 3-mittwoch.sql.gz | psql "<ziel-datenbank-url>"
# ---------------------------------------------------------------------------

set -uo pipefail

ZIEL="/opt/toolfolio/backups"
ENV_DATEI="/opt/toolfolio/.env"
# pg_dump per Docker: der Server hat keinen Postgres-Client, und so ist die Version
# unabhaengig vom Betriebssystem festgelegt. 17 kann auch aeltere Server dumpen.
PG_IMAGE="postgres:17-alpine"
# --network host ist hier NICHT optional, sondern der Unterschied zwischen laeuft und
# laeuft nicht: Supabase loest die direkte Datenbank-Adresse nur noch nach IPv6 auf. Der
# Server kann IPv6, das Standard-Docker-Netz nicht. Ohne das scheitert jeder Lauf mit
# "Network unreachable", und zwar jede Nacht gleich.
PG_NETZ="--network host"
MIN_BYTES=20000        # Darunter stimmt etwas nicht, selbst eine leere App ist groesser.
MAIL_AN="markus.laue@ommm.de"

mkdir -p "$ZIEL"

# Werte gezielt herausschneiden. Die .env ist eine Compose-Datei, kein Shell-Skript:
# sourcen wuerde an Werten wie "EMAIL_FROM=Toolfolio <...>" abbrechen.
wert() { grep -E "^$1=" "$ENV_DATEI" | head -1 | cut -d= -f2-; }
DB_URL="$(wert SUPABASE_DB_URL)"
RESEND="$(wert RESEND_API_KEY)"
# Zweitablage. Beide leer = keine Zweitkopie, das ist ein gueltiger Zustand.
BACKUP_PASSPHRASE="$(wert BACKUP_PASSPHRASE)"
RCLONE_ZIEL="$(wert BACKUP_RCLONE_ZIEL)"   # z. B. gdrive:Toolfolio-Sicherungen

TAG_NR="$(date +%u)"                       # 1 = Montag ... 7 = Sonntag
case "$TAG_NR" in
  1) TAG_NAME=montag ;;  2) TAG_NAME=dienstag ;; 3) TAG_NAME=mittwoch ;;
  4) TAG_NAME=donnerstag ;; 5) TAG_NAME=freitag ;; 6) TAG_NAME=samstag ;;
  *) TAG_NAME=sonntag ;;
esac
DATEI="$ZIEL/${TAG_NR}-${TAG_NAME}.sql.gz"
TMP="$DATEI.tmp"

START=$(date +%s)
FEHLER=""
TABELLEN=0
GROESSE=0
OFFSITE_OK=NULL       # NULL = keine Zweitablage eingerichtet
OFFSITE_BYTES=0
OFFSITE_FEHLER=""

# $2 optional: "zweitkopie" fuer den Fall, dass NUR der Upload scheiterte. Der Betreff
# muss den Unterschied hergeben. "Sicherung fehlgeschlagen" zu schreiben, wenn die
# Sicherung heil auf dem Server liegt, waere ein Fehlalarm, und Fehlalarme sind der
# schnellste Weg dahin, dass niemand mehr hinsieht.
melde_fehler() {
  local text="$1" art="${2:-sicherung}" betreff nachricht
  echo "FEHLER: $text" >&2
  if [ "$art" = "zweitkopie" ]; then
    betreff="Zweitkopie der Sicherung fehlgeschlagen ($TAG_NAME)"
    nachricht="Die Sicherung auf dem Server ist in Ordnung. Nur die verschluesselte Kopie an den zweiten Ort hat nicht geklappt."
  else
    betreff="Datenbanksicherung fehlgeschlagen ($TAG_NAME)"
    nachricht="Die naechtliche Sicherung ist fehlgeschlagen. Die letzte gute Sicherung dieses Wochentags wurde NICHT ueberschrieben."
  fi
  # Mail, damit ein Ausfall nicht still bleibt. Ohne Schluessel wenigstens ins Log.
  if [ -n "$RESEND" ]; then
    curl -s -X POST "https://api.resend.com/emails" \
      -H "Authorization: Bearer $RESEND" -H "Content-Type: application/json" \
      -d "$(printf '{"from":"Toolfolio <fristen@toolfolio.de>","to":["%s"],"subject":"%s","text":"%s\n\nTag: %s\nDatei: %s\n\nGrund:\n%s"}' \
        "$MAIL_AN" "$betreff" "$nachricht" "$TAG_NAME" "$DATEI" "$text")" >/dev/null
  fi
}

# Status in die Datenbank schreiben. Geht nur, wenn die Datenbank erreichbar ist,
# und genau das ist der Normalfall. Ist sie es nicht, traegt die Mail die Nachricht.
sql_text() {   # Text als SQL-Literal, oder NULL wenn leer. Apostrophe raus, damit nichts bricht.
  [ -z "$1" ] && { echo NULL; return; }
  printf "'%s'" "$(echo "$1" | tr "'" ' ' | head -c 500)"
}

schreibe_status() {
  local ok="$1" fehler="$2" dauer="$3"
  local sql
  sql=$(printf "insert into public.system_backup (wochentag, datei, ok, groesse_bytes, dauer_sekunden, tabellen, fehler, offsite_ok, offsite_ziel, offsite_bytes, offsite_fehler) values (%s, '%s', %s, %s, %s, %s, %s, %s, %s, %s, %s);" \
    "$TAG_NR" "$(basename "$DATEI")" "$ok" "${GROESSE:-0}" "$dauer" "$TABELLEN" \
    "$(sql_text "$fehler")" \
    "${OFFSITE_OK:-NULL}" "$(sql_text "$RCLONE_ZIEL")" "${OFFSITE_BYTES:-0}" "$(sql_text "${OFFSITE_FEHLER:-}")")
  docker run --rm $PG_NETZ -i "$PG_IMAGE" psql "$DB_URL" -v ON_ERROR_STOP=1 -c "$sql" >/dev/null 2>&1 || true
}

if [ -z "$DB_URL" ]; then
  melde_fehler "SUPABASE_DB_URL fehlt in $ENV_DATEI."
  exit 1
fi

echo "==> Sichere nach $DATEI"

# --no-owner/--no-privileges: der Dump soll auf JEDER Datenbank einspielbar sein, nicht
# nur auf einer mit identischen Rollen. --schema: public sind unsere Daten, auth sind die
# Konten (ohne die waere eine Wiederherstellung wertlos), storage die Datei-Metadaten.
if ! docker run --rm $PG_NETZ "$PG_IMAGE" pg_dump "$DB_URL" \
      --no-owner --no-privileges --quote-all-identifiers \
      --schema=public --schema=auth --schema=storage \
      2>/tmp/backup-fehler.log | gzip -9 > "$TMP"; then
  FEHLER="pg_dump fehlgeschlagen: $(tail -3 /tmp/backup-fehler.log | tr '\n' ' ')"
fi

# --- Pruefungen. Erst wenn alle bestehen, ersetzt die Datei die alte. ---
if [ -z "$FEHLER" ]; then
  GROESSE=$(stat -c%s "$TMP" 2>/dev/null || echo 0)
  if [ "$GROESSE" -lt "$MIN_BYTES" ]; then
    FEHLER="Sicherung ist nur $GROESSE Byte gross, das kann nicht stimmen."
  fi
fi
if [ -z "$FEHLER" ] && ! gzip -t "$TMP" 2>/dev/null; then
  FEHLER="Die gzip-Datei ist beschaedigt."
fi
if [ -z "$FEHLER" ]; then
  TABELLEN=$(zcat "$TMP" | grep -c "^CREATE TABLE" || true)
  if [ "$TABELLEN" -lt 5 ]; then
    FEHLER="Nur $TABELLEN Tabellen im Dump. Erwartet werden deutlich mehr."
  fi
fi

DAUER=$(( $(date +%s) - START ))

if [ -n "$FEHLER" ]; then
  rm -f "$TMP"
  melde_fehler "$FEHLER"
  schreibe_status false "$FEHLER" "$DAUER"
  exit 1
fi

# Jetzt erst ueberschreiben. mv ist atomar: es gibt keinen Moment, in dem die Datei
# halb geschrieben dasteht.
mv -f "$TMP" "$DATEI"

echo "==> OK: $(numfmt --to=iec "$GROESSE" 2>/dev/null || echo "$GROESSE B"), $TABELLEN Tabellen, ${DAUER}s"

# ---------------------------------------------------------------------------
# Zweite Stufe: verschluesselte Kopie zum zweiten Ort.
#
# Sie laeuft NUR hier, also nachdem die lokale Sicherung geprueft und heil ist. Eine
# kaputte Datei zu verschluesseln und hochzuladen, wuerde die letzte gute Zweitkopie
# desselben Wochentags ueberschreiben. Derselbe Fehler wie oben, nur teurer.
#
# Ein Scheitern hier macht den Lauf NICHT ungueltig: die lokale Sicherung ist gut. Es
# wird aber protokolliert und gemeldet, damit es nicht monatelang still bleibt.
# ---------------------------------------------------------------------------
if [ -n "$BACKUP_PASSPHRASE" ] && [ -n "$RCLONE_ZIEL" ]; then
  ENC="$DATEI.enc.tmp"
  export BACKUP_PASSPHRASE

  echo "==> Verschluessele und lade nach $RCLONE_ZIEL"

  if ! command -v rclone >/dev/null 2>&1; then
    OFFSITE_FEHLER="rclone ist nicht installiert."
  # AES-256 mit PBKDF2 und hoher Iterationszahl: das Passwort wird nicht direkt als
  # Schluessel benutzt, sondern gestreckt. Ohne -iter waere ein schwaches Passwort schnell
  # zu knacken. -pass env: statt -pass pass:, damit es nicht in der Prozessliste steht.
  elif ! openssl enc -aes-256-cbc -pbkdf2 -iter 600000 -salt \
        -in "$DATEI" -out "$ENC" -pass env:BACKUP_PASSPHRASE 2>/dev/null; then
    OFFSITE_FEHLER="Verschluesselung fehlgeschlagen."
  # GEGENPROBE, und die ist der Punkt: einmal zurueckentschluesseln und das Ergebnis
  # durch gzip -t schicken. Eine verschluesselte Datei, die sich nicht mehr oeffnen
  # laesst, sieht von aussen genauso aus wie eine gute. Das faellt sonst erst im Ernstfall auf.
  elif ! openssl enc -d -aes-256-cbc -pbkdf2 -iter 600000 -salt \
        -in "$ENC" -pass env:BACKUP_PASSPHRASE 2>/dev/null | gzip -t 2>/dev/null; then
    OFFSITE_FEHLER="Die verschluesselte Datei laesst sich nicht wieder entschluesseln."
  else
    ZIELNAME="${TAG_NR}-${TAG_NAME}.sql.gz.enc"
    if ! rclone copyto "$ENC" "$RCLONE_ZIEL/$ZIELNAME" \
          --config /root/.config/rclone/rclone.conf \
          --retries 3 --low-level-retries 5 --timeout 10m 2>/tmp/rclone-fehler.log; then
      OFFSITE_FEHLER="Upload fehlgeschlagen: $(tail -2 /tmp/rclone-fehler.log | tr '\n' ' ')"
    else
      # Nachsehen, ob drueben wirklich etwas liegt, und zwar in der richtigen Groesse.
      # "rclone sagt ok" ist eine Behauptung, die Groesse drueben ist ein Beleg.
      LOKAL=$(stat -c%s "$ENC" 2>/dev/null || echo 0)
      FERN=$(rclone size "$RCLONE_ZIEL/$ZIELNAME" --json --config /root/.config/rclone/rclone.conf 2>/dev/null \
             | grep -o '"bytes":[0-9]*' | cut -d: -f2)
      if [ "${FERN:-0}" != "$LOKAL" ]; then
        OFFSITE_FEHLER="Kopie am Ziel ist ${FERN:-0} Byte statt $LOKAL Byte."
      else
        OFFSITE_OK=true
        OFFSITE_BYTES="$LOKAL"
        echo "==> Zweitkopie OK: $(numfmt --to=iec "$LOKAL" 2>/dev/null || echo "$LOKAL B") verschluesselt"
      fi
    fi
  fi

  rm -f "$ENC"
  unset BACKUP_PASSPHRASE

  if [ -n "$OFFSITE_FEHLER" ]; then
    OFFSITE_OK=false
    echo "WARNUNG Zweitkopie: $OFFSITE_FEHLER" >&2
    melde_fehler "$OFFSITE_FEHLER" zweitkopie
  fi
elif [ -n "$BACKUP_PASSPHRASE" ] || [ -n "$RCLONE_ZIEL" ]; then
  # Nur eines von beiden gesetzt: halb eingerichtet ist hier schlimmer als gar nicht,
  # weil es nach Zweitkopie aussieht und keine ist.
  OFFSITE_OK=false
  OFFSITE_FEHLER="Zweitablage nur halb eingerichtet: BACKUP_PASSPHRASE und BACKUP_RCLONE_ZIEL muessen beide gesetzt sein."
  echo "WARNUNG: $OFFSITE_FEHLER" >&2
fi

# Dauer inklusive Verschluesselung und Upload, sonst zeigt das Backend eine Zahl,
# die nicht zu dem passt, was der Lauf tatsaechlich gebraucht hat.
DAUER=$(( $(date +%s) - START ))
schreibe_status true "" "$DAUER"

# Aufraeumen: alles, was nicht zu den sieben Wochentagen gehoert (etwa Reste alter
# Laeufe), verschwindet. Die sieben selbst werden nie geloescht, nur ueberschrieben.
find "$ZIEL" -maxdepth 1 -name "*.tmp" -mtime +1 -delete 2>/dev/null || true
