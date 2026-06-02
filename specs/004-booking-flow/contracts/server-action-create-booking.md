# Contract: createBooking Server Action

**Location**: `lib/actions/bookings.js`
**Type**: Next.js Server Action (called from BookingForm client component)
**Auth**: Requires authenticated session — redirects to `/sign-in` if not authenticated

## Input (Zod-validated)

```
{
  mediatorId:      string (UUID)
  sessionType:     "HALF_DAY" | "FULL_DAY"
  preferredDate:   string (ISO date, "YYYY-MM-DD", must not be in the past)
  caseDescription: string (1–2000 characters, required)
}
```

## Behavior

1. Verify authenticated session via `auth()` — redirect to `/sign-in` if absent
2. Validate input with Zod schema — return field errors if invalid
3. Verify mediator exists and is ACTIVE — return error if not
4. Create `Booking` record with status `PENDING_CONFIRMATION`
5. Create `AuditLog` entry: action="booking.created", entityType="Booking", entityId=booking.id, newStatus="PENDING_CONFIRMATION"
6. Send emails fire-and-forget (failures logged, do not affect response)
7. Redirect to `/bookings/[id]/confirmation`

## Error States

| Condition | Behavior |
|-----------|---------|
| Not authenticated | Redirect to `/sign-in?redirect_url=/mediators/[slug]/book` |
| Invalid input | Return Zod field errors to form |
| Mediator not ACTIVE | Return error: "This mediator is no longer available" |
| DB write fails | Return error: "Something went wrong. Please try again." |
| Email fails | Log error, continue — booking already committed |

## Guarantees

- Booking record is created before emails are sent
- Email failure never rolls back the booking
- `caseDescription` is never logged or included in any email
- One audit entry per booking creation (idempotency not required — form disabled on submit)
