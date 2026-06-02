# Phase 1 Backend Migration Baseline

This document freezes the **Phase 1 backend/core migration** baseline for Trezalink.

## Intent
- Shift merchant operations ownership from legacy merchant-scoped model to **business-scoped model**.
- Keep app login principal as `Merchant`.
- Keep temporary compatibility shims to avoid breaking active tests and legacy sessions before Phase 2/3.

## Baseline Data Model (Phase 1)
- `Merchant`: auth principal (`email`, `password`, `isActive`, `emailVerified`, `activeBusinessId`).
- `BusinessEntity`: operational business tenant (`name`, `code`, `isActive`).
- `BusinessMembership`: user-to-business role membership (`OWNER`, `ADMIN`, `MEMBER`).
- `BusinessCredential`: business API key + webhook credentials.
- `MerchantPrivateWalletIdentity`: wallet identity for merchant login/personal use.
- `BusinessWalletIdentity`: business settlement wallet identity/history.
- `Transaction`, `WebhookLog`, `MerchantNotification`, `MerchantNotificationPreference`: ownership via `businessId`.
- `MerchantEmailVerificationToken`: token lifecycle moved out of `Merchant` row.

## Migration Strategy (Development)
- Migration mode is **force-reset compatible** for development workflows.
- Destructive reset is acceptable in this phase by assumption.
- Existing `merchantId`-first paths are not treated as source-of-truth anymore.

## Compatibility Shim Policy (Temporary)
- Keep guarded fallback paths for legacy session/API key/test contract compatibility.
- Every fallback branch must carry explicit marker:
  - `TODO(phase-3-cutover)`
- Shims will be removed in Phase 3 hard cutover.

## Backend Scope Boundary
Included in Phase 1 closure:
- Auth/session context (`activeBusinessId`) and merchant authorization helpers.
- Auth onboarding routes.
- Checkout API, wallet update, API key/webhook credential routes.
- Notification and export API routes.

Explicitly deferred to Phase 2:
- Merchant dashboard/adming aggregation/business analytics UI migration.
- Payment lifecycle internals beyond compile/test safety adaptations.

## Quality Gate
Phase 1 closure requires:
- `npm run test -- --reporter=dot` passes.
- Focused integration packs remain green:
  - checkout route
  - merchant notifications routes
  - merchant transactions export route
  - internal/merchant error-contract route
