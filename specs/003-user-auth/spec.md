# Feature Specification: User Authentication

**Feature Branch**: `003-user-auth`
**Created**: 2026-05-20
**Status**: Draft
**Input**: User description: "Authentication — users (counsel / parties) need accounts to access the booking flow. MVP scope: sign up, sign in, sign out, protected routes."

## Clarifications

### Session 2026-05-20

- Q: When a user registers, should their account be synced to our own database or should we rely purely on the auth provider's user store? → A: Sync to Postgres when they register via auth provider webhook — bookings reference a local User table.
- Q: What information is collected at sign-up? → A: First name, last name, email, and password.
- Q: After email verification, where does the new user land? → A: Their originally-intended destination, or the mediator roster if they came directly to sign-up.

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Create an Account (Priority: P1)

A first-time user (attorney or party representative) arrives at the platform wanting to book a mediation session. Before they can access the booking flow, they must create an account. They provide their name, email address, and a password. They receive a verification email and confirm their address. Once verified, they are signed in and can proceed.

**Why this priority**: Without an account, no user can book a session. This is the entry point to all authenticated functionality on the platform.

**Independent Test**: A new user can register with a valid email and password, verify their email, and land on the platform as a signed-in user — delivering standalone value as a prerequisite for booking.

**Acceptance Scenarios**:

1. **Given** a visitor on the sign-up page, **When** they submit a valid name, email, and password, **Then** they receive a verification email and are shown a "check your email" confirmation screen.
2. **Given** a verification email was sent, **When** the user clicks the verification link, **Then** their account is confirmed and they are signed in.
3. **Given** a visitor attempts to register with an email already in use, **When** they submit the form, **Then** they see a clear message that the email is already registered, with an option to sign in instead.
4. **Given** a visitor submits a password that does not meet minimum requirements, **When** they submit, **Then** they see a specific error indicating the password requirement.

---

### User Story 2 — Sign In (Priority: P1)

A returning user arrives at the platform or is redirected there after attempting to access a protected page. They enter their email and password and are signed in. If they were redirected from a protected page, they are sent back to their intended destination after sign-in.

**Why this priority**: Returning users must be able to access their accounts without friction to use the booking flow.

**Independent Test**: An existing verified user can sign in with correct credentials and land on the platform as an authenticated user.

**Acceptance Scenarios**:

1. **Given** a registered user on the sign-in page, **When** they enter correct credentials, **Then** they are signed in and redirected to their intended destination (or the home page if no redirect was pending).
2. **Given** a registered user on the sign-in page, **When** they enter an incorrect password, **Then** they see a generic error ("Invalid email or password") without revealing which field was wrong.
3. **Given** a user who has not verified their email, **When** they attempt to sign in, **Then** they are informed their email is not yet verified and given the option to resend the verification email.
4. **Given** a signed-in user who navigates to the sign-in page, **When** the page loads, **Then** they are redirected away from sign-in (already authenticated).

---

### User Story 3 — Access Protected Routes (Priority: P1)

An unauthenticated visitor attempts to navigate to a page that requires authentication (e.g., the booking flow). They are redirected to the sign-in page. After signing in, they are returned to the page they originally requested.

**Why this priority**: Protected routes are the mechanism that enforces authentication across the platform. Without this, the auth feature has no enforcement.

**Independent Test**: Navigating directly to a protected URL while signed out redirects to sign-in, and the intended URL is restored after sign-in completes.

**Acceptance Scenarios**:

1. **Given** an unauthenticated user, **When** they navigate to a protected route, **Then** they are redirected to the sign-in page.
2. **Given** an unauthenticated user redirected to sign-in, **When** they successfully sign in, **Then** they are returned to the originally-requested page.
3. **Given** an authenticated user, **When** they navigate to any protected route, **Then** they access it without interruption.

---

### User Story 4 — Sign Out (Priority: P2)

A signed-in user wants to end their session. They click a sign-out control, their session is terminated, and they are returned to a public page.

**Why this priority**: Sign-out is required for security and shared-device use, but does not block any primary flow.

**Independent Test**: A signed-in user can sign out and is no longer able to access protected routes without signing in again.

**Acceptance Scenarios**:

1. **Given** a signed-in user, **When** they trigger sign-out, **Then** their session ends and they are redirected to the home page.
2. **Given** a user who has signed out, **When** they attempt to access a protected route, **Then** they are redirected to sign-in.

---

### User Story 5 — Reset Forgotten Password (Priority: P2)

A registered user has forgotten their password. They navigate to a "Forgot Password" flow, enter their email address, receive a reset link, and set a new password.

**Why this priority**: Password recovery is a standard expectation and reduces support burden, but does not block MVP booking.

**Independent Test**: A user who has forgotten their password can recover access to their account via email within the sign-in flow.

**Acceptance Scenarios**:

1. **Given** a user on the forgot-password page, **When** they enter a registered email and submit, **Then** they receive a password reset email (whether or not the email is registered, to prevent enumeration).
2. **Given** a valid reset link, **When** the user sets a new password and submits, **Then** their password is updated and they are signed in.
3. **Given** an expired or invalid reset link, **When** the user attempts to use it, **Then** they see an error and are offered the option to request a new reset link.

---

### Edge Cases

- What happens when a user's session expires mid-session? They are redirected to sign-in on their next request to a protected route, with their intended destination preserved where possible.
- After email verification, the user is sent to their originally-intended destination (if a redirect was pending) or the mediator roster (if they navigated directly to sign-up).
- What happens if the verification email is not received? The user can request a resend from the "check your email" screen.
- What happens when a user signs in on multiple devices? All sessions remain valid (standard web behavior).
- What happens if a user tries to use an expired verification link? They are shown an error with an option to resend.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Users MUST be able to create an account by providing their first name, last name, email address, and a password.
- **FR-002**: Users MUST verify their email address before their account is active and they can access protected functionality.
- **FR-003**: The platform MUST send a verification email upon account creation, containing a time-limited confirmation link.
- **FR-004**: Users MUST be able to sign in with their verified email address and password.
- **FR-005**: Sign-in error messages MUST NOT reveal whether the email or the password was incorrect (generic "invalid credentials" response to prevent enumeration).
- **FR-006**: Users MUST be able to sign out, terminating their session immediately.
- **FR-007**: All booking-related routes MUST be protected — unauthenticated access MUST redirect to the sign-in page.
- **FR-008**: After successful sign-in, users MUST be redirected to their originally-requested destination if a redirect was pending, or to the home page otherwise.
- **FR-009**: Users MUST be able to initiate a password reset by providing their registered email address.
- **FR-010**: The platform MUST send a password reset email with a time-limited link when a reset is requested, regardless of whether the email is registered (to prevent enumeration).
- **FR-011**: Users MUST be able to set a new password via the reset link and be signed in automatically upon completion.
- **FR-012**: Passwords MUST meet a minimum complexity requirement (minimum 8 characters; inclusion of mixed case, numbers, or symbols is encouraged but the specific policy is delegated to the auth provider's defaults).
- **FR-013**: The sign-in, sign-up, and password-reset pages MUST be accessible to unauthenticated users without redirection.
- **FR-014**: The navigation MUST reflect the user's authentication state — signed-out users see sign-in/sign-up controls; signed-in users see a sign-out control and account indicator.
- **FR-015**: When a user completes registration, the platform MUST create a corresponding User record in its own database, triggered by an auth provider webhook.
- **FR-016**: Webhook-driven User record creation MUST be idempotent — duplicate webhook events for the same user MUST NOT produce duplicate records.

### Key Entities

- **User Account**: Represents a platform user. Key attributes: first name, last name, email address, verification status, account creation date. Stored in the platform's own database, created via a webhook event fired by the auth provider when registration completes. A user account is distinct from a Mediator profile — a mediator who also books sessions would have one account serving both roles (future consideration; out of scope for this feature).
- **Auth Webhook Event**: The signal from the auth provider that triggers User Account creation in the platform database. The platform must handle this event idempotently (duplicate events must not create duplicate records).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A new user can complete account creation and email verification in under 3 minutes.
- **SC-002**: A returning user can sign in and reach their intended destination in under 30 seconds.
- **SC-003**: Unauthenticated access to any protected route results in a redirect to sign-in 100% of the time.
- **SC-004**: After sign-in, the user is returned to their originally-intended destination in 100% of redirect cases.
- **SC-005**: A user can complete the forgot-password flow and regain account access in under 5 minutes.
- **SC-006**: No authentication credentials (passwords, tokens) are exposed in URLs, logs, or error messages.

## Assumptions

- The auth provider (pre-selected in platform constitution) handles password hashing, session token management, and email delivery — no custom implementation of these primitives.
- Social login (Google, GitHub, etc.) is out of scope for MVP; email/password only.
- Mediator-specific accounts and the mediator application flow are separate features. This feature covers counsel/party accounts only, though the underlying account system must not preclude adding mediator accounts later.
- Admin accounts are out of scope for this feature.
- Multi-factor authentication (MFA) is out of scope for MVP but the auth provider must support it as a future add-on without a migration.
- Session persistence across browser refreshes is expected (standard "remember me" behavior); explicit "remember me" toggle is out of scope.
- The booking routes are the primary protected area for MVP; other routes (mediator dashboard, admin) will be protected as those features are built.
- Users are assumed to have access to the email address they register with.
