import Link from 'next/link'
import { getMediatorById } from '@/lib/db/mediators'
import { Badge }           from '@/components/ui/badge'

export async function generateMetadata({ params }) {
  const { id } = await params
  const mediator = await getMediatorById(id)
  if (!mediator) return { title: 'Mediator Unavailable — Magpie Mediations' }
  return {
    title:       `Book a Session with ${mediator.firstName} ${mediator.lastName} — Magpie Mediations`,
    description: `${mediator.firstName} ${mediator.lastName} — ${mediator.firm}. ${mediator.yearsOfPractice} years of civil litigation practice.`,
  }
}

export default async function MediatorDetailPage({ params }) {
  const { id } = await params
  const mediator = await getMediatorById(id)

  // Mediator not found OR not ACTIVE — render unavailable message.
  // Not differentiated: avoids leaking whether a mediator ever existed.
  if (!mediator) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 text-center">
        <p className="text-lg font-semibold text-slate-800">
          This mediator is no longer available
        </p>
        <p className="mt-2 text-sm text-slate-500 max-w-sm">
          They may have been removed from the roster or are temporarily unavailable.
        </p>
        <Link
          href="/mediators"
          className="mt-6 inline-flex items-center rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 transition-colors"
        >
          ← Back to roster
        </Link>
      </div>
    )
  }

  const { firstName, lastName, firm, city, state, yearsOfPractice, practiceAreas } = mediator
  const fullName = `${firstName} ${lastName}`
  const initials = `${firstName[0]}${lastName[0]}`.toUpperCase()

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
          <Link
            href="/mediators"
            className="text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
          >
            ← Back to roster
          </Link>
          <div className="mt-6 flex items-start gap-5">
            <div
              className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full text-lg font-bold text-white"
              style={{ backgroundColor: '#12284C' }}
              aria-hidden="true"
            >
              {initials}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{fullName}</h1>
              <p className="text-slate-500">{firm}</p>
              <p className="text-sm text-slate-500">{city}, {state}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">

        {/* Details */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2">
              Practice Areas
            </p>
            <div className="flex flex-wrap gap-2">
              {practiceAreas.map((pa) => (
                <Badge key={pa.slug} variant="secondary">{pa.name}</Badge>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-1">
              Experience
            </p>
            <p className="text-sm text-slate-700">{yearsOfPractice} years of civil litigation practice</p>
          </div>
        </div>

        {/* Booking CTA — placeholder; replaced by booking feature */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h2 className="text-base font-semibold text-slate-900 mb-1">
            Ready to schedule?
          </h2>
          <p className="text-sm text-slate-500 mb-4">
            Half-day and full-day sessions available online or in person.
          </p>
          {/* TODO: replace with booking flow once that feature is implemented */}
          <button
            disabled
            className="rounded-md bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white opacity-50 cursor-not-allowed"
          >
            Book a Session with {firstName} — Coming Soon
          </button>
        </div>

      </main>

      {/* Disclaimer */}
      <footer className="border-t border-slate-200 bg-white mt-8">
        <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
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
