# Magpie Mediations — Project Plan

**Version 1.0**  •  Last updated 2026-05-05

---

## What We're Building

A web platform that connects parties in civil litigation with vetted, currently-practicing mediators. Counsel can browse a verified roster, choose a mediator, book a half-day or full-day session (online or in-person), execute the required agreements electronically, and pay a flat rate — all in a single online flow. **Our differentiator: every mediator on the roster is an actively-practicing civil litigator, not a retired judge or career mediator.**

## How We're Building It

- **Modern, scalable web technology** so the platform can grow without re-architecting.
- **Established third-party providers** handle the sensitive functions:
  - Payments — **Stripe**
  - E-signatures — **Dropbox Sign**
  - Video conferencing — **Zoom**
  - Accounts & login — **Clerk**
  - Email — **Resend**
- **Hosted on AWS** for enterprise-grade security and availability.
- **Guided by a written "constitution" of non-negotiable principles**, including: confidentiality by default, "platform — not a law firm" positioning, mediator verification before any booking, audit trails on every transaction, and disciplined scope (no feature creep on the MVP).

## Progress

| Status | Milestone |
|---|---|
| Done | Product concept and design mockup finalized |
| Done | Project framework and quality standards established (constitution v1.2.0) |
| Done | Technology stack selected and locked in |
| In progress | First feature build: mediator roster (browse and filter) |
| Planned | Booking flow (case info, mediator selection, session type, scheduling) |
| Planned | E-signature flow for mediation agreement and confidentiality provisions |
| Planned | Payment processing and confirmation |
| Planned | User dashboards (counsel + mediator views) |
| Planned | Mediator application and verification workflow |
| Planned | Marketing pages, pricing page, public launch |

## What's Next (Near Term)

Build and demonstrate the mediator roster page — counsel can search by practice area, state, and availability. After that: the end-to-end booking and payment flow, then the e-signature and dashboard work.

## Open Items / Decisions for the Partners

- **Pricing** — current placeholders are $1,500 (half-day) and $2,500 (full-day) for parties; $1,200 / $2,000 mediator payouts. Final pricing to be set before launch.
- **AWS account** — MVP will deploy in Morgan's personal AWS account; production will migrate to a dedicated Magpie Mediations AWS account once it is provisioned. Migration plan is documented and scoped.
- **Founding mediator outreach** — not started; will rely on the partners' professional network for the first cohort.
- **Domain registration** — to be confirmed (`magpie-mediations.com` or alternative).
- **Entity formalities** — confirm Magpie Mediations LLC formation, EIN, business bank account, and Stripe onboarding documentation are in hand before payment processing goes live.

---

*Magpie Mediations LLC is a technology platform, not a law firm, and does not provide legal advice. Rates and features described are subject to change prior to launch.*

**Revision history**
- v1.0 — 2026-05-05 — Initial plan: scope, stack, milestone status.
