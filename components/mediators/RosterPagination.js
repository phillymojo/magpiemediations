import Link from 'next/link'

// Server component — all navigation via <Link>; no client-side JS needed.

/**
 * Builds a URL that preserves all current search params but changes the page.
 * Prevents filters/search being lost when navigating between pages.
 */
function buildPageUrl(searchParams, page) {
  const params = new URLSearchParams(searchParams)
  params.set('page', String(page))
  return `/mediators?${params.toString()}`
}

/**
 * Returns the page numbers (and '...' sentinels) to display.
 *
 * Examples:
 *   totalPages=5, current=3  → [1, 2, 3, 4, 5]
 *   totalPages=10, current=5 → [1, '...', 4, 5, 6, '...', 10]
 *   totalPages=10, current=2 → [1, 2, 3, 4, '...', 10]
 *   totalPages=10, current=9 → [1, '...', 7, 8, 9, 10]
 */
function getPageRange(currentPage, totalPages) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }

  const pages = [1]

  if (currentPage > 3) pages.push('...')

  const start = Math.max(2, currentPage - 1)
  const end   = Math.min(totalPages - 1, currentPage + 1)
  for (let i = start; i <= end; i++) pages.push(i)

  if (currentPage < totalPages - 2) pages.push('...')

  pages.push(totalPages)
  return pages
}

/**
 * @param {{
 *   currentPage:  number,
 *   totalPages:   number,
 *   searchParams: object   – current URL search params (passed from page.js)
 * }} props
 */
export function RosterPagination({ currentPage, totalPages, searchParams }) {
  // Single page — nothing to render
  if (totalPages <= 1) return null

  const pages    = getPageRange(currentPage, totalPages)
  const hasPrev  = currentPage > 1
  const hasNext  = currentPage < totalPages

  const linkBase = 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors h-9 min-w-9 px-3'
  const active   = 'bg-slate-900 text-white'
  const inactive = 'text-slate-700 hover:bg-slate-100'
  const disabled = 'text-slate-300 pointer-events-none'

  return (
    <nav aria-label="Pagination" className="mt-8 flex items-center justify-center gap-1">

      {/* Previous */}
      {hasPrev ? (
        <Link href={buildPageUrl(searchParams, currentPage - 1)} className={`${linkBase} ${inactive}`}>
          ← Prev
        </Link>
      ) : (
        <span className={`${linkBase} ${disabled}`} aria-disabled="true">← Prev</span>
      )}

      {/* Page numbers */}
      {pages.map((page, i) =>
        page === '...' ? (
          <span key={`ellipsis-${i}`} className={`${linkBase} ${disabled}`}>…</span>
        ) : (
          <Link
            key={page}
            href={buildPageUrl(searchParams, page)}
            className={`${linkBase} ${page === currentPage ? active : inactive}`}
            aria-current={page === currentPage ? 'page' : undefined}
          >
            {page}
          </Link>
        )
      )}

      {/* Next */}
      {hasNext ? (
        <Link href={buildPageUrl(searchParams, currentPage + 1)} className={`${linkBase} ${inactive}`}>
          Next →
        </Link>
      ) : (
        <span className={`${linkBase} ${disabled}`} aria-disabled="true">Next →</span>
      )}

    </nav>
  )
}
