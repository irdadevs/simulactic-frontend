# Simulactic Frontend

Next.js frontend client for Simulactic. It renders the galaxy/system 3D experience, authenticated user flows, donations, profile management, and the operational admin dashboard.

## Stack

- Next.js 16
- React 19
- TypeScript strict mode
- Three.js and React Three Fiber
- Zustand
- Zod
- Jest
- Sileo

## Architecture

The frontend follows the repo DDD split defined in `AGENTS.md`.

- `src/app`: routes, layouts, route-only concerns
- `src/domain`: frontend-safe aggregates, value objects, mappers
- `src/application`: hooks and orchestration
- `src/infra`: typed API adapters and client
- `src/state`: Zustand stores
- `src/ui`: reusable presentation components
- `src/3d`: rendering engine only

Important rules:

- Backend is the single source of truth.
- Frontend does not procedurally generate domain entities.
- 3D code does not call APIs and does not contain auth/business logic.
- Galaxy and system views stay isolated; they are not kept mounted together.

## Main Routes

- `/`: landing page
- `/login`, `/signup`
- `/dashboard`: galaxy and system renderer
- `/me`: profile, account settings, supporter progress, donations history
- `/donations`: Stripe donation flow and supporter guide
- `/admin`: admin dashboard
- `/privacy-policy`, `/terms`

## Environment Variables

Validated in `src/config/env.ts`.

- `NEXT_PUBLIC_API_BASE_URL`
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_TRAFFIC_TRACKING_ENABLED`
- `NEXT_PUBLIC_LOG_LEVEL`

Example:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_TRAFFIC_TRACKING_ENABLED=true
NEXT_PUBLIC_LOG_LEVEL=warn
```

Notes:

- invalid public env config throws during startup
- `NEXT_PUBLIC_SITE_URL` is used for metadata, sitemap, and robots
- `NEXT_PUBLIC_LOG_LEVEL` gates the client logger
- `NEXT_PUBLIC_TRAFFIC_TRACKING_ENABLED=false` disables traffic tracking globally

## Development

From `frontend/`:

```bash
npm ci
npm run dev
```

Default local URL:

- `http://localhost:3000`

## Quality Gates

```bash
npm run lint
npm run typecheck
npm run test
npm run validate
npm run build
```

`validate` runs:

- ESLint
- TypeScript no-emit check
- Jest in-band

## Testing

Test folders:

- `src/test/unit`
- `src/test/integration`
- `src/test/e2e`

Available commands:

```bash
npm run test:unit
npm run test:integration
npm run test:e2e
```

Current test runner is Jest-based. This repo has jsdom available for component tests, but it is not set up as a dedicated browser E2E runner like Playwright or Cypress.

## API Client

HTTP access is centralized in `src/infra/api/client.ts`.

- typed `GET/POST/PATCH/PUT/DELETE` helpers
- query serialization for scalars, arrays, dates, and null filtering
- timeout + abort support
- normalized `ApiError`

Feature-specific adapters live in `src/infra/api/*.api.ts`.

Relevant recent endpoints used by the frontend:

- `POST /users/verify`
- `POST /users/verify/resend`
- `GET /users/me/supporter-progress`
- `GET /donations/badges`

## Traffic Analytics

Traffic page views are tracked from the app layout and reported through the metrics pipeline.

Current behavior:

- route visits are tracked as `traffic.page_view`
- elapsed route duration is sent on route leave / page hide
- tracker respects browser Do Not Track
- tracker also respects the in-app analytics opt-out preference stored in local storage

Admin traffic analytics now use the dedicated backend endpoint instead of reconstructing route data from raw metrics:

- `GET /metrics/performance/traffic`

Backend behavior relevant to the frontend:

- date-only query params are normalized to full UTC day boundaries
- traffic analytics range is capped to 366 days
- frontend clamps the traffic request to the latest 366 days of the selected admin range to keep the dashboard working instead of failing

## Logging

Log contracts now behave like this:

- `GET /logs?view=dashboard`: sanitized admin list
- `GET /logs/:id?view=dashboard`: raw single-log admin detail

Frontend behavior:

- admin log table uses the sanitized list response
- opening details fetches the raw single-log detail before showing the modal
- admin note updates are supported
- clearing an admin note preserves audit metadata in the UI to match backend behavior
- resolved non-info logs can be reopened

## Auth and Verification

Authentication flows now include a verification-code modal.

Current behavior:

- signup stores the authenticated user response and opens a verification modal when the returned user is not verified
- login does the same when the returned user is unverified
- login also handles `USERS.EMAIL_NOT_VERIFIED` by opening the same modal even if the backend rejects the session
- the modal supports both code submission and resend
- verification codes are treated as 8-character codes to match the current backend generation behavior

## Admin Dashboard

The admin panel is split into these sections:

- Overview
- Entities
- Users
- Donations
- Logs
- Bans
- Metrics
- Traffic

Current operational behavior:

- data loads by active section instead of a single monolithic dashboard fetch
- each section has explicit loading, error, and empty states
- large tables are paginated
- logs support detail view, resolve, reopen, admin notes, bulk resolve by level, ban user, and ban IP
- bans support unban for users and IPs
- traffic uses backend aggregated analytics
- bans include abuse observability charts based on security logs

The main dashboard page is intentionally being decomposed into reusable UI components under:

- `src/ui/components/admin`
- `src/ui/components/admin/sections`
- `src/ui/components/admin/charts`

## Profile and Supporter Progress

The `/me` route is split into smaller profile components and a page-level data hook.

Current supporter behavior:

- supporter progress is loaded from `GET /users/me/supporter-progress`
- the badge wall uses the real backend catalog from `GET /donations/badges`
- unlocked state comes from real supporter progress, not client-side inference
- if the badge catalog is empty in the current environment, the UI falls back to the seeded definitions so the wall can still render
- locked and unlocked badges are visually differentiated in the profile UI

## Privacy and Metadata

Implemented app/runtime metadata:

- `src/app/robots.ts`
- `src/app/sitemap.ts`
- `metadataBase` from `NEXT_PUBLIC_SITE_URL`

Privacy-related behavior:

- analytics preference card in `/me`
- DNT-aware traffic tracking
- privacy policy updated to reflect traffic analytics behavior

## Git Hooks and CI

Husky pre-commit is configured through `npm run prepare`.

Before committing:

```bash
npm run prepare
npm run validate
```

## Production Notes

- remote font/network restrictions can still affect `next build` in locked-down environments
- admin traffic analytics are backend aggregated and stable across dashboard state changes
- very large admin date ranges still show only the latest 366 days for traffic because that is the backend contract
