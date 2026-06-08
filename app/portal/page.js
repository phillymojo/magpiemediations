import { auth }                 from '@clerk/nextjs/server'
import { redirect }             from 'next/navigation'
import Link                     from 'next/link'
import { getMediatorByUserId }  from '@/lib/db/mediators'
import { getBookingsForMediator } from '@/lib/db/bookings'
import { BookingActionCard }    from '@/components/portal/BookingActionCard'
import { PortalEmptyState }     from '@/components/portal/PortalEmptyState'

export const metadata = { title: 'Mediator Portal — Magpie Mediations' }

export default async function PortalPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const mediator = await getMediatorByUserId(userId)

  // Not a linked mediator — show access denied (do not redirect; avoids leaking route)
  if (!mediator) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 text-center">
        <p className="text-lg font-semibold text-slate-800">Access denied</p>
        <p className="mt-2 text-sm text-slate-500 max-w-sm">
          This area is for mediators on the Magpie Mediations roster.
        </p>
        <Link href="/mediators" className="mt-6 inline-flex items-center rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 transition-colors">
          Browse Mediators
        </Link>
      </div>
    )
  }

  const bookings = await getBookingsForMediator(mediator.id)
  const pending  = bookings.filter((b) => b.status === 'PENDING_CONFIRMATION')
  const history  = bookings.filter((b) => b.status !== 'PENDING_CONFIRMATION')

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200">
        <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-1">Mediator Portal</p>
          <h1 className="text-2xl font-bold text-slate-900">
            Welcome, {mediator.firstName}
          </h1>
        </div>
      </div>

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 space-y-10">
        {bookings.length === 0 ? (
          <PortalEmptyState />
        ) : (
          <>
            <section>
              <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-500 mb-4">
                Pending Requests ({pending.length})
              </h2>
              {pending.length === 0 ? (
                <p className="text-sm text-slate-400">No pending requests.</p>
              ) : (
                <div className="space-y-4">
                  {pending.map((b) => <BookingActionCard key={b.id} booking={b} />)}
                </div>
              )}
            </section>

            {history.length > 0 && (
              <section>
                <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-500 mb-4">
                  History
                </h2>
                <div className="space-y-4">
                  {history.map((b) => <BookingActionCard key={b.id} booking={b} />)}
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  )
}
