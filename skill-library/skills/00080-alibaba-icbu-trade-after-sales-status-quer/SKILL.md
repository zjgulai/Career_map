---
name: alibaba-icbu-trade-after-sales-status-query
version: 0.2.0
description: >
  Alibaba.com Trade After-Sales Status Query Skill. Queries refund/dispute status for a
  specific order, or lists orders with active after-sales issues.

  Typical utterances:
  - What's the status of my refund?
  - Check refund progress for order 634002494782600
  - Has the supplier responded to my dispute?
  - Show me my after-sales orders
  - 退款进度怎么样了
  - 纠纷处理到哪一步了
  - 查看售后订单

  Do NOT use for: initiating refunds (use refund-guide), submitting refunds
  (use refund-submit), order queries unrelated to disputes, or product search.
enabled: true
tool_triggers:
  - name: icbu_trade_after_sale_find_lastest_issue_status_mcp
  - name: icbu_alibaba_trade_order_detail_query
  - name: icbu_alibaba_trade_order_query_list_buyer
  - name: parse_after_sales_status
---

# Alibaba.com Trade After-Sales Status Query

Queries refund/dispute status for an order and renders a buyer-facing status card.

## MCP Services

| Capability Module | MCP code | Description |
|---|---|---|
| Latest Issue Status | `icbu_trade_after_sale_find_lastest_issue_status_mcp` | Query latest refund/dispute status for a given order |
| Buyer Order Detail | `icbu_alibaba_trade_order_detail_query` | Query order detail for product display name |
| Buyer Order List | `icbu_alibaba_trade_order_query_list_buyer` | List buyer orders filtered by after-sales/dispute |
| Post-processor | `parse_after_sales_status` | Format raw status response into display card |

## Intent Routing

```
User Input
  |
  |- Contains order ID (with or without issueId)
  |   -> call icbu_trade_after_sale_find_lastest_issue_status_mcp
  |   -> call icbu_alibaba_trade_order_detail_query for product display name
  |   -> pipe both responses to parse_after_sales_status
  |
  |- Asks to list refund/dispute/after-sales orders (no specific order ID)
  |   -> call icbu_alibaba_trade_order_query_list_buyer with dispute filter
  |
  |- Refund/dispute query without order ID, no prior context
      -> Ask for order ID, OR offer to list their after-sales orders
```

### Intent Recognition Rules

| User Input Characteristics | Intent | Action |
|---|---|---|
| Contains order ID + asks about refund/dispute/after-sales status | Status Query | `icbu_trade_after_sale_find_lastest_issue_status_mcp` |
| Has order ID from upstream refund-submit flow (with issueId) | Fast Status Query | Same MCP, pass issueId for fast-path |
| "list refund orders", "show disputes", "after-sales orders" | List After-Sales | `icbu_alibaba_trade_order_query_list_buyer` |
| Refund/dispute query without order ID | Clarification | Ask for order ID or offer to list |

### Multilingual Trigger Keywords

| Language | Trigger Keywords |
|---|---|
| English | refund status, dispute progress, after-sales, claim status, refund update, what happened to my refund |
| Chinese | 退款进度, 纠纷状态, 售后订单, 退款到哪了, 纠纷处理 |
| Spanish | estado del reembolso, progreso de la disputa, pedidos postventa |
| French | statut du remboursement, progression du litige, commandes apres-vente |

> **Fallback:** The Agent identifies intent via semantic understanding in any language.

## MCP Tool Usage

### 1. Latest Issue Status -- `icbu_trade_after_sale_find_lastest_issue_status_mcp`

#### Parameters

| Parameter | Location | Type | Required | Description |
|---|---|---|---|---|
| orderId | Body | string | Yes | The order ID to query |
| issueId | Body | string | No | Dispute ID. Omit when unknown -- backend auto-finds the latest refund issue for this order |

> **IMPORTANT:** Never ask the buyer for `issueId`. Buyers do not know this internal identifier.
> When `issueId` is not available, simply omit the field. The backend will automatically find the
> latest refund-type dispute for the given order (slower path but functionally equivalent).
> When the upstream refund-submit flow returns an `issueId`, pass it here for the fast-path query.

#### Parameter Acquisition Strategy

| Parameter | Priority |
|---|---|
| orderId | 1. User's current input -> 2. Context from prior conversation -> 3. Ask user |
| issueId | 1. Returned from upstream refund-submit flow -> 2. Omit (let backend auto-find) |

#### Call Examples

**Without issueId (normal path):**
```bash
accio-mcp-cli call icbu_trade_after_sale_find_lastest_issue_status_mcp --json '{"orderId": "300241527001028893"}' --raw
```

**With issueId (fast path, from upstream refund-submit):**
```bash
accio-mcp-cli call icbu_trade_after_sale_find_lastest_issue_status_mcp --json '{"orderId": "300241527001028893", "issueId": "12345"}' --raw
```

### 2. Buyer Order Detail -- `icbu_alibaba_trade_order_detail_query`

Use this after the status query succeeds to enrich the status card with the product name. If this
call fails or is unavailable, continue with the status card without the Product row.

#### Parameters

| Parameter | Location | Type | Required | Description |
|---|---|---|---|---|
| fieldName_0 | Body (top-level wrapper) | object | Yes | AIGW framework wrapper key -- DO NOT rename |
| fieldName_0.tradeId | Body | string | Yes | The order ID to query |

> **Note:** Use the same order detail MCP as the order-query skill. The order ID must be passed
> as `fieldName_0.tradeId`, not as a top-level `orderId`.

#### Call Example

```bash
accio-mcp-cli call icbu_alibaba_trade_order_detail_query --json '{"fieldName_0": {"tradeId": "300241527001028893"}}' --raw
```

#### Response Key Fields (LatestIssueStatusDTO)

All fields below are **pre-formatted human-readable strings** from backend AgentTextMapper. No client-side mapping or enum translation is needed.

| Field | Type | Example | Description |
|---|---|---|---|
| issueId | String? | `12345` | Internal dispute ID |
| orderId | String? | `300241527001028893` | Associated order |
| issueStatus | String? | `"Waiting for supplier response"` | Current status label |
| refundAmount | String? | `"USD 86.00"` | Formatted refund amount |
| submitTime | String? | `"May 20, 2026"` | When the issue was submitted |
| currentOperator | String? | `"Supplier"` | Who needs to act now |
| deadline | String? | `"May 24, 2026"` | Response deadline |
| needBuyerAction | String | `"Action required"` / `"No action needed now"` | Whether buyer must act |
| nextStepHint | String? | `"Supplier has 5 days to respond"` | Guidance on what happens next |
| refundMethod | String? | `"Original payment method (Visa)"` | How refund will be issued |
| viewDetailUrl | String? | URL | Link to full dispute detail page |

The Product row is not part of LatestIssueStatusDTO. It is extracted by `parse_after_sales_status`
from `rawOrderDetailResponse.data.contractVO.subjectMatterVO.products`.

### 3. Buyer Order List -- `icbu_alibaba_trade_order_query_list_buyer`

#### Parameters

| Parameter | Location | Type | Required | Description |
|---|---|---|---|---|
| fieldName_0 | Body (top-level wrapper) | object | Yes | AIGW framework wrapper key -- DO NOT rename |
| fieldName_0.filter.simpleFilter | Body | string | Yes | Set to `"simpleFilter@dispute"` for after-sales orders |
| fieldName_0.currentPage | Body | integer | Yes | Page number (1-based) |
| fieldName_0.locale | Body | string | Yes | Locale string, default `"en_US"` |

> **Note:** `fieldName_0` is the AIGW (API Gateway) framework wrapper key for this MCP endpoint.
> It must be used exactly as-is. Do NOT rename it or restructure the payload.

#### Call Example

```bash
accio-mcp-cli call icbu_alibaba_trade_order_query_list_buyer --json '{"fieldName_0": {"filter": {"simpleFilter": "simpleFilter@dispute"}, "currentPage": 1, "locale": "en_US"}}' --raw
```

### 4. Post-processor -- `parse_after_sales_status`

> **Post-processing preference:** After a successful MCP response, first try the custom JS tool `parse_after_sales_status`. Do NOT use `accio-mcp-cli call` or `bash` — invoke it directly as a tool call. Only fall back to manual rendering if the JS tool is unavailable or returns an error.

#### Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| rawStatusResponse | object | Yes | The raw response from `icbu_trade_after_sale_find_lastest_issue_status_mcp` |
| rawOrderDetailResponse | object | No | Raw response from `icbu_alibaba_trade_order_detail_query`, used to extract Product |
| orderId | string | No | Order ID for context enrichment |

#### Call Example

```json
{
  "rawStatusResponse": { "...response from status MCP..." },
  "rawOrderDetailResponse": { "...response from order detail MCP..." },
  "orderId": "300241527001028893"
}
```

## Result Presentation

After `parse_after_sales_status` returns, render the status card per [`references/status-card-template.md`](references/status-card-template.md).

- All field values are pre-formatted by backend; render as-is.
- Product is extracted from order detail by the parser; hide it if missing.
- Hide rows with null/empty values.
- Bold `needBuyerAction` when value is "Action required".
- Render detail link in the `Available actions` row as `[View detail](<url>)`.

## General Rules

### Language
- Detect user's input language and respond in the same language.
- Keep data values (order IDs, status strings, amounts) as-is from the backend.
- Translate only UI chrome and prompts to the user's language.
- Default to English when language cannot be determined.

### Error Handling

| Scenario | Response Strategy |
|---|---|
| No issue found for order | Tell buyer no active refund/dispute exists for this order |
| MCP call fails | Inform buyer the service is temporarily unavailable; suggest retry |
| Order list returns empty | Say no after-sales orders were found |
| Missing order ID | Ask buyer for order ID, or offer to list their after-sales orders |
| Buyer action required | Highlight the action needed and provide `viewDetailUrl` |

### Cross-Skill Integration
- When the refund-submit skill returns an `issueId` after successful submission, pass it to this skill's status query for the fast-path lookup.
- When buyer asks "what's happening with my refund" immediately after submitting, use the `issueId` from that flow.

### Result Guidelines
- Provide next-step suggestions at the end of the response.
- Never expose raw JSON, internal headers, or MCP tool names to the buyer.
- If `needBuyerAction` is "Action required", proactively guide the buyer on what to do.
