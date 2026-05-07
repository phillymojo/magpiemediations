# Data Model: Mediator Roster (Browse & Filter)

**Branch**: `001-mediator-roster` | **Date**: 2026-05-06

## Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")   // pooled Neon connection string
  directUrl = env("DIRECT_URL")    // direct (non-pooled) for migrations only
}

// ─── Enums ────────────────────────────────────────────────────────────────────

enum VerificationStatus {
  PENDING    // Application received; not yet reviewed
  ACTIVE     // Verified and visible on the public roster
  SUSPENDED  // Temporarily removed (e.g., bar issue under review)
  WITHDRAWN  // Voluntarily left the platform
}

// ─── Models ───────────────────────────────────────────────────────────────────

model Mediator {
  id                 String               @id @default(uuid())
  firstName          String
  lastName           String
  firm               String               // Law firm or "Solo Practice"
  city               String
  state              String               // ISO 3166-2 subdivision code: "CA", "TX", etc.
  yearsOfPractice    Int                  // Years of active civil litigation practice
  verificationStatus VerificationStatus   @default(PENDING)
  practiceAreas      MediatorPracticeArea[]
  createdAt          DateTime             @default(now())
  updatedAt          DateTime             @updatedAt

  // Indexes required by Scalability Practices (constitution)
  @@index([verificationStatus])          // roster query always filters on this
  @@index([state])                       // state filter
  @@index([lastName, firstName])         // default alphabetical sort
}

model PracticeArea {
  id        String               @id @default(uuid())
  name      String               @unique   // Display: "Personal Injury"
  slug      String               @unique   // URL/filter: "personal-injury"
  mediators MediatorPracticeArea[]
}

model MediatorPracticeArea {
  mediatorId     String
  practiceAreaId String
  mediator       Mediator     @relation(fields: [mediatorId], references: [id], onDelete: Cascade)
  practiceArea   PracticeArea @relation(fields: [practiceAreaId], references: [id])

  @@id([mediatorId, practiceAreaId])
  @@index([practiceAreaId])              // efficient filter: "all mediators in area X"
}
```

## Field Notes

### Mediator

| Field | Type | Notes |
|---|---|---|
| `id` | `String` (UUID) | Used in `/mediators/[id]` URL. Stable across renames. |
| `firstName` | `String` | Stored separately from `lastName` to support `lastName ASC` sort. |
| `lastName` | `String` | Primary sort key (alphabetical A→Z). |
| `firm` | `String` | "Solo Practice" if no firm affiliation. |
| `city` | `String` | Free text; not normalized. Displayed on card as "City, STATE". |
| `state` | `String` | Two-letter US state code. Validated at application time against the canonical 51-entry list (50 states + D.C.). |
| `yearsOfPractice` | `Int` | Whole number of years. Calculated at application time; re-attested annually. |
| `verificationStatus` | `Enum` | **All roster queries MUST filter on `ACTIVE`.** No other status is visible to the public. |
| `createdAt` / `updatedAt` | `DateTime` | Standard Prisma audit timestamps. |

**Derived at render time (not stored)**:
- **Initials avatar**: `firstName[0].toUpperCase() + lastName[0].toUpperCase()`

### PracticeArea

| Field | Type | Notes |
|---|---|---|
| `id` | `String` (UUID) | Internal reference. |
| `name` | `String` | Displayed in filter dropdown and on mediator card. |
| `slug` | `String` | Used in URL `?practice=personal-injury`. Lower-kebab-case. |

**Initial seed data** (from FR-018 canonical list):

| name | slug |
|---|---|
| Personal Injury | personal-injury |
| Commercial Litigation | commercial-litigation |
| Employment | employment |
| Real Estate | real-estate |
| Insurance Defense | insurance-defense |
| Intellectual Property | intellectual-property |
| Construction | construction |

### MediatorPracticeArea

Join table implementing the many-to-many relationship between `Mediator` and
`PracticeArea`. Many-to-many is required by the spec (a mediator may have one
or more practice areas) and ensures the data model remains multi-select-ready
per FR-007 (even though the filter UI is single-select in MVP).

## State Transitions

```
PENDING → ACTIVE       (admin approves verification)
ACTIVE  → SUSPENDED    (admin flags for review)
ACTIVE  → WITHDRAWN    (mediator requests removal)
SUSPENDED → ACTIVE     (admin clears review)
SUSPENDED → WITHDRAWN  (admin or mediator terminates)
```

State transitions are implemented in the mediator verification feature (a
separate spec). This feature only *reads* the status — it never writes it.

## Environment Variables Required

```env
# .env.local (development)
DATABASE_URL="postgresql://..."        # Neon pooled connection string
DIRECT_URL="postgresql://..."          # Neon direct connection (migrations only)
```

Both variables are required by Prisma. `DATABASE_URL` uses the pooled endpoint
(required for Lambda/serverless). `DIRECT_URL` uses the direct endpoint (Prisma
Migrate must not go through PgBouncer). See Neon dashboard → Connection Details.
