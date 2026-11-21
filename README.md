# Timetec Attendance Sync

Next.js recreation of the Timetec Sync Attendance Form with batch processing, organization tree, employee multi-select, progress tracking, and chunk-level response details.

## Quick start

```bash
npm install
npm run dev
```

Open http://localhost:3000 → redirects to `/attendance`.

Demo login at `/login` accepts any credentials.

## Features

- Hierarchical Organization tree with cascade select + search
- Filter button loads employees for selected orgs
- Multi-select Employees
- Start / End Date (max 30 days, no future dates)
- Submit starts chunked background sync
- Live progress modal + polling
- Response panel with per-chunk stats

## Deploy (Vercel + Firebase + Neon)

1. Build locally
2. Create Firebase project (Email/Password auth)
3. Create Neon Postgres database
4. Push to GitHub (this repo)
5. Deploy on Vercel with env vars
6. Run migrations and test production

Env vars: `NEXT_PUBLIC_FIREBASE_*`, `DATABASE_URL`
