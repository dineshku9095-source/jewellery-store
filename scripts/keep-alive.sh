#!/usr/bin/env bash
# Ping Render free API + web every run (use cron every 1 minute).
# Usage: ./scripts/keep-alive.sh
# Cron: * * * * * /path/to/scripts/keep-alive.sh >> /tmp/qj-keepalive.log 2>&1
set -euo pipefail

API_URL="${API_HEALTH_URL:-https://jewellery-api-l84i.onrender.com/health}"
WEB_URL="${WEB_KEEPALIVE_URL:-https://jewellery-web-3raw.onrender.com/api/settings/public}"
HOME_URL="${WEB_HOME_URL:-https://jewellery-web-3raw.onrender.com/}"

ping_one() {
  local name="$1" url="$2"
  echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) [$name] $url"
  local code=000
  for i in 1 2 3 4 5; do
    code=$(curl -sS -o /tmp/qj-ka-${name}.body -w "%{http_code}" --max-time 60 "$url" || echo "000")
    echo "  attempt=$i http=$code body=$(head -c 160 /tmp/qj-ka-${name}.body 2>/dev/null || true)"
    if [ "$code" = "200" ]; then
      return 0
    fi
    sleep $((i * 3))
  done
  echo "  FAILED $name" >&2
  return 1
}

fail=0
ping_one api "$API_URL" || fail=1
ping_one web "$WEB_URL" || fail=1
# Best-effort home ping (does not fail the script alone)
ping_one home "$HOME_URL" || true

exit "$fail"
