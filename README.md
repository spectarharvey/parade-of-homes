# MCBIA Parade of Homes

A **Next.js 16 (App Router) + TypeScript** app with a **PostgreSQL + Prisma** backend.

Originally a single self-contained `index.html` (kept at [`index.html`](index.html) for
reference), it now has a real server: a Postgres database, server API routes, and
cookie-based authentication with roles. Data is no longer browser-only — it persists in
the database and is shared across all visitors and devices.

## Quick start (local, no signup)

Uses an embedded Postgres — no Docker, no cloud account.

```bash
npm install

# Terminal 1 — start the local database (first run downloads a Postgres binary).
# Leave this running.
npm run db:local

# Terminal 2 — first time only: create tables + load demo data
npm run db:setup        # = migrate deploy + seed

# Terminal 2 — run the app
npm run dev             # http://localhost:3000
```

`.env` already points `DATABASE_URL` at the local DB (`localhost:5433`). The local
Postgres data lives in `./.pgdata` and persists between runs.

## Deploying to Vercel (with Neon)

1. **Neon** — create a free project at <https://neon.tech>, copy the **pooled** connection string.
2. **Vercel** — import the GitHub repo, then add these Environment Variables (Production + Preview):
   - `DATABASE_URL` = your Neon pooled string
   - `AUTH_SECRET` = output of `openssl rand -base64 32`
   - `ADMIN_EMAIL`, `ADMIN_PASSWORD` (the admin login you want)
   - `CLOUDINARY_URL` (for image uploads — see below)
3. **One-time DB setup against Neon** (run locally with `.env`'s `DATABASE_URL` pointed at Neon,
   or from any machine):
   ```bash
   npm run db:setup     # migrate deploy + seed (creates tables + the admin account)
   ```
   ⚠️ This is required — "admin can't log in on deploy" almost always means the Neon DB
   has no tables/admin account yet. `db:seed` is what creates the admin account.
4. Deploy. `prisma generate` runs automatically on install/build.

> The session cookie is only marked `secure` when the request is actually HTTPS, so login
> persists across refreshes on both `http://localhost` and `https://…vercel.app`.

### Image uploads (Cloudinary)

Admin add/edit forms upload images to Cloudinary. Create a free account at
<https://cloudinary.com>, then set **`CLOUDINARY_URL`** (Dashboard → "API Environment
variable", looks like `cloudinary://KEY:SECRET@CLOUD_NAME`) in `.env` and on Vercel.
Without it, image upload returns a clear "not configured" message (the rest of the app
still works; you can also paste an image URL directly).

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

**Admin can now fully manage all data** (add / edit / delete) via `/admin`:
- **Home Listings**, **Builders**, **Neighborhoods**, **Sponsors**, **FAQs** — each has
  Add / Edit / Delete with a modal form.
- **Image uploads** go to **Cloudinary** (homes & neighborhoods); you can also paste a URL.
- **QR codes are real & scannable** — each home's check-in QR encodes
  `…/home/<id>?checkin=1`; scanning it on a phone opens the page and auto-checks-in.

**Builder self-service portal** (`/builder`): builders log in with their own `BUILDER`
account and can submit home/neighborhood listings (with Cloudinary image uploads), track
their submission status, and edit their own profile. Admins **review** submissions
(approve/reject) and can provision a builder's login from **Admin → Builders → Set Login**.
The seeded demo builder is `builder@heritagehomes.com` / `builder2025`.

**Next phases (not yet built):** in-app camera QR scanner, individual public builder profile
pages, neighborhood check-in/voting, real SMS (Twilio) and web-push/PWA install.
Notification "send" currently records the message in the DB but does not yet dispatch.

### Applying schema changes to an existing (already-seeded) database

This project syncs the schema with `prisma db push` (no destructive migrations). When the
schema changes, apply it to your Neon DB **without losing data**:

```bash
# with DATABASE_URL pointed at Neon:
npx prisma db push      # or: npm run db:push  — adds new columns, keeps your data
```

⚠️ Do **not** run `db:seed` / `db:setup` against a database that already has real data —
the seed wipes and reloads the demo content. Use `db:push` for schema-only updates.
