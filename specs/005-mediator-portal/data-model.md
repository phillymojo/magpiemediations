# Data Model: Mediator Portal (005-mediator-portal)

**Branch**: `005-mediator-portal` | **Date**: 2026-06-04

## Updated Model: Mediator

```prisma
model Mediator {
  // ... existing fields unchanged ...
  email  String?  @unique  // for auto-linking on sign-up; nullable — set by Morgan
  userId String?  @unique  // set when mediator claims their account
  user   User?    @relation(fields: [userId], references: [id])
}
```

**Key decisions:**
- Both fields are nullable — existing mediator records are unaffected
- `@unique` on both ensures one-to-one User↔Mediator relationship
- `email` is the matching key used at sign-up; `userId` is set after successful match

## Updated Model: User

```prisma
model User {
  // ... existing fields unchanged ...
  mediator Mediator?   // back-relation — null if user is not a mediator
}
```

## No New Models

No new tables required. All state changes use the existing `Booking` and `AuditLog` tables.

## Migration

New migration: `add-mediator-email-and-user-id`

```sql
ALTER TABLE "Mediator" ADD COLUMN "email" TEXT UNIQUE;
ALTER TABLE "Mediator" ADD COLUMN "userId" TEXT UNIQUE REFERENCES "User"("id");
```

Both columns are nullable — no backfill required.

## Clerk Public Metadata

When a mediator is linked (`mediator.userId` set), Clerk's user public metadata is updated:

```json
{ "isMediatorLinked": true }
```

This allows the Navbar (a Client Component) to conditionally show the "My Portal" link without a DB call.
