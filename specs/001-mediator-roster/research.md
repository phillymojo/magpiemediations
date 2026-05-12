# Research: Mediator Roster (Browse & Filter)

**Branch**: `001-mediator-roster` | **Date**: 2026-05-06
**Status**: Complete — no blockers for Phase 1 design

## Decision Log

### 1. Mediator URL Identity

**Decision**: UUID (`/mediators/[id]`) for MVP.
**Rationale**: Stable, collision-free, no slug-generation logic required.
The id is already the primary key in the data model; no additional field needed.
**Alternatives considered**:
- Vanity slug (e.g., `/mediators/sarah-m-morrison-los-angeles`) — readable but
  requires collision-handling logic, normalization, and manual curation. Deferred
  to Phase 2 if partners or mediators request it.
- Numeric sequential ID — shorter than UUID but not universally unique if the
  database is ever seeded or migrated.

---

### 2. Filter State Management

**Decision**: URL `searchParams` as single source of truth. Server component
receives them as a prop; no client-side filter state (`useState`).
**Rationale**: App Router's idiomatic pattern for filterable list pages. Makes
every filtered view inherently shareable and bookmarkable (FR-016). Browser
back/forward works without extra code.
**Alternatives considered**:
- Client-side state (`useState`) with a separate API route — requires an extra
  round-trip, makes the URL non-canonical, and breaks FR-016 (filter state in URL).
- Zustand / global store — unnecessary complexity for a read-only page.

---

### 3. Filter Interactivity Pattern

**Decision**: Client components (`RosterFilters`, `RosterSearch`) push updated
searchParams to the URL via `useRouter().push()`. Next.js soft navigation
triggers the RSC to re-execute with new params.
**Rationale**: Keeps the roster page itself a Server Component (no `'use client'`
on `page.js`). Only the interactive controls ship JavaScript to the browser.
Search input uses a debounce (300ms) before pushing to avoid a URL update on
every keystroke.
**Alternatives considered**:
- HTML form with `action="/mediators"` (full page navigation) — works without
  JavaScript but loses the soft-navigation UX.
- Dedicated `/api/mediators` route + `fetch` on filter change — adds a round-trip
  and unnecessary API surface for a server-rendered feature.

---

### 4. Search Implementation

**Decision**: Postgres `ILIKE '%query%'` on a concatenated `firstName || ' ' || lastName` column, with a separate `ILIKE` on `firm`. Combined with `OR`.
**Rationale**: Adequate for MVP roster size (≤1,000 mediators). Simple to
implement and maintain; no additional infrastructure.
**Alternatives considered**:
- `pg_trgm` (trigram extension) — better fuzzy matching (handles typos) but
  requires a Postgres extension and additional Neon setup. Phase 2 optimization.
- Algolia / Typesense — best-in-class search UX but adds external dependency and
  cost. YAGNI for MVP scale.

---

### 5. Pagination Strategy

**Decision**: Offset pagination — Prisma `skip`/`take`. `skip = (page - 1) * pageSize`.
**Rationale**: Simple, transparent, and correct for alphabetical sort (which is
stable across pages for this data). Total page count is easily computed for the
numbered controls.
**Alternatives considered**:
- Cursor-based pagination — better for infinite scroll and real-time data, but
  makes "jump to page N" controls difficult and adds implementation complexity.
  Not warranted at MVP scale or for this UX pattern.

---

### 6. Server vs. Client Component Split

**Decision**:

| Component | Type | Reason |
|---|---|---|
| `app/mediators/page.js` | Server | Fetches data; no browser APIs needed |
| `MediatorCard.js` | Server | Pure display; no interactivity |
| `MediatorGrid.js` | Server | Wraps cards; no interactivity |
| `RosterPagination.js` | Server | Links only; no interactivity |
| `EmptyState.js` | Server | Pure display |
| `RosterFilters.js` | **Client** | Dropdowns must update URL on change |
| `RosterSearch.js` | **Client** | Input needs debounce + URL update |

**Rationale**: Minimize JavaScript sent to the browser. Only components that
genuinely require browser interactivity are Client Components.

---

### 7. Accessibility Commitment

**Decision**: WCAG 2.1 AA for all roster page components.
**Rationale**: Legal-tech audience includes attorneys with disabilities. Public
pages have no auth barrier, so accessibility obligations are full-surface.
Resolves the Outstanding item flagged during `/speckit-clarify`.
**Implementation requirements**:
- Filter dropdowns: `<label>` elements associated via `for`/`id`; keyboard
  navigable; focus returns to filter after update.
- Mediator cards: each card has an accessible name (mediator's full name as the
  link text or `aria-label`).
- Empty states: `role="status"` or `aria-live="polite"` so screen readers
  announce filter result changes.
- Pagination: current page indicated via `aria-current="page"`.

---

### 8. Rate Limiting Approach

**Decision**: Next.js middleware (`middleware.js`) with a simple **in-memory
sliding-window rate limiter** for MVP. No external dependency required.
**Rationale**: Roster page is unauthenticated and public — a scraper or bot
could hammer the page and exhaust Neon connection slots. Rate limiting at the
middleware layer stops this before it hits the database. In-memory is sufficient
for MVP traffic: it resets on Lambda cold starts, but cold starts are infrequent
and the risk window is small.
**Graduation path**: When the platform reaches production traffic, replace the
in-memory limiter with `@upstash/ratelimit` backed by Upstash Redis. This is a
single-file swap in `middleware.js` — no other code changes required. Upstash
is consistent with Principle V (buy, don't build) and survives Lambda restarts.

---

## Open Items

None — all Phase 0 unknowns resolved. Phase 1 design can proceed.
