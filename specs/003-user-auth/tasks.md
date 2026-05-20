# Tasks: User Authentication

**Input**: Design documents from `specs/003-user-auth/`
**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | contracts/ ✅

---

## Phase 1: Setup

**Purpose**: Install Clerk dependencies and configure environment variables.

- [ ] T001 Install @clerk/nextjs and svix — `npm install @clerk/nextjs svix`
- [ ] T002 [P] Add Clerk redirect env vars to `.env` and `.env.example` — `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in`, `NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up`, `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/mediators`, `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/mediators`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure required before any user story can be implemented.

**⚠️ CRITICAL**: All phases depend on this completing first.

- [ ] T003 Add `User` model to `prisma/schema.prisma` per `specs/003-user-auth/data-model.md` — fields: `id String @id`, `email String @unique`, `firstName String`, `lastName String`, `createdAt`, `updatedAt`
- [ ] T004 Create and apply Prisma migration — `npx prisma migrate dev --name add-user-table`
- [ ] T005 [P] Create `lib/db/users.js` — export `upsertUser({ id, email, firstName, lastName })` and `deleteUser(id)` using `prisma.user.upsert` and `prisma.user.delete`
- [ ] T006 Wrap `app/layout.js` body content with `<ClerkProvider>` imported from `@clerk/nextjs` — `<ClerkProvider>` goes inside `<body>`, wrapping `<Navbar />`, the content div, and `<Footer />`
- [ ] T007 Replace `proxy.js` export with `clerkMiddleware()` from `@clerk/nextjs/server` — update matcher to include `'/__clerk/(.*)'` and `'/(api|trpc)(.*)'`; add `createRouteMatcher` to protect `/booking` and `/booking/(.*)` routes (redirect unauthenticated users to `/sign-in`)

**Checkpoint**: ClerkProvider active, middleware wired, User table exists. Sign-in/up pages not yet created.

---

## Phase 3: US1 — Create an Account (Priority: P1) 🎯

**Goal**: A new user can register with first name, last name, email, and password; verify their email; and land on `/mediators`.

**Independent Test**: Navigate to `/sign-up`, create an account, verify email, confirm redirect to `/mediators`, confirm User row in Postgres.

- [ ] T008 Create `app/(auth)/layout.js` — centered layout (no Navbar/Footer) for auth pages; white card on slate background matching platform design
- [ ] T009 Create `app/(auth)/sign-up/[[...sign-up]]/page.js` — render `<SignUp />` from `@clerk/nextjs`; center on page
- [ ] T010 Create `app/api/webhooks/clerk/route.js` — POST handler: verify svix signature using `CLERK_WEBHOOK_SECRET` (return 400 on failure), handle `user.created` → `upsertUser()`, `user.updated` → `upsertUser()`, `user.deleted` → `deleteUser()`; log event type only (no PII per constitution Principle I)
- [ ] T011 Write unit tests for webhook handler in `__tests__/api/webhooks/clerk.test.js` — mock `svix` and `lib/db/users`; cover: valid signature → upsertUser called, invalid signature → 400 response, duplicate `user.created` → upsertUser called (idempotent), `user.deleted` → deleteUser called, unknown event type → 200 no-op

**Checkpoint**: Sign-up form renders, webhook creates User in Postgres, email verification redirects to `/mediators`.

---

## Phase 4: US2 — Sign In (Priority: P1)

**Goal**: A returning user can sign in and be redirected to their intended destination or `/mediators`.

**Independent Test**: Sign in with existing account credentials; confirm redirect to `/mediators`; confirm invalid credentials show generic error.

- [ ] T012 Create `app/(auth)/sign-in/[[...sign-in]]/page.js` — render `<SignIn />` from `@clerk/nextjs`; center on page (reuses `(auth)` layout from T008)

**Checkpoint**: Sign-in form renders, valid credentials redirect to `/mediators`, invalid credentials show generic error.

---

## Phase 5: US3 — Protected Routes (Priority: P1)

**Goal**: Unauthenticated users attempting to access protected routes are redirected to `/sign-in` and returned there after sign-in.

**Independent Test**: While signed out, navigate directly to `/booking` (future route) — confirm redirect to `/sign-in`. Sign in — confirm redirect back to `/booking`.

- [ ] T013 Verify `proxy.js` protected route pattern works end-to-end — manually test redirect behavior for a protected URL while signed out; confirm `afterSignInUrl` returns user to intended destination; confirm public routes (`/`, `/mediators`, `/sign-in`, `/sign-up`) remain accessible without auth

**Checkpoint**: Protected routes redirect to `/sign-in`; redirect-back-after-login works; public routes unaffected.

---

## Phase 6: US4 — Sign Out (Priority: P2)

**Goal**: A signed-in user can sign out via the navbar; their session is cleared and they are returned to the home page.

**Independent Test**: Sign in, click the `<UserButton>` avatar in the navbar, select sign-out — confirm session cleared and redirect to `/`.

- [ ] T014 Update `components/layout/Navbar.js` — replace placeholder sign-in/sign-up links with `<Show when="signed-out">` containing `<SignInButton>` and `<SignUpButton>`, and `<Show when="signed-in">` containing `<UserButton>`; import all from `@clerk/nextjs`; style buttons to match existing navy navbar

**Checkpoint**: Navbar shows correct controls for both auth states; `<UserButton>` dropdown provides sign-out.

---

## Phase 7: US5 — Reset Forgotten Password (Priority: P2)

**Goal**: A user who forgot their password can reset it via email link and regain access.

**Independent Test**: From sign-in page click "Forgot password?", enter email, receive reset email, set new password, confirm sign-in succeeds.

- [ ] T015 Verify password reset flow works via Clerk's built-in `<SignIn />` component — no code changes required (Clerk handles the full reset flow through the `[[...sign-in]]` catch-all route); test manually per `specs/003-user-auth/quickstart.md`

**Checkpoint**: Forgot password link visible on sign-in, reset email received, new password accepted.

---

## Phase 8: Polish & Cross-Cutting Concerns

- [ ] T016 [P] Configure Clerk webhook in Clerk dashboard — set endpoint URL to `https://main.d2j2vwg6hb553h.amplifyapp.com/api/webhooks/clerk`, enable `user.created`, `user.updated`, `user.deleted` events; copy `CLERK_WEBHOOK_SECRET` to `.env` and Amplify branch env vars
- [ ] T017 [P] Add `CLERK_SECRET_KEY`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, and `CLERK_WEBHOOK_SECRET` keys (without values) to `.env.example`
- [ ] T018 Run `npm test` — all existing tests must pass; webhook handler tests (T011) must pass
- [ ] T019 Run `npm run build` — verify clean build with no errors
- [ ] T020 End-to-end smoke test per `specs/003-user-auth/quickstart.md` — sign-up → verify email → redirected to `/mediators` → User row in Postgres → sign-out → navigate to protected route → redirected to `/sign-in` → sign-in → returned to protected route

---

## Dependencies & Execution Order

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 — blocks all user story phases
- **Phases 3–7 (User Stories)**: All depend on Phase 2; US1/US2/US3 are P1 and should be done first; US4/US5 are P2
- **Phase 8 (Polish)**: Depends on all user story phases complete

### User Story Dependencies

- **US1** (T008–T011): Depends on Phase 2 — no other story dependency
- **US2** (T012): Depends on Phase 2 and `(auth)` layout from US1 (T008)
- **US3** (T013): Depends on T007 (middleware) — verification only
- **US4** (T014): Depends on Phase 2 — independent of US1/US2/US3
- **US5** (T015): Depends on US2 (sign-in page) — verification only

### Parallel Opportunities

- T002 and T003–T005 can run in parallel after T001
- T005 and T006 and T007 can run in parallel after T003–T004
- T008 and T009 can run in parallel
- T016 and T017 and T018 and T019 can run in parallel in Polish phase

---

## Implementation Strategy

### MVP First (US1 + US2 + US3 — all P1)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: US1 (Create Account + webhook)
4. Complete Phase 4: US2 (Sign In)
5. Complete Phase 5: US3 (Protected Routes — verification)
6. **STOP and VALIDATE**: Full sign-up → sign-in flow working, User in Postgres, protected routes redirect correctly
7. Complete Phase 6: US4 (Sign Out — navbar)
8. Complete Phase 7: US5 (Password Reset — verification)
9. Complete Phase 8: Polish + deploy

---

## Notes

- T015 (password reset) and T013 (protected routes) are smoke-test tasks — no code changes. Clerk handles both automatically.
- Webhook endpoint requires a publicly reachable URL — use ngrok locally (see `quickstart.md`). Amplify prod URL works for production testing.
- `<UserButton>` from Clerk handles sign-out — no custom sign-out route or server action needed.
- Hard delete on `user.deleted` is correct for MVP. When the booking feature ships, this MUST change to soft delete.
- Total tasks: 20 | Parallel-eligible: 9 | Smoke-test only: 2 (T013, T015)
