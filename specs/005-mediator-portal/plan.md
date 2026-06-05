# Implementation Plan: Mediator Portal

**Branch**: `005-mediator-portal` | **Date**: 2026-06-04 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/005-mediator-portal/spec.md`

## Summary

Mediators are auto-linked to their `Mediator` record by email match when they sign up. A linked mediator gains access to `/portal` where they can view their assigned bookings and accept or decline pending requests. Status changes trigger emails to the requesting user. The "My Portal" nav link is conditionally shown via Clerk public metadata. Regular user functionality (`/bookings`) is unaffected for mediators.

## Technical Context

**Language/Version**: JavaScript / Node.js 20+ (AWS Amplify Lambda)
**Primary Dependencies**: Next.js 16 / React 19 (App Router, Server Actions), Prisma v5, Clerk (`@clerk/nextjs`), Resend + React Email, Tailwind CSS v4
**Storage**: Postgres on Neon — `Mediator` gains `email` and `userId` fields
**Testing**: Jest; accept/decline Server Actions are high-stakes (Principle IV) — tests required
**Target Platform**: AWS Amplify Hosting
**Constraints**: Case description never shown in portal UI or emails; AuditLog on every status change; email failure never rolls back status change

## Constitution Check

| Principle | Status | Notes |
|---|---|---|
| I. Confidentiality by Default | ✅ Pass | `caseDescription` excluded from portal UI and all emails. Only session type, date, and requester first name shown. |
| II. Platform, Not a Law Firm | ✅ Pass | Portal pages include standard footer disclaimer. |
| III. Verified Mediators, Always | ✅ Pass | Only ACTIVE mediators appear on roster (existing gate). Portal access is linked to a Mediator record regardless of status — mediators can view bookings even if suspended, but no new bookings will route to non-ACTIVE mediators. |
| IV. High-Stakes Flows Are Test-First | ✅ Pass | `acceptBooking` and `declineBooking` Server Actions write booking status changes — high-stakes. Tests written before implementation. |
| V. Buy, Don't Build | ✅ Pass | Clerk for auth/metadata. Resend for email. No custom infrastructure. |
| VI. Audit Trail on Every State Change | ✅ Pass | AuditLog entry written on every `booking.confirmed` and `booking.declined` event. |
| VII. Simplicity / YAGNI | ✅ Pass | No calendar, no availability, no conflict screening UI, no mediator application form — all deferred. |
| Scalability — No PII in logs | ✅ Pass | Server Actions log action and booking ID only. No names, emails, or case content. |
| Multi-Account Portability | ✅ Pass | No new AWS resources. Clerk metadata update uses existing Clerk SDK. |

**No violations requiring Complexity Tracking.**

## Project Structure

### Documentation (this feature)

```text
specs/005-mediator-portal/
├── plan.md                                  ← this file
├── research.md                              ← Phase 0 output
├── data-model.md                            ← Phase 1 output
├── quickstart.md                            ← Phase 1 output
├── contracts/
│   └── server-actions-portal.md            ← Phase 1 output
└── tasks.md                                 ← Phase 2 output (/speckit-tasks)
```

### Source Code

```text
app/
└── portal/
    └── page.js                  # Mediator dashboard — Server Component

components/
└── portal/
    ├── BookingActionCard.js     # 'use client' — single booking with Accept/Decline buttons
    └── PortalEmptyState.js      # Server component — empty state

lib/
├── actions/
│   └── portal.js                # acceptBooking(bookingId), declineBooking(bookingId)
├── db/
│   └── mediators.js             # Updated: getMediatorByUserId(userId)
└── email/
    └── templates/
        ├── BookingAccepted.js   # React Email — to user on CONFIRMED
        └── BookingDeclined.js   # React Email — to user on CANCELLED

app/api/webhooks/clerk/route.js  # Updated: auto-link mediator on user.created

components/layout/Navbar.js      # Updated: show "My Portal" link when isMediatorLinked
```

**Structure Decision**: Portal page is a Server Component that fetches all bookings for the mediator. `BookingActionCard` is a Client Component only because it needs to call Server Actions with a booking ID. The rest of the portal is static server-rendered content.

## Complexity Tracking

*No Constitution Check violations — section intentionally empty.*
