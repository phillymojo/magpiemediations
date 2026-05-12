import { prisma } from '@/lib/db/client'

/**
 * Returns the canonical practice area list for the filter dropdown.
 * Ordered by name so the dropdown is alphabetical regardless of insert order.
 *
 * This list changes rarely (admin-only additions) so it is safe to cache at
 * the page level using Next.js's built-in fetch cache or React's `cache()`.
 * That is handled by the caller, not here.
 *
 * @returns {{ id: string, name: string, slug: string }[]}
 */
export async function getPracticeAreas() {
  return prisma.practiceArea.findMany({
    select:  { id: true, name: true, slug: true },
    orderBy: { name: 'asc' },
  })
}
