#!/usr/bin/env bash
set -Eeuo pipefail
ARCHIVE="${1:-}"
[[ -n "$ARCHIVE" && -f "$ARCHIVE" ]] || {
  echo "Usage: bash scripts/audit-zip.sh /path/to/mcore-architecture.zip" >&2
  exit 2
}
command -v unzip >/dev/null 2>&1 || { echo "unzip is required." >&2; exit 2; }
command -v sha256sum >/dev/null 2>&1 || { echo "sha256sum is required." >&2; exit 2; }
echo "Archive: $ARCHIVE"
sha256sum "$ARCHIVE"
tmp="$(mktemp)"
trap 'rm -f "$tmp"' EXIT
unzip -Z1 "$ARCHIVE" > "$tmp"
printf '\nEntry count: '
wc -l < "$tmp"
unsafe=0
while IFS= read -r path; do
  case "$path" in
    /*|../*|*/../*|*/..)
      printf '[UNSAFE PATH] %s\n' "$path"; unsafe=1 ;;
  esac
  case "$path" in
    .env|*/.env|.env.*|*/.env.*|*.pem|*.key|*/id_rsa|*/id_ed25519)
      printf '[REVIEW SECRET-LIKE FILE] %s\n' "$path" ;;
  esac
done < "$tmp"
echo
echo "Top-level paths:"
awk -F/ 'NF { print $1 }' "$tmp" | sort -u
if (( unsafe )); then
  echo "REJECT: unsafe archive paths found. Do not extract this archive." >&2
  exit 3
fi
echo "Inventory complete. No extraction performed; review secret-like paths manually."
