# Simulactic Frontend Client

Frontend client for Simulactic: authenticated galaxy exploration, 3D interaction, donations flow, profile management, and admin operations dashboard.

## Overview

- Runtime: Next.js 16 + React 19 + TypeScript (strict)
- Rendering: Three.js + React Three Fiber
- Global state: Zustand
- Validation and contracts: Zod + typed DTO/domain mappers
- API base prefix consumed by client: `/api/v1`
- Backend remains the Single Source of Truth (no client-side procedural generation)

## Client Strategy

This client follows a domain-oriented frontend architecture and strict separation of concerns:

- `src/domain`: entities, value objects, domain rules, mappers
- `src/application`: use-case hooks, orchestration, render coordination
- `src/infra`: HTTP/API client and endpoint adapters
- `src/state`: global stores (`auth`, `galaxy`, `render`, `ui`, `admin`)
- `src/3d`: scene engine and interaction bridge
- `src/ui`: reusable presentation components, overlays, popups
- `src/app`: Next.js routes and route layouts only

The 3D layer consumes serialized data and emits events. It does not call APIs and does not mutate domain state directly.

## API Consumption Strategy

HTTP communication is centralized in `src/infra/api/client.ts`:

- Typed methods: `apiGet`, `apiPost`, `apiPatch`, `apiPut`, `apiDelete`
- Query serialization supports scalars, arrays, dates, and nullish filtering
- Default timeout with abort support and signal forwarding
- Error contract uses `ApiError` with `status` and parsed `body`
- `204` responses map to `undefined`
- Non-JSON responses are parsed as text

Feature adapters (`galaxy.api.ts`, `user.api.ts`, `donation.api.ts`, etc.) expose backend endpoints as typed client functions.

## Rendering and Interaction Model

Two exclusive view modes are handled by the render state machine:

- `galaxy` view: systems as stars, overview interaction
- `system` view: stars, planets, moons, asteroids

Transitions are explicit and guarded:

- `galaxy_ready -> system_loading -> system_ready`
- `system_ready -> galaxy_loading -> galaxy_ready`

3D events are routed through `EventBridge` and `bind3dEvents` to synchronize popup requests, hover/click behavior, and view transitions.

## Routes

Main routes:

- `/` landing page
- `/login`, `/signup` auth
- `/dashboard` galaxy renderer and management
- `/me` profile, creations and donation history
- `/donations` Stripe checkout flow and return handling
- `/admin` operational dashboard (admin-only)
- `/privacy-policy`, `/terms`

### `useSearchParams` rule

Any page/component using `useSearchParams()` is wrapped in `Suspense` to satisfy Next.js prerender requirements in CI builds.

## Auth and Access Rules (UI level)

- Unauthenticated users are redirected from protected routes
- Non-admin users cannot access `/admin`
- Non-supporters are blocked at 3 galaxy creations in UI
- Supporters/admin can create beyond UI limit

Backend remains final authority for all authorization and limits.

## Local Development

From `frontend/`:

```bash
npm ci
npm run dev
```

Default local app URL:

- `http://localhost:3000`

## Build and Quality Gates

```bash
npm run lint
npm run typecheck
npm run test
npm run validate
npm run build
```

`validate` enforces:

- lint
- typecheck
- full test suite (run in-band)

## Testing Strategy

Test suites are split by concern under `src/test/`:

- `unit`: domain objects, stores, pure utilities, edge cases
- `integration`: API client and endpoint adapter contracts
- `e2e`: renderer-event/user-flow behavior at app orchestration level

Commands:

```bash
npm run test:unit
npm run test:integration
npm run test:e2e
```

## Git Hooks

Husky pre-commit is configured to block commits unless validation passes:

- `.husky/pre-commit` runs `npm run validate`

Enable hooks once after clone:

```bash
npm run prepare
```

## CI/CD Workflows

GitHub workflows in `.github/workflows`:

- `ci.yml`
  - triggers on PR and pushes (`main`, `master`, `develop`)
  - runs install, lint, typecheck, build, tests
- `cd.yml`
  - triggers on push (`main`, `master`) and manual dispatch
  - runs validate + build + artifact packaging
  - includes deploy placeholder job for production

## Environment Variables (Minimum)

- `NEXT_PUBLIC_API_BASE_URL`

Example in `.env.example`:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

## Operational Notes

- Next.js telemetry and build cache notices are informational
- Production build can fail if required remote resources (e.g., Google Fonts) are unreachable in restricted environments
- For deterministic CI, keep route hooks compatible with static prerender constraints (especially `useSearchParams` + `Suspense`)
