# API keep-alive (Render free)

**Health URL:** https://jewellery-api-l84i.onrender.com/health

Render free dynos sleep after ~15 minutes idle. Ping `/health` every **10 minutes** to keep the API warm.

---

## Option A — cron-job.org (recommended external, free signup)

1. Sign up: https://cron-job.org/en/signup/
2. **Cronjobs** → **Create cronjob**
3. Title: `jewellery-api keep-alive`
4. URL: `https://jewellery-api-l84i.onrender.com/health`
5. Schedule: every **10 minutes**
6. Enable and save

No repo changes required. Confirm the job shows green after the first run.

## Option B — UptimeRobot (free signup)

1. Sign up: https://uptimerobot.com/signUp
2. **Add New Monitor** → type **HTTPS**
3. URL: `https://jewellery-api-l84i.onrender.com/health`
4. Interval: **5 minutes** (free plan minimum)
5. Create monitor

## Option C — GitHub Actions (in-repo; needs `workflow` scope to push)

Create `.github/workflows/keep-alive.yml` on `main` (paste below), or merge a PR that adds it.  
The Cloud Agent OAuth token **cannot** push workflow files (missing `workflow` scope) — a human with full `repo`+`workflow` PAT or the GitHub web UI must add this file once.

```yaml
name: API keep-alive

on:
  schedule:
    - cron: "*/10 * * * *"
  workflow_dispatch:

jobs:
  ping-health:
    runs-on: ubuntu-latest
    timeout-minutes: 3
    steps:
      - name: Curl jewellery-api /health
        run: |
          set -euo pipefail
          URL="https://jewellery-api-l84i.onrender.com/health"
          echo "Pinging $URL"
          for i in 1 2 3 4 5; do
            code=$(curl -sS -o /tmp/health.json -w "%{http_code}" --max-time 60 "$URL" || echo "000")
            echo "attempt=$i http=$code"
            cat /tmp/health.json 2>/dev/null || true
            echo
            if [ "$code" = "200" ]; then exit 0; fi
            sleep $((i * 5))
          done
          exit 1
```

After merge: **Actions** → **API keep-alive** → **Run workflow** once.  
Schedule URL: https://github.com/dineshku9095-source/jewellery-store/actions

> GitHub cron can drift on quiet repos; pair with Option A or B if you need stricter intervals.

## Option D — local / VPS cron

```bash
chmod +x scripts/keep-alive.sh
*/10 * * * * /path/to/jewellery-store/scripts/keep-alive.sh >> /tmp/qj-keepalive.log 2>&1
```

Ephemeral Cloud Agent VMs are **not** suitable for this (they shut down).

## Quick check

```bash
curl -sS https://jewellery-api-l84i.onrender.com/health
# expect: {"status":"ok","db":"ok",...}
```
