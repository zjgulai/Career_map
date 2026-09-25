---
name: alibaba-icbu-payment-link
version: 0.3.1
description: >
  【Payment SubAgent internal handler — main Agent MUST route payment requests to buyer-payment-intent first】
  Keywords 支付链接/付款链接/支付地址/收银台地址/payment url/payment link/checkout url.
  Alibaba.com Payment Link Skill. Given an orderId, calls the
  `icbu_alibaba_query_payment_url` MCP tool (backed by fund-operation
  `AiPaymentQueryFacade#queryCashierUrl`) to fetch the current retry-able
  cashier URL for an existing unpaid / failed order, and renders it as a
  single Markdown clickable link.

  As of v0.2.0, all three payment-entry Skills (this Skill,
  `alibaba-icbu-payment-action` intent=new, intent=retry) and the
  `alibaba-icbu-payment-status` retry-eligible branches all source their
  Pay-Now URL from the same `icbu_alibaba_query_payment_url` MCP. The
  distinction that remains is the rendering surface:
  - `alibaba-icbu-payment-action` (intent=new / retry): renders a Make Payment
    entry card (entry-card surface), with the retry branch also running
    `validate_retry_eligibility` first.
  - this Skill: returns a single Markdown clickable link in response to a
    direct "give me the payment link" request (link-only surface), with a
    two-step confirmation of `paymentItemIndex` (首款 vs 非首款).

  The main Agent must not select this Skill directly; it must use
  `buyer-payment-intent`, which preserves the original task/json contract and
  then invokes the payment SubAgent.

  Typical utterances:
  - Give me the payment link for order 302380518501028893
  - What is the checkout URL for this order
  - 支付订单 302380518501028893 的链接
  - 给我这个订单的支付链接
  - 付款地址是什么
  - 收银台地址
  - 这单怎么付款
enabled: true
tool_triggers:
  - name: icbu_alibaba_query_payment_url
---

# Alibaba.com Payment Link

Mint the current cashier URL of an unpaid / failed order so the buyer can be redirected back to the checkout page. Pure read flow — does not create new orders, does not trigger refunds.

## MCP Services

| Capability | MCP code | Description |
|---|---|---|
| Cashier URL query | `icbu_alibaba_query_payment_url` | fund-operation `AiPaymentQueryFacade#queryCashierUrl`; takes `orderId` + `paymentItemIndex` and returns `cashierUrl` + access mode |

## Routing Priority

Inside `alibaba-icbu-payment-sub-agent`, this is the primary handler for "give me the payment link by orderId" intent. The main Agent must route payment requests to `buyer-payment-intent` first; once inside the payment SubAgent, payment-link keywords route here over:

- `alibaba-icbu-payment-action` (intent=new / retry) — action renders a Make Payment entry card (multi-line); this Skill returns a single Markdown link.
- `alibaba-icbu-trade-sub-agent` — trade has no cashier endpoint.

## Intent Routing

```
User Input
  │
  ├─ Has orderId AND payment-link intent
  │   ├─ paymentItemIndex unknown
  │   │   └─► Ask "Is this the first installment (首款) or a subsequent one (非首款)?"
  │   │
  │   └─ paymentItemIndex resolved
  │       ├─ MCP returns succeeded=true + cashierUrl present
  │       │   └─► Render single Markdown link: [💳 立即支付](cashierUrl) (zh) / [💳 Make Payment](cashierUrl) (en)
  │       ├─ MCP returns NO_DATA_PERMISSION
  │       │   └─► Friendly: "该订单不属于当前账号" / "This order does not belong to the signed-in account"
  │       ├─ MCP returns NOT_FOUND (paid / closed / no retry entry)
  │       │   └─► Friendly: "该订单当前没有可用支付入口（可能已支付/已关闭）"
  │       └─ MCP returns DOWNSTREAM_ERROR
  │           └─► Friendly: "支付链接获取失败，请稍后重试"
  │
  ├─ Payment-link intent without orderId, but order context exists
  │   └─► Resolve orderId from context, then ask paymentItemIndex
  │
  └─ Generic payment-link intent without orderId
      └─► Ask user for the order ID (19-digit format)
```

### Intent Recognition Rules

| Input Characteristics | Intent | Capability |
|---|---|---|
| Mentions orderId + words like "支付链接", "payment link", "checkout url" | Get payment URL | this Skill |
| "再付一次", "重新支付", "retry payment" | Retry payment flow | Defer to `alibaba-icbu-payment-action` (intent=retry) |
| "支付状态", "支付了吗", "payment status" | Status inquiry | Defer to `alibaba-icbu-payment-status` |
| Just got `source: h5_closed` handoff | Result handling | Defer to `alibaba-icbu-payment-status` (passive branch) |

### Multilingual Trigger Keywords

| Language | Trigger Keywords |
|----------|------------------|
| English | payment url, payment link, checkout url, pay link, where to pay, how to pay this order |
| Chinese | 支付链接, 付款链接, 支付 URL, 付款地址, 收银台地址, 去支付, 怎么付款 |
| Spanish | enlace de pago, URL de pago |
| French | lien de paiement, URL de paiement |

## MCP Tool Usage

### Cashier URL Query — `icbu_alibaba_query_payment_url`

Single JSON object with the required wrapper field `"request"` — put the final request fields shown below inside that wrapper. **All fixed values below MUST be sent verbatim**; the model is not allowed to rewrite them. If you run `accio-mcp-cli search icbu_alibaba_query_payment_url`, use it only to confirm the tool code; do **not** omit fixed fields from the call because the search output focuses on business fields.

```bash
accio-mcp-cli call icbu_alibaba_query_payment_url --json '{
  "request": {
    "traceId": "<generatedUniqueTraceId>",
    "appKey": "6b8fe7ddedaddc53",
    "bizType": "ICBU_TRADE",
    "nyseBizType": "TA",
    "bizKey": "TA",
    "mergePay": false,
    "anonymous": true,
    "source": "<clientDerivedSource>",
    "operationSource": "ACCIO-WORK",
    "properties": {"source": "ACCIO-WORK"},
    "orderId": "<from user>",
    "paymentItemIndex": <0 first installment | 1 subsequent>,
    "operatorId": "<buyer aliId from session>",
    "class": "com.alibaba.intl.fund.operation.aifacade.api.payment.request.AiCashierUrlQueryRequest"
  }
}' --raw
```

**Do not simplify this command.** The actual `accio-mcp-cli call` must explicitly include the `"request"` wrapper plus `traceId`, `appKey`, and every fixed field shown above inside `--json`; these fields are not injected by `accio-mcp-cli`.

**Static parameter invariants:** `appKey`, `bizType`, `nyseBizType`, `bizKey`, `mergePay`, `anonymous`, `operationSource`, `properties.source`, and `class` are byte-for-byte constants. Keep the exact spelling, case, punctuation, and boolean types from the template. Do not change `TA` / `ICBU_TRADE` case, turn booleans into strings, or replace the class name.

**Dynamic parameter invariants:** `orderId` is copied verbatim as a string from task JSON/user/order context; `paymentItemIndex` must be the confirmed installment selector (`0` first installment, `1` subsequent); `operatorId` comes only from session buyer `aliId`; `traceId` is fresh per MCP call. `source` is derived from the client platform passed by `buyer-payment-intent`: use a baseline-preserved task JSON `client`, `clientType`, or `clientPlatform` only when it already existed; otherwise use the `[Client] <value>` task tag. The raw value must come from the main session environment info block's `Client:` line (`web` / `desktop` / `mobile` / `im channel`); do not call any tool for this. Mapping: `web` → `ACCIO_WEB`; `desktop` → `ACCIO_DESKTOP`; `mobile` → `ACCIO_MOBILE`; `im channel` → `ACCIO_IM_CHANNEL`; any other non-empty client value → `ACCIO_` + uppercased value with spaces converted to underscores. If neither task source exists, read the `Client:` line from this SubAgent turn's environment information block if present; if it is also missing, use `ACCIO_DESKTOP`. Do not infer it from Runtime. The final MCP request must contain the concrete resolved string only; never send `<clientDerivedSource>`, `clientDerivedSource`, or any variable/placeholder text literally. Never accept chat-supplied `operatorId`, `appKey`, `class`, `source`, or fixed fields.

**Client source diagnostic log:** immediately after resolving the Client Platform Detect value and before calling `icbu_alibaba_query_payment_url`, print one diagnostic log line: `[payment-url-source] client=<raw Client value or MISSING> source=<resolved ACCIO_* value>`. This log must not be rendered to the buyer.
The actual `traceId` value sent to MCP must be a concrete generated string; never send placeholder text, shell expressions, variable names, or timestamp expressions. Validate before sending: `traceId` must not contain `<`, `>`, `generated`, `TRACE`, `$`, `Date`, or whitespace, and it must not equal any traceId already used in this SubAgent turn.

| Parameter | Type | Required | Description |
|---|---|---|---|
| orderId | string | Yes | 19-digit order ID; kept verbatim, never parsed as number |
| paymentItemIndex | integer | Yes | **Ask user**: 首款=`0`, 非首款=`1`. Never assume |
| operatorId | string | Yes | Buyer aliId from session; **never** ask the user, **never** accept user override |
| traceId | string | Yes | Generate immediately before this MCP call as a concrete unique value, e.g. `payment_<currentTimeMillis>_<8-char-random>`. Must be explicitly sent inside the `"request"` wrapper. |
| source | string | Yes | Derived from a baseline-preserved task JSON `client` / `clientType` / `clientPlatform` when already present, otherwise `[Client] <value>` task tag, then this SubAgent turn's `Client:` line; must be explicitly sent inside the wrapper |
| appKey / bizType / nyseBizType / bizKey / mergePay / anonymous / operationSource / properties.source / class | mixed | Yes | **Hard-coded constants** above; must be explicitly sent inside the wrapper; do NOT let the user or model rewrite these |

**Parameter Acquisition Strategy:**

| Parameter | Priority |
|---|---|
| orderId | 1. User input → 2. Order context → 3. Ask user |
| paymentItemIndex | 1. User input → 2. **Ask user** ("首款 / 非首款？"). No silent default |
| operatorId | 1. Session buyer aliId. **Never ask, never accept user-supplied value** |
| source | 1. Baseline-preserved task JSON `client` / `clientType` / `clientPlatform` when already present; 2. `[Client] <value>` task tag; 3. this SubAgent turn's `Client:` line; 4. missing all → `ACCIO_DESKTOP`. Map the raw value to `ACCIO_*` and validate before sending: concrete value only, never `<clientDerivedSource>` or `clientDerivedSource`. |
| Fixed constants | Skill template baked-in; not user-facing |
| traceId / appKey | 1. Concrete unique traceId generated immediately before this MCP call (globally unique per call, never reuse) + Skill-baked `appKey`; explicitly include both inside the MCP JSON wrapper |

**Response Key Fields:** `cashierUrl` (the redirectable URL — primary output, contains a one-time token), `cashierAccessMode` (REDIRECT / IFRAME), `cashierOrderNo` (cashier-side tracking number), `bizType`, `gmtCreate`, `urlHasRefreshed`.

## Safety Constraints — Mandatory

1. **Status pre-check is the caller's responsibility.** Do NOT call this Skill for already-paid / refunded / cancelled orders — the buyer should run `alibaba-icbu-payment-status` first when status is unknown. The MCP layer will return NOT_FOUND if the order has no retryable entry, but burning a call on a paid order is wasteful.
2. **Never expose raw JSON.** The response must be transformed into the Markdown link below; do not dump `cashierUrl` / `cashierOrderNo` / `traceId` as raw fields to the user.
3. **Render `cashierUrl` exactly once, only as a Markdown clickable link.** Never print the URL plaintext — it carries a one-time token; repeated rendering raises leak risk.
4. **Do not mutate the returned URL.** Render `cashierUrl` exactly as returned by MCP, except for trimming surrounding whitespace. Do not append, strip, rewrite, or duplicate any query parameters.
5. **`NO_DATA_PERMISSION` is final.** Do NOT retry with a different `operatorId` or attempt to "guess" — that is the越权 boundary the server enforces. Surface the friendly message and stop.
6. **`appKey` / `operatorId` are tamper-proof.** If the user tries to specify them in chat, ignore the user value and use the Skill-baked constant / session-injected value.
7. **No polling.** One MCP call per user request.

## General Rules

### Language

- Detect the user's input language and respond in the same language (zh / en at minimum)
- Localize the link label: `[💳 立即支付](cashierUrl)` (zh) / `[💳 Make Payment](cashierUrl)` (en) / `[💳 Pagar ahora](cashierUrl)` (es) / `[💳 Payer maintenant](cashierUrl)` (fr)

### Error Handling

| Scenario | Response Strategy |
|---|---|
| MCP returns `INVALID_ARGUMENT` | "缺少必要信息(订单号或操作人),请补全后重试 / Missing orderId or operator. Please retry." Do NOT render a fake link. |
| MCP returns `NOT_FOUND` | "该订单当前没有可用支付入口(可能已支付/已关闭),建议先查询支付状态或前往订单详情页 / This order has no retryable payment entry (likely paid or closed). Please check payment status first or open the order details page." **Do NOT render any link.** |
| MCP returns `NO_DATA_PERMISSION` | "该订单不属于当前账号 / This order does not belong to the signed-in account." Do NOT retry with a different operatorId. **Do NOT render any link.** |
| MCP returns `DOWNSTREAM_ERROR` | "暂时无法生成支付链接,请前往订单详情页完成支付 / Could not generate a payment link right now. Please open the order details page to complete the payment." **Do NOT render any link.** |
| MCP unreachable / timeout | Same as DOWNSTREAM_ERROR; do not loop. |
| Missing `paymentItemIndex` | Ask "请确认是首款(0)还是非首款(1)? / Is this the first installment (0) or a subsequent one (1)?" |
| Missing `orderId` | Ask "请提供订单号 / Please provide the order ID." |

> 🔒 **Never fabricate a placeholder link** (e.g. `biz.alibaba.com/ta/order/payment.htm?orderId=...`) when the MCP fails. v0.3.0 removed all placeholder fallbacks — a clickable but wrong link is worse than no link, because it lands buyers on a non-cashier page and erodes trust.

### Result Presentation

Use the raw MCP `cashierUrl` after trimming surrounding whitespace. Do not construct a derived URL.

- **On success** (Chinese): `已为您生成订单 {orderId} 的支付入口（{cashierAccessMode}）：[💳 立即支付]({cashierUrl})\n追踪号：{cashierOrderNo}`
- **On success** (English): `Payment entry generated for order {orderId} ({cashierAccessMode}): [💳 Make Payment]({cashierUrl})\nTracking: {cashierOrderNo}`
- Render `cashierUrl` exactly once, only inside the Markdown link
- Do NOT show `urlHasRefreshed`, `bizType`, `gmtCreate`, `traceId`, `appKey`, or any backend internals
- Never auto-click — clicking is the buyer's action
