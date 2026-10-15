# LLM usage

## Summary

- **Tools:** Claude Code in VS Code for planning, code, tests and reviews. ChatGPT for the first logo proposals.
- **Model:** Claude Opus 5.5 with effort set to high. Most steps changed several files at once (shared rules, API and UI), and I wanted careful plans that I could review, not fast guesses.
- **What I owned:** the concept and scope, the architecture and stack, the API contract, the domain rules (pricing, availability, work score) and their test cases, the design choices, and the review of every plan and every diff.
- **What Claude did:** most of the first versions of the code: scaffolding, CI and release workflows, seed data, API routes, UI components, wireframes and component tests. It also flagged real issues on its own (see the log).
- **How much:** most lines were first written by Claude. The decisions in `NOTES.md` and the corrections in the log below are mine.

## Approach

### Before writing code

1. **Concept.** I picked a niche: workation stays for remote workers in the Benelux. Every feature answers one question: "Can I work here?" I brainstormed scope and features with Claude, then cut it down to what fits the timebox.
2. **Tech choices.** Some choices were mine from the start: React with Vite, Tailwind for styling, and Node 24. For the rest I asked Claude for options and their tradeoffs, then decided myself: Fastify + Zod for the API, TanStack Query for server state, and Render instead of Vercel, because in-memory data needs one long-running server. I also cut things on purpose, like Playwright end-to-end tests, to stay within the timebox. Before settling on versions I checked what's current, for example staying on TypeScript 6 because typescript-eslint doesn't support 7 yet.
3. **Structure.** I chose a monorepo with npm workspaces: `apps/web`, `apps/api` and `packages/shared`. The business rules and Zod schemas live in `shared`, so the API and the UI use the same rules.
4. **Plan and prompts.** To respect the timebox, I wrote a step-by-step plan with support from Claude Code, with a prepared prompt per step. Every prompt has the same shape: context, task, rules, verify. The steps, in order:
    0. Prepare tools, accounts, logo
    1. Repo, CLAUDE.md, first commit
    2. Scaffold the monorepo
    3. CI, branch protection, Render
    4. Domain rules and tests
    5. API and seed data
    6. Design system
    7. Screens (5 PRs)
    8. Quality pass (done per screen while building)
    9. Component and accessibility tests
    10. Release and deploy
    11. README and LLM note
    12. Recording
5. **Logo and design.** I got logo proposals from ChatGPT and finished the logo myself in VectorCraft. To respect the timebox, I used Airbnb's layout as a reference instead of designing everything from scratch: it's proven UX for browsing stays and it looks good. Claude made wireframes in that style and then built a small design system (tokens, base components and a `/styleguide` page) from the logo and the wireframes. I chose the accent colour myself.

### How I worked per step

- **One step, one branch, one PR.** I branched off an up-to-date `main` for every step and merged with a squash merge once CI was green.
- **Claude Code in VS Code**, next to the editor and the terminal.
- **`/clear` between features**, so old context didn't leak into the next step. Decisions that had to last went into `CLAUDE.md` (standing rules) and `NOTES.md` (decisions), not only into the chat.
- **Plan mode first.** I read every plan, pushed back where I disagreed (see the log), and only then let Claude build.
- **Review after building.** I read the diff, ran the app, and ran lint, typecheck and tests myself before committing.
- **Conventional commits**, so release-please can build the changelog and version from them.
- **Logging.** Every time I changed, rejected or questioned Claude's work, I added a row to the log below.

## Guardrails

- **Standing rules in `CLAUDE.md`:** strict TypeScript (no `any`, no `as` casts), business rules only in `packages/shared`, prices always recalculated on the server, accessible markup, loading/empty/error states, design tokens only.
- **Tests as the specification:** I decided the domain test cases first. Claude implemented against them and was not allowed to change my tests.
- **Tests that can fail:** I broke the code on purpose to check that the tests catch it.
- **CI must be green:** lint, typecheck, tests and build run on every PR, and `main` only accepts merges with a green check.
- **No new dependencies without asking:** Claude had to ask first, with a reason, and I said no to workarounds like `--legacy-peer-deps`.
- **Plan before code:** plan mode for every step, and I corrected the plan before any code was written.
- **No secrets or personal data:** the Render deploy hook went into GitHub by hand, never into a prompt. Card data never reaches the API, and logs contain no names or emails.

## Example prompts

Shortened here; the full prompts are in [docs/prompts.md](docs/prompts.md). Every prompt had the same shape: context, task, rules, verify.

**1. Implementing against my tests**
> The tests are the specification and are written by me. Implement quote() … Do NOT change my tests. If a test seems wrong, stop and tell me why.

Why: Claude can't make a test pass by changing what it expects.

**2. Correcting a plan (stay page)**
> The server decides overlap: GET /quote must also check isAvailable and return available: false, reason "DATES_TAKEN" … The booking card then uses only the quote. Keep hasBlockedNight only for calendar selection. Update the NOTES.md line accordingly.

Why: the plan let the browser decide whether dates were bookable. That broke my own rule (the API decides, the web only displays), so I sent it back.

**3. Proving a test can fail (time zone)**
> Set TZ=Europe/Amsterdam for the shared project only. Then prove it works: temporarily write a naive nightsBetween that divides local-time ms by 86400000, show the clock-change test failing, and delete it again.

Why: a green test only means something if it turns red on buggy code.

**4. A feature prompt (search page)**
> features/search: SearchPage, layout per @docs/wireframes.html section 1 … ALL filter state lives in the URL via useSearchParams … States: skeleton cards while loading, EmptyState that suggests relaxing the wifi filter, ErrorState with retry and request id. RULES: semantic HTML, only tokens and base components, mobile first. If a base component is missing, add it to /styleguide first.

Why: wireframe as the source, filters in the URL, and all three async states required up front.

**5. Polish without losing accessibility (favorites)**
> When a stay is ADDED (not removed, not on first page load), the heart in the header does a subtle pulse … Respect prefers-reduced-motion: no scaling then, only the colour change. The animation is decorative: the role="status" announcement stays the screen-reader feedback.

Why: a small product detail of my own, specified precisely, with reduced motion and screen readers thought through.

## Log
| Date | Task | What happened | What I did |
|---|---|---|---|
| 10-12 | Scaffold | Claude flagged that Git converts files to CRLF on Windows (core.autocrlf), which would make the Prettier check fail on a fresh clone | Checked the warning, accepted the fix: .gitattributes with `* text=auto eol=lf` and renormalised the files; lint passes |
| 10-12 | CI | Claude added two unrequested settings: read-only workflow token (least privilege) and failing the run when build output is missing | Checked both, kept them: limits damage from a compromised dependency, and a broken build can't pass silently |
| 10-12 | Pricing tests | Let Claude write the tests from my rules, no implementation | Checked every expected value myself before building |
| 10-12 | Pricing tests | Claude asked 5 design questions | I decided: reason codes, no throwing, kind + amount, extra edge cases |
| 10-12 | Availability tests | Claude found gaps: back-to-back only tested one side, no test with 2+ bookings | Added both tests |
| 10-12 | Availability tests | Noticed past check-in had no reason code | Decided CHECK_IN_IN_PAST + the API check order |
| 10-12 | Domain logic | Claude implemented all functions against my tests without changing them; all 38 pass | Reviewed the code and the work score choices |
| 10-12 | Work score | Claude invented workspace types (none/table/desk) that didn't match my plan | Corrected to desk / desk_monitor / office with my own scores |
| 10-12 | Domain tests | Broke the code on purpose (minNights, city tax, guest limit, rule order, cleaning fee) | Every change made a test fail; tests are trustworthy |
| 10-12 | Seed data | Claude left out country ("can be derived from city") | Added it: Benelux spans 3 countries; a seed test keeps city and country consistent |
| 10-12 | API | Claude asked before adding dependencies (as CLAUDE.md says) | Approved both + peers; rejected --legacy-peer-deps because CI would need it too |
| 10-12 | API | Claude offered a card number field in the booking | Said no: card data never goes to my API, payment stays mocked in the UI |
| 10-12 | API | Claude asked how search handles unbookable stays and what seed bookings look like | Hide booked/too small, show min-night reason; full seed bookings with fake data |
| 10-12 | API checks | Let Claude run the manual API checks and show real output; no code changes allowed | Checked each result myself; kept api.http to rerun them |
| 10-12 | Stay page | Plan let the browser decide overlap (/availability + hasBlockedNight) because /quote didn't check it | Moved the overlap check to /quote (DATES_TAKEN): the API decides, the web only displays |
| 10-12 | Stay page | Calendar plan had full keyboard support incl. Home/End/PageUp/PageDown | Trimmed to arrows + Enter/Space for the timebox |
| 10-14 | Reviews | My brief asked for "stayed N nights", but reviews have no nights data; Claude offered two options that change the schema | Dropped it for now, noted under Cut |
| 10-14 | Reviews | Claude focused the new review with `document.getElementById`. I asked why not a ref; Claude agreed a ref is more idiomatic, but warned that a callback ref would run before the Dialog's cleanup returns focus to "Write a review" and lose to it | Switched to a ref object focused in a `useEffect`, which runs after the cleanup; dropped the unused `reviewElementId` and `id`. |
| 10-14 | Reviews | Sorting looked broken: Claude's "pin the new review first" stayed on after changing the sort, so with 3 reviews both orders looked the same. Claude confirmed with curl that the API sorted correctly | Clearing the pin when the sort changes; [checked in the browser] |
| 10-14 | Checkout | Plan had a mock card form with normal autofill and no tests | Added autocomplete="off" + "Fill demo card" so no real card gets autofilled |
| 10-14 | Favorites | Plan only skipped deleted stays, so the header count would include them | Asked to prune 404 ids from the store so count and cards match |
| 10-14 | Refactor | Generated calendar (361 lines) and checkout (305 lines) were single large components | Had Claude split them by responsibility with a no-behaviour-change rule; checked tests + manual keyboard flow |
| 10-14 | Component tests | Claude set up MSW + typed fixtures and wrote 4 search tests (incl. axe) and the checkout 409 test | Reviewed every test, ran lint/typecheck/tests myself (41 web tests green) |