#!/usr/bin/env bash
# Sauvegarde des données à valeur probante (AD-24) : dump MariaDB + fichiers hors-webroot.
# À planifier (cron) ET à répliquer HORS o2switch. Restauration à tester avant prod.
set -euo pipefail
TS="$(date +%F-%H%M)"
DEST="${BACKUP_DIR:-./backups}"
mkdir -p "$DEST"
# Mot de passe via MYSQL_PWD (jamais en argv -> invisible dans `ps` sur hôte mutualisé partagé).
export MYSQL_PWD="${DB_PASSWORD:?}"
mysqldump --single-transaction --routines -h "${DB_HOST:?}" -u "${DB_USER:?}" "${DB_NAME:?}" | gzip > "$DEST/db-$TS.sql.gz"
unset MYSQL_PWD
tar czf "$DEST/files-$TS.tar.gz" "${FILES_DIR:-./storage}" 2>/dev/null || echo "Aucun dossier fichiers ($FILES_DIR) — ignoré"
echo "Sauvegarde -> $DEST/db-$TS.sql.gz (+ fichiers). À répliquer hors o2switch."
