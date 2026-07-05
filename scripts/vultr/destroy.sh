#!/usr/bin/env bash
# Enclave — DESTROY the Vultr instance so billing stops. Vultr bills an instance whether
# it's powered on or off; only destroying it stops the meter. Run this after the interview.
#
# Requires: VULTR_API_KEY in the environment (source ~/.vultr-enclave.env), jq, curl.
set -euo pipefail

API="https://api.vultr.com/v2"
# Auto-load the key from the gitignored repo file if present.
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
[ -f "${REPO_ROOT}/.vultr.env" ] && set -a && . "${REPO_ROOT}/.vultr.env" && set +a
: "${VULTR_API_KEY:?Set VULTR_API_KEY (put 'VULTR_API_KEY=...' in ./.vultr.env)}"
AUTH=(-H "Authorization: Bearer ${VULTR_API_KEY}")

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
STATE_FILE="${HERE}/.instance-id"

ID="${1:-}"
if [ -z "$ID" ] && [ -f "$STATE_FILE" ]; then ID=$(cat "$STATE_FILE"); fi

if [ -z "$ID" ]; then
  echo "No instance id (arg or ${STATE_FILE}). Listing any 'enclave-demo' instances:"
  curl -fsS "${AUTH[@]}" "${API}/instances?per_page=500" \
    | jq -r '.instances[] | select(.label=="enclave-demo") | "  \(.id)  \(.main_ip)  \(.status)"'
  echo "Re-run: scripts/vultr/destroy.sh <instance-id>"
  exit 1
fi

echo "Destroying instance ${ID}…"
curl -fsS -X DELETE "${AUTH[@]}" "${API}/instances/${ID}"
rm -f "$STATE_FILE"
echo "Done. Billing for that instance has stopped."
echo "Verify in the dashboard that no instances remain: https://my.vultr.com/"
