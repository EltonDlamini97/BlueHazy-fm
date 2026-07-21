# Connect BlueHazy FM to Supabase

The app uses **Supabase Postgres** through Drizzle (same as any PostgreSQL). You do not need `@supabase/supabase-js` unless you add Auth or client-side Storage later.

## 1. Get your connection string

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → your project (`jcujkjznziksxxgwirfb` if using the existing storage bucket).
2. **Project Settings** → **Database** → **Connection string** → **URI**.
3. Choose **Transaction pooler** (recommended for Node, port `6543`) or **Direct** (`5432`).
4. Replace `[YOUR-PASSWORD]` with your database password.

Example:

```text
postgresql://postgres.jcujkjznziksxxgwirfb:YOUR_PASSWORD@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

## 2. Local `.env`

Copy the example file and paste your URI:

```cmd
copy .env.example .env
```

Edit `.env` and set `DATABASE_URL=...` (keep the file out of git — already in `.gitignore`).

## 3. Push schema to Supabase

```cmd
cd C:\Users\elton\Downloads\ReplitExport-eltondlamini97\Asset-Manager
pnpm --filter @workspace/db run push
```

## 4. Seed demo content

```cmd
pnpm seed
```

To replace existing rows:

```cmd
pnpm seed:force
```

Inserts presenters, shows, news, gallery, and schedule using images from your Supabase `bluehazy-fm` storage bucket.

## 5. Run the app

**Terminal 1 — API:**

```cmd
set PORT=8080
pnpm --filter @workspace/api-server run build
pnpm --filter @workspace/api-server run start
```

**Terminal 2 — Frontend:**

```cmd
pnpm --filter @workspace/bluehazy-fm run dev
```

Open http://localhost:8081

## 6. Storage (images)

Seed data and uploads can use your public bucket URLs:

```text
https://jcujkjznziksxxgwirfb.supabase.co/storage/v1/object/public/bluehazy-fm/...
```

Ensure the `bluehazy-fm` bucket exists and is **public** (or serve signed URLs from the API later).

## Production (Railway / Vercel)

Set `DATABASE_URL` in Railway (API service) to the same Supabase URI. SSL is enabled automatically when the host contains `supabase.com`.

## Troubleshooting

| Error | Fix |
|-------|-----|
| `DATABASE_URL must be set` | Create `.env` at repo root from `.env.example` |
| SSL / connection refused | Use pooler URI from dashboard; check password and IP allowlist (Supabase allows all by default) |
| Empty tables | Run `pnpm --filter @workspace/db run push` |
| API proxy errors in Vite | Start API on port 8080 with `PORT=8080` |
