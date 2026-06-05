# Contract: Portal Server Actions

**Location**: `lib/actions/portal.js`
**Auth**: Requires authenticated session AND linked mediator

## acceptBooking(bookingId)

**Behavior**:
1. Verify authenticated session
2. Fetch mediator record for current user — reject if not a linked mediator
3. Fetch booking — reject if not found or not owned by this mediator
4. Reject if booking status is not PENDING_CONFIRMATION
5. Update booking status to CONFIRMED
6. Write AuditLog entry: action="booking.confirmed", entityId=bookingId, newStatus="CONFIRMED"
7. Send confirmation email to user (fire-and-forget)
8. Revalidate portal page

## declineBooking(bookingId)

**Behavior**:
1. Verify authenticated session
2. Fetch mediator record for current user — reject if not a linked mediator
3. Fetch booking — reject if not found or not owned by this mediator
4. Reject if booking status is not PENDING_CONFIRMATION
5. Update booking status to CANCELLED
6. Write AuditLog entry: action="booking.declined", entityId=bookingId, newStatus="CANCELLED"
7. Send cancellation email to user (fire-and-forget)
8. Revalidate portal page

## Error States (both actions)

| Condition | Response |
|-----------|---------|
| Not authenticated | Redirect to /sign-in |
| Not a linked mediator | Return error: "Access denied" |
| Booking not found | Return error: "Booking not found" |
| Booking not owned by mediator | Return error: "Access denied" |
| Booking already CONFIRMED/CANCELLED | Return error: "This booking has already been actioned" |
| Email failure | Log error, do not roll back status change |
