# Trezalink

Trezalink is a Solana-native payment infrastructure app built with Next.js App Router, Prisma, and PostgreSQL.  
It provides:
- hosted checkout links (`/pay/[id]`)
- merchant/admin dashboards
- checkout API (`POST /api/v1/checkout`)
- maintenance operations and recovery tooling (resync + webhook retry)

## Who This Is For
- Merchants and product teams that need wallet-direct SOL payments.
- Operations/admin teams that need incident controls and recovery tools.
- Developers integrating checkout and maintaining the platform.

## Quick Links
- Public status page: `/status`
- Hosted checkout runtime: `/pay/[id]`
- Checkout API endpoint: `POST /api/v1/checkout`
- Admin maintenance center: `/admin/maintenance`
- Maintenance implementation plan: [`plan.md`](./plan.md)

## Core Features
- Non-custodial SOL checkout flow.
- Merchant payment links and transaction tracking.
- Admin operations center with maintenance mode controls.
- Payments-only maintenance enforcement for critical payment flows.
- Webhook delivery logging and retry tooling.
- Manual transaction resync for mismatch/stale states.

## For Merchants & Product Teams
- Accept SOL payments with hosted checkout links.
- Track payment status and transaction history in the merchant dashboard.
- Use public status visibility during maintenance windows.
- Benefit from a payments-only maintenance model (non-payment public pages stay accessible).

## For Operations & Admin Teams
- Enable/disable maintenance mode from admin controls.
- Update maintenance messaging and estimated return time.
- Perform manual recovery actions:
  - transaction resync
  - webhook retry
- Monitor pending transactions and failed webhook queues.

## For Developers
- Integrate via `POST /api/v1/checkout`.
- Use Prisma/PostgreSQL for persistence.
- Use middleware-protected private routes and JWT-based auth.

## Tech Stack
- Next.js `16.2.x` (App Router)
- React `19`
- TypeScript
- Prisma `7` + PostgreSQL
- Tailwind CSS `4`
- Solana wallet adapter + `@solana/web3.js`

## App Architecture (High-Level)
- Public pages: marketing/docs/status pages.
- Checkout runtime: `/pay/[id]` + `POST /api/v1/checkout`.
- Merchant area: dashboard, payments, payment links, analytics, settings, developers.
- Admin area: overview, transactions, revenue, merchants, maintenance.
- Persistence: Prisma models for `Merchant`, `BusinessEntity`, `BusinessMembership`, `BusinessCredential`, `Transaction`, `WebhookLog`, and `PlatformMaintenance`.

## Local Setup
1. Install dependencies
```bash
npm install
```

2. Prepare environment variables (`.env`)

3. Apply database migrations
```bash
npx prisma migrate deploy
```

4. Generate Prisma client
```bash
npx prisma generate
```

5. Run development server
```bash
npm run dev
```

6. Open:
```text
http://localhost:3000
```

## Environment Variables
| Variable | Required for local boot | Purpose |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection used by Prisma |
| `JWT_SECRET` | Yes | Auth token signing/verification |
| `NEXT_PUBLIC_BASE_URL` | Yes | Base URL used to generate checkout links |
| `NEXT_PUBLIC_TREASURY_WALLET` | Yes | Treasury wallet address used in checkout flow |
| `SOLANA_CLUSTER` | Optional | Server-side cluster fallback (`devnet`, `testnet`, or `mainnet-beta`) |
| `SOLANA_RPC_PRIMARY` | Optional* | Server-side primary Solana RPC endpoint |
| `SOLANA_RPC_FALLBACK` | Optional | Server-side backup Solana RPC endpoint |
| `NEXT_PUBLIC_SOLANA_CLUSTER` | Optional | Client-side cluster fallback (`devnet`, `testnet`, or `mainnet-beta`) |
| `NEXT_PUBLIC_SOLANA_RPC_PRIMARY` | Optional | Client-side primary Solana RPC endpoint (checkout + balance fetch) |
| `NEXT_PUBLIC_SOLANA_RPC_FALLBACK` | Optional | Client-side backup Solana RPC endpoint (auto failover target) |
| `RPC_LATENCY_WARN_MS` | Optional | Warning latency threshold for RPC monitor |
| `RPC_LATENCY_DOWN_MS` | Optional | Down latency threshold for RPC monitor |
| `RPC_RATE_LIMIT_WARN_PERCENT` | Optional | Warning threshold (%) for 1h rate-limited checks |
| `RPC_RATE_LIMIT_CRITICAL_PERCENT` | Optional | Critical threshold (%) for 1h rate-limited checks |
| `RPC_HEALTH_CRON_SECRET` | Optional | Shared secret for internal RPC health cron route |
| `PAYMENT_LIFECYCLE_CRON_SECRET` | Optional | Shared secret for internal payment lifecycle cron route (`/api/internal/payment-lifecycle/cron`) |
| `CRON_SECRET` | Optional | Fallback shared secret for internal cron routes when route-specific secret is not set |
| `RESEND_API_KEY` | Optional* | Email delivery (activation/profile flows) |
| `FRONTEND_URL` | Optional* | Email link base URL |

\* Optional for basic local boot, required if testing email-related auth flows.

## Database & Prisma
- Schema file: `prisma/schema.prisma`
- Migrations: `prisma/migrations`
- Maintenance state is persisted in `PlatformMaintenance` singleton row (`id = "global"`).

Useful commands:
```bash
npx prisma migrate deploy
npx prisma generate
```

## Run Scripts
```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Operational Guarantees (Phase 1)
- Maintenance scope is **Payments-Only**.
- Public non-payment pages remain available during maintenance.
- Payment-critical paths are blocked during maintenance:
  - `/pay/[id]`
  - `POST /api/v1/checkout`
  - internal manual payment-link creation
- Admin maintenance and recovery actions remain available during maintenance.

## Maintenance Mode Behavior (Phase 1)
Scope: **Payments-Only**

When maintenance is ON:
- `/pay/[id]` is blocked and shows maintenance view.
- `POST /api/v1/checkout` returns `503`.
- Internal manual payment-link creation is blocked.
- Public non-payment pages remain accessible.
- Admin access and recovery actions remain available.

Expected maintenance API response payload:
- `error`
- `message`
- `maintenanceEndsAt`

## API Quick Start
Endpoint:
```text
POST /api/v1/checkout
Authorization: Bearer <API_KEY>
Content-Type: application/json
```

Example body:
```json
{
  "orderId": "ORDER-1001",
  "amount": 1.25,
  "currency": "SOL",
  "customerEmail": "buyer@example.com"
}
```

## Operational Recovery
Admin maintenance page includes:
- Manual transaction resync
- Failed webhook retry
- Pending transaction queue with prefill support

## Cron Operations
- Production (Vercel):
  - Vercel Cron runs every 5 minutes for:
    - `/api/internal/rpc-health/cron`
    - `/api/internal/payment-lifecycle/cron`
  - Configure `PAYMENT_LIFECYCLE_CRON_SECRET` (or fallback `CRON_SECRET`) in Vercel environment variables.
- Development (local):
  - Vercel Cron does not run in local `npm run dev`.
  - Trigger lifecycle cron manually when needed (Postman or curl), for example:
```bash
curl -H "x-cron-secret: <PAYMENT_LIFECYCLE_CRON_SECRET>" \
  http://localhost:3000/api/internal/payment-lifecycle/cron
```

## Troubleshooting
### 1) `relation "PlatformMaintenance" does not exist`
- Run migrations and regenerate Prisma client:
```bash
npx prisma migrate deploy
npx prisma generate
```

### 2) Maintenance message looks stale
- The singleton row may still contain an old message.
- Update message from admin maintenance page, or update `PlatformMaintenance` row directly.

### 3) Unexpected redirects on private routes
- Private app routes are guarded by middleware and `auth-token`.
- Invalid/expired tokens are cleared and redirected to `/login`.

## Project Planning
Maintenance implementation and validation record is tracked in:
- [`plan.md`](./plan.md)
- Backend migration baseline and shim policy for Phase 1 closure:
  - [`PHASE1_BACKEND_MIGRATION.md`](./PHASE1_BACKEND_MIGRATION.md)
