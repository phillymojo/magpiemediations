# Feature Specification: Mediator Portal

**Feature Branch**: `005-mediator-portal`
**Created**: 2026-06-04
**Status**: Draft
**Input**: User description: "Mediators can claim their profile (link their User account to their Mediator record), view pending and confirmed bookings, and accept or decline booking requests. Emails sent to the user on status changes."

## Clarifications

### Session 2026-06-04

- Q: How does a mediator record get created? → A: Morgan manually creates/updates Mediator records in the DB (Option A — admin-heavy MVP). Self-service application form is a future feature (Option B).
- Q: How does a mediator claim their profile? → A: Auto-linked by email match. When a mediator signs up using the email on their Mediator record, the Clerk webhook links their User account to that Mediator record automatically.
- Q: Does the mediator need to give a reason when declining? → A: No — one-click decline, no reason required.
- Q: After a mediator accepts, is the booking immediately CONFIRMED? → A: Yes — immediately CONFIRMED, no additional steps for MVP.
- Q: Can a mediator also book other mediators as a regular user? → A: Yes. A user who is a mediator can also act as a party/counsel and book other mediators. The portal is additive — a linked mediator has access to both `/bookings` (their bookings as a client) and `/portal` (their bookings as a mediator). The two roles are completely independent.

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Mediator Claims Their Profile (Priority: P1)

A mediator whose record exists in the database signs up on the platform using the same email address that Morgan has stored on their Mediator record. Upon sign-up, the system automatically links their new User account to their Mediator record. The mediator is now a "linked mediator" — they can access the mediator portal.

**Why this priority**: Without profile linking, no mediator can access the portal. Everything else depends on this.

**Independent Test**: Create a Mediator record with a specific email. Sign up with that email. Confirm `mediator.userId` is set to the new user's ID in the database.

**Acceptance Scenarios**:

1. **Given** a Mediator record exists with email `jane@lawfirm.com`, **When** a user signs up with `jane@lawfirm.com`, **Then** the Mediator record's `userId` is set to the new user's ID.
2. **Given** a user signs up with an email that does not match any Mediator record, **When** the sign-up completes, **Then** no Mediator record is modified — they are a regular user.
3. **Given** a mediator's User account is already linked, **When** another sign-up occurs with the same email, **Then** the existing link is preserved and no duplicate link is created (Clerk prevents duplicate emails; this scenario should not occur in practice).

---

### User Story 2 — View Mediator Dashboard (Priority: P1)

A linked mediator signs in and navigates to `/portal`. They see a dashboard listing their pending booking requests and their confirmed/cancelled bookings. Each pending booking shows the session type, preferred date, and a summary of the requesting party (but not the case description — privileged content).

**Why this priority**: The dashboard is the entry point for all mediator actions. Without it, mediators cannot see or act on bookings.

**Independent Test**: Sign in as a linked mediator who has at least one pending booking. Navigate to `/portal`. Confirm the booking appears with correct session type, date, and status. Confirm case description is not visible.

**Acceptance Scenarios**:

1. **Given** a linked mediator at `/portal`, **When** the page loads, **Then** they see a list of bookings assigned to them grouped by status (Pending, Confirmed, Cancelled).
2. **Given** a linked mediator with no bookings, **When** they visit `/portal`, **Then** they see an empty state.
3. **Given** an authenticated user who is NOT a linked mediator, **When** they navigate to `/portal`, **Then** they are shown an access-denied message (not redirected — avoids leaking that the route exists).
4. **Given** an unauthenticated user, **When** they navigate to `/portal`, **Then** they are redirected to sign-in.
5. **Given** a booking is displayed, **When** the mediator views it, **Then** the case description is NOT shown (privileged content per constitution Principle I).

---

### User Story 3 — Accept a Booking (Priority: P1)

A linked mediator views a pending booking request and clicks "Accept." The booking status changes to CONFIRMED. An audit log entry is written. The requesting user receives a confirmation email. The booking moves from the Pending section to the Confirmed section on the dashboard.

**Why this priority**: Accepting bookings is the core mediator action. Without it, bookings stay pending indefinitely.

**Independent Test**: As a linked mediator, accept a PENDING_CONFIRMATION booking. Confirm status becomes CONFIRMED in the DB, AuditLog entry exists, and user receives a confirmation email.

**Acceptance Scenarios**:

1. **Given** a mediator on a pending booking, **When** they click "Accept," **Then** the booking status changes to CONFIRMED, an AuditLog entry is written, and the user receives a confirmation email.
2. **Given** a mediator accepts a booking, **When** the email send fails, **Then** the booking is still confirmed — email failure does not roll back the status change.
3. **Given** a mediator tries to accept a booking that is not theirs, **When** the action is submitted, **Then** it is rejected with an authorization error.

---

### User Story 4 — Decline a Booking (Priority: P1)

A linked mediator views a pending booking request and clicks "Decline." The booking status changes to CANCELLED. An audit log entry is written. The requesting user receives a notification that the booking was not confirmed. No reason is required.

**Why this priority**: Mediators must be able to decline conflicts or scheduling issues. Without decline, they are forced to accept all requests.

**Independent Test**: As a linked mediator, decline a PENDING_CONFIRMATION booking. Confirm status becomes CANCELLED in the DB, AuditLog entry exists, and user receives a cancellation email.

**Acceptance Scenarios**:

1. **Given** a mediator on a pending booking, **When** they click "Decline," **Then** the booking status changes to CANCELLED, an AuditLog entry is written, and the user receives a notification email.
2. **Given** a mediator declines a booking, **When** the email send fails, **Then** the booking is still cancelled — email failure does not roll back the status change.
3. **Given** a mediator tries to decline a booking that is not theirs, **When** the action is submitted, **Then** it is rejected with an authorization error.

---

### Edge Cases

- What if a mediator's email in the Mediator record doesn't match exactly (case difference)? Email matching must be case-insensitive.
- What if a mediator's Mediator record has no email set? They cannot auto-link — Morgan must set the email first.
- What if a mediator is SUSPENDED or WITHDRAWN? They can still access the portal and view existing bookings, but cannot accept new ones (no new bookings will be assigned to non-ACTIVE mediators per the existing roster filter).
- What if a mediator tries to accept/decline a booking that is already CONFIRMED or CANCELLED? The action is a no-op with a clear error message.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The `Mediator` model MUST gain an `email` field (nullable, unique) for profile linking, and a `userId` field (nullable, unique) referencing the `User` table.
- **FR-002**: When a new user is created (Clerk webhook `user.created`), the system MUST check if a `Mediator` record with a matching email exists. If so, the `Mediator.userId` MUST be set to the new user's ID. Email matching MUST be case-insensitive.
- **FR-003**: The `/portal` route MUST require authentication AND the authenticated user must be a linked mediator. Non-mediator users MUST see an access-denied message.
- **FR-012**: A user who is a linked mediator MUST retain full access to `/bookings` as a regular user. Being a mediator does not affect their ability to book other mediators.
- **FR-004**: The mediator dashboard MUST display bookings assigned to the mediator grouped by status: Pending Confirmation, Confirmed, Cancelled.
- **FR-005**: Each booking entry on the dashboard MUST show: session type, preferred date, and requesting party's first name. The case description MUST NOT be shown.
- **FR-006**: A mediator MUST be able to accept a PENDING_CONFIRMATION booking. On acceptance: status becomes CONFIRMED, an AuditLog entry is written, a confirmation email is sent to the user.
- **FR-007**: A mediator MUST be able to decline a PENDING_CONFIRMATION booking. On decline: status becomes CANCELLED, an AuditLog entry is written, a cancellation email is sent to the user.
- **FR-008**: Accept and decline actions MUST verify the booking belongs to the authenticated mediator before executing. Unauthorized attempts MUST be rejected.
- **FR-009**: Accept and decline actions on already-CONFIRMED or already-CANCELLED bookings MUST return a clear error and perform no state change.
- **FR-010**: Email failure on accept/decline MUST NOT roll back the status change.
- **FR-011**: Two new email templates are required: booking confirmed (to user) and booking declined (to user). Neither template includes the case description.

### Key Entities (changes)

- **Mediator** (updated): add `email String? @unique` and `userId String? @unique` with optional `User` relation.
- **User** (updated): add optional `mediator Mediator?` back-relation.

## Success Criteria *(mandatory)*

- **SC-001**: A mediator with a matching email in their Mediator record is auto-linked on sign-up — no manual DB intervention required.
- **SC-002**: A linked mediator can view all their bookings at `/portal` within 2 seconds of page load.
- **SC-003**: Accept/decline actions complete and the dashboard updates within 2 seconds.
- **SC-004**: Status change emails delivered to the user within 60 seconds of accept/decline.
- **SC-005**: Case description never appears anywhere in the mediator portal UI or emails.
- **SC-006**: Every accept/decline has a corresponding AuditLog entry.

## Assumptions

- Morgan manually adds the mediator's email to their `Mediator` record before the mediator signs up. The portal does not handle the case where a mediator signs up before their record is created.
- The self-service mediator application form (Option B) is a future feature. The schema changes in this feature (email + userId on Mediator) are designed to be forward-compatible with that flow.
- Mediators use the same sign-up flow as regular users. There is no separate mediator sign-up page for MVP.
- The mediator portal is a simple list view for MVP. No calendar, no availability management, no conflict-of-interest screening UI.
- Conflict-of-interest screening (constitution Principle III) is deferred — it will be addressed when the full booking confirmation workflow is built.
