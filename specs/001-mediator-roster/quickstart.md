# Quickstart: Mediator Roster Feature

**Branch**: `001-mediator-roster` | **Date**: 2026-05-06

This guide gets you from a clean checkout to a running mediator roster in your
browser. It focuses on the concepts that are new in this feature — Neon Postgres,
Prisma, and the App Router data-fetching patterns.

---

## 1. Prerequisites

You need:
- Node.js 20+ (`node -v`)
- A Neon account and project (free tier is fine for dev)
- The project checked out and on branch `001-mediator-roster`

---

## 2. Set Up Neon and Get Your Connection Strings

Neon gives you two connection strings per project. You need both.

1. Go to your Neon project dashboard → **Connection Details**.
2. Find the **Pooled connection** string (has `?pgbouncer=true` or a `-pooler`
   subdomain). Copy it.
3. Find the **Direct connection** string (no pooler). Copy it.
4. Create `.env.local` at the repo root:

```env
DATABASE_URL="postgresql://user:pass@ep-xxx-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require"
DIRECT_URL="postgresql://user:pass@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require"
```

**Why two strings?** `DATABASE_URL` (pooled) is what the app uses in production
on Lambda — Lambda functions can't hold long-lived database connections, so Neon's
PgBouncer pools them. `DIRECT_URL` (direct) is what Prisma Migrate uses — the
migration runner needs a persistent connection that PgBouncer doesn't support.

---

## 3. Install Dependencies and Set Up Prisma

```bash
npm install

# Push the schema to your Neon database
npx prisma migrate dev --name init-mediator-roster

# Seed the canonical PracticeArea rows + sample mediators
npx prisma db seed
```

`prisma migrate dev` reads `DIRECT_URL` from `.env.local`, applies
`prisma/schema.prisma`, and creates the tables. The `seed.js` script inserts the
7 canonical practice areas and a handful of sample mediators so the roster
isn't empty when you first load the page.

To open a visual database browser at any time:
```bash
npx prisma studio
```

---

## 4. Run the Dev Server

```bash
npm run dev
```

Open `http://localhost:3000/mediators`.

You should see the roster with the seeded sample mediators. Try filtering by
practice area and state, searching by name, and paginating.

---

## 5. Key App Router Concepts for This Feature

### Server Components vs. Client Components

The roster page (`app/mediators/page.js`) is a **Server Component** — it runs
only on the server, can `await` database calls directly, and sends plain HTML to
the browser (no JavaScript for the page shell itself).

```js
// app/mediators/page.js — runs on the server
export default async function MediatorsPage({ searchParams }) {
  const { mediators, totalPages } = await getMediators({
    practiceAreaSlug: searchParams.practice,
    stateCode: searchParams.state,
    search: searchParams.search,
    page: Number(searchParams.page) || 1,
  })
  return <MediatorGrid mediators={mediators} totalPages={totalPages} ... />
}
```

The filter dropdowns and search input (`RosterFilters.js`, `RosterSearch.js`)
are **Client Components** (marked `'use client'` at the top). They need to run
in the browser so they can respond to user interaction. They don't fetch data
themselves — they just update the URL, which causes the Server Component above
to re-run with the new filters.

### URL Is the Source of Truth for Filter State

Instead of `useState` for filter values, filters live in the URL:

```
/mediators?practice=personal-injury&state=CA&page=1
```

When a user changes the practice area dropdown:

```js
// Inside RosterFilters.js (Client Component)
'use client'
import { useRouter, useSearchParams } from 'next/navigation'

const router = useRouter()
const searchParams = useSearchParams()

function onPracticeChange(slug) {
  const params = new URLSearchParams(searchParams)
  if (slug) params.set('practice', slug)
  else params.delete('practice')
  params.set('page', '1')   // reset to page 1 on filter change
  router.push('/mediators?' + params.toString())
}
```

This triggers Next.js's soft navigation — the Server Component re-fetches data
with the new searchParams, but the browser doesn't do a full page reload.

### Loading State

`app/mediators/loading.js` is automatically shown by Next.js while the Server
Component is fetching. Use it to render a skeleton grid that matches the
mediator card layout, so the page doesn't flash blank.

---

## 6. Running Tests

```bash
# All tests
npm test

# Just mediator-related tests
npm test -- --testPathPattern=mediators
```

The critical test to write first (before implementation) is the unit test for
`getMediators` that verifies the `verificationStatus = ACTIVE` filter is always
applied — even when no other filters are passed.

---

## 7. File Map (where to start)

| What you're building | File |
|---|---|
| Prisma schema | `prisma/schema.prisma` |
| Seed data | `prisma/seed.js` |
| Database query | `lib/db/mediators.js` |
| Practice area query | `lib/db/practiceAreas.js` |
| Roster page (RSC) | `app/mediators/page.js` |
| Loading skeleton | `app/mediators/loading.js` |
| Single mediator stub | `app/mediators/[id]/page.js` |
| Card component | `components/mediators/MediatorCard.js` |
| Filter dropdowns | `components/mediators/RosterFilters.js` |
| Search input | `components/mediators/RosterSearch.js` |
| Pagination | `components/mediators/RosterPagination.js` |
| Empty state | `components/mediators/EmptyState.js` |
| Rate limiting | `middleware.js` |
