#!/usr/bin/env bash
set -Eeuo pipefail
ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$ROOT"
required=(README.md .gitignore .env.example docker-compose.yml Makefile scripts/audit-repo.sh scripts/validate-compose.sh scripts/deploy.sh .github/workflows/ci.yml docs/deployment/staged-rollout.md apps/web/Dockerfile apps/sandbox/Dockerfile services/orchestrator/Dockerfile infra/cloudflare/README.md)
missing=0
printf 'MCORE-ONECMD-DELIVERY-001 repository audit\nRoot: %s\n\n' "$ROOT"
for path in "${required[@]}"; do
  if [[ -f "$path" ]]; then printf '[FOUND]   %s\n' "$path"
  else printf '[MISSING] %s\n' "$path"; missing=$((missing + 1)); fi
done
printf '\nMissing required files: %s\n' "$missing"
if git ls-files | grep -E '(^|/)(\.env|\.env\..+|id_rsa|.*\.pem|.*\.key)
  printf '[WARN] Potential secret-bearing filename is tracked; inspect history and contents.\n'
fi
if [[ -f docker-compose.yml ]] && command -v docker >/dev/null 2>&1; then
  docker compose --env-file .env.example -f docker-compose.yml config --quiet || { printf '[FAIL] Compose configuration is invalid.\n'; exit 2; }
  printf '[PASS] Compose configuration syntax is valid.\n'
elif ! command -v docker >/dev/null 2>&1; then
  printf '[SKIP] Docker unavailable; Compose validation not run.\n'
fi
if (( missing > 0 )); then
  printf '\n[INCOMPLETE] Import and inspect the application ZIP before build/deploy.\n'
  exit 1
fi
printf '\n[PASS] Required-file presence check passed; not production acceptance.\n'
 | grep -vE '(^|/)\.env\.example
  printf '[WARN] Potential secret-bearing filename is tracked; inspect history and contents.\n'
fi
if [[ -f docker-compose.yml ]] && command -v docker >/dev/null 2>&1; then
  docker compose --env-file .env.example -f docker-compose.yml config --quiet || { printf '[FAIL] Compose configuration is invalid.\n'; exit 2; }
  printf '[PASS] Compose configuration syntax is valid.\n'
elif ! command -v docker >/dev/null 2>&1; then
  printf '[SKIP] Docker unavailable; Compose validation not run.\n'
fi
if (( missing > 0 )); then
  printf '\n[INCOMPLETE] Import and inspect the application ZIP before build/deploy.\n'
  exit 1
fi
printf '\n[PASS] Required-file presence check passed; not production acceptance.\n'
 >/dev/null; then
  printf '[WARN] Potential secret-bearing filename is tracked; inspect history and contents.\n'
fi
if [[ -f docker-compose.yml ]] && command -v docker >/dev/null 2>&1; then
  docker compose --env-file .env.example -f docker-compose.yml config --quiet || { printf '[FAIL] Compose configuration is invalid.\n'; exit 2; }
  printf '[PASS] Compose configuration syntax is valid.\n'
elif ! command -v docker >/dev/null 2>&1; then
  printf '[SKIP] Docker unavailable; Compose validation not run.\n'
fi
if (( missing > 0 )); then
  printf '\n[INCOMPLETE] Import and inspect the application ZIP before build/deploy.\n'
  exit 1
fi
printf '\n[PASS] Required-file presence check passed; not production acceptance.\n'
