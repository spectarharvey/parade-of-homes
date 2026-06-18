# MCBIA Parade of Homes

A **Next.js 16 (App Router) + TypeScript** app with a **PostgreSQL + Prisma** backend.

Originally a single self-contained `index.html` (kept at [`index.html`](index.html) for
reference), it now has a real server: a Postgres database, server API routes, and
cookie-based authentication with roles. Data is no longer browser-only — it persists in
the database and is shared across all visitors and devices.

## Quick start

```bash
npm install

# 1. Configure environment
cp .env.example .env
#    then edit .env and set DATABASE_URL (Neon) + AUTH_SECRET

# 2. Create the schema and load demo data
npm run db:deploy     # apply migrations
npm run db:seed       # load the Parade demo data + admin/builder accounts

# 3. Run
npm run dev           # http://localhost:3000
```

### Getting a database (Neon)

1. Create a free project at <https://neon.tech>.
2. Copy the **pooled** connection string into `DATABASE_URL` in `.env`.
3. Generate `AUTH_SECRET` with `openssl rand -base64 32`.
4. Run `npm run db:setup` (migrate + seed).

**Default accounts (from seed):**
- Admin — `admin@mcbia.org` / `parade2025`  → `/admin`
- Builder — `builder@heritagehomes.com` / `builder2025`  (portal arrives in the next phase)

Change these via the `ADMIN_*` / `BUILDER_*` env vars before seeding.

## Architecture

```
Browser (React client components, useStore hook)
   │  fetch()
   ▼
Next.js Route Handlers  (src/app/api/**)        ← server
   │  Prisma Client
   ▼
PostgreSQL (Neon)
```

The frontend keeps the same `useStore()` hook it always had, but the store now reads/writes
through the API instead of `localStorage`. Per-visitor state that isn't tied to an account
(which homes *you* checked in / your planned route) still lives in `sessionStorage`, since
end-users are anonymous in this phase.

### Key backend files

| Path | Purpose |
|------|---------|
| `prisma/schema.prisma` | Data model (Builder, Neighborhood, Home, Sponsor, Faq, Registrant, Submission, Notification, Contest, Account) |
| `prisma/seed.ts` + `src/lib/seedDb.ts` | Loads demo data + hashed admin/builder accounts |
| `src/lib/prisma.ts` | Prisma client singleton |
| `src/lib/auth.ts` | JWT cookie sessions (jose) + bcrypt password check, `ADMIN`/`BUILDER` roles |
| `src/lib/data.ts` | `getPublicState()` / `getAdminState()` queries |
| `src/lib/api.ts` | JSON helpers + `requireRole()` guard |
| `src/app/api/**` | Route handlers (see below) |

### API routes

Public: `GET /api/state`, `POST /api/register`, `POST /api/submissions`,
`POST /api/homes/[id]/checkin`, `POST /api/homes/[id]/rate`.

Auth: `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`.

Admin (require `ADMIN` session): `GET /api/admin/state`, `DELETE /api/admin/homes/[id]`,
`POST /api/admin/homes/[id]/feature`, `PATCH /api/admin/builders/[id]`,
`POST /api/admin/builders/[id]/feature`, `PATCH /api/admin/submissions/[id]`,
`POST /api/admin/notifications`, `PATCH /api/admin/settings`, `POST /api/admin/reset`.

## Frontend structure

```
src/app/
├── layout.tsx, globals.css, not-found.tsx
├── (public)/            # Header+Footer layout
│   ├── page.tsx (home), homes, home/[id], neighborhoods, neighborhood/[id],
│   ├── builders, map, contest, register, sponsors, faq, submit
└── admin/               # login-gated layout
    ├── page.tsx (dashboard), homes, builders, users, submissions, notifications, settings
src/components/   Header, Footer, HomeCard, QRCode, AdminShell, AdminLogin, NotFoundBlock
src/lib/          types, seed, format, store(context), prisma, auth, data, api, serialize, seedDb
```

## Status vs. the feature spec

**Done (real backend):** home/neighborhood/builder listings, map + route planner, contest
tracker, end-user registration, home check-in & rating, builder home submissions, sponsors,
FAQ, featured builder + ad space, full admin console with **real password auth** and a
Postgres database; "Reset Demo Data" reseeds the DB.

**Next phases (not yet built):** builder self-service portal (login + manage own listings),
real QR-code scanning for check-in, individual builder profile pages, neighborhood
check-in/voting, real SMS (Twilio) and web-push/PWA install. Notification "send" currently
records the message in the DB but does not yet dispatch SMS/push.
