# MCBIA Parade of Homes

Next.js 16 + TypeScript app for the MCBIA Parade of Homes, backed by PostgreSQL
and Prisma.

The current starter catalog is for the 2026 Parade of Homes:

- Featured Builder: Brije Homes
- Model entries: D.R. Horton / Holden, The Deltona Corporation / Mustang,
  Secure Built, LLC / Rutherford Farmhouse
- Parade weekends: November 6-8 and November 13-15, 2026

## Quick Start

```bash
npm install
npm run dev
```

The app runs at <http://localhost:3000>.

If you are using a local database for the first time:

```bash
npm run db:local
npm run db:setup
```

`db:setup` applies migrations and loads the 2026 starter catalog.

## Deployment Notes

For Vercel + Neon, set these environment variables:

- `DATABASE_URL`
- `AUTH_SECRET`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `BUILDER_EMAIL`
- `BUILDER_PASSWORD`
- `CLOUDINARY_URL` for uploads

Default seeded accounts, when env vars are not provided:

- Admin: `admin@mcbia.org` / `parade2026`
- Builder: `builder@brije.com` / `builder2026`

Do not run `db:seed` against a production database with real registrations unless
you intend to reset it to the 2026 starter catalog.

## Useful Commands

```bash
npm run build
npm run db:push
npm run db:seed
npm run db:setup
```

## Important Files

| Path | Purpose |
| --- | --- |
| `src/lib/seed.ts` | 2026 starter catalog and imported builder-entry rows |
| `src/lib/data.ts` | Public catalog API data normalization |
| `src/lib/seedDb.ts` | Database reset/seed workflow |
| `public/parade-entries/2026/` | 2026 entry photos, logos, and rendered floor-plan assets |
| `src/app/(public)/event/page.tsx` | 2026 event and sponsorship page |
| `src/app/(public)/homes/page.tsx` | Public model-home directory |
| `src/app/(public)/builders/page.tsx` | Builder directory and Brije featured-builder spotlight |

## Current Data Behavior

`GET /api/state` returns the 2026 starter catalog when the connected database
does not yet contain the imported 2026 home IDs. This prevents an older seeded
database from hydrating the public app back to placeholder homes.
