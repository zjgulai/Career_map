---
name: alibaba-icbu-payment-result-detail
version: 0.2.1
description: >
  【Payment SubAgent internal handler — main Agent MUST route payment requests to buyer-payment-intent first】
  Keywords 支付失败原因/错误码/为什么支付失败/到账时间/退款多久/汇率/error code/payment error/why failed/when will I receive/refund time/processing time.
  Alibaba.com Payment Result Detail Skill — fine-grained explanation of any
  payment-status bucket. Caller MUST have a resolved `bucket` (typically from
  `alibaba-icbu-payment-status`) before invoking this Skill.

  Branches by bucket:
    • FAILED — calls MCP `icbu_alibaba_query_payment_error_code` with the
      exact `errorCode` token; renders audience-aware buyer / seller / ops
      descriptions. `internalFullDesc` is internal-ops-only and MUST NEVER be
      shown to buyer / seller.
    • SUCCESS / IN_PROGRESS / CLOSED / REFUND — calls Custom JS
      `explain_payment_result` (7×7 bucket × paymentMethod dictionary) for
      expected settlement time, next steps, FX notes, refund timing, etc.
    • NONE — generic "no payment yet → go pay" hint.
    • UNKNOWN — generic "could not determine → wait or contact support" hint.

  Inside the payment SubAgent, callers must NOT invoke this Skill
  speculatively without a bucket — defer to `alibaba-icbu-payment-status`
  first. The main Agent must not select this Skill directly; it must use
  `buyer-payment-intent`, which preserves the original task/json contract and
  then invokes the payment SubAgent.

  Typical utterances:
  - Why did my payment fail? Error code is USER_BALANCE_NOT_ENOUGH
  - 这个 3D_FAILED 是什么意思 / 我的订单为什么支付失败 / 支付失败原因
  - When will I receive my Boleto payment confirmation?
  - 退款大概多久能到 / How long does a wire-transfer refund take?
  - 这次成功的支付什么时候到供应商账户？
  - What does processing mean for credit card payments?
enabled: true
tool_triggers:
  - name: icbu_alibaba_query_payment_error_code
  - name: explain_payment_result
---

# Alibaba.com Payment Result Detail

Fine-grained explanation layer on top of the `payment-status` Skill. After `payment-status` resolves a bucket (and optionally `paymentMethod` / `errorCode` / `refundType`), this Skill answers the buyer's "why / when / how long / what next" follow-up questions.

> **Upstream Yuque specs** (keep in sync):
> - **Payment-failure reason mapping** — 197 error-code rows with `userBaseDesc` / `userFullDesc` / `sellerFullDesc` / `internalFullDesc`. The FAILED branch reads this dictionary live via MCP `icbu_alibaba_query_payment_error_code`; do NOT cache locally. <https://aliyuque.antfin.com/chaixi.cx/glr2x7/mebqggggkn454qlf>
> - **AW order-payment flow v530** — pre-/processing/success/failure cashier copy and the IN_PROGRESS sub-state × payment-method matrix. The IN_PROGRESS sub-state push copy (authorized / challenge / processing) is centralized in `payment-status` Skill (`_bucket-presenter.buildInProgressUtterance()`); this Skill only supplements method-level expected-time / next-step explanations when buyer asks proactively. <https://aliyuque.antfin.com/chaixi.cx/glr2x7/xvk5ic72t31a3yi6>

| Bucket | Branch | Data Source | Audience-aware? |
|---|---|---|---|
| **FAILED** | MCP call | `icbu_alibaba_query_payment_error_code` (CCP `payment_ai_config` dictionary, sourced from Yuque mapping table) | Yes — buyer/seller/ops |
| **SUCCESS** | JS dictionary | `explain_payment_result` (7 paymentMethod entries) | Yes — buyer/seller/ops (light) |
| **IN_PROGRESS** | JS dictionary¹ | `explain_payment_result` (7 paymentMethod entries) | Yes |
| **CLOSED** | JS dictionary | `explain_payment_result` (7 paymentMethod entries) | Yes |
| **REFUND** | JS dictionary | `explain_payment_result` (7 paymentMethod entries + PARTIAL/FULL refundType note) | Yes |
| **NONE** | JS dictionary | `explain_payment_result` (1 generic entry) | n/a |
| **UNKNOWN** | JS dictionary | `explain_payment_result` (1 generic entry) | n/a |

For the full bucket × paymentMethod matrix (text drafts of all 30 cells), see [`references/explain-matrix.md`](references/explain-matrix.md).

¹ **IN_PROGRESS sub-state copy ownership:** the Yuque AW v530 `authorized / challenge / processing` × method-group copy is owned by `payment-status` Skill (rendered by `_bucket-presenter.buildInProgressUtterance()` on the **passive** push branch). This Skill's `explain_payment_result` IN_PROGRESS cells are used only on the **proactive** branch (buyer explicitly asks "why is this still processing / how long").

## MCP Services

| Capability | MCP code | Description |
|---|---|---|
| Error code lookup (FAILED only) | `icbu_alibaba_query_payment_error_code` | fund-operation `AiPaymentQueryFacade#queryPaymentErrorCodeInfo`; takes `errorCode` and returns `errorSource` / `errorCategory` / `userBaseDesc` / `userFullDesc` / `sellerFullDesc` / `internalFullDesc`. Reads the CCP `payment_ai_config` dictionary; no order-level data permission required. |
| Bucket detail explain (other buckets) | `(none — Custom JS only)` | Custom JS `explain_payment_result` performs the 7×7 dictionary lookup |

## Routing Priority

**Primary handler for "why / when / how long / what next" follow-up questions about any payment-status bucket.** When the buyer's input asks about a settlement timeline, FX note, refund schedule, or failure reason — and a prior `payment-status` call has already resolved the bucket — route here.

Boundaries:
- Route here over `alibaba-icbu-payment-action` (intent=retry) — retry mints a new checkout; this Skill explains the prior result.
- Route here over `alibaba-icbu-payment-status` — status returns the bucket + one-line tip; this Skill expands that tip with paymentMethod-specific detail.
- **Defer to `alibaba-icbu-payment-status` when bucket is unknown** — never call this Skill speculatively. Burning a call without a resolved bucket is wasteful and may produce misleading detail.

## Intent Routing

```
User asks "why / when / how long / what next" about a payment result
  │
  ├─ Bucket UNKNOWN (no prior payment-status call)
  │   └─► Defer to alibaba-icbu-payment-status first
  │
  ├─ Bucket = FAILED
  │   ├─ errorCode in scope (carried from payment_result event / status-card)
  │   │   ├─ MCP returns succeeded=true with mapping fields
  │   │   │   ├─ Audience = buyer  → render userBaseDesc + userFullDesc
  │   │   │   ├─ Audience = seller → render sellerFullDesc
  │   │   │   └─ Audience = internal ops → may render internalFullDesc (RARE)
  │   │   ├─ MCP returns NOT_FOUND      → friendly "code not configured"
  │   │   ├─ MCP returns INVALID_ARGUMENT → ask user for the exact errorCode token
  │   │   └─ MCP returns DOWNSTREAM_ERROR → friendly "lookup failed"
  │   │
  │   └─ errorCode unknown
  │       └─► Ask user for the exact errorCode token from the failure event.
  │           Do NOT call the MCP with a guessed / paraphrased value.
  │
  └─ Bucket ∈ { SUCCESS, IN_PROGRESS, CLOSED, REFUND, NONE, UNKNOWN }
      └─► Call explain_payment_result({ bucket, paymentMethod?, refundType?, audience, language })
          → render { summary, expectedTime?, nextSteps[], fxNote?, contactSupportHint? }
            as a Markdown paragraph.
```

### Intent Recognition Rules

| Input Characteristics | Branch | Capability |
|---|---|---|
| "为什么支付失败 / why failed / 错误码是什么意思" + errorCode + bucket=FAILED | FAILED branch | MCP errorCode lookup |
| "Boleto / wire-transfer / 信用卡 什么时候到账 / when will it settle" + bucket=SUCCESS or IN_PROGRESS | non-FAILED branch | `explain_payment_result` |
| "退款多久 / refund time / how long for refund" + bucket=REFUND | non-FAILED branch | `explain_payment_result` + refundType |
| "会话关了再付要紧吗 / does closing the session lose my money" + bucket=CLOSED | non-FAILED branch | `explain_payment_result` |
| "支付状态 / 支付了吗 / payment status" | Status inquiry | Defer to `alibaba-icbu-payment-status` |
| "再付一次 / 重新支付 / retry" | Retry payment flow | Defer to `alibaba-icbu-payment-action` (intent=retry) |
| "支付链接 / payment url" | Cashier URL fetch | Defer to `alibaba-icbu-payment-link` |

### Multilingual Trigger Keywords

| Language | Trigger Keywords |
|----------|------------------|
| English | error code, payment error, why failed, what does this error mean, payment failure reason, when will I receive, settlement time, processing time, refund time, FX, exchange rate, intermediary bank fee |
| Chinese | 错误码, 支付失败原因, 为什么支付失败, 失败原因, 这个错误是什么意思, 什么时候到账, 多久到账, 退款多久, 处理时长, 汇率差异, 中转行费用 |
| Spanish | código de error, motivo del fallo de pago, cuándo recibiré, tiempo de procesamiento, tiempo de reembolso |
| French | code d'erreur, motif de l'échec de paiement, quand recevrai-je, temps de traitement, délai de remboursement |

## MCP Tool Usage

### Error Code Lookup — `icbu_alibaba_query_payment_error_code` (FAILED branch only)

Single JSON object with the required wrapper field `"request"` — put the final request fields shown below inside that wrapper. **All fixed values below MUST be sent verbatim**; the model is not allowed to rewrite them. If you run `accio-mcp-cli search icbu_alibaba_query_payment_error_code`, use it only to confirm the tool code; do **not** omit fixed fields.

```bash
accio-mcp-cli call icbu_alibaba_query_payment_error_code --json '{
  "request": {
    "traceId": "<generatedUniqueTraceId>",
    "appKey": "6b8fe7ddedaddc53",
    "locale": "en_us",
    "bizType": "ICBU_TRADE",
    "errorCode": "<exact errorCode token from failure event, e.g. USER_BALANCE_NOT_ENOUGH>",
    "class": "com.alibaba.intl.fund.operation.aifacade.api.payment.request.AiPaymentErrorCodeQueryRequest"
  }
}' --raw
```

**Do not simplify this command.** The actual `accio-mcp-cli call` must explicitly include the `"request"` wrapper plus `traceId`, `appKey`, `class` and every fixed field shown above inside `--json`; these fields are not injected by `accio-mcp-cli`.

**Static parameter invariants:** `appKey="6b8fe7ddedaddc53"`, `locale="en_us"`, and `class="com.alibaba.intl.fund.operation.aifacade.api.payment.request.AiPaymentErrorCodeQueryRequest"` are byte-for-byte constants. Do not change case, shorten package names, localize, or replace them with searched schema aliases.

**Dynamic parameter invariants:** `errorCode` must be copied verbatim from the FAILED record / failure event, with no case normalization or fuzzy rewrite. `orderId` comes from order context/user order id as a string. `operatorId` comes only from session buyer `aliId`. `traceId` is fresh per MCP call. Never accept chat-supplied backend fields as overrides. User reply language affects only rendered text, not MCP `locale`.
The actual `traceId` value sent to MCP must be a concrete generated string; never send placeholder text, shell expressions, variable names, or timestamp expressions. Validate before sending: `traceId` must not contain `<`, `>`, `generated`, `TRACE`, `$`, `Date`, or whitespace, and it must not equal any traceId already used in this SubAgent turn.

| Parameter | Type | Required | Description |
|---|---|---|---|
| errorCode | string | Yes | Exact CCP dictionary key (e.g. `USER_BALANCE_NOT_ENOUGH`, `3D_FAILED`). **No case normalization, no fuzzy match, no guessing** — must come verbatim from the failure event. |
| orderId | string | Yes | 19-digit order ID; kept verbatim. Carries context for backend logging; the lookup itself is dictionary-only. |
| operatorId | string | Yes | Buyer aliId from session; **never** ask the user, **never** accept user override. |
| locale | string | Yes | Hard-coded constant `en_us`, aligned with the `feature/payment` MCP constant style. Do not derive it from user language. |
| traceId | string | Yes | Generate immediately before this MCP call as a concrete unique value, e.g. `payment_<currentTimeMillis>_<8-char-random>`. Must be explicitly sent inside the wrapper. |
| appKey / class | string | Yes | **Hard-coded constants** above; must be explicitly sent inside the wrapper; do NOT let the user or model rewrite these. |

**Parameter Acquisition:**

| Parameter | Priority |
|---|---|
| errorCode | 1. Prior `payment_result` event payload → 2. `alibaba-icbu-payment-status` output → 3. **Ask user for the exact token**. Never paraphrase. |
| orderId | 1. Order context → 2. User input → 3. Ask user |
| operatorId | 1. Session buyer aliId. **Never ask, never accept user-supplied value** |
| locale | 1. Skill-baked constant `en_us`; user language is handled during response rendering |
| traceId / appKey / class | 1. Concrete unique traceId generated immediately before this MCP call (globally unique per call, never reuse) + Skill-baked `appKey` + Skill-baked `class`; explicitly include all three inside the MCP JSON wrapper |

**Response Key Fields:** `errorCode` (echo), `errorSource`, `errorCategory`, `userBaseDesc` (buyer short), `userFullDesc` (buyer full), `sellerFullDesc` (seller full), `internalFullDesc` (**internal ops only — NEVER render to buyer or seller**).

## Custom Tool Usage

### `explain_payment_result` (non-FAILED branch)

Pure Custom JS, no HTTP. Dictionary lookup over 7-bucket × 7-paymentMethod matrix (with PARTIAL/FULL refundType override for REFUND).

**Parameters:**

| Parameter | Type | Required | Description |
|---|---|---|---|
| bucket | string | Yes | One of `SUCCESS / IN_PROGRESS / CLOSED / REFUND / NONE / UNKNOWN`. **FAILED is NOT supported here** — use MCP errorCode lookup. |
| paymentMethod | string | No | One of `CREDIT_CARD / PAYPAL / BOLETO / APPLE_PAY / GOOGLE_PAY / WIRE_TRANSFER / OTHER`. Ignored for NONE / UNKNOWN. Falls back to `OTHER` when unknown. |
| refundType | string | No | `FULL` or `PARTIAL`. Only meaningful for `bucket=REFUND`; PARTIAL adds a clarifying sentence to summary. |
| audience | string | No | `buyer` (default) / `seller` / `ops`. Adjusts pronouns and may add internal-only steps. |
| language | string | No | `en` (default) / `zh`. Other languages → English fallback (SubAgent prompt re-translates). |

**Return Schema:** `{ bucket, paymentMethod, audience, language, summary, expectedTime?, nextSteps[], fxNote?, contactSupportHint?, methodLabel? }`.

**Parameter Acquisition:**

| Parameter | Priority |
|---|---|
| bucket | 1. Prior `payment-status` output (`latestBucket`) → 2. Caller spawn input → 3. Ask user to run status inquiry first |
| paymentMethod | 1. Prior `payment-status` record's `paymentMethod` → 2. Default to `OTHER` |
| refundType | 1. Spawn input (when caller knows partial vs full) → 2. Default to `FULL` (no extra note) |
| audience | 1. Spawn input → 2. `buyer` (default for this buyer-facing SubAgent) |
| language | 1. User's input language → 2. `en` |

## Safety Constraints — Mandatory

1. **Bucket-resolution precondition.** Do NOT invoke this Skill unless the caller has resolved a bucket (via `alibaba-icbu-payment-status` or a recent `payment_result` event). If bucket is unknown, route back to status inquiry first.
2. **FAILED branch — MCP only (Yuque mapping table is the source of truth).** For bucket=FAILED, the buyer/seller/ops descriptions come live from CCP `payment_ai_config` (mirrored from the Yuque mapping table — 197 rows). Do NOT fabricate failure descriptions from the JS dictionary; the JS dictionary intentionally does NOT include a FAILED branch.
2a. **IN_PROGRESS sub-state copy belongs to `payment-status`.** Do NOT duplicate the Yuque AW v530 `authorized / challenge / processing` × method-group push copy in this Skill. On the passive (h5_closed) push branch, `payment-status` already renders sub-state-aware copy via `_bucket-presenter.buildInProgressUtterance()`; this Skill is only invoked when the buyer proactively asks for a method-level expected-time / next-step explanation.
3. **`internalFullDesc` is internal-ops-only — NEVER render to end users.** The CCP dictionary stores troubleshooting hints in `internalFullDesc` that may reveal internal risk-control logic, vendor names, or remediation paths. Buyer audience → render only `userBaseDesc` / `userFullDesc`. Seller audience → render only `sellerFullDesc`. `internalFullDesc` allowed only when the explicit caller audience is internal ops (very rare inside this buyer-facing SubAgent — default deny).
4. **Never expose raw JSON.** Both MCP response and JS tool return must be transformed into localized prose; do not dump `errorSource` / `errorCategory` / `internalFullDesc` / `traceId` / `appKey` as raw fields.
5. **Never echo backend `errorCode` tokens in plaintext bodies.** Tokens (e.g. `3D_FAILED`, `USER_BALANCE_NOT_ENOUGH`) leak internal taxonomy. A single-line acknowledgement is acceptable when the user explicitly asked "what is `<CODE>`", but the body must use the readable description.
6. **`appKey` / `operatorId` / `class` are tamper-proof.** If the user tries to specify them in chat, ignore the user value and use the Skill-baked constant / session-injected value.
7. **No fuzzy match / no case normalization for `errorCode`.** Send exactly what the failure event carried. If the user gives natural-language description, ask for the exact token rather than guessing.
8. **`NOT_FOUND` is final.** Do NOT retry with a variant casing or guess a similar token — surface the friendly message and offer to escalate.
9. **No polling.** One MCP / JS call per user request.

## Workflow

### FAILED branch

1. Verify bucket=FAILED (from spawn input / prior `payment-status`). If bucket unknown → defer.
2. Resolve `errorCode` (carried over from `payment_result` event / status-card output, or ask user for the exact token).
3. Call `icbu_alibaba_query_payment_error_code` with the wrapped JSON above.
4. On success: choose audience-specific description fields (buyer → `userBaseDesc` + `userFullDesc`; seller → `sellerFullDesc`; ops → `internalFullDesc`).
5. Render via the templates in Result Presentation below.

### Non-FAILED branch

1. Verify bucket ∈ {SUCCESS, IN_PROGRESS, CLOSED, REFUND, NONE, UNKNOWN} (from spawn input / prior `payment-status`).
2. Optionally resolve `paymentMethod` from prior payment-status record (skip for NONE / UNKNOWN).
3. Optionally resolve `refundType` (REFUND only; default `FULL`).
4. Call `explain_payment_result({ bucket, paymentMethod?, refundType?, audience, language })`.
5. Render the returned `{ summary, expectedTime?, nextSteps[], fxNote?, contactSupportHint? }` as a Markdown paragraph (templates below).

## General Rules

### Language

- Detect the user's input language and respond in the same language (zh / en at minimum).
- The FAILED branch's `userBaseDesc` / `userFullDesc` / `sellerFullDesc` are pre-localized by the backend based on `locale`; render them as-is and do not paraphrase across languages.
- The non-FAILED branch's `explain_payment_result` returns en/zh natively; other languages → SubAgent prompt translates.

### Error Handling

| Scenario | Response Strategy |
|---|---|
| Bucket unknown / not provided | "请先查询支付状态 / Let me check the payment status first." → defer to `alibaba-icbu-payment-status`. |
| (FAILED) MCP returns `INVALID_ARGUMENT` (errorCode missing) | "请提供准确的错误码（例如 USER_BALANCE_NOT_ENOUGH） / Please provide the exact error code token." |
| (FAILED) MCP returns `NOT_FOUND` (errorCode not in CCP) | "该错误码暂未配置可读描述，建议联系客服 / This error code has no readable description yet. Please contact support." Do NOT guess a similar code. |
| (FAILED) MCP returns `NO_DATA_PERMISSION` | "无权访问该错误码描述 / You do not have permission to access this error description." Do NOT retry with a different operatorId. |
| (FAILED) MCP returns `DOWNSTREAM_ERROR` / unreachable | "错误码描述查询失败，请稍后重试 / Lookup failed, please try again later." |
| (non-FAILED) `explain_payment_result` returns `{ error }` | Surface a short message and ask the user to clarify bucket. |
| User asks about FAILED with a non-FAILED bucket | "当前订单不是支付失败状态 / The latest payment record is not FAILED." Do NOT call the MCP. Redirect to relevant branch. |

### Result Presentation

#### FAILED branch — buyer audience (Chinese)

```
您的订单 {orderId} 支付失败原因：{userBaseDesc}
详细说明：{userFullDesc}
```

#### FAILED branch — buyer audience (English)

```
Order {orderId} payment failure reason: {userBaseDesc}
Details: {userFullDesc}
```

#### FAILED branch — seller audience

Render `sellerFullDesc` as a single paragraph; do NOT also include `userBaseDesc` / `userFullDesc`.

#### Non-FAILED branch — buyer audience (template)

```
{badge} **{summary}**

⏱ {expectedTime}                  ← only when present

**Next steps:**
- {nextSteps[0]}
- {nextSteps[1]}
- ...

💱 {fxNote}                        ← only when present
📞 {contactSupportHint}            ← only when present
```

Where `{badge}` is the bucket emoji from `payment-status` (e.g. ✅ / ⏳ / ⌛ / ↩️ / — / ❓). Localize section labels ("Next steps", "FX note") per user language.

#### General output rules

- Render each description field **exactly once**.
- **NEVER render `internalFullDesc` to buyer or seller** — internal ops only.
- Do NOT echo `errorCode` token in the body (FAILED). A single acknowledgement line ("关于错误码 {errorCode}：" / "About error {errorCode}:") is acceptable when the user explicitly asked.
- Do NOT show `traceId`, `appKey`, `operatorId`, `locale`, `class`, or any backend internals.
- Do NOT volunteer retry / refund actions — that is the user's decision and a different Skill's responsibility. You MAY append a single one-line hint pointing to `alibaba-icbu-payment-action` (intent=retry) when the failure category clearly warrants retry, but never auto-trigger it.
