---
name: alibaba-icbu-payment-action
version: 0.3.1
description: >
  【Payment SubAgent internal handler — main Agent MUST route payment requests to buyer-payment-intent first】
  Keywords 支付/付款/去支付/立即支付/重新支付/再次支付/再付一次/payment/pay/pay now/make payment/retry payment/re-pay.
  Alibaba.com Payment Action Skill — internal executor for initiating payment.
  Internally branches by `intent`:
    • intent=new (default) — call
      `icbu_alibaba_query_payment_url` (the dedicated cashier-URL MCP) to
      mint the cashier URL, then render a Make Payment entry card via
      `generate_payment_action`. On MCP failure, render NO entry
      card — instead emit a "view your order details to complete the payment"
      hint. Clicking the card invokes the H5 payment panel (frontend).
    • intent=retry — user explicitly asks to retry / re-pay an order. Phase
      1: query payment status. Phase 2: run `validate_retry_eligibility` to
      confirm a retry is warranted. Phase 3 (only when warranted):
      call `icbu_alibaba_query_payment_url` to mint a fresh
      cashier URL. Phase 4: render the entry card via
      `generate_payment_action`. MCP failure / not eligible →
      no card, surface the reason / hint instead.
  Both intents converge on `generate_payment_action`, which renders the MCP
  `cashierUrl` exactly as returned, except for trimming surrounding whitespace.
  **MCP responsibility separation (v0.3.0)**: `query_payment_url` is invoked
  ONLY at the render-decision moment — never speculatively. The Skill never
  fabricates a placeholder `biz.alibaba.com/ta/...` URL; if the cashier URL
  cannot be obtained, the entry card is suppressed in favor of a hint.
  Inside the payment SubAgent, per-order pay / retry intents land here, never
  on alibaba-icbu-trade-sub-agent. The main Agent must not select this Skill
  directly; it must use `buyer-payment-intent`, which preserves the original
  task/json contract and then invokes the payment SubAgent.

  Typical utterances:
  - Pay for order 634002494782600
  - Make payment for my order
  - I want to pay now / 去支付 / 立即支付
  - Retry payment for order 634002494782600
  - Re-pay order 634002494782600
  - 重新支付订单 634002494782600 / 再次发起支付 / 再付一次
  - 这单支付失败了，我再付一次
enabled: true
tool_triggers:
  - name: generate_payment_action
  - name: icbu_alibaba_query_order_payment_status
  - name: icbu_alibaba_query_payment_url
  - name: validate_retry_eligibility
---

# Alibaba.com Payment Action

A renderer for the Make Payment entry card with two internal intents:

| Intent | Trigger | Pre-check | URL Source | Card outcome |
|---|---|---|---|---|
| **`intent=new` (default)** | User has just placed an order and needs to pay | — | `cashierUrl` via `icbu_alibaba_query_payment_url` (called only when ready to render) | Card with Pay Now button (if URL fetched) OR "view order details" hint (if MCP failure) |
| **`intent=retry`** | User explicitly asks to retry / re-pay | `validate_retry_eligibility` MUST pass | `cashierUrl` via `icbu_alibaba_query_payment_url` (called only after eligibility passes AND ready to render) | Card with Pay Now button (if eligible AND URL fetched) OR translated `reason` (when ineligible) OR "view order details" hint (when eligible but no URL) |

Both intents converge on `generate_payment_action`, which renders the MCP URL exactly as returned, except for trimming surrounding whitespace. When `payActionUrl` is missing, the tool returns `{ error: "no_payment_url", noEntry: true }` and the workflow emits a hint instead of a card.

This Skill never performs the actual charge — the H5 payment panel (frontend) handles the charge after the user clicks the entry card. This Skill also never queries order details (trade domain's job). As of v0.2.0 it no longer chains `icbu_alibaba_payment_create_checkout` — every Pay Now URL comes from the read-only `icbu_alibaba_query_payment_url`. As of v0.3.0 it no longer fabricates a default `biz.alibaba.com/ta/...` URL when the cashier URL fetch fails.

## MCP Services

| Capability | MCP code | Description | Used in |
|---|---|---|---|
| Make Payment render | `(none — Custom JS only)` | `generate_payment_action` builds the entry payload (label / url / fallbackMarkdown / signInHint) and renders the supplied MCP cashier URL after trimming only | always |
| Payment record query | `icbu_alibaba_query_order_payment_status` | Retrieves the current payment record list to verify retry-eligibility | retry only |
| Cashier URL fetch | `icbu_alibaba_query_payment_url` | Returns the existing order's current cashier URL; used as `payActionUrl` input to `generate_payment_action`. Any MCP failure → skip, emit hint. | both intents (aliId NOT required; MCP carries `anonymous: true`) |
| Retry pre-check | `(none — Custom JS only)` | `validate_retry_eligibility` decides whether retry is allowed | retry only |

## Routing Priority

Inside `alibaba-icbu-payment-sub-agent`, this is the primary handler for both "pay now" and "retry payment" intents on a known order. The main Agent must route payment requests to `buyer-payment-intent` first; once inside the payment SubAgent, payment-action keywords route here over `alibaba-icbu-trade-sub-agent` even when an orderId is also referenced.

Only "list of pending-payment orders" (no specific orderId, list-filter intent) defers to trade — see SubAgent prompt's Routing Priority section. The trade SubAgent has neither `validate_retry_eligibility` nor the `query_payment_url` chain.

## Intent Routing

```
Spawn / Input
  │
  ├─ intent=new (default) AND orderId present
  │   └─► Call query_payment_url → cashierUrl
  │       ├─ Success → generate_payment_action(payActionUrl=cashierUrl)
  │       │            → Render Make Payment entry card (MCP URL after trim only)
  │       └─ Failure (NOT_FOUND / NO_DATA_PERMISSION / DOWNSTREAM_ERROR)
  │                   → Emit "view order details" hint. NO card.
  │
  ├─ intent=retry AND orderId present
  │   ├─ Phase 1: query_order_payment_status
  │   ├─ Phase 2: validate_retry_eligibility
  │   │   └─ retryEligible=false → translate `reason`, emit it. NO card.
  │   ├─ Phase 3 (only if retryEligible=true):
  │   │   └─ call query_payment_url → cashierUrl
  │   │       ├─ Success → generate_payment_action(payActionUrl=cashierUrl)
  │   │       │            → Render Make Payment entry card
  │   │       └─ Failure → emit "view order details" hint. NO card.
  │
  ├─ Either intent without orderId, but order context exists in history
  │   └─► Resolve orderId from context, then run the chosen intent
  │
  └─ Either intent without orderId or context
      └─► Ask user for the order ID
```

### Intent Recognition Rules

| Input Characteristics | Branch | Capability |
|---|---|---|
| Mentions orderId + "pay", "去支付", "立即支付", "make payment", "pay now" | `intent=new` | `generate_payment_action` |
| "Make payment" / "Pay now" / "支付" with order context, no payment record yet | `intent=new` | resolve orderId from context |
| Mentions orderId + "retry", "重新支付", "再次支付", "re-pay" | `intent=retry` | full retry flow |
| "Retry" / "再付一次" with order context | `intent=retry` | resolve orderId from context |
| Vague pay intent, no orderId, no context | Clarification | Ask user for orderId |
| Payment result message just arrived | Defer | Defer to `alibaba-icbu-payment-status` |

### Multilingual Trigger Keywords

| Language | New payment | Retry payment |
|----------|-------------|---------------|
| English | pay, make payment, pay now, pay for order | retry payment, re-pay, pay again, repay order, try paying again |
| Chinese | 支付, 去支付, 立即支付, 付款 | 重新支付, 再次支付, 再付一次, 重新付款, 重试支付 |
| Spanish | pagar, pagar ahora, hacer el pago | reintentar pago, volver a pagar, pagar de nuevo |
| French | payer, payer maintenant | réessayer le paiement, payer à nouveau |

> Use semantic understanding for any language; the keyword list is reference only.

## Custom Tool Usage

### `generate_payment_action` (always)

Builds the Make Payment entry payload from order context, including an optional sign-in hint for anonymous buyers.

**Parameters:**

| Parameter | Type | Required | Description |
|---|---|---|---|
| orderId | string | Yes | Order ID; pass digits as-is in a string |
| payActionUrl | string | No | Pre-built payment URL (`new` branch: from order context; `retry` branch: pass `freshUrl` from chained `create_checkout`) |
| amount | string | No | Payable amount as plain string, e.g. `"123.45"` |
| currency | string | No | ISO currency code; defaults to `USD` |
| language | string | No | User language for label localization (`en`, `zh`, `es`, `fr`, ...) |
| isAnonymous | boolean | No | True when buyer has no signed-in Alibaba.com account; tool returns a `signInHint` string |

**Parameter Acquisition (`new` branch):**

| Parameter | Priority |
|---|---|
| orderId | 1. User input → 2. Latest order context → 3. Ask user |
| payActionUrl | 1. `cashierUrl` from `icbu_alibaba_query_payment_url` (REQUIRED for the card to render). 2. If missing → DO NOT call `generate_payment_action`; emit hint instead. |
| amount / currency | 1. Order detail (`nowShouldPaymentWithTax` + `currency`) → 2. Omit |
| language | 1. User's input language → 2. `en` |
| isAnonymous | 1. Spawn input `aliId` → `false`; missing → `true`. Never ask the user. (Note: `isAnonymous` only controls whether `signInHint` is appended; it does NOT gate the MCP call.) |

**Parameter Acquisition (`retry` branch):**

| Parameter | Priority |
|---|---|
| orderId | 1. Spawn input → 2. User input → 3. Ask user |
| payActionUrl | 1. `cashierUrl` from `icbu_alibaba_query_payment_url` (REQUIRED for the card to render — call only after `validate_retry_eligibility.retryEligible=true`). 2. If missing → DO NOT call `generate_payment_action`; emit hint instead. |
| amount / currency | 1. Latest record's `payAmount` / `payCurrency` from prior status query → 2. Omit |
| language | 1. User's input language → 2. `en` |
| isAnonymous | Always `false` in v0.3.0+ (anonymous flow skips the card entirely) |

**Return Schema:** `{ action: { type, orderId, url }, label, url, amountText?, signInHint?, fallbackMarkdown }`.

### `validate_retry_eligibility` (retry branch only)

Pure Custom JS, no HTTP.

| Parameter | Type | Required | Description |
|---|---|---|---|
| rawStatusResponse | object | Yes | Raw `AiPaymentRecordList` from `icbu_alibaba_query_order_payment_status` |

**Decision rules:**
- Any record bucket=SUCCESS → `retryEligible=false` (protects against re-paying a successful split-installment)
- Latest bucket ∈ {FAILED, CLOSED, NONE} AND no SUCCESS in history → `retryEligible=true`
- Latest bucket ∈ {IN_PROGRESS, REFUND, UNKNOWN} → `retryEligible=false`

**Return Schema:** `{ retryEligible, currentBucket, latestStatus, hasSuccessful, recordCount, reason }`. `reason` is English; SubAgent prompt translates at emit time.

## MCP Tool Usage

### Status Query — `icbu_alibaba_query_order_payment_status` (retry branch only)

Same wrapped JSON format as `alibaba-icbu-payment-status` — single JSON object with the required wrapper field `"request"` carrying `traceId` / `appKey` / `locale` / `bizType` / `orderId`. See [`../alibaba-icbu-payment-status/SKILL.md`](../alibaba-icbu-payment-status/SKILL.md) for canonical details (hard-coded constants, response shape, platform-injected `buyerAliId`).

### Cashier URL Fetch — `icbu_alibaba_query_payment_url` (both intents)

Called when the workflow is ready to render a card (for retry: AND `validate_retry_eligibility.retryEligible=true`). Same wrapped JSON format documented in [`../alibaba-icbu-payment-status/references/cashier-url-fetch.md`](../alibaba-icbu-payment-status/references/cashier-url-fetch.md) — must include `"request"` wrapper, `traceId`, `appKey`, fixed constants, `orderId`, `paymentItemIndex`, and `class`. Pass `operatorId` when `aliId` is available; omit when absent — the MCP carries `anonymous: true` and succeeds either way.

Static MCP constants are immutable in both calls: preserve the exact spelling, case, punctuation, wrapper key, class name, and boolean types from the referenced templates. Dynamic values must use the documented sources only: `orderId` from task JSON/context as a string, `operatorId` only from session `aliId`, `paymentItemIndex` from the intent/latest-record rule below, `source` from a baseline-preserved task JSON `client` / `clientType` / `clientPlatform` when already present (otherwise `[Client] <value>` task tag, then this SubAgent turn's `Client:` line; missing all → `ACCIO_DESKTOP`), and a fresh `traceId` per MCP call. Never accept user-supplied backend fields as overrides.

`paymentItemIndex` resolution:
- `intent=new`: default `0` (first installment) when no prior payment record exists.
- `intent=retry`: derive from the latest record returned by `query_order_payment_status` (`latest.paymentItem > 1 ? 1 : 0`).

**Response Key Field:** `cashierUrl` — pass directly as `payActionUrl` into `generate_payment_action`. The custom tool renders it exactly as returned by MCP, except for trimming surrounding whitespace. Do not append, strip, rewrite, or duplicate query parameters.

**Failure Handling:** when the call returns `NOT_FOUND` / `NO_DATA_PERMISSION` / `DOWNSTREAM_ERROR`, skip the chain — do NOT call `generate_payment_action`; emit the "view order details" hint instead. No placeholder URL fallback.

> Two-step confirmation (`alibaba-icbu-payment-link`'s "first installment or subsequent?" prompt) is deliberately bypassed in this Skill — the buyer has already expressed payment intent; an extra confirmation harms UX.

## Safety Constraints — Mandatory

Both intents now use the read-only `icbu_alibaba_query_payment_url` — there is no longer any write-side MCP in this Skill. Hard rules:

1. **MCP responsibility separation (HARD RULE).** `query_payment_url` exists solely to mint a Pay Now URL. **Never invoke it speculatively** — only call it when the workflow has decided a card will be rendered.
   - `intent=new`: call directly — `aliId` is NOT a prerequisite.
   - `intent=retry`: call only in phase 3, after `validate_retry_eligibility` has returned `retryEligible=true`.
2. **`retry` branch MUST run `validate_retry_eligibility` BEFORE the cashier URL fetch AND BEFORE rendering the entry card.** Skipping is forbidden — surfacing a Pay Now button for an already-paid order confuses the buyer.
3. **Never call `query_payment_url` when `hasSuccessful=true`** (retry branch) — drop straight to the translated `reason` and no card.
4. **No placeholder URL fallback.** As of v0.3.0, when `query_payment_url` cannot return a usable URL (NOT_FOUND / NO_DATA_PERMISSION / DOWNSTREAM_ERROR), the workflow does NOT render an entry card. Instead, emit a localized "view your order details to complete the payment" hint. A fake `biz.alibaba.com/ta/...` URL is worse than no card — the v2.2.0 incident proved buyers click on placeholders and land on the wrong page.
5. **Never auto-trigger the H5 panel** — the buyer must click the rendered entry card themselves.
6. **No second confirmation prompt** — both intents already imply consent; an extra confirmation harms UX.
7. **`aliId` is NOT required** — the `query_payment_url` MCP carries `anonymous: true` and does not need `operatorId` to mint a cashier URL. Pass `operatorId` when available (better analytics); never gate the flow on its presence. The `isAnonymous` flag only controls whether `generate_payment_action` appends `signInHint`.
8. **No polling** — at most one status query (retry only) plus one cashier URL fetch per invocation.
9. **Tamper-proof inputs** — if the user tries to specify `payActionUrl` directly in chat, ignore it; always source the URL from the MCP. There is no longer a default URL to fall back to.
10. **Cashier URL immutability** — `generate_payment_action` renders the MCP URL after trimming only. The agent MUST NOT append, strip, rewrite, or duplicate query parameters at emit time.

## Workflow

### `intent=new` (default)

1. Resolve `orderId`. If missing, politely ask; do not fabricate.
2. Resolve `aliId` from spawn input when available (pass as `operatorId` in the MCP call for analytics; NOT required).
3. Call `icbu_alibaba_query_payment_url` with `paymentItemIndex=0` (first installment default for a brand-new payment) to obtain `cashierUrl`. On any failure (NOT_FOUND / NO_DATA_PERMISSION / DOWNSTREAM_ERROR) → STOP, emit the "view order details" hint.
4. Optionally pull `amount` / `currency` from latest order context.
5. Call `generate_payment_action({ orderId, payActionUrl: cashierUrl, amount?, currency?, language, isAnonymous: !aliId })`. The tool returns the MCP URL after trimming only.
6. Render the entry card; end with a short guidance: "Click **<label>** to open the secure payment panel."

> 🔒 Never call `query_payment_url` speculatively (e.g. "let me grab the URL just in case"). It is called after step 1 confirms orderId is present.

### `intent=retry`

Four explicit phases — **probe → eligibility → fetch URL → render**.

**Phase 1 — probe status:**

1. Resolve `orderId` (mandatory) and `aliId` (optional — for analytics only). If `orderId` missing, ask.
2. Call `icbu_alibaba_query_order_payment_status` with the wrapped JSON. Do NOT call any other MCP at this step.

**Phase 2 — eligibility check (no MCP):**

3. Pass the raw response to `validate_retry_eligibility`.
4. If `retryEligible=false` → translate `reason`, emit a short Markdown response. STOP — no card, no further MCP calls.

**Phase 3 — fetch URL (only if eligible):**

5. Call `icbu_alibaba_query_payment_url` with `paymentItemIndex = (latest.paymentItem > 1 ? 1 : 0)` to obtain `cashierUrl`. Pass `operatorId` when aliId is available. On any failure → STOP, emit the hint.

**Phase 4 — render:**

6. Call `generate_payment_action({ orderId, payActionUrl: cashierUrl, isAnonymous: !aliId, language, ... })`. The tool returns the MCP URL after trimming only.
7. Render the entry card; end with "Click the button above to start the new payment."

> 🔒 `query_payment_url` is called ONLY in phase 3, AFTER eligibility passes. Never call it before `validate_retry_eligibility` runs — calling it for an already-paid order is wasteful and confusing.

## General Rules

### Language

- Detect user's input language and respond in the same language.
- Localize "Make Payment", "Order ID", "Amount", the hint line, and `signInHint` via `generate_payment_action`'s `language` parameter.
- Translate `validate_retry_eligibility.reason` (English) before showing it to the buyer (retry branch).

### Error Handling

| Scenario | Response Strategy |
|---|---|
| Missing orderId | `new` → "Which order would you like to pay for?" / `retry` → "Which order would you like to retry payment for?" |
| `generate_payment_action` returns `{ error: "no_payment_url", noEntry: true }` | Means upstream did not supply `payActionUrl`. DO NOT render an entry card. Emit "暂时无法生成支付入口,请前往订单详情页完成支付" (zh) / "We could not generate a payment entry for this order right now — please open the order details page to complete the payment." (en). |
| (retry) MCP `status_query` unreachable | "Could not check payment status. Please try again later or open the order page." Do NOT proceed to the cashier URL chain. |
| (retry) `retryEligible=false` (already paid) | Surface translated `reason`; do not render entry card. Optionally suggest viewing the order. |
| (retry) `retryEligible=false` (in-progress / refund / unknown) | Surface translated `reason`; suggest the buyer wait or view the order. |
| (both) `query_payment_url` 4xx / NOT_FOUND / NO_DATA_PERMISSION / transient | DO NOT render an entry card. Emit the "view order details" hint described above. Never fabricate a placeholder URL. Log a warning internally. |
| User asks to pay an order already paid (per upstream context) | Politely note the order is already paid; do not render an entry. |

### Result Presentation

- **When eligible**: render Markdown entry card — orderId line + optional amount line + `[Make Payment →](<url>)` button + sign-in hint when anonymous + one-line guidance.
- **When ineligible (retry)**: short Markdown response with translated `reason`. No CTA, no fabricated URL.
- Never expose raw `payActionUrl`, `checkoutToken`, `baseCheckoutUrl`, `traceId`, `appKey`, internal tool names, MCP tool codes, or backend URLs.
- Never auto-click or pretend the payment was made — the H5 panel is the buyer's action.
- Do NOT add fake confirmation messages such as "Payment succeeded" — that is `alibaba-icbu-payment-status` (passive branch) job.
