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
