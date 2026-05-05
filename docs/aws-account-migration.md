# AWS Account Migration Runbook

**Purpose**: Move the Magpie Mediations production environment from Morgan's
personal AWS account to a dedicated Magpie Mediations AWS account with
minimal downtime and zero data loss.

**Status**: Stub — to be expanded as AWS-resident resources are added during
MVP build. Required reading before MVP traffic is accepted (per constitution
§ Multi-Account Portability, item 7).

---

## Inventory of AWS-Resident Resources

Update this list every time a new AWS resource is provisioned. If a layer
is provided by a third party (Neon, Clerk, Stripe, Dropbox Sign, Zoom,
Resend, Inngest, Sentry), it does **not** belong here — those are not
affected by an AWS account move.

| Resource | Purpose | Notes |
|---|---|---|
| _Amplify Hosting app_ | Next.js deployment | Connect via GitHub OAuth in the target account; no app code changes |
| _S3 bucket: `magpie-prod-vault`_ | Document vault | Cross-account `aws s3 sync` during cutover |
| _KMS key: `alias/magpie-prod-vault`_ | SSE-KMS for vault | Recreate alias in target; re-encrypt during sync |
| _IAM roles_ | Lambda execution, Amplify build | Recreate per least-privilege; not directly migratable |
| _CloudWatch Log Groups_ | App / Lambda logs | Not migrated; 90-day retention assumes loss is acceptable |
| _ACM certificate_ | TLS for custom domain | Re-issued in target account via DNS validation |
| _Route 53 hosted zone_ | Domain DNS | Either transfer hosted zone, or update NS records at registrar |

---

## Pre-Flight Checklist

- [ ] Target AWS account created, MFA on root, billing alerts configured.
- [ ] IAM admin user (or AWS SSO assignment) provisioned for Morgan in target.
- [ ] Verify Neon, Clerk, Stripe, Dropbox Sign, Zoom, Resend, Inngest,
      Sentry credentials are environment-variable-driven (no AWS-account
      coupling).
- [ ] Decide cutover window with low-traffic tolerance.
- [ ] Verify backup of Postgres (Neon) and S3 vault before cutover.
- [ ] Communicate maintenance window to active mediators / parties if any.

---

## Provisioning Order in Target Account

1. **IAM** — admin user / SSO, deployment role with least-privilege policy.
2. **Route 53** — hosted zone for the custom domain (or prepare NS update).
3. **KMS** — customer-managed key + alias `alias/magpie-{env}-vault`.
4. **S3** — vault bucket with SSE-KMS, versioning on, lifecycle rules,
   access logging on. Bucket policy denies non-TLS, denies non-KMS uploads.
5. **ACM** — request certificate for custom domain in `us-east-1` (CloudFront
   requirement) and again in primary region if Amplify needs it; DNS-validate.
6. **Amplify Hosting** — connect to GitHub repo, attach environment variables
   (point to *target* account's S3 bucket, KMS alias, etc., plus all
   third-party credentials).
7. **CloudWatch** — log group retention 90 days.

---

## Data Migration

### S3 Vault

1. In the **source** account, attach a bucket policy granting the target
   account read access to `magpie-prod-vault`.
2. From the **target** account, run cross-account sync:
   ```
   aws s3 sync \
     s3://magpie-prod-vault \
     s3://magpie-prod-vault-target \
     --source-region us-east-1 \
     --region us-east-1
   ```
   *(Note: target bucket may temporarily use a `-target` suffix during
   cutover, then be promoted to the canonical name once source is
   decommissioned. Or use distinct primary names in each account and
   update env var only.)*
3. Re-encryption: objects copied via `aws s3 sync` are re-encrypted with
   the **target** account's KMS key automatically when the destination
   bucket has SSE-KMS configured with the new alias.
4. Verify object counts and a sampled checksum match before cutover.

### Postgres (Neon)

Neon is third-party — no AWS account migration required. Verify the
connection string env var in the new Amplify environment points to the
same Neon project.

### Audit log

Audit log lives in Postgres → no separate migration step. Confirm post-cutover
that new audit entries are landing in the same Neon database.

---

## Cutover

1. Freeze writes briefly (display maintenance banner, optionally pause
   Inngest job runs).
2. Final S3 incremental sync.
3. Update DNS:
   - If transferring hosted zone: swap registrar NS records.
   - If keeping registrar at hosted zone: update `A`/`ALIAS` records to
     target Amplify's CloudFront distribution.
4. Monitor: error rate (Sentry), 4xx/5xx (CloudWatch), audit-log writes,
   payment webhooks, e-sign callbacks.
5. Smoke test: complete a test booking end-to-end (book → sign → pay →
   confirm).
6. Lift maintenance banner.

---

## Decommission

After 7+ days of stable operation in the target account:

- [ ] Disable writes to source S3 bucket (bucket policy `Deny *`).
- [ ] Snapshot final source S3 inventory for audit purposes.
- [ ] Delete source Amplify app.
- [ ] Empty + delete source S3 bucket.
- [ ] Schedule source KMS key deletion (7–30 day waiting period).
- [ ] Remove source ACM certificate.
- [ ] Remove source IAM roles / access keys.
- [ ] Update internal docs to reflect target account as source of truth.
- [ ] Close source AWS billing for this project (if account is shared with
      other personal projects, just remove magpie-prefixed resources).

---

## Rollback

If cutover fails before DNS update: target environment never received
traffic — abort, investigate, retry.

If cutover fails after DNS update: revert DNS to source. S3 sync was
unidirectional, so source is still authoritative. New writes during the
cutover window must be replayed: review audit log entries with
`created_at` between cutover start and rollback for any S3 puts that
need to be re-synced from target back to source.
