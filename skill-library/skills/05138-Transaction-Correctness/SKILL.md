---
id: transaction-correctness
name: Transaction Correctness
description: Review transactional workflows for atomicity, isolation, idempotency, and failure-safe state changes.
category: Databases
requires: []
examples:
  - "Check this workflow for transaction bugs."
  - "What can go wrong with this database transaction design?"
  - "Help me reason about isolation and idempotency here."
---

# Transaction Correctness

Use this skill to review whether a workflow remains correct under retries, concurrency, partial failure, and race conditions.

## What To Inspect
- Which writes must succeed or fail together.
- What happens if the same request is retried.
- Which reads need freshness or locking.
- Whether side effects occur inside or outside the transaction boundary.
- How state can be corrupted by concurrent actors.

## Correctness Checks
- Atomicity of related changes.
- Isolation level assumptions.
- Idempotency for retries and duplicate delivery.
- Ordering guarantees for dependent updates.
- Recovery behavior after partial failure.

## Good Output
- Transaction boundary recommendation.
- Concurrency or race-condition risks.
- Idempotency gaps.
- Safer sequencing or locking suggestions.
- Invariants that must always hold.

## Common Failure Modes
- Read-modify-write flows without protection.
- External side effects that cannot be rolled back.
- Assuming default isolation solves business-level races.
- Missing uniqueness or state guards for retries.
