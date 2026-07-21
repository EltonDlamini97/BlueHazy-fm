# Deploy BlueHazy FM (GitHub → Railway + Vercel)

GitHub Actions builds and deploys the monorepo. GitHub does **not** host the API or database—those run on Railway and Vercel.

| Component | Package | Host |
|-----------|---------|------|
| Frontend | `@workspace/bluehazy-fm` | Vercel (static + `/api` proxy) |
| API | `@workspace/api-server` | Railway (Node) |
| Database | `@workspace/db` | Supabase Postgres, Railway Postgres, or Neon |

## Architecture

```
Browser → Vercel (SPA)
              └── /api/* rewrite → Railway (Express) → Postgres
```

Workflows:

- **CI** (`.github/workflows/ci.yml`) — typecheck + build on push/PR to `main`
- **Deploy API** (`.github/workflows/deploy-api.yml`) — build API, `railway up` on push to `main`
- **Deploy Frontend** (`.github/workflows/deploy-frontend.yml`) — patch `vercel.json`, build, Vercel prod deploy after API workflow succeeds

## One-time setup

### 1. Railway (API + Postgres)

1. Create a [Railway](https://railway.app) project and connect this GitHub repo.
2. Add **PostgreSQL** and link `DATABASE_URL` to the API service.
3. Configure the API service:
   - **Start command:** `node --enable-source-maps ./artifacts/api-server/dist/index.mjs`
   - **Health check path:** `/api/healthz`
   - Railway sets `PORT` automatically; ensure `NODE_ENV=production`.
4. Note the public API URL (e.g. `https://your-service.up.railway.app`) — no trailing slash.
5. Copy the **service ID** (Railway service settings) for GitHub secrets.

Apply the database schema once:

```bash
DATABASE_URL="postgresql://..." pnpm --filter @workspace/db run push
```

Optional demo data (API must be running locally):

```bash
node scripts/seed.mjs
```

### 2. Vercel (frontend)

1. Import the repo at [Vercel](https://vercel.com).
2. Confirm settings match root [`vercel.json`](../vercel.json):
   - Build: `pnpm --filter @workspace/bluehazy-fm run build`
   - Output: `artifacts/bluehazy-fm/dist/public`
3. Copy **Org ID** and **Project ID** from Vercel project settings.

The `/api` rewrite in `vercel.json` is patched during **Deploy Frontend** using `RAILWAY_PUBLIC_URL`. Do not rely on the `REPLACE_WITH_RAILWAY_PUBLIC_URL` placeholder for production.

### 3. GitHub repository secrets

Add under **Settings → Secrets and variables → Actions**:

| Secret | Description |
|--------|-------------|
| `RAILWAY_TOKEN` | Railway account token ([tokens](https://railway.app/account/tokens)) |
| `RAILWAY_SERVICE_ID` | API service ID in Railway |
| `RAILWAY_PUBLIC_URL` | Public API base URL, e.g. `https://xxx.up.railway.app` |
| `VERCEL_TOKEN` | Vercel token with deploy access |
| `VERCEL_ORG_ID` | Vercel team/user ID |
| `VERCEL_PROJECT_ID` | Vercel project ID |

Optional: create a GitHub **environment** named `production` if you use environment protection rules (workflows reference `environment: production`).

### 4. Enable Actions

Push to `main` or run **Deploy API** / **Deploy Frontend** manually via **Actions → workflow_dispatch**.

For **Supabase** setup (connection string, schema push, storage), see [SUPABASE.md](./SUPABASE.md).

## Local development

```powershell
$env:DATABASE_URL = "postgresql://..."
$env:PORT = "8080"
pnpm --filter @workspace/api-server run build
pnpm --filter @workspace/api-server run start

# separate terminal
pnpm --filter @workspace/bluehazy-fm run dev
```

Open http://localhost:8081 (Vite proxies `/api` to port 8080).

## Netlify (frontend)

Root [`netlify.toml`](../netlify.toml) builds `@workspace/bluehazy-fm` and proxies `/api/*` to Render.

### Connect Netlify to GitHub

1. [Netlify](https://app.netlify.com) → **Add new site** → **Import from Git** → `EltonDlamini97/BlueHazy-fm`.
2. Branch: **`main`**. Leave build settings empty so Netlify uses `netlify.toml`.
3. **Site configuration → Build & deploy → Continuous deployment** — confirm deploys on push to `main` are enabled.
4. After a failed deploy: **Deploys → Trigger deploy → Clear cache and deploy site**.

### GitHub Actions deploy (recommended if Netlify auto-build stays stuck)

Add secrets under **Settings → Secrets and variables → Actions**:

| Secret | Where to find it |
|--------|------------------|
| `NETLIFY_AUTH_TOKEN` | Netlify → User settings → Applications → Personal access tokens |
| `NETLIFY_SITE_ID` | Site settings → General → Site details → **API ID** |

Workflow: [`.github/workflows/deploy-netlify.yml`](../.github/workflows/deploy-netlify.yml) — runs on every push to `main`.

## Troubleshooting

| Issue | Check |
|-------|--------|
| Empty home page sections | API running? `GET /api/shows` returns data? |
| 502 on `/api` from Vercel | `RAILWAY_PUBLIC_URL` secret matches Railway URL; API healthy at `/api/healthz` |
| Railway deploy fails | `RAILWAY_TOKEN`, `RAILWAY_SERVICE_ID`; build logs in Actions |
| Vercel deploy fails | `VERCEL_*` secrets; `pnpm run build` passes in CI |
| **Netlify not updating** | Netlify **Deploy log** for failed build; Node **24** in `netlify.toml`; repo linked to `main`; run **Clear cache and deploy**; or add `NETLIFY_*` secrets and use **Deploy Netlify** workflow |

## Patch script (used in CI)

```bash
RAILWAY_PUBLIC_URL=https://xxx.up.railway.app node scripts/patch-vercel-api-url.mjs
```

Updates the `/api/(.*)` rewrite destination in `vercel.json` before Vercel deploy.
