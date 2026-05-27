# Data Model: User Authentication (003-user-auth)

**Branch**: `003-user-auth` | **Date**: 2026-05-20

## New Model: User

Stores the platform's local representation of authenticated users, synced from Clerk via webhook.

```prisma
model User {
  id        String   @id              // Clerk user ID — "user_xxxxxxxxxxxx" (27 chars)
  email     String   @unique
  firstName String
  lastName  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([email])
}
```

**Key design decisions:**
- `id` is Clerk's user ID string (not a UUID). Single source of truth, no mapping table needed.
- `email` is unique — mirrors Clerk's own uniqueness constraint.
- `firstName` / `lastName` are separate fields to support personalized email salutations and future profile display.
- No `deletedAt` for MVP (hard delete on `user.deleted` webhook). This MUST be revisited before the booking feature ships, as User records will become a foreign key target.

## No Schema Changes to Existing Models

`Mediator`, `PracticeArea`, and `MediatorPracticeArea` are unchanged.

## Migration

New migration: `add_user_table`

```sql
CREATE TABLE "User" (
  "id"        TEXT NOT NULL,
  "email"     TEXT NOT NULL,
  "firstName" TEXT NOT NULL,
  "lastName"  TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE INDEX "User_email_idx" ON "User"("email");
```

## Future Relation (not implemented in this feature)

When the booking feature ships, `User` will gain a `bookings Booking[]` relation. The hard-delete behavior will need to change to soft-delete at that point to preserve booking history.
