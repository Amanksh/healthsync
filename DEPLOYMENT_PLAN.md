# Hospital Management System Deployment Plan

## Current Project Shape

- `backend/` is a NestJS API using Prisma with PostgreSQL.
- `frontend/` is a Next.js app that talks to the API through `NEXT_PUBLIC_API_URL`.
- `docker-compose.yml` only runs local PostgreSQL; it is not a full production deployment.
- Prisma migrations already exist in `backend/prisma/migrations`.
- Production bootstrapping now uses an idempotent SUPER_ADMIN seed in `backend/prisma/seed.ts`.

## Recommended Free Deployment

Use this split because it matches the repo with the least code change:

1. **Frontend:** Vercel Hobby plan.
   - Vercel lists Hobby as free and includes automatic CI/CD, HTTPS, CDN, and Git deployments.
   - Source: https://vercel.com/pricing

2. **Backend API:** Render Free Web Service.
   - Render supports free Node.js web services.
   - Important limitation: free web services spin down after 15 minutes of inactivity and need about a minute to wake.
   - Source: https://render.com/docs/free

3. **Database:** Supabase Free Postgres.
   - Supabase Free includes a hosted Postgres database with a 500 MB database limit.
   - Important limitation: free projects can pause after one week of inactivity.
   - Source: https://supabase.com/pricing

This is suitable for demos, testing, and early validation. For real hospital production data, move to paid hosting with backups, uptime guarantees, audit logging, and proper object storage.

## Backend Deployment Steps

1. Create a Supabase project.
2. Copy the Supabase Postgres connection string.
3. Create a Render Web Service from the repo.
4. Set the Render root directory to `backend`.
5. Set the build command:

```bash
npm ci && npx prisma generate && npm run build
```

6. Set the start command:

```bash
npm run deploy:start
```

7. Add these Render environment variables:

```bash
NODE_ENV=production
DATABASE_URL=<supabase pooled or direct postgres url>
JWT_SECRET=<long random secret>
JWT_EXPIRATION=24h
FRONTEND_URL=<vercel frontend url>
SUPER_ADMIN_EMAIL=<admin email>
SUPER_ADMIN_PASSWORD=<strong password>
SUPER_ADMIN_FIRST_NAME=System
SUPER_ADMIN_LAST_NAME=Admin
SUPER_ADMIN_RESET_PASSWORD=false
```

8. Add S3 variables only if invoice/report upload features are enabled:

```bash
AWS_REGION=<region>
AWS_ACCESS_KEY_ID=<access key>
AWS_SECRET_ACCESS_KEY=<secret key>
AWS_S3_BUCKET_NAME=<bucket>
```

## Frontend Deployment Steps

1. Create a Vercel project from the repo.
2. Set the Vercel root directory to `frontend`.
3. Keep the default build command:

```bash
npm run build
```

4. Add this Vercel environment variable:

```bash
NEXT_PUBLIC_API_URL=https://<render-service>.onrender.com/api
```

5. Redeploy the frontend after the Render backend URL is known.

## Database Bootstrap

The backend start command runs:

```bash
npx prisma migrate deploy && npm run seed:super-admin && node dist/main
```

That means every deploy:

- Applies pending Prisma migrations.
- Creates the SUPER_ADMIN account if it does not exist.
- Keeps the existing SUPER_ADMIN password unchanged unless `SUPER_ADMIN_RESET_PASSWORD=true`.
- Starts the NestJS API.

For local seeding from `backend/`:

```bash
npm run seed:super-admin
```

## Security Checklist

- Rotate any secrets that have ever been committed, pasted, or shared.
- Use a long random `JWT_SECRET`; never reuse `hms-dev-secret-change-in-production`.
- Keep `.env` files out of Git.
- Do not use the default local password `Admin@123` outside development.
- Configure CORS with the final Vercel URL through `FRONTEND_URL`.
- Use paid Postgres with backups before storing real patient data.

## Free Hosting Caveats

- Render free backend cold-starts after idle periods.
- Supabase free database capacity is limited and may pause after inactivity.
- Render free Postgres is not recommended here because official docs say free Render Postgres expires after 30 days.
- Railway currently offers trial/free credits rather than a stable fully free production path.
