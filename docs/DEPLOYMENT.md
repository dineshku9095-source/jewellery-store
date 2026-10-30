# Deployment

See root `render.yaml` for Blueprint services: `jewellery-api`, `jewellery-web`, Postgres `jewellery-db`.

## Local

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
npm install
npm run build -w @jewellery/shared
npm run db:generate && npm run db:migrate:dev && npm run db:seed
npm run dev:backend
npm run dev:frontend
```

## Production checklist

1. Set `DATABASE_URL`, `ADMIN_BOOTSTRAP_*`, session secret
2. Set `FRONTEND_URL`, `CORS_ORIGINS`, `BACKEND_URL`, `NEXT_PUBLIC_SITE_URL`
3. Run migrations on deploy (`prisma migrate deploy`)
4. Seed once: `cd backend && npx tsx prisma/seed.ts`
5. Configure Cloudinary for admin uploads
6. Set WhatsApp number in admin Settings

Do not commit `.env` files.
