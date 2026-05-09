import { PrismaClient, VerificationStatus } from '@prisma/client'
import { randomBytes } from 'node:crypto'

const prisma = new PrismaClient()

// Generates a URL-safe slug: "sarah-mitchell-a1b2"
// The 4-char hex suffix makes slugs unique without collision-handling logic.
// Slugs are set at mediator creation and never regenerated.
function generateSlug(firstName: string, lastName: string): string {
  const base   = `${firstName}-${lastName}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  const suffix = randomBytes(2).toString('hex')  // e.g. "a1b2"
  return `${base}-${suffix}`
}

// ─── Practice Areas ───────────────────────────────────────────────────────────
// Canonical list per FR-018.

const PRACTICE_AREAS = [
  { name: 'Personal Injury',       slug: 'personal-injury' },
  { name: 'Commercial Litigation', slug: 'commercial-litigation' },
  { name: 'Employment',            slug: 'employment' },
  { name: 'Real Estate',           slug: 'real-estate' },
  { name: 'Insurance Defense',     slug: 'insurance-defense' },
  { name: 'Intellectual Property', slug: 'intellectual-property' },
  { name: 'Construction',          slug: 'construction' },
]

// ─── Sample Mediators ─────────────────────────────────────────────────────────
// 15 ACTIVE mediators spread across states and practice areas.
// All data is fictional development seed data.

const MEDIATORS = [
  { firstName: 'Sarah',    lastName: 'Mitchell',  firm: 'Morrison & Chen LLP',          city: 'Los Angeles',   state: 'CA', years: 18, areas: ['personal-injury', 'insurance-defense'] },
  { firstName: 'Robert',   lastName: 'Kim',       firm: 'Solo Practice',                city: 'San Diego',     state: 'CA', years: 12, areas: ['commercial-litigation', 'real-estate'] },
  { firstName: 'Lisa',     lastName: 'Thornton',  firm: 'Thornton Valdez LLP',          city: 'Dallas',        state: 'TX', years: 22, areas: ['employment', 'commercial-litigation'] },
  { firstName: 'James',    lastName: 'Alvarez',   firm: 'Alvarez & Partners',           city: 'Miami',         state: 'FL', years: 9,  areas: ['insurance-defense', 'personal-injury'] },
  { firstName: 'Karen',    lastName: 'Nakamura',  firm: 'Nakamura Law Group',           city: 'San Francisco', state: 'CA', years: 15, areas: ['intellectual-property', 'commercial-litigation'] },
  { firstName: 'David',    lastName: 'Williams',  firm: 'Williams & Park LLP',          city: 'Chicago',       state: 'IL', years: 27, areas: ['commercial-litigation', 'construction'] },
  { firstName: 'Angela',   lastName: 'Torres',    firm: 'Torres Legal Group',           city: 'Houston',       state: 'TX', years: 14, areas: ['employment', 'personal-injury'] },
  { firstName: 'Marcus',   lastName: 'Bennett',   firm: 'Bennett & Associates',         city: 'New York',      state: 'NY', years: 31, areas: ['commercial-litigation', 'real-estate'] },
  { firstName: 'Priya',    lastName: 'Patel',     firm: 'Solo Practice',                city: 'Seattle',       state: 'WA', years: 11, areas: ['intellectual-property', 'employment'] },
  { firstName: 'Thomas',   lastName: 'Crawford',  firm: 'Crawford Mediation',           city: 'Phoenix',       state: 'AZ', years: 19, areas: ['personal-injury', 'insurance-defense'] },
  { firstName: 'Elena',    lastName: 'Vasquez',   firm: 'Vasquez Law PLLC',             city: 'Austin',        state: 'TX', years: 8,  areas: ['employment', 'real-estate'] },
  { firstName: 'Brian',    lastName: 'Okafor',    firm: 'Okafor Dispute Resolution',    city: 'Atlanta',       state: 'GA', years: 16, areas: ['construction', 'commercial-litigation'] },
  { firstName: 'Christine', lastName: 'Park',     firm: 'Park & Stein LLP',             city: 'Boston',        state: 'MA', years: 24, areas: ['insurance-defense', 'commercial-litigation'] },
  { firstName: 'Kevin',    lastName: 'Zhao',      firm: 'Solo Practice',                city: 'Los Angeles',   state: 'CA', years: 7,  areas: ['intellectual-property', 'commercial-litigation'] },
  { firstName: 'Diana',    lastName: 'Fletcher',  firm: 'Fletcher ADR Group',           city: 'Denver',        state: 'CO', years: 20, areas: ['real-estate', 'construction'] },
]

async function main() {
  // ── 1. Clear existing seed data (join table first, then children) ────────────
  await prisma.mediatorPracticeArea.deleteMany()
  await prisma.mediator.deleteMany()
  await prisma.practiceArea.deleteMany()
  console.log('Cleared existing data')

  // ── 2. Seed practice areas ───────────────────────────────────────────────────
  await prisma.practiceArea.createMany({ data: PRACTICE_AREAS })
  console.log(`✓ ${PRACTICE_AREAS.length} practice areas seeded`)

  // Build slug → id lookup
  const paRows = await prisma.practiceArea.findMany({ select: { id: true, slug: true } })
  const slugToId = Object.fromEntries(paRows.map((pa) => [pa.slug, pa.id]))

  // ── 3. Seed mediators + practice area links ──────────────────────────────────
  for (const m of MEDIATORS) {
    const mediator = await prisma.mediator.create({
      data: {
        firstName:          m.firstName,
        lastName:           m.lastName,
        slug:               generateSlug(m.firstName, m.lastName),
        firm:               m.firm,
        city:               m.city,
        state:              m.state,
        yearsOfPractice:    m.years,
        verificationStatus: VerificationStatus.ACTIVE,
      },
    })

    await prisma.mediatorPracticeArea.createMany({
      data: m.areas.map((slug) => ({
        mediatorId:     mediator.id,
        practiceAreaId: slugToId[slug],
      })),
    })
  }
  console.log(`✓ ${MEDIATORS.length} mediators seeded`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
