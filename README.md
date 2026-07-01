# Doora Platform (3-in-1)

Unified Food + Chat + Room Control + Doora AI.

Code anywhere under `Trio/` may be edited. **Do not change** production database configs for deployed Connect (`PersonalCommunication/`) or IoT (`Doora_web_app/`). This app uses its **own** new database.

## Prerequisites

- Node.js 20+
- Docker (optional, for local Postgres)

## Quick start

```bash
# 1. Start local database
docker compose up -d

# 2. Install dependencies
npm install

# 3. Environment
cp .env.example apps/web/.env.local
cp .env.example packages/database/.env

# 4. Database
npm run db:generate
npm run db:migrate
npm run db:seed

# 5. Run (two terminals for chat)
npm run dev
npm run dev:realtime
```

Open http://localhost:3000

### Demo accounts

| Email | Password | Role |
|-------|----------|------|
| resident@demo.com | password123 | Resident |
| cafe@demo.com | password123 | Cafeteria staff |
| guest@doora.local | guest123 | Guest (room) |
| admin@doora.local | admin123 | Admin |

## Structure

```
apps/web          Next.js unified UI (+ Food module at /food)
packages/database Prisma schema + client
```

### Food routes (Phase 1)

| Route | Who | What |
|-------|-----|------|
| `/food` | Residents | Browse cafeterias |
| `/food/cafeteria/[id]` | Residents | Menu + cart |
| `/food/checkout` | Residents | Place order |
| `/food/orders` | Residents | Track orders (live refresh) |
| `/food/dashboard` | Cafeteria staff | Manage incoming orders |
| `/food/dashboard/menu` | Cafeteria staff | Edit menu items |

### Chat (Phase 2)

| Route / service | What |
|-----------------|------|
| `/chat` | Contacts, conversations, live messaging |
| `apps/realtime` :3001 | Socket.io server (run `npm run dev:realtime`) |
| `/api/chat/*` | REST API (contacts, conversations, messages) |

**Chat demo:** Log in as `resident@demo.com` and `cafe@demo.com` in two browsers — they're pre-linked as contacts. Start a chat from the Contacts tab.

### Room (Phase 3)

| Route / feature | What |
|-----------------|------|
| `/room` | Smart room controls (lights, AC, TV, door, routines) |
| MQTT sync | HiveMQ public broker (multi-tab / multi-device demo) |
| `/api/room/state` | Persist room snapshot to PostgreSQL |
| `/api/room/routines` | Smart routines (Good Morning, Good Night, etc.) |
| Admin | `admin@doora.local` — pick any room from dropdown; append `?roomId=` |

**Room demo:** `guest@doora.local` / `guest123` or `admin@doora.local` / `admin123`

```
apps/web          Next.js unified UI (Food + Chat + Room + Doora AI)
apps/realtime     Socket.io server
packages/database Prisma schema + client
```

## Production deployment (Phase 5)

Deploy the unified app at a **new URL** (e.g. `https://app.yourdomain.com`). Legacy Connect and IoT apps stay on their existing URLs and databases.

| Component | Host | Config |
|-----------|------|--------|
| Web + API | [Vercel](https://vercel.com) | Root Directory: `apps/web` |
| Realtime chat | [Railway](https://railway.app) | `Dockerfile.realtime` + `railway.toml` |
| Database | [Supabase](https://supabase.com) | New project `doora-platform` only |
| Redis (optional) | [Upstash](https://upstash.com) | `REDIS_URL` |

### 1. Supabase

1. Create a new Supabase project (not Connect/IoT DBs).
2. Copy **pooler** URL → `DATABASE_URL` (port 6543, `?pgbouncer=true`)
3. Copy **direct** URL → `DIRECT_URL` (port 5432)
4. From your machine (with prod URLs in `packages/database/.env`):

```bash
npm run db:deploy    # apply migrations
npm run db:seed      # demo accounts (optional)
```

### 2. Vercel (web)

1. Import the `doora-platform` repo.
2. Set **Root Directory** to `apps/web` (uses `apps/web/vercel.json` for monorepo install).
3. Add environment variables from `.env.production.example`:

| Variable | Required |
|----------|----------|
| `DATABASE_URL` | Yes |
| `AUTH_SECRET` | Yes (same value on Railway) |
| `AUTH_URL` / `NEXTAUTH_URL` | Yes — `https://app.yourdomain.com` |
| `GROQ_API_KEY` | Yes (Doora AI) |
| `NEXT_PUBLIC_REALTIME_URL` | Yes — Railway public URL |
| `NEXT_PUBLIC_MQTT_URL` | Optional |

4. Deploy. Smoke test: `GET /api/health` → `{ "status": "ok" }`

### 3. Railway (realtime)

1. New project → Deploy from GitHub → same repo, root = `doora-platform`.
2. Railway reads `railway.toml` → builds `Dockerfile.realtime`.
3. Environment variables:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Same Supabase pooler URL |
| `AUTH_SECRET` | Same as Vercel |
| `ALLOWED_ORIGINS` | `https://app.yourdomain.com,https://your-app.vercel.app` |
| `PORT` | Railway sets automatically |

4. Copy the public Railway URL → set `NEXT_PUBLIC_REALTIME_URL` on Vercel → redeploy web.

### 4. Custom domain

1. Vercel → Domains → add `app.yourdomain.com`
2. Update `AUTH_URL`, `NEXTAUTH_URL`, and `ALLOWED_ORIGINS` with the final URL
3. Redeploy both Vercel and Railway

### Production checklist

- [ ] New Supabase project created (not legacy DBs)
- [ ] `npm run db:deploy` succeeded
- [ ] `AUTH_SECRET` matches on Vercel + Railway
- [ ] `NEXT_PUBLIC_REALTIME_URL` points to Railway
- [ ] `ALLOWED_ORIGINS` includes your Vercel URL
- [ ] `/api/health` returns OK
- [ ] Railway `/health` returns OK
- [ ] Login + chat between two demo users works
- [ ] Doora AI responds (GROQ_API_KEY set)

See `.env.production.example` for the full variable list.
