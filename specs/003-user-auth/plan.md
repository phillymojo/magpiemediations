# Implementation Plan: User Authentication

**Branch**: `003-user-auth` | **Date**: 2026-05-20 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/003-user-auth/spec.md`

## Summary

Add Clerk-powered authentication to the platform: sign-up, sign-in, sign-out, password reset, and protected routes. When a user registers, a Clerk webhook syncs their record to a new `User` table in Postgres. Booking routes are protected by Clerk middleware composed into the existing `proxy.js`. Auth UI is provided by Clerk's embedded `<SignIn />` / `<SignUp />` components on catch-all routes.

## Technical Context

**Language/Version**: JavaScript / Node.js 20+ (AWS Amplify Lambda)
**Primary Dependencies**: Next.js 16 / React 19 (App Router), `@clerk/nextjs`, `svix`, Prisma v5, Tailwind CSS v4, shadcn/ui
**Storage**: Postgres on Neon; new `User` table synced via Clerk webhook
**Testing**: Jest + React Testing Library; webhook handler requires unit tests (state-change per Principle IV)
**Target Platform**: AWS Amplify Hosting
**Performance Goals**: Sign-in redirect ≤ 500ms; webhook processing ≤ 2s (SC-002, SC-006)
**Constraints**: No PII in logs; webhook signatures verified before any DB write; Clerk instance pinned to us-east-1
**Scale/Scope**: MVP; user base expected < 1,000 at launch

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Status | Notes |
|---|---|---|
| I. Confidentiality by Default | ✅ Pass | Clerk handles all token management. No case content involved in auth. Webhook handler MUST NOT log email or name fields (PII scrubbing). |
| II. Platform, Not a Law Firm | ✅ Pass | Sign-in/up pages are functional forms. No legal advice implied. Disclaimer in global footer (already implemented) covers all pages. |
| III. Verified Mediators, Always | ✅ Pass | No changes to mediator verification logic. |
| IV. High-Stakes Flows Are Test-First | ✅ Pass | The webhook handler writes User records to Postgres — a state change requiring tests. Tests must cover: valid signature → upsert, invalid signature → 400, duplicate event → idempotent, user.deleted → hard delete. |
| V. Buy, Don't Build | ✅ Pass | Clerk is the pre-selected provider per the constitution. No custom auth primitives. Svix used for webhook verification per Clerk's recommended pattern. |
| VI. Audit Trail on Every State Change | ✅ Pass | User account creation is not a "session, agreement, payment, or mediator-status" record per Principle VI's enumerated scope. No audit log entry required. When bookings are added, any booking state changes still require audit entries. |
| VII. Simplicity / YAGNI | ✅ Pass | MVP scope: email/password only. No MFA, social login, mediator accounts, or admin accounts. |
| Scalability — Webhook idempotency | ✅ Pass | `user.created` handler uses upsert (not insert) — idempotent by design. |
| Scalability — Webhook signature verification | ✅ Pass | Svix signature verified on every inbound request before any DB write. |
| Scalability — No PII in logs | ✅ Pass | Webhook handler logs event type only; never logs email, name, or user ID. |
| Multi-Account Portability | ✅ Pass | `CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, and `CLERK_WEBHOOK_SECRET` loaded from environment variables. No Clerk credentials in source. |

**No violations requiring Complexity Tracking.**

## Project Structure

### Documentation (this feature)

```text
specs/003-user-auth/
├── plan.md                          ← this file
├── research.md                      ← Phase 0 output
├── data-model.md                    ← Phase 1 output
├── quickstart.md                    ← Phase 1 output
├── contracts/
│   └── webhook-clerk.md             ← Phase 1 output
└── tasks.md                         ← Phase 2 output (/speckit-tasks)
```

### Source Code

```text
app/
├── (auth)/
│   ├── sign-in/
│   │   └── [[...sign-in]]/
│   │       └── page.js              # Clerk <SignIn /> catch-all route
│   ├── sign-up/
│   │   └── [[...sign-up]]/
│   │       └── page.js              # Clerk <SignUp /> catch-all route
│   └── layout.js                    # Centered auth layout (no navbar/footer)
├── api/
│   └── webhooks/
│       └── clerk/
│           └── route.js             # POST handler — user sync to Postgres
└── layout.js                        # Updated: wrap with <ClerkProvider>

proxy.js                             # Updated: clerkMiddleware() + rate limiter

lib/
└── db/
    └── users.js                     # upsertUser(), deleteUser()

prisma/
└── schema.prisma                    # Updated: add User model
```

**Structure Decision**: Standard Next.js App Router layout. Auth pages in a route group `(auth)` with a dedicated centered layout (no global navbar/footer — cleaner auth UX). Webhook API route at `/api/webhooks/clerk`. Clerk middleware composed into existing `proxy.js`.

## Complexity Tracking

*No Constitution Check violations — section intentionally empty.*
