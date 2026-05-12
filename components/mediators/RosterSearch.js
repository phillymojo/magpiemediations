'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useRef, useState }            from 'react'

// Client component — needs browser interactivity for debounced input.
// Search state lives in the URL (?search=), not useState, so results are
// shareable and the RSC page re-fetches automatically on navigation.

const DEBOUNCE_MS = 300

/**
 * @param {{ currentSearch: string | null }} props
 */
export function RosterSearch({ currentSearch }) {
  const router      = useRouter()
  const searchParams = useSearchParams()
  const timerRef    = useRef(null)

  // Local input state is needed for controlled input — the URL value is the
  // source of truth for results, but we need a local copy to show keystrokes
  // instantly without waiting for the debounce + navigation round-trip.
  const [inputValue, setInputValue] = useState(currentSearch ?? '')

  function handleChange(e) {
    const value = e.target.value
    setInputValue(value)

    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams)
      if (value.trim()) {
        params.set('search', value.trim())
      } else {
        params.delete('search')
      }
      // Reset to page 1 so a new search doesn't land on a now-invalid page
      params.set('page', '1')
      router.push('/mediators?' + params.toString())
    }, DEBOUNCE_MS)
  }

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor="search-mediators" className="text-xs font-medium text-slate-600">
        Search
      </label>
      <input
        id="search-mediators"
        type="search"
        placeholder="Name or firm…"
        value={inputValue}
        onChange={handleChange}
        className={
          'rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 ' +
          'focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent ' +
          'hover:border-slate-400 transition-colors min-w-[220px]'
        }
      />
    </div>
  )
}
