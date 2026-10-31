# Bloom 🌸

_Grow beautifully._

Bloom is a personal growth garden — not a to-do app. Every meaningful effort
plants a seed, every focused hour helps your garden bloom, and every
productive day makes your life a little more beautiful.

## Tech stack

- **Next.js 16** (App Router, TypeScript)
- **Tailwind CSS v4** — Bloom's neutral design system (a warm off-white ground,
  graphite ink and one muted accent per palette: Stone, Sage, Clay, Slate,
  Lavender, Rose) lives in `src/app/globals.css` as CSS theme tokens
  (`--color-cream`, `--color-rose`, etc.), with a class-based dark mode variant.
- **next-intl** — English and Vietnamese, with locale-prefixed routing
  (`/`, `/vi`, `/board`, `/vi/board`, ...).
- **next-themes** — light/dark mode.
- **Zustand** — app state (Focus Board, garden, Bloom Balance, reflections).
- **Framer Motion** — flower growth, progress bars, toasts.
- **Recharts** — the Weekly Garden Review charts.
- **Radix UI** — accessible Dialog primitive for the "New Focus" modal.
- **Lucide** — icons throughout.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000

```bash
npm run build   # production build
npm run start   # run the production build
npm run lint    # eslint
```

## Project structure

```
messages/               en.json / vi.json — all UI copy, translated
src/
  i18n/                 next-intl routing, navigation helpers, request config
  proxy.ts              locale-detection proxy (formerly "middleware")
  lib/
    types.ts            Focus, GardenFlower, MemoryEntry, BloomState, etc.
    storage.ts           BloomRepository — the ONE seam for persistence
    store.ts             Zustand store: all of Bloom's logic lives here
    category-meta.ts     icons/colors for Create · Grow · Enjoy · Consume
    utils.ts             formatVND, reward math, cn(), etc.
  components/
    ui/                  small shared primitives (Dialog, Input, Select...)
    bloom/               Bloom-specific UI: GardenHero, FocusCard,
                         DreamStore, MemoryGarden, Analytics, ...
  app/[locale]/
    layout.tsx           fonts, providers, Nav, Toaster
    page.tsx             Home / Garden
    board/page.tsx        Focus Board
    analytics/page.tsx    Weekly Garden Review
    store/page.tsx        Dream Store
    memory/page.tsx       Memory Garden
```

## Data & persistence

Bloom currently stores everything in `localStorage`, so it works instantly
with zero setup. All reads/writes go through a single interface,
`BloomRepository` in `src/lib/storage.ts` — no component or store code
touches `localStorage` directly.

### Migrating to Supabase later

1. Create a Supabase project and a `bloom_states` table (one JSON column per
   user is enough to start: `user_id uuid`, `state jsonb`).
2. Implement a `SupabaseBloomRepository` in `src/lib/storage.ts` that
   satisfies the same `BloomRepository` interface (a commented-out example
   is already sketched in that file).
3. Swap the `bloomRepository` export at the bottom of that file.
4. Add Supabase auth (e.g. `@supabase/ssr`) so `state` is scoped per user.

No other file needs to change.

## Deploying to bloomdaily.com

The fastest path is Vercel, since this is a standard Next.js app:

1. Push this project to a GitHub repo.
2. Import it in Vercel ("Add New Project").
3. Vercel auto-detects Next.js — no config needed. Deploy.
4. In your Vercel project -> Settings -> Domains, add `bloomdaily.com`
   (and `www.bloomdaily.com` if you want the `www` redirect).
5. At your domain registrar, point:
   - `bloomdaily.com` -> an `A` record to `76.76.21.21`, OR
   - use Vercel's nameservers for a fully managed setup.
   Vercel's Domains screen gives you the exact records to add and will
   show "Valid Configuration" once DNS propagates (usually minutes to a
   few hours).
6. HTTPS is issued automatically once the domain verifies.

`metadataBase` in `src/app/[locale]/layout.tsx` is already set to
`https://bloomdaily.com` for correct Open Graph/Twitter card URLs.

## Design notes

- The garden (`GardenHero`) is intentionally the first thing on the home
  page — Bloom is a garden with a productivity system behind it, not the
  other way around.
- Nothing in the product ever uses red/aggressive language for missed days;
  see `MomentumRules` and the `momentum` copy in `messages/*.json`.
- Every Bloom Balance number animates via `AnimatedNumber` rather than
  jumping, and the reward-per-hour constant lives in `src/lib/utils.ts`
  (`REWARD_PER_HOUR`) if you want to tune it.
