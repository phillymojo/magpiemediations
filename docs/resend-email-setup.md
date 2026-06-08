# Resend Email Setup (PENDING)

**Status**: Not yet completed — emails will silently fail until this is done.
**Owner**: Morgan
**Impact**: All app flows work without this (email sends are fire-and-forget and never
block bookings or status changes). Only actual email *delivery* is blocked.

---

## What needs to happen

To enable transactional email delivery (booking confirmation, mediator notification,
accept/decline status emails), the sending domain `magpiemediations.com` must be
verified in Resend. Until then, Resend rejects sends from `noreply@magpiemediations.com`.

## Step 1 — Resend domain (already added)

Domain `magpiemediations.com` added in Resend → Domains, region `us-east-1`.
Resend generated the DNS records below.

## Step 2 — Add DNS records in GoDaddy

DNS for `magpiemediations.com` is managed at **GoDaddy** (nameservers
`ns59/ns60.domaincontrol.com`). Add these four records under
GoDaddy → My Products → magpiemediations.com → DNS → Add New Record.

Use the **relative** name (GoDaddy appends the domain automatically).

| # | Type | Name | Value | Priority |
|---|------|------|-------|----------|
| 1 | TXT | `resend._domainkey` | `p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC+9pS4npTVrEvwQgXYd2p3yzrglaemMMD5FV+fpdAjXdFFD/GfAlgP4qVrL2fv1s8h81usn4Ys30usrdGN/BavdQfrsMLRCjL9iH8iBeYqo+qiY61Pk34eL4V1mqmrlFuvaK83u4/iAk1XvwaeGApVewkdyUQOKLjKYjBZ5y+lhwIDAQAB` | — |
| 2 | MX | `send` | `feedback-smtp.us-east-1.amazonses.com` | 10 |
| 3 | TXT | `send` | `v=spf1 include:amazonses.com ~all` | — |
| 4 | TXT | `_dmarc` | `v=DMARC1; p=none;` | — |

Gotcha: if you see `send.magpiemediations.com.magpiemediations.com` after saving,
you doubled the suffix — use just `send`.

## Step 3 — Verify in Resend

Back in Resend, click **Verify** / **Enable Sending**. Propagation on GoDaddy is
usually 10–30 min. Domain shows green **Verified** when done.

## Step 4 — Confirm env vars

- `RESEND_API_KEY` — already in `.env` and Amplify (re_...)
- `ADMIN_EMAIL` — already set; used as mediator-notification fallback
- The `from` address in code is `noreply@magpiemediations.com` — matches the verified
  domain, no code change needed.

## Step 5 — End-to-end email test (after verification)

Test accounts use Gmail plus-addressing (all land in mbonar@gmail.com):
- User account: `mbonar@gmail.com`
- James (mediator): `mbonar+james@gmail.com`

1. Sign up a fresh account with `mbonar+james@gmail.com` (auto-links to James record —
   requires the Clerk webhook to be reachable; test on the deployed site or via ngrok)
2. As `mbonar@gmail.com`, book James → notification email arrives (tagged +james)
3. Sign in as James → accept/decline from `/portal` → status email arrives to
   `mbonar@gmail.com`
4. Confirm case description appears in NONE of the emails

## Notes

- Resend runs on AWS SES (hence the `amazonses.com` MX value).
- Webhook reachability is a separate concern from email — the Clerk webhook that
  auto-links mediators also needs a public URL (deployed site or ngrok) to fire locally.
