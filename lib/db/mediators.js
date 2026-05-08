import { prisma } from '@/lib/db/client'

const DEFAULT_PAGE_SIZE = 12

/**
 * Fetch the public mediator roster with optional filtering, search, and
 * pagination.
 *
 * Constitution Principle III (non-negotiable): verificationStatus MUST always
 * be ACTIVE. This filter is not optional and cannot be overridden by callers.
 *
 * @param {object}  opts
 * @param {string}  [opts.practiceAreaSlug]  PracticeArea.slug to filter by
 * @param {string}  [opts.stateCode]         Two-letter US state code
 * @param {string}  [opts.search]            Free-text search against name/firm
 * @param {number}  [opts.page=1]            1-indexed page number
 * @param {number}  [opts.pageSize=12]       Results per page
 * @returns {{ mediators: object[], totalCount: number, totalPages: number }}
 */
export async function getMediators({
  practiceAreaSlug,
  stateCode,
  search,
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE,
} = {}) {
  const safePage = Math.max(1, Number(page) || 1)

  const where = {
    // Hard gate — constitution Principle III. Never remove or make conditional.
    verificationStatus: 'ACTIVE',
    ...(stateCode        && { state: stateCode }),
    ...(practiceAreaSlug && {
      practiceAreas: {
        some: { practiceArea: { slug: practiceAreaSlug } },
      },
    }),
    // ILIKE on firstName, lastName, and firm. Adequate for MVP roster size;
    // pg_trgm / dedicated search is the Phase 2 upgrade path (research.md §4).
    ...(search?.trim() && {
      OR: [
        { firstName: { contains: search.trim(), mode: 'insensitive' } },
        { lastName:  { contains: search.trim(), mode: 'insensitive' } },
        { firm:      { contains: search.trim(), mode: 'insensitive' } },
      ],
    }),
  }

  const [mediators, totalCount] = await Promise.all([
    prisma.mediator.findMany({
      where,
      select: {
        id:              true,
        firstName:       true,
        lastName:        true,
        firm:            true,
        city:            true,
        state:           true,
        yearsOfPractice: true,
        practiceAreas: {
          select: {
            practiceArea: { select: { name: true, slug: true } },
          },
          orderBy: { practiceArea: { name: 'asc' } },
        },
      },
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
      skip:  (safePage - 1) * pageSize,
      take:  pageSize,
    }),
    prisma.mediator.count({ where }),
  ])

  // Flatten the nested practiceAreas join so callers get a clean array
  // of { name, slug } rather than Prisma's nested relation shape.
  const flatMediators = mediators.map((m) => ({
    ...m,
    practiceAreas: m.practiceAreas.map((pa) => pa.practiceArea),
  }))

  return {
    mediators:  flatMediators,
    totalCount,
    totalPages: Math.ceil(totalCount / pageSize),
  }
}
