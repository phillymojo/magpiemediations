# Implementation Plan: Booking Flow

**Branch**: `004-booking-flow` | **Date**: 2026-06-02 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/004-booking-flow/spec.md`

## Summary

Authenticated users can book a session with a mediator by submitting a form (session type, preferred date, case description). A Booking record is created with PENDING_CONFIRMATION status. An AuditLog entry is written. Transactional emails are sent to the user (confirmation) and mediator (notification, or admin fallback). Users can view their bookings at `/bookings`.

## Technical Context

**Language/Version**: JavaScript / Node.js 20+ (AWS Amplify Lambda)
**Primary Dependencies**: Next.js 16 / React 19 (App Router, Server Actions), Prisma v5, `resend`, `react-email`, React Hook Form, Zod, Tailwind CSS v4, shadcn/ui, Clerk
**Storage**: Postgres on Neon — new `Booking` and `AuditLog` tables
**Testing**: Jest; booking creation (Server Action) requires unit tests per Principle IV
**Target Platform**: AWS Amplify Hosting
**Performance Goals**: Form submission → confirmation page ≤ 3s; emails delivered ≤ 60s
**Constraints**: Case description never in logs/emails; AuditLog is append-only; `preferredDate` stored as date-only
**Scale/Scope**: MVP; low booking volume expected at launch

## Constitution Check

| Principle | Status | Notes |
|---|---|---|
| I. Confidentiality by Default | ✅ Pass | `caseDescription` excluded from all emails and logs. Stored in Postgres (encrypted at rest by Neon). Never surfaces in error messages. |
| II. Platform, Not a Law Firm | ✅ Pass | Booking confirmation page and emails MUST include the "not a law firm" disclaimer. Placeholder rate disclaimer required on booking form per FR-002. |
| III. Verified Mediators, Always | ✅ Pass | Server Action verifies `verificationStatus === ACTIVE` before creating a booking. Non-active mediators return an error. |
| IV. High-Stakes Flows Are Test-First | ✅ Pass | Booking creation is explicitly a high-stakes flow. Tests MUST cover: successful creation, unauthenticated access, inactive mediator, missing required fields, audit log entry written, email failure does not roll back booking. |
| V. Buy, Don't Build | ✅ Pass | Resend for email. No custom email infrastructure. |
| VI. Audit Trail on Every State Change | ✅ Pass | AuditLog entry written on every booking.created event. AuditLog table introduced in this feature. Append-only enforced in application code. |
| VII. Simplicity / YAGNI | ✅ Pass | Payment, e-signatures, calendar, mediator acceptance UI, session format, and counsel names all explicitly deferred. |
| Scalability — No PII in logs | ✅ Pass | Server Action logs event type and booking ID only. Case description, names, and emails never logged. |
| Multi-Account Portability | ✅ Pass | `RESEND_API_KEY` and `ADMIN_EMAIL` loaded from environment variables. No hardcoded values. |

**No violations requiring Complexity Tracking.**

## Project Structure

### Documentation (this feature)

```text
specs/004-booking-flow/
├── plan.md                                    ← this file
├── research.md                                ← Phase 0 output
├── data-model.md                              ← Phase 1 output
├── quickstart.md                              ← Phase 1 output
├── contracts/
│   └── server-action-create-booking.md       ← Phase 1 output
└── tasks.md                                   ← Phase 2 output (/speckit-tasks)
```

### Source Code

```text
app/
├── mediators/[slug]/
│   ├── book/
│   │   └── page.js              # Booking form page (Server Component, fetches mediator)
│   └── page.js                  # Updated: enable "Book a Session" button
├── bookings/
│   ├── [id]/
│   │   └── confirmation/
│   │       └── page.js          # Confirmation page (Server Component)
│   └── page.js                  # My bookings list (Server Component)

components/
└── bookings/
    ├── BookingForm.js            # 'use client' — React Hook Form + Zod
    └── BookingStatusBadge.js     # Server component — status pill

lib/
├── actions/
│   └── bookings.js              # Server Action: createBooking(formData)
├── db/
│   ├── bookings.js              # createBooking(), getUserBookings(), getBookingById()
│   └── auditLog.js              # createAuditEntry()
└── email/
    ├── client.js                # Resend singleton
    ├── sendBookingEmails.js     # Orchestrates both emails, fire-and-forget
    └── templates/
        ├── BookingConfirmation.js   # React Email template — to user
        └── BookingNotification.js  # React Email template — to mediator/admin

prisma/schema.prisma             # Updated: BookingStatus, SessionType enums,
                                 # Booking model, AuditLog model, relations
```

**Structure Decision**: Server Action handles all mutation logic (auth, validation, DB write, audit, email). `BookingForm` is a thin client component responsible only for form state and calling the action. Routes are Server Components that fetch data server-side. This keeps all "dangerous" logic server-side and unit-testable in isolation.
