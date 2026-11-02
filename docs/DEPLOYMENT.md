# Deployment guide

Last updated: 2026-11-02

## Live URLs

| Resource | URL |
|----------|-----|
| GitHub repo | https://github.com/dineshku9095-source/jewellery-store |
| Render API (`jewellery-api`) | https://jewellery-api-l84i.onrender.com |
| Render Web (`jewellery-web`) | https://jewellery-web-3raw.onrender.com |
| API health | https://jewellery-api-l84i.onrender.com/health |
| Admin login | https://jewellery-web-3raw.onrender.com/admin/login |

## Keep-alive (prevent Render free cold starts) — every 1 minute

Render **free** services sleep after ~15 minutes idle → storefront `/api/*` rewrites **502** until wake.

**Full click-by-click guide:** [`docs/KEEP_ALIVE.md`](./KEEP_ALIVE.md)

| Method | Interval | Notes |
|--------|----------|--------|
| [cron-job.org](https://cron-job.org/en/signup/) **two jobs** | **1 minute** | **Do this** — API `/health` + web `/api/settings/public` |
| [UptimeRobot](https://uptimerobot.com) | 5 min min | Free plan cannot do 1 min |
| `scripts/keep-alive.sh` | `* * * * *` on a VPS | Not on Cloud Agent VMs |

**URLs to paste into cron-job.org:**

1. `https://jewellery-api-l84i.onrender.com/health`
2. `https://jewellery-web-3raw.onrender.com/api/settings/public`

## Prerequisites

- PostgreSQL (Render Postgres or managed equivalent)
- Cloudinary account (unsigned uploads disabled; use signed API)
- Node 20+
- Strong `ADMIN_BOOTSTRAP_PASSWORD` (never commit)
- GitHub auth to create/push the repo
- Render account (Blueprint or API key)

## Local

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
# Edit DATABASE_URL, ADMIN_BOOTSTRAP_*, CLOUDINARY_*, WhatsApp later in settings

npm install
npm run build -w @jewellery/shared
npm run db:generate
npm run db:migrate:dev   # or: npm run db:migrate
npm run db:seed

npm run dev:backend      # :4000
npm run dev:frontend     # :3000  (rewrites /api → backend)
```

Admin: `/admin/login` with bootstrap credentials.

## Manual GitHub push (required once)

From a machine/session where `gh auth status` is OK (or with `GH_TOKEN`):

```bash
cd /agent   # or your clone of this monorepo on branch main
gh repo create jewellery-store --private --source=. --remote=origin --push
```

Or create an empty repo on GitHub.com named `jewellery-store`, then:

```bash
git remote add origin https://github.com/<YOU>/jewellery-store.git
git push -u origin main
```

Do **not** commit or push `.env` / `.env.local`.

## Manual Render Blueprint (required once)

1. [dashboard.render.com](https://dashboard.render.com) → **New** → **Blueprint**.
2. Connect the `jewellery-store` GitHub repo (`render.yaml` at repo root).
3. Fill secret env vars (use Project store `internal/deploy-secrets-note.md` for bootstrap password):
   - API: `ADMIN_BOOTSTRAP_*`, `APP_URL`, `FRONTEND_URL`, `CORS_ORIGINS`
   - Web: `BACKEND_URL`, `NEXT_PUBLIC_SITE_URL`
   - Cloudinary: placeholders until you have real keys
4. Deploy. API start runs `prisma migrate deploy`.
5. **Second pass:** copy the two `*.onrender.com` URLs into the env vars above → Manual Deploy both services.
6. Seed once — Render Shell on `jewellery-api`:

   ```bash
   cd backend && npx tsx prisma/seed.ts
   ```

7. Open `/admin/login`, change password, set WhatsApp number in Settings.
8. Confirm `GET /health` → `db: ok` (Cloudinary will stay `missing` until keys are set).

### Cookie / CORS notes

- Frontend proxies `/api` via Next rewrites → browser stays same-origin; `COOKIE_SAME_SITE=lax` + `COOKIE_SECURE=true` is correct on HTTPS.
- If the browser calls the API host directly, set `CORS_ORIGINS` to the frontend origin, `credentials: true` (already), and `COOKIE_SAME_SITE=none` with Secure.

### Images (admin file upload)

Never configure local disk uploads. Admin product forms use a **file picker** that:

1. Calls `GET /api/admin/uploads/sign`
2. Uploads the file directly to Cloudinary
3. Saves `secure_url` + `public_id` on `ProductImage`

Set `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` (and optional `CLOUDINARY_FOLDER`) on the **API** Render service. Free Cloudinary tier is fine. Seed/Unsplash URLs still work without Cloudinary; file upload shows a clear error until keys exist. Confirm with `GET /health` → `cloudinary: ok`.

## Environment checklist

| Variable | Service | Required |
|----------|---------|----------|
| `DATABASE_URL` | API | Yes (Neon pooled `postgresql://`) |
| `ADMIN_BOOTSTRAP_EMAIL/PASSWORD` | API | Yes (first boot / seed) |
| `CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET` | API | Yes for file uploads |
| `CLOUDINARY_FOLDER` | API | Optional (default `jewellery-store`) |
| `FRONTEND_URL` / `CORS_ORIGINS` | API | Yes |
| `BACKEND_URL` | Web | Yes |
| `NEXT_PUBLIC_SITE_URL` | Web | Recommended |

## Unblocking automation

Provide `GH_TOKEN` (repo scope) and `RENDER_API_KEY` to a follow-up agent run, or push the repo yourself and ask the agent only to finish Render URL wiring once services exist.
