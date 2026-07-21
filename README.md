# BlueHazy FM

A modern radio station web app for **BlueHazy FM** — live broadcasting, shows, news, gallery, and more.

Built with React, TypeScript, Vite, Tailwind CSS, and a Node/Express API backend.

---

## Project Structure

```
├── artifacts/
│   ├── bluehazy-fm/        # React frontend (Vite + Tailwind CSS)
│   └── api-server/         # Express REST API backend
├── lib/
│   ├── api-client-react/   # Auto-generated React Query API client
│   ├── api-spec/           # OpenAPI spec
│   ├── api-zod/            # Zod schemas for API validation
│   └── db/                 # Drizzle ORM database schema
```

---

## Features

- 🎙️ **Live Radio** — embeddable live stream player
- 📅 **Shows & Schedule** — weekly schedule with presenter info
- 📰 **News** — featured posts with images and categories
- 🖼️ **Gallery** — photo gallery of events and studio life
- 📬 **Contact & Newsletter** — listener engagement forms
- 🛠️ **Admin Panel** — manage shows, presenters, posts, gallery, and schedule

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS v4 |
| Routing | Wouter |
| Data fetching | TanStack React Query |
| UI Components | Radix UI + shadcn/ui |
| Animations | Framer Motion |
| Backend | Node.js, Express |
| Database | PostgreSQL + Drizzle ORM |
| Package manager | pnpm (monorepo) |

---

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+
- PostgreSQL database

### Install dependencies

```bash
pnpm install
```

### Environment variables

Copy the example env file and fill in your values:

```bash
cp artifacts/bluehazy-fm/.env.example artifacts/bluehazy-fm/.env.local
```

| Variable | Description |
|---|---|
| `VITE_API_URL` | URL of the API server (e.g. `http://localhost:3000`) |

For the API server, set `DATABASE_URL` to your PostgreSQL connection string.

### Run locally

```bash
# Start the API server
pnpm --filter @workspace/api-server dev

# Start the frontend (in a separate terminal)
pnpm --filter @workspace/bluehazy-fm dev
```

The frontend runs at `http://localhost:5173` and proxies `/api` requests to the API server.

---

## Deployment

### Frontend → Netlify

The frontend is configured for Netlify out of the box via `netlify.toml`.

1. Push this repo to GitHub
2. Connect the repo in [Netlify](https://app.netlify.com) → **Add new site**
3. Netlify will auto-detect the build settings from `netlify.toml`
4. Add your environment variables in **Site settings → Environment variables**:
   - `VITE_API_URL` — your deployed API server URL

### Backend → (Render / Railway / Fly.io)

The `api-server` is a standard Express app and can be deployed on any Node.js hosting platform. Make sure to set `DATABASE_URL` in the platform's environment variables.

---

## Scripts

| Command | Description |
|---|---|
| `pnpm --filter @workspace/bluehazy-fm dev` | Start frontend dev server |
| `pnpm --filter @workspace/bluehazy-fm build` | Build frontend for production |
| `pnpm --filter @workspace/api-server dev` | Start API server |
| `pnpm build` | Typecheck and build everything |

---

## License

MIT
