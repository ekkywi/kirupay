# Platform Operations / Maintenance Plan

## Summary
This document consolidates the maintenance roadmap and the Phase 1 end-to-end validation matrix into a single Git-safe reference.

The objective is to keep maintenance operations reliable for payments while preserving public visibility and admin recovery capabilities.

## Progress Snapshot
- Phase 1: **8 / 8 completed** (100%)
- Phase 2: **0 / 6 completed** (0%)
- Phase 3: **0 / 6 completed** (0%)
- Phase 4: **3 / 3 completed** (100%)

## Current Status
- Admin maintenance dashboard is implemented and active.
- Payments-only maintenance enforcement is active for critical flows:
  - `POST /api/v1/checkout`
  - `/pay/[id]`
  - Internal manual payment-link creation
- Maintenance API responses are standardized to `503` with a consistent payload.
- Status page maintenance banner overlap with fixed navbar has been fixed.
- Recovery center baseline is active (manual webhook retry + manual transaction resync).
- Middleware hardening and route-protection sync are completed.
- End-to-end test matrix is defined in this file.
- Phase 1 end-to-end matrix execution is complete (A1–D2 passed).
- Automated hardening baseline is active:
  - Integration tests for checkout + internal/merchant error contracts.
  - Smoke checkout flow tests (success + maintenance-block path).
  - Structured observability logs with request-level metrics-lite snapshots.
  - Docs diagnostics sweep aligned with runtime error contract.

## Phase 4 — Hardening (Completed)
1. [x] API integration + smoke test foundation.
2. [x] Structured observability with requestId and metrics-lite counters.
3. [x] Docs final sweep for contract and integration diagnostics.

### Phase 4 Validation Evidence
- `npm run test:integration` covers:
  - `POST /api/v1/checkout`: `201`, `400`, `401`, `409`, `503 + Retry-After`.
  - Internal confirm and internal telemetry contract failures.
  - Merchant unauthorized contract path for credential regeneration.
- `npm run test:smoke` covers:
  - Checkout session creation success with `/pay/:transactionId` URL shape.
  - Maintenance-mode block on same checkout flow with `503` contract.
- Structured observability is emitted under `[obs]` with:
  - `requestId`, endpoint/action target, outcome, status, duration, latency bucket.
  - Error counters by `target:errorCode` and aggregate endpoint stats.
- Metrics-lite snapshot endpoint: `GET /api/internal/observability/metrics`.

## Feature Structure
1. Maintenance Mode: emergency control to pause critical payment traffic.
2. System Health: RPC, latency, rate-limit, database, and infrastructure visibility.
3. Recovery Center: webhook retry, transaction resync, and mismatch recovery.
4. Announcements / Status: global messaging and status communication.
5. Support / Help: issue-reporting path and operator guidance.

## Roadmap

### Phase 1 — Must Have (Completed)
1. [x] Global Maintenance Mode toggle.
2. [x] Editable maintenance message.
3. [x] Admin bypass.
4. [x] Runtime enforcement (Payments-Only).
5. [x] Manual webhook retry for on-chain/database mismatch cases.
6. [x] Manual transaction resync for stale/mismatch cases.
7. [x] Baseline operations status in the maintenance dashboard.
8. [x] Final hardening: middleware policy sync + end-to-end test matrix.

### Phase 2 — Near-Term Backlog
1. RPC connectivity monitor with latency and rate-limit tracking.
2. Automatic fallback to backup RPC when primary fails.
3. Incident log for active/resolved disruptions.
4. Global announcement banner for incidents and maintenance windows.
5. Full status-change history (who changed what and when).
6. Public status page expansion for merchant/user visibility.

### Phase 3 — Advanced
1. Force-clear cache tooling for stale UI cases.
2. Scheduled maintenance start/end automation.
3. Partial read-only maintenance mode.
4. Notification history and incident update center.
5. Auto-recovery rules for recurring failure patterns.
6. IP allowlist or granular bypass controls.

## Guiding Decisions
- Maintenance is an operations umbrella, not a single toggle.
- Phase 1 scope is locked to **Payments-Only** enforcement.
- Public non-payment pages remain accessible during maintenance.
- Maintenance state is persisted in the database for auditability.
- Admin UI follows existing dashboard design patterns.
- Status page remains the primary public communication channel.

## Relevant Code Areas
- `src/components/dashboard/Sidebar.tsx` (maintenance menu entry)
- `src/app/(main)/admin/layout.tsx` (admin-only access baseline)
- `src/middleware.ts` (private route auth enforcement)
- `prisma/schema.prisma` (maintenance state model)
- `src/components/admin/AdminUI.tsx` (shared admin UI components)
- `src/app/status/page.tsx` (public maintenance visibility)
- `src/app/(main)/admin/maintenance/page.tsx` (operations control center)

## Verification Checklist
1. Confirm maintenance policy blocks only intended payment-critical flows.
2. Confirm admin access remains available during maintenance.
3. Confirm webhook retry and transaction resync run successfully.
4. Confirm status messaging remains consistent with runtime state.
5. Confirm default maintenance message consistency across:
   - Prisma schema default
   - Service constant fallback
   - Singleton DB row (`PlatformMaintenance` with `id = global`)

## Open Questions
1. Should specific internal endpoints (ops/confirmation utilities) always bypass maintenance policy?
2. Should incident logs and status management remain split or become maintenance submenus?
3. Should recovery center remain embedded in one page or move into a dedicated module?

## End-to-End Test Matrix (Phase 1 Hardening)

### Execution Status (Code + Lint Verification)
- A1 Public pages remain accessible: **PASS (manually verified)**  
  Reason: public non-payment pages were confirmed accessible in runtime checks.
- A2 Checkout page works when maintenance OFF: **PASS (manually verified)**  
  Reason: `/pay/[id]` was confirmed to render normal checkout when maintenance is OFF.
- A3 Checkout API works when maintenance OFF: **PASS (manually verified)**  
  Reason: `POST /api/v1/checkout` was confirmed to return successful checkout creation flow.
- A4 Internal manual payment-link creation works when maintenance OFF: **PASS (manually verified)**  
  Reason: manual payment-link creation was confirmed to succeed when maintenance is OFF.
- B1 Public non-payment pages accessible when maintenance ON: **PASS (manually verified)**  
  Reason: public pages remained accessible and `/status` displayed maintenance banner.
- B2 Checkout page blocked when maintenance ON: **PASS (manually verified)**  
  Reason: `/pay/[id]` displayed maintenance view during maintenance ON.
- B3 Checkout API blocked with consistent `503` payload: **PASS (manually verified)**  
  Reason: API returned maintenance response with expected payload shape.
- B4 Internal manual payment-link creation blocked when maintenance ON: **PASS (manually verified)**  
  Reason: creation flow was blocked during maintenance ON as expected.
- C1 Private app routes require auth: **PASS (manually verified)**  
  Reason: private routes redirected to `/login` without valid auth.
- C2 Invalid token is cleared: **PASS (manually verified)**  
  Reason: invalid auth token path was confirmed to redirect and clear session.
- C3 Signed-in users redirected away from auth pages: **PASS (manually verified)**  
  Reason: authenticated access to `/login` and `/register` redirected to `/dashboard`.
- D1 Admin access during maintenance ON: **PASS (manually verified)**  
  Reason: admin maintenance access remained available while maintenance ON.
- D2 Recovery actions usable during maintenance ON: **PASS (manually verified)**  
  Reason: recovery actions remained executable and reflected expected behavior.

### Execution Result
- Total scenarios: **13**
- Passed: **13**
- Failed: **0**
- Blocked: **0**

### Manual Validation Note
- Manual runtime verification completed for all matrix scenarios.
- Maintenance ON API response confirmed with payload: `error`, `message`, `maintenanceEndsAt`.

### Prerequisites
- Admin account can access `/admin/maintenance`.
- Non-admin merchant account is available.
- At least one valid payment link exists (`/pay/[id]`).
- Merchant API key is available for `POST /api/v1/checkout`.

### Group A — Maintenance OFF

#### A1. Public pages remain accessible
1. Set maintenance `OFF` at `/admin/maintenance`.
2. Open `/`, `/pricing`, `/docs`, `/status`.
3. Expected:
   - All pages render normally.
   - No maintenance banner appears on `/status`.

#### A2. Checkout page works
1. Open a valid `/pay/[id]`.
2. Expected:
   - Checkout page renders normally (not maintenance view).

#### A3. Checkout API works
1. Call `POST /api/v1/checkout` with a valid API key.
2. Expected:
   - HTTP `201`.
   - Response includes `transactionId` and `checkoutUrl`.

#### A4. Internal manual payment-link creation works
1. Sign in as merchant.
2. Create a manual payment link from dashboard.
3. Expected:
   - Creation succeeds.
   - New link/transaction appears in list.

### Group B — Maintenance ON (Payments-Only)

#### B1. Public non-payment pages stay accessible
1. Set maintenance `ON` and provide a custom maintenance message.
2. Open `/`, `/pricing`, `/docs`, `/status`.
3. Expected:
   - Pages remain accessible.
   - `/status` shows maintenance banner.

#### B2. Checkout page is blocked
1. Open `/pay/[id]`.
2. Expected:
   - Maintenance view is displayed.
   - Message matches admin maintenance message.

#### B3. Checkout API is blocked consistently
1. Call `POST /api/v1/checkout` with valid payload.
2. Expected:
   - HTTP `503`.
   - Body includes `error`, `message`, `maintenanceEndsAt`.
   - `Retry-After` header is present.

#### B4. Internal manual payment-link creation is blocked
1. Sign in as merchant.
2. Attempt manual payment-link creation.
3. Expected:
   - Request is rejected.
   - Maintenance error message is shown.
   - No new transaction is created.

### Group C — Auth/Middleware Sync

#### C1. Private routes require auth
1. Clear `auth-token` cookie.
2. Open `/dashboard`, `/payments`, `/payment-links`, `/analytics`, `/settings`, `/developers`, `/admin/overview`.
3. Expected:
   - Redirect to `/login` for all private routes.

#### C2. Invalid token is cleared
1. Set an invalid `auth-token`.
2. Open a private route (example: `/admin/maintenance`).
3. Expected:
   - Redirect to `/login`.
   - `auth-token` cookie is cleared.

#### C3. Auth pages redirect for signed-in users
1. Sign in with valid account.
2. Open `/login` or `/register`.
3. Expected:
   - Redirect to `/dashboard`.

### Group D — Recovery and Admin Operations During Maintenance

#### D1. Admin access remains available
1. Set maintenance `ON`.
2. Sign in as admin and open `/admin/maintenance`.
3. Expected:
   - Admin page is accessible.

#### D2. Recovery actions remain usable
1. In `/admin/maintenance`, run:
   - Webhook retry action
   - Manual transaction resync action
2. Expected:
   - Actions execute successfully.
   - Related admin views are revalidated.

### Pass Criteria
- All scenarios in groups A, B, C, and D pass without behavior mismatch.
- No payment write-critical route bypasses maintenance when `ON`.
- No public non-payment route is accidentally blocked.
