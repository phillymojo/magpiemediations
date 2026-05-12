# Contract: Mediator Roster Page

**Feature**: `001-mediator-roster` | **Date**: 2026-05-06

## Page Route

**URL**: `/mediators`
**Access**: Public — no authentication required.
**Rendering**: React Server Component (RSC). Data fetched server-side on each
request. CDN-cacheable (public mediator data; short TTL recommended — e.g., 60s).

### searchParams (URL query string)

All parameters are optional. Absent parameters mean "no filter applied."

| Param | Type | Example | Description |
|---|---|---|---|
| `practice` | string | `personal-injury` | PracticeArea slug. Single value (single-select filter for MVP). |
| `state` | string | `CA` | US state code (2-letter). |
| `search` | string | `Sarah` | Free text; matched against `firstName`, `lastName`, and `firm`. |
| `page` | integer | `2` | Page number, 1-indexed. Defaults to `1`. Out-of-range values clamp to valid range. |

**Example URL**: `/mediators?practice=personal-injury&state=CA&page=2`

### Page Output

Renders:
- `RosterFilters` — practice area dropdown + state dropdown (client components).
- `RosterSearch` — debounced text search input (client component).
- `MediatorGrid` — grid of `MediatorCard` components (server component), or
  `EmptyState` if no results.
- `RosterPagination` — numbered page controls (server component), hidden when
  `totalPages === 1`.

---

## Mediator Detail Route (Stub)

**URL**: `/mediators/[id]`
**Access**: Public.
**MVP behavior**: Placeholder page confirming the mediator exists and is ACTIVE;
acts as the booking entry point. Booking flow content is out of scope for this
feature and will be replaced by the booking feature spec.
**404 behavior**: If `id` does not correspond to an ACTIVE mediator (not found,
or status is not ACTIVE), return a clear "This mediator is no longer available"
page (not a raw 404).

---

## Data Function: `getMediators`

**File**: `lib/db/mediators.js`

### Signature

```js
getMediators({
  practiceAreaSlug,  // string | undefined
  stateCode,         // string | undefined
  search,            // string | undefined
  page,              // number, default 1
  pageSize,          // number, default 12
})
// Returns: Promise<{ mediators: Mediator[], totalCount: number, totalPages: number }>
```

### Mediator Shape (returned)

```js
{
  id: string,                         // UUID
  firstName: string,
  lastName: string,
  firm: string,
  city: string,
  state: string,                      // "CA"
  yearsOfPractice: number,
  practiceAreas: [{ name, slug }],    // ordered by name ASC
}
```

### Constraints (non-negotiable)

1. **`verificationStatus === 'ACTIVE'` is always applied.** This filter MUST
   appear in every code path that calls the database. It may not be made
   conditional or optional by any caller.
2. Sort is always `lastName ASC, firstName ASC` for this feature.
3. `page` values below 1 are treated as 1. `page` values above `totalPages` return
   an empty `mediators` array.
4. Empty `search` string is treated as absent (no search filter applied).

### Prisma Query (reference implementation)

```js
const where = {
  verificationStatus: 'ACTIVE',
  ...(stateCode   && { state: stateCode }),
  ...(practiceAreaSlug && {
    practiceAreas: { some: { practiceArea: { slug: practiceAreaSlug } } }
  }),
  ...(search && {
    OR: [
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName:  { contains: search, mode: 'insensitive' } },
      { firm:      { contains: search, mode: 'insensitive' } },
    ]
  }),
}

const [mediators, totalCount] = await Promise.all([
  prisma.mediator.findMany({
    where,
    include: { practiceAreas: { include: { practiceArea: true } } },
    orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
    skip: (page - 1) * pageSize,
    take: pageSize,
  }),
  prisma.mediator.count({ where }),
])

const totalPages = Math.ceil(totalCount / pageSize)
return { mediators, totalCount, totalPages }
```

---

## Data Function: `getPracticeAreas`

**File**: `lib/db/practiceAreas.js`

```js
getPracticeAreas()
// Returns: Promise<{ id, name, slug }[]>
// Ordered by name ASC.
// Used to populate the practice area filter dropdown.
```

---

## URL State Conventions

Filter state is encoded in the URL to satisfy FR-016. Client components use
`useSearchParams()` to read current state and `useRouter().push()` to update it.

When a filter changes, the client component:
1. Reads the current `searchParams` object.
2. Creates a new `URLSearchParams` from the current values.
3. Sets or deletes the changed param.
4. Resets `page` to `1` (filter change always starts at page 1).
5. Calls `router.push('/mediators?' + params.toString())`.

When "clear all filters" is triggered, the client component navigates to
`/mediators` (no query string).
