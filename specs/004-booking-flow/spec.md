# Feature Specification: Booking Flow

**Feature Branch**: `004-booking-flow`
**Created**: 2026-06-02
**Status**: Draft
**Input**: User description: "Authenticated users select a mediator, choose session type (half-day or full-day), pick a date, and complete a booking. MVP: create a booking record in the database, send confirmation emails to both parties. No payment or e-signatures yet."

## Clarifications

### Session 2026-06-02

- Q: What confirmation model applies at MVP? → A: Booking is created with PENDING_CONFIRMATION status. Mediator must manually confirm. Both user and mediator receive email notifications on submission.
- Q: Is the status machine designed for easy upgrade to auto-confirmation? → A: Yes. The PENDING_CONFIRMATION → auto-CONFIRMED path must be a small, isolated change when introduced.
- Q: Who receives emails and on what events? → A: User receives email on booking submission. Mediator receives email on booking submission.

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Submit a Booking Request (Priority: P1)

An authenticated user on a mediator's detail page clicks "Book a Session." They are taken to a booking form pre-loaded with the mediator's name. They select a session type (half-day or full-day), choose a preferred date, and provide a brief case description. On submission, a booking record is created with PENDING_CONFIRMATION status and they are shown a confirmation page.

**Why this priority**: This is the core transaction. Nothing else in the booking flow can exist without it.

**Independent Test**: An authenticated user can navigate from a mediator detail page, complete the booking form, submit it, and see a confirmation page — with a corresponding Booking record in the database.

**Acceptance Scenarios**:

1. **Given** an authenticated user on `/mediators/[slug]`, **When** they click "Book a Session," **Then** they are taken to `/mediators/[slug]/book` with the mediator pre-selected.
2. **Given** an unauthenticated user clicks "Book a Session," **When** the link is followed, **Then** they are redirected to sign-in and returned to the booking page after authentication.
3. **Given** a user on the booking form, **When** they submit with all required fields, **Then** a Booking record is created with status PENDING_CONFIRMATION and they are redirected to a confirmation page at `/bookings/[id]/confirmation`.
4. **Given** a user on the booking form, **When** they submit without a required field, **Then** inline validation prevents submission and highlights the missing field.
5. **Given** a user submits a booking, **When** the booking is created, **Then** an AuditLog entry is written capturing actor, timestamp, action, and new status.
6. **Given** a user submits the form, **When** the submit button is clicked, **Then** the form is immediately disabled to prevent duplicate submissions.

---

### User Story 2 — Booking Email Notifications (Priority: P1)

When a booking is submitted, two transactional emails are sent: one to the user confirming their request was received, and one to the mediator notifying them of a new request.

**Why this priority**: Both parties need to know the booking was received. Without email, the mediator has no way to know they have a pending booking.

**Independent Test**: After a booking is submitted, the user receives a confirmation email and the mediator receives a notification email.

**Acceptance Scenarios**:

1. **Given** a booking is created, **When** the transaction completes, **Then** the user receives an email with mediator name, session type, preferred date, and a note that confirmation is pending.
2. **Given** a booking is created, **When** the transaction completes, **Then** the mediator receives an email with session type and preferred date and a prompt to follow up with the user.
3. **Given** a booking email is composed, **When** it is sent, **Then** the case description is NOT included in either email (privileged content per constitution Principle I).
4. **Given** an email send fails, **When** the failure occurs, **Then** the booking record is still created and committed — email failure does not roll back the booking.

---

### User Story 3 — View My Bookings (Priority: P2)

A signed-in user can navigate to `/bookings` and see a list of their booking requests with status, mediator name, session type, and preferred date.

**Why this priority**: Users need visibility into their requests after submission. Without this, they have no way to check status beyond the initial confirmation email.

**Independent Test**: An authenticated user with at least one booking can navigate to `/bookings` and see their booking(s) listed with correct status and details.

**Acceptance Scenarios**:

1. **Given** an authenticated user with bookings, **When** they navigate to `/bookings`, **Then** they see a list with mediator name, session type, date, and current status for each booking.
2. **Given** a user with no bookings, **When** they navigate to `/bookings`, **Then** they see an empty state with a link to browse mediators.
3. **Given** an unauthenticated user, **When** they navigate to `/bookings`, **Then** they are redirected to sign-in.

---

### Edge Cases

- What if the preferred date is in the past? Validation must reject past dates at submission time.
- What if the mediator becomes non-ACTIVE after booking but before confirmation? Booking stays PENDING_CONFIRMATION; resolution is a manual admin action (out of scope for MVP).
- What if the user double-submits? The form is disabled on first submit to prevent duplicates.
- What if email delivery fails? Booking is committed to the database; failures are logged but do not block booking creation.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The "Book a Session" button on the mediator detail page MUST link to `/mediators/[slug]/book` and MUST require authentication — unauthenticated users MUST be redirected to sign-in and returned after authenticating.
- **FR-002**: The booking form MUST allow selection of session type: half-day (~4 hours) or full-day (~8 hours). Placeholder rates ($1,500 and $2,500) MUST be shown with a visible disclaimer that rates are not final.
- **FR-003**: The booking form MUST require a preferred date. Past dates MUST be rejected with inline validation.
- **FR-004**: The booking form MUST include a required case description field, labelled as confidential.
- **FR-005**: On submission, the platform MUST create a Booking record with status PENDING_CONFIRMATION linking the authenticated user, mediator, session type, preferred date, and case description.
- **FR-006**: After successful submission, the user MUST be redirected to `/bookings/[id]/confirmation` showing booking details and expected next steps.
- **FR-007**: The submission button MUST be disabled immediately on click to prevent duplicate bookings.
- **FR-008**: Every booking creation MUST write an AuditLog entry: actorId (user ID), timestamp (UTC), action ("booking.created"), entityType ("Booking"), entityId, newStatus.
- **FR-009**: On booking creation, a confirmation email MUST be sent to the user: mediator name, session type, preferred date, pending-confirmation status note.
- **FR-010**: On booking creation, a notification email MUST be sent to the mediator: session type, preferred date, prompt to follow up. Case description MUST NOT be included.
- **FR-011**: Email failure MUST NOT prevent or roll back booking creation. Failures MUST be logged.
- **FR-012**: Authenticated users MUST be able to view their bookings at `/bookings`.
- **FR-013**: `/bookings` and `/bookings/[id]/confirmation` MUST require authentication.
- **FR-014**: The Booking status model MUST include PENDING_CONFIRMATION, CONFIRMED, and CANCELLED. Only PENDING_CONFIRMATION is written at MVP; CONFIRMED transition is reserved for a future iteration.

### Key Entities

- **Booking**: Links User to Mediator. Attributes: id, userId, mediatorId, sessionType (HALF_DAY / FULL_DAY), preferredDate, caseDescription, status (PENDING_CONFIRMATION / CONFIRMED / CANCELLED), createdAt, updatedAt.
- **AuditLog**: Immutable record of state changes. Attributes: id, actorId, action, entityType, entityId, newStatus, createdAt. Append-only — no UPDATE or DELETE in application code paths.

## Success Criteria *(mandatory)*

- **SC-001**: A user can complete the booking form and reach the confirmation page in under 2 minutes.
- **SC-002**: Confirmation email delivered to user within 60 seconds of submission.
- **SC-003**: Notification email delivered to mediator within 60 seconds of submission.
- **SC-004**: 100% of submissions result in either a successful booking + confirmation page, or a clear error — no silent failures.
- **SC-005**: Case description never appears in any outbound email, log entry, or error response.
- **SC-006**: Every booking creation has a corresponding AuditLog entry.

## Assumptions

- Payment is out of scope. Displayed prices are placeholder rates.
- E-signatures are out of scope.
- Mediator availability / calendar integration is deferred to Phase 2. The preferred date is a request, not a guaranteed slot.
- Mediator acceptance / decline UI is out of scope. That belongs to the mediator-facing dashboard feature.
- Session format (online vs. in-person) is deferred.
- Counsel names (plaintiff/defense) are deferred.
- The mediator's email address is sourced from their User record in Postgres (mediators must have a platform account). This dependency is accepted for MVP.
- Email templates are functional but not visually polished for MVP.
- The AuditLog table is introduced in this feature and used by future features (payments, status changes, etc.).
