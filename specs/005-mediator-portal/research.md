# Research: Mediator Portal (005-mediator-portal)

**Branch**: `005-mediator-portal` | **Date**: 2026-06-04

## Decision 1 — Profile Linking Strategy

**Decision**: On `user.created` Clerk webhook, after upserting the User record, perform a case-insensitive lookup for a Mediator with matching email. If found and unlinked (`userId` is null), set `mediator.userId = user.id`.

**Rationale**: Zero friction for the mediator — they just sign up normally. No invite codes, no extra steps. Case-insensitive match handles email capitalization differences between what Morgan enters and what the mediator uses.

**Implementation note**: The existing `app/api/webhooks/clerk/route.js` handles `user.created`. The linking logic is added there after the `upsertUser()` call.

---

## Decision 2 — Mediator Identity Check

**Decision**: A helper `getMediatorByUserId(userId)` fetches the Mediator record linked to the current user. Returns `null` if the user is not a linked mediator. Used in portal pages and Server Actions to gate access.

**Rationale**: Simple, single-query check. Called at the top of every portal Server Component and Server Action. Avoids middleware-level role checks which would require a DB call on every request.

---

## Decision 3 — Portal Route Structure

**Decision**: Portal lives at `/portal` (not `/mediator/dashboard` or `/dashboard`). Short, clean URL.

**Rationale**: Mediators will bookmark this. `/portal` is unambiguous and doesn't conflict with any existing routes.

---

## Decision 4 — Accept/Decline Server Actions

**Decision**: Two Server Actions in `lib/actions/portal.js`: `acceptBooking(bookingId)` and `declineBooking(bookingId)`. Both verify the booking belongs to the authenticated mediator before mutating.

**Rationale**: Mirrors the pattern established in `lib/actions/bookings.js`. Keeps portal mutations server-side and testable.

---

## Decision 5 — Navbar "My Portal" Link

**Decision**: The navbar shows a "My Portal" link inside `<Show when="signed-in">` only when the user is a linked mediator. Since `Navbar` is a Server Component, it can fetch the mediator record server-side to conditionally render the link.

**Wait** — `Navbar` is currently a Client Component (it uses Clerk's `<Show>` component from `@clerk/nextjs`). The `<Show>` component is client-side. Fetching the mediator record server-side in the Navbar would require making it a Server Component, which conflicts with Clerk's `<Show>`.

**Revised Decision**: Keep Navbar as a Client Component. Use Clerk's `useUser()` hook to get the userId client-side, but we can't do a DB lookup from a Client Component. Instead, store whether the user is a mediator in Clerk's public metadata when they're linked — set `publicMetadata.isMediatorLinked = true`. Then read it client-side via `user.publicMetadata.isMediatorLinked`.

**Rationale**: Avoids making Navbar a Server Component (which would break Clerk's `<Show>` pattern). Clerk public metadata is the right place for client-accessible user attributes. The metadata is set once at linking time and updated if the link changes.

---

## Decision 6 — New Email Templates

**Decision**: Two new React Email templates:
- `BookingAccepted.js` — to user when mediator accepts (booking CONFIRMED)
- `BookingDeclined.js` — to user when mediator declines (booking CANCELLED)

Neither includes the case description. Both use the same Resend client as the booking flow.

---

## Decision 7 — Mediator Email Field and Existing Seed Data

**Decision**: Add `email String? @unique` to `Mediator` as nullable. Existing seeded mediators will have `email = null` and will gain emails when Morgan updates their records. No backfill migration needed.

**Rationale**: Making it nullable avoids a required-field migration on existing rows. Morgan can update emails incrementally as mediators onboard.
