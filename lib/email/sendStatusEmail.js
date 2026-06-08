import { resend }            from '@/lib/email/client'
import { BookingAccepted }   from '@/lib/email/templates/BookingAccepted'
import { BookingDeclined }   from '@/lib/email/templates/BookingDeclined'

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
}

/**
 * Send the user a status-change email after a mediator accepts or declines.
 * `booking` must include user (firstName, email) and mediator (firstName, lastName).
 */
export async function sendBookingStatusEmail({ booking, status }) {
  const mediatorName  = `${booking.mediator.firstName} ${booking.mediator.lastName}`
  const formattedDate = formatDate(booking.preferredDate)
  const accepted      = status === 'CONFIRMED'

  await resend.emails.send({
    from:    'Magpie Mediations <noreply@magpiemediations.com>',
    to:      booking.user.email,
    subject: accepted
      ? `Your Session with ${mediatorName} is Confirmed`
      : `Update on Your Session Request with ${mediatorName}`,
    react: accepted
      ? BookingAccepted({ firstName: booking.user.firstName, mediatorName, sessionType: booking.sessionType, preferredDate: formattedDate })
      : BookingDeclined({ firstName: booking.user.firstName, mediatorName, sessionType: booking.sessionType, preferredDate: formattedDate }),
  })
}
