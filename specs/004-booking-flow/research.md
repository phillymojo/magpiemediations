# Research: Booking Flow (004-booking-flow)

**Branch**: `004-booking-flow` | **Date**: 2026-06-02

## Decision 1 — Email Packages

**Decision**: `resend` (SDK) + `react-email` (templates, v6+ consolidated package)

**Rationale**: Both are pre-selected in the constitution tech stack. `react-email` v6+ ships all components in a single package — no separate `@react-email/components` import needed.

**Install**: `npm install resend react-email`

---

## Decision 2 — Email Sending Pattern

**Decision**: Fire-and-forget within the Server Action — call `sendBookingEmails(...).catch(err => console.error('[email]', err))` without awaiting. Booking transaction commits before email resolves.

**Rationale**: Clarification session confirmed synchronous sending for MVP. Fire-and-forget ensures email failure never rolls back the booking, satisfying FR-011. Avoids Inngest complexity for MVP.

**Upgrade path**: Replace the `.catch` call with an Inngest job dispatch — one-line change.

---

## Decision 3 — Form Handling

**Decision**: React Hook Form + Zod for client-side validation; Next.js Server Action for submission.

**Rationale**: Pre-selected in constitution. Server Action avoids a separate API route and keeps the booking creation server-side. Zod schema is shared between client validation and server-side validation at the trust boundary.

---

## Decision 4 — Booking Form Route

**Decision**: Booking form lives at `/mediators/[slug]/book` — a sub-route of the mediator detail page.

**Rationale**: Contextual URL (user knows which mediator they're booking), consistent with the "click Book on the detail page" flow. Mediator data can be fetched server-side using the slug from params, same as the detail page.

---

## Decision 5 — Server Action vs Route Handler for Booking Creation

**Decision**: Server Action (`lib/actions/bookings.js`) — not a separate API route handler.

**Rationale**: Server Actions are the Next.js App Router pattern for form mutations. Simplifies the data flow: form → Server Action → DB → redirect. No separate fetch() call needed from the client.

---

## Decision 6 — AuditLog Design

**Decision**: `AuditLog` is a polymorphic append-only table with no Prisma relations to other models. Fields: `id`, `actorId`, `action`, `entityType`, `entityId`, `newStatus`, `createdAt`. No `updatedAt` (immutable by design).

**Rationale**: Future audit entries will reference Payments, Agreements, etc. A polymorphic design (entityType + entityId string pair) avoids restructuring the table for each new entity. No Prisma `@relation` keeps the model flexible.

---

## Decision 7 — Admin Email Fallback

**Decision**: `ADMIN_EMAIL` environment variable. When the mediator has no User record, mediator notification email goes to `process.env.ADMIN_EMAIL`.

**Rationale**: Clarification confirmed Option A. Simple, zero additional infrastructure. Morgan gets the notification and can manually follow up with the mediator until the mediator portal is built.

---

## Decision 8 — Date Field Type

**Decision**: `preferredDate` stored as `DateTime @db.Date` in Postgres (date only, no time component).

**Rationale**: The preferred date is a calendar date (half-day or full-day), not a specific time. Storing as date-only prevents timezone edge cases with serverless Lambda (UTC) vs user timezone.
