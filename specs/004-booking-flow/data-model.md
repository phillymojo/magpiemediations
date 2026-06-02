# Data Model: Booking Flow (004-booking-flow)

**Branch**: `004-booking-flow` | **Date**: 2026-06-02

## New Enums

```prisma
enum BookingStatus {
  PENDING_CONFIRMATION
  CONFIRMED
  CANCELLED
}

enum SessionType {
  HALF_DAY
  FULL_DAY
}
```

## New Model: Booking

```prisma
model Booking {
  id              String        @id @default(uuid())
  userId          String
  mediatorId      String
  sessionType     SessionType
  preferredDate   DateTime      @db.Date
  caseDescription String
  status          BookingStatus @default(PENDING_CONFIRMATION)
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  user     User     @relation(fields: [userId],     references: [id])
  mediator Mediator @relation(fields: [mediatorId], references: [id])

  @@index([userId])
  @@index([mediatorId])
  @@index([status])
}
```

**Key decisions:**
- `preferredDate` is `@db.Date` (date only, no time) to avoid Lambda UTC vs user timezone edge cases.
- `caseDescription` is a plain `String` — no encryption at DB level for MVP. Must be encrypted at rest (Neon default) and never appear in logs or emails.
- Hard delete is not expected on Booking records — future soft-delete if needed.

## New Model: AuditLog

```prisma
model AuditLog {
  id         String   @id @default(uuid())
  actorId    String   // User ID or "system"
  action     String   // e.g. "booking.created", "booking.confirmed"
  entityType String   // e.g. "Booking", "Payment"
  entityId   String   // UUID of the referenced entity
  newStatus  String?  // Status after the action, if applicable
  createdAt  DateTime @default(now())

  @@index([entityId])
  @@index([actorId])
}
```

**Key decisions:**
- No `@relation` to other models — polymorphic design supports future entity types (Payment, Agreement) without schema changes.
- No `updatedAt` — immutable by design. Application code paths MUST NOT UPDATE or DELETE audit entries.
- `newStatus` is nullable — some audit actions (e.g. future document uploads) have no status concept.

## Updated Models

### User — add bookings relation

```prisma
model User {
  // ... existing fields ...
  bookings Booking[]
}
```

### Mediator — add bookings relation

```prisma
model Mediator {
  // ... existing fields ...
  bookings Booking[]
}
```

## Migration

New migration: `add_booking_and_audit_log`

Creates: `BookingStatus` enum, `SessionType` enum, `Booking` table, `AuditLog` table, foreign key constraints, indexes.
