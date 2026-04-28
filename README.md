# AniStream 🎌

A modern anime streaming site — **Next.js frontend** + **Express backend** with self-hosted Consumet scrapers.

## Project Structure

```
/
├── frontend/   ← Next.js app (UI, pages, auth, database)
└── backend/    ← Express API (Consumet scrapers for HLS streams)
```

---

## 🚀 Running Locally

### Prerequisites
- Node.js v20+ (use `nvm use 20`)
- Git

### 1. Frontend
```bash
cd frontend
npm install
# copy env file
cp .env.example .env.local   # fill in AUTH_SECRET, DATABASE_URL
npx prisma migrate deploy    # run DB migrations
npm run dev                  # starts at http://localhost:3000
```

### 2. Backend
```bash
cd backend
npm install
cp .env.example .env
npm run dev                  # starts at http://localhost:4000
```

### 3. Both at once (from root)
```bash
npm install          # installs concurrently
npm run dev          # starts frontend + backend together
```

---

## 🌐 Hosting

### Frontend → Vercel (recommended)
1. Push to GitHub
2. Import `frontend/` folder on [vercel.com](https://vercel.com)
3. Set **Root Directory** to `frontend`
4. Add env vars:
   ```
   AUTH_SECRET=<32-char random string>
   DATABASE_URL=<your postgres URL>    # use Vercel Postgres or Supabase
   NEXTAUTH_URL=https://your-app.vercel.app
   NEXT_PUBLIC_BACKEND_URL=https://your-backend.railway.app
   ```

### Backend → Railway (recommended)
1. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
2. Select **root directory**: `backend`
3. Add env var: `FRONTEND_URL=https://your-app.vercel.app`
4. Railway auto-detects `npm start` — done!

### Backend → Render
1. New Web Service → connect repo
2. Root directory: `backend`
3. Build: `npm install` | Start: `node server.js`
4. Add `FRONTEND_URL` env var

---

## 🔑 Environment Variables

### Frontend (`frontend/.env.local`)
| Variable | Description |
|---|---|
| `AUTH_SECRET` | Random 32-char string for NextAuth |
| `DATABASE_URL` | SQLite: `file:./prisma/dev.db` · Postgres: `postgresql://...` |
| `NEXTAUTH_URL` | Your frontend URL |
| `NEXT_PUBLIC_BACKEND_URL` | URL of your deployed backend (optional) |

### Backend (`backend/.env`)
| Variable | Description |
|---|---|
| `PORT` | Server port (default: 4000) |
| `FRONTEND_URL` | Your frontend URL for CORS |

---

## 📡 Backend API Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/health` | Health check |
| GET | `/api/episodes/jikan/:malId` | Episode list (from Jikan/MAL) |
| GET | `/api/stream/anilist/:episodeId` | HLS stream sources |
| GET | `/api/anime/:anilistId` | Anime info + episodes |
| GET | `/api/search/:query` | Search anime |

---

## 🗄️ Database

For **local dev**: SQLite is used automatically.  
For **production**: Use PostgreSQL (Vercel Postgres / Supabase). Update `schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 16, TypeScript, Prisma, NextAuth.js |
| Backend | Express.js, @consumet/extensions |
| Database | SQLite (dev) / PostgreSQL (prod) |
| Anime Metadata | AniList GraphQL API |
| Episode Data | Jikan (MAL unofficial API) + AniZip |
| Streaming | Embed iframes (vidsrc.me/pro) + backend HLS |
