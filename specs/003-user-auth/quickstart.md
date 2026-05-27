# Quickstart: User Authentication (003-user-auth)

## Prerequisites

- Clerk account with a Next.js application created at dashboard.clerk.com
- `CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` from the Clerk dashboard
- A Clerk webhook endpoint configured pointing to `/api/webhooks/clerk` with `user.created`, `user.updated`, `user.deleted` events enabled — get the `CLERK_WEBHOOK_SECRET` from the webhook config

## Environment Variables

Add to `.env`:
```
CLERK_PUBLISHABLE_KEY=pk_test_xxxx
CLERK_SECRET_KEY=sk_test_xxxx
CLERK_WEBHOOK_SECRET=whsec_xxxx
```

Add to Amplify branch environment variables (same keys, production values).

## Local Webhook Testing

Clerk cannot reach `localhost` directly. Use the Clerk dashboard's webhook test tool or ngrok to forward events:
```bash
ngrok http 3000
# Set webhook URL in Clerk dashboard to: https://xxxx.ngrok.io/api/webhooks/clerk
```

## Key URLs

| Route | Purpose |
|-------|---------|
| `/sign-in` | Sign-in page |
| `/sign-up` | Sign-up page |
| `/mediators` | Protected in future booking routes; roster itself remains public |
| `/api/webhooks/clerk` | Inbound Clerk webhook (POST only) |

## Verify the Setup

1. `npm run dev`
2. Navigate to `/sign-up` — Clerk sign-up form should render
3. Create an account — verification email sent
4. Click verification link — redirected to `/mediators`
5. Check Postgres: `SELECT * FROM "User";` — row should exist
6. Sign out via navbar — session cleared, protected routes redirect to `/sign-in`
