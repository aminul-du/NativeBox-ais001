#!/usr/bin/env bash
set -Eeuo pipefail
ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$ROOT"
MODE="${1:---preflight}"

require_approved_release() {
  [[ "${MCORE_DEPLOY_APPROVED:-}" == "YES" ]] || {
    echo "Blocked: separate explicit AIS release approval is required." >&2; exit 3;
  }
  [[ -f .env ]] || { echo "Blocked: local .env is required." >&2; exit 3; }
  [[ -z "$(git status --porcelain)" ]] || {
    echo "Blocked: working tree must be clean and release commit recorded." >&2; exit 3;
  }
  if grep -Eq '^(POSTGRES_PASSWORD=REPLACE_WITH_A_LONG_RANDOM_SECRET|POSTGRES_PASSWORD=local-only-not-for-production)$' .env; then
    echo "Blocked: replace the example database password with a generated secret." >&2; exit 3
  fi
}

case "$MODE" in
  --preflight)
    echo "Preflight only; no services will be started."
    bash scripts/validate-compose.sh .env.example
    bash scripts/audit-repo.sh || { echo "Repository incomplete. Deployment blocked." >&2; exit 1; }
    echo "Preflight complete. No deployment performed."
    ;;
  --apply)
    require_approved_release
    read -r -p "Type AIS-APPROVE-LOCAL to start the approved local/staging stack: " approval
    [[ "$approval" == "AIS-APPROVE-LOCAL" ]] || { echo "Cancelled."; exit 4; }
    bash scripts/audit-repo.sh
    bash scripts/validate-compose.sh .env
    docker compose --env-file .env -f docker-compose.yml up -d --build
    echo "Local/staging Compose command completed. Cloudflare edge profile was not started."
    ;;
  --publish-edge)
    require_approved_release
    [[ "${MCORE_PUBLIC_ROUTE_APPROVED:-}" == "YES" ]] || {
      echo "Blocked: explicit approval for public edge exposure is required." >&2; exit 3;
    }
    [[ "${MCORE_APPROVED_HOSTNAME:-}" == "ais.shorborno.ai" ]] || {
      echo "Blocked: set MCORE_APPROVED_HOSTNAME=ais.shorborno.ai only after verifying the intended route." >&2; exit 3;
    }
    grep -Eq '^CLOUDFLARE_TUNNEL_TOKEN=.{20,}$' .env || {
      echo "Blocked: Cloudflare Tunnel token missing or too short." >&2; exit 3;
    }
    read -r -p "Type PUBLISH ais.shorborno.ai to start the approved edge connector: " approval
    [[ "$approval" == "PUBLISH ais.shorborno.ai" ]] || { echo "Cancelled."; exit 4; }
    bash scripts/validate-compose.sh .env
    docker compose --env-file .env --profile edge -f docker-compose.yml up -d cloudflared
    echo "Edge connector command completed. Verify Cloudflare route and Access policy independently."
    ;;
  *)
    echo "Usage: bash scripts/deploy.sh [--preflight|--apply|--publish-edge]" >&2; exit 2
    ;;
esac
