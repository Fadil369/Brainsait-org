#!/usr/bin/env bash
set -euo pipefail

if [[ $# -ne 1 ]]; then
  echo "Usage: $0 <backup-file.rdb>"
  exit 1
fi

BACKUP_FILE="$1"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if [[ ! -f "${BACKUP_FILE}" ]]; then
  echo "Backup file not found: ${BACKUP_FILE}"
  exit 1
fi

docker compose -f "${ROOT_DIR}/docker-compose.yml" down
cp "${BACKUP_FILE}" "${ROOT_DIR}/data/dump.rdb"
docker compose -f "${ROOT_DIR}/docker-compose.yml" up -d

echo "Restore completed from ${BACKUP_FILE}"
