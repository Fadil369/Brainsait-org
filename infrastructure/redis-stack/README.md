# BrainSAIT Self-Hosted Redis Stack

This setup gives you Redis Stack (RediSearch + RedisJSON) with:
- Search + JSON support
- persistence
- backup/restore scripts
- optional HA topology with Sentinel

## 1) Bootstrap

```bash
cd /Users/fadil369/infrastructure/redis-stack
cp .env.example .env
# edit REDIS_PASSWORD in .env
chmod +x scripts/*.sh
docker compose up -d
```

Health check:

```bash
docker exec brainsait-redis-stack redis-cli -a "$REDIS_PASSWORD" ping
```

## 2) Optional HA mode (primary + 2 replicas + 3 sentinels)

```bash
cd /Users/fadil369/infrastructure/redis-stack
cp .env.example .env
# edit REDIS_PASSWORD in .env
docker compose -f docker-compose.ha.yml up -d
```

## 3) Backups

```bash
cd /Users/fadil369/infrastructure/redis-stack
./scripts/backup.sh
./scripts/restore.sh ./backups/redis-YYYYMMDD-HHMMSS.rdb
```

## 4) Module verification

```bash
docker exec brainsait-redis-stack redis-cli -a "$REDIS_PASSWORD" MODULE LIST
```

You should see modules including search and ReJSON.

## 5) Integration env contracts

Use:
- /Users/fadil369/.env.redis-stack.global
- /Users/fadil369/sbs/.env.redis-stack
- /Users/fadil369/brainsait/.env.redis-stack
- /Users/fadil369/apps/.env.redis-stack

## 6) sbs docker override

```bash
cd /Users/fadil369/sbs
docker compose -f docker-compose.yml -f docker-compose.redis-stack.override.yml --env-file .env --env-file .env.redis-stack up -d
```

This replaces redis:7-alpine with redis-stack-server and keeps REDIS_URL-compatible wiring.

## 7) Upgrade strategy

1. Take backup (`./scripts/backup.sh`).
2. Pin next redis-stack image tag in docker-compose files.
3. Pull image and restart during maintenance window.
4. Validate with smoke tests and module list.

## 8) Security baseline

- Keep REDIS_PASSWORD strong and private.
- Bind redis ports to trusted networks only in production.
- Prefer private network exposure over public internet.
- Rotate password and restart dependents when changed.
