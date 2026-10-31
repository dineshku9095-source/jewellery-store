#!/usr/bin/env bash
# Ping Render free API health to reduce cold starts.
# Usage: ./scripts/keep-alive.sh
# Cron example (every 10 min): */10 * * * * /path/to/scripts/keep-alive.sh
set -euo pipefail
URL="${API_HEALTH_URL:-https://jewellery-api-l84i.onrender.com/health}"
echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) ping $URL"
for i in 1 2 3 4 5; do
  code=$(curl -sS -o /tmp/jewellery-health.json -w "%{http_code}" --max-time 60 "$URL" || echo "000")
  echo "attempt=$i http=$code body=$(head -c 200 /tmp/jewellery-health.json 2>/dev/null || true)"
  if [ "$code" = "200" ]; then
    exit 0
  fi
  sleep $((i * 5))
done
echo "keep-alive failed" >&2
exit 1
