# Contract: Clerk Webhook Endpoint

**Endpoint**: `POST /api/webhooks/clerk`
**Direction**: Inbound (Clerk → Platform)
**Auth**: Svix signature verification (headers: `svix-id`, `svix-timestamp`, `svix-signature`)

## Request

```
POST /api/webhooks/clerk
Content-Type: application/json
svix-id: msg_xxxx
svix-timestamp: 1234567890
svix-signature: v1,xxxx
```

**Body** (Clerk event envelope):
```json
{
  "type": "user.created" | "user.updated" | "user.deleted",
  "data": {
    "id": "user_xxxxxxxxxxxx",
    "email_addresses": [{ "email_address": "user@example.com", "id": "...", "verification": {...} }],
    "first_name": "Jane",
    "last_name": "Smith",
    "created_at": 1234567890000,
    "updated_at": 1234567890000
  }
}
```

## Responses

| Status | Meaning |
|--------|---------|
| 200 | Event processed successfully |
| 400 | Signature verification failed or malformed payload |
| 500 | Internal error (Clerk will retry) |

## Behavior by Event Type

| Event | Action |
|-------|--------|
| `user.created` | Upsert User record in Postgres (idempotent) |
| `user.updated` | Update email, firstName, lastName in Postgres |
| `user.deleted` | Delete User record from Postgres |

## Guarantees

- Signature MUST be verified before any DB write. If verification fails, return 400 immediately.
- Upsert MUST be idempotent — duplicate `user.created` events produce one User record.
- No user PII (email, name) is written to logs at any log level.
- Primary email is taken from `email_addresses[0].email_address` (Clerk always provides at least one).
