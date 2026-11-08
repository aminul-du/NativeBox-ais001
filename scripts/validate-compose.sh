#!/usr/bin/env bash
set -Eeuo pipefail
ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$ROOT"
command -v docker >/dev/null 2>&1 || { echo "ERROR: Docker is required." >&2; exit 2; }
[[ -f docker-compose.yml ]] || { echo "ERROR: docker-compose.yml not found." >&2; exit 2; }
ENV_FILE="${1:-.env.example}"
[[ -f "$ENV_FILE" ]] || { echo "ERROR: env file '$ENV_FILE' not found." >&2; exit 2; }
docker compose --env-file "$ENV_FILE" -f docker-compose.yml config --quiet
echo "PASS: Compose model validates; no containers were started."
