#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
COMPOSE_FILE="$ROOT_DIR/deploy/docker-compose.local.yml"
COMPOSE_BUILD_FILE="$ROOT_DIR/deploy/docker-compose.build.yml"
ENV_FILE="$ROOT_DIR/.env"

usage() {
  echo "Usage: $0 {up|build|down|restart|status|logs|config}"
}

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "[ERROR] Missing required command: $1" >&2
    exit 1
  fi
}

create_env_if_missing() {
  if [[ -f "$ENV_FILE" ]]; then
    return
  fi

  require_command openssl
  local mysql_root_password mysql_password redis_password session_secret crypto_secret
  mysql_root_password="$(openssl rand -hex 24)"
  mysql_password="$(openssl rand -hex 24)"
  redis_password="$(openssl rand -hex 24)"
  session_secret="$(openssl rand -hex 32)"
  crypto_secret="$(openssl rand -hex 32)"

  umask 077
  printf '%s\n' \
    'COMPOSE_PROJECT_NAME=new-api-local' \
    'NEW_API_BIND_ADDRESS=0.0.0.0' \
    'NEW_API_PORT=7777' \
    'NEW_API_IMAGE=calciumion/new-api:v1.0.0-rc.21' \
    'LOCAL_IMAGE=new-api:local' \
    'NODE_NAME=new-api-local-1' \
    'TZ=Asia/Shanghai' \
    'MYSQL_DATABASE=new_api' \
    'MYSQL_USER=newapi' \
    "MYSQL_ROOT_PASSWORD=$mysql_root_password" \
    "MYSQL_PASSWORD=$mysql_password" \
    "REDIS_PASSWORD=$redis_password" \
    "SESSION_SECRET=$session_secret" \
    "CRYPTO_SECRET=$crypto_secret" \
    'RELAY_TIMEOUT=0' \
    'STREAMING_TIMEOUT=300' \
    'MAX_REQUEST_BODY_MB=128' \
    'STREAM_SCANNER_MAX_BUFFER_MB=128' \
    > "$ENV_FILE"
  chmod 600 "$ENV_FILE"
  echo "[OK] Created $ENV_FILE with random local secrets."
}

compose() {
  docker compose \
    --project-directory "$ROOT_DIR" \
    --env-file "$ENV_FILE" \
    -f "$COMPOSE_FILE" \
    "$@"
}

compose_build() {
  docker compose \
    --project-directory "$ROOT_DIR" \
    --env-file "$ENV_FILE" \
    -f "$COMPOSE_FILE" \
    -f "$COMPOSE_BUILD_FILE" \
    "$@"
}

check_docker() {
  require_command docker
  if ! docker compose version >/dev/null 2>&1; then
    echo "[ERROR] Docker Compose v2 is required (docker compose)." >&2
    exit 1
  fi
  if ! docker info >/dev/null 2>&1; then
    echo "[ERROR] Docker daemon is unavailable or the current user lacks permission." >&2
    exit 1
  fi
}

show_url() {
  local port
  port="$(sed -n 's/^NEW_API_PORT=//p' "$ENV_FILE" | tail -n 1)"
  port="${port:-7777}"
  echo "[OK] New API: http://localhost:$port"
}

up() {
  create_env_if_missing
  check_docker
  if ! compose up -d --wait --wait-timeout 600; then
    echo "[ERROR] Startup failed. Recent logs:" >&2
    compose ps >&2 || true
    compose logs --tail 120 new-api mysql redis >&2 || true
    exit 1
  fi
  compose ps
  show_url
}

build() {
  create_env_if_missing
  check_docker
  if ! compose_build up -d --build --wait --wait-timeout 900; then
    echo "[ERROR] Source build or startup failed. Recent logs:" >&2
    compose_build ps >&2 || true
    compose_build logs --tail 120 new-api mysql redis >&2 || true
    exit 1
  fi
  compose_build ps
  show_url
}

main() {
  local command="${1:-up}"

  case "$command" in
    up)
      up
      ;;
    build)
      build
      ;;
    down)
      create_env_if_missing
      check_docker
      compose down
      ;;
    restart)
      create_env_if_missing
      check_docker
      compose restart
      compose ps
      show_url
      ;;
    status)
      create_env_if_missing
      check_docker
      compose ps
      ;;
    logs)
      create_env_if_missing
      check_docker
      compose logs -f --tail 200 new-api
      ;;
    config)
      create_env_if_missing
      check_docker
      compose config --quiet
      compose_build config --quiet
      echo "[OK] Runtime and source-build Compose configurations are valid."
      ;;
    -h|--help|help)
      usage
      ;;
    *)
      usage >&2
      exit 2
      ;;
  esac
}

main "$@"
