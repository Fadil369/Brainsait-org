#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="${ROOT_DIR}/.env"
BACKUP_DIR="${ROOT_DIR}/backups"
STAMP="$(date +%Y%m%d-%H%M%S)"
OUT_FILE="${BACKUP_DIR}/redis-${STAMP}.rdb"

if [[ -f "${ENV_FILE}" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "${ENV_FILE}"
  set +a
fi

mkdir -p "${BACKUP_DIR}"

REDIS_PASSWORD="${REDIS_PASSWORD:-}"
if [[ -z "${REDIS_PASSWORD}" ]]; then
  echo "REDIS_PASSWORD is required in .env"
  exit 1
fi

docker exec brainsait-redis-stack redis-cli -a "${REDIS_PASSWORD}" --rdb /data/backup.rdb
cp "${ROOT_DIR}/data/backup.rdb" "${OUT_FILE}"
find "${BACKUP_DIR}" -type f -name 'redis-*.rdb' -mtime +"${REDIS_DATA_RETENTION_DAYS:-7}" -delete

echo "Backup created: ${OUT_FILE}"
