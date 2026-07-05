#!/usr/bin/env bash
# Post-deploy smoke test for Enclave.
# Verifies the app serves AND the sovereignty invariants hold.
# Usage: scripts/smoke.sh [BASE_URL]   (default http://localhost:3000)
set -euo pipefail

BASE="${1:-http://localhost:3000}"
fail() { echo "FAIL: $1" >&2; exit 1; }

echo "Smoke-testing $BASE"

curl -fsS "$BASE/api/health" | grep -q '"status":"ok"' || fail "/api/health not ok"
echo "  ok  /api/health"

for p in / /workspace /workspace/result /audit /settings; do
  code=$(curl -s -o /dev/null -w '%{http_code}' "$BASE$p")
  [ "$code" = "200" ] || fail "route $p returned $code"
  echo "  ok  $p ($code)"
done

csp=$(curl -sI "$BASE/" | tr -d '\r' | grep -i '^content-security-policy:' || true)
echo "$csp" | grep -q "connect-src 'self'" || fail "CSP 'connect-src self' missing (egress not enforced)"
echo "  ok  CSP enforces connect-src 'self'"

resp=$(curl -fsS -X POST "$BASE/api/analyze")
echo "$resp" | grep -q '"egress":"none"' || fail "analyze: egress != none"
echo "$resp" | grep -q '"externalCalls":0' || fail "analyze: externalCalls != 0"
echo "  ok  analyze: egress none, 0 external calls"

echo "PASS — Enclave is serving and the sovereignty invariants hold."
