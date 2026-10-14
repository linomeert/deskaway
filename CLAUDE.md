# Deskaway

Workation booking app (Booking.com-like) for a frontend take-home. Benelux stays for remote workers.

## Stack
- npm workspaces: apps/web (Vite 8, React 19, React Router 8 from the react-router package, TanStack Query, React Hook Form, Tailwind v4), apps/api (Fastify 5, pino), packages/shared (Zod 4 schemas, domain logic; internal package exporting TS source)
- TypeScript 6.x, NOT 7 (typescript-eslint does not support 7 yet). ESLint 10 flat config.
- Tests: Vitest 4 (one root config with test.projects), Testing Library + MSW + axe-core in web
- Node 24, ESM only

## Rules
- TypeScript strict. No `any`, no `as` casts, no ts-ignore. Infer types from Zod schemas in packages/shared.
- Business rules (pricing, availability, work score) live ONLY in packages/shared as pure functions. The API decides; the web app only displays.
- Never trust prices from the client. POST /bookings re-quotes on the server.
- API errors use one shape: { error: { code, message, details? } }.
- Accessible by default: semantic HTML, labelled inputs, buttons not divs, visible focus.
- Every async screen handles loading, empty and error states.
- UI uses only the design tokens and base components in apps/web/src/components. No arbitrary Tailwind values.
- Never edit test files I wrote unless I ask. If a test looks wrong, stop and explain.
- Do not add dependencies without asking me first.
- Small, focused changes. Do not refactor unrelated code.

## Design
- Screen layouts (desktop + mobile, Airbnb style) are in docs/wireframes.html. Follow its structure and the blue notes for each screen; colours and spacing come from the design tokens, not from that file.
## Commands
- npm run dev | lint | typecheck | test | build
- Before saying a task is done: run lint, typecheck and test, and report the results.

## Git
- Conventional commits (feat:, fix:, chore:, test:, docs:, ci:).
- Never push to main. Never commit secrets.