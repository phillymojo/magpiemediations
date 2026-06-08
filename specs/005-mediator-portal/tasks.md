# Tasks: Mediator Portal

**Input**: Design documents from `specs/005-mediator-portal/`
**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | contracts/ ✅

---

## Phase 1: Setup

**Purpose**: Schema migration and shared infrastructure.

- [ ] T001 Add `email String? @unique` and `userId String? @unique` fields with optional `User` relation to `Mediator` model in `prisma/schema.prisma`; add `mediator Mediator?` back-relation to `User` model
- [ ] T002 Create and apply migration — `npx prisma migrate dev --name add-mediator-email-and-user-id`
- [ ] T003 [P] Add `getMediatorByUserId(userId)` to `lib/db/mediators.js` — fetches Mediator where `userId` matches; returns null if not found

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Auto-linking logic and email templates that all user story phases depend on.

- [ ] T004 Update `app/api/webhooks/clerk/route.js` `user.created` handler — after `upsertUser()`, perform case-insensitive email lookup for a matching unlinked Mediator; if found, set `mediator.userId = user.id` and call Clerk Backend API to set `publicMetadata.isMediatorLinked = true` on the user
- [ ] T005 [P] Create `lib/email/templates/BookingAccepted.js` — React Email template sent to user when mediator accepts; includes mediator name, session type, preferred date, confirmed status note; no case description
- [ ] T006 [P] Create `lib/email/templates/BookingDeclined.js` — React Email template sent to user when mediator declines; includes mediator name, session type, preferred date, apology note; no case description

**Checkpoint**: Mediator auto-linking works. Email templates ready. Portal Server Actions can now be built.

---

## Phase 3: US1 — Mediator Claims Their Profile (Priority: P1) 🎯

**Goal**: A mediator with a matching email in their Mediator record signs up and is automatically linked.

**Independent Test**: Add email to a Mediator record in Prisma Studio. Sign up with that email. Confirm `mediator.userId` is set and `user.publicMetadata.isMediatorLinked = true`.

- [ ] T007 Write unit tests for updated `user.created` webhook handler in `__tests__/api/webhooks/clerk.test.js` — add cases: matching email links mediator and sets Clerk metadata, non-matching email leaves mediator records unchanged, already-linked mediator is not re-linked

**Checkpoint**: Auto-linking works end-to-end. Mediator record `userId` populated after sign-up.

---

## Phase 4: US2 — View Mediator Dashboard (Priority: P1)

**Goal**: A linked mediator navigates to `/portal` and sees their bookings grouped by status.

**Independent Test**: Sign in as a linked mediator with at least one PENDING_CONFIRMATION booking. Navigate to `/portal`. Confirm booking appears. Confirm case description not visible. Confirm non-mediator user sees access-denied.

- [ ] T008 Create `app/portal/page.js` — Server Component; calls `getMediatorByUserId(userId)` — renders access-denied message if null; fetches mediator's bookings via `getBookingsForMediator(mediatorId)`; renders pending and historical sections; adds `getBookingsForMediator(mediatorId)` to `lib/db/bookings.js`
- [ ] T009 Create `components/portal/PortalEmptyState.js` — Server Component; empty state when mediator has no bookings
- [ ] T010 Update `components/layout/Navbar.js` — inside `<Show when="signed-in">`, use Clerk's `useUser()` hook to read `user.publicMetadata.isMediatorLinked`; conditionally render a "My Portal" link before "My Bookings"

**Checkpoint**: `/portal` renders correctly for linked mediators; access denied for non-mediators; "My Portal" appears in navbar for mediators.

---

## Phase 5: US3 & US4 — Accept and Decline Bookings (Priority: P1)

**Goal**: Linked mediator can accept (→ CONFIRMED) or decline (→ CANCELLED) a pending booking. User receives email. AuditLog entry written.

**Independent Test**: As a linked mediator, accept a PENDING_CONFIRMATION booking — confirm DB status, AuditLog entry, user email. Repeat for decline.

- [ ] T011 Write unit tests for `acceptBooking` and `declineBooking` Server Actions in `__tests__/actions/portal.test.js` — cover: successful accept, successful decline, not authenticated, not a mediator, booking not owned by mediator, booking already actioned, email failure does not roll back
- [ ] T012 Create `lib/actions/portal.js` — `acceptBooking(bookingId)` and `declineBooking(bookingId)` Server Actions per `specs/005-mediator-portal/contracts/server-actions-portal.md`; use `revalidatePath('/portal')` after each mutation
- [ ] T013 Create `components/portal/BookingActionCard.js` — `'use client'`; displays session type, preferred date, requester first name (no case description); Accept and Decline buttons that call Server Actions; buttons disabled while pending; shows success/error state inline

**Checkpoint**: Accept and decline work end-to-end. Status updates in DB, AuditLog written, emails sent, dashboard updates.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [ ] T014 [P] Update `proxy.js` `createRouteMatcher` to protect `/portal` and `/portal/(.*)`
- [ ] T015 [P] Run `npm test` — all tests must pass including T007 and T011
- [ ] T016 [P] Run `npm run build` — verify clean build
- [ ] T017 End-to-end smoke test per `specs/005-mediator-portal/quickstart.md`

---

## Dependencies & Execution Order

- **Phase 1** (Setup): No dependencies — start immediately
- **Phase 2** (Foundational): Depends on Phase 1 (migration must complete first)
- **Phase 3** (US1): Depends on Phase 2 (auto-linking requires updated webhook)
- **Phase 4** (US2): Depends on Phase 1 (needs `getMediatorByUserId`) and Phase 3 (needs linked mediators to test)
- **Phase 5** (US3/US4): Depends on Phase 2 (email templates) and Phase 4 (portal page to render actions)
- **Phase 6** (Polish): Depends on all prior phases

### Parallel Opportunities

- T003, T005, T006 can run in parallel after T002
- T011 can be written in parallel with T008–T010
- T014, T015, T016 can run in parallel in Phase 6

---

## Implementation Strategy

### MVP First

1. Complete Phase 1: Schema migration
2. Complete Phase 2: Auto-linking + email templates (T004–T006)
3. Write T007 tests, implement T004 (webhook update)
4. Build portal page (T008–T010)
5. Write T011 tests, implement T012–T013 (accept/decline)
6. Complete Phase 6: Polish + smoke test

---

## Notes

- T004 requires calling the Clerk Backend API (not just the DB) to set `publicMetadata`. Install `@clerk/backend` if not already available, or use `clerkClient` from `@clerk/nextjs/server`.
- T007 extends the existing webhook tests — do not replace them, add new cases.
- T011 MUST be written before T012 per constitution Principle IV.
- `caseDescription` must never appear in `BookingActionCard`, portal page, `BookingAccepted`, or `BookingDeclined` — verify at each step.
- Total tasks: 17 | Parallel-eligible: 7 | Smoke-test only: 1 (T017)
