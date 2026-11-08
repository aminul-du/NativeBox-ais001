#!/usr/bin/env bash
set -Eeuo pipefail
ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$ROOT"
MODE="${1:---preflight}"
case "$MODE" in
  --preflight)
    echo "Preflight only; no services will be started."
    ./scripts/validate-compose.sh .env.example
    ./scripts/audit-repo.sh || { echo "Repository incomplete. Deployment blocked." >&2; exit 1; }
    echo "Preflight complete. No deployment performed."
    ;;
  --apply)
    [[ "${MCORE_DEPLOY_APPROVED:-}" == "YES" ]] || { echo "Blocked: separate explicit AIS approval is required." >&2; exit 3; }
    [[ -f .env ]] || { echo "Blocked: local .env is required." >&2; exit 3; }
    [[ -z "$(git status --porcelain)" ]] || { echo "Blocked: working tree must be clean." >&2; exit 3; }
    read -r -p "Type AIS-APPROVE to start the approved deployment: " approval
    [[ "$approval" == "AIS-APPROVE" ]] || { echo "Cancelled."; exit 4; }
    ./scripts/audit-repo.sh
    ./scripts/validate-compose.sh .env
    docker compose --env-file .env -f docker-compose.yml up -d --build
    echo "Compose command completed. Production is not accepted until external checks pass."
    ;;
  *)
    echo "Usage: scripts/deploy.sh [--preflight|--apply]" >&2; exit 2
    ;;
esac
