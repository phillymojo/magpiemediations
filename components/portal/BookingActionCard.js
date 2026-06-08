'use client'

import { useState } from 'react'
import { acceptBooking, declineBooking } from '@/lib/actions/portal'
import { BookingStatusBadge } from '@/components/bookings/BookingStatusBadge'

const SESSION_LABELS = { HALF_DAY: 'Half-Day', FULL_DAY: 'Full-Day' }

export function BookingActionCard({ booking }) {
  const [pending, setPending] = useState(false)
  const [error,   setError]   = useState(null)

  const isActionable = booking.status === 'PENDING_CONFIRMATION'
  const formattedDate = new Date(booking.preferredDate).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  })

  async function handleAction(action) {
    setPending(true)
    setError(null)
    const result = await action(booking.id)
    if (result?.error) {
      setError(result.error)
      setPending(false)
    }
    // On success the page revalidates and the card re-renders with new status
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-semibold text-slate-900">
            {SESSION_LABELS[booking.sessionType]} Session
          </p>
          <p className="text-sm text-slate-500 mt-0.5">
            Requested by {booking.user.firstName} · {formattedDate}
          </p>
        </div>
        <BookingStatusBadge status={booking.status} />
      </div>

      {isActionable && (
        <div className="mt-4 flex gap-3">
          <button
            onClick={() => handleAction(acceptBooking)}
            disabled={pending}
            className="rounded-md bg-[#12284C] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1A3A6C] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {pending ? 'Working…' : 'Accept'}
          </button>
          <button
            onClick={() => handleAction(declineBooking)}
            disabled={pending}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Decline
          </button>
        </div>
      )}

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    </div>
  )
}
