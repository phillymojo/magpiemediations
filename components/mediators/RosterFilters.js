'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { US_STATES } from '@/lib/constants/states'

// Client component — needs browser interactivity to update URL on filter change.
// Filter state lives in the URL (not useState) so results are shareable and
// the RSC page re-fetches automatically on navigation.

const selectClass =
  'rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 ' +
  'focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent ' +
  'hover:border-slate-400 transition-colors min-w-[180px]'

/**
 * @param {{
 *   practiceAreas:    { id: string, name: string, slug: string }[],
 *   currentPractice:  string | null,
 *   currentState:     string | null,
 * }} props
 */
export function RosterFilters({ practiceAreas, currentPractice, currentState }) {
  const router      = useRouter()
  const searchParams = useSearchParams()

  function updateFilter(key, value) {
    const params = new URLSearchParams(searchParams)
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    // Always reset to page 1 when a filter changes — prevents landing on a
    // now-invalid page (e.g. was on page 3, filter reduces results to 1 page).
    params.set('page', '1')
    router.push('/mediators?' + params.toString())
  }

  return (
    <div className="flex flex-wrap items-center gap-3 mb-6">

      {/* Practice area filter — single-select per FR-007 MVP.
          Data model is many-to-many so multi-select can be added without
          a schema change (see constitution § Scalability Practices). */}
      <div className="flex flex-col gap-1">
        <label htmlFor="filter-practice" className="text-xs font-medium text-slate-600">
          Practice Area
        </label>
        <select
          id="filter-practice"
          value={currentPractice ?? ''}
          onChange={(e) => updateFilter('practice', e.target.value)}
          className={selectClass}
        >
          <option value="">All Practice Areas</option>
          {practiceAreas.map((pa) => (
            <option key={pa.slug} value={pa.slug}>{pa.name}</option>
          ))}
        </select>
      </div>

      {/* State filter */}
      <div className="flex flex-col gap-1">
        <label htmlFor="filter-state" className="text-xs font-medium text-slate-600">
          State
        </label>
        <select
          id="filter-state"
          value={currentState ?? ''}
          onChange={(e) => updateFilter('state', e.target.value)}
          className={selectClass}
        >
          <option value="">All States</option>
          {US_STATES.map((s) => (
            <option key={s.code} value={s.code}>{s.name}</option>
          ))}
        </select>
      </div>

    </div>
  )
}
