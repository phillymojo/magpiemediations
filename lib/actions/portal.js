'use server'

import { auth }                  from '@clerk/nextjs/server'
import { redirect }              from 'next/navigation'
import { revalidatePath }        from 'next/cache'
import { getMediatorByUserId }   from '@/lib/db/mediators'
import { getBookingById, updateBookingStatus } from '@/lib/db/bookings'
import { createAuditEntry }      from '@/lib/db/auditLog'
import { sendBookingStatusEmail } from '@/lib/email/sendStatusEmail'

// Shared logic for accept/decline — both transition a PENDING_CONFIRMATION
// booking owned by the authenticated mediator to a terminal status.
async function transitionBooking(bookingId, { status, action }) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const mediator = await getMediatorByUserId(userId)
  if (!mediator) return { error: 'Access denied.' }

  const booking = await getBookingById(bookingId)
  if (!booking)                       return { error: 'Booking not found.' }
  if (booking.mediatorId !== mediator.id) return { error: 'Access denied.' }
  if (booking.status !== 'PENDING_CONFIRMATION') {
    return { error: 'This booking has already been actioned.' }
  }

  await updateBookingStatus(bookingId, status)

  // Principle VI: audit every booking state change
  await createAuditEntry({
    actorId:    userId,
    action,
    entityType: 'Booking',
    entityId:   bookingId,
    newStatus:  status,
  })

  // Fire-and-forget — email failure must not roll back the status change
  sendBookingStatusEmail({ booking, status })
    .catch((err) => console.error('[email] status notification failed:', err))

  revalidatePath('/portal')
}

export async function acceptBooking(bookingId) {
  return transitionBooking(bookingId, { status: 'CONFIRMED', action: 'booking.confirmed' })
}

export async function declineBooking(bookingId) {
  return transitionBooking(bookingId, { status: 'CANCELLED', action: 'booking.declined' })
}
