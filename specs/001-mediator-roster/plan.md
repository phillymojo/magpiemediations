# Implementation Plan: Mediator Roster (Browse & Filter)

**Branch**: `001-mediator-roster` | **Date**: 2026-05-06 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/001-mediator-roster/spec.md`

## Summary

Read-only, public roster page at `/mediators`. A React Server Component fetches
`ACTIVE` mediators from Postgres via Prisma, applies URL-searchParam-driven
filters (practice area slug, U.S. state code, free-text name/firm search),
paginates at 12 cards per page with numbered controls, and renders mediator
cards showing name, firm, city/state, primary practice areas, years of civil
practice, and an initials-based avatar. No authentication required to browse.

## Technical Context

**Language/Version**: JavaScript / Node.js 20+ (via AWS Amplify Lambda)
**Primary Dependencies**: Next.js 15 (App Router, RSC + Client Components),
Prisma, Tailwind CSS, shadcn/ui, Zod
**Storage**: Postgres on Neon (serverless); Prisma using pooled connection string
for Lambda/serverless function compatibility
**Testing**: Jest + React Testing Library (pragmatic — roster browse is not a
high-stakes flow per Principle IV; `getMediators` verification filter gets unit
tests)
**Target Platform**: AWS Amplify Hosting
**Project Type**: Web application (full-stack Next.js App Router)
**Performance Goals**: ≤3s first page load on broadband (SC-001); ≤1s filter
update (SC-002)
**Constraints**: Public/unauthenticated; no PII in logs (Sentry + CloudWatch
redacted); filter + search state fully in URL; 12 cards/page; WCAG 2.1 AA
**Scale/Scope**: MVP 0–100 mediators; data model and indexes designed for 10,000+

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Status | Notes |
|---|---|---|
| I. Confidentiality by Default | ✅ Pass | Roster shows only public mediator info (name, firm, location, practice areas, years). No case content, party data, or session info. Page is CDN-cacheable (public data, not `no-store`). |
| II. Platform, Not a Law Firm | ✅ Pass | "Not a law firm" disclaimer rendered in page footer. No advice-giving UI in scope. |
| III. Verified Mediators, Always | ✅ Pass | All `getMediators` queries hard-filter `verificationStatus = ACTIVE`. No code path bypasses this gate. |
| IV. High-Stakes Flows Are Test-First | ✅ Pass | Roster browse is not a high-stakes flow (no booking, payment, signature, verification, or audit-log writes). `getMediators` verification filter gets unit tests; remaining code covered pragmatically. |
| V. Buy, Don't Build | ✅ Pass | No custom auth, crypto, payment, or signature code. Tailwind + shadcn/ui for UI; Prisma for data. |
| VI. Audit Trail on Every State Change | ✅ Pass | Page is entirely read-only. No mediator status, payment, or agreement state changes occur. No audit log entries required. |
| VII. Simplicity / YAGNI | ✅ Pass | Scope strictly bounded: browse, filter, search, paginate. No personalization, no admin tools, no mediator-facing features, no analytics hooks in this feature. |
| Scalability — Connection pooling | ✅ Pass | Prisma MUST use Neon's pooled connection string (`?pgbouncer=true`) for all serverless function paths. |
| Scalability — Pagination | ✅ Pass | Offset pagination (`skip`/`take`) at 12/page; stable for alphabetical sort at MVP scale. |
| Scalability — Indexed queries | ✅ Pass (via schema) | Prisma schema defines `@@index([verificationStatus])`, `@@index([state])`, `@@index([lastName, firstName])`, and `@@index([practiceAreaId])` on join table. |
| Scalability — Rate limiting | ✅ Pass (via middleware) | Next.js middleware applies rate limiting to public unauthenticated routes (per Scalability Practices). |
| Multi-Account Portability | ✅ Pass | No new AWS resources introduced (no S3, KMS, IAM, or ACM). |

**No violations requiring Complexity Tracking.**

## Project Structure

### Documentation (this feature)

```text
specs/001-mediator-roster/
├── plan.md              ← this file
├── research.md          ← Phase 0 output
├── data-model.md        ← Phase 1 output
├── quickstart.md        ← Phase 1 output
├── contracts/
│   └── roster-page.md   ← Phase 1 output
├── spec.md
├── checklists/
│   └── requirements.md
└── tasks.md             ← Phase 2 output (/speckit-tasks — not yet created)
```

### Source Code

```text
prisma/
├── schema.prisma              # Mediator, PracticeArea, MediatorPracticeArea,
│                              # VerificationStatus enum
└── seed.js                    # 7 canonical PracticeArea rows +
                               # sample ACTIVE mediators for development

app/
└── mediators/
    ├── page.js                # RSC: receives searchParams → fetches →
    │                          # renders MediatorGrid + RosterPagination
    ├── loading.js             # Suspense loading skeleton
    └── [id]/
        └── page.js            # Stub: booking entry point placeholder
                               # (booking flow is a future feature)

components/
└── mediators/
    ├── MediatorCard.js        # Server component: renders one card
    │                          # (name, firm, city/state, practice areas,
    │                          # years of practice, initials avatar)
    ├── MediatorGrid.js        # Server component: responsive grid wrapper;
    │                          # switches to EmptyState when no results
    ├── RosterFilters.js       # Client component: practice area dropdown
    │                          # + state dropdown; updates URL on change
    ├── RosterSearch.js        # Client component: debounced search input;
    │                          # updates URL on change
    ├── RosterPagination.js    # Server component: numbered page controls
    │                          # (prev / 1 2 3 … / next)
    └── EmptyState.js          # Server component: handles two states —
                               # "no mediators match" + "roster is empty"

lib/
└── db/
    ├── mediators.js           # getMediators(options) — Prisma query
    └── practiceAreas.js       # getPracticeAreas() — for filter dropdown

middleware.js                  # Next.js middleware: rate limiting on /mediators
```

**Structure Decision**: Standard Next.js App Router layout. Server components
handle data fetching and static rendering; client components handle only the
interactive filter/search controls. URL searchParams are the single source of
truth for filter state — no `useState` for filter values.

## Complexity Tracking

*No Constitution Check violations — section intentionally empty.*
