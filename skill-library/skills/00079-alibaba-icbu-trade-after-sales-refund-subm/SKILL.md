---
name: alibaba-icbu-trade-after-sales-refund-submit
version: 0.2.0
description: >
  Alibaba.com Trade After-Sales Refund Submit Skill. Executes quick-refund submission
  only after the guide skill returned actionType=submit_in_aw and buyer explicitly confirmed.
  Typical utterances:
  - Confirm refund
  - Submit the refund
  - Yes, refund now
  - 确认退款
  - 提交退款
  - Go ahead with the refund

  Do NOT use for: checking eligibility, identifying reasons, querying status,
  or any scenario where the buyer has not explicitly confirmed submission.
enabled: true
tool_triggers:
  - name: icbu_trade_after_sale_submit_issue
---

# Alibaba.com Trade After-Sales Refund Submit

Submits simple quick-refund issues for AW in-chat refund scenarios.

## MCP Services

| Capability Module | MCP code | Description |
|---|---|---|
| Submit Refund | `icbu_trade_after_sale_submit_issue` | Submit a buyer refund issue for quick-refund scenarios |

## Intent Routing

```
User Input
  │
  ├─ Buyer confirms refund after guide card shown (actionType=submit_in_aw)
  │   └─► Submit Refund → icbu_trade_after_sale_submit_issue
  │
  ├─ Buyer says "partial refund" / requests different amount after card
  │   └─► REJECT — inform buyer that partial refund is not supported in quick flow;
  │       route to complex refund guidance
  │
  └─ Ambiguous or non-confirmation ("maybe", "what happens?", "show me")
      └─► Do NOT submit; ask buyer to explicitly confirm or cancel
```

### Intent Recognition Rules

| User Input Characteristics | Intent | Action |
|---|---|---|
| Explicit confirmation ("yes", "confirm", "submit", "go ahead") after guide card | Submit | Call `icbu_trade_after_sale_submit_issue` |
| Requests partial/different amount after guide card shown | Reject | Inform quick-refund only supports full maxRefundAmount; route to complex guidance |
| Ambiguous response without clear yes/no | Clarify | Ask buyer to explicitly confirm or cancel |
| No prior guide card in context (actionType missing) | Block | Route back to guide skill |

## MCP Tool Usage

### Submit Refund — `icbu_trade_after_sale_submit_issue`

**Mandatory MCP call format:**

Parameters are sent at the top level of `--json`. `orderId` is a string.

```bash
accio-mcp-cli call icbu_trade_after_sale_submit_issue --json '{"orderId": "300241527001028893", "reasonId": 1002, "amount": {"cent": 10000, "currencyCode": "USD"}}' --raw
```

### Parameters

| Parameter | Type | Required | Acquisition Strategy |
|---|---|---|---|
| `orderId` | string | yes | From guide skill result (`orderId` field) |
| `reasonId` | integer | yes | Use `defaultReasonId` from scenario result; otherwise use buyer-confirmed reason |
| `amount.cent` | integer | yes | Must exactly equal `maxRefundAmount.cent` from guide result |
| `amount.currencyCode` | string | yes | Must exactly equal `maxRefundAmount.currencyCode` from guide result |

### Response Fields (SubmitRefundIssueDTO)

| Field | Type | Description |
|---|---|---|
| `issueId` | String (nullable) | Created or existing refund issue ID |
| `success` | Boolean | Business success flag |
| `reasonCode` | String (nullable) | Result code — see post-submit behavior below |
| `reasonMessage` | String (nullable) | Human-readable explanation |

## Preconditions

All conditions must be true before calling the MCP tool:

1. The guide skill already returned `actionType=submit_in_aw` in the current conversation.
2. Buyer explicitly confirmed submission in their latest message (unambiguous consent).
3. The `amount` to submit is exactly the `maxRefundAmount` returned by `findRefundScenario` — no modification allowed.
4. `orderId`, `reasonId`, and `amount` are all sourced from the guide result, not from user free-text.
5. `scenarioCode` is one of: `QUICK_REFUND_PI`, `QUICK_REFUND_AG`, `QUICK_REFUND_2HOUR`, `QUICK_REFUND_OVERDUE`.

If any condition is not met, do NOT call the tool. Route back to the guide skill or ask for clarification.

## Safety Constraints

- **Write operation** — never call without explicit buyer confirmation.
- **Amount immutability** — never modify amount, currency, or reason after the guide result. If buyer requests a different amount (e.g., "partial refund"), reject and route to complex refund guidance.
- **Scenario restriction** — never submit for `COMPLEX` or unknown scenario codes.
- **Backend validation** — the backend independently validates the amount. If the amount does not match, it returns `REFUND_AMOUNT_NOT_AVAILABLE`. No incorrect refund can be executed due to agent error.
- **Ambiguity is not consent** — responses like "maybe", "what happens?", "show me", or "tell me more" are NOT confirmation.

## General Rules

### Language
- Detect buyer's input language and respond in the same language.
- Translate UI labels, field names, and prompts from tool output to user's language.
- Keep raw data values (order IDs, issue IDs, amounts) as-is.
- Default to English when language cannot be determined.

### Error Handling

| reasonCode | Scenario | Response Strategy |
|---|---|---|
| `SUCCESS` | Refund submitted | Inform buyer the refund was submitted successfully; show issue ID |
| `ALREADY_EXISTS` | Duplicate submission | Inform buyer a refund was already submitted for this order; show issue ID if present |
| `TRADE_NOT_FOUND` | Invalid order | Tell buyer the order was not found; ask to verify order ID |
| `ACCOUNT_NOT_FOUND` | Account issue | Inform buyer of an account error; suggest retrying or contacting support |
| `NOT_BUYER` | Permission denied | Inform buyer they are not the buyer of this order |
| `REFUND_AMOUNT_NOT_AVAILABLE` | Amount mismatch | Inform buyer the refund amount is no longer valid; route back to guide to refresh scenario |
| `ISSUE_REASON_ERROR` | Invalid reason | Inform buyer the refund reason is invalid; route back to guide skill |
| `QUICK_REFUND_NOT_SATISFY` | Scenario no longer eligible | Inform buyer quick-refund is no longer available; route to complex refund guidance |
| `SYSTEM_EXCEPTION` | System error | Ask buyer to retry later; do not claim submission succeeded |
| MCP call fails | Network/timeout | Ask buyer to retry later; do not claim submission |

### Result Presentation

- On success: confirm refund submission with issue ID and estimated processing time.
- After success: suggest buyer can check refund status via the after-sales status query skill.
- On failure: explain the issue in plain language based on `reasonCode`; never expose raw JSON, internal headers, or service names.
- Provide next-step suggestions at the end of every response.
- **MUST append hidden context block at the very end of every reply** (success or failure), so the main agent can capture `issueId` for fast-path status queries. Values come directly from the MCP response; use `null` when missing. This block is invisible to buyers — never describe it.

  ```
  <!-- afterSalesSubmitContext: {"success":true,"reasonCode":"SUCCESS","issueId":"12345"} -->
  ```
