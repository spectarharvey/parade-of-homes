# MCBIA Parade of Homes — Next.js

The Parade of Homes app, converted from a single self-contained `index.html` into a
**Next.js 16 (App Router) + TypeScript** project with a proper, file-per-concern structure.

All data is mock/seed data persisted client-side in `localStorage` (per the original
design) — there is no backend. The original single-file version is preserved at
[`index.html`](index.html) for reference.

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm start        # serve the production build
```

**Admin password:** `parade2025` (visit `/admin`).

## Project structure

```
src/
├── app/
│   ├── layout.tsx              # root layout: fonts + <AppProvider>
│   ├── globals.css             # the full design system (unchanged)
│   ├── not-found.tsx           # 404 page
│   ├── (public)/               # public route group — shares Header + Footer
│   │   ├── layout.tsx
│   │   ├── page.tsx            # / (home)
│   │   ├── homes/page.tsx      # /homes  (search + filter + sort)
│   │   ├── home/[id]/page.tsx  # /home/:id  (detail, check-in, rate, add to route)
│   │   ├── neighborhoods/page.tsx
│   │   ├── neighborhood/[id]/page.tsx
│   │   ├── builders/page.tsx
│   │   ├── map/page.tsx        # interactive pin map + route planner
│   │   ├── contest/page.tsx    # stamp-card tracker
│   │   ├── register/page.tsx
│   │   ├── sponsors/page.tsx
│   │   ├── faq/page.tsx
│   │   └── submit/page.tsx
│   └── admin/                  # admin area — auth-gated by its layout
│       ├── layout.tsx          # login gate + admin shell
│       ├── page.tsx            # dashboard
│       ├── homes/page.tsx
│       ├── builders/page.tsx
│       ├── users/page.tsx
│       ├── submissions/page.tsx
│       ├── notifications/page.tsx
│       └── settings/page.tsx
├── components/
│   ├── Header.tsx              # public nav (active-link aware)
│   ├── Footer.tsx
│   ├── HomeCard.tsx            # reusable listing card
│   ├── QRCode.tsx              # decorative deterministic QR
│   ├── AdminShell.tsx          # admin header + side nav
│   ├── AdminLogin.tsx          # admin password screen
│   └── NotFoundBlock.tsx       # inline "not found" for bad detail ids
└── lib/
    ├── types.ts                # all data model interfaces
    ├── seed.ts                 # the original SEED data
    ├── format.ts               # money / moneyK / stars / imgUrl / qrSVG helpers
    └── store.tsx               # <AppProvider>: DB + session state + toast (localStorage)
```

## How state works

`src/lib/store.tsx` exposes two hooks used throughout the app:

- `useStore()` — the in-memory `DB` plus selectors (`home`, `builder`, `nbhd`,
  `liveStats`), session state (`visited`, `route`, `isAdmin`), and every mutation
  (`checkIn`, `rateHome`, `toggleRoute`, `addUser`, `addSubmission`, admin actions,
  `resetDB`, `adminLogin`/`adminLogout`). Mutations persist to `localStorage`
  automatically.
- `useToast()` — `toast(message)` for the bottom toast notification.

Reset everything to the original demo data from **Admin → Contest Settings → Reset
Demo Data**.
