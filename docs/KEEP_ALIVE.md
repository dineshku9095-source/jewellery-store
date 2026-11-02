# API / web keep-alive (Render free) — every 1 minute

Render **free** dynos sleep after ~15 minutes idle. That causes storefront `/api/*` **502**s until wake (30–60s).

Ping **both** services every **1 minute**:

| Job | URL |
|-----|-----|
| API | https://jewellery-api-l84i.onrender.com/health |
| Web (keeps rewrite path warm) | https://jewellery-web-3raw.onrender.com/api/settings/public |

Also fine as a third optional ping: `https://jewellery-web-3raw.onrender.com/`

---

## Option A — cron-job.org (recommended — free signup, exact 1‑minute)

### Exact clicks

1. Open **https://cron-job.org/en/signup/** → create a free account → verify email → log in.
2. Left menu → **Cronjobs** → button **+ Create cronjob** (or **Create first cronjob**).
3. **Job 1 — API**
   - **Title:** `jewellery-api health 1m`
   - **URL:** `https://jewellery-api-l84i.onrender.com/health`
   - **Schedule:** choose **Every minute** (or custom cron `* * * * *`)
   - **Request method:** GET  
   - Leave auth empty  
   - **Enable job** / **Active** = on  
   - **Create** / **Save**
4. **+ Create cronjob** again for **Job 2 — Web**
   - **Title:** `jewellery-web settings 1m`
   - **URL:** `https://jewellery-web-3raw.onrender.com/api/settings/public`
   - **Schedule:** **Every minute** (`* * * * *`)
   - GET → Save / enable
5. (Optional) Job 3 — Title `jewellery-web home 1m` → URL `https://jewellery-web-3raw.onrender.com/` → every minute.
6. Open each job → **History** / **Execution log** — confirm **HTTP 200** within a couple of minutes.

No repo changes required for this option. The Cloud Agent VM **cannot** host lasting cron.

---

## Option B — UptimeRobot (free signup; min interval 5 min)

Free plan cannot do 1 minute (minimum **5 minutes**). Use only if cron-job.org is unavailable:

1. https://uptimerobot.com/signUp  
2. **Add New Monitor** → **HTTPS** → API health URL → 5 min  
3. Second monitor → web settings URL → 5 min  

Prefer cron-job.org for true 1‑minute pings.

---

## Option C — GitHub Actions (cannot do reliable 1‑minute)

GitHub scheduled workflows minimum practical interval is ~5–10 minutes and drifts. Not enough to stop Render free sleep. Prefer Option A. YAML for optional ~10‑min backup is in git history / ask if needed.

---

## Option D — local / VPS cron (1 minute)

```bash
chmod +x scripts/keep-alive.sh
* * * * * /path/to/jewellery-store/scripts/keep-alive.sh >> /tmp/qj-keepalive.log 2>&1
```

Ephemeral Cloud Agent VMs are **not** suitable.

---

## Quick check

```bash
./scripts/keep-alive.sh
# or:
curl -sS https://jewellery-api-l84i.onrender.com/health
curl -sS -o /dev/null -w "%{http_code}\n" https://jewellery-web-3raw.onrender.com/api/settings/public
curl -sS -o /dev/null -w "%{http_code}\n" https://jewellery-web-3raw.onrender.com/shop
```

Expect health JSON with `"status":"ok","db":"ok"` and HTTP 200 on web URLs.
