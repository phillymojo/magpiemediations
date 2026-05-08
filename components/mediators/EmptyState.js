// Server component — no client-side JS needed; clear-all is a plain link.

/**
 * @param {{ variant: 'no-results' | 'empty-roster' }} props
 *
 * 'no-results'   — filters/search returned nothing; offers a clear-all link
 * 'empty-roster' — no ACTIVE mediators exist at all (e.g. pre-launch)
 */
export function EmptyState({ variant = 'no-results' }) {
  if (variant === 'empty-roster') {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-lg font-semibold text-slate-800">No mediators yet</p>
        <p className="mt-2 text-sm text-slate-500 max-w-sm">
          Our mediator roster is being built. Check back soon.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center" role="status">
      <p className="text-lg font-semibold text-slate-800">No mediators match your search</p>
      <p className="mt-2 text-sm text-slate-500 max-w-sm">
        Try adjusting your filters or search terms.
      </p>
      {/* Plain href — no JS needed to clear URL params */}
      <a
        href="/mediators"
        className="mt-6 inline-flex items-center rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 transition-colors"
      >
        Clear all filters
      </a>
    </div>
  )
}
