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
- Decision: Tailwind v4 tokens (navy #153C78, raspberry #CC5987 as accent (decoration only; #A8396A for accent text)), base components and a /styleguide page; no design tool.
- Why: a consistent UI within the timebox.

### 2026-10-12: Monorepo with npm workspaces (web, api, shared).
Pricing, availability and work score must be computed the same way everywhere, and the server must never trust client prices. Putting those rules in one internal package (`@deskaway/shared`) that both apps import means one source of truth, no copy-pasting and no publishing. npm workspaces give that with one install and one lockfile, and no extra tooling.
- **Shared ships TypeScript source, no build step.** Vite, tsx, esbuild and Vitest already compile TS, so building shared separately would only add stale-build bugs. If it ever needed to be published, I'd add a build then.
- **Single deployable.** In production Fastify serves both the API and the built web app (with SPA fallback), so it's one process, one port, and no CORS. In dev, Vite proxies `/api` for the same single-origin setup.
- **No Turborepo/Nx.** With three small packages, task caching isn't worth the setup cost. I'd revisit it if CI got slow or the package count grew.

### 2026-10-12: Deploy to Render as one web service
- Decision: one Render service runs Fastify, which serves both the API and the built web app.
- Why: one URL and no CORS; the in-memory data needs a single long-running process, so the API cannot be split into serverless functions or several instances.
- Tradeoff: the free tier sleeps when idle, so the first request after a pause is slow.

### 2026-10-12: API contract
| Method + path | Success | Errors |
|---|---|---|
| GET /api/stays?city&checkIn&checkOut&guests&minWifi&workspace&sort&page | 200 { items, total, page }; items include workScore, and a quote when dates are given | 400 |
| GET /api/stays/:id | 200 stay + workScore + review summary | 404 |
| GET /api/stays/:id/quote?checkIn&checkOut&guests | 200 Quote (available false + reason when not bookable) | 400, 404, 422 check-in in the past |
| GET /api/stays/:id/availability?from&to | 200 { blocked: string[] } (taken nights) | 400, 404 |
| GET /api/stays/:id/reviews?sort=recent|rating | 200 Review[] | 404 |
| POST /api/stays/:id/reviews | 201 Review | 400, 404, 422 moderation, 429 |
| POST /api/bookings | 201 Booking (server re-quotes) | 400, 404, 409 dates taken, 422 rule broken, 429 |
| GET /api/bookings/:id | 200 Booking | 404 |

409 = conflict with current state (someone else booked). 422 = request breaks a rule (too few nights).

Error codes (`error.code`):
- 400 VALIDATION_ERROR (details: the Zod issues)
- 404 NOT_FOUND
- 409 DATES_TAKEN
- 422 CHECK_IN_IN_PAST, INVALID_DATES, MIN_NIGHTS (details.minNights), MAX_GUESTS (details.maxGuests), REVIEW_REJECTED
- 429 RATE_LIMITED (POST routes: 10 per minute per IP)
- 500 INTERNAL_ERROR (stack only in the log), SIMULATED_FAILURE (dev only)

Dev only (NODE_ENV !== production): `?_delay=ms` (max 10 s) and `?_fail=1` on any GET, to demo loading and error states.
Every response has an `x-request-id` header (taken from the request or generated); the same id is in every log line for that request.

### 2026-10-12: API details
- Added fastify-type-provider-zod (typed routes from the shared Zod schemas) and @fastify/rate-limit. Their peers (@fastify/swagger, openapi-types) come along; Swagger isn't used.
- POST /bookings: guest name + email required, company / VAT / note optional. No card data, payment is mocked in the UI (in production Stripe would handle the card, the API only gets a token).
- Search with dates hides stays that are booked or too small. Stays below the minimum stay are shown with the reason, so the user can change dates.
- Seed bookings are full bookings (fake names, @example.com emails), priced with quote() at startup. Same shape as real bookings.
### 2026-10-12: Logo & Design
- Logo inspiration via ChatGPT & fineturning via VectorCraft (Opensource Adobe Illustrator)
- Generated wireframes in Claude Code in AirBnb stype in order to save time. Components + style guide generated based on Logo and wireframes in order to respect the timebox.

## Domain rules
- Dates are ISO YYYY-MM-DD strings. Check-out is exclusive: bookings 1-5 Nov and 5-8 Nov do not overlap.
- Check-in cannot be in the past. `today` is passed in as a parameter, so functions stay pure.
- Minimum nights per stay, default 3.
- Guests: 1 to maxGuests.
- Price = nights x nightly rate + cleaning fee + city tax.
- City tax: per person per night, a flat amount per city.
- Money is stored in integer euro cents and rounded once per line.
- The server rejects overlapping bookings with 409; a broken rule gets 422.
- quote() only does price. "Check-in in the past" is checked in availability.ts (isBookableFrom).
- quote() doesn't throw. It returns available: false + a reason code.
- Codes: INVALID_DATES, MIN_NIGHTS, MAX_GUESTS. The UI writes the text.
- If more rules break, the first wins: INVALID_DATES → MIN_NIGHTS → MAX_GUESTS.
- Price lines: { kind, amount }. Labels are done in the UI.
- Bad input (like 0 guests) is caught by Zod → 400. quote() only checks business rules.
- Shared tests run in Europe/Amsterdam time, otherwise the clock-change test is useless in CI (UTC).
- Past check-in → reason code CHECK_IN_IN_PAST (422). "Today" is the date in Europe/Brussels, not UTC.
- API order: past check-in → quote rules → overlap (409).
- isAvailable only checks dates; guests are checked in quote.
- Work score details: wifi linear 0-100 Mbps (capped), workspace office 25 / desk_monitor 20 / desk 15, noise from average review rating (no reviews = half points), coworking linear 0-5 km (none nearby = 0).
- nightsBetween uses UTC midnight, so clock changes don't affect the count.


## Assumptions
- Prices are in EUR.
- No accounts; the "verified stay" label on reviews is mocked.
- City tax is a flat amount per city (Amsterdam really uses a percentage). The seed's per-person amounts are approximate, not researched; Amsterdam is seeded at a flat €7.50.
- Seed bookings are stored as day offsets and turned into dates at startup, so the demo always has upcoming bookings. The Jordaan apartment is fully booked for the next 30 days on purpose.
- Payment is mocked; any 16 digits are accepted.
- Wifi speeds are seed data, not real measurements. The seed stores the measurement date as days ago, turned into `wifiMeasuredAt` at startup, so it always looks recent.

## Cut (and why)
- Long-stay (weekly/monthly) discounts: kept pricing simple; would add next.
- A dedicated "dates just booked" screen: the server still blocks double bookings; checkout shows the server's message through the normal error state.
- Compare view: not part of the core flow.
- Map view: needs a map library and API key; low value for the demo.
- Playwright e2e: the booking path is covered by API integration and component tests; one happy-path e2e test would come next.
- Accounts, real payments, holding dates during checkout, NL/FR/EN, host tools: out of scope for the timebox.

## Open questions