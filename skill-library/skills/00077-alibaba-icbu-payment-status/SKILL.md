---
name: alibaba-icbu-payment-status
version: 0.5.8
description: >
  【Payment SubAgent internal handler — main Agent MUST route payment requests to buyer-payment-intent first】
  Keywords 支付状态/支付结果/支付了吗/支付历史/支付记录/payment status/payment result/has it been paid/payment history.
  Alibaba.com Payment Status Skill — internal executor for payment-status reads.
  Internally branches by `source`:
    • source=h5_closed (passive) — the task assembled by
      `buyer-payment-intent` carries this source after the H5 panel closes;
      query `icbu_alibaba_query_order_payment_status`, drop records whose
      `paymentMethod=PROMOTION_PAYMENT`, sort the remaining records[] by payTime
      DESC, apply 7-bucket map, decide whether a Pay Now CTA is warranted
      (retry-eligible bucket AND no historical SUCCESS). ONLY when warranted,
      fetch the cashier URL via `icbu_alibaba_query_payment_url` — that MCP
      carries `anonymous: true` and does NOT require aliId. It exists solely
      to mint Pay Now URLs and must not be invoked speculatively. If
      the fetch succeeds, the JSON follow-up carries a `Pay Now` CTA in
      `ctaList[]` whose URL is the MCP `cashierUrl` after trimming only. If
      the fetch fails or the conditions are not met, `ctaList[]` stays empty
      and the utterance ends with a "view your order details" hint — no
      placeholder URL is ever fabricated.
    • source=user_inquiry (active, default) — buyer asks "is order X paid? /
      show payment info", render a user-facing Markdown card with the
      latest payment-result summary + contextual tip only. Do not display
      historical payment-attempt records or payment method to the buyer.
      Amount display prefers `amount` + `currency`, falling back to
      `payAmount` + `payCurrency` only when `amount` is missing. After
      classifying the latest bucket, decide whether a Pay Now button is
      warranted (retry-eligible AND no historical SUCCESS).
      ONLY when warranted, fetch the cashier URL via
      `icbu_alibaba_query_payment_url` and pass it as `payNowUrl` into
      `render_payment_status_card`. On success the card ends with
      `[💳 立即支付](cashierUrl)` using the MCP URL after trimming only. On fetch failure /
      non-warranted, the card ends with a localized "view order
      details" hint line instead — no fake button.
    • text fallback — when MCP is unreachable / no orderId, downgrade to
      `parse_payment_result` text classification.
  Inside the payment SubAgent, per-order payment-status queries land here,
  never on alibaba-icbu-trade-sub-agent (which has no `AiPaymentRecordList`).
  The main Agent must not select this Skill directly; it must use
  `buyer-payment-intent`, which preserves the original task/json contract and
  then invokes the payment SubAgent.

  Typical utterances:
  - (Task JSON) orderId=634002494782600 after h5 closed
  - What's the payment status of order 634002494782600?
  - Has my order 634002494782600 been paid?
  - 这单付了吗
  - 查询订单 634002494782600 的支付状态
  - 支付历史
  - 支付成功 / 支付失败 (raw H5 text fallback)
enabled: true
tool_triggers:
  - name: icbu_alibaba_query_order_payment_status
  - name: icbu_alibaba_query_payment_url
  - name: icbu_alibaba_query_payment_error_code
  - name: build_payment_followup
  - name: render_payment_status_card
  - name: parse_payment_result
---

# Alibaba.com Payment Status

A read-only status-query Skill with three internal branches:

| Branch | Trigger | Output |
|---|---|---|
| **Passive (`source=h5_closed`)** | Task JSON assembled by `buyer-payment-intent` contains `source=h5_closed` after the H5 panel closes | Structured JSON event (`{ event, utterance, ctaList[], analytics, suggestSpawn, retryHint }`) for the main Agent to decide whether to surface. Retry-eligible buckets MAY carry a `Pay Now` CTA whose URL comes from `query_payment_url`, called ONLY after the bucketize step decides a CTA is warranted. On fetch failure, `ctaList[]` is empty and the utterance ends with a "view your order details" hint. The CTA URL is the MCP `cashierUrl` after trimming only. |
| **Active (`source=user_inquiry`)** | Buyer asks about payment status / history | User-facing Markdown card (latest payment-result summary + contextual tip only; no historical payment-attempt list). When the latest bucket is retry-eligible AND no historical SUCCESS, the workflow calls `query_payment_url` AFTER bucketize, then renders the card with the resulting cashierUrl as a `[💳 立即支付](cashierUrl)` button after trimming only. On fetch failure, the card ends with a localized hint line instead of a button. |
| **Text fallback** | No orderId / MCP unreachable / raw H5 text only | Markdown body via `parse_payment_result` + Next Steps |

This Skill never queries order details (trade domain's job) and never charges the buyer. **`query_payment_url` is invoked solely to mint a Pay Now URL right before rendering** — never speculatively as a side-effect of the status query. The two MCPs have strictly separated responsibilities:
- `icbu_alibaba_query_order_payment_status` — reads `AiPaymentRecordList`. Status data only.
- `icbu_alibaba_query_payment_url` — mints the cashier URL for a Pay Now button. Called only after the workflow has decided the buyer needs that button.

If `query_payment_url` cannot return a usable URL (NOT_FOUND, NO_DATA_PERMISSION, DOWNSTREAM_ERROR), the rendering tools omit the button and emit a "view order details to complete payment" hint — a fake placeholder URL is worse than no entry. `create_checkout` is no longer used by this Skill (v0.3.0). `aliId` is NOT a prerequisite for calling `query_payment_url` — the request carries `anonymous: true` and the backend mints a URL regardless.

**Promotion-payment privacy rule:** if the status MCP returns records with `paymentMethod=PROMOTION_PAYMENT`, treat them as internal promotion-offset records. Filter them out before latest-record selection, internal history checks, retry eligibility, and analytics. Never surface the method, amount, account tail, raw status, or count of those hidden records to the buyer.

**Active-result-only rule:** active status output shows only the latest visible payment result and must not show payment method. Historical payment attempts may be used internally to protect retry decisions (for example, "no historical SUCCESS") but must not be rendered as a buyer-facing Payment History / 支付历史 section. Exception: when visible records contain both `paymentItem=0` and `paymentItem=1`, treat the order as an installment payment and render a two-row installment summary: `paymentItem=0` = first payment / 首款, `paymentItem=1` = final payment / 尾款.

**Amount display rule:** for buyer-facing status output, format payment amount from `amount` + `currency` first. If `amount` is absent/empty, fall back to `payAmount` + `payCurrency`. Preserve the numeric string exactly and render currency first, e.g. `USD 123.45`.

**Payment-time display rule:** when `payTime` is rendered in the active status card, keep the existing US Pacific conversion rule but display only `YYYY-MM-DD HH:mm`, e.g. `2026-06-16 08:30`. Do not expose timezone words or abbreviations such as PDT/PST/美西, and do not display the raw UTC/ISO timestamp to the buyer.

## MCP Services

| Capability | MCP code | Description | Invocation rule |
|---|---|---|---|
| Payment record query | `icbu_alibaba_query_order_payment_status` | Returns `AiPaymentRecordList { orderId, records[] }`; `PROMOTION_PAYMENT` records are hidden, remaining records are sorted by `payTime` DESC. | Always (every spawn that has an orderId) |
| Cashier URL fetch | `icbu_alibaba_query_payment_url` | Returns the order's current cashier URL — the only purpose of this MCP is to feed a Pay Now button. | **ONLY after** the workflow has bucketized the status response AND decided a Pay Now button is warranted (retry-eligible bucket OR `IN_PROGRESS` sub-state `challenge`, AND no historical SUCCESS). `aliId` is NOT required — the request carries `anonymous: true`. Never chained as an automatic follow-up to the status query. |
| Failure-reason lookup | `icbu_alibaba_query_payment_error_code` | Maps the latest record's `errorCode` to buyer/seller/internal copy. The buyer-facing field `userFullDesc` is column E ("对 buyer 服务话术") of the Yuque error-code table. | **ONLY after** the latest bucket is `FAILED` AND `errorCode` is non-empty. Result is passed downstream as `errorBuyerCopy` so the followup utterance is actionable instead of generic. |
| Followup build | `(none — Custom JS only)` | `build_payment_followup` applies the per-record status bucket map (incl. IN_PROGRESS sub-state x method-group matrix from Yuque AW下单支付动线 v530) and emits the JSON event. When `freshUrl` is supplied, embeds the MCP URL after trimming only in `ctaList[0].url`; when `errorBuyerCopy` is supplied, appends it to `utterance`; when omitted on a retry-eligible bucket, leaves `ctaList[]` empty and appends a "view order details" hint to `utterance`. | Always |
| Status card render | `(none — Custom JS only)` | `render_payment_status_card` builds the user-facing Markdown card; sub-state aware (ACH "clearing through bank" / card "authorized, waiting to settle" / payment_ref "continue or switch" / T/T "complete offline transfer"). | Always |
| Text fallback | `(none — Custom JS only)` | `parse_payment_result` (legacy 6-class classifier). | Only when MCP unreachable / no orderId |

## Routing Priority

Inside `alibaba-icbu-payment-sub-agent`, this is the primary handler for **all per-order payment-status reads**. The main Agent must route payment requests to `buyer-payment-intent` first; once inside the payment SubAgent, payment-status keywords route here over `alibaba-icbu-trade-sub-agent` because trade returns order summaries with a `goto_pay` action but never returns `AiPaymentRecordList`, and lacks the per-record status bucket map.

Even when the buyer references an orderId or asks for "order details", the payment portion of the question lands on this Skill (the trade order-detail card and this status card may co-exist in one turn). See the SubAgent prompt's `Entry Rule — MUST READ` section.

## Intent Routing

```
Task JSON / Input
  │
  ├─ source=h5_closed AND orderId present
  │   └─► PASSIVE branch:
  │       phase 1: status query → bucketize
  │       phase 2: decide wantPayNowCta = (retry-eligible AND no historical SUCCESS)
  │       phase 3 (only if wantPayNowCta): query_payment_url → cashierUrl
  │       → build_payment_followup({ ..., freshUrl: cashierUrl? })
  │       → emit JSON event (Pay Now CTA if URL was minted; else hint in utterance)
  │
  ├─ User asks about payment status / history AND orderId present (default source=user_inquiry)
  │   └─► ACTIVE branch:
  │       phase 1: status query → bucketize
  │       phase 2: decide wantPayNowButton = (retry-eligible AND no historical SUCCESS)
  │       phase 3 (only if wantPayNowButton): query_payment_url → cashierUrl
  │       → render_payment_status_card({ ..., payNowUrl: cashierUrl? })
  │       → card with Pay Now button (if URL minted) OR with "view order details" hint
  │
  ├─ Raw free-form payment result text (no orderId / MCP unreachable)
  │   └─► TEXT FALLBACK: parse_payment_result → Markdown body + Next Steps
  │
  └─ Neither orderId nor result text
      └─► Ask user for the order ID, or hand back to `buyer-payment-intent`
```

### Intent Recognition Rules

| Input Characteristics | Branch | Capability |
|---|---|---|
| `{ orderId, aliId?, source=h5_closed }` in task JSON assembled by `buyer-payment-intent` | Passive | status MCP + (optional) cashier-URL MCP + (optional, FAILED only) error-code MCP + `build_payment_followup` |
| User asks "check payment status / 支付了吗 / 支付历史" + orderId | Active | status MCP + (optional) cashier-URL MCP + `render_payment_status_card` |
| Free-form "Payment succeeded / 支付失败" without orderId | Text fallback | `parse_payment_result` |
| Free-form text with embedded orderId | Prefer Active (extract orderId), text fallback if MCP unreachable | both |

### Multilingual Trigger Keywords

| Language | Trigger Keywords |
|----------|------------------|
| English | payment status, payment result, has it been paid, paid?, payment history, payment attempts, payment succeeded, payment failed, declined, cancelled, pending, processing |
| Chinese | 支付状态, 支付结果, 支付了吗, 已支付, 付款状态, 支付历史, 支付记录, 所有支付尝试, 支付成功, 支付失败, 已取消, 处理中 |
| Spanish | estado del pago, está pagado, historial de pago, pago exitoso, pago fallido |
| French | statut du paiement, est-ce payé, historique de paiement, paiement réussi, paiement échoué |

> Use semantic understanding for any language; the keyword list is reference only.

## MCP Tool Usage

### Status Query — `icbu_alibaba_query_order_payment_status`

Before calling, run `accio-mcp-cli search icbu_alibaba_query_order_payment_status` to confirm the tool exists. Do **not** let the searched schema strip required fields from the final call.

**Mandatory MCP call format (single JSON object with the required wrapper field `"request"`):**

```bash
accio-mcp-cli call icbu_alibaba_query_order_payment_status --json '{
  "request": {
    "traceId": "<generatedUniqueTraceId>",
    "appKey": "6b8fe7ddedaddc53",
    "locale": "en_us",
    "bizType": "ICBU_TRADE",
    "orderId": "<context.orderId>",
    "class": "com.alibaba.intl.fund.operation.aifacade.api.payment.request.AiPaymentRecordRequest"
  }
}'
```

**Do not simplify this command.** `traceId` / `appKey` / `locale` / `class` must appear literally inside the wrapper even after `accio-mcp-cli search` — they are not auto-injected.

**Do not pass traceId placeholders or expressions literally.** Generate a concrete unique traceId before each MCP call and put that value directly in `"traceId"`. The actual MCP request must contain a concrete string (for example `payment_1749600000123_ab12cd34`), never placeholder text, shell expressions, variable names, or timestamp expressions. Validate before sending: `traceId` must not contain `<`, `>`, `generated`, `TRACE`, `$`, `Date`, or whitespace, and it must not equal any traceId already used in this SubAgent turn.

**Static parameter invariants (do not normalize or localize):** the fixed values in the status MCP request are byte-for-byte constants from `feature/payment`. Keep `appKey="6b8fe7ddedaddc53"`, `locale="en_us"` (lowercase), `bizType="ICBU_TRADE"` (uppercase with underscore), and `class="com.alibaba.intl.fund.operation.aifacade.api.payment.request.AiPaymentRecordRequest"` exactly as shown. Do not change case, translate, derive them from user language, or replace them with values from search output / user text.

**Dynamic parameter invariants:** `orderId` must be the spawn/context/user order id as a string, copied verbatim without numeric parsing, trimming internal digits, or substituting another recent order. `traceId` must be generated per MCP call from the live session id + current timestamp + random suffix. `buyerAliId` is server-injected and must not be sent by the agent.

**Parameter Acquisition Strategy:**

| Parameter | Source |
|---|---|
| `traceId` | Generate a new concrete value immediately before each MCP call, e.g. `payment_<currentTimeMillis>_<8-char-random>`. Treat it like `orderId`: replace the placeholder before calling MCP. Never reuse a previous traceId and never send the placeholder or variable name literally. |
| `appKey` | **Hard-coded constant `6b8fe7ddedaddc53`.** Not configurable at runtime. |
| `locale` | **Hard-coded constant `en_us`** (lowercase). Not configurable at runtime. |
| `bizType` | **Hard-coded constant `ICBU_TRADE`**. |
| `orderId` | From task JSON / conversation history / user input. If missing, ask the user — never invent. |
| `class` | **Hard-coded constant `com.alibaba.intl.fund.operation.aifacade.api.payment.request.AiPaymentRecordRequest`**, aligned with `feature/payment`. |

> `buyerAliId` is **platform-injected** server-side from the caller's authorization — never set it in the request; the facade re-validates ownership via `DataAuthGuard.requireBuyerMatch`.

**Response Shape (whitelist):**

| Field | Description |
|---|---|
| `orderId` | Echo of request orderId |
| `records[]` | Payment record list, sorted by `payTime` DESC. Empty array = order has never initiated a payment. |

Per-record (`AiPaymentRecord`):

| Field | Description |
|---|---|
| `amount` | Preferred BigDecimal for buyer-facing amount display; render as raw string to preserve precision |
| `currency` | Preferred ISO-4217 currency code for buyer-facing amount display |
| `payAmount` | Fallback BigDecimal when `amount` is absent/empty; render as raw string to preserve precision |
| `payCurrency` | Fallback ISO-4217 currency code when `currency` is absent/empty |
| `paymentMethod` | One of `CREDIT_CARD` / `PAYPAL` / `BOLETO` / `APPLE_PAY` / `GOOGLE_PAY` / `WIRE_TRANSFER` / `OTHER`; hide `PROMOTION_PAYMENT` as backend-only promotion offset |
| `accountTail` | Masked account suffix (e.g. `6225********1234`); already redacted by facade |
| `status` | Granular per-record status |
| `payTime` | Unix milliseconds; may be null when in-flight. Active status cards apply the existing US Pacific conversion rule but render only `YYYY-MM-DD HH:mm` without timezone words or abbreviations. |
| `paymentItem` | Split/installment marker. In active status cards, if visible records contain both `paymentItem=0` and `paymentItem=1`, render them as installment first payment / final payment. |
| `fxNote` | Cross-currency note; null when same currency |

Before latest selection, internal history checks, retry eligibility, analytics, or result-detail context, remove records whose `paymentMethod=PROMOTION_PAYMENT`. If all records are hidden, treat the visible list as empty (`NONE` bucket). Never mention the hidden method, amount, account tail, raw status, time, or count.

**Granular `status` → 7-bucket display merge:** see [`references/lifecycle-status-map.md`](references/lifecycle-status-map.md) for the full table (raw → bucket → sub-state → badge → utterance template + CTA rules). Buckets: `SUCCESS` ✅ / `IN_PROGRESS` ⏳ / `FAILED` ❌ / `CLOSED` ⌛ / `REFUND` ↩️ / `NONE` — / `UNKNOWN` ❓.

**`IN_PROGRESS` is split into 3 sub-states (Yuque AW下单支付动线 v530):**
- `authorized` (raw `AUTHORIZED` / `CAPTURING`) — buyer succeeded on cashier; informational, no buyer action, NOT retry-eligible.
- `processing` (raw `CLEARING` / `RECEIPT`) — back-end clearing (e.g. ACH bank-debit window); same UX as `authorized`.
- `challenge` (raw `PAYING` / `CHALLENGING` / `WAITING`) — buyer left the cashier without finishing; **retry-eligible**, surface a Pay-Now CTA.

The utterance for `IN_PROGRESS` is method-group-aware (card / ACH / online_bank / payment_ref / T/T) — see the matrix in `lifecycle-status-map.md`.

### Failure-reason lookup (FAILED bucket only) — `icbu_alibaba_query_payment_error_code`

When `latestBucket = FAILED` AND the latest visible record carries a non-empty `errorCode`, chain this MCP to obtain the buyer-facing error copy from the Yuque [支付失败原因（映射后）](https://aliyuque.antfin.com/chaixi.cx/glr2x7/mebqggggkn454qlf) table.

**Mandatory call format (single JSON object with the required wrapper field `"request"`):**

```bash
accio-mcp-cli call icbu_alibaba_query_payment_error_code --json '{
  "request": {
    "traceId": "<generatedUniqueTraceId>",
    "appKey": "6b8fe7ddedaddc53",
    "locale": "en_us",
    "bizType": "ICBU_TRADE",
    "errorCode": "<latest.errorCode>",
    "class": "com.alibaba.intl.fund.operation.aifacade.api.payment.request.AiPaymentErrorCodeQueryRequest"
  }
}' --raw
```

**Static parameter invariants:** `appKey="6b8fe7ddedaddc53"`, `locale="en_us"`, `bizType="ICBU_TRADE"`, and `class="com.alibaba.intl.fund.operation.aifacade.api.payment.request.AiPaymentErrorCodeQueryRequest"` are byte-for-byte constants. Do not change case, localize, shorten package names, or replace them with searched schema aliases.

**Dynamic parameter invariants:** `traceId` is generated exactly like the status-query traceId and must be a concrete unique value before the MCP call. `errorCode` is copied verbatim from the latest FAILED visible record; never guess, normalize case, or paraphrase it.

**Response field of interest:**

| Field | Yuque column | Use |
|---|---|---|
| `userBaseDesc` | D — 页面对客展示文案 | Short toast headline (already shown on the cashier H5) |
| `userFullDesc` | E — **对 buyer 服务话术** | **Pass to `build_payment_followup` as `errorBuyerCopy`.** This is the actionable buyer message Yuque mandates we surface back to the user when they close the H5 after failure. |
| `sellerFullDesc` | F | Not used by this Skill (seller-facing). |
| `internalFullDesc` | G | Not used by this Skill (internal). |

**Failure handling:** If the MCP fails, the unknown error code is missing from the table, or `userFullDesc` comes back empty, omit `errorBuyerCopy` — the followup utterance falls back to the generic FAILED text. Never block on this lookup.

### Cashier URL Fetch (phase 3 only) — `icbu_alibaba_query_payment_url`

Invoked exclusively in phase 3 of either branch, AFTER the bucketize-and-decide step has confirmed a Pay Now CTA/button is warranted. **Never invoke this MCP as an automatic follow-up to the status query** — that violates MCP responsibility separation (cashier URL MCP exists solely to feed Pay Now buttons; bringing it into every status read wastes calls and ties two independent concerns together).

Trigger condition recap:
- Passive: `latestBucket ∈ {FAILED, CLOSED, NONE}` OR `(latestBucket = IN_PROGRESS AND subState = challenge)`, AND no historical SUCCESS
- Active: same

> `aliId` is **not** a prerequisite. The request carries `"anonymous": true`; the backend mints a cashier URL regardless of whether `operatorId` is supplied.

**Full call format, parameter acquisition, response shape, and failure handling are documented in [`references/cashier-url-fetch.md`](references/cashier-url-fetch.md)** — must use the `"request"` wrapper verbatim. `paymentItemIndex`: `latest.paymentItem > 1 ? 1 : 0` for FAILED/CLOSED, `0` for NONE (`records[]` empty after filtering). Never ask the user.

For the cashier URL MCP, static fields (`appKey`, `bizType`, `nyseBizType`, `bizKey`, `mergePay`, `anonymous`, `operationSource`, `properties.source`, `class`) must remain byte-for-byte identical to the template in `cashier-url-fetch.md`. Dynamic fields must be sourced only as documented there: same `orderId` as the status query, derived `paymentItemIndex`, optional session `aliId` as `operatorId`, `source` from a baseline-preserved task JSON `client` / `clientType` / `clientPlatform` when already present (otherwise `[Client] <value>` task tag, then this SubAgent turn's `Client:` line; missing all → `ACCIO_DESKTOP`), and a fresh `traceId`.

The returned `cashierUrl` is passed downstream as `freshUrl` (passive → `build_payment_followup`) or `payNowUrl` (active → `render_payment_status_card`). Those JS tools render the MCP URL exactly as returned, except for trimming surrounding whitespace. The agent must not manipulate the URL manually.

**Failure → hint, never placeholder.** On NOT_FOUND / NO_DATA_PERMISSION / DOWNSTREAM_ERROR, pass an undefined `freshUrl` / `payNowUrl` to the downstream JS tool — it will skip the button and emit a localized "view order details to complete payment" hint instead. The placeholder `biz.alibaba.com/ta/order/payment.htm` URL has been removed (v0.4.0).

### Card Render (active branch) — `render_payment_status_card`

Pure Custom JS, no HTTP. Produces a Markdown card surfaced to the buyer, including the optional `Pay Now` button when retry-eligible.

| Parameter | Type | Required | Description |
|---|---|---|---|
| rawStatusResponse | object | Yes | Raw `AiPaymentRecordList` from MCP; the tool hides `PROMOTION_PAYMENT` records before latest-result rendering and internal retry/history checks |
| orderId | string | Yes | Order id (kept verbatim in title) |
| language | string | No | `en` / `zh` native; other → English fallback (SubAgent re-translates) |
| payNowUrl | string | No | `cashierUrl` from the chained `icbu_alibaba_query_payment_url` call. When undefined on a retry-eligible bucket, the tool renders a localized "view order details" hint. No placeholder URL is fabricated. |

**Return Schema:** `{ markdown, latestStatus, latestBucket, recordCount, hasRetryEligible, hasSuccessfulRecord, payNowUrl }`. `payNowUrl` echoes the real URL actually embedded in the card, or `null` when no real URL was supplied / `hasRetryEligible=false`.

The active card never renders a Payment History / 支付历史 section and never shows a payment-method column/value. It may return `recordCount` for analytics/debugging, but the buyer-facing Markdown shows only the latest visible payment result and tip. Installment exception: if visible records include both `paymentItem=0` and `paymentItem=1`, render a compact installment summary with `paymentItem=0` labeled first payment / 首款 and `paymentItem=1` labeled final payment / 尾款. Amount display uses `amount`/`currency` first and falls back to `payAmount`/`payCurrency`. The Time column applies the existing US Pacific conversion rule but omits timezone labels.

### Followup Build (passive branch) — `build_payment_followup`

Pure Custom JS. After a successful MCP response (and optional chained `query_payment_url` and `query_payment_error_code`), call:

```
build_payment_followup({ rawStatusResponse, source, orderId, freshUrl, errorBuyerCopy })
```

| Argument | Required | Description |
|---|---|---|
| `rawStatusResponse` | Yes | The `AiPaymentRecordList` from `icbu_alibaba_query_order_payment_status`; the tool hides `PROMOTION_PAYMENT` records before latest selection and analytics. |
| `source` | Yes | `h5_closed` / `user_inquiry` / `session_resume`. |
| `orderId` | Yes | Order id from task JSON / MCP response. |
| `freshUrl` | No | `cashierUrl` from the chained `icbu_alibaba_query_payment_url` call. Omitted on non-retry buckets / fetch failure — the tool will append a "view order details" hint instead of a CTA. |
| `errorBuyerCopy` | No | `userFullDesc` from the chained `icbu_alibaba_query_payment_error_code` call (FAILED bucket only). Appended verbatim to `utterance`. |

Returns `{ event, utterance, ctaList[], analytics, suggestSpawn, retryHint }` — all text in English; the SubAgent prompt translates `utterance` / `ctaList[].label` at emit time.

### Text Fallback — `parse_payment_result`

Used only when neither orderId nor MCP response is available.

```
parse_payment_result({ message, orderId?, language })
```

Returns `{ status, orderId?, errorCode?, errorMsg?, summaryMarkdown }`. en/zh dictionary built-in.

## Workflow

### Passive branch (`source=h5_closed`)

Three explicit phases — **probe → decide → fetch+render**. The cashier URL MCP and the failure-reason MCP are invoked only in phase 3.

**Phase 1 — probe state (`query_order_payment_status` only):**

1. Resolve `orderId` (mandatory), `aliId` (optional), `source=h5_closed` from task JSON.
2. Call `icbu_alibaba_query_order_payment_status` with the wrapped JSON above. On error → degrade to text fallback if any result text exists, else return `{ error, suggestion }`.
3. Filter `PROMOTION_PAYMENT` records, sort visible records by `payTime` DESC, identify the latest visible record. Empty visible list → `NONE` bucket. Apply the 7-bucket map, then derive `subState` and `methodGroup` for IN_PROGRESS.

**Phase 2 — decide what enrichment is warranted:**

4. Compute `wantPayNowCta = ((latestBucket ∈ {FAILED, CLOSED, NONE}) OR (latestBucket = IN_PROGRESS AND subState = challenge)) AND (no visible historical SUCCESS)`.
5. Compute `wantErrorLookup = (latestBucket = FAILED) AND (latest.errorCode is non-empty)`.
6. If both clauses are false → **skip phase 3 entirely** and call `build_payment_followup` with neither `freshUrl` nor `errorBuyerCopy`.

**Phase 3 — chain enrichment MCPs and render (only when needed):**

7. (Conditional, `wantPayNowCta=true`) Call `icbu_alibaba_query_payment_url` with the wrapped JSON per [`references/cashier-url-fetch.md`](references/cashier-url-fetch.md). `paymentItemIndex = (latest.paymentItem > 1 ? 1 : 0)` for FAILED/CLOSED/IN_PROGRESS-challenge; `0` for NONE (`records[]` empty after filtering). On any failure (NOT_FOUND / NO_DATA_PERMISSION / DOWNSTREAM_ERROR) → `cashierUrl` stays undefined; do NOT retry, do NOT fabricate a placeholder.
8. (Conditional, `wantErrorLookup=true`) Call `icbu_alibaba_query_payment_error_code` with the wrapped `"request"` JSON above, using `errorCode=latest.errorCode`. Read `response.userFullDesc` into `errorBuyerCopy`. On failure / empty / unknown code → leave `errorBuyerCopy` undefined.
9. Call `build_payment_followup({ rawStatusResponse, source, orderId, freshUrl: cashierUrl?, errorBuyerCopy? })`. The tool emits `ctaList[0]` with the MCP URL after trimming only (or empty `ctaList[]` + a "view order details" hint when no URL), and concatenates the buyer copy after the bucket utterance when present.
10. Translate `utterance` and `ctaList[].label` into user's language; keep everything else (including `ctaList[].url`) verbatim.
11. Emit JSON event to main Agent.

> If `wantPayNowCta=false` AND `wantErrorLookup=false`, jump straight to step 9 with both optional fields omitted. The status data already classifies the order; phase 3 is purely about minting a clickable URL and / or appending an actionable error explanation when the buyer needs them.

### Active branch (`source=user_inquiry`, default)

Same three-phase shape as the passive branch — **probe → decide → fetch+render**. `query_payment_url` is only invoked in phase 3.

**Phase 1 — probe state (`query_order_payment_status` only):**

1. Resolve `orderId` (mandatory), session `aliId` (optional — passed to `operatorId` when available but NOT required), and detected `language`. If `orderId` missing, ask the user.
2. Call `icbu_alibaba_query_order_payment_status` with the same wrapped JSON. Do NOT chain any other MCP at this step.
3. Filter `PROMOTION_PAYMENT` records, then inspect the latest visible record's bucket. If all records are hidden, treat as `NONE`.

**Phase 2 — decide whether a Pay Now button is warranted:**

4. Compute `wantPayNowButton = !hasVisibleSuccessfulRecord AND ((latestBucket ∈ {FAILED, CLOSED, NONE}) OR (latestBucket = IN_PROGRESS AND subState = challenge))`. If false → **skip phase 3**, jump to step 7 with `payNowUrl` undefined.

**Phase 3 — fetch URL and render (only if `wantPayNowButton=true`):**

5. Call `icbu_alibaba_query_payment_url` with the wrapped JSON per [`references/cashier-url-fetch.md`](references/cashier-url-fetch.md). `paymentItemIndex = (latest.paymentItem > 1 ? 1 : 0)` for FAILED/CLOSED/IN_PROGRESS-challenge; `0` for NONE (`records[]` empty after filtering). On any failure → `cashierUrl` stays undefined; do NOT retry.
6. Set `payNowUrl = cashierUrl` (may still be undefined if step 5 failed).
7. MUST call `render_payment_status_card({ rawStatusResponse, orderId, language, payNowUrl })`. When `payNowUrl` is present → the tool embeds the Pay Now button with the MCP URL after trimming only. When undefined on a retry-eligible bucket → the tool replaces the button with a localized "view order details" hint line.
   The active branch MUST call `render_payment_status_card`; Do NOT manually render MCP `records[]` into Markdown.
8. Output the returned `markdown` directly to the buyer. Translate the embedded `Pay Now` / `立即支付` label only if the user's language is not en / zh (the tool handles en/zh natively).
9. When the latest bucket is `FAILED` AND an `errorCode` was carried over from a prior `payment_result` event, optionally append (as a separate line after the card): "Want me to explain why it failed?" → delegates to `alibaba-icbu-payment-result-detail` (bucket=FAILED) on the next turn. Note: the active card itself does NOT chain `query_payment_error_code` automatically — the buyer copy lives in the result-detail Skill / passive followup. Keep the active card status-only.

> Never invoke `query_payment_url` in phase 1 as a "free" follow-up to the status query — that violates MCP responsibility separation. Only after phase 2 has confirmed a button is warranted may the workflow enter phase 3.

> The cashier URL MCP is decoupled from the status query as of v0.4.0 — it is invoked ONLY in phase 3 of either branch, after the workflow has decided a Pay Now CTA/button is warranted. `icbu_alibaba_payment_create_checkout` remains retired (since v0.3.0). The placeholder URL fallback is also gone — no real URL means no button + a "view order details" hint.

### Text fallback branch

1. Pass the raw message to `parse_payment_result({ message, orderId?, language })`.
2. Render `summaryMarkdown` as the body; append a Next Steps block (use same translations as passive branch where possible).
3. Whenever an orderId is recoverable from the text, prefer re-running the passive branch in the next turn.

## Safety Constraints

1. **Read with sanitized output**, but still subject to field whitelist — never expand rendered fields without a security review.
2. **No raw card / CVV / OTP / token** in any output. `accountTail` is the only fund-related field exposed and is masked at the facade.
3. **403 / not authorized** → respond with a generic "We can't find that order under your account" — never leak which orderId belongs to whom.
4. **Status-query wrapper invariants** — `traceId`, `appKey`, `locale`, `bizType`, `orderId` MUST appear inside `"request"`. `appKey` / `locale` / `bizType` are hard-coded constants; `traceId` comes from the live session; `buyerAliId` is platform-injected. None of them are user-controllable and none should appear in the rendered card or follow-up.
5. **Static MCP constants are immutable.** Never change spelling, case, punctuation, boolean type, wrapper key, or class name for fixed MCP parameters. User language affects only rendered user text, not `locale="en_us"` in the status query or any fixed cashier URL fields.
6. **Dynamic MCP values must come from the right source.** `orderId` comes from task JSON/context/user order id and stays a string; `operatorId` comes only from session `aliId`; `paymentItemIndex` is derived by the documented status/link/action rule; `errorCode` comes only from an actual FAILED record/failure event; `source` for `query_payment_url` comes from a baseline-preserved task JSON `client` / `clientType` / `clientPlatform` when already present (otherwise `[Client] <value>` task tag, then this SubAgent turn's `Client:` line; missing all → `ACCIO_DESKTOP`); `traceId` is fresh per MCP call.
7. **Promotion-payment privacy.** Records whose `paymentMethod` is `PROMOTION_PAYMENT` are backend promotion-offset records. Do not include them in latest attempt, internal history checks, retry decisions, analytics counts, or result-detail context.
8. **Renderer boundary.** Do NOT manually render raw MCP `records[]`, raw JSON, or ad-hoc payment-history tables. Active branch output MUST come from `render_payment_status_card.markdown`, and that Markdown must remain latest-result-only; passive branch output MUST come from `build_payment_followup`.
9. **Installment payment display.** If visible records include both `paymentItem=0` and `paymentItem=1`, active branch output may render both records as a payment-result summary, not as generic history: `0` means first payment / 首款, `1` means final payment / 尾款.
10. **Payment time display.** Active status card payment times must keep the existing US Pacific conversion rule, but the buyer-facing card must not expose timezone words or abbreviations (PDT/PST/美西) or raw UTC/ISO timestamps.
11. **MCP responsibility separation (HARD RULE).** `icbu_alibaba_query_order_payment_status` returns status only. `icbu_alibaba_query_payment_url` exists solely to mint a Pay Now URL. **Never invoke `query_payment_url` automatically after `query_order_payment_status`** — always run the bucketize-and-decide step first. If the decision is "no Pay Now button needed" (already paid / refunded / in-progress / unknown), do not call the cashier URL MCP at all.
12. **No `create_checkout` chain.** As of v0.3.0, this Skill no longer chains `icbu_alibaba_payment_create_checkout` in either branch — the cashier URL MCP returns the existing order's current session and therefore cannot cause a double-charge.
13. **No placeholder URL.** As of v0.4.0, when the cashier URL MCP cannot return a usable URL, the JS rendering tools omit the Pay Now button and emit a localized "view order details to complete payment" hint instead. A fake URL is worse than no button. **Never fabricate a `biz.alibaba.com/ta/order/...` URL** at the prompt layer either.
14. **`paymentItemIndex` is silently derived** — `latest.paymentItem > 1 ? 1 : 0` for FAILED/CLOSED; `0` for NONE. Never ask the user. If the derivation is wrong the MCP returns `NOT_FOUND`, which falls through to the hint (not a fake URL).
15. **Cashier URL immutability** — `build_payment_followup` / `render_payment_status_card` render the MCP URL after trimming only. The agent MUST NOT append, strip, rewrite, or duplicate query parameters at emit time.
16. **No polling** — at most one status query AND at most one cashier URL fetch AND at most one error-code lookup per spawn; mid-state utterances inform the user that updates will follow.

## General Rules

### Language

- All Custom JS tool outputs are English (with native en/zh dictionaries in `render_payment_status_card` and `parse_payment_result`).
- SubAgent prompt translates `utterance` / `ctaList[].label` / Markdown card body into the user's language at emit time.

### Error Handling

| Scenario | Response Strategy |
|---|---|
| MCP `status_query` unreachable | Active branch → "Payment status temporarily unavailable. Please check the order page directly." Passive branch → fall back to text classification if any text exists, else return `{ error, suggestion }`. |
| MCP returns unrecognized raw `status` | `build_payment_followup` returns `event=payment_unknown_status` / `render_payment_status_card` labels the row `UNKNOWN`. SubAgent reminds user to check the order page. |
| MCP returns `paymentMethod=PROMOTION_PAYMENT` records | Hide those records before rendering or analytics. If all records are hidden, treat the visible list as empty (`NONE`). |
| Multiple visible records remain after filtering | Active branch still renders no Payment History section; show the latest payment-result summary only. Historical records are internal for retry protection and analytics. |
| `records[]` empty | "This order has not initiated any payment yet" + Make Payment retry CTA (active) / `NONE` bucket follow-up (passive). |
| MCP `query_payment_url` fails (NOT_FOUND / NO_DATA_PERMISSION / DOWNSTREAM_ERROR) | Pass undefined `freshUrl` / `payNowUrl` to the JS rendering tool. Passive: `ctaList[]` stays empty and `utterance` ends with "view your order details to complete the payment". Active: card replaces the Pay Now button with a localized hint line. Never surface a raw MCP error to the user. Never fabricate a placeholder URL. |
| MCP `query_payment_error_code` fails / unknown code / empty `userFullDesc` | Omit `errorBuyerCopy` when calling `build_payment_followup`; the followup falls back to the generic FAILED utterance. Never block on this lookup, never surface the raw MCP error. |
| Anonymous flow (`aliId` missing) on retry-eligible bucket | Proceed normally — `query_payment_url` carries `anonymous: true` and does NOT require `operatorId`. Pass `operatorId` when available for analytics; omit when absent. The MCP will still attempt to mint a cashier URL. |
| 403 / not authorized | "We can't find that order under your account." |
| Missing orderId | Ask "Which order would you like to check?" |

### Result Presentation

- **Passive branch**: emit JSON `{ event, utterance, ctaList, analytics, suggestSpawn, retryHint }`. Never render Markdown.
- **Active branch**: render the `markdown` field as-is to the buyer. Optionally append one-line retry / explain hint.
- **Text fallback**: Markdown body + Next Steps.
- Never expose raw `accountTail` beyond masked form, `traceId`, `appKey`, `checkoutToken`, MCP tool codes, or backend URLs.
- Never auto-trigger payment / refund / order mutation — this Skill is read + retry-URL prep only.
- Never poll the MCP — single query per invocation.
