import { Suspense }         from 'react'
import { getMediators }     from '@/lib/db/mediators'
import { getPracticeAreas } from '@/lib/db/practiceAreas'
import { MediatorGrid }     from '@/components/mediators/MediatorGrid'
import { RosterPagination } from '@/components/mediators/RosterPagination'
import { RosterFilters }    from '@/components/mediators/RosterFilters'
import { RosterSearch }     from '@/components/mediators/RosterSearch'

export const metadata = {
  title:       'Find a Mediator — Magpie Mediations',
  description: 'Browse vetted, active civil litigators available for mediation.',
}

// searchParams is a Promise in Next.js 15+ (App Router). Always await it.
export default async function MediatorsPage({ searchParams }) {
  const params = await searchParams

  const practiceAreaSlug = params.practice ?? null
  const stateCode        = params.state    ?? null
  const search           = params.search   ?? null
  const page             = Number(params.page) || 1

  // Fetch mediators and practice areas in parallel
  const [{ mediators, totalCount, totalPages }, practiceAreas] = await Promise.all([
    getMediators({ practiceAreaSlug, stateCode, search, page }),
    getPracticeAreas(),
  ])


  const hasActiveFilters = Boolean(practiceAreaSlug || stateCode || search)

  // 'empty-roster': no active mediators exist at all (pre-launch)
  // 'no-results':   filters/search returned nothing
  const emptyVariant = !hasActiveFilters && totalCount === 0
    ? 'empty-roster'
    : 'no-results'

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Page header */}
      <div className="bg-white border-b border-slate-200">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-1">
            Mediator Roster
          </p>
          <h1 className="text-3xl font-bold text-slate-900">Find a Mediator</h1>
          <p className="mt-2 text-slate-500 text-sm">
            All mediators are verified, actively-practicing civil litigators.
          </p>
        </div>
      </div>

      {/* Main content */}
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">

        {/* Suspense required: RosterFilters + RosterSearch use useSearchParams(),
            which must be inside a Suspense boundary in Next.js 15+ */}
        <Suspense fallback={<div className="h-16 mb-2" />}>
          <div className="flex flex-wrap items-start gap-3 mb-2">
            <RosterFilters
              practiceAreas={practiceAreas}
              currentPractice={practiceAreaSlug}
              currentState={stateCode}
            />
            <RosterSearch currentSearch={search} />
          </div>
        </Suspense>

        {/* Results count */}
        {totalCount > 0 && (
          <p className="mb-6 text-sm text-slate-500">
            {totalCount} mediator{totalCount !== 1 ? 's' : ''} available
          </p>
        )}

        <MediatorGrid mediators={mediators} emptyVariant={emptyVariant} />

        <RosterPagination
          currentPage={page}
          totalPages={totalPages}
          searchParams={params}
        />
      </main>

      {/* Disclaimer — required on roster page per constitution Principle II */}
      <footer className="border-t border-slate-200 bg-white mt-12">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
          <p className="text-xs text-slate-400 leading-relaxed">
            Magpie Mediations LLC is a technology platform, not a law firm, and does not
            provide legal advice or legal representation. Mediating attorneys participate
            in their individual capacity as independent neutral contractors.
          </p>
        </div>
      </footer>

    </div>
  )
}
