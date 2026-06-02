import { auth }              from '@clerk/nextjs/server'
import { redirect }          from 'next/navigation'
import Link                  from 'next/link'
import { getUserBookings }   from '@/lib/db/bookings'
import { BookingStatusBadge } from '@/components/bookings/BookingStatusBadge'

export const metadata = { title: 'My Bookings — Magpie Mediations' }

const SESSION_LABELS = { HALF_DAY: 'Half-Day', FULL_DAY: 'Full-Day' }

export default async function MyBookingsPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const bookings = await getUserBookings(userId)

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200">
        <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-1">My Account</p>
          <h1 className="text-2xl font-bold text-slate-900">My Bookings</h1>
        </div>
      </div>

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        {bookings.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-lg font-semibold text-slate-800 mb-2">No bookings yet</p>
            <p className="text-sm text-slate-500 mb-6">Browse our roster to request a session with a mediator.</p>
            <Link href="/mediators" className="inline-block rounded-md bg-[#12284C] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1A3A6C] transition-colors">
              Browse Mediators
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => {
              const mediatorName  = `${booking.mediator.firstName} ${booking.mediator.lastName}`
              const formattedDate = new Date(booking.preferredDate).toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric',
              })
              return (
                <div key={booking.id} className="bg-white rounded-lg border border-slate-200 p-5 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-slate-900">{mediatorName}</p>
                    <p className="text-sm text-slate-500 mt-0.5">
                      {SESSION_LABELS[booking.sessionType]} · {formattedDate}
                    </p>
                  </div>
                  <BookingStatusBadge status={booking.status} />
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
