# Troubleshooting

| Symptom | Check |
|---------|--------|
| Checkout fails “WhatsApp not configured” | Admin → Settings → WhatsApp number |
| Admin 403 on POST | Fetch CSRF token; send `x-csrf-token` header |
| Admin 401 | Session expired; log in again |
| Cloudinary sign 503 | Set `CLOUDINARY_*` on API service |
| CORS errors calling API directly | Add frontend origin to `CORS_ORIGINS`; credentials enabled |
| DB errors on start | `DATABASE_URL`, run `npm run db:migrate` |
| Next server fetch fails | Set `BACKEND_URL` for SSR |
| `/api/*` via web returns **502** / “Application error” | Render **free** API slept. See `docs/KEEP_ALIVE.md` — ping `https://jewellery-api-l84i.onrender.com/health` every 10 min (cron-job.org / UptimeRobot / GitHub Actions). Frontend also retries 502/503. |
| Neon / DB down | API `/health` shows `db: error`. Check Neon project awake + pooled `DATABASE_URL`. |
