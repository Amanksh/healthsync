# HealthSync — Deployment Plan

> **Stack**: Netlify (frontend) · Render Web Service (backend) · Render PostgreSQL (database)

---

## Architecture Overview

```
┌─────────────┐         ┌────────────────────┐         ┌──────────────────┐
│   Netlify    │  HTTPS  │   Render Web Svc   │  TCP    │  Render Postgres │
│  (Next.js)   │───────▶│   (NestJS API)      │───────▶│  (PostgreSQL 16) │
│  Static/SSR  │◀───────│   Port $PORT        │◀───────│  Managed DB      │
└─────────────┘         └────────────────────┘         └──────────────────┘
                              │
                              ▼ (optional)
                        ┌──────────┐
                        │  AWS S3  │
                        │ Invoices │
                        └──────────┘
```

---

## 1 · Database — Render PostgreSQL

### 1.1 Create the Database

1. Log in to [Render Dashboard](https://dashboard.render.com).
2. Click **New +** → **PostgreSQL**.
3. Fill in:

   | Field           | Value                         |
   | --------------- | ----------------------------- |
   | **Name**        | `healthsync-db`               |
   | **Database**    | `hospital_db`                 |
   | **User**        | leave default (auto-generated)|
   | **Region**      | Pick the closest (e.g. `Oregon (US West)` or `Singapore`) |
   | **Plan**        | **Free** (90-day TTL) or **Starter $7/mo** for persistence |

4. Click **Create Database** and wait for provisioning (~1 min).
5. Copy the **Internal Database URL** (looks like `postgres://user:pass@dpg-xxxxx-a/hospital_db`). You'll use this for the backend since both services are on Render's internal network — it's faster and doesn't count against bandwidth.
6. Also copy the **External Database URL** in case you need to connect from your local machine for debugging.

> [!WARNING]
> **Free-tier databases are deleted after 90 days.** Use the Starter plan ($7/mo) for any data you want to keep. Always take `pg_dump` backups before expiry.

### 1.2 Plan Comparison

| Feature          | Free        | Starter ($7/mo)  |
| ---------------- | ----------- | ----------------- |
| Storage          | 1 GB        | 1 GB (expandable) |
| TTL              | 90 days     | No expiry          |
| Backups          | None        | Daily              |
| Connections      | 97 (shared) | 97 (shared)        |
| Best for         | Demos       | Production         |

---

## 2 · Backend — Render Web Service

### 2.1 Create the Web Service

1. In the Render Dashboard, click **New +** → **Web Service**.
2. Connect your GitHub/GitLab repo (`hospital` repository).
3. Configure:

   | Setting              | Value                                              |
   | -------------------- | -------------------------------------------------- |
   | **Name**             | `healthsync-api`                                   |
   | **Region**           | Same as the database                               |
   | **Branch**           | `main`                                             |
   | **Root Directory**   | `backend`                                          |
   | **Runtime**          | `Node`                                             |
   | **Build Command**    | `npm ci && npx prisma generate && npm run build`   |
   | **Start Command**    | `npm run deploy:start`                             |
   | **Plan**             | **Free** (spins down after 15 min idle) or **Starter $7/mo** |

### 2.2 Environment Variables

Add these in the Render service **Environment** tab:

```env
# ── Core ──
NODE_ENV=production
PORT=10000
DATABASE_URL=<Internal Database URL from Step 1.5>

# ── Auth ──
JWT_SECRET=<generate: openssl rand -base64 48>
JWT_EXPIRATION=24h

# ── CORS ──
FRONTEND_URL=https://<your-site>.netlify.app

# ── Super Admin Seed ──
SUPER_ADMIN_EMAIL=admin@hospital.com
SUPER_ADMIN_PASSWORD=<strong-password-min-12-chars>
SUPER_ADMIN_FIRST_NAME=System
SUPER_ADMIN_LAST_NAME=Admin
SUPER_ADMIN_PHONE=
SUPER_ADMIN_RESET_PASSWORD=false

# ── AWS S3 (optional — only if invoice PDF upload is needed) ──
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=<key>
AWS_SECRET_ACCESS_KEY=<secret>
AWS_S3_BUCKET_NAME=<bucket>
```

> [!IMPORTANT]
> Set `PORT=10000`. Render injects its own `PORT` env var, but this value is ignored — Render automatically routes traffic to whatever port your app listens on. Setting 10000 avoids conflicts. Your app's `main.ts` already reads `process.env.PORT`.

> [!IMPORTANT]
> Use the **Internal** Database URL (starts with `postgres://...@dpg-...`) for service-to-service communication. It's faster and free of bandwidth charges.

### 2.3 Puppeteer on Render

Your PDF service uses Puppeteer to generate invoices. Chromium needs system-level dependencies. On Render's Docker-based environment, you need to tell Puppeteer to use the bundled Chromium.

**Option A — Environment Variable (Recommended)**

Add this env var in Render:

```env
PUPPETEER_CHROMIUM_EXECUTABLE_PATH=/opt/render/.cache/puppeteer/chrome/linux-*/chrome-linux64/chrome
```

If this glob path doesn't resolve, use Option B.

**Option B — Skip bundled download, install system Chrome**

Create a file `backend/render-build.sh`:

```bash
#!/usr/bin/env bash
set -e

# Install Chromium dependencies
apt-get update && apt-get install -y \
  chromium \
  fonts-liberation \
  libappindicator3-1 \
  libasound2 \
  libatk-bridge2.0-0 \
  libnspr4 \
  libnss3 \
  libx11-xcb1 \
  libxcomposite1 \
  --no-install-recommends

# Standard build
npm ci
npx prisma generate
npm run build
```

Then set the Build Command to: `chmod +x render-build.sh && ./render-build.sh`

And add: `PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium`

> [!TIP]
> If you don't need PDF generation in production immediately, you can skip this — the rest of the app will work fine without it. Puppeteer failures are caught and logged without crashing the server.

### 2.4 What `deploy:start` Does

The start command `npm run deploy:start` runs:

```bash
npx prisma migrate deploy && npm run seed:super-admin && node dist/main
```

On every deploy, this:
1. ✅ Applies any pending Prisma migrations to the database
2. ✅ Creates the SUPER_ADMIN user if it doesn't exist (idempotent)
3. ✅ Starts the NestJS server

### 2.5 Deploy

Click **Create Web Service**. Render will:
1. Clone your repo
2. Run the build command
3. Run the start command
4. Assign a URL like `https://healthsync-api.onrender.com`

Copy this URL — you'll need it for the frontend.

---

## 3 · Frontend — Netlify

### 3.1 Deploy to Netlify

1. Log in to [Netlify Dashboard](https://app.netlify.com).
2. Click **Add new site** → **Import an existing project**.
3. Connect your GitHub repo.
4. Configure:

   | Setting              | Value                     |
   | -------------------- | ------------------------- |
   | **Branch**           | `main`                    |
   | **Base directory**   | `frontend`                |
   | **Build command**    | `npm run build`           |
   | **Publish directory**| `frontend/.next`          |

> [!IMPORTANT]
> Since this is a Next.js 16 app, you need the **Netlify Next.js Runtime** plugin. Netlify auto-detects Next.js projects and installs `@netlify/plugin-nextjs` automatically. If it doesn't, add it manually:
>
> Create `frontend/netlify.toml`:
> ```toml
> [build]
>   base = "frontend"
>   command = "npm run build"
>   publish = ".next"
>
> [[plugins]]
>   package = "@netlify/plugin-nextjs"
> ```

### 3.2 Environment Variables

In **Site settings** → **Environment variables**, add:

```env
NEXT_PUBLIC_API_URL=https://healthsync-api.onrender.com/api
```

Replace `healthsync-api` with your actual Render service name.

### 3.3 Deploy

Click **Deploy site**. Netlify will build and deploy. Your site will be live at:

```
https://<your-site>.netlify.app
```

### 3.4 Update Backend CORS

Go back to Render and update the `FRONTEND_URL` env var to match your Netlify URL:

```
FRONTEND_URL=https://<your-site>.netlify.app
```

Render will auto-redeploy when you save env var changes.

---

## 4 · Post-Deployment Checklist

### 4.1 Verify Everything Works

| Step | Action | Expected Result |
| ---- | ------ | --------------- |
| 1 | Visit `https://healthsync-api.onrender.com/api` | API responds (may take ~30s on free tier cold start) |
| 2 | Visit your Netlify URL | Frontend loads with login page |
| 3 | Log in with Super Admin credentials | Dashboard loads successfully |
| 4 | Create a hospital, add a patient | Data persists in Render Postgres |
| 5 | Generate an invoice PDF (if S3 configured) | PDF generates and uploads |

### 4.2 Custom Domain (Optional)

**Netlify:**
1. Go to **Domain settings** → **Add custom domain**
2. Add your domain (e.g., `healthsync.yourdomain.com`)
3. Update DNS CNAME to point to `<site>.netlify.app`
4. Netlify auto-provisions SSL via Let's Encrypt

**Render:**
1. Go to your Web Service → **Settings** → **Custom Domains**
2. Add your API domain (e.g., `api.healthsync.yourdomain.com`)
3. Update DNS CNAME to point to `<service>.onrender.com`
4. Update `NEXT_PUBLIC_API_URL` on Netlify and `FRONTEND_URL` on Render

---

## 5 · Security Checklist

- [ ] **Rotate AWS credentials** — The `.env` file has AWS keys that may have been committed to Git history. Rotate them in the AWS Console immediately.
- [ ] **Generate a strong JWT_SECRET** — Run `openssl rand -base64 48` and use the output. Never use `hms-dev-secret-change-in-production`.
- [ ] **Strong Super Admin password** — At least 12 characters, mixed case, numbers, symbols.
- [ ] **Verify `.env` is gitignored** — Already configured in `.gitignore` ✅
- [ ] **Set `FRONTEND_URL` correctly** — This controls CORS. Only allow your actual Netlify domain.
- [ ] **Use paid Postgres** before storing real patient data — Free tier has no backups and expires.

---

## 6 · Free Tier Limitations

| Service | Limitation | Mitigation |
| ------- | ---------- | ---------- |
| Render Web Service (Free) | Spins down after 15 min idle. ~30-60s cold start | Use [UptimeRobot](https://uptimerobot.com) to ping every 14 min, or upgrade to Starter ($7/mo) |
| Render PostgreSQL (Free) | Deleted after 90 days | Export data with `pg_dump` before expiry, or use Starter ($7/mo) |
| Netlify (Free) | 100 GB bandwidth/month, 300 build minutes/month | More than enough for a hospital management demo |

---

## 7 · Deployment Order (Step-by-Step Summary)

```
1. Create Render PostgreSQL        → get Internal DB URL
2. Create Render Web Service       → set env vars with DB URL
3. Wait for backend deploy         → get API URL (*.onrender.com)
4. Create Netlify site             → set NEXT_PUBLIC_API_URL
5. Copy Netlify URL                → update FRONTEND_URL on Render
6. Verify login & CRUD operations
7. (Optional) Add custom domains
```

---

## 8 · Useful Commands

```bash
# Generate a secure JWT secret
openssl rand -base64 48

# Connect to Render Postgres externally (for debugging)
psql "<External Database URL from Render>"

# Run migrations locally against Render DB (use External URL)
DATABASE_URL="<External URL>" npx prisma migrate deploy

# Take a backup before free-tier expires
pg_dump "<External Database URL>" > backup_$(date +%Y%m%d).sql

# Restore backup to a new database
psql "<New Database URL>" < backup_20260519.sql
```
