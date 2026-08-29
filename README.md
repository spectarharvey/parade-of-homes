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

## Website Content (admin CMS)

**Admin → Website Content** (`/admin/site-content`) lets staff edit the words and
pictures on the public site through plain forms — no HTML. Pick a page tab,
change a field, save, and the change is live on the next page load.

How it fits together:

| Piece | Where |
| --- | --- |
| Field labels, types and **built-in defaults** | `src/lib/cms/schema/*.ts`, listed in `src/lib/cms/registry.ts` |
| Storage (overrides only) | `SiteContent` table — unique on `(page, key)` |
| API | `GET /api/site-content?page=global,home` (public) · `PUT /api/site-content` (admin) |
| Rendering | `(public)/layout.tsx` reads the overrides server-side and hands them to `CmsProvider`; pages call `useCms("<page>")` |

Key rules:

- The schema `default` **is** the copy that ships in the markup. The database
  only ever stores overrides, so an empty table renders the site exactly as it
  was, and "Reset to default" simply deletes the row (`value: null` in the PUT).
- Saving sends **only the changed fields**.
- Keys are page-scoped dot-paths. Shared header/footer keys start with `global.`
  and live under `page = "global"`, so editing one updates every page at once.
- `SiteContent` is deliberately **not** cleared by `db:seed` / "Reset 2026
  Starter Data" — resetting the catalog does not throw away website copy.

Adding an editable field:

1. Add a `{ key, label, type, default }` entry to the page's schema module.
2. Render it in the page with `cms.t("key")` (text, `src`, `href`, `alt`),
   `cms.lines("key")` (newlines become `<br>`) or `cms.html("key")`.
3. Run `npm run cms:check` — it fails if a key is used but not declared, is
   declared but never rendered, or is read outside the `(public)` layout that
   provides the values.

Deploys apply pending migrations automatically: `build` runs
`prisma migrate deploy` before `next build`, so a new environment (or a new
migration such as `SiteContent`) is set up by the deploy itself.

## Useful Commands

```bash
npm run build
npm run db:push
npm run db:seed
npm run db:setup
npm run cms:check   # Website Content: markup and schema must match 1:1
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
| `src/lib/cms/` | Website Content schema, registry, server reader and `useCms` hook |
| `src/app/admin/site-content/page.tsx` | The Website Content editor |
| `scripts/check-cms-keys.mjs` | 1:1 check between content keys in the markup and the schema |

## Current Data Behavior

`GET /api/state` returns the 2026 starter catalog when the connected database
does not yet contain the imported 2026 home IDs. This prevents an older seeded
database from hydrating the public app back to placeholder homes.
