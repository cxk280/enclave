#!/usr/bin/env bash
# Enclave — provision a small Vultr Cloud Compute instance in Johannesburg (sovereign
# region), bootstrap Docker + the app via cloud-init, and wait until it's serving.
#
# Cost control: this creates ONE small instance and nothing else (no reserved IP, no
# snapshot, no registry). Run scripts/vultr/destroy.sh to stop all billing.
#
# Requires: VULTR_API_KEY in the environment (source ~/.vultr-enclave.env), jq, curl.
set -euo pipefail

API="https://api.vultr.com/v2"
# Auto-load the key from the gitignored repo file if present.
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
[ -f "${REPO_ROOT}/.vultr.env" ] && set -a && . "${REPO_ROOT}/.vultr.env" && set +a
: "${VULTR_API_KEY:?Set VULTR_API_KEY (put 'VULTR_API_KEY=...' in ./.vultr.env)}"
AUTH=(-H "Authorization: Bearer ${VULTR_API_KEY}" -H "Content-Type: application/json")

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LABEL="enclave-demo"
REGION="jnb"                       # Johannesburg — the sovereign region the demo asserts
SSH_KEY_PUB="${SSH_KEY_PUB:-$HOME/.ssh/id_ed25519.pub}"
STATE_FILE="${HERE}/.instance-id" # destroy.sh reads this

say() { printf '\n\033[1;32m==>\033[0m %s\n' "$*"; }
api() { curl -fsS "${AUTH[@]}" "$@"; }

# --- validate the sovereign region exists ---
say "Checking region '${REGION}' is available…"
api "${API}/regions" | jq -e --arg r "$REGION" '.regions[] | select(.id==$r)' >/dev/null \
  || { echo "Region ${REGION} not found on this account"; exit 1; }

# --- pick the cheapest plan (>=1GB) available in the region ---
say "Selecting the cheapest suitable plan in ${REGION}…"
PLAN=$(api "${API}/plans?type=all&per_page=500" | jq -r --arg r "$REGION" '
  [ .plans[]
    | select(.locations | index($r))
    | select(.ram >= 1024 and .ram <= 2048)
  ] | sort_by(.monthly_cost)[0].id')
[ -n "$PLAN" ] && [ "$PLAN" != "null" ] || { echo "No 1-2GB plan in ${REGION}"; exit 1; }
PLAN_COST=$(api "${API}/plans?type=all&per_page=500" | jq -r --arg p "$PLAN" \
  '.plans[] | select(.id==$p) | "\(.vcpu_count) vCPU / \(.ram)MB — $\(.monthly_cost)/mo"')
echo "    plan: ${PLAN} (${PLAN_COST})"

# --- Ubuntu 24.04 LTS os_id ---
say "Finding Ubuntu 24.04 LTS image…"
OS_ID=$(api "${API}/os?per_page=500" | jq -r \
  '[.os[] | select(.family=="ubuntu" and (.name|test("24.04")))][0].id')
[ -n "$OS_ID" ] && [ "$OS_ID" != "null" ] || { echo "Ubuntu 24.04 not found"; exit 1; }
echo "    os_id: ${OS_ID}"

# --- register the SSH key (idempotent) for debug access ---
say "Registering SSH key for debug access…"
PUB=$(cat "$SSH_KEY_PUB")
SSH_KEY_ID=$(api "${API}/ssh-keys?per_page=500" | jq -r --arg k "$PUB" \
  '.ssh_keys[] | select(.ssh_key==$k) | .id' | head -1)
if [ -z "$SSH_KEY_ID" ]; then
  SSH_KEY_ID=$(api -X POST "${API}/ssh-keys" \
    -d "$(jq -n --arg name "enclave-demo" --arg key "$PUB" '{name:$name, ssh_key:$key}')" \
    | jq -r '.ssh_key.id')
fi
echo "    ssh_key_id: ${SSH_KEY_ID}"

# --- create the instance ---
say "Creating instance (${LABEL}) in ${REGION}…"
USER_DATA=$(base64 < "${HERE}/cloud-init.sh" | tr -d '\n')
BODY=$(jq -n \
  --arg region "$REGION" --arg plan "$PLAN" --argjson os "$OS_ID" \
  --arg label "$LABEL" --arg hostname "enclave" \
  --arg ud "$USER_DATA" --arg sshid "$SSH_KEY_ID" '
  { region:$region, plan:$plan, os_id:$os, label:$label, hostname:$hostname,
    user_data:$ud, sshkey_id:[$sshid], backups:"disabled" }')
INSTANCE=$(api -X POST "${API}/instances" -d "$BODY")
ID=$(echo "$INSTANCE" | jq -r '.instance.id')
echo "$ID" > "$STATE_FILE"
echo "    instance id: ${ID}  (saved to ${STATE_FILE})"

# --- wait for an IP + active status ---
say "Waiting for the instance to boot…"
IP=""
for i in $(seq 1 40); do
  INFO=$(api "${API}/instances/${ID}")
  STATUS=$(echo "$INFO" | jq -r '.instance.status')
  IP=$(echo "$INFO" | jq -r '.instance.main_ip')
  if [ "$STATUS" = "active" ] && [ "$IP" != "0.0.0.0" ] && [ -n "$IP" ]; then break; fi
  printf '    …status=%s ip=%s\n' "$STATUS" "$IP"; sleep 10
done
echo "    IP: ${IP}"

# --- wait for the app (cloud-init installs Docker + builds the image: ~3-6 min) ---
say "Waiting for Enclave to come up at http://${IP} (build takes a few minutes)…"
for i in $(seq 1 60); do
  if curl -fsS "http://${IP}/api/health" 2>/dev/null | grep -q '"status":"ok"'; then
    say "LIVE:  http://${IP}"
    echo "  health : http://${IP}/api/health"
    echo "  ssh    : ssh root@${IP}   (build log: /var/log/enclave-bootstrap.log)"
    echo "  DESTROY: scripts/vultr/destroy.sh   ← run this after the interview"
    exit 0
  fi
  printf '    …still building (%d/60)\n' "$i"; sleep 15
done

echo "Timed out waiting for health. SSH in to check: ssh root@${IP}  then: cat /var/log/enclave-bootstrap.log"
exit 1
