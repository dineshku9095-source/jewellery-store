# Production launch checklist

- [ ] PostgreSQL provisioned; migrations deployed
- [ ] Seed run once; bootstrap admin password rotated
- [ ] `FRONTEND_URL`, `CORS_ORIGINS`, `BACKEND_URL`, site URL aligned
- [ ] `COOKIE_SECURE=true` on HTTPS
- [ ] WhatsApp number in Settings verified with test checkout
- [ ] Cloudinary keys for new product uploads
- [ ] `GET /health` returns `db: ok`
- [ ] Legal pages reviewed (privacy, terms)
- [ ] No `.env` secrets in git
- [ ] render.yaml services connected to repo
