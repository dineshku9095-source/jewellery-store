# Testing

## Unit tests (shared)

```bash
npm run test -w @jewellery/shared
```

Covers decimal-safe money helpers and WhatsApp message / URL builders.

## Manual smoke

1. `GET /health` → `db: ok`
2. Browse `/shop`, add to cart, checkout → order success + WhatsApp link
3. Admin login, view dashboard and orders
4. Invalid status transition returns 400

## Typecheck / build

```bash
npm run build -w @jewellery/shared
npm run build -w @jewellery/backend
npm run build -w @jewellery/frontend
```
