# Feature Specification: Mediator Roster (Browse & Filter)

**Feature Branch**: `001-mediator-roster`
**Created**: 2026-05-06
**Status**: Draft
**Input**: User description: "Public-facing mediator roster page where visitors and signed-in counsel can browse, search, and filter active mediators by name, firm, practice area, and U.S. state. Profile attribute set is tentative and subject to refinement. Selecting a mediator routes to a booking flow which is out of scope for this feature. Mediator availability/calendar features are deferred to Phase 2."

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Browse the Roster (Priority: P1)

A visitor (a counsel exploring the platform, with or without a Magpie account) lands on the public mediator roster page and sees a list of available, verified mediators. Each mediator card presents enough profile information to start narrowing down candidates without further clicks. The list is paginated so that an arbitrarily large roster remains usable.

**Why this priority**: This is the foundational value of the feature. With only this story shipped, counsel can already discover mediators on the platform — a viable MVP. Every other story refines the experience but is not strictly required for the page to deliver value.

**Independent Test**: Load the roster page as an unauthenticated visitor. Confirm at least one mediator card is visible, the card contains the expected profile information, and pagination controls allow navigation to additional results when the roster exceeds the page size.

**Acceptance Scenarios**:

1. **Given** the roster contains 30 active mediators, **When** an unauthenticated visitor loads the roster page, **Then** the visitor sees the first page of mediators in alphabetical order by surname, with profile information, and pagination controls indicate that more results are available.
2. **Given** the roster contains zero active mediators, **When** any visitor loads the roster page, **Then** the visitor sees a clear empty-state message instead of a broken or empty list.
3. **Given** an authenticated counsel loads the roster page, **When** the page renders, **Then** the counsel sees the same content available to unauthenticated visitors (no role-specific differences in this feature).

---

### User Story 2 — Filter the Roster (Priority: P2)

A visitor narrows the list of mediators by primary practice area and U.S. state so that they only see mediators that match the matter at hand.

**Why this priority**: As soon as the roster grows past a single page, filters become the primary way counsel finds relevant mediators. Without filters, P1 alone is usable but inefficient.

**Independent Test**: Apply each filter individually and in combination. Confirm that the displayed mediators match the filter criteria and that all filters can be cleared in a single action.

**Acceptance Scenarios**:

1. **Given** the roster contains mediators in multiple states, **When** a visitor filters by a single state, **Then** only mediators whose location is in that state are shown.
2. **Given** a visitor has applied a practice-area filter and a state filter, **When** the page renders, **Then** only mediators that match both filters are shown.
3. **Given** a visitor has applied filters that exclude every mediator, **When** the page renders, **Then** the visitor sees a "no mediators match" empty state with a single-action way to clear all filters.
4. **Given** a visitor has applied filters, **When** they choose "clear filters," **Then** the unfiltered roster is shown again.

---

### User Story 3 — Search by Name or Firm (Priority: P3)

A visitor who already has a mediator's name or firm in mind (e.g., from a referral) types it into a search field and sees matching mediators surface immediately.

**Why this priority**: Useful for the referral path but not the primary discovery experience. Filters cover the most common discovery use case without search.

**Independent Test**: Search for a mediator's name; confirm exact and partial matches surface. Search for a firm name; confirm matching mediators surface. Search for a string that matches no mediator; confirm the empty state appears.

**Acceptance Scenarios**:

1. **Given** the roster contains a mediator named "Sarah M." at "Morrison & Chen LLP," **When** a visitor searches for "Sarah," **Then** that mediator appears in the results.
2. **Given** the same roster, **When** a visitor searches for "Morrison," **Then** the mediator appears because the firm matches.
3. **Given** any roster, **When** a visitor searches for a string that matches no mediator, **Then** the empty-state "no mediators match" message appears with a way to clear search.
4. **Given** a visitor has applied filters and a search query, **When** the page renders, **Then** results match both the filters and the search.

---

### User Story 4 — Select a Mediator and Hand Off to Booking (Priority: P2)

A visitor decides on a mediator from the roster and proceeds toward booking that mediator.

**Why this priority**: This is the connective tissue between the roster and the rest of the platform. Without it, the roster is a dead-end. The booking flow itself is a separate, larger feature; this story is just the routing handoff.

**Independent Test**: Click any mediator card; confirm the user is routed to that mediator's booking entry point with a stable, shareable URL (e.g., reachable via direct link, browser back/forward).

**Acceptance Scenarios**:

1. **Given** a visitor sees a mediator card, **When** they activate the card (click or keyboard select), **Then** they are routed to the booking entry point for that mediator.
2. **Given** a visitor has been routed to a mediator's booking entry point, **When** they use the browser back button, **Then** they return to the roster with their previous filters and search intact.

---

### Edge Cases

- **A mediator's verification status changes from "active" to a non-active state while a visitor is browsing**: the mediator MUST disappear from subsequent roster requests and any later attempt to navigate to that mediator's booking entry point MUST surface a clear "this mediator is no longer available" message.
- **Search input contains punctuation common in attorney names** (apostrophes such as "O'Brien," hyphens such as "Smith-Jones," accents such as "García"): search MUST handle these correctly without throwing errors and should match users' obvious expectations.
- **Filter values combine to produce zero results**: empty state MUST encourage relaxation of filters (clear-all action) without leaving the user stuck.
- **Roster contains zero active mediators (e.g., before launch)**: empty state MUST be friendly and explanatory, not a blank page.
- **A visitor on a slow or intermittent connection**: the page MUST remain usable as data arrives; filter and search interactions MUST give clear feedback rather than appearing frozen.
- **A visitor shares a filtered roster URL**: the recipient MUST land on the same filtered view (filter and search state is part of the URL).

## Clarifications

### Session 2026-05-06

- Q: What is the MVP set of attributes shown on each mediator card? → A: Mockup-aligned (5 attrs) — name, firm, location (city + state), primary practice areas, years of practice; initials-based avatar (no photo).
- Q: How is the set of practice areas defined — curated, free text, or hybrid? → A: Curated controlled vocabulary maintained by Magpie admins. Initial list: Personal Injury, Commercial Litigation, Employment, Real Estate, Insurance Defense, Intellectual Property, Construction. Mediators pick from this list only.
- Q: What states are available in the state filter? → A: All 50 U.S. states plus the District of Columbia. States without active mediators still appear in the dropdown and return the standard "no mediators match" empty state when selected.
- Q: Is the practice area filter single-select or multi-select? → A: Single-select for MVP. The underlying data model and URL design MUST remain compatible with a future multi-select extension (Phase 2 candidate); no schema or query rewrite should be required when multi-select is introduced.
- Q: Default page size for the paginated roster? → A: 12 mediator cards per page (clean 3×4 desktop grid; degrades to 2-column tablet and 1-column mobile).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display only mediators whose verification status is "active" on the public roster page.
- **FR-002**: System MUST exclude mediators in any non-"active" verification state (e.g., pending, suspended, withdrawn) from the public roster.
- **FR-003**: System MUST paginate the roster so that the page loads quickly regardless of total roster size. Default page size is **12 mediator cards per page**.
- **FR-004**: Each mediator card MUST display the following attributes: (a) mediator name, (b) firm or practice affiliation, (c) location as city and U.S. state, (d) primary practice areas, and (e) years of civil litigation practice. The card MUST also display an initials-based avatar (no photo). Expansion of this attribute set (e.g., photos, bios, bar admissions) is a Phase 2 enhancement requiring spec amendment.
- **FR-005**: When no other ordering is requested, the roster MUST be sorted alphabetically by mediator surname, ascending (A → Z).
- **FR-006**: Pagination MUST present numbered page controls that allow direct navigation to any page (e.g., "1 2 3 … Next").
- **FR-007**: Users MUST be able to filter the roster by primary practice area. The MVP filter is **single-select** (one practice area at a time). The underlying mediator↔practice-area relationship MUST remain many-to-many so that a future multi-select filter (Phase 2 candidate) can be introduced without a schema rewrite.
- **FR-008**: Users MUST be able to filter the roster by U.S. state. The filter MUST present all 50 U.S. states plus the District of Columbia. States with no active mediators MUST still appear in the dropdown; selecting such a state MUST display the standard "no mediators match" empty state.
- **FR-009**: Users MUST be able to search the roster by mediator name or firm name.
- **FR-010**: Filters and search MUST combine cumulatively: applying multiple filters and a search query narrows results to entries that satisfy all conditions.
- **FR-011**: Users MUST be able to clear all active filters and the search query in a single action.
- **FR-012**: System MUST display a meaningful empty state when no mediators match the active filters/search, including a one-action way to clear filters and search.
- **FR-013**: System MUST display a meaningful empty state when the roster contains zero active mediators.
- **FR-014**: Selecting a mediator MUST initiate the booking entry point for that mediator. (The booking flow itself is out of scope for this feature.)
- **FR-015**: The roster MUST be accessible without authentication. Sign-in MUST NOT be required to browse, search, or filter.
- **FR-016**: Filter state, search query, sort order, and current page MUST be reflected in the page URL so that users can share, bookmark, and use browser back/forward without losing their place.
- **FR-017**: When a mediator's verification status changes to a non-active state, that mediator MUST stop appearing in subsequent roster responses, and any direct attempt to access that mediator's booking entry point MUST present a clear unavailable-mediator message.
- **FR-018**: The practice area values used for display and filtering MUST come from a Magpie-curated controlled vocabulary. The MVP launches with this initial set: Personal Injury, Commercial Litigation, Employment, Real Estate, Insurance Defense, Intellectual Property, Construction. The set may be expanded over time by Magpie administrators; mediators select their primary practice areas from this canonical list rather than entering free text.

### Key Entities

- **Mediator profile**: represents an attorney who has been verified and accepted onto the Magpie roster. Each profile has a verification status that gates whether the profile appears on the public roster, and the attribute set defined in FR-004 (name, firm, location, primary practice areas, years of practice). Initials avatars are derived from the name, not stored separately.
- **Practice area**: a category of legal practice maintained by Magpie as a curated controlled vocabulary (see FR-018). A mediator may be associated with one or more practice areas; the practice area filter operates on this association. The administrative tools used to manage the canonical list are out of scope for this feature.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A first-time visitor on a typical broadband connection can see the first page of active mediators within 3 seconds of the roster page loading.
- **SC-002**: Applying any single filter (practice area or state) shows updated results within 1 second on a typical broadband connection.
- **SC-003**: With a roster of 100+ active mediators, a counsel who has a clear set of selection criteria (one practice area + one state) can locate a suitable mediator and reach the booking entry point in under 60 seconds.
- **SC-004**: Visitors can browse the roster, apply filters, search, and select a mediator without creating an account or signing in.
- **SC-005**: A search for any name or firm string that exactly matches text in any active mediator's profile returns that mediator in the results in 100% of cases.
- **SC-006**: Selecting a mediator card routes the visitor to that mediator's booking entry point with no broken links or errors in 100% of cases for currently-active mediators.
- **SC-007**: A filtered roster URL, when shared with another user, opens to the same filtered view that the original user saw (excluding any newly added or newly removed mediators).

## Assumptions

- The mediator card attribute set was finalized during clarification on 2026-05-06 (see Clarifications and FR-004). Expansion to include photos, bios, or bar admission states is a Phase 2 enhancement.
- Mediator availability/calendar features (showing next-available dates on the card, filtering by availability window, real-time calendar integration) are explicitly **deferred to Phase 2**. The MVP roster does not surface or filter on availability.
- The roster page is browsable on common modern desktop and mobile browsers. Native mobile applications are out of scope.
- The constitution's existing scope rules apply: U.S. jurisdictions only; only "active" verified mediators are listed; the platform is not a law firm; "platform-not-a-law-firm" disclaimers are present per global-page conventions.
- The verification process and the mediator application flow are separate features. This feature consumes the *output* of verification (the verification status) but does not implement it.
- The booking flow is a separate feature. From this feature's perspective, the booking entry point is a destination; its internals are out of scope.
- Visitors generally have stable broadband internet connectivity. Graceful degradation on poor connections is a quality-of-life concern, not a primary design driver.
- Authenticated counsel see the same roster content as unauthenticated visitors in this feature. Personalization (e.g., favorited mediators, hidden mediators) is out of scope for v1 of the roster.
- Marketing pages (home, pricing, "Join as Mediator") are not part of this feature.
- Default sort order (alphabetical by surname) and pagination style (numbered page controls) were resolved during initial clarification on 2026-05-06.
