<!--
SYNC IMPACT REPORT
==================
Version change: 1.2.0 → 1.2.1
Bump rationale: PATCH — clarified actual shipped versions in the Technology
Stack table (Next.js 16 / React 19 / Tailwind CSS v4). Confirmed during T001
scaffold on 2026-05-07. No principles, governance, or architecture changed.

Prior version history (pre-1.2.1):
  - 1.2.0 (2026-05-05): added Multi-Account Portability subsection.

Principles: unchanged (I–VII).

Sections changed:
  - Additional Constraints
      • Multi-Account Portability — new subsection (env-driven config,
        account-portable naming, stable S3 keys, KMS portability,
        log-retention policy, decoupled domain, migration runbook
        requirement)

New artifacts:
  - docs/aws-account-migration.md  (stub runbook — to be expanded as
    AWS-resident resources are added)

Templates / dependent artifacts:
  - .specify/templates/plan-template.md          ✅ no change required
  - .specify/templates/spec-template.md          ✅ no change required
  - .specify/templates/tasks-template.md         ✅ no change required
  - .specify/templates/checklist-template.md     ✅ no change required
  - CLAUDE.md                                    ✅ no change required
  - README.md                                    ⚠ pending — does not exist
                                                    yet; create when first
                                                    feature lands

Deferred items: none.

Prior version history:
  - 1.1.0 (2026-05-05): locked technology stack table; added Scalability
    Practices and Documented Graduation Paths.
  - 1.0.0 (2026-05-05): initial ratification — 7 principles, baseline
    Additional Constraints, Development Workflow, Governance.
-->

# Magpie Mediations Constitution

## Core Principles

### I. Confidentiality by Default (NON-NEGOTIABLE)

Mediation communications, case content, and party identities are privileged. All
case data MUST be encrypted in transit (TLS 1.2+) and at rest. Access is
least-privilege: roles are scoped to the minimum data required for the task, and
every read of sensitive case content (uploaded documents, case descriptions,
private session notes) is recorded in the audit log. Third-party analytics,
session-replay tools, and error trackers MUST NOT receive case content;
sanitization is required before any such payload leaves the platform.

**Rationale**: A single leak of mediation content destroys the product's value
proposition and exposes the platform to claims by parties whose privilege was
breached.

### II. Platform, Not a Law Firm (NON-NEGOTIABLE)

Magpie Mediations LLC is a technology platform. UI copy, emails, marketing, and
mediator communications MUST NOT imply that Magpie provides legal advice, holds
an attorney-client relationship with users, or supervises mediator conduct.
Mediators participate as independent neutral contractors. The "not a law firm"
disclaimer MUST appear on the home page, booking flow, and footer; it MAY also
appear on dashboards and outbound emails as content warrants.

**Rationale**: Misrepresentation creates regulatory exposure (UPL — unauthorized
practice of law) in U.S. jurisdictions and undermines the independence of the
mediator-as-neutral relationship.

### III. Verified Mediators, Always

A mediator MUST NOT appear in the roster or accept bookings until the platform
has verified: (a) active bar admission in at least one U.S. jurisdiction,
(b) attestation of 5+ years of active civil litigation practice, and (c) clean
disciplinary history per the primary state bar. Verification MUST be re-run
annually. A per-session conflicts-of-interest screening is a hard gate: a
booking cannot be confirmed until the assigned mediator has cleared conflicts
against the case parties and counsel listed at booking.

**Rationale**: The platform's differentiator is "active civil litigators, not
retired judges." Allowing unverified or stale-status neutrals onto the roster
collapses that promise and creates malpractice-adjacent risk.

### IV. High-Stakes Flows Are Test-First

Code that touches booking confirmation, payment processing, e-signature
execution, mediator verification, or audit-log writes MUST have automated tests
(unit and/or integration as appropriate) written and merged alongside the
implementing change. Tests for these flows MUST cover the failure paths
(declined payment, expired bar status, partial signature). Other product code
SHOULD be tested pragmatically — coverage is not the goal; defending the
irreversible flows is.

**Rationale**: These are the irreversible, money- and legal-document-bearing
flows. Bugs here cost money, expose privileged content, or void agreements.

### V. Buy, Don't Build, for Sensitive Infrastructure

The platform MUST use established third-party providers for: payment processing
(e.g., Stripe), e-signatures (e.g., DocuSign, Dropbox Sign), video conferencing
(e.g., Zoom, Daily), and transactional email/identity. Custom implementations
of cryptography, payment card handling, signature workflows, or auth primitives
are forbidden absent a written exception ratified as a constitution amendment.

**Rationale**: Each of these domains has well-known compliance regimes
(PCI-DSS, ESIGN/UETA, SOC 2). Building in-house multiplies the audit and
incident-response surface for no product-differentiation benefit.

### VI. Audit Trail on Every State Change

Every change to a session, agreement, payment, or mediator-status record MUST
write an immutable audit log entry capturing: actor (user ID or system),
timestamp (UTC, ISO 8601), action, prior state, and new state. Audit logs MUST
be retained for at least seven years and MUST be queryable by case ID. Audit
records MUST NOT be editable through application code paths.

**Rationale**: Mediation disputes, billing disputes, and bar-complaint inquiries
all require defensible reconstruction of who did what, when. Without it the
platform cannot answer the questions it will be asked.

### VII. Simplicity / YAGNI

Version 1 of the platform MUST be limited to: half-day and full-day flat-rate
sessions, online (video) and in-person formats, U.S. jurisdictions only, with
the user roles of party (counsel) and mediator. Out of scope for v1: hourly
billing, enterprise/multi-tenant accounts, international jurisdictions,
AI-mediator features, mediator marketplaces beyond the curated roster, and
white-labeling. New features outside this scope require a constitution
amendment or a documented exception in the feature spec.

**Rationale**: Scope creep on a regulated, trust-dependent product erodes both
delivery velocity and the focused value proposition. v1 must validate the core
transaction before expanding.

## Additional Constraints

### Technology Stack (locked at v1.1.0)

| Layer | Choice |
|---|---|
| Framework | Next.js 16 / React 19 (App Router; React Server Components + Server Actions) |
| Language | JavaScript |
| Hosting | AWS Amplify Hosting |
| Database | Postgres on Neon (serverless) |
| ORM / migrations | Prisma |
| Auth | Clerk |
| Payments | Stripe |
| E-signatures | Dropbox Sign |
| Video conferencing | Zoom (per-session meetings via Zoom API) |
| File storage | Amazon S3 with SSE-KMS |
| Transactional email | Resend (with React Email templates) |
| Styling / UI | Tailwind CSS v4 + shadcn/ui |
| Forms / validation | React Hook Form + Zod |
| Background jobs | Inngest |
| Errors | Sentry (with PII scrubbing for Principle I) |
| Logs | AWS CloudWatch |
| CI/CD | GitHub Actions |
| Test framework | Jest + React Testing Library |

Substituting any layer above requires a constitution amendment (MINOR for a
single-layer swap; MAJOR if the swap re-architects more than one layer).
TypeScript MAY be added by future amendment; not required for v1.

### Engineering Conventions

- Functional programming style preferred over class-based; classes are
  acceptable where a third-party API requires them.
- Descriptive variable and function names; minimal inline comments — comment
  the "why," not the "what."
- Commit messages follow Conventional Commits
  (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`, etc.).
- Validate at trust boundaries (user input, webhook payloads, third-party
  responses) with Zod schemas — internal code paths trust each other.

### Scalability Practices (do-it-right-the-first-time)

These decisions are cheap upfront and expensive to retrofit; v1 MUST follow
them so MVP scales when the platform hits market.

- **Region pinning**: AWS resources, Neon project, Clerk instance, and S3
  buckets pinned to a single primary region (default: `us-east-1`).
  Multi-region expansion is a future amendment.
- **Connection pooling**: Prisma MUST use Neon's pooled connection string
  (PgBouncer) for all serverless function paths. Direct connections allowed
  only for migration runners.
- **Pagination from day one**: every list endpoint and database query that
  returns user-visible collections MUST paginate. No unbounded `findMany`
  in product code.
- **Indexed queries**: every column used in a roster filter (state, practice
  area, availability date, mediator status) MUST have a database index.
  Composite indexes for common filter combinations.
- **Idempotency keys**: payment, booking-confirmation, signature-request,
  and other mutating endpoints exposed to clients or webhooks MUST accept
  and honor an idempotency key (Stripe-style).
- **Webhook signature verification**: every inbound webhook (Stripe,
  Dropbox Sign, Zoom, Clerk, Inngest) MUST verify the provider's signature
  before any side effect. Replay protection via received-event store.
- **Rate limiting**: public, unauthenticated endpoints (booking start,
  mediator application submission, contact forms) MUST be rate-limited.
- **Append-only audit log**: the audit log table is owned by a database
  role with INSERT-only privileges in application paths. UPDATE/DELETE
  privileges reserved for migrations only.
- **Forward-only migrations**: Prisma Migrate; no destructive
  down-migrations on shared (preview/staging/production) environments.
- **CDN-cacheable static**: marketing pages and public mediator profile
  pages served via CloudFront (Amplify default). Case-content pages,
  dashboards, and document-vault routes explicitly `Cache-Control: no-store`.
- **No PII in logs**: structured logs MUST exclude case content, party
  identifying info, and uploaded document contents. Use redaction
  middleware for both Sentry and CloudWatch.
- **Background jobs for slow work**: anything that exceeds ~10s of
  request time (bar-status verification, document generation, email
  fan-out) runs in Inngest, not in a request handler.

### Documented Graduation Paths

If a layer reaches its scaling ceiling, these are the pre-blessed swaps —
each still requires a constitution amendment, but the architectural impact
is bounded:

- **Resend → AWS SES** when transactional email volume or cost makes SES
  attractive (typically ≥1M sends/month).
- **Neon → Aurora Serverless v2 (Postgres)** if AWS-native data residency
  is required by an enterprise customer or compliance requirement. Same
  Postgres dialect; Prisma migrations carry over.
- **Amplify Hosting → SST or self-managed OpenNext** if Next.js features
  outpace Amplify's managed support, or if finer infrastructure control
  becomes necessary.
- **Inngest → AWS EventBridge + Step Functions** if job volume requires
  AWS-native ops or pricing dynamics shift.
- **Single-region → multi-region active-passive**, using Neon read
  replicas and CloudFront origin failover, when latency or DR demands
  it.
- **Clerk → Auth.js (self-hosted)** only if vendor cost or contractual
  control becomes a blocker; high migration cost, treat as last resort.

### Multi-Account Portability

The MVP launches in Morgan's personal AWS account and will migrate to a
dedicated Magpie Mediations AWS account once provisioned. The following
rules MUST hold so that migration is "DNS swap + S3 sync," not a rebuild:

1. **Config via environment, not code** — every AWS resource ARN, bucket
   name, KMS key ID/alias, IAM role name, and region MUST be loaded from
   environment variables (Amplify env vars in deployed environments,
   `.env` files in development). No AWS-specific identifiers hardcoded
   in source.
2. **Account-portable naming** — resource names MUST NOT contain AWS
   account IDs, personal identifiers, or human names. Convention:
   `magpie-{env}-{resource}` (e.g., `magpie-prod-vault`, `magpie-staging-vault`).
3. **Stable, deterministic S3 object keys** — keys MUST be account-portable
   (e.g., `cases/{caseId}/documents/{docId}`) so cross-account
   `aws s3 sync` works without rewriting paths. No timestamp- or
   account-id-prefixed keys.
4. **KMS portability** — file encryption uses SSE-KMS with a customer-managed
   key referenced by alias (e.g., `alias/magpie-prod-vault`). The alias is
   re-created in the target account during migration; re-encryption
   procedure is documented in the runbook.
5. **Logs are not source of truth** — CloudWatch Logs retention SHALL be
   set to 90 days. Anything that must survive an account migration
   (audit log, payment records, signed agreement metadata) lives in
   Postgres or S3, not CloudWatch.
6. **Decoupled domain** — the application MUST be served from a custom
   domain managed via Route 53 (or any registrar with portable DNS).
   User-facing URLs, stored links, and outbound email content MUST NOT
   embed `*.amplifyapp.com` or `*.cloudfront.net` URLs.
7. **Migration runbook required** — `docs/aws-account-migration.md` MUST
   exist and MUST be updated whenever a new AWS-resident resource is
   added. Pre-launch review of the runbook is a release gate.

## Development Workflow

- **Spec-driven development** via Spec Kit: `/speckit-specify` →
  `/speckit-clarify` → `/speckit-plan` → `/speckit-tasks` →
  `/speckit-implement`.
- **Constitution Check**: every plan generated by `/speckit-plan` MUST evaluate
  the design against these principles. Violations are recorded in the
  Complexity Tracking section of the plan with explicit justification.
- **Reviews**: changes touching code in the high-stakes scope of Principle IV
  require explicit reviewer sign-off that tests cover the relevant failure
  paths.
- **Branching**: Spec Kit's sequential branch numbering (`001-`, `002-`, ...).
- **Secrets**: never committed; environment configuration is loaded from
  AWS-managed secret storage in deployed environments and from local `.env`
  files (gitignored) in development.

## Governance

This constitution supersedes ad-hoc engineering preferences and prior README
guidance for this project. Amendments are made by updating
`.specify/memory/constitution.md` via the `/speckit-constitution` workflow,
which:

1. Increments the version using semantic-versioning rules:
   - **MAJOR**: backward-incompatible removal or redefinition of a principle
     or governance rule.
   - **MINOR**: new principle or section added, or material expansion of
     existing guidance.
   - **PATCH**: clarifications, wording, typo fixes, non-semantic refinements.
2. Updates the Sync Impact Report at the top of this file.
3. Propagates changes to dependent templates under `.specify/templates/`.
4. Updates `LAST_AMENDED_DATE` to the date of the amendment.

All pull requests touching code MUST be checked against the relevant
principles. Complexity that violates a principle MUST be justified in writing
in the feature plan's Complexity Tracking section, or the change is rejected.

**Version**: 1.2.1 | **Ratified**: 2026-05-05 | **Last Amended**: 2026-05-07
