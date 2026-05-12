# Tasks: Mediator Roster (Browse & Filter)

**Input**: Design documents from `specs/001-mediator-roster/`
**Prerequisites**: plan.md ✅ spec.md ✅ research.md ✅ data-model.md ✅ contracts/ ✅

**Tests**: One unit test included (T011) — required by constitution Principle IV for the
`getMediators` verificationStatus gate. All other testing is pragmatic (verify tasks).

**Organization**: Tasks grouped by user story for independent implementation and delivery.

## Format: `[ID] [P?] [Story?] Description — file path`

- **[P]**: Can run in parallel (different files, no blocking dependency)
- **[US#]**: Which user story this task belongs to

---

## Phase 1: Setup (Project Initialization)

**Purpose**: Bootstrap the Next.js application and project infrastructure from
the currently empty repo. Nothing can be built until this phase is complete.

- [ ] T001 Initialize Next.js 15 app at repo root with App Router and Tailwind — run `npx create-next-app@latest . --yes --no-src-dir --app --tailwind --eslint --no-import-alias`
- [ ] T002 [P] Install and initialize shadcn/ui — run `npx shadcn@latest init` and accept defaults; install card, button, input, select components — `components.json`
- [ ] T003 [P] Install Prisma and Prisma Client — run `npm install prisma @prisma/client`; create `prisma/schema.prisma` datasource block with `DATABASE_URL` (pooled) and `directUrl` (direct)
- [ ] T004 [P] Create environment variable files — `.env.local` with `DATABASE_URL` and `DIRECT_URL` (Neon pooled + direct strings); `.env.example` documenting both variables without values; add `.env.local` to `.gitignore`
- [ ] T005 [P] Configure Jest for Next.js App Router — install `jest jest-environment-jsdom @testing-library/react @testing-library/jest-dom`; create `jest.config.js` and `jest.setup.js` per Next.js testing docs

**Checkpoint**: `npm run dev` starts without errors. `npm test` runs (no tests yet, but config works).

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Database schema, seed data, core data functions, and rate limiting
middleware. Every user story depends on this phase being complete.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [ ] T006 [P] Write Prisma schema — `Mediator`, `PracticeArea`, `MediatorPracticeArea`, `VerificationStatus` enum with all required indexes — `prisma/schema.prisma`
- [ ] T007 Run initial Prisma migration — `npx prisma migrate dev --name init-mediator-roster` (uses `DIRECT_URL`; creates tables in Neon)
- [ ] T008 [P] Write Prisma seed script — 7 canonical `PracticeArea` rows (Personal Injury, Commercial Litigation, Employment, Real Estate, Insurance Defense, Intellectual Property, Construction) + 15 sample `ACTIVE` mediators spread across states and practice areas — `prisma/seed.js`
- [ ] T009 Run seed to populate development database — `npx prisma db seed` (depends on T007, T008)
- [ ] T010 Create `getMediators` data function — accepts `{ practiceAreaSlug, stateCode, search, page, pageSize }`; always filters `verificationStatus = 'ACTIVE'`; sorts `lastName ASC, firstName ASC`; returns `{ mediators, totalCount, totalPages }` — `lib/db/mediators.js`
- [ ] T011 Write unit test for `getMediators` verificationStatus gate — verify `ACTIVE` filter is applied even when no other args passed; verify `PENDING`/`SUSPENDED`/`WITHDRAWN` mediators never appear in results — `__tests__/lib/db/mediators.test.js`
- [ ] T012 [P] Create `getPracticeAreas` data function — returns all practice areas ordered by `name ASC` for populating the filter dropdown — `lib/db/practiceAreas.js`
- [ ] T013 [P] Create Next.js middleware with in-memory sliding-window rate limiter on `/mediators` routes (60 requests/min per IP); log throttled requests without capturing IP in Sentry — `middleware.js`

**Checkpoint**: `npm test` passes (T011). `npx prisma studio` shows seeded mediators. `getMediators({})` returns 12 ACTIVE mediators.

---

## Phase 3: User Story 1 — Browse the Roster (Priority: P1) 🎯 MVP

**Goal**: An unauthenticated visitor loads `/mediators` and sees paginated mediator
cards in alphabetical order by surname. Empty state shown when roster is empty.

**Independent Test**: Load `http://localhost:3000/mediators` with no filters. Confirm
seeded mediator cards display (name, firm, city/state, practice areas, years of practice,
initials avatar). Confirm alphabetical order. Confirm pagination controls appear when
roster exceeds 12 results. Confirm empty state when all mediators removed from seed.

- [ ] T014 [P] [US1] Create `EmptyState` component — two variants via prop: `"no-results"` (no mediators match filters, shows clear-all button) and `"empty-roster"` (no active mediators at all) — `components/mediators/EmptyState.js`
- [ ] T015 [P] [US1] Create `MediatorCard` component — renders name (`firstName lastName`), firm, location (`city, STATE`), practice area tags, years of practice, initials avatar (`firstName[0] + lastName[0]`); entire card is a link to `/mediators/[id]` — `components/mediators/MediatorCard.js`
- [ ] T016 [US1] Create `MediatorGrid` component — responsive grid (3-col desktop, 2-col tablet, 1-col mobile); renders `MediatorCard` for each mediator or `EmptyState` when array is empty (depends on T014, T015) — `components/mediators/MediatorGrid.js`
- [ ] T017 [US1] Create `RosterPagination` component — numbered page controls (← Prev · 1 · 2 · 3 · … · Next →); highlights current page; hidden when `totalPages === 1`; each page number is a link updating `?page=N` in URL — `components/mediators/RosterPagination.js`
- [ ] T018 [US1] Create roster RSC page — reads ALL searchParams (`practice`, `state`, `search`, `page`); calls `getMediators` and `getPracticeAreas`; renders `MediatorGrid` and `RosterPagination`; layout includes page heading and "not a law firm" disclaimer in footer (depends on T010, T012, T016, T017) — `app/mediators/page.js`
- [ ] T019 [US1] Create loading skeleton — Suspense fallback matching the mediator grid card layout (initials circle placeholder, text placeholder bars); shown automatically by Next.js while RSC fetches — `app/mediators/loading.js`
- [ ] T020 [US1] Verify US1 — load `/mediators`; confirm cards appear in alphabetical order by surname; confirm card shows all 5 attributes; confirm pagination controls visible with >12 seeded mediators; confirm no PENDING/SUSPENDED mediators appear; confirm empty-roster state by temporarily removing all ACTIVE seed records

**Checkpoint**: User Story 1 fully functional. Roster browses, paginates, and shows empty state independently.

---

## Phase 4: User Story 2 — Filter the Roster (Priority: P2)

**Goal**: Visitor filters by practice area (single-select) and/or U.S. state; filters
combine cumulatively; URL reflects filter state; clear-all works.

**Independent Test**: Apply practice area filter — confirm only matching mediators shown.
Apply state filter — confirm only matching mediators shown. Combine both — confirm
intersection. Select a combination with no results — confirm "no results" empty state
with clear-all. Share filtered URL with another tab — confirm same filtered view loads.

- [ ] T021 [P] [US2] Create `RosterFilters` client component — practice area `<select>` (options from `getPracticeAreas`) + U.S. state `<select>` (all 50 states + D.C., hardcoded list); on change: reads current searchParams, sets/removes the changed param, resets `page` to `1`, calls `router.push()` — `components/mediators/RosterFilters.js`
- [ ] T022 [US2] Add `RosterFilters` to roster page layout — render above `MediatorGrid`; pass current `practice` and `state` searchParams as controlled values so dropdowns reflect active filters (depends on T021) — `app/mediators/page.js`
- [ ] T023 [US2] Verify US2 — apply practice area filter; apply state filter; apply both together; confirm empty state on zero-result combination; click "clear all"; confirm unfiltered roster returns; copy filtered URL and open in new tab, confirm same view

**Checkpoint**: User Stories 1 and 2 both work independently with no regressions.

---

## Phase 5: User Story 3 — Search by Name or Firm (Priority: P3)

**Goal**: Visitor types a name or firm into a search box; roster filters in real time;
search combines with active filters.

**Independent Test**: Search "Sarah" — confirm matching mediators appear. Search a firm
name — confirm firm-name match. Search a string matching nothing — confirm "no results"
empty state. Clear search — confirm full (or filtered) roster returns.

- [ ] T024 [US3] Create `RosterSearch` client component — text `<input>` with 300ms debounce; on debounced change: reads current searchParams, sets/removes `search` param, resets `page` to `1`, calls `router.push()`; clears correctly on empty input — `components/mediators/RosterSearch.js`
- [ ] T025 [US3] Add `RosterSearch` to roster page layout — render alongside `RosterFilters` above `MediatorGrid`; pass current `search` searchParam as controlled value (depends on T024) — `app/mediators/page.js`
- [ ] T026 [US3] Verify US3 — search by first name; search by firm name; search with special characters (apostrophe, hyphen); combine search + practice area filter; confirm empty state on no match; clear search field, confirm roster returns

**Checkpoint**: User Stories 1, 2, and 3 all work independently with no regressions.

---

## Phase 6: User Story 4 — Select Mediator → Booking Entry Point (Priority: P2)

**Goal**: Clicking a mediator card routes to `/mediators/[id]`. That page confirms
the mediator exists and is active; shows a clear unavailable message if not.

**Independent Test**: Click a mediator card — confirm routing to `/mediators/[id]`. Press
browser back — confirm return to same filtered/searched roster state. Navigate directly
to a non-existent or non-active mediator ID — confirm unavailable message (not a raw 404).

- [ ] T027 [US4] Create mediator detail stub page — fetches mediator by `id` (hard-filters `verificationStatus = ACTIVE`); renders mediator name + "Book a Session with [Name]" CTA placeholder (to be replaced by booking feature); returns "This mediator is no longer available" page (not a 404) if mediator not found or not ACTIVE — `app/mediators/[id]/page.js`
- [ ] T028 [US4] Verify US4 — click a mediator card; confirm URL is `/mediators/[id]`; press back, confirm filtered roster state is preserved; navigate to `/mediators/fake-id`, confirm unavailable message; navigate to a valid ID of a SUSPENDED mediator (temporarily change seed), confirm unavailable message

**Checkpoint**: All 4 user stories fully functional.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Accessibility, error monitoring, and final validation.

- [ ] T029 [P] Accessibility audit — verify WCAG 2.1 AA across all roster components: filter `<select>` elements have associated `<label>`s; mediator cards have accessible link text (full name); empty states use `role="status"` or `aria-live="polite"`; pagination current page uses `aria-current="page"`; keyboard navigation works through filters → cards → pagination
- [ ] T030 [P] Add Sentry error configuration — wrap `app/mediators/page.js` in an error boundary; configure `beforeSend` hook to strip any mediator name/firm/id from Sentry payloads (PII scrubbing per constitution Principle I) — `app/mediators/error.js`, `sentry.client.config.js`
- [ ] T031 Run production build and full test suite — `npm run build` (fix any ESLint/build errors); `npm test` (T011 must pass); confirm no TypeScript errors if TS is introduced
- [ ] T032 Smoke test against spec — manually verify all 17 FRs from `specs/001-mediator-roster/spec.md`; run through `specs/001-mediator-roster/quickstart.md` checklist end-to-end

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately.
- **Phase 2 (Foundational)**: Depends on Phase 1 completion. **Blocks all user stories.**
- **Phase 3 (US1)**: Depends on Phase 2. Independent of US2/US3/US4.
- **Phase 4 (US2)**: Depends on Phase 2. Builds on top of US1 components.
- **Phase 5 (US3)**: Depends on Phase 2. Builds on top of US1 + US2 layout.
- **Phase 6 (US4)**: Depends on Phase 2. `MediatorCard` link (T015) must exist.
- **Phase 7 (Polish)**: Depends on all desired user stories complete.

### User Story Dependencies

| Story | Depends On | Notes |
|---|---|---|
| US1 (P1) | Phase 2 complete | Fully independent |
| US2 (P2) | Phase 2 + US1 (for page layout) | Adds filter UI to US1 page |
| US3 (P3) | Phase 2 + US1 + US2 (for page layout) | Adds search UI to US1+US2 page |
| US4 (P2) | Phase 2 + US1 (`MediatorCard` link exists) | Fully independent of US2/US3 |

### Parallel Opportunities Within Phases

**Phase 1** — after T001 completes, T002–T005 are all parallel.

**Phase 2** — T006, T008, T012, T013 can run in parallel; T007 needs T006; T009 needs T007+T008; T010 can run in parallel with T006/T008; T011 needs T010.

**Phase 3** — T014 and T015 are parallel; T016 needs both; T017 needs T016+T010+T012; T018 (loading.js) is parallel with T014/T015/T016/T017.

---

## Implementation Strategy

### MVP (User Story 1 Only)

1. Complete Phase 1 (Setup)
2. Complete Phase 2 (Foundational) — **do not skip**
3. Complete Phase 3 (US1) through T020
4. **STOP and validate**: `/mediators` shows paginated mediator cards, alphabetical, correct attributes, empty state works
5. Demo-ready. Can share with partner.

### Full Feature Delivery

1. Phase 1 → Phase 2 → US1 (validate) → US2 (validate) → US3 (validate) → US4 (validate) → Polish
2. Each story adds value without breaking previous stories.
3. Commit after each task or logical group.

---

## Task Summary

| Phase | Tasks | Count |
|---|---|---|
| Phase 1: Setup | T001–T005 | 5 |
| Phase 2: Foundational | T006–T013 | 8 |
| Phase 3: US1 Browse | T014–T020 | 7 |
| Phase 4: US2 Filter | T021–T023 | 3 |
| Phase 5: US3 Search | T024–T026 | 3 |
| Phase 6: US4 Select | T027–T028 | 2 |
| Phase 7: Polish | T029–T032 | 4 |
| **Total** | | **32** |

Parallel-eligible tasks: T002, T003, T004, T005, T006, T008, T012, T013, T014, T015, T019 (loading.js), T021, T029, T030 = **14 of 32 tasks**.
