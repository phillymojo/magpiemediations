# Quickstart: Mediator Portal (005-mediator-portal)

## Setup a Test Mediator

1. Open Prisma Studio: `npx prisma studio`
2. Find a `Mediator` record → set their `email` to an address you control
3. Sign up on the platform with that email
4. Confirm `mediator.userId` is now set (check Prisma Studio)
5. Navigate to `/portal` — you should see the mediator dashboard

## Verify Auto-Linking

```sql
SELECT id, "firstName", "lastName", email, "userId" FROM "Mediator" WHERE email IS NOT NULL;
```

After signing up with a matching email, `userId` should be populated.

## Test Accept/Decline

1. As a regular user, submit a booking for the mediator you set up
2. Sign in as the mediator
3. Go to `/portal` — booking should appear in Pending
4. Click Accept — confirm status becomes CONFIRMED in DB
5. Check user's inbox for confirmation email
6. Repeat with a second booking, click Decline — confirm CANCELLED + email

## Key Routes

| Route | Purpose |
|-------|---------|
| `/portal` | Mediator dashboard — view and action bookings |

## Navbar

When signed in as a linked mediator, "My Portal" link appears in the navbar alongside "My Bookings".
