import { resend }                from '@/lib/email/client'
import { render }               from 'react-email'
import { BookingConfirmation }  from '@/lib/email/templates/BookingConfirmation'
import { BookingNotification }  from '@/lib/email/templates/BookingNotification'

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
}

export async function sendBookingEmails({ booking, mediator, user, mediatorEmail }) {
  const formattedDate  = formatDate(booking.preferredDate)
  const mediatorName   = `${mediator.firstName} ${mediator.lastName}`
  const toMediatorAddr = mediatorEmail ?? process.env.ADMIN_EMAIL

  // User confirmation email
  await resend.emails.send({
    from:    'Magpie Mediations <noreply@magpiemediations.com>',
    to:      user.email,
    subject: `Booking Request Received — ${mediatorName} on ${formattedDate}`,
    react:   BookingConfirmation({
      firstName:     user.firstName,
      mediatorName,
      sessionType:   booking.sessionType,
      preferredDate: formattedDate,
    }),
  })

  // Mediator / admin notification email — no case description per Principle I
  await resend.emails.send({
    from:    'Magpie Mediations <noreply@magpiemediations.com>',
    to:      toMediatorAddr,
    subject: `New Booking Request — ${booking.sessionType === 'HALF_DAY' ? 'Half-Day' : 'Full-Day'} on ${formattedDate}`,
    react:   BookingNotification({
      mediatorName,
      sessionType:   booking.sessionType,
      preferredDate: formattedDate,
    }),
  })
}
