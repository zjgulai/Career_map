---
name: alibaba-icbu-trade-after-sales-refund-guide
version: 0.2.0
description: >
  Alibaba.com Trade After-Sales Refund Guide Skill. Handles the full refund pre-check
  pipeline: eligibility check, reason identification, and scenario recognition.
  Does NOT submit refunds; prepares an AW confirmation card or text-only guidance.

  Typical utterances:
  - I want a refund for order 634002494782600
  - Can I cancel this order and get my money back?
  - The supplier hasn't shipped my order yet
  - I received the wrong product, how do I get a refund?
  - 我要退款
  - 发起售后退款
  - 取消订单退款
  - 供应商还没发货我要退款

  Do NOT use for: checking refund status (use status-query), submitting a
  confirmed refund (use refund-submit), order placement, product search, or logistics.
enabled: true
tool_triggers:
  - name: icbu_trade_after_sale_check_refund_eligibility_mcp
  - name: icbu_alibaba_trade_issue_reason_find
  - name: icbu_trade_after_sale_find_refund_scenario_mcp
  - name: parse_after_sales_scenario_result
---

# Alibaba.com Trade After-Sales Refund Guide

Guides international buyers through the refund pre-check pipeline in three phases: eligibility verification, reason identification, and scenario recognition. Produces either an AW in-chat confirmation card (quick refund) or text-only complex-flow guidance. This skill never submits refunds directly.

## MCP Services

| Capability Module | MCP code | Description |
|---|---|---|
| Refund Eligibility | `icbu_trade_after_sale_check_refund_eligibility_mcp` | Check whether an order can initiate a refund |
| Refund Reason | `icbu_alibaba_trade_issue_reason_find` | Get available refund reasons for an order |
| Refund Scenario | `icbu_trade_after_sale_find_refund_scenario_mcp` | Identify refund scenario and max amount |
| Result Parser | `parse_after_sales_scenario_result` | Post-process scenario into card/markdown |

## Intent Routing

```
User refund intent
  │
  ├─ Missing orderId
  │   └─► Ask user for the order ID
  │
  └─ Has orderId → Phase 1: Eligibility
      ├─ eligible=false → Show reason (eligibility-codes.md), STOP
      ├─ ORDER_IN_ISSUE / IN_ISSUE → Auto-route to status-query skill
      └─ eligible=true
          ├─ Determine Phase 3 input
          │   ├─ Spawn already has reasonId → use that reasonId and reasonText if provided
          │   ├─ userIssueText has a specific refund reason
          │   │   └─ Phase 2: reason_find for direct match
          │   │       ├─ exactly one leaf reason matches → use matched reasonId + reason text
          │   │       └─ no/ambiguous/parent-only/failure → omit reasonId
          │   └─ no specific reason in userIssueText → omit reasonId
          └─ Phase 3 result
              ├─ actionType=submit_in_aw (supported QUICK_REFUND scenario)
              │   └─ Render AW card using backend text, provided reason text, or known fallback text
              ├─ actionType=select_reason (AG probe only)
              │   └─ Phase 2: Show numbered reason list → return to main agent
              │       → (re-spawn with reasonId + reasonText) → Phase 3 → render AW card
              └─ actionType=complex_guidance (COMPLEX)
                  └─ Show guidance card/link directly (fill available info only)
```

## Fast-Path: reasonId Pre-Provided (AG Re-call)

When the spawn input includes a non-null `reasonId` (integer), this is the AG scenario re-call after the buyer selected a reason.

**Behavior:**
- Skip Phase 1 (eligibility check) entirely — validated in previous spawn.
- Skip Phase 2 (reason identification) entirely — buyer already selected.
- Proceed directly to Phase 3 **with the provided `reasonId`**.
- Preserve and pass the provided `reasonText` to post-processing when available.
- Do NOT re-ask the buyer to select a reason.
- Do NOT re-validate eligibility.

### Intent Recognition Rules

| User Input Characteristics | Intent | Action |
|---|---|---|
| Contains order ID + refund/cancel/dispute intent | Refund Guide | Start Phase 1 |
| Mentions refund without order ID | Clarification | Ask for order ID |
| Buyer says "partial refund" / "退一部分" after card shown | Amount Modification | Route to complex guidance, do NOT submit |

### Multilingual Trigger Keywords

| Language | Trigger Keywords |
|---|---|
| English | refund, cancel order, get money back, dispute, return, not shipped, wrong product |
| Chinese | 退款, 取消订单, 退货, 售后, 纠纷, 没发货, 发起退款 |
| Spanish | reembolso, cancelar pedido, devolucion, disputa |
| French | remboursement, annuler commande, retour, litige |

> **Fallback:** The Agent identifies intent via semantic understanding in any language, not keyword matching alone.

## MCP Tool Usage

### Phase 1: Refund Eligibility — `icbu_trade_after_sale_check_refund_eligibility_mcp`

```bash
accio-mcp-cli call icbu_trade_after_sale_check_refund_eligibility_mcp --json '{"orderId": "300241527001028893"}' --raw
```

| Parameter | Type | Source | Required |
|---|---|---|---|
| orderId | string | User input / conversation context | Yes |

**Parameter Acquisition:** orderId from user's current input > active order in conversation > ask user.

**Response Key Fields:**

| Field | Description |
|---|---|
| `eligible` | `true` = can proceed to Phase 3 (scenario recognition) |
| `reasonCode` | String code; see [`references/eligibility-codes.md`](references/eligibility-codes.md) |
| `reasonMessage` | English explanation |
| `resultCodeValue` | Numeric result code |

### Phase 3: Refund Scenario — `icbu_trade_after_sale_find_refund_scenario_mcp`

Phase 3 is called after Phase 1 and optional Phase 2 direct-match handling.

**Probe call (without reasonId):**

```bash
accio-mcp-cli call icbu_trade_after_sale_find_refund_scenario_mcp --json '{"orderId": "300241527001028893"}' --raw
```

**Reason-resolved call (with reasonId from unique leaf match or AG re-call):**

```bash
accio-mcp-cli call icbu_trade_after_sale_find_refund_scenario_mcp --json '{"orderId": "300241527001028893", "reasonId": 1002}' --raw
```

| Parameter | Type | Source | Required |
|---|---|---|---|
| orderId | string | Same as Phase 1 | Yes |
| reasonId | integer | Unique leaf direct match from Phase 2, or buyer's reason selection on AG re-call | No for probe; Yes for reason-resolved call |

When a `reasonId` comes from reason_find, keep the matched or buyer-selected leaf reason's `text` as `reasonText` for the later `parse_after_sales_scenario_result` call. Do not send `reasonText` to the scenario MCP.

**Response Key Fields:** See [`references/scenario-codes.md`](references/scenario-codes.md) for full field mapping.

**Result handling (after Post Processing):**

| actionType | Behavior |
|---|---|
| `submit_in_aw` | Supported QUICK_REFUND scenario — use backend's `defaultReasonText`, or the provided `reasonText`, or known fallback text for display. Use backend's `defaultReasonId` or the provided reasonId for submit. Display the card to buyer. |
| `select_reason` | AG probe only — proceed to Phase 2 list display below. If Phase 3 was called with a reasonId, treat this as backend/interface anomaly and degrade to complex guidance; do not loop or auto-match again. |
| `complex_guidance` | COMPLEX — display guidance card and refundUrl directly. Do NOT proceed to Phase 2. Fill only information available in current conversation (see Safety Constraints). |

### Phase 2: Refund Reason — `icbu_alibaba_trade_issue_reason_find`

Phase 2 has two uses:
1. **Pre-scenario direct match:** after eligibility, when `userIssueText` explicitly states a refund reason.
2. **Reason list display:** only when a Phase 3 probe returns `actionType=select_reason` (AG / overseas stock scenario).

```bash
accio-mcp-cli call icbu_alibaba_trade_issue_reason_find --json '{"orderId": "300241527001028893"}' --raw
```

| Parameter | Type | Source | Required |
|---|---|---|---|
| orderId | string | Same as Phase 1 | Yes |

**Response:** `Map<String, List<AgentIssueReasonDTO>>` grouped by delivery status. See [`references/reason-matching.md`](references/reason-matching.md) for matching rules, numbered list format, recommendation priority, and hidden reasonMapping / reasonTextMapping block requirements.

**⚠ MUST read [`references/reason-matching.md`](references/reason-matching.md) before direct matching or presenting the reason list.**

**Pre-scenario direct match rules:**
- Use only leaf reasons from the MCP response (`children` is missing or empty).
- Never invent or hardcode a reasonId; the selected reasonId must exist in the current MCP response.
- Generic refund/cancel phrases do not match. If no unique leaf match exists, fall back to Phase 3 probe without reasonId.
- If reason_find fails, times out, or returns empty data, fall back to Phase 3 probe without reasonId.
- If exactly one leaf reason matches, call Phase 3 once with that reasonId and keep that leaf's `text` as `reasonText` for post-processing. Do not show the reason list.

**1002 Priority Rule (inline — authoritative):**
When the `Before Shipment` category contains reasonId 1002 ("Supplier didn't ship by the agreed date"), it **MUST** be marked `<-- Recommended` in the numbered list. The only exceptions are when the buyer's description **explicitly** points to a different reason:
- Product quality / specification issues → recommend the quality reason
- Out of stock → recommend 1022
- Supplier requested cancellation → recommend 1029
- Wrong shipping method or address → recommend 1023
- Price increase → recommend 1014

Generic phrases ("I want a refund", "cancel my order", "退款", "取消订单") do **NOT** override the 1002 priority — still mark 1002 as Recommended.

After showing the reason list, return the response to the main agent. The main agent will re-spawn with the buyer's selected `reasonId` and `reasonText` for Phase 3 re-call.

## Post Processing

After Phase 3 succeeds, call the custom JS tool `parse_after_sales_scenario_result` with:

```json
{
  "orderId": "23607801501035804",
  "reasonId": 1002,
  "reasonText": "Supplier didn't ship by the agreed date",
  "memo": "Supplier hasn't shipped after 2 weeks",
  "rawEligibilityResponse": {},
  "rawScenarioResponse": {}
}
```

> **Post-processing preference:** After a successful Phase 3 MCP response, first try the custom JS tool `parse_after_sales_scenario_result`. Do NOT use `accio-mcp-cli call` or `bash` — invoke it directly as a tool call. Only fall back to manual scenario handling if the JS tool is unavailable or returns an error.

| Parameter | Type | Required |
|---|---|---|
| orderId | string | Yes |
| reasonId | number | No — omit on probe. Provide when Phase 3 was called with a matched or buyer-selected reasonId. |
| reasonText | string | No — provide the exact `text` from the current reason_find MCP response when `reasonId` came from direct match or buyer selection. Do not invent, rewrite, or translate before passing. |
| memo | string | No |
| rawEligibilityResponse | object | No |
| rawScenarioResponse | object | Yes |

**`memo` generation rule:** If the buyer has described their issue in the conversation, generate a 1-2 sentence summary in the buyer's language (max 200 chars). The JS tool will URL-encode it and append as `&memo=` to the refund page URL. If no issue description is available, omit this field.

**Output fields:** `actionType`, `scenarioCode`, `submitPayload`, `refundUrl`, `card`, `markdown`, `nextSteps`.

**⚠ Display rule:** The `markdown` field is the final buyer-facing card content. You MUST display it directly to the user. Do NOT rewrite, summarize, or replace the scenario description text — it contains scenario-specific copy required by product requirements. If the user's language is not English, translate the `markdown` content faithfully while preserving all scenario-specific details (refund amount, scenario description, actions). For `submit_in_aw`, both the submit action and `Keep order` action MUST remain visible; do NOT replace them with multiple submit/confirm aliases. Do NOT replace the description with generic text like "eligible for instant refund".

**Scenario label translation lock:** When translating `QUICK_REFUND_AG` / `AG / overseas stock order — before shipment` into Chinese, the Scenario value MUST be exactly `AG/海外仓订单 — 发货前退款`. Do NOT shorten it to `海外仓订单 — 发货前退款`, and do NOT remove the `AG/` prefix.

| actionType | Behavior |
|---|---|
| `submit_in_aw` | Display `markdown` to buyer; route confirm to refund-submit skill |
| `select_reason` | AG probe only. Call Phase 2 to show reason list, then return to main agent. Main agent re-spawns with selected reasonId and reasonText for Phase 3 re-call. If this occurs after Phase 3 was called with reasonId, treat it as anomaly and show complex guidance instead. |
| `complex_guidance` | Display `markdown` to buyer (includes refund page link if `refundUrl` present); do NOT submit in AW |

## Safety Constraints

- Never submit a refund from this skill; submission is handled by the refund-submit skill.
- Never invent `orderId`, `reasonId`, or refund amounts.
- Submit amount must equal `maxRefundAmount` from scenario response exactly.
- If buyer requests partial refund or amount modification after card is shown, route to complex guidance.
- Only `QUICK_REFUND_PI`, `QUICK_REFUND_AG`, `QUICK_REFUND_2HOUR`, `QUICK_REFUND_OVERDUE` support AW in-chat submission.
- `COMPLEX`, unknown codes, missing amount, or failed eligibility never submit in AW. If `refundUrl` is present in the scenario response, display it to the buyer. Never fabricate or guess a refund URL.
- When a Phase 3 probe returns `submit_in_aw` with a `defaultReasonId`, that ID MUST be used as-is for submission. Do NOT substitute, override, or ask the buyer to re-select.
- Refund reason display text source order is backend `defaultReasonText` > provided `reasonText` from reason_find > parser fallback map. Unknown numeric reason IDs are never displayed to the buyer.
- COMPLEX scenario display rule: show the guidance card and refundUrl directly from Phase 3 result. Fill only information present: orderId and amount from backend, memo only if buyer described issue in chat. Do NOT fabricate reasonCode or other missing fields. The refundUrl from probe already omits reasonCode — display it as-is.

## General Rules

### Language
- Detect user's input language and respond in the same language.
- Translate UI labels, field names, and prompts from tool output to user's language.
- Keep order IDs and monetary values unchanged (do NOT translate numbers/currency).
- Default to English when language cannot be determined.
- **NEVER expose internal identifiers to the buyer**: `reasonId`, `reasonCode`, `scenarioCode`, `actionType`, `bizCode`, `submitPayload`, MCP tool names, or any numeric codes that are not order IDs or monetary amounts. Use only natural business language (e.g., say "退款原因：不再需要此产品" not "原因代码：1004").

### Error Handling

| Scenario | Response Strategy |
|---|---|
| Eligibility MCP fails | Inform user service is unavailable, suggest retry |
| `eligible=false` | Show mapped message from eligibility-codes.md; stop pipeline |
| ORDER_IN_ISSUE / IN_ISSUE | Inform active dispute exists; auto-route to status-query |
| Reason MCP returns empty during AG reason list display | Ask buyer to describe the issue; cannot proceed without reason |
| Missing `reasonId` after reason list shown (AG) | Re-prompt user to select a number from the list |
| Reason MCP returns empty during direct match | Fall back to scenario probe without reasonId |
| Quick-refund scenario has no usable reasonId and `needSelectReason=false` | Treat as complex guidance — backend data incomplete |
| Phase 3 with provided reasonId returns `select_reason` | Treat as backend/interface anomaly and show complex guidance; do not re-enter reason matching |
| Scenario MCP fails | Ask buyer to retry; do not guess scenario |
| `maxRefundAmount` missing in quick-refund | Treat as complex guidance |
| Buyer requests partial refund after card | Route to complex guidance |

### Result Presentation
- Use `markdown` and `card` from `parse_after_sales_scenario_result` when available.
- For AW cards: show order ID, scenario, refund amount, method, reason, service fee status, and order closure status per [`references/refund-card-template.md`](references/refund-card-template.md).
- For complex guidance with `refundUrl`: show the refund page link and tell the buyer the available order information is prepared.
- For complex guidance without `refundUrl`: show order ID, scenario label, and next-step instructions.
- Provide next-step suggestions at end of every response.
- Never expose raw JSON, internal tool names, or HTTP headers to the user.
