# Tasks: Booking Flow

**Input**: Design documents from `specs/004-booking-flow/`
**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | contracts/ ✅

---

## Phase 1: Setup

**Purpose**: Install dependencies and wire environment variables.

- [ ] T001 Install resend and react-email — `npm install resend react-email`
- [ ] T002 [P] Add `RESEND_API_KEY` and `ADMIN_EMAIL` to `.env`, `.env.example`, `amplify.yml` printf line, and Amplify branch env vars

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Schema, migrations, and shared infrastructure all user story phases depend on.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [ ] T003 Add `BookingStatus` enum, `SessionType` enum, `Booking` model, and `AuditLog` model to `prisma/schema.prisma` per `specs/004-booking-flow/data-model.md` — also add `bookings Booking[]` relation to `User` and `Mediator` models
- [ ] T004 Create and apply migration — `npx prisma migrate dev --name add-booking-and-audit-log`
- [ ] T005 [P] Create `lib/db/auditLog.js` — export `createAuditEntry({ actorId, action, entityType, entityId, newStatus })` using `prisma.auditLog.create`
- [ ] T006 [P] Create `lib/db/bookings.js` — export `createBooking({ userId, mediatorId, sessionType, preferredDate, caseDescription })`, `getUserBookings(userId)`, `getBookingById(id)`
- [ ] T007 [P] Create `lib/email/client.js` — Resend singleton using `process.env.RESEND_API_KEY`
- [ ] T008 [P] Create `lib/email/templates/BookingConfirmation.js` — React Email template for user; includes mediator name, session type, preferred date, pending-confirmation note, "not a law firm" disclaimer; does NOT include case description
- [ ] T009 [P] Create `lib/email/templates/BookingNotification.js` — React Email template for mediator/admin; includes session type, preferred date, prompt to follow up; does NOT include case description
- [ ] T010 [P] Create `lib/email/sendBookingEmails.js` — async function that sends both emails fire-and-forget; resolves mediator email from their User record or falls back to `process.env.ADMIN_EMAIL`

**Checkpoint**: Schema migrated, DB helpers ready, email infrastructure ready. User story phases can now begin.

---

## Phase 3: US1 — Submit a Booking Request (Priority: P1) 🎯

**Goal**: Authenticated user completes booking form on `/mediators/[slug]/book`, submits, booking created in DB, redirected to confirmation page.

**Independent Test**: Sign in, navigate to `/mediators/[slug]/book`, submit form, confirm Booking row in Postgres with PENDING_CONFIRMATION status, confirm redirect to `/bookings/[id]/confirmation`.

- [ ] T011 Write unit tests for `createBooking` Server Action in `__tests__/actions/bookings.test.js` — mock `lib/db/bookings`, `lib/db/auditLog`, `lib/email/sendBookingEmails`, `@clerk/nextjs/server`; cover: successful creation, unauthenticated redirect, inactive mediator error, missing required fields, audit log written on success, email failure does not throw
- [ ] T012 Create `lib/actions/bookings.js` — `createBooking` Server Action: auth check via `auth()`, Zod validation, mediator ACTIVE check, DB write via `createBooking()`, audit log via `createAuditEntry()`, fire-and-forget email, redirect to `/bookings/[id]/confirmation`
- [ ] T013 Create `components/bookings/BookingForm.js` — `'use client'`; React Hook Form + Zod; session type card selector (half-day/full-day with placeholder prices + disclaimer), date input (min=today), case description textarea; submit button disabled on click; calls `createBooking` Server Action; displays server-side field errors inline
- [ ] T014 Create `app/mediators/[slug]/book/page.js` — Server Component; fetches mediator by slug (returns 404 if not ACTIVE); renders `<BookingForm>` with mediator data; requires auth (redirect to sign-in if not authenticated)
- [ ] T015 Create `app/bookings/[id]/confirmation/page.js` — Server Component; fetches booking by id (verifies it belongs to the current user); displays session type, mediator name, preferred date, status, next-steps message; "not a law firm" disclaimer; link to `/bookings`
- [ ] T016 Update `app/mediators/[slug]/page.js` — replace disabled booking button stub with an active `<Link href={/mediators/${slug}/book}>` button

**Checkpoint**: Full booking flow works end-to-end locally. Booking in DB, confirmation page renders.

---

## Phase 4: US2 — Booking Email Notifications (Priority: P1)

**Goal**: User receives confirmation email and mediator/admin receives notification email after booking submission.

**Independent Test**: Submit a booking, check user inbox for confirmation email and `ADMIN_EMAIL` inbox for notification email. Confirm neither email contains the case description.

- [ ] T017 Verify email sending works end-to-end — submit a test booking locally using ngrok or by deploying; confirm both emails arrive; confirm case description absent from both; confirm email failure (e.g. bad API key) does not break the booking flow

**Checkpoint**: Both emails delivered. Case description not present in either.

---

## Phase 5: US3 — View My Bookings (Priority: P2)

**Goal**: Authenticated user can navigate to `/bookings` and see a list of their bookings.

**Independent Test**: Sign in as a user with at least one booking, navigate to `/bookings`, confirm booking appears with correct status, mediator name, session type, and date.

- [ ] T018 [P] Create `components/bookings/BookingStatusBadge.js` — Server Component; renders a styled pill for PENDING_CONFIRMATION / CONFIRMED / CANCELLED
- [ ] T019 Create `app/bookings/page.js` — Server Component; requires auth; fetches `getUserBookings(userId)`; renders list of bookings with mediator name, session type, preferred date, `<BookingStatusBadge>`; empty state with link to `/mediators`

**Checkpoint**: `/bookings` renders correctly for users with and without bookings.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [ ] T020 [P] Update `proxy.js` `createRouteMatcher` to protect `/bookings` and `/bookings/(.*)` routes (add alongside existing `/booking` protection)
- [ ] T021 [P] Add "My Bookings" link to `components/layout/Navbar.js` inside the `<Show when="signed-in">` block
- [ ] T022 [P] Run `npm test` — all tests must pass including new T011 booking action tests
- [ ] T023 [P] Run `npm run build` — verify clean build
- [ ] T024 End-to-end smoke test per `specs/004-booking-flow/quickstart.md`

---

## Dependencies & Execution Order

- **Phase 1** (Setup): No dependencies — start immediately
- **Phase 2** (Foundational): Depends on Phase 1 — blocks all user story phases
- **Phase 3** (US1): Depends on Phase 2 — T011 (tests) before T012 (implementation) per Principle IV
- **Phase 4** (US2): Depends on T012 (Server Action must send emails) and T007–T010 (email infrastructure)
- **Phase 5** (US3): Depends on Phase 2 (DB helpers) — independent of Phase 3
- **Phase 6** (Polish): Depends on all user story phases complete

### Parallel Opportunities

- T005, T006, T007, T008, T009, T010 can all run in parallel after T004
- T018 and T019 can run in parallel
- T020, T021, T022, T023 can all run in parallel in Phase 6

---

## Implementation Strategy

### MVP First (US1 + US2 — both P1)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all)
3. Write T011 tests first, confirm they fail
4. Implement T012–T016 (booking form + Server Action + confirmation page)
5. Implement T017 (email verification)
6. **STOP and VALIDATE**: full booking flow working end-to-end, emails delivered
7. Add US3 (T018–T019): My Bookings page
8. Complete Phase 6: Polish + deploy

---

## Notes

- T011 MUST be written before T012 per constitution Principle IV (high-stakes flow is test-first)
- T002 includes Amplify env vars — remember to add `RESEND_API_KEY` and `ADMIN_EMAIL` to `amplify.yml` printf line (same pattern as Clerk and DATABASE_URL)
- `caseDescription` must never appear in any log statement, email body, or error message — review all T008, T009, T012 carefully
- Hard delete on `user.deleted` webhook (from auth feature) must be revisited once Booking has a `userId` foreign key — a user deletion will cascade-fail if they have bookings
- Total tasks: 24 | Parallel-eligible: 12 | Smoke-test only: 1 (T017)
