# Quickstart: Booking Flow (004-booking-flow)

## Prerequisites

- Resend account at resend.com — get an API key
- A verified sending domain in Resend (or use the Resend sandbox `onboarding@resend.dev` for testing)
- Admin email address for mediator notification fallback

## Environment Variables

Add to `.env`:
```
RESEND_API_KEY=re_xxxx
ADMIN_EMAIL=hello@magpie-mediations.com
```

Add to Amplify branch env vars (same keys) and to `amplify.yml` printf line.

## Verify the Setup

1. `npm run dev`
2. Sign in as a test user
3. Navigate to any mediator detail page — "Book a Session" button should now be a live link
4. Complete the booking form — submit
5. Confirm redirect to `/bookings/[id]/confirmation`
6. Check Postgres: `SELECT * FROM "Booking";` — row should exist with status PENDING_CONFIRMATION
7. Check Postgres: `SELECT * FROM "AuditLog";` — entry should exist with action="booking.created"
8. Check inbox for user confirmation email
9. Check ADMIN_EMAIL inbox for mediator notification email
10. Navigate to `/bookings` — booking should appear in the list

## Key Routes

| Route | Purpose |
|-------|---------|
| `/mediators/[slug]/book` | Booking form |
| `/bookings/[id]/confirmation` | Post-submission confirmation |
| `/bookings` | My bookings list (protected) |
