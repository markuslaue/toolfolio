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

set -uo pipefail

ZIEL="/opt/toolfolio/backups"
ENV_DATEI="/opt/toolfolio/.env"
# pg_dump per Docker: der Server hat keinen Postgres-Client, und so ist die Version
# unabhaengig vom Betriebssystem festgelegt. 17 kann auch aeltere Server dumpen.
PG_IMAGE="postgres:17-alpine"
MIN_BYTES=20000        # Darunter stimmt etwas nicht, selbst eine leere App ist groesser.
MAIL_AN="markus.laue@ommm.de"

mkdir -p "$ZIEL"

# Werte gezielt herausschneiden. Die .env ist eine Compose-Datei, kein Shell-Skript:
# sourcen wuerde an Werten wie "EMAIL_FROM=Toolfolio <...>" abbrechen.
wert() { grep -E "^$1=" "$ENV_DATEI" | head -1 | cut -d= -f2-; }
DB_URL="$(wert SUPABASE_DB_URL)"
RESEND="$(wert RESEND_API_KEY)"

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

melde_fehler() {
  local text="$1"
  echo "FEHLER: $text" >&2
  # Mail, damit ein Ausfall nicht still bleibt. Ohne Schluessel wenigstens ins Log.
  if [ -n "$RESEND" ]; then
    curl -s -X POST "https://api.resend.com/emails" \
      -H "Authorization: Bearer $RESEND" -H "Content-Type: application/json" \
      -d "$(printf '{"from":"Toolfolio <fristen@toolfolio.de>","to":["%s"],"subject":"Datenbanksicherung fehlgeschlagen (%s)","text":"Die naechtliche Sicherung ist fehlgeschlagen.\n\nTag: %s\nDatei: %s\n\nGrund:\n%s\n\nDie letzte gute Sicherung dieses Wochentags wurde NICHT ueberschrieben."}' \
        "$MAIL_AN" "$TAG_NAME" "$TAG_NAME" "$DATEI" "$text")" >/dev/null
  fi
}

# Status in die Datenbank schreiben. Geht nur, wenn die Datenbank erreichbar ist,
# und genau das ist der Normalfall. Ist sie es nicht, traegt die Mail die Nachricht.
schreibe_status() {
  local ok="$1" fehler="$2" dauer="$3"
  local sql
  sql=$(printf "insert into public.system_backup (wochentag, datei, ok, groesse_bytes, dauer_sekunden, tabellen, fehler) values (%s, '%s', %s, %s, %s, %s, %s);" \
    "$TAG_NR" "$(basename "$DATEI")" "$ok" "${GROESSE:-0}" "$dauer" "$TABELLEN" \
    "$([ -z "$fehler" ] && echo NULL || printf "'%s'" "$(echo "$fehler" | tr "'" ' ' | head -c 500)")")
  docker run --rm -i "$PG_IMAGE" psql "$DB_URL" -v ON_ERROR_STOP=1 -c "$sql" >/dev/null 2>&1 || true
}

if [ -z "$DB_URL" ]; then
  melde_fehler "SUPABASE_DB_URL fehlt in $ENV_DATEI."
  exit 1
fi

echo "==> Sichere nach $DATEI"

# --no-owner/--no-privileges: der Dump soll auf JEDER Datenbank einspielbar sein, nicht
# nur auf einer mit identischen Rollen. --schema: public sind unsere Daten, auth sind die
# Konten (ohne die waere eine Wiederherstellung wertlos), storage die Datei-Metadaten.
if ! docker run --rm "$PG_IMAGE" pg_dump "$DB_URL" \
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
schreibe_status true "" "$DAUER"

# Aufraeumen: alles, was nicht zu den sieben Wochentagen gehoert (etwa Reste alter
# Laeufe), verschwindet. Die sieben selbst werden nie geloescht, nur ueberschrieben.
find "$ZIEL" -maxdepth 1 -name "*.tmp" -mtime +1 -delete 2>/dev/null || true
