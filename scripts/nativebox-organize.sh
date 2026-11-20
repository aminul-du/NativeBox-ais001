#!/usr/bin/env bash
set -Eeuo pipefail

ROOT="/srv/mcore/shorbornoBD-NativeBox"

echo "SHORBORNO NATIVEBOX ORGANIZATION PREFLIGHT"
echo "Root: $ROOT"

if [[ ! -d "$ROOT/.git" ]]; then
    echo "ERROR: Git repository unavailable."
    exit 1
fi

echo
echo "Existing source and candidate files:"
cat "$ROOT/registry/local-migration-manifest.tsv"

echo
echo "This script is intentionally non-destructive."
echo "It does not move files, follow symlinks, alter DNS,"
echo "modify Cloudflare Tunnel, commit or deploy."
echo
echo "Review each migration candidate before authorizing migration."
