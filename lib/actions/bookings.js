'use server'

import { auth }               from '@clerk/nextjs/server'
import { redirect }           from 'next/navigation'
import { z }                  from 'zod'
import { getMediatorBySlug }  from '@/lib/db/mediators'
import { createBooking as dbCreateBooking } from '@/lib/db/bookings'
import { createAuditEntry }   from '@/lib/db/auditLog'
import { sendBookingEmails }  from '@/lib/email/sendBookingEmails'

const schema = z.object({
  mediatorId:      z.string().min(1),
  mediatorSlug:    z.string().min(1),
  sessionType:     z.enum(['HALF_DAY', 'FULL_DAY']),
  preferredDate:   z.string().refine((d) => {
    const date = new Date(d)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date >= today
  }, { message: 'Preferred date must be today or in the future' }),
  caseDescription: z.string().min(1, 'Case description is required').max(2000),
})

export async function createBooking(formData) {
  const { userId } = await auth()
  if (!userId) {
    redirect('/sign-in?redirect_url=/mediators')
  }

  const parsed = schema.safeParse(formData)
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors }
  }

  const { mediatorSlug, sessionType, preferredDate, caseDescription } = parsed.data

  // Principle III: getMediatorBySlug already enforces verificationStatus = ACTIVE
  // in its WHERE clause — null return means not found or not active
  const mediator = await getMediatorBySlug(mediatorSlug)
  if (!mediator) {
    return { error: 'This mediator is no longer available.' }
  }

  const booking = await dbCreateBooking({
    userId,
    mediatorId:  mediator.id,
    sessionType,
    preferredDate,
    caseDescription,
  })

  // Principle VI: append-only audit entry on every booking state change
  await createAuditEntry({
    actorId:    userId,
    action:     'booking.created',
    entityType: 'Booking',
    entityId:   booking.id,
    newStatus:  'PENDING_CONFIRMATION',
  })

  // Fire-and-forget — email failure must not roll back the booking (FR-011).
  // mediator.email may be null; sendBookingEmails falls back to ADMIN_EMAIL.
  sendBookingEmails({
    booking,
    mediator,
    user:          booking.user,
    mediatorEmail: mediator.email ?? null,
  }).catch((err) => console.error('[email] booking notification failed:', err))

  redirect(`/bookings/${booking.id}/confirmation`)
}
