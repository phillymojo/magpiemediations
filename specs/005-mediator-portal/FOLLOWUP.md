# Follow-up Items: Mediator Portal

## Auto-link only fires on sign-up (user.created)

**Issue**: A person who already has a User account before their Mediator record is
created (or before their Mediator email is set) will not be auto-linked. The
`linkMediatorToUser` call only runs in the `user.created` webhook handler, which
fires once at account creation.

**Intended MVP flow** (works correctly): Morgan creates the Mediator record with the
mediator's email *first*, then the mediator signs up → auto-linked.

**Edge case** (not handled): mediator already had a platform account before their
Mediator record existed.

**Options to address later**:
1. Also attempt linking in the `user.updated` webhook handler.
2. Add a small admin action / script to manually link an existing user to a mediator.
3. Periodic reconciliation job that links any matching unlinked pairs.

**Discovered**: 2026-06-08 during local testing (Morgan's pre-existing account did not
auto-link to the James Alvarez record after the email was set). Worked around manually
for testing by setting `mediator.userId` and Clerk `publicMetadata.isMediatorLinked`.
