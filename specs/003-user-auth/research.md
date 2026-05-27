# Research: User Authentication (003-user-auth)

**Branch**: `003-user-auth` | **Date**: 2026-05-20

## Clerk API Version Note

The Clerk quickstart prompt from the dashboard (May 2026) confirms several API details that supersede earlier research. These are locked in below.

**NEVER use** (deprecated):
- `<SignedIn>` / `<SignedOut>` → replaced by `<Show when="signed-in">` / `<Show when="signed-out">`
- `authMiddleware()` → replaced by `clerkMiddleware()`

**ALWAYS use**:
- `clerkMiddleware()` from `@clerk/nextjs/server`
- `<Show>`, `<UserButton>`, `<SignInButton>`, `<SignUpButton>` from `@clerk/nextjs`
- `auth()` from `@clerk/nextjs/server` (async/await pattern)
- `<ClerkProvider>` inside `<body>` (not wrapping `<html>`)

## Decision 1 — Clerk Package

**Decision**: `@clerk/nextjs` (single package, covers middleware + React components + server utilities)

**Rationale**: The official Clerk package for Next.js App Router. No separate client/server packages needed.

**Alternatives considered**: `@clerk/clerk-react` (legacy, not App Router–aware; rejected).

---

## Decision 2 — Middleware Composition

**Decision**: `clerkMiddleware()` from `@clerk/nextjs/server` becomes the primary export in `proxy.js`. Our existing rate limiter is called from inside the Clerk middleware callback.

**Rationale**: Clerk middleware must run first so `auth()` context is populated for downstream route protection. The rate limiter is applied to `/mediators` routes within the same callback.

**Pattern**:
```
proxy.js exports clerkMiddleware(async (auth, request) => {
  // 1. Protect booking routes — redirect to /sign-in if unauthenticated
  // 2. Rate-limit /mediators routes (existing logic)
})
```

**Middleware matcher** (confirmed from Clerk dashboard prompt — must include `/__clerk/` path):
```js
export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/__clerk/(.*)',
    '/(api|trpc)(.*)',
  ],
}
```

**Alternatives considered**: Chaining via `NextResponse` wrapping — more fragile; rejected in favor of Clerk's built-in callback pattern.

---

## Decision 3 — Auth UI Components

**Decision**: Clerk's `<SignIn />` and `<SignUp />` embedded components mounted on Next.js catch-all routes. Navigation state handled by `<Show>`, `<UserButton>`, `<SignInButton>`, `<SignUpButton>`.

**Route convention**:
- `/sign-in/[[...sign-in]]/page.js` → `<SignIn />`
- `/sign-up/[[...sign-up]]/page.js` → `<SignUp />`

**Nav component pattern** (confirmed from Clerk dashboard prompt):
```jsx
import { Show, UserButton, SignInButton, SignUpButton } from '@clerk/nextjs'

// Signed-out state:
<Show when="signed-out">
  <SignInButton />
  <SignUpButton />
</Show>

// Signed-in state:
<Show when="signed-in">
  <UserButton />   // avatar + dropdown with sign-out
</Show>
```

**Rationale**: Catch-all routes allow Clerk to handle sub-flows (email verification, password reset, OAuth callbacks) without additional route configuration. Embedded components keep users on our domain. `<UserButton>` provides sign-out via its built-in dropdown — no custom sign-out button needed.

**Alternatives considered**: Clerk-hosted pages (redirect to accounts.clerk.dev) — rejected; breaks UX continuity and is harder to style to match the platform.

---

## Decision 4 — Webhook Signature Verification

**Decision**: Use `svix` npm package to verify Clerk webhook signatures.

**Rationale**: Clerk uses Svix as its webhook infrastructure. The `svix` package is the canonical verification library. Verifies `svix-id`, `svix-timestamp`, and `svix-signature` headers before any side effect per the constitution's webhook signature verification requirement.

**Events handled**:
- `user.created` → upsert User record in Postgres
- `user.updated` → update User record in Postgres
- `user.deleted` → mark User as deleted (soft delete) or remove record

---

## Decision 5 — User ID Strategy

**Decision**: Use Clerk's user ID (`user_xxxxxxxxxxxx`, 27-character string) as the Postgres `User` table primary key.

**Rationale**: Deterministic, unique, URL-safe, fixed length. Using Clerk's ID directly avoids a separate UUID + Clerk ID mapping, simplifies joins, and makes auth context → database lookup a single-step operation (`auth().userId` is the PK).

**Alternatives considered**: UUID primary key with a separate `clerkId` column — adds a join with no benefit at MVP scale; rejected.

---

## Decision 6 — ClerkProvider Placement

**Decision**: Wrap `app/layout.js` with `<ClerkProvider>` at the root layout level.

**Rationale**: Required for all Clerk React hooks and components to work anywhere in the component tree. Placed once at the root; no per-page setup needed.

---

## Decision 7 — Soft Delete vs Hard Delete on user.deleted

**Decision**: Hard delete for MVP — remove the User record from Postgres when `user.deleted` fires.

**Rationale**: No bookings table exists yet, so there are no foreign key concerns. When the booking feature is added, this decision should be revisited (soft delete will be required once Users have associated bookings). Document this as a known migration point.

**Alternatives considered**: Soft delete (`deletedAt` timestamp) — correct long-term pattern, but adds schema complexity with no immediate benefit before bookings exist.
