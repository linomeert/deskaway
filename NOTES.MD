# Notes
## Product
Deskaway is a booking app for workations: stays in the Benelux for remote workers who need to actually work there. Every feature answers one question: "Can I work here?"

## Decisions
- a11y linting uses `eslint-plugin-jsx-a11y-x` (fork): the official `eslint-plugin-jsx-a11y@6.10.2` only supports ESLint <=9. Swap back once upstream supports ESLint 10.
- Vitest 4 (4.1.x), not 5, to keep the stack as specified.
- Dependencies are added when first used (TanStack Query, React Hook Form, MSW, axe-core later).
- The API production bundle has `NODE_ENV=production` inlined by esbuild, so `npm start` needs no env var (works on Windows without cross-env).
- `@deskaway/shared` ships TS source; Vite and esbuild compile it. npm deps stay external in the API bundle, so `zod` is also an API dependency.
### 2026-10-12: Workation niche instead of generic hotels
- Decision: stays for remote workers (1-4 weeks) in Benelux.
- Why: a clear user makes product choices easier and gives the app a recognisable angle.
- Tradeoff: smaller audience than a generic booking site.

### 2026-10-12: Single-unit stays (apartments and studios), no room types
- Decision: one stay = one bookable unit. Availability = date range + number of guests.
- Why: keeps availability simple to reason about and test; time goes to the booking flow instead.
- Tradeoff: no hotels with multiple rooms or room types.

### 2026-10-12: Work score
- Decision: a 0-100 score per stay from wifi download (40%), workspace type (25%), review noise rating (20%) and coworking distance (15%).
- Why: turns "can I work here?" into one comparable number; it is the sort default.
- Tradeoff: the weights are my judgement, not data-driven.

### 2026-10-12: Favorites in localStorage
- Decision: saved stays live in the browser; no accounts.
- Why: useful without building authentication.
- Tradeoff: favorites do not sync across devices.
- Next: server-side favorites tied to a user account.

### 2026-10-12: Monorepo with npm workspaces
- Decision: apps/web, apps/api, packages/shared in one repo.
- Why: one clone, one command, shared types between frontend and backend.

### 2026-10-12: Stack versions
- React 19, Vite 8, React Router 8, TanStack Query, React Hook Form, Tailwind v4, Fastify 5, Zod 4, Vitest 4, ESLint 10, Node 24.
- TypeScript 6.x, not 7: typescript-eslint does not support TypeScript 7 yet.

### 2026-10-12: In-memory data behind a repository interface
- Decision: seed data loaded into memory at startup; bookings are generated relative to today.
- Why: runs with one command and no database; the demo never shows outdated dates.
- Tradeoff: data resets on restart.
- Next: Postgres with an exclusion constraint on (stay_id, date range) to block double bookings at database level.

### 2026-10-12: Design from tokens, colours from the logo
- Decision: Tailwind v4 tokens (navy #153C78, gold #D4A100 for decoration only), base components and a /styleguide page; no design tool.
- Why: a consistent UI within the timebox.

## Domain rules
- Dates are ISO YYYY-MM-DD strings. Check-out is exclusive: bookings 1-5 Nov and 5-8 Nov do not overlap.
- Check-in cannot be in the past. `today` is passed in as a parameter, so functions stay pure.
- Minimum nights per stay, default 3.
- Guests: 1 to maxGuests.
- Price = nights x nightly rate + cleaning fee + city tax.
- City tax: per person per night, a flat amount per city.
- Money is stored in integer euro cents and rounded once per line.
- The server rejects overlapping bookings with 409; a broken rule gets 422.


## Assumptions
- Prices are in EUR.
- No accounts; the "verified stay" label on reviews is mocked.
- City tax is a flat amount per city (Amsterdam really uses a percentage).
- Payment is mocked; any 16 digits are accepted.
- Wifi speeds are seed data, not real measurements.

## Cut (and why)
- Long-stay (weekly/monthly) discounts: kept pricing simple; would add next.
- A dedicated "dates just booked" screen: the server still blocks double bookings; checkout shows the server's message through the normal error state.
- Compare view: not part of the core flow.
- Map view: needs a map library and API key; low value for the demo.
- Playwright e2e: the booking path is covered by API integration and component tests; one happy-path e2e test would come next.
- Accounts, real payments, holding dates during checkout, NL/FR/EN, host tools: out of scope for the timebox.

## Open questions