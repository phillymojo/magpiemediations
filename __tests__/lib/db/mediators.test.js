import { getMediators } from '@/lib/db/mediators'
import { prisma } from '@/lib/db/client'

jest.mock('@/lib/db/client', () => ({
  prisma: {
    mediator: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
  },
}))

beforeEach(() => {
  jest.clearAllMocks()
  prisma.mediator.findMany.mockResolvedValue([])
  prisma.mediator.count.mockResolvedValue(0)
})

// Helper: returns the `where` clause passed to the last findMany call
const capturedWhere = () => prisma.mediator.findMany.mock.calls[0][0].where

// ─── Constitution gate (Principle III) ───────────────────────────────────────

test('always filters verificationStatus ACTIVE with no args', async () => {
  await getMediators()
  expect(capturedWhere()).toMatchObject({ verificationStatus: 'ACTIVE' })
})

test('always filters verificationStatus ACTIVE even when other filters are set', async () => {
  await getMediators({ practiceAreaSlug: 'employment', stateCode: 'CA', search: 'Smith' })
  expect(capturedWhere()).toMatchObject({ verificationStatus: 'ACTIVE' })
})

// ─── Filters ─────────────────────────────────────────────────────────────────

test('adds state filter when stateCode is provided', async () => {
  await getMediators({ stateCode: 'TX' })
  expect(capturedWhere()).toMatchObject({ state: 'TX' })
})

test('adds practice area nested filter when practiceAreaSlug is provided', async () => {
  await getMediators({ practiceAreaSlug: 'personal-injury' })
  expect(capturedWhere()).toMatchObject({
    practiceAreas: { some: { practiceArea: { slug: 'personal-injury' } } },
  })
})

test('adds OR search clause when search is provided', async () => {
  await getMediators({ search: 'Johnson' })
  expect(capturedWhere().OR).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ firstName: expect.objectContaining({ contains: 'Johnson' }) }),
      expect.objectContaining({ lastName:  expect.objectContaining({ contains: 'Johnson' }) }),
      expect.objectContaining({ firm:      expect.objectContaining({ contains: 'Johnson' }) }),
    ])
  )
})

test('omits OR search clause when search is empty or whitespace', async () => {
  await getMediators({ search: '   ' })
  expect(capturedWhere().OR).toBeUndefined()
})

// ─── Response shape ───────────────────────────────────────────────────────────

test('flattens nested practiceAreas into { name, slug } array', async () => {
  prisma.mediator.findMany.mockResolvedValue([{
    id: '1', firstName: 'Jane', lastName: 'Doe', firm: 'Acme', city: 'LA',
    state: 'CA', yearsOfPractice: 10,
    practiceAreas: [{ practiceArea: { name: 'Employment', slug: 'employment' } }],
  }])
  prisma.mediator.count.mockResolvedValue(1)

  const { mediators } = await getMediators()
  expect(mediators[0].practiceAreas).toEqual([{ name: 'Employment', slug: 'employment' }])
})

test('returns correct totalPages based on count and page size', async () => {
  prisma.mediator.count.mockResolvedValue(25)
  const { totalPages } = await getMediators({ pageSize: 12 })
  expect(totalPages).toBe(3)
})

// ─── Pagination ───────────────────────────────────────────────────────────────

test('calculates skip correctly for page 2', async () => {
  await getMediators({ page: 2, pageSize: 12 })
  expect(prisma.mediator.findMany.mock.calls[0][0]).toMatchObject({ skip: 12, take: 12 })
})

test('clamps page below 1 to page 1', async () => {
  await getMediators({ page: -1 })
  expect(prisma.mediator.findMany.mock.calls[0][0]).toMatchObject({ skip: 0 })
})
