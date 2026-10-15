# Prompts

The full versions of the example prompts in [LLM_USAGE.md](../LLM_USAGE.md). Every prompt follows the same shape: context, task, rules, verify. Prompts 2 and 3 were replies to a plan or a question from Claude, not standalone prompts.

## 1. Implementing against my tests

```text
CONTEXT: @packages/shared/src/pricing.test.ts @packages/shared/src/availability.test.ts @packages/shared/src/schemas.ts @NOTES.md. The tests are the specification and are written by me.

TASK: Implement quote() in pricing.ts, nightsBetween(), isAvailable() and isBookableFrom(checkIn, today) in availability.ts, workScore(stay, reviews) in workScore.ts.

RULES: Pure functions, no Date.now(), no I/O. Do NOT change my tests. If a test seems wrong, stop and tell me why. Write tests for workScore yourself and list them for my review.

VERIFY: npm run test -w @deskaway/shared, all green. Show the output.
```

## 2. Correcting a plan (stay page)

Reply to Claude's plan for the stay page, which let the browser decide whether dates were already booked.

```text
Two changes, then show the updated plan:
1. The server decides overlap: GET /quote must also check isAvailable and return available: false, reason "DATES_TAKEN" when the range overlaps a booking (order: past check-in -> quote rules -> overlap). Add an API test for it. The booking card then uses only the quote for Reserve/reason ("Some of these nights are already booked"). Keep hasBlockedNight only for calendar selection. Update the NOTES.md line accordingly.
2. Calendar keyboard: arrows + Enter/Space only; drop Home/End and PageUp/PageDown (and their tests).
```

## 3. Proving a test can fail (time zone)

Reply to three questions from Claude about the pricing tests.

```text
1: reject in the Zod schema (guests >= 1, becomes 400 at the API); drop the 0-guests quote test and add a schema test instead. 2: yes, fixed order INVALID_DATES -> MIN_NIGHTS -> MAX_GUESTS, and add a test with two broken rules. 3: yes, set TZ=Europe/Amsterdam for the shared project only in the Vitest config. Then prove it works: temporarily write a naive nightsBetween that divides local-time ms by 86400000, show the clock-change test failing, and delete it again.
```

## 4. A feature prompt (app shell + search page)

```text
CONTEXT: @CLAUDE.md @packages/shared/src/schemas.ts @NOTES.md (API contract) @apps/web/src/components.

TASK:
1. apps/web/src/app: React Router 8 in data mode (createBrowserRouter imported from react-router; react-router-dom no longer exists) with routes /, /stays/:id, /checkout/:id, /bookings/:id and a 404, QueryClientProvider, layout with the Header and a footer showing the app version, top-level error boundary.
2. lib/api.ts: typed fetch wrapper that parses responses with the shared Zod schemas and throws an ApiError carrying status, code, message and the x-request-id header.
3. features/search: SearchPage, layout per @docs/wireframes.html section 1.
   - Search pill in the header (where / when / who): opens an editor with city (select), check-in/check-out (native date inputs) and guests.
   - Work filter chips below it: "Wifi 100+" (minWifi=100) and one workspace choice (desk, desk + monitor, office; single select, chips act like a radio group). A "Filters" chip opens the Dialog with every filter, including a min wifi slider (0-500, step 50). On mobile the chips scroll sideways.
   - ALL filter state lives in the URL via useSearchParams; a hook useStaySearchParams() parses it with the shared schema.
   - useQuery keyed on the parsed params.
   - StayCard (Airbnb style, see @docs/wireframes.html section 1): no border, square-ish photo with rounded corners, work score tag on the photo, heart top right; below: city + rating (or "New"), title, wifi + workspace, price per night. No total on the card.
   - Sort chip: work score, price per night.
   - States: Skeleton cards while loading, EmptyState that suggests relaxing the wifi filter, ErrorState with retry and request id.

RULES: Semantic HTML (form, fieldset, legend, label). Only tokens and base components. Mobile first. If a base component is missing (Chip, SearchPill), add it to apps/web/src/components and to /styleguide first.

VERIFY: lint, typecheck. Then list URLs for me to try, including one that returns empty and one with ?_fail=1.
```

## 5. Polish without losing accessibility (favorites)

```text
CONTEXT: @apps/web/src/features @apps/web/src/components @apps/web/src/lib/api.ts @docs/wireframes.html (section 5). useFavorites, the FavoriteButton on StayCard and the SaveButton on the stay page already exist: reuse them, don't rebuild them.

TASK: features/favorites. Favorites live in the browser: no accounts, no API changes.
- /favorites route: a header link "Favorites" with a heart icon and the count on desktop, and a bottom tab bar (Search · Favorites) on mobile.
- FavoritesPage: loads each saved stay with useQueries on GET /api/stays/:id, shows them as StayCards, skips ids that no longer exist, and shows an EmptyState linking to search when there are none.
- Save feedback: when a stay is ADDED (not removed, not on first page load), the heart icon in the header and in the mobile tab bar does a subtle pulse: scale 1 -> 1.25 -> 1 over about 400 ms with ease-out, and the count briefly turns accent-coloured. Only when the count goes up; restart the animation if the user saves again quickly.
  - Use a CSS @keyframes animation defined once next to the design tokens, triggered by a short-lived class or a key change. No animation library.
  - Respect prefers-reduced-motion: no scaling then, only the colour change.
  - The animation is decorative: the existing role="status" announcement stays the screen-reader feedback, and the icon stays aria-hidden.

RULES: Only tokens and base components. Add the pulse to /styleguide (a button that triggers it) so it can be reviewed in isolation.

VERIFY: lint, typecheck; a 4-step manual test plan including the pulse and the reduced-motion case (DevTools > Rendering > Emulate prefers-reduced-motion).
```
