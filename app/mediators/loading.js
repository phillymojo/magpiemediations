// Shown automatically by Next.js via Suspense while the RSC page fetches data.
// Structure mirrors page.js so there's no layout shift when real content arrives.

function CardSkeleton() {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="h-12 w-12 flex-shrink-0 rounded-full bg-slate-200" />
        {/* Name / firm / location lines */}
        <div className="flex-1 space-y-2 pt-1">
          <div className="h-4 w-3/4 rounded bg-slate-200" />
          <div className="h-3 w-1/2 rounded bg-slate-200" />
          <div className="h-3 w-2/5 rounded bg-slate-200" />
        </div>
      </div>
      {/* Practice area badges */}
      <div className="mt-4 flex gap-2">
        <div className="h-5 w-24 rounded-full bg-slate-200" />
        <div className="h-5 w-20 rounded-full bg-slate-200" />
      </div>
      {/* Years of practice */}
      <div className="mt-4 h-3 w-1/4 rounded bg-slate-200" />
    </div>
  )
}

export default function MediatorsLoading() {
  return (
    <div className="min-h-screen bg-slate-50 animate-pulse">

      {/* Header skeleton */}
      <div className="bg-white border-b border-slate-200">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="h-3 w-28 rounded bg-slate-200 mb-3" />
          <div className="h-8 w-56 rounded bg-slate-200" />
          <div className="mt-2 h-3 w-80 rounded bg-slate-200" />
        </div>
      </div>

      {/* Content skeleton */}
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Results count line */}
        <div className="mb-6 h-3 w-36 rounded bg-slate-200" />

        {/* Card grid — 6 cards fills a typical viewport without overflow */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>

    </div>
  )
}
