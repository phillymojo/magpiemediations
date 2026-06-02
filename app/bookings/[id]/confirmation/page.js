import { auth }          from '@clerk/nextjs/server'
import { redirect }      from 'next/navigation'
import Link              from 'next/link'
import { getBookingById } from '@/lib/db/bookings'

export const metadata = { title: 'Booking Confirmed — Magpie Mediations' }

const SESSION_LABELS = { HALF_DAY: 'Half-Day (~4 hours)', FULL_DAY: 'Full-Day (~8 hours)' }

export default async function BookingConfirmationPage({ params }) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const { id } = await params
  const booking = await getBookingById(id)

  if (!booking || booking.userId !== userId) redirect('/bookings')

  const mediatorName  = `${booking.mediator.firstName} ${booking.mediator.lastName}`
  const formattedDate = new Date(booking.preferredDate).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto max-w-2xl px-4 py-16 sm:px-6 text-center">

        {/* Success indicator */}
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl mb-6">
          ✓
        </div>

        <h1 className="text-2xl font-bold text-slate-900 mb-2">Request Submitted</h1>
        <p className="text-slate-500 mb-8">
          Your booking request is pending confirmation. You'll hear back within 48 hours.
        </p>

        <div className="bg-white rounded-lg border border-slate-200 p-6 text-left space-y-3 mb-8">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Mediator</span>
            <span className="font-semibold text-slate-900">{mediatorName}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Session Type</span>
            <span className="font-semibold text-slate-900">{SESSION_LABELS[booking.sessionType]}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Preferred Date</span>
            <span className="font-semibold text-slate-900">{formattedDate}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Status</span>
            <span className="font-semibold text-amber-600">Pending Confirmation</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/bookings" className="rounded-md bg-[#12284C] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#1A3A6C] transition-colors">
            View My Bookings
          </Link>
          <Link href="/mediators" className="rounded-md border border-slate-300 px-6 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
            Browse Mediators
          </Link>
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
          <p className="text-xs text-slate-400 leading-relaxed text-center">
            Magpie Mediations LLC is a technology platform, not a law firm, and does not
            provide legal advice or legal representation. Mediating attorneys participate
            in their individual capacity as independent neutral contractors.
          </p>
        </div>
      </footer>
    </div>
  )
}
